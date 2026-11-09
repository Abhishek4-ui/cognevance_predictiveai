import numpy as np
from typing import Dict, Any, List
from scipy.stats import ks_2samp

class DriftDetector:
    """
    MLOps Data Drift & Covariate Shift Monitoring Engine.
    Detects distribution changes between baseline reference data and current production traffic.
    Uses Kolmogorov-Smirnov (KS) two-sample test and Population Stability Index (PSI).
    """

    def __init__(self, p_value_threshold: float = 0.05, psi_threshold: float = 0.2):
        self.p_value_threshold = p_value_threshold
        self.psi_threshold = psi_threshold

    def calculate_psi(self, baseline: np.ndarray, target: np.ndarray, num_bins: int = 10) -> float:
        """Calculates Population Stability Index (PSI) between two distributions."""
        if len(baseline) == 0 or len(target) == 0:
            return 0.0

        quantiles = np.linspace(0, 100, num_bins + 1)
        bin_edges = np.percentile(baseline, quantiles)
        bin_edges[0] -= 1e-5
        bin_edges[-1] += 1e-5

        base_counts, _ = np.histogram(baseline, bins=bin_edges)
        target_counts, _ = np.histogram(target, bins=bin_edges)

        base_pct = (base_counts + 1e-4) / (len(baseline) + 1e-4 * num_bins)
        target_pct = (target_counts + 1e-4) / (len(target) + 1e-4 * num_bins)

        psi_val = np.sum((target_pct - base_pct) * np.log(target_pct / base_pct))
        return round(float(psi_val), 4)

    def detect_dataset_drift(
        self,
        reference_data: np.ndarray,
        current_data: np.ndarray,
        feature_names: List[str]
    ) -> Dict[str, Any]:
        """Runs feature-by-feature drift detection across entire dataset."""
        n_features = min(reference_data.shape[1], current_data.shape[1], len(feature_names))
        drifted_features = []
        feature_reports = []

        for i in range(n_features):
            ref_col = reference_data[:, i]
            cur_col = current_data[:, i]

            # 2-sample KS test
            ks_stat, p_val = ks_2samp(ref_col, cur_col)
            psi = self.calculate_psi(ref_col, cur_col)

            has_drift = (p_val < self.p_value_threshold) or (psi > self.psi_threshold)

            if has_drift:
                drifted_features.append(feature_names[i])

            status = "CRITICAL DRIFT" if psi > 0.25 else ("MODERATE SHIFT" if psi > 0.1 else "STABLE")

            feature_reports.append({
                "feature": feature_names[i],
                "ks_statistic": round(float(ks_stat), 4),
                "p_value": round(float(p_val), 5),
                "psi": psi,
                "drift_detected": bool(has_drift),
                "status": status
            })

        drift_share = len(drifted_features) / max(n_features, 1)
        system_drift_alert = drift_share > 0.3

        return {
            "drift_detected": system_drift_alert,
            "drift_share_percentage": round(drift_share * 100, 2),
            "total_features_analyzed": n_features,
            "drifted_features_count": len(drifted_features),
            "drifted_features": drifted_features,
            "feature_details": feature_reports,
            "alert_level": "RED - ACTION REQUIRED" if system_drift_alert else ("YELLOW - MONITOR" if len(drifted_features) > 0 else "GREEN - HEALTHY")
        }
