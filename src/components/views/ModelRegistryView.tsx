import React, { useState } from 'react';
import {
  Library,
  Layers,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Clock,
  HardDrive,
  Cpu,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { MLModel, MLModelVersion } from '../../types';

interface ModelRegistryViewProps {
  models: MLModel[];
  onPromoteStage: (
    modelId: string,
    versionId: string,
    newStage: 'Development' | 'Staging' | 'Production' | 'Archived'
  ) => void;
}

export const ModelRegistryView: React.FC<ModelRegistryViewProps> = ({
  models,
  onPromoteStage,
}) => {
  const [selectedModelId, setSelectedModelId] = useState<string>(
    models[0]?.id || ''
  );

  const selectedModel = models.find((m) => m.id === selectedModelId) || models[0];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Library className="h-5 w-5 text-indigo-400" />
          Model Registry &amp; Lifecycle Governance
        </h1>
        <p className="text-xs text-slate-400">
          Semver versioning, production stage gating, latency benchmarking, and cryptographic checksums
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Models List Column */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Registered Models ({models.length})
          </h2>

          {models.map((m) => {
            const prodVer = m.versions.find((v) => v.stage === 'Production');
            return (
              <div
                key={m.id}
                onClick={() => setSelectedModelId(m.id)}
                className={`rounded-xl border p-4 cursor-pointer transition ${
                  m.id === selectedModel?.id
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-md'
                    : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white truncate max-w-[170px]">
                    {m.name}
                  </span>
                  <span className="rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-1.5 py-0.5 text-[10px] font-mono">
                    {m.task}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">Framework: {m.framework}</div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
                  <span>{m.versions.length} Versions</span>
                  <span className="text-emerald-400 font-semibold">
                    {prodVer ? `Prod: ${prodVer.version}` : 'No Prod Version'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Model Versions Lifecycle Column */}
        {selectedModel && (
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {selectedModel.name}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>Task: <strong className="text-slate-300">{selectedModel.task}</strong></span>
                    <span>·</span>
                    <span>Framework: <strong className="text-slate-300">{selectedModel.framework}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {selectedModel.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Version History Table */}
              <div className="space-y-4 mt-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Model Release Versions
                </h4>

                <div className="space-y-3">
                  {selectedModel.versions.map((ver) => (
                    <div
                      key={ver.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 hover:border-slate-700 transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white font-mono">
                            {ver.version}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                              ver.stage === 'Production'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : ver.stage === 'Staging'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                : ver.stage === 'Development'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-slate-800 text-slate-500 border-slate-700'
                            }`}
                          >
                            {ver.stage}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            from {ver.runId}
                          </span>
                        </div>

                        {/* Stage Controls */}
                        <div className="flex items-center gap-1.5">
                          {ver.stage !== 'Production' && (
                            <button
                              onClick={() => onPromoteStage(selectedModel.id, ver.id, 'Production')}
                              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500 cursor-pointer shadow-sm shadow-emerald-600/20"
                            >
                              Promote to Production
                            </button>
                          )}
                          {ver.stage !== 'Staging' && ver.stage !== 'Production' && (
                            <button
                              onClick={() => onPromoteStage(selectedModel.id, ver.id, 'Staging')}
                              className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                            >
                              Move to Staging
                            </button>
                          )}
                          {ver.stage !== 'Archived' && (
                            <button
                              onClick={() => onPromoteStage(selectedModel.id, ver.id, 'Archived')}
                              className="rounded-lg border border-slate-800 px-2 py-1 text-[11px] text-slate-500 hover:text-rose-400 cursor-pointer"
                            >
                              Archive
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Benchmark Metrics Grid */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="rounded-lg bg-slate-900 border border-slate-800 p-2">
                          <div className="text-[10px] text-slate-500">Evaluation F1 Score</div>
                          <div className="font-bold text-white mt-0.5">
                            {(ver.metrics.f1 * 100).toFixed(1)}%
                          </div>
                        </div>

                        <div className="rounded-lg bg-slate-900 border border-slate-800 p-2">
                          <div className="text-[10px] text-slate-500">Inference Latency</div>
                          <div className="font-bold text-emerald-400 mt-0.5">
                            {ver.metrics.latencyMs} ms
                          </div>
                        </div>

                        <div className="rounded-lg bg-slate-900 border border-slate-800 p-2">
                          <div className="text-[10px] text-slate-500">Artifact Size</div>
                          <div className="font-bold text-indigo-400 mt-0.5">
                            {ver.metrics.sizeMb} MB
                          </div>
                        </div>
                      </div>

                      {/* Checksum */}
                      <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1 font-mono">
                          <ShieldCheck className="h-3 w-3 text-emerald-400" />
                          <span>Checksum: {ver.checksum}</span>
                        </div>
                        <span>Registered {new Date(ver.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
