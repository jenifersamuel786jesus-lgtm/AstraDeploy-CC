import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Code2,
  Cpu,
  Layers,
  CheckCircle2,
  Copy,
  Check,
  X,
  Play,
  ArrowRight,
  Server,
  Rocket,
  ShieldCheck,
  Building,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Workload, MLModel, User } from '../../types';

interface BeginnerModelWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAutoRegisterAndDeploy: (modelName: string, task: string, rps: number) => void;
}

export const BeginnerModelWizardModal: React.FC<BeginnerModelWizardModalProps> = ({
  isOpen,
  onClose,
  onAutoRegisterAndDeploy,
}) => {
  const [activeTab, setActiveTab] = useState<'concepts' | 'create_pc' | 'onboard'>('concepts');
  const [copiedCode, setCopiedCode] = useState(false);

  // Form state for Onboarding
  const [modelName, setModelName] = useState('my_first_model.joblib');
  const [modelTask, setModelTask] = useState('Classification');
  const [framework, setFramework] = useState('scikit-learn');
  const [expectedRps, setExpectedRps] = useState(150);
  const [createdSuccess, setCreatedSuccess] = useState(false);

  if (!isOpen) return null;

  const pythonScript = `# 1. Open Terminal or PowerShell on your PC and run:
# pip install scikit-learn joblib

import joblib
from sklearn.linear_model import LogisticRegression

# 2. Sample data: [Age, Yearly Spend in $] -> Churn (1 = Yes, 0 = No)
X_train = [[22, 50], [38, 450], [45, 120], [29, 30], [52, 600]]
y_train = [1, 0, 0, 1, 0]

# 3. Train your machine learning model
model = LogisticRegression()
model.fit(X_train, y_train)

# 4. Save model file onto your PC
joblib.dump(model, "my_first_model.joblib")
print("🎉 Success! my_first_model.joblib is saved on your computer.")
`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRunOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    setCreatedSuccess(true);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

    setTimeout(() => {
      onAutoRegisterAndDeploy(modelName, modelTask, expectedRps);
      onClose();
      setCreatedSuccess(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Beginner Guide: How to Use AstraDeploy with Your Model
              </h3>
              <p className="text-xs text-slate-400">
                Step-by-step plain English guide for new ML and cloud engineers
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('concepts')}
            className={`flex items-center gap-1.5 px-4 py-2 font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'concepts'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            1. What Is ML &amp; Cloud?
          </button>

          <button
            onClick={() => setActiveTab('create_pc')}
            className={`flex items-center gap-1.5 px-4 py-2 font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'create_pc'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <Code2 className="h-4 w-4" />
            2. Make a Model on Your PC
          </button>

          <button
            onClick={() => setActiveTab('onboard')}
            className={`flex items-center gap-1.5 px-4 py-2 font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'onboard'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <Rocket className="h-4 w-4" />
            3. Import &amp; Sizing Wizard
          </button>
        </div>

        {/* Tab 1: Plain English Concepts */}
        {activeTab === 'concepts' && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-300 leading-relaxed">
              If you have never built a cloud system or trained an AI model before, don&apos;t worry! Here is how everything works in simple analogies:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-2">
                  <Building className="h-4 w-4 text-indigo-400" />
                  What is a Workspace?
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Think of a <strong>Workspace</strong> as your private, soundproof room in a building. If you work on Project A, all your models, servers, and bills are kept safely inside. Nobody else can see or touch your work.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-purple-400" />
                  What is a Machine Learning Model?
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  A <strong>Model</strong> is just a small math recipe file (like <code className="text-indigo-300 font-mono">model.joblib</code>). It learned patterns from past data (e.g. &quot;If user is 45 and spends $10, they won&apos;t buy again&quot;).
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-cyan-400" />
                  What is a Model Registry?
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Think of a <strong>Model Registry</strong> like a version shelf. <strong>v1.0</strong> is the model you trained yesterday; <strong>v2.0</strong> is the smarter one you trained today. You can promote v2.0 to <em>Production</em> when it&apos;s ready!
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-2">
                  <Server className="h-4 w-4 text-emerald-400" />
                  What is Resource Sizing?
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Instead of guessing and paying $500/month for a giant server you don&apos;t need, AstraDeploy tells you: &quot;For 150 users/sec, you only need 2 CPU cores and 8GB RAM ($24/month)&quot;. It saves you real money!
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveTab('create_pc')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 font-semibold text-white hover:bg-indigo-500 cursor-pointer text-xs"
              >
                <span>Next: How to Make a Model on Your PC</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Code Snippet to Create Model on PC */}
        {activeTab === 'create_pc' && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-300">
              Want to see a real model work right on your Windows PC? Save this script into a file called <code className="text-indigo-400 font-mono">make_model.py</code> and run it:
            </p>

            <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] overflow-x-auto text-emerald-300">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800 text-slate-400">
                <span>make_model.py (Python 3.10 / 3.12 / 3.13)</span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer px-2 py-0.5 rounded bg-slate-800"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedCode ? 'Copied Code!' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="leading-relaxed">{pythonScript}</pre>
            </div>

            <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-3 text-[11px] text-slate-300 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                What happens when you run this?
              </div>
              <p>
                Python will create a file named <strong className="text-emerald-400">my_first_model.joblib</strong> in your folder. That file is your real machine learning model!
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveTab('onboard')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 font-semibold text-white hover:bg-indigo-500 cursor-pointer text-xs"
              >
                <span>Next: Import &amp; Size in AstraDeploy</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Onboard Model Wizard */}
        {activeTab === 'onboard' && (
          <form onSubmit={handleRunOnboarding} className="space-y-4 text-xs">
            <p className="text-slate-300">
              Enter your model details below. AstraDeploy will automatically register it into the <strong>Model Registry</strong> and calculate the exact cloud servers needed:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Model File Name</label>
                <input
                  type="text"
                  required
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="e.g. my_first_model.joblib"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Framework</label>
                <select
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                >
                  <option value="scikit-learn">scikit-learn (Joblib / Pickle)</option>
                  <option value="XGBoost">XGBoost / LightGBM</option>
                  <option value="PyTorch">PyTorch (.pt / .pth)</option>
                  <option value="TensorFlow">TensorFlow / Keras (.h5)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Model Objective / Task</label>
                <select
                  value={modelTask}
                  onChange={(e) => setModelTask(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                >
                  <option value="Classification">Classification (Yes/No, Fraud, Categories)</option>
                  <option value="Regression">Regression (Predicting Numbers, Prices)</option>
                  <option value="NLP">NLP &amp; Text Classification</option>
                  <option value="Recommendation">Recommendation Engine</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-slate-300 font-medium">Expected User Traffic</label>
                  <span className="font-bold text-indigo-400">{expectedRps} requests/sec</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={2000}
                  step={10}
                  value={expectedRps}
                  onChange={(e) => setExpectedRps(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-[11px] text-slate-300 flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0" />
              <span>
                AstraDeploy will calculate the exact vCPU, RAM, and generate an AWS/GCP Terraform configuration with zero cost surprise.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createdSuccess}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 font-semibold text-white hover:from-indigo-500 hover:to-indigo-400 cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                {createdSuccess ? (
                  <span>Registering &amp; Calculating Sizing...</span>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    <span>Auto-Register &amp; Size My Model</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
