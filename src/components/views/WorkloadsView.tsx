import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Cpu,
  HardDrive,
  Activity,
  Layers,
  ChevronRight,
  Trash2,
  Sparkles,
  Server,
  FileCode2,
} from 'lucide-react';
import { Workload, WorkloadType, Environment } from '../../types';

interface WorkloadsViewProps {
  workloads: Workload[];
  onSelectWorkload: (id: string) => void;
  onOpenCreateModal: () => void;
  onGeneratePlan: (workload: Workload) => void;
  onDeleteWorkload: (id: string) => void;
}

export const WorkloadsView: React.FC<WorkloadsViewProps> = ({
  workloads,
  onSelectWorkload,
  onOpenCreateModal,
  onGeneratePlan,
  onDeleteWorkload,
}) => {
  const [search, setSearch] = useState('');
  const [selectedEnv, setSelectedEnv] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filtered = workloads.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.description.toLowerCase().includes(search.toLowerCase()) ||
      w.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesEnv = selectedEnv === 'all' || w.environment === selectedEnv;
    const matchesType = selectedType === 'all' || w.type === selectedType;

    return matchesSearch && matchesEnv && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Boxes className="h-5 w-5 text-indigo-400" />
            Cloud Workload Management
          </h1>
          <p className="text-xs text-slate-400">
            Provision, monitor, size, and govern cloud containers and compute nodes
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create New Workload
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, description, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-950/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Environment Filter */}
          <select
            value={selectedEnv}
            onChange={(e) => setSelectedEnv(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="all">All Environments</option>
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="development">Development</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="web_api">Web API</option>
            <option value="microservice">Microservice</option>
            <option value="ml_inference">ML Inference</option>
            <option value="ml_training">ML Training</option>
            <option value="database">Database</option>
            <option value="batch_etl">Batch ETL</option>
            <option value="realtime_socket">Realtime Socket</option>
          </select>
        </div>
      </div>

      {/* Workloads List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/20 p-12 text-center">
          <Boxes className="mx-auto h-10 w-10 text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-white">No workloads match criteria</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search terms or create a new workload for this workspace.
          </p>
          <button
            onClick={onOpenCreateModal}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
          >
            <Plus className="h-3.5 w-3.5" />
            Add First Workload
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((w) => (
            <div
              key={w.id}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 hover:border-slate-700 hover:bg-slate-900/70 transition shadow-sm"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-white hover:text-indigo-400 transition cursor-pointer" onClick={() => onSelectWorkload(w.id)}>
                      {w.name}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        w.environment === 'production'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : w.environment === 'staging'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {w.environment}
                    </span>
                    <span className="rounded bg-slate-800 text-slate-300 px-2 py-0.5 text-[10px] font-mono">
                      {w.provider} ({w.region})
                    </span>
                    <span className="rounded bg-indigo-500/10 text-indigo-300 px-2 py-0.5 text-[10px]">
                      {w.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{w.description}</p>
                </div>

                {/* Specs pill row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs shrink-0">
                  <div className="rounded-lg bg-slate-950/60 border border-slate-800/80 p-2 text-center min-w-[70px]">
                    <div className="text-[10px] text-slate-500">vCPU</div>
                    <div className="font-semibold text-white">{w.cpuCores} Cores</div>
                  </div>
                  <div className="rounded-lg bg-slate-950/60 border border-slate-800/80 p-2 text-center min-w-[70px]">
                    <div className="text-[10px] text-slate-500">RAM</div>
                    <div className="font-semibold text-white">{w.memoryGb} GB</div>
                  </div>
                  <div className="rounded-lg bg-slate-950/60 border border-slate-800/80 p-2 text-center min-w-[70px]">
                    <div className="text-[10px] text-slate-500">Volume</div>
                    <div className="font-semibold text-indigo-400">{w.expectedRps} RPS</div>
                  </div>
                  <div className="rounded-lg bg-slate-950/60 border border-slate-800/80 p-2 text-center min-w-[70px]">
                    <div className="text-[10px] text-slate-500">SLA Target</div>
                    <div className="font-semibold text-emerald-400">{w.availabilitySla}%</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  <button
                    onClick={() => onSelectWorkload(w.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition cursor-pointer"
                  >
                    <span>Details &amp; Metrics</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => onGeneratePlan(w)}
                    title="Generate Dry-Run Terraform Plan"
                    className="p-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition cursor-pointer"
                  >
                    <FileCode2 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => onDeleteWorkload(w.id)}
                    title="Delete Workload"
                    className="p-1.5 rounded-lg border border-slate-800 hover:border-rose-500/40 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Tags & footer */}
              <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span>Tags:</span>
                  {w.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-300 font-mono"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
                <div>
                  p99 Target: <strong className="text-slate-300">{w.p99LatencyTargetMs}ms</strong> ·
                  Budget Limit: <strong className="text-slate-300">${w.budgetMonthlyLimit}/mo</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
