import type { Metadata } from "next";
import StaticContentPage from "@/components/StaticContentPage";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "Cookie Policy",
  description:
    "How FlipIQ uses cookies, localStorage, and similar technologies for authentication, functionality, and analytics.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <StaticContentPage
      eyebrow="Legal"
      title="Cookie Policy"
      intro="Last updated: April 29, 2026. This policy explains how FlipIQ uses cookies, localStorage, and similar browser technologies."
      sections={[
        {
          title: "1. What are cookies and local storage?",
          paragraphs: [
            "Cookies are small text files stored on your device by your browser when you visit a website. localStorage is a browser feature that allows websites to store data locally on your device. Both serve similar purposes: remembering your preferences, maintaining your session, and enabling core functionality.",
          ],
        },
        {
          title: "2. Strictly necessary (authentication)",
          paragraphs: [
            "These are required for FlipIQ to function. Without them, you cannot log in or use protected features.",
          ],
          bullets: [
            "Supabase session cookies: maintain your authenticated session across page loads and browser tabs. Set by Supabase (our authentication provider). Expire when you log out or after the session timeout",
            "Authentication state: ensures protected routes (dashboard, history, watchlist) are only accessible to logged-in users",
          ],
        },
        {
          title: "3. Functional (product experience)",
          paragraphs: [
            "These store preferences and state that make the app work better for you. They are not shared with third parties.",
          ],
          bullets: [
            "flipiq_client_id (localStorage): anonymous unique identifier used to track scan limits for non-registered users. Generated once, persists until you clear browser data",
            "flipiq_verified_email (localStorage): your email address if you submitted it for the free tier. Used to identify you on subsequent visits without requiring full registration",
            "flipiq_anon_scans_used (localStorage): count of free analyses used by anonymous users (maximum 5 total). Cleared when you register an account",
            "flipiq_recent_searches (localStorage): your last 10 product searches for quick access. Never sent to our servers",
            "fliqLang (localStorage): your language preference (English or Spanish). Shared across the landing page, free calculator, and checkout flow",
            "selectedPlan (sessionStorage): temporarily stores your selected plan during the registration flow. Cleared when you close the tab",
          ],
        },
        {
          title: "4. Analytics",
          paragraphs: [
            "We use Vercel Analytics to understand how FlipIQ is used and where we can improve. These analytics are privacy-focused and do not use traditional tracking cookies.",
          ],
          bullets: [
            "Vercel Analytics: collects page views, performance metrics (load time, interaction delay), and basic device information (browser, OS, viewport). No personally identifiable information is collected. Data is aggregated and anonymized. See Vercel's privacy policy at vercel.com/legal/privacy-policy",
          ],
        },
        {
          title: "5. Third-party cookies",
          paragraphs: [
            "FlipIQ minimizes the use of third-party cookies. The following services may set cookies when you interact with them:",
          ],
          bullets: [
            "Stripe: when you visit the checkout or billing portal, Stripe may set cookies for fraud prevention and payment processing. These are governed by Stripe's cookie policy",
            "Apple: if you use Sign in with Apple, Apple's authentication flow may set temporary cookies during the sign-in process",
          ],
        },
        {
          title: "6. What we do NOT use",
          bullets: [
            "No advertising cookies or tracking pixels",
            "No retargeting or remarketing cookies",
            "No cross-site tracking",
            "No selling of cookie data to third parties",
            "No fingerprinting technologies",
          ],
        },
        {
          title: "7. Managing cookies and local storage",
          paragraphs: [
            "You can control cookies and localStorage through your browser settings:",
          ],
          bullets: [
            "Most browsers allow you to block or delete cookies through settings (usually under Privacy or Security)",
            "You can clear localStorage by going to your browser's developer tools (Application tab) or by clearing all site data",
            "Blocking essential cookies will prevent you from logging in or using authenticated features",
            "Clearing localStorage will reset your anonymous scan count, language preference, and recent searches",
          ],
        },
        {
          title: "8. Changes to this policy",
          paragraphs: [
            'We may update this Cookie Policy when we add or change technologies. Updates will be reflected by the "Last updated" date at the top of this page.',
          ],
        },
        {
          title: "9. Contact",
          paragraphs: [
            "For questions about our use of cookies and local storage, contact us at: privacy@getflipiq.com",
          ],
        },
      ]}
    />
  );
}
