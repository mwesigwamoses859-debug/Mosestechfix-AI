import React, { useState } from 'react';
import { Expense, PaymentMethod, Sale } from '../types';
import { formatUGX, calculateFinancialSummary } from '../utils/calculator';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Download,
  Search,
  Filter,
  DollarSign,
  Smartphone,
  Wallet,
  Building2,
  Trash2,
} from 'lucide-react';

interface SalesExpensesTrackerProps {
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  isQuickSaleOpen?: boolean;
}

export const SalesExpensesTracker: React.FC<SalesExpensesTrackerProps> = ({
  sales,
  setSales,
  expenses,
  setExpenses,
  isQuickSaleOpen = false,
}) => {
  const [activeTab, setActiveTab] = useState<'sales' | 'expenses'>('sales');
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(isQuickSaleOpen);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sale Form State
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [itemDescription, setItemDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPriceUGX, setUnitPriceUGX] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MTN Mobile Money');
  const [notes, setNotes] = useState('');

  // Expense Form State
  const [expCategory, setExpCategory] = useState<Expense['category']>('Utilities & Power');
  const [expDescription, setExpDescription] = useState('');
  const [expAmountUGX, setExpAmountUGX] = useState(0);
  const [expPaymentMethod, setExpPaymentMethod] = useState<PaymentMethod>('Cash');
  const [expRecipient, setExpRecipient] = useState('');

  const fin = calculateFinancialSummary(sales, expenses);

  const handleRecordSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemDescription || unitPriceUGX <= 0) {
      alert('Please enter item description and valid price in UGX.');
      return;
    }

    const total = quantity * unitPriceUGX;
    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      customerName: customerName || 'Walk-in Customer',
      items: [
        {
          description: itemDescription,
          quantity,
          unitPriceUGX,
          totalUGX: total,
        },
      ],
      totalAmountUGX: total,
      paymentMethod,
      notes,
    };

    setSales((prev) => [newSale, ...prev]);
    setIsSaleModalOpen(false);
    setItemDescription('');
    setUnitPriceUGX(0);
  };

  const handleRecordExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDescription || expAmountUGX <= 0) {
      alert('Please enter expense description and valid amount.');
      return;
    }

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category: expCategory,
      description: expDescription,
      amountUGX: expAmountUGX,
      paymentMethod: expPaymentMethod,
      recipient: expRecipient,
    };

    setExpenses((prev) => [newExpense, ...prev]);
    setIsExpenseModalOpen(false);
    setExpDescription('');
    setExpAmountUGX(0);
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeTab === 'sales') {
      csvContent += 'Date,Customer,Items,Payment Method,Total (UGX)\n';
      sales.forEach((s) => {
        const itemDesc = s.items.map((i) => i.description).join(';');
        csvContent += `"${s.date}","${s.customerName}","${itemDesc}","${s.paymentMethod}",${s.totalAmountUGX}\n`;
      });
    } else {
      csvContent += 'Date,Category,Description,Payment Method,Recipient,Amount (UGX)\n';
      expenses.forEach((e) => {
        csvContent += `"${e.date}","${e.category}","${e.description}","${e.paymentMethod}","${e.recipient || ''}",${e.amountUGX}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MosesTech_${activeTab}_records.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16 md:pb-6">
      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Sales Today</span>
            <div className="text-lg font-bold text-slate-900">{formatUGX(fin.totalSalesUGX)}</div>
            <span className="text-[11px] text-emerald-600 font-medium">
              MoMo: {formatUGX(fin.mobileMoneySalesUGX)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Expenses</span>
            <div className="text-lg font-bold text-slate-900">{formatUGX(fin.totalExpensesUGX)}</div>
            <span className="text-[11px] text-slate-500">{expenses.length} Entries recorded</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Net Profit Estimate</span>
            <div
              className={`text-lg font-bold ${
                fin.estimatedProfitUGX >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {formatUGX(fin.estimatedProfitUGX)}
            </div>
            <span className="text-[11px] text-slate-500">Sales minus Expenses</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigation Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'sales'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sales Transactions ({sales.length})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'expenses'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Expense Entries ({expenses.length})
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {activeTab === 'sales' ? (
            <button
              onClick={() => setIsSaleModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-emerald-900/20"
            >
              <Plus className="w-4 h-4" />
              <span>Record Sale</span>
            </button>
          ) : (
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-rose-900/20"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === 'sales' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items / Details</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-right">Amount (UGX)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{s.date}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{s.customerName}</td>
                    <td className="py-3 px-4 text-slate-700">
                      {s.items.map((i) => `${i.quantity}x ${i.description}`).join(', ')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          s.paymentMethod.includes('Mobile Money')
                            ? 'bg-amber-100 text-amber-800'
                            : s.paymentMethod === 'Cash'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatUGX(s.totalAmountUGX)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Paid To</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-right">Amount (UGX)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{e.date}</td>
                    <td className="py-3 px-4 font-semibold text-rose-700">{e.category}</td>
                    <td className="py-3 px-4 text-slate-800">{e.description}</td>
                    <td className="py-3 px-4 text-slate-600">{e.recipient || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-semibold">
                        {e.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-rose-700">
                      {formatUGX(e.amountUGX)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Sale Modal */}
      {isSaleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Record New Sale</h2>
              <button
                onClick={() => setIsSaleModalOpen(false)}
                className="text-slate-400 font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRecordSale} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Walk-in or Customer Name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Item Description *
                </label>
                <input
                  type="text"
                  required
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="e.g. Samsung Fast Charger or Laptop Screen"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unit Price (UGX) *
                  </label>
                  <input
                    type="number"
                    required
                    value={unitPriceUGX}
                    onChange={(e) => setUnitPriceUGX(Number(e.target.value))}
                    placeholder="e.g. 85000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium"
                >
                  <option value="MTN Mobile Money">MTN Mobile Money</option>
                  <option value="Airtel Money">Airtel Money</option>
                  <option value="Cash">Cash Payment</option>
                  <option value="Bank">Bank Transfer</option>
                </select>
              </div>

              <div className="bg-slate-900 text-white p-3 rounded-xl flex justify-between items-center text-xs">
                <span>Total Sale Value:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {formatUGX(quantity * unitPriceUGX)}
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaleModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-emerald-900/30"
                >
                  Save Sale Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Record Business Expense</h2>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-slate-400 font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRecordExpense} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as Expense['category'])}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                >
                  <option value="Rent">Shop Rent</option>
                  <option value="Utilities & Power">Utilities (Umeme Yaka / Water)</option>
                  <option value="Transport">Transport & Freight</option>
                  <option value="Stock Purchase">Stock Purchase</option>
                  <option value="Airtime & Internet">Airtime & Data Bundles</option>
                  <option value="Salaries">Staff Salary / Wage</option>
                  <option value="Taxes & Permits">Trading Licence & Taxes</option>
                  <option value="Other">Other Expenses</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  placeholder="e.g. Yaka power tokens or shop rent deposit"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount (UGX) *
                </label>
                <input
                  type="number"
                  required
                  value={expAmountUGX}
                  onChange={(e) => setExpAmountUGX(Number(e.target.value))}
                  placeholder="e.g. 50000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={expPaymentMethod}
                  onChange={(e) => setExpPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium"
                >
                  <option value="Cash">Cash</option>
                  <option value="MTN Mobile Money">MTN Mobile Money</option>
                  <option value="Airtel Money">Airtel Money</option>
                  <option value="Bank">Bank Transfer</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-rose-900/30"
                >
                  Save Expense Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
