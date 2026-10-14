# 🎓 Student Exam Performance Predictor

An end-to-end machine learning web app that predicts a student's **maths score** from their background and reading/writing scores, then turns the prediction into a full report with grades, percentile, score range and improvement tips.

[![Live Demo](https://img.shields.io/badge/Live-Demo-2563eb?style=for-the-badge)](https://student-performance-analysis-ruddy.vercel.app)
![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=flat&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.1-000000?style=flat&logo=flask&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=flat&logo=react&logoColor=black)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.7-F7931E?style=flat&logo=scikitlearn&logoColor=white)

**Live app:** https://student-performance-analysis-ruddy.vercel.app
**API:** https://student-performance-analysis-qwp9.onrender.com

> The API runs on Render's free tier, so the first request after a period of inactivity can take 30–60 seconds while the server wakes up.

---

## ✨ Features

- **Full Report** – predicts the maths score and builds a multi-subject report: grade, remark, percentile, class average, expected score range, pass/fail per subject, strongest and weakest subject.
- **Quick Estimate** – estimates maths, reading and writing scores from background details only (no scores needed).
- **Compare** – compares two student profiles side by side and shows the gap in average score.
- **Insights** – interactive charts from the dataset: score distribution, averages by gender, lunch type, test preparation and parental education, and reading vs maths correlation.
- **Smart tips** – what-if suggestions, such as the expected gain from completing the test-preparation course or improving reading and writing.
- **Input validation** – clear error messages for missing or out-of-range values.

## 🧰 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React, Vite, JavaScript, CSS, Chart.js |
| **Backend** | Python, Flask, Flask-CORS, Gunicorn |
| **Machine Learning** | scikit-learn, pandas, NumPy, SciPy, joblib, dill |
| **Notebooks** | Jupyter (EDA and model training) |
| **Deployment** | Vercel (frontend), Render (backend) |

## 🧠 How It Works

1. **Data** – the Students Performance dataset (`backend/notebook/data/stud.csv`) with gender, race/ethnicity, parental education, lunch type, test preparation course, and maths/reading/writing scores.
2. **Pipeline** – data ingestion → transformation (encoding and scaling via a saved preprocessor) → model training and selection.
3. **Artifacts** – the trained model and preprocessor are saved to `backend/artifacts/` and loaded by the prediction pipeline.
4. **Profile models** – separate models predict each subject score from background alone, with their RMSE and R² saved in `profile_metrics.json`. These power the Quick Estimate page.
5. **API** – Flask endpoints validate input, run predictions and return JSON.
6. **UI** – the React frontend calls the API and renders the results.

## 📁 Project Structure

```
Student_Performance_Analysis
├── backend
│   ├── artifacts/          # trained models, preprocessors, metrics
│   ├── notebook/           # EDA and model training notebooks + dataset
│   ├── src
│   │   ├── components/     # data ingestion, transformation, model trainers
│   │   ├── pipeline/       # predict pipeline
│   │   ├── exception.py
│   │   ├── logger.py
│   │   └── utils.py
│   ├── app.py              # Flask API
│   ├── requirements.txt
│   └── setup.py
├── frontend
│   ├── src
│   │   ├── components/     # Navbar, Fields, ReportResult, UI pieces
│   │   ├── pages/          # Home, Predict, Estimate, Compare, Insights
│   │   ├── api.js          # API client
│   │   └── options.js
│   ├── vercel.json
│   └── vite.config.js
└── README.md
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/predict` | Full report (predicts maths from profile + reading/writing scores) |
| `POST` | `/api/estimate` | Estimates all three scores from background only |
| `POST` | `/api/compare` | Full reports for two profiles (`a` and `b`) plus the average gap |
| `GET` | `/api/insights` | Aggregated dataset statistics for the charts |

**Example request**

```bash
curl -X POST https://student-performance-analysis-qwp9.onrender.com/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "gender": "female",
    "race_ethnicity": "group B",
    "parental_level_of_education": "bachelor'"'"'s degree",
    "lunch": "standard",
    "test_preparation_course": "completed",
    "reading_score": 72,
    "writing_score": 74
  }'
```

## 🚀 Run Locally

### Prerequisites

- Python 3.10+
- Node.js 18+

### 1. Clone the repository

```bash
git clone https://github.com/Laxman-019/Student_Performance_Analysis.git
cd Student_Performance_Analysis
```

### 2. Start the backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux
pip install -r requirements.txt
python app.py
```

The API runs at `http://localhost:5000`.

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## ⚙️ Environment Variables

| Variable | Where | Purpose | Example |
|---|---|---|---|
| `CORS_ORIGINS` | Backend (Render) | Comma-separated list of frontend origins allowed to call the API. Use the origin only, with no path and no trailing slash. | `https://student-performance-analysis-ruddy.vercel.app,http://localhost:5173` |
| `VITE_API_URL` | Frontend (Vercel) | Base URL of the backend API | `https://student-performance-analysis-qwp9.onrender.com` |

If `VITE_API_URL` is not set, the frontend falls back to `http://localhost:5000`. If `CORS_ORIGINS` is not set, the backend only allows `http://localhost:5173`.

## ☁️ Deployment

- **Backend (Render):** web service with root directory `backend`, installed from `requirements.txt` and served with Gunicorn (`gunicorn app:app`). Set `CORS_ORIGINS` in the Environment tab.
- **Frontend (Vercel):** root directory `frontend`, framework preset Vite. Set `VITE_API_URL` to the Render service URL. `vercel.json` rewrites all routes to `index.html` so deep links like `/predict` work.

## 🗺️ Roadmap

- [ ] Add model comparison and evaluation metrics to the Insights page
- [ ] Save and share generated reports
- [ ] Add automated tests for the API

## 👤 Author

**Laxman**

- GitHub: [@Laxman-019](https://github.com/Laxman-019)
- LinkedIn: [laxman-chourasia](https://www.linkedin.com/in/laxman-chourasia-8931a3308)

If you find this project useful, consider giving it a ⭐
