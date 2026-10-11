import {
  User,
  Workspace,
  WorkspaceMember,
  Workload,
  ResourceRecommendation,
  CloudProviderConnection,
  ProvisioningPlan,
  Deployment,
  MetricPoint,
  CostOptimization,
  MLExperiment,
  MLModel,
  MLPipeline,
  AlertRule,
  Incident,
  AuditLog,
} from '../types';
import { calculateDeterministicRecommendation } from './recommendationEngine';
import { createProvisioningPlan } from './terraformEngine';

const STORAGE_KEYS = {
  CURRENT_USER: 'astradeploy_current_user',
  CURRENT_WORKSPACE_ID: 'astradeploy_current_ws_id',
  WORKSPACES: 'astradeploy_workspaces',
  MEMBERS: 'astradeploy_members',
  WORKLOADS: 'astradeploy_workloads',
  RECOMMENDATIONS: 'astradeploy_recommendations',
  PROVIDERS: 'astradeploy_providers',
  PLANS: 'astradeploy_plans',
  DEPLOYMENTS: 'astradeploy_deployments',
  COST_OPTIMIZATIONS: 'astradeploy_cost_optimizations',
  ML_EXPERIMENTS: 'astradeploy_ml_experiments',
  ML_MODELS: 'astradeploy_ml_models',
  ML_PIPELINES: 'astradeploy_ml_pipelines',
  ALERTS: 'astradeploy_alerts',
  INCIDENTS: 'astradeploy_incidents',
  AUDIT_LOGS: 'astradeploy_audit_logs',
};

// Seed Workspaces
const SEED_WORKSPACES: Workspace[] = [
  {
    id: 'ws-fintech-prod',
    name: 'FinTech Core Production',
    slug: 'fintech-prod',
    monthlyBudget: 2500,
    currency: 'USD',
    createdDate: '2026-01-10T08:00:00Z',
    currentSpend: 1845.2,
  },
  {
    id: 'ws-ml-labs',
    name: 'ML & AI Research Labs',
    slug: 'ml-labs',
    monthlyBudget: 4200,
    currency: 'USD',
    createdDate: '2026-02-14T09:30:00Z',
    currentSpend: 3120.45,
  },
  {
    id: 'ws-ecommerce',
    name: 'E-Commerce Microservices',
    slug: 'ecommerce-retail',
    monthlyBudget: 1500,
    currency: 'USD',
    createdDate: '2026-03-01T12:00:00Z',
    currentSpend: 924.8,
  },
];

