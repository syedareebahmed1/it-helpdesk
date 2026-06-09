from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models, auth as auth_utils, schemas
from deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=schemas.TokenResponse)
def register(body: schemas.UserCreate, db: Session = Depends(get_db)):
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
    token = auth_utils.create_access_token({"sub": str(user.id)})
    return schemas.TokenResponse(access_token=token, user=schemas.UserOut.model_validate(user))


@router.post("/login", response_model=schemas.TokenResponse)
def login(body: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == body.email).first()
    if not user or not auth_utils.verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth_utils.create_access_token({"sub": str(user.id)})
    return schemas.TokenResponse(access_token=token, user=schemas.UserOut.model_validate(user))


@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user
