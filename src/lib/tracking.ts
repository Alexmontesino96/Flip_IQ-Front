import { track } from "@vercel/analytics";

/* ------------------------------------------------------------------ */
/*  UTM persistence                                                    */
/* ------------------------------------------------------------------ */

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;

const STORAGE_KEY = "flipiq_utm";

/** Read UTMs from the current URL and persist to sessionStorage. */
export function captureUtmParams(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const utms: UtmParams = {};
  let found = false;
  for (const key of UTM_KEYS) {
    const val =
      params.get(key) || (key === "utm_source" ? params.get("ref") : null);
    if (val) {
      utms[key] = val;
      found = true;
    }
  }
  if (found) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utms));
    } catch {
      /* private browsing / storage disabled */
    }
  }
}

/** Retrieve persisted UTMs (survives SPA navigations + reloads). */
export function getUtmParams(): UtmParams {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

/** Backward-compat helper used by existing call sites. */
export function getUtmSource(): string {
  return getUtmParams().utm_source || "direct";
}

/* ------------------------------------------------------------------ */
/*  GTM dataLayer                                                      */
/* ------------------------------------------------------------------ */

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

/** Push an event to the GTM dataLayer (with UTMs attached). */
export function pushEvent(
  name: string,
  props?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: name,
    ...getUtmParams(),
    ...props,
  });
}

/* ------------------------------------------------------------------ */
/*  Unified trackEvent (Vercel Analytics + GTM)                        */
/* ------------------------------------------------------------------ */

export function trackEvent(
  name: string,
  props?: Record<string, string | number>
) {
  const utms = getUtmParams();
  // Vercel Analytics
  track(name, { ...props, ...utms });
  // GTM dataLayer
  pushEvent(name, props);
}
