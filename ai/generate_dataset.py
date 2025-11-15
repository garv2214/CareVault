import pandas as pd
import numpy as np

# 200-row balanced synthetic dataset

rows = 200

np.random.seed(42)

age = np.random.randint(20, 80, rows)
heart_rate = np.random.randint(60, 120, rows)
systolic_bp = np.random.randint(100, 180, rows)
diastolic_bp = np.random.randint(60, 110, rows)
blood_sugar = np.random.randint(70, 250, rows)

# Balanced target column (risk)
risk = np.random.choice(["low", "medium", "high"], rows, p=[0.33, 0.34, 0.33])

df = pd.DataFrame({
    "age": age,
    "heart_rate": heart_rate,
    "systolic_bp": systolic_bp,
    "diastolic_bp": diastolic_bp,
    "blood_sugar": blood_sugar,
    "risk": risk
})

df.to_csv("data/medical_dataset.csv", index=False)

print("Dataset generated successfully with 200 rows!")
