import os
import json
import time
from typing import Dict, Any, List, Optional
import joblib

class ModelRegistry:
    """
    MLOps Model Registry & Artifact Store.
    Manages versioning, metadata tracking, stage transitions (staging, production, archived),
    and rollback logic for deployed machine learning models.
    """

    def __init__(self, storage_dir: str = "ml_engine/models"):
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)
        self.registry_file = os.path.join(self.storage_dir, "registry_catalog.json")
        self._ensure_catalog()

    def _ensure_catalog(self):
        if not os.path.exists(self.registry_file):
            with open(self.registry_file, "w") as f:
                json.dump({"models": []}, f, indent=2)

    def _read_catalog(self) -> Dict[str, Any]:
        with open(self.registry_file, "r") as f:
            return json.load(f)

    def _write_catalog(self, catalog: Dict[str, Any]):
        with open(self.registry_file, "w") as f:
            json.dump(catalog, f, indent=2)

    def register_model(
        self,
        model_name: str,
        task_type: str,
        algorithm: str,
        model_object: Any,
        preprocessing_pipeline: Any,
        metrics: Dict[str, Any],
        features: List[str],
        version: str = "1.0.0",
        stage: str = "production"
    ) -> str:
        """Saves model weights, preprocessing pipeline, and registers entry in catalog."""
        model_id = f"{model_name.lower().replace(' ', '_')}_{version}_{int(time.time())}"
        model_path = os.path.join(self.storage_dir, f"{model_id}.joblib")
        pipeline_path = os.path.join(self.storage_dir, f"{model_id}_pipeline.joblib")

        # Save actual binary artifacts
        joblib.dump(model_object, model_path)
        if preprocessing_pipeline:
            joblib.dump(preprocessing_pipeline, pipeline_path)

        catalog = self._read_catalog()
        
        # If new model is set to production, mark older versions of this model name as archived
        if stage == "production":
            for entry in catalog["models"]:
                if entry["model_name"] == model_name and entry["stage"] == "production":
                    entry["stage"] = "archived"

        record = {
            "model_id": model_id,
            "model_name": model_name,
            "version": version,
            "task_type": task_type,
            "algorithm": algorithm,
            "stage": stage,
            "metrics": metrics,
            "features": features,
            "model_path": model_path,
            "pipeline_path": pipeline_path,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "total_inferences": 0
        }

        catalog["models"].append(record)
        self._write_catalog(catalog)
        return model_id

    def list_models(self) -> List[Dict[str, Any]]:
        catalog = self._read_catalog()
        return catalog.get("models", [])

    def get_model_entry(self, model_id: str) -> Optional[Dict[str, Any]]:
        catalog = self._read_catalog()
        for entry in catalog["models"]:
            if entry["model_id"] == model_id:
                return entry
        return None

    def get_production_model(self, model_name: str) -> Optional[Dict[str, Any]]:
        catalog = self._read_catalog()
        for entry in catalog["models"]:
            if entry["model_name"] == model_name and entry["stage"] == "production":
                return entry
        return None

    def load_artifacts(self, model_id: str) -> Tuple[Any, Any]:
        """Loads model object and preprocessing pipeline from disk."""
        entry = self.get_model_entry(model_id)
        if not entry:
            raise FileNotFoundError(f"Model {model_id} not found in registry.")

        model = joblib.load(entry["model_path"])
        pipeline = joblib.load(entry["pipeline_path"]) if os.path.exists(entry["pipeline_path"]) else None
        return model, pipeline

    def update_stage(self, model_id: str, new_stage: str) -> bool:
        catalog = self._read_catalog()
        target = None
        for entry in catalog["models"]:
            if entry["model_id"] == model_id:
                target = entry
                break
        if not target:
            return False

        if new_stage == "production":
            # Demote existing production
            for entry in catalog["models"]:
                if entry["model_name"] == target["model_name"] and entry["stage"] == "production":
                    entry["stage"] = "archived"

        target["stage"] = new_stage
        self._write_catalog(catalog)
        return True
