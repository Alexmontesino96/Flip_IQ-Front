import type { Metadata } from "next";
import StaticContentPage from "@/components/StaticContentPage";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "Support",
  description:
    "Get help with FlipIQ — account issues, billing, analysis questions, and feature requests.",
  path: "/support",
});

export default function SupportPage() {
  return (
    <StaticContentPage
      eyebrow="Support"
      title="How can we help?"
      intro="Find answers to common questions or reach out directly. We typically respond within 24 hours."
      sections={[
        {
          title: "Contact us",
          paragraphs: [
            "For any questions, issues, or feedback, email us at: support@getflipiq.com",
            "Include your account email and a description of the issue. Screenshots help us resolve things faster.",
          ],
        },
        {
          title: "Account & login",
          bullets: [
            "Can't log in? Try resetting your password from the login page. If you signed up with Apple, use the Apple button instead of email/password.",
            "To delete your account and all associated data, email support@getflipiq.com from your registered email.",
            "If you're not receiving confirmation emails, check your spam folder. The email comes from noreply@getflipiq.com.",
          ],
        },
        {
          title: "Billing & subscriptions",
          bullets: [
            "All payments are processed by Stripe. FlipIQ never sees your card details.",
            'To cancel your subscription, go to Plans in the app and tap "Manage plan" to open the Stripe portal.',
            "Refund requests within the first 30 days are honored automatically. Email support@getflipiq.com.",
            "If you were charged after cancelling, contact us — we'll resolve it immediately.",
            "To change your plan (upgrade or downgrade), visit the Plans page.",
          ],
        },
        {
          title: "Analysis & results",
          bullets: [
            "Analyses pull live sold data from eBay and Amazon. Results reflect real market conditions at the time of the scan.",
            'If an analysis shows "No comps found", it means we couldn\'t find enough sold listings to provide reliable data. Try a more specific product name or barcode.',
            "The AI explanation is available on Starter and Pro plans. Free users see all scores and data but not the AI summary.",
            "Flip scores, risk, and confidence are calculated from real comparable sales — not estimates.",
          ],
        },
        {
          title: "Scan limits",
          bullets: [
            "Free accounts: 5 analyses per day (resets every 24 hours)",
            "Starter: 30 analyses per day",
            "Pro: 100 analyses per day",
            "Anonymous users (no account): 5 total analyses that do not reset",
            "Your remaining scans are shown below the Analyze button and on your home dashboard.",
          ],
        },
        {
          title: "Feature requests & bugs",
          paragraphs: [
            "We build based on user feedback. If there's a feature you'd like to see or a bug you've encountered, email support@getflipiq.com with details.",
            "Include what you expected to happen, what actually happened, and the product you were searching for.",
          ],
        },
        {
          title: "iOS app",
          bullets: [
            "The FlipIQ iOS app is available on the App Store. It shares the same account as the web app.",
            "Subscription management happens on the web at getflipiq.com/plans to avoid App Store fees.",
            "If you're logged in on the app and open a web link, your session transfers automatically.",
          ],
        },
        {
          title: "Data & privacy",
          paragraphs: [
            "For questions about your data, how we use it, or to request deletion, see our Privacy Policy at getflipiq.com/privacy or email privacy@getflipiq.com.",
          ],
        },
      ]}
    />
  );
}
