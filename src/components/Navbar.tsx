import React from 'react';
import { BusinessProfile, UserRole } from '../types';
import { getAccessStatus } from '../utils/subscriptionManager';
import { Bot, BookOpen, Shield, Sparkles, Building, ChevronDown, Wrench, Ticket, ShoppingBag, FileText, LayoutDashboard, ExternalLink, Globe, Lock } from 'lucide-react';

interface NavbarProps {
  profile: BusinessProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenKnowledge: () => void;
  onOpenSubscription: () => void;
  onOpenEmbedModal?: () => void;
  onRoleChange: (role: UserRole) => void;
  aiRequestCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  activeTab,
  setActiveTab,
  onOpenKnowledge,
  onOpenSubscription,
  onOpenEmbedModal,
  onRoleChange,
  aiRequestCount,
}) => {
  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Business Selector */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('assistant')}
              className="flex items-center space-x-2 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-600/20">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                    MosesTech Fix AI
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    IT Diagnostic
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate max-w-[180px] sm:max-w-xs">
                  {profile.name}
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => setActiveTab('assistant')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'assistant'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fix AI Diagnoser</span>
            </button>

            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'tickets'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Ticket className="w-3.5 h-3.5 text-blue-600" />
              <span>Repair Tickets & Bookings</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-teal-50 text-teal-700 border border-teal-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-teal-600" />
              <span>Repair Center Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'documents'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>Quotations & Invoices</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'products'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
              <span>Spare Parts & Stock</span>
            </button>

            {/* Prominent Website Navigation Button */}
            <a
              href="https://mosestechfixsolution.com"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all hover:scale-[1.02]"
              title="Visit MosesTech Fix Solution Official Website (0708262179 / 0789218570)"
            >
              <Globe className="w-3.5 h-3.5 text-white animate-pulse" />
              <span>mosestechfixsolution.com</span>
              <ExternalLink className="w-3 h-3 text-white" />
            </a>
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Website Integration & Embed Code Button */}
            {onOpenEmbedModal && (
              <button
                onClick={onOpenEmbedModal}
                className="px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center space-x-1 border border-emerald-300 transition-all hover:scale-105 shadow-sm"
                title="Get Embed Code for mosestechfixsolution.com"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="hidden sm:inline">Embed Code</span>
              </button>
            )}

            {/* Tech Knowledge Base Button */}
            <button
              onClick={onOpenKnowledge}
              className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center space-x-1 border border-slate-200 transition-colors"
              title="Official Tech Knowledge Base (Microsoft, HP, Dell, Lenovo)"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="hidden lg:inline">Official Guides</span>
            </button>

            {/* 3-Day Free Trial & Access Status Button */}
            {(() => {
              const access = getAccessStatus();
              return (
                <button
                  onClick={onOpenSubscription}
                  className={`px-2 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 shadow-sm transition-all hover:scale-105 ${
                    access.isLocked
                      ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                      : access.isPaid
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                  }`}
                  title={access.statusMessage}
                >
                  {access.isLocked ? (
                    <Lock className="w-3.5 h-3.5 text-white shrink-0" />
                  ) : (
                    <span className="shrink-0">🎁</span>
                  )}
                  <span className="hidden md:inline">
                    {access.isLocked
                      ? 'System Locked'
                      : access.isPaid
                      ? 'Paid VIP'
                      : '3-Day Free Trial'}
                  </span>
                </button>
              );
            })()}

            {/* AI Usage / Subscription Badge */}
            <button
              onClick={onOpenSubscription}
              className="px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium flex items-center space-x-1 border border-emerald-200 transition-colors"
              title="AI Request Usage"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden md:inline">AI:</span>
              <span className="font-bold text-slate-900 text-xs">{aiRequestCount}/50</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                activeTab === 'settings'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Business Settings"
            >
              <Building className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

