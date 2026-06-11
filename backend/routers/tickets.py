from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from database import get_db
import models, schemas
from deps import get_current_user, require_agent
from constants import TICKET_TYPES, get_initial_status, WORKFLOW_DEFINITIONS, get_workflow_key

router = APIRouter(prefix="/api/tickets", tags=["tickets"])


def _next_ticket_number(db: Session) -> str:
    from sqlalchemy import func
    last = db.query(func.max(models.Ticket.ticket_number)).scalar()
    if last:
        try:
            num = int(last.split("-")[1]) + 1
        except Exception:
            num = db.query(models.Ticket).count() + 1
    else:
        num = 1
    return f"IT-{num:05d}"


def _record_history(db, ticket_id, user_id, field, old_val, new_val):
    db.add(models.TicketHistory(
        ticket_id=ticket_id,
        changed_by_id=user_id,
        field_name=field,
        old_value=str(old_val) if old_val is not None else None,
        new_value=str(new_val) if new_val is not None else None,
    ))


@router.get("", response_model=schemas.PaginatedTickets)
def list_tickets(
    ticket_type: Optional[str] = None,
    status: Optional[str] = None,
    assignee_id: Optional[int] = None,
    priority: Optional[str] = None,
    q: Optional[str] = None,
    full_name: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Ticket)

    if current_user.role == "customer":
        query = query.filter(models.Ticket.reporter_id == current_user.id)

    if ticket_type:
        query = query.filter(models.Ticket.ticket_type == ticket_type)
    if status:
        query = query.filter(models.Ticket.status == status)
    if assignee_id:
        query = query.filter(models.Ticket.assignee_id == assignee_id)
    if priority:
        query = query.filter(models.Ticket.priority == priority)
    if q:
        query = query.filter(
            or_(
                models.Ticket.title.ilike(f"%{q}%"),
                models.Ticket.ticket_number.ilike(f"%{q}%"),
            )
        )
    if full_name:
        query = query.filter(
            models.Ticket.id.in_(
                db.query(models.TicketFieldValue.ticket_id)
                .filter(
                    models.TicketFieldValue.field_key == "full_name",
                    models.TicketFieldValue.field_value.ilike(f"%{full_name}%")
                )
            )
        )

    total = query.count()
    items = (
        query.order_by(models.Ticket.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    return schemas.PaginatedTickets(items=items, total=total, page=page, limit=limit)


@router.post("", response_model=schemas.TicketOut, status_code=201)
def create_ticket(
    body: schemas.TicketCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if body.ticket_type not in TICKET_TYPES:
        raise HTTPException(status_code=400, detail="Invalid ticket type")

    initial_status = get_initial_status(body.ticket_type)

    ticket = models.Ticket(
        ticket_number=_next_ticket_number(db),
        title=body.title,
        ticket_type=body.ticket_type,
        status=initial_status,
        priority=body.priority,
        reporter_id=current_user.id,
        department=body.department or current_user.department,
        description=body.description,
    )
    db.add(ticket)
    db.flush()

    for fv in body.field_values:
        db.add(models.TicketFieldValue(
            ticket_id=ticket.id,
            field_key=fv.field_key,
            field_value=fv.field_value,
        ))

    _record_history(db, ticket.id, current_user.id, "status", None, initial_status)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.get("/{ticket_id}", response_model=schemas.TicketOut)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if current_user.role == "customer" and ticket.reporter_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return ticket


@router.patch("/{ticket_id}", response_model=schemas.TicketOut)
def update_ticket(
    ticket_id: int,
    body: schemas.TicketUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if current_user.role == "customer":
        raise HTTPException(status_code=403, detail="Customers cannot update tickets")

    if body.status and body.status != ticket.status:
        wf_key = get_workflow_key(ticket.ticket_type)
        wf = WORKFLOW_DEFINITIONS[wf_key]
        allowed = [
            t["to_state"] for t in wf["transitions"]
            if t["from_state"] == ticket.status or t["from_state"] == "*"
        ]
        if body.status not in allowed:
            raise HTTPException(
                status_code=400,
                detail=f"Transition from '{ticket.status}' to '{body.status}' not allowed",
            )
        _record_history(db, ticket.id, current_user.id, "status", ticket.status, body.status)
        ticket.status = body.status

        # ── Sync status to linked ticket (CPH ↔ IT) ──────────────────────────
        if ticket.linked_ticket_id:
            linked = db.query(models.Ticket).filter(models.Ticket.id == ticket.linked_ticket_id).first()
            if linked and linked.status != body.status:
                _record_history(db, linked.id, current_user.id, "status", linked.status,
                                f"{body.status} (synced from {ticket.ticket_number})")
                linked.status = body.status

    if body.assignee_id is not None and body.assignee_id != ticket.assignee_id:
        old_assignee = ticket.assignee.full_name if ticket.assignee else None
        new_user = db.query(models.User).filter(models.User.id == body.assignee_id).first()
        _record_history(db, ticket.id, current_user.id, "assignee", old_assignee,
                        new_user.full_name if new_user else None)
        ticket.assignee_id = body.assignee_id

    if body.priority and body.priority != ticket.priority:
        _record_history(db, ticket.id, current_user.id, "priority", ticket.priority, body.priority)
        ticket.priority = body.priority

    if body.description is not None:
        ticket.description = body.description

    db.commit()
    db.refresh(ticket)
    return ticket


@router.delete("/{ticket_id}", status_code=204)
def delete_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_agent),
):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    db.delete(ticket)
    db.commit()


@router.post("/{ticket_id}/comments", response_model=schemas.CommentOut, status_code=201)
def add_comment(
    ticket_id: int,
    body: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if current_user.role == "customer":
        if ticket.reporter_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        body.is_internal = False

    comment = models.TicketComment(
        ticket_id=ticket_id,
        author_id=current_user.id,
        body=body.body,
        is_internal=body.is_internal,
    )
    db.add(comment)

    # ── Mirror non-internal comments to linked ticket (CPH ↔ IT) ─────────────
    if not body.is_internal and ticket.linked_ticket_id:
        linked = db.query(models.Ticket).filter(models.Ticket.id == ticket.linked_ticket_id).first()
        if linked:
            mirror_body = f"[Synced from {ticket.ticket_number}] {body.body}"
            db.add(models.TicketComment(
                ticket_id=linked.id,
                author_id=current_user.id,
                body=mirror_body,
                is_internal=False,
            ))

    db.commit()
    db.refresh(comment)
    return comment
