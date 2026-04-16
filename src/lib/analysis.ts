import { getClientId } from "./usage";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://flip-iq-fastapi.onrender.com";

export class ApiError extends Error {
  status: number;
  reason?: string;
  constructor(status: number, message: string, reason?: string) {
    super(message);
    this.status = status;
    this.reason = reason;
  }
}

const MARKETPLACE_META: Record<string, { label: string; icon: string }> = {
  facebook_marketplace: { label: "FB Marketplace", icon: "🏪" },
  ebay: { label: "eBay", icon: "🏷️" },
  mercadolibre: { label: "MercadoLibre", icon: "🤝" },
  amazon_fba: { label: "Amazon FBA", icon: "📦" },
};

export interface Channel {
  id: string;
  label: string;
  icon: string;
  salePrice: string;
  fees: string;
  ship: string;
  profit: string;
  roi: string;
  margin: string;
  estimated: boolean;
}

export interface ResultProduct {
  title: string;
  brand: string;
  image: string;
  comps: number;
  median_price: number;
  min_price: number;
  max_price: number;
  sales_per_day: number;
  competition: string;
  trend_price: number;
}

export interface ConditionInfo {
  requestedCondition: string;
  mixedConditions: boolean;
  subsetCount: number;
  subsetMedian: number | null;
  matchRate: number;
}

export interface AnalysisResult {
  product: ResultProduct;
  channels: Channel[];
  flipScore: number;
  recommendation: string;
  recColor: string;
  recIcon: string;
  velocity: number;
  risk: number;
  confidence: number;
  mainProfit: string;
  mainROI: string;
  maxBuy: string;
  headroom: string;
  quickPrice: string;
  marketPrice: string;
  stretchPrice: string;
  warnings: string[];
  estDaysToSell: number;
  aiExplanation?: string;
  bestMarketplace?: string;
  bestMarketplaceReason?: string;
  marketplaceDetails?: MarketplaceDetail[];
  conditionInfo?: ConditionInfo;
}

export interface MarketplaceDetail {
  marketplace: string;
  label: string;
  salePrice: string;
  profit: string;
  roi: string;
  flipScore: number;
  recommendation: string;
  comps: number;
  median: string;
  salesPerDay: string;
  confidence: number;
}

function getRecStyle(recommendation: string) {
  switch (recommendation) {
    case "buy":
      return { text: "BUY", color: "#22c55e", icon: "✅" };
    case "buy_small":
      return { text: "BUY SMALL", color: "#eab308", icon: "🟡" };
    case "watch":
      return { text: "WATCH", color: "#f97316", icon: "👁️" };
    case "pass":
      return { text: "PASS", color: "#ef4444", icon: "✋" };
    default:
      return {
        text: recommendation?.toUpperCase() || "—",
        color: "#94a3b8",
        icon: "❓",
      };
  }
}

