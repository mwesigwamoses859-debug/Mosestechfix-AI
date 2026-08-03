import React, { useState } from 'react';
import { Globe, Copy, Check, ExternalLink, Code2, Sparkles, Smartphone, ShieldCheck, X } from 'lucide-react';

interface WebsiteEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebsiteEmbedModal: React.FC<WebsiteEmbedModalProps> = ({ isOpen, onClose }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mosestechfixsolution.com';

  const iframeCode = `<iframe
  src="${currentUrl}"
  width="100%"
  height="800px"
  style="border:none; border-radius:16px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);"
  title="MosesTech Fix AI Troubleshooting Portal"
  allow="camera; microphone; geolocation"
></iframe>`;

  const widgetScriptCode = `<script>
  (function() {
    var btn = document.createElement('div');
    btn.id = 'mosestech-ai-widget';
    btn.innerHTML = '🤖 <strong style="margin-left:6px;">MosesTech AI Fix</strong>';
    btn.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:999999;background:#059669;color:#ffffff;padding:14px 22px;border-radius:30px;cursor:pointer;font-family:sans-serif;font-size:14px;font-weight:bold;box-shadow:0 10px 25px rgba(0,0,0,0.3);transition:all 0.3s ease;';
    btn.onmouseover = function() { btn.style.transform = 'scale(1.08)'; };
    btn.onmouseout = function() { btn.style.transform = 'scale(1)'; };
    btn.onclick = function() { window.open('${currentUrl}', '_blank'); };
    document.body.appendChild(btn);
  })();
</script>`;

  const directButtonCode = `<a href="${currentUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; background:#059669; color:#ffffff; font-family:sans-serif; font-size:15px; font-weight:bold; padding:12px 24px; border-radius:12px; text-decoration:none; box-shadow:0 4px 14px rgba(5,150,105,0.4);">
  🤖 Launch MosesTech Fix AI Troubleshooter ↗
</a>`;

  const handleCopy = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-800 my-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Website Integration for <span className="text-emerald-400">mosestechfixsolution.com</span>
              </h2>
              <p className="text-xs text-slate-400">
                Embed MosesTech Fix AI directly onto your website in 3 simple copy-paste options
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Integration Options Grid */}
        <div className="space-y-5 mb-6">
          {/* Option 1: Full-Width Portal Iframe */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-emerald-400 text-sm">Option 1: Full-Page AI Repair Portal (Iframe)</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(iframeCode, 'iframe')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow"
              >
                {copiedType === 'iframe' ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'iframe' ? 'Copied Code!' : 'Copy Iframe Code'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Paste this HTML snippet into any WordPress page, Elementor Custom HTML block, or website page on <strong>mosestechfixsolution.com</strong> to display the complete Fix AI Troubleshooter inside your site.
            </p>
            <pre className="bg-slate-900 p-3 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap border border-slate-800">
              {iframeCode}
            </pre>
          </div>

          {/* Option 2: Floating Chat Widget Script */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span className="font-bold text-teal-400 text-sm">Option 2: Floating Corner AI Chat Widget (JS Script)</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(widgetScriptCode, 'script')}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow"
              >
                {copiedType === 'script' ? <Check className="w-3.5 h-3.5 text-teal-200" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'script' ? 'Copied Script!' : 'Copy Script Code'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Paste before the closing <code>&lt;/body&gt;</code> tag of your website code or inside WordPress Header/Footer Scripts. Adds a persistent <strong>🤖 MosesTech AI Fix</strong> floating button in the bottom-right corner.
            </p>
            <pre className="bg-slate-900 p-3 rounded-lg text-xs font-mono text-teal-300 overflow-x-auto whitespace-pre-wrap border border-slate-800">
              {widgetScriptCode}
            </pre>
          </div>

          {/* Option 3: Call-To-Action Button */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ExternalLink className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-amber-400 text-sm">Option 3: Styled Call-To-Action Button Link</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(directButtonCode, 'button')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow"
              >
                {copiedType === 'button' ? <Check className="w-3.5 h-3.5 text-amber-200" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'button' ? 'Copied Button!' : 'Copy HTML Button'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Place this button on your homepage, header, or contact page on <strong>mosestechfixsolution.com</strong> so clients can open the AI Diagnoser in a clean popup tab.
            </p>
            <pre className="bg-slate-900 p-3 rounded-lg text-xs font-mono text-amber-300 overflow-x-auto whitespace-pre-wrap border border-slate-800">
              {directButtonCode}
            </pre>
          </div>
        </div>

        {/* Quick Instructions Footer */}
        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-3">
          <div>
            <span className="font-bold text-white block">WordPress / Elementor Integration Guide</span>
            <span>1. Open your WordPress Admin -&gt; Pages -&gt; Edit Page (e.g. AI Repair Portal)</span>
            <span className="block">2. Add an "HTML" or "Custom HTML" widget and paste Option 1 or Option 3 code above.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shrink-0 shadow-md"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
