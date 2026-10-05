import json
import os

import numpy as np
import pandas as pd
from flask import Flask, jsonify, render_template, request

from src.pipeline.predict_pipeline import CustomData, PredictPipeline
from src.utils import load_object

app = Flask(__name__)
application = app

REF = pd.read_csv(os.path.join("notebook", "data", "stud.csv"))
REF["avg_all"] = REF[["math_score", "reading_score", "writing_score"]].mean(axis=1)

TYPICAL_ERROR = 5.4   # RMSE of the maths model (from your notebook)
PASS_MARK = 40
SUBJECTS = ["math", "reading", "writing"]

ALLOWED = {
    "gender": {"male", "female"},
    "race_ethnicity": {"group A", "group B", "group C", "group D", "group E"},
    "parental_level_of_education": {
        "associate's degree", "bachelor's degree", "high school",
        "master's degree", "some college", "some high school",
    },
    "lunch": {"standard", "free/reduced"},
    "test_preparation_course": {"none", "completed"},
}

_profile_cache = {}


def parse_input(src, with_scores=True):
    data = {}
    for key, allowed in ALLOWED.items():
        value = src.get(key)
        if value not in allowed:
            raise ValueError(f"Invalid or missing value for '{key}'.")
        data[key] = value

    if with_scores:
        for key in ("reading_score", "writing_score"):
            try:
                value = float(src.get(key))
            except (TypeError, ValueError):
                raise ValueError(f"'{key}' must be a number between 0 and 100.")
            if not 0 <= value <= 100:
                raise ValueError(f"'{key}' must be between 0 and 100.")
            data[key] = value
    return data


def predict_math(data):
    frame = CustomData(**data).get_data_as_data_frame()
    score = float(PredictPipeline().predict(frame)[0])
    return min(100.0, max(0.0, score))


def grade_for(score):
    if score >= 90:
        return "A+", "Outstanding performance"
    if score >= 80:
        return "A", "Excellent"
    if score >= 70:
        return "B", "Good"
    if score >= 60:
        return "C", "Satisfactory"
    if score >= 50:
        return "D", "Needs improvement"
    return "F", "At risk - extra support recommended"


def subject_stats(name, score, predicted=False):
    col = f"{name}_score"
    grade, _ = grade_for(score)
    return {
        "name": name.title(),
        "score": round(float(score), 1),
        "grade": grade,
        "avg": round(float(REF[col].mean()), 1),
        "percentile": round(float((REF[col] < score).mean() * 100)),
        "passed": bool(score >= PASS_MARK),
        "predicted": predicted,
    }


def build_result(data):
    """Maths prediction + tips."""
    score = predict_math(data)
    grade, remark = grade_for(score)
    avg = float(REF["math_score"].mean())
    percentile = float((REF["math_score"] < score).mean() * 100)

    tips = []
    if data["test_preparation_course"] == "none":
        gain = predict_math({**data, "test_preparation_course": "completed"}) - score
        if gain > 0.5:
            tips.append(f"Completing the test-preparation course could add about +{gain:.1f} points.")

    boost = 5
    boosted = {
        **data,
        "reading_score": min(100, data["reading_score"] + boost),
        "writing_score": min(100, data["writing_score"] + boost),
    }
    gain = predict_math(boosted) - score
    if gain > 0.5:
        tips.append(f"Improving reading and writing by {boost} points each could lift maths by about +{gain:.1f}.")

    if score < 50:
        tips.append("Predicted score is below 50 - regular maths practice is strongly recommended.")
    if not tips:
        tips.append("Great profile! Keep up the current study habits.")

    return {
        "score": round(score, 1),
        "grade": grade,
        "remark": remark,
        "percentile": round(percentile),
        "class_avg": round(avg, 1),
        "diff": f"{score - avg:+.1f}",
        "low": round(max(0, score - TYPICAL_ERROR), 1),
        "high": round(min(100, score + TYPICAL_ERROR), 1),
        "tips": tips,
    }


def build_report(data):
    """Full multi-subject report (maths predicted, reading/writing as entered)."""
    result = build_result(data)
    scores = {
        "math": result["score"],
        "reading": data["reading_score"],
        "writing": data["writing_score"],
    }
    subjects = [subject_stats(k, v, predicted=(k == "math")) for k, v in scores.items()]
    average = sum(scores.values()) / 3
    overall_grade, overall_remark = grade_for(average)
    overall_pct = float((REF["avg_all"] < average).mean() * 100)

    gaps = {s["name"]: s["score"] - s["avg"] for s in subjects}
    result.update({
        "subjects": subjects,
        "total": round(sum(scores.values()), 1),
        "average": round(average, 1),
        "overall_grade": overall_grade,
        "overall_remark": overall_remark,
        "top_pct": max(1, 100 - round(overall_pct)),
        "strongest": max(gaps, key=gaps.get),
        "weakest": min(gaps, key=gaps.get),
        "all_passed": all(s["passed"] for s in subjects),
    })
    return result


