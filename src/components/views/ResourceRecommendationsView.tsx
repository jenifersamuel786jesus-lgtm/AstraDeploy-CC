import React, { useState } from 'react';
import {
  Cpu,
  Calculator,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Server,
  DollarSign,
  TrendingDown,
  Info,
  Layers,
} from 'lucide-react';
import { Workload, WorkloadType, CloudProviderName, ScalingPreference } from '../../types';
import { calculateDeterministicRecommendation, PROVIDER_CATALOG } from '../../services/recommendationEngine';

interface ResourceRecommendationsViewProps {
  workloads: Workload[];
}

export const ResourceRecommendationsView: React.FC<ResourceRecommendationsViewProps> = ({
  workloads,
}) => {
  // Playground state
  const [selectedWorkloadId, setSelectedWorkloadId] = useState<string>(
    workloads[0]?.id || 'custom'
  );

  const [type, setType] = useState<WorkloadType>('web_api');
  const [environment, setEnvironment] = useState<'production' | 'staging' | 'development'>('production');
  const [provider, setProvider] = useState<CloudProviderName>('AWS');
  const [expectedRps, setExpectedRps] = useState<number>(1800);
  const [p99Latency, setP99Latency] = useState<number>(50);
  const [sla, setSla] = useState<number>(99.99);
  const [scalingPref, setScalingPref] = useState<ScalingPreference>('balanced');
  const [algoMode, setAlgoMode] = useState<'deterministic_rules' | 'ml_random_forest'>('deterministic_rules');

  // Load from workload if selected
  const handleSelectWorkload = (id: string) => {
    setSelectedWorkloadId(id);
    const found = workloads.find((w) => w.id === id);
    if (found) {
      setType(found.type);
      setEnvironment(found.environment);
      setProvider(found.provider);
      setExpectedRps(found.expectedRps);
      setP99Latency(found.p99LatencyTargetMs);
      setSla(found.availabilitySla);
      setScalingPref(found.scalingPreference);
    }
  };

  // Build virtual workload for calculation
  const virtualWorkload: Workload = {
    id: selectedWorkloadId === 'custom' ? 'wl-custom' : selectedWorkloadId,
    workspaceId: 'current',
    name: selectedWorkloadId === 'custom' ? 'Custom Simulation' : workloads.find((w) => w.id === selectedWorkloadId)?.name || 'Custom',
    description: 'Real-time contextual sizing calculation',
    type,
    environment,
    provider,
    region: 'us-east-1',
    cpuCores: 4,
    memoryGb: 16,
    storageGb: 80,
    expectedRps,
    p99LatencyTargetMs: p99Latency,
    availabilitySla: sla,
    scalingPreference: scalingPref,
    budgetMonthlyLimit: 1000,
    tags: ['simulator'],
    status: 'running',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const rec = calculateDeterministicRecommendation(virtualWorkload, algoMode);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="h-5 w-5 text-indigo-400" />
          Context-Aware Resource Recommendation Engine
        </h1>
        <p className="text-xs text-slate-400">
          Transparent, deterministic sizing math and cross-cloud pricing optimization with zero black-box claims
        </p>
      </div>

      {/* Sizing Engine Mode & Preset Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center gap-3">
          <Calculator className="h-5 w-5 text-indigo-400" />
          <div>
            <span className="text-xs font-bold text-white">Preset Workload Sizing Target</span>
            <div className="text-[11px] text-slate-400">
              Select existing workload or adjust custom parameters
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedWorkloadId}
            onChange={(e) => handleSelectWorkload(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="custom">⚙️ Custom Real-Time Simulator</option>
            {workloads.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.type})
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
            <button
              onClick={() => setAlgoMode('deterministic_rules')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition cursor-pointer ${
                algoMode === 'deterministic_rules'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Deterministic Rules
            </button>
            <button
              onClick={() => setAlgoMode('ml_random_forest')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded font-medium transition cursor-pointer ${
                algoMode === 'ml_random_forest'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="h-3 w-3" />
              ML Sizing Model
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Real-Time Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider text-slate-400">
            Workload Demand Inputs
          </h2>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300">Workload Pattern / Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as WorkloadType)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500"
            >
              <option value="web_api">Web API (HTTP/REST)</option>
              <option value="microservice">Microservice</option>
              <option value="ml_inference">ML Inference (Low-Latency)</option>
              <option value="ml_training">ML Training (GPU Compute)</option>
              <option value="database">Database (IOPS Heavy)</option>
              <option value="batch_etl">Batch ETL Pipeline</option>
              <option value="realtime_socket">Realtime WebSocket Hub</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Expected RPS / Volume:</span>
              <span className="font-bold text-indigo-400">{expectedRps.toLocaleString()} RPS</span>
            </div>
            <input
              type="range"
              min={50}
              max={10000}
              step={50}
              value={expectedRps}
              onChange={(e) => setExpectedRps(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">p99 Latency Target:</span>
              <span className="font-bold text-emerald-400">{p99Latency} ms</span>
            </div>
            <input
              type="range"
              min={10}
              max={500}
              step={10}
              value={p99Latency}
              onChange={(e) => setP99Latency(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">High Availability SLA:</span>
              <span className="font-bold text-cyan-400">{sla}%</span>
            </div>
            <select
              value={sla}
              onChange={(e) => setSla(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500"
            >
              <option value={99.0}>99.0% (Single AZ / Dev)</option>
              <option value={99.9}>99.9% (Standard Multi-AZ)</option>
              <option value={99.99}>99.99% (Mission-Critical Triple AZ)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Target Cloud</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as CloudProviderName)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-white"
              >
                <option value="AWS">AWS</option>
                <option value="GCP">GCP</option>
                <option value="Azure">Azure</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Environment</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as any)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-white"
              >
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>
          </div>
        </div>

        {/* Real Recommendation Output */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-indigo-500/40 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold">
                  Recommended Architecture Sizing
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                  {rec.recommendedInstance.provider} {rec.recommendedInstance.instanceType}
                  <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-xs font-normal">
                    {rec.riskAssessment}
                  </span>
                </h3>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  ${rec.monthlyCostEstimate}
                  <span className="text-xs font-normal text-slate-400">/mo</span>
                </div>
                <div className="text-[11px] text-cyan-400 font-medium">
                  Saves ~${rec.potentialSavingsMonthly}/mo vs unoptimized sizing
                </div>
              </div>
            </div>

            {/* Spec breakdown badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-2.5">
                <div className="text-[10px] text-slate-400">vCPU Allocation</div>
                <div className="text-base font-bold text-white">{rec.recommendedCpu} Cores</div>
              </div>
              <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-2.5">
                <div className="text-[10px] text-slate-400">Memory Allocation</div>
                <div className="text-base font-bold text-white">{rec.recommendedMemoryGb} GB</div>
              </div>
              <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-2.5">
                <div className="text-[10px] text-slate-400">Active Replicas</div>
                <div className="text-base font-bold text-indigo-400">
                  {rec.recommendedReplicasMin} - {rec.recommendedReplicasMax} Pods
                </div>
              </div>
              <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-2.5">
                <div className="text-[10px] text-slate-400">Pricing Basis</div>
                <div className="text-base font-bold text-emerald-400">
                  ${rec.recommendedInstance.hourlyPrice}/hr
                </div>
              </div>
            </div>

            {/* Sizing Explanations */}
            <div className="space-y-2 mt-4 pt-4 border-t border-slate-800 text-xs">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Transparent Sizing Formulation:
              </div>
              <ul className="space-y-1.5 text-slate-300">
                {rec.explanations.map((exp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-400">•</span>
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Cross-Provider Comparison Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
              <Server className="h-4 w-4 text-indigo-400" />
              Cross-Cloud Pricing Comparison Catalog
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                    <th className="pb-2">Provider</th>
                    <th className="pb-2">Instance Type</th>
                    <th className="pb-2">vCPU / RAM</th>
                    <th className="pb-2">Hourly Rate</th>
                    <th className="pb-2">Monthly Est.</th>
                    <th className="pb-2">Spot Discount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {PROVIDER_CATALOG.filter((i) => i.vCpu >= rec.recommendedCpu).slice(0, 5).map((inst, i) => (
                    <tr
                      key={i}
                      className={
                        inst.instanceType === rec.recommendedInstance.instanceType
                          ? 'bg-indigo-500/10 font-semibold text-white'
                          : 'text-slate-300 hover:bg-slate-800/40'
                      }
                    >
                      <td className="py-2.5">
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono">
                          {inst.provider}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-indigo-300">{inst.instanceType}</td>
                      <td className="py-2.5">
                        {inst.vCpu} vCPU / {inst.memoryGb} GB
                      </td>
                      <td className="py-2.5 font-mono">${inst.hourlyPrice}</td>
                      <td className="py-2.5 font-bold">${inst.monthlyPrice}</td>
                      <td className="py-2.5 text-emerald-400 font-semibold">{inst.spotSavingsPct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-slate-400" />
              <span>Prices verified against public provider rate cards in US East region. No billing commitment required.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
