import time
import json
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import StreamingResponse
import io
from sqlalchemy.orm import Session
from typing import List

from backend.app.schemas.payloads import PredictRequest, BatchPredictRequest
from backend.app.core.database import get_db
from backend.app.models.entities import PredictionRecord, User, ActivityLog
from backend.app.api.deps import get_current_user
from ml_engine.registry.registry import ModelRegistry
from ml_engine.explainability.xai import ExplainableAI

router = APIRouter(prefix="/predict", tags=["Predictive Analytics Engine"])

@router.post("/single")
def predict_single(payload: PredictRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    registry = ModelRegistry()
    entry = registry.get_model_entry(payload.model_id)
    if not entry:
        raise HTTPException(status_code=404, detail=f"Model {payload.model_id} not found in registry")

    start_time = time.time()
    try:
        model, pipeline = registry.load_artifacts(payload.model_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load model artifacts: {str(e)}")

    if pipeline:
        features_array = pipeline.transform_single(payload.features)
        feature_names = pipeline.feature_names_out
    else:
        features_array = np.array([list(payload.features.values())])
        feature_names = list(payload.features.keys())

    # Generate prediction
    raw_pred = model.predict(features_array)
    pred_val = raw_pred[0]

    confidence = None
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(features_array)[0]
        confidence = round(float(np.max(probs)), 4)

    latency_ms = round((time.time() - start_time) * 1000, 2)

    # Decode class name if classification
    display_pred = str(pred_val)
    if pipeline and pipeline.target_classes_ and "classification" in entry["task_type"]:
        try:
            display_pred = pipeline.target_classes_[int(pred_val)]
        except Exception:
            display_pred = str(pred_val)

    # Compute Explainability & Uncertainty
    xai = ExplainableAI(model, feature_names=feature_names, task_type=entry["task_type"])
    explanation = xai.explain_prediction(features_array, display_pred)
    uncertainty = xai.compute_uncertainty(features_array, float(pred_val) if isinstance(pred_val, (int, float, np.number)) else 1.0)

    # Store prediction record
    pred_rec = PredictionRecord(
        model_id=payload.model_id,
        user_id=current_user.id if current_user else None,
        input_features_json=json.dumps(payload.features),
        prediction_result=str(display_pred),
        confidence=confidence,
        uncertainty_json=json.dumps(uncertainty),
        latency_ms=latency_ms
    )
    db.add(pred_rec)
    db.commit()

    return {
        "model_id": payload.model_id,
        "prediction": display_pred,
        "raw_value": float(pred_val) if isinstance(pred_val, (int, float, np.number)) else str(pred_val),
        "confidence": confidence,
        "latency_ms": latency_ms,
        "uncertainty": uncertainty,
        "explainability": explanation
    }

@router.post("/batch")
async def predict_batch(
    model_id: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    registry = ModelRegistry()
    entry = registry.get_model_entry(model_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Model not found")

    model, pipeline = registry.load_artifacts(model_id)
    df = pd.read_csv(file.file)

    results = []
    for _, row in df.iterrows():
        rec = row.to_dict()
        feat = pipeline.transform_single(rec) if pipeline else np.array([list(rec.values())])
        p = model.predict(feat)[0]
        results.append(str(p))

    df["Predicted_Output"] = results

    output_stream = io.StringIO()
    df.to_csv(output_stream, index=False)
    output_stream.seek(0)

    return StreamingResponse(
        io.BytesIO(output_stream.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=batch_predictions_{model_id}.csv"}
    )

@router.get("/history")
def get_prediction_history(limit: int = 25, db: Session = Depends(get_db)):
    records = db.query(PredictionRecord).order_by(PredictionRecord.created_at.desc()).limit(limit).all()
    out = []
    for r in records:
        out.append({
            "id": r.id,
            "model_id": r.model_id,
            "prediction_result": r.prediction_result,
            "confidence": r.confidence,
            "latency_ms": r.latency_ms,
            "input_features": json.loads(r.input_features_json) if r.input_features_json else {},
            "created_at": r.created_at.isoformat() if r.created_at else None
        })
    return out
