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
