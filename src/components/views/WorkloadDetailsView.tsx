import React, { useState } from 'react';
import {
  Boxes,
  Cpu,
  Activity,
  HardDrive,
  Clock,
  ShieldCheck,
  TrendingUp,
  FileCode2,
  Rocket,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Workload, ResourceRecommendation, MetricPoint } from '../../types';
import { storage } from '../../services/storage';

interface WorkloadDetailsViewProps {
  workload: Workload | undefined;
  recommendation: ResourceRecommendation | undefined;
  metrics: MetricPoint[];
  allWorkloads: Workload[];
  onSelectWorkload: (id: string) => void;
  onBack: () => void;
  onGeneratePlan: (workload: Workload) => void;
  onTriggerDeploy: (workload: Workload) => void;
  onRecalculate: (workload: Workload, mode: 'deterministic_rules' | 'ml_random_forest') => void;
}

export const WorkloadDetailsView: React.FC<WorkloadDetailsViewProps> = ({
  workload,
  recommendation,
  metrics,
  allWorkloads,
  onSelectWorkload,
  onBack,
  onGeneratePlan,
  onTriggerDeploy,
  onRecalculate,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'sizing' | 'terraform'>('metrics');
  const [algoMode, setAlgoMode] = useState<'deterministic_rules' | 'ml_random_forest'>('deterministic_rules');

  if (!workload) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center">
        <Boxes className="mx-auto h-12 w-12 text-slate-600 mb-3" />
        <h3 className="text-base font-semibold text-white">No workload selected</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Choose a workload from the list to view telemetry, sizing recommendations, and infrastructure blueprints.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {allWorkloads.map((w) => (
            <button
              key={w.id}
              onClick={() => onSelectWorkload(w.id)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700"
            >
              {w.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const latestMetric = metrics[metrics.length - 1] || {
    cpuPct: 45,
    memoryPct: 60,
    rps: workload.expectedRps,
    p95LatencyMs: 42,
    errorRatePct: 0.02,
  };

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">{workload.name}</h1>
              <span className="rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold">
                {workload.environment.toUpperCase()}
              </span>
              <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold">
                Running
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              ID: <span className="font-mono text-slate-300">{workload.id}</span> ·{' '}
              {workload.provider} ({workload.region}) · {workload.type.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Workload Selector Switcher */}
        <div className="flex items-center gap-2">
          <select
            value={workload.id}
            onChange={(e) => onSelectWorkload(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            {allWorkloads.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.environment})
              </option>
            ))}
          </select>

          <button
            onClick={() => onGeneratePlan(workload)}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 transition cursor-pointer"
          >
            <FileCode2 className="h-3.5 w-3.5" />
            Dry-Run Plan
          </button>

          <button
            onClick={() => onTriggerDeploy(workload)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition cursor-pointer"
          >
            <Rocket className="h-3.5 w-3.5" />
            Deploy Release
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
          <div className="text-[10px] text-slate-400">Live CPU Utilization</div>
          <div className="text-xl font-bold text-white mt-1">{latestMetric.cpuPct}%</div>
          <div className="text-[10px] text-slate-500 mt-1">Config: {workload.cpuCores} vCPU</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
          <div className="text-[10px] text-slate-400">Live Memory Usage</div>
          <div className="text-xl font-bold text-white mt-1">{latestMetric.memoryPct}%</div>
          <div className="text-[10px] text-slate-500 mt-1">Config: {workload.memoryGb} GB RAM</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
          <div className="text-[10px] text-slate-400">Throughput Volume</div>
          <div className="text-xl font-bold text-indigo-400 mt-1">{latestMetric.rps} RPS</div>
          <div className="text-[10px] text-slate-500 mt-1">Expected: {workload.expectedRps} RPS</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
          <div className="text-[10px] text-slate-400">Tail Latency (p95)</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{latestMetric.p95LatencyMs} ms</div>
          <div className="text-[10px] text-slate-500 mt-1">Target p99: &lt; {workload.p99LatencyTargetMs}ms</div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'metrics'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Live Telemetry &amp; Observations
        </button>
        <button
          onClick={() => setActiveTab('sizing')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'sizing'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Resource Sizing Engine &amp; Economics
        </button>
        <button
          onClick={() => setActiveTab('terraform')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'terraform'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Terraform Infrastructure Spec
        </button>
      </div>

      {/* Tab 1: Live Telemetry */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CPU & Memory Chart */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <h3 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                CPU &amp; Memory Utilization (Trailing 60 Mins)
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">
                Sampled at 5-minute intervals from container metrics agent
              </p>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics}>
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit="%" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                    />
                    <Line type="monotone" dataKey="cpuPct" stroke="#6366f1" strokeWidth={2} name="CPU %" dot={false} />
                    <Line type="monotone" dataKey="memoryPct" stroke="#06b6d4" strokeWidth={2} name="Memory %" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Throughput & Latency Chart */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <h3 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                RPS Throughput &amp; p95 Latency Curve
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">
                Correlation between request load and tail latency response
              </p>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics}>
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis yAxisId="left" stroke="#64748b" fontSize={10} tickLine={false} unit=" RPS" />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} tickLine={false} unit=" ms" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="rps" stroke="#10b981" strokeWidth={2} name="RPS" dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="p95LatencyMs" stroke="#f59e0b" strokeWidth={2} name="p95 (ms)" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sizing Recommendation */}
      {activeTab === 'sizing' && recommendation && (
        <div className="space-y-6">
          {/* Mode Switcher */}
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <div>
              <span className="text-xs font-bold text-white">Sizing Engine Algorithm</span>
              <p className="text-[11px] text-slate-400">
                Transparent rules vs trained Machine Learning surrogate predictor
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAlgoMode('deterministic_rules');
                  onRecalculate(workload, 'deterministic_rules');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  algoMode === 'deterministic_rules'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Deterministic Rules Baseline
              </button>
              <button
                onClick={() => {
                  setAlgoMode('ml_random_forest');
                  onRecalculate(workload, 'ml_random_forest');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  algoMode === 'ml_random_forest'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                ML Random Forest Predictor
              </button>
            </div>
          </div>

          {/* Sizing Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-4">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>Recommended Instance Class</span>
                <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px]">
                  {recommendation.confidenceScore}% Confidence
                </span>
              </div>

              <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-3">
                <div className="text-xs font-mono font-bold text-indigo-300">
                  {recommendation.recommendedInstance.provider} · {recommendation.recommendedInstance.instanceType}
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  {recommendation.recommendedInstance.description}
                </div>
                <div className="mt-2 text-xs font-semibold text-white">
                  ${recommendation.recommendedInstance.monthlyPrice}/mo per instance
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Recommended vCPU:</span>
                  <span className="font-semibold text-white">{recommendation.recommendedCpu} Cores</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Recommended RAM:</span>
                  <span className="font-semibold text-white">{recommendation.recommendedMemoryGb} GB</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Replicas Range (Min - Max):</span>
                  <span className="font-semibold text-indigo-400">
                    {recommendation.recommendedReplicasMin} - {recommendation.recommendedReplicasMax} pods
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Total Monthly Cost:</span>
                  <span className="font-bold text-emerald-400">${recommendation.monthlyCostEstimate}/mo</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Rightsizing Savings:</span>
                  <span className="font-bold text-cyan-400">+${recommendation.potentialSavingsMonthly}/mo</span>
                </div>
              </div>
            </div>

            {/* Explanations & Assumptions */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  Deterministic Sizing Rationale
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {recommendation.explanations.map((exp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  Architecture Trade-Offs &amp; Provider Pricing Disclosures
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {recommendation.tradeOffs.map((to, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{to}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Terraform Spec */}
      {activeTab === 'terraform' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-bold text-white">
                Terraform Configuration ({workload.provider})
              </span>
            </div>
            <button
              onClick={() => onGeneratePlan(workload)}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
            >
              Run Dry-Run Plan
            </button>
          </div>

          <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
            {`# Terraform Blueprint for ${workload.name}
resource "${workload.provider.toLowerCase()}_container_service" "${workload.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}" {
  name        = "${workload.name}"
  environment = "${workload.environment}"
  cpu_cores   = ${recommendation?.recommendedCpu || workload.cpuCores}
  memory_gb   = ${recommendation?.recommendedMemoryGb || workload.memoryGb}
  min_nodes   = ${recommendation?.recommendedReplicasMin || 2}
  max_nodes   = ${recommendation?.recommendedReplicasMax || 4}
  tags = {
    ManagedBy   = "AstraDeploy"
    Workload    = "${workload.name}"
    Environment = "${workload.environment}"
  }
}`}
          </pre>
        </div>
      )}
    </div>
  );
};
