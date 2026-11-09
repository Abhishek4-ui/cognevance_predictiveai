# PredictAI Pro – Presentation Slide Deck
## Level 3 Advanced Predictive Analytics & Autonomous Model Deployment Platform

---

### Slide 1: Title & Overview
* **Project Name:** PredictAI Pro
* **Category:** BTech CSE – AI & Machine Learning Advanced Capstone (Level 3)
* **Lead Engineer:** Abhishek Kumar
* **Core Philosophy:** Real-World Machine Learning with Scientific Rigor, No Mock Predictions, and Zero Data Leakage.

---

### Slide 2: Industry Problem Statement
* Most ML academic projects stop at Jupyter Notebooks.
* In production, models fail due to:
  1. Data leakage during preprocessing.
  2. Inability to explain decisions to non-technical stakeholders.
  3. Covariate distribution shift and silent performance decay.
  4. Manual, error-prone deployment and versioning.

---

### Slide 3: The PredictAI Pro Solution
* **Data Studio:** Automated EDA, missing value imputation, IQR outlier capping, one-hot encoding, and feature importance rankings.
* **Model Tournament:** Trains 17+ competitive algorithms (XGBoost, Random Forest, Deep MLP, Gradient Boosting, SVM, etc.) simultaneously.
* **Explainable AI:** SHAP attribution waterfalls and 95% statistical confidence intervals for every single inference.
* **Production MLOps:** Versioned Model Registry with stage promotion, rollback, and real-time KS-Test / PSI drift monitoring.

---

### Slide 4: 9 Pre-Trained Benchmark Use Cases
1. Customer Churn Prediction (XGBoost)
2. Residential House Price Valuation (Random Forest Regressor)
3. Loan Default Credit Risk Assessment (Gradient Boosting)
4. Cardiac Health Risk Evaluation (Random Forest)
5. Financial Fraud & Anomaly Detection (XGBoost)
6. E-Commerce Sales Forecasting (Random Forest Regressor)
7. Customer Segmentation (K-Means Clustering)
8. Rental Bike Demand Forecasting (XGBoost Regressor)
9. Student Academic Grade Forecasting (Linear Regression)

---

### Slide 5: Technical Stack & Architecture
* **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Recharts (Futuristic Dark Navy / Electric Blue Theme)
* **Backend:** FastAPI, Pydantic v2, SQLAlchemy ORM, Uvicorn, Bcrypt, PyJWT
* **ML Engine:** Scikit-Learn, XGBoost, Scipy, Joblib, Feature-engine, Imbalanced-learn
* **Database:** PostgreSQL (Neon Cloud / REST) with high-performance SQLite WAL fallback
* **DevOps:** Docker, Docker Compose, Render Cloud configuration, Vercel Edge configuration

---

### Slide 6: Verification & Test Results
* 13 Comprehensive Pytest Suites Executed:
  * Authentication & Token Security: **100% Passed**
  * Data Leakage Elimination: **100% Passed**
  * Algorithm Training & Cross-Validation: **100% Passed**
  * Artifact Persistence & Registry Loading: **100% Passed**
  * Drift Detection Accuracy: **100% Passed**

---

### Slide 7: Live Demonstration
* Single command startup: `./run_mac.sh`
* Live Executive Dashboard: `http://localhost:5173`
* Interactive OpenAPI Documentation: `http://localhost:8000/docs`
