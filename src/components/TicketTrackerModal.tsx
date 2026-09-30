import React, { useState } from 'react';
import { CaseTicket } from '../types';
import {
  Search,
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PhoneCall,
  Wrench,
  MapPin,
  X,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { formatUGX } from '../utils/calculator';

interface TicketTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: CaseTicket[];
}

export const TicketTrackerModal: React.FC<TicketTrackerModalProps> = ({
  isOpen,
  onClose,
  tickets = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<CaseTicket | null>(null);

  if (!isOpen) return null;

  // Filter matching tickets by Ticket Number or Customer Phone
  const filteredTickets = tickets.filter((t) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      t.ticketNumber.toLowerCase().includes(q) ||
      t.customerPhone.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q)
    );
  });

  const activeTicket = selectedTicket || (filteredTickets.length > 0 ? filteredTickets[0] : null);

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'Diagnosing':
        return 1;
      case 'Awaiting Technician':
        return 2;
      case 'In Progress':
        return 3;
      case 'Resolved':
        return 4;
      case 'Closed':
        return 4;
      default:
        return 2;
    }
  };

  const currentStep = activeTicket ? getStatusStep(activeTicket.status) : 1;

  const handleOpenWhatsApp = (ticket: CaseTicket) => {
    const text = encodeURIComponent(
      `Hello MosesTech Fix Helpdesk, I am inquiring about my Repair Ticket #${ticket.ticketNumber} for my ${ticket.manufacturer} ${ticket.model}. Could you update me on the status?`
    );
    window.open(`https://wa.me/256789218570?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-6 space-y-5 shadow-2xl text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-blue-950/70 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Public Repair Ticket Tracker</span>
                <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                  Live Status
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track your computer, printer, or hardware repair progress in real time
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

        {/* Search Input Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedTicket(null);
            }}
            placeholder="Enter Ticket # (e.g. MTF-2026-101) or Phone (e.g. 0789218570)..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>

        {/* Ticket Selector / Recent Tickets Chips */}
        {filteredTickets.length > 1 && (
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 py-1 font-medium">Matching cases:</span>
            {filteredTickets.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTicket(t)}
                className={`px-3 py-1 rounded-xl border text-xs font-bold transition-colors ${
                  activeTicket?.id === t.id
                    ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                #{t.ticketNumber} ({t.customerName})
              </button>
            ))}
          </div>
        )}

        {/* Ticket Detail Card */}
        {activeTicket ? (
          <div className="space-y-4">
            
            {/* Ticket Header & Status Pill */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-black text-sm text-blue-600 dark:text-blue-400">
                    {activeTicket.ticketNumber}
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    activeTicket.status === 'Resolved' || activeTicket.status === 'Closed'
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                  }`}>
                    {activeTicket.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {activeTicket.manufacturer} {activeTicket.model} ({activeTicket.deviceCategory})
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3 h-3 text-emerald-500" />
                  <span>Workshop: Ntinda Shopping Centre Shop G-12, Kampala</span>
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-[11px] text-slate-400 block font-medium">Estimated Fee</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                  {formatUGX(activeTicket.estimatedFeeUGX || 35000)}
                </span>
              </div>
            </div>

            {/* Visual 4-Step Progress Stepper */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                Repair Pipeline Status
              </span>
              
              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                {/* Step 1 */}
                <div className="space-y-1">
                  <div className={`h-2 rounded-full ${currentStep >= 1 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  <span className={`font-bold block ${currentStep >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                    1. Received
                  </span>
                </div>
                {/* Step 2 */}
                <div className="space-y-1">
                  <div className={`h-2 rounded-full ${currentStep >= 2 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  <span className={`font-bold block ${currentStep >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                    2. Diagnosis
                  </span>
                </div>
                {/* Step 3 */}
                <div className="space-y-1">
                  <div className={`h-2 rounded-full ${currentStep >= 3 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  <span className={`font-bold block ${currentStep >= 3 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                    3. Repairing
                  </span>
                </div>
                {/* Step 4 */}
                <div className="space-y-1">
                  <div className={`h-2 rounded-full ${currentStep >= 4 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  <span className={`font-bold block ${currentStep >= 4 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    4. Ready
                  </span>
                </div>
              </div>
            </div>

            {/* Diagnostic Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Customer</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{activeTicket.customerName}</p>
                <p className="text-slate-500 font-mono">{activeTicket.customerPhone}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Lead Engineer</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{activeTicket.assignedTech || 'Eng. Mwesigwa Moses'}</p>
                <p className="text-emerald-600 dark:text-emerald-400 font-medium">Ntinda Tech Workshop</p>
              </div>
            </div>

            {/* Reported Symptoms & Notes */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Reported Fault / Symptoms</span>
              <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                "{activeTicket.symptoms}"
              </p>
              {activeTicket.technicianNotes && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 mt-1">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Technician Bench Notes</span>
                  <p className="text-slate-600 dark:text-slate-300 italic">{activeTicket.technicianNotes}</p>
                </div>
              )}
            </div>

            {/* Direct WhatsApp Call/Chat with Lead Technician */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => handleOpenWhatsApp(activeTicket)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all hover:scale-102"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Chat with Moses on WhatsApp (0789218570)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Ticket className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">No matching tickets found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Please check your ticket number (e.g., <code>MTF-2026-101</code>) or phone number. Need immediate help? Contact <strong>0789218570</strong> / <strong>0708262179</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
