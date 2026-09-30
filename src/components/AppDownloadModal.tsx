import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Check, X, Shield, Sparkles, ExternalLink, QrCode, PhoneCall } from 'lucide-react';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install on your phone:\n\n1. In Chrome, tap the 3 dots (⋮) menu in top right.\n2. Tap "Install App" or "Add to Home screen".');
    }
  };

  const handleDownloadAPKWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello MosesTech Fix Solution, please send me the direct MosesTechFixAI Android APK (.apk file) for installation on my phone!`
    );
    window.open(`https://wa.me/256789218570?text=${text}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://mosestechfixai.mwesigwamoses859.workers.dev');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-5 shadow-2xl text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>MosesTech Fix Mobile App</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Android & Web
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Install on your smartphone for 1-tap instant diagnostics
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Options Cards */}
        <div className="space-y-3">
          
          {/* Option A: 1-Tap Home Screen Install (PWA) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">📲</span>
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                  Option 1: Add to Home Screen (Instant Install)
                </h4>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                Recommended
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              No downloading needed. Runs full-screen with app icon, offline support, and automatic updates.
            </p>
            <button
              type="button"
              onClick={handleInstallPWA}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all hover:scale-102"
            >
              <Download className="w-4 h-4" />
              <span>{isInstalled ? 'App Installed on this Device!' : 'Install on Phone / Desktop'}</span>
            </button>
          </div>

          {/* Option B: Android APK (.apk file) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🤖</span>
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                  Option 2: Download Android APK File (.apk)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-500">v2.0 Native</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Get the compiled standalone Android APK file to install on any Android phone or share directly via WhatsApp.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href="https://github.com/mwesigwamoses859-debug/Mosestechfix-AI/actions"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download from GitHub</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>

              <button
                type="button"
                onClick={handleDownloadAPKWhatsApp}
                className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Receive via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Share Link Action */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <span>Web Portal:</span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <ExternalLink className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied URL!' : 'Copy Shareable Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
