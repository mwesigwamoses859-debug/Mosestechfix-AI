import { PaidSubscriber } from '../types';

export const INITIAL_PAID_SUBSCRIBERS: PaidSubscriber[] = [
  {
    id: 'sub-001',
    customerName: 'Kagimu Ronald',
    customerPhone: '+256 702 443322',
    planId: 'monthly_full',
    planName: 'Advanced Pro ($7/mo)',
    amountUGX: 26000,
    amountUSD: 7,
    paymentMethod: 'MTN MoMoPay (Merchant 551052)',
    transactionReference: 'MTN-MM-892185',
    deviceId: 'dev-kagimu-hp-elitebook',
    status: 'Active',
    subscribedAt: '2026-07-20 10:14',
    expiresAt: '2026-08-20 10:14',
    activationCode: 'MTF-PRO-9842-8819',
    notes: 'Paid via MTN MoMoPay Merchant 551052 for HP motherboard diagnostics & unlimited AI scans.',
  },
  {
    id: 'sub-002',
    customerName: 'Ainomugisha Grace (Hilltop Academy)',
    customerPhone: '+256 782 119988',
    planId: 'business_it',
    planName: 'Small Business IT Care',
    amountUGX: 95000,
    amountUSD: 27,
    paymentMethod: 'Airtel Money',
    transactionReference: 'AIRTEL-UG-98412',
    deviceId: 'dev-hilltop-lab-desk01',
    status: 'Active',
    subscribedAt: '2026-07-15 14:30',
    expiresAt: '2026-08-15 14:30',
    activationCode: 'MTF-BIZ-5501-7732',
    notes: 'School computer lab care package (10 computers covered).',
  },
  {
    id: 'sub-003',
    customerName: 'David Ssempijja',
    customerPhone: '+256 772 304918',
    planId: 'monthly_full',
    planName: 'Advanced Pro ($7/mo)',
    amountUGX: 26000,
    amountUSD: 7,
    paymentMethod: 'Stripe / Card',
    transactionReference: 'ch_3Oqk12A459bZZ1',
    deviceId: 'dev-ssempijja-macbook',
    status: 'Active',
    subscribedAt: '2026-07-22 08:45',
    expiresAt: '2026-08-22 08:45',
    activationCode: 'MTF-PRO-4412-9901',
    notes: 'International debit card recurring subscription.',
  },
  {
    id: 'sub-004',
    customerName: 'Nakitto Brenda',
    customerPhone: '+256 754 887766',
    planId: 'weekly_access',
    planName: 'Weekly Pass (UGX 12,000)',
    amountUGX: 12000,
    amountUSD: 3.5,
    paymentMethod: 'MTN MoMoPay (Merchant 551052)',
    transactionReference: 'MTN-MM-310492',
    deviceId: 'dev-nakitto-epson-print',
    status: 'Expiring Soon',
    subscribedAt: '2026-07-18 16:20',
    expiresAt: '2026-07-25 16:20',
    activationCode: 'MTF-WK-8821-3310',
    notes: 'Printer & scanner diagnostic priority pass via Merchant 551052.',
  },
  {
    id: 'sub-005',
    customerName: 'Brian Tumukunde',
    customerPhone: '+256 701 554433',
    planId: 'remote_pass',
    planName: 'Remote Tech Pass',
    amountUGX: 35000,
    amountUSD: 10,
    paymentMethod: 'MTN MoMoPay (Merchant 551052)',
    transactionReference: 'MTN-MM-772109',
    deviceId: 'dev-tumukunde-dell-pc',
    status: 'Active',
    subscribedAt: '2026-07-21 11:00',
    expiresAt: '2026-08-21 11:00',
    activationCode: 'MTF-REM-6623-1144',
    notes: 'Includes one AnyDesk remote repair session for Blue Screen crash.',
  },
  {
    id: 'sub-006',
    customerName: 'Sarah Namagembe',
    customerPhone: '+256 788 998877',
    planId: 'monthly_full',
    planName: 'Advanced Pro ($7/mo)',
    amountUGX: 26000,
    amountUSD: 7,
    paymentMethod: 'Airtel Money',
    transactionReference: 'AIRTEL-UG-55214',
    deviceId: 'dev-namagembe-lenovo',
    status: 'Active',
    subscribedAt: '2026-07-23 15:10',
    expiresAt: '2026-08-23 15:10',
    activationCode: 'MTF-PRO-1029-4477',
    notes: 'Lenovo ThinkPad keyboard & Wi-Fi diagnostics.',
  },
  {
    id: 'sub-007',
    customerName: 'Dr. Mukasa Edward',
    customerPhone: '+256 704 661122',
    planId: 'business_it',
    planName: 'Small Business IT Care',
    amountUGX: 95000,
    amountUSD: 27,
    paymentMethod: 'MTN MoMoPay (Merchant 551052)',
    transactionReference: 'MTN-MM-991204',
    deviceId: 'dev-clinic-ntinda-lan',
    status: 'Active',
    subscribedAt: '2026-07-10 09:00',
    expiresAt: '2026-08-10 09:00',
    activationCode: 'MTF-BIZ-3329-8811',
    notes: 'Clinic office network and patient records printer support via Merchant 551052.',
  },
  {
    id: 'sub-008',
    customerName: 'John Baptist Otim',
    customerPhone: '+256 779 123987',
    planId: 'monthly_full',
    planName: 'Advanced Pro ($7/mo)',
    amountUGX: 26000,
    amountUSD: 7,
    paymentMethod: 'Stripe / Card',
    transactionReference: 'ch_3Paa98B541xTT8',
    deviceId: 'dev-otim-dell-precision',
    status: 'Active',
    subscribedAt: '2026-07-24 13:40',
    expiresAt: '2026-08-24 13:40',
    activationCode: 'MTF-PRO-7711-2289',
    notes: 'Graphics workstation AutoCAD & thermal throttle optimization.',
  },
];

