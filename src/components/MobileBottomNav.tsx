import React, { useState } from 'react';
import { Wrench, Ticket, PlusCircle, LayoutDashboard, Menu, FileText, ShoppingBag, DollarSign, Users, Building, X, Globe, Shield, BookOpen, LogOut, Smartphone, Search } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onQuickAddSale: () => void;
  isAdmin?: boolean;
  onOpenAdminModal?: () => void;
  onLogoutAdmin?: () => void;
  onOpenKnowledge?: () => void;
  onOpenTicketTracker?: () => void;
  onOpenAppDownload?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onQuickAddSale,
  isAdmin = false,
  onOpenAdminModal,
  onLogoutAdmin,
  onOpenKnowledge,
  onOpenTicketTracker,
  onOpenAppDownload,
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
        <div className="md:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex flex-col justify-end animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-3xl p-4 shadow-2xl text-slate-900 dark:text-white space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-emerald-500" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">MosesTech Fix AI Modules</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Modules (Available for Everyone) */}
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <button
                type="button"
                onClick={() => handleTabClick('assistant')}
                className={`p-3 rounded-2xl border flex items-center space-x-2.5 transition-colors ${
                  activeTab === 'assistant'
                    ? 'bg-emerald-50 dark:bg-emerald-600/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Wrench className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate">Fix AI Diagnoser</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick('tickets')}
                className={`p-3 rounded-2xl border flex items-center space-x-2.5 transition-colors ${
                  activeTab === 'tickets'
                    ? 'bg-blue-50 dark:bg-blue-600/20 border-blue-500 text-blue-800 dark:text-blue-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Ticket className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="truncate">Repair Tickets</span>
              </button>

              {onOpenTicketTracker && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenTicketTracker();
                  }}
                  className="p-3 rounded-2xl border flex items-center space-x-2.5 transition-colors bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold"
                >
                  <Search className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="truncate">Track My Ticket</span>
                </button>
              )}

              {onOpenAppDownload && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenAppDownload();
                  }}
                  className="p-3 rounded-2xl border flex items-center space-x-2.5 transition-colors bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold"
                >
                  <Smartphone className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="truncate">Install Mobile App</span>
                </button>
              )}
            </div>

            {/* Admin-Only Financial & Workshop Modules */}
            {isAdmin ? (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span>👑 Admin Tools (Mwesigwa Moses)</span>
                  {onLogoutAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        onLogoutAdmin();
                        setIsMenuOpen(false);
                      }}
                      className="text-red-500 hover:underline flex items-center gap-1"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Lock Admin</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => handleTabClick('dashboard')}
                    className={`p-3 rounded-2xl border flex items-center space-x-2.5 transition-colors ${
                      activeTab === 'dashboard'
                        ? 'bg-teal-50 dark:bg-teal-600/20 border-teal-500 text-teal-800 dark:text-teal-300 font-bold'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-teal-500 shrink-0" />
                    <span className="truncate">Dashboard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabClick('documents')}
                    className={`p-3 rounded-2xl border flex items-center space-x-2.5 transition-colors ${
                      activeTab === 'documents'
                        ? 'bg-purple-50 dark:bg-purple-600/20 border-purple-500 text-purple-800 dark:text-purple-300 font-bold'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-purple-500 shrink-0" />
                    <span className="truncate">Invoices & Quotes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabClick('sales')}
                    className={`p-3 rounded-2xl border flex items-center space-x-2.5 transition-colors ${
                      activeTab === 'sales'
                        ? 'bg-emerald-50 dark:bg-emerald-600/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="truncate">Sales & Expenses</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabClick('customers')}
                    className={`p-3 rounded-2xl border flex items-center space-x-2.5 transition-colors ${
                      activeTab === 'customers'
                        ? 'bg-rose-50 dark:bg-rose-600/20 border-rose-500 text-rose-800 dark:text-rose-300 font-bold'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Users className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="truncate">Debts Ledger</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabClick('products')}
                    className={`p-3 rounded-2xl border flex items-center space-x-2.5 transition-colors ${
                      activeTab === 'products'
                        ? 'bg-amber-50 dark:bg-amber-600/20 border-amber-500 text-amber-800 dark:text-amber-300 font-bold'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="truncate">Spare Parts</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabClick('settings')}
                    className={`p-3 rounded-2xl border flex items-center space-x-2.5 transition-colors ${
                      activeTab === 'settings'
                        ? 'bg-slate-100 dark:bg-slate-800 border-slate-400 dark:border-slate-600 text-slate-900 dark:text-slate-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Building className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="truncate">Profile & Config</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (onOpenAdminModal) onOpenAdminModal();
                  }}
                  className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-700"
                >
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Admin Login (Mwesigwa Moses)</span>
                </button>
              </div>
            )}

            <a
              href="https://mosestechfixsolution.com"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow"
            >
              <Globe className="w-4 h-4" />
              <span>Visit mosestechfixsolution.com</span>
            </a>
          </div>
        </div>
      )}

      {/* Persistent Bottom Mobile Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/95 border-t border-slate-200 dark:border-slate-800 z-40 px-2 py-1.5 shadow-2xl backdrop-blur-md transition-colors">
        <div className={`grid ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'} items-center text-center`}>
          
          {/* 1. Fix AI Button */}
          <button
            type="button"
            onClick={() => setActiveTab('assistant')}
            className={`flex flex-col items-center py-1 text-[11px] font-medium transition-colors ${
              activeTab === 'assistant' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Wrench className="w-5 h-5 mb-0.5" />
            <span>Fix AI</span>
          </button>

          {/* 2. Customer Tickets */}
          <button
            type="button"
            onClick={() => setActiveTab('tickets')}
            className={`flex flex-col items-center py-1 text-[11px] font-medium transition-colors ${
              activeTab === 'tickets' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Ticket className="w-5 h-5 mb-0.5" />
            <span>Tickets</span>
          </button>

          {/* 3. Admin Dashboard (Only if Admin is Logged In) */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center py-1 text-[11px] font-medium transition-colors ${
                activeTab === 'dashboard' ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span>Dashboard</span>
            </button>
          )}

          {/* Center / Quick Diagnose Action Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                setActiveTab('assistant');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-11 h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center -mt-5 shadow-lg border-2 border-white dark:border-slate-900 transition-transform active:scale-95"
              title="New Diagnostic Chat"
            >
              <PlusCircle className="w-6 h-6" />
            </button>
          </div>

          {/* More / Menu Drawer */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex flex-col items-center py-1 text-[11px] font-medium transition-colors ${
              isMenuOpen ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span>{isAdmin ? 'Admin' : 'More'}</span>
          </button>
        </div>
      </div>
    </>
  );
};
