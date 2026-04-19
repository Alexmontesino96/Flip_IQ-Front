import { getClientId, getVerifiedEmail } from "./usage";

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
  badge?: string;
  channelRole?: string;
  executionNote?: string;
  executionScore?: number;
  winProbability?: number;
  expectedProfit?: string;
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

export interface ExecutionInfo {
  marketScore: number;
  executionScore: number;
  finalScore: number;
  winProbability: number;
  expectedProfit: string;
  category: string;
  quantityGuidance: string;
  recommendedMarketplace?: string;
  bestProfitMarketplace?: string;
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
  estDaysToSell: string;
  aiExplanation?: string;
  bestMarketplace?: string;
  bestMarketplaceReason?: string;
  marketplaceDetails?: MarketplaceDetail[];
  conditionInfo?: ConditionInfo;
  executionInfo?: ExecutionInfo;
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
  executionScore?: number;
  winProbability?: number;
  channelRole?: string;
}

const SIGNAL_COLORS: Record<string, { color: string; icon: string }> = {
  positive: { color: "#22c55e", icon: "✅" },
  caution: { color: "#eab308", icon: "👁️" },
  negative: { color: "#ef4444", icon: "✋" },
};

const REC_LABELS: Record<string, string> = {
  buy: "BUY",
  buy_small: "BUY SMALL",
  watch: "WATCH",
  pass: "PASS",
};

function getRecStyle(recommendation: string, signal?: string) {
  const text =
    REC_LABELS[recommendation] || recommendation?.toUpperCase() || "—";
  const s = signal && SIGNAL_COLORS[signal];
  if (s) return { text, color: s.color, icon: s.icon };
  // Fallback when signal is missing (old backend)
  switch (recommendation) {
    case "buy":
      return { text, color: "#22c55e", icon: "✅" };
    case "buy_small":
      return { text, color: "#eab308", icon: "🟡" };
    case "watch":
      return { text, color: "#f97316", icon: "👁️" };
    case "pass":
      return { text, color: "#ef4444", icon: "✋" };
    default:
      return { text, color: "#94a3b8", icon: "❓" };
  }
}

export interface AiCompleteUpdate {
  aiExplanation?: string;
  flipScore?: number;
  risk?: number;
  recommendation?: string;
  recColor?: string;
  recIcon?: string;
}

export interface AnalysisProgress {
  stage: string;
  status: string;
  message: string;
  progress: number;
  elapsedMs?: number;
  details?: Record<string, unknown>;
}

