"""
Machine Learning Training Pipeline for Resource Sizing Predictor
Trains a Random Forest Regressor surrogate model using scikit-learn.
"""
import os
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error, r2_score

from .dataset import generate_sizing_dataset

def train_model():
    print("[MLOps] Generating labeled training corpus (5,000 synthetic records)...")
    data = generate_sizing_dataset(num_samples=5000)

    X = data[['workload_type', 'environment', 'expected_rps', 'p99_latency_target_ms', 'availability_sla']]
    y = data['optimal_vcpu']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), ['workload_type', 'environment'])
        ],
        remainder='passthrough'
    )

    pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42))
    ])

    print("[MLOps] Fitting Random Forest Regressor...")
    pipeline.fit(X_train, y_train)

    predictions = pipeline.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)

    print(f"[MLOps Evaluation] Mean Squared Error: {mse:.4f}")
    print(f"[MLOps Evaluation] R² Score: {r2:.4f}")

    os.makedirs("ml/artifacts", exist_ok=True)
    model_path = "ml/artifacts/recommender_rf_v1.joblib"
    joblib.dump(pipeline, model_path)
    print(f"[MLOps Artifact] Model serialized to {model_path}")

    return pipeline, mse, r2

if __name__ == "__main__":
    train_model()
