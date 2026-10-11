import React, { useState } from 'react';
import {
  Settings,
  Key,
  Bell,
  Shield,
  Database,
  Terminal,
  CheckCircle2,
  Save,
  RotateCcw,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.slack.com/services/T00/B00/XXXXX');
  const [enableAlerts, setEnableAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-indigo-400" />
          Platform Governance &amp; Integrations
        </h1>
        <p className="text-xs text-slate-400">
          Global webhooks, runtime environment configuration, and local sandbox settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts & Webhooks */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="h-4 w-4 text-indigo-400" />
            Alert Webhook Notifications
          </h2>

          <form onSubmit={handleSave} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 block mb-1">
                Incident Notification Webhook (Slack / Discord / Teams)
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="enableAlerts"
                checked={enableAlerts}
                onChange={(e) => setEnableAlerts(e.target.checked)}
                className="accent-indigo-500 rounded cursor-pointer"
              />
              <label htmlFor="enableAlerts" className="text-slate-300 cursor-pointer">
                Notify on SLA breaches and p99 latency threshold violations
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500 transition cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                {saved ? 'Saved Successfully!' : 'Save Integration'}
              </button>
            </div>
          </form>
        </div>

        {/* Runtime Environment Specs */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Terminal className="h-4 w-4 text-indigo-400" />
            Local Stack &amp; Runtime Environment
          </h2>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Node.js Engine:</span>
              <span className="font-mono text-white">v22.23.0 (Active)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Python AI Environment:</span>
              <span className="font-mono text-white">Python 3.10 / 3.13 Compatible</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">FastAPI &amp; Uvicorn:</span>
              <span className="font-mono text-emerald-400">Ready in /backend</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">PostgreSQL Store:</span>
              <span className="font-mono text-emerald-400">Docker Compose &amp; Migrations Ready</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Deployment Targets:</span>
              <span className="font-semibold text-indigo-400">Vercel (UI) + Render (API) Free Tiers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
