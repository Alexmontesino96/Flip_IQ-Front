import type { Metadata } from "next";
import StaticContentPage from "@/components/StaticContentPage";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "Cookie Policy",
  description:
    "How FlipIQ uses cookies and local storage for sessions, analytics, and product preferences.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <StaticContentPage
      eyebrow="Cookies"
      title="How FlipIQ uses cookies and local storage."
      intro="FlipIQ uses browser storage and related technologies to keep core product flows working smoothly. This includes authentication state, usage context, and product preferences."
      sections={[
        {
          title: "Essential product storage",
          bullets: [
            "Session and authentication state",
            "Plan or access-related state required for protected routes",
            "Recent searches and local preferences used to improve the product experience",
          ],
        },
        {
          title: "Analytics and measurement",
          paragraphs: [
            "FlipIQ also uses lightweight analytics signals to understand which flows are working, where people drop off, and which parts of the product need improvement.",
          ],
        },
        {
          title: "Why this matters",
          paragraphs: [
            "Without these signals, the product would lose persistence, account continuity, and much of the context that makes the app feel fast and personalized.",
          ],
        },
      ]}
    />
  );
}
