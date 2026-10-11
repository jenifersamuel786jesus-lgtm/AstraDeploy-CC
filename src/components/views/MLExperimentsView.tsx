import React, { useState } from 'react';
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
  onCreateExperiment: (name: string, desc: string, framework: any, dataset: string) => void;
}

export const MLExperimentsView: React.FC<MLExperimentsViewProps> = ({
  experiments,
  onCreateExperiment,
}) => {
  const [selectedExpId, setSelectedExpId] = useState<string>(
    experiments[0]?.id || ''
  );
  const [showModal, setShowModal] = useState(false);
  const [expName, setExpName] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [framework, setFramework] = useState<any>('XGBoost');
  const [datasetName, setDatasetName] = useState('production-telemetry-corpus');

  const selectedExp = experiments.find((e) => e.id === selectedExpId) || experiments[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expName) return;
    onCreateExperiment(expName, expDesc, framework, datasetName);
    setShowModal(false);
    setExpName('');
    setExpDesc('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-indigo-400" />
            ML Experiment Tracking &amp; Parameter Provenance
          </h1>
          <p className="text-xs text-slate-400">
            Persistent loss curves, evaluation metrics, artifact hashes, and hyperparameters
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Experiment
        </button>
      </div>

      {experiments.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center">
          <FlaskConical className="mx-auto h-10 w-10 text-slate-600 mb-2" />
          <h3 className="text-sm font-semibold text-white">No ML experiments yet</h3>
          <p className="text-xs text-slate-400 mt-1">Start tracking models and runs in this workspace.</p>
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
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-md'
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
                  <span>{exp.runs.length} Runs</span>
                </div>
              </div>
            ))}
          </div>

          {/* Runs & Charts Details Column */}
          {selectedExp && (
            <div className="lg:col-span-2 space-y-4">
              {/* Summary Header Card */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {selectedExp.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedExp.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-800 text-slate-300 px-2 py-1 text-xs font-mono">
                      {selectedExp.datasetSamples.toLocaleString()} Samples
                    </span>
                  </div>
                </div>

                {/* Runs Table */}
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                        <th className="pb-2">Run</th>
                        <th className="pb-2">Architecture</th>
                        <th className="pb-2">Params (LR / Epochs)</th>
                        <th className="pb-2">Loss (Train/Val)</th>
                        <th className="pb-2">Metric</th>
                        <th className="pb-2">Status</th>
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
                            {r.metrics.train_loss} / <span className="text-emerald-400">{r.metrics.val_loss}</span>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Loss Curve Chart */}
              {selectedExp.runs[0]?.lossHistory && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ChartIcon className="h-4 w-4 text-indigo-400" />
                      Training Convergence Curve (Loss vs Step)
                    </h4>
                    <span className="text-[10px] text-slate-400">Run #{selectedExp.runs[selectedExp.runs.length - 1].runNumber}</span>
                  </div>

                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedExp.runs[selectedExp.runs.length - 1].lossHistory}>
                        <XAxis dataKey="step" stroke="#64748b" fontSize={10} tickLine={false} unit=" step" />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                        />
                        <Line type="monotone" dataKey="loss" stroke="#6366f1" strokeWidth={2} name="Train Loss" dot={{ r: 2 }} />
                        <Line type="monotone" dataKey="valLoss" stroke="#10b981" strokeWidth={2} name="Val Loss" dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
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
                  placeholder="Predict churn with sub-50ms inference SLA"
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

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
    </div>
  );
};
