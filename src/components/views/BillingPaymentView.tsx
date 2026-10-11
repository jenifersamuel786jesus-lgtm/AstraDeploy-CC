import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Download,
  Lock,
  Layers,
  Sparkles,
  Building,
  Check,
  AlertCircle,
  X,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubscriptionPlan, BillingInvoice, PaymentMethod } from '../../types';

const PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-free',
    name: 'Community Open-Source',
    priceMonthly: 0,
    workloadLimit: 5,
    features: [
      'Deterministic Sizing Engine',
      'Unlimited Terraform Plan generation',
      'Docker Compose local persistence',
      'Read-only cloud provider discovery',
      'Community GitHub support',
    ],
  },
  {
    id: 'plan-pro',
    name: 'Pro Cloud Team',
    priceMonthly: 49,
    workloadLimit: 25,
    recommended: true,
    features: [
      'Everything in Community',
      'Multi-tenant workspace isolation',
      'Real-time live deployment terminal',
      'Machine Learning surrogate sizing model',
      'Automated Slack/Teams SLA alert webhooks',
      'Up to 10 team seats with RBAC',
    ],
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise FinOps',
    priceMonthly: 299,
    workloadLimit: 100,
    features: [
      'Unlimited workloads & workspaces',
      'Automated FinOps rightsizing reclamation',
      'SOC2 & PCI-DSS audit compliance export',
      'Custom least-privilege IAM policies',
      '99.99% enterprise SLA guarantee',
      'Dedicated cloud architect advisory',
    ],
  },
];

const INITIAL_INVOICES: BillingInvoice[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'INV-ASTRA-2026-001',
    date: '2026-03-01T10:00:00Z',
    amount: 49.0,
    status: 'paid',
    planName: 'Pro Cloud Team',
  },
  {
    id: 'inv-102',
    invoiceNumber: 'INV-ASTRA-2026-002',
    date: '2026-04-01T10:00:00Z',
    amount: 49.0,
    status: 'paid',
    planName: 'Pro Cloud Team',
  },
];

