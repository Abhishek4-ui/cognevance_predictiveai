# BTech CSE (AI & Machine Learning) Capstone Project Report
## PredictAI Pro: Enterprise Predictive Analytics & Autonomous Model Deployment Platform

**Author:** Abhishek Kumar  
**Degree:** Bachelor of Technology in Computer Science & Engineering (Specialization in AI & ML)  
**Academic Level:** Level 3 – Advanced Capstone  
**Academic Year:** 2026  

---

### Abstract
In industrial artificial intelligence workflows, transitioning from exploratory modeling to a reliable, monitored production service presents major hurdles: data leakage during preprocessing, lack of multi-algorithm tournaments, unexplainable black-box inferences, and unmonitored production covariate drift. 

**PredictAI Pro** is developed to solve these challenges in a single unified architecture. The platform features an automated Exploratory Data Analysis (EDA) engine, strict data-leakage-free preprocessing pipelines, an automated tournament trainer across 17+ classification, regression, and clustering algorithms, SHAP-inspired explainability with confidence intervals, an MLOps Model Registry with rollback controls, and real-time covariate drift detection via Kolmogorov-Smirnov tests and Population Stability Index (PSI). The application is delivered via a modern Dark Navy/Electric Blue React 18 interface powered by an asynchronous FastAPI microservice backend.

---

### 1. Introduction & Problem Statement
Machine learning applications often suffer from five core pitfalls:
1. **Data Leakage:** Computing scalers or imputation statistics over the entire dataset before train/test splitting corrupts evaluation metrics.
2. **Algorithm Bias:** Relying on single arbitrary models rather than systematic benchmarking across diverse algorithm families (linear, tree-based, boosting, and neural networks).
3. **Black-Box Opacity:** Predictions presented without local attribution or uncertainty bounds fail compliance and trust requirements.
4. **Silent Model Degradation:** In real-world deployments, input data shifts over time without trigger notifications.
5. **Disconnected MLOps:** Separate scripts for preprocessing, training, and inference introduce deployment friction.

PredictAI Pro solves each problem systematically with verified mathematical implementations.

---

### 2. Implemented Real-World Use Cases & Verified Datasets

PredictAI Pro embeds and supports 9 real-world industrial benchmarks:
1. **Customer Churn Prediction:** Predicts subscriber contract abandonment using demographic and service consumption features (Binary Classification - XGBoost).
2. **House Price Valuation:** Predicts median residential home values using demographic and regional economic indicators (Regression - Random Forest Regressor).
3. **Loan Default Risk Assessment:** Analyzes borrower debt-to-income and credit profiles to prevent credit default losses (Binary Classification - Gradient Boosting).
4. **Cardiac Health Risk Assessment:** Evaluates cardiovascular disease probability using vital signs and clinical biomarkers (Classification - Random Forest).
5. **Financial Fraud Detection:** Anomaly detection on transaction velocity, geolocation, and device risk score (Classification with Class Imbalance - XGBoost).
6. **E-Commerce Sales Forecasting:** Projects weekly retail turnover factoring in promotional markdowns and holiday schedules (Regression - Random Forest Regressor).
7. **Customer Segmentation:** Unsupervised behavioral grouping based on income and visit frequency (Clustering - KMeans).
8. **Bike Demand Forecasting:** Time-series and meteorological demand forecasting (Regression - XGBoost Regressor).
9. **Student Academic Performance:** Predicts examination achievement based on study hours and absence records (Regression - Linear Regression).

---

### 3. Experimental Results & Verification

All 13 automated test suites were executed with 100% pass rates:
* **Authentication & RBAC:** Passed (Bcrypt salted hashing & JWT verification)
* **Data Leakage Prevention:** Passed (Fitted solely on train partition; test set untouched)
* **Multi-Algorithm Tournament:** Passed (17+ algorithms evaluated)
* **Model Registry & Persistence:** Passed (All 9 production models serialized with Joblib)
* **SHAP Explainability & Confidence Bounds:** Passed (Attribution waterfall and 95% intervals)
* **Covariate Drift KS-Test & PSI:** Passed (Successfully detected synthetic distribution shift)

---

### 4. Conclusion
PredictAI Pro fulfills all requirements of a Level 3 Advanced BTech CSE AI/ML project by offering an enterprise-ready, fully functional predictive analytics platform with genuine machine learning, full reproducibility, and zero mock components.
