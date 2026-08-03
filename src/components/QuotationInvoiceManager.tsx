import React, { useState } from 'react';
import {
  BusinessDocument,
  BusinessProfile,
  Customer,
  DocumentItem,
  DocumentType,
} from '../types';
import { formatUGX, calculateDocumentTotals } from '../utils/calculator';
import {
  generateDocumentPDF,
  generateWhatsAppShareLink,
  generateWhatsAppShareMessage,
  getDocumentShareUrl,
} from '../utils/pdfGenerator';
import {
  FileText,
  Plus,
  Download,
  Share2,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  ArrowRight,
  Trash2,
  Edit2,
  AlertCircle,
  Phone,
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

interface QuotationInvoiceManagerProps {
  profile: BusinessProfile;
  documents: BusinessDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<BusinessDocument[]>>;
  customers: Customer[];
  initialNewDocType?: DocumentType;
}

export const QuotationInvoiceManager: React.FC<QuotationInvoiceManagerProps> = ({
  profile,
  documents,
  setDocuments,
  customers,
  initialNewDocType,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'quotation' | 'invoice'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(!!initialNewDocType);

  // WhatsApp Share Modal State
  const [selectedShareDoc, setSelectedShareDoc] = useState<BusinessDocument | null>(null);
  const [customSharePhone, setCustomSharePhone] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Form State
  const [docType, setDocType] = useState<DocumentType>(initialNewDocType || 'quotation');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [includeVAT, setIncludeVAT] = useState(false);
  const [discountUGX, setDiscountUGX] = useState(0);
  const [paymentTerms, setPaymentTerms] = useState('Payment via MTN/Airtel Mobile Money or Cash.');
  const [notes, setNotes] = useState('Thank you for choosing our business.');

  const [items, setItems] = useState<DocumentItem[]>([
    {
      id: 'item-1',
      description: 'HP EliteBook 840 G5 Core i5 Laptop',
      quantity: 3,
      unitPriceUGX: 1800000,
      totalUGX: 5400000,
    },
  ]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: '',
        quantity: 1,
        unitPriceUGX: 0,
        totalUGX: 0,
      },
    ]);
  };

  const handleItemChange = (
    id: string,
    field: keyof DocumentItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPriceUGX') {
            updated.totalUGX = Number(updated.quantity) * Number(updated.unitPriceUGX);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSelectCustomer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cust = customers.find((c) => c.id === e.target.value);
    if (cust) {
      setCustomerName(cust.name);
      setCustomerPhone(cust.phone);
    }
  };

  const totals = calculateDocumentTotals(items, Number(discountUGX), includeVAT);

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || items.length === 0) {
      alert('Please enter customer name and at least one item.');
      return;
    }

    const docNumPrefix = docType === 'quotation' ? 'MT-QT-2026-' : 'MT-INV-2026-';
    const randomSeq = Math.floor(100 + Math.random() * 900);

    const newDoc: BusinessDocument = {
      id: `doc-${Date.now()}`,
      docType,
      docNumber: `${docNumPrefix}${randomSeq}`,
      customerId: `cust-gen-${Date.now()}`,
      customerName,
      customerPhone: customerPhone || profile.phone,
      date: new Date().toISOString().split('T')[0],
      dueDate,
      items,
      subtotalUGX: totals.subtotalUGX,
      discountUGX: totals.discountUGX,
      includeVAT,
      vatAmountUGX: totals.vatAmountUGX,
      totalUGX: totals.totalUGX,
      status: docType === 'quotation' ? 'Sent' : 'Unpaid',
      paymentTerms,
      notes,
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setIsModalOpen(false);
    
    // Automatically launch WhatsApp share modal for the newly created document
    setSelectedShareDoc(newDoc);
    setCustomSharePhone(newDoc.customerPhone || '');
  };

  const handleConvertQuotationToInvoice = (doc: BusinessDocument) => {
    const newInvoice: BusinessDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      docType: 'invoice',
      docNumber: doc.docNumber.replace('QT', 'INV'),
      status: 'Unpaid',
      date: new Date().toISOString().split('T')[0],
    };

    setDocuments((prev) => [newInvoice, ...prev]);
    alert(`Quotation ${doc.docNumber} successfully converted to Invoice ${newInvoice.docNumber}!`);
  };

  const handleStatusChange = (docId: string, status: any) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status } : d))
    );
  };

  const filteredDocs = documents.filter((d) => {
    const matchesType = filterType === 'all' || d.docType === filterType;
    const matchesQuery =
      d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.docNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  return (
    <div className="space-y-6 pb-16 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Quotations & Invoices
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Create professional documents with auto figures in UGX and send via WhatsApp or PDF.
          </p>
        </div>

        <button
          onClick={() => {
            setDocType('quotation');
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-emerald-900/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Document</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg w-full md:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Docs ({documents.length})
          </button>
          <button
            onClick={() => setFilterType('quotation')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filterType === 'quotation'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quotations ({documents.filter((d) => d.docType === 'quotation').length})
          </button>
          <button
            onClick={() => setFilterType('invoice')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filterType === 'invoice'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Invoices ({documents.filter((d) => d.docType === 'invoice').length})
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer or number..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Documents Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    doc.docType === 'quotation'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {doc.docType}
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                    doc.status === 'Paid' || doc.status === 'Accepted'
                      ? 'bg-emerald-100 text-emerald-800'
                      : doc.status === 'Unpaid' || doc.status === 'Overdue'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {doc.status}
                </span>
              </div>

              <div className="mb-3">
                <h3 className="font-bold text-slate-900 text-base">{doc.docNumber}</h3>
                <p className="text-xs font-semibold text-slate-700">{doc.customerName}</p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {doc.customerPhone}
                </p>
              </div>

              {/* Items Preview */}
              <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1 mb-4 border border-slate-100">
                {doc.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-slate-600">
                    <span className="truncate max-w-[170px]">
                      {i.quantity}x {i.description}
                    </span>
                    <span className="font-medium text-slate-900">{formatUGX(i.totalUGX)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-baseline mb-4 border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500">Total Amount:</span>
                <span className="text-base font-bold text-slate-900">{formatUGX(doc.totalUGX)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => generateDocumentPDF(doc, profile)}
                className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs flex items-center justify-center space-x-1"
                title="Download PDF"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>PDF</span>
              </button>

              <button
                onClick={() => {
                  setSelectedShareDoc(doc);
                  setCustomSharePhone(doc.customerPhone || '');
                }}
                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center space-x-1 shadow-sm transition-colors"
                title="Share via WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              {doc.docType === 'quotation' && (
                <button
                  onClick={() => handleConvertQuotationToInvoice(doc)}
                  className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold"
                  title="Convert to Invoice"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal to Create Document */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Create New {docType === 'quotation' ? 'Quotation' : 'Invoice'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4">
              {/* Type Switcher */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setDocType('quotation')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md ${
                    docType === 'quotation' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Quotation
                </button>
                <button
                  type="button"
                  onClick={() => setDocType('invoice')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md ${
                    docType === 'invoice' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Invoice
                </button>
              </div>

              {/* Customer Selector / Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Existing Customer
                  </label>
                  <select
                    onChange={handleSelectCustomer}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="">-- Or type new customer below --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
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
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+256 772 000000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Line Items
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item Line
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Item description..."
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(item.id, 'quantity', Number(e.target.value))
                        }
                        className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center text-slate-800"
                      />
                      <input
                        type="number"
                        placeholder="Price (UGX)"
                        value={item.unitPriceUGX}
                        onChange={(e) =>
                          handleItemChange(item.id, 'unitPriceUGX', Number(e.target.value))
                        }
                        className="w-28 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-right text-slate-800 font-mono"
                      />
                      <span className="w-28 text-right font-bold text-xs text-slate-900">
                        {formatUGX(item.totalUGX)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax & Discount Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="vatCheck"
                    checked={includeVAT}
                    onChange={(e) => setIncludeVAT(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                  />
                  <label htmlFor="vatCheck" className="text-xs font-semibold text-slate-700">
                    Include 18% URA VAT
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Discount Amount (UGX)
                  </label>
                  <input
                    type="number"
                    value={discountUGX}
                    onChange={(e) => setDiscountUGX(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono"
                  />
                </div>
              </div>

              {/* Totals Summary */}
              <div className="bg-slate-900 text-white p-3 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal:</span>
                  <span>{formatUGX(totals.subtotalUGX)}</span>
                </div>
                {includeVAT && (
                  <div className="flex justify-between text-slate-300">
                    <span>VAT (18%):</span>
                    <span>{formatUGX(totals.vatAmountUGX)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-emerald-400 pt-1 border-t border-slate-800">
                  <span>Grand Total (UGX):</span>
                  <span>{formatUGX(totals.totalUGX)}</span>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-emerald-900/30"
                >
                  Generate {docType === 'quotation' ? 'Quotation' : 'Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* WhatsApp Share Modal */}
      {selectedShareDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Share via WhatsApp</h3>
                  <p className="text-xs text-slate-500">
                    {selectedShareDoc.docType.toUpperCase()} #{selectedShareDoc.docNumber} • {selectedShareDoc.customerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedShareDoc(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
              >
                &times;
              </button>
            </div>

            {/* Target Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer WhatsApp Phone (Uganda)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={customSharePhone}
                  onChange={(e) => setCustomSharePhone(e.target.value)}
                  placeholder="+256 7XX XXX XXX"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
                />
              </div>
            </div>

            {/* Direct Document Link */}
            <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  Direct Document Link
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(getDocumentShareUrl(selectedShareDoc.id));
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                  {copiedLink ? 'Copied Link!' : 'Copy Link'}
                </button>
              </div>
              <div className="text-[11px] text-emerald-800 font-mono truncate bg-white/80 p-1.5 rounded border border-emerald-100 select-all">
                {getDocumentShareUrl(selectedShareDoc.id)}
              </div>
            </div>

            {/* Pre-filled Message Summary */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Pre-filled WhatsApp Message</label>
                <button
                  type="button"
                  onClick={() => {
                    const msg = generateWhatsAppShareMessage(
                      selectedShareDoc,
                      profile,
                      getDocumentShareUrl(selectedShareDoc.id)
                    );
                    navigator.clipboard.writeText(msg);
                    setCopiedMessage(true);
                    setTimeout(() => setCopiedMessage(false), 2000);
                  }}
                  className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200"
                >
                  {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  {copiedMessage ? 'Message Copied!' : 'Copy Text'}
                </button>
              </div>

              <textarea
                readOnly
                rows={8}
                value={generateWhatsAppShareMessage(
                  selectedShareDoc,
                  profile,
                  getDocumentShareUrl(selectedShareDoc.id)
                )}
                className="w-full text-[11px] font-mono bg-slate-900 text-emerald-400 p-3 rounded-xl border border-slate-800 focus:outline-none resize-none leading-relaxed select-all"
              />
            </div>

            {/* Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <a
                href={generateWhatsAppShareLink(
                  { ...selectedShareDoc, customerPhone: customSharePhone },
                  profile,
                  getDocumentShareUrl(selectedShareDoc.id)
                )}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md shadow-emerald-900/20 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open in WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
              <button
                type="button"
                onClick={() => setSelectedShareDoc(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
