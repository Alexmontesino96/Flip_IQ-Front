import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "FlipIQ — Free Flip Profit Calculator",
  description:
    "Compare flip profit across eBay, Amazon, FBMP and MercadoLibre in seconds. Free calculator for resellers.",
  openGraph: {
    title: "FlipIQ — Free Flip Profit Calculator",
    description:
      "Compare flip profit across eBay, Amazon, FBMP and MercadoLibre in seconds",
    siteName: "FlipIQ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlipIQ — Free Flip Profit Calculator",
    description:
      "Compare flip profit across eBay, Amazon, FBMP and MercadoLibre in seconds",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
