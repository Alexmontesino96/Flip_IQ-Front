const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://flip-iq-fastapi.onrender.com";

const CLIENT_ID_KEY = "flipiq_client_id";
const VERIFIED_EMAIL_KEY = "flipiq_verified_email";

export function getClientId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

export function getVerifiedEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(VERIFIED_EMAIL_KEY);
}

export async function checkStatus(): Promise<{
  remaining: number;
  tier: string;
  verified: boolean;
}> {
  try {
    const headers: Record<string, string> = {
      "X-Client-ID": getClientId(),
    };
    const email = getVerifiedEmail();
    if (email) headers["X-Verified-Email"] = email;

    const res = await fetch(`${API_URL}/api/v1/waitlist/status`, {
      credentials: "include",
      headers,
    });
    if (!res.ok) {
      return { remaining: 3, tier: "anonymous", verified: false };
    }
    return await res.json();
  } catch {
    return { remaining: 3, tier: "anonymous", verified: false };
  }
}

export interface BillingStatus {
  plan: string;
  daily_limit: number;
  scans_used_today: number;
  scans_remaining_today: number;
  reset_in_seconds: number;
}

/** Fetch billing status from authenticated endpoint (reads real Redis data). */
export async function fetchBilling(): Promise<BillingStatus | null> {
  try {
    // Dynamic import to avoid circular dependency
    const { getAuthHeaders } = await import("./api");
    const headers = await getAuthHeaders();
    if (!headers["Authorization"]) return null; // not logged in

    const res = await fetch(`${API_URL}/api/v1/billing/me`, {
      credentials: "include",
      headers,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/* ── Tier detection ── */

export type UserTier = "anonymous" | "free" | "starter" | "pro";

export interface UserStatus {
  tier: UserTier;
  scansRemaining: number;
  scansLimit: number;
  isAiUnlocked: boolean;
  resetAt?: string;
}

const ANON_SCANS_KEY = "flipiq_anon_scans_used";

export function getAnonScansUsed(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(ANON_SCANS_KEY) || "0", 10);
}

export function incrementAnonScans(): void {
  if (typeof window === "undefined") return;
  const current = getAnonScansUsed();
  localStorage.setItem(ANON_SCANS_KEY, String(current + 1));
}

export function clearAnonScans(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ANON_SCANS_KEY);
}

/**
 * Derive full user status from checkStatus + billing responses.
 * Maps backend tier strings to the 4-tier model.
 */
export function deriveUserStatus(
  backendTier: string,
  remaining: number,
  billing?: BillingStatus | null
): UserStatus {
  // If billing endpoint returned data, use it
  if (billing) {
    const plan = billing.plan.toLowerCase();
    let tier: UserTier = "free";
    if (plan === "starter" || plan === "basic") tier = "starter";
    else if (plan === "pro" || plan === "premium") tier = "pro";

    return {
      tier,
      scansRemaining: billing.scans_remaining_today,
      scansLimit: billing.daily_limit,
      isAiUnlocked: tier === "starter" || tier === "pro",
    };
  }

  // Fallback: derive from checkStatus response
  const t = backendTier.toLowerCase();
  if (t === "starter" || t === "basic") {
    return {
      tier: "starter",
      scansRemaining: remaining,
      scansLimit: 30,
      isAiUnlocked: true,
    };
  }
  if (t === "pro" || t === "premium" || t === "power") {
    return {
      tier: "pro",
      scansRemaining: remaining,
      scansLimit: 100,
      isAiUnlocked: true,
    };
  }
  if (t === "free" || t === "verified") {
    return {
      tier: "free",
      scansRemaining: remaining,
      scansLimit: 5,
      isAiUnlocked: false,
    };
  }

  // Anonymous
  const anonUsed = getAnonScansUsed();
  return {
    tier: "anonymous",
    scansRemaining: Math.max(0, 5 - anonUsed),
    scansLimit: 5,
    isAiUnlocked: false,
  };
}

/** Get quota display string based on tier */
export function getQuotaLabel(status: UserStatus): string {
  switch (status.tier) {
    case "anonymous":
      return `${status.scansRemaining} / 5 free analyses remaining`;
    case "free":
      return `${status.scansRemaining} / 5 today · Upgrade for 30/day`;
    case "starter":
      return `${status.scansRemaining} / 30 today`;
    case "pro":
      return `${status.scansRemaining} / 100 today`;
  }
}

export async function submitEmail(email: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/v1/waitlist/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Client-ID": getClientId(),
    },
    body: JSON.stringify({ email, source: "calculator" }),
  });
  if (res.ok) {
    // Persist email so we can send it as header on future requests
    // (fallback when cross-domain cookies don't work)
    localStorage.setItem(VERIFIED_EMAIL_KEY, email);
  }
}
