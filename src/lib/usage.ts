const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://flip-iq-fastapi.onrender.com";

const CLIENT_ID_KEY = "flipiq_client_id";

export function getClientId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

export async function checkStatus(): Promise<{
  remaining: number;
  tier: string;
  verified: boolean;
}> {
  try {
    const res = await fetch(`${API_URL}/api/v1/waitlist/status`, {
      credentials: "include",
      headers: { "X-Client-ID": getClientId() },
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
  await fetch(`${API_URL}/api/v1/waitlist/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Client-ID": getClientId(),
    },
    body: JSON.stringify({ email, source: "calculator" }),
  });
}
