# Credit Risk Scoring Engine

A production-ready, full-stack credit risk scoring and financial underwriting workbench. The application uses a MERN (MongoDB, Express, React, Node.js) architecture combined with a dedicated Python FastAPI service to serving scikit-learn machine learning classifiers.

---

## 📖 Project Overview

### Business Problem Solved
Evaluating creditworthiness is a fundamental process for financial institutions. Slow manual reviews, complex financial metrics, and high delinquency rates increase credit losses. 
This workbench automates underwriting by offering:
1. **India Loan Risk Assessment**: Rupee-localized loan evaluations utilizing CIBIL credit bands, LTV ratios, and EMI affordability signals.
2. **Global Credit Card Default Risk**: Evaluations based on historic statements, demographic parameters, and credit limits to identify default likelihoods.

### Key Features
- **Dual-Model Operations**: Tabbed workbench to evaluate either retail loan products or card defaults.
- **Underwriting Logic**: Automated indicators check LTV, debt obligations, and repayment ratios.
- **Asynchronous Health Checks**: A background monitoring service caches ML availability to ensure rapid page loading.
- **Audit Logging**: Persists scored applicants and decisions in MongoDB for regulatory compliance.

---

## 🗺️ System Architecture

```mermaid
graph TD
    subgraph Client Layer [Frontend Client - Port 5173]
        A[React Application] -- User Input Payload --> B[Axios Client API]
    end

    subgraph Application Layer [MERN Gateway API - Port 5000]
        C[Express Server] -- Rate Limiting & CORS Checks --> D[Orchestrator Routes]
        D -- Log Score History --> E[(MongoDB Persistence)]
        D -- Async Connection Status --> F[Health Monitor Service]
    end

    subgraph Data Science Layer [Python ML Server - Port 8000]
        G[FastAPI Service] -- Score Requests --> H[scikit-learn Predictors]
        F -- Poll Health Checked Status --> G
        D -- Forward Features Payload --> G
    end
```

- **React Web UI** runs on port `5173` (or port `3000` inside Docker).
- **Express Backend API** runs on port `5000` and serves as a secure proxy, database orchestrator, and rate limiter.
- **FastAPI ML Service** runs on port `8000` and evaluates prediction models.

---

## 📁 Folder Structure

```text
├── client/                      # React Frontend codebase (Vite bundler)
│   ├── src/
│   │   ├── components/          # Modularized visual blocks (Header, Forms, Logs)
│   │   ├── config/              # Constants, presets, and dropdown configurations
│   │   ├── services/            # Axios API gateways
│   │   ├── main.jsx             # React entrypoint orchestrator
│   │   └── styles.css           # Workbench stylesheets
│   ├── vite.config.js           # Bundle optimizer configuration
│   └── package.json
│
├── server/                      # MERN Gateway Server (Node.js & Express)
│   ├── src/
│   │   ├── config.js            # Environment loader
│   │   ├── db.js                # Database connection utility
│   │   ├── index.js             # Server entrypoint and middlewares
│   │   ├── routes/              # Express API endpoints mapping
│   │   └── services/            # Background connection monitors & ML proxies
│   └── package.json
│
├── src/                         # Python ML Service (FastAPI)
│   ├── api.py                   # FastAPI prediction service
│   ├── schemas.py               # Pydantic input/output validations
│   ├── train.py                 # Credit card model training scripts
│   └── train_india_loan.py      # India loan model training scripts
│
├── models/                      # Joblib model binaries & performance logs
├── data/                        # Raw datasets and SQLite sample databases
├── docker-compose.yml           # Docker orchestration recipe
└── requirements.txt             # Python requirements manifest
```

---

## 🛠️ Prerequisites

- **Node.js**: v18.0.0 or higher (Recommended: v20.x LTS)
- **MongoDB**: Community Edition v6.0 or higher (Recommended: v7.x)
- **Python**: v3.10 or higher (Recommended: v3.11)
- **pip**: Package installer for Python (usually bundled)

