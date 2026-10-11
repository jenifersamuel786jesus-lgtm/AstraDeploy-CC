from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    role: str = "Engineer"
    created_at: datetime

class WorkspaceCreate(BaseModel):
    name: str
    monthly_budget: float = 2000.0

class WorkspaceResponse(BaseModel):
    id: str
    name: str
    slug: str
    monthly_budget: float
    current_spend: float
    currency: str

class WorkloadCreate(BaseModel):
    name: str
    description: Optional[str] = None
    type: Literal["web_api", "microservice", "batch_etl", "ml_training", "ml_inference", "database", "realtime_socket"]
    environment: Literal["development", "staging", "production"]
    provider: Literal["AWS", "Azure", "GCP"]
    region: str = "us-east-1"
    cpu_cores: int = Field(gt=0, le=128)
    memory_gb: int = Field(gt=0, le=1024)
    storage_gb: int = Field(default=50, gt=0)
    expected_rps: int = Field(default=1000, gt=0)
    p99_latency_target_ms: int = Field(default=50, gt=0)
    availability_sla: float = Field(default=99.95, ge=90.0, le=100.0)
    scaling_preference: Literal["cost_optimized", "balanced", "performance_first"] = "balanced"
    budget_monthly_limit: float = Field(default=500.0, gt=0)
    tags: List[str] = []

class WorkloadResponse(WorkloadCreate):
    id: str
    workspace_id: str
    status: str
    created_at: datetime
    updated_at: datetime

class RecommendationResponse(BaseModel):
    workload_id: str
    recommended_cpu: int
    recommended_memory_gb: int
    recommended_replicas_min: int
    recommended_replicas_max: int
    instance_type: str
    monthly_cost_estimate: float
    potential_savings_monthly: float
    confidence_score: int
    explanations: List[str]
    trade_offs: List[str]
    assumptions: List[str]
