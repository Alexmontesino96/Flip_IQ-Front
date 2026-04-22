/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  runAnalysis,
  runAnalysisStream,
  AnalysisResult,
  AiCompleteUpdate,
  AnalysisProgress,
  MarketplaceDetail,
  ApiError,
} from "@/lib/analysis";
import { checkStatus, submitEmail } from "@/lib/usage";
import EmailGate from "./EmailGate";
import { trackEvent } from "@/lib/tracking";
import {
  fetchProductSuggestions,
  registerSuggestionSelect,
  ProductSuggestion,
} from "@/lib/search";

const BarcodeScanner = dynamic(() => import("./BarcodeScanner"), {
  ssr: false,
});

const MONO = "'JetBrains Mono', ui-monospace, Menlo, monospace";
const DISPLAY = "'Inter Tight', -apple-system, system-ui, sans-serif";
const ACCENT = "#D4FF3D";

const SAMPLE_QUERIES = [
  { query: "AirPods Pro", name: "AirPods Pro", cost: "105" },
  { query: "Nintendo Switch OLED", name: "Switch OLED", cost: "160" },
  { query: "Nike Dunk Low", name: "Nike Dunk", cost: "65" },
  { query: "PS5 Console", name: "PS5", cost: "220" },
  { query: "Stanley Cup 40oz", name: "Stanley Cup", cost: "25" },
];

const ANALYSIS_PHASES = ["Product", "Market", "Comps", "Scores", "Brief"];

const STAGE_INDEX: Record<string, number> = {
  start: 0,
  identify: 0,
  category: 0,
  fetch: 1,
  matching: 2,
  scoring: 3,
  analysis: 3,
  ai: 4,
};

function formatElapsed(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getFallbackProgress(seconds: number) {
  if (seconds < 3) return 8;
  if (seconds < 10) return 24;
  if (seconds < 20) return 46;
  if (seconds < 32) return 64;
  return 78;
}

function getFallbackMessage(seconds: number) {
  if (seconds < 4) return "Starting live market scan";
  if (seconds < 12) return "Pulling sold comps and marketplace signals";
  if (seconds < 24) return "Matching relevant listings";
  if (seconds < 36) return "Building the profit model";
  return "Still working through live marketplace data";
}

function getNumberDetail(
  details: Record<string, unknown>,
  keys: string[]
): number | null {
  for (const key of keys) {
    const value = details[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return null;
}

function AnalysisProgressPanel({
  query,
  costPrice,
  condition,
  progress,
  elapsedSeconds,
}: {
  query: string;
  costPrice: string;
  condition: string;
  progress: AnalysisProgress | null;
  elapsedSeconds: number;
}) {
  const details = progress?.details || {};
  const activeIndex = progress
    ? (STAGE_INDEX[progress.stage] ?? 0)
    : Math.min(3, Math.floor(elapsedSeconds / 8));
  const progressPct = progress?.progress ?? getFallbackProgress(elapsedSeconds);
  const message = progress?.message || getFallbackMessage(elapsedSeconds);
  const ebayCount = getNumberDetail(details, [
    "ebay_clean_count",
    "ebay_count",
    "ebay_raw_count",
  ]);
  const amazonCount = getNumberDetail(details, [
    "amazon_clean_count",
    "amazon_count",
    "amazon_raw_count",
  ]);
  const fallbackUsed = Boolean(details.fallback_used);
  const slowNote =
    elapsedSeconds >= 18 && progress?.stage !== "analysis"
      ? "Live sources can take a few extra seconds."
      : null;

  const lanes = [
    {
      label: "eBay comps",
      value:
        ebayCount !== null
          ? `${ebayCount} found`
          : activeIndex >= 1
            ? "Scanning"
            : "Queued",
      tone: activeIndex >= 1 ? ACCENT : "rgba(245,245,242,0.3)",
    },
    {
      label: "Amazon data",
      value:
        amazonCount !== null
          ? `${amazonCount} found`
          : activeIndex >= 1
            ? "Checking"
            : "Queued",
      tone: activeIndex >= 1 ? ACCENT : "rgba(245,245,242,0.3)",
    },
    {
      label: "Comp match",
      value:
        activeIndex > 2
          ? "Selected"
          : activeIndex === 2
            ? "Filtering"
            : "Queued",
      tone: activeIndex >= 2 ? "#FFB84D" : "rgba(245,245,242,0.3)",
    },
    {
      label: "Deal model",
      value:
        activeIndex > 3 ? "Ready" : activeIndex === 3 ? "Scoring" : "Queued",
      tone: activeIndex >= 3 ? "#4ade80" : "rgba(245,245,242,0.3)",
    },
  ];

  return (
    <div
      className="fade-up"
      style={{
        background: "rgba(245,245,242,0.03)",
        border: "1px solid rgba(245,245,242,0.08)",
        borderRadius: 20,
        padding: 16,
        marginBottom: 14,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <span className="pulse-dot" />
            <span
              style={{
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: 1,
              }}
            >
              Live analysis
            </span>
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(245,245,242,0.45)",
              lineHeight: 1.4,
              wordBreak: "break-word",
            }}
          >
            {query || "Product"} · ${costPrice || "0"} · {condition}
          </div>
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 12,
            color: ACCENT,
            padding: "5px 8px",
            borderRadius: 8,
            background: "rgba(212,255,61,0.08)",
            border: "1px solid rgba(212,255,61,0.18)",
            flexShrink: 0,
          }}
        >
          {formatElapsed(elapsedSeconds)}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            marginBottom: 8,
          }}
        >
          <div style={{ fontSize: 13, color: "#F5F5F2", fontWeight: 700 }}>
            {message}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(245,245,242,0.4)",
              fontFamily: MONO,
            }}
          >
            {progressPct}%
          </div>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 999,
            background: "rgba(245,245,242,0.06)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progressPct}%`,
              height: "100%",
              borderRadius: 999,
              background: `linear-gradient(90deg, ${ACCENT}, #4ade80)`,
              transition: "width 0.5s ease",
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 6,
          marginBottom: 14,
        }}
      >
        {ANALYSIS_PHASES.map((phase, index) => {
          const complete =
            index < activeIndex ||
            (progress?.status === "complete" && index === activeIndex);
          const active = index === activeIndex && !complete;
          return (
            <div key={phase} style={{ minWidth: 0 }}>
              <div
                style={{
                  height: 5,
                  borderRadius: 999,
                  background: complete
                    ? ACCENT
                    : active
                      ? "rgba(212,255,61,0.5)"
                      : "rgba(245,245,242,0.08)",
                  marginBottom: 6,
                  transition: "background 0.3s ease",
                }}
              />
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  color:
                    complete || active
                      ? "rgba(245,245,242,0.7)"
                      : "rgba(245,245,242,0.25)",
                  fontWeight: 700,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textTransform: "uppercase" as const,
                  letterSpacing: 0.5,
                }}
              >
                {phase}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 8,
        }}
      >
        {lanes.map((lane) => (
          <div
            key={lane.label}
            style={{
              padding: "10px 11px",
              borderRadius: 10,
              border: "1px solid rgba(245,245,242,0.06)",
              background: "rgba(245,245,242,0.03)",
              minHeight: 58,
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 9,
                color: "rgba(245,245,242,0.4)",
                fontWeight: 700,
                marginBottom: 5,
                textTransform: "uppercase" as const,
                letterSpacing: 1,
              }}
            >
              {lane.label}
            </div>
            <div style={{ fontSize: 13, color: lane.tone, fontWeight: 800 }}>
              {lane.value}
            </div>
          </div>
        ))}
      </div>

      {(fallbackUsed || slowNote) && (
        <div
          style={{
            marginTop: 10,
            fontSize: 11,
            color: "#fbbf24",
            lineHeight: 1.5,
          }}
        >
          {fallbackUsed
            ? "UPC fallback is using the resolved product title."
            : slowNote}
        </div>
      )}
    </div>
  );
}

