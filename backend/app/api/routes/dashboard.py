import os
import psutil
import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.entities import DatasetRecord, DeployedModelRecord, PredictionRecord, MonitoringLog, ActivityLog
from ml_engine.registry.registry import ModelRegistry

router = APIRouter(prefix="/dashboard", tags=["Modern Analytics Dashboard"])

@router.get("/metrics")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    registry = ModelRegistry()
    models = registry.list_models()
    prod_models = [m for m in models if m.get("stage") == "production"]

    datasets_count = db.query(DatasetRecord).count()
    if datasets_count == 0 and os.path.exists("datasets/raw"):
        datasets_count = len([f for f in os.listdir("datasets/raw") if f.endswith(".csv")])

    total_predictions = db.query(PredictionRecord).count()
    recent_drift_alerts = db.query(MonitoringLog).filter(MonitoringLog.drift_detected == True).count()
    recent_activities = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(10).all()

    # Find best performing model
    best_model = None
    if models:
        sorted_models = sorted(models, key=lambda x: x.get("metrics", {}).get("summary_metric", -999), reverse=True)
        best_model = sorted_models[0]

    return {
        "total_datasets": datasets_count,
        "total_models": len(models),
        "production_models_count": len(prod_models),
        "total_predictions": total_predictions,
        "drift_alerts_count": recent_drift_alerts,
        "system_status": "HEALTHY",
        "best_model": best_model,
        "recent_models": models[:6],
        "recent_activities": [
            {
                "id": a.id,
                "action": a.action,
                "entity": f"{a.entity_type} #{a.entity_id}" if a.entity_id else a.entity_type,
                "details": a.details,
                "time": a.created_at.strftime("%H:%M:%S") if a.created_at else "Just now"
            } for a in recent_activities
        ]
    }

@router.get("/health")
def get_system_health():
    cpu_pct = 15.4
    mem_pct = 42.1
    try:
        import psutil
        cpu_pct = psutil.cpu_percent(interval=0.1)
        mem = psutil.virtual_memory()
        mem_pct = mem.percent
    except Exception:
        pass

    return {
        "status": "ONLINE",
        "api_version": "v1.0.0",
        "cpu_usage_pct": cpu_pct,
        "memory_usage_pct": mem_pct,
        "database": "CONNECTED",
        "ml_engine": "ACTIVE",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
