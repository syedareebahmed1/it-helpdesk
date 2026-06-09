from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
import models
import auth as auth_utils

bearer = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
) -> models.User:
    token = credentials.credentials
    payload = auth_utils.decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def require_agent(user: models.User = Depends(get_current_user)) -> models.User:
    if user.role not in ("agent", "manager"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Agent access required")
    return user


def require_manager(user: models.User = Depends(get_current_user)) -> models.User:
    if user.role != "manager":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Manager access required")
    return user
