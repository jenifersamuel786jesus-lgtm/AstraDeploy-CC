import React, { useState, useEffect, useRef } from 'react';
import {
  GitFork,
  Play,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Layers,
  Database,
  Cpu,
  ShieldCheck,
  Check,
  Terminal,
  AlertTriangle,
  Plus,
  Sparkles,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { MLPipeline, MLPipelineStage } from '../../types';

interface MLPipelinesViewProps {
  pipelines: MLPipeline[];
  onExecutePipeline?: (pipelineId: string) => void;
  onCreatePipeline?: (name: string, description: string, trigger: any) => void;
}

export const MLPipelinesView: React.FC<MLPipelinesViewProps> = ({
  pipelines,
  onExecutePipeline,
  onCreatePipeline,
}) => {
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>(
    pipelines[0]?.id || ''
  );
  const [isRunning, setIsRunning] = useState(false);
  const [activeStageIdx, setActiveStageIdx] = useState<number | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTrigger, setNewTrigger] = useState<any>('scheduled_cron');
  const [executionSuccessNotice, setExecutionSuccessNotice] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync active pipeline with prop changes safely
  useEffect(() => {
    if (pipelines.length > 0) {
      if (!selectedPipelineId || !pipelines.some((p) => p.id === selectedPipelineId)) {
        setSelectedPipelineId(pipelines[0].id);
      }
    }
  }, [pipelines, selectedPipelineId]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const activePipeline =
    pipelines.find((p) => p.id === selectedPipelineId) || pipelines[0];

  const handleRunPipeline = () => {
    if (!activePipeline || !activePipeline.stages || activePipeline.stages.length === 0) {
      return;
    }

    setIsRunning(true);
    setExecutionSuccessNotice(false);
    setActiveStageIdx(0);

    const logMessages = [
      `[00:01] Initializing Pipeline DAG run: ${activePipeline.name}...`,
      `[00:03] Stage 1 [Feature Extraction]: Querying Feast Feature Store for partition 2026-Q1...`,
      `[00:04] Stage 1 [Drift Audit]: Calculating Kolmogorov-Smirnov & PSI drift scores... PSI=0.024 (Threshold < 0.10) -> PASSED`,
      `[00:07] Stage 2 [Training]: Dispatching distributed PyTorch/XGBoost worker pool (4x GPU)...`,
      `[00:09] Stage 2 [Checkpoint]: Epoch 25/25 complete. Train Loss: 0.029, Val Loss: 0.038, F1: 98.4% -> PASSED`,
      `[00:12] Stage 3 [Shadow SLA]: Routing 500 shadow requests... p95 Latency: 15.2ms (SLA target < 35ms) -> PASSED`,
      `[00:14] Stage 4 [Registry]: Computing SHA256 artifact checksum... Registered to Model Registry -> PASSED`,
      `[00:16] Stage 5 [Canary Gate]: Progressive traffic shift (10% Canary)... 0 HTTP 5xx errors detected -> PASSED`,
      `[00:17] Pipeline DAG execution completed successfully with 100% stage pass rate!`,
    ];

    setTerminalLogs([logMessages[0], logMessages[1]]);

    let currentIdx = 0;
    timerRef.current = setInterval(() => {
      currentIdx += 1;
      if (currentIdx < activePipeline.stages.length) {
        setActiveStageIdx(currentIdx);
        // Append progressive logs
        setTerminalLogs((prev) => [
          ...prev,
          logMessages[currentIdx * 2] || `Stage ${currentIdx + 1} processing...`,
          logMessages[currentIdx * 2 + 1] || `Stage ${currentIdx + 1} validated successfully.`,
        ]);
      } else {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsRunning(false);
        setActiveStageIdx(null);
        setTerminalLogs((prev) => [...prev, logMessages[logMessages.length - 1]]);
        setExecutionSuccessNotice(true);

        if (onExecutePipeline && activePipeline) {
          onExecutePipeline(activePipeline.id);
        }
      }
    }, 1200);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    if (onCreatePipeline) {
      onCreatePipeline(newName, newDesc, newTrigger);
    }
    setShowCreateModal(false);
    setNewName('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <GitFork className="h-5 w-5 text-indigo-400" />
            MLOps Continuous Retraining &amp; Serving Pipelines
          </h1>
          <p className="text-xs text-slate-400">
            Automated feature drift audits, model retraining, shadow evaluation gating, and progressive canary rollouts
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Pipeline</span>
          </button>

          <button
            onClick={handleRunPipeline}
            disabled={isRunning || !activePipeline}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition cursor-pointer disabled:opacity-50"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>{isRunning ? 'Running Pipeline DAG...' : 'Execute Pipeline Run'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {executionSuccessNotice && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>
              <strong>Pipeline Run Succeeded!</strong> All DAG stages executed without drift violations. Canary rollout authorized.
            </span>
          </div>
          <button
            onClick={() => setExecutionSuccessNotice(false)}
            className="text-[11px] underline hover:text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Empty State Guard */}
      {!activePipeline ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center space-y-3">
          <GitFork className="mx-auto h-10 w-10 text-slate-600" />
          <h3 className="text-sm font-semibold text-white">No MLOps Pipelines in this Workspace</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Create an automated retraining DAG to monitor feature store drift, retrain models, and safely shift canary traffic.
          </p>
          <button
            onClick={() => {
              if (onCreatePipeline) {
                onCreatePipeline(
                  'Continuous Retraining & Serving Pipeline DAG',
                  'Automated drift auditing, retraining, latency checks, and progressive canary rollouts',
                  'scheduled_cron'
                );
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create Default Retraining Pipeline
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Multiple Pipelines Selector Pills */}
          {pipelines.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs text-slate-400 whitespace-nowrap">Pipelines:</span>
              {pipelines.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPipelineId(p.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                    p.id === activePipeline.id
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}

          {/* Pipeline Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{activePipeline.name}</h3>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-semibold border ${
                    isRunning
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      : activePipeline.lastRunStatus === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {isRunning ? 'STATUS: EXECUTING' : `LAST RUN: ${activePipeline.lastRunStatus.toUpperCase()}`}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">{activePipeline.description}</p>
              </div>

              <div className="text-xs text-slate-400">
                Trigger: <strong className="text-slate-200">
                  {activePipeline.trigger === 'scheduled_cron'
                    ? 'Scheduled Daily Cron (02:00 UTC)'
                    : activePipeline.trigger === 'git_commit'
                    ? 'Git Push to main'
                    : 'Manual On-Demand'}
                </strong> ·{' '}
                {new Date(activePipeline.lastRunAt || Date.now()).toLocaleDateString()}
              </div>
            </div>

            {/* Interactive DAG Stages Visualizer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Pipeline Stage Execution Flow (DAG)
                </h4>
                {isRunning && (
                  <span className="text-xs text-indigo-400 flex items-center gap-1.5 animate-pulse font-mono">
                    <Activity className="h-3.5 w-3.5" />
                    Executing Stage {activeStageIdx !== null ? activeStageIdx + 1 : 1} of {activePipeline.stages.length}...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {activePipeline.stages.map((stage, idx) => {
                  const isCurrentExecuting = isRunning && activeStageIdx === idx;
                  const isCompleted = isRunning
                    ? activeStageIdx !== null && activeStageIdx > idx
                    : stage.status === 'success';

                  return (
                    <div
                      key={stage.id || idx}
                      className={`relative rounded-xl border p-4 transition duration-300 ${
                        isCurrentExecuting
                          ? 'border-indigo-500 bg-indigo-500/15 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500/50 scale-[1.02]'
                          : isCompleted
                          ? 'border-emerald-500/30 bg-slate-950/70'
                          : 'border-slate-800/60 bg-slate-950/30 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-indigo-400">
                          STEP 0{idx + 1}
                        </span>
                        {isCurrentExecuting ? (
                          <RefreshCw className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
                        ) : isCompleted ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Clock className="h-3.5 w-3.5 text-slate-500" />
                        )}
                      </div>

                      <div className="text-xs font-bold text-white leading-tight min-h-[32px]">
                        {stage.name}
                      </div>

                      <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
                        <span>Duration:</span>
                        <span className="font-mono text-slate-300">
                          {isCurrentExecuting ? 'calculating...' : stage.duration}
                        </span>
                      </div>

                      <div className="mt-2 text-[10px] text-slate-400 bg-slate-900/90 rounded p-1.5 line-clamp-3">
                        {isCurrentExecuting
                          ? 'Executing stage validation in cluster...'
                          : stage.stepOutputSummary}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live DAG Execution Logs Terminal */}
            {terminalLogs.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-black/80 p-4 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Real-time DAG Execution Logs</span>
                  </div>
                  {isRunning && (
                    <span className="text-[10px] text-indigo-400 animate-pulse flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-indigo-500"></span> Live Stream
                    </span>
                  )}
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar pt-1 text-[11px]">
                  {terminalLogs.map((log, lIdx) => (
                    <div
                      key={lIdx}
                      className={
                        log.includes('PASSED') || log.includes('successfully')
                          ? 'text-emerald-400'
                          : log.includes('Initializing') || log.includes('Querying')
                          ? 'text-indigo-300'
                          : 'text-slate-300'
                      }
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guardrail Policy Banner */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span>
                  Automated Fairness &amp; Drift Gates prevent models with PSI &gt; 0.10 or Accuracy degradation from advancing to Canary serving.
                </span>
              </div>
              <span className="font-semibold text-emerald-400 whitespace-nowrap">
                All Quality Safeguards Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* New Pipeline Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <GitFork className="h-5 w-5 text-indigo-400" />
              Create MLOps Pipeline DAG
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Pipeline Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Weekly Fraud Classifier Retraining DAG"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Description &amp; Objective</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Monitors incoming inference drift, trains updated model weights, and verifies shadow latency before promotion"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Execution Trigger</label>
                <select
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                >
                  <option value="scheduled_cron">Scheduled Daily Cron (02:00 UTC)</option>
                  <option value="git_commit">Git Commit / Webhook Push</option>
                  <option value="manual">Manual On-Demand Execution</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 font-semibold text-white hover:bg-indigo-500 cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  Create Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
