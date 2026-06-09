from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth as auth_utils
from deps import require_manager, require_agent

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=list[schemas.UserOut])
def list_users(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_agent),
):
    return db.query(models.User).order_by(models.User.full_name).all()


@router.post("", response_model=schemas.UserOut, status_code=201)
def create_user(
    body: schemas.UserCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_manager),
):
    if db.query(models.User).filter(models.User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(
        email=body.email,
        password_hash=auth_utils.hash_password(body.password),
        full_name=body.full_name,
        role=body.role,
        department=body.department,
        job_title=body.job_title,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}", response_model=schemas.UserOut)
def update_user(
    user_id: int,
    body: schemas.UserUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_manager),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if body.full_name is not None:
        user.full_name = body.full_name
    if body.role is not None:
        user.role = body.role
    if body.department is not None:
        user.department = body.department
    if body.job_title is not None:
        user.job_title = body.job_title
    if body.password:
        user.password_hash = auth_utils.hash_password(body.password)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current: models.User = Depends(require_manager),
):
    if user_id == current.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
