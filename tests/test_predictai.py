import pytest
import os
import json
import numpy as np
import pandas as pd
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.core.database import SessionLocal, Base, engine
from backend.app.core.security import hash_password, verify_password, create_access_token
from backend.app.models.entities import User, DatasetRecord, PredictionRecord
from ml_engine.preprocessing.pipeline import PreprocessingPipeline
from ml_engine.feature_engineering.engineer import FeatureEngineer
from ml_engine.training.trainer import MLTrainer
from ml_engine.evaluation.evaluator import ModelEvaluator
from ml_engine.explainability.xai import ExplainableAI
from ml_engine.monitoring.drift import DriftDetector
from ml_engine.registry.registry import ModelRegistry
from ml_engine.use_cases.data_loader import UseCaseDataLoader

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        admin = User(
            id=1,
            email="admin@predictai.pro",
            username="admin",
            hashed_password=hash_password("PredictAIAdmin2026!"),
            role="admin",
            is_active=True
        )
        db.add(admin)
        db.commit()
    db.close()
    UseCaseDataLoader.ensure_datasets()
    yield

# 1. Authentication Tests
def test_password_hashing():
    pwd = "SecureStudentPass2026!"
    hashed = hash_password(pwd)
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_token_creation_and_auth():
    token = create_access_token({"sub": "1", "username": "admin", "role": "admin"})
    assert isinstance(token, str)
    assert len(token) > 20

    # API me endpoint
    resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["username"] == "admin"

# 2. Database Operations Tests
def test_database_crud():
    db = SessionLocal()
    test_user = User(
        email="test_student@predictai.pro",
        username="test_student",
        hashed_password=hash_password("testpass123"),
        role="user",
        is_active=True
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)

    assert test_user.id is not None
    fetched = db.query(User).filter(User.username == "test_student").first()
    assert fetched is not None
    assert fetched.email == "test_student@predictai.pro"

    db.delete(fetched)
    db.commit()
    db.close()

# 3. Data Cleaning and Preprocessing Tests
def test_preprocessing_pipeline_fit_transform():
    raw_df = pd.DataFrame({
        "age": [25, 45, np.nan, 35, 50, 22, 60, 31],
        "city": ["Paris", "London", "Paris", "Berlin", "London", "Paris", "Berlin", "London"],
        "income": [50000, 75000, 60000, 52000, 95000, 48000, 110000, 58000],
        "churn": [0, 1, 0, 0, 1, 0, 1, 0]
    })
    
    pipeline = PreprocessingPipeline(
        target_column="churn",
        task_type="classification",
        scaling_strategy="standard",
        encoding_strategy="onehot",
        outlier_treatment="cap"
    )
    
    X_train, X_test, y_train, y_test, meta = pipeline.fit_transform(raw_df)
    assert X_train.shape[0] > 0
    assert X_test.shape[0] > 0
    assert not np.isnan(X_train).any()
    assert not np.isnan(X_test).any()

# 4. Feature Engineering Tests
def test_feature_engineering_ranking():
    X = np.random.randn(60, 4)
    y = np.random.choice([0, 1], size=60)
    names = ["feat_A", "feat_B", "feat_C", "feat_D"]
    
    fe = FeatureEngineer(task_type="classification")
    rankings = fe.compute_feature_importances(X, y, names)
    assert len(rankings) == 4
    assert rankings[0]["importance"] >= rankings[-1]["importance"]

# 5. Model Training & Multiple Algorithms Tests
def test_classification_training_suite():
    X_train = np.random.randn(80, 5)
    y_train = np.random.choice([0, 1], size=80)
    X_test = np.random.randn(20, 5)
    y_test = np.random.choice([0, 1], size=20)
    
    trainer = MLTrainer(task_type="classification")
    models_to_test = ["logistic_regression", "random_forest", "xgboost", "gradient_boosting", "neural_network"]
    
    results = trainer.train_all_and_compare(X_train, y_train, X_test, y_test, selected_models=models_to_test)
    assert len(results["leaderboard"]) == len(models_to_test)
    assert results["best_model"] is not None

def test_regression_training_suite():
    X_train = np.random.randn(80, 4)
    y_train = 2.5 * X_train[:, 0] + np.random.randn(80) * 0.2
    X_test = np.random.randn(20, 4)
    y_test = 2.5 * X_test[:, 0] + np.random.randn(20) * 0.2
    
    trainer = MLTrainer(task_type="regression")
    models_to_test = ["linear_regression", "ridge", "random_forest_regressor", "xgboost_regressor"]
    
    results = trainer.train_all_and_compare(X_train, y_train, X_test, y_test, selected_models=models_to_test)
    assert len(results["leaderboard"]) == len(models_to_test)
    assert results["best_metrics"]["r2"] > 0.7

# 6. Model Evaluation Tests
def test_model_evaluator_metrics():
    y_true = np.array([0, 1, 1, 0, 1, 0, 1, 1, 0, 0])
    y_pred = np.array([0, 1, 1, 0, 0, 0, 1, 1, 0, 1])
    
    eval_res = ModelEvaluator.evaluate_classification(y_true, y_pred)
    assert "accuracy" in eval_res
    assert "f1_score" in eval_res
    assert "confusion_matrix" in eval_res
    assert eval_res["accuracy"] >= 0.8

# 7. Model Persistence & Model Loading Tests
def test_model_registry_persistence():
    registry = ModelRegistry()
    models = registry.list_models()
    assert len(models) >= 9 # All 9 bootstrapped use cases
    
    first_model = models[0]
    model_obj, pipeline_obj = registry.load_artifacts(first_model["model_id"])
    assert model_obj is not None

# 8. Single Prediction & Explainability Tests
def test_real_time_prediction_and_xai():
    registry = ModelRegistry()
    churn_model = next(m for m in registry.list_models() if "Churn" in m["model_name"])
    
    sample_input = {
        "tenure_months": 12,
        "contract_type": "Month-to-month",
        "internet_service": "Fiber optic",
        "tech_support": "No",
        "monthly_charges": 85.5,
        "total_charges": 1026.0
    }
    
    resp = client.post("/api/predict/single", json={
        "model_id": churn_model["model_id"],
        "features": sample_input
    })
    assert resp.status_code == 200
    res = resp.json()
    assert "prediction" in res
    assert "explainability" in res
    assert "uncertainty" in res

# 9. Monitoring & Drift Detection Tests
def test_data_drift_detection():
    detector = DriftDetector()
    base = np.random.normal(0, 1, size=(200, 3))
    drifted = np.random.normal(2.5, 1, size=(200, 3)) # shifted distribution
    
    res = detector.detect_dataset_drift(base, drifted, ["f1", "f2", "f3"])
    assert res["drift_detected"] is True
    assert res["drifted_features_count"] >= 2

# 10. System Health & Dashboard API
def test_system_health_endpoint():
    resp = client.get("/api/dashboard/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ONLINE"
    assert data["database"] == "CONNECTED"

def test_dashboard_metrics_endpoint():
    resp = client.get("/api/dashboard/metrics")
    assert resp.status_code == 200
    metrics = resp.json()
    assert metrics["total_models"] >= 9
    assert metrics["total_datasets"] >= 9
