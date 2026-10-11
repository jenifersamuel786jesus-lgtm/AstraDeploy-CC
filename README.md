# AstraDeploy — Intelligent Cloud Resource Sizing, FinOps & MLOps Platform

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Frontend](https://img.shields.io/badge/Frontend-React_19_+_TypeScript_+_Vite-61dafb)](frontend/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI_+_Python_3.12-009688)](backend/)
[![Persistence](https://img.shields.io/badge/Database-PostgreSQL_16-336791)](docker-compose.yml)
[![Guardrails](https://img.shields.io/badge/Guardrails-Zero--Surprise_Billing_Safe-emerald)](infrastructure/)

**AstraDeploy** is an enterprise-grade cloud resource sizing, workload intelligence, cost governance, and MLOps platform. It delivers context-aware infrastructure recommendations, Terraform dry-run plan generation with strict plan-only mode, and automated FinOps rightsizing without any billable cloud surprises.

---

## 🏛️ Application Architecture

```
AstraDeploy/
├── src/                          # React + TypeScript + Vite SPA Frontend
│   ├── components/               # Navbar, Sidebar, Modals
│   ├── components/views/         # 18 Modular Production Console Views
│   ├── services/                 # Recommendation Engine, Terraform Generator, Storage
│   └── types/                    # Core Domain Schemas & Models
├── backend/                      # Python FastAPI REST API Backend
│   ├── main.py                   # REST Endpoints with Workspace Isolation
│   ├── models.py                 # SQLAlchemy PostgreSQL Models
│   ├── schemas.py                # Pydantic Schemas
│   └── requirements.txt          # Python Dependencies
├── ml/                           # MLOps & Surrogate Sizing Model Pipelines
│   ├── dataset.py                # Labeled Synthetic Workload Telemetry Corpus
│   ├── train_recommender.py      # Random Forest Sizing Regressor Training
│   └── artifacts/                # Model Checkpoints & Serialization
├── infrastructure/               # Terraform Baseline Blueprints (Safe Plan-Only)
│   ├── main.tf                   # Zero-Public-IP VPC, Subnets & ECS Cluster
│   ├── variables.tf              # Input Variables
│   └── outputs.tf                # Cluster & Network Outputs
├── tests/                        # Automated Test Suites
│   ├── test_recommendations.py   # Sizing Formula & Latency Multiplier Tests
│   └── test_tenant_isolation.py  # Cross-Workspace Security Isolation Tests
├── Dockerfile.frontend           # Multi-Stage Node.js + Nginx Container
├── Dockerfile.backend            # Python 3.12 Slim Container
└── docker-compose.yml            # Local PostgreSQL + Backend + Frontend Orchestration
```

---

## 🔒 Non-Negotiable Budget & Billing Safeguards

1. **Zero-Auto-Provisioning**: Actual cloud mutations are disabled by default. All Terraform operations run in dry-run/plan mode.
2. **Least-Privilege Cloud Adapters**: AWS, Azure, and GCP adapters operate strictly under `ReadOnlyAccess` policies for resource inventory discovery.
3. **No Paid Third-Party APMs**: Telemetry and metrics are gathered using lightweight native container agents.
4. **Transparent Pricing**: Discloses pricing basis (e.g. AWS On-Demand card rates vs Spot discounts) with zero hidden fees.

---

## 🚀 Quickstart & Local Development

### Prerequisites
- Node.js `v22.x` or later
- Python `3.10` / `3.12`
- Docker Desktop with Docker Compose

### 1. Running the Full-Stack App with Docker Compose
```bash
# Clone the repository
git clone https://github.com/jenifersamuel786jesus/AstraDeploy.git
cd AstraDeploy

# Spin up PostgreSQL, FastAPI Backend, and React Frontend
docker compose up -d --build

# Access services:
# Frontend:  http://localhost:3000
# Backend API & Swagger: http://localhost:8000/docs
# PostgreSQL: localhost:5432
```

### 2. Running Locally on Windows / Linux (Without Docker)

#### Frontend:
```bash
npm install
npm run dev
# Vite runs at http://localhost:3000
```

#### Backend (FastAPI):
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🧪 Running Automated Tests

```bash
# Run backend sizing & tenant isolation tests
pytest tests/ -v
```

---

## ☁️ Free-Tier Deployment Strategy

### Vercel (Frontend)
1. Import repository on [Vercel](https://vercel.com).
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Environment Variable: `VITE_API_BASE_URL=https://your-backend.onrender.com`.

### Render (Backend)
1. Create a **Web Service** on [Render](https://render.com).
2. Environment: **Python 3**.
3. Build Command: `pip install -r backend/requirements.txt`.
4. Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`.
5. Database: Connect to Render's free PostgreSQL tier or remote free PostgreSQL instance.

---

## 📜 18 Implemented Functional Console Views

1. **Overview**: Executive cloud KPI summary, burn rate gauge, provider footprint.
2. **Workloads**: Workload list, search, multi-filter, create modal.
3. **Workload Details**: Live container metrics (CPU, RAM, RPS, p95 latency), sizing blueprint.
4. **Resource Recommendations**: Context-aware sizing engine (Deterministic vs ML).
5. **Cloud Providers**: AWS, Azure, GCP adapters with Read-Only credentials check.
6. **Provisioning Plans**: Terraform HCL preview, dry-run diff (+add, ~change, -destroy), manual confirmation gate.
7. **Deployments**: Progressive delivery (Canary, Blue/Green, Rolling), traffic slider.
8. **Monitoring**: Telemetry histograms, response time curves, system health.
9. **Cost Intelligence**: Monthly budget ceilings, spend allocation by workload & environment.
10. **Optimization Recommendations**: Actionable FinOps savings, idle reclamation, 1-click apply.
11. **ML Experiments**: Runs, hyperparameters, training loss convergence curves.
12. **Model Registry**: Semver versions, stages (Staging, Production, Archived), checksums.
13. **ML Pipelines**: 5-step DAG execution pipeline with drift audits.
14. **Alerts & Incidents**: Metric threshold rules, incident root cause resolution.
15. **Reports**: Executive compliance audit dossier with JSON export.
16. **Audit Logs**: Tenant-isolated immutable compliance event ledger.
17. **Team & Workspaces**: Multi-tenant switcher, workspace budgets, RBAC member management.
18. **Settings**: Alert webhooks, local environment specs, and data governance.
