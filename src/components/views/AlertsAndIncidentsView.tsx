import React, { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Plus,
  Sliders,
  Check,
} from 'lucide-react';
import { AlertRule, Incident } from '../../types';

interface AlertsAndIncidentsViewProps {
  alertRules: AlertRule[];
  incidents: Incident[];
  onResolveIncident: (id: string, rootCause: string) => void;
}

export const AlertsAndIncidentsView: React.FC<AlertsAndIncidentsViewProps> = ({
  alertRules,
  incidents,
  onResolveIncident,
}) => {
  const [resolveModal, setResolveModal] = useState<Incident | null>(null);
  const [rootCauseInput, setRootCauseInput] = useState('');

  const openIncidents = incidents.filter((i) => i.status !== 'resolved');
  const resolvedIncidents = incidents.filter((i) => i.status === 'resolved');

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resolveModal && rootCauseInput.trim()) {
      onResolveIncident(resolveModal.id, rootCauseInput.trim());
      setResolveModal(null);
      setRootCauseInput('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-indigo-400" />
          Alert Rules, SLA Thresholds &amp; Incident Management
        </h1>
        <p className="text-xs text-slate-400">
          Proactive SLA breach monitors, threshold alert policies, and incident resolution audit trails
        </p>
      </div>

      {/* Active Incidents Banner / List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active Incidents ({openIncidents.length})
          </h2>
          {openIncidents.length === 0 && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> All systems nominal
            </span>
          )}
        </div>

        {openIncidents.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
            <h3 className="text-sm font-semibold text-white">No active incidents</h3>
            <p className="text-xs text-slate-400 mt-1">
              All workloads are responding within expected latency and error budgets.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {openIncidents.map((inc) => (
              <div
                key={inc.id}
                className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        inc.severity === 'critical'
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-500 text-black'
                      }`}
                    >
                      {inc.severity}
                    </span>
                    <span className="text-sm font-bold text-white">{inc.title}</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Target Workload: <strong className="text-white">{inc.workloadName}</strong> ·
                    Observed: <span className="font-mono text-rose-300">{inc.metricValue}</span> (Threshold: {inc.threshold})
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Triggered at: {new Date(inc.triggeredAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setResolveModal(inc);
                      setRootCauseInput('');
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Document Root Cause &amp; Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Configured Alert Rules Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Bell className="h-4 w-4 text-indigo-400" />
          Configured Alert Rules &amp; Triggers
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                <th className="pb-2">Rule Name</th>
                <th className="pb-2">Telemetry Metric</th>
                <th className="pb-2">Condition</th>
                <th className="pb-2">Duration</th>
                <th className="pb-2">Severity</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {alertRules.map((rule) => (
                <tr key={rule.id} className="text-slate-300 hover:bg-slate-800/40">
                  <td className="py-2.5 font-bold text-white">{rule.name}</td>
                  <td className="py-2.5 font-mono text-indigo-300">{rule.metric}</td>
                  <td className="py-2.5 font-mono">
                    {rule.operator} {rule.threshold}
                  </td>
                  <td className="py-2.5">{rule.durationMinutes} minutes</td>
                  <td className="py-2.5">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                        rule.severity === 'critical'
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {rule.severity}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold">
                      Enabled
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolved Incidents History */}
      {resolvedIncidents.length > 0 && (
        <div className="space-y-3 pt-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Resolved Incidents Archive ({resolvedIncidents.length})
          </h2>
          <div className="space-y-2">
            {resolvedIncidents.map((inc) => (
              <div
                key={inc.id}
                className="rounded-lg border border-slate-800/60 bg-slate-950/40 p-3.5 text-xs text-slate-400 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">{inc.title}</span>
                  <span className="text-emerald-400 font-medium">Resolved</span>
                </div>
                {inc.rootCause && (
                  <div className="text-[11px] text-slate-500">
                    Root Cause: <span className="text-slate-300">{inc.rootCause}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      {resolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Resolve Incident</h3>
            <p className="text-xs text-slate-300">
              Please enter the root cause analysis and resolution notes for{' '}
              <strong className="text-white">{resolveModal.title}</strong>:
            </p>

            <form onSubmit={handleResolveSubmit} className="space-y-3">
              <textarea
                required
                value={rootCauseInput}
                onChange={(e) => setRootCauseInput(e.target.value)}
                placeholder="e.g. Traffic spike absorbed cleanly after horizontal replica auto-scaled to 6 pods."
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                rows={3}
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolveModal(null)}
                  className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-500 cursor-pointer"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
