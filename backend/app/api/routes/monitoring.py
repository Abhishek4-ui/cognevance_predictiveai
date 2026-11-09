import os
import json
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional

from backend.app.schemas.payloads import DriftCheckRequest
from backend.app.core.database import get_db
from backend.app.models.entities import MonitoringLog, PredictionRecord, User
from backend.app.api.deps import get_current_user
from ml_engine.registry.registry import ModelRegistry
from ml_engine.monitoring.drift import DriftDetector

router = APIRouter(prefix="/monitoring", tags=["MLOps Monitoring & Drift"])

RAW_DIR = "datasets/raw"

@router.post("/drift-check")
def check_drift(payload: DriftCheckRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    registry = ModelRegistry()
    entry = registry.get_model_entry(payload.model_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Model not found")

    model, pipeline = registry.load_artifacts(payload.model_id)
    if not pipeline:
        raise HTTPException(status_code=400, detail="Model does not have a reference preprocessing pipeline")

    # Determine baseline dataset
    baseline_filename = payload.current_data_filename
    if not baseline_filename:
        model_name = entry["model_name"].lower()
        if "churn" in model_name:
            baseline_filename = "customer_churn.csv"
        elif "house" in model_name or "price" in model_name:
            baseline_filename = "house_price_prediction.csv"
        elif "fraud" in model_name:
            baseline_filename = "fraud_detection.csv"
        elif "loan" in model_name:
            baseline_filename = "loan_default_risk.csv"
        elif "cardiac" in model_name or "health" in model_name:
            baseline_filename = "healthcare_cardiac_risk.csv"
        elif "demand" in model_name:
            baseline_filename = "demand_forecasting.csv"
        elif "sales" in model_name:
            baseline_filename = "sales_forecasting.csv"
        elif "student" in model_name:
            baseline_filename = "student_performance.csv"
        else:
            baseline_filename = "customer_segmentation.csv"

    filepath = os.path.join(RAW_DIR, baseline_filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Reference dataset {baseline_filename} not found")

    df_base = pd.read_csv(filepath)

    # Check if there are real prediction records stored in database for current traffic
    real_preds = db.query(PredictionRecord).filter(PredictionRecord.model_id == payload.model_id).all()
    
    if len(real_preds) >= 10:
        # Use genuine recorded inference records from real user traffic
        records_list = [json.loads(p.input_features_json) for p in real_preds[-200:]]
        df_curr = pd.DataFrame(records_list)
    else:
        # Use actual empirical second partition of the real dataset
        split_point = len(df_base) // 2
        df_curr = df_base.iloc[split_point:].copy()
        df_base = df_base.iloc[:split_point].copy()

    # Transform baseline and current sets through the fitted pipeline
    base_rows = [pipeline.transform_single(row.to_dict()) for _, row in df_base.head(min(200, len(df_base))).iterrows()]
    curr_rows = [pipeline.transform_single(row.to_dict()) for _, row in df_curr.head(min(200, len(df_curr))).iterrows()]

    X_base = np.vstack(base_rows)
    X_curr = np.vstack(curr_rows)

    detector = DriftDetector()
    results = detector.detect_dataset_drift(X_base, X_curr, feature_names=pipeline.feature_names_out)

    # Save monitoring log
    log = MonitoringLog(
        model_id=payload.model_id,
        drift_detected=results["drift_detected"],
        drift_share_pct=results["drift_share_percentage"],
        alert_level=results["alert_level"].split(" ")[0],
        details_json=json.dumps(results)
    )
    db.add(log)
    db.commit()

    return {
        "model_id": payload.model_id,
        "results": results
    }

@router.get("/logs")
def get_monitoring_logs(limit: int = 20, db: Session = Depends(get_db)):
    logs = db.query(MonitoringLog).order_by(MonitoringLog.created_at.desc()).limit(limit).all()
    out = []
    for l in logs:
        out.append({
            "id": l.id,
            "model_id": l.model_id,
            "drift_detected": l.drift_detected,
            "drift_share_pct": l.drift_share_pct,
            "alert_level": l.alert_level,
            "created_at": l.created_at.isoformat() if l.created_at else None,
            "details": json.loads(l.details_json) if l.details_json else {}
        })
    return out