const SEED_USER: User = {
  id: 'usr-senior-arch-1',
  email: 'principal.architect@astradeploy.io',
  name: 'Alex Rivera',
  role: 'Owner',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

const SEED_MEMBERS: WorkspaceMember[] = [
  {
    id: 'mem-1',
    userId: 'usr-senior-arch-1',
    workspaceId: 'ws-fintech-prod',
    name: 'Alex Rivera',
    email: 'principal.architect@astradeploy.io',
    role: 'Owner',
    joinedAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'mem-2',
    userId: 'usr-devops-2',
    workspaceId: 'ws-fintech-prod',
    name: 'Elena Rostova',
    email: 'elena.r@astradeploy.io',
    role: 'Admin',
    joinedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'mem-3',
    userId: 'usr-ml-3',
    workspaceId: 'ws-fintech-prod',
    name: 'David Chen',
    email: 'd.chen@astradeploy.io',
    role: 'Engineer',
    joinedAt: '2026-02-01T11:00:00Z',
  },
  {
    id: 'mem-4',
    userId: 'usr-senior-arch-1',
    workspaceId: 'ws-ml-labs',
    name: 'Alex Rivera',
    email: 'principal.architect@astradeploy.io',
    role: 'Owner',
    joinedAt: '2026-02-14T09:30:00Z',
  },
  {
    id: 'mem-5',
    userId: 'usr-ml-3',
    workspaceId: 'ws-ml-labs',
    name: 'David Chen',
    email: 'd.chen@astradeploy.io',
    role: 'Admin',
    joinedAt: '2026-02-14T10:00:00Z',
  },
  {
    id: 'mem-6',
    userId: 'usr-senior-arch-1',
    workspaceId: 'ws-ecommerce',
    name: 'Alex Rivera',
    email: 'principal.architect@astradeploy.io',
    role: 'Owner',
    joinedAt: '2026-03-01T12:00:00Z',
  },
];

const SEED_WORKLOADS: Workload[] = [
  {
    id: 'wl-payments-gateway',
    workspaceId: 'ws-fintech-prod',
    name: 'Payments Settlement Gateway',
    description: 'High-throughput transactional API for credit card authorization & settlements',
    type: 'web_api',
    environment: 'production',
    provider: 'AWS',
    region: 'us-east-1',
    cpuCores: 8,
    memoryGb: 32,
    storageGb: 80,
    expectedRps: 2400,
    p99LatencyTargetMs: 45,
    availabilitySla: 99.99,
    scalingPreference: 'performance_first',
    budgetMonthlyLimit: 850,
    tags: ['pci-dss', 'tier-0', 'payments'],
    status: 'running',
    createdAt: '2026-01-12T14:22:00Z',
    updatedAt: '2026-03-20T10:00:00Z',
  },
  {
    id: 'wl-risk-scorer',
    workspaceId: 'ws-fintech-prod',
    name: 'Real-time Fraud Risk Scorer',
    description: 'Low-latency ML inference scoring service for incoming transactions',
    type: 'ml_inference',
    environment: 'production',
    provider: 'AWS',
    region: 'us-east-1',
    cpuCores: 4,
    memoryGb: 16,
    storageGb: 60,
    expectedRps: 850,
    p99LatencyTargetMs: 30,
    availabilitySla: 99.99,
    scalingPreference: 'balanced',
    budgetMonthlyLimit: 600,
    tags: ['fraud-engine', 'ml-inference'],
    status: 'running',
    createdAt: '2026-01-18T09:15:00Z',
    updatedAt: '2026-03-18T16:30:00Z',
  },
  {
    id: 'wl-ledger-sync',
    workspaceId: 'ws-fintech-prod',
    name: 'Double-Entry Ledger Sync',
    description: 'Batch streaming sync for transaction reconciliation into immutable store',
    type: 'batch_etl',
    environment: 'staging',
    provider: 'AWS',
    region: 'us-east-1',
    cpuCores: 4,
    memoryGb: 16,
    storageGb: 120,
    expectedRps: 300,
    p99LatencyTargetMs: 250,
    availabilitySla: 99.9,
    scalingPreference: 'cost_optimized',
    budgetMonthlyLimit: 250,
    tags: ['reconciliation', 'etl'],
    status: 'running',
    createdAt: '2026-02-05T11:40:00Z',
    updatedAt: '2026-03-22T08:10:00Z',
  },
  // ML Labs Workloads
  {
    id: 'wl-transformer-trainer',
    workspaceId: 'ws-ml-labs',
    name: 'LLM Fine-Tuning Pipeline Node',
    description: 'Distributed PyTorch model fine-tuning for domain financial intelligence',
    type: 'ml_training',
    environment: 'production',
    provider: 'GCP',
    region: 'us-central1',
    cpuCores: 12,
    memoryGb: 85,
    storageGb: 250,
    expectedRps: 20,
    p99LatencyTargetMs: 1200,
    availabilitySla: 99.5,
    scalingPreference: 'performance_first',
    budgetMonthlyLimit: 2800,
    tags: ['gpu-cluster', 'deep-learning'],
    status: 'running',
    createdAt: '2026-02-15T12:00:00Z',
    updatedAt: '2026-03-21T18:00:00Z',
  },
  {
    id: 'wl-vector-db',
    workspaceId: 'ws-ml-labs',
    name: 'Vector Database Index Cluster',
    description: 'High-dimensional embedding nearest-neighbor retrieval for semantic search',
    type: 'database',
    environment: 'staging',
    provider: 'GCP',
    region: 'us-central1',
    cpuCores: 8,
    memoryGb: 32,
    storageGb: 150,
    expectedRps: 450,
    p99LatencyTargetMs: 60,
    availabilitySla: 99.9,
    scalingPreference: 'balanced',
    budgetMonthlyLimit: 500,
    tags: ['embeddings', 'milvus'],
    status: 'running',
    createdAt: '2026-02-20T10:00:00Z',
    updatedAt: '2026-03-15T14:00:00Z',
  },
  // E-Commerce Workloads
  {
    id: 'wl-catalog-api',
    workspaceId: 'ws-ecommerce',
    name: 'Product Catalog & Search API',
    description: 'Elasticsearch-backed product discovery with faceted navigation',
    type: 'web_api',
    environment: 'production',
    provider: 'Azure',
    region: 'eastus',
    cpuCores: 4,
    memoryGb: 16,
    storageGb: 80,
    expectedRps: 1800,
    p99LatencyTargetMs: 80,
    availabilitySla: 99.95,
    scalingPreference: 'balanced',
    budgetMonthlyLimit: 500,
    tags: ['search', 'catalog'],
    status: 'running',
    createdAt: '2026-03-02T13:00:00Z',
    updatedAt: '2026-03-22T09:00:00Z',
  },
];

const SEED_PROVIDERS: CloudProviderConnection[] = [
  {
    id: 'cp-aws-prod',
    provider: 'AWS',
    name: 'AWS Primary Production (us-east-1)',
    accountId: '1284-9358-9215',
    status: 'read_only_verified',
    region: 'us-east-1',
    discoveredResourcesCount: 42,
    lastSyncAt: '2026-10-10T23:45:00Z',
    iamRoleArn: 'arn:aws:iam::128493589215:role/AstraDeployReadOnlyCrossAccount',
    costToDate: 1240.5,
  },
  {
    id: 'cp-gcp-ml',
    provider: 'GCP',
    name: 'Google Cloud Platform AI Lab',
    accountId: 'prj-astradeploy-ai-lab',
    status: 'connected',
    region: 'us-central1',
    discoveredResourcesCount: 19,
    lastSyncAt: '2026-10-10T22:15:00Z',
    iamRoleArn: 'astradeploy-sa@prj-astradeploy-ai-lab.iam.gserviceaccount.com',
    costToDate: 2180.0,
  },
  {
    id: 'cp-azure-retail',
    provider: 'Azure',
    name: 'Microsoft Azure Sub-Retail',
    accountId: '8f2b34a1-0000-4b12-98ab',
    status: 'read_only_verified',
    region: 'eastus',
    discoveredResourcesCount: 14,
    lastSyncAt: '2026-10-10T20:30:00Z',
    iamRoleArn: 'ServicePrincipal/astradeploy-reader-sp',
    costToDate: 490.2,
  },
];

const SEED_DEPLOYMENTS: Deployment[] = [
  {
    id: 'dep-101',
    workspaceId: 'ws-fintech-prod',
    workloadId: 'wl-payments-gateway',
    workloadName: 'Payments Settlement Gateway',
    version: 'v2.14.0',
    environment: 'production',
    strategy: 'canary',
    status: 'healthy',
    commitSha: '9f2a71d',
    trafficDistribution: { primary: 80, canary: 20 },
    activePods: 6,
    deployedAt: '2026-10-10T18:40:00Z',
  },
  {
    id: 'dep-102',
    workspaceId: 'ws-fintech-prod',
    workloadId: 'wl-risk-scorer',
    workloadName: 'Real-time Fraud Risk Scorer',
    version: 'v1.8.2',
    environment: 'production',
    strategy: 'blue_green',
    status: 'healthy',
    commitSha: '4c8e19b',
    trafficDistribution: { primary: 100, canary: 0 },
    activePods: 4,
    deployedAt: '2026-10-09T14:15:00Z',
  },
  {
    id: 'dep-103',
    workspaceId: 'ws-ml-labs',
    workloadId: 'wl-transformer-trainer',
    workloadName: 'LLM Fine-Tuning Pipeline Node',
    version: 'v0.9.1-beta',
    environment: 'production',
    strategy: 'rolling',
    status: 'healthy',
    commitSha: '6e118fd',
    trafficDistribution: { primary: 100, canary: 0 },
    activePods: 2,
    deployedAt: '2026-10-08T09:30:00Z',
  },
];

const SEED_COST_OPTIMIZATIONS: CostOptimization[] = [
  {
    id: 'opt-1',
    workspaceId: 'ws-fintech-prod',
    workloadId: 'wl-payments-gateway',
    title: 'Migrate Payment Nodes to AWS Graviton3 (c7g.2xlarge)',
    resourceType: 'ECS / EC2 Compute',
    currentMonthlyCost: 440.0,
    optimizedMonthlyCost: 352.0,
    monthlySavings: 88.0,
    savingsPercentage: 20,
    effort: 'Low',
    recommendationType: 'rightsizing',
    status: 'open',
  },
  {
    id: 'opt-2',
    workspaceId: 'ws-fintech-prod',
    workloadId: 'wl-ledger-sync',
    title: 'Reclaim Unattached 350GB GP2 Volume in staging',
    resourceType: 'EBS Storage Volume',
    currentMonthlyCost: 35.0,
    optimizedMonthlyCost: 0.0,
    monthlySavings: 35.0,
    savingsPercentage: 100,
    effort: 'Low',
    recommendationType: 'idle_cleanup',
    status: 'open',
  },
  {
    id: 'opt-3',
    workspaceId: 'ws-fintech-prod',
    title: 'Purchase 1-Year Compute Savings Plan for Baseline 24/7 Load',
    resourceType: 'Compute Savings Plan',
    currentMonthlyCost: 1100.0,
    optimizedMonthlyCost: 780.0,
    monthlySavings: 320.0,
    savingsPercentage: 29.1,
    effort: 'Medium',
    recommendationType: 'savings_plan',
    status: 'open',
  },
  {
    id: 'opt-4',
    workspaceId: 'ws-ml-labs',
    workloadId: 'wl-transformer-trainer',
    title: 'Enable Preemptible / Spot GPU Allocation with Checkpointing',
    resourceType: 'GCP Compute Engine (A100)',
    currentMonthlyCost: 2400.0,
    optimizedMonthlyCost: 1200.0,
    monthlySavings: 1200.0,
    savingsPercentage: 50,
    effort: 'High',
    recommendationType: 'rightsizing',
    status: 'open',
  },
];

const SEED_ML_EXPERIMENTS: MLExperiment[] = [
  {
    id: 'exp-fraud-detector',
    workspaceId: 'ws-fintech-prod',
    name: 'fraud-detection-ensemble-v2',
    description: 'XGBoost + LightGBM weighted ensemble for sub-30ms card fraud inference',
    framework: 'XGBoost',
    datasetName: 'syn-transaction-features-2026-q1',
    datasetSamples: 1450000,
    createdAt: '2026-03-10T11:00:00Z',
    runs: [
      {
        id: 'run-101',
        experimentId: 'exp-fraud-detector',
        runNumber: 1,
        parameters: {
          learning_rate: 0.05,
          batch_size: 256,
          epochs: 50,
          optimizer: 'adamW',
          model_architecture: 'gradient_boosted_trees_d6',
        },
        metrics: {
          train_loss: 0.082,
          val_loss: 0.091,
          accuracy: 0.988,
          f1_score: 0.964,
          rmse: 0.042,
        },
        lossHistory: [
          { step: 1, loss: 0.45, valLoss: 0.48 },
          { step: 10, loss: 0.28, valLoss: 0.31 },
          { step: 20, loss: 0.17, valLoss: 0.20 },
          { step: 30, loss: 0.12, valLoss: 0.14 },
          { step: 40, loss: 0.095, valLoss: 0.105 },
          { step: 50, loss: 0.082, valLoss: 0.091 },
        ],
        durationSec: 1840,
        status: 'completed',
        artifactUri: 's3://astradeploy-artifacts/models/fraud_detector_run101.tar.gz',
        createdAt: '2026-03-10T12:30:00Z',
      },
      {
        id: 'run-102',
        experimentId: 'exp-fraud-detector',
        runNumber: 2,
        parameters: {
          learning_rate: 0.02,
          batch_size: 512,
          epochs: 80,
          optimizer: 'adamW',
          model_architecture: 'gradient_boosted_trees_d8_regularized',
        },
        metrics: {
          train_loss: 0.061,
          val_loss: 0.074,
          accuracy: 0.993,
          f1_score: 0.981,
          rmse: 0.029,
        },
        lossHistory: [
          { step: 1, loss: 0.42, valLoss: 0.46 },
          { step: 20, loss: 0.19, valLoss: 0.22 },
          { step: 40, loss: 0.11, valLoss: 0.13 },
          { step: 60, loss: 0.078, valLoss: 0.092 },
          { step: 80, loss: 0.061, valLoss: 0.074 },
        ],
        durationSec: 2950,
        status: 'completed',
        artifactUri: 's3://astradeploy-artifacts/models/fraud_detector_run102.tar.gz',
        createdAt: '2026-03-11T16:00:00Z',
      },
    ],
  },
  {
    id: 'exp-cloud-recommender',
    workspaceId: 'ws-fintech-prod',
    name: 'astradeploy-sizing-predictor',
    description: 'Surrogate Machine Learning model predicting optimal vCPU/RAM allocation from RPS & latency',
    framework: 'scikit-learn',
    datasetName: 'cloud-workload-telemetry-corpus-v1',
    datasetSamples: 50000,
    createdAt: '2026-03-15T09:00:00Z',
    runs: [
      {
        id: 'run-rec-01',
        experimentId: 'exp-cloud-recommender',
        runNumber: 1,
        parameters: {
          learning_rate: 0.01,
          batch_size: 128,
          epochs: 40,
          optimizer: 'sgd_momentum',
          model_architecture: 'random_forest_regressor_100estimators',
        },
        metrics: {
          train_loss: 0.035,
          val_loss: 0.048,
          rmse: 0.052,
        },
        lossHistory: [
          { step: 1, loss: 0.32, valLoss: 0.35 },
          { step: 10, loss: 0.15, valLoss: 0.18 },
          { step: 20, loss: 0.08, valLoss: 0.11 },
          { step: 40, loss: 0.035, valLoss: 0.048 },
        ],
        durationSec: 620,
        status: 'completed',
        artifactUri: 's3://astradeploy-artifacts/models/recommender_rf_v1.joblib',
        createdAt: '2026-03-15T10:15:00Z',
      },
    ],
  },
];

const SEED_ML_MODELS: MLModel[] = [
  {
    id: 'model-fraud-sentinel',
    workspaceId: 'ws-fintech-prod',
    name: 'FraudSentinel-Classifier',
    task: 'Classification',
    framework: 'XGBoost 2.0.3',
    tags: ['production', 'pci-compliant', 'latency-critical'],
    versions: [
      {
        id: 'ver-102',
        modelId: 'model-fraud-sentinel',
        version: 'v2.1.0',
        runId: 'run-102',
        stage: 'Production',
        metrics: { f1: 0.981, latencyMs: 18.4, sizeMb: 42.8 },
        checksum: 'sha256:d8e945c7b39a8f2190ee01',
        deployedWorkloadId: 'wl-risk-scorer',
        createdAt: '2026-03-12T09:00:00Z',
      },
      {
        id: 'ver-101',
        modelId: 'model-fraud-sentinel',
        version: 'v2.0.0',
        runId: 'run-101',
        stage: 'Archived',
        metrics: { f1: 0.964, latencyMs: 22.1, sizeMb: 36.4 },
        checksum: 'sha256:1a84f3e910bd65c400ab81',
        createdAt: '2026-03-10T14:00:00Z',
      },
    ],
  },
  {
    id: 'model-sizing-engine',
    workspaceId: 'ws-fintech-prod',
    name: 'WorkloadSizingPredictor',
    task: 'Regression',
    framework: 'scikit-learn 1.4',
    tags: ['core-engine', 'resource-intelligence'],
    versions: [
      {
        id: 'ver-rec-1',
        modelId: 'model-sizing-engine',
        version: 'v1.0.0',
        runId: 'run-rec-01',
        stage: 'Production',
        metrics: { f1: 0.942, latencyMs: 4.2, sizeMb: 12.1 },
        checksum: 'sha256:77bc33a948e2f8901cc992',
        createdAt: '2026-03-15T11:00:00Z',
      },
    ],
  },
];

const SEED_ML_PIPELINES: MLPipeline[] = [
  {
    id: 'pipe-daily-retrain',
    workspaceId: 'ws-fintech-prod',
    name: 'Automated Fraud Feature Store & Retraining DAG',
    description: 'Scheduled daily pipeline validating feature distributions, running training, and checking canary thresholds',
    trigger: 'scheduled_cron',
    lastRunStatus: 'success',
    lastRunAt: '2026-10-10T02:00:00Z',
    stages: [
      {
        id: 'stg-1',
        name: 'Feature Store Extraction & Drift Check',
        status: 'success',
        duration: '4m 12s',
        stepOutputSummary: '1.45M rows extracted; PSI = 0.028 (within drift bounds < 0.1)',
      },
      {
        id: 'stg-2',
        name: 'Distributed Gradient Boosting Training',
        status: 'success',
        duration: '18m 40s',
        stepOutputSummary: 'Model converged at epoch 80 with loss 0.061',
      },
      {
        id: 'stg-3',
        name: 'Model Evaluation & Slice Fairness Audit',
        status: 'success',
        duration: '5m 10s',
        stepOutputSummary: 'F1 Score: 0.981; Bias parity test passed across all geographic cohorts',
      },
      {
        id: 'stg-4',
        name: 'Model Registry Registration & Packaging',
        status: 'success',
        duration: '1m 20s',
        stepOutputSummary: 'Published version v2.1.0 with checksum verified',
      },
      {
        id: 'stg-5',
        name: 'Canary Gate Rollout & 5% Traffic Split',
        status: 'success',
        duration: '10m 00s',
        stepOutputSummary: 'Canary p99 latency 18.4ms; zero regression detected',
      },
    ],
  },
];

const SEED_ALERT_RULES: AlertRule[] = [
  {
    id: 'al-1',
    workspaceId: 'ws-fintech-prod',
    name: 'High p99 Latency (> 80ms)',
    metric: 'p99LatencyMs',
    operator: '>',
    threshold: 80,
    durationMinutes: 5,
    severity: 'critical',
    enabled: true,
  },
  {
    id: 'al-2',
    workspaceId: 'ws-fintech-prod',
    name: 'Error Rate Spike (> 1.5%)',
    metric: 'errorRatePct',
    operator: '>',
    threshold: 1.5,
    durationMinutes: 3,
    severity: 'critical',
    enabled: true,
  },
  {
    id: 'al-3',
    workspaceId: 'ws-fintech-prod',
    name: 'Memory Pressure (> 85%)',
    metric: 'memoryPct',
    operator: '>',
    threshold: 85,
    durationMinutes: 10,
    severity: 'warning',
    enabled: true,
  },
];

const SEED_INCIDENTS: Incident[] = [
  {
    id: 'inc-902',
    workspaceId: 'ws-fintech-prod',
    title: 'Payments Gateway Elevated Latency (p99 = 94ms)',
    workloadName: 'Payments Settlement Gateway',
    severity: 'warning',
    status: 'acknowledged',
    metricValue: '94ms',
    threshold: '80ms',
    triggeredAt: '2026-10-10T21:14:00Z',
    rootCause: 'Transient database lock during bulk midnight merchant settlement batch',
  },
  {
    id: 'inc-890',
    workspaceId: 'ws-fintech-prod',
    title: 'Ledger Sync Memory Warning (88% Usage)',
    workloadName: 'Double-Entry Ledger Sync',
    severity: 'info',
    status: 'resolved',
    metricValue: '88%',
    threshold: '85%',
    triggeredAt: '2026-10-08T14:00:00Z',
    resolvedAt: '2026-10-08T14:25:00Z',
    rootCause: 'Garbage collection reclaimed unreferenced stream buffers cleanly.',
  },
];

const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    workspaceId: 'ws-fintech-prod',
    actorEmail: 'principal.architect@astradeploy.io',
    actorRole: 'Owner',
    action: 'CREATE_WORKLOAD',
    resourceType: 'Workload',
    resourceName: 'Payments Settlement Gateway',
    details: 'Provisioned production tier-0 payment API targeting AWS us-east-1',
    ipAddress: '198.51.100.24',
    timestamp: '2026-10-10T14:22:00Z',
  },
  {
    id: 'aud-2',
    workspaceId: 'ws-fintech-prod',
    actorEmail: 'elena.r@astradeploy.io',
    actorRole: 'Admin',
    action: 'VALIDATE_TERRAFORM_PLAN',
    resourceType: 'ProvisioningPlan',
    resourceName: 'Infrastructure Plan for Payments Settlement Gateway',
    details: 'Validated dry-run plan with 5 resources to add, 0 to destroy',
    ipAddress: '198.51.100.67',
    timestamp: '2026-10-10T16:05:00Z',
  },
  {
    id: 'aud-3',
    workspaceId: 'ws-fintech-prod',
    actorEmail: 'd.chen@astradeploy.io',
    actorRole: 'Engineer',
    action: 'PROMOTE_MODEL_STAGE',
    resourceType: 'MLModel',
    resourceName: 'FraudSentinel-Classifier (v2.1.0)',
    details: 'Promoted model version from Staging to Production after canary validation',
    ipAddress: '203.0.113.89',
    timestamp: '2026-10-10T18:10:00Z',
  },
  {
    id: 'aud-4',
    workspaceId: 'ws-fintech-prod',
    actorEmail: 'principal.architect@astradeploy.io',
    actorRole: 'Owner',
    action: 'UPDATE_BUDGET_POLICY',
    resourceType: 'Workspace',
    resourceName: 'FinTech Core Production',
    details: 'Adjusted monthly spending budget limit to $2,500 USD',
    ipAddress: '198.51.100.24',
    timestamp: '2026-10-10T19:30:00Z',
  },
];

