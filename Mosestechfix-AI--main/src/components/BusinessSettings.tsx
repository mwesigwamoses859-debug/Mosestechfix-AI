import React, { useState } from 'react';
import { BusinessProfile, BusinessCategory, UserRole } from '../types';
import {
  Building,
  Save,
  Shield,
  Download,
  RotateCcw,
  Check,
  Phone,
  Mail,
  MapPin,
  FileText,
  Globe,
  ExternalLink,
  PhoneCall,
} from 'lucide-react';

interface BusinessSettingsProps {
  profile: BusinessProfile;
  setProfile: React.Dispatch<React.SetStateAction<BusinessProfile>>;
  onResetDemoData: () => void;
}

export const BusinessSettings: React.FC<BusinessSettingsProps> = ({
  profile,
  setProfile,
  onResetDemoData,
}) => {
  const [formData, setFormData] = useState<BusinessProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const categories: BusinessCategory[] = [
    'Computer & Phone Shop',
    'IT Technician & Repairs',
    'Website Developer & Freelancer',
    'Salon & Barbershop',
    'Retail Shop & Supermarket',
    'Tour & Travel Company',
    'Small NGO & Community Org',
    'General Small Business',
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 md:pb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Business Profile & Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure your Ugandan business profile, contact details, TIN, and role permissions.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Business Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Business Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as BusinessCategory })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Owner Name *
            </label>
            <input
              type="text"
              required
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Telephone & WhatsApp Hotline *
            </label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value, whatsapp: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Business Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              URA Tax Identification Number (TIN)
            </label>
            <input
              type="text"
              value={formData.tin || ''}
              onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
              placeholder="e.g. 1018923481"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Official Company Website
            </label>
            <input
              type="text"
              value={formData.website || 'https://mosestechfixsolution.com'}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Shop Physical Address / Location *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Shop G-12, Ntinda Shopping Centre, Kampala, Uganda"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
            />
          </div>
        </div>

        {/* Official Repair Center & Help Info Card */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-4 rounded-xl border border-emerald-700 text-xs text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
              <Globe className="w-4 h-4" />
              <span>Official Repair Center Website & Help Portal</span>
            </div>
            <p className="text-slate-300 text-xs">
              Need additional repair information, software setup guides, or corporate IT maintenance packages? Visit <strong className="text-emerald-300">mosestechfixsolution.com</strong>
            </p>
            <p className="text-[11px] text-slate-400">
              Direct Contact Lines: <strong className="text-white">0708262179 (Airtel)</strong> | <strong className="text-white">0789218570 (MTN)</strong>
            </p>
          </div>
          <a
            href="https://mosestechfixsolution.com"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shrink-0 shadow-lg transition-colors"
          >
            <span>Visit mosestechfixsolution.com</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Currency fixed to UGX */}
        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>Currency configured to <strong>Ugandan Shillings (UGX)</strong></span>
          </div>
          <span className="font-bold text-emerald-700">UGX Standard</span>
        </div>

        {/* Website Integration & Embed Code Generator */}
        <div className="border-t border-slate-200 pt-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>mosestechfixsolution.com Integration & Embed Snippets</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Embed MosesTech Fix AI directly into your WordPress, Wix, HTML, or React website.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Option 1: Full-Width Iframe */}
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl space-y-2 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400">1. Full Page / Repair Portal Embed (Iframe)</span>
                <button
                  type="button"
                  onClick={() => {
                    const code = `<iframe src="${window.location.origin}" width="100%" height="750px" style="border:none; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.1);" title="MosesTech Fix AI Repair Portal"></iframe>`;
                    navigator.clipboard.writeText(code);
                    alert('Copied iframe snippet to clipboard!');
                  }}
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[10px] transition-colors"
                >
                  Copy Code
                </button>
              </div>
              <p className="text-[11px] text-slate-400">Paste this HTML snippet into any WordPress page, Elementor HTML block, or custom webpage to display the complete Fix AI Troubleshooter & Ticket Manager.</p>
              <pre className="bg-slate-950 p-2.5 rounded-lg text-[10px] text-emerald-300 font-mono overflow-x-auto whitespace-pre-wrap">
{`<iframe
  src="${window.location.origin}"
  width="100%"
  height="750px"
  style="border:none; border-radius:16px;"
  title="MosesTech Fix AI"
></iframe>`}
              </pre>
            </div>

            {/* Option 2: Floating AI Chat Button */}
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl space-y-2 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-400">2. Floating Corner Chat Widget Script</span>
                <button
                  type="button"
                  onClick={() => {
                    const code = `<script>
  (function() {
    var btn = document.createElement('div');
    btn.innerHTML = '🤖 <strong>MosesTech AI Fix</strong>';
    btn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;background:#059669;color:#fff;padding:12px 18px;border-radius:30px;cursor:pointer;font-family:sans-serif;font-size:14px;box-shadow:0 8px 24px rgba(0,0,0,0.25);';
    btn.onclick = function() { window.open('${window.location.origin}', '_blank'); };
    document.body.appendChild(btn);
  })();
</script>`;
                    navigator.clipboard.writeText(code);
                    alert('Copied floating chat script to clipboard!');
                  }}
                  className="px-2 py-1 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded text-[10px] transition-colors"
                >
                  Copy Script
                </button>
              </div>
              <p className="text-[11px] text-slate-400">Paste before the closing <code>&lt;/body&gt;</code> tag on <strong>mosestechfixsolution.com</strong> to add a persistent floating AI assistant button.</p>
              <pre className="bg-slate-950 p-2.5 rounded-lg text-[10px] text-teal-300 font-mono overflow-x-auto whitespace-pre-wrap">
{`<script>
  (function() {
    var btn = document.createElement('div');
    btn.innerHTML = '🤖 MosesTech AI Fix';
    btn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;...';
    btn.onclick = function() { window.open('${window.location.origin}', '_blank'); };
    document.body.appendChild(btn);
  })();
</script>`}
              </pre>
            </div>
          </div>

          {/* Option 3: WhatsApp Cloud API Bot Webhook URL */}
          <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-100 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                3. WhatsApp Cloud API Live Webhook Endpoint
              </span>
              <div className="flex items-center space-x-2">
                <a
                  href="https://developers.facebook.com/apps/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold rounded text-[10px] transition-colors flex items-center gap-1 border border-emerald-800"
                >
                  <span>Meta Portal ↗</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/api/webhook/whatsapp`;
                    navigator.clipboard.writeText(url);
                    alert('Copied WhatsApp Webhook URL to clipboard!');
                  }}
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[10px] transition-colors"
                >
                  Copy Webhook URL
                </button>
              </div>
            </div>
            <p className="text-[11px] text-emerald-200">
              Paste this Callback URL in Meta for Developers (developers.facebook.com) under <strong>WhatsApp Cloud API -&gt; Configuration -&gt; Webhook URL</strong>.
            </p>
            <div className="bg-slate-950 p-2.5 rounded-lg text-[11px] font-mono text-emerald-400 border border-emerald-900/60 overflow-x-auto">
              {window.location.origin}/api/webhook/whatsapp
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onResetDemoData}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-emerald-900/30 transition-all"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
