import os
import numpy as np
import joblib
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import Pipeline
import logging

logger = logging.getLogger("ml_model")

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "disease_model.joblib")

DISEASES = ["Oncology", "Cardiology", "Infectious Diseases", "Neurology", "Pulmonology"]

def train_and_save_models():
    logger.info("Training scikit-learn models for disease trends forecasting...")
    models = {}
    
    # Historical years (2018 - 2025)
    years = np.array([2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]).reshape(-1, 1)
    
    # Historical counts for each disease
    historical_data = {
        "Oncology": np.array([80, 88, 95, 102, 108, 112, 115, 118]),
        "Cardiology": np.array([150, 160, 168, 175, 182, 188, 192, 196]),
        "Infectious Diseases": np.array([120, 110, 250, 180, 140, 120, 105, 95]), # COVID-19 pandemic spike
        "Neurology": np.array([40, 43, 46, 50, 53, 56, 60, 64]),
        "Pulmonology": np.array([70, 72, 98, 85, 78, 75, 73, 72])
    }
    
    for disease, counts in historical_data.items():
        # Polynomial regression model to capture curved trendlines (like pandemic spikes or slowing growth)
        model = Pipeline([
            ('poly', PolynomialFeatures(degree=2)),
            ('linear', LinearRegression())
        ])
        model.fit(years, counts)
        models[disease] = model
        
    joblib.dump(models, MODEL_PATH)
    logger.info(f"Models successfully serialized and saved to {MODEL_PATH}")

def load_models():
    if not os.path.exists(MODEL_PATH):
        train_and_save_models()
    return joblib.load(MODEL_PATH)

def predict_trend(year: int, disease: str) -> float:
    try:
        models = load_models()
        if disease not in models:
            return float(100 + (year - 2026) * 10)
        
        model = models[disease]
        prediction = model.predict(np.array([[year]]))[0]
        # Format/sanitize to make sure it is a non-negative rounded count
        return float(round(max(0.0, prediction), 1))
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        return float(100 + (year - 2026) * 10)
