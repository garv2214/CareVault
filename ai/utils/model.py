import os
import pickle
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

def build_and_train_model(X, y):
    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Initialize model
    model = LogisticRegression()

    # Train
    model.fit(X_train, y_train)

    print("Model training complete!")
    print(f"Training accuracy: {model.score(X_train, y_train):.4f}")
    print(f"Testing accuracy: {model.score(X_test, y_test):.4f}")

    return model

def save_model_artifacts(model, scaler, model_path="models/risk_model.pkl", scaler_path="models/scaler.pkl"):
    # Ensure directory exists
    os.makedirs(os.path.dirname(model_path), exist_ok=True)

    # Save model
    with open(model_path, "wb") as f:
        pickle.dump(model, f)

    # Save scaler
    with open(scaler_path, "wb") as f:
        pickle.dump(scaler, f)

    print(f"Model saved to {model_path}")
    print(f"Scaler saved to {scaler_path}")
