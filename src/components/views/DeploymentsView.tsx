import React, { useState } from 'react';
import {
  Rocket,
  Plus,
  GitCommit,
  CheckCircle2,
  RotateCcw,
  Sliders,
  Shield,
  Layers,
  Activity,
} from 'lucide-react';
import { Deployment, Workload } from '../../types';

interface DeploymentsViewProps {
  deployments: Deployment[];
  workloads: Workload[];
  onTriggerDeploy: (depData: Omit<Deployment, 'id' | 'workspaceId' | 'deployedAt'>) => void;
  onRollback: (deploymentId: string) => void;
}

export const DeploymentsView: React.FC<DeploymentsViewProps> = ({
  deployments,
  workloads,
  onTriggerDeploy,
  onRollback,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedWorkloadId, setSelectedWorkloadId] = useState(workloads[0]?.id || '');
  const [version, setVersion] = useState('v2.15.0');
  const [strategy, setStrategy] = useState<'canary' | 'rolling' | 'blue_green'>('canary');
  const [canaryPct, setCanaryPct] = useState(20);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wl = workloads.find((w) => w.id === selectedWorkloadId) || workloads[0];
    onTriggerDeploy({
      workloadId: wl.id,
      workloadName: wl.name,
      version,
      environment: wl.environment,
      strategy,
      status: 'healthy',
      commitSha: Math.random().toString(36).substring(2, 9),
      trafficDistribution: {
        primary: strategy === 'canary' ? 100 - canaryPct : 100,
        canary: strategy === 'canary' ? canaryPct : 0,
      },
      activePods: wl.cpuCores > 4 ? 6 : 4,
    });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Rocket className="h-5 w-5 text-indigo-400" />
            Deployment Lifecycle &amp; Progressive Delivery
          </h1>
          <p className="text-xs text-slate-400">
            Canary rollouts, zero-downtime blue/green switches, and automated rollback guardrails
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Trigger Release
        </button>
      </div>

      {/* Deployments Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                <th className="pb-3">Workload</th>
                <th className="pb-3">Version &amp; Commit</th>
                <th className="pb-3">Environment</th>
                <th className="pb-3">Strategy</th>
                <th className="pb-3">Traffic Split</th>
                <th className="pb-3">Active Replicas</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {deployments.map((dep) => (
                <tr key={dep.id} className="text-slate-300 hover:bg-slate-850/40">
                  <td className="py-3.5 font-bold text-white">{dep.workloadName}</td>
                  <td className="py-3.5">
                    <span className="rounded bg-indigo-500/10 text-indigo-300 px-2 py-0.5 text-[11px] font-mono border border-indigo-500/20 mr-2">
                      {dep.version}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      #{dep.commitSha}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className="rounded bg-purple-500/10 text-purple-400 px-1.5 py-0.5 text-[10px] uppercase font-semibold">
                      {dep.environment}
                    </span>
                  </td>
                  <td className="py-3.5 capitalize font-medium text-slate-300">
                    {dep.strategy.replace('_', '-')}
                  </td>
                  <td className="py-3.5">
                    {dep.trafficDistribution.canary > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden flex">
                          <div
                            className="bg-indigo-500 h-full"
                            style={{ width: `${dep.trafficDistribution.primary}%` }}
                          />
                          <div
                            className="bg-emerald-400 h-full"
                            style={{ width: `${dep.trafficDistribution.canary}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {dep.trafficDistribution.primary}% / {dep.trafficDistribution.canary}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">100% Primary</span>
                    )}
                  </td>
                  <td className="py-3.5 font-semibold text-white">{dep.activePods} Pods</td>
                  <td className="py-3.5">
                    <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold flex items-center gap-1 w-fit">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {dep.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => onRollback(dep.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                      title="Rollback to previous release"
                    >
                      <RotateCcw className="h-3 w-3 text-slate-400" />
                      Rollback
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trigger Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Rocket className="h-5 w-5 text-indigo-400" />
              Trigger Progressive Deployment
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Target Workload</label>
                <select
                  value={selectedWorkloadId}
                  onChange={(e) => setSelectedWorkloadId(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                >
                  {workloads.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.environment})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Release Version Tag</label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white font-mono"
                  placeholder="v2.15.0"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Deployment Strategy</label>
                <select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                >
                  <option value="canary">Canary (Gradual Traffic Split)</option>
                  <option value="blue_green">Blue / Green (Instant Switch)</option>
                  <option value="rolling">Rolling Upgrade</option>
                </select>
              </div>

              {strategy === 'canary' && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Initial Canary Traffic Split:</span>
                    <span className="font-bold text-emerald-400">{canaryPct}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={50}
                    step={5}
                    value={canaryPct}
                    onChange={(e) => setCanaryPct(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              )}

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
                  Initiate Rollout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
