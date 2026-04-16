import { track } from "@vercel/analytics";

export function getUtmSource(): string {
  if (typeof window === "undefined") return "direct";
  const params = new URLSearchParams(window.location.search);
  return params.get("ref") || params.get("utm_source") || "direct";
}

export function trackEvent(
  name: string,
  props?: Record<string, string | number>
) {
  track(name, { ...props, ref: getUtmSource() });
}
