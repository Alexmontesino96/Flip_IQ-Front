import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono",
});

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
    <html
      lang="en"
      className={`${interTight.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
