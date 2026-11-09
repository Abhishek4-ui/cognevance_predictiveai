import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from sklearn.feature_selection import SelectKBest, f_classif, f_regression, VarianceThreshold
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.decomposition import PCA

class FeatureEngineer:
    """
    Feature Engineering & Selection Module.
    Performs feature ranking, PCA dimensionality reduction, and mutual info screening.
    """

    def __init__(self, task_type: str = "classification"):
        self.task_type = task_type
        self.selector = None
        self.pca = None
        self.feature_importances_ = {}

    def compute_feature_importances(
        self, X: np.ndarray, y: np.ndarray, feature_names: List[str]
    ) -> List[Dict[str, Any]]:
        """Calculates feature importance using Tree Ensembles."""
        if len(feature_names) == 0 or X.shape[1] != len(feature_names):
            return []

        if "classification" in self.task_type:
            model = RandomForestClassifier(n_estimators=50, max_depth=6, random_state=42)
        else:
            model = RandomForestRegressor(n_estimators=50, max_depth=6, random_state=42)

        model.fit(X, y)
        importances = model.feature_importances_

        results = []
        for name, imp in zip(feature_names, importances):
            results.append({
                "feature": name,
                "importance": round(float(imp), 4),
                "percentage": round(float(imp) * 100, 2)
            })

        results.sort(key=lambda x: x["importance"], reverse=True)
        return results

    def select_top_k(
        self, X: np.ndarray, y: np.ndarray, feature_names: List[str], k: int = 10
    ) -> Tuple[np.ndarray, List[str]]:
        """Selects top K features using univariate statistical tests."""
        k = min(k, X.shape[1])
        score_func = f_classif if "classification" in self.task_type else f_regression
        self.selector = SelectKBest(score_func=score_func, k=k)
        X_selected = self.selector.fit_transform(X, y)

        mask = self.selector.get_support()
        selected_names = [feature_names[i] for i in range(len(feature_names)) if mask[i]]
        return X_selected, selected_names

    def apply_pca(self, X: np.ndarray, n_components: int = 2) -> Dict[str, Any]:
        """Reduces feature dimensionality to 2D/3D for visualization and clustering."""
        n_comps = min(n_components, X.shape[1], X.shape[0])
        self.pca = PCA(n_components=n_comps)
        transformed = self.pca.fit_transform(X)

        return {
            "transformed_data": transformed.tolist(),
            "explained_variance_ratio": [round(float(v), 4) for v in self.pca.explained_variance_ratio_],
            "total_explained_variance": round(float(np.sum(self.pca.explained_variance_ratio_)), 4)
        }
