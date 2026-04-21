/**
 * Shared API helpers — auth headers, base URL, etc.
 *
 * Every authenticated call to the FlipIQ backend should use `getAuthHeaders()`
 * so the JWT from Supabase is forwarded as `Authorization: Bearer <token>`.
 * This ensures analyses are saved with the correct `user_id`.
 */

import { createClient } from "@/lib/supabase/client";
import { getClientId, getVerifiedEmail } from "./usage";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://flip-iq-fastapi.onrender.com";

/**
 * Build headers for an authenticated API call.
 * Includes the Supabase JWT when available, plus client-id / email fallbacks.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "X-Client-ID": getClientId(),
  };

  // Supabase JWT — primary auth method
  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }
  } catch {
    // No session — fall through to anonymous headers
  }

  // Email fallback for non-authenticated users
  const email = getVerifiedEmail();
  if (email) headers["X-Verified-Email"] = email;

  return headers;
}
