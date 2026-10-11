import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Plus,
  Play,
  Layers,
  LineChart as ChartIcon,
  Tag,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  RefreshCw,
  Rocket,
  Library,
  Sliders,
  Terminal,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MLExperiment, MLRun } from '../../types';

interface MLExperimentsViewProps {
  experiments: MLExperiment[];
  onCreateExperiment: (
    name: string,
    desc: string,
    framework: any,
    dataset: string,
    autoRun?: boolean
  ) => void;
  onAddRunToExperiment?: (
    experimentId: string,
    params?: Partial<MLRun['parameters']>
  ) => void;
  onRegisterModel?: (
    experimentId: string,
    runId: string,
    modelName: string,
    task?: any
  ) => void;
  onDeployModel?: (workloadName: string, rps: number) => void;
}

export const MLExperimentsView: React.FC<MLExperimentsViewProps> = ({
  experiments,
  onCreateExperiment,
  onAddRunToExperiment,
  onRegisterModel,
  onDeployModel,
}) => {
  const [selectedExpId, setSelectedExpId] = useState<string>(
    experiments[0]?.id || ''
  );

  // Sync selectedExpId if prop changes
  useEffect(() => {
    if (experiments.length > 0) {
      if (!selectedExpId || !experiments.some((e) => e.id === selectedExpId)) {
        setSelectedExpId(experiments[0].id);
      }
    }
  }, [experiments, selectedExpId]);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRunModal, setShowRunModal] = useState(false);
  const [trainingNotice, setTrainingNotice] = useState<string | null>(null);

  // Create form state
  const [expName, setExpName] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [framework, setFramework] = useState<any>('XGBoost');
  const [datasetName, setDatasetName] = useState('production-telemetry-corpus');
  const [autoRunImmediate, setAutoRunImmediate] = useState(true);

  // Run training modal form state
  const [runLr, setRunLr] = useState(0.001);
  const [runEpochs, setRunEpochs] = useState(25);
  const [runBatchSize, setRunBatchSize] = useState(64);
  const [runOptimizer, setRunOptimizer] = useState('adam');
  const [isTrainingInProgress, setIsTrainingInProgress] = useState(false);
  const [trainingProgressPct, setTrainingProgressPct] = useState(0);

  const selectedExp =
    experiments.find((e) => e.id === selectedExpId) || experiments[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expName) return;
    onCreateExperiment(expName, expDesc, framework, datasetName, autoRunImmediate);
    setShowCreateModal(false);
    setExpName('');
    setExpDesc('');
    setTrainingNotice(
      autoRunImmediate
        ? `Experiment created and Baseline Run #1 executed with loss curve!`
        : `Experiment created. Click 'Launch New Run' to begin training.`
    );
  };

  const handleExecuteNewRun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExp) return;

    setIsTrainingInProgress(true);
    setTrainingProgressPct(10);
    setShowRunModal(false);

    // Live training animation
    const progressInterval = setInterval(() => {
      setTrainingProgressPct((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 25;
      });
    }, 400);

    setTimeout(() => {
      clearInterval(progressInterval);
      setTrainingProgressPct(100);
      setIsTrainingInProgress(false);

      if (onAddRunToExperiment) {
        onAddRunToExperiment(selectedExp.id, {
          learning_rate: runLr,
          epochs: runEpochs,
          batch_size: runBatchSize,
          optimizer: runOptimizer,
          model_architecture: `${selectedExp.framework.toLowerCase()}_run_arch`,
        });
      }

      setTrainingNotice(
        `Training complete! Run successfully finished with epochs=${runEpochs}, LR=${runLr}. Convergence curve updated.`
      );
    }, 1800);
  };

  const handleRegisterRun = (runId: string) => {
    if (!selectedExp) return;
    if (onRegisterModel) {
      onRegisterModel(
        selectedExp.id,
        runId,
        selectedExp.name,
        selectedExp.name.toLowerCase().includes('regress') ? 'Regression' : 'Classification'
      );
      setTrainingNotice(`Model registered successfully to Model Registry from Run #${runId}!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-indigo-400" />
            ML Experiment Tracking &amp; Parameter Provenance
          </h1>
          <p className="text-xs text-slate-400">
            Persistent loss curves, evaluation metrics, artifact hashes, and hyperparameter tuning runs
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {selectedExp && (
            <button
              onClick={() => setShowRunModal(true)}
              disabled={isTrainingInProgress}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-600/20 px-3.5 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/30 transition cursor-pointer disabled:opacity-50"
            >
              {isTrainingInProgress ? (
                <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
              ) : (
                <Play className="h-4 w-4 text-indigo-400" />
              )}
              <span>{isTrainingInProgress ? 'Training in Progress...' : 'Launch New Run / Train'}</span>
            </button>
          )}

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create Experiment
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {trainingNotice && (
        <div className="rounded-xl border border-indigo-500/40 bg-indigo-500/10 p-3.5 text-xs text-indigo-300 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400 flex-shrink-0" />
            <span>{trainingNotice}</span>
          </div>
          <button
            onClick={() => setTrainingNotice(null)}
            className="text-[11px] underline hover:text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Training In Progress Progress Bar */}
      {isTrainingInProgress && (
        <div className="rounded-xl border border-indigo-500/40 bg-slate-900/90 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
              Training Model Run on GPU Cluster (Epochs: {runEpochs}, LR: {runLr})...
            </span>
            <span className="font-mono text-indigo-300">{trainingProgressPct}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${trainingProgressPct}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      {experiments.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center space-y-3">
          <FlaskConical className="mx-auto h-10 w-10 text-slate-600" />
          <h3 className="text-sm font-semibold text-white">No ML Experiments Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Track loss curves, hyperparameters, and evaluation metrics across your machine learning models.
          </p>
          <button
            onClick={() => {
              onCreateExperiment(
                'Workload Sizing & Latency Regressor',
                'Supervised regression predicting compute resources from traffic and latency SLAs',
                'scikit-learn',
                'cloud-workload-telemetry-corpus',
                true
              );
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer shadow-md shadow-indigo-600/30"
          >
            <Plus className="h-4 w-4" />
            Create Default Model Sizing Experiment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Experiments List Column */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tracked Experiments ({experiments.length})
            </h2>

            {experiments.map((exp) => (
              <div
                key={exp.id}
                onClick={() => setSelectedExpId(exp.id)}
                className={`rounded-xl border p-4 cursor-pointer transition ${
                  exp.id === selectedExp?.id
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-md ring-1 ring-indigo-500/30'
                    : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white truncate max-w-[170px]">
                    {exp.name}
                  </span>
                  <span className="rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-1.5 py-0.5 text-[10px] font-mono">
                    {exp.framework}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">{exp.description}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
                  <span>Dataset: {exp.datasetName}</span>
                  <span className="font-semibold text-slate-300">
                    {exp.runs?.length || 0} Runs
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Runs & Charts Details Column */}
          {selectedExp && (
            <div className="lg:col-span-2 space-y-4">
              {/* Summary Header Card */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {selectedExp.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedExp.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-800 text-slate-300 px-2.5 py-1 text-xs font-mono">
                      {(selectedExp.datasetSamples || 100000).toLocaleString()} Samples
                    </span>
                    <button
                      onClick={() => setShowRunModal(true)}
                      className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer shadow-sm"
                    >
                      <Play className="h-3 w-3" />
                      <span>Run Experiment</span>
                    </button>
                  </div>
                </div>

                {/* Runs Table */}
                {selectedExp.runs && selectedExp.runs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                          <th className="pb-2">Run</th>
                          <th className="pb-2">Architecture</th>
                          <th className="pb-2">Hyperparams</th>
                          <th className="pb-2">Loss (Train/Val)</th>
                          <th className="pb-2">Metric</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {selectedExp.runs.map((r) => (
                          <tr key={r.id} className="text-slate-300 hover:bg-slate-800/40">
                            <td className="py-2.5 font-mono text-indigo-400 font-bold">
                              #{r.runNumber}
                            </td>
                            <td className="py-2.5 font-mono text-[11px] text-slate-300">
                              {r.parameters.model_architecture}
                            </td>
                            <td className="py-2.5 font-mono text-[11px] text-slate-400">
                              lr={r.parameters.learning_rate} / {r.parameters.epochs}ep
                            </td>
                            <td className="py-2.5 font-mono text-xs">
                              {r.metrics.train_loss} /{' '}
                              <span className="text-emerald-400">{r.metrics.val_loss}</span>
                            </td>
                            <td className="py-2.5 font-semibold text-white">
                              {r.metrics.f1_score !== undefined
                                ? `F1: ${(r.metrics.f1_score * 100).toFixed(1)}%`
                                : `RMSE: ${r.metrics.rmse}`}
                            </td>
                            <td className="py-2.5">
                              <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold">
                                {r.status}
                              </span>
                            </td>
                            <td className="py-2.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleRegisterRun(r.id)}
                                  title="Register this run version into Model Registry"
                                  className="rounded bg-slate-800 px-2 py-1 text-[10px] font-medium text-indigo-300 hover:bg-slate-700 hover:text-white cursor-pointer"
                                >
                                  Register Model
                                </button>
                                {onDeployModel && (
                                  <button
                                    onClick={() => onDeployModel(`${selectedExp.name} API`, 50)}
                                    title="Auto-size and deploy as production inference workload"
                                    className="rounded bg-emerald-600/20 text-emerald-300 px-2 py-1 text-[10px] font-medium hover:bg-emerald-600/30 cursor-pointer"
                                  >
                                    Deploy
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 text-center space-y-2">
                    <p className="text-xs text-slate-400">
                      No training runs recorded for this experiment yet.
                    </p>
                    <button
                      onClick={() => setShowRunModal(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
                    >
                      <Play className="h-3 w-3" />
                      <span>Start Training Run #1</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Loss Curve Chart */}
              {selectedExp.runs &&
                selectedExp.runs.length > 0 &&
                selectedExp.runs[selectedExp.runs.length - 1]?.lossHistory && (
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ChartIcon className="h-4 w-4 text-indigo-400" />
                        Training Convergence Curve (Loss vs Step)
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        Run #{selectedExp.runs[selectedExp.runs.length - 1].runNumber}
                      </span>
                    </div>

                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={
                            selectedExp.runs[selectedExp.runs.length - 1].lossHistory
                          }
                        >
                          <XAxis
                            dataKey="step"
                            stroke="#64748b"
                            fontSize={10}
                            tickLine={false}
                            unit=" step"
                          />
                          <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              border: '1px solid #334155',
                              borderRadius: '8px',
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="loss"
                            stroke="#6366f1"
                            strokeWidth={2}
                            name="Train Loss"
                            dot={{ r: 2 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="valLoss"
                            stroke="#10b981"
                            strokeWidth={2}
                            name="Val Loss"
                            dot={{ r: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      )}

      {/* Create Experiment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-indigo-400" />
              New Machine Learning Experiment
            </h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Experiment Name</label>
                <input
                  type="text"
                  required
                  value={expName}
                  onChange={(e) => setExpName(e.target.value)}
                  placeholder="e.g. churn-predictor-xgboost"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Description &amp; Objective</label>
                <textarea
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="Predict user churn with sub-50ms inference SLA"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Framework</label>
                  <select
                    value={framework}
                    onChange={(e) => setFramework(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                  >
                    <option value="XGBoost">XGBoost</option>
                    <option value="scikit-learn">scikit-learn</option>
                    <option value="PyTorch">PyTorch</option>
                    <option value="TensorFlow">TensorFlow</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Dataset Reference</label>
                  <input
                    type="text"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Immediately Run Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRunImmediate}
                    onChange={(e) => setAutoRunImmediate(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="text-left">
                    <span className="font-semibold text-white block">Immediately execute training run (#1)</span>
                    <span className="text-[11px] text-slate-400 block">
                      Generates baseline convergence curve, weights, and metrics immediately upon creation
                    </span>
                  </div>
                </label>
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
                  Create Experiment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Launch Run / Hyperparameters Modal */}
      {showRunModal && selectedExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Play className="h-5 w-5 text-indigo-400" />
              Launch Training Run for {selectedExp.name}
            </h3>

            <p className="text-xs text-slate-400">
              Configure hyperparameters to evaluate convergence, accuracy, and latency for this experiment run.
            </p>

            <form onSubmit={handleExecuteNewRun} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Learning Rate</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={runLr}
                    onChange={(e) => setRunLr(parseFloat(e.target.value) || 0.001)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Epochs</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    required
                    value={runEpochs}
                    onChange={(e) => setRunEpochs(parseInt(e.target.value, 10) || 20)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Batch Size</label>
                  <select
                    value={runBatchSize}
                    onChange={(e) => setRunBatchSize(parseInt(e.target.value, 10))}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                  >
                    <option value={32}>32</option>
                    <option value={64}>64</option>
                    <option value={128}>128</option>
                    <option value={256}>256</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Optimizer</label>
                  <select
                    value={runOptimizer}
                    onChange={(e) => setRunOptimizer(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                  >
                    <option value="adam">Adam</option>
                    <option value="adamw">AdamW</option>
                    <option value="sgd_momentum">SGD with Momentum</option>
                    <option value="rmsprop">RMSProp</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRunModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 font-semibold text-white hover:bg-indigo-500 cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Start Training Run</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
