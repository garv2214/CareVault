import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
import pickle
import os

# -----------------------------
# 1. Load the Dataset
# -----------------------------
BASE_DIR = os.path.dirname(__file__)   # /ai/
DATA_PATH = os.path.join(BASE_DIR, "data", "medical_dataset.csv")

df = pd.read_csv(DATA_PATH)

print("Data loaded successfully!")
print(df.head())

# -----------------------------
# 2. Convert risk → numeric
# -----------------------------
label_map = {
    "low": 0,
    "medium": 1,
    "high": 2
}

df["risk"] = df["risk"].str.lower().map(label_map)

# Check conversion
print("\nConverted risk values:", df["risk"].unique())

# -----------------------------
# 3. Select features for training
# -----------------------------
required_features = ["age", "heart_rate", "systolic_bp", "diastolic_bp", "blood_sugar"]

missing_cols = [c for c in required_features if c not in df.columns]
if missing_cols:
    raise Exception(f"Missing columns in dataset: {missing_cols}")

X = df[required_features]
y = df["risk"]

# -----------------------------
# 4. Train/Test Split
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -----------------------------
# 5. Normalize the data
# -----------------------------
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# -----------------------------
# 6. Train the Model
# -----------------------------
model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)

model.fit(X_train_scaled, y_train)

print("Model trained successfully!")

# -----------------------------
# 7. Create folder for saving model
# -----------------------------
if not os.path.exists("models"):
    os.makedirs("models")

# -----------------------------
# 8. Save the model + scaler
# -----------------------------
with open("models/risk_model.pkl", "wb") as f:
    pickle.dump(model, f)

with open("models/scaler.pkl", "wb") as f:
    pickle.dump(scaler, f)

print("\nSaved:")
print("models/risk_model.pkl")
print("models/scaler.pkl")