---

## 🔒 Environment Variables

Create individual environment configurations. Below are environment variable descriptions and templates:

### Frontend Configuration (`client/.env`)
Vite loads environment variables prefixed with `VITE_`:
```env
# Address of the Express orchestration backend API
VITE_API_URL=http://localhost:5000/api
```

### Backend Configuration (`server/.env` or root `.env`)
```env
# MongoDB Connection URI
MONGO_URI=mongodb://127.0.0.1:27017/credit-risk-scoring

# Port on which MERN Express serves the proxy endpoints
PORT=5000

# Environment execution mode (development / production)
NODE_ENV=development

# Location where the Python FastAPI model service is running
ML_SERVICE_URL=http://127.0.0.1:8000

# Path to python environment executable (used to trigger training subprocesses)
PYTHON_BIN=python

# Whether retraining runs are permitted from API commands (true / false)
ALLOW_TRAINING=true
```

### ML Service Configuration (Optional, defaults configured inside code)
FastAPI parses values from Python environment configurations:
```env
# Port on which Uvicorn loads the FastAPI instance
PORT=8000
HOST=127.0.0.1
```

---

## 🗄️ Database Setup

### Local MongoDB Setup
1. **Download & Install**: Install MongoDB Community Server from the official website.
2. **Launch Daemon**: Start the service via command line or Windows Services:
   ```powershell
   Start-Service MongoDB
   ```
