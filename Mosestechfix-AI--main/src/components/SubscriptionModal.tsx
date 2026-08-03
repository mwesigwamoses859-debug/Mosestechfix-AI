import React, { useMemo, useState } from 'react';
import { Check, CheckCircle2, Clock, Copy, KeyRound, Lock, MessageCircle, ShieldCheck, Smartphone, Wrench } from 'lucide-react';
import { SubscriptionPlan } from '../types';
import { formatUGX } from '../utils/calculator';
import { AccessStatus, getAccessStatus, getDeviceId, saveVerifiedAccess } from '../utils/subscriptionManager';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiRequestCount: number;
}

type PaymentForm = { customerName: string; customerPhone: string; transactionReference: string };

const AIRTEL_NUMBER = '0708262179';
const MTN_NUMBER = '0789218570';
const WHATSAPP_NUMBER = '256708262179';

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const [accessStatus, setAccessStatus] = useState<AccessStatus>(() => getAccessStatus());
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [payment, setPayment] = useState<PaymentForm>({ customerName: '', customerPhone: '', transactionReference: '' });
  const [activationCode, setActivationCode] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copied, setCopied] = useState('');
  const deviceId = useMemo(() => getDeviceId(), []);
  const isAdminMode = new URLSearchParams(window.location.search).get('admin') === 'activation';

  const plans = useMemo<SubscriptionPlan[]>(() => [
    { id: 'weekly_access', name: 'Weekly', monthlyUGX: 10000, periodText: '/7 days', aiRequestLimit: 'Unlimited', badge: 'POPULAR', features: ['7 days AI access', 'Photo and error-code analysis', 'Guided troubleshooting'] },
    { id: 'monthly_full', name: 'Monthly', monthlyUGX: 20000, periodText: '/30 days', aiRequestLimit: 'Unlimited', isPopular: true, badge: 'BEST VALUE', features: ['30 days AI access', 'Photo and voice diagnostics', 'Priority WhatsApp support'] },
    { id: 'remote_pass', name: 'Remote Tech Pass', monthlyUGX: 25000, periodText: '/30 days', aiRequestLimit: 50, features: ['50 AI diagnostics', 'One remote support session', 'WhatsApp case dispatch'] },
    { id: 'business_it', name: 'Business IT Care', monthlyUGX: 85000, periodText: '/30 days', aiRequestLimit: 250, features: ['250 AI diagnostics', 'Two onsite visits', 'Support for up to 10 devices'] },
  ], []);

  if (!isOpen) return null;

  const copyText = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(''), 1800);
  };

  const sendPaymentDetails = () => {
    if (!selectedPlan || !payment.customerName.trim() || !payment.customerPhone.trim() || !payment.transactionReference.trim()) {
      setMessage({ type: 'error', text: 'Complete your name, phone number and Mobile Money transaction reference first.' });
      return;
    }
    const text = [
      'Hello MosesTech Fix AI, I have made a subscription payment.',
      '',
      `Customer: ${payment.customerName.trim()}`,
      `Phone: ${payment.customerPhone.trim()}`,
      `Plan: ${selectedPlan.name}`,
      `Amount: UGX ${selectedPlan.monthlyUGX.toLocaleString()}`,
      `Transaction reference: ${payment.transactionReference.trim()}`,
      `Device code: ${deviceId}`,
      '',
      'Please verify the payment and send my device activation code.',
    ].join('\n');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    setMessage({ type: 'info', text: 'Payment details opened in WhatsApp. Send the message, then wait for MosesTech to verify your transaction.' });
  };

  const activate = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage({ type: 'info', text: 'Checking your device activation code…' });
    try {
      const response = await fetch('/api/subscriptions/manual/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activationCode: activationCode.trim(), deviceId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Activation failed.');
      saveVerifiedAccess(data);
      setAccessStatus(getAccessStatus());
      setActivationCode('');
      setMessage({ type: 'success', text: `${data.planName} activated successfully on this device.` });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl border border-slate-800 my-6 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30"><Wrench className="w-5 h-5" /></div>
            <div><h2 className="text-lg font-bold">MosesTech Fix AI Subscriptions</h2><p className="text-xs text-slate-400">Manual MTN or Airtel Money verification</p></div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl px-2">&times;</button>
        </div>

        {isAdminMode && <AdminActivationPanel plans={plans} />}

        <div className={`mb-5 p-4 rounded-2xl border flex items-center justify-between ${accessStatus.isLocked ? 'bg-red-950/50 border-red-500/60' : 'bg-emerald-950/50 border-emerald-500/50'}`}>
          <div className="flex items-center gap-3">{accessStatus.isLocked ? <Lock className="w-6 h-6 text-red-400" /> : <Clock className="w-6 h-6 text-emerald-400" />}<div><p className="font-bold">{accessStatus.planName}</p><p className="text-xs text-slate-300">{accessStatus.statusMessage}</p></div></div>
          {accessStatus.isPaid && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
        </div>

        {message && <div className={`mb-5 p-3 rounded-xl text-sm border ${message.type === 'success' ? 'bg-emerald-950 border-emerald-500 text-emerald-200' : message.type === 'error' ? 'bg-red-950 border-red-500 text-red-200' : 'bg-sky-950 border-sky-500 text-sky-200'}`}>{message.text}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {plans.map((plan) => <div key={plan.id} className={`rounded-2xl p-4 border flex flex-col ${plan.isPopular ? 'border-emerald-500 bg-emerald-950/70' : 'border-slate-700 bg-slate-800/60'}`}>
            {plan.badge && <span className="text-[10px] font-extrabold text-emerald-400 mb-2">{plan.badge}</span>}
            <h3 className="font-bold text-sm">{plan.name}</h3>
            <p className="text-xl font-extrabold text-emerald-400 my-2">{formatUGX(plan.monthlyUGX)} <span className="text-xs text-slate-400 font-normal">{plan.periodText}</span></p>
            <ul className="space-y-2 text-xs mb-4 flex-1">{plan.features.map((feature) => <li key={feature} className="flex gap-2"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><span className="text-slate-300">{feature}</span></li>)}</ul>
            <button onClick={() => setSelectedPlan(plan)} className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950">Choose this plan</button>
          </div>)}
        </div>

        {selectedPlan && <div className="mb-6 bg-slate-950 border border-emerald-500 rounded-2xl p-5 space-y-4">
          <div><p className="text-xs text-emerald-400 font-bold">SELECTED PLAN</p><h3 className="font-bold">{selectedPlan.name} — {formatUGX(selectedPlan.monthlyUGX)}</h3></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-900 border border-red-900 rounded-xl p-3"><p className="text-xs font-bold text-red-400">Airtel Money</p><p className="font-mono font-bold">{AIRTEL_NUMBER}</p><button onClick={() => copyText(AIRTEL_NUMBER, 'airtel')} className="text-[11px] text-emerald-400 flex items-center gap-1"><Copy className="w-3 h-3" />{copied === 'airtel' ? 'Copied' : 'Copy number'}</button></div>
            <div className="bg-slate-900 border border-amber-900 rounded-xl p-3"><p className="text-xs font-bold text-amber-400">MTN Mobile Money</p><p className="font-mono font-bold">{MTN_NUMBER}</p><button onClick={() => copyText(MTN_NUMBER, 'mtn')} className="text-[11px] text-emerald-400 flex items-center gap-1"><Copy className="w-3 h-3" />{copied === 'mtn' ? 'Copied' : 'Copy number'}</button></div>
          </div>
          <p className="text-xs text-slate-300 flex gap-2"><Smartphone className="w-4 h-4 text-emerald-400" />Send exactly {formatUGX(selectedPlan.monthlyUGX)}, then enter the details from your Mobile Money confirmation message.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input aria-label="Customer name" placeholder="Your full name" value={payment.customerName} onChange={(e) => setPayment({ ...payment, customerName: e.target.value })} className="px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm" />
            <input aria-label="Customer phone" placeholder="Your phone number" value={payment.customerPhone} onChange={(e) => setPayment({ ...payment, customerPhone: e.target.value })} className="px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm" />
            <input aria-label="Transaction reference" placeholder="Transaction reference" value={payment.transactionReference} onChange={(e) => setPayment({ ...payment, transactionReference: e.target.value })} className="px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm" />
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-3"><p className="text-[11px] text-slate-400">Your unique device code</p><div className="flex items-center gap-2"><code className="text-xs break-all text-emerald-300 flex-1">{deviceId}</code><button onClick={() => copyText(deviceId, 'device')} className="text-xs text-emerald-400"><Copy className="w-4 h-4" />{copied === 'device' && <span className="sr-only">Copied</span>}</button></div></div>
          <button onClick={sendPaymentDetails} className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl flex items-center gap-2"><MessageCircle className="w-4 h-4" />Send Payment Details on WhatsApp</button>
          <p className="text-[11px] text-slate-400">Never send your Mobile Money PIN. MosesTech only needs the transaction reference shown in your confirmation message.</p>
        </div>}

        <form onSubmit={activate} className="bg-slate-800/70 border border-slate-700 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3"><KeyRound className="w-5 h-5 text-emerald-400" /><div><h3 className="font-bold text-sm">Enter your activation code</h3><p className="text-[11px] text-slate-400">Use the code MosesTech sends after verifying your payment.</p></div></div>
          <div className="flex flex-col sm:flex-row gap-3"><textarea required aria-label="Activation code" rows={2} value={activationCode} onChange={(e) => setActivationCode(e.target.value)} placeholder="Paste your device activation code here" className="flex-1 px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono" /><button className="px-6 py-3 bg-emerald-500 text-slate-950 font-extrabold rounded-xl">Activate access</button></div>
          <p className="text-[11px] text-slate-400 mt-3 flex gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />Codes are signed, expire with the purchased plan and work only on the customer device code used during approval.</p>
        </form>
      </div>
    </div>
  );
};

const AdminActivationPanel: React.FC<{ plans: SubscriptionPlan[] }> = ({ plans }) => {
  const [adminSecret, setAdminSecret] = useState('');
  const [form, setForm] = useState({ planId: 'weekly_access', customerName: '', customerPhone: '', transactionReference: '', deviceId: '' });
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const generate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(''); setResult('');
    try {
      const response = await fetch('/api/subscriptions/manual/generate-code', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not generate code.');
      setResult(data.activationCode);
    } catch (error: any) { setError(error.message); }
  };

  return <form onSubmit={generate} className="mb-6 bg-amber-950/40 border-2 border-amber-500 rounded-2xl p-5 space-y-3">
    <div><p className="text-[10px] font-extrabold text-amber-400">PRIVATE ADMINISTRATOR TOOL</p><h3 className="font-bold">Generate a verified customer activation code</h3><p className="text-[11px] text-slate-300">Verify the Mobile Money transaction on your phone before generating a code.</p></div>
    {error && <p className="text-xs text-red-300">{error}</p>}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <input required type="password" placeholder="Administrator password" value={adminSecret} onChange={(e) => setAdminSecret(e.target.value)} className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm" />
      <select value={form.planId} onChange={(e) => setForm({ ...form, planId: e.target.value })} className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm">{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name} — {formatUGX(plan.monthlyUGX)}</option>)}</select>
      <input required placeholder="Customer name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm" />
      <input required placeholder="Customer phone" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm" />
      <input required placeholder="Verified transaction reference" value={form.transactionReference} onChange={(e) => setForm({ ...form, transactionReference: e.target.value })} className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm" />
      <input required placeholder="Customer device code" value={form.deviceId} onChange={(e) => setForm({ ...form, deviceId: e.target.value })} className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm" />
    </div>
    <button className="px-5 py-2.5 bg-amber-500 text-slate-950 font-extrabold rounded-xl">Generate activation code</button>
    {result && <div className="bg-slate-950 border border-emerald-500 rounded-xl p-3"><p className="text-xs text-emerald-300 font-bold mb-1">Send this code privately to the verified customer:</p><textarea readOnly rows={4} value={result} className="w-full bg-transparent text-xs font-mono text-white" /><button type="button" onClick={() => navigator.clipboard.writeText(result)} className="text-xs text-emerald-400 flex items-center gap-1"><Copy className="w-3 h-3" />Copy activation code</button></div>}
  </form>;
};
