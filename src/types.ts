export type DeviceCategory =
  | 'Windows Laptop'
  | 'Desktop PC'
  | 'Printer & Scanner'
  | 'Wi-Fi & Router'
  | 'Android Phone'
  | 'CCTV & Security'
  | 'Projector & Conference Audio';

export type Manufacturer =
  | 'HP'
  | 'Dell'
  | 'Lenovo'
  | 'Asus'
  | 'Acer'
  | 'Apple'
  | 'Samsung'
  | 'Epson'
  | 'Canon'
  | 'TP-Link'
  | 'D-Link'
  | 'Hikvision'
  | 'Generic / Other';

export type SafetyLevel = 'Green' | 'Amber' | 'Red';

export interface TroubleshootingStep {
  stepNumber: number;
  instruction: string;
  explanation: string;
  safetyLevel: SafetyLevel;
  warningText?: string;
  expectedResult?: string;
}

export type RepairBookingType = 'Remote Support' | 'Onsite Technician Visit' | 'Shop Repair Drop-off';

export interface CaseTicket {
  id: string;
  ticketNumber: string; // e.g. MTF-2026-101
  customerName: string;
  customerPhone: string;
  location: string;
  deviceCategory: DeviceCategory;
  manufacturer: string;
  model: string;
  symptoms: string;
  errorCodes?: string;
  attemptedSteps: string[];
  safetyLevel: SafetyLevel;
  bookingType?: RepairBookingType;
  estimatedFeeUGX?: number;
  status: 'Diagnosing' | 'Awaiting Technician' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
  imageUrls?: string[];
  technicianNotes?: string;
  notes?: string;
  assignedTech?: string;
  organizationName?: string; // For Schools, NGOs, Offices
}

export interface TechSolution {
  id: string;
  deviceCategory: DeviceCategory;
  problemTitle: string;
  symptomKeywords: string[];
  commonCauses: string[];
  safeSteps: string[];
  amberSteps: string[];
  redFlags: string[];
  estimatedFixTime: string;
  estimatedCostUGX: string;
  officialSourceUrl?: string; // Microsoft Support, HP Support, etc.
}

export type BusinessCategory =
  | 'IT Technician & Computer Repairs'
  | 'IT Technician & Repairs'
  | 'Computer & Phone Shop'
  | 'Website Developer & Freelancer'
  | 'School & Educational Helpdesk'
  | 'Salon & Barbershop'
  | 'Retail Shop & Supermarket'
  | 'Tour & Travel Company'
  | 'Small NGO & Community Org'
  | 'General Small Business';

export type UserRole = 'Technician' | 'Owner' | 'Manager' | 'Helpdesk Agent';

export interface BusinessProfile {
  name: string;
  logoUrl?: string;
  phone: string;
  whatsapp: string;
  secondaryWhatsapp?: string;
  website?: string;
  email: string;
  address: string;
  tin?: string;
  currency: string; // "UGX"
  category: BusinessCategory;
  ownerName: string;
  activeRole: UserRole;
  efrisRegistered?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  totalPurchasesUGX: number;
  amountOwedUGX: number;
  lastPurchaseDate?: string;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unitPriceUGX: number;
  costPriceUGX: number;
  stockQuantity: number;
  minStockThreshold: number;
}

export interface DocumentItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceUGX: number;
  totalUGX: number;
}

export type DocumentType = 'quotation' | 'invoice';
export type DocumentStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Paid' | 'Unpaid' | 'Overdue';

export interface BusinessDocument {
  id: string;
  docType: DocumentType;
  docNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerWhatsApp?: string;
  date: string;
  dueDate: string;
  items: DocumentItem[];
  subtotalUGX: number;
  discountUGX: number;
  includeVAT: boolean; // 18% URA VAT
  vatAmountUGX: number;
  totalUGX: number;
  status: DocumentStatus;
  notes?: string;
  paymentTerms?: string;
}

export type PaymentMethod = 'Cash' | 'MTN Mobile Money' | 'Airtel Money' | 'Bank';

export interface SaleItem {
  productId?: string;
  description: string;
  quantity: number;
  unitPriceUGX: number;
  totalUGX: number;
}

export interface Sale {
  id: string;
  date: string;
  customerId?: string;
  customerName: string;
  items: SaleItem[];
  totalAmountUGX: number;
  paymentMethod: PaymentMethod;
  receiptImage?: string;
  notes?: string;
  cashierName?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: 'Rent' | 'Utilities & Power' | 'Transport' | 'Stock Purchase' | 'Airtime & Internet' | 'Salaries' | 'Taxes & Permits' | 'Other';
  description: string;
  amountUGX: number;
  paymentMethod: PaymentMethod;
  receiptImage?: string;
  recipient?: string;
}

export interface DebtPayment {
  id: string;
  date: string;
  amountUGX: number;
  paymentMethod: PaymentMethod;
  note?: string;
}

export interface DebtRecord {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  initialAmountUGX: number;
  balanceOwedUGX: number;
  dueDate: string;
  description: string;
  status: 'Active' | 'Paid' | 'Overdue';
  partialPayments: DebtPayment[];
  createdAt: string;
}

export interface KnowledgeSource {
  id: string;
  title: string;
  organization: 'Microsoft Support' | 'HP Support' | 'Dell Support' | 'Lenovo Support' | 'Google Android' | 'MosesTech Approved Guide';
  link: string;
  pubDate: string;
  lastChecked: string;
  summary: string;
  applicableCategory: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  imageUrl?: string;
  safetyLevel?: SafetyLevel;
  grounding?: {
    webSources?: { title: string; uri: string }[];
    mapSources?: { title: string; uri: string }[];
    searchQueries?: string[];
  };
  structuredAction?: {
    actionType:
      | 'TROUBLESHOOT_STEP'
      | 'BOOK_TECHNICIAN'
      | 'CREATE_QUOTATION'
      | 'CREATE_INVOICE'
      | 'RECORD_SALE'
      | 'RECORD_EXPENSE'
      | 'DEBT_REMINDER'
      | 'ADVICE';
    data?: any;
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyUGX: number;
  periodText?: string;
  aiRequestLimit: number | string;
  features: string[];
  isPopular?: boolean;
  badge?: string;
}

