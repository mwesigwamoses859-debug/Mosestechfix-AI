import React, { useState } from 'react';
import {
  BusinessProfile,
  Sale,
  Expense,
  DebtRecord,
  BusinessDocument,
  Product,
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
} from 'lucide-react';
import { formatUGX } from '../utils/calculator';

interface DashboardProps {
  profile: BusinessProfile;
  sales: Sale[];
  expenses: Expense[];
  debts: DebtRecord[];
  documents: BusinessDocument[];
  products: Product[];
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
  setActiveTab,
  onQuickPromptAI,
}) => {
  const [quickPromptText, setQuickPromptText] = useState('');

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

  return (
    <div className="space-y-6 pb-16 md:pb-6 text-slate-900">
      {/* Top Live Workshop & System Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
              <span>MosesTech Fix Workshop Online</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-mono">
                Ntinda Shop G-12
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Live AI Diagnostics • Motherboard Micro-soldering • Screen & Battery Tech Hub
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <a
            href="https://mosestechfixsolution.com"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all hover:scale-105"
          >
            <Globe className="w-3.5 h-3.5 text-white" />
            <span>mosestechfixsolution.com</span>
            <ExternalLink className="w-3 h-3 text-white" />
          </a>
        </div>
      </div>

      {/* Live Operational Metrics Display Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setActiveTab('sales')}
          className="bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono">
            {formatUGX(totalSalesUGX)}
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-emerald-700 mt-1 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>{sales.length} Completed Transactions</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('tickets')}
          className="bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-blue-500 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Repair Tickets</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono">
            {documents.length + 3} Active Cases
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-blue-700 mt-1 font-medium">
            <Activity className="w-3 h-3" />
            <span>Real-time Technician Tracking</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('documents')}
          className="bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-amber-500 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Quotations</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono">
            {pendingDocsCount} Pending
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-amber-700 mt-1 font-medium">
            <Clock className="w-3 h-3" />
            <span>{documents.length} Total Invoices Issued</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('products')}
          className="bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-purple-500 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Parts Inventory</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono">
            {totalProducts} Items
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-purple-700 mt-1 font-medium">
            <Flame className="w-3 h-3" />
            <span>Screens, RAM, SSDs & Printers</span>
          </div>
        </div>
      </div>

      {/* Hero AI Quick Diagnostic Bar */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white border border-emerald-700 shadow-xl relative overflow-hidden">
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
          className="bg-white hover:bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors">
              AI Diagnostic Troubleshooter
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Step-by-step guidance for laptops, desktops, printers, and routers with Green/Amber/Red safety checks.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-semibold">
            <span>Diagnose Device</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* 2. Repair Tickets & Technician Booking */}
        <div
          onClick={() => setActiveTab('tickets')}
          className="bg-white hover:bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-blue-500 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Ticket className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">
              Repair Tickets & Booking
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track active computer repair cases, update repair statuses, and dispatch WhatsApp case summaries to technicians.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-700 font-semibold">
            <span>Manage Tickets</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* 3. Official Knowledge Base */}
        <div
          onClick={() => setActiveTab('knowledge')}
          className="bg-white hover:bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-purple-500 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-purple-700 transition-colors">
              Official Repair Guides
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verified HP, Dell, Lenovo, and Epson troubleshooting manuals and component repair guidelines.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-700 font-semibold">
            <span>Open Library</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* 4. MosesTech Official Website Link */}
        <a
          href="https://mosestechfixsolution.com"
          target="_blank"
          rel="noreferrer"
          className="bg-emerald-50 hover:bg-emerald-100/80 p-5 rounded-2xl border border-emerald-200 transition-all group shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1 text-emerald-900">
              MosesTech Fix Solution Portal
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore hardware packages, software installation, printer setup, and IT maintenance contracts at <strong className="text-slate-900">mosestechfixsolution.com</strong>.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-200 flex items-center justify-between text-xs text-emerald-800 font-bold">
            <span>Visit mosestechfixsolution.com</span>
            <ExternalLink className="w-4 h-4" />
          </div>
        </a>
      </div>

      {/* Hardware & IT Scope Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-extrabold text-emerald-700 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>MosesTech Fix AI — Full Service Coverage</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Professional IT Technical Support & Repairs
            </h2>
            <p className="text-xs text-slate-500 max-w-3xl">
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <Laptop className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 block">Laptops & Notebooks</span>
              <span className="text-[10px] text-slate-500">HP, Dell, Lenovo, Mac</span>
            </div>
          </div>
          <div className="flex items-center space-x-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <Monitor className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 block">Desktops & Workstations</span>
              <span className="text-[10px] text-slate-500">Power supplies, GPUs</span>
            </div>
          </div>
          <div className="flex items-center space-x-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <Printer className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 block">Printers & Scanners</span>
              <span className="text-[10px] text-slate-500">Epson, HP InkTank</span>
            </div>
          </div>
          <div className="flex items-center space-x-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <Wifi className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 block">Networks & Wi-Fi</span>
              <span className="text-[10px] text-slate-500">Routers, LAN, Switches</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