3. **Database Creation**: MongoDB creates databases on the fly when connections write documents. No initial queries are required.
4. **Verification**: Install [MongoDB Compass](https://www.mongodb.com/products/compass) and connect to `mongodb://localhost:27017` to verify database status.

### MongoDB Atlas Setup
1. **Create Account**: Register on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. **Build Cluster**: Deploy a free tier cluster (M0) in your preferred region.
3. **Obtain Connection String**:
   - Go to *Database -> Connect -> Connect your application*.
   - Copy the connection URI: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/creditrisk?retryWrites=true&w=majority`
4. **Configure Server environment**: Replace the local URI in your `.env` file:
   ```env
   MONGO_URI=mongodb+srv://myUser:mySecretPassword@cluster0.mongodb.net/creditrisk?retryWrites=true&w=majority
   ```

---

## 🔌 API Documentation

### Express Gateway Routing API (`Port 5000`)

#### 1. System Health Status
- **Method**: `GET`
- **Route**: `/api/health`
- **Response (200 OK)**:
  ```json
  {
    "status": "healthy",
    "backend": "ok",
    "database": "connected",
    "ml": {
      "status": "active",
      "selected_model": "hist_gradient_boosting",
      "india_selected_model": "hist_gradient_boosting",
      "lastChecked": "2026-06-10T14:15:00.000Z",
      "error": null
    }
  }
  ```

#### 2. Score Global Credit Card Default
- **Method**: `POST`
- **Route**: `/api/scores`
- **Payload**:
  ```json
  {
    "applicant": {
      "limit_bal": 120000,
      "sex": 2,
      "education": 2,
      "marriage": 2,
      "age": 29,
      "pay_0": 0, "pay_2": 0, "pay_3": 0, "pay_4": 0, "pay_5": 0, "pay_6": 0,
      "bill_amt1": 25000, "bill_amt2": 24000, "bill_amt3": 22000, "bill_amt4": 18000, "bill_amt5": 15000, "bill_amt6": 12000,
      "pay_amt1": 2000, "pay_amt2": 2000, "pay_amt3": 1500, "pay_amt4": 1500, "pay_amt5": 1000, "pay_amt6": 1000
    }
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "applicant": { ... },
    "result": {
      "default_probability": 0.12,
      "risk_tier": "Low",
      "decision": "approve",
      "model_version": "hist_gradient_boosting",
      "response_time_ms": 12.35
    }
  }
  ```
- **Errors**:
  - `400 Bad Request`: Payload validation fails.
  - `429 Too Many Requests`: Rate limiter triggered.

#### 3. Score India Loan Risk
- **Method**: `POST`
- **Route**: `/api/scores/india`
- **Payload**:
  ```json
  {
    "applicant": {
      "loan_amount_inr": 2800000,
      "annual_income_inr": 1200000,
      "property_value_inr": 4200000,
      "term_months": 240,
      "cibil_score": 760,
      "dti_ratio": 32,
      "age_band": "35-44",
      "gender": "Joint",
      "region": "North",
      "loan_product": "Home Loan",
      "loan_purpose": "Home Purchase",
      "employment_type": "Salaried",
      "bureau_type": "CIBIL",
      "co_applicant": true,
      "pre_approved": false
    }
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "applicant": { ... },
    "result": {
      "default_probability": 0.04,
      "risk_tier": "Low",
      "decision": "approve",
      "model_version": "hist_gradient_boosting",
      "response_time_ms": 10.42
    }
  }
  ```

#### 4. Audit Scoring History Log
- **Method**: `GET`
- **Route**: `/api/scores`
- **Query Parameters**:
  - `limit`: Number of records to return (Default: 25).
  - `risk_tier`: Filter records by risk tier (`Low`, `Medium`, `High`, `Critical`).
- **Response (200 OK)**:
  ```json
  {
    "items": [ ... ],
    "total": 12,
    "persistence": "connected"
  }
  ```

---

### FastAPI Raw ML Service Routing (`Port 8000`)

| Method | Endpoint | Description | Expected Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/health` | Live loading indicators of joblib model files. | None | Status JSON |
| **POST** | `/score` | Returns Credit Card default evaluations. | Applicant Features Schema | ScoreResponse JSON |
| **POST** | `/india/score`| Returns India Loan evaluations. | India Loan Schema | ScoreResponse JSON |

---

## 🛠️ Step-by-Step Server Setup

### Step A: MERN Backend API Setup
1. Open a terminal in the root directory and navigate to `server/`:
   ```bash
   cd server
   npm install
   ```
2. Configure environmental options in `server/.env`.
3. Launch the API Gateway:
   ```bash
   npm run dev
   ```
4. Verify backend health check by visiting: `http://localhost:5000/api/health`.

### Step B: Python ML Service Setup
1. In a new terminal, navigate to the root directory.
2. Initialize virtual environments and fetch modules:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Run model training scripts:
   ```bash
   # Train India Loan Model
   npm run train:india
   # Train Credit Card Model
   npm run train
   ```
4. Fire up the Uvicorn FastAPI server:
   ```bash
   npm run ml
   ```
5. Open browser check: `http://127.0.0.1:8000/health`.

### Step C: React Frontend client Setup
1. In a new terminal, navigate to `client/`:
   ```bash
   cd client
   npm install
   ```
2. Start the Vite React client dev server:
   ```bash
   npm run dev
   ```
3. Visit the dashboard: `http://localhost:5173`.

---

## 💡 Troubleshooting & FAQ

#### Q: How does the AI Engine active status connect?
**A**: The connection is fully automated. The Express Gateway's background monitor periodically pings FastAPI. The frontend client polls Express and displays `🟢 AI Engine Active` or `🔴 AI Engine Unavailable` dynamically.

#### Q: The client states Database is degraded/offline.
**A**: Ensure your MongoDB server is active. If using a cloud MongoDB Atlas link, double-check your connection credentials and IP whitelist filters.

#### Q: Getting CORS block errors in web console.
**A**: The backend Express server limits CORS to trusted ports. Verify your local Vite dev server port matches client-side targets.

---

## 🤝 Contribution Guidelines

1. Fork the repository and check out a new branch:
   ```bash
   git checkout -b feature/cool-new-indicator
   ```
2. Verify formatting and compile configurations:
   ```bash
   npm run build --prefix client
   ```
3. Maintain modular component practices (do not bloat core entrypoints).
4. Issue a detailed Pull Request detailing the changes and verification runs.
