import type { Metadata } from "next";
import StaticContentPage from "@/components/StaticContentPage";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "Privacy Policy",
  description:
    "How FlipIQ handles account data, analysis history, billing-related data, and product usage information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <StaticContentPage
      eyebrow="Privacy"
      title="How FlipIQ handles product, account, and usage data."
      intro="FlipIQ needs some data to run analysis, manage accounts, and keep the app functional. This page summarizes the current product behavior in plain language."
      sections={[
        {
          title: "Data the product uses",
          bullets: [
            "Product queries, barcodes, and cost inputs used to generate analysis results",
            "Account and session information used for authentication and access control",
            "Analysis history, watchlist items, and preference state stored to support product features",
            "Billing-related information handled through external payment providers when subscriptions are used",
            "Basic analytics used to understand product usage and improve flows",
          ],
        },
        {
          title: "Why the data is used",
          paragraphs: [
            "The app uses your inputs to run resale analysis, calculate results, save your history, and power account-level features like watchlists or plan limits. Without that data, key parts of the product would not work.",
          ],
        },
        {
          title: "What FlipIQ does not promise",
          paragraphs: [
            "This summary is meant to be transparent about current app behavior, but it is not a substitute for a finalized legal data-processing agreement. As the product matures, this page should evolve into a full production privacy policy.",
          ],
        },
      ]}
    />
  );
}
