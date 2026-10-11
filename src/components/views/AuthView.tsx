import React, { useState } from 'react';
import {
  Layers,
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Server,
  Cpu,
  CheckCircle2,
  Key,
  Building,
} from 'lucide-react';
import { UserRole } from '../../types';
import { storage } from '../../services/storage';

interface AuthViewProps {
  onLoginSuccess: (user: any) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('principal.architect@astradeploy.io');
  const [password, setPassword] = useState('Architect2026!');
  const [name, setName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [role, setRole] = useState<UserRole>('Owner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setError('Please enter your work email.');
      return;
    }
    setLoading(true);
    setError('');

    setTimeout(() => {
      let loggedUser;
      if (isRegister) {
        const { user } = storage.register(
          name || 'New Engineer',
          email,
          role,
          workspaceName || `${name || 'My'}'s Cloud Workspace`
        );
        loggedUser = user;
      } else if (email.includes('elena')) {
        loggedUser = {
          id: 'usr-devops-2',
          email: 'elena.r@astradeploy.io',
          name: 'Elena Rostova',
          role: 'Admin',
        };
      } else if (email.includes('chen')) {
        loggedUser = {
          id: 'usr-ml-3',
          email: 'd.chen@astradeploy.io',
          name: 'David Chen',
          role: 'Engineer',
        };
      } else if (email.includes('auditor')) {
        loggedUser = {
          id: 'usr-audit-4',
          email: 'auditor@astradeploy.io',
          name: 'Marcus Vance',
          role: 'Viewer',
        };
      } else {
        loggedUser = {
          id: 'usr-senior-arch-1',
          email,
          name: name || (email.split('@')[0].replace('.', ' ') || 'Alex Rivera'),
          role,
        };
      }

      onLoginSuccess(loggedUser);
      setLoading(false);
    }, 700);
  };

  const quickLoginAs = (userEmail: string, userPassword: string, userRole: UserRole) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setRole(userRole);
    setLoading(true);
    setTimeout(() => {
      let loggedUser;
      if (userEmail.includes('elena')) {
        loggedUser = {
          id: 'usr-devops-2',
          email: userEmail,
          name: 'Elena Rostova',
          role: 'Admin',
        };
      } else if (userEmail.includes('chen')) {
        loggedUser = {
          id: 'usr-ml-3',
          email: userEmail,
          name: 'David Chen',
          role: 'Engineer',
        };
      } else if (userEmail.includes('auditor')) {
        loggedUser = {
          id: 'usr-audit-4',
          email: userEmail,
          name: 'Marcus Vance',
          role: 'Viewer',
        };
      } else {
        loggedUser = {
          id: 'usr-senior-arch-1',
          email: userEmail,
          name: 'Alex Rivera',
          role: 'Owner',
        };
      }
      onLoginSuccess(loggedUser);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background visual accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 shadow-xl shadow-indigo-500/25 ring-1 ring-white/20 mb-2">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Astra<span className="text-indigo-400">Deploy</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Context-aware cloud resource provisioning, workload intelligence, cost governance, and MLOps platform
          </p>
        </div>

        {/* Card Form */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl space-y-5">
          <div className="flex border-b border-slate-800">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`flex-1 pb-3 text-xs font-semibold border-b-2 transition ${
                !isRegister
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Secure Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`flex-1 pb-3 text-xs font-semibold border-b-2 transition ${
                isRegister
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
            {isRegister && (
              <>
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jenifer Samuel"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950/80 pl-9 pr-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-medium">Workspace / Project Name</label>
                    <span className="text-[10px] text-indigo-400">Your Private Organization</span>
                  </div>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      placeholder="e.g. Jenifer's AI Laboratory"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950/80 pl-9 pr-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    💡 A <strong>Workspace</strong> is your isolated private cloud project. Your models and billing remain completely separated from other teams.
                  </p>
                </div>
              </>
            )}

            <div>
              <label className="text-slate-300 block mb-1 font-medium">Work Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/80 pl-9 pr-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/80 pl-9 pr-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Workspace Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Owner">Principal Architect (Owner)</option>
                  <option value="Admin">DevOps / Cloud Engineer (Admin)</option>
                  <option value="Engineer">ML Engineer / Developer</option>
                  <option value="Viewer">FinOps / Security Auditor (Viewer)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 py-2.5 font-semibold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-indigo-400 transition cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span>Authenticating Workspace...</span>
              ) : (
                <>
                  <span>{isRegister ? 'Register & Initialize Workspace' : 'Sign In to AstraDeploy'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold text-center">
              Quick 1-Click Persona Sign In
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => quickLoginAs('principal.architect@astradeploy.io', 'Architect2026!', 'Owner')}
                className="rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-left hover:border-indigo-500 hover:bg-slate-850 transition"
              >
                <div className="font-bold text-white leading-tight truncate">Alex Rivera</div>
                <div className="text-[10px] text-indigo-400">Principal Architect</div>
              </button>

              <button
                type="button"
                onClick={() => quickLoginAs('elena.r@astradeploy.io', 'DevOps2026!', 'Admin')}
                className="rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-left hover:border-indigo-500 hover:bg-slate-850 transition"
              >
                <div className="font-bold text-white leading-tight truncate">Elena Rostova</div>
                <div className="text-[10px] text-emerald-400">DevOps Admin</div>
              </button>

              <button
                type="button"
                onClick={() => quickLoginAs('d.chen@astradeploy.io', 'MLEngineer2026!', 'Engineer')}
                className="rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-left hover:border-indigo-500 hover:bg-slate-850 transition"
              >
                <div className="font-bold text-white leading-tight truncate">David Chen</div>
                <div className="text-[10px] text-purple-400">ML Engineer</div>
              </button>

              <button
                type="button"
                onClick={() => quickLoginAs('auditor@astradeploy.io', 'Auditor2026!', 'Viewer')}
                className="rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-left hover:border-indigo-500 hover:bg-slate-850 transition"
              >
                <div className="font-bold text-white leading-tight truncate">Marcus Vance</div>
                <div className="text-[10px] text-amber-400">FinOps Auditor</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security & Zero Surprise Cost Banner */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-[11px] text-slate-300 flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>
            <strong>Zero-Cost Sandbox Active:</strong> No cloud charges or billable resources can be created without manual confirmation.
          </span>
        </div>
      </div>
    </div>
  );
};
