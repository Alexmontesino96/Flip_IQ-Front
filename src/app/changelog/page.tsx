import type { Metadata } from "next";
import StaticContentPage from "@/components/StaticContentPage";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "FlipIQ Changelog",
  description:
    "Recent product and frontend changes in FlipIQ, from search improvements to account and billing updates.",
  path: "/changelog",
});

export default function ChangelogPage() {
  return (
    <StaticContentPage
      eyebrow="Changelog"
      title="Recent product updates in FlipIQ."
      intro="FlipIQ is shipping quickly. This changelog collects a simple, human-readable view of recent product improvements so users can see how the app is evolving."
      sections={[
        {
          title: "Latest updates",
          bullets: [
            "More subtle card glow and cleaner account-gate visuals",
            "Account gate flow redesigned to match the current design system",
            "New account-gate step for unauthenticated plan selection",
            "Upgrade and downgrade flow split more cleanly between checkout and plan changes",
            "Login and register screens constrained for better mobile usability",
            "Plans page connected to real Stripe billing endpoints",
            "Barcode scanning connected to the real camera flow on /scan",
            "Dedicated handling for backend no-comps states",
            "Search page can run analysis directly instead of bouncing through another route",
            "Home page now shows real watchlist item counts",
          ],
        },
        {
          title: "What this means for users",
          paragraphs: [
            "The recent work has focused on tightening the core product loop: find a product faster, analyze it with fewer dead ends, handle edge cases more clearly, and keep account/billing flows cleaner.",
          ],
        },
      ]}
    />
  );
}
