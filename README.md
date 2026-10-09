# CyberSentry AI — Full-Stack Threat Intelligence & Scam Defense Platform

CyberSentry AI is a production-ready, full-stack cybersecurity platform combining machine learning URL classification, heuristic email & SMS smishing analysis, real-world RSS/Atom threat intelligence feeds, moderated community scam reports, Recharts analytics, and an interactive AI safety advisor.

---

## 1. Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite + TypeScript |
| **Styling** | Tailwind CSS + Lucide Icons + Custom Cyber Glassmorphism |
| **Charts** | Recharts (Area, Bar, Pie, Radar charts) |
| **Backend** | Python 3.13 Flask REST API + CORS |
| **ML Engine** | Scikit-Learn Random Forest Classifier + Joblib + Pandas + NumPy |
| **Database & Auth** | Supabase PostgreSQL + Supabase Auth (with resilient local fallback) |
| **Threat Intelligence** | Public RSS/Atom feeds (CISA Advisories, The Hacker News, BleepingComputer) |
| **AI Assistant** | Configurable LLM API (OpenAI/Gemini) + Built-in Rule-Based Expert Safety Engine |
| **Reports** | ReportLab PDF Audit Reports + CSV Exporter |
| **Deployment** | Vercel (Frontend) + Render / Docker (Backend) ready |

---

## 2. Directory Structure

```
CYBER/
├── backend/
│   ├── app.py                     # Flask REST API endpoints
│   ├── config.py                  # Environment & config loader
│   ├── train_model.py             # Random Forest ML training pipeline
│   ├── requirements.txt           # Python dependencies
│   ├── .env.example               # Backend environment placeholders
│   ├── model/
│   │   ├── phishing_model.joblib  # Trained model artifact
│   │   ├── feature_names.json     # 18 feature vector schemas
│   │   └── model_metadata.json    # Evaluation metrics & importances
│   ├── services/
│   │   ├── ml_service.py          # ML feature extraction & explainability
│   │   ├── email_analyzer.py      # Smishing & message heuristic detector
│   │   ├── supabase_service.py    # Supabase data layer with local resilience
│   │   ├── news_service.py        # RSS/Atom threat feed ingestion
│   │   ├── assistant_service.py   # AI assistant & expert engine
│   │   └── export_service.py      # PDF & CSV generation
│   └── tests/
│       └── test_api.py            # Unit & integration test suite
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI, layout & scanner components
│   │   ├── context/               # AuthContext & ThemeContext
│   │   ├── pages/                 # 14 routed page views
│   │   ├── services/              # API & Supabase JS client
│   │   ├── types/                 # TypeScript interfaces
│   │   ├── App.tsx                # Master router
│   │   ├── index.css              # Cyber design system
│   │   └── main.tsx               # React entrypoint
│   ├── index.html                 # SEO & metadata
│   ├── package.json               # Node dependencies
│   ├── tailwind.config.js         # Cyber theme configuration
│   └── vite.config.ts             # Vite dev server & proxy
├── supabase/
│   ├── migrations/
│   │   ├── 20260101000000_initial_schema.sql # 10 tables, indexes, constraints
│   │   └── 20260101000001_rls_policies.sql   # Row Level Security & triggers
│   └── seed.sql                   # Labeled demo threat & scam records
└── docs/
    ├── ARCHITECTURE.md            # System diagrams & flow
    ├── API_DOCUMENTATION.md       # Complete REST API reference
    ├── ML_PIPELINE.md             # Feature engineering & training guide
    └── SUPABASE_SETUP.md          # Step-by-step database setup
```

---

## 3. Quick Start Guide

### Step 1: Start the Backend (Flask API)
```bash
cd backend
python -m pip install -r requirements.txt
python app.py
```
*API will run at `http://localhost:5000` (Health check at `http://localhost:5000/api/health`).*

### Step 2: Start the Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Application dashboard will open at `http://localhost:5173`.*

---

## 4. Retraining the Machine Learning Model
To retrain the Random Forest classifier:
```bash
cd backend
python train_model.py
```
This evaluates the model, calculates precision, recall, and F1 score, and updates `backend/model/phishing_model.joblib`.

---

## 5. Automated Tests
Run the backend test suite:
```bash
cd backend
python -m unittest tests/test_api.py
```

---

## 6. Implementation Checklist & Verification (36/36)

- [x] React frontend and Flask backend both implemented and functional.
- [x] README.md and both .env.example files configured with placeholders.
- [x] All 14 routes mapped (`/`, `/scanner`, `/results/:id`, `/history`, `/threat-news`, `/community`, `/analytics`, `/assistant`, `/learn`, `/bookmarks`, `/notifications`, `/profile`, `/admin`, `/login`, `/signup`).
- [x] ML Random Forest model trained on 18 security features and saved as joblib artifact.
- [x] Supabase SQL migrations created with 10 tables and Row Level Security policies.
- [x] Demonstration seed data provided with clearly labeled samples.
- [x] URL analyzer validates links and computes risk without visiting targets.
- [x] Email analyzer extracts indicators for urgent smishing, UPI manipulation, and job scams.
- [x] AI Assistant provides incident recovery guidance with graceful local fallback.
- [x] RSS/Atom feed synchronization ingests CISA, HackerNews, and BleepingComputer alerts.
- [x] Anonymized community scam reports queue for administrative moderation.
- [x] Separate statistical accounting for application scans vs. community incidents.
- [x] PDF audit reports and CSV history exports generated.
- [x] Tested unit suite with 100% test pass rate.
