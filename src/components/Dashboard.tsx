import React, { useState } from 'react';
import {
  BusinessProfile,
  Sale,
  Expense,
  DebtRecord,
  BusinessDocument,
  Product,
  PaidSubscriber,
} from '../types';
import {
  Bot,
  ArrowUpRight,
  PhoneCall,
  Sparkles,
  Wrench,
  Ticket,
  BookOpen,
  Globe,
  ExternalLink,
  ShieldCheck,
  Laptop,
  Printer,
  Wifi,
  Monitor,
  TrendingUp,
  CreditCard,
  Package,
  Activity,
  CheckCircle2,
  Clock,
  Flame,
  Users,
  DollarSign,
  Smartphone,
  Search,
  Plus,
  Copy,
  Check,
  Calendar,
  MessageCircle,
} from 'lucide-react';
import { formatUGX } from '../utils/calculator';
import { getSubscriberStats, addPaidSubscriber } from '../utils/subscriberManager';

interface DashboardProps {
  profile: BusinessProfile;
  sales: Sale[];
  expenses: Expense[];
  debts: DebtRecord[];
  documents: BusinessDocument[];
  products: Product[];
  subscribers?: PaidSubscriber[];
  setSubscribers?: React.Dispatch<React.SetStateAction<PaidSubscriber[]>>;
  setActiveTab: (tab: string) => void;
  onOpenQuickSale: () => void;
  onOpenQuickQuotation: () => void;
  onQuickPromptAI: (prompt: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  sales = [],
  expenses = [],
  debts = [],
  documents = [],
  products = [],
  subscribers = [],
  setSubscribers,
  setActiveTab,
  onQuickPromptAI,
}) => {
  const [quickPromptText, setQuickPromptText] = useState('');

  // Subscriber Management State (Private for Mwesigwa Moses)
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [selectedMethodFilter, setSelectedMethodFilter] = useState<'All' | 'MTN MoMoPay (Merchant 551052)' | 'Airtel Money' | 'Stripe / Card'>('All');
  const [showAddSubscriberModal, setShowAddSubscriberModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New Subscriber Form State
  const [newSubName, setNewSubName] = useState('');
  const [newSubPhone, setNewSubPhone] = useState('');
  const [newSubPlan, setNewSubPlan] = useState<'monthly_full' | 'weekly_access' | 'remote_pass' | 'business_it'>('monthly_full');
  const [newSubMethod, setNewSubMethod] = useState<'MTN MoMoPay (Merchant 551052)' | 'MTN Mobile Money' | 'Airtel Money' | 'Stripe / Card'>('MTN MoMoPay (Merchant 551052)');
  const [newSubTxRef, setNewSubTxRef] = useState('');
  const [newSubNotes, setNewSubNotes] = useState('');

  const stats = getSubscriberStats(subscribers);

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAddSubscriberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubPhone.trim() || !newSubTxRef.trim()) {
      alert('Please fill customer name, phone number, and transaction reference.');
      return;
    }

    const planPrices = {
      weekly_access: { name: 'Weekly Pass (UGX 12,000)', ugx: 12000, usd: 3.5, days: 7 },
      monthly_full: { name: 'Advanced Pro ($7/mo)', ugx: 26000, usd: 7, days: 30 },
      remote_pass: { name: 'Remote Tech Pass', ugx: 35000, usd: 10, days: 30 },
      business_it: { name: 'Small Business IT Care', ugx: 95000, usd: 27, days: 30 },
    };

    const sel = planPrices[newSubPlan];
    const expiry = new Date(Date.now() + sel.days * 86_400_000).toISOString().replace('T', ' ').substring(0, 16);
    const code = `MTF-${newSubPlan.toUpperCase().substring(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const created = addPaidSubscriber({
      customerName: newSubName.trim(),
      customerPhone: newSubPhone.trim(),
      planId: newSubPlan,
      planName: sel.name,
      amountUGX: sel.ugx,
      amountUSD: sel.usd,
      paymentMethod: newSubMethod,
      transactionReference: newSubTxRef.trim(),
      deviceId: `dev-${newSubPhone.replace(/[^0-9]/g, '').slice(-6)}`,
      expiresAt: expiry,
      activationCode: code,
      notes: newSubNotes.trim() || 'Manual admin registration by Mwesigwa Moses',
    });

    if (setSubscribers) {
      setSubscribers((prev) => [created, ...prev]);
    }

    setNewSubName('');
    setNewSubPhone('');
    setNewSubTxRef('');
    setNewSubNotes('');
    setShowAddSubscriberModal(false);
    alert(`Successfully registered ${created.customerName} for ${created.planName}! Activation code: ${code}`);
  };

  const filteredSubscribers = (subscribers || []).filter((sub) => {
    const matchesSearch =
      sub.customerName.toLowerCase().includes(subscriberSearch.toLowerCase()) ||
      sub.customerPhone.toLowerCase().includes(subscriberSearch.toLowerCase()) ||
      sub.transactionReference.toLowerCase().includes(subscriberSearch.toLowerCase()) ||
      sub.planName.toLowerCase().includes(subscriberSearch.toLowerCase());
    const matchesMethod =
      selectedMethodFilter === 'All' ||
      sub.paymentMethod === selectedMethodFilter ||
      (selectedMethodFilter === 'MTN MoMoPay (Merchant 551052)' && sub.paymentMethod.includes('MTN'));
    return matchesSearch && matchesMethod;
  });

  const totalSalesUGX = sales.reduce((sum, s) => sum + (s.totalAmountUGX || 0), 0);
  const pendingDocsCount = documents.filter((d) => d.status === 'Pending').length;
  const totalProducts = products.length;

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPromptText.trim()) return;
    setActiveTab('assistant');
    onQuickPromptAI(quickPromptText);
    setQuickPromptText('');
  };

  const handleSelectQuickPrompt = (prompt: string) => {
    setActiveTab('assistant');
    onQuickPromptAI(prompt);
  };

  const handleSendDailyReportToWhatsApp = () => {
    const totalExpensesUGX = expenses.reduce((sum, e) => sum + (e.amountUGX || 0), 0);
    const totalDebtsUGX = debts.reduce((sum, d) => sum + (d.remainingAmountUGX || 0), 0);
    const activeDebts = debts.filter((d) => d.status === 'Pending' || (d.remainingAmountUGX && d.remainingAmountUGX > 0));
    const netCashUGX = totalSalesUGX - totalExpensesUGX;
    const today = new Date().toISOString().split('T')[0];

    const report =
      `📊 *MOSES TECH FIX SOLUTION — DAILY WORKSHOP REPORT*\n` +
      `📅 *Date:* ${today}\n` +
      `📍 *Location:* ${profile.address || 'Ntinda Shop G-12, Kampala'}\n\n` +
      `💰 *FINANCIAL SUMMARY:*\n` +
      `• Total Sales / Revenue: ${formatUGX(totalSalesUGX)} (${sales.length} transactions)\n` +
      `• Total Workshop Expenses: ${formatUGX(totalExpensesUGX)}\n` +
      `• Estimated Net Cash: ${formatUGX(netCashUGX)}\n\n` +
      `👥 *OUTSTANDING CUSTOMER DEBTS:*\n` +
      `• Total Debts: ${formatUGX(totalDebtsUGX)} (${activeDebts.length} debtors)\n` +
      (activeDebts.length > 0 ? activeDebts.slice(0, 4).map((d) => `  - ${d.customerName}: UGX ${d.remainingAmountUGX.toLocaleString()}`).join('\n') + '\n\n' : '\n') +
      `🛠️ *WORKSHOP REPAIRS & INVOICES:*\n` +
      `• Total Invoices & Quotations: ${documents.length}\n` +
      `• Pending Invoices: ${pendingDocsCount}\n\n` +
      `💳 *SHOP ACCOUNTS:*\n` +
      `• MTN Uganda MoMoPay Merchant: 551052 (MosesTech Fix Solution)\n` +
      `• MTN Mobile Hotline: 0789218570 (Moses Mwesigwa)\n` +
      `• Airtel Helpline: 0708262179\n` +
      `• dfcu Bank: 01360017235808 (Mwesigwa Moses)\n\n` +
      `Generated by MosesTech Fix AI Executive Dashboard.`;

    window.open(`https://wa.me/256789218570?text=${encodeURIComponent(report)}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-16 md:pb-6 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Live Workshop & System Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white">
              <span>MosesTech Fix Workshop Online</span>
              <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600 px-2 py-0.5 rounded-full font-mono">
                Ntinda Shop G-12
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Live AI Diagnostics • Motherboard Micro-soldering • Screen & Battery Tech Hub
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleSendDailyReportToWhatsApp}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all hover:scale-105"
            title="Send Daily Sales & Debt Summary to WhatsApp 0789218570"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>WhatsApp Daily Report</span>
          </button>

          <a
            href="https://mosestechfixsolution.com"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-500" />
            <span>mosestechfixsolution.com</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* 👑 PRIVATE ADMIN: Paid Subscribers & Subscription Revenue Tracker */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Paid Subscribers & Subscription Revenue</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono uppercase">
                  Private Admin View
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live breakdown of paid subscribers across MTN MoMo, Airtel Money, and Stripe Card.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddSubscriberModal(!showAddSubscriberModal)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all hover:scale-105 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddSubscriberModal ? 'Close Form' : '+ Record Paid Customer'}</span>
          </button>
        </div>

        {/* 4 Revenue & Subscriber KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Paying Customers */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Total Paid Users</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {stats.totalCount}
            </div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{stats.activeCount} Active • {stats.expiringCount} Expiring Soon</span>
            </div>
          </div>

          {/* Card 2: Total Revenue Collected */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/20 border border-blue-200/80 dark:border-blue-800/60 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-blue-800 dark:text-blue-300">Total Subscription Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-xs">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono truncate">
              {formatUGX(stats.totalRevenueUGX)}
            </div>
            <div className="text-[11px] text-blue-700 dark:text-blue-400 mt-1 font-semibold">
              <span>≈ ${stats.totalRevenueUSD} USD total collected</span>
            </div>
          </div>

          {/* Card 3: MTN MoMoPay Merchant 551052 */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50/50 dark:from-amber-950/40 dark:to-yellow-950/20 border border-amber-200/80 dark:border-amber-800/60 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300">MTN MoMoPay (Merchant 551052)</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
                <Smartphone className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono">
              {stats.mtnCount} Paid Users
            </div>
            <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 font-mono font-bold">
              <span>{formatUGX(stats.mtnRevenueUGX)}</span>
            </div>
          </div>

          {/* Card 4: Airtel & Stripe Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-rose-50/50 dark:from-purple-950/40 dark:to-rose-950/20 border border-purple-200/80 dark:border-purple-800/60 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-purple-800 dark:text-purple-300">Airtel Money & Card</span>
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black shadow-xs">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono">
              {stats.airtelCount + stats.cardCount} Paid Users
            </div>
            <div className="text-[11px] text-purple-700 dark:text-purple-400 mt-1 font-semibold">
              <span>{stats.airtelCount} Airtel ({formatUGX(stats.airtelRevenueUGX)}) • {stats.cardCount} Stripe (${stats.cardRevenueUSD})</span>
            </div>
          </div>
        </div>

        {/* Collapsible Manual Activation / Registration Panel */}
        {showAddSubscriberModal && (
          <form
            onSubmit={handleAddSubscriberSubmit}
            className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-emerald-500/40 space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  + Activate Customer (Mobile Money or Cash)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Enter payer details to record revenue and generate an instant device activation code.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSubscriberModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                Cancel ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ronald Ssebaggala"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Customer Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +256 789 218570"
                  value={newSubPhone}
                  onChange={(e) => setNewSubPhone(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Plan Subscribed *</label>
                <select
                  value={newSubPlan}
                  onChange={(e) => setNewSubPlan(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-medium"
                >
                  <option value="weekly_access">Weekly Pass — UGX 12,000 ($3.50)</option>
                  <option value="monthly_full">Advanced Pro (30 Days) — UGX 26,000 ($7.00)</option>
                  <option value="remote_pass">Remote Tech Pass — UGX 35,000 ($10.00)</option>
                  <option value="business_it">Small Business IT Care — UGX 95,000 ($27.00)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Payment Channel *</label>
                <select
                  value={newSubMethod}
                  onChange={(e) => setNewSubMethod(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-medium"
                >
                  <option value="MTN MoMoPay (Merchant 551052)">MTN MoMoPay (Merchant Code: 551052)</option>
                  <option value="MTN Mobile Money">MTN Direct Line (0789218570)</option>
                  <option value="Airtel Money">Airtel Money (0708262179)</option>
                  <option value="Stripe / Card">Stripe / Online Card</option>
                  <option value="Cash / Direct">Cash / Direct Shop Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Transaction Ref / MoMo ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MTN-MM-449102"
                  value={newSubTxRef}
                  onChange={(e) => setNewSubTxRef(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Admin Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. WhatsApp verification completed"
                  value={newSubNotes}
                  onChange={(e) => setNewSubNotes(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Save Payment & Activate Subscriber</span>
              </button>
            </div>
          </form>
        )}

        {/* Search & Channel Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search paid customers by name, phone, or transaction ID..."
              value={subscriberSearch}
              onChange={(e) => setSubscriberSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
            {(['All', 'MTN MoMoPay (Merchant 551052)', 'Airtel Money', 'Stripe / Card'] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setSelectedMethodFilter(method)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                  selectedMethodFilter === method
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {method === 'All' ? `All (${(subscribers || []).length})` : method}
              </button>
            ))}
          </div>
        </div>

        {/* Paid Subscribers Ledger Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-3.5">Customer / Contact</th>
                <th className="py-3 px-3">Plan / Tier</th>
                <th className="py-3 px-3">Amount Paid</th>
                <th className="py-3 px-3">Payment Channel</th>
                <th className="py-3 px-3">Tx Reference</th>
                <th className="py-3 px-3">Expiry Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No paid subscribers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3.5">
                      <p className="font-bold text-slate-900 dark:text-white">{sub.customerName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{sub.customerPhone}</p>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">{sub.planName}</span>
                      <span className="text-[10px] text-slate-400">{sub.subscribedAt}</span>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatUGX(sub.amountUGX)}
                      {sub.amountUSD && <span className="block text-[10px] text-slate-400">(${sub.amountUSD} USD)</span>}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.paymentMethod === 'MTN Mobile Money'
                          ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-600'
                          : sub.paymentMethod === 'Airtel Money'
                          ? 'bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-600'
                          : 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-600'
                      }`}>
                        {sub.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {sub.transactionReference}
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {sub.expiresAt}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        sub.status === 'Active'
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                          : sub.status === 'Expiring Soon'
                          ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 animate-pulse'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {sub.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {sub.activationCode && (
                          <button
                            type="button"
                            onClick={() => handleCopyCode(sub.activationCode!)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                            title="Copy customer activation code"
                          >
                            {copiedCode === sub.activationCode ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        <a
                          href={`https://wa.me/${sub.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hello ${sub.customerName}, your MosesTech Fix AI subscription (${sub.planName}) is active. If you need any computer troubleshooting assistance, you can access unlimited diagnostics at https://mosestechfixai.mwesigwamoses859.workers.dev. Thank you for choosing MosesTech!`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400"
                          title="Message customer on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Operational Metrics Display Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setActiveTab('sales')}
          className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-mono">
            {formatUGX(totalSalesUGX)}
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>{sales.length} Completed Transactions</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('tickets')}
          className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Repair Tickets</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-mono">
            {documents.length + 3} Active Cases
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-blue-700 dark:text-blue-400 mt-1 font-medium">
            <Activity className="w-3 h-3" />
            <span>Real-time Technician Tracking</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('documents')}
          className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Quotations</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-mono">
            {pendingDocsCount} Pending
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-amber-700 dark:text-amber-400 mt-1 font-medium">
            <Clock className="w-3 h-3" />
            <span>{documents.length} Total Invoices Issued</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('products')}
          className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Parts Inventory</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-mono">
            {totalProducts} Items
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-purple-700 dark:text-purple-400 mt-1 font-medium">
            <Flame className="w-3 h-3" />
            <span>Screens, RAM, SSDs & Printers</span>
          </div>
        </div>
      </div>

      {/* Hero AI Quick Diagnostic Bar */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white border border-emerald-700/80 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="inline-flex items-center space-x-2 bg-emerald-800/80 border border-emerald-500/80 rounded-full px-3 py-1 text-xs text-emerald-200 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>MosesTech Fix AI Diagnostic Engine</span>
              </div>
              <a
                href="https://mosestechfixsolution.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 bg-emerald-950/90 border border-emerald-500/80 hover:bg-emerald-900 rounded-full px-3 py-1 text-xs text-emerald-200 font-bold transition-all shadow-sm"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-300" />
                <span>mosestechfixsolution.com</span>
                <ExternalLink className="w-3 h-3 text-emerald-300 opacity-75" />
              </a>
              <a
                href="https://wa.me/256708262179"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 bg-slate-800/90 border border-slate-700 hover:bg-slate-700 rounded-full px-2.5 py-1 text-xs text-slate-200 font-medium transition-colors"
                title="Chat Airtel WhatsApp 0708262179"
              >
                <PhoneCall className="w-3 h-3 text-emerald-400" />
                <span>0708262179</span>
              </a>
              <a
                href="https://wa.me/256789218570"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 bg-slate-800/90 border border-slate-700 hover:bg-slate-700 rounded-full px-2.5 py-1 text-xs text-slate-200 font-medium transition-colors"
                title="Chat MTN WhatsApp 0789218570"
              >
                <PhoneCall className="w-3 h-3 text-yellow-400" />
                <span>0789218570</span>
              </a>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Instant Computer & Hardware Troubleshooter
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
              Type any issue with your laptop, desktop, printer, or Wi-Fi to get 1-step guided diagnostics, safety checks, and instant technician dispatch.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setActiveTab('assistant')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg transition-all hover:scale-[1.02]"
            >
              <Bot className="w-4 h-4 text-slate-950" />
              <span>Start Diagnostic Chat</span>
            </button>
          </div>
        </div>

        {/* Quick Diagnostic Search Bar */}
        <form onSubmit={handlePromptSubmit} className="relative mt-2">
          <input
            type="text"
            value={quickPromptText}
            onChange={(e) => setQuickPromptText(e.target.value)}
            placeholder="e.g. 'HP laptop orange power light blinking', 'Epson printer paper jam', or 'Wi-Fi network connected with no internet'"
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl py-3 pl-4 pr-28 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg flex items-center space-x-1 transition-colors"
          >
            <span>Diagnose</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Diagnostic Category Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px]">
          <span className="text-slate-300 font-medium">Common issues:</span>
          {[
            'Laptop power light blinks orange 3 times',
            'Dell laptop screen is black but fan is spinning',
            'Epson L3110 printer red light blinking paper jam',
            'Blue screen stop code CRITICAL_PROCESS_DIED',
            'Wi-Fi adapter disabled in Windows 11',
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectQuickPrompt(prompt)}
              className="bg-slate-800/80 hover:bg-emerald-800/80 hover:text-emerald-200 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 transition-colors"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>

      {/* Main IT Services Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. AI Diagnostic Troubleshooter */}
        <div
          onClick={() => setActiveTab('assistant')}
          className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              AI Diagnostic Troubleshooter
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Step-by-step guidance for laptops, desktops, printers, and routers with Green/Amber/Red safety checks.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>Diagnose Device</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* 2. Repair Tickets & Technician Booking */}
        <div
          onClick={() => setActiveTab('tickets')}
          className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Ticket className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Repair Tickets & Booking
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Track active computer repair cases, update repair statuses, and dispatch WhatsApp case summaries to technicians.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-semibold">
            <span>Manage Tickets</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* 3. Official Knowledge Base */}
        <div
          onClick={() => setActiveTab('knowledge')}
          className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Official Repair Guides
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Verified HP, Dell, Lenovo, and Epson troubleshooting manuals and component repair guidelines.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 font-semibold">
            <span>Open Library</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* 4. MosesTech Official Website Link */}
        <a
          href="https://mosestechfixsolution.com"
          target="_blank"
          rel="noreferrer"
          className="bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/50 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 transition-all group shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              MosesTech Fix Solution Portal
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Explore hardware packages, software installation, printer setup, and IT maintenance contracts at <strong className="text-emerald-700 dark:text-emerald-400">mosestechfixsolution.com</strong>.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-bold">
            <span>Visit mosestechfixsolution.com</span>
            <ExternalLink className="w-4 h-4" />
          </div>
        </a>
      </div>

      {/* Hardware & IT Scope Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>MosesTech Fix AI — Full Service Coverage</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Professional IT Technical Support & Repairs
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl">
              Located at Shop G-12, Ntinda Shopping Centre, Kampala. We specialize in motherboard micro-soldering, laptop screen replacements, battery testing, printer ink head declogging, and corporate office IT maintenance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="https://wa.me/256708262179"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Airtel: 0708262179</span>
            </a>
            <a
              href="https://wa.me/256789218570"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>MTN: 0789218570</span>
            </a>
          </div>
        </div>

        {/* Supported Hardware Icons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center space-x-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700">
            <Laptop className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block">Laptops & Notebooks</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">HP, Dell, Lenovo, Mac</span>
            </div>
          </div>
          <div className="flex items-center space-x-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700">
            <Monitor className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block">Desktops & Workstations</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Power supplies, GPUs</span>
            </div>
          </div>
          <div className="flex items-center space-x-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700">
            <Printer className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block">Printers & Scanners</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Epson, HP InkTank</span>
            </div>
          </div>
          <div className="flex items-center space-x-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700">
            <Wifi className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block">Networks & Wi-Fi</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Routers, LAN, Switches</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