export async function runAnalysisStream(
  query: string,
  costPrice: number,
  condition: string,
  onAnalysis: (result: AnalysisResult) => void,
  onAiComplete: (updates: AiCompleteUpdate) => void,
  onError: (error: ApiError) => void,
  onProgress?: (progress: AnalysisProgress) => void
): Promise<void> {
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

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Client-ID": getClientId(),
    Accept: "text/event-stream",
  };
  const email = getVerifiedEmail();
  if (email) headers["X-Verified-Email"] = email;

  const res = await fetch(`${API_URL}/api/v1/analysis/stream`, {
    method: "POST",
    credentials: "include",
    headers,
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

  const reader = res.body?.getReader();
  if (!reader) throw new ApiError(500, "No response body");

  const decoder = new TextDecoder();
  let buffer = "";
  let receivedAnalysis = false;
  let currentEvent = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("event: ")) {
          currentEvent = line.slice(7).trim();
        } else if (line.startsWith("data: ")) {
          const dataStr = line.slice(6);
          if (currentEvent === "done") break;
          if (currentEvent === "error") {
            const errData = JSON.parse(dataStr);
            onError(
              new ApiError(
                errData.status || 500,
                errData.detail || "Stream error",
                errData.reason
              )
            );
            return;
          }
          if (currentEvent === "analysis") {
            const data = JSON.parse(dataStr);
            const result = transformResponse(data);
            receivedAnalysis = true;
            onAnalysis(result);
          } else if (currentEvent === "progress") {
            const data = JSON.parse(dataStr);
            onProgress?.({
              stage: data.stage || "start",
              status: data.status || "active",
              message: data.message || "Analyzing product",
              progress:
                typeof data.progress === "number"
                  ? Math.max(0, Math.min(100, data.progress))
                  : 0,
              elapsedMs:
                typeof data.elapsed_ms === "number"
                  ? data.elapsed_ms
                  : undefined,
              details:
                data.details && typeof data.details === "object"
                  ? data.details
                  : undefined,
            });
          } else if (currentEvent === "ai_complete") {
            const data = JSON.parse(dataStr);
            const updates: AiCompleteUpdate = {};
            if (data.ai_explanation)
              updates.aiExplanation = data.ai_explanation;
            if (data.flip_score != null) updates.flipScore = data.flip_score;
            if (data.risk_score != null) updates.risk = 100 - data.risk_score;
            if (data.recommendation) {
              const rec = getRecStyle(
                data.recommendation,
                data.signal || data.summary?.signal
              );
              updates.recommendation = rec.text;
              updates.recColor = rec.color;
              updates.recIcon = rec.icon;
            }
            onAiComplete(updates);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (!receivedAnalysis) {
    throw new ApiError(500, "Stream ended without analysis data");
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

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Client-ID": getClientId(),
  };
  const email = getVerifiedEmail();
  if (email) headers["X-Verified-Email"] = email;

  const res = await fetch(`${API_URL}/api/v1/analysis/`, {
    method: "POST",
    credentials: "include",
    headers,
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
      executionScore: a.execution_analysis?.score,
      winProbability: a.execution_analysis?.win_probability,
      channelRole: a.execution_analysis?.channel_role,
    });
  }
  return details;
}

function extractExecutionInfo(data: any): ExecutionInfo | undefined {
  const e = data.execution_analysis;
  if (!e) return undefined;
  return {
    marketScore: data.market_score ?? data.flip_score ?? 0,
    executionScore: e.score ?? 0,
    finalScore: data.final_score ?? data.flip_score ?? 0,
    winProbability: e.win_probability ?? 0,
    expectedProfit: (e.expected_profit ?? 0).toFixed(2),
    category: e.category || "unknown",
    quantityGuidance: e.quantity_guidance || "Test small",
    recommendedMarketplace:
      data.recommended_marketplace || data.best_marketplace,
    bestProfitMarketplace: data.best_profit_marketplace,
  };
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

function getAnalysisForMarketplace(data: any, marketplace?: string) {
  if (!marketplace) return undefined;
  if (marketplace === "ebay") return data.ebay_analysis;
  if (marketplace === "amazon_fba" || marketplace === "amazon") {
    return data.amazon_analysis;
  }
  return undefined;
}

function hasUsableComps(analysis: any): boolean {
  return Boolean(
    analysis?.estimated_sale_price != null &&
    (analysis?.comps?.total_sold || 0) > 0
  );
}

function getPrimaryAnalysis(data: any) {
  const best = getAnalysisForMarketplace(data, data.best_marketplace);
  if (hasUsableComps(best)) return best;

  const candidates = [data.ebay_analysis, data.amazon_analysis].filter(Boolean);
  return (
    candidates.find((analysis) => hasUsableComps(analysis)) ||
    candidates[0] ||
    undefined
  );
}

function formatEstimatedDaysToSell(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `~${Math.max(1, Math.round(value))}d`;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "~7d";
    if (trimmed.toLowerCase() === "n/a") return "N/A";
    if (trimmed.startsWith("~")) return trimmed;
    return /\d$/.test(trimmed) ? `~${trimmed}d` : `~${trimmed}`;
  }

  return "~7d";
}

function transformResponse(data: any): AnalysisResult {
  const primaryAnalysis = getPrimaryAnalysis(data);

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
        badge: ch.label || undefined,
        channelRole: ch.channel_role || undefined,
        executionNote: ch.execution_note || undefined,
        executionScore:
          typeof ch.execution_score === "number"
            ? ch.execution_score
            : undefined,
        winProbability:
          typeof ch.win_probability === "number"
            ? ch.win_probability
            : undefined,
        expectedProfit:
          typeof ch.expected_profit === "number"
            ? ch.expected_profit.toFixed(2)
            : undefined,
        salePrice: (ch.estimated_sale_price || 0).toFixed(2),
        fees: Math.max(0, totalFees).toFixed(2),
        ship: ship.toFixed(2),
        profit: ch.profit.toFixed(2),
        roi: ch.roi_pct.toFixed(1),
        margin: ch.margin_pct.toFixed(1),
        estimated:
          Boolean(ch.is_estimated) || ESTIMATED_CHANNELS.has(ch.marketplace),
      };
    })
    .sort(
      (a: Channel, b: Channel) => parseFloat(b.profit) - parseFloat(a.profit)
    );

  const primaryChannel =
    channels.find((ch) => ch.channelRole === "recommended") ||
    channels.find((ch) => ch.id === data.recommended_marketplace) ||
    channels.find((ch) => ch.id === data.best_marketplace && !ch.estimated) ||
    channels.find((ch) => ch.badge === "BEST PROFIT") ||
    channels.find((ch) => !ch.estimated) ||
    channels[0];

  const rec = getRecStyle(data.recommendation || "watch", data.summary?.signal);

  // API risk_score: higher = safer. UI shows Safety = 100 - risk.
  // So we invert: risk = 100 - api_risk_score, then UI does 100 - risk = api_risk_score.
  const risk = 100 - (data.risk_score ?? 50);

  const confidence = primaryAnalysis?.confidence?.score ?? 50;

  const pricing = primaryAnalysis?.pricing;
  const maxBuy = data.summary?.buy_box?.recommended_max_buy ?? 0;
  const headroom = data.summary?.buy_box?.headroom ?? 0;

  const estDaysToSell = formatEstimatedDaysToSell(
    primaryAnalysis?.velocity?.estimated_days_to_sell
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
    mainProfit: primaryChannel
      ? primaryChannel.profit
      : data.net_profit?.toFixed(2) || "0.00",
    mainROI: primaryChannel
      ? primaryChannel.roi
      : data.roi_pct?.toFixed(1) || "0.0",
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
    executionInfo: extractExecutionInfo(data),
  };
}
