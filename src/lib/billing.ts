import { API_URL, getAuthHeaders } from "./api";

export interface BillingPlan {
  id: string;
  name: string;
  stripe_price_id: string;
  daily_limit: number;
}

export interface SubscriptionStatus {
  has_subscription: boolean;
  plan: string;
  status: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string | null;
}

/** GET /api/v1/billing/plans */
export async function fetchPlans(): Promise<BillingPlan[]> {
  const res = await fetch(`${API_URL}/api/v1/billing/plans`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.plans || [];
}

/** GET /api/v1/billing/status — requires auth */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus | null> {
  const headers = await getAuthHeaders();
  if (!headers["Authorization"]) return null;

  const res = await fetch(`${API_URL}/api/v1/billing/status`, {
    credentials: "include",
    headers,
  });
  if (!res.ok) return null;
  return res.json();
}

/** POST /api/v1/billing/checkout — creates Stripe Checkout session */
export async function createCheckout(
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/api/v1/billing/checkout`, {
    method: "POST",
    credentials: "include",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      price_id: priceId,
      success_url: successUrl,
      cancel_url: cancelUrl,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create checkout session");
  }
  const data = await res.json();
  return data.checkout_url;
}

/** POST /api/v1/billing/portal — creates Stripe Customer Portal session */
export async function openPortal(returnUrl: string): Promise<string> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/api/v1/billing/portal`, {
    method: "POST",
    credentials: "include",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ return_url: returnUrl }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to open billing portal");
  }
  const data = await res.json();
  return data.portal_url;
}
