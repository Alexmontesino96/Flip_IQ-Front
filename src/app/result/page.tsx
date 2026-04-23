"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TopBar from "@/components/ui/TopBar";
import TinyBadge from "@/components/ui/TinyBadge";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";
import {
  fetchAnalysisById,
  shareAnalysis,
  AnalysisResult,
} from "@/lib/analysis";
import {
  fetchWatchlists,
  createWatchlist,
  addWatchlistItem,
} from "@/lib/watchlist";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number, decimals = 2) =>
  n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const SectionLabel = ({
  children,
  dot,
}: {
  children: React.ReactNode;
  dot?: boolean;
}) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: 9,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: "rgba(245,245,242,0.45)",
      marginBottom: 8,
      display: "flex",
      alignItems: "center",
      gap: 6,
    }}
  >
    {dot && (
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: ACCENT,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
    )}
    {children}
  </div>
);

const Card = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      background: "rgba(245,245,242,0.04)",
      border: "1px solid rgba(245,245,242,0.08)",
      borderRadius: 20,
      padding: "20px",
      ...style,
    }}
  >
    {children}
  </div>
);

// ─── Score bar ────────────────────────────────────────────────────────────────
const ScoreBar = ({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: number;
  sublabel: string;
}) => {
  const isWarn = value < 40;
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: 9,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: "rgba(245,245,242,0.55)",
          }}
        >
          {label}
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              fontFamily: DISPLAY,
              fontSize: 14,
              fontWeight: 700,
              color: "#F5F5F2",
            }}
          >
            {value}
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 8,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: isWarn ? "#FFB84D" : ACCENT,
            }}
          >
            {sublabel}
          </span>
        </span>
      </div>
      <div
        style={{
          height: 4,
          borderRadius: 2,
          background: "rgba(245,245,242,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            borderRadius: 2,
            background: isWarn ? "#FFB84D" : ACCENT,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
};

// ─── Mini bar chart ───────────────────────────────────────────────────────────
const MiniBarChart = ({ bars }: { bars: number[] }) => {
  const max = Math.max(...bars);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 4,
        height: 40,
      }}
    >
      {bars.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${(v / max) * 100}%`,
            borderRadius: 3,
            background: v === max ? ACCENT : "rgba(245,245,242,0.2)",
          }}
        />
      ))}
    </div>
  );
};

// ─── Score sublabel helpers ──────────────────────────────────────────────────
function riskSublabel(safety: number): string {
  if (safety >= 70) return "Low";
  if (safety >= 40) return "Medium";
  return "High";
}
function confidenceSublabel(v: number): string {
  if (v >= 70) return "High";
  if (v >= 40) return "Medium";
  return "Low";
}
function velocitySublabel(v: number): string {
  if (v >= 70) return "Fast";
  if (v >= 40) return "Medium";
  return "Slow";
}

// ─── Inner page (uses useSearchParams) ──────────────────────────────────────
function ResultPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");

  const id = idParam ? Number(idParam) : null;
  const idValid = id !== null && !isNaN(id);

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(idValid);
  const [error, setError] = useState<string | null>(
    !idParam
      ? "No analysis ID provided."
      : idParam && !idValid
        ? "Invalid analysis ID."
        : null
  );

  useEffect(() => {
    if (!idValid) return;

    const cancelled = false;
    fetchAnalysisById(id)
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load analysis.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
  }, [idParam]);

  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [watchlistAdded, setWatchlistAdded] = useState(false);
  const [watchlistAdding, setWatchlistAdding] = useState(false);

  const handleShare = async () => {
    if (!id || sharing) return;
    setSharing(true);
    try {
      const { share_token } = await shareAnalysis(id);
      const shareUrl = `${window.location.origin}/shared/${share_token}`;
      if (navigator.share) {
        await navigator.share({ title: "FlipIQ Analysis", url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      // user cancelled share or error
    } finally {
      setSharing(false);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!result || watchlistAdding || watchlistAdded) return;
    const productId = result.product?.id;
    if (!productId) return;

    setWatchlistAdding(true);
    try {
      let lists = await fetchWatchlists();
      if (lists.length === 0) {
        const created = await createWatchlist("My Watchlist");
        if (created) lists = [created];
      }
      if (lists.length > 0) {
        const added = await addWatchlistItem(lists[0].id, productId);
        if (added) setWatchlistAdded(true);
      }
    } catch {
      // silent fail
    } finally {
      setWatchlistAdding(false);
    }
  };

  const shareButton = (
    <button
      onClick={handleShare}
      aria-label={shared ? "Link copied" : "Share result"}
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        border: `1px solid ${shared ? ACCENT : "rgba(245,245,242,0.12)"}`,
        background: "transparent",
        color: shared ? ACCENT : "#F5F5F2",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
      }}
    >
      {shared ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 8l4 4 6-8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M8 1v9M5 4l3-3 3 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "#0A0A0A",
          color: "#F5F5F2",
          maxWidth: 520,
          margin: "0 auto",
          fontFamily: DISPLAY,
        }}
      >
        <TopBar
          title="Result"
          accent={ACCENT}
          onBack={() => router.back()}
          right={shareButton}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 20px",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border: `2px solid ${ACCENT}`,
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <span
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: "rgba(245,245,242,0.5)",
            }}
          >
            Loading analysis...
          </span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error || !result) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "#0A0A0A",
          color: "#F5F5F2",
          maxWidth: 520,
          margin: "0 auto",
          fontFamily: DISPLAY,
        }}
      >
        <TopBar
          title="Result"
          accent={ACCENT}
          onBack={() => router.back()}
          right={shareButton}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 20px",
            gap: 16,
          }}
        >
          <span
            style={{
              fontFamily: DISPLAY,
              fontSize: 16,
              color: "#ef4444",
            }}
          >
            {error || "Analysis not found."}
          </span>
          <button
            onClick={() => router.back()}
            style={{
              fontFamily: DISPLAY,
              fontSize: 14,
              fontWeight: 600,
              color: ACCENT,
              background: "transparent",
              border: `1px solid ${ACCENT}`,
              borderRadius: 12,
              padding: "10px 24px",
              cursor: "pointer",
            }}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  // ── No comps found — special screen ────────────────────────────────────
  if (result.noCompsFound) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "#0A0A0A",
          color: "#F5F5F2",
          maxWidth: 520,
          margin: "0 auto",
          fontFamily: DISPLAY,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TopBar title="Result" accent={ACCENT} onBack={() => router.back()} />

        {/* Illustration */}
        <div
          style={{
            padding: "40px 20px 0",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
            {/* Scatter dots */}
            <circle cx="30" cy="50" r="3" fill="rgba(245,245,242,0.08)" />
            <circle cx="130" cy="40" r="4" fill="rgba(245,245,242,0.06)" />
            <circle cx="45" cy="120" r="3" fill="rgba(245,245,242,0.07)" />
            <circle cx="120" cy="110" r="3" fill="rgba(245,245,242,0.06)" />
            {/* Central circle */}
            <circle
              cx="80"
              cy="80"
              r="40"
              fill="rgba(245,245,242,0.03)"
              stroke="rgba(245,245,242,0.08)"
              strokeWidth="1"
            />
            {/* Arc */}
            <path
              d="M 62 100 A 18 18 0 1 1 98 100"
              fill="none"
              stroke={ACCENT}
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Question mark */}
            <text
              x="80"
              y="108"
              textAnchor="middle"
              fontFamily="JetBrains Mono"
              fontSize="32"
              fontWeight="700"
              fill={ACCENT}
            >
              ?
            </text>
            {/* Dashed lines */}
            <line
              x1="80"
              y1="80"
              x2="140"
              y2="72"
              stroke="rgba(245,245,242,0.1)"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
            <line
              x1="80"
              y1="80"
              x2="32"
              y2="110"
              stroke="rgba(245,245,242,0.1)"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
          </svg>
        </div>

        {/* Message */}
        <div style={{ padding: "0 24px 20px", textAlign: "center" }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 9,
              letterSpacing: 2,
              color: ACCENT,
              textTransform: "uppercase",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: ACCENT,
                display: "inline-block",
              }}
            />
            Not enough data
          </div>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 26,
              fontWeight: 700,
              color: "#F5F5F2",
              letterSpacing: -0.8,
              lineHeight: 1.1,
              marginBottom: 10,
            }}
          >
            We couldn&apos;t analyze this one
          </div>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 14,
              color: "rgba(245,245,242,0.6)",
              lineHeight: 1.45,
              letterSpacing: -0.1,
            }}
          >
            We couldn&apos;t find reliable comps for your search. An analyst
            will review this product manually so it resolves in seconds next
            time.
          </div>
        </div>

        {/* Query echo */}
        {result.product?.title &&
          result.product.title !== "Unknown Product" && (
            <div style={{ padding: "0 20px 16px" }}>
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "rgba(245,245,242,0.04)",
                  border: "1px solid rgba(245,245,242,0.08)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 9,
                    letterSpacing: 1.5,
                    color: "rgba(245,245,242,0.45)",
                    textTransform: "uppercase",
                    flexShrink: 0,
                  }}
                >
                  Query
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 13,
                    color: "#F5F5F2",
                    fontWeight: 500,
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  &quot;{result.product.title}&quot;
                </span>
              </div>
            </div>
          )}

        {/* ETA bar */}
        <div style={{ padding: "0 20px 20px" }}>
          <div
            style={{
              padding: 16,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${ACCENT}12 0%, rgba(245,245,242,0.02) 100%)`,
              border: `1px solid ${ACCENT}33`,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                border: `1.5px solid ${ACCENT}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontFamily: MONO,
                fontSize: 10,
                fontWeight: 700,
                color: ACCENT,
                letterSpacing: 0.5,
              }}
            >
              24h
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#F5F5F2",
                  letterSpacing: -0.2,
                  marginBottom: 2,
                }}
              >
                Manual review in ≈ 24 hours
              </div>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 12,
                  color: "rgba(245,245,242,0.55)",
                  lineHeight: 1.4,
                }}
              >
                No cost to you. Doesn&apos;t count against your quota.
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          style={{ padding: "0 20px", marginTop: "auto", paddingBottom: 40 }}
        >
          <button
            onClick={() => router.push("/search")}
            style={{
              width: "100%",
              padding: "16px 20px",
              borderRadius: 14,
              background: ACCENT,
              color: "#0A0A0A",
              border: "none",
              fontFamily: DISPLAY,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: -0.2,
            }}
          >
            Try another product →
          </button>
        </div>
      </div>
    );
  }

  // ── Derived values ─────────────────────────────────────────────────────
  const r = result;
  const maxBuy = parseFloat(r.maxBuy);
  const headroom = parseFloat(r.headroom);
  const costPrice = maxBuy - headroom;
  const profit = parseFloat(r.mainProfit);
  const roi = parseFloat(r.mainROI);
  const margin = roi > 0 ? (profit / (profit + costPrice)) * 100 : 0;
  const safety = 100 - r.risk; // risk inverted for display

  // Channel data for the channels section
  const channels = r.channels.map((ch) => {
    const isRec = ch.channelRole === "recommended";
    const isBestProfit = ch.channelRole === "best_profit";
    const isTest = ch.channelRole === "test_only";
    return { ...ch, isRec, isBestProfit, isTest };
  });

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0A0A0A",
        color: "#F5F5F2",
        maxWidth: 520,
        margin: "0 auto",
        paddingBottom: 40,
        fontFamily: DISPLAY,
      }}
    >
      {/* ── TopBar ──────────────────────────────────────────────────────── */}
      <TopBar
        title="Result"
        accent={ACCENT}
        onBack={() => router.back()}
        right={shareButton}
      />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ padding: "4px 20px 20px" }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 9,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: ACCENT,
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: ACCENT,
            }}
          />
          Analysis complete
        </div>
        <h1
          style={{
            fontFamily: DISPLAY,
            fontSize: 22,
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: -0.5,
            color: "#F5F5F2",
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {r.product.title}
        </h1>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          1. VERDICT
      ════════════════════════════════════════════════════════════════════ */}
      <section
        style={{ padding: "0 20px", marginBottom: 20 }}
        aria-label="Verdict"
      >
        <SectionLabel>Verdict</SectionLabel>
        <div
          style={{
            background: ACCENT,
            borderRadius: 20,
            padding: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 34,
                fontWeight: 800,
                color: "#0A0A0A",
                lineHeight: 1,
                letterSpacing: -1,
              }}
            >
              {r.recommendation}
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "rgba(10,10,10,0.6)",
                marginTop: 4,
              }}
            >
              Opportunity {r.flipScore}/100
            </div>
          </div>
          {/* Score circle */}
          <div
            role="img"
            aria-label={`Score ${r.flipScore} out of 100`}
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "2px solid #0A0A0A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: DISPLAY,
                fontSize: 22,
                fontWeight: 700,
                color: "#0A0A0A",
              }}
            >
              {r.flipScore}
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          2. BUY BOX
      ════════════════════════════════════════════════════════════════════ */}
      <section
        style={{ padding: "0 20px", marginBottom: 20 }}
        aria-label="Buy box"
      >
        <SectionLabel>Max buy price</SectionLabel>
        <Card>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 9,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: "rgba(245,245,242,0.45)",
              marginBottom: 4,
            }}
          >
            Don&apos;t pay more than
          </div>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 40,
              fontWeight: 700,
              color: ACCENT,
              letterSpacing: -1.5,
              lineHeight: 1.05,
              marginBottom: 16,
            }}
          >
            ${fmt(maxBuy)}
          </div>
          <div
            style={{
              height: 1,
              background: "rgba(245,245,242,0.08)",
              marginBottom: 16,
            }}
          />
          <div style={{ display: "flex", gap: 0 }}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  color: "rgba(245,245,242,0.45)",
                  marginBottom: 4,
                }}
              >
                Your cost
              </div>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#F5F5F2",
                }}
              >
                ${fmt(costPrice)}
              </div>
            </div>
            <div
              style={{
                width: 1,
                background: "rgba(245,245,242,0.08)",
                margin: "0 16px",
                alignSelf: "stretch",
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  color: "rgba(245,245,242,0.45)",
                  marginBottom: 4,
                }}
              >
                Headroom
              </div>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 18,
                  fontWeight: 700,
                  color: ACCENT,
                }}
              >
                +${fmt(headroom)}
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          3. SALE PLAN
      ════════════════════════════════════════════════════════════════════ */}
      <section
        style={{ padding: "0 20px", marginBottom: 20 }}
        aria-label="Sale plan"
      >
        <SectionLabel>Sale plan</SectionLabel>
        <div style={{ display: "flex", gap: 8 }}>
          {/* Quick sale */}
          <div
            style={{
              flex: 1,
              background: "rgba(245,245,242,0.04)",
              border: "1px solid rgba(245,245,242,0.08)",
              borderRadius: 16,
              padding: "14px 12px",
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 8,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: "rgba(245,245,242,0.45)",
                marginBottom: 6,
              }}
            >
              Quick
            </div>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 22,
                fontWeight: 700,
                color: "#F5F5F2",
                letterSpacing: -0.5,
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              ${fmt(parseFloat(r.quickPrice), 0)}
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 9,
                color: "rgba(245,245,242,0.4)",
              }}
            >
              3-5 days
            </div>
          </div>

          {/* Market — recommended */}
          <div
            style={{
              flex: 1,
              background: "rgba(212,255,61,0.08)",
              border: "1px solid rgba(212,255,61,0.25)",
              borderRadius: 16,
              padding: "14px 12px",
              position: "relative",
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 8,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: ACCENT,
                marginBottom: 6,
              }}
            >
              Market
            </div>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 22,
                fontWeight: 700,
                color: ACCENT,
                letterSpacing: -0.5,
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              ${fmt(parseFloat(r.marketPrice), 0)}
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 9,
                color: "rgba(212,255,61,0.6)",
              }}
            >
              Recommended
            </div>
          </div>

          {/* Stretch */}
          <div
            style={{
              flex: 1,
              background: "rgba(245,245,242,0.04)",
              border: "1px solid rgba(245,245,242,0.08)",
              borderRadius: 16,
              padding: "14px 12px",
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 8,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: "rgba(245,245,242,0.45)",
                marginBottom: 6,
              }}
            >
              Stretch
            </div>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 22,
                fontWeight: 700,
                color: "#F5F5F2",
                letterSpacing: -0.5,
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              ${fmt(parseFloat(r.stretchPrice), 0)}
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 9,
                color: "rgba(245,245,242,0.4)",
              }}
            >
              With rep.
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          4. RETURNS
      ════════════════════════════════════════════════════════════════════ */}
      <section
        style={{ padding: "0 20px", marginBottom: 20 }}
        aria-label="Returns"
      >
        <SectionLabel>Returns</SectionLabel>
        <div
          style={{
            background: "rgba(245,245,242,0.08)",
            borderRadius: 20,
            overflow: "hidden",
            display: "flex",
            gap: 1,
          }}
        >
          {[
            {
              label: "Net profit",
              value: `+$${fmt(profit)}`,
              accent: true,
            },
            { label: "ROI", value: `${fmt(roi, 1)}%`, accent: false },
            {
              label: "Margin",
              value: `${fmt(margin, 1)}%`,
              accent: false,
            },
          ].map((cell) => (
            <div
              key={cell.label}
              style={{
                flex: 1,
                background: "#0A0A0A",
                padding: "16px 12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  color: "rgba(245,245,242,0.45)",
                }}
              >
                {cell.label}
              </div>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 17,
                  fontWeight: 700,
                  color: cell.accent ? ACCENT : "#F5F5F2",
                  letterSpacing: -0.3,
                }}
              >
                {cell.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          5. SCORES
      ════════════════════════════════════════════════════════════════════ */}
      <section
        style={{ padding: "0 20px", marginBottom: 20 }}
        aria-label="Scores"
      >
        <SectionLabel>Scores</SectionLabel>
        <Card style={{ padding: "20px 20px 6px" }}>
          <ScoreBar
            label="Risk"
            value={safety}
            sublabel={riskSublabel(safety)}
          />
          <ScoreBar
            label="Confidence"
            value={r.confidence}
            sublabel={confidenceSublabel(r.confidence)}
          />
          <ScoreBar
            label="Velocity"
            value={r.velocity}
            sublabel={velocitySublabel(r.velocity)}
          />
        </Card>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          6. CHANNELS
      ════════════════════════════════════════════════════════════════════ */}
      {channels.length > 0 && (
        <section
          style={{ padding: "0 20px", marginBottom: 20 }}
          aria-label="Best channels"
        >
          <SectionLabel>Best channel</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {channels.map((ch) => {
              return (
                <div
                  key={ch.id}
                  style={{
                    background: ch.isRec
                      ? "rgba(212,255,61,0.07)"
                      : "rgba(245,245,242,0.03)",
                    border: ch.isRec
                      ? "1px solid rgba(212,255,61,0.22)"
                      : "1px solid rgba(245,245,242,0.08)",
                    borderRadius: 16,
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  {/* Left side */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: DISPLAY,
                          fontSize: 15,
                          fontWeight: 700,
                          color: ch.isRec ? ACCENT : "#F5F5F2",
                        }}
                      >
                        {ch.label}
                      </span>
                      {ch.isRec && (
                        <TinyBadge color="#0A0A0A" bg={ACCENT}>
                          Best
                        </TinyBadge>
                      )}
                      {ch.isBestProfit && (
                        <TinyBadge color={ACCENT} bg="rgba(212,255,61,0.1)">
                          +profit
                        </TinyBadge>
                      )}
                      {ch.isTest && (
                        <TinyBadge
                          color="rgba(245,245,242,0.5)"
                          bg="rgba(245,245,242,0.06)"
                        >
                          test
                        </TinyBadge>
                      )}
                    </div>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 9,
                        letterSpacing: 1,
                        color: "rgba(245,245,242,0.45)",
                      }}
                    >
                      Sale ${ch.salePrice} &nbsp;&middot;&nbsp; Fee ${ch.fees}
                    </div>
                  </div>

                  {/* Right side */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      style={{
                        fontFamily: DISPLAY,
                        fontSize: 15,
                        fontWeight: 700,
                        color: ch.isRec ? ACCENT : "#F5F5F2",
                        marginBottom: 2,
                      }}
                    >
                      +${ch.profit}
                    </div>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 9,
                        letterSpacing: 1,
                        color: "rgba(245,245,242,0.45)",
                      }}
                    >
                      ROI {ch.roi}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          7. AI VERDICT
      ════════════════════════════════════════════════════════════════════ */}
      {r.aiExplanation && (
        <section
          style={{ padding: "0 20px", marginBottom: 20 }}
          aria-label="AI verdict"
        >
          <SectionLabel dot>AI Verdict</SectionLabel>
          <div
            style={{
              background: "rgba(245,245,242,0.03)",
              border: "1px solid rgba(245,245,242,0.08)",
              borderRadius: 20,
              padding: "18px 20px",
            }}
          >
            <p
              style={{
                fontFamily: DISPLAY,
                fontSize: 14,
                color: "rgba(245,245,242,0.85)",
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              {r.aiExplanation}
            </p>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          8. COMPS
      ════════════════════════════════════════════════════════════════════ */}
      <section
        style={{ padding: "0 20px", marginBottom: 20 }}
        aria-label="Comparable sales"
      >
        <SectionLabel>
          Comps &middot; {r.product.market_source_label} Sold &middot; 20d
        </SectionLabel>
        <Card>
          {/* 3 stat columns */}
          <div
            style={{
              display: "flex",
              marginBottom: 20,
            }}
          >
            {[
              { label: "Sold", value: String(r.product.comps) },
              {
                label: "Median",
                value: `$${Math.round(r.product.median_price)}`,
              },
              {
                label: "Per day",
                value: String(r.product.sales_per_day.toFixed(1)),
              },
            ].map((s, i, arr) => (
              <div
                key={s.label}
                style={{
                  flex: 1,
                  borderRight:
                    i < arr.length - 1
                      ? "1px solid rgba(245,245,242,0.08)"
                      : "none",
                  paddingRight: i < arr.length - 1 ? 16 : 0,
                  paddingLeft: i > 0 ? 16 : 0,
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 9,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    color: "rgba(245,245,242,0.45)",
                    marginBottom: 4,
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#F5F5F2",
                    letterSpacing: -0.5,
                  }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Mini bar chart — approximate distribution from min/median/max */}
          <MiniBarChart
            bars={[
              Math.max(1, Math.round(r.product.comps * 0.15)),
              Math.max(1, Math.round(r.product.comps * 0.25)),
              Math.max(1, Math.round(r.product.comps * 0.3)),
              Math.max(1, Math.round(r.product.comps * 0.2)),
              Math.max(1, Math.round(r.product.comps * 0.07)),
              Math.max(1, Math.round(r.product.comps * 0.03)),
            ]}
          />

          {/* Price range labels */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            {[
              `$${Math.round(r.product.min_price)}`,
              `$${Math.round(r.product.median_price)}`,
              `$${Math.round(r.product.max_price)}`,
            ].map((label) => (
              <span
                key={label}
                style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  letterSpacing: 1,
                  color: "rgba(245,245,242,0.45)",
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </Card>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          BOTTOM BUTTONS
      ════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          padding: "4px 20px 24px",
          display: "flex",
          gap: 10,
        }}
      >
        {/* Secondary: Add to watchlist */}
        <button
          onClick={handleAddToWatchlist}
          disabled={watchlistAdding || watchlistAdded || !result?.product?.id}
          aria-label={
            watchlistAdded ? "Added to watchlist" : "Add to watchlist"
          }
          style={{
            flex: 1,
            height: 50,
            borderRadius: 14,
            border: watchlistAdded
              ? `1px solid ${ACCENT}`
              : "1px solid rgba(245,245,242,0.12)",
            background: "transparent",
            color: watchlistAdded ? ACCENT : "#F5F5F2",
            fontFamily: DISPLAY,
            fontSize: 14,
            fontWeight: 600,
            cursor: watchlistAdding || watchlistAdded ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            opacity: watchlistAdding ? 0.5 : 1,
          }}
        >
          <span aria-hidden="true">{watchlistAdded ? "✓" : "★"}</span>
          {watchlistAdded
            ? "Added"
            : watchlistAdding
              ? "Adding..."
              : "Add to watchlist"}
        </button>

        {/* Primary: New analysis */}
        <button
          aria-label="Start new analysis"
          onClick={() => router.push("/search")}
          style={{
            flex: 1,
            height: 50,
            borderRadius: 14,
            border: "none",
            background: ACCENT,
            color: "#0A0A0A",
            fontFamily: DISPLAY,
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            letterSpacing: -0.2,
          }}
        >
          New analysis <span aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>
  );
}

// ─── Page (wrapped in Suspense for useSearchParams) ──────────────────────────
export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100dvh",
            background: "#0A0A0A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div
            style={{
              width: 32,
              height: 32,
              border: "2px solid #D4FF3D",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
        </div>
      }
    >
      <ResultPageInner />
    </Suspense>
  );
}
