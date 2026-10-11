import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Shield,
  User,
  Clock,
  Lock,
  Layers,
} from 'lucide-react';
import { AuditLog } from '../../types';

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');

  const filtered = logs.filter((log) => {
    const matchesSearch =
      log.actorEmail.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.resourceName.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());

    const matchesAction = selectedAction === 'all' || log.action === selectedAction;

    return matchesSearch && matchesAction;
  });

  const actions = Array.from(new Set(logs.map((l) => l.action)));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <History className="h-5 w-5 text-indigo-400" />
          Tenant-Isolated Immutable Audit Logs
        </h1>
        <p className="text-xs text-slate-400">
          Chronological compliance ledger recording every mutation, authorization, and deployment event
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search audit trail by actor, resource, details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-950/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none cursor-pointer"
        >
          <option value="all">All Audit Actions</option>
          {actions.map((act) => (
            <option key={act} value={act}>
              {act}
            </option>
          ))}
        </select>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Actor &amp; Role</th>
                <th className="pb-3">Action Event</th>
                <th className="pb-3">Target Resource</th>
                <th className="pb-3">Event Details</th>
                <th className="pb-3 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((log) => (
                <tr key={log.id} className="text-slate-300 hover:bg-slate-800/40">
                  <td className="py-3 text-[11px] text-slate-400 font-mono whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3">
                    <div className="font-semibold text-white truncate max-w-[150px]">
                      {log.actorEmail}
                    </div>
                    <span className="rounded bg-indigo-500/10 text-indigo-300 px-1.5 py-0.2 text-[10px] font-medium">
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="font-semibold text-slate-200">{log.resourceName}</div>
                    <span className="text-[10px] text-slate-500">{log.resourceType}</span>
                  </td>
                  <td className="py-3 text-[11px] text-slate-300 max-w-xs">{log.details}</td>
                  <td className="py-3 text-right font-mono text-[10px] text-slate-500 whitespace-nowrap">
                    {log.ipAddress}
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
