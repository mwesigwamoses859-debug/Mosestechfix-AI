import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Smartphone, ShieldCheck, Wrench, PhoneCall, Gift, Clock, Copy, ArrowRight, CheckCircle2, Lock, Key, CreditCard } from 'lucide-react';
import { SubscriptionPlan } from '../types';
import { formatUGX } from '../utils/calculator';
import { getAccessStatus, verifyAndActivatePayment, AccessStatus } from '../utils/subscriptionManager';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiRequestCount: number;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  aiRequestCount,
}) => {
  const [accessStatus, setAccessStatus] = useState<AccessStatus>(() => getAccessStatus());
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<SubscriptionPlan | null>(null);
  const [userPhoneInput, setUserPhoneInput] = useState('');
  const [txRefInput, setTxRefInput] = useState('');
  const [activationCodeInput, setActivationCodeInput] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAccessStatus(getAccessStatus());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForPayment) return;

    const refToVerify = txRefInput || activationCodeInput;
    const res = verifyAndActivatePayment({
      planId: selectedPlanForPayment.id,
      txRefOrCode: refToVerify,
      userPhone: userPhoneInput,
    });

    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
      setAccessStatus(getAccessStatus());
      setTimeout(() => {
        setSelectedPlanForPayment(null);
        setStatusMsg(null);
        setTxRefInput('');
        setActivationCodeInput('');
      }, 3000);
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleQuickVoucherUnlock = (code: string) => {
    setActivationCodeInput(code);
    const res = verifyAndActivatePayment({
      planId: 'weekly_access',
      txRefOrCode: code,
      userPhone: userPhoneInput || '0708262179',
    });

    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
      setAccessStatus(getAccessStatus());
      setTimeout(() => setStatusMsg(null), 3500);
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const plans: SubscriptionPlan[] = [
    {
      id: 'weekly_access',
      name: '1 Week Full AI Access',
      monthlyUGX: 10000,
      periodText: '/week',
      aiRequestLimit: 'Unlimited',
      badge: 'POPULAR — 10,000 UGX',
      features: [
        '7 Days Unlimited AI Diagnostics',
        'Photo & Error Code Hardware Analysis',
        'Step-by-Step Guided Troubleshooting',
        'Direct WhatsApp Support Ticket Dispatch',
        'Official Manufacturer Guides Access',
      ],
    },
    {
      id: 'monthly_full',
      name: '1 Month Full AI Access',
      monthlyUGX: 20000,
      periodText: '/month',
      aiRequestLimit: 'Unlimited',
      isPopular: true,
      badge: 'BEST VALUE — 20,000 UGX',
      features: [
        '30 Days Full Access Unlimited AI',
        'Voice & Audio Diagnostic Support',
        'Hardware Photo & Error Code Scanner',
        'Priority Phone & WhatsApp Hotline',
        'Official URA VAT Quotation & Invoice Generators',
      ],
    },
    {
      id: 'remote_pass',
      name: 'Remote Tech Pass',
      monthlyUGX: 25000,
      periodText: '/month',
      aiRequestLimit: 50,
      features: [
        '50 AI Diagnostics/mo',
        '1 Included Remote IT Support Session',
        'WhatsApp Case Ticket Dispatch',
        'Official Manufacturer Guides',
      ],
    },
    {
      id: 'business_it',
      name: 'Small Business IT Care',
      monthlyUGX: 85000,
      periodText: '/month',
      aiRequestLimit: 250,
      features: [
        '250 AI Diagnostics/mo',
        '2 Onsite Technician Visits/mo',
        'Covers up to 10 Business PCs/Printers',
        'Priority Phone & WhatsApp Hotline',
        'Spare Parts Discount',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl border border-slate-800 my-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                MosesTech Fix AI — Access & Subscription Center
              </h2>
              <p className="text-xs text-slate-400">
                Status: <strong className="text-emerald-400">{accessStatus.statusMessage}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold text-2xl px-2"
          >
            &times;
          </button>
        </div>

        {/* 3-Day Free AI Trial Banner */}
        <div className={`mb-6 p-4 rounded-2xl border shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 ${
          accessStatus.isLocked
            ? 'bg-gradient-to-r from-red-950 via-slate-900 to-rose-950 border-red-500/60'
            : 'bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-emerald-500/50'
        }`}>
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg font-black text-xl ${
              accessStatus.isLocked ? 'bg-red-500 text-white' : 'bg-emerald-500 text-slate-950'
            }`}>
              {accessStatus.isLocked ? '🔒' : '🎁'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  accessStatus.isLocked ? 'bg-red-500 text-white' : 'bg-emerald-500 text-slate-950'
                }`}>
                  {accessStatus.isLocked ? 'Free Trial Expired' : '3-Day Free Trial'}
                </span>
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  {accessStatus.isPaid
                    ? `Paid Plan Active (${accessStatus.daysRemaining} days left)`
                    : accessStatus.isLocked
                    ? 'Lock active — Payment required to proceed'
                    : `Countdown: ${accessStatus.daysRemaining}d ${accessStatus.hoursRemaining}h remaining`}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-1">
                {accessStatus.isLocked
                  ? 'Your 3-Day Free Trial Has Ended — System Locked'
                  : '3 Days Full Free Access Included For Every Device'}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                {accessStatus.isLocked
                  ? 'To unlock instant AI troubleshooting for Windows, printers, & networks, select 10,000 UGX/week or 20,000 UGX/month below.'
                  : 'Enjoy 3 full days of unlimited AI hardware diagnostics with zero upfront cost. Subscribe anytime for 10,000 UGX/week or 20,000 UGX/month.'}
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            {accessStatus.isLocked ? (
              <div className="bg-red-950/80 border border-red-500 text-red-200 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow">
                <Lock className="w-4 h-4 text-red-400" />
                <span>Locked — Pay Below to Unlock</span>
              </div>
            ) : accessStatus.isPaid ? (
              <div className="bg-emerald-900/80 border border-emerald-400 text-emerald-200 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Full Paid Access Granted</span>
              </div>
            ) : (
              <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-300 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Trial Active ({accessStatus.daysRemaining}d {accessStatus.hoursRemaining}h)</span>
              </div>
            )}
          </div>
        </div>

        {/* Real Instant Payment Form & Voucher Activation */}
        {selectedPlanForPayment && (
          <div className="mb-6 p-5 rounded-2xl bg-slate-950 border-2 border-emerald-500 text-white shadow-2xl animate-fade-in">
            <div className="flex justify-between items-start mb-3 border-b border-slate-800 pb-2">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">
                  Instant Payment Verification
                </span>
                <h3 className="text-base font-bold text-emerald-300 mt-1">
                  Activate {selectedPlanForPayment.name} ({formatUGX(selectedPlanForPayment.monthlyUGX)}{selectedPlanForPayment.periodText || ''})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlanForPayment(null)}
                className="text-slate-400 hover:text-white font-bold text-xl px-2"
              >
                &times;
              </button>
            </div>

            {statusMsg && (
              <div className={`p-3.5 mb-4 rounded-xl text-xs font-bold ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-950 border border-emerald-400 text-emerald-200'
                  : 'bg-red-950 border border-red-500 text-red-200'
              }`}>
                {statusMsg.text}
              </div>
            )}

            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-emerald-400 block text-xs">
                  Step 1: Send {formatUGX(selectedPlanForPayment.monthlyUGX)} via Airtel Money or MTN Mobile Money
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-red-900/50 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-red-400 block">Airtel Money Uganda</span>
                      <span className="font-mono text-sm text-white font-bold">0708262179</span>
                      <span className="text-[10px] text-slate-400 block">MosesTech Fix AI / Moses M.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('0708262179', 'Airtel Number')}
                      className="px-2 py-1 bg-red-600/80 hover:bg-red-500 text-white rounded font-bold text-[10px] flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedText === 'Airtel Number' ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-amber-900/50 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-amber-400 block">MTN Mobile Money Uganda</span>
                      <span className="font-mono text-sm text-white font-bold">0789218570</span>
                      <span className="text-[10px] text-slate-400 block">MosesTech Fix AI / Moses M.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('0789218570', 'MTN Number')}
                      className="px-2 py-1 bg-amber-600/80 hover:bg-amber-500 text-white rounded font-bold text-[10px] flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedText === 'MTN Number' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="font-bold text-white text-xs block">
                  Step 2: Enter your Mobile Phone Number & Transaction Ref ID (or Activation Voucher Code)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Your Mobile Phone Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 0708262179 / 0789218570"
                      value={userPhoneInput}
                      onChange={(e) => setUserPhoneInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Mobile Money Transaction ID or Activation Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tx Ref 28401948201 or Code MT-10K-WEEK"
                      value={txRefInput}
                      onChange={(e) => setTxRefInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 outline-none uppercase font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-slate-400">
                    💡 Sample Voucher Codes: <button type="button" onClick={() => handleQuickVoucherUnlock('MT-10K-WEEK')} className="text-emerald-400 font-mono underline font-bold px-1">MT-10K-WEEK</button> or <button type="button" onClick={() => handleQuickVoucherUnlock('MT-20K-MONTH')} className="text-emerald-400 font-mono underline font-bold px-1">MT-20K-MONTH</button>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span>Verify Tx ID & Unlock AI Access</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {plans.map((plan) => {
            const isSelected = selectedPlanForPayment?.id === plan.id;
            const badgeText = plan.badge;

            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-4 border flex flex-col justify-between relative transition-all ${
                  plan.isPopular
                    ? 'border-emerald-500 bg-emerald-950/80 text-white shadow-xl scale-[1.02]'
                    : 'border-slate-800 bg-slate-800/60 text-slate-200 hover:border-slate-700'
                }`}
              >
                {badgeText && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow whitespace-nowrap">
                    {badgeText}
                  </span>
                )}

                <div>
                  <h3 className="font-bold text-sm mb-1 text-white">{plan.name}</h3>
                  <div className="text-xl font-extrabold mb-1 text-emerald-400 flex items-baseline gap-1">
                    <span>{formatUGX(plan.monthlyUGX)}</span>
                    <span className="text-xs text-slate-400 font-normal">{plan.periodText || '/mo'}</span>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-3 font-semibold">
                    AI Diagnostic Access: <span className="text-emerald-300 font-bold">{plan.aiRequestLimit}</span>
                  </p>

                  <ul className="space-y-2 text-xs mb-4">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                        <span className="text-slate-300">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setSelectedPlanForPayment(plan)}
                  className={`w-full py-2.5 rounded-xl font-extrabold text-xs transition-all shadow ${
                    plan.isPopular
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      : 'bg-slate-700 hover:bg-emerald-600 text-white'
                  }`}
                >
                  Activate {formatUGX(plan.monthlyUGX)} Plan
                </button>
              </div>
            );
          })}
        </div>

        {/* Mobile Money Payment Info Footer */}
        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white block">Uganda Mobile Money Direct Hotline</span>
              <span>Send Airtel Money to <strong>0708262179</strong> or MTN Mobile Money to <strong>0789218570</strong> (MosesTech Fix AI / Moses M.)</span>
              <a
                href="https://mosestechfixsolution.com"
                target="_blank"
                rel="noreferrer"
                className="block text-emerald-400 font-bold hover:underline mt-0.5"
              >
                Official Website: mosestechfixsolution.com
              </a>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shrink-0 shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


