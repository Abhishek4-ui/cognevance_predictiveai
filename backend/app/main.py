import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.app.core.config import settings
from backend.app.core.database import engine, Base, SessionLocal
from backend.app.core.security import hash_password
from backend.app.models.entities import User
from ml_engine.use_cases.benchmarks import bootstrap_benchmark_models

# Routers
from backend.app.api.routes import (
    auth, datasets, eda, preprocessing, feature_engineering, training,
    predict, models, monitoring, dashboard, admin
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables
    Base.metadata.create_all(bind=engine)

    # Initialize default admin if not exists
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.username == settings.ADMIN_USERNAME).first()
        if not admin_user:
            admin_user = User(
                email=settings.ADMIN_EMAIL,
                username=settings.ADMIN_USERNAME,
                hashed_password=hash_password(settings.ADMIN_PASSWORD),
                full_name="PredictAI Administrator",
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print(f"[Startup] Default Admin created: {settings.ADMIN_USERNAME}")
        else:
            if admin_user.role != "admin":
                admin_user.role = "admin"
                db.commit()
    finally:
        db.close()

    # Bootstrap benchmark datasets and models
    bootstrap_benchmark_models()
    yield

app = FastAPI(
    title="PredictAI Pro API",
    description="Level 3 Advanced Predictive Analytics & MLOps Platform REST API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
if not origins or "*" in origins:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(datasets.router, prefix="/api")
app.include_router(eda.router, prefix="/api")
app.include_router(preprocessing.router, prefix="/api")
app.include_router(feature_engineering.router, prefix="/api")
app.include_router(training.router, prefix="/api")
app.include_router(predict.router, prefix="/api")
app.include_router(models.router, prefix="/api")
app.include_router(monitoring.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

@app.get("/")
def root():
    return {
        "system": "PredictAI Pro",
        "level": "Level 3 - Advanced",
        "status": "OPERATIONAL",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
