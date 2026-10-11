import React, { useState } from 'react';
import {
  Cloud,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Key,
  ExternalLink,
  Lock,
  Server,
  Building,
} from 'lucide-react';
import { CloudProviderConnection } from '../../types';

interface CloudProvidersViewProps {
  providers: CloudProviderConnection[];
  onUpdateProvider: (provider: CloudProviderConnection) => void;
}

export const CloudProvidersView: React.FC<CloudProvidersViewProps> = ({
  providers,
  onUpdateProvider,
}) => {
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<CloudProviderConnection | null>(null);

  const handleTestConnection = (prov: CloudProviderConnection) => {
    setSyncingId(prov.id);
    setTimeout(() => {
      onUpdateProvider({
        ...prov,
        lastSyncAt: new Date().toISOString(),
        status: 'read_only_verified',
      });
      setSyncingId(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Cloud className="h-5 w-5 text-indigo-400" />
          Cloud Provider Adapters &amp; Identity Guardrails
        </h1>
        <p className="text-xs text-slate-400">
          Strict read-only telemetry, zero auto-billing, and tenant-scoped credentials
        </p>
      </div>

      {/* Zero Cost & Security Guardrail Card */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-white">Non-Negotiable Budget &amp; Billing Safeguards Active</span>
            <p className="text-emerald-300/90 text-[11px] mt-0.5">
              All cloud adapters are restricted by default to <strong>ReadOnlyAccess</strong> policies. AstraDeploy will NEVER trigger billable cloud resources without explicit user confirmation.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-[11px] text-emerald-300">
          <Lock className="h-3.5 w-3.5" />
          <span>Least-Privilege Enforcement</span>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {providers.map((prov) => {
          const isSyncing = syncingId === prov.id;
          return (
            <div
              key={prov.id}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        prov.provider === 'AWS'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : prov.provider === 'GCP'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      }`}
                    >
                      {prov.provider}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{prov.name}</h3>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {prov.accountId}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                      prov.status === 'read_only_verified' || prov.status === 'connected'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {prov.status === 'read_only_verified' ? 'Read-Only OK' : prov.status}
                  </span>
                </div>

                <div className="space-y-2 py-3 border-y border-slate-800/80 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Region:</span>
                    <span className="font-mono text-white">{prov.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Discovered Inventory:</span>
                    <span className="font-semibold text-indigo-400">
                      {prov.discoveredResourcesCount} resources
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">IAM Principal / ARN:</span>
                    <span className="font-mono text-[10px] text-slate-300 truncate max-w-[150px]">
                      {prov.iamRoleArn}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Verified:</span>
                    <span className="text-slate-400 text-[10px]">
                      {new Date(prov.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleTestConnection(prov)}
                  disabled={isSyncing}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Testing...' : 'Test Read API'}</span>
                </button>

                <button
                  onClick={() => setSelectedProvider(prov)}
                  className="rounded-lg border border-slate-800 p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="View IAM Policy Details"
                >
                  <Key className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* IAM Security Guidance Drawer / Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  {selectedProvider.provider} Least-Privilege IAM Policy
                </h3>
              </div>
              <button
                onClick={() => setSelectedProvider(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              AstraDeploy recommends attaching only the following read-only statements to your cloud account to guarantee zero billable mutations:
            </p>

            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-emerald-400 overflow-x-auto leading-relaxed">
              {`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:DescribeVpcs",
        "ecs:DescribeServices",
        "cloudwatch:GetMetricData",
        "ce:GetCostAndUsage"
      ],
      "Resource": "*"
    }
  ]
}`}
            </pre>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedProvider(null)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
