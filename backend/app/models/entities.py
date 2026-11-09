import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=True)
    role = Column(String(50), default="user", nullable=False) # admin, data_scientist, user
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    datasets = relationship("DatasetRecord", back_populates="owner")
    predictions = relationship("PredictionRecord", back_populates="user")
    activities = relationship("ActivityLog", back_populates="user")

class DatasetRecord(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    filepath = Column(String(500), nullable=False)
    row_count = Column(Integer, default=0)
    col_count = Column(Integer, default=0)
    file_size_kb = Column(Float, default=0.0)
    task_type = Column(String(50), default="classification")
    quality_score = Column(Float, default=100.0)
    target_column = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="datasets")

class ExperimentRecord(Base):
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    model_name = Column(String(150), nullable=False)
    algorithm = Column(String(100), nullable=False)
    task_type = Column(String(50), nullable=False)
    status = Column(String(50), default="completed") # pending, training, completed, failed
    metrics_json = Column(Text, nullable=True) # stringified JSON
    train_time_seconds = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class DeployedModelRecord(Base):
    __tablename__ = "deployed_models"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(String(255), unique=True, index=True, nullable=False)
    model_name = Column(String(150), nullable=False)
    version = Column(String(50), default="1.0.0")
    stage = Column(String(50), default="production") # production, staging, archived
    algorithm = Column(String(100), nullable=False)
    task_type = Column(String(50), nullable=False)
    metrics_json = Column(Text, nullable=True)
    features_json = Column(Text, nullable=True)
    inference_count = Column(Integer, default=0)
    last_evaluated_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    predictions = relationship("PredictionRecord", back_populates="deployed_model")

class PredictionRecord(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(String(255), ForeignKey("deployed_models.model_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    input_features_json = Column(Text, nullable=False)
    prediction_result = Column(String(255), nullable=False)
    confidence = Column(Float, nullable=True)
    uncertainty_json = Column(Text, nullable=True)
    latency_ms = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="predictions")
    deployed_model = relationship("DeployedModelRecord", back_populates="predictions")

class MonitoringLog(Base):
    __tablename__ = "monitoring_logs"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(String(255), nullable=False, index=True)
    drift_detected = Column(Boolean, default=False)
    drift_share_pct = Column(Float, default=0.0)
    alert_level = Column(String(50), default="GREEN") # GREEN, YELLOW, RED
    details_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=True)
    entity_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="activities")
