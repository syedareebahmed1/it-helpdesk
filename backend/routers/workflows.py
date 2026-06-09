from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from deps import require_agent, require_manager
from constants import TICKET_TYPES

router = APIRouter(prefix="/api/workflows", tags=["workflows"])


@router.get("", response_model=list[schemas.WorkflowOut])
def list_workflows(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_agent),
):
    return db.query(models.WorkflowDefinition).all()


@router.get("/{ticket_type}", response_model=schemas.WorkflowOut)
def get_workflow(
    ticket_type: str,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_agent),
):
    wf = db.query(models.WorkflowDefinition).filter(
        models.WorkflowDefinition.ticket_type == ticket_type
    ).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return wf


@router.put("/{ticket_type}", response_model=schemas.WorkflowOut)
def update_workflow(
    ticket_type: str,
    body: schemas.WorkflowUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_manager),
):
    wf = db.query(models.WorkflowDefinition).filter(
        models.WorkflowDefinition.ticket_type == ticket_type
    ).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")

    if body.name:
        wf.name = body.name

    if body.states is not None:
        for s in wf.states:
            db.delete(s)
        db.flush()
        for s in body.states:
            db.add(models.WorkflowState(
                workflow_id=wf.id,
                name=s.name, color=s.color, text_color=s.text_color,
                is_initial=s.is_initial, is_terminal=s.is_terminal, order=s.order,
            ))

    if body.transitions is not None:
        for t in wf.transitions:
            db.delete(t)
        db.flush()
        for t in body.transitions:
            db.add(models.WorkflowTransition(
                workflow_id=wf.id,
                from_state=t.from_state, to_state=t.to_state, label=t.label,
            ))

    db.commit()
    db.refresh(wf)
    return wf
