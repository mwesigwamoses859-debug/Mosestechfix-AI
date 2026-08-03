import React, { useState } from 'react';
import { KnowledgeSource, TechSolution } from '../types';
import { BookOpen, ExternalLink, ShieldCheck, CheckCircle2, Wrench, Laptop, Printer, Wifi, AlertTriangle, Search } from 'lucide-react';

interface KnowledgeBaseModalProps {
  sources: KnowledgeSource[];
  techSolutions?: TechSolution[];
  isOpen: boolean;
  onClose: () => void;
  onSelectSolution?: (sol: TechSolution) => void;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  sources,
  techSolutions = [],
  isOpen,
  onClose,
  onSelectSolution,
}) => {
  const [activeTab, setActiveTab] = useState<'solutions' | 'official'>('solutions');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredSolutions = techSolutions.filter(
    (s) =>
      s.problemTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.deviceCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.symptomKeywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-800 my-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                MosesTech Fix AI — Official & Technician Knowledge Base
              </h2>
              <p className="text-xs text-slate-400">
                Official troubleshooting guides from Microsoft, HP, Dell, Lenovo & Uganda Technician Records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold text-2xl px-2"
          >
            &times;
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-4">
          <button
            onClick={() => setActiveTab('solutions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'solutions'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-amber-300" />
            <span>Uganda Technician Solutions ({techSolutions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('official')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'official'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
            <span>Official Support Portals ({sources.length})</span>
          </button>
        </div>

        {/* Content Body */}
        {/* MosesTech Official Website Banner */}
        <div className="mb-4 p-3.5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 rounded-xl border border-emerald-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-700">
              Official Technical Hub
            </span>
            <h3 className="text-sm font-bold text-white">MosesTech Fix Solution Portal</h3>
            <p className="text-xs text-slate-300">
              Visit <strong className="text-emerald-400">mosestechfixsolution.com</strong> for more IT repair information, software setup, and corporate maintenance contracts.
            </p>
            <p className="text-[11px] text-slate-400">
              Hotline / WhatsApp: <strong className="text-white">0708262179 (Airtel)</strong> | <strong className="text-white">0789218570 (MTN)</strong>
            </p>
          </div>
          <a
            href="https://mosestechfixsolution.com"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shrink-0 shadow-lg transition-colors"
          >
            <span>Visit Website</span>
            <ExternalLink className="w-3.5 h-3.5 text-white" />
          </a>
        </div>

        {activeTab === 'solutions' ? (
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search common problem, symptom (e.g., orange light, blue screen, printer spooler, wifi)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 text-white text-xs rounded-xl border border-slate-700 pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              {filteredSolutions.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">No matching tech solutions found.</div>
              ) : (
                filteredSolutions.map((sol) => (
                  <div
                    key={sol.id}
                    className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                          {sol.deviceCategory}
                        </span>
                        <h3 className="font-bold text-white text-sm mt-1">{sol.problemTitle}</h3>
                      </div>

                      {sol.officialSourceUrl && (
                        <a
                          href={sol.officialSourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 rounded-lg text-[11px] font-semibold flex items-center space-x-1 shrink-0"
                        >
                          <span>Official Manual</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      )}
                    </div>

                    <div className="text-xs text-slate-300 space-y-1">
                      <p className="font-semibold text-slate-400">Common Causes:</p>
                      <ul className="list-disc list-inside text-[11px] text-slate-300 pl-1 space-y-0.5">
                        {sol.commonCauses.map((c, idx) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-xs bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
                      <p className="font-semibold text-emerald-400 flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Safe User Steps (Green Level):
                      </p>
                      <ul className="list-decimal list-inside text-[11px] text-slate-300 space-y-0.5">
                        {sol.safeSteps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ul>
                    </div>

                    {sol.redFlags.length > 0 && (
                      <div className="text-[11px] bg-red-950/60 border border-red-900/80 text-red-300 p-2 rounded-lg flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        <span><strong>Red Flag Hazard:</strong> {sol.redFlags.join('; ')}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/60">
                      <span>Fix Time: <strong className="text-white">{sol.estimatedFixTime}</strong></span>
                      <span>Service Fee: <strong className="text-emerald-400">{sol.estimatedCostUGX}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            {sources.map((src) => (
              <div
                key={src.id}
                className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                      {src.organization}
                    </span>
                    <h3 className="font-bold text-white text-sm mt-1">{src.title}</h3>
                  </div>

                  <a
                    href={src.link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1 shrink-0"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{src.summary}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-700/60 pt-2">
                  <span>Applies to: <strong className="text-white">{src.applicableCategory}</strong></span>
                  <span>Last Verified: <strong className="text-white">{src.lastChecked}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Verified Uganda IT Diagnostic Guidance by MosesTech
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
          >
            Close Knowledge Base
          </button>
        </div>
      </div>
    </div>
  );
};

