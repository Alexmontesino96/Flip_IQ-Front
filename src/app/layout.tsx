import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import AuthBridge from "@/components/AuthBridge";
import GoogleTagManager from "@/components/GoogleTagManager";
import {
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_TWITTER_IMAGE_PATH,
  SITE_ORIGIN,
} from "@/lib/seo";
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
  metadataBase: SITE_ORIGIN,
  applicationName: "FlipIQ",
  title: {
    default: "FlipIQ | Know if you’ll actually sell before you buy",
    template: "%s | FlipIQ",
  },
  description:
    "Know if you’ll actually sell before you buy. FlipIQ analyzes resale profit, execution risk, and best selling channel across eBay and Amazon.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "FlipIQ | Know if you’ll actually sell before you buy",
    description:
      "FlipIQ analyzes resale profit, execution risk, max buy price, and best selling channel across eBay and Amazon.",
    siteName: "FlipIQ",
    type: "website",
    locale: "en_US",
    url: "/",
    images: [
      {
        url: DEFAULT_OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "FlipIQ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FlipIQ | Know if you’ll actually sell before you buy",
    description:
      "Analyze resale profit and execution risk across eBay and Amazon with FlipIQ.",
    images: [DEFAULT_TWITTER_IMAGE_PATH],
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
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg?v=2" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0A0A0A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="FlipIQ" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
      </head>
      <body>
        <GoogleTagManager />
        <Suspense>
          <AuthBridge />
        </Suspense>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
