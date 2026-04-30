import type { Metadata } from "next";
import StaticContentPage from "@/components/StaticContentPage";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "Privacy Policy",
  description:
    "Privacy Policy for FlipIQ — what data we collect, how we use it, who we share it with, and your rights.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <StaticContentPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="Last updated: April 29, 2026. This policy describes how FlipIQ collects, uses, stores, and protects your personal information."
      sections={[
        {
          title: "1. Who we are",
          paragraphs: [
            'FlipIQ ("we", "us", "our") operates the website getflipiq.com and related mobile applications. We provide a resale profit analysis platform for e-commerce resellers.',
          ],
        },
        {
          title: "2. Information we collect",
          paragraphs: [
            "We collect different types of information depending on how you use FlipIQ:",
          ],
          bullets: [
            "Account information: email address, first name, last name, and authentication data when you create an account (directly or via Apple Sign-In)",
            "Analysis inputs: product names, barcodes, cost prices, and condition selections you enter to run analyses",
            "Analysis history: results, watchlist items, and saved analyses associated with your account",
            "Usage data: scan counts, feature usage, plan status, and interaction patterns",
            "Device and browser data: IP address, browser type, device type, operating system, and language preference",
            "Payment data: subscription plan and billing status. Credit card details are collected and processed exclusively by Stripe — FlipIQ never receives, stores, or has access to your payment card information",
          ],
        },
        {
          title: "3. Information stored locally",
          paragraphs: [
            "FlipIQ stores certain data in your browser's localStorage for functionality:",
          ],
          bullets: [
            "Client ID: an anonymous identifier to track usage limits for non-registered users",
            "Recent searches: your last 10 product searches for quick access",
            "Language preference: your selected language (English or Spanish)",
            "Anonymous scan count: number of free analyses used (for non-registered users)",
            "Verified email: stored locally if you submit your email for the free tier",
          ],
        },
        {
          title: "4. How we use your information",
          bullets: [
            "To provide the core service: running product analyses, calculating profit estimates, and generating recommendations",
            "To manage your account: authentication, session management, and access control",
            "To process payments: managing subscriptions, billing, and plan changes through Stripe",
            "To save your data: maintaining analysis history, watchlists, and preferences",
            "To improve the product: understanding usage patterns, fixing bugs, and optimizing performance",
            "To communicate with you: sending email confirmations, password resets, and critical service notifications",
            "To enforce limits: tracking scan usage per plan tier",
          ],
        },
        {
          title: "5. Third-party services",
          paragraphs: [
            "We use the following third-party services that may process your data:",
          ],
          bullets: [
            "Supabase (authentication and database): stores your account data, session tokens, and application data. Privacy policy: supabase.com/privacy",
            "Stripe (payment processing): processes all payments and stores billing information. FlipIQ never sees your card details. Stripe is PCI-DSS Level 1 certified. Privacy policy: stripe.com/privacy",
            "Vercel (hosting and analytics): hosts the website and collects basic analytics (page views, performance metrics). Privacy policy: vercel.com/legal/privacy-policy",
            "Render (backend hosting): hosts our API server. Privacy policy: render.com/privacy",
          ],
        },
        {
          title: "6. Marketplace data",
          paragraphs: [
            "FlipIQ retrieves publicly available sold listing data from eBay and Amazon to generate analyses. We do not access private seller accounts, buyer information, or any non-public marketplace data. All comparable sales data used in analysis comes from publicly listed sold items.",
          ],
        },
        {
          title: "7. Data sharing",
          paragraphs: [
            "We do not sell, rent, or trade your personal information to third parties. We share data only in the following circumstances:",
          ],
          bullets: [
            "With service providers: Supabase, Stripe, Vercel, and Render as described above, solely to operate the service",
            "When required by law: to comply with legal obligations, court orders, or government requests",
            "To protect rights: to enforce our terms, protect our rights, or ensure the safety of our users",
            "With your consent: if you explicitly authorize us to share specific information",
            "Shared analyses: if you use the share feature, a limited view of your analysis results becomes accessible via a unique link",
          ],
        },
        {
          title: "8. Data retention",
          paragraphs: [
            "We retain your data for as long as your account is active or as needed to provide the service:",
          ],
          bullets: [
            "Account data: retained until you delete your account",
            "Analysis history: retained while your account is active",
            "Watchlist data: retained while your account is active",
            "Anonymous usage data: client IDs and scan counts stored in localStorage persist until you clear your browser data",
            "Billing records: retained as required by tax and financial regulations (typically 7 years)",
            "After account deletion: personal data is removed within 30 days. Anonymized and aggregated data may be retained for analytical purposes",
          ],
        },
        {
          title: "9. Data security",
          paragraphs: [
            "We implement appropriate technical and organizational measures to protect your data:",
          ],
          bullets: [
            "All data in transit is encrypted via TLS 1.3",
            "Passwords are hashed and never stored in plain text",
            "Authentication tokens are managed securely through Supabase",
            "Payment processing is handled entirely by Stripe (PCI-DSS Level 1)",
            "API access requires authenticated sessions for protected endpoints",
            "We conduct regular security reviews of our infrastructure",
          ],
        },
        {
          title: "10. Your rights",
          paragraphs: [
            "Depending on your jurisdiction, you may have the following rights regarding your personal data:",
          ],
          bullets: [
            "Access: request a copy of the personal data we hold about you",
            "Correction: request correction of inaccurate or incomplete data",
            "Deletion: request deletion of your account and associated data",
            "Portability: request your data in a machine-readable format",
            "Objection: object to certain processing of your data",
            "Withdrawal of consent: withdraw consent where processing is based on consent",
          ],
        },
        {
          title: "11. Children's privacy",
          paragraphs: [
            "FlipIQ is not intended for use by anyone under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child under 18, we will take steps to delete it promptly.",
          ],
        },
        {
          title: "12. International data transfers",
          paragraphs: [
            "FlipIQ is operated from the United States. If you access the service from outside the US, your data may be transferred to and processed in the United States. By using FlipIQ, you consent to this transfer. We ensure that any data transfers comply with applicable data protection laws.",
          ],
        },
        {
          title: "13. Changes to this policy",
          paragraphs: [
            'We may update this Privacy Policy from time to time. Material changes will be communicated via email or a prominent notice on the service at least 14 days before they take effect. The "Last updated" date at the top reflects the most recent revision.',
          ],
        },
        {
          title: "14. Contact",
          paragraphs: [
            "For questions about this Privacy Policy or to exercise your data rights, contact us at: privacy@getflipiq.com",
          ],
        },
      ]}
    />
  );
}
