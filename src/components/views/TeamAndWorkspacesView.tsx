import React, { useState } from 'react';
import {
  Users2,
  Building,
  UserPlus,
  Shield,
  CheckCircle2,
  Lock,
  Layers,
  Check,
} from 'lucide-react';
import { Workspace, WorkspaceMember, UserRole } from '../../types';

interface TeamAndWorkspacesViewProps {
  workspaces: Workspace[];
  currentWorkspace: Workspace;
  members: WorkspaceMember[];
  onSelectWorkspace: (id: string) => void;
  onOpenNewWorkspace: () => void;
  onAddMember: (email: string, name: string, role: UserRole) => void;
}

export const TeamAndWorkspacesView: React.FC<TeamAndWorkspacesViewProps> = ({
  workspaces,
  currentWorkspace,
  members,
  onSelectWorkspace,
  onOpenNewWorkspace,
  onAddMember,
}) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Engineer');

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && name) {
      onAddMember(email, name, role);
      setShowInviteModal(false);
      setName('');
      setEmail('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users2 className="h-5 w-5 text-indigo-400" />
            Multi-Tenant Workspaces &amp; RBAC Access Control
          </h1>
          <p className="text-xs text-slate-400">
            Tenant partition management, role assignments, and team invitations
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenNewWorkspace}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition cursor-pointer"
          >
            <Building className="h-4 w-4 text-indigo-400" />
            New Workspace
          </button>

          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </button>
        </div>
      </div>

      {/* Workspaces Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Available Workspaces ({workspaces.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {workspaces.map((ws) => {
            const isCurrent = ws.id === currentWorkspace.id;
            return (
              <div
                key={ws.id}
                onClick={() => onSelectWorkspace(ws.id)}
                className={`rounded-xl border p-4 cursor-pointer transition ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-500/15 shadow-lg shadow-indigo-500/10'
                    : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">{ws.name}</span>
                  {isCurrent && (
                    <span className="rounded bg-indigo-500 text-white px-2 py-0.5 text-[10px] font-bold">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400">
                  Budget: <strong className="text-white">${ws.monthlyBudget.toLocaleString()}</strong>/mo
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Spend: ${ws.currentSpend.toFixed(0)} ({Math.round((ws.currentSpend / ws.monthlyBudget) * 100)}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Workspace Members Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-indigo-400" />
            Members with Access to &apos;{currentWorkspace.name}&apos;
          </h3>
          <span className="text-xs text-slate-400">{members.length} Members</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">Assigned RBAC Role</th>
                <th className="pb-3">Joined Date</th>
                <th className="pb-3 text-right">Access Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {members.map((m) => (
                <tr key={m.id} className="text-slate-300 hover:bg-slate-800/40">
                  <td className="py-3 font-semibold text-white">{m.name}</td>
                  <td className="py-3 font-mono text-slate-400">{m.email}</td>
                  <td className="py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        m.role === 'Owner'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : m.role === 'Admin'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {m.role}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">
                    {new Date(m.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right">
                    <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-indigo-400" />
              Invite Team Member
            </h3>

            <form onSubmit={handleInviteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@company.io"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">RBAC Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                >
                  <option value="Engineer">Engineer (Create workloads, run plans)</option>
                  <option value="Admin">Admin (Full workspace control &amp; apply plans)</option>
                  <option value="Viewer">Viewer (Read-only observability access)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 font-semibold text-white hover:bg-indigo-500 cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
