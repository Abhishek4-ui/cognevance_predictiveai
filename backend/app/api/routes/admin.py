from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.app.core.database import get_db
from backend.app.core.config import settings
from backend.app.models.entities import User, ActivityLog
from backend.app.schemas.payloads import UserResponse
from backend.app.api.deps import get_current_admin

router = APIRouter(prefix="/admin", tags=["Administrator Dashboard"])

@router.get("/users", response_model=List[UserResponse])
def list_users(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    return db.query(User).order_by(User.id.asc()).all()

@router.patch("/users/{user_id}/role")
def update_user_role(user_id: int, new_role: str, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = new_role
    db.commit()
    return {"message": "Role updated", "user_id": user.id, "new_role": new_role}

@router.get("/audit-logs")
def get_audit_logs(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    logs = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(50).all()
    return [
        {
            "id": l.id,
            "user_id": l.user_id,
            "action": l.action,
            "entity": l.entity_type,
            "details": l.details,
            "timestamp": l.created_at.isoformat() if l.created_at else None
        } for l in logs
    ]

@router.get("/cloud-status")
def get_cloud_status(admin: User = Depends(get_current_admin)):
    return {
        "database_provider": "Neon PostgreSQL (REST / SQLAlchemy)",
        "backend_deployment": "Render Cloud Ready",
        "has_render_key": bool(settings.RENDER_API_KEY),
        "frontend_deployment": "Vercel Edge Ready",
        "has_vercel_token": bool(settings.VERCEL_TOKEN),
        "kaggle_api_integrated": bool(settings.KAGGLE_KEY),
        "environment": settings.ENVIRONMENT
    }
