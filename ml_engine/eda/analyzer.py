import numpy as np
import pandas as pd
from typing import Dict, Any, List

class EDAAnalyzer:
    """
    Automated Exploratory Data Analysis Engine.
    Computes rigorous descriptive statistics, distributions, correlations,
    outlier detection, and overall data quality score.
    """

    def __init__(self, df: pd.DataFrame, target_col: str = None):
        self.df = df.copy()
        self.target_col = target_col

    def run_full_eda(self) -> Dict[str, Any]:
        """Executes full exploratory analysis and returns structured metadata."""
        n_rows, n_cols = self.df.shape
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = self.df.select_dtypes(exclude=[np.number]).columns.tolist()

        missing_report = self._compute_missing()
        duplicate_count = int(self.df.duplicated().sum())
        stats_summary = self._compute_descriptive_stats(numeric_cols)
        categorical_summary = self._compute_categorical_stats(categorical_cols)
        correlation_matrix = self._compute_correlations(numeric_cols)
        outlier_report = self._compute_outliers(numeric_cols)
        quality_score = self._compute_quality_score(missing_report, duplicate_count, n_rows)

        target_analysis = None
        if self.target_col and self.target_col in self.df.columns:
            target_analysis = self._analyze_target(self.target_col)

        return {
            "summary": {
                "total_rows": n_rows,
                "total_columns": n_cols,
                "numeric_columns_count": len(numeric_cols),
                "categorical_columns_count": len(categorical_cols),
                "duplicate_rows": duplicate_count,
                "duplicate_percentage": round((duplicate_count / max(n_rows, 1)) * 100, 2),
                "quality_score": quality_score,
                "memory_usage_kb": round(self.df.memory_usage(deep=True).sum() / 1024, 2)
            },
            "columns": {
                "numeric": numeric_cols,
                "categorical": categorical_cols,
                "all": [{"name": c, "dtype": str(self.df[c].dtype)} for c in self.df.columns]
            },
            "missing_values": missing_report,
            "descriptive_statistics": stats_summary,
            "categorical_distribution": categorical_summary,
            "correlations": correlation_matrix,
            "outliers": outlier_report,
            "target_analysis": target_analysis
        }

    def _compute_missing(self) -> Dict[str, Any]:
        missing_counts = self.df.isnull().sum()
        total_cells = np.prod(self.df.shape)
        total_missing = int(missing_counts.sum())

        details = []
        for col in self.df.columns:
            cnt = int(missing_counts[col])
            if cnt > 0:
                pct = round((cnt / len(self.df)) * 100, 2)
                details.append({"column": col, "missing_count": cnt, "percentage": pct})

        return {
            "total_missing_cells": total_missing,
            "total_missing_percentage": round((total_missing / max(total_cells, 1)) * 100, 2),
            "columns_with_missing": details
        }

    def _compute_descriptive_stats(self, numeric_cols: List[str]) -> List[Dict[str, Any]]:
        results = []
        for col in numeric_cols:
            series = self.df[col].dropna()
            if len(series) == 0:
                continue

            q25 = float(series.quantile(0.25))
            q75 = float(series.quantile(0.75))
            iqr = q75 - q25

            # Compute histogram bins
            hist_vals, bin_edges = np.histogram(series, bins=min(15, max(5, int(np.sqrt(len(series))))))
            bins_data = [
                {"bin_start": round(float(bin_edges[i]), 2), "bin_end": round(float(bin_edges[i+1]), 2), "count": int(hist_vals[i])}
                for i in range(len(hist_vals))
            ]

            results.append({
                "column": col,
                "count": int(series.count()),
                "mean": round(float(series.mean()), 4),
                "std": round(float(series.std(ddof=1) if len(series) > 1 else 0.0), 4),
                "variance": round(float(series.var(ddof=1) if len(series) > 1 else 0.0), 4),
                "min": round(float(series.min()), 4),
                "q25": round(q25, 4),
                "median": round(float(series.median()), 4),
                "q75": round(q75, 4),
                "max": round(float(series.max()), 4),
                "iqr": round(iqr, 4),
                "skewness": round(float(series.skew()), 4) if len(series) > 2 else 0.0,
                "kurtosis": round(float(series.kurtosis()), 4) if len(series) > 3 else 0.0,
                "histogram": bins_data
            })
        return results

    def _compute_categorical_stats(self, categorical_cols: List[str]) -> List[Dict[str, Any]]:
        results = []
        for col in categorical_cols:
            series = self.df[col].dropna().astype(str)
            val_counts = series.value_counts().head(10).to_dict()
            results.append({
                "column": col,
                "unique_count": int(series.nunique()),
                "top_value": str(series.mode()[0]) if len(series) > 0 else None,
                "top_frequency": int(val_counts[list(val_counts.keys())[0]]) if val_counts else 0,
                "distribution": [{"value": str(k), "count": int(v)} for k, v in val_counts.items()]
            })
        return results

    def _compute_correlations(self, numeric_cols: List[str]) -> Dict[str, Any]:
        if len(numeric_cols) < 2:
            return {"columns": numeric_cols, "matrix": []}

        # Pearson correlation
        sub_df = self.df[numeric_cols].dropna()
        if len(sub_df) < 3:
            return {"columns": numeric_cols, "matrix": []}

        corr = sub_df.corr(method="pearson").round(3)
        matrix = []
        for col1 in numeric_cols:
            row = []
            for col2 in numeric_cols:
                val = corr.loc[col1, col2] if (col1 in corr.index and col2 in corr.columns) else 0.0
                row.append(0.0 if np.isnan(val) else float(val))
            matrix.append(row)

        return {
            "columns": numeric_cols,
            "matrix": matrix
        }

    def _compute_outliers(self, numeric_cols: List[str]) -> List[Dict[str, Any]]:
        outliers = []
        for col in numeric_cols:
            series = self.df[col].dropna()
            if len(series) < 5:
                continue

            q25 = series.quantile(0.25)
            q75 = series.quantile(0.75)
            iqr = q75 - q25
            lower_bound = q25 - 1.5 * iqr
            upper_bound = q75 + 1.5 * iqr

            outlier_mask = (series < lower_bound) | (series > upper_bound)
            count = int(outlier_mask.sum())
            if count > 0:
                pct = round((count / len(series)) * 100, 2)
                outliers.append({
                    "column": col,
                    "outlier_count": count,
                    "percentage": pct,
                    "lower_bound": round(float(lower_bound), 3),
                    "upper_bound": round(float(upper_bound), 3)
                })
        return outliers

    def _compute_quality_score(self, missing_report: Dict[str, Any], duplicate_count: int, n_rows: int) -> float:
        score = 100.0
        missing_pct = missing_report["total_missing_percentage"]
        score -= min(missing_pct * 1.5, 40.0)

        dup_pct = (duplicate_count / max(n_rows, 1)) * 100
        score -= min(dup_pct * 1.0, 20.0)

        return round(max(10.0, score), 1)

    def _analyze_target(self, target_col: str) -> Dict[str, Any]:
        series = self.df[target_col].dropna()
        is_numeric = pd.api.types.is_numeric_dtype(series)
        unique_count = int(series.nunique())

        # Determine task type automatically
        if is_numeric and unique_count > 15:
            task_type = "regression"
        elif unique_count == 2:
            task_type = "binary_classification"
        elif unique_count <= 15:
            task_type = "multiclass_classification"
        else:
            task_type = "classification"

        val_counts = series.value_counts().head(10).to_dict()
        return {
            "target_column": target_col,
            "detected_task_type": task_type,
            "unique_count": unique_count,
            "distribution": [{"label": str(k), "count": int(v)} for k, v in val_counts.items()]
        }