def load_profile_models():
    if not _profile_cache:
        _profile_cache["models"] = load_object(os.path.join("artifacts", "profile_models.pkl"))
        with open(os.path.join("artifacts", "profile_metrics.json")) as f:
            _profile_cache["metrics"] = json.load(f)
    return _profile_cache["models"], _profile_cache["metrics"]


def build_estimate(data):
    """Estimate all three scores from background only."""
    models, metrics = load_profile_models()
    frame = pd.DataFrame([data])

    rows, preds, r2s = [], [], []
    for name in SUBJECTS:
        key = f"{name}_score"
        pred = float(np.clip(models[key].predict(frame)[0], 0, 100))
        err = metrics[key]["rmse"]
        preds.append(pred)
        r2s.append(metrics[key]["r2"])
        rows.append({
            "name": name.title(),
            "score": round(pred, 1),
            "low": round(max(0, pred - err), 1),
            "high": round(min(100, pred + err), 1),
            "avg": round(float(REF[key].mean()), 1),
        })

    average = sum(preds) / 3
    grade, remark = grade_for(average)
    return {
        "rows": rows,
        "average": round(average, 1),
        "grade": grade,
        "remark": remark,
        "explained": round(max(0, sum(r2s) / 3) * 100),
    }


def insights_data():
    d = REF

    def group(col):
        g = d.groupby(col)[["math_score", "reading_score", "writing_score"]].mean().round(1)
        return {
            "labels": [str(i) for i in g.index],
            "math": g["math_score"].tolist(),
            "reading": g["reading_score"].tolist(),
            "writing": g["writing_score"].tolist(),
        }

    bins = list(range(0, 101, 10))
    labels = [f"{a}-{b}" for a, b in zip(bins[:-1], bins[1:])]
    hist = pd.cut(d["math_score"], bins=bins, labels=labels, include_lowest=True).value_counts(sort=False)

    return {
        "total": int(len(d)),
        "avg": {
            "math": round(float(d["math_score"].mean()), 1),
            "reading": round(float(d["reading_score"].mean()), 1),
            "writing": round(float(d["writing_score"].mean()), 1),
        },
        "corr_reading": round(float(d["math_score"].corr(d["reading_score"])), 2),
        "corr_writing": round(float(d["math_score"].corr(d["writing_score"])), 2),
        "gender": group("gender"),
        "lunch": group("lunch"),
        "prep": group("test_preparation_course"),
        "parent": group("parental_level_of_education"),
        "race": group("race_ethnicity"),
        "hist": {"labels": labels, "counts": [int(x) for x in hist.tolist()]},
        "scatter": [{"x": int(r), "y": int(m)} for r, m in zip(d["reading_score"], d["math_score"])],
    }


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predictdata", methods=["GET", "POST"])
def predict_datapoint():
    if request.method == "GET":
        return render_template("home.html", form={})

    form = request.form.to_dict()
    form["race_ethnicity"] = form.get("ethnicity")  # form field is named "ethnicity"
    try:
        result = build_report(parse_input(form))
        return render_template("home.html", result=result, form=request.form)
    except ValueError as e:
        return render_template("home.html", error=str(e), form=request.form), 400
    except Exception:
        app.logger.exception("Prediction failed")
        return render_template("home.html", error="Something went wrong. Please try again.",
                               form=request.form), 500


@app.route("/estimate", methods=["GET", "POST"])
def estimate():
    if request.method == "GET":
        return render_template("estimate.html", form={})
    try:
        data = parse_input(request.form.to_dict(), with_scores=False)
        return render_template("estimate.html", result=build_estimate(data), form=request.form)
    except ValueError as e:
        return render_template("estimate.html", error=str(e), form=request.form), 400
    except Exception:
        app.logger.exception("Estimate failed")
        return render_template("estimate.html",
                               error="Quick Estimate is not available right now.",
                               form=request.form), 500


@app.route("/compare", methods=["GET", "POST"])
def compare():
    if request.method == "GET":
        return render_template("compare.html", form={})
    try:
        reports = {}
        for p in ("a", "b"):
            src = {k[2:]: v for k, v in request.form.items() if k.startswith(f"{p}_")}
            reports[p] = build_report(parse_input(src))
        gap = round(reports["a"]["average"] - reports["b"]["average"], 1)
        return render_template("compare.html", form=request.form,
                               a=reports["a"], b=reports["b"], gap=gap)
    except ValueError as e:
        return render_template("compare.html", error=str(e), form=request.form), 400
    except Exception:
        app.logger.exception("Compare failed")
        return render_template("compare.html", error="Something went wrong. Please try again.",
                               form=request.form), 500


@app.route("/insights")
def insights():
    return render_template("insights.html", data=insights_data())


@app.post("/api/predict")
def api_predict():
    payload = request.get_json(silent=True) or {}
    try:
        data = parse_input(payload)
    except ValueError as e:
        return jsonify(error=str(e)), 400
    return jsonify(build_report(data))


@app.route("/health")
def health():
    return jsonify(status="ok")


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)