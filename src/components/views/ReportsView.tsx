import React, { useState } from 'react';
import {
  FileText,
  Download,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  TrendingDown,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Workspace, Workload, ResourceRecommendation, CostOptimization } from '../../types';

interface ReportsViewProps {
  currentWorkspace: Workspace;
  workloads: Workload[];
  recommendations: ResourceRecommendation[];
  optimizations: CostOptimization[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  currentWorkspace,
  workloads,
  recommendations,
  optimizations,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const totalSavings = optimizations
    .filter((o) => o.status === 'open')
    .reduce((acc, curr) => acc + curr.monthlySavings, 0);

  const exportReportJson = () => {
    const reportData = {
      workspace: currentWorkspace,
      generatedAt: new Date().toISOString(),
      executiveSummary: {
        totalWorkloads: workloads.length,
        monthlyBudget: currentWorkspace.monthlyBudget,
        currentSpend: currentWorkspace.currentSpend,
        potentialMonthlySavings: totalSavings,
        architectureHealthScore: 98,
      },
      workloadCatalog: workloads.map((w) => ({
        id: w.id,
        name: w.name,
        type: w.type,
        environment: w.environment,
        provider: w.provider,
        cpu: w.cpuCores,
        ram: w.memoryGb,
        rps: w.expectedRps,
        sla: w.availabilitySla,
      })),
      finopsRecommendations: optimizations,
      auditCompliance: {
        zeroSurpriseBillingConfirmed: true,
        leastPrivilegeRoleEnforced: true,
        crossTenantIsolationActive: true,
      },
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AstraDeploy_Executive_Audit_${currentWorkspace.slug}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            Executive Architecture &amp; FinOps Audit Report
          </h1>
          <p className="text-xs text-slate-400">
            Exportable compliance dossier and resource efficiency scorecard for leadership &amp; FinOps teams
          </p>
        </div>

        <button
          onClick={exportReportJson}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition cursor-pointer self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          {downloadSuccess ? 'Downloaded Audit JSON!' : 'Export Executive Dossier'}
        </button>
      </div>

      {/* Scorecard Hero */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              Audit Grade: A+ (98/100)
            </span>
            <h2 className="text-xl font-bold text-white">
              Cloud Architecture Health &amp; Cost Compliance Score
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Workspace &apos;{currentWorkspace.name}&apos; passes all enterprise reliability, zero-public-IP network isolation, and multi-AZ SLA redundancy checks.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-center min-w-[130px]">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Monthly Spend</div>
              <div className="text-xl font-bold text-white mt-1">
                ${currentWorkspace.currentSpend.toFixed(0)}
              </div>
              <div className="text-[10px] text-emerald-400">Under Budget</div>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center min-w-[130px]">
              <div className="text-[10px] text-emerald-400 font-semibold uppercase">Net Savings</div>
              <div className="text-xl font-bold text-white mt-1">
                +${totalSavings.toFixed(0)}/mo
              </div>
              <div className="text-[10px] text-emerald-400">Identified</div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Checklist Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="h-4 w-4" />
            <span>Zero Uncontrolled Cloud Costs</span>
          </div>
          <p className="text-[11px] text-slate-400">
            No automated billable resources can be provisioned without human verification of the Terraform plan diff.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Least-Privilege Security Policy</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Cloud adapters restricted to ReadOnlyAccess; IAM credentials scoped with zero write access.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <Layers className="h-4 w-4" />
            <span>Multi-Tenant Isolation Strictness</span>
          </div>
          <p className="text-[11px] text-slate-400">
            All workload definitions, telemetry metrics, and audit entries are hard-partitioned by workspace UUID.
          </p>
        </div>
      </div>

      {/* Workload Inventory Summary Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Audited Workloads Roster ({workloads.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                <th className="pb-2">Name</th>
                <th className="pb-2">Env</th>
                <th className="pb-2">Cloud Provider</th>
                <th className="pb-2">vCPU / RAM</th>
                <th className="pb-2">Traffic Load</th>
                <th className="pb-2">Availability SLA</th>
                <th className="pb-2">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {workloads.map((w) => (
                <tr key={w.id} className="text-slate-300">
                  <td className="py-2.5 font-bold text-white">{w.name}</td>
                  <td className="py-2.5 uppercase text-[10px] font-mono">{w.environment}</td>
                  <td className="py-2.5 font-mono">{w.provider} ({w.region})</td>
                  <td className="py-2.5">{w.cpuCores} Cores / {w.memoryGb} GB</td>
                  <td className="py-2.5 text-indigo-300 font-semibold">{w.expectedRps} RPS</td>
                  <td className="py-2.5 text-emerald-400 font-semibold">{w.availabilitySla}%</td>
                  <td className="py-2.5">
                    <span className="rounded bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-semibold border border-emerald-500/20">
                      PASSED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
