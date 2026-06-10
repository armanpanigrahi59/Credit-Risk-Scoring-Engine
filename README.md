# Credit Risk Scoring Engine

A deployable full-stack credit risk scoring project built with:

- React + Vite frontend for applicant scoring, model monitoring, and decision history.
- Node.js + Express backend for API orchestration and MongoDB persistence.
- MongoDB for audit-ready score history.
- Python + FastAPI + scikit-learn for ML training and real-time model serving.

The project now includes two ML tracks:

- Credit-card default model trained on the public **Default of Credit Card Clients** dataset from OpenML/UCI.
- India-facing loan-risk model trained on a real public loan-default dataset downloaded from Zenodo, then exposed with rupee, CIBIL-style, LTV, DTI, EMI, co-applicant, and Indian loan-product inputs.

## Architecture

```text
client/          React frontend
server/          Express API, Mongo persistence, ML proxy routes
src/             Python ML service and training pipeline
models/          Trained model and metrics
data/processed/  Dashboard exports and SQLite sample output
sql/             Power BI view definitions
```

Request flow:

```text
React app -> Express API -> Python ML service -> trained scikit-learn model
                  |
                  +-> MongoDB score history
```

## Features

- User-friendly applicant scoring form.
- Real-time default probability, risk tier, decision, model version, and latency.
- Model quality dashboard with AUC and accuracy comparison.
- MongoDB-backed decision history.
- Python training pipeline with saved best model.
- India-focused loan-risk workflow with INR formatting, CIBIL-style score, EMI affordability, LTV and DTI signals.
- Docker Compose setup for local deployment.
- Power BI-ready CSV, SQLite, and SQL view outputs.

## Local Setup

Install Python dependencies:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Install Node dependencies:

```bash
npm run install:all
```

Copy environment defaults:

```bash
copy .env.example .env
```

## Train The ML Model

```bash
python -m src.train
```

The script saves:

- `models/credit_risk_model.joblib`
- `models/metrics.json`
- `data/processed/dashboard_credit_risk.csv`
- `data/processed/scored_applicants.csv`
- `data/processed/credit_risk.db`

Latest local training run:

- Records: `30,000`
- Selected model: `hist_gradient_boosting`
- Validation AUC-ROC: `0.7812`
- Validation accuracy: `0.8183`
- Engineered behavior features: `12`

## Train The India Loan Model

```bash
npm run train:india
```

This trains `models/india_loan_model.joblib` from `data/raw/loan_default_zenodo.csv`.

Latest local India-loan training run:

- Records: `148,670`
- Selected model: `hist_gradient_boosting`
- Validation AUC-ROC: `0.8772`
- Validation accuracy: `0.8945`
- Dataset source: `https://zenodo.org/records/17833064`
- Note: the UI is localized for Indian loan assessment; the public dataset is real loan-default data, not private Indian bureau data.

## Run Locally

Start MongoDB locally first, or use Docker for MongoDB:

```bash
docker run --name credit-risk-mongo -p 27017:27017 -d mongo:7
```

Terminal 1, start the Python ML service:

```bash
npm run ml
```

Terminal 2, start the MERN app:

```bash
npm run dev
```

Open:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5000/api/health`
- Python API docs: `http://127.0.0.1:8000/docs`

## Run With Docker Compose

```bash
docker compose up --build
```

Open:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000/api/health`
- ML service: `http://localhost:8000/health`

## API

Score an applicant through the MERN backend:

```bash
curl -X POST http://localhost:5000/api/scores ^
  -H "Content-Type: application/json" ^
  -d "{\"limit_bal\":200000,\"sex\":2,\"education\":2,\"marriage\":1,\"age\":35,\"pay_0\":0,\"pay_2\":0,\"pay_3\":0,\"pay_4\":0,\"pay_5\":0,\"pay_6\":0,\"bill_amt1\":12000,\"bill_amt2\":11800,\"bill_amt3\":11000,\"bill_amt4\":10500,\"bill_amt5\":9800,\"bill_amt6\":9300,\"pay_amt1\":2000,\"pay_amt2\":1900,\"pay_amt3\":1800,\"pay_amt4\":1700,\"pay_amt5\":1600,\"pay_amt6\":1500}"
```

Useful backend routes:

- `GET /api/health`
- `GET /api/metrics`
- `GET /api/india/metrics`
- `POST /api/scores`
- `POST /api/scores/india`
- `GET /api/scores`
- `POST /api/train` when `ALLOW_TRAINING=true`

## Deployment Notes

- In production, set `ALLOW_TRAINING=false` and run retraining as a controlled job.
- Set `MONGO_URI` to a hosted MongoDB instance such as MongoDB Atlas.
- Set `ML_SERVICE_URL` to the deployed Python service URL.
- The frontend Docker image proxies `/api` to the backend service through Nginx.
