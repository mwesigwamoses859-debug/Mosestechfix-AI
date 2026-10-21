import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Send as TelegramIcon,
  Sparkles,
  Zap,
  X,
  ExternalLink,
} from 'lucide-react';
import { addBonusTokens } from '../utils/subscriptionManager';
import { copyToClipboard } from '../utils/browserCompat';

interface PromoteShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromoteShareModal: React.FC<PromoteShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [bonusAdded, setBonusAdded] = useState(false);

  if (!isOpen) return null;

  const appUrl = 'https://mosestechfixai.mwesigwamoses859.workers.dev';
  const promoText = `🚀 Don't pay 100k UGX in town just for computer inspection! Use MosesTech Fix AI to diagnose laptop blue screens, printer jams, and hardware faults in 3 seconds. Everyone gets 5 Free Diagnostic Tokens! Try it: ${appUrl} • WhatsApp Helpdesk: 0789218570`;

  const handleShareClick = (platformUrl: string) => {
    addBonusTokens(1);
    setBonusAdded(true);
    window.open(platformUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => setBonusAdded(false), 6000);
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(promoText);
    if (success) {
      setCopied(true);
      addBonusTokens(1);
      setBonusAdded(true);
      setTimeout(() => setCopied(false), 2500);
      setTimeout(() => setBonusAdded(false), 6000);
    }
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(promoText)}`,
      desc: 'Share to your WhatsApp Status, chats & groups',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-500 text-white',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`,
      desc: 'Post to Facebook feed & tech groups',
    },
    {
      name: 'X (Twitter)',
      icon: Twitter,
      color: 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-700',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        'Diagnose laptop blue screens & printer errors in 3 seconds with MosesTech Fix AI! 5 Free tokens: '
      )}&url=${encodeURIComponent(appUrl)}&hashtags=UgandaTech,ComputerRepair,Kampala`,
      desc: 'Tweet to followers with hashtags',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-sky-700 hover:bg-sky-600 text-white',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}`,
      desc: 'Share to business network & colleagues',
    },
    {
      name: 'Telegram',
      icon: TelegramIcon,
      color: 'bg-sky-500 hover:bg-sky-400 text-white',
      url: `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(promoText)}`,
      desc: 'Broadcast to Telegram channels & groups',
    },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-emerald-500/30 shadow-2xl overflow-hidden my-6 animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Promote MosesTech Fix AI
              </h2>
              <p className="text-xs text-emerald-100 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Earn +1 Free Diagnostic Token for every share!</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {bonusAdded && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-pulse">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>🎉 +1 Bonus Diagnostic Token added to your account!</span>
            </div>
          )}

          {/* Poster Preview Card */}
          <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <img
              src="/og-preview.jpg"
              alt="Promo Thumbnail"
              className="w-14 h-20 rounded-xl object-cover border border-slate-300 dark:border-slate-600 shrink-0 shadow-sm"
            />
            <div className="text-xs space-y-1">
              <span className="font-extrabold text-slate-900 dark:text-white block">
                Official Uganda IT Diagnostic Portal
              </span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                Scan laptop blue screens, printer jams, and hardware faults in 3 seconds. Backed by technician Moses in Ntinda.
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                mosestechfixai.mwesigwamoses859.workers.dev
              </span>
            </div>
          </div>

          {/* 1-Click Social Sharing Buttons */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              1-Click Share to Social Media:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {shareLinks.map((platform) => {
                const IconComponent = platform.icon;
                return (
                  <button
                    key={platform.name}
                    type="button"
                    onClick={() => handleShareClick(platform.url)}
                    className={`py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center justify-between shadow-sm transition active:scale-95 ${platform.color}`}
                  >
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4" />
                      <span>{platform.name}</span>
                    </div>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Copy Message Bar */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Or Copy Ready-to-Send Promo Message:
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
              {promoText}
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full py-2.5 px-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Promo Message Copied to Clipboard!' : 'Copy Promo Message & Earn Token'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
