import React, { useMemo, useState } from 'react';
import { Building2, Check, CheckCircle2, Clock, Copy, CreditCard, Globe, KeyRound, Lock, MessageCircle, ShieldCheck, Smartphone, Sparkles, Wrench } from 'lucide-react';
import { SubscriptionPlan } from '../types';
import { formatUGX } from '../utils/calculator';
import { AccessStatus, getAccessStatus, getDeviceId, saveVerifiedAccess } from '../utils/subscriptionManager';
import { copyToClipboard } from '../utils/browserCompat';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiRequestCount: number;
}

type PaymentForm = { customerName: string; customerPhone: string; transactionReference: string };

const PRIMARY_MTN_NUMBER = '0789218570';
const AIRTEL_NUMBER = '0708262179';
const WHATSAPP_NUMBER = '256789218570'; // Primary WhatsApp & MTN

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const [accessStatus, setAccessStatus] = useState<AccessStatus>(() => getAccessStatus());
  const [paymentMethodTab, setPaymentMethodTab] = useState<'card_usd' | 'mobile_money' | 'bank_transfer'>('card_usd');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [payment, setPayment] = useState<PaymentForm>({ customerName: '', customerPhone: '', transactionReference: '' });
  const [customerEmail, setCustomerEmail] = useState('');
  const [isProcessingStripe, setIsProcessingStripe] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copied, setCopied] = useState('');
  const deviceId = useMemo(() => getDeviceId(), []);
  const isAdminMode = new URLSearchParams(window.location.search).get('admin') === 'activation';

  const plans = useMemo<SubscriptionPlan[]>(() => [
    { id: 'weekly_access', name: 'Weekly Pass', monthlyUGX: 10000, priceUSD: 3, periodText: '/7 days', aiRequestLimit: 'Unlimited', badge: 'POPULAR', features: ['7 days AI access', 'Photo & error-code analysis', 'Guided troubleshooting'] },
    { id: 'monthly_full', name: 'Advanced Pro', monthlyUGX: 20000, priceUSD: 5, periodText: '/30 days', aiRequestLimit: 'Unlimited', isPopular: true, badge: 'MOST POPULAR — $5/MO', features: ['30 days unlimited AI access', 'Gemini 2.5 Flash & Pro Reasoning', 'Photo hardware & BSOD diagnostics', 'Hands-free Voice repair assistant', 'PDF Invoicing & Debt Management', 'Priority WhatsApp support'] },
    { id: 'remote_pass', name: 'Remote Tech Pass', monthlyUGX: 25000, priceUSD: 7, periodText: '/30 days', aiRequestLimit: 50, features: ['50 AI diagnostics', 'One remote support session', 'WhatsApp case dispatch'] },
    { id: 'business_it', name: 'Business IT Care', monthlyUGX: 85000, priceUSD: 25, periodText: '/30 days', aiRequestLimit: 250, features: ['250 AI diagnostics', 'Two onsite technician visits', 'Support for up to 10 devices'] },
  ], []);

  if (!isOpen) return null;

  const copyText = async (value: string, label: string) => {
    const success = await copyToClipboard(value);
    if (success) {
      setCopied(label);
      setTimeout(() => setCopied(''), 1800);
    }
  };

  const handleStripeCheckout = async () => {
    setIsProcessingStripe(true);
    setMessage({ type: 'info', text: 'Connecting to secure Stripe checkout...' });
    try {
      const response = await fetch('/api/subscriptions/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: customerEmail.trim() || undefined,
          deviceId,
          planId: 'monthly_full',
          amountUSD: 5,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to initialize checkout.');

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.simulatedActivation) {
        // Fallback for test/development mode
        saveVerifiedAccess({
          accessToken: data.activationCode,
          planName: 'Advanced Pro ($5/mo)',
          expiresAt: data.expiresAt,
        });
        setAccessStatus(getAccessStatus());
        setMessage({ type: 'success', text: 'Advanced Plan ($5 USD/mo) activated successfully!' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Payment system unavailable. You can also use Mobile Money.' });
    } finally {
      setIsProcessingStripe(false);
    }
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
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-2xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl border border-slate-800 my-auto max-h-[94vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-5 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">MosesTech Fix AI — Subscription Plans</h2>
              <p className="text-xs text-slate-400">Choose between International Card (\$5 USD/mo) or Local Mobile Money</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl px-2">&times;</button>
        </div>

        {isAdminMode && <AdminActivationPanel plans={plans} />}

        {/* Current Access Status Banner */}
        <div className={`mb-5 p-4 rounded-2xl border flex items-center justify-between ${accessStatus.isLocked ? 'bg-red-950/50 border-red-500/60' : 'bg-emerald-950/50 border-emerald-500/50'}`}>
          <div className="flex items-center gap-3">
            {accessStatus.isLocked ? <Lock className="w-6 h-6 text-red-400" /> : <Clock className="w-6 h-6 text-emerald-400" />}
            <div>
              <p className="font-bold">{accessStatus.planName}</p>
              <p className="text-xs text-slate-300">{accessStatus.statusMessage}</p>
            </div>
          </div>
          {accessStatus.isPaid && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
        </div>

        {message && (
          <div className={`mb-5 p-3 rounded-xl text-sm border ${message.type === 'success' ? 'bg-emerald-950 border-emerald-500 text-emerald-200' : message.type === 'error' ? 'bg-red-950 border-red-500 text-red-200' : 'bg-sky-950 border-sky-500 text-sky-200'}`}>
            {message.text}
          </div>
        )}

        {/* Payment Method Switcher */}
        <div className="flex flex-col sm:flex-row bg-slate-950 p-1.5 rounded-xl border border-slate-800 mb-6 gap-2">
          <button
            onClick={() => setPaymentMethodTab('card_usd')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              paymentMethodTab === 'card_usd'
                ? 'bg-emerald-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Card / Google Pay (\$5 USD / mo)</span>
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-950/20 text-slate-900 font-extrabold">Instant</span>
          </button>
          <button
            onClick={() => setPaymentMethodTab('mobile_money')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              paymentMethodTab === 'mobile_money'
                ? 'bg-emerald-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>MTN Money (0789218570)</span>
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-extrabold">Uganda</span>
          </button>
          <button
            onClick={() => setPaymentMethodTab('bank_transfer')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              paymentMethodTab === 'bank_transfer'
                ? 'bg-emerald-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Bank Transfer (EFT)</span>
          </button>
        </div>

        {/* TAB 1: $5 USD / MONTH INTERNATIONAL STRIPE CHECKOUT */}
        {paymentMethodTab === 'card_usd' && (
          <div className="mb-6 bg-gradient-to-br from-emerald-950/60 via-slate-950 to-slate-900 border-2 border-emerald-500/80 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30 mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> ADVANCED TECHNICIAN TIER
                </span>
                <h3 className="text-xl font-extrabold text-white">Full AI Diagnostics & Tech Suite</h3>
                <p className="text-xs text-slate-300 mt-1">Automatic recurring card billing or Google Pay. Cancel anytime.</p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-3xl font-black text-emerald-400">\$5.00 <span className="text-xs font-normal text-slate-400">USD / month</span></div>
                <div className="text-[11px] text-slate-400">(\~20,000 UGX equivalent)</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Unlimited</strong> Gemini 2.5 Flash & Pro Reasoning</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>AI Camera Diagnostics</strong>: Photo inspection for BSOD & hardware lights</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Hands-Free Voice AI</strong>: Audio repair instructions while you work</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>PDF Invoice & Quotations</strong>: Instant branded customer bills</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Website Widget API</strong>: Embed MosesTech AI on your business site</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Priority Helpdesk Escalation</strong> via WhatsApp (+256708262179)</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 items-stretch">
              <input
                type="email"
                placeholder="Enter your email address (for payment receipt)"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                disabled={isProcessingStripe}
                onClick={handleStripeCheckout}
                className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95 disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" />
                <span>{isProcessingStripe ? 'Opening Checkout...' : 'Pay \$5.00 / Month with Card'}</span>
              </button>
            </div>
            
            <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Secured with 256-bit encryption. Visa, MasterCard, American Express, Apple Pay & Google Pay supported.
            </p>
          </div>
        )}

        {/* TAB 2: UGANDA MOBILE MONEY & LOCAL PLANS */}
        {paymentMethodTab === 'mobile_money' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-4 border flex flex-col ${
                    plan.isPopular ? 'border-emerald-500 bg-emerald-950/70' : 'border-slate-700 bg-slate-800/60'
                  }`}
                >
                  {plan.badge && <span className="text-[10px] font-extrabold text-emerald-400 mb-2">{plan.badge}</span>}
                  <h3 className="font-bold text-sm">{plan.name}</h3>
                  <p className="text-xl font-extrabold text-emerald-400 my-2">
                    {formatUGX(plan.monthlyUGX)} <span className="text-xs text-slate-400 font-normal">{plan.periodText}</span>
                  </p>
                  <ul className="space-y-2 text-xs mb-4 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setSelectedPlan(plan)}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition"
                  >
                    Choose this plan
                  </button>
                </div>
              ))}
            </div>

            {selectedPlan && (
              <div className="mb-6 bg-slate-950 border border-emerald-500 rounded-2xl p-5 space-y-4">
                <div>
                  <p className="text-xs text-emerald-400 font-bold">SELECTED PLAN</p>
                  <h3 className="font-bold">{selectedPlan.name} — {formatUGX(selectedPlan.monthlyUGX)}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-900 border-2 border-amber-500/80 rounded-xl p-3.5 relative overflow-hidden">
                    <div className="absolute top-2 right-2 text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                      Primary Payment Line
                    </div>
                    <p className="text-xs font-bold text-amber-400">MTN Mobile Money (Moses Mwesigwa)</p>
                    <p className="font-mono text-base font-extrabold text-white mt-0.5">{PRIMARY_MTN_NUMBER}</p>
                    <button onClick={() => copyText(PRIMARY_MTN_NUMBER, 'mtn')} className="text-xs text-emerald-400 flex items-center gap-1.5 mt-2 font-bold hover:underline">
                      <Copy className="w-3.5 h-3.5" />
                      {copied === 'mtn' ? 'Copied 0789218570!' : 'Copy MTN Number'}
                    </button>
                  </div>
                  <div className="bg-slate-900 border border-red-900/60 rounded-xl p-3.5">
                    <p className="text-xs font-bold text-red-400">Airtel Money (Secondary Line)</p>
                    <p className="font-mono text-base font-bold text-slate-200 mt-0.5">{AIRTEL_NUMBER}</p>
                    <button onClick={() => copyText(AIRTEL_NUMBER, 'airtel')} className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 mt-2">
                      <Copy className="w-3.5 h-3.5" />
                      {copied === 'airtel' ? 'Copied' : 'Copy Airtel Number'}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-300 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                  Send exactly {formatUGX(selectedPlan.monthlyUGX)}, then submit your transaction reference below.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    aria-label="Customer name"
                    placeholder="Your full name"
                    value={payment.customerName}
                    onChange={(e) => setPayment({ ...payment, customerName: e.target.value })}
                    className="px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm"
                  />
                  <input
                    aria-label="Customer phone"
                    placeholder="Your phone number"
                    value={payment.customerPhone}
                    onChange={(e) => setPayment({ ...payment, customerPhone: e.target.value })}
                    className="px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm"
                  />
                  <input
                    aria-label="Transaction reference"
                    placeholder="Transaction reference"
                    value={payment.transactionReference}
                    onChange={(e) => setPayment({ ...payment, transactionReference: e.target.value })}
                    className="px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm"
                  />
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-3">
                  <p className="text-[11px] text-slate-400">Your unique device code</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <code className="text-xs break-all text-emerald-300 flex-1">{deviceId}</code>
                    <button onClick={() => copyText(deviceId, 'device')} className="text-xs text-emerald-400 flex items-center gap-1">
                      <Copy className="w-3.5 h-3.5" />
                      {copied === 'device' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
                <button
                  onClick={sendPaymentDetails}
                  className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl flex items-center gap-2 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send Payment Details on WhatsApp
                </button>
                <p className="text-[11px] text-slate-400">
                  Never send your Mobile Money PIN. MosesTech only needs the transaction reference shown in your telecom confirmation SMS.
                </p>
              </div>
            )}
          </>
        )}

        {/* TAB 3: BANK TRANSFER (FOR BUSINESSES & INVOICES) */}
        {paymentMethodTab === 'bank_transfer' && (
          <div className="mb-6 bg-slate-950 border border-slate-700 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Direct Bank Transfer / EFT</h3>
                <p className="text-xs text-slate-400">Official bank payment for school contracts, corporate IT care, and large invoices.</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-slate-800 gap-1">
                <span className="text-slate-400 text-xs">Bank Name:</span>
                <span className="font-bold text-emerald-400">dfcu Bank Uganda</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-slate-800 gap-1">
                <span className="text-slate-400 text-xs">Account Name:</span>
                <span className="font-bold text-white">Mwesigwa Moses</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-slate-800 gap-1">
                <span className="text-slate-400 text-xs">Account Number:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-extrabold text-amber-400 tracking-wider">01360017235808</span>
                  <button onClick={() => copyText('01360017235808', 'account_no')} className="text-xs text-emerald-400 flex items-center gap-1 font-bold bg-slate-800 px-2 py-1 rounded hover:bg-slate-700">
                    <Copy className="w-3.5 h-3.5" />
                    {copied === 'account_no' ? 'Copied Account No!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-slate-800 gap-1">
                <span className="text-slate-400 text-xs">Official Verification WhatsApp:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white tracking-wider">0789218570</span>
                  <button onClick={() => copyText('0789218570', 'bank_contact')} className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                    <Copy className="w-3.5 h-3.5" />
                    {copied === 'bank_contact' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 gap-1">
                <span className="text-slate-400 text-xs">Currencies Accepted:</span>
                <span className="text-xs font-bold text-slate-200">UGX (Ugandan Shillings) & USD</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs text-slate-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong>How to complete bank payment:</strong> Make your deposit or EFT/RTGS transfer to <strong>dfcu Bank Account 01360017235808 (Mwesigwa Moses)</strong>. Once completed, take a photo or screenshot of your deposit slip and send it to WhatsApp at <strong className="text-emerald-400">0789218570</strong> for immediate account activation and official invoice receipting.
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const text = 'Hello MosesTech Fix AI, I have made a bank deposit/transfer to dfcu Bank Account 01360017235808 (Mwesigwa Moses). Here are my payment details and deposit slip for verification.';
                window.open(`https://wa.me/256789218570?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
              }}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl flex items-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4" />
              Send Bank Deposit Slip on WhatsApp (0789218570)
            </button>
          </div>
        )}

        {/* Manual Activation Code Input */}
        <form onSubmit={activate} className="bg-slate-800/70 border border-slate-700 rounded-2xl p-5 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <KeyRound className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm">Have an activation code?</h3>
              <p className="text-[11px] text-slate-400">Paste the signed code received from MosesTech to unlock full access.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              required
              aria-label="Activation code"
              rows={2}
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value)}
              placeholder="Paste your device activation code here"
              className="flex-1 px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono focus:border-emerald-500 focus:outline-none"
            />
            <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl transition">
              Activate access
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            Codes are cryptographically signed, expire with your purchased plan, and run on all modern web browsers.
          </p>
        </form>
      </div>
    </div>
  );
};

const AdminActivationPanel: React.FC<{ plans: SubscriptionPlan[] }> = ({ plans }) => {
  const [adminSecret, setAdminSecret] = useState('');
  const [form, setForm] = useState({ planId: 'monthly_full', customerName: '', customerPhone: '', transactionReference: '', deviceId: '' });
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const generate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setResult('');
    try {
      const response = await fetch('/api/subscriptions/manual/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not generate code.');
      setResult(data.activationCode);
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={generate} className="mb-6 bg-amber-950/40 border-2 border-amber-500 rounded-2xl p-5 space-y-3">
      <div>
        <p className="text-[10px] font-extrabold text-amber-400">PRIVATE ADMINISTRATOR TOOL</p>
        <h3 className="font-bold">Generate a verified customer activation code</h3>
        <p className="text-[11px] text-slate-300">Verify the Mobile Money transaction on your phone before generating a code.</p>
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <input
          required
          type="password"
          placeholder="Administrator password"
          value={adminSecret}
          onChange={(e) => setAdminSecret(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm"
        />
        <select
          value={form.planId}
          onChange={(e) => setForm({ ...form, planId: e.target.value })}
          className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm"
        >
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} — {formatUGX(plan.monthlyUGX)} (\$5/mo equivalent)
            </option>
          ))}
        </select>
        <input
          required
          placeholder="Customer name"
          value={form.customerName}
          onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm"
        />
        <input
          required
          placeholder="Customer phone"
          value={form.customerPhone}
          onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
          className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm"
        />
        <input
          required
          placeholder="Verified transaction reference"
          value={form.transactionReference}
          onChange={(e) => setForm({ ...form, transactionReference: e.target.value })}
          className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm"
        />
        <input
          required
          placeholder="Customer device code"
          value={form.deviceId}
          onChange={(e) => setForm({ ...form, deviceId: e.target.value })}
          className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm"
        />
      </div>
      <button className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl transition">
        Generate activation code
      </button>
      {result && (
        <div className="bg-slate-950 border border-emerald-500 rounded-xl p-3 mt-2">
          <p className="text-xs text-emerald-300 font-bold mb-1">Send this code privately to the verified customer:</p>
          <textarea readOnly rows={4} value={result} className="w-full bg-transparent text-xs font-mono text-white" />
          <button
            type="button"
            onClick={() => copyToClipboard(result)}
            className="text-xs text-emerald-400 flex items-center gap-1 mt-1"
          >
            <Copy className="w-3 h-3" />
            Copy activation code
          </button>
        </div>
      )}
    </form>
  );
};
