from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from backend.app.schemas.payloads import ModelStageUpdate
from backend.app.api.deps import get_current_user
from backend.app.models.entities import User
from ml_engine.registry.registry import ModelRegistry

router = APIRouter(prefix="/models", tags=["Model Registry & Lifecycle"])

@router.get("/list")
def list_models():
    registry = ModelRegistry()
    return registry.list_models()

@router.get("/{model_id}")
def get_model_details(model_id: str):
    registry = ModelRegistry()
    entry = registry.get_model_entry(model_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Model not found")
    return entry

@router.patch("/{model_id}/stage")
def update_stage(model_id: str, payload: ModelStageUpdate, current_user: User = Depends(get_current_user)):
    registry = ModelRegistry()
    success = registry.update_stage(model_id, payload.stage)
    if not success:
        raise HTTPException(status_code=404, detail="Model not found or update failed")
    return {"status": "success", "model_id": model_id, "new_stage": payload.stage}
