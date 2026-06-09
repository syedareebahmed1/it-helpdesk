from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from deps import require_agent
from constants import TICKET_TYPES

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=schemas.DashboardStats)
def get_stats(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_agent),
):
    tickets = db.query(models.Ticket).all()
    total = len(tickets)
    terminal_statuses = {"RESOLVED", "NOT APPROVED", "REJECTED"}
    open_count = sum(1 for t in tickets if t.status not in terminal_statuses)
    resolved_count = sum(1 for t in tickets if t.status in terminal_statuses)

    by_type: dict[str, int] = {}
    for tt in TICKET_TYPES:
        by_type[tt] = sum(1 for t in tickets if t.ticket_type == tt)

    by_status: dict[str, int] = {}
    for t in tickets:
        by_status[t.status] = by_status.get(t.status, 0) + 1

    by_priority: dict[str, int] = {"P1": 0, "P2": 0, "P3": 0, "P4": 0}
    for t in tickets:
        by_priority[t.priority] = by_priority.get(t.priority, 0) + 1

    queue_counts = {
        "service_requests": sum(1 for t in tickets if t.ticket_type not in ("onboarding", "offboarding") and t.status not in terminal_statuses),
        "onboarding": sum(1 for t in tickets if t.ticket_type == "onboarding" and t.status not in terminal_statuses),
        "offboarding": sum(1 for t in tickets if t.ticket_type == "offboarding" and t.status not in terminal_statuses),
    }

    return schemas.DashboardStats(
        total=total,
        open=open_count,
        resolved=resolved_count,
        by_type=by_type,
        by_status=by_status,
        by_priority=by_priority,
        queue_counts=queue_counts,
    )


@router.get("/field-definitions")
def get_field_definitions(_: models.User = Depends(require_agent)):
    from constants import TICKET_FORM_FIELDS
    return TICKET_FORM_FIELDS


@router.get("/ticket-types")
def get_ticket_types():
    return TICKET_TYPES


@router.get("/form-fields/{ticket_type}")
def get_form_fields(ticket_type: str):
    from constants import TICKET_FORM_FIELDS
    if ticket_type not in TICKET_FORM_FIELDS:
        return []
    return TICKET_FORM_FIELDS[ticket_type]
