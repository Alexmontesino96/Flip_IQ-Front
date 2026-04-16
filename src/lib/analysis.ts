const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://flip-iq-fastapi.onrender.com";

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
  fees: string;
  profit: string;
  roi: string;
  margin: string;
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || `Error ${res.status}`);
  }

  const data = await res.json();
  return transformResponse(data);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
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

  // Channels sorted by profit
  const channels: Channel[] = (data.channels || [])
    .map((ch: any) => {
      const meta = MARKETPLACE_META[ch.marketplace] || {
        label: ch.marketplace,
        icon: "🏬",
      };
      const totalFees = (ch.estimated_sale_price || 0) - (ch.net_proceeds || 0);
      return {
        id: ch.marketplace,
        label: meta.label,
        icon: meta.icon,
        fees: totalFees.toFixed(2),
        profit: ch.profit.toFixed(2),
        roi: ch.roi_pct.toFixed(1),
        margin: ch.margin_pct.toFixed(1),
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
    warnings: data.summary?.warnings || [],
    estDaysToSell,
    aiExplanation: data.ai_explanation || undefined,
    bestMarketplace: data.best_marketplace || undefined,
  };
}
