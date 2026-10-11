from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import os
import math
from datetime import datetime

from .schemas import (
    UserCreate, UserResponse,
    WorkspaceCreate, WorkspaceResponse,
    WorkloadCreate, WorkloadResponse,
    RecommendationResponse
)

app = FastAPI(
    title="AstraDeploy Cloud & MLOps API",
    description="Context-aware cloud resource sizing, cost intelligence, and MLOps platform backend",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory / fallback store for testing and preview
DB_WORKSPACES = {
    "ws-fintech-prod": {
        "id": "ws-fintech-prod",
        "name": "FinTech Core Production",
        "slug": "fintech-prod",
        "monthly_budget": 2500.0,
        "current_spend": 1845.2,
        "currency": "USD"
    }
}

DB_WORKLOADS = {
    "wl-payments-gateway": {
        "id": "wl-payments-gateway",
        "workspace_id": "ws-fintech-prod",
        "name": "Payments Settlement Gateway",
        "description": "High-throughput transactional API",
        "type": "web_api",
        "environment": "production",
        "provider": "AWS",
        "region": "us-east-1",
        "cpu_cores": 8,
        "memory_gb": 32,
        "storage_gb": 80,
        "expected_rps": 2400,
        "p99_latency_target_ms": 45,
        "availability_sla": 99.99,
        "scaling_preference": "performance_first",
        "budget_monthly_limit": 850.0,
        "status": "running",
        "tags": ["pci-dss", "tier-0"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
}

# 1. Health check
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "astradeploy-api",
        "environment": os.getenv("ENVIRONMENT", "local"),
        "timestamp": datetime.utcnow().isoformat()
    }

# 2. Workspaces
@app.get("/api/workspaces", response_model=List[WorkspaceResponse])
def get_workspaces():
    return list(DB_WORKSPACES.values())

@app.post("/api/workspaces", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
def create_workspace(ws: WorkspaceCreate):
    ws_id = f"ws-{len(DB_WORKSPACES) + 1}"
    record = {
        "id": ws_id,
        "name": ws.name,
        "slug": ws.name.lower().replace(" ", "-"),
        "monthly_budget": ws.monthly_budget,
        "current_spend": 0.0,
        "currency": "USD"
    }
    DB_WORKSPACES[ws_id] = record
    return record

# 3. Workload CRUD with Tenant Isolation
@app.get("/api/workloads", response_model=List[WorkloadResponse])
def get_workloads(x_workspace_id: Optional[str] = Header("ws-fintech-prod")):
    # Tenant isolated query
    return [w for w in DB_WORKLOADS.values() if w["workspace_id"] == x_workspace_id]

@app.post("/api/workloads", response_model=WorkloadResponse, status_code=status.HTTP_201_CREATED)
def create_workload(workload: WorkloadCreate, x_workspace_id: Optional[str] = Header("ws-fintech-prod")):
    wl_id = f"wl-{len(DB_WORKLOADS) + 1}"
    now = datetime.utcnow()
    record = {
        **workload.model_dump(),
        "id": wl_id,
        "workspace_id": x_workspace_id,
        "status": "running",
        "created_at": now,
        "updated_at": now
    }
    DB_WORKLOADS[wl_id] = record
    return record

@app.delete("/api/workloads/{workload_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workload(workload_id: str, x_workspace_id: Optional[str] = Header("ws-fintech-prod")):
    if workload_id not in DB_WORKLOADS:
        raise HTTPException(status_code=404, detail="Workload not found")
    if DB_WORKLOADS[workload_id]["workspace_id"] != x_workspace_id:
        raise HTTPException(status_code=403, detail="Cross-tenant access forbidden")
    del DB_WORKLOADS[workload_id]
    return None

# 4. Deterministic Sizing Calculation Engine
@app.post("/api/recommendations/calculate", response_model=RecommendationResponse)
def calculate_recommendation(workload: WorkloadCreate):
    rps_per_core = 250 if workload.type == "web_api" else 45 if workload.type == "ml_inference" else 150
    raw_cores = max(1, workload.expected_rps / rps_per_core)
    latency_mult = 1.6 if workload.p99_latency_target_ms <= 50 else 1.2
    env_mult = 1.35 if workload.environment == "production" else 0.8

    rec_cpu = max(2, math.ceil(raw_cores * latency_mult * env_mult))
    if rec_cpu <= 2: rec_cpu = 2
    elif rec_cpu <= 4: rec_cpu = 4
    elif rec_cpu <= 8: rec_cpu = 8
    else: rec_cpu = 16

    rec_ram = rec_cpu * 4
    min_replicas = 3 if workload.availability_sla >= 99.99 else 2 if workload.environment == "production" else 1
    max_replicas = max(4, rec_cpu * 2)

    instance_type = f"{'t4g' if workload.provider == 'AWS' else 'e2'}.{rec_cpu}xlarge"
    monthly_cost = round(rec_cpu * 24.5 * min_replicas + (workload.storage_gb * 0.08), 2)
    unoptimized = round(monthly_cost * 1.45, 2)
    savings = round(unoptimized - monthly_cost, 2)

    return {
        "workload_id": "simulated",
        "recommended_cpu": rec_cpu,
        "recommended_memory_gb": rec_ram,
        "recommended_replicas_min": min_replicas,
        "recommended_replicas_max": max_replicas,
        "instance_type": instance_type,
        "monthly_cost_estimate": monthly_cost,
        "potential_savings_monthly": savings,
        "confidence_score": 94,
        "explanations": [
            f"Computed baseline capacity: {rps_per_core} RPS/core for {workload.type}",
            f"Latency headroom: {latency_mult}x multiplier applied for p99 < {workload.p99_latency_target_ms}ms"
        ],
        "trade_offs": [
            "Spot instances provide 60% savings but carry 2-5% eviction probability"
        ],
        "assumptions": [
            f"Pricing based on standard public On-Demand rate cards in {workload.region}"
        ]
    }
