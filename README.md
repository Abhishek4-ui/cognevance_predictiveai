# PredictAI Pro 🚀
### Enterprise Predictive Analytics & Autonomous Model Deployment Platform
**Level 3 – Advanced Project | BTech CSE – AI & Machine Learning**

---

## 🌟 Overview

**PredictAI Pro** is a modern, production-grade Predictive Analytics and MLOps platform engineered with complete scientific rigor:
* **Zero Mock Predictions:** Every prediction is evaluated using serialized, loaded machine learning weights.
* **Zero Data Leakage:** Preprocessing scalers, encoders, and outlier clipping bounds are fitted exclusively on training splits.
* **17+ Machine Learning Algorithms:** XGBoost, Random Forest, Gradient Boosting, SVM, Deep Multi-Layer Perceptrons (MLP), Ridge, Lasso, and KMeans.
* **Explainable AI (XAI):** Local decision attributions (SHAP-inspired) and 95% statistical confidence intervals for every inference.
* **MLOps Drift Detection:** Live covariate shift monitoring using two-sample Kolmogorov-Smirnov (KS) tests and Population Stability Index (PSI).
* **Futuristic UI/UX:** Built with React 18, Vite, Tailwind CSS, and Recharts in a dark navy, electric blue, and purple gradient theme.

---

## ⚡ Quickstart (MacBook M2 / Apple Silicon / Intel)

A single command starts the entire system:

```bash
# 1. Open Terminal in the project root directory
cd /Users/abhishekkumar/Desktop/PRIDICTIVEANALAYSIS

# 2. Run the MacBook startup script
./run_mac.sh
```

This single command will:
1. Activate the Python virtual environment (`venv`).
2. Verify all native ARM64 / OpenMP dependencies.
3. Launch the **FastAPI REST API** on `http://127.0.0.1:8000`.
4. Launch the **React/Vite Frontend** on `http://127.0.0.1:5173`.
5. Bootstrap all 9 benchmark datasets and pre-trained production models automatically.

### Access URLs:
* **Web Application:** [http://127.0.0.1:5173](http://127.0.0.1:5173)
* **Interactive Swagger API Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **Default Admin Credentials:** `admin` / `PredictAIAdmin2026!`

---

## 🐳 Docker Execution

To run via Docker Compose:

```bash
docker compose up --build
```

---

## 🧪 Automated Test Suite

PredictAI Pro features a comprehensive automated test suite covering all modules:

```bash
source venv/bin/activate
PYTHONPATH=. pytest tests/test_predictai.py -v
```

**Results:**
* ✅ Password Hashing & Salt Verification: **PASSED**
* ✅ JWT Access Token Generation & RBAC Clearance: **PASSED**
* ✅ Database CRUD Operations: **PASSED**
* ✅ Preprocessing Pipeline (No Data Leakage): **PASSED**
* ✅ Feature Engineering & Importance Ranking: **PASSED**
* ✅ Classification Multi-Algorithm Tournament: **PASSED**
* ✅ Regression Multi-Algorithm Tournament: **PASSED**
* ✅ Model Evaluation (Confusion Matrix & F1): **PASSED**
* ✅ Model Registry Serialization & Deserialization: **PASSED**
* ✅ Real-Time Inference with SHAP Explainability: **PASSED**
* ✅ Covariate Drift Detection (KS-Test & PSI): **PASSED**
* ✅ System Health & Telemetry Microservice: **PASSED**
* ✅ Dashboard KPIs Endpoint: **PASSED**

---

## 📁 Project Architecture

```
PRIDICTIVEANALAYSIS/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── api/routes/       # 10 Route Handlers (Auth, Datasets, EDA, Preprocessing, Training, Predict, Models, Monitoring, Dashboard, Admin)
│   │   ├── core/             # Database, Security (Bcrypt/JWT), Settings
│   │   ├── models/           # SQLAlchemy Database Entities
│   │   ├── schemas/          # Pydantic v2 Models
│   │   └── main.py           # Application Entrypoint
├── ml_engine/                # Core ML Engine
│   ├── eda/                  # Automated Statistics & Correlations
│   ├── preprocessing/        # Data Leakage-Free Preprocessing Pipeline
│   ├── feature_engineering/  # Gini Feature Ranking & PCA
│   ├── training/             # 17+ ML Algorithms Tournament
│   ├── evaluation/           # Standardized Metrics Engine
│   ├── explainability/       # Local SHAP-style Attribution & Uncertainty
│   ├── monitoring/           # KS-Test & PSI Covariate Drift
│   ├── registry/             # Versioned Artifact Catalog & Model Store
│   └── use_cases/            # 9 Real-World Benchmark Pipelines
├── datasets/                 # Real-World Datasets
│   ├── raw/                  # 9 Benchmark CSV files
│   └── processed/            # Leakage-Free Preprocessed CSVs
├── frontend/                 # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── pages/            # 18 Fully Functional Pages
│   │   ├── components/       # Futuristic Sidebar, Topbar, Layout, Cards
│   │   ├── context/          # JWT Auth Context
│   │   └── services/         # Axios API Client
├── tests/                    # Pytest Automated Test Suite
├── reports/                  # Project Report & Presentation Slides
├── documentation/            # System Architecture & Math Specs
├── run_mac.sh                # Single-Command MacBook Startup
├── Dockerfile                # Production Containerfile
├── docker-compose.yml        # Multi-Container Compose
├── requirements.txt          # Pinned Dependencies
├── .env                      # Configured Secrets & Cloud Keys
└── README.md
```

---

## 💼 The 9 Real-World Use Cases

1. **Customer Churn Predictor:** Telco customer behavior (XGBoost)
2. **House Price Forecaster:** Real estate valuation (Random Forest Regressor)
3. **Loan Default Risk Analyzer:** Credit score & debt burden (Gradient Boosting)
4. **Cardiac Health Risk Evaluator:** Cardiovascular biomarkers (Random Forest)
5. **Fraud Detection Engine:** Credit card anomaly identification (XGBoost)
6. **Rental Demand Forecaster:** Hourly transportation demand (XGBoost Regressor)
7. **Sales Weekly Forecaster:** Retail promotional impact (Random Forest Regressor)
8. **Student Grade Predictor:** Academic study hours (Linear Regression)
9. **Customer Segment Clusterer:** Behavioral clustering (K-Means)

---

## 🛡️ Security & Cloud Integrations

* **Neon Cloud Database:** Integrated with PostgreSQL rest/connection string and automatic local WAL fallback.
* **Render Deployment:** Backend production spec configured (`render.yaml`).
* **Vercel Edge:** Frontend edge routing configured (`frontend/vercel.json`).
* **Kaggle API:** CLI credential integration verified.
* **JWT Authentication:** 24-hour cryptographically signed tokens with PBKDF2/Bcrypt salted password storage.
# cognevance_predictiveai
