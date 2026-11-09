import os
import pandas as pd
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from backend.app.schemas.payloads import PreprocessRequest
from backend.app.core.database import get_db
from backend.app.models.entities import ActivityLog, User
from backend.app.api.deps import get_current_user
from ml_engine.preprocessing.pipeline import PreprocessingPipeline

router = APIRouter(prefix="/preprocessing", tags=["Data Preprocessing"])

RAW_DIR = "datasets/raw"
PROCESSED_DIR = "datasets/processed"
os.makedirs(PROCESSED_DIR, exist_ok=True)

@router.post("/run")
def run_preprocessing(payload: PreprocessRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not payload.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    filepath = os.path.join(RAW_DIR, payload.filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"File {payload.filename} not found")

    df = pd.read_csv(filepath)

    pipeline = PreprocessingPipeline(
        target_column=payload.target_column,
        task_type="classification" if payload.target_column and df[payload.target_column].nunique() < 20 else "regression",
        scaling_strategy=payload.scaling_strategy,
        encoding_strategy=payload.encoding_strategy,
        outlier_treatment=payload.outlier_treatment,
        handle_imbalance=payload.handle_imbalance,
        test_size=payload.test_size
    )

    X_train, X_test, y_train, y_test, metadata = pipeline.fit_transform(df)

    # Save processed dataset CSV
    processed_filename = f"processed_{payload.filename}"
    processed_path = os.path.join(PROCESSED_DIR, processed_filename)

    feature_cols = metadata["feature_names_out"]
    processed_df = pd.DataFrame(X_train, columns=feature_cols)
    if payload.target_column:
        processed_df["target_transformed"] = y_train
    processed_df.to_csv(processed_path, index=False)

    # Activity log
    log = ActivityLog(user_id=current_user.id if current_user else None, action="PREPROCESSING_RUN", entity_type="Dataset", entity_id=payload.filename, details=f"Preprocessed {payload.filename} with {metadata['transformed_features_count']} features")
    db.add(log)
    db.commit()

    return {
        "status": "success",
        "processed_filename": processed_filename,
        "metadata": metadata,
        "preview": processed_df.head(10).to_dict(orient="records")
    }
