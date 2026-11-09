from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import hash_password, verify_password, create_access_token
from backend.app.models.entities import User, ActivityLog
from backend.app.schemas.payloads import UserRegister, UserLogin, Token, UserResponse
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        (User.email == payload.email) | (User.username == payload.username)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )

    # First user is admin automatically
    user_count = db.query(User).count()
    assigned_role = "admin" if user_count == 0 else payload.role

    user = User(
        email=payload.email,
        username=payload.username,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name or payload.username.title(),
        role=assigned_role,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Activity log
    log = ActivityLog(user_id=user.id, action="USER_REGISTERED", entity_type="User", entity_id=str(user.id), details=f"User {user.username} registered with role {user.role}")
    db.add(log)
    db.commit()

    token = create_access_token({"sub": str(user.id), "username": user.username, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "full_name": user.full_name
        }
    }

@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.username == payload.username_or_email) | (User.email == payload.username_or_email)
    ).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    token = create_access_token({"sub": str(user.id), "username": user.username, "role": user.role})

    # Activity log
    log = ActivityLog(user_id=user.id, action="USER_LOGIN", entity_type="User", entity_id=str(user.id), details=f"User {user.username} logged in")
    db.add(log)
    db.commit()

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "full_name": user.full_name
        }
    }

@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user
