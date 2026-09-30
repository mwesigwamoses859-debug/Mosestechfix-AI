/**
 * Client-side subscription and token state manager.
 * Supports:
 * 1. Free Starter Tokens (5 Free Deep Hardware Diagnostic Credits)
 * 2. Unlimited Easy / Quick Questions (Always Free for everyone)
 * 3. Deep Hardware & Error Code Analysis (Consumes 1 token, or Unlimited on $7 USD / UGX 26,000 Pro Plan)
 * 4. Automatic notification when tokens are depleted with 1-click WhatsApp escalation
 */

export interface AccessStatus {
  isGranted: boolean;
  isTrial: boolean;
  isPaid: boolean;
  isLocked: boolean; // True only if tokens == 0 and user attempts deep scan without active sub
  planName: string;
  tokensRemaining: number;
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

const INITIAL_FREE_TOKENS = 5;

export function getDeviceId(): string {
  const existing = localStorage.getItem('m_fix_device_id');
  if (existing) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem('m_fix_device_id', created);
  return created;
}

export function saveVerifiedAccess(access: VerifiedAccess): void {
  localStorage.setItem('m_fix_access_token', access.accessToken);
  localStorage.setItem('m_fix_paid_until', access.expiresAt);
  localStorage.setItem('m_fix_plan_name', access.planName);
  // Give bonus tokens upon payment
  localStorage.setItem('m_fix_tokens', '9999');
}

export function getAccessToken(): string | null {
  return localStorage.getItem('m_fix_access_token');
}

export function clearExpiredPaidAccess(): void {
  localStorage.removeItem('m_fix_access_token');
  localStorage.removeItem('m_fix_paid_until');
  localStorage.removeItem('m_fix_plan_name');
}

export function isPaidSubscriber(): boolean {
  const paidUntilText = localStorage.getItem('m_fix_paid_until');
  if (!paidUntilText) return false;
  const paidUntil = new Date(paidUntilText);
  return Number.isFinite(paidUntil.getTime()) && paidUntil > new Date();
}

/**
 * Returns remaining diagnostic tokens.
 * Paid subscribers receive unlimited (9999).
 * Free users default to 5 tokens.
 */
export function getTokensRemaining(): number {
  if (isPaidSubscriber()) return 9999;
  const saved = localStorage.getItem('m_fix_tokens');
  if (saved === null) {
    localStorage.setItem('m_fix_tokens', INITIAL_FREE_TOKENS.toString());
    return INITIAL_FREE_TOKENS;
  }
  const parsed = parseInt(saved, 10);
  return isNaN(parsed) ? INITIAL_FREE_TOKENS : Math.max(0, parsed);
}

/**
 * Adds bonus tokens (e.g. by sharing on WhatsApp or referral)
 */
export function addBonusTokens(count: number = 1): number {
  const current = getTokensRemaining();
  if (isPaidSubscriber()) return 9999;
  const newTotal = current + count;
  localStorage.setItem('m_fix_tokens', newTotal.toString());
  return newTotal;
}

/**
 * Categorizes whether a query requires Deep Hardware/System Analysis or is a Quick/Easy question.
 * Quick/Easy Questions are ALWAYS 100% Free!
 */
export function isDeepDiagnostic(prompt: string, hasImage?: boolean): boolean {
  if (hasImage) return true; // Camera / photo uploads require deep AI vision analysis

  const lower = prompt.toLowerCase();
  
  // Technical deep analysis triggers (Hardware, BSOD, Motherboard, Voltage, Disassembly)
  const deepKeywords = [
    'blue screen', 'bsod', 'beep code', 'motherboard', 'bios', 'soldering',
    'ram oxidation', 'power ic', 'short circuit', 'voltage', 'cmos', 'display black',
    'no display', 'liquid spill', 'water damage', 'fan error', 'hardware failure',
    'transistor', 'overheating', 'blink code', 'screen flicker', 'not turning on',
    'dead laptop', 'smell burnt', 'smoke', 'repair price', 'technician visit',
    'chip level', 'firmware', 'registry', 'uefi'
  ];

  if (deepKeywords.some((kw) => lower.includes(kw))) {
    return true;
  }

  // Length heuristic: Long detailed diagnostic descriptions require deep reasoning
  if (prompt.trim().length > 90) {
    return true;
  }

  return false;
}

/**
 * Consumes a token if it's a deep diagnostic.
 * Quick/easy questions are always allowed without consuming tokens.
 */
export function consumeDiagnosticToken(isDeep: boolean = true): {
  allowed: boolean;
  tokensRemaining: number;
  isPaid: boolean;
  wasDeep: boolean;
} {
  const isPaid = isPaidSubscriber();
  if (isPaid) {
    return { allowed: true, tokensRemaining: 9999, isPaid: true, wasDeep: isDeep };
  }

  // Easy / Quick questions are always free!
  if (!isDeep) {
    return { allowed: true, tokensRemaining: getTokensRemaining(), isPaid: false, wasDeep: false };
  }

  // Deep questions require tokens
  const current = getTokensRemaining();
  if (current <= 0) {
    return { allowed: false, tokensRemaining: 0, isPaid: false, wasDeep: true };
  }

  const updated = current - 1;
  localStorage.setItem('m_fix_tokens', updated.toString());
  return { allowed: true, tokensRemaining: updated, isPaid: false, wasDeep: true };
}

export function getAccessStatus(): AccessStatus {
  const now = new Date();
  const paidUntilText = localStorage.getItem('m_fix_paid_until');
  const planName = localStorage.getItem('m_fix_plan_name') || 'Advanced Pro ($7/mo)';

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
        tokensRemaining: 9999,
        planName,
        daysRemaining,
        hoursRemaining,
        statusMessage: `Active ${planName} (${daysRemaining}d ${hoursRemaining}h left — Unlimited Tokens)`,
        expiresAt: paidUntil,
      };
    }
    clearExpiredPaidAccess();
  }

  const tokensRemaining = getTokensRemaining();

  return {
    isGranted: true,
    isTrial: tokensRemaining > 0,
    isPaid: false,
    isLocked: tokensRemaining <= 0,
    tokensRemaining,
    planName: tokensRemaining > 0 ? `Free Plan (${tokensRemaining} Tokens)` : 'Tokens Depleted',
    daysRemaining: 0,
    hoursRemaining: 0,
    statusMessage:
      tokensRemaining > 0
        ? `⚡ ${tokensRemaining} Free Diagnostic Tokens • Easy Questions Free`
        : '⚡ 0 Free Tokens Left • Quick Questions Free • Upgrade for Deep Analysis',
    expiresAt: null,
  };
}
