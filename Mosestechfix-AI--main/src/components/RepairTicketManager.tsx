import React, { useState } from 'react';
import { CaseTicket, RepairBookingType, SafetyLevel } from '../types';
import {
  Ticket,
  Search,
  Plus,
  Phone,
  PhoneCall,
  MapPin,
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
  Send,
  Wrench,
  User,
  DollarSign,
  Filter,
  X,
  ExternalLink,
  Globe,
} from 'lucide-react';

interface RepairTicketManagerProps {
  tickets: CaseTicket[];
  setTickets: React.Dispatch<React.SetStateAction<CaseTicket[]>>;
  onNewTicketClick: () => void;
}

export const RepairTicketManager: React.FC<RepairTicketManagerProps> = ({
  tickets,
  setTickets,
  onNewTicketClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedTicket, setSelectedTicket] = useState<CaseTicket | null>(tickets[0] || null);

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.symptoms.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (ticketId: string, newStatus: CaseTicket['status']) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleSendWhatsAppSummary = (ticket: CaseTicket, targetPhone?: string) => {
    const text = encodeURIComponent(
      `🛠️ *MOSES TECH FIX AI — TICKET UPDATE* (${ticket.ticketNumber})\n` +
      `👤 *Customer:* ${ticket.customerName}\n` +
      `💻 *Device:* ${ticket.manufacturer} ${ticket.model} (${ticket.deviceCategory})\n` +
      `⚠️ *Symptoms:* ${ticket.symptoms}\n` +
      `📊 *Status:* ${ticket.status}\n` +
      `💰 *Estimated Fee:* UGX ${ticket.estimatedFeeUGX?.toLocaleString()}\n` +
      `📍 *Location:* ${ticket.location}\n\n` +
      `🌐 *Official Website:* https://mosestechfixsolution.com\n` +
      `📞 *Hotline:* 0708262179 / 0789218570\n` +
      `MosesTech IT Services — Shop G-12 Ntinda Shopping Centre, Kampala`
    );
    const dest = targetPhone || ticket.customerPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${dest}?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 text-slate-900">
      {/* Top Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Repair Case & Technician Tickets</h2>
            <p className="text-xs text-slate-500">
              Track auto-generated diagnostic summaries, remote support sessions & onsite visits
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://mosestechfixsolution.com"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-1.5 border border-emerald-200 transition-colors shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>mosestechfixsolution.com</span>
          </a>
          <button
            onClick={onNewTicketClick}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Case Ticket</span>
          </button>
        </div>
      </div>

      {/* Contact Technician & Official Support Portal Section */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 border border-emerald-700 rounded-2xl p-4 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-extrabold text-emerald-300 uppercase tracking-wider">
            <Wrench className="w-4 h-4 text-emerald-300" />
            <span>Contact Technician & Support Team</span>
          </div>
          <h3 className="text-sm font-bold text-white">Direct Line to Senior IT Repair Engineers</h3>
          <p className="text-xs text-slate-200">
            For urgent hardware escalations, motherboard soldering, or onsite technician dispatches, contact our Kampala helpdesk or visit our official support portal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href="https://wa.me/256708262179"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm transition-colors"
            title="Chat Airtel WhatsApp 0708262179"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Airtel: 0708262179</span>
          </a>

          <a
            href="https://wa.me/256789218570"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm transition-colors"
            title="Chat MTN WhatsApp 0789218570"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>MTN: 0789218570</span>
          </a>

          <a
            href="https://mosestechfixsolution.com"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs rounded-xl flex items-center space-x-1.5 border border-emerald-500 shadow-sm transition-colors"
            title="Visit Official Support Portal"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>mosestechfixsolution.com</span>
            <ExternalLink className="w-3 h-3 text-emerald-400" />
          </a>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search ticket number, customer name, device model, or symptoms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white text-slate-900 text-xs font-medium rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-white text-slate-900 text-xs font-medium rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          >
            <option value="All">All Ticket Statuses</option>
            <option value="Diagnosing">Diagnosing</option>
            <option value="Awaiting Technician">Awaiting Technician</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Ticket List & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ticket List */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-3 space-y-2 h-[580px] overflow-y-auto shadow-sm">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">No repair tickets found.</div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedTicket?.id === ticket.id
                    ? 'bg-emerald-50 border-emerald-400 text-slate-900 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[11px] font-bold text-emerald-700">
                    {ticket.ticketNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ticket.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : ticket.status === 'Awaiting Technician'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>

                <h4 className="font-bold text-xs truncate text-slate-900">{ticket.customerName}</h4>
                <p className="text-[11px] text-slate-500 truncate">
                  {ticket.manufacturer} {ticket.model} ({ticket.deviceCategory})
                </p>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200/60 pt-1.5">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {ticket.createdAt}
                  </span>
                  <span className="font-bold text-emerald-700">
                    UGX {ticket.estimatedFeeUGX?.toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ticket Detail Panel */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-[580px] overflow-y-auto">
          {selectedTicket ? (
            <div className="space-y-4 text-xs">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-base text-emerald-700">
                      {selectedTicket.ticketNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        selectedTicket.safetyLevel === 'Green'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : selectedTicket.safetyLevel === 'Amber'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {selectedTicket.safetyLevel} Safety Level
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5 font-medium">Created on {selectedTicket.createdAt}</p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => handleSendWhatsAppSummary(selectedTicket, '256708262179')}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1 shadow-2xs transition-colors"
                    title="Send ticket summary to Airtel Technician 0708262179"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Airtel (0708262179)</span>
                  </button>

                  <button
                    onClick={() => handleSendWhatsAppSummary(selectedTicket, '256789218570')}
                    className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1 shadow-2xs transition-colors"
                    title="Send ticket summary to MTN Technician 0789218570"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>MTN (0789218570)</span>
                  </button>
                </div>
              </div>

              {/* Status Update Controls */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-700">Update Ticket Status:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(['Diagnosing', 'Awaiting Technician', 'In Progress', 'Resolved', 'Closed'] as const).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(selectedTicket.id, st)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                          selectedTicket.status === st
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-extrabold block">
                    Customer Details
                  </span>
                  <p className="font-bold text-slate-900 text-sm">{selectedTicket.customerName}</p>
                  <p className="text-slate-700 flex items-center gap-1 font-medium">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    {selectedTicket.customerPhone}
                  </p>
                  <p className="text-slate-700 flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-blue-600" />
                    {selectedTicket.location}
                  </p>
                  {selectedTicket.organizationName && (
                    <p className="text-amber-800 text-[11px] font-bold">
                      Org: {selectedTicket.organizationName}
                    </p>
                  )}
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-extrabold block">
                    Device Specification
                  </span>
                  <p className="font-bold text-slate-900 text-sm">
                    {selectedTicket.manufacturer} {selectedTicket.model}
                  </p>
                  <p className="text-slate-700 font-medium">Category: {selectedTicket.deviceCategory}</p>
                  <p className="text-emerald-700 font-bold">
                    Booking Type: {selectedTicket.bookingType || 'Remote Support'}
                  </p>
                  <p className="text-slate-900 font-bold">
                    Est. Service Charge: UGX {selectedTicket.estimatedFeeUGX?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Symptoms & Attempted Steps */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-extrabold block mb-1">
                    Symptoms Reported by User / AI Diagnoser
                  </span>
                  <p className="text-slate-800 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200 font-medium">
                    {selectedTicket.symptoms}
                  </p>
                </div>

                {selectedTicket.errorCodes && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-extrabold block mb-1">
                      Observed Error Codes / Blink Patterns
                    </span>
                    <p className="text-amber-900 font-mono text-[11px] bg-white p-2 rounded-lg border border-slate-200 font-bold">
                      {selectedTicket.errorCodes}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-extrabold block mb-1">
                    Attempted Guided Troubleshooting Steps
                  </span>
                  <ul className="list-disc list-inside text-slate-700 space-y-0.5 font-medium">
                    {selectedTicket.attemptedSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Technician Notes */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-extrabold block">
                  Technician Diagnostic Notes
                </span>
                <textarea
                  rows={3}
                  value={selectedTicket.notes || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedTicket((prev) => (prev ? { ...prev, notes: val } : null));
                    setTickets((prev) =>
                      prev.map((t) => (t.id === selectedTicket.id ? { ...t, notes: val } : t))
                    );
                  }}
                  placeholder="Enter technician internal notes (e.g. RAM replaced, BIOS reflashed, screen cable re-seated)..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400"
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Select a ticket from the left panel to view complete diagnostic case summary.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
