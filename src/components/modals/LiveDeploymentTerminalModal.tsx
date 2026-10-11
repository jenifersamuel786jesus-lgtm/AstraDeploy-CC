import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  Play,
  Rocket,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Deployment, Workload } from '../../types';

interface LiveDeploymentTerminalModalProps {
  isOpen: boolean;
  deployment: Deployment | null;
  workload?: Workload;
  onClose: () => void;
  onPromoteCanary: (deploymentId: string) => void;
  onRollback: (deploymentId: string) => void;
}

interface LogEntry {
  time: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'STAGE';
  text: string;
}

export const LiveDeploymentTerminalModal: React.FC<LiveDeploymentTerminalModalProps> = ({
  isOpen,
  deployment,
  workload,
  onClose,
  onPromoteCanary,
  onRollback,
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [canaryTraffic, setCanaryTraffic] = useState(20);
  const terminalRef = useRef<HTMLDivElement>(null);

  const steps = [
    { title: 'Security & Token Validation', desc: 'Verify IAM cross-account read tokens and workspace tenant boundary' },
    { title: 'Container Build & Scan', desc: 'Multi-stage Docker compile & Trivy CVE audit' },
    { title: 'Terraform Dry-Run Verification', desc: 'Validating zero destructive state diffs' },
    { title: 'Pod Placement & VPC Routing', desc: 'Deploying isolated containers into private VPC subnets' },
    { title: 'Canary Gate & Traffic Routing', desc: 'Directing 20% canary split with active p95 monitoring' },
    { title: 'Health Probes & Live Routing', desc: 'Probing HTTP /health and latency synthetic checks' },
  ];

  useEffect(() => {
    if (!isOpen || !deployment) {
      setProgress(0);
      setCurrentStepIndex(0);
      setLogs([]);
      setIsCompleted(false);
      return;
    }

    setLogs([
      { time: '00:00.02', level: 'STAGE', text: `🚀 Initializing progressive deployment: ${deployment.version} for ${deployment.workloadName}` },
      { time: '00:00.15', level: 'INFO', text: `Target Environment: [${deployment.environment.toUpperCase()}] · Strategy: ${deployment.strategy.toUpperCase()}` },
      { time: '00:00.40', level: 'INFO', text: `Workspace Isolation: Tenant context verified. Scoped strictly to private network.` },
    ]);

    const script = [
      { step: 0, time: '00:01.10', level: 'INFO' as const, text: 'Executing pre-flight IAM boundary checks... PASSED (Zero write keys needed)' },
      { step: 1, time: '00:02.40', level: 'INFO' as const, text: 'Building container image: ghcr.io/astradeploy/' + (workload?.name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'service') + ':' + deployment.version },
      { step: 1, time: '00:03.20', level: 'SUCCESS' as const, text: 'Docker multi-stage build finished. Digest sha256:8f2a91... verified.' },
      { step: 2, time: '00:04.60', level: 'INFO' as const, text: 'Running Terraform plan dry-run: 0 to delete, 4 to add, 0 to change.' },
      { step: 2, time: '00:05.10', level: 'SUCCESS' as const, text: 'Pre-flight security scan: 0 critical vulnerabilities found.' },
      { step: 3, time: '00:06.80', level: 'INFO' as const, text: 'Scheduling container tasks across 3 Availability Zones (us-east-1a, us-east-1b, us-east-1c)...' },
      { step: 4, time: '00:08.50', level: 'STAGE' as const, text: 'Configuring ALB progressive traffic split: 80% Primary / 20% Canary Pods.' },
      { step: 5, time: '00:10.10', level: 'INFO' as const, text: 'Synthetic probe: GET /health -> HTTP 200 OK (Latency: 18.2ms, Jitter: 0.8ms)' },
      { step: 5, time: '00:11.40', level: 'SUCCESS' as const, text: `🎉 Live release active! Route live at https://api.astradeploy.net/${workload?.id || 'workload'}` },
    ];

    let timerId: any;
    let idx = 0;

    const interval = setInterval(() => {
      if (idx < script.length) {
        const item = script[idx];
        setLogs((prev) => [...prev, item]);
        setCurrentStepIndex(item.step);
        setProgress(Math.round(((idx + 1) / script.length) * 100));
        idx++;
      } else {
        clearInterval(interval);
        setIsCompleted(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }, 1100);

    return () => clearInterval(interval);
  }, [isOpen, deployment]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen || !deployment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Rocket className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Real-Time Deployment Pipeline Runner
                </h3>
                <span className="rounded bg-indigo-500/20 text-indigo-300 font-mono text-xs px-2 py-0.5 border border-indigo-500/30">
                  {deployment.version}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Workload: <strong className="text-white">{deployment.workloadName}</strong> · Strategy: <strong className="text-indigo-400 capitalize">{deployment.strategy}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar & Steps Tracker */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">
              {isCompleted ? 'Deployment Live & Verified Healthy' : steps[currentStepIndex]?.title}
            </span>
            <span className="font-mono text-indigo-400 font-bold">{progress}%</span>
          </div>

          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Steps Checklist Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
            {steps.map((st, i) => {
              const done = currentStepIndex > i || isCompleted;
              const active = currentStepIndex === i && !isCompleted;
              return (
                <div
                  key={i}
                  className={`rounded-lg p-2 border transition ${
                    done
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : active
                      ? 'border-indigo-500 bg-indigo-500/20 text-white animate-pulse'
                      : 'border-slate-800 bg-slate-950/40 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    ) : active ? (
                      <RefreshCw className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
                    ) : (
                      <span className="h-3.5 w-3.5 rounded-full border border-slate-600 inline-block text-[9px] text-center">
                        {i + 1}
                      </span>
                    )}
                    <span className="truncate">{st.title}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Streaming Live Terminal Logs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-indigo-400" />
              <span className="font-mono font-semibold text-white">Live Execution Terminal Stream</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-400 font-mono">STREAMING</span>
            </div>
          </div>

          <div
            ref={terminalRef}
            className="h-56 rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] overflow-y-auto space-y-1.5 select-text"
          >
            {logs.map((lg, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-slate-600 shrink-0">[{lg.time}]</span>
                <span
                  className={
                    lg.level === 'SUCCESS'
                      ? 'text-emerald-400 font-semibold'
                      : lg.level === 'STAGE'
                      ? 'text-cyan-400 font-bold'
                      : lg.level === 'WARN'
                      ? 'text-amber-400'
                      : 'text-slate-300'
                  }
                >
                  {lg.text}
                </span>
              </div>
            ))}
            {!isCompleted && (
              <div className="flex items-center gap-1.5 text-slate-500 pt-1">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Streaming live container build output...</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Controls & Canary Shift */}
        {isCompleted && (
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-indigo-400" />
                Active Traffic Shift Control (20% Canary / 80% Primary)
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Latency is nominal (p99 = 18.2ms, error rate = 0.00%). Ready to promote to 100% production traffic.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onPromoteCanary(deployment.id);
                  onClose();
                }}
                className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-md shadow-emerald-600/30 cursor-pointer"
              >
                Promote to 100% Primary
              </button>
              <button
                onClick={() => {
                  onRollback(deployment.id);
                  onClose();
                }}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
              >
                Emergency Rollback
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Dry-run verified · Zero unexpected billing</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 font-semibold text-white hover:bg-indigo-500 cursor-pointer"
          >
            {isCompleted ? 'Done & View Telemetry' : 'Minimize'}
          </button>
        </div>
      </div>
    </div>
  );
};
