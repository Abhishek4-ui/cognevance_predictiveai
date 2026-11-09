import os
import pandas as pd
from ml_engine.use_cases.data_loader import UseCaseDataLoader
from ml_engine.preprocessing.pipeline import PreprocessingPipeline
from ml_engine.training.trainer import MLTrainer
from ml_engine.registry.registry import ModelRegistry

USE_CASES_SPEC = [
    {
        "name": "Customer Churn Predictor",
        "dataset": "customer_churn.csv",
        "target": "churn",
        "task_type": "classification",
        "algorithm": "xgboost"
    },
    {
        "name": "House Price Forecaster",
        "dataset": "house_price_prediction.csv",
        "target": "median_house_value",
        "task_type": "regression",
        "algorithm": "random_forest_regressor"
    },
    {
        "name": "Loan Default Risk Analyzer",
        "dataset": "loan_default_risk.csv",
        "target": "loan_default",
        "task_type": "classification",
        "algorithm": "gradient_boosting"
    },
    {
        "name": "Cardiac Health Risk Evaluator",
        "dataset": "healthcare_cardiac_risk.csv",
        "target": "heart_disease",
        "task_type": "classification",
        "algorithm": "random_forest"
    },
    {
        "name": "Fraud Detection Engine",
        "dataset": "fraud_detection.csv",
        "target": "is_fraud",
        "task_type": "classification",
        "algorithm": "xgboost"
    },
    {
        "name": "Rental Demand Forecaster",
        "dataset": "demand_forecasting.csv",
        "target": "rental_demand_count",
        "task_type": "regression",
        "algorithm": "xgboost_regressor"
    },
    {
        "name": "Sales Weekly Forecaster",
        "dataset": "sales_forecasting.csv",
        "target": "weekly_sales",
        "task_type": "regression",
        "algorithm": "random_forest_regressor"
    },
    {
        "name": "Student Grade Predictor",
        "dataset": "student_performance.csv",
        "target": "final_grade",
        "task_type": "regression",
        "algorithm": "linear_regression"
    },
    {
        "name": "Customer Segment Clusterer",
        "dataset": "customer_segmentation.csv",
        "target": None,
        "task_type": "clustering",
        "algorithm": "kmeans"
    }
]

def bootstrap_benchmark_models():
    """Generates datasets, trains models with real cross-validation, and registers production artifacts."""
    print("Bootstrapping 9 real-world benchmark datasets...")
    UseCaseDataLoader.ensure_datasets()

    registry = ModelRegistry()
    trained_count = 0

    for spec in USE_CASES_SPEC:
        csv_path = os.path.join(UseCaseDataLoader.RAW_DIR, spec["dataset"])
        if not os.path.exists(csv_path):
            continue

        existing = registry.get_production_model(spec["name"])
        if existing:
            continue

        print(f"Training production model for: {spec['name']} ({spec['algorithm']})...")
        df = pd.read_csv(csv_path)

        pipeline = PreprocessingPipeline(
            target_column=spec["target"],
            task_type=spec["task_type"],
            scaling_strategy="standard",
            encoding_strategy="onehot",
            outlier_treatment="cap"
        )

        X_train, X_test, y_train, y_test, meta = pipeline.fit_transform(df)

        trainer = MLTrainer(task_type=spec["task_type"])
        res = trainer.train_single_model(
            model_name=spec["algorithm"],
            X_train=X_train,
            y_train=y_train,
            X_test=X_test,
            y_test=y_test,
            class_names=meta.get("target_classes")
        )

        trained_model_obj = trainer.trained_models[spec["algorithm"]]

        registry.register_model(
            model_name=spec["name"],
            task_type=spec["task_type"],
            algorithm=spec["algorithm"],
            model_object=trained_model_obj,
            preprocessing_pipeline=pipeline,
            metrics=res["metrics"],
            features=pipeline.feature_names_in,
            version="1.0.0",
            stage="production"
        )
        trained_count += 1

    print(f"Bootstrapped {trained_count} new production models into Model Registry.")
    return trained_count

if __name__ == "__main__":
    bootstrap_benchmark_models()
