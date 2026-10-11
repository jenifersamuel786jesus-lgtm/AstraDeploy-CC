import React, { useState } from 'react';
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
} from 'lucide-react';
import { MLPipeline, MLPipelineStage } from '../../types';

interface MLPipelinesViewProps {
  pipelines: MLPipeline[];
}

export const MLPipelinesView: React.FC<MLPipelinesViewProps> = ({ pipelines }) => {
  const [activePipeline, setActivePipeline] = useState<MLPipeline>(
    pipelines[0]
  );
  const [isRunning, setIsRunning] = useState(false);
  const [activeStageIdx, setActiveStageIdx] = useState<number | null>(null);

  const handleRunPipeline = () => {
    setIsRunning(true);
    setActiveStageIdx(0);

    const interval = setInterval(() => {
      setActiveStageIdx((prev) => {
        if (prev === null) return 0;
        if (prev >= activePipeline.stages.length - 1) {
          clearInterval(interval);
          setIsRunning(false);
          return null;
        }
        return prev + 1;
      });
    }, 1500);
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
            Automated feature drift audits, model training, evaluation gating, and progressive canary rollouts
          </p>
        </div>

        <button
          onClick={handleRunPipeline}
          disabled={isRunning}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          {isRunning ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          <span>{isRunning ? 'Running Pipeline DAG...' : 'Execute Pipeline Run'}</span>
        </button>
      </div>

      {/* Pipeline Card */}
      {activePipeline && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{activePipeline.name}</h3>
                <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold">
                  Last Run: {activePipeline.lastRunStatus.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">{activePipeline.description}</p>
            </div>

            <div className="text-xs text-slate-400">
              Trigger: <strong className="text-slate-200">Scheduled Daily Cron</strong> ·{' '}
              {new Date(activePipeline.lastRunAt).toLocaleDateString()}
            </div>
          </div>

          {/* Interactive DAG Stages Visualizer */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Pipeline Stage Execution Flow
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {activePipeline.stages.map((stage, idx) => {
                const isCurrentExecuting = isRunning && activeStageIdx === idx;
                const isCompleted = isRunning ? activeStageIdx !== null && activeStageIdx > idx : stage.status === 'success';

                return (
                  <div
                    key={stage.id}
                    className={`relative rounded-xl border p-4 transition ${
                      isCurrentExecuting
                        ? 'border-indigo-500 bg-indigo-500/15 shadow-lg shadow-indigo-500/10 animate-pulse'
                        : isCompleted
                        ? 'border-slate-800 bg-slate-950/60'
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
                      <span className="font-mono text-slate-300">{stage.duration}</span>
                    </div>

                    <div className="mt-2 text-[10px] text-slate-400 bg-slate-900/90 rounded p-1.5 line-clamp-3">
                      {stage.stepOutputSummary}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-xs text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>
                Automated Fairness &amp; Drift Gates prevent models with PSI &gt; 0.1 or Accuracy degradation from advancing to Canary serving.
              </span>
            </div>
            <span className="font-semibold text-emerald-400">All Safeguards Passed</span>
          </div>
        </div>
      )}
    </div>
  );
};
