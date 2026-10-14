import json
import os
import sys

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from src.exception import CustomException
from src.logger import logging
from src.utils import save_object

FEATURES = [
    "gender",
    "race_ethnicity",
    "parental_level_of_education",
    "lunch",
    "test_preparation_course",
]
TARGETS = ["math_score", "reading_score", "writing_score"]
MODELS_PATH = os.path.join("artifacts", "profile_models.pkl")
METRICS_PATH = os.path.join("artifacts", "profile_metrics.json")


def train_profile_models():
    try:
        df = pd.read_csv(os.path.join("notebook", "data", "stud.csv"))
        train_df, test_df = train_test_split(df, test_size=0.2, random_state=42)

        models, metrics = {}, {}
        for target in TARGETS:
            model = Pipeline([
                ("prep", ColumnTransformer([
                    ("ohe", OneHotEncoder(handle_unknown="ignore"), FEATURES)
                ])),
                ("reg", Ridge(alpha=1.0)),
            ])
            model.fit(train_df[FEATURES], train_df[target])
            pred = model.predict(test_df[FEATURES])

            metrics[target] = {
                "r2": float(r2_score(test_df[target], pred)),
                "mae": float(mean_absolute_error(test_df[target], pred)),
                "rmse": float(np.sqrt(mean_squared_error(test_df[target], pred))),
            }
            models[target] = model
            logging.info(f"{target}: {metrics[target]}")
            print(target, metrics[target])

        save_object(MODELS_PATH, models)
        with open(METRICS_PATH, "w") as f:
            json.dump(metrics, f, indent=2)
        print("Saved:", MODELS_PATH, "and", METRICS_PATH)

    except Exception as e:
        raise CustomException(e, sys)


if __name__ == "__main__":
    train_profile_models()