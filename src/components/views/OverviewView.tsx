import React from 'react';
import {
  Boxes,
  DollarSign,
  TrendingDown,
  ShieldCheck,
  Rocket,
  AlertTriangle,
  ArrowUpRight,
  Cpu,
  Layers,
  Sparkles,
  Server,
  Activity,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Workload,
  Workspace,
  CostOptimization,
  Incident,
  Deployment,
} from '../../types';
import { ViewType } from '../Sidebar';

interface OverviewViewProps {
  currentWorkspace: Workspace;
  workloads: Workload[];
  optimizations: CostOptimization[];
  incidents: Incident[];
  deployments: Deployment[];
  onNavigate: (view: ViewType) => void;
  onSelectWorkload: (workloadId: string) => void;
  onOpenCreateWorkload: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  currentWorkspace,
  workloads,
  optimizations,
  incidents,
  deployments,
  onNavigate,
  onSelectWorkload,
  onOpenCreateWorkload,
}) => {
  const totalPotentialSavings = optimizations
    .filter((o) => o.status === 'open')
    .reduce((acc, curr) => acc + curr.monthlySavings, 0);

  const openIncidents = incidents.filter((i) => i.status !== 'resolved');

  // Chart data for spending trend
  const spendHistory = [
    { month: 'Apr', spend: currentWorkspace.monthlyBudget * 0.52, budget: currentWorkspace.monthlyBudget },
    { month: 'May', spend: currentWorkspace.monthlyBudget * 0.59, budget: currentWorkspace.monthlyBudget },
    { month: 'Jun', spend: currentWorkspace.monthlyBudget * 0.63, budget: currentWorkspace.monthlyBudget },
    { month: 'Jul', spend: currentWorkspace.monthlyBudget * 0.68, budget: currentWorkspace.monthlyBudget },
    { month: 'Aug', spend: currentWorkspace.monthlyBudget * 0.72, budget: currentWorkspace.monthlyBudget },
    { month: 'Sep', spend: currentWorkspace.currentSpend, budget: currentWorkspace.monthlyBudget },
  ];

  const budgetUsagePercent = Math.min(
    100,
    Math.round((currentWorkspace.currentSpend / (currentWorkspace.monthlyBudget || 1)) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Active Multi-Tenant Workload Mesh
              </span>
              <span className="text-xs text-slate-400">
                Workspace: <strong className="text-white">{currentWorkspace.name}</strong>
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Intelligent Cloud Architecture &amp; FinOps Control
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Context-aware sizing, dry-run Terraform plans with zero surprise bills, real-time workload telemetry, and production MLOps pipeline lifecycle.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCreateWorkload}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition active:scale-95 cursor-pointer"
            >
              <Cpu className="h-4 w-4" />
              Provision Workload
            </button>
            <button
              onClick={() => onNavigate('plans')}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition cursor-pointer"
            >
              <Layers className="h-4 w-4 text-indigo-400" />
              Inspect Terraform Plans
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Workloads Card */}
        <div
          onClick={() => onNavigate('workloads')}
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 hover:bg-slate-900/90 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Workloads</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{workloads.length}</div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              {workloads.filter((w) => w.environment === 'production').length} Prod ·{' '}
              {workloads.filter((w) => w.environment === 'staging').length} Staging
            </span>
            <span className="text-emerald-400 font-medium">100% Healthy</span>
          </div>
        </div>

        {/* Spend & Budget */}
        <div
          onClick={() => onNavigate('cost-intelligence')}
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 hover:bg-slate-900/90 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Monthly Cloud Spend</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            ${currentWorkspace.currentSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            <div className="flex justify-between mb-1">
              <span>Budget Cap (${currentWorkspace.monthlyBudget.toLocaleString()})</span>
              <span className="font-semibold text-slate-200">{budgetUsagePercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  budgetUsagePercent > 85 ? 'bg-amber-400' : 'bg-indigo-500'
                }`}
                style={{ width: `${budgetUsagePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actionable Rightsizing Savings */}
        <div
          onClick={() => onNavigate('optimizations')}
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 hover:bg-slate-900/90 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Actionable FinOps Savings</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            +${totalPotentialSavings.toFixed(0)}
            <span className="text-xs font-normal text-slate-400">/mo</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>{optimizations.filter((o) => o.status === 'open').length} recommendations ready</span>
            <span className="text-indigo-400 flex items-center gap-0.5">
              Review <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* SLA & Incidents */}
        <div
          onClick={() => onNavigate('alerts')}
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 hover:bg-slate-900/90 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">High Availability &amp; SLA</span>
            <div
              className={`p-2 rounded-lg ${
                openIncidents.length > 0
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'bg-emerald-500/10 text-emerald-400'
              } group-hover:scale-110 transition`}
            >
              {openIncidents.length > 0 ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
            </div>
          </div>
          <div className="text-2xl font-bold text-white">99.98%</div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Availability Target: 99.95%</span>
            <span
              className={`font-semibold ${
                openIncidents.length > 0 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {openIncidents.length === 0 ? '0 Incidents' : `${openIncidents.length} Needs Attention`}
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Workload Spotlight Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spend Chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-400" />
                Cloud Spend Velocity &amp; Budget Ceiling
              </h2>
              <p className="text-xs text-slate-400">
                Verified provider billing observations with zero hidden costs
              </p>
            </div>
            <button
              onClick={() => onNavigate('cost-intelligence')}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              Deep Breakdown <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`$${val.toFixed(2)}`, 'Spend']}
                />
                <Area
                  type="monotone"
                  dataKey="spend"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#spendColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Providers Quick Status */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="h-4 w-4 text-indigo-400" />
                Cloud Adapters
              </h2>
              <button
                onClick={() => onNavigate('providers')}
                className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                Configure
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-400 text-xs">
                    AWS
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Amazon Web Services</div>
                    <div className="text-[10px] text-slate-400">us-east-1 · 42 Resources</div>
                  </div>
                </div>
                <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold">
                  Read-Only OK
                </span>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-400 text-xs">
                    GCP
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Google Cloud Platform</div>
                    <div className="text-[10px] text-slate-400">us-central1 · 19 Resources</div>
                  </div>
                </div>
                <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold">
                  Connected
                </span>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center font-bold text-sky-400 text-xs">
                    AZ
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Microsoft Azure</div>
                    <div className="text-[10px] text-slate-400">eastus · 14 Resources</div>
                  </div>
                </div>
                <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold">
                  Read-Only OK
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>All provider operations restricted to Read-Only metadata discovery</span>
          </div>
        </div>
      </div>

      {/* Workload List Preview & Recent Deployments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workloads */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Boxes className="h-4 w-4 text-indigo-400" />
              Workloads in {currentWorkspace.name}
            </h2>
            <button
              onClick={() => onNavigate('workloads')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              View All ({workloads.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {workloads.slice(0, 4).map((w) => (
              <div
                key={w.id}
                onClick={() => onSelectWorkload(w.id)}
                className="group flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 p-3 hover:border-slate-700 hover:bg-slate-900/80 transition cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white group-hover:text-indigo-400 transition">
                      {w.name}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        w.environment === 'production'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {w.environment}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {w.provider} ({w.region}) · {w.cpuCores} vCPU · {w.memoryGb}GB RAM ·{' '}
                    {w.expectedRps} RPS
                  </div>
                </div>

                <div className="text-right">
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                    Running
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Budget: ${w.budgetMonthlyLimit}/mo
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Deployments */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Rocket className="h-4 w-4 text-indigo-400" />
              Recent Production Deployments
            </h2>
            <button
              onClick={() => onNavigate('deployments')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              All Releases
            </button>
          </div>

          <div className="space-y-3">
            {deployments.slice(0, 3).map((dep) => (
              <div
                key={dep.id}
                className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">
                      {dep.workloadName}
                    </span>
                    <span className="rounded bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 text-[10px] font-mono border border-indigo-500/20">
                      {dep.version}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <span>Strategy: <strong className="text-slate-300">{dep.strategy}</strong></span>
                    <span>·</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      commit {dep.commitSha}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold">
                    {dep.status}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {dep.trafficDistribution.canary > 0
                      ? `Canary ${dep.trafficDistribution.canary}%`
                      : '100% Active'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
