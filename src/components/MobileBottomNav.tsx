import React, { useState } from 'react';
import { Wrench, Ticket, PlusCircle, LayoutDashboard, Menu, FileText, ShoppingBag, DollarSign, Users, Building, X, Globe } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onQuickAddSale: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onQuickAddSale,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Popover Drawer */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col justify-end animate-fade-in">
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-2xl p-4 shadow-2xl text-white space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm text-white">MosesTech Fix AI Modules</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <button
                onClick={() => handleTabClick('assistant')}
                className={`p-3 rounded-xl border flex items-center space-x-2.5 transition-colors ${
                  activeTab === 'assistant'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Wrench className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Fix AI Diagnoser</span>
              </button>

              <button
                onClick={() => handleTabClick('tickets')}
                className={`p-3 rounded-xl border flex items-center space-x-2.5 transition-colors ${
                  activeTab === 'tickets'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Ticket className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate">Repair Tickets</span>
              </button>

              <button
                onClick={() => handleTabClick('dashboard')}
                className={`p-3 rounded-xl border flex items-center space-x-2.5 transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-teal-600/20 border-teal-500 text-teal-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="truncate">Dashboard</span>
              </button>

              <button
                onClick={() => handleTabClick('documents')}
                className={`p-3 rounded-xl border flex items-center space-x-2.5 transition-colors ${
                  activeTab === 'documents'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="truncate">Quotations & Invoices</span>
              </button>

              <button
                onClick={() => handleTabClick('products')}
                className={`p-3 rounded-xl border flex items-center space-x-2.5 transition-colors ${
                  activeTab === 'products'
                    ? 'bg-amber-600/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">Spare Parts & Stock</span>
              </button>

              <button
                onClick={() => handleTabClick('sales')}
                className={`p-3 rounded-xl border flex items-center space-x-2.5 transition-colors ${
                  activeTab === 'sales'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Sales & Expenses</span>
              </button>

              <button
                onClick={() => handleTabClick('customers')}
                className={`p-3 rounded-xl border flex items-center space-x-2.5 transition-colors ${
                  activeTab === 'customers'
                    ? 'bg-rose-600/20 border-rose-500 text-rose-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="truncate">Customers & Debts</span>
              </button>

              <button
                onClick={() => handleTabClick('settings')}
                className={`p-3 rounded-xl border flex items-center space-x-2.5 transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-slate-700/50 border-slate-600 text-slate-200 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">Settings & Profile</span>
              </button>
            </div>

            <a
              href="https://mosestechfixsolution.com"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow"
            >
              <Globe className="w-4 h-4" />
              <span>Visit mosestechfixsolution.com</span>
            </a>
          </div>
        </div>
      )}

      {/* Persistent Bottom Mobile Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-40 px-2 py-1.5 shadow-2xl">
        <div className="grid grid-cols-5 items-center text-center">
          <button
            onClick={() => setActiveTab('assistant')}
            className={`flex flex-col items-center py-1 text-[11px] font-medium transition-colors ${
              activeTab === 'assistant' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Wrench className="w-5 h-5 mb-0.5" />
            <span>Fix AI</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex flex-col items-center py-1 text-[11px] font-medium transition-colors ${
              activeTab === 'tickets' ? 'text-blue-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Ticket className="w-5 h-5 mb-0.5" />
            <span>Tickets</span>
          </button>

          {/* Quick Add Center Button */}
          <div className="flex justify-center">
            <button
              onClick={onQuickAddSale}
              className="w-12 h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center -mt-6 shadow-lg border-2 border-slate-900 transition-transform active:scale-95"
              title="Diagnose / Quick Action"
            >
              <PlusCircle className="w-6 h-6" />
            </button>
          </div>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center py-1 text-[11px] font-medium transition-colors ${
              activeTab === 'dashboard' ? 'text-teal-400 font-bold' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex flex-col items-center py-1 text-[11px] font-medium transition-colors ${
              isMenuOpen || ['documents', 'products', 'sales', 'customers', 'settings'].includes(activeTab)
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400'
            }`}
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span>More</span>
          </button>
        </div>
      </div>
    </>
  );
};


