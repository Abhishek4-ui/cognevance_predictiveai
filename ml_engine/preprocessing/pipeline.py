import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, List, Optional
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler, LabelEncoder, OneHotEncoder
from sklearn.impute import SimpleImputer
import joblib

class PreprocessingPipeline:
    """
    Advanced Data Preprocessing Pipeline.
    Prevents data leakage by strictly fitting transformers on the training partition.
    Supports scaling, one-hot & label encoding, outlier clipping, and imbalance correction.
    """

    def __init__(
        self,
        target_column: Optional[str] = None,
        task_type: str = "classification",
        scaling_strategy: str = "standard", # standard, minmax, robust, none
        imputation_strategy_num: str = "median", # mean, median, zero
        imputation_strategy_cat: str = "most_frequent",
        encoding_strategy: str = "onehot", # onehot, label
        outlier_treatment: str = "cap", # cap, none
        handle_imbalance: bool = False,
        test_size: float = 0.2,
        random_state: int = 42
    ):
        self.target_column = target_column
        self.task_type = task_type
        self.scaling_strategy = scaling_strategy
        self.imputation_strategy_num = imputation_strategy_num
        self.imputation_strategy_cat = imputation_strategy_cat
        self.encoding_strategy = encoding_strategy
        self.outlier_treatment = outlier_treatment
        self.handle_imbalance = handle_imbalance
        self.test_size = test_size
        self.random_state = random_state

        # Fitted artifacts
        self.num_imputer = None
        self.cat_imputer = None
        self.scaler = None
        self.encoder = None
        self.target_encoder = None
        self.feature_names_in = []
        self.feature_names_out = []
        self.numeric_features = []
        self.categorical_features = []
        self.iqr_bounds = {}
        self.target_classes_ = None

    def fit_transform(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, Dict[str, Any]]:
        """Fits pipeline on X_train and transforms both X_train and X_test without data leakage."""
        clean_df = df.drop_duplicates().copy()
        
        # Isolate Target
        if self.target_column and self.target_column in clean_df.columns:
            y_raw = clean_df[self.target_column]
            X_raw = clean_df.drop(columns=[self.target_column])
        else:
            y_raw = None
            X_raw = clean_df

        self.feature_names_in = X_raw.columns.tolist()
        self.numeric_features = X_raw.select_dtypes(include=[np.number]).columns.tolist()
        self.categorical_features = X_raw.select_dtypes(exclude=[np.number]).columns.tolist()

        # Target encoding
        y_encoded = None
        if y_raw is not None:
            if "classification" in self.task_type:
                self.target_encoder = LabelEncoder()
                y_encoded = self.target_encoder.fit_transform(y_raw.astype(str))
                self.target_classes_ = [str(c) for c in self.target_encoder.classes_]
            else:
                y_encoded = y_raw.values.astype(float)

        # Train/Test Split BEFORE computing scaling or imputations to avoid data leakage
        if y_encoded is not None:
            stratify = y_encoded if ("classification" in self.task_type and len(np.unique(y_encoded)) > 1 and np.min(np.bincount(y_encoded)) >= 2) else None
            X_train, X_test, y_train, y_test = train_test_split(
                X_raw, y_encoded, test_size=self.test_size, random_state=self.random_state, stratify=stratify
            )
        else:
            X_train, X_test = train_test_split(X_raw, test_size=self.test_size, random_state=self.random_state)
            y_train, y_test = np.zeros(len(X_train)), np.zeros(len(X_test))

        # Learn outlier clipping bounds ONLY from train
        if self.outlier_treatment == "cap":
            for col in self.numeric_features:
                q25 = X_train[col].quantile(0.25)
                q75 = X_train[col].quantile(0.75)
                iqr = q75 - q25
                self.iqr_bounds[col] = (q25 - 1.5 * iqr, q75 + 1.5 * iqr)

        X_train_processed = self._transform_features(X_train, is_train=True)
        X_test_processed = self._transform_features(X_test, is_train=False)

        # Handle class imbalance on training set only
        if self.handle_imbalance and "classification" in self.task_type and len(np.unique(y_train)) == 2:
            X_train_processed, y_train = self._oversample_minority(X_train_processed, y_train)

        metadata = {
            "train_samples": len(X_train_processed),
            "test_samples": len(X_test_processed),
            "original_features_count": len(self.feature_names_in),
            "transformed_features_count": X_train_processed.shape[1],
            "feature_names_out": self.feature_names_out,
            "numeric_columns": self.numeric_features,
            "categorical_columns": self.categorical_features,
            "target_classes": self.target_classes_,
            "scaling_strategy": self.scaling_strategy,
            "encoding_strategy": self.encoding_strategy
        }

        return X_train_processed, X_test_processed, y_train, y_test, metadata

    def _transform_features(self, X: pd.DataFrame, is_train: bool = False) -> np.ndarray:
        X_copy = X.copy()

        # Outlier clipping
        if self.outlier_treatment == "cap":
            for col, bounds in self.iqr_bounds.items():
                if col in X_copy.columns:
                    X_copy[col] = X_copy[col].clip(lower=bounds[0], upper=bounds[1])

        # Numerical Imputation & Scaling
        X_num_scaled = np.empty((len(X_copy), 0))
        if len(self.numeric_features) > 0:
            if is_train:
                strategy = "median" if self.imputation_strategy_num == "median" else "mean"
                self.num_imputer = SimpleImputer(strategy=strategy)
                X_num_imp = self.num_imputer.fit_transform(X_copy[self.numeric_features])

                if self.scaling_strategy == "standard":
                    self.scaler = StandardScaler()
                elif self.scaling_strategy == "minmax":
                    self.scaler = MinMaxScaler()
                elif self.scaling_strategy == "robust":
                    self.scaler = RobustScaler()
                else:
                    self.scaler = None

                X_num_scaled = self.scaler.fit_transform(X_num_imp) if self.scaler else X_num_imp
            else:
                X_num_imp = self.num_imputer.transform(X_copy[self.numeric_features])
                X_num_scaled = self.scaler.transform(X_num_imp) if self.scaler else X_num_imp

        # Categorical Imputation & Encoding
        X_cat_encoded = np.empty((len(X_copy), 0))
        if len(self.categorical_features) > 0:
            if is_train:
                self.cat_imputer = SimpleImputer(strategy="most_frequent")
                X_cat_imp = self.cat_imputer.fit_transform(X_copy[self.categorical_features].astype(str))

                if self.encoding_strategy == "onehot":
                    self.encoder = OneHotEncoder(sparse_output=False, handle_unknown="ignore")
                    X_cat_encoded = self.encoder.fit_transform(X_cat_imp)
                else: # Label encoding fallback
                    self.encoder = {}
                    encoded_cols = []
                    for i, col in enumerate(self.categorical_features):
                        le = LabelEncoder()
                        encoded_cols.append(le.fit_transform(X_cat_imp[:, i]).reshape(-1, 1))
                        self.encoder[col] = le
                    X_cat_encoded = np.hstack(encoded_cols)
            else:
                X_cat_imp = self.cat_imputer.transform(X_copy[self.categorical_features].astype(str))
                if self.encoding_strategy == "onehot":
                    X_cat_encoded = self.encoder.transform(X_cat_imp)
                else:
                    encoded_cols = []
                    for i, col in enumerate(self.categorical_features):
                        le = self.encoder[col]
                        col_data = X_cat_imp[:, i]
                        # Handle unseen classes
                        known_classes = set(le.classes_)
                        col_data_safe = [val if val in known_classes else le.classes_[0] for val in col_data]
                        encoded_cols.append(le.transform(col_data_safe).reshape(-1, 1))
                    X_cat_encoded = np.hstack(encoded_cols)

        # Combine
        if X_num_scaled.shape[1] > 0 and X_cat_encoded.shape[1] > 0:
            X_final = np.hstack([X_num_scaled, X_cat_encoded])
        elif X_num_scaled.shape[1] > 0:
            X_final = X_num_scaled
        else:
            X_final = X_cat_encoded

        # Generate feature names out
        if is_train:
            names = list(self.numeric_features)
            if len(self.categorical_features) > 0:
                if self.encoding_strategy == "onehot" and hasattr(self.encoder, "get_feature_names_out"):
                    names.extend(self.encoder.get_feature_names_out(self.categorical_features).tolist())
                else:
                    names.extend(self.categorical_features)
            self.feature_names_out = names

        return X_final

    def transform_single(self, record_dict: Dict[str, Any]) -> np.ndarray:
        """Transforms a single inference dictionary into model-ready numpy array."""
        df_single = pd.DataFrame([record_dict])
        for col in self.feature_names_in:
            if col not in df_single.columns:
                df_single[col] = np.nan
        df_ordered = df_single[self.feature_names_in]
        return self._transform_features(df_ordered, is_train=False)

    def _oversample_minority(self, X: np.ndarray, y: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Simple random oversampling of minority class."""
        classes, counts = np.unique(y, return_counts=True)
        minority_class = classes[np.argmin(counts)]
        majority_count = np.max(counts)
        minority_indices = np.where(y == minority_class)[0]

        needed = majority_count - len(minority_indices)
        if needed > 0 and len(minority_indices) > 0:
            oversampled_idx = np.random.choice(minority_indices, size=needed, replace=True)
            X_res = np.vstack([X, X[oversampled_idx]])
            y_res = np.concatenate([y, y[oversampled_idx]])
            return X_res, y_res
        return X, y

    def save(self, filepath: str):
        joblib.dump(self, filepath)

    @classmethod
    def load(cls, filepath: str) -> "PreprocessingPipeline":
        return joblib.load(filepath)
