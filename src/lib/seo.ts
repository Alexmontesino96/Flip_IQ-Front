import type { Metadata } from "next";

const DEFAULT_LOCAL_URL = "http://localhost:3000";
const FALLBACK_PRODUCTION_URL = "https://flipiq.app";

type NoIndexOptions = {
  title: string;
  description: string;
};

type PublicMetadataOptions = {
  title: string;
  description: string;
  path?: string;
};

function normalizeSiteUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return DEFAULT_LOCAL_URL;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/+$/, "");
  }
  return `https://${trimmed.replace(/\/+$/, "")}`;
}

function resolveSiteUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl && !appUrl.includes("localhost")) {
    return normalizeSiteUrl(appUrl);
  }

  const productionUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (productionUrl) {
    return normalizeSiteUrl(productionUrl);
  }

  if (appUrl) {
    return normalizeSiteUrl(appUrl);
  }

  return FALLBACK_PRODUCTION_URL;
}

export const SITE_URL = resolveSiteUrl();
export const SITE_ORIGIN = new URL(SITE_URL);
export const DEFAULT_OG_IMAGE_PATH = "/opengraph-image";
export const DEFAULT_TWITTER_IMAGE_PATH = "/twitter-image";

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_ORIGIN).toString();
}

export function buildPublicMetadata({
  title,
  description,
  path = "/",
}: PublicMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "FlipIQ",
      type: "website",
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
      title,
      description,
      images: [DEFAULT_TWITTER_IMAGE_PATH],
    },
  };
}

export function buildNoIndexMetadata({
  title,
  description,
}: NoIndexOptions): Metadata {
  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        "max-snippet": -1,
        "max-image-preview": "none",
        "max-video-preview": -1,
      },
    },
  };
}
