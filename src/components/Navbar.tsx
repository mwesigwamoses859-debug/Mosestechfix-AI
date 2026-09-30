import React from 'react';
import { BusinessProfile, UserRole } from '../types';
import { getAccessStatus } from '../utils/subscriptionManager';
import {
  Bot,
  BookOpen,
  Sparkles,
  Building,
  Wrench,
  Ticket,
  ShoppingBag,
  FileText,
  LayoutDashboard,
  ExternalLink,
  Globe,
  Lock,
  Sun,
  Moon,
  Shield,
  LogOut,
} from 'lucide-react';

interface NavbarProps {
  profile: BusinessProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenKnowledge: () => void;
  onOpenSubscription: () => void;
  onOpenEmbedModal?: () => void;
  onRoleChange: (role: UserRole) => void;
  aiRequestCount: number;
  theme?: 'dark' | 'light';
  toggleTheme?: () => void;
  isAdmin?: boolean;
  onOpenAdminModal?: () => void;
  onLogoutAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  activeTab,
  setActiveTab,
  onOpenKnowledge,
  onOpenSubscription,
  onOpenEmbedModal,
  aiRequestCount,
  theme = 'dark',
  toggleTheme,
  isAdmin = false,
  onOpenAdminModal,
  onLogoutAdmin,
}) => {
  const access = getAccessStatus();

  return (
    <header className="bg-white/95 dark:bg-slate-950/90 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-40 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('assistant')}
              className="flex items-center space-x-2.5 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    MosesTech Fix AI
                  </span>
                  <span className="bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    2.0 Engine
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[170px] sm:max-w-xs">
                  {profile.name}
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {/* 1. Main ChatGPT-Style AI Diagnoser (Public for Everyone) */}
            <button
              onClick={() => setActiveTab('assistant')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'assistant'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Fix AI</span>
            </button>

            {/* 2. Customer Repair Tickets */}
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'tickets'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Repair Tickets</span>
            </button>

            {/* Admin-Only Tabs (Visible ONLY to Mwesigwa Moses when Admin is unlocked) */}
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    activeTab === 'dashboard'
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Admin Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveTab('documents')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    activeTab === 'documents'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Invoices & dfcu</span>
                </button>

                <button
                  onClick={() => setActiveTab('products')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    activeTab === 'products'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Spare Parts</span>
                </button>
              </>
            )}

            {/* Official Website Link */}
            <a
              href="https://mosestechfixsolution.com"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
              title="Visit MosesTech Fix Solution (0789218570 / 0708262179)"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Portal</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </nav>

          {/* Right Header Controls: Theme, Guides, Admin Unlock, Subscriptions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            
            {/* Theme Toggle Button (Light / Dark) */}
            {toggleTheme && (
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-800 transition-all hover:scale-105 shadow-sm"
                title={theme === 'dark' ? 'Switch to Clean Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle dark/light theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700" />
                )}
              </button>
            )}

            {/* Official Tech Guides */}
            <button
              onClick={onOpenKnowledge}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center space-x-1 border border-slate-200 dark:border-slate-800 transition-colors shadow-sm"
              title="Official Tech Knowledge Base"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="hidden sm:inline">Guides</span>
            </button>

            {/* Admin Lock / Unlock Control */}
            {isAdmin ? (
              <div className="flex items-center bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-500/40 rounded-xl px-2 py-1 gap-1.5">
                <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden sm:inline">Admin Mode</span>
                </span>
                <button
                  type="button"
                  onClick={onLogoutAdmin}
                  className="text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors"
                  title="Lock Admin and exit to Customer View"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAdminModal}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center space-x-1 border border-slate-200 dark:border-slate-800 transition-colors shadow-sm"
                title="Admin Login for Mwesigwa Moses"
              >
                <Shield className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            {/* Access Status & Subscription Button ($5 USD / UGX) */}
            <button
              onClick={onOpenSubscription}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-sm transition-all hover:scale-105 ${
                access.isLocked
                  ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                  : access.isPaid
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
              }`}
              title={access.statusMessage}
            >
              {access.isLocked ? (
                <Lock className="w-3.5 h-3.5 text-white shrink-0" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>
                {access.isLocked
                  ? 'Unlock'
                  : access.isPaid
                  ? 'VIP Plan'
                  : '$5/mo Plan'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
