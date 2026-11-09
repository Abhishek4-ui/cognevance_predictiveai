import os
import json
import pandas as pd
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from backend.app.schemas.payloads import TrainRequest
from backend.app.core.database import get_db
from backend.app.models.entities import ExperimentRecord, ActivityLog, User
from backend.app.api.deps import get_current_user
from ml_engine.preprocessing.pipeline import PreprocessingPipeline
from ml_engine.training.trainer import MLTrainer
from ml_engine.registry.registry import ModelRegistry

router = APIRouter(prefix="/training", tags=["Automated Model Training"])

RAW_DIR = "datasets/raw"

@router.post("/train")
def train_models(payload: TrainRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not payload.filename:
        raise HTTPException(status_code=400, detail="Dataset filename is required")

    filepath = os.path.join(RAW_DIR, payload.filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Dataset {payload.filename} not found")

    df = pd.read_csv(filepath)

    pipeline = PreprocessingPipeline(
        target_column=payload.target_column,
        task_type=payload.task_type or "classification",
        scaling_strategy=payload.scaling_strategy or "standard",
        encoding_strategy=payload.encoding_strategy or "onehot",
        outlier_treatment=payload.outlier_treatment or "cap",
        handle_imbalance=payload.handle_imbalance or False
    )

    X_train, X_test, y_train, y_test, meta = pipeline.fit_transform(df)

    trainer = MLTrainer(task_type=payload.task_type or "classification")
    results = trainer.train_all_and_compare(
        X_train=X_train,
        y_train=y_train,
        X_test=X_test,
        y_test=y_test,
        selected_models=payload.selected_models,
        class_names=meta.get("target_classes")
    )

    # Automatically register the best model to the Model Registry
    registry = ModelRegistry()
    best_model_id = None
    if trainer.best_model_name and trainer.best_model_instance:
        model_display_name = f"{payload.filename.replace('.csv', '').replace('_', ' ').title()} Model"
        best_model_id = registry.register_model(
            model_name=model_display_name,
            task_type=payload.task_type or "classification",
            algorithm=trainer.best_model_name,
            model_object=trainer.best_model_instance,
            preprocessing_pipeline=pipeline,
            metrics=trainer.best_metrics,
            features=pipeline.feature_names_in,
            version="1.0.0",
            stage="staging"
        )

    # Record experiment in DB
    for entry in results["leaderboard"]:
        if "error" not in entry:
            exp = ExperimentRecord(
                dataset_id=payload.dataset_id,
                user_id=current_user.id if current_user else None,
                model_name=entry["model_name"],
                algorithm=entry["algorithm_family"],
                task_type=payload.task_type or "classification",
                status="completed",
                metrics_json=json.dumps(entry["metrics"]),
                train_time_seconds=entry["train_time_seconds"]
            )
            db.add(exp)
    db.commit()

    return {
        "status": "success",
        "best_model": results["best_model"],
        "best_model_id": best_model_id,
        "best_metrics": results["best_metrics"],
        "leaderboard": results["leaderboard"],
        "total_evaluated": results["total_models_evaluated"]
    }

@router.get("/experiments")
def get_recent_experiments(limit: int = 20, db: Session = Depends(get_db)):
    experiments = db.query(ExperimentRecord).order_by(ExperimentRecord.created_at.desc()).limit(limit).all()
    results = []
    for exp in experiments:
        results.append({
            "id": exp.id,
            "model_name": exp.model_name,
            "algorithm": exp.algorithm,
            "task_type": exp.task_type,
            "status": exp.status,
            "metrics": json.loads(exp.metrics_json) if exp.metrics_json else {},
            "train_time_seconds": exp.train_time_seconds,
            "created_at": exp.created_at.isoformat() if exp.created_at else None
        })
    return results
