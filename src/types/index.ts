export type WorkloadType =
  | 'web_api'
  | 'microservice'
  | 'batch_etl'
  | 'ml_training'
  | 'ml_inference'
  | 'database'
  | 'realtime_socket';

export type Environment = 'development' | 'staging' | 'production';

export type CloudProviderName = 'AWS' | 'Azure' | 'GCP';

export type ScalingPreference = 'cost_optimized' | 'balanced' | 'performance_first';

export type UserRole = 'Owner' | 'Admin' | 'Engineer' | 'Viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  monthlyBudget: number;
  currency: string;
  createdDate: string;
  currentSpend: number;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: string;
}

export interface Workload {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  type: WorkloadType;
  environment: Environment;
  provider: CloudProviderName;
  region: string;
  cpuCores: number;
  memoryGb: number;
  storageGb: number;
  expectedRps: number;
  p99LatencyTargetMs: number;
  availabilitySla: number; // e.g. 99.9 or 99.99
  scalingPreference: ScalingPreference;
  budgetMonthlyLimit: number;
  tags: string[];
  status: 'running' | 'provisioning' | 'stopped' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface ProviderInstanceOption {
  provider: CloudProviderName;
  instanceType: string;
  vCpu: number;
  memoryGb: number;
  hourlyPrice: number;
  monthlyPrice: number;
  spotSavingsPct: number;
  networkGbps: string;
  description: string;
}

export interface ResourceRecommendation {
  id: string;
  workloadId: string;
  workloadName: string;
  generatedAt: string;
  algorithmType: 'deterministic_rules' | 'ml_random_forest';
  recommendedCpu: number;
  recommendedMemoryGb: number;
  recommendedStorageGb: number;
  recommendedReplicasMin: number;
  recommendedReplicasMax: number;
  recommendedInstance: ProviderInstanceOption;
  alternativeInstances: ProviderInstanceOption[];
  monthlyCostEstimate: number;
  potentialSavingsMonthly: number;
  confidenceScore: number; // 0 to 100
  explanations: string[];
  tradeOffs: string[];
  assumptions: string[];
  riskAssessment: 'Low Risk' | 'Moderate Risk' | 'High Performance Ceiling';
}

export interface CloudProviderConnection {
  id: string;
  provider: CloudProviderName;
  name: string;
  accountId: string;
  status: 'connected' | 'disconnected' | 'read_only_verified';
  region: string;
  discoveredResourcesCount: number;
  lastSyncAt: string;
  iamRoleArn: string;
  costToDate: number;
}

export interface ProvisioningPlan {
  id: string;
  workspaceId: string;
  workloadId: string;
  workloadName: string;
  provider: CloudProviderName;
  title: string;
  terraformHcl: string;
  planSummary: {
    add: number;
    change: number;
    destroy: number;
  };
  estimatedMonthlyCostDelta: number;
  securityChecks: { rule: string; passed: boolean; note: string }[];
  status: 'draft' | 'validated' | 'approved' | 'applied';
  createdBy: string;
  createdAt: string;
}

export interface Deployment {
  id: string;
  workspaceId: string;
  workloadId: string;
  workloadName: string;
  version: string;
  environment: Environment;
  strategy: 'canary' | 'rolling' | 'blue_green';
  status: 'healthy' | 'deploying' | 'failed' | 'rolled_back';
  commitSha: string;
  trafficDistribution: { primary: number; canary: number };
  activePods: number;
  deployedAt: string;
}

export interface MetricPoint {
  time: string;
  cpuPct: number;
  memoryPct: number;
  rps: number;
  p95LatencyMs: number;
  errorRatePct: number;
}

export interface CostOptimization {
  id: string;
  workspaceId: string;
  workloadId?: string;
  title: string;
  resourceType: string;
  currentMonthlyCost: number;
  optimizedMonthlyCost: number;
  monthlySavings: number;
  savingsPercentage: number;
  effort: 'Low' | 'Medium' | 'High';
  recommendationType: 'rightsizing' | 'idle_cleanup' | 'savings_plan' | 'storage_tiering';
  status: 'open' | 'applied' | 'dismissed';
}

export interface MLRun {
  id: string;
  experimentId: string;
  runNumber: number;
  parameters: {
    learning_rate: number;
    batch_size: number;
    epochs: number;
    optimizer: string;
    model_architecture: string;
  };
  metrics: {
    train_loss: number;
    val_loss: number;
    accuracy?: number;
    f1_score?: number;
    rmse?: number;
  };
  lossHistory: { step: number; loss: number; valLoss: number }[];
  durationSec: number;
  status: 'completed' | 'running' | 'failed';
  artifactUri: string;
  createdAt: string;
}

export interface MLExperiment {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  framework: 'PyTorch' | 'TensorFlow' | 'scikit-learn' | 'XGBoost';
  datasetName: string;
  datasetSamples: number;
  runs: MLRun[];
  createdAt: string;
}

export interface MLModelVersion {
  id: string;
  modelId: string;
  version: string;
  runId: string;
  stage: 'Development' | 'Staging' | 'Production' | 'Archived';
  metrics: { f1: number; latencyMs: number; sizeMb: number };
  checksum: string;
  deployedWorkloadId?: string;
  createdAt: string;
}

export interface MLModel {
  id: string;
  workspaceId: string;
  name: string;
  task: 'Classification' | 'Regression' | 'NLP' | 'Recommendation' | 'Time-Series';
  framework: string;
  versions: MLModelVersion[];
  tags: string[];
}

export interface MLPipelineStage {
  id: string;
  name: string;
  status: 'success' | 'running' | 'pending' | 'failed';
  duration: string;
  stepOutputSummary: string;
}

export interface MLPipeline {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  stages: MLPipelineStage[];
  trigger: 'git_commit' | 'scheduled_cron' | 'manual';
  lastRunStatus: 'success' | 'failed' | 'running';
  lastRunAt: string;
}

export interface AlertRule {
  id: string;
  workspaceId: string;
  name: string;
  metric: string;
  operator: '>' | '<';
  threshold: number;
  durationMinutes: number;
  severity: 'critical' | 'warning' | 'info';
  enabled: boolean;
}

export interface Incident {
  id: string;
  workspaceId: string;
  title: string;
  workloadName: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'open' | 'acknowledged' | 'resolved';
  metricValue: string;
  threshold: string;
  triggeredAt: string;
  resolvedAt?: string;
  rootCause?: string;
}

export interface AuditLog {
  id: string;
  workspaceId: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  resourceType: string;
  resourceName: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  workloadLimit: number;
  features: string[];
  recommended?: boolean;
}

export interface BillingInvoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  planName: string;
  invoiceNumber: string;
}

export interface PaymentMethod {
  id: string;
  brand: 'Visa' | 'Mastercard' | 'Amex';
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}