function ResultPreviewSkeleton() {
  return (
    <div
      className="fade-up"
      style={{
        background: "rgba(245,245,242,0.02)",
        border: "1px solid rgba(245,245,242,0.06)",
        borderRadius: 20,
        padding: 16,
        marginBottom: 14,
      }}
    >
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div className="skeleton-block" style={{ width: 58, height: 58 }} />
        <div style={{ flex: 1, paddingTop: 4 }}>
          <div className="skeleton-line" style={{ width: "46%" }} />
          <div className="skeleton-line" style={{ width: "86%" }} />
          <div className="skeleton-line" style={{ width: "36%" }} />
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div
              className="skeleton-block"
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                margin: "0 auto 7px",
              }}
            />
            <div
              className="skeleton-line"
              style={{ width: "70%", margin: "0 auto" }}
            />
          </div>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 8,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              borderRadius: 10,
              background: "rgba(245,245,242,0.03)",
              padding: "12px 8px",
            }}
          >
            <div className="skeleton-line" style={{ width: "58%" }} />
            <div className="skeleton-line" style={{ width: "88%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function isLowTrustResult(result: AnalysisResult) {
  return result.confidence < 40 || result.product.comps < 5;
}

function channelConfidenceLabel(channelId: string) {
  if (channelId === "amazon_fba") return "Buy Box chance";
  if (channelId === "ebay") return "Sell-through confidence";
  return "Execution confidence";
}

function getHeroScore(result: AnalysisResult) {
  if (result.executionInfo) {
    return {
      label: "EXEC",
      value: result.executionInfo.executionScore,
    };
  }
  return {
    label: "CONF",
    value: result.confidence,
  };
}

function looksLikeBarcode(value: string) {
  return /^\d{8,14}$/.test(value.trim());
}

function formatSuggestionPrice(value: number | null) {
  if (value === null || !Number.isFinite(value)) return null;
  return value >= 100 ? `$${value.toFixed(0)}` : `$${value.toFixed(2)}`;
}

function getSuggestionSourceLabel(source: string | null) {
  if (source === "local") return "Saved matches";
  if (source === "hybrid") return "Saved + live marketplace";
  if (source === "local_only") return "Saved matches only";
  return "Product suggestions";
}

export default function FlipIQCalculator() {
  const [query, setQuery] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("q") || "";
  });
  const [costPrice, setCostPrice] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("cost") || "";
  });
  const [condition, setCondition] = useState(() => {
    if (typeof window === "undefined") return "new";
    return (
      new URLSearchParams(window.location.search).get("condition") || "new"
    );
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [tier, setTier] = useState("anonymous");
  const [loadingStep, setLoadingStep] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [analysisProgress, setAnalysisProgress] =
    useState<AnalysisProgress | null>(null);
  const [analysisStartedAt, setAnalysisStartedAt] = useState<number | null>(
    null
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [suggestionsSource, setSuggestionsSource] = useState<string | null>(
    null
  );
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const suggestionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionAbortRef = useRef<AbortController | null>(null);
  const selectedSuggestionTitleRef = useRef<string | null>(null);
  const autoExecutedRef = useRef(false);
  const analysisActive = loading || aiLoading;

  const LOADING_STEPS = [
    "Searching eBay sold items...",
    "Checking Amazon prices...",
    "Calculating fees across 4 channels...",
    "Generating recommendation...",
  ];

  useEffect(() => {
    checkStatus().then((s) => {
      setRemaining(s.remaining);
      setTier(s.tier);
    });
  }, []);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep((s) => (s < 3 ? s + 1 : s));
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!analysisActive || !analysisStartedAt) return;

    const updateElapsed = () => {
      setElapsedSeconds(
        Math.max(0, Math.floor((Date.now() - analysisStartedAt) / 1000))
      );
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [analysisActive, analysisStartedAt]);

  useEffect(() => {
    if (suggestionTimerRef.current) {
      clearTimeout(suggestionTimerRef.current);
    }
    suggestionAbortRef.current?.abort();

    const trimmed = query.trim();
    if (
      trimmed.length < 2 ||
      looksLikeBarcode(trimmed) ||
      selectedSuggestionTitleRef.current === trimmed
    ) {
      setSuggestions([]);
      setSuggestionsSource(null);
      setSuggestionsLoading(false);
      return;
    }

    suggestionTimerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      suggestionAbortRef.current = controller;
      setSuggestionsLoading(true);

      try {
        const data = await fetchProductSuggestions(
          trimmed,
          8,
          controller.signal
        );
        setSuggestions(data.results || []);
        setSuggestionsSource(data.source || null);
        setSuggestionsOpen((data.results || []).length > 0);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setSuggestions([]);
          setSuggestionsSource(null);
        }
      } finally {
        if (suggestionAbortRef.current === controller) {
          setSuggestionsLoading(false);
          suggestionAbortRef.current = null;
        }
      }
    }, 300);

    return () => {
      if (suggestionTimerRef.current) {
        clearTimeout(suggestionTimerRef.current);
      }
      suggestionAbortRef.current?.abort();
    };
  }, [query]);

  const executeAnalysisFallback = useCallback(
    async (q: string, cost: string, cond: string, isRetry: boolean) => {
      try {
        setAnalysisStartedAt(Date.now());
        setElapsedSeconds(0);
        setAnalysisProgress(null);
        const r = await runAnalysis(q.trim(), parseFloat(cost), cond);
        setResult(r);
        setLoading(false);
        setAnalysisProgress({
          stage: "analysis",
          status: "complete",
          message: "Decision ready",
          progress: 100,
        });
        trackEvent("analysis_completed", {
          query: q,
          recommendation: r.recommendation,
          flipScore: r.flipScore,
        });
        checkStatus().then((s) => {
          setRemaining(s.remaining);
          setTier(s.tier);
        });
        setTimeout(
          () =>
            resultRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            }),
          100
        );
      } catch (err) {
        setLoading(false);
        setAnalysisProgress(null);
        if (
          !isRetry &&
          err instanceof ApiError &&
          err.reason === "free_limit_reached"
        ) {
          setShowEmailGate(true);
        } else {
          setError(
            err instanceof Error ? err.message : "Error analyzing product"
          );
        }
      }
    },
    []
  );

  const executeAnalysis = useCallback(
    async (q: string, cost: string, cond: string, isRetry = false) => {
      setLoading(true);
      setLoadingStep(0);
      setError(null);
      setResult(null);
      setAiLoading(false);
      setAnalysisStartedAt(Date.now());
      setElapsedSeconds(0);
      setAnalysisProgress({
        stage: "start",
        status: "active",
        message: "Starting live market scan",
        progress: 3,
      });
      trackEvent("analysis_started", { query: q, cost });

      try {
        await runAnalysisStream(
          q.trim(),
          parseFloat(cost),
          cond,
          (r: AnalysisResult) => {
            setResult(r);
            setLoading(false);
            setAiLoading(true);
            setAnalysisProgress({
              stage: "analysis",
              status: "complete",
              message: "Decision ready",
              progress: 88,
            });
            trackEvent("analysis_completed", {
              query: q,
              recommendation: r.recommendation,
              flipScore: r.flipScore,
            });
            checkStatus().then((s) => {
              setRemaining(s.remaining);
              setTier(s.tier);
            });
            setTimeout(
              () =>
                resultRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                }),
              100
            );
          },
          (updates: AiCompleteUpdate) => {
            setResult((prev) => (prev ? { ...prev, ...updates } : prev));
            setAiLoading(false);
            setAnalysisProgress({
              stage: "ai",
              status: "complete",
              message: "AI brief ready",
              progress: 100,
            });
          },
          (err: ApiError) => {
            setLoading(false);
            setAiLoading(false);
            setAnalysisProgress(null);
            if (!isRetry && err.reason === "free_limit_reached") {
              setShowEmailGate(true);
            } else {
              setError(err.message);
            }
          },
          (progress: AnalysisProgress) => {
            setAnalysisProgress(progress);
          }
        );
      } catch (err) {
        // Stream endpoint failed (e.g. 404, network error) — fallback
        if (err instanceof ApiError && err.reason === "free_limit_reached") {
          setLoading(false);
          setAnalysisProgress(null);
          if (!isRetry) {
            setShowEmailGate(true);
          } else {
            setError(err.message);
          }
        } else {
          await executeAnalysisFallback(q, cost, cond, isRetry);
        }
      }
    },
    [executeAnalysisFallback]
  );

  // Auto-execute when navigated from /search with all params
  useEffect(() => {
    if (autoExecutedRef.current) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("auto") !== "1") return;
    const q = params.get("q");
    const c = params.get("cost");
    const cond = params.get("condition") || "new";
    if (!q || !c || parseFloat(c) <= 0) return;
    autoExecutedRef.current = true;
    // Clean URL params without reload
    window.history.replaceState({}, "", "/free");
    executeAnalysis(q, c, cond);
  }, [executeAnalysis]);

  const costValid = costPrice !== "" && parseFloat(costPrice) > 0;

  const handleSuggestionSelect = (product: ProductSuggestion) => {
    selectedSuggestionTitleRef.current = product.title;
    setQuery(product.title);
    setSuggestions([]);
    setSuggestionsOpen(false);
    setSuggestionsSource(null);
    trackEvent("suggestion_selected", {
      productId: product.id ?? "live",
      source: suggestionsSource ?? "unknown",
      hasPriceHint: product.price_hint !== null ? 1 : 0,
    });

    if (product.id !== null) {
      registerSuggestionSelect(product.id).catch(() => undefined);
    }
  };

  const handleAnalyze = async () => {
    if (!query || !costValid) return;
    setSuggestionsOpen(false);
    setSuggestions([]);
    executeAnalysis(query, costPrice, condition);
  };

  const handleEmailSubmit = async (emailValue: string) => {
    try {
      await submitEmail(emailValue);
    } catch {
      // best-effort — email saved to localStorage regardless
    }
    setShowEmailGate(false);
    // Refresh status — now verified with 100/day
    const s = await checkStatus();
    setRemaining(s.remaining);
    setTier(s.tier);
    // Retry the analysis (isRetry=true prevents re-showing gate)
    executeAnalysis(query, costPrice, condition, true);
  };

  const handleWaitlist = async () => {
    if (!email.includes("@")) return;
    setEmailSent(true);
    trackEvent("email_submitted", { source: "waitlist" });
    try {
      await submitEmail(email);
    } catch {
      // best-effort
    }
  };

  const pickSample = (q: string, cost?: string) => {
    selectedSuggestionTitleRef.current = q;
    setQuery(q);
    setSuggestions([]);
    setSuggestionsOpen(false);
    if (cost) setCostPrice(cost);
    trackEvent("example_clicked", { product: q });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        color: "#F5F5F2",
        fontFamily: DISPLAY,
      }}
    >
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 16px 60px" }}>
        {/* ── HEADER ── */}
        <div
          style={{
            padding: "20px 0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: ACCENT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                fontWeight: 800,
                color: "#0A0A0A",
              }}
            >
              F
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#F5F5F2" }}>
              FlipIQ
            </span>
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              fontFamily: MONO,
              padding: "5px 12px",
              borderRadius: 100,
              background: "rgba(212,255,61,0.08)",
              border: "1px solid rgba(212,255,61,0.2)",
              color: ACCENT,
              letterSpacing: 1,
              textTransform: "uppercase" as const,
            }}
          >
            Live Data
          </span>
        </div>

        {/* ── HERO ── */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: 2,
              textTransform: "uppercase" as const,
              color: "rgba(245,245,242,0.4)",
              marginBottom: 10,
            }}
          >
            {(() => {
              const h = new Date().getHours();
              if (h < 12) return "GOOD MORNING";
              if (h < 18) return "GOOD AFTERNOON";
              return "GOOD EVENING";
            })()}
          </div>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: -1.5,
              lineHeight: 1.1,
              marginBottom: 10,
              color: "#F5F5F2",
            }}
          >
            What are you flipping today?
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "rgba(245,245,242,0.55)",
              lineHeight: 1.6,
            }}
          >
            Compare profit across eBay, Amazon, FBMP &amp; MercadoLibre in one
            search.
          </p>
        </div>

        {/* ── BARCODE SCANNER ── */}
        {scanning && (
          <BarcodeScanner
            onScan={(barcode) => {
              selectedSuggestionTitleRef.current = barcode;
              setQuery(barcode);
              setSuggestions([]);
              setSuggestionsOpen(false);
              setScanning(false);
            }}
            onClose={() => setScanning(false)}
          />
        )}

        {/* ── INPUT FORM ── */}
        <div
          style={{
            background: "rgba(245,245,242,0.03)",
            border: "1px solid rgba(245,245,242,0.08)",
            borderRadius: 24,
            padding: 20,
            marginBottom: 16,
          }}
        >
          {/* Query */}
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                fontFamily: MONO,
                fontSize: 9,
                letterSpacing: 2,
                textTransform: "uppercase" as const,
                color: "rgba(245,245,242,0.45)",
                fontWeight: 600,
                marginBottom: 6,
                display: "block",
              }}
            >
              Product / UPC / Barcode
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="input-field"
                placeholder="Type product name or scan barcode..."
                value={query}
                onChange={(e) => {
                  selectedSuggestionTitleRef.current = null;
                  setQuery(e.target.value);
                  setSuggestionsOpen(true);
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setSuggestionsOpen(true);
                }}
                onBlur={() => {
                  window.setTimeout(() => setSuggestionsOpen(false), 140);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                style={{
                  paddingRight: 44,
                  fontSize: 14,
                }}
              />
              <button
                type="button"
                onClick={() => setScanning(true)}
                style={{
                  position: "absolute",
                  right: 6,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  border: `1px solid rgba(212,255,61,0.25)`,
                  background: "rgba(212,255,61,0.08)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  padding: 0,
                }}
                aria-label="Scan barcode"
                title="Scan barcode with camera"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={ACCENT}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
              {suggestionsOpen &&
                (suggestions.length > 0 || suggestionsLoading) && (
                  <div
                    role="listbox"
                    aria-label="Product suggestions"
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: "calc(100% + 8px)",
                      zIndex: 40,
                      borderRadius: 16,
                      border: "1px solid rgba(245,245,242,0.1)",
                      background: "rgba(14,14,14,0.98)",
                      boxShadow: "0 20px 55px rgba(0,0,0,0.5)",
                      overflow: "hidden",
                      backdropFilter: "blur(18px)",
                    }}
                  >
                    {suggestions.length === 0 && suggestionsLoading ? (
                      <div
                        style={{
                          padding: 14,
                          color: "rgba(245,245,242,0.58)",
                          fontSize: 13,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span className="pulse-dot" />
                        Searching products...
                      </div>
                    ) : (
                      suggestions.map((item, index) => {
                        const priceHint = formatSuggestionPrice(
                          item.price_hint
                        );
                        const meta = [item.brand, item.category]
                          .filter(Boolean)
                          .join(" · ");

                        return (
                          <button
                            type="button"
                            className="suggestion-option"
                            key={`${item.id ?? item.title}-${index}`}
                            role="option"
                            aria-selected={false}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSuggestionSelect(item)}
                            style={{
                              width: "100%",
                              border: "none",
                              borderBottom:
                                index === suggestions.length - 1
                                  ? "none"
                                  : "1px solid rgba(245,245,242,0.06)",
                              background: "transparent",
                              color: "#F5F5F2",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              padding: "10px 12px",
                              textAlign: "left",
                              fontFamily: DISPLAY,
                            }}
                          >
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt=""
                                style={{
                                  width: 42,
                                  height: 42,
                                  borderRadius: 10,
                                  objectFit: "cover",
                                  background: "rgba(245,245,242,0.06)",
                                  flexShrink: 0,
                                }}
                              />
                            ) : (
                              <span
                                aria-hidden="true"
                                style={{
                                  width: 42,
                                  height: 42,
                                  borderRadius: 10,
                                  background: "rgba(212,255,61,0.1)",
                                  color: ACCENT,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  fontWeight: 800,
                                }}
                              >
                                {item.title.charAt(0).toUpperCase()}
                              </span>
                            )}
                            <span style={{ minWidth: 0, flex: 1 }}>
                              <span
                                style={{
                                  display: "block",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  fontSize: 13,
                                  fontWeight: 700,
                                  lineHeight: 1.25,
                                }}
                              >
                                {item.title}
                              </span>
                              {meta && (
                                <span
                                  style={{
                                    display: "block",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    color: "rgba(245,245,242,0.45)",
                                    fontSize: 11,
                                    marginTop: 3,
                                  }}
                                >
                                  {meta}
                                </span>
                              )}
                            </span>
                            {priceHint && (
                              <span
                                style={{
                                  fontFamily: MONO,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: ACCENT,
                                  flexShrink: 0,
                                }}
                              >
                                {priceHint}
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                    {(suggestionsSource || suggestionsLoading) &&
                      suggestions.length > 0 && (
                        <div
                          style={{
                            padding: "8px 12px",
                            borderTop: "1px solid rgba(245,245,242,0.06)",
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 10,
                            color: "rgba(245,245,242,0.38)",
                            fontFamily: MONO,
                            fontSize: 9,
                            letterSpacing: 1.2,
                            textTransform: "uppercase",
                          }}
                        >
                          <span>
                            {getSuggestionSourceLabel(suggestionsSource)}
                          </span>
                          {suggestionsLoading && <span>Updating</span>}
                        </div>
                      )}
                  </div>
                )}
            </div>
          </div>

          {/* Sample products — always visible */}
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 9,
                letterSpacing: 2,
                textTransform: "uppercase" as const,
                color: "rgba(245,245,242,0.45)",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Quick start
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
              }}
            >
              {SAMPLE_QUERIES.map((s) => (
                <button
                  key={s.query}
                  className="sample-chip"
                  onClick={() => pickSample(s.query, s.cost)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Cost + Condition Row */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  letterSpacing: 2,
                  textTransform: "uppercase" as const,
                  color: "rgba(245,245,242,0.45)",
                  fontWeight: 600,
                  marginBottom: 6,
                  display: "block",
                }}
              >
                Your cost ($)
              </label>
              <input
                type="number"
                className="input-field"
                placeholder="0.00"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                style={{
                  fontFamily: MONO,
                  fontSize: 14,
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  letterSpacing: 2,
                  textTransform: "uppercase" as const,
                  color: "rgba(245,245,242,0.45)",
                  fontWeight: 600,
                  marginBottom: 6,
                  display: "block",
                }}
              >
                Condition
              </label>
              <div style={{ display: "flex", gap: 4 }}>
                {["new", "used"].map((c) => (
                  <button
                    key={c}
                    className={`cond-btn ${condition === c ? "active" : ""}`}
                    onClick={() => setCondition(c)}
                  >
                    {c === "new" ? "New" : "Used"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Analyze Button */}
          <button
            className="cta-btn"
            disabled={!query || !costValid || loading}
            onClick={handleAnalyze}
          >
            {loading ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(10,10,10,0.3)",
                    borderTopColor: "#0A0A0A",
                    borderRadius: "50%",
                    animation: "spin 0.6s linear infinite",
                    display: "inline-block",
                  }}
                />
                {LOADING_STEPS[loadingStep]}
              </span>
            ) : (
              "Analyze product"
            )}
          </button>
          {remaining !== null && (
            <div
              style={{
                textAlign: "center",
                marginTop: 8,
                fontSize: 12,
                color: "rgba(245,245,242,0.3)",
              }}
            >
              {remaining} analyses remaining
              {tier !== "anonymous" ? "" : " (free)"}
            </div>
          )}
        </div>

        {/* ── EMAIL GATE ── */}
        {showEmailGate && (
          <EmailGate
            onSubmit={handleEmailSubmit}
            onClose={() => setShowEmailGate(false)}
          />
        )}

        {/* ── ERROR ── */}
        {error && (
          <div
            className="fade-up"
            style={{
              background: "rgba(245,245,242,0.02)",
              border: "1px solid rgba(245,245,242,0.06)",
              borderRadius: 20,
              padding: 24,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>
              Could not analyze product
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "rgba(245,245,242,0.5)",
                marginBottom: 16,
                lineHeight: 1.6,
              }}
            >
              {error}
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                justifyContent: "center",
              }}
            >
              {SAMPLE_QUERIES.map((s) => (
                <button
                  key={s.query}
                  className="sample-chip"
                  onClick={() => pickSample(s.query, s.cost)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && !result && (
          <>
            <AnalysisProgressPanel
              query={query}
              costPrice={costPrice}
              condition={condition}
              progress={analysisProgress}
              elapsedSeconds={elapsedSeconds}
            />
            <ResultPreviewSkeleton />
          </>
        )}

        {/* ══════════════ RESULT ══════════════ */}
        {result && (
          <div ref={resultRef} className="fade-up">
            {/* Product info */}
            <div
              style={{
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: "rgba(245,245,242,0.05)",
                  overflow: "hidden",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {result.product.image ? (
                  <img
                    src={result.product.image}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      const sibling = (e.target as HTMLImageElement)
                        .nextSibling as HTMLElement | null;
                      if (sibling) sibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <span
                  style={{
                    fontSize: 24,
                    display: result.product.image ? "none" : "flex",
                  }}
                >
                  📦
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 9,
                    color: "rgba(245,245,242,0.4)",
                    fontWeight: 600,
                    letterSpacing: 1,
                    textTransform: "uppercase" as const,
                  }}
                >
                  {result.product.brand}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    color: "#F5F5F2",
                  }}
                >
                  {result.product.title}
                </div>
              </div>
            </div>

            {/* Verdict Block */}
            {(() => {
              const rec = result.recommendation;
              const heroScore = getHeroScore(result);
              let verdictBg = ACCENT;
              let verdictColor = "#0A0A0A";
              let verdictBorder = "transparent";
              if (rec === "BUY SMALL") {
                verdictBg = "rgba(245,245,242,0.08)";
                verdictColor = "#F5F5F2";
                verdictBorder = "rgba(245,245,242,0.12)";
              } else if (rec === "WATCH") {
                verdictBg = "rgba(255,184,77,0.12)";
                verdictColor = "#FFB84D";
                verdictBorder = "rgba(255,184,77,0.2)";
              } else if (rec === "PASS") {
                verdictBg = "rgba(255,100,100,0.1)";
                verdictColor = "#FF6464";
                verdictBorder = "rgba(255,100,100,0.2)";
              }
              return (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    borderRadius: 16,
                    background: verdictBg,
                    border: `1px solid ${verdictBorder}`,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 34,
                      fontWeight: 800,
                      fontFamily: DISPLAY,
                      color: verdictColor,
                      lineHeight: 1,
                    }}
                  >
                    {rec}
                  </div>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      border: `2px solid ${rec === "BUY" ? "#0A0A0A" : verdictColor}`,
                      display: "flex",
                      flexDirection: "column" as const,
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: DISPLAY,
                        fontSize: 20,
                        fontWeight: 800,
                        color: verdictColor,
                        lineHeight: 1,
                      }}
                    >
                      {heroScore.value}
                    </div>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 7,
                        color:
                          rec === "BUY"
                            ? "rgba(10,10,10,0.6)"
                            : "rgba(245,245,242,0.5)",
                        letterSpacing: 0.5,
                        textTransform: "uppercase" as const,
                      }}
                    >
                      {heroScore.label} /100
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Main result card */}
            <div
              style={{
                background: "rgba(245,245,242,0.03)",
                border: "1px solid rgba(245,245,242,0.08)",
                borderRadius: 20,
                padding: 20,
                marginBottom: 12,
              }}
            >
              {/* Condition Banner */}
              {(() => {
                const ci = result.conditionInfo;
                if (!ci) return null;
                let text = "";
                if (ci.subsetCount > 0 && ci.subsetMedian != null) {
                  text = `Based on all conditions. Only ${ci.subsetCount} '${ci.requestedCondition}' sales found (median $${ci.subsetMedian.toFixed(2)}). Prices may differ for '${ci.requestedCondition}'.`;
                } else if (ci.subsetCount === 0 && ci.matchRate < 0.5) {
                  text = `No '${ci.requestedCondition}' sales found. Prices based on all conditions.`;
                }
                if (!text) return null;
                return (
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "flex-start",
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: "rgba(56,189,248,0.06)",
                      border: "1px solid rgba(56,189,248,0.15)",
                      marginBottom: 12,
                    }}
                  >
                    <span style={{ fontSize: 14, flexShrink: 0 }}>
                      &#x2139;&#xFE0F;
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#7dd3fc",
                        lineHeight: 1.5,
                      }}
                    >
                      {text}
                    </span>
                  </div>
                );
              })()}

              {result.executionInfo && (
                <div
                  style={{
                    padding: "14px 14px",
                    borderRadius: 14,
                    background: isLowTrustResult(result)
                      ? "rgba(251,191,36,0.055)"
                      : "rgba(56,189,248,0.055)",
                    border: `1px solid ${
                      isLowTrustResult(result)
                        ? "rgba(251,191,36,0.16)"
                        : "rgba(56,189,248,0.16)"
                    }`,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      alignItems: "flex-start",
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 10,
                          color: isLowTrustResult(result)
                            ? "#fbbf24"
                            : "#7dd3fc",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          marginBottom: 3,
                        }}
                      >
                        Should I buy?
                      </div>
                      <div
                        style={{
                          fontSize: 22,
                          lineHeight: 1.1,
                          fontWeight: 900,
                          color: isLowTrustResult(result)
                            ? "#fbbf24"
                            : result.recColor,
                        }}
                      >
                        {result.recommendation === "BUY"
                          ? "YES"
                          : result.recommendation === "BUY SMALL"
                            ? "YES (LIMITED)"
                            : result.recommendation === "WATCH"
                              ? "NOT YET"
                              : "NO"}
                      </div>
                    </div>
                    <div
                      style={{
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: "rgba(245,245,242,0.4)",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          marginBottom: 3,
                        }}
                      >
                        Execution confidence
                      </div>
                      <div
                        style={{
                          fontSize: 22,
                          lineHeight: 1.1,
                          fontWeight: 900,
                          color: ACCENT,
                        }}
                      >
                        {Math.round(result.executionInfo.winProbability * 100)}%
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: 8,
                    }}
                  >
                    {[
                      {
                        l: "Risk",
                        v:
                          result.executionInfo.executionScore < 45
                            ? "Execution friction"
                            : result.executionInfo.executionScore < 70
                              ? "Price / access"
                              : "Controlled",
                        c:
                          result.executionInfo.executionScore < 45
                            ? "#f87171"
                            : result.executionInfo.executionScore < 70
                              ? "#fbbf24"
                              : "#4ade80",
                      },
                      {
                        l: "Expected outcome",
                        v: isLowTrustResult(result)
                          ? "Insufficient data"
                          : `$${result.executionInfo.outcomeLow}–$${result.executionInfo.outcomeHigh}`,
                        c: isLowTrustResult(result) ? "#fbbf24" : "#4ade80",
                      },
                    ].map((item) => (
                      <div
                        key={item.l}
                        style={{
                          borderRadius: 10,
                          background: "rgba(245,245,242,0.04)",
                          padding: "9px 10px",
                          minHeight: 54,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 9,
                            color: "rgba(245,245,242,0.4)",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            marginBottom: 4,
                          }}
                        >
                          {item.l}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: item.c,
                            fontWeight: 800,
                            lineHeight: 1.2,
                          }}
                        >
                          {item.v}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Score Bars */}
              <div
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: "rgba(245,245,242,0.03)",
                  border: "1px solid rgba(245,245,242,0.06)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {[
                  {
                    label: "Flip",
                    value: result.flipScore,
                    color: "#4ade80",
                    warning: false,
                  },
                  {
                    label: "Speed",
                    value: result.velocity,
                    color: "#38bdf8",
                    warning: result.velocity < 40,
                  },
                  {
                    label: "Safety",
                    value: 100 - result.risk,
                    color: "#FFB84D",
                    warning: 100 - result.risk < 40,
                  },
                  {
                    label: "Conf.",
                    value: result.confidence,
                    color: "#a78bfa",
                    warning: result.confidence < 50,
                  },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: MONO,
                          fontSize: 10,
                          color: "rgba(245,245,242,0.45)",
                          textTransform: "uppercase" as const,
                          letterSpacing: 1,
                        }}
                      >
                        {bar.label}
                      </span>
                      <span
                        style={{
                          fontFamily: DISPLAY,
                          fontSize: 13,
                          fontWeight: 600,
                          color: bar.warning ? "#FFB84D" : bar.color,
                        }}
                      >
                        {bar.value}/100
                      </span>
                    </div>
                    <div
                      style={{
                        height: 4,
                        borderRadius: 999,
                        background: "rgba(245,245,242,0.06)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.max(0, Math.min(100, bar.value))}%`,
                          height: "100%",
                          borderRadius: 999,
                          background: bar.color,
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Key Numbers */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 8,
                  marginTop: 16,
                }}
              >
                {(() => {
                  const weightedProfit =
                    result.executionInfo?.expectedProfit || result.mainProfit;
                  const profitNum = parseFloat(weightedProfit);
                  const lowTrust = isLowTrustResult(result);
                  return [
                    {
                      l: result.executionInfo ? "Execution" : "Confidence",
                      v: result.executionInfo
                        ? `${result.executionInfo.executionScore}/100`
                        : `${result.confidence}/100`,
                      c: result.executionInfo
                        ? result.executionInfo.executionScore >= 70
                          ? "#4ade80"
                          : result.executionInfo.executionScore >= 45
                            ? "#fbbf24"
                            : "#f87171"
                        : ACCENT,
                    },
                    {
                      l: lowTrust ? "Profit signal *" : "Expected profit",
                      v: lowTrust
                        ? `$${weightedProfit}*`
                        : `$${weightedProfit}`,
                      c: lowTrust
                        ? "#fbbf24"
                        : profitNum > 0
                          ? "#4ade80"
                          : "#FF6464",
                    },
                    {
                      l:
                        result.confidence < 60
                          ? "Days to sell *"
                          : "Days to sell",
                      v: result.estDaysToSell,
                      c: result.confidence < 60 ? "#fbbf24" : ACCENT,
                    },
                  ];
                })().map((s, i) => (
                  <div
                    key={i}
                    style={{
                      textAlign: "center",
                      padding: "10px 6px",
                      borderRadius: 10,
                      background: "rgba(245,245,242,0.03)",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 9,
                        color: "rgba(245,245,242,0.4)",
                        textTransform: "uppercase" as const,
                        fontWeight: 600,
                        letterSpacing: 1,
                        marginBottom: 3,
                      }}
                    >
                      {s.l}
                    </div>
                    <div
                      style={{
                        fontFamily: DISPLAY,
                        fontSize: 20,
                        fontWeight: 700,
                        color: s.c,
                      }}
                    >
                      {s.v}
                    </div>
                  </div>
                ))}
              </div>

              {result.executionInfo && (
                <details
                  style={{
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: "1px solid rgba(245,245,242,0.06)",
                  }}
                >
                  <summary
                    style={{
                      cursor: "pointer",
                      color: "rgba(245,245,242,0.5)",
                      fontFamily: MONO,
                      fontSize: 11,
                      fontWeight: 700,
                      listStyle: "none",
                      marginBottom: 10,
                      textTransform: "uppercase" as const,
                      letterSpacing: 1,
                    }}
                  >
                    Execution details
                  </summary>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    {[
                      {
                        l: "Market",
                        v: result.executionInfo.marketScore,
                        c: ACCENT,
                      },
                      {
                        l: "Execution",
                        v: result.executionInfo.executionScore,
                        c:
                          result.executionInfo.executionScore >= 70
                            ? "#4ade80"
                            : result.executionInfo.executionScore >= 45
                              ? "#fbbf24"
                              : "#f87171",
                      },
                      {
                        l: "Final",
                        v: result.executionInfo.finalScore,
                        c: ACCENT,
                      },
                    ].map((s) => (
                      <div key={s.l} style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 9,
                            color: "rgba(245,245,242,0.4)",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            marginBottom: 3,
                          }}
                        >
                          {s.l}
                        </div>
                        <div
                          style={{
                            height: 6,
                            borderRadius: 999,
                            background: "rgba(245,245,242,0.06)",
                            overflow: "hidden",
                            marginBottom: 4,
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.max(0, Math.min(100, s.v))}%`,
                              height: "100%",
                              borderRadius: 999,
                              background: s.c,
                            }}
                          />
                        </div>
                        <div
                          style={{
                            fontSize: 16,
                            color: s.c,
                            fontWeight: 800,
                          }}
                        >
                          {s.v}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      alignItems: "center",
                      fontSize: 11,
                      color: "rgba(245,245,242,0.5)",
                      lineHeight: 1.4,
                    }}
                  >
                    <span>
                      {result.executionInfo.quantityGuidance} · Execution
                      confidence{" "}
                      {Math.round(result.executionInfo.winProbability * 100)}%
                    </span>
                    <span
                      style={{
                        color: result.executionInfo.recommendedMarketplace
                          ? ACCENT
                          : "#fbbf24",
                        fontWeight: 700,
                        textAlign: "right",
                      }}
                    >
                      {result.executionInfo.recommendedMarketplace
                        ? `Recommended: ${
                            result.channels.find(
                              (ch) =>
                                ch.id ===
                                result.executionInfo?.recommendedMarketplace
                            )?.label ||
                            result.executionInfo.recommendedMarketplace
                          }`
                        : "No auto-recommended channel"}
                    </span>
                  </div>
                </details>
              )}
            </div>

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: "rgba(249,115,22,0.05)",
                  border: "1px solid rgba(249,115,22,0.12)",
                  marginBottom: 12,
                }}
              >
                {result.warnings.map((w, i) => {
                  const wl = w.toLowerCase();
                  let icon = "⚠️";
                  let color = "#fb923c";
                  if (
                    wl.includes("cost") ||
                    wl.includes("exceeds") ||
                    wl.includes("max")
                  ) {
                    icon = "🔴";
                    color = "#f87171";
                  } else if (
                    wl.includes("spike") ||
                    wl.includes("temporary") ||
                    wl.includes("burstiness")
                  ) {
                    icon = "⚡";
                    color = "#fbbf24";
                  } else if (
                    wl.includes("seller") ||
                    wl.includes("dominant") ||
                    wl.includes("buy box")
                  ) {
                    icon = "👤";
                    color = "#fb923c";
                  } else if (
                    wl.includes("confidence") ||
                    wl.includes("insufficient") ||
                    wl.includes("limited data")
                  ) {
                    icon = "📊";
                    color = "#facc15";
                  } else if (
                    wl.includes("bimodal") ||
                    wl.includes("distribution")
                  ) {
                    icon = "📈";
                    color = "#f59e0b";
                  }
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-start",
                        marginBottom: i < result.warnings.length - 1 ? 6 : 0,
                      }}
                    >
                      <span
                        style={{ fontSize: 11, flexShrink: 0, marginTop: 1 }}
                      >
                        {icon}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          color,
                          lineHeight: 1.5,
                        }}
                      >
                        {w}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* AI Explanation — skeleton while loading, real text when ready */}
            {aiLoading && (
              <div
                style={{
                  padding: "14px 16px 16px",
                  borderRadius: 14,
                  background: "rgba(212,255,61,0.04)",
                  border: "1px solid rgba(212,255,61,0.08)",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 11,
                      color: ACCENT,
                      fontWeight: 700,
                      textTransform: "uppercase" as const,
                      letterSpacing: 1,
                    }}
                  >
                    Writing AI brief
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "rgba(245,245,242,0.4)",
                      fontFamily: MONO,
                    }}
                  >
                    {formatElapsed(elapsedSeconds)}
                  </span>
                </div>
                <div className="skeleton-line" style={{ width: "96%" }} />
                <div className="skeleton-line" style={{ width: "88%" }} />
                <div className="skeleton-line" style={{ width: "72%" }} />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 7,
                    marginTop: 4,
                  }}
                >
                  {["Market", "Risk", "Channel"].map((label) => (
                    <div
                      key={label}
                      style={{
                        borderRadius: 9,
                        padding: "8px 6px",
                        background: "rgba(212,255,61,0.045)",
                        border: "1px solid rgba(212,255,61,0.08)",
                        textAlign: "center",
                        fontFamily: MONO,
                        fontSize: 9,
                        color: ACCENT,
                        fontWeight: 700,
                        textTransform: "uppercase" as const,
                        letterSpacing: 1,
                      }}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!aiLoading && result.aiExplanation && (
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: "rgba(245,245,242,0.03)",
                  border: "1px solid rgba(245,245,242,0.06)",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: ACCENT,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      fontWeight: 700,
                      color: "rgba(245,245,242,0.5)",
                      textTransform: "uppercase" as const,
                      letterSpacing: 1.5,
                    }}
                  >
                    Decision Brief
                  </span>
                </div>
                {(() => {
                  const isLong = result.aiExplanation.length > 620;
                  const brief = isLong
                    ? `${result.aiExplanation.slice(0, 620).trim()}...`
                    : result.aiExplanation;
                  return (
                    <>
                      <p
                        style={{
                          fontFamily: DISPLAY,
                          fontSize: 14,
                          color: "rgba(245,245,242,0.85)",
                          lineHeight: 1.55,
                          margin: 0,
                        }}
                      >
                        {brief}
                      </p>
                      {isLong && (
                        <details style={{ marginTop: 10 }}>
                          <summary
                            style={{
                              cursor: "pointer",
                              color: ACCENT,
                              fontFamily: MONO,
                              fontSize: 11,
                              fontWeight: 700,
                              listStyle: "none",
                              textTransform: "uppercase" as const,
                              letterSpacing: 1,
                            }}
                          >
                            Full analysis
                          </summary>
                          <p
                            style={{
                              fontFamily: DISPLAY,
                              fontSize: 13,
                              color: "rgba(245,245,242,0.75)",
                              lineHeight: 1.55,
                              margin: "8px 0 0",
                            }}
                          >
                            {result.aiExplanation}
                          </p>
                        </details>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {/* Channel Comparison */}
            <div
              style={{
                background: "rgba(245,245,242,0.03)",
                border: "1px solid rgba(245,245,242,0.08)",
                borderRadius: 20,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  fontWeight: 700,
                  marginBottom: 12,
                  color: "rgba(245,245,242,0.5)",
                  textTransform: "uppercase" as const,
                  letterSpacing: 1.5,
                }}
              >
                Profit by channel
              </div>
              {result.channels.map((ch) => {
                const profit = parseFloat(ch.profit);
                const isRecommended = ch.channelRole === "recommended";
                const isHighlighted = Boolean(ch.badge) || isRecommended;

                let badgeText = "";
                let badgeBg = "";
                let badgeColor = "";
                if (ch.badge) {
                  badgeText = ch.badge;
                  if (ch.badge === "BEST ROI") {
                    badgeBg = "rgba(212,255,61,0.12)";
                    badgeColor = ACCENT;
                  } else {
                    badgeBg = "rgba(34,197,94,0.12)";
                    badgeColor = "#4ade80";
                  }
                }
                const roleText =
                  ch.channelRole === "recommended"
                    ? "Best"
                    : ch.channelRole === "test_only"
                      ? "test"
                      : ch.channelRole === "best_profit"
                        ? "+profit"
                        : "";
                const roleBg =
                  ch.channelRole === "recommended"
                    ? "rgba(212,255,61,0.12)"
                    : ch.channelRole === "test_only"
                      ? "rgba(251,191,36,0.12)"
                      : "rgba(245,245,242,0.08)";
                const roleColor =
                  ch.channelRole === "recommended"
                    ? ACCENT
                    : ch.channelRole === "test_only"
                      ? "#fbbf24"
                      : "rgba(245,245,242,0.6)";

                return (
                  <div
                    key={ch.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 12,
                      marginBottom: 6,
                      background: isRecommended
                        ? "rgba(212,255,61,0.06)"
                        : "rgba(245,245,242,0.02)",
                      border: `1px solid ${
                        isRecommended
                          ? "rgba(212,255,61,0.18)"
                          : "rgba(245,245,242,0.06)"
                      }`,
                    }}
                  >
                    <span style={{ fontSize: 20, flexShrink: 0 }}>
                      {ch.icon}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          flexWrap: "wrap",
                          color: "#F5F5F2",
                        }}
                      >
                        {ch.label}
                        {badgeText && (
                          <span
                            style={{
                              fontFamily: MONO,
                              fontSize: 9,
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 100,
                              background: badgeBg,
                              color: badgeColor,
                            }}
                          >
                            {badgeText}
                          </span>
                        )}
                        {roleText && (
                          <span
                            style={{
                              fontFamily: MONO,
                              fontSize: 9,
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 100,
                              background: roleBg,
                              color: roleColor,
                            }}
                          >
                            {roleText}
                          </span>
                        )}
                        {ch.estimated && (
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 600,
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: "rgba(251,191,36,0.10)",
                              color: "#fbbf24",
                            }}
                          >
                            EST.
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontFamily: MONO,
                          fontSize: 9,
                          color: "rgba(245,245,242,0.4)",
                        }}
                      >
                        Sells ~${ch.salePrice} &middot; Fees: ${ch.fees}
                        {parseFloat(ch.ship) > 0 ? ` + $${ch.ship} ship` : ""}
                      </div>
                      {ch.executionScore != null && (
                        <div
                          style={{
                            fontSize: 11,
                            color:
                              ch.executionScore >= 70
                                ? "#4ade80"
                                : ch.executionScore >= 45
                                  ? "#fbbf24"
                                  : "#f87171",
                            marginTop: 2,
                          }}
                        >
                          Execution {ch.executionScore}/100
                          {ch.winProbability != null
                            ? ` · ${channelConfidenceLabel(ch.id)} ${Math.round(ch.winProbability * 100)}%`
                            : ""}
                          {ch.executionNote ? ` · ${ch.executionNote}` : ""}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontFamily: DISPLAY,
                          fontSize: 15,
                          fontWeight: 700,
                          color: profit > 0 ? ACCENT : "#FF6464",
                        }}
                      >
                        {profit > 0 ? "+" : ""}${ch.profit}
                      </div>
                      <div
                        style={{
                          fontFamily: MONO,
                          fontSize: 9,
                          color: "rgba(245,245,242,0.4)",
                        }}
                      >
                        {ch.roi}% ROI
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pricing Strategy / Sale Plan */}
            <div
              style={{
                background: "rgba(245,245,242,0.03)",
                border: "1px solid rgba(245,245,242,0.08)",
                borderRadius: 20,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  fontWeight: 700,
                  marginBottom: 12,
                  color: "rgba(245,245,242,0.5)",
                  textTransform: "uppercase" as const,
                  letterSpacing: 1.5,
                }}
              >
                Sale Plan
              </div>
              {(() => {
                const q = parseFloat(result.quickPrice);
                const m = parseFloat(result.marketPrice);
                const s = parseFloat(result.stretchPrice);
                const hasQuick = q > 0 && q !== m;
                const hasStretch = s > 0 && s !== m;

                if (!hasQuick && !hasStretch) {
                  return (
                    <div style={{ marginBottom: 12 }}>
                      <div
                        style={{
                          padding: "14px 6px",
                          borderRadius: 12,
                          textAlign: "center",
                          background: "rgba(212,255,61,0.08)",
                          border: `1px solid rgba(212,255,61,0.2)`,
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            fontFamily: MONO,
                            fontSize: 8,
                            color: "rgba(245,245,242,0.4)",
                            marginBottom: 4,
                            textTransform: "uppercase" as const,
                            letterSpacing: 1,
                          }}
                        >
                          Market price
                        </div>
                        <div
                          style={{
                            fontFamily: DISPLAY,
                            fontSize: 22,
                            fontWeight: 700,
                            color: ACCENT,
                          }}
                        >
                          ${result.marketPrice}
                        </div>
                        <div
                          style={{
                            fontFamily: MONO,
                            fontSize: 9,
                            color: "rgba(245,245,242,0.4)",
                            marginTop: 4,
                          }}
                        >
                          {result.estDaysToSell}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "rgba(245,245,242,0.4)",
                          textAlign: "center",
                        }}
                      >
                        Not enough data to suggest a price range
                      </div>
                    </div>
                  );
                }

                const tiers = [
                  hasQuick && {
                    l: "Quick",
                    v: `$${result.quickPrice}`,
                    c: "#F5F5F2",
                    sub: "Fast",
                    primary: false,
                  },
                  {
                    l: "Market",
                    v: `$${result.marketPrice}`,
                    c: ACCENT,
                    sub: result.estDaysToSell,
                    primary: true,
                  },
                  hasStretch && {
                    l: "Stretch",
                    v: `$${result.stretchPrice}`,
                    c: "#F5F5F2",
                    sub: "Patient",
                    primary: false,
                  },
                ].filter(Boolean) as {
                  l: string;
                  v: string;
                  c: string;
                  sub: string;
                  primary: boolean;
                }[];

                return (
                  <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                    {tiers.map((p, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          padding: "12px 6px",
                          borderRadius: 12,
                          textAlign: "center",
                          background: p.primary
                            ? "rgba(212,255,61,0.08)"
                            : "rgba(245,245,242,0.03)",
                          border: `1px solid ${p.primary ? "rgba(212,255,61,0.2)" : "rgba(245,245,242,0.06)"}`,
                        }}
                      >
                        <div
                          style={{
                            fontFamily: MONO,
                            fontSize: 8,
                            color: "rgba(245,245,242,0.4)",
                            marginBottom: 4,
                            textTransform: "uppercase" as const,
                            letterSpacing: 1,
                          }}
                        >
                          {p.l}
                        </div>
                        <div
                          style={{
                            fontFamily: DISPLAY,
                            fontSize: 22,
                            fontWeight: 700,
                            color: p.c,
                          }}
                        >
                          {p.v}
                        </div>
                        <div
                          style={{
                            fontFamily: MONO,
                            fontSize: 9,
                            color: "rgba(245,245,242,0.35)",
                            marginTop: 4,
                          }}
                        >
                          {p.sub}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Buy Box */}
              <div
                style={{
                  padding: "16px",
                  borderRadius: 16,
                  background: "rgba(245,245,242,0.03)",
                  border: "1px solid rgba(245,245,242,0.06)",
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 9,
                    color: "rgba(245,245,242,0.4)",
                    letterSpacing: 1.5,
                    textTransform: "uppercase" as const,
                    marginBottom: 4,
                  }}
                >
                  Max buy price
                </div>
                <div
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 40,
                    fontWeight: 700,
                    color: ACCENT,
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  ${result.maxBuy}
                </div>
                <div
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 13,
                    color: "rgba(245,245,242,0.45)",
                    marginBottom: 16,
                  }}
                >
                  Don&apos;t pay more than this
                </div>
                <div
                  style={{
                    borderTop: "1px solid rgba(245,245,242,0.06)",
                    paddingTop: 12,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 9,
                        color: "rgba(245,245,242,0.4)",
                        letterSpacing: 1,
                        textTransform: "uppercase" as const,
                        marginBottom: 2,
                      }}
                    >
                      Your cost
                    </div>
                    <div
                      style={{
                        fontFamily: DISPLAY,
                        fontSize: 18,
                        fontWeight: 700,
                        color:
                          parseFloat(result.headroom) >= 0
                            ? "#F5F5F2"
                            : "#FF6464",
                      }}
                    >
                      ${costPrice}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 9,
                        color: "rgba(245,245,242,0.4)",
                        letterSpacing: 1,
                        textTransform: "uppercase" as const,
                        marginBottom: 2,
                      }}
                    >
                      Headroom
                    </div>
                    <div
                      style={{
                        fontFamily: DISPLAY,
                        fontSize: 18,
                        fontWeight: 700,
                        color:
                          parseFloat(result.headroom) >= 0 ? ACCENT : "#FF6464",
                      }}
                    >
                      {parseFloat(result.headroom) >= 0 ? "+" : ""}$
                      {result.headroom}
                    </div>
                  </div>
                </div>
                {parseFloat(result.headroom) < 0 && (
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 12,
                      color: "#FFB84D",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    Pay ${result.maxBuy} or less to profit on this item
                  </div>
                )}
              </div>
            </div>

            {/* Market Info / Comps */}
            <div
              style={{
                background: "rgba(245,245,242,0.03)",
                border: "1px solid rgba(245,245,242,0.08)",
                borderRadius: 20,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  fontFamily: MONO,
                  fontSize: 10,
                  fontWeight: 700,
                  marginBottom: 12,
                  color: "rgba(245,245,242,0.5)",
                  textTransform: "uppercase" as const,
                  letterSpacing: 1.5,
                }}
              >
                <span>Market data</span>
                <span
                  style={{
                    padding: "3px 7px",
                    borderRadius: 999,
                    border: "1px solid rgba(245,245,242,0.08)",
                    background: "rgba(245,245,242,0.04)",
                    color: "rgba(245,245,242,0.62)",
                    fontSize: 9,
                    letterSpacing: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {result.product.market_source_label}
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 8,
                }}
              >
                {[
                  { l: "Comps (30d)", v: result.product.comps },
                  {
                    l: "Median",
                    v: `$${result.product.median_price.toFixed(2)}`,
                  },
                  {
                    l: "Range",
                    v: `$${result.product.min_price.toFixed(0)}–$${result.product.max_price.toFixed(0)}`,
                  },
                  {
                    l: "Sales/day",
                    v: result.product.sales_per_day.toFixed(2),
                  },
                  { l: "Competition", v: result.product.competition },
                  {
                    l: "Price trend",
                    v: `${result.product.trend_price > 0 ? "+" : ""}${result.product.trend_price.toFixed(1)}%`,
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "8px 6px",
                      borderRadius: 8,
                      background: "rgba(245,245,242,0.03)",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 8,
                        color: "rgba(245,245,242,0.4)",
                        marginBottom: 2,
                        textTransform: "uppercase" as const,
                        letterSpacing: 1,
                      }}
                    >
                      {s.l}
                    </div>
                    <div
                      style={{
                        fontFamily: DISPLAY,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "rgba(245,245,242,0.7)",
                      }}
                    >
                      {s.v}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Marketplace Deep Dive */}
            {result.marketplaceDetails &&
              result.marketplaceDetails.length > 1 && (
                <div
                  style={{
                    background: "rgba(245,245,242,0.03)",
                    border: "1px solid rgba(245,245,242,0.08)",
                    borderRadius: 20,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      fontWeight: 700,
                      marginBottom: 12,
                      color: "rgba(245,245,242,0.5)",
                      textTransform: "uppercase" as const,
                      letterSpacing: 1.5,
                    }}
                  >
                    Marketplace deep dive
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 4,
                      marginBottom: 12,
                    }}
                  >
                    {result.marketplaceDetails.map(
                      (md: MarketplaceDetail, idx: number) => (
                        <button
                          key={md.marketplace}
                          onClick={() => setActiveTab(idx)}
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            borderRadius: 10,
                            border: `1px solid ${activeTab === idx ? "rgba(212,255,61,0.3)" : "rgba(245,245,242,0.08)"}`,
                            background:
                              activeTab === idx
                                ? "rgba(212,255,61,0.12)"
                                : "transparent",
                            color:
                              activeTab === idx
                                ? ACCENT
                                : "rgba(245,245,242,0.5)",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          {md.label}
                        </button>
                      )
                    )}
                  </div>
                  {(() => {
                    const md = result.marketplaceDetails![activeTab];
                    if (!md) return null;
                    return (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: 8,
                        }}
                      >
                        {[
                          {
                            l: "Sale price",
                            v: `$${md.salePrice}`,
                          },
                          {
                            l: "Profit",
                            v: `$${md.profit}`,
                          },
                          { l: "ROI", v: `${md.roi}%` },
                          {
                            l: "Flip score",
                            v: md.flipScore,
                          },
                          { l: "Comps", v: md.comps },
                          {
                            l: "Sales/day",
                            v: md.salesPerDay,
                          },
                        ].map((s, i) => (
                          <div
                            key={i}
                            style={{
                              padding: "8px 6px",
                              borderRadius: 8,
                              background: "rgba(245,245,242,0.03)",
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                fontFamily: MONO,
                                fontSize: 8,
                                color: "rgba(245,245,242,0.4)",
                                marginBottom: 2,
                                textTransform: "uppercase" as const,
                                letterSpacing: 1,
                              }}
                            >
                              {s.l}
                            </div>
                            <div
                              style={{
                                fontFamily: DISPLAY,
                                fontSize: 13,
                                fontWeight: 600,
                                color: "rgba(245,245,242,0.7)",
                              }}
                            >
                              {s.v}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

            {/* CTA: Full Version */}
            <div
              style={{
                background: "rgba(245,245,242,0.03)",
                border: "1px solid rgba(245,245,242,0.08)",
                borderRadius: 20,
                padding: 20,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 4,
                  color: "#F5F5F2",
                }}
              >
                Want this in your pocket?
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(245,245,242,0.55)",
                  marginBottom: 16,
                  lineHeight: 1.6,
                }}
              >
                The full FlipIQ app includes barcode scanning, real-time alerts,
                watchlists, Flip &amp; Save rewards, and AI analysis for
                millions of products.
              </p>
              {!emailSent ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleWaitlist()}
                    style={{ flex: 1, fontSize: 13 }}
                  />
                  <button
                    onClick={handleWaitlist}
                    style={{
                      padding: "12px 20px",
                      borderRadius: 12,
                      border: "none",
                      background: ACCENT,
                      color: "#0A0A0A",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Join waitlist
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.2)",
                    color: "#4ade80",
                    fontWeight: 600,
                  }}
                >
                  You&apos;re on the list! We&apos;ll notify you when FlipIQ
                  launches.
                </div>
              )}
            </div>

            {/* Analyze Another */}
            <button
              onClick={() => {
                setResult(null);
                setQuery("");
                setCostPrice("");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              style={{
                width: "100%",
                marginTop: 12,
                padding: 14,
                borderRadius: 14,
                border: "1px solid rgba(245,245,242,0.12)",
                background: "transparent",
                color: "#F5F5F2",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: DISPLAY,
              }}
            >
              New analysis →
            </button>
          </div>
        )}

        {/* ── FOOTER ── */}
        {!result && !error && (
          <div
            style={{
              textAlign: "center",
              marginTop: 32,
              padding: "20px 0",
              borderTop: "1px solid rgba(245,245,242,0.06)",
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: "rgba(245,245,242,0.3)",
                lineHeight: 1.6,
                marginBottom: 12,
              }}
            >
              FlipIQ analyzes real-time sales data from eBay, Amazon, FB
              Marketplace and MercadoLibre to tell you if a product is worth
              flipping.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  background: ACCENT,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#0A0A0A",
                }}
              >
                F
              </div>
              <span style={{ fontSize: 12, color: "rgba(245,245,242,0.3)" }}>
                FlipIQ · Built for resellers, by resellers
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
