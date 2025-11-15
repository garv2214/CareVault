# ai/utils/preprocessing.py
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

FEATURES = ["age", "systolic_bp", "diastolic_bp", "heart_rate", "blood_sugar"]

def load_synthetic(path):
    df = pd.read_csv(path)
    return df

def prepare_X_y(df):
    FEATURES = ['age', 'heart_rate', 'systolic_bp', 'diastolic_bp', 'blood_sugar']
    X = df[FEATURES].values
    
    # convert risk to numeric
    df['risk'] = df['risk'].map({'low': 0, 'medium': 1, 'high': 2})
    
    y = df['risk'].values
    return X, y


def split_and_scale(X, y, test_size=0.2, random_state=42):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)
    return X_train_s, X_test_s, y_train, y_test, scaler
