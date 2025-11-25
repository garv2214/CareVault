import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder, MultiLabelBinarizer
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

DATA_PATH = "health_data.csv"

print("Loading dataset...")
df = pd.read_csv(DATA_PATH)
print(f"Total rows loaded: {len(df)}")

# ---------------------------
# CLEAN & PREPROCESS
# ---------------------------

# Convert symptoms column (string) → list
df["symptoms"] = df["symptoms"].apply(lambda x: [s.strip() for s in x.split(",")])

# Multi-hot encode symptoms
mlb = MultiLabelBinarizer()
symptom_features = mlb.fit_transform(df["symptoms"])
symptom_df = pd.DataFrame(symptom_features, columns=mlb.classes_)

# Encode diagnosis
diagnosis_encoder = LabelEncoder()
df["diagnosis_encoded"] = diagnosis_encoder.fit_transform(df["diagnosis"])

# Encode risk
risk_encoder = LabelEncoder()
df["risk_encoded"] = risk_encoder.fit_transform(df["risk"])

# Save encoders
os.makedirs("models", exist_ok=True)
joblib.dump(mlb, "models/symptom_encoder.pkl")
joblib.dump(diagnosis_encoder, "models/diagnosis_encoder.pkl")
joblib.dump(risk_encoder, "models/risk_encoder.pkl")

print("Encoders saved!")

# ---------------------------
# BUILD FEATURE SET
# ---------------------------

numeric_features = df[[
    "age",
    "systolic_bp",
    "diastolic_bp",
    "heart_rate",
    "temperature",
    "blood_sugar",
    "diagnosis_encoded"
]]

full_X = pd.concat([numeric_features, symptom_df], axis=1)
y = df["risk_encoded"]

# Scale numeric features only
scaler = StandardScaler()
numeric_scaled = scaler.fit_transform(numeric_features)

# Replace original numeric with scaled version
full_X_scaled = np.hstack([numeric_scaled, symptom_df.values])

# Save scaler
joblib.dump(scaler, "models/scaler.pkl")

# ---------------------------
# TRAIN MODEL
# ---------------------------

model = RandomForestClassifier(n_estimators=300, random_state=42)
model.fit(full_X_scaled, y)

joblib.dump(model, "models/risk_model.pkl")

print("\nMODEL TRAINED SUCCESSFULLY!")
print("Saved:")
print("models/risk_model.pkl")
print("models/scaler.pkl")
print("models/symptom_encoder.pkl")
print("models/diagnosis_encoder.pkl")
print("models/risk_encoder.pkl")
