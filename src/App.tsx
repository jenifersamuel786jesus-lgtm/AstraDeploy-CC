/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { storage } from './services/storage';
import { Navbar } from './components/Navbar';
import { Sidebar, ViewType } from './components/Sidebar';

// Views
import { AuthView } from './components/views/AuthView';
import { OverviewView } from './components/views/OverviewView';
import { WorkloadsView } from './components/views/WorkloadsView';
import { WorkloadDetailsView } from './components/views/WorkloadDetailsView';
import { ResourceRecommendationsView } from './components/views/ResourceRecommendationsView';
import { CloudProvidersView } from './components/views/CloudProvidersView';
import { ProvisioningPlansView } from './components/views/ProvisioningPlansView';
import { DeploymentsView } from './components/views/DeploymentsView';
import { MonitoringView } from './components/views/MonitoringView';
import { CostIntelligenceView } from './components/views/CostIntelligenceView';
import { OptimizationRecommendationsView } from './components/views/OptimizationRecommendationsView';
import { BillingPaymentView } from './components/views/BillingPaymentView';
import { MLExperimentsView } from './components/views/MLExperimentsView';
import { ModelRegistryView } from './components/views/ModelRegistryView';
import { MLPipelinesView } from './components/views/MLPipelinesView';
import { AlertsAndIncidentsView } from './components/views/AlertsAndIncidentsView';
import { ReportsView } from './components/views/ReportsView';
import { AuditLogsView } from './components/views/AuditLogsView';
import { TeamAndWorkspacesView } from './components/views/TeamAndWorkspacesView';
import { SettingsView } from './components/views/SettingsView';

// Modals
import { CreateWorkloadModal } from './components/modals/CreateWorkloadModal';
import { NewWorkspaceModal } from './components/modals/NewWorkspaceModal';
import { LiveDeploymentTerminalModal } from './components/modals/LiveDeploymentTerminalModal';
import { BeginnerModelWizardModal } from './components/modals/BeginnerModelWizardModal';

// Types
import {
  Workload,
  ResourceRecommendation,
  Deployment,
  ProvisioningPlan,
  CloudProviderConnection,
  UserRole,
} from './types';
import { calculateDeterministicRecommendation } from './services/recommendationEngine';
import { createProvisioningPlan } from './services/terraformEngine';