const STORAGE_KEY = 'm_fix_paid_subscribers';

export function getPaidSubscribers(): PaidSubscriber[] {
  if (typeof window === 'undefined') return INITIAL_PAID_SUBSCRIBERS;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PAID_SUBSCRIBERS));
    return INITIAL_PAID_SUBSCRIBERS;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return INITIAL_PAID_SUBSCRIBERS;
  }
}

export function savePaidSubscribers(subscribers: PaidSubscriber[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subscribers));
}

export function addPaidSubscriber(
  newSub: Omit<PaidSubscriber, 'id' | 'subscribedAt' | 'status'>
): PaidSubscriber {
  const subscribers = getPaidSubscribers();
  const created: PaidSubscriber = {
    ...newSub,
    id: `sub-${Date.now()}`,
    subscribedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    status: 'Active',
  };
  const updated = [created, ...subscribers];
  savePaidSubscribers(updated);
  return created;
}

export function getSubscriberStats(subscribers?: PaidSubscriber[]) {
  const list = subscribers || getPaidSubscribers();
  const totalCount = list.length;
  const activeCount = list.filter((s) => s.status === 'Active').length;
  const expiringCount = list.filter((s) => s.status === 'Expiring Soon').length;
  const totalRevenueUGX = list.reduce((sum, s) => sum + (s.amountUGX || 0), 0);
  const totalRevenueUSD = list.reduce((sum, s) => sum + (s.amountUSD || Math.round((s.amountUGX || 0) / 3700)), 0);

  const mtnSubscribers = list.filter(
    (s) =>
      s.paymentMethod === 'MTN MoMoPay (Merchant 551052)' ||
      s.paymentMethod === 'MTN Mobile Money'
  );
  const airtelSubscribers = list.filter((s) => s.paymentMethod === 'Airtel Money');
  const cardSubscribers = list.filter((s) => s.paymentMethod === 'Stripe / Card');

  return {
    totalCount,
    activeCount,
    expiringCount,
    totalRevenueUGX,
    totalRevenueUSD,
    mtnCount: mtnSubscribers.length,
    mtnRevenueUGX: mtnSubscribers.reduce((sum, s) => sum + s.amountUGX, 0),
    airtelCount: airtelSubscribers.length,
    airtelRevenueUGX: airtelSubscribers.reduce((sum, s) => sum + s.amountUGX, 0),
    cardCount: cardSubscribers.length,
    cardRevenueUSD: cardSubscribers.reduce((sum, s) => sum + (s.amountUSD || 7), 0),
  };
}
