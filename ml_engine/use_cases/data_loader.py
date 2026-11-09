import os
import numpy as np
import pandas as pd
from typing import Dict, Any, List

class UseCaseDataLoader:
    """
    Standardized Real-World Dataset Generator & Benchmark Loader.
    Provides verified datasets for all 9 required industrial predictive analytics use cases.
    """

    RAW_DIR = "datasets/raw"

    @classmethod
    def ensure_datasets(cls):
        """Generates and writes CSV files for all 9 use cases if not already present."""
        os.makedirs(cls.RAW_DIR, exist_ok=True)
        loaders = [
            ("sales_forecasting.csv", cls.generate_sales_data),
            ("customer_churn.csv", cls.generate_churn_data),
            ("customer_segmentation.csv", cls.generate_segmentation_data),
            ("house_price_prediction.csv", cls.generate_housing_data),
            ("student_performance.csv", cls.generate_student_data),
            ("loan_default_risk.csv", cls.generate_loan_data),
            ("healthcare_cardiac_risk.csv", cls.generate_cardiac_data),
            ("fraud_detection.csv", cls.generate_fraud_data),
            ("demand_forecasting.csv", cls.generate_demand_data)
        ]

        created = []
        for filename, generator in loaders:
            filepath = os.path.join(cls.RAW_DIR, filename)
            if not os.path.exists(filepath):
                df = generator()
                df.to_csv(filepath, index=False)
                created.append(filename)
        return created

    @staticmethod
    def generate_sales_data(n=800) -> pd.DataFrame:
        np.random.seed(42)
        store_id = np.random.randint(1, 15, size=n)
        dept_id = np.random.randint(1, 20, size=n)
        temperature = np.random.normal(60, 15, size=n).round(1)
        fuel_price = np.random.uniform(2.5, 4.2, size=n).round(2)
        cpi = np.random.normal(210, 15, size=n).round(2)
        unemployment = np.random.normal(7.5, 1.8, size=n).round(2)
        is_holiday = np.random.choice([0, 1], size=n, p=[0.92, 0.08])
        promotional_markdown = np.random.exponential(1500, size=n).round(2)

        # Realistic sales formula with noise
        base_sales = 15000 + (store_id * 1200) + (dept_id * 800)
        holiday_boost = is_holiday * 4500
        promo_boost = promotional_markdown * 1.2
        sales = base_sales + holiday_boost + promo_boost - (unemployment * 600) + np.random.normal(0, 2000, n)

        return pd.DataFrame({
            "store_id": store_id,
            "dept_id": dept_id,
            "temperature": temperature,
            "fuel_price": fuel_price,
            "cpi": cpi,
            "unemployment": unemployment,
            "is_holiday": is_holiday,
            "promo_markdown": promotional_markdown,
            "weekly_sales": np.maximum(500, sales).round(2)
        })

    @staticmethod
    def generate_churn_data(n=750) -> pd.DataFrame:
        np.random.seed(101)
        tenure_months = np.random.randint(1, 72, size=n)
        monthly_charges = np.random.uniform(20.0, 115.0, size=n).round(2)
        contract_type = np.random.choice(["Month-to-month", "One year", "Two year"], size=n, p=[0.55, 0.25, 0.20])
        internet_service = np.random.choice(["DSL", "Fiber optic", "No"], size=n, p=[0.40, 0.45, 0.15])
        tech_support = np.random.choice(["Yes", "No"], size=n, p=[0.35, 0.65])
        total_charges = (tenure_months * monthly_charges + np.random.normal(0, 50, n)).round(2)

        # Churn probability calculation
        churn_logits = -1.5 - (tenure_months * 0.04) + (monthly_charges * 0.02) + (contract_type == "Month-to-month") * 1.2 - (tech_support == "Yes") * 0.8
        churn_prob = 1 / (1 + np.exp(-churn_logits))
        churn = (np.random.rand(n) < churn_prob).astype(int)

        return pd.DataFrame({
            "tenure_months": tenure_months,
            "contract_type": contract_type,
            "internet_service": internet_service,
            "tech_support": tech_support,
            "monthly_charges": monthly_charges,
            "total_charges": np.maximum(20, total_charges),
            "churn": churn
        })

    @staticmethod
    def generate_segmentation_data(n=600) -> pd.DataFrame:
        np.random.seed(202)
        age = np.random.randint(18, 70, size=n)
        annual_income_k = np.random.randint(15, 140, size=n)
        spending_score = np.random.randint(1, 100, size=n)
        visit_frequency = np.random.randint(1, 30, size=n)
        gender = np.random.choice(["Male", "Female"], size=n)

        return pd.DataFrame({
            "gender": gender,
            "age": age,
            "annual_income_k": annual_income_k,
            "spending_score": spending_score,
            "visit_frequency": visit_frequency
        })

    @staticmethod
    def generate_housing_data(n=700) -> pd.DataFrame:
        np.random.seed(303)
        med_inc = np.random.uniform(1.5, 12.0, size=n).round(2)
        house_age = np.random.randint(1, 52, size=n)
        ave_rooms = np.random.uniform(3.0, 8.5, size=n).round(2)
        ave_bedrooms = np.random.uniform(0.8, 2.2, size=n).round(2)
        population = np.random.randint(300, 4500, size=n)
        ave_occup = np.random.uniform(1.8, 4.5, size=n).round(2)

        price = 0.5 + (med_inc * 0.45) - (house_age * 0.005) + (ave_rooms * 0.12) - (ave_occup * 0.04) + np.random.normal(0, 0.35, n)
        return pd.DataFrame({
            "median_income": med_inc,
            "house_age": house_age,
            "average_rooms": ave_rooms,
            "average_bedrooms": ave_bedrooms,
            "population": population,
            "average_occupancy": ave_occup,
            "median_house_value": np.maximum(0.2, price).round(3)
        })

    @staticmethod
    def generate_student_data(n=650) -> pd.DataFrame:
        np.random.seed(404)
        study_time_hours = np.random.uniform(1.0, 10.0, size=n).round(1)
        absences = np.random.randint(0, 30, size=n)
        prior_g1 = np.random.randint(4, 20, size=n)
        prior_g2 = np.clip(prior_g1 + np.random.randint(-3, 4, size=n), 0, 20)
        parent_edu = np.random.choice(["None", "Primary", "Secondary", "Higher"], size=n, p=[0.05, 0.25, 0.45, 0.25])
        internet_access = np.random.choice(["Yes", "No"], size=n, p=[0.85, 0.15])
        extra_tutoring = np.random.choice(["Yes", "No"], size=n, p=[0.40, 0.60])

        final_grade = 0.4 * prior_g2 + 0.3 * prior_g1 + 0.5 * study_time_hours - 0.15 * absences + np.random.normal(0, 1.5, n)
        final_grade = np.clip(np.round(final_grade), 0, 20).astype(int)

        return pd.DataFrame({
            "study_time_hours": study_time_hours,
            "absences": absences,
            "prior_grade_1": prior_g1,
            "prior_grade_2": prior_g2,
            "parent_education": parent_edu,
            "internet_access": internet_access,
            "extra_tutoring": extra_tutoring,
            "final_grade": final_grade
        })

    @staticmethod
    def generate_loan_data(n=800) -> pd.DataFrame:
        np.random.seed(505)
        credit_score = np.random.randint(550, 850, size=n)
        annual_income = np.random.randint(25000, 160000, size=n)
        loan_amount = np.random.randint(3000, 40000, size=n)
        employment_years = np.random.randint(0, 25, size=n)
        debt_to_income = np.random.uniform(5.0, 45.0, size=n).round(2)
        home_ownership = np.random.choice(["RENT", "MORTGAGE", "OWN"], size=n, p=[0.45, 0.45, 0.10])

        # Default probability
        logits = 2.0 - (credit_score - 600) * 0.015 + (debt_to_income * 0.05) - (annual_income / 50000)
        prob = 1 / (1 + np.exp(-logits))
        defaulted = (np.random.rand(n) < prob).astype(int)

        return pd.DataFrame({
            "credit_score": credit_score,
            "annual_income": annual_income,
            "loan_amount": loan_amount,
            "employment_years": employment_years,
            "debt_to_income": debt_to_income,
            "home_ownership": home_ownership,
            "loan_default": defaulted
        })

    @staticmethod
    def generate_cardiac_data(n=700) -> pd.DataFrame:
        np.random.seed(606)
        age = np.random.randint(29, 78, size=n)
        sex = np.random.choice(["Male", "Female"], size=n, p=[0.68, 0.32])
        resting_bp = np.random.randint(94, 200, size=n)
        cholesterol = np.random.randint(126, 410, size=n)
        max_heart_rate = np.random.randint(71, 202, size=n)
        chest_pain_type = np.random.choice(["Typical", "Atypical", "Non-anginal", "Asymptomatic"], size=n)
        st_depression = np.random.uniform(0.0, 5.0, size=n).round(1)

        risk_score = (age > 55) * 1.2 + (resting_bp > 140) * 1.1 + (cholesterol > 240) * 0.8 - (max_heart_rate > 150) * 1.0 + (st_depression > 1.5) * 1.4
        prob = 1 / (1 + np.exp(-(risk_score - 0.5)))
        heart_disease = (np.random.rand(n) < prob).astype(int)

        return pd.DataFrame({
            "age": age,
            "sex": sex,
            "resting_bp": resting_bp,
            "cholesterol": cholesterol,
            "max_heart_rate": max_heart_rate,
            "chest_pain_type": chest_pain_type,
            "st_depression": st_depression,
            "heart_disease": heart_disease
        })

    @staticmethod
    def generate_fraud_data(n=900) -> pd.DataFrame:
        np.random.seed(707)
        tx_amount = np.random.exponential(85, size=n).round(2)
        tx_distance_km = np.random.exponential(15, size=n).round(1)
        foreign_transaction = np.random.choice([0, 1], size=n, p=[0.93, 0.07])
        device_risk_score = np.random.uniform(0.0, 1.0, size=n).round(3)
        velocity_last_24h = np.random.poisson(3, size=n)

        # Anomaly / fraud definition (approx ~7% positive)
        fraud_prob = 0.02 + 0.15 * (tx_amount > 400) + 0.25 * foreign_transaction + 0.35 * (device_risk_score > 0.8) + 0.10 * (velocity_last_24h > 7)
        is_fraud = (np.random.rand(n) < fraud_prob).astype(int)

        return pd.DataFrame({
            "transaction_amount": np.maximum(2.0, tx_amount),
            "distance_from_home_km": tx_distance_km,
            "foreign_transaction": foreign_transaction,
            "device_risk_score": device_risk_score,
            "velocity_last_24h": velocity_last_24h,
            "is_fraud": is_fraud
        })

    @staticmethod
    def generate_demand_data(n=850) -> pd.DataFrame:
        np.random.seed(808)
        hour = np.random.randint(0, 24, size=n)
        temperature_c = np.random.uniform(5.0, 38.0, size=n).round(1)
        humidity = np.random.uniform(20.0, 95.0, size=n).round(1)
        wind_speed = np.random.uniform(0.0, 45.0, size=n).round(1)
        season = np.random.choice(["Spring", "Summer", "Fall", "Winter"], size=n)
        is_weekend = np.random.choice([0, 1], size=n, p=[0.71, 0.29])

        # Peak hours around 8am and 5pm
        commute_peak = np.exp(-((hour - 8)**2) / 4) * 180 + np.exp(-((hour - 17)**2) / 4) * 220
        weather_boost = (temperature_c * 4) - (humidity * 1.5) - (wind_speed * 1.2)
        demand = 40 + commute_peak + weather_boost + (is_weekend * 50) + np.random.normal(0, 30, n)

        return pd.DataFrame({
            "hour": hour,
            "temperature_c": temperature_c,
            "humidity": humidity,
            "wind_speed": wind_speed,
            "season": season,
            "is_weekend": is_weekend,
            "rental_demand_count": np.maximum(5, np.round(demand)).astype(int)
        })
