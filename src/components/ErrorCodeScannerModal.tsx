import React, { useState } from 'react';
import { Camera, X, Sparkles, AlertTriangle, Monitor, Printer, Search, ArrowRight, Check } from 'lucide-react';
import { DeviceCategory, Manufacturer } from '../types';

interface ErrorCodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectErrorCode: (prompt: string, category: DeviceCategory, brand: Manufacturer) => void;
}

export const ErrorCodeScannerModal: React.FC<ErrorCodeScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectErrorCode,
}) => {
  const [activeTab, setActiveTab] = useState<'bsod' | 'printer'>('bsod');
  const [manualCode, setManualCode] = useState('');

  if (!isOpen) return null;

  const BSOD_CODES = [
    { code: 'CRITICAL_PROCESS_DIED', desc: 'Critical Windows background service crashed or corrupted disk', brand: 'Dell' },
    { code: '0x0000007B INACCESSIBLE_BOOT_DEVICE', desc: 'AHCI/SATA BIOS storage mode conflict or missing boot drive', brand: 'HP' },
    { code: 'PAGE_FAULT_IN_NONPAGED_AREA', desc: 'Defective RAM memory stick or outdated system driver', brand: 'Lenovo' },
    { code: 'DPC_WATCHDOG_VIOLATION', desc: 'SSD firmware out-of-date or incompatible Wi-Fi card driver', brand: 'Asus' },
    { code: 'IRQL_NOT_LESS_OR_EQUAL', desc: 'Overheating CPU or faulty memory paging address', brand: 'Dell' },
    { code: 'WHEA_UNCORRECTABLE_ERROR', desc: 'Hardware voltage failure or failing CPU/Motherboard', brand: 'HP' },
  ];

  const PRINTER_CODES = [
    { code: 'Epson Error E-01 / Red Light Flashing', desc: 'Fatal carriage lock or paper jam sensor obstructed', brand: 'Epson' },
    { code: 'Epson Error 0x97', desc: 'Motherboard internal circuit or print head voltage failure', brand: 'Epson' },
    { code: 'HP Error 5100 (Carriage Stall)', desc: 'Carriage belt dirty or foreign object blocking print carriage', brand: 'Generic / Other' },
    { code: 'Canon Support Code 1403', desc: 'Print head type is incorrect or print head is damaged', brand: 'Canon' },
    { code: 'Print Spooler Error 1068', desc: 'Windows Print Spooler service stopped or dependency failed', brand: 'Generic / Other' },
    { code: 'Printer Offline / WSD Port Issue', desc: 'Printer IP address changed on Wi-Fi router network', brand: 'Generic / Other' },
  ];

  const handleApplyCustomCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    if (activeTab === 'bsod') {
      onSelectErrorCode(
        `My computer crashed with blue screen Stop Error code: ${manualCode.trim()}. How do I fix it?`,
        'Windows Laptop',
        'HP'
      );
    } else {
      onSelectErrorCode(
        `My printer is showing error code: ${manualCode.trim()}. How do I troubleshoot and clear this error?`,
        'Printer & Scanner',
        'Epson'
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-5 sm:p-6 space-y-4 shadow-2xl text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-950/70 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Hardware Error Code Scanner</span>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                  Quick Fix
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                1-tap diagnosis for Windows Blue Screens and Printer Blink error numbers
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

        {/* Tab Switcher: BSOD vs Printer */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('bsod')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'bsod'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Windows Blue Screen (BSOD)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('printer')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'printer'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Printer Error & Blink Codes</span>
          </button>
        </div>

        {/* Manual Code Input Form */}
        <form onSubmit={handleApplyCustomCode} className="relative">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder={
              activeTab === 'bsod'
                ? "Type Windows Stop Code (e.g. 0x0000007B or KERNEL_DATA_INPAGE_ERROR)..."
                : "Type Printer Error Code (e.g. E-01, 0x97, 5100)..."
            }
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-4 pr-24 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          />
          <button
            type="submit"
            disabled={!manualCode.trim()}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
          >
            <span>Decode</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Preset Error Cards Grid */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Common Verified Presets (Click to diagnose):
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(activeTab === 'bsod' ? BSOD_CODES : PRINTER_CODES).map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (activeTab === 'bsod') {
                    onSelectErrorCode(
                      `My computer crashed with blue screen Stop Error code: ${item.code}. How do I fix it?`,
                      'Windows Laptop',
                      item.brand as Manufacturer
                    );
                  } else {
                    onSelectErrorCode(
                      `My printer is showing error: ${item.code}. How do I clear this error and fix the printer?`,
                      'Printer & Scanner',
                      item.brand as Manufacturer
                    );
                  }
                  onClose();
                }}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-indigo-500 dark:hover:border-indigo-500 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-xs text-indigo-700 dark:text-indigo-400 group-hover:underline">
                    {item.code}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-500 transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {item.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 text-center text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800">
          Powered by MosesTech Fix AI Knowledge Base • Kampala, Uganda
        </div>
      </div>
    </div>
  );
};