export async function runAnalysis(
  query: string,
  costPrice: number,
  condition: string
): Promise<AnalysisResult> {
  const isBarcode = /^\d{8,14}$/.test(query.trim());

  const body: Record<string, unknown> = {
    cost_price: costPrice,
    condition,
    marketplace: "ebay",
    lang: "en",
  };

  if (isBarcode) {
    body.barcode = query.trim();
  } else {
    body.keyword = query.trim();
  }

  const res = await fetch(`${API_URL}/api/v1/analysis/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Client-ID": getClientId(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      error.detail || `Error ${res.status}`,
      error.reason
    );
  }

  const data = await res.json();
  return transformResponse(data);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function buildMarketplaceDetails(data: any): MarketplaceDetail[] {
  const details: MarketplaceDetail[] = [];
  const analyses: [string, string][] = [
    ["ebay_analysis", "eBay"],
    ["amazon_analysis", "Amazon"],
  ];
  for (const [key, label] of analyses) {
    const a = data[key];
    if (!a) continue;
    const rec = getRecStyle(a.recommendation || "watch");
    details.push({
      marketplace: a.marketplace || key.replace("_analysis", ""),
      label,
      salePrice: (a.estimated_sale_price || 0).toFixed(2),
      profit: (a.net_profit || 0).toFixed(2),
      roi: (a.roi_pct || 0).toFixed(1),
      flipScore: a.flip_score ?? 0,
      recommendation: rec.text,
      comps: a.comps?.total_sold || 0,
      median: (a.comps?.median_price || 0).toFixed(2),
      salesPerDay: (a.comps?.sales_per_day || 0).toFixed(2),
      confidence: a.confidence?.score ?? 0,
    });
  }
  return details;
}

function collectWarnings(data: any): string[] {
  const seen = new Set<string>();
  const warnings: string[] = [];
  const add = (w: string) => {
    if (!seen.has(w)) {
      seen.add(w);
      warnings.push(w);
    }
  };
  // Top-level summary warnings
  for (const w of data.summary?.warnings || []) add(w);
  // Top-level warnings array
  for (const w of data.warnings || []) add(w);
  // Per-analysis warnings — prefix with marketplace name for context
  const analysisKeys: [string, string][] = [
    ["ebay_analysis", "eBay"],
    ["amazon_analysis", "Amazon"],
    ["facebook_analysis", "FB Marketplace"],
    ["mercadolibre_analysis", "MercadoLibre"],
  ];
  for (const [key, label] of analysisKeys) {
    for (const w of data[key]?.warnings || []) {
      // Prefix generic warnings with the marketplace so they aren't confusing
      const prefixed = w.startsWith(label) ? w : `${label}: ${w}`;
      add(prefixed);
    }
  }
  return warnings;
}

function extractConditionInfo(analysis: any): ConditionInfo | undefined {
  const ca = analysis?.condition_analysis;
  if (!ca || ca.requested_condition === "any") return undefined;
  return {
    requestedCondition: ca.requested_condition || "unknown",
    mixedConditions: ca.mixed_conditions ?? false,
    subsetCount: ca.condition_subset_count ?? 0,
    subsetMedian: ca.condition_subset_median ?? null,
    matchRate: ca.condition_match_rate ?? 1,
  };
}

function transformResponse(data: any): AnalysisResult {
  const primaryAnalysis = data.ebay_analysis || data.amazon_analysis;

  // Product info from API + market data from primary analysis
  const product: ResultProduct = {
    title: data.product?.title || "Unknown Product",
    brand: data.product?.brand || "",
    image: data.product?.image_url || "",
    comps: primaryAnalysis?.comps?.total_sold || 0,
    median_price:
      primaryAnalysis?.comps?.median_price || data.estimated_sale_price || 0,
    min_price: primaryAnalysis?.comps?.min_price || 0,
    max_price: primaryAnalysis?.comps?.max_price || 0,
    sales_per_day: primaryAnalysis?.comps?.sales_per_day || 0,
    competition: primaryAnalysis?.competition?.category || "—",
    trend_price: primaryAnalysis?.trend?.price_trend || 0,
  };

  const DEFAULT_SHIP: Record<string, number> = {
    ebay: 12,
    amazon_fba: 0,
    facebook_marketplace: 0,
    mercadolibre: 10,
  };

  const ESTIMATED_CHANNELS = new Set(["facebook_marketplace", "mercadolibre"]);

  // Channels sorted by profit
  const channels: Channel[] = (data.channels || [])
    .map((ch: any) => {
      const meta = MARKETPLACE_META[ch.marketplace] || {
        label: ch.marketplace,
        icon: "🏬",
      };
      const ship = ch.shipping_cost ?? DEFAULT_SHIP[ch.marketplace] ?? 0;
      const totalFees =
        (ch.estimated_sale_price || 0) - (ch.net_proceeds || 0) - ship;
      return {
        id: ch.marketplace,
        label: meta.label,
        icon: meta.icon,
        salePrice: (ch.estimated_sale_price || 0).toFixed(2),
        fees: Math.max(0, totalFees).toFixed(2),
        ship: ship.toFixed(2),
        profit: ch.profit.toFixed(2),
        roi: ch.roi_pct.toFixed(1),
        margin: ch.margin_pct.toFixed(1),
        estimated: ESTIMATED_CHANNELS.has(ch.marketplace),
      };
    })
    .sort(
      (a: Channel, b: Channel) => parseFloat(b.profit) - parseFloat(a.profit)
    );

  const rec = getRecStyle(data.recommendation || "watch");

  // API risk_score: higher = safer. UI shows Safety = 100 - risk.
  // So we invert: risk = 100 - api_risk_score, then UI does 100 - risk = api_risk_score.
  const risk = 100 - (data.risk_score ?? 50);

  const confidence = primaryAnalysis?.confidence?.score ?? 50;

  const pricing = primaryAnalysis?.pricing;
  const maxBuy = data.summary?.buy_box?.recommended_max_buy ?? 0;
  const headroom = data.summary?.buy_box?.headroom ?? 0;

  const estDaysToSell = Math.max(
    1,
    Math.round(primaryAnalysis?.velocity?.estimated_days_to_sell || 7)
  );

  return {
    product,
    channels,
    flipScore: data.flip_score ?? 0,
    recommendation: rec.text,
    recColor: rec.color,
    recIcon: rec.icon,
    velocity: data.velocity_score ?? 0,
    risk,
    confidence,
    mainProfit:
      channels.length > 0
        ? channels[0].profit
        : data.net_profit?.toFixed(2) || "0.00",
    mainROI:
      channels.length > 0 ? channels[0].roi : data.roi_pct?.toFixed(1) || "0.0",
    maxBuy: maxBuy.toFixed(2),
    headroom: headroom.toFixed(2),
    quickPrice: pricing?.quick_list?.toFixed(2) || "0.00",
    marketPrice:
      pricing?.market_list?.toFixed(2) ||
      data.estimated_sale_price?.toFixed(2) ||
      "0.00",
    stretchPrice: pricing?.stretch_list?.toFixed(2) || "0.00",
    warnings: collectWarnings(data),
    estDaysToSell,
    aiExplanation: data.ai_explanation || undefined,
    bestMarketplace: data.best_marketplace || undefined,
    bestMarketplaceReason: data.best_marketplace_reason || undefined,
    marketplaceDetails: buildMarketplaceDetails(data),
    conditionInfo: extractConditionInfo(primaryAnalysis),
  };
}
