/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BusinessProfile,
  Customer,
  Product,
  BusinessDocument,
  Sale,
  Expense,
  DebtRecord,
  ChatMessage,
  UserRole,
  CaseTicket,
} from './types';
import {
  INITIAL_BUSINESS_PROFILE,
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  INITIAL_DOCUMENTS,
  INITIAL_SALES,
  INITIAL_EXPENSES,
  INITIAL_DEBTS,
  OFFICIAL_TECH_KNOWLEDGE,
  INITIAL_CASE_TICKETS,
  INITIAL_TECH_SOLUTIONS as TECH_SOLUTIONS_UGANDA,
} from './data/initialData';

import { formatUGX } from './utils/calculator';
import { generateDocumentPDF, generateWhatsAppShareLink } from './utils/pdfGenerator';
import { Download, Share2, X, Building2, Phone } from 'lucide-react';

import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Dashboard } from './components/Dashboard';
import { FixAITroubleshooter } from './components/FixAITroubleshooter';
import { RepairTicketManager } from './components/RepairTicketManager';
import { QuotationInvoiceManager } from './components/QuotationInvoiceManager';
import { SalesExpensesTracker } from './components/SalesExpensesTracker';
import { CustomersDebtsManager } from './components/CustomersDebtsManager';
import { ProductsCatalog } from './components/ProductsCatalog';
import { KnowledgeBaseModal } from './components/KnowledgeBaseModal';
import { BusinessSettings } from './components/BusinessSettings';
import { SubscriptionModal } from './components/SubscriptionModal';
import { WebsiteEmbedModal } from './components/WebsiteEmbedModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('assistant');
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [aiRequestCount, setAiRequestCount] = useState(14);
  const [sharedDoc, setSharedDoc] = useState<BusinessDocument | null>(null);

  // Persistent States
  const [profile, setProfile] = useState<BusinessProfile>(() => {
    const saved = localStorage.getItem('m_fix_profile');
    return saved ? JSON.parse(saved) : INITIAL_BUSINESS_PROFILE;
  });

  const [tickets, setTickets] = useState<CaseTicket[]>(() => {
    const saved = localStorage.getItem('m_fix_tickets');
    return saved ? JSON.parse(saved) : INITIAL_CASE_TICKETS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('m_biz_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('m_biz_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [documents, setDocuments] = useState<BusinessDocument[]>(() => {
    const saved = localStorage.getItem('m_biz_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('m_biz_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('m_biz_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [debts, setDebts] = useState<DebtRecord[]>(() => {
    const saved = localStorage.getItem('m_biz_debts');
    return saved ? JSON.parse(saved) : INITIAL_DEBTS;
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${profile.ownerName}! Welcome to MosesTech Fix AI. I am your 1-step IT diagnostic assistant for laptops, desktops, printers, and Wi-Fi networks in Uganda. How can I help you troubleshoot or diagnose your computer problem today?`,
      safetyLevel: 'Green',
      timestamp: 'Just now',
    },
  ]);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('m_fix_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('m_fix_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('m_biz_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('m_biz_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('m_biz_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('m_biz_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('m_biz_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('m_biz_debts', JSON.stringify(debts));
  }, [debts]);

  // Handle URL Document Shared View (?doc=DOC_ID)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const docId = params.get('doc');
    if (docId && documents.length > 0) {
      const match = documents.find((d) => d.id === docId || d.docNumber === docId);
      if (match) {
        setSharedDoc(match);
      }
    }
  }, [documents]);

  const handleRoleChange = (role: UserRole) => {
    setProfile((prev) => ({ ...prev, activeRole: role }));
  };

  const handleResetDemoData = () => {
    if (confirm('Reset all repair records and restore initial MosesTech Fix AI sample data?')) {
      setProfile(INITIAL_BUSINESS_PROFILE);
      setTickets(INITIAL_CASE_TICKETS);
      setCustomers(INITIAL_CUSTOMERS);
      setProducts(INITIAL_PRODUCTS);
      setDocuments(INITIAL_DOCUMENTS);
      setSales(INITIAL_SALES);
      setExpenses(INITIAL_EXPENSES);
      setDebts(INITIAL_DEBTS);
      localStorage.clear();
      alert('MosesTech Fix AI demo data restored successfully!');
    }
  };

  const handleQuickPromptAI = (promptText: string) => {
    setActiveTab('assistant');
  };

  const handleExecuteAIAction = (actionType: string, data: any) => {
    if (actionType === 'BOOK_TECHNICIAN') {
      setActiveTab('tickets');
    } else if (actionType === 'CREATE_QUOTATION' || actionType === 'CREATE_INVOICE') {
      setActiveTab('documents');
    } else if (actionType === 'RECORD_SALE') {
      if (data && data.totalAmountUGX) {
        const newSale: Sale = {
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          customerName: data.customerName || 'Walk-in Customer',
          items: data.items || [{ description: data.description || 'Repair Service / Spare Part', quantity: 1, unitPriceUGX: data.totalAmountUGX, totalUGX: data.totalAmountUGX }],
          totalAmountUGX: data.totalAmountUGX,
          paymentMethod: data.paymentMethod || 'Cash',
          cashierName: profile.ownerName,
        };
        setSales((prev) => [newSale, ...prev]);
        alert(`Recorded UGX ${data.totalAmountUGX.toLocaleString()} repair payment for ${newSale.customerName}!`);
      }
      setActiveTab('sales');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Header Navbar */}
      <Navbar
        profile={profile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenKnowledge={() => setIsKnowledgeOpen(true)}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        onOpenEmbedModal={() => setIsEmbedModalOpen(true)}
        onRoleChange={handleRoleChange}
        aiRequestCount={aiRequestCount}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-24 md:pb-6">
        {activeTab === 'assistant' && (
          <FixAITroubleshooter
            profile={profile}
            messages={messages}
            setMessages={setMessages}
            tickets={tickets}
            setTickets={setTickets}
            incrementAiUsage={() => setAiRequestCount((prev) => prev + 1)}
            onOpenSubscriptionModal={() => setIsSubscriptionOpen(true)}
          />
        )}

        {activeTab === 'tickets' && (
          <RepairTicketManager
            tickets={tickets}
            setTickets={setTickets}
            onNewTicketClick={() => setActiveTab('assistant')}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            profile={profile}
            sales={sales}
            expenses={expenses}
            debts={debts}
            documents={documents}
            products={products}
            setActiveTab={setActiveTab}
            onOpenQuickSale={() => setActiveTab('sales')}
            onOpenQuickQuotation={() => setActiveTab('documents')}
            onQuickPromptAI={handleQuickPromptAI}
          />
        )}

        {activeTab === 'documents' && (
          <QuotationInvoiceManager
            profile={profile}
            documents={documents}
            setDocuments={setDocuments}
            customers={customers}
          />
        )}

        {activeTab === 'sales' && (
          <SalesExpensesTracker
            sales={sales}
            setSales={setSales}
            expenses={expenses}
            setExpenses={setExpenses}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersDebtsManager
            profile={profile}
            customers={customers}
            setCustomers={setCustomers}
            debts={debts}
            setDebts={setDebts}
          />
        )}

        {activeTab === 'products' && (
          <ProductsCatalog products={products} setProducts={setProducts} />
        )}

        {activeTab === 'settings' && (
          <BusinessSettings
            profile={profile}
            setProfile={setProfile}
            onResetDemoData={handleResetDemoData}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickAddSale={() => setActiveTab('assistant')}
      />

      {/* Modals */}
      <KnowledgeBaseModal
        sources={OFFICIAL_TECH_KNOWLEDGE}
        techSolutions={TECH_SOLUTIONS_UGANDA}
        isOpen={isKnowledgeOpen}
        onClose={() => setIsKnowledgeOpen(false)}
      />

      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        aiRequestCount={aiRequestCount}
      />

      <WebsiteEmbedModal
        isOpen={isEmbedModalOpen}
        onClose={() => setIsEmbedModalOpen(false)}
      />

      {/* Shared Online Document View Modal */}
      {sharedDoc && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Top Header */}
            <div className="bg-emerald-900 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Building2 className="w-6 h-6 text-emerald-400" />
                <div>
                  <h2 className="font-bold text-base text-white">{profile.name}</h2>
                  <p className="text-xs text-emerald-300">Official Document View</p>
                </div>
              </div>
              <button
                onClick={() => setSharedDoc(null)}
                className="p-1 hover:bg-emerald-800 rounded-lg text-emerald-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Details */}
            <div className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md">
                    OFFICIAL {sharedDoc.docType.toUpperCase()}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">{sharedDoc.docNumber}</h3>
                  <p className="text-xs text-slate-500">
                    Client: <span className="font-semibold text-slate-800">{sharedDoc.customerName}</span> ({sharedDoc.customerPhone})
                  </p>
                </div>
                <div className="text-left sm:text-right text-xs text-slate-500 space-y-0.5">
                  <p><span className="font-medium text-slate-700">Issue Date:</span> {sharedDoc.date}</p>
                  <p><span className="font-medium text-slate-700">Due Date:</span> {sharedDoc.dueDate}</p>
                  <p><span className="font-medium text-slate-700">Status:</span> <span className="font-bold text-emerald-700">{sharedDoc.status}</span></p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="p-3">Item Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price (UGX)</th>
                      <th className="p-3 text-right">Total (UGX)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sharedDoc.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-medium text-slate-800">{item.description}</td>
                        <td className="p-3 text-center font-semibold text-slate-600">{item.quantity}</td>
                        <td className="p-3 text-right font-mono text-slate-700">{formatUGX(item.unitPriceUGX)}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">{formatUGX(item.totalUGX)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals */}
              <div className="flex justify-end">
                <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatUGX(sharedDoc.subtotalUGX)}</span>
                  </div>
                  {sharedDoc.discountUGX > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Discount:</span>
                      <span className="font-mono">-{formatUGX(sharedDoc.discountUGX)}</span>
                    </div>
                  )}
                  {sharedDoc.includeVAT && (
                    <div className="flex justify-between text-slate-600">
                      <span>VAT (18%):</span>
                      <span className="font-mono">{formatUGX(sharedDoc.vatAmountUGX)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
                    <span>Total Amount (UGX):</span>
                    <span className="font-mono text-emerald-700">{formatUGX(sharedDoc.totalUGX)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  Payment Instructions (Mobile Money):
                </p>
                <p>Send payment to MTN / Airtel Mobile Money: <strong>{profile.phone}</strong> ({profile.name})</p>
                {sharedDoc.paymentTerms && <p className="text-slate-600 italic mt-1">• {sharedDoc.paymentTerms}</p>}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => generateDocumentPDF(sharedDoc, profile)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>

                <a
                  href={generateWhatsAppShareLink(sharedDoc, profile)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
