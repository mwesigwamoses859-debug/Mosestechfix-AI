import React, { useState } from 'react';
import { BusinessProfile, Sale, Expense, DebtRecord, Product } from '../types';
import { formatUGX } from '../utils/calculator';
import { Sparkles, ShieldCheck, AlertTriangle, TrendingUp, CheckCircle, RefreshCw, Zap, ArrowRight } from 'lucide-react';

interface AIBusinessInsightsProps {
  profile: BusinessProfile;
  sales: Sale[];
  expenses: Expense[];
  debts: DebtRecord[];
  products: Product[];
  onOpenQuickPrompt: (prompt: string) => void;
}

export const AIBusinessInsights: React.FC<AIBusinessInsightsProps> = ({
  profile,
  sales,
  expenses,
  debts,
  products,
  onOpenQuickPrompt,
}) => {
  const [audit, setAudit] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAudit = async () => {
    setLoading(true);
    setError(null);

    const totalSalesUGX = sales.reduce((sum, s) => sum + s.totalAmountUGX, 0);
    const totalExpensesUGX = expenses.reduce((sum, e) => sum + e.amountUGX, 0);
    const activeDebts = debts.filter((d) => d.status !== 'Paid');
    const totalDebtUGX = activeDebts.reduce((sum, d) => sum + d.balanceOwedUGX, 0);
    const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockThreshold).length;

    try {
      const res = await fetch('/api/ai/health-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessContext: profile,
          salesSummary: { totalSalesUGX, count: sales.length },
          expensesSummary: { totalExpensesUGX },
          debtsSummary: { totalDebtUGX, activeDebtorsCount: activeDebts.length },
          inventorySummary: { lowStockCount, totalProducts: products.length },
        }),
      });

      const data = await res.json();
      if (data.audit) {
        setAudit(data.audit);
      } else {
        setError('Could not complete AI audit at this moment.');
      }
    } catch (e: any) {
      setError(e.message || 'Error running AI audit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white border border-slate-800 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">MosesTech AI Business Health Coach</h2>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-700/60 font-semibold px-2 py-0.5 rounded-full">
                Gemini Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live AI analysis of your Ugandan shop's revenue, UGX margins, debt risks & stock.
            </p>
          </div>
        </div>

        <button
          onClick={runAudit}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center space-x-2 transition-all shadow-md shadow-emerald-950 disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Analyzing Business...' : audit ? 'Re-Analyze Business' : 'Run AI Health Check'}</span>
        </button>
      </div>

      {!audit && !loading && !error && (
        <div className="py-6 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-emerald-400 mx-auto animate-pulse" />
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Click <strong>"Run AI Health Check"</strong> above to generate a custom AI diagnostic report for {profile.name} with actionable strategies tailored for Ugandan retail & IT.
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-900/40 border border-rose-700/60 text-rose-200 text-xs rounded-xl">
          {error}
        </div>
      )}

      {audit && (
        <div className="space-y-4 pt-1 animate-fadeIn">
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 flex items-center space-x-4">
              <div className="relative w-14 h-14 flex items-center justify-center rounded-full bg-slate-900 border-2 border-emerald-500 text-emerald-400 font-extrabold text-lg">
                {audit.healthScore}
                <span className="text-[9px] text-slate-400 absolute bottom-1">%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Health Status</span>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  {audit.healthStatus}
                </h4>
              </div>
            </div>

            <div className="md:col-span-2 bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 text-xs leading-relaxed text-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">AI Diagnostic Summary</span>
              {audit.summaryOverview}
            </div>
          </div>

          {/* Strengths & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Strengths */}
            <div className="bg-emerald-950/30 border border-emerald-800/40 p-3.5 rounded-xl space-y-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Key Business Strengths
              </span>
              <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc list-inside">
                {audit.keyStrengths?.map((str: string, i: number) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>

            {/* Critical Risks */}
            <div className="bg-amber-950/30 border border-amber-800/40 p-3.5 rounded-xl space-y-2">
              <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Financial Risks & Warnings
              </span>
              <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc list-inside">
                {audit.criticalRisks?.map((risk: string, i: number) => (
                  <li key={i}>{risk}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="bg-slate-800/90 border border-emerald-500/30 p-4 rounded-xl space-y-3">
            <span className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Recommended AI Action Steps for {profile.name}
            </span>
            <div className="space-y-2">
              {audit.actionableAdvice?.map((advice: string, i: number) => (
                <div key={i} className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60 text-xs text-slate-200">
                  <span className="text-emerald-400 font-bold shrink-0">{i + 1}.</span>
                  <p className="flex-1 text-[11px] leading-relaxed">{advice}</p>
                  <button
                    onClick={() => onOpenQuickPrompt(`Action step guidance: ${advice}`)}
                    className="text-[10px] text-emerald-400 font-semibold hover:underline shrink-0 flex items-center gap-1 bg-slate-800 px-2 py-1 rounded"
                  >
                    <span>Ask AI</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
