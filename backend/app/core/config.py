import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "PredictAI Pro"
    ENVIRONMENT: str = "production"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./predictai.db")
    NEON_REST_URL: str = os.getenv("NEON_REST_URL", "")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "predictai-pro-super-secret-production-key-2026-auth-token-level3-m2")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # Admin defaults
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@predictai.pro")
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "PredictAIAdmin2026!")
    
    # Cloud Deployment Keys
    RENDER_API_KEY: str = os.getenv("RENDER_API_KEY", "")
    VERCEL_TOKEN: str = os.getenv("VERCEL_TOKEN", "")
    KAGGLE_KEY: str = os.getenv("KAGGLE_KEY", "")
    
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
