import React, { useState } from 'react';
import {
  Boxes,
  Cpu,
  Plus,
  X,
  Server,
  DollarSign,
  Activity,
  Layers,
} from 'lucide-react';
import { Workload, WorkloadType, Environment, CloudProviderName, ScalingPreference } from '../../types';

interface CreateWorkloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: Omit<Workload, 'id' | 'workspaceId' | 'createdAt' | 'updatedAt'>) => void;
}

export const CreateWorkloadModal: React.FC<CreateWorkloadModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<WorkloadType>('web_api');
  const [environment, setEnvironment] = useState<Environment>('production');
  const [provider, setProvider] = useState<CloudProviderName>('AWS');
  const [region, setRegion] = useState('us-east-1');
  const [expectedRps, setExpectedRps] = useState(1500);
  const [p99LatencyTargetMs, setP99LatencyTargetMs] = useState(50);
  const [availabilitySla, setAvailabilitySla] = useState(99.95);
  const [scalingPreference, setScalingPreference] = useState<ScalingPreference>('balanced');
  const [budgetMonthlyLimit, setBudgetMonthlyLimit] = useState(600);
  const [tagsStr, setTagsStr] = useState('api, tier-1');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Default cores based on RPS
    const defaultCpu = expectedRps > 2000 ? 8 : expectedRps > 500 ? 4 : 2;
    const defaultRam = defaultCpu * 4;

    onCreate({
      name: name.trim(),
      description: description.trim() || 'Workload container managed by AstraDeploy',
      type,
      environment,
      provider,
      region,
      cpuCores: defaultCpu,
      memoryGb: defaultRam,
      storageGb: 50,
      expectedRps: Number(expectedRps),
      p99LatencyTargetMs: Number(p99LatencyTargetMs),
      availabilitySla: Number(availabilitySla),
      scalingPreference,
      budgetMonthlyLimit: Number(budgetMonthlyLimit),
      tags: tagsStr.split(',').map((t) => t.trim()).filter(Boolean),
      status: 'running',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4 my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Provision New Workload</h3>
              <p className="text-xs text-slate-400">
                AstraDeploy will calculate contextual instance recommendations automatically
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-slate-300 block mb-1 font-medium">Workload Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Auth Token Verifier"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-300 block mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="High-throughput OAuth verification service"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Workload Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as WorkloadType)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
              >
                <option value="web_api">Web API</option>
                <option value="microservice">Microservice</option>
                <option value="ml_inference">ML Inference</option>
                <option value="ml_training">ML Training</option>
                <option value="database">Database</option>
                <option value="batch_etl">Batch ETL</option>
                <option value="realtime_socket">Realtime Socket</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Environment</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as Environment)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
              >
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Cloud Target</label>
              <select
                value={provider}
                onChange={(e) => {
                  const p = e.target.value as CloudProviderName;
                  setProvider(p);
                  setRegion(p === 'AWS' ? 'us-east-1' : p === 'GCP' ? 'us-central1' : 'eastus');
                }}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
              >
                <option value="AWS">AWS</option>
                <option value="GCP">GCP</option>
                <option value="Azure">Azure</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Region</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Expected Peak Volume (RPS)</label>
              <input
                type="number"
                min={1}
                value={expectedRps}
                onChange={(e) => setExpectedRps(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">p99 Latency Target (ms)</label>
              <input
                type="number"
                min={10}
                value={p99LatencyTargetMs}
                onChange={(e) => setP99LatencyTargetMs(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Availability SLA Target (%)</label>
              <select
                value={availabilitySla}
                onChange={(e) => setAvailabilitySla(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
              >
                <option value={99.0}>99.0% (Single Node)</option>
                <option value={99.9}>99.9% (Standard Multi-AZ)</option>
                <option value={99.95}>99.95% (High Reliability)</option>
                <option value={99.99}>99.99% (Mission Critical 3-AZ)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Monthly Budget Limit ($)</label>
              <input
                type="number"
                min={50}
                value={budgetMonthlyLimit}
                onChange={(e) => setBudgetMonthlyLimit(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-300 block mb-1">Tags (Comma-separated)</label>
              <input
                type="text"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                placeholder="auth, tier-1, core"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 font-semibold text-white hover:bg-indigo-500 cursor-pointer shadow-md shadow-indigo-600/30"
            >
              Create &amp; Calculate Sizing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
