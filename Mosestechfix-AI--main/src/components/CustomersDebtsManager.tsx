import React, { useState } from 'react';
import { Customer, DebtRecord, DebtPayment, BusinessProfile, PaymentMethod } from '../types';
import { formatUGX } from '../utils/calculator';
import {
  Users,
  AlertCircle,
  Plus,
  Send,
  CheckCircle,
  Clock,
  PhoneCall,
  Search,
  DollarSign,
  Copy,
  Check,
  Calendar,
  MessageSquare,
} from 'lucide-react';

interface CustomersDebtsManagerProps {
  profile: BusinessProfile;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  debts: DebtRecord[];
  setDebts: React.Dispatch<React.SetStateAction<DebtRecord[]>>;
}

export const CustomersDebtsManager: React.FC<CustomersDebtsManagerProps> = ({
  profile,
  customers,
  setCustomers,
  debts,
  setDebts,
}) => {
  const [activeTab, setActiveTab] = useState<'debts' | 'customers'>('debts');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<DebtRecord | null>(null);

  // Customer Form
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custNotes, setCustNotes] = useState('');

  // Debt Form
  const [debtCustName, setDebtCustName] = useState('');
  const [debtCustPhone, setDebtCustPhone] = useState('');
  const [debtAmountUGX, setDebtAmountUGX] = useState(0);
  const [debtDueDate, setDebtDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [debtDescription, setDebtDescription] = useState('');

  // Partial Payment Form
  const [payAmountUGX, setPayAmountUGX] = useState(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('MTN Mobile Money');
  const [payNote, setPayNote] = useState('Partial payment');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeDebts = debts.filter((d) => d.status !== 'Paid');
  const totalDebtOwedUGX = activeDebts.reduce((acc, d) => acc + d.balanceOwedUGX, 0);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone) {
      alert('Please enter customer name and phone number.');
      return;
    }

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: custName,
      phone: custPhone,
      whatsapp: custPhone,
      totalPurchasesUGX: 0,
      amountOwedUGX: 0,
      notes: custNotes,
    };

    setCustomers((prev) => [newCust, ...prev]);
    setIsCustomerModalOpen(false);
    setCustName('');
    setCustPhone('');
  };

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtCustName || debtAmountUGX <= 0) {
      alert('Please enter customer name and valid debt balance in UGX.');
      return;
    }

    const newDebt: DebtRecord = {
      id: `debt-${Date.now()}`,
      customerId: `cust-gen-${Date.now()}`,
      customerName: debtCustName,
      customerPhone: debtCustPhone || profile.phone,
      initialAmountUGX: debtAmountUGX,
      balanceOwedUGX: debtAmountUGX,
      dueDate: debtDueDate,
      description: debtDescription || 'Goods purchased on credit',
      status: 'Active',
      partialPayments: [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    setDebts((prev) => [newDebt, ...prev]);
    setIsDebtModalOpen(false);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebt || payAmountUGX <= 0) return;

    const newBalance = Math.max(0, selectedDebt.balanceOwedUGX - payAmountUGX);
    const newStatus = newBalance === 0 ? 'Paid' : selectedDebt.status;

    const newPayment: DebtPayment = {
      id: `pay-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amountUGX: payAmountUGX,
      paymentMethod: payMethod,
      note: payNote,
    };

    setDebts((prev) =>
      prev.map((d) =>
        d.id === selectedDebt.id
          ? {
              ...d,
              balanceOwedUGX: newBalance,
              status: newStatus,
              partialPayments: [...d.partialPayments, newPayment],
            }
          : d
      )
    );

    setIsPaymentModalOpen(false);
    setSelectedDebt(null);
  };

  const generateWhatsAppReminderText = (debt: DebtRecord) => {
    return `Hello ${debt.customerName}, hope you are well.

This is a polite payment reminder from *${profile.name}* regarding your outstanding balance of *${formatUGX(
      debt.balanceOwedUGX
    )}* for ${debt.description} due on ${debt.dueDate}.

📲 *Payment Methods:*
• MTN / Airtel Mobile Money: ${profile.phone} (${profile.name})
• Cash payment at shop: ${profile.address}

Thank you for your business!`;
  };

  const openWhatsAppLink = (debt: DebtRecord) => {
    const text = generateWhatsAppReminderText(debt);
    const encoded = encodeURIComponent(text);
    const cleanPhone = debt.customerPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-16 md:pb-6">
      {/* Header Metric Card */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-950 to-slate-900 text-white p-5 rounded-2xl border border-amber-800/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
            Outstanding Customer Debts
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
            {formatUGX(totalDebtOwedUGX)}
          </div>
          <p className="text-xs text-amber-200 mt-1">
            {activeDebts.length} Customers owe balance. Send 1-click polite WhatsApp reminders.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsDebtModalOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-amber-950"
          >
            <Plus className="w-4 h-4" />
            <span>Record Customer Debt</span>
          </button>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('debts')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'debts'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Debts & Reminders ({debts.length})
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'customers'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Customer Directory ({customers.length})
          </button>
        </div>

        {activeTab === 'customers' && (
          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        )}
      </div>

      {/* Content */}
      {activeTab === 'debts' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {debts.map((debt) => (
            <div
              key={debt.id}
              className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between ${
                debt.status === 'Paid'
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : debt.status === 'Overdue'
                  ? 'border-rose-200 bg-rose-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      debt.status === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : debt.status === 'Overdue'
                        ? 'bg-rose-100 text-rose-800 animate-pulse'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {debt.status}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">Due: {debt.dueDate}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{debt.customerName}</h3>
                <p className="text-xs text-slate-600 mb-2 flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                  {debt.customerPhone}
                </p>

                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
                  {debt.description}
                </p>

                <div className="space-y-1 text-xs mb-4">
                  <div className="flex justify-between text-slate-500">
                    <span>Initial Credit:</span>
                    <span>{formatUGX(debt.initialAmountUGX)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-1">
                    <span>Balance Owed:</span>
                    <span className={debt.balanceOwedUGX > 0 ? 'text-amber-800' : 'text-emerald-700'}>
                      {formatUGX(debt.balanceOwedUGX)}
                    </span>
                  </div>
                </div>

                {/* Partial Payments History */}
                {debt.partialPayments.length > 0 && (
                  <div className="mb-3 text-[11px] bg-emerald-50/80 p-2 rounded-lg border border-emerald-100">
                    <span className="font-bold text-emerald-900 block mb-1">Payments Received:</span>
                    {debt.partialPayments.map((p) => (
                      <div key={p.id} className="flex justify-between text-emerald-800">
                        <span>{p.date} ({p.paymentMethod}):</span>
                        <span className="font-semibold">{formatUGX(p.amountUGX)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                {debt.balanceOwedUGX > 0 && (
                  <>
                    <button
                      onClick={() => openWhatsAppLink(debt)}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center space-x-1"
                      title="Send WhatsApp Reminder"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Reminder</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedDebt(debt);
                        setPayAmountUGX(debt.balanceOwedUGX);
                        setIsPaymentModalOpen(true);
                      }}
                      className="py-1.5 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold rounded-lg text-xs"
                    >
                      Pay Balance
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Phone / WhatsApp</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Amount Owed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                  <td className="py-3 px-4 text-slate-700">{c.phone}</td>
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{c.notes || '-'}</td>
                  <td className="py-3 px-4 text-right font-bold">
                    <span className={c.amountOwedUGX > 0 ? 'text-amber-800' : 'text-emerald-700'}>
                      {formatUGX(c.amountOwedUGX)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Debt Modal */}
      {isDebtModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Record Customer Debt</h2>
              <button
                onClick={() => setIsDebtModalOpen(false)}
                className="text-slate-400 font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddDebt} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={debtCustName}
                  onChange={(e) => setDebtCustName(e.target.value)}
                  placeholder="e.g. Kasule Emmanuel"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={debtCustPhone}
                  onChange={(e) => setDebtCustPhone(e.target.value)}
                  placeholder="+256 700 000000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount Owed (UGX) *
                  </label>
                  <input
                    type="number"
                    required
                    value={debtAmountUGX}
                    onChange={(e) => setDebtAmountUGX(Number(e.target.value))}
                    placeholder="e.g. 450000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={debtDueDate}
                    onChange={(e) => setDebtDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason / Items Owed For
                </label>
                <input
                  type="text"
                  value={debtDescription}
                  onChange={(e) => setDebtDescription(e.target.value)}
                  placeholder="e.g. Laptop repair screen replacement balance"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDebtModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-amber-950"
                >
                  Save Debt Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPaymentModalOpen && selectedDebt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-1">Record Payment</h2>
            <p className="text-xs text-slate-500 mb-4">
              Recording payment for {selectedDebt.customerName}. Current balance:{' '}
              <strong className="text-amber-800">{formatUGX(selectedDebt.balanceOwedUGX)}</strong>
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount Received (UGX) *
                </label>
                <input
                  type="number"
                  required
                  max={selectedDebt.balanceOwedUGX}
                  value={payAmountUGX}
                  onChange={(e) => setPayAmountUGX(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium"
                >
                  <option value="MTN Mobile Money">MTN Mobile Money</option>
                  <option value="Airtel Money">Airtel Money</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
              Add New Customer
            </h2>
            <form onSubmit={handleAddCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Sarah Akol"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  placeholder="+256 772 000000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes / Business Details
                </label>
                <input
                  type="text"
                  value={custNotes}
                  onChange={(e) => setCustNotes(e.target.value)}
                  placeholder="e.g. Freelance client or laptop buyer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
