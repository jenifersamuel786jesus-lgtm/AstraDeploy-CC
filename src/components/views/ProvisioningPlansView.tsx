import React, { useState } from 'react';
import {
  FileCode2,
  CheckCircle2,
  AlertTriangle,
  Play,
  Shield,
  Layers,
  Copy,
  Check,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { ProvisioningPlan } from '../../types';

interface ProvisioningPlansViewProps {
  plans: ProvisioningPlan[];
  onApproveAndApply: (planId: string) => void;
}

export const ProvisioningPlansView: React.FC<ProvisioningPlansViewProps> = ({
  plans,
  onApproveAndApply,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    plans[0]?.id || ''
  );
  const [copied, setCopied] = useState(false);
  const [confirmApplyModal, setConfirmApplyModal] = useState<ProvisioningPlan | null>(null);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <FileCode2 className="h-5 w-5 text-indigo-400" />
          Safe Infrastructure Provisioning Plans (Terraform Dry-Run)
        </h1>
        <p className="text-xs text-slate-400">
          Preview planned state diffs, automated security policies, and cost impacts before execution
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/20 p-12 text-center">
          <FileCode2 className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-white">No Terraform plans generated yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Navigate to Workloads and click &quot;Dry-Run Plan&quot; to compile reviewable HCL blueprints.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plans List Column */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Generated Plans ({plans.length})
            </h2>
            {plans.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPlanId(p.id)}
                className={`rounded-xl border p-4 cursor-pointer transition ${
                  p.id === selectedPlan?.id
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-md'
                    : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white truncate max-w-[170px]">
                    {p.workloadName}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold border ${
                      p.status === 'applied'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {p.status === 'applied' ? 'Applied' : 'Plan Ready'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400">
                  Provider: <strong className="text-slate-300">{p.provider}</strong> · Est:{' '}
                  <span className="text-emerald-400 font-semibold">
                    +${p.estimatedMonthlyCostDelta}/mo
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">+{p.planSummary.add} add</span>
                    <span className="text-amber-400 font-bold">~{p.planSummary.change} change</span>
                    <span className="text-rose-400 font-bold">-{p.planSummary.destroy} destroy</span>
                  </div>
                  <span className="text-slate-500">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Plan Details & Terraform HCL Column */}
          {selectedPlan && (
            <div className="lg:col-span-2 space-y-4">
              {/* Plan Summary Card */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {selectedPlan.title}
                    </h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Target Provider: <span className="text-slate-200 font-semibold">{selectedPlan.provider}</span> · Created by: <span className="font-mono text-slate-300">{selectedPlan.createdBy}</span>
                    </div>
                  </div>

                  {selectedPlan.status !== 'applied' && (
                    <button
                      onClick={() => setConfirmApplyModal(selectedPlan)}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-500 transition cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Approve &amp; Apply Plan
                    </button>
                  )}
                </div>

                {/* Dry Run Resource Stats */}
                <div className="grid grid-cols-3 gap-3 my-4">
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-center">
                    <div className="text-[10px] text-emerald-400 font-semibold">Resources to Add</div>
                    <div className="text-xl font-bold text-emerald-300">+{selectedPlan.planSummary.add}</div>
                  </div>
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-center">
                    <div className="text-[10px] text-amber-400 font-semibold">Resources to Modify</div>
                    <div className="text-xl font-bold text-amber-300">~{selectedPlan.planSummary.change}</div>
                  </div>
                  <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5 text-center">
                    <div className="text-[10px] text-rose-400 font-semibold">Resources to Destroy</div>
                    <div className="text-xl font-bold text-rose-300">-{selectedPlan.planSummary.destroy}</div>
                  </div>
                </div>

                {/* Pre-Flight Security & Cost Checks */}
                <div className="space-y-2 mt-4 pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-indigo-400" />
                    Automated Pre-Flight Security &amp; Guardrail Audits
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedPlan.securityChecks.map((chk, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 flex items-start gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-white">{chk.rule}</div>
                          <div className="text-[11px] text-slate-400">{chk.note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* HCL Viewer */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white font-mono">
                    main.tf ({selectedPlan.provider})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const blob = new Blob([selectedPlan.terraformHcl], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `astradeploy_${selectedPlan.provider.toLowerCase()}_${selectedPlan.workloadName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.tf`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-300 hover:bg-indigo-500/20 transition cursor-pointer"
                    >
                      <Layers className="h-3.5 w-3.5" />
                      <span>Download .tf File</span>
                    </button>
                    <button
                      onClick={() => handleCopy(selectedPlan.terraformHcl)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copied ? 'Copied HCL' : 'Copy Code'}</span>
                    </button>
                  </div>
                </div>

                <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400/90 overflow-x-auto leading-relaxed max-h-96">
                  {selectedPlan.terraformHcl}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Explicit Confirmation Modal */}
      {confirmApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-bold text-white">
                Authorize Infrastructure Apply
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to apply the Terraform plan for{' '}
              <strong className="text-white">{confirmApplyModal.workloadName}</strong>.
            </p>

            <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Provider:</span>
                <span className="font-semibold text-white">{confirmApplyModal.provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Planned Resources:</span>
                <span className="text-emerald-400 font-bold">+{confirmApplyModal.planSummary.add} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Cost Delta:</span>
                <span className="text-white font-bold">+${confirmApplyModal.estimatedMonthlyCostDelta}/mo</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmApplyModal(null)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onApproveAndApply(confirmApplyModal.id);
                  setConfirmApplyModal(null);
                }}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 cursor-pointer shadow-md shadow-emerald-600/30"
              >
                Confirm &amp; Record Execution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
