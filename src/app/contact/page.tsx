import type { Metadata } from "next";
import StaticContentPage from "@/components/StaticContentPage";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "Contact FlipIQ",
  description:
    "How to reach FlipIQ for product, account, billing, and partnership questions.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <StaticContentPage
      eyebrow="Contact"
      title="Reach FlipIQ for product and account questions."
      intro="FlipIQ is still evolving quickly, so the cleanest way to get help depends on how you use the product today. This page centralizes the support paths we can publish right now."
      sections={[
        {
          title: "If you already use FlipIQ",
          bullets: [
            "Use the same access or onboarding channel you used to get into the product.",
            "For billing-related issues, start from the plan or account flow inside the app when available.",
            "For analysis quality issues, keep the product title, cost, and result page handy so the team can reproduce the case.",
          ],
        },
        {
          title: "If you are evaluating the product",
          paragraphs: [
            "The best starting point is the free calculator. It gives you the closest thing to a real product demo because you can test a live product, cost, and condition instead of reading generic marketing copy.",
          ],
        },
        {
          title: "What support requests are most useful",
          bullets: [
            "Products that should have matched but returned poor comps",
            "Bad recommendations caused by mixed conditions or category friction",
            "Unexpected checkout or account state issues",
            "Partnership or early access inquiries",
          ],
        },
      ]}
    />
  );
}
