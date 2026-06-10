from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models, auth as auth_utils
from constants import TICKET_TYPES, TICKET_FORM_FIELDS, get_initial_status

router = APIRouter(prefix="/api/public", tags=["public"])


class PublicTicketCreate(BaseModel):
    submitter_name: str
    submitter_email: str
    ticket_type: str
    field_values: list[dict] = []


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


@router.get("/ticket-types")
def get_ticket_types():
    return TICKET_TYPES


@router.get("/form-fields/{ticket_type}")
def get_form_fields(ticket_type: str):
    if ticket_type not in TICKET_FORM_FIELDS:
        raise HTTPException(status_code=404, detail="Unknown ticket type")
    return TICKET_FORM_FIELDS[ticket_type]


@router.post("/tickets", status_code=201)
def create_public_ticket(body: PublicTicketCreate, db: Session = Depends(get_db)):
    if body.ticket_type not in TICKET_TYPES:
        raise HTTPException(status_code=400, detail="Invalid ticket type")

    reporter = _get_or_create_guest(db, body.submitter_name, body.submitter_email)
    initial_status = get_initial_status(body.ticket_type)

    # Auto-generate title from fields
    fv_map = {fv["field_key"]: fv["field_value"] for fv in body.field_values}
    type_label = TICKET_TYPES[body.ticket_type]

    if body.ticket_type == "onboarding":
        title = f"Colleague Onboarding - {fv_map.get('preferred_email', body.submitter_email)}"
    elif body.ticket_type == "offboarding":
        title = f"Colleague Offboarding - {fv_map.get('employee_email', body.submitter_email)}"
    elif body.ticket_type == "system_problem":
        title = f"System Problem - {fv_map.get('affected_system', 'Unknown')}"
    elif body.ticket_type.startswith("access_"):
        title = f"{type_label} - {fv_map.get('requested_for', body.submitter_email)}"
    else:
        title = f"{type_label} - {body.submitter_email}"

    ticket = models.Ticket(
        ticket_number=_next_ticket_number(db),
        title=title,
        ticket_type=body.ticket_type,
        status=initial_status,
        priority="P3",
        reporter_id=reporter.id,
    )
    db.add(ticket)
    db.flush()

    for fv in body.field_values:
        if fv.get("field_value"):
            db.add(models.TicketFieldValue(
                ticket_id=ticket.id,
                field_key=fv["field_key"],
                field_value=fv["field_value"],
            ))

    db.add(models.TicketHistory(
        ticket_id=ticket.id,
        changed_by_id=reporter.id,
        field_name="status",
        old_value=None,
        new_value=initial_status,
    ))

    db.commit()
    return {"ticket_number": ticket.ticket_number, "status": ticket.status, "title": ticket.title}
