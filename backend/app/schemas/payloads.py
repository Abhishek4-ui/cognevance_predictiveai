from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None
    role: Optional[str] = "user"

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class DatasetInfo(BaseModel):
    id: int
    filename: str
    filepath: str
    row_count: int
    col_count: int
    file_size_kb: float
    task_type: str
    quality_score: float
    target_column: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PreprocessRequest(BaseModel):
    dataset_id: Optional[int] = None
    filename: Optional[str] = None
    target_column: Optional[str] = None
    scaling_strategy: str = "standard"
    encoding_strategy: str = "onehot"
    outlier_treatment: str = "cap"
    handle_imbalance: bool = False
    test_size: float = 0.2

class TrainRequest(BaseModel):
    dataset_id: Optional[int] = None
    filename: Optional[str] = None
    target_column: Optional[str] = None
    task_type: Optional[str] = "classification"
    selected_models: Optional[List[str]] = None
    scaling_strategy: Optional[str] = "standard"
    encoding_strategy: Optional[str] = "onehot"
    outlier_treatment: Optional[str] = "cap"
    handle_imbalance: Optional[bool] = False

class PredictRequest(BaseModel):
    model_id: str
    features: Dict[str, Any]

class BatchPredictRequest(BaseModel):
    model_id: str
    records: List[Dict[str, Any]]

class ModelStageUpdate(BaseModel):
    stage: str # production, staging, archived

class DriftCheckRequest(BaseModel):
    model_id: str
    current_data_filename: Optional[str] = None
    sample_size: Optional[int] = 200
