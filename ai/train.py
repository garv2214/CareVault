from utils.data import load_data
from utils.preprocessing import prepare_X_y, get_scaler
from utils.model import build_and_train_model, save_model_artifacts

def train_and_save():
    df = load_data()

    X, y = prepare_X_y(df)

    scaler = get_scaler(X)
    X_scaled = scaler.transform(X)

    model = build_and_train_model(X_scaled, y)

    save_model_artifacts(model, scaler)

if __name__ == "__main__":
    train_and_save()
