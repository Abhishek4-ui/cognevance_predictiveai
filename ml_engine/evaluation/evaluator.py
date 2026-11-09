import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score,
    confusion_matrix, classification_report,
    mean_absolute_error, mean_squared_error, r2_score,
    silhouette_score, davies_bouldin_score, calinski_harabasz_score
)

class ModelEvaluator:
    """
    Standardized Multi-Metric Evaluation Engine.
    Evaluates classification, regression, and clustering models with test-set rigor.
    """

    @staticmethod
    def evaluate_classification(
        y_true: np.ndarray,
        y_pred: np.ndarray,
        y_prob: Optional[np.ndarray] = None,
        class_names: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        acc = accuracy_score(y_true, y_pred)
        prec = precision_score(y_true, y_pred, average="weighted", zero_division=0)
        rec = recall_score(y_true, y_pred, average="weighted", zero_division=0)
        f1 = f1_score(y_true, y_pred, average="weighted", zero_division=0)

        roc_auc = None
        if y_prob is not None:
            try:
                unique_classes = np.unique(y_true)
                if len(unique_classes) == 2:
                    # binary ROC-AUC
                    prob_col = y_prob[:, 1] if y_prob.ndim == 2 and y_prob.shape[1] == 2 else y_prob
                    roc_auc = round(float(roc_auc_score(y_true, prob_col)), 4)
                elif len(unique_classes) > 2 and y_prob.ndim == 2:
                    roc_auc = round(float(roc_auc_score(y_true, y_prob, multi_class="ovr", average="weighted")), 4)
            except Exception:
                roc_auc = None

        cm = confusion_matrix(y_true, y_pred)
        labels = class_names if class_names else [str(c) for c in np.unique(y_true)]

        # Format confusion matrix for UI
        cm_data = []
        for i, row in enumerate(cm):
            for j, val in enumerate(row):
                actual_label = labels[i] if i < len(labels) else str(i)
                pred_label = labels[j] if j < len(labels) else str(j)
                cm_data.append({"actual": actual_label, "predicted": pred_label, "count": int(val)})

        report_dict = classification_report(y_true, y_pred, target_names=labels[:len(np.unique(y_true))], output_dict=True, zero_division=0)

        return {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": roc_auc,
            "confusion_matrix": cm_data,
            "confusion_matrix_raw": cm.tolist(),
            "classification_report": report_dict,
            "summary_metric": round(float(f1), 4)
        }

    @staticmethod
    def evaluate_regression(
        y_true: np.ndarray,
        y_pred: np.ndarray,
        p_features: int = 1
    ) -> Dict[str, Any]:
        mae = mean_absolute_error(y_true, y_pred)
        mse = mean_squared_error(y_true, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_true, y_pred)

        # Adjusted R²
        n = len(y_true)
        adj_r2 = 1 - (1 - r2) * (n - 1) / max(n - p_features - 1, 1)

        residuals = y_true - y_pred

        # Sample 50 points for actual vs predicted plot in UI
        sample_size = min(50, len(y_true))
        sample_indices = np.random.choice(len(y_true), size=sample_size, replace=False)
        actual_vs_pred = [
            {"index": int(i), "actual": round(float(y_true[i]), 3), "predicted": round(float(y_pred[i]), 3), "residual": round(float(residuals[i]), 3)}
            for i in sample_indices
        ]

        return {
            "mae": round(float(mae), 4),
            "mse": round(float(mse), 4),
            "rmse": round(float(rmse), 4),
            "r2": round(float(r2), 4),
            "adjusted_r2": round(float(adj_r2), 4),
            "residual_mean": round(float(np.mean(residuals)), 4),
            "residual_std": round(float(np.std(residuals)), 4),
            "actual_vs_predicted_samples": actual_vs_pred,
            "summary_metric": round(float(r2), 4)
        }

    @staticmethod
    def evaluate_clustering(
        X: np.ndarray,
        labels: np.ndarray
    ) -> Dict[str, Any]:
        n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
        if n_clusters < 2:
            return {
                "clusters_count": n_clusters,
                "silhouette_score": -1.0,
                "davies_bouldin_index": 999.0,
                "calinski_harabasz_index": 0.0,
                "summary_metric": -1.0
            }

        sil = silhouette_score(X, labels)
        db = davies_bouldin_score(X, labels)
        ch = calinski_harabasz_score(X, labels)

        return {
            "clusters_count": n_clusters,
            "silhouette_score": round(float(sil), 4),
            "davies_bouldin_index": round(float(db), 4),
            "calinski_harabasz_index": round(float(ch), 4),
            "summary_metric": round(float(sil), 4)
        }

    @staticmethod
    def check_overfitting(train_metric: float, test_metric: float, threshold: float = 0.15) -> Dict[str, Any]:
        """Flags potential overfitting if train performance exceeds test performance by threshold."""
        gap = train_metric - test_metric
        is_overfitting = gap > threshold
        return {
            "train_score": round(train_metric, 4),
            "test_score": round(test_metric, 4),
            "gap": round(gap, 4),
            "is_overfitting": bool(is_overfitting),
            "risk_level": "HIGH" if gap > 0.25 else ("MODERATE" if gap > 0.12 else "LOW")
        }
