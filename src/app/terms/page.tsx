import type { Metadata } from "next";
import StaticContentPage from "@/components/StaticContentPage";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "Terms of Use",
  description:
    "Basic terms for using FlipIQ, including product use, responsibility for buying decisions, and subscription behavior.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <StaticContentPage
      eyebrow="Terms"
      title="Basic terms for using FlipIQ responsibly."
      intro="FlipIQ is a decision-support product for resellers. It is designed to help you estimate profit, risk, and execution quality, but the final buying decision remains yours."
      sections={[
        {
          title: "What the product provides",
          paragraphs: [
            "FlipIQ provides analysis, estimates, and recommendations based on marketplace data, internal scoring, and product logic. Those outputs are tools for judgment, not guarantees of outcome.",
          ],
        },
        {
          title: "What remains your responsibility",
          bullets: [
            "Verifying product condition before buying",
            "Checking authenticity, completeness, and compliance where relevant",
            "Confirming actual marketplace fees and shipping realities",
            "Deciding whether a category carries too much execution risk to buy",
          ],
        },
        {
          title: "Subscriptions and access",
          paragraphs: [
            "Some parts of FlipIQ may be gated by plan level, account status, or billing state. Access limits, feature access, and scan limits can change by plan.",
          ],
        },
      ]}
    />
  );
}
