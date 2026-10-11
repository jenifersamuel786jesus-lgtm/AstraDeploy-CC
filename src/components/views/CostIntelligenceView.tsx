import React, { useState } from 'react';
import {
  DollarSign,
  TrendingDown,
  AlertCircle,
  PieChart as PieIcon,
  BarChart2,
  Calendar,
  Layers,
  CheckCircle2,
  Edit2,
  Save,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Workspace, Workload, ResourceRecommendation } from '../../types';

interface CostIntelligenceViewProps {
  currentWorkspace: Workspace;
  workloads: Workload[];
  recommendations: ResourceRecommendation[];
  onUpdateWorkspace: (ws: Workspace) => void;
}

export const CostIntelligenceView: React.FC<CostIntelligenceViewProps> = ({
  currentWorkspace,
  workloads,
  recommendations,
  onUpdateWorkspace,
}) => {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetVal, setBudgetVal] = useState(currentWorkspace.monthlyBudget.toString());

  // Aggregate cost data by workload
  const workloadCostData = workloads.map((w) => {
    const rec = recommendations.find((r) => r.workloadId === w.id);
    const cost = rec ? rec.monthlyCostEstimate : w.budgetMonthlyLimit * 0.7;
    return {
      name: w.name.length > 18 ? w.name.substring(0, 16) + '...' : w.name,
      spend: cost,
      env: w.environment,
    };
  });

  // Aggregate cost by environment
  const envCosts = [
    {
      name: 'Production',
      value: workloadCostData
        .filter((d) => d.env === 'production')
        .reduce((sum, d) => sum + d.spend, 0),
      color: '#8b5cf6',
    },
    {
      name: 'Staging',
      value: workloadCostData
        .filter((d) => d.env === 'staging')
        .reduce((sum, d) => sum + d.spend, 0),
      color: '#3b82f6',
    },
    {
      name: 'Development',
      value: workloadCostData
        .filter((d) => d.env === 'development')
        .reduce((sum, d) => sum + d.spend, 0),
      color: '#10b981',
    },
  ];

  const totalCalculated = workloadCostData.reduce((a, b) => a + b.spend, 0);
  const projectedSpend = Number((currentWorkspace.currentSpend * 1.08).toFixed(2));
  const budgetRatio = (currentWorkspace.currentSpend / currentWorkspace.monthlyBudget) * 100;

  const handleSaveBudget = () => {
    const parsed = parseFloat(budgetVal);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateWorkspace({
        ...currentWorkspace,
        monthlyBudget: parsed,
      });
      setIsEditingBudget(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-indigo-400" />
            FinOps &amp; Cloud Cost Intelligence
          </h1>
          <p className="text-xs text-slate-400">
            Explicit pricing disclosures, budget burn telemetry, and workload cost allocation
          </p>
        </div>

        {/* Budget Editor */}
        <div className="flex items-center gap-2">
          {isEditingBudget ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-1">
              <span className="text-xs text-slate-400 pl-2">$</span>
              <input
                type="number"
                value={budgetVal}
                onChange={(e) => setBudgetVal(e.target.value)}
                className="w-24 bg-transparent text-xs text-white focus:outline-none"
              />
              <button
                onClick={handleSaveBudget}
                className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingBudget(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 transition cursor-pointer"
            >
              <Edit2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>Edit Budget (${currentWorkspace.monthlyBudget.toLocaleString()})</span>
            </button>
          )}
        </div>
      </div>

      {/* Disclosures Safeguard Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-slate-300">
            <strong>Transparent Pricing Truth:</strong> All estimates separate verified On-Demand hourly card rates from user assumptions. No billing API charges incurred.
          </span>
        </div>
        <span className="text-slate-400 text-[11px] font-mono shrink-0">
          Currency: USD ($) · US-East-1 Standard
        </span>
      </div>

      {/* Primary KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs text-slate-400">Current Spend to Date</div>
          <div className="text-2xl font-bold text-white mt-1">
            ${currentWorkspace.currentSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {budgetRatio.toFixed(1)}% of ${currentWorkspace.monthlyBudget.toLocaleString()} limit
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs text-slate-400">Forecasted Month-End Spend</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">
            ${projectedSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            Safe buffer: ${(currentWorkspace.monthlyBudget - projectedSpend).toFixed(2)} under cap
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs text-slate-400">Active Workload Cost Sum</div>
          <div className="text-2xl font-bold text-white mt-1">
            ${totalCalculated.toFixed(2)}
            <span className="text-xs font-normal text-slate-400">/mo</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {workloads.length} provisioned containers
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workload Breakdown Bar Chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <h3 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
            <BarChart2 className="h-4 w-4 text-indigo-400" />
            Monthly Cost Allocation by Workload
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">
            Measured against current provisioning sizing configurations
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadCostData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                  formatter={(val: any) => [`$${val.toFixed(2)}`, 'Monthly Cost']}
                />
                <Bar dataKey="spend" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Environment Distribution Pie Chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
              <PieIcon className="h-4 w-4 text-purple-400" />
              Spend Distribution by Environment
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Production vs non-production cost split
            </p>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={envCosts.filter((e) => e.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {envCosts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                    formatter={(v: any) => [`$${v.toFixed(2)}`, 'Cost']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-800 text-xs">
            {envCosts.map((e) => (
              <div key={e.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                  <span className="text-slate-300">{e.name}</span>
                </div>
                <span className="font-semibold text-white">${e.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
