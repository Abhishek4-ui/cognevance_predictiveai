import os
import pandas as pd
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from backend.app.core.database import get_db
from backend.app.models.entities import User
from backend.app.api.deps import get_current_user
from ml_engine.preprocessing.pipeline import PreprocessingPipeline
from ml_engine.feature_engineering.engineer import FeatureEngineer

router = APIRouter(prefix="/feature-engineering", tags=["Feature Engineering & Selection"])

RAW_DIR = "datasets/raw"

class FeatureRankingRequest(BaseModel):
    filename: str
    target_column: Optional[str] = None
    k_components: Optional[int] = 3

@router.post("/rank")
def compute_feature_rankings(
    payload: FeatureRankingRequest,
    current_user: User = Depends(get_current_user)
):
    filepath = os.path.join(RAW_DIR, payload.filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Dataset {payload.filename} not found")

    df = pd.read_csv(filepath)
    
    # Auto-detect target if not provided
    target = payload.target_column
    if not target or target not in df.columns:
        if "churn" in df.columns:
            target = "churn"
        elif "median_house_value" in df.columns:
            target = "median_house_value"
        elif "weekly_sales" in df.columns:
            target = "weekly_sales"
        elif "heart_disease" in df.columns:
            target = "heart_disease"
        elif "is_fraud" in df.columns:
            target = "is_fraud"
        elif "loan_default" in df.columns:
            target = "loan_default"
        elif "final_grade" in df.columns:
            target = "final_grade"
        elif "rental_demand_count" in df.columns:
            target = "rental_demand_count"
        else:
            # Pick last column as target
            target = df.columns[-1]

    task_type = "classification" if df[target].nunique() < 20 else "regression"

    # Preprocess with train/test isolation
    pipeline = PreprocessingPipeline(
        target_column=target,
        task_type=task_type,
        scaling_strategy="standard",
        encoding_strategy="onehot",
        outlier_treatment="cap"
    )

    X_train, X_test, y_train, y_test, meta = pipeline.fit_transform(df)

    # Compute actual Gini feature importances using real RandomForest fit
    fe = FeatureEngineer(task_type=task_type)
    real_importances = fe.compute_feature_importances(
        X_train, y_train, feature_names=meta["feature_names_out"]
    )

    # Compute real PCA explained variance using scikit-learn
    pca_results = fe.apply_pca(X_train, n_components=payload.k_components or 3)

    return {
        "status": "success",
        "dataset": payload.filename,
        "target_column": target,
        "task_type": task_type,
        "feature_importances": real_importances,
        "pca_variance": {
            "explained_variance_ratio": pca_results["explained_variance_ratio"],
            "total_explained_variance": pca_results["total_explained_variance"]
        },
        "total_features": len(real_importances)
    }
