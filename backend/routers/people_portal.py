"""
People Helpdesk Portal API
- Restricted to allowed emails (People/HR team)
- Ticket creation generates a CPH-XXXXX parent + IT-XXXXX child, interlinked
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models, auth as auth_utils
from constants import TICKET_TYPES, TICKET_FORM_FIELDS, get_initial_status, get_approvers_for_ticket

router = APIRouter(prefix="/api/people-portal", tags=["people-portal"])

# ── Allowed emails (People / HR team) ────────────────────────────────────────
ALLOWED_EMAILS = {
    "syed.areeb@bazaartech.com",
    "manager@bazaartech.com",
    "agent@bazaartech.com",
    "hr@bazaartech.com",
    "people@bazaartech.com",
    "ibrahim.jamal@bazaartech.com",
    "yawar@bazaartech.com",
}


# ── Helpers ───────────────────────────────────────────────────────────────────
def _next_cph_number(db: Session) -> str:
    last = db.query(func.max(models.Ticket.ticket_number)).filter(
        models.Ticket.ticket_number.like("CPH-%")
    ).scalar()
    if last:
        try:
            num = int(last.split("-")[1]) + 1
        except Exception:
            num = 1
    else:
        num = 1
    return f"CPH-{num:05d}"


def _next_it_number(db: Session) -> str:
    last = db.query(func.max(models.Ticket.ticket_number)).scalar()
    if last:
        try:
            # strip prefix, get numeric part
            num = int(last.split("-")[1]) + 1
        except Exception:
            num = db.query(models.Ticket).count() + 1
    else:
        num = 1
    return f"IT-{num:05d}"


def _get_or_create_guest(db: Session, name: str, email: str) -> models.User:
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        user = models.User(
            email=email,
            password_hash=auth_utils.hash_password("guest-portal-user"),
            full_name=name,
            role="customer",
        )
        db.add(user)
        db.flush()
    return user


# ── Auth endpoint ─────────────────────────────────────────────────────────────
class AuthRequest(BaseModel):
    email: str
    name: str


@router.post("/auth")
def people_portal_auth(body: AuthRequest):
    """Validate that the email is allowed to use the People Helpdesk portal."""
    email = body.email.strip().lower()
    # Allow any @bazaartech.com email OR specific allowed list
    if email in ALLOWED_EMAILS or email.endswith("@bazaartech.com"):
        return {"allowed": True, "name": body.name, "email": email}
    raise HTTPException(status_code=403, detail="Access denied. Your email is not authorised for the People Helpdesk portal.")


# ── Dual ticket creation ──────────────────────────────────────────────────────
class PeopleTicketCreate(BaseModel):
    submitter_name: str
    submitter_email: str
    ticket_type: str
    field_values: list[dict] = []


@router.post("/tickets", status_code=201)
def create_people_ticket(body: PeopleTicketCreate, db: Session = Depends(get_db)):
    if body.ticket_type not in TICKET_TYPES:
        raise HTTPException(status_code=400, detail="Invalid ticket type")

    reporter = _get_or_create_guest(db, body.submitter_name, body.submitter_email)
    initial_status = get_initial_status(body.ticket_type)
    fv_map = {fv["field_key"]: fv["field_value"] for fv in body.field_values}
    type_label = TICKET_TYPES[body.ticket_type]

    # Build title
    colleague = fv_map.get("colleague_full_name") or fv_map.get("full_name") or body.submitter_email
    cph_title = f"{type_label} - {colleague}"
    it_title  = f"[IT Task] {type_label} - {colleague}"

    # ── CPH parent ticket ────────────────────────────────────────────────────
    cph_number = _next_cph_number(db)
    cph_ticket = models.Ticket(
        ticket_number=cph_number,
        title=cph_title,
        ticket_type=body.ticket_type,
        status=initial_status,
        priority="P3",
        reporter_id=reporter.id,
        portal_source="people",
    )
    db.add(cph_ticket)
    db.flush()

    for fv in body.field_values:
        if fv.get("field_value"):
            db.add(models.TicketFieldValue(
                ticket_id=cph_ticket.id,
                field_key=fv["field_key"],
                field_value=fv["field_value"],
            ))

    db.add(models.TicketHistory(
        ticket_id=cph_ticket.id,
        changed_by_id=reporter.id,
        field_name="status",
        old_value=None,
        new_value=initial_status,
    ))

    # ── IT child ticket ──────────────────────────────────────────────────────
    it_number = _next_it_number(db)
    it_ticket = models.Ticket(
        ticket_number=it_number,
        title=it_title,
        ticket_type=body.ticket_type,
        status="WAITING FOR SUPPORT",
        priority="P3",
        reporter_id=reporter.id,
        portal_source="it",
        linked_ticket_id=cph_ticket.id,   # child → parent
    )
    db.add(it_ticket)
    db.flush()

    # Copy all field values to the IT child ticket too
    for fv in body.field_values:
        if fv.get("field_value"):
            db.add(models.TicketFieldValue(
                ticket_id=it_ticket.id,
                field_key=fv["field_key"],
                field_value=fv["field_value"],
            ))

    # Link CPH ticket back to IT child
    cph_ticket.linked_ticket_id = it_ticket.id

    # Store cross-reference as a field value for easy display
    db.add(models.TicketFieldValue(
        ticket_id=cph_ticket.id,
        field_key="_linked_ticket",
        field_value=it_number,
    ))
    db.add(models.TicketFieldValue(
        ticket_id=it_ticket.id,
        field_key="_linked_ticket",
        field_value=cph_number,
    ))

    db.add(models.TicketHistory(
        ticket_id=it_ticket.id,
        changed_by_id=reporter.id,
        field_name="status",
        old_value=None,
        new_value="WAITING FOR SUPPORT",
    ))

    db.commit()

    return {
        "cph_ticket_number": cph_number,
        "it_ticket_number": it_number,
        "title": cph_title,
        "status": initial_status,
    }


# ── CPH My Tickets portal ─────────────────────────────────────────────────────
@router.get("/my-tickets")
def get_my_tickets(email: str, db: Session = Depends(get_db)):
    """Return all CPH tickets raised by this email address."""
    email = email.strip().lower()
    # Auth check
    if email not in ALLOWED_EMAILS and not email.endswith("@bazaartech.com"):
        raise HTTPException(status_code=403, detail="Access denied")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        return []

    tickets = (
        db.query(models.Ticket)
        .filter(
            models.Ticket.reporter_id == user.id,
            models.Ticket.portal_source == "people",
        )
        .order_by(models.Ticket.created_at.desc())
        .all()
    )

    result = []
    for t in tickets:
        linked = None
        if t.linked_ticket:
            linked = {
                "ticket_number": t.linked_ticket.ticket_number,
                "status": t.linked_ticket.status,
                "portal_source": t.linked_ticket.portal_source,
            }
        result.append({
            "id": t.id,
            "ticket_number": t.ticket_number,
            "title": t.title,
            "status": t.status,
            "ticket_type": t.ticket_type,
            "priority": t.priority,
            "created_at": t.created_at.isoformat(),
            "updated_at": t.updated_at.isoformat(),
            "linked_ticket": linked,
        })
    return result


@router.get("/tickets/{ticket_number}")
def get_cph_ticket(ticket_number: str, email: str, db: Session = Depends(get_db)):
    """Get full CPH ticket detail — only accessible to the reporter."""
    email = email.strip().lower()
    if email not in ALLOWED_EMAILS and not email.endswith("@bazaartech.com"):
        raise HTTPException(status_code=403, detail="Access denied")

    ticket = db.query(models.Ticket).filter(
        models.Ticket.ticket_number == ticket_number.upper()
    ).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Must be a CPH ticket
    if ticket.portal_source != "people":
        raise HTTPException(status_code=403, detail="Access denied")

    fv = {f.field_key: f.field_value for f in ticket.field_values if not f.field_key.startswith("_")}

    linked = None
    if ticket.linked_ticket:
        linked = {
            "ticket_number": ticket.linked_ticket.ticket_number,
            "title": ticket.linked_ticket.title,
            "status": ticket.linked_ticket.status,
            "portal_source": ticket.linked_ticket.portal_source,
        }

    comments = [
        {
            "id": c.id,
            "author": c.author.full_name,
            "body": c.body,
            "created_at": c.created_at.isoformat(),
        }
        for c in sorted(ticket.comments, key=lambda x: x.created_at)
        if not c.is_internal
    ]

    history = [
        {
            "field": h.field_name,
            "from": h.old_value,
            "to": h.new_value,
            "at": h.created_at.isoformat(),
        }
        for h in sorted(ticket.history, key=lambda x: x.created_at)
    ]

    return {
        "ticket_number": ticket.ticket_number,
        "title": ticket.title,
        "status": ticket.status,
        "priority": ticket.priority,
        "ticket_type": ticket.ticket_type,
        "portal_source": ticket.portal_source,
        "created_at": ticket.created_at.isoformat(),
        "updated_at": ticket.updated_at.isoformat(),
        "assignee": ticket.assignee.full_name if ticket.assignee else None,
        "field_values": fv,
        "linked_ticket": linked,
        "comments": comments,
        "history": history,
    }