class StorageService {
  private isBrowser = typeof window !== 'undefined';

  private getItem<T>(key: string, fallback: T): T {
    if (!this.isBrowser) return fallback;
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      return JSON.parse(item) as T;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn('Storage write error', err);
    }
  }

  constructor() {
    this.initSeeds();
  }

  public initSeeds(): void {
    if (!this.isBrowser) return;
    if (!localStorage.getItem(STORAGE_KEYS.WORKSPACES)) {
      this.setItem(STORAGE_KEYS.WORKSPACES, SEED_WORKSPACES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      this.setItem(STORAGE_KEYS.CURRENT_USER, SEED_USER);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_WORKSPACE_ID)) {
      this.setItem(STORAGE_KEYS.CURRENT_WORKSPACE_ID, SEED_WORKSPACES[0].id);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
      this.setItem(STORAGE_KEYS.MEMBERS, SEED_MEMBERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.WORKLOADS)) {
      this.setItem(STORAGE_KEYS.WORKLOADS, SEED_WORKLOADS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROVIDERS)) {
      this.setItem(STORAGE_KEYS.PROVIDERS, SEED_PROVIDERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.DEPLOYMENTS)) {
      this.setItem(STORAGE_KEYS.DEPLOYMENTS, SEED_DEPLOYMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.COST_OPTIMIZATIONS)) {
      this.setItem(STORAGE_KEYS.COST_OPTIMIZATIONS, SEED_COST_OPTIMIZATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ML_EXPERIMENTS)) {
      this.setItem(STORAGE_KEYS.ML_EXPERIMENTS, SEED_ML_EXPERIMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ML_MODELS)) {
      this.setItem(STORAGE_KEYS.ML_MODELS, SEED_ML_MODELS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ML_PIPELINES)) {
      this.setItem(STORAGE_KEYS.ML_PIPELINES, SEED_ML_PIPELINES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ALERTS)) {
      this.setItem(STORAGE_KEYS.ALERTS, SEED_ALERT_RULES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INCIDENTS)) {
      this.setItem(STORAGE_KEYS.INCIDENTS, SEED_INCIDENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      this.setItem(STORAGE_KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS);
    }

    // Seed initial recommendation and plans for default workloads if not present
    if (!localStorage.getItem(STORAGE_KEYS.RECOMMENDATIONS)) {
      const initialRecs: ResourceRecommendation[] = SEED_WORKLOADS.map((wl) =>
        calculateDeterministicRecommendation(wl)
      );
      this.setItem(STORAGE_KEYS.RECOMMENDATIONS, initialRecs);

      const initialPlans: ProvisioningPlan[] = [
        createProvisioningPlan(SEED_WORKLOADS[0], initialRecs[0], SEED_USER.email),
      ];
      this.setItem(STORAGE_KEYS.PLANS, initialPlans);
    }
  }

  // --- Auth & Tenant Context ---
  public isAuthenticated(): boolean {
    if (!this.isBrowser) return true;
    return !!localStorage.getItem('astradeploy_auth_token');
  }

  public login(email: string, password?: string): User {
    // Determine user role or create/find user
    let user = this.getCurrentUser();
    if (email.includes('elena')) {
      user = {
        id: 'usr-devops-2',
        email: 'elena.r@astradeploy.io',
        name: 'Elena Rostova',
        role: 'Admin',
      };
    } else if (email.includes('chen')) {
      user = {
        id: 'usr-ml-3',
        email: 'd.chen@astradeploy.io',
        name: 'David Chen',
        role: 'Engineer',
      };
    } else if (email.includes('auditor')) {
      user = {
        id: 'usr-audit-4',
        email: 'auditor@astradeploy.io',
        name: 'Marcus Vance',
        role: 'Viewer',
      };
    } else {
      user = {
        id: 'usr-senior-arch-1',
        email: email || 'principal.architect@astradeploy.io',
        name: email ? email.split('@')[0].replace('.', ' ') : 'Alex Rivera',
        role: 'Owner',
      };
    }

    this.setCurrentUser(user);
    if (this.isBrowser) {
      localStorage.setItem('astradeploy_auth_token', `astradeploy_token_${Date.now()}`);
    }
    this.logAuditEvent('USER_LOGIN', 'Auth', user.email, `User successfully authenticated as ${user.role}`);
    return user;
  }

  public register(name: string, email: string, role: User['role'], workspaceName?: string): { user: User; workspace: Workspace } {
    const user: User = {
      id: `usr-${Date.now().toString(36)}`,
      email,
      name,
      role,
    };
    this.setCurrentUser(user);

    // Create a personalized workspace for the new user
    const wsName = workspaceName || `${name}'s Cloud Workspace`;
    const newWs: Workspace = {
      id: `ws-${Date.now().toString(36)}`,
      name: wsName,
      slug: wsName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      monthlyBudget: 1500,
      currency: 'USD',
      createdDate: new Date().toISOString(),
      currentSpend: 0,
    };

    const currentWorkspaces = this.getWorkspaces();
    this.setItem(STORAGE_KEYS.WORKSPACES, [newWs, ...currentWorkspaces]);
    this.setCurrentWorkspaceId(newWs.id);

    // Add as Owner member of the new workspace
    const newMember: WorkspaceMember = {
      id: `mem-${Date.now().toString(36)}`,
      userId: user.id,
      workspaceId: newWs.id,
      name: user.name,
      email: user.email,
      role: 'Owner',
      joinedAt: new Date().toISOString(),
    };
    const currentMembers = this.getItem<WorkspaceMember[]>(STORAGE_KEYS.MEMBERS, []);
    this.setItem(STORAGE_KEYS.MEMBERS, [newMember, ...currentMembers]);

    if (this.isBrowser) {
      localStorage.setItem('astradeploy_auth_token', `astradeploy_token_${Date.now()}`);
    }
    this.logAuditEvent('USER_REGISTER', 'Auth', user.email, `New user registration with personal workspace '${newWs.name}'`);
    return { user, workspace: newWs };
  }

  public logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('astradeploy_auth_token');
    }
    this.logAuditEvent('USER_LOGOUT', 'Auth', this.getCurrentUser().email, 'User logged out of session');
  }

  public getCurrentUser(): User {
    return this.getItem<User>(STORAGE_KEYS.CURRENT_USER, SEED_USER);
  }

  public setCurrentUser(user: User): void {
    this.setItem(STORAGE_KEYS.CURRENT_USER, user);
  }

  public getWorkspaces(): Workspace[] {
    return this.getItem<Workspace[]>(STORAGE_KEYS.WORKSPACES, SEED_WORKSPACES);
  }

  public getCurrentWorkspaceId(): string {
    return this.getItem<string>(STORAGE_KEYS.CURRENT_WORKSPACE_ID, SEED_WORKSPACES[0].id);
  }

  public setCurrentWorkspaceId(id: string): void {
    this.setItem(STORAGE_KEYS.CURRENT_WORKSPACE_ID, id);
    this.logAuditEvent(
      'SWITCH_WORKSPACE',
      'Workspace',
      id,
      `Switched active context to workspace ${id}`
    );
  }

  public getCurrentWorkspace(): Workspace {
    const id = this.getCurrentWorkspaceId();
    const list = this.getWorkspaces();
    return list.find((w) => w.id === id) || list[0] || SEED_WORKSPACES[0];
  }

  public updateWorkspace(ws: Workspace): void {
    const list = this.getWorkspaces().map((item) => (item.id === ws.id ? ws : item));
    this.setItem(STORAGE_KEYS.WORKSPACES, list);
    this.logAuditEvent('UPDATE_WORKSPACE', 'Workspace', ws.name, `Updated workspace settings`);
  }

  public createWorkspace(name: string, budget: number): Workspace {
    const newWs: Workspace = {
      id: `ws-${Date.now().toString(36)}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      monthlyBudget: budget,
      currency: 'USD',
      createdDate: new Date().toISOString(),
      currentSpend: 0,
    };
    const list = [...this.getWorkspaces(), newWs];
    this.setItem(STORAGE_KEYS.WORKSPACES, list);
    this.setCurrentWorkspaceId(newWs.id);
    this.logAuditEvent('CREATE_WORKSPACE', 'Workspace', name, `Created new workspace with budget $${budget}`);
    return newWs;
  }

  // --- Workspaces Members & RBAC ---
  public getWorkspaceMembers(workspaceId?: string): WorkspaceMember[] {
    const wsId = workspaceId || this.getCurrentWorkspaceId();
    const all = this.getItem<WorkspaceMember[]>(STORAGE_KEYS.MEMBERS, SEED_MEMBERS);
    return all.filter((m) => m.workspaceId === wsId);
  }

  public addWorkspaceMember(email: string, name: string, role: User['role']): WorkspaceMember {
    const wsId = this.getCurrentWorkspaceId();
    const member: WorkspaceMember = {
      id: `mem-${Date.now().toString(36)}`,
      userId: `usr-${Date.now().toString(36)}`,
      workspaceId: wsId,
      name,
      email,
      role,
      joinedAt: new Date().toISOString(),
    };
    const all = [...this.getItem<WorkspaceMember[]>(STORAGE_KEYS.MEMBERS, SEED_MEMBERS), member];
    this.setItem(STORAGE_KEYS.MEMBERS, all);
    this.logAuditEvent('INVITE_MEMBER', 'User', email, `Invited user as ${role}`);
    return member;
  }

  // --- Workloads (Tenant Isolated) ---
  public getWorkloads(workspaceId?: string): Workload[] {
    const wsId = workspaceId || this.getCurrentWorkspaceId();
    const all = this.getItem<Workload[]>(STORAGE_KEYS.WORKLOADS, SEED_WORKLOADS);
    return all.filter((w) => w.workspaceId === wsId);
  }

  public getWorkloadById(id: string): Workload | undefined {
    const all = this.getItem<Workload[]>(STORAGE_KEYS.WORKLOADS, SEED_WORKLOADS);
    return all.find((w) => w.id === id);
  }

  public createWorkload(data: Omit<Workload, 'id' | 'workspaceId' | 'createdAt' | 'updatedAt'>): Workload {
    const wsId = this.getCurrentWorkspaceId();
    const newWorkload: Workload = {
      ...data,
      id: `wl-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      workspaceId: wsId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const all = [...this.getItem<Workload[]>(STORAGE_KEYS.WORKLOADS, SEED_WORKLOADS), newWorkload];
    this.setItem(STORAGE_KEYS.WORKLOADS, all);

    // Automatically compute recommendation
    const rec = calculateDeterministicRecommendation(newWorkload);
    this.saveRecommendation(rec);

    this.logAuditEvent(
      'CREATE_WORKLOAD',
      'Workload',
      newWorkload.name,
      `Created ${newWorkload.type} workload in ${newWorkload.environment} (${newWorkload.provider})`
    );
    return newWorkload;
  }

  public updateWorkload(workload: Workload): void {
    const all = this.getItem<Workload[]>(STORAGE_KEYS.WORKLOADS, SEED_WORKLOADS).map((w) =>
      w.id === workload.id ? { ...workload, updatedAt: new Date().toISOString() } : w
    );
    this.setItem(STORAGE_KEYS.WORKLOADS, all);
    // Recalculate recommendation
    const rec = calculateDeterministicRecommendation(workload);
    this.saveRecommendation(rec);

    this.logAuditEvent('UPDATE_WORKLOAD', 'Workload', workload.name, `Updated workload configuration`);
  }

  public deleteWorkload(id: string): void {
    const workload = this.getWorkloadById(id);
    const all = this.getItem<Workload[]>(STORAGE_KEYS.WORKLOADS, SEED_WORKLOADS).filter((w) => w.id !== id);
    this.setItem(STORAGE_KEYS.WORKLOADS, all);
    if (workload) {
      this.logAuditEvent('DELETE_WORKLOAD', 'Workload', workload.name, `Deleted workload`);
    }
  }

  // --- Recommendations ---
  public getRecommendations(): ResourceRecommendation[] {
    return this.getItem<ResourceRecommendation[]>(STORAGE_KEYS.RECOMMENDATIONS, []);
  }

  public getRecommendationForWorkload(workloadId: string): ResourceRecommendation | undefined {
    const all = this.getRecommendations();
    return all.find((r) => r.workloadId === workloadId);
  }

  public saveRecommendation(rec: ResourceRecommendation): void {
    const all = this.getRecommendations().filter((r) => r.workloadId !== rec.workloadId);
    this.setItem(STORAGE_KEYS.RECOMMENDATIONS, [...all, rec]);
  }

  // --- Cloud Providers ---
  public getProviders(): CloudProviderConnection[] {
    return this.getItem<CloudProviderConnection[]>(STORAGE_KEYS.PROVIDERS, SEED_PROVIDERS);
  }

  public updateProvider(provider: CloudProviderConnection): void {
    const all = this.getProviders().map((p) => (p.id === provider.id ? provider : p));
    this.setItem(STORAGE_KEYS.PROVIDERS, all);
    this.logAuditEvent('SYNC_PROVIDER', 'CloudProvider', provider.name, `Validated provider status`);
  }

  // --- Provisioning Plans ---
  public getPlans(workspaceId?: string): ProvisioningPlan[] {
    const wsId = workspaceId || this.getCurrentWorkspaceId();
    const all = this.getItem<ProvisioningPlan[]>(STORAGE_KEYS.PLANS, []);
    return all.filter((p) => p.workspaceId === wsId);
  }

  public savePlan(plan: ProvisioningPlan): void {
    const all = [...this.getItem<ProvisioningPlan[]>(STORAGE_KEYS.PLANS, []), plan];
    this.setItem(STORAGE_KEYS.PLANS, all);
    this.logAuditEvent(
      'GENERATE_PLAN',
      'ProvisioningPlan',
      plan.title,
      `Generated plan with ${plan.planSummary.add} resources to add`
    );
  }

  public approveAndApplyPlan(planId: string): void {
    const plans = this.getItem<ProvisioningPlan[]>(STORAGE_KEYS.PLANS, []).map((p) =>
      p.id === planId ? { ...p, status: 'applied' as const } : p
    );
    this.setItem(STORAGE_KEYS.PLANS, plans);
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      this.logAuditEvent(
        'APPLY_PLAN',
        'ProvisioningPlan',
        plan.title,
        `Explicitly approved and applied Terraform plan`
      );
    }
  }

  // --- Deployments ---
  public getDeployments(workspaceId?: string): Deployment[] {
    const wsId = workspaceId || this.getCurrentWorkspaceId();
    const all = this.getItem<Deployment[]>(STORAGE_KEYS.DEPLOYMENTS, SEED_DEPLOYMENTS);
    return all.filter((d) => d.workspaceId === wsId);
  }

  public createDeployment(data: Omit<Deployment, 'id' | 'workspaceId' | 'deployedAt'>): Deployment {
    const wsId = this.getCurrentWorkspaceId();
    const dep: Deployment = {
      ...data,
      id: `dep-${Date.now().toString(36)}`,
      workspaceId: wsId,
      deployedAt: new Date().toISOString(),
    };
    const all = [dep, ...this.getItem<Deployment[]>(STORAGE_KEYS.DEPLOYMENTS, SEED_DEPLOYMENTS)];
    this.setItem(STORAGE_KEYS.DEPLOYMENTS, all);
    this.logAuditEvent('TRIGGER_DEPLOYMENT', 'Deployment', dep.workloadName, `Triggered ${dep.strategy} release ${dep.version}`);
    return dep;
  }

  // --- Cost Optimizations ---
  public getCostOptimizations(workspaceId?: string): CostOptimization[] {
    const wsId = workspaceId || this.getCurrentWorkspaceId();
    const all = this.getItem<CostOptimization[]>(STORAGE_KEYS.COST_OPTIMIZATIONS, SEED_COST_OPTIMIZATIONS);
    return all.filter((o) => o.workspaceId === wsId);
  }

  public applyCostOptimization(id: string): void {
    const all = this.getItem<CostOptimization[]>(STORAGE_KEYS.COST_OPTIMIZATIONS, SEED_COST_OPTIMIZATIONS).map((o) =>
      o.id === id ? { ...o, status: 'applied' as const } : o
    );
    this.setItem(STORAGE_KEYS.COST_OPTIMIZATIONS, all);
    const item = all.find((o) => o.id === id);
    if (item) {
      this.logAuditEvent('APPLY_OPTIMIZATION', 'CostOptimization', item.title, `Applied cost savings action saving $${item.monthlySavings}/mo`);
    }
  }

  // --- MLOps: Experiments, Models, Pipelines ---
  public getMLExperiments(workspaceId?: string): MLExperiment[] {
    const wsId = workspaceId || this.getCurrentWorkspaceId();
    const all = this.getItem<MLExperiment[]>(STORAGE_KEYS.ML_EXPERIMENTS, SEED_ML_EXPERIMENTS);
    return all.filter((e) => e.workspaceId === wsId);
  }

  public createMLExperiment(name: string, description: string, framework: MLExperiment['framework'], datasetName: string): MLExperiment {
    const wsId = this.getCurrentWorkspaceId();
    const exp: MLExperiment = {
      id: `exp-${Date.now().toString(36)}`,
      workspaceId: wsId,
      name,
      description,
      framework,
      datasetName,
      datasetSamples: 100000,
      runs: [],
      createdAt: new Date().toISOString(),
    };
    const all = [...this.getItem<MLExperiment[]>(STORAGE_KEYS.ML_EXPERIMENTS, SEED_ML_EXPERIMENTS), exp];
    this.setItem(STORAGE_KEYS.ML_EXPERIMENTS, all);
    this.logAuditEvent('CREATE_ML_EXPERIMENT', 'MLExperiment', name, `Created experiment with framework ${framework}`);
    return exp;
  }

  public getMLModels(workspaceId?: string): MLModel[] {
    const wsId = workspaceId || this.getCurrentWorkspaceId();
    const all = this.getItem<MLModel[]>(STORAGE_KEYS.ML_MODELS, SEED_ML_MODELS);
    return all.filter((m) => m.workspaceId === wsId);
  }

  public promoteModelStage(modelId: string, versionId: string, newStage: 'Development' | 'Staging' | 'Production' | 'Archived'): void {
    const all = this.getItem<MLModel[]>(STORAGE_KEYS.ML_MODELS, SEED_ML_MODELS).map((m) => {
      if (m.id === modelId) {
        return {
          ...m,
          versions: m.versions.map((v) => (v.id === versionId ? { ...v, stage: newStage } : v)),
        };
      }
      return m;
    });
    this.setItem(STORAGE_KEYS.ML_MODELS, all);
    this.logAuditEvent('PROMOTE_MODEL_STAGE', 'MLModel', modelId, `Promoted version ${versionId} to stage ${newStage}`);
  }

  public getMLPipelines(workspaceId?: string): MLPipeline[] {
    const wsId = workspaceId || this.getCurrentWorkspaceId();
    const all = this.getItem<MLPipeline[]>(STORAGE_KEYS.ML_PIPELINES, SEED_ML_PIPELINES);
    return all.filter((p) => p.workspaceId === wsId);
  }

  // --- Alerts & Incidents ---
  public getAlertRules(workspaceId?: string): AlertRule[] {
    const wsId = workspaceId || this.getCurrentWorkspaceId();
    const all = this.getItem<AlertRule[]>(STORAGE_KEYS.ALERTS, SEED_ALERT_RULES);
    return all.filter((a) => a.workspaceId === wsId);
  }

  public getIncidents(workspaceId?: string): Incident[] {
    const wsId = workspaceId || this.getCurrentWorkspaceId();
    const all = this.getItem<Incident[]>(STORAGE_KEYS.INCIDENTS, SEED_INCIDENTS);
    return all.filter((i) => i.workspaceId === wsId);
  }

  public resolveIncident(id: string, rootCause: string): void {
    const all = this.getItem<Incident[]>(STORAGE_KEYS.INCIDENTS, SEED_INCIDENTS).map((i) =>
      i.id === id ? { ...i, status: 'resolved' as const, resolvedAt: new Date().toISOString(), rootCause } : i
    );
    this.setItem(STORAGE_KEYS.INCIDENTS, all);
    this.logAuditEvent('RESOLVE_INCIDENT', 'Incident', id, `Resolved incident: ${rootCause}`);
  }

  // --- Audit Logs ---
  public getAuditLogs(workspaceId?: string): AuditLog[] {
    const wsId = workspaceId || this.getCurrentWorkspaceId();
    const all = this.getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS);
    return all.filter((l) => l.workspaceId === wsId);
  }

  public logAuditEvent(action: string, resourceType: string, resourceName: string, details: string): void {
    const user = this.getCurrentUser();
    const wsId = this.getCurrentWorkspaceId();
    const entry: AuditLog = {
      id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      workspaceId: wsId,
      actorEmail: user.email,
      actorRole: user.role,
      action,
      resourceType,
      resourceName,
      details,
      ipAddress: '198.51.100.24',
      timestamp: new Date().toISOString(),
    };
    const all = [entry, ...this.getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS)].slice(0, 100);
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, all);
  }

  // --- Telemetry Metrics Simulator ---
  public getWorkloadMetrics(workloadId: string): MetricPoint[] {
    const points: MetricPoint[] = [];
    const now = new Date();
    // Generate realistic trailing 12 data points
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 5 * 60 * 1000);
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      // deterministic variation based on time
      const seed = (d.getMinutes() + i * 7) % 20;
      points.push({
        time: timeStr,
        cpuPct: Math.min(88, Math.max(22, 45 + seed + (i % 2 === 0 ? 5 : -4))),
        memoryPct: Math.min(85, Math.max(35, 58 + (seed % 10))),
        rps: Math.round(1800 + seed * 45 - (i % 3) * 60),
        p95LatencyMs: Math.round(38 + (seed % 8) * 2),
        errorRatePct: Number((0.02 + (seed > 15 ? 0.08 : 0.01)).toFixed(2)),
      });
    }
    return points;
  }
}

export const storage = new StorageService();
