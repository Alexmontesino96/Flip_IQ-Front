import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

const INDEXABLE_ROUTES = [
  {
    path: "/",
    priority: 1,
    changeFrequency: "weekly" as const,
  },
  {
    path: "/free",
    priority: 0.9,
    changeFrequency: "weekly" as const,
  },
  {
    path: "/about",
    priority: 0.5,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/blog",
    priority: 0.6,
    changeFrequency: "weekly" as const,
  },
  {
    path: "/contact",
    priority: 0.4,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/changelog",
    priority: 0.4,
    changeFrequency: "weekly" as const,
  },
  {
    path: "/privacy",
    priority: 0.3,
    changeFrequency: "yearly" as const,
  },
  {
    path: "/terms",
    priority: 0.3,
    changeFrequency: "yearly" as const,
  },
  {
    path: "/cookies",
    priority: 0.3,
    changeFrequency: "yearly" as const,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return INDEXABLE_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
