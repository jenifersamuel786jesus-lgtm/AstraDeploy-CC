import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  FileSearch,
  Cpu,
  Cloud,
  FileCode2,
  Rocket,
  Activity,
  DollarSign,
  TrendingDown,
  FlaskConical,
  Library,
  GitFork,
  AlertTriangle,
  FileText,
  History,
  Users2,
  Settings,
  CreditCard,
  ChevronRight,
} from 'lucide-react';

export type ViewType =
  | 'overview'
  | 'workloads'
  | 'workload-details'
  | 'recommendations'
  | 'providers'
  | 'plans'
  | 'deployments'
  | 'monitoring'
  | 'cost-intelligence'
  | 'optimizations'
  | 'billing'
  | 'ml-experiments'
  | 'model-registry'
  | 'ml-pipelines'
  | 'alerts'
  | 'reports'
  | 'audit-logs'
  | 'team'
  | 'settings';

interface SidebarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  workloadCount: number;
  openIncidentsCount: number;
  optimizationCount: number;
}

interface SidebarItem {
  id: ViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  workloadCount,
  openIncidentsCount,
  optimizationCount,
}) => {
  const groups: { title: string; items: SidebarItem[] }[] = [
    {
      title: 'CORE COMPUTE & CLOUD',
      items: [
        { id: 'overview' as ViewType, label: 'Overview', icon: LayoutDashboard },
        {
          id: 'workloads' as ViewType,
          label: 'Workloads',
          icon: Boxes,
          badge: workloadCount,
        },
        {
          id: 'workload-details' as ViewType,
          label: 'Workload Details',
          icon: FileSearch,
        },
        {
          id: 'recommendations' as ViewType,
          label: 'Resource Sizing',
          icon: Cpu,
        },
        { id: 'providers' as ViewType, label: 'Cloud Providers', icon: Cloud },
        { id: 'plans' as ViewType, label: 'Provisioning Plans', icon: FileCode2 },
        { id: 'deployments' as ViewType, label: 'Deployments', icon: Rocket },
      ],
    },
    {
      title: 'OBSERVABILITY & FINOPS',
      items: [
        { id: 'monitoring' as ViewType, label: 'Monitoring', icon: Activity },
        {
          id: 'cost-intelligence' as ViewType,
          label: 'Cost Intelligence',
          icon: DollarSign,
        },
        {
          id: 'optimizations' as ViewType,
          label: 'Optimizations',
          icon: TrendingDown,
          badge: optimizationCount,
          badgeColor: 'bg-emerald-500/20 text-emerald-400',
        },
        {
          id: 'billing' as ViewType,
          label: 'Billing & Gateway',
          icon: CreditCard,
        },
        {
          id: 'alerts' as ViewType,
          label: 'Alerts & Incidents',
          icon: AlertTriangle,
          badge: openIncidentsCount > 0 ? openIncidentsCount : undefined,
          badgeColor: 'bg-rose-500/20 text-rose-400',
        },
      ],
    },
    {
      title: 'MLOPS & AI WORKLOADS',
      items: [
        {
          id: 'ml-experiments' as ViewType,
          label: 'ML Experiments',
          icon: FlaskConical,
        },
        {
          id: 'model-registry' as ViewType,
          label: 'Model Registry',
          icon: Library,
        },
        { id: 'ml-pipelines' as ViewType, label: 'ML Pipelines', icon: GitFork },
      ],
    },
    {
      title: 'GOVERNANCE & PLATFORM',
      items: [
        { id: 'reports' as ViewType, label: 'Reports & Audits', icon: FileText },
        { id: 'audit-logs' as ViewType, label: 'Audit Logs', icon: History },
        { id: 'team' as ViewType, label: 'Team & Workspaces', icon: Users2 },
        { id: 'settings' as ViewType, label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-950/70 p-3 h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar flex flex-col justify-between">
      <div className="space-y-6">
        {groups.map((grp) => (
          <div key={grp.title}>
            <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              {grp.title}
            </div>
            <div className="space-y-1">
              {grp.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectView(item.id)}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm shadow-indigo-600/30'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                          item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300')
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Safety Notice Footer */}
      <div className="mt-6 rounded-xl border border-slate-800/80 bg-slate-900/50 p-3 text-[11px] text-slate-400">
        <div className="font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Zero-Cost Sandbox Mode
        </div>
        <p className="text-[10px] leading-relaxed text-slate-500">
          Terraform plan-only execution. No billable cloud resources will be created without your explicit manual authorization.
        </p>
      </div>
    </aside>
  );
};