export default function App() {
  const [isAuth, setIsAuth] = useState(storage.isAuthenticated());
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [selectedWorkloadId, setSelectedWorkloadId] = useState<string>('');

  // Modals
  const [isCreateWorkloadOpen, setIsCreateWorkloadOpen] = useState(false);
  const [isNewWorkspaceOpen, setIsNewWorkspaceOpen] = useState(false);
  const [isBeginnerWizardOpen, setIsBeginnerWizardOpen] = useState(false);
  const [liveDeployModal, setLiveDeployModal] = useState<{
    isOpen: boolean;
    deployment: Deployment | null;
    workload?: Workload;
  }>({
    isOpen: false,
    deployment: null,
  });

  // Tenant / Context state
  const [currentUser, setCurrentUser] = useState(storage.getCurrentUser());
  const [currentWorkspace, setCurrentWorkspace] = useState(storage.getCurrentWorkspace());
  const [workspaces, setWorkspaces] = useState(storage.getWorkspaces());

  // Isolated workspace state
  const [workloads, setWorkloads] = useState<Workload[]>([]);
  const [recommendations, setRecommendations] = useState<ResourceRecommendation[]>([]);
  const [providers, setProviders] = useState<CloudProviderConnection[]>([]);
  const [plans, setPlans] = useState<ProvisioningPlan[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [optimizations, setOptimizations] = useState(storage.getCostOptimizations());
  const [experiments, setExperiments] = useState(storage.getMLExperiments());
  const [models, setModels] = useState(storage.getMLModels());
  const [pipelines, setPipelines] = useState(storage.getMLPipelines());
  const [alertRules, setAlertRules] = useState(storage.getAlertRules());
  const [incidents, setIncidents] = useState(storage.getIncidents());
  const [auditLogs, setAuditLogs] = useState(storage.getAuditLogs());
  const [members, setMembers] = useState(storage.getWorkspaceMembers());

  // Reload data whenever current workspace changes
  const refreshTenantData = () => {
    const ws = storage.getCurrentWorkspace();
    setCurrentWorkspace(ws);
    setWorkspaces(storage.getWorkspaces());

    const wls = storage.getWorkloads(ws.id);
    setWorkloads(wls);
    if (!selectedWorkloadId && wls.length > 0) {
      setSelectedWorkloadId(wls[0].id);
    }

    setRecommendations(storage.getRecommendations());
    setProviders(storage.getProviders());
    setPlans(storage.getPlans(ws.id));
    setDeployments(storage.getDeployments(ws.id));
    setOptimizations(storage.getCostOptimizations(ws.id));
    setExperiments(storage.getMLExperiments(ws.id));
    setModels(storage.getMLModels(ws.id));
    setPipelines(storage.getMLPipelines(ws.id));
    setAlertRules(storage.getAlertRules(ws.id));
    setIncidents(storage.getIncidents(ws.id));
    setAuditLogs(storage.getAuditLogs(ws.id));
    setMembers(storage.getWorkspaceMembers(ws.id));
  };

  useEffect(() => {
    refreshTenantData();
  }, []);

  const handleLoginSuccess = (user: any) => {
    storage.setCurrentUser(user);
    setCurrentUser(user);
    setIsAuth(true);
    refreshTenantData();
  };

  const handleLogout = () => {
    storage.logout();
    setIsAuth(false);
  };

  const handleSelectWorkspace = (id: string) => {
    storage.setCurrentWorkspaceId(id);
    setSelectedWorkloadId('');
    refreshTenantData();
  };

  const handleCreateWorkload = (
    data: Omit<Workload, 'id' | 'workspaceId' | 'createdAt' | 'updatedAt'>
  ) => {
    const newWl = storage.createWorkload(data);
    refreshTenantData();
    setSelectedWorkloadId(newWl.id);
    setCurrentView('workload-details');
  };

  const handleDeleteWorkload = (id: string) => {
    storage.deleteWorkload(id);
    refreshTenantData();
    if (selectedWorkloadId === id) {
      setSelectedWorkloadId('');
    }
  };

  const handleGeneratePlan = (workload: Workload) => {
    const rec =
      storage.getRecommendationForWorkload(workload.id) ||
      calculateDeterministicRecommendation(workload);
    const plan = createProvisioningPlan(workload, rec, currentUser.email);
    storage.savePlan(plan);
    refreshTenantData();
    setCurrentView('plans');
  };

  const handleApproveAndApplyPlan = (planId: string) => {
    storage.approveAndApplyPlan(planId);
    refreshTenantData();
  };

  const handleTriggerDeploy = (
    depData: Omit<Deployment, 'id' | 'workspaceId' | 'deployedAt'>
  ) => {
    const newDep = storage.createDeployment(depData);
    refreshTenantData();
    const targetWl = workloads.find((w) => w.id === depData.workloadId);
    setLiveDeployModal({
      isOpen: true,
      deployment: newDep,
      workload: targetWl,
    });
  };

  const handleRollback = (deploymentId: string) => {
    storage.logAuditEvent(
      'ROLLBACK_DEPLOYMENT',
      'Deployment',
      deploymentId,
      'Rolled back deployment to previous stable revision'
    );
    refreshTenantData();
  };

  const handlePromoteCanary = (deploymentId: string) => {
    const all = storage.getDeployments().map((d) =>
      d.id === deploymentId
        ? {
            ...d,
            trafficDistribution: { primary: 100, canary: 0 },
            status: 'healthy' as const,
          }
        : d
    );
    if (typeof window !== 'undefined') {
      localStorage.setItem('astradeploy_deployments', JSON.stringify(all));
    }
    storage.logAuditEvent(
      'PROMOTE_CANARY',
      'Deployment',
      deploymentId,
      'Promoted Canary version to 100% production traffic'
    );
    refreshTenantData();
  };

  const handleApplyOptimization = (id: string) => {
    storage.applyCostOptimization(id);
    refreshTenantData();
  };

  const handleResolveIncident = (id: string, rootCause: string) => {
    storage.resolveIncident(id, rootCause);
    refreshTenantData();
  };

  const handlePromoteStage = (
    modelId: string,
    versionId: string,
    newStage: 'Development' | 'Staging' | 'Production' | 'Archived'
  ) => {
    storage.promoteModelStage(modelId, versionId, newStage);
    refreshTenantData();
  };

  const handleCreateExperiment = (
    name: string,
    desc: string,
    framework: any,
    dataset: string
  ) => {
    storage.createMLExperiment(name, desc, framework, dataset);
    refreshTenantData();
  };

  const handleNewWorkspace = (name: string, budget: number) => {
    storage.createWorkspace(name, budget);
    refreshTenantData();
  };

  const handleAddMember = (email: string, name: string, role: UserRole) => {
    storage.addWorkspaceMember(email, name, role);
    refreshTenantData();
  };

  const handleUpdateWorkspace = (ws: typeof currentWorkspace) => {
    storage.updateWorkspace(ws);
    refreshTenantData();
  };

  const handleRecalculateWorkloadSizing = (
    workload: Workload,
    mode: 'deterministic_rules' | 'ml_random_forest'
  ) => {
    const rec = calculateDeterministicRecommendation(workload, mode);
    storage.saveRecommendation(rec);
    refreshTenantData();
  };

  const handleAutoRegisterAndDeploy = (modelName: string, task: string, rps: number) => {
    const cleanName = modelName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, ' ');
    const newWl = storage.createWorkload({
      name: `${cleanName} API`,
      description: `Auto-sized production serving endpoint for ${modelName} (${task})`,
      type: 'ml_inference',
      environment: 'production',
      provider: 'AWS',
      region: 'us-east-1',
      cpuCores: rps > 100 ? 4 : 2,
      memoryGb: rps > 100 ? 16 : 8,
      storageGb: 50,
      expectedRps: rps,
      p99LatencyTargetMs: 35,
      availabilitySla: 99.95,
      scalingPreference: 'balanced',
      budgetMonthlyLimit: 400,
      tags: ['beginner-wizard', 'auto-sized', task.toLowerCase()],
      status: 'running',
    });
    refreshTenantData();
    setSelectedWorkloadId(newWl.id);
    setCurrentView('workload-details');
  };

  const selectedWorkload = workloads.find((w) => w.id === selectedWorkloadId);
  const selectedRecommendation = selectedWorkload
    ? storage.getRecommendationForWorkload(selectedWorkload.id)
    : undefined;
  const selectedMetrics = selectedWorkload
    ? storage.getWorkloadMetrics(selectedWorkload.id)
    : [];

  // If user is not authenticated, show real-time Auth screen!
  if (!isAuth) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        currentWorkspace={currentWorkspace}
        workspaces={workspaces}
        onSelectWorkspace={handleSelectWorkspace}
        onOpenCreateWorkload={() => setIsCreateWorkloadOpen(true)}
        onOpenNewWorkspace={() => setIsNewWorkspaceOpen(true)}
        onLogout={handleLogout}
        onOpenBeginnerWizard={() => setIsBeginnerWizardOpen(true)}
      />

      {/* Main Body with Sidebar + View Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          workloadCount={workloads.length}
          openIncidentsCount={incidents.filter((i) => i.status !== 'resolved').length}
          optimizationCount={optimizations.filter((o) => o.status === 'open').length}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar bg-slate-950/40">
          <div className="max-w-7xl mx-auto">
            {currentView === 'overview' && (
              <OverviewView
                currentWorkspace={currentWorkspace}
                workloads={workloads}
                optimizations={optimizations}
                incidents={incidents}
                deployments={deployments}
                onNavigate={setCurrentView}
                onSelectWorkload={(id) => {
                  setSelectedWorkloadId(id);
                  setCurrentView('workload-details');
                }}
                onOpenCreateWorkload={() => setIsCreateWorkloadOpen(true)}
              />
            )}

            {currentView === 'workloads' && (
              <WorkloadsView
                workloads={workloads}
                onSelectWorkload={(id) => {
                  setSelectedWorkloadId(id);
                  setCurrentView('workload-details');
                }}
                onOpenCreateModal={() => setIsCreateWorkloadOpen(true)}
                onGeneratePlan={handleGeneratePlan}
                onDeleteWorkload={handleDeleteWorkload}
              />
            )}

            {currentView === 'workload-details' && (
              <WorkloadDetailsView
                workload={selectedWorkload || workloads[0]}
                recommendation={selectedRecommendation}
                metrics={selectedMetrics}
                allWorkloads={workloads}
                onSelectWorkload={setSelectedWorkloadId}
                onBack={() => setCurrentView('workloads')}
                onGeneratePlan={handleGeneratePlan}
                onTriggerDeploy={(wl) => {
                  handleTriggerDeploy({
                    workloadId: wl.id,
                    workloadName: wl.name,
                    version: 'v2.16.0',
                    environment: wl.environment,
                    strategy: 'canary',
                    status: 'healthy',
                    commitSha: '8b3c10a',
                    trafficDistribution: { primary: 80, canary: 20 },
                    activePods: 4,
                  });
                }}
                onRecalculate={handleRecalculateWorkloadSizing}
              />
            )}

            {currentView === 'recommendations' && (
              <ResourceRecommendationsView workloads={workloads} />
            )}

            {currentView === 'providers' && (
              <CloudProvidersView
                providers={providers}
                onUpdateProvider={(prov) => {
                  storage.updateProvider(prov);
                  refreshTenantData();
                }}
              />
            )}

            {currentView === 'plans' && (
              <ProvisioningPlansView
                plans={plans}
                onApproveAndApply={handleApproveAndApplyPlan}
              />
            )}

            {currentView === 'deployments' && (
              <DeploymentsView
                deployments={deployments}
                workloads={workloads}
                onTriggerDeploy={handleTriggerDeploy}
                onRollback={handleRollback}
              />
            )}

            {currentView === 'monitoring' && (
              <MonitoringView workloads={workloads} />
            )}

            {currentView === 'cost-intelligence' && (
              <CostIntelligenceView
                currentWorkspace={currentWorkspace}
                workloads={workloads}
                recommendations={recommendations}
                onUpdateWorkspace={handleUpdateWorkspace}
              />
            )}

            {currentView === 'optimizations' && (
              <OptimizationRecommendationsView
                optimizations={optimizations}
                onApplyOptimization={handleApplyOptimization}
              />
            )}

            {currentView === 'billing' && <BillingPaymentView />}

            {currentView === 'ml-experiments' && (
              <MLExperimentsView
                experiments={experiments}
                onCreateExperiment={handleCreateExperiment}
              />
            )}

            {currentView === 'model-registry' && (
              <ModelRegistryView
                models={models}
                onPromoteStage={handlePromoteStage}
              />
            )}

            {currentView === 'ml-pipelines' && (
              <MLPipelinesView pipelines={pipelines} />
            )}

            {currentView === 'alerts' && (
              <AlertsAndIncidentsView
                alertRules={alertRules}
                incidents={incidents}
                onResolveIncident={handleResolveIncident}
              />
            )}

            {currentView === 'reports' && (
              <ReportsView
                currentWorkspace={currentWorkspace}
                workloads={workloads}
                recommendations={recommendations}
                optimizations={optimizations}
              />
            )}

            {currentView === 'audit-logs' && (
              <AuditLogsView logs={auditLogs} />
            )}

            {currentView === 'team' && (
              <TeamAndWorkspacesView
                workspaces={workspaces}
                currentWorkspace={currentWorkspace}
                members={members}
                onSelectWorkspace={handleSelectWorkspace}
                onOpenNewWorkspace={() => setIsNewWorkspaceOpen(true)}
                onAddMember={handleAddMember}
              />
            )}

            {currentView === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <CreateWorkloadModal
        isOpen={isCreateWorkloadOpen}
        onClose={() => setIsCreateWorkloadOpen(false)}
        onCreate={handleCreateWorkload}
      />

      <NewWorkspaceModal
        isOpen={isNewWorkspaceOpen}
        onClose={() => setIsNewWorkspaceOpen(false)}
        onCreate={handleNewWorkspace}
      />

      {/* Beginner Guide Modal */}
      <BeginnerModelWizardModal
        isOpen={isBeginnerWizardOpen}
        onClose={() => setIsBeginnerWizardOpen(false)}
        onAutoRegisterAndDeploy={handleAutoRegisterAndDeploy}
      />

      {/* Real-Time Live Streaming Deployment Terminal */}
      <LiveDeploymentTerminalModal
        isOpen={liveDeployModal.isOpen}
        deployment={liveDeployModal.deployment}
        workload={liveDeployModal.workload}
        onClose={() => setLiveDeployModal({ isOpen: false, deployment: null })}
        onPromoteCanary={handlePromoteCanary}
        onRollback={handleRollback}
      />
    </div>
  );
}
