/**
 * Client-side subscription state.
 * Payment approval is performed manually by MosesTech. The server validates
 * cryptographically signed activation codes bound to one browser device.
 */

export interface AccessStatus {
  isGranted: boolean;
  isTrial: boolean;
  isPaid: boolean;
  isLocked: boolean;
  planName: string;
  daysRemaining: number;
  hoursRemaining: number;
  statusMessage: string;
  expiresAt: Date | null;
}

export interface VerifiedAccess {
  accessToken: string;
  planName: string;
  expiresAt: string;
}

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export function getDeviceId(): string {
  const existing = localStorage.getItem('m_fix_device_id');
  if (existing) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem('m_fix_device_id', created);
  return created;
}

export function initializeTrialIfNeeded(): Date {
  const existingStart = localStorage.getItem('m_fix_trial_start');
  if (existingStart) return new Date(existingStart);

  const now = new Date();
  localStorage.setItem('m_fix_trial_start', now.toISOString());
  return now;
}

export function saveVerifiedAccess(access: VerifiedAccess): void {
  localStorage.setItem('m_fix_access_token', access.accessToken);
  localStorage.setItem('m_fix_paid_until', access.expiresAt);
  localStorage.setItem('m_fix_plan_name', access.planName);
}

export function getAccessToken(): string | null {
  return localStorage.getItem('m_fix_access_token');
}

export function clearExpiredPaidAccess(): void {
  localStorage.removeItem('m_fix_access_token');
  localStorage.removeItem('m_fix_paid_until');
  localStorage.removeItem('m_fix_plan_name');
}

export function getAccessStatus(): AccessStatus {
  const now = new Date();
  const paidUntilText = localStorage.getItem('m_fix_paid_until');
  const planName = localStorage.getItem('m_fix_plan_name') || 'Paid Plan';

  if (paidUntilText) {
    const paidUntil = new Date(paidUntilText);
    if (Number.isFinite(paidUntil.getTime()) && paidUntil > now) {
      const diffMs = paidUntil.getTime() - now.getTime();
      const daysRemaining = Math.floor(diffMs / 86_400_000);
      const hoursRemaining = Math.floor((diffMs % 86_400_000) / 3_600_000);
      return {
        isGranted: true,
        isTrial: false,
        isPaid: true,
        isLocked: false,
        planName,
        daysRemaining,
        hoursRemaining,
        statusMessage: `Active ${planName} (${daysRemaining}d ${hoursRemaining}h left)`,
        expiresAt: paidUntil,
      };
    }
    clearExpiredPaidAccess();
  }

  const trialStart = initializeTrialIfNeeded();
  const trialExpiry = new Date(trialStart.getTime() + THREE_DAYS_MS);
  if (now < trialExpiry) {
    const diffMs = trialExpiry.getTime() - now.getTime();
    const daysRemaining = Math.floor(diffMs / 86_400_000);
    const hoursRemaining = Math.floor((diffMs % 86_400_000) / 3_600_000);
    return {
      isGranted: true,
      isTrial: true,
      isPaid: false,
      isLocked: false,
      planName: '3-Day Free Trial',
      daysRemaining,
      hoursRemaining,
      statusMessage: `3-Day Free Trial Active (${daysRemaining}d ${hoursRemaining}h left)`,
      expiresAt: trialExpiry,
    };
  }

  return {
    isGranted: false,
    isTrial: false,
    isPaid: false,
    isLocked: true,
    planName: 'Trial Expired',
    daysRemaining: 0,
    hoursRemaining: 0,
    statusMessage: '3-Day Free Trial Expired — Payment Required',
    expiresAt: trialExpiry,
  };
}