export const BillingPaymentView: React.FC = () => {
  const [currentPlanId, setCurrentPlanId] = useState<string>('plan-pro');
  const [invoices, setInvoices] = useState<BillingInvoice[]>(INITIAL_INVOICES);
  const [checkoutModal, setCheckoutModal] = useState<SubscriptionPlan | null>(null);

  // Checkout Form State
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('789');
  const [cardholderName, setCardholderName] = useState('Alex Rivera');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const activePlan = PLANS.find((p) => p.id === currentPlanId) || PLANS[1];

  const handleOpenCheckout = (plan: SubscriptionPlan) => {
    if (plan.id === currentPlanId) return;
    setCheckoutModal(plan);
    setPaymentSuccess(false);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      setPaymentSuccess(true);
      setCurrentPlanId(checkoutModal!.id);

      // Create new invoice
      const newInv: BillingInvoice = {
        id: `inv-${Date.now().toString(36)}`,
        invoiceNumber: `INV-ASTRA-2026-00${invoices.length + 1}`,
        date: new Date().toISOString(),
        amount: checkoutModal!.priceMonthly,
        status: 'paid',
        planName: checkoutModal!.name,
      };
      setInvoices([newInv, ...invoices]);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        setCheckoutModal(null);
        setPaymentSuccess(false);
      }, 1800);
    }, 1200);
  };

  const handleDownloadInvoice = (inv: BillingInvoice) => {
    const receiptData = {
      platform: 'AstraDeploy Cloud Technologies Inc.',
      invoiceNumber: inv.invoiceNumber,
      date: inv.date,
      plan: inv.planName,
      amount: `$${inv.amount.toFixed(2)} USD`,
      status: 'PAID - VERIFIED',
      customer: 'Alex Rivera (principal.architect@astradeploy.io)',
      paymentMethod: 'Visa ending in 4242',
    };
    const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inv.invoiceNumber}_Receipt.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-400" />
            Billing, Subscriptions &amp; Payment Gateway
          </h1>
          <p className="text-xs text-slate-400">
            Manage organization subscription plans, payment methods, and automated billing receipts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Current Tier: {activePlan.name}
          </span>
        </div>
      </div>

      {/* Credit & Quota Usage Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400">Active Workload Capacity</div>
          <div className="text-2xl font-bold text-white mt-1">
            6 <span className="text-sm font-normal text-slate-400">/ {activePlan.workloadLimit} slots</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${(6 / activePlan.workloadLimit) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400">Sandbox Cloud Credits</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">$100.00</div>
          <div className="text-[11px] text-slate-500 mt-1">Zero auto-debit on personal cards</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400">Next Billing Renewal</div>
          <div className="text-2xl font-bold text-white mt-1">Nov 1, 2026</div>
          <div className="text-[11px] text-slate-500 mt-1">${activePlan.priceMonthly}.00 / month auto-renew</div>
        </div>
      </div>

      {/* Subscription Pricing Tiers Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Available Platform Subscription Tiers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-6 flex flex-col justify-between transition relative ${
                  plan.recommended
                    ? 'border-indigo-500 bg-slate-900/80 shadow-xl shadow-indigo-500/10'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                {plan.recommended && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow">
                    Most Popular for DevOps
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-white">{plan.name}</h3>
                    {isCurrent && (
                      <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <div className="my-4">
                    <span className="text-3xl font-extrabold text-white">
                      ${plan.priceMonthly}
                    </span>
                    <span className="text-xs text-slate-400"> / month</span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-300 py-3 border-t border-slate-800">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenCheckout(plan)}
                    disabled={isCurrent}
                    className={`w-full py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-800 text-slate-400 cursor-default'
                        : plan.recommended
                        ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30'
                        : 'border border-slate-700 bg-slate-800 text-white hover:bg-slate-700'
                    }`}
                  >
                    {isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Methods & Invoice History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Method */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="h-4 w-4 text-indigo-400" />
            Payment Gateway Integration
          </h3>

          <div className="rounded-xl border border-slate-700 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Stripe Verified Card</span>
              <span className="rounded bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 text-[10px] font-mono">
                DEFAULT
              </span>
            </div>
            <div className="text-base font-mono font-semibold text-slate-200">
              •••• •••• •••• 4242
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>Cardholder: Alex Rivera</span>
              <span>Expires: 12/28</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>PCI-DSS Level 1 Encrypted via Stripe tokenization.</span>
          </div>
        </div>

        {/* Invoices History Table */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Billing Invoices &amp; Receipts ({invoices.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                  <th className="pb-2">Invoice #</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Subscription Plan</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="text-slate-300">
                    <td className="py-2.5 font-mono text-indigo-400 font-bold">{inv.invoiceNumber}</td>
                    <td className="py-2.5 text-slate-400">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="py-2.5 text-white font-medium">{inv.planName}</td>
                    <td className="py-2.5 font-bold">${inv.amount.toFixed(2)}</td>
                    <td className="py-2.5">
                      <span className="rounded bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-semibold">
                        PAID
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(inv)}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white cursor-pointer"
                        title="Download Receipt JSON"
                      >
                        <Download className="h-3 w-3" />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Checkout Modal (Stripe Elements Simulation) */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Secure Checkout: {checkoutModal.name}
                </h3>
              </div>
              <button
                onClick={() => setCheckoutModal(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 flex justify-between items-center text-xs">
              <div>
                <div className="font-bold text-white">{checkoutModal.name}</div>
                <div className="text-[10px] text-slate-400">Billed monthly</div>
              </div>
              <div className="text-base font-bold text-emerald-400">
                ${checkoutModal.priceMonthly}.00 / mo
              </div>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Cardholder Name</label>
                <input
                  type="text"
                  required
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-white font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Test card 4242 4242 4242 4242 preloaded
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Expires</label>
                  <input
                    type="text"
                    required
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">CVC</label>
                  <input
                    type="text"
                    required
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="CVC"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={processing || paymentSuccess}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition cursor-pointer disabled:opacity-60"
              >
                {processing ? (
                  <span>Authorizing Payment via Stripe...</span>
                ) : paymentSuccess ? (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Payment Approved!
                  </span>
                ) : (
                  <span>Confirm &amp; Subscribe (${checkoutModal.priceMonthly}/mo)</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
