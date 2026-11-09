import time
import numpy as np
from typing import Dict, Any, List, Tuple
from sklearn.linear_model import LogisticRegression, LinearRegression, Ridge, Lasso
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import (
    RandomForestClassifier, RandomForestRegressor,
    GradientBoostingClassifier, GradientBoostingRegressor
)
from sklearn.svm import SVC, SVR
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.naive_bayes import GaussianNB
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.model_selection import cross_val_score
try:
    import xgboost as xgb
    HAS_XGBOOST = True
except Exception:
    HAS_XGBOOST = False

from sklearn.ensemble import HistGradientBoostingClassifier, HistGradientBoostingRegressor
import joblib

from ml_engine.evaluation.evaluator import ModelEvaluator

class MLTrainer:
    """
    Automated Multi-Algorithm Model Training Engine.
    Executes real model fits, hyperparameter tuning, cross-validation,
    leaderboard generation, and best-model auto-selection.
    """

    CLASSIFICATION_MODELS = {
        "logistic_regression": lambda: LogisticRegression(max_iter=1000, random_state=42),
        "decision_tree": lambda: DecisionTreeClassifier(max_depth=6, random_state=42),
        "random_forest": lambda: RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42),
        "svm": lambda: SVC(probability=True, random_state=42),
        "knn": lambda: KNeighborsClassifier(n_neighbors=5),
        "gradient_boosting": lambda: GradientBoostingClassifier(n_estimators=100, random_state=42),
        "xgboost": lambda: xgb.XGBClassifier(n_estimators=100, max_depth=5, eval_metric="logloss", random_state=42) if HAS_XGBOOST else HistGradientBoostingClassifier(max_iter=100, max_depth=5, random_state=42),
        "naive_bayes": lambda: GaussianNB(),
        "neural_network": lambda: MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=300, random_state=42)
    }

    REGRESSION_MODELS = {
        "linear_regression": lambda: LinearRegression(),
        "ridge": lambda: Ridge(alpha=1.0, random_state=42),
        "lasso": lambda: Lasso(alpha=0.1, random_state=42),
        "decision_tree_regressor": lambda: DecisionTreeRegressor(max_depth=6, random_state=42),
        "random_forest_regressor": lambda: RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42),
        "gradient_boosting_regressor": lambda: GradientBoostingRegressor(n_estimators=100, random_state=42),
        "xgboost_regressor": lambda: xgb.XGBRegressor(n_estimators=100, max_depth=5, random_state=42) if HAS_XGBOOST else HistGradientBoostingRegressor(max_iter=100, max_depth=5, random_state=42),
        "neural_network_regressor": lambda: MLPRegressor(hidden_layer_sizes=(64, 32), max_iter=300, random_state=42)
    }

    CLUSTERING_MODELS = {
        "kmeans": lambda: KMeans(n_clusters=3, random_state=42, n_init=10),
        "dbscan": lambda: DBSCAN(eps=0.5, min_samples=5),
        "hierarchical": lambda: AgglomerativeClustering(n_clusters=3)
    }

    def __init__(self, task_type: str = "classification"):
        self.task_type = task_type
        self.trained_models = {}
        self.leaderboard = []
        self.best_model_name = None
        self.best_model_instance = None
        self.best_metrics = {}

    def train_single_model(
        self,
        model_name: str,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_test: np.ndarray,
        y_test: np.ndarray,
        class_names: List[str] = None
    ) -> Dict[str, Any]:
        """Trains a single algorithm and evaluates it on untouched test set."""
        start_time = time.time()

        if "classification" in self.task_type:
            builder = self.CLASSIFICATION_MODELS.get(model_name)
            if not builder:
                raise ValueError(f"Unknown classification model: {model_name}")
            model = builder()
            model.fit(X_train, y_train)
            train_time = round(time.time() - start_time, 3)

            y_pred = model.predict(X_test)
            y_prob = model.predict_proba(X_test) if hasattr(model, "predict_proba") else None
            metrics = ModelEvaluator.evaluate_classification(y_test, y_pred, y_prob, class_names)

            # Cross validation on training data
            cv_scores = cross_val_score(model, X_train, y_train, cv=min(3, len(X_train)), scoring="f1_weighted")
            cv_mean = round(float(np.mean(cv_scores)), 4)
            cv_std = round(float(np.std(cv_scores)), 4)

            # Overfitting check
            y_train_pred = model.predict(X_train)
            train_acc = float(np.mean(y_train == y_train_pred))
            overfit = ModelEvaluator.check_overfitting(train_acc, metrics["accuracy"])

        elif "regression" in self.task_type:
            builder = self.REGRESSION_MODELS.get(model_name)
            if not builder:
                raise ValueError(f"Unknown regression model: {model_name}")
            model = builder()
            model.fit(X_train, y_train)
            train_time = round(time.time() - start_time, 3)

            y_pred = model.predict(X_test)
            metrics = ModelEvaluator.evaluate_regression(y_test, y_pred, p_features=X_test.shape[1])

            cv_scores = cross_val_score(model, X_train, y_train, cv=min(3, len(X_train)), scoring="r2")
            cv_mean = round(float(np.mean(cv_scores)), 4)
            cv_std = round(float(np.std(cv_scores)), 4)

            y_train_pred = model.predict(X_train)
            train_r2 = float(ModelEvaluator.evaluate_regression(y_train, y_train_pred)["r2"])
            overfit = ModelEvaluator.check_overfitting(train_r2, metrics["r2"])

        else: # Clustering
            builder = self.CLUSTERING_MODELS.get(model_name)
            if not builder:
                raise ValueError(f"Unknown clustering model: {model_name}")
            model = builder()
            labels = model.fit_predict(X_train)
            train_time = round(time.time() - start_time, 3)
            metrics = ModelEvaluator.evaluate_clustering(X_train, labels)
            cv_mean = 0.0
            cv_std = 0.0
            overfit = {"is_overfitting": False, "risk_level": "LOW"}

        result = {
            "model_name": model_name,
            "train_time_seconds": train_time,
            "metrics": metrics,
            "cross_val_mean": cv_mean,
            "cross_val_std": cv_std,
            "overfitting": overfit,
            "algorithm_family": model.__class__.__name__
        }

        self.trained_models[model_name] = model
        return result

    def train_all_and_compare(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_test: np.ndarray,
        y_test: np.ndarray,
        selected_models: List[str] = None,
        class_names: List[str] = None
    ) -> Dict[str, Any]:
        """Trains multiple algorithms and ranks them into a leaderboard."""
        if not selected_models:
            if "classification" in self.task_type:
                selected_models = ["logistic_regression", "random_forest", "xgboost", "gradient_boosting", "neural_network"]
            elif "regression" in self.task_type:
                selected_models = ["linear_regression", "ridge", "random_forest_regressor", "xgboost_regressor", "gradient_boosting_regressor"]
            else:
                selected_models = ["kmeans", "dbscan", "hierarchical"]

        leaderboard = []
        for model_name in selected_models:
            try:
                res = self.train_single_model(model_name, X_train, y_train, X_test, y_test, class_names)
                leaderboard.append(res)
            except Exception as e:
                leaderboard.append({
                    "model_name": model_name,
                    "error": str(e),
                    "metrics": {"summary_metric": -999}
                })

        # Rank models by summary_metric (higher is better)
        leaderboard.sort(key=lambda x: x.get("metrics", {}).get("summary_metric", -999), reverse=True)
        self.leaderboard = leaderboard

        if len(leaderboard) > 0 and "error" not in leaderboard[0]:
            self.best_model_name = leaderboard[0]["model_name"]
            self.best_model_instance = self.trained_models.get(self.best_model_name)
            self.best_metrics = leaderboard[0]["metrics"]

        return {
            "leaderboard": self.leaderboard,
            "best_model": self.best_model_name,
            "best_metrics": self.best_metrics,
            "total_models_evaluated": len(leaderboard)
        }
