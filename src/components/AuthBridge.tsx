"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * AuthBridge — detects auth tokens passed via URL from the iOS app
 * and establishes a Supabase session in the browser.
 *
 * Usage: render <AuthBridge /> in layout or any page that the iOS app links to.
 *
 * The iOS app opens:
 *   https://getflipiq.com/plans?access_token=xxx&refresh_token=yyy
 *
 * This component:
 * 1. Reads access_token + refresh_token from URL
 * 2. Calls supabase.auth.setSession() to establish the session
 * 3. Removes the tokens from the URL (clean history)
 * 4. Shows nothing visually — it's invisible
 */
export default function AuthBridge() {
  const searchParams = useSearchParams();
  const [done, setDone] = useState(false);

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");

    if (!accessToken || !refreshToken || done) return;

    const supabase = createClient();

    supabase.auth
      .setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      .then(({ error }) => {
        if (!error) {
          // Clean tokens from URL without reload
          const url = new URL(globalThis.location.href);
          url.searchParams.delete("access_token");
          url.searchParams.delete("refresh_token");
          globalThis.history.replaceState({}, "", url.toString());
        }
        setDone(true);
      });
  }, [searchParams, done]);

  return null;
}
