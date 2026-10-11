import React from 'react';
import {
  TrendingDown,
  CheckCircle2,
  Check,
  Zap,
  Clock,
  HardDrive,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { CostOptimization } from '../../types';

interface OptimizationRecommendationsViewProps {
  optimizations: CostOptimization[];
  onApplyOptimization: (id: string) => void;
}

export const OptimizationRecommendationsView: React.FC<OptimizationRecommendationsViewProps> = ({
  optimizations,
  onApplyOptimization,
}) => {
  const openItems = optimizations.filter((o) => o.status === 'open');
  const appliedItems = optimizations.filter((o) => o.status === 'applied');

  const totalAvailableSavings = openItems.reduce((acc, curr) => acc + curr.monthlySavings, 0);
  const realizedSavings = appliedItems.reduce((acc, curr) => acc + curr.monthlySavings, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-indigo-400" />
            FinOps Workload Rightsizing &amp; Cost Optimization
          </h1>
          <p className="text-xs text-slate-400">
            Actionable resource reclamation and architecture efficiency opportunities
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-right">
            <div className="text-[10px] text-emerald-400 font-semibold uppercase">
              Available Monthly Savings
            </div>
            <div className="text-lg font-bold text-white">
              +${totalAvailableSavings.toFixed(2)}
              <span className="text-xs font-normal text-slate-400">/mo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Optimizations List */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Actionable Recommendations ({openItems.length})
        </h2>

        {openItems.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400 mb-2" />
            <h3 className="text-sm font-semibold text-white">Cloud Architecture Fully Optimized!</h3>
            <p className="text-xs text-slate-400 mt-1">
              Zero unattached storage volumes or overprovisioned container clusters detected.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {openItems.map((opt) => (
              <div
                key={opt.id}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-white">{opt.title}</span>
                    <span className="rounded bg-indigo-500/10 text-indigo-300 px-2 py-0.5 text-[10px] font-mono border border-indigo-500/20">
                      {opt.resourceType}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        opt.effort === 'Low'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : opt.effort === 'Medium'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {opt.effort} Effort
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 pt-1">
                    <span>
                      Current Spend:{' '}
                      <strong className="text-slate-300">${opt.currentMonthlyCost}/mo</strong>
                    </span>
                    <span>→</span>
                    <span>
                      Optimized Spend:{' '}
                      <strong className="text-emerald-400">${opt.optimizedMonthlyCost}/mo</strong>
                    </span>
                    <span className="rounded bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                      -{opt.savingsPercentage}% Reduction
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <div className="text-right">
                    <div className="text-base font-bold text-emerald-400">
                      +${opt.monthlySavings.toFixed(2)}/mo
                    </div>
                    <div className="text-[10px] text-slate-500">Net Annual: ${(opt.monthlySavings * 12).toFixed(0)}/yr</div>
                  </div>

                  <button
                    onClick={() => onApplyOptimization(opt.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-500 transition cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Apply Optimization
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Applied History */}
        {appliedItems.length > 0 && (
          <div className="space-y-3 pt-6">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Realized Savings History ({appliedItems.length})
            </h2>

            <div className="space-y-2">
              {appliedItems.map((opt) => (
                <div
                  key={opt.id}
                  className="rounded-lg border border-slate-800/60 bg-slate-950/40 p-3.5 flex items-center justify-between text-xs text-slate-400"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-slate-300 font-medium">{opt.title}</span>
                  </div>
                  <span className="font-bold text-emerald-400">
                    +${opt.monthlySavings.toFixed(2)}/mo saved
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
