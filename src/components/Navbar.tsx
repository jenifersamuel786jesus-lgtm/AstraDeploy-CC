import React, { useState } from 'react';
import {
  Layers,
  ChevronDown,
  Shield,
  Plus,
  RefreshCw,
  Building,
  CheckCircle2,
  Lock,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { User, Workspace } from '../types';

interface NavbarProps {
  currentUser: User;
  currentWorkspace: Workspace;
  workspaces: Workspace[];
  onSelectWorkspace: (id: string) => void;
  onOpenCreateWorkload: () => void;
  onOpenNewWorkspace: () => void;
  onLogout: () => void;
  onOpenBeginnerWizard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentWorkspace,
  workspaces,
  onSelectWorkspace,
  onOpenCreateWorkload,
  onOpenNewWorkspace,
  onLogout,
  onOpenBeginnerWizard,
}) => {
  const [showWsMenu, setShowWsMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">
                  Astra<span className="text-indigo-400">Deploy</span>
                </span>
                <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-indigo-400 border border-indigo-500/20">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Intelligent Cloud Sizing &amp; MLOps
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center h-5 w-[1px] bg-slate-800 mx-2" />

          {/* Workspace Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowWsMenu(!showWsMenu)}
              className="flex items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-850 hover:border-slate-700 transition"
            >
              <Building className="h-3.5 w-3.5 text-indigo-400" />
              <div className="text-left">
                <div className="font-semibold text-white leading-tight max-w-[140px] sm:max-w-[180px] truncate">
                  {currentWorkspace.name}
                </div>
                <div className="text-[10px] text-slate-400">
                  Budget: ${currentWorkspace.monthlyBudget.toLocaleString()}/mo
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
            </button>

            {showWsMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowWsMenu(false)}
                />
                <div className="absolute left-0 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Workspace (Tenant)
                  </div>
                  <div className="space-y-1">
                    {workspaces.map((ws) => (
                      <button
                        key={ws.id}
                        onClick={() => {
                          onSelectWorkspace(ws.id);
                          setShowWsMenu(false);
                        }}
                        className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition text-left ${
                          ws.id === currentWorkspace.id
                            ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <div className="truncate">{ws.name}</div>
                          <div className="text-[10px] text-slate-400">
                            Spend: ${ws.currentSpend.toFixed(0)} / ${ws.monthlyBudget}
                          </div>
                        </div>
                        {ws.id === currentWorkspace.id && (
                          <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 border-t border-slate-800 pt-2">
                    <button
                      onClick={() => {
                        setShowWsMenu(false);
                        onOpenNewWorkspace();
                      }}
                      className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-indigo-400 hover:bg-indigo-500/10 transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create New Workspace
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Safeguard indicator */}
          <div className="hidden md:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            <span>Dry-Run Safeguards Active</span>
          </div>

          {/* Beginner Guide Button */}
          <button
            onClick={onOpenBeginnerWizard}
            className="flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span className="hidden sm:inline">New to ML? Guide</span>
          </button>

          {/* Quick Create Workload Button */}
          <button
            onClick={onOpenCreateWorkload}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition active:scale-95 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Workload</span>
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-1.5 hover:bg-slate-800 transition"
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden xl:block text-left pr-1">
                <div className="text-xs font-semibold text-white leading-none">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-indigo-400 mt-0.5">
                  {currentUser.role}
                </div>
              </div>
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-2xl z-50">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {currentUser.email}
                      </div>
                      <span className="inline-block mt-1 rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300">
                        Role: {currentUser.role}
                      </span>
                    </div>
                  </div>
                  <div className="py-2 text-[11px] text-slate-400 space-y-1">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Lock className="h-3 w-3 text-slate-400" />
                      Strict Tenant Isolation
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <UserCheck className="h-3 w-3 text-emerald-400" />
                      Session Verified
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-800/80 px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition cursor-pointer"
                    >
                      Sign Out / Switch Account
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
