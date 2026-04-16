/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import ScoreRing from "./ScoreRing";
import { runAnalysis, AnalysisResult } from "@/lib/analysis";
import {
  canAnalyze,
  incrementUsage,
  setEmail as saveEmail,
  getUsage,
  DAILY_LIMIT,
} from "@/lib/usage";
import EmailGate from "./EmailGate";

const BarcodeScanner = dynamic(() => import("./BarcodeScanner"), {
  ssr: false,
});

const SAMPLE_QUERIES = [
  { query: "AirPods Pro", name: "AirPods Pro", cost: "105" },
  { query: "Nintendo Switch OLED", name: "Switch OLED", cost: "160" },
  { query: "Nike Dunk Low", name: "Nike Dunk", cost: "65" },
  { query: "PS5 Console", name: "PS5", cost: "220" },
  { query: "Stanley Cup 40oz", name: "Stanley Cup", cost: "25" },
];

export default function FlipIQCalculator() {
  const [query, setQuery] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [condition, setCondition] = useState("new");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [usageCount, setUsageCount] = useState(() => {
    if (typeof window === "undefined") return 0;
    return getUsage().count;
  });
  const resultRef = useRef<HTMLDivElement>(null);

  const executeAnalysis = useCallback(
    async (q: string, cost: string, cond: string) => {
      setLoading(true);
      setError(null);
      setResult(null);
      try {
        const r = await runAnalysis(q.trim(), parseFloat(cost), cond);
        incrementUsage();
        setUsageCount(getUsage().count);
        setResult(r);
        setTimeout(
          () =>
            resultRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            }),
          100
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error analyzing product"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleAnalyze = async () => {
    if (!query || !costPrice) return;
    const check = canAnalyze();
    if (!check.allowed) {
      if (check.reason === "needs_email") {
        setShowEmailGate(true);
        return;
      }
      if (check.reason === "limit_reached") {
        setError(
          `Daily limit reached (${DAILY_LIMIT}/${DAILY_LIMIT}). Come back tomorrow for more free analyses!`
        );
        return;
      }
    }
    executeAnalysis(query, costPrice, condition);
  };

  const handleEmailSubmit = (emailValue: string) => {
    saveEmail(emailValue);
    setShowEmailGate(false);
    executeAnalysis(query, costPrice, condition);
  };

  const handleWaitlist = async () => {
    if (!email.includes("@")) return;
    setEmailSent(true);
    const url =
      process.env.NEXT_PUBLIC_API_URL || "https://flip-iq-fastapi.onrender.com";
    try {
      await fetch(`${url}/api/v1/waitlist/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "calculator" }),
      });
    } catch {
      // Endpoint may not exist yet — email gate already stores locally
    }
  };

  const pickSample = (q: string, cost?: string) => {
    setQuery(q);
    if (cost) setCostPrice(cost);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#08080d",
        color: "#e2e8f0",
        fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(139,92,246,0.3); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .input-field { width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #e2e8f0; font-size: 15px; font-family: inherit; outline: none; transition: border-color 0.3s; }
        .input-field:focus { border-color: rgba(139,92,246,0.5); }
        .input-field::placeholder { color: #475569; }
        .cta-btn { width: 100%; padding: 16px; border-radius: 14px; border: none; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.3s; background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: #fff; box-shadow: 0 4px 20px rgba(139,92,246,0.25); }
        .cta-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(139,92,246,0.35); }
        .cta-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
        .cond-btn { padding: 10px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: #94a3b8; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.2s; flex: 1; }
        .cond-btn.active { background: rgba(139,92,246,0.12); border-color: rgba(139,92,246,0.3); color: #c4b5fd; }
        .sample-chip { padding: 8px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); color: #94a3b8; font-size: 12px; cursor: pointer; transition: all 0.2s; font-family: inherit; white-space: nowrap; }
        .sample-chip:hover { background: rgba(139,92,246,0.08); border-color: rgba(139,92,246,0.2); color: #c4b5fd; }
      `}</style>

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
                width: 34,
                height: 34,
                borderRadius: 9,
                background: "linear-gradient(135deg, #8b5cf6, #0ea5e9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 800,
                color: "#fff",
              }}
            >
              F
            </div>
            <span style={{ fontSize: 20, fontWeight: 700 }}>
              Flip<span style={{ color: "#8b5cf6" }}>IQ</span>
            </span>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "5px 12px",
              borderRadius: 16,
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
              color: "#4ade80",
            }}
          >
            Live Data
          </span>
        </div>

        {/* ── HERO ── */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: -0.5,
              lineHeight: 1.2,
              marginBottom: 8,
            }}
          >
            Is it worth flipping?
          </h1>
          <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6 }}>
            The only tool that compares profit across{" "}
            <span style={{ color: "#c4b5fd", fontWeight: 600 }}>
              eBay + Amazon + FBMP + MercadoLibre
            </span>{" "}
            in one search.
          </p>
        </div>

        {/* ── BARCODE SCANNER ── */}
        {scanning && (
          <BarcodeScanner
            onScan={(barcode) => {
              setQuery(barcode);
              setScanning(false);
            }}
            onClose={() => setScanning(false)}
          />
        )}

        {/* ── INPUT FORM ── */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 20,
            padding: 20,
            marginBottom: 16,
          }}
        >
          {/* Query */}
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                fontSize: 12,
                color: "#64748b",
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
                onChange={(e) => setQuery(e.target.value)}
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
                  border: "1px solid rgba(139,92,246,0.2)",
                  background: "rgba(139,92,246,0.08)",
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
                  stroke="#a78bfa"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Sample products — always visible */}
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 11,
                color: "#64748b",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Quick start — tap to try:
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
                  fontSize: 12,
                  color: "#64748b",
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
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 14,
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontSize: 12,
                  color: "#64748b",
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
            disabled={!query || !costPrice || loading}
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
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.6s linear infinite",
                    display: "inline-block",
                  }}
                />
                Analyzing...
              </span>
            ) : (
              "Analyze product"
            )}
          </button>
          {usageCount > 0 && (
            <div
              style={{
                textAlign: "center",
                marginTop: 8,
                fontSize: 12,
                color: "#475569",
              }}
            >
              {usageCount}/{DAILY_LIMIT} analyses today
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
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
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
                color: "#94a3b8",
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

        {/* ══════════════ RESULT ══════════════ */}
        {result && (
          <div ref={resultRef} className="fade-up">
            {/* Product + Recommendation */}
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 20,
                padding: 20,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.05)",
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
                      fontSize: 28,
                      display: result.product.image ? "none" : "flex",
                    }}
                  >
                    📦
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}
                  >
                    {result.product.brand}
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      lineHeight: 1.2,
                      marginBottom: 6,
                    }}
                  >
                    {result.product.title}
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "5px 12px",
                      borderRadius: 16,
                      background: `${result.recColor}12`,
                      border: `1px solid ${result.recColor}30`,
                    }}
                  >
                    <span style={{ fontSize: 13 }}>{result.recIcon}</span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: result.recColor,
                        letterSpacing: 0.5,
                      }}
                    >
                      {result.recommendation}
                    </span>
                  </div>
                </div>
              </div>

              {/* Score Rings */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  padding: "16px 0",
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <ScoreRing
                  value={result.flipScore}
                  color={
                    result.flipScore >= 65
                      ? "#22c55e"
                      : result.flipScore >= 45
                        ? "#eab308"
                        : "#f97316"
                  }
                  label="Flip"
                />
                <ScoreRing
                  value={result.velocity}
                  color="#38bdf8"
                  label="Speed"
                />
                <ScoreRing
                  value={100 - result.risk}
                  color={
                    result.risk <= 30
                      ? "#22c55e"
                      : result.risk <= 50
                        ? "#eab308"
                        : "#ef4444"
                  }
                  label="Safety"
                />
                <ScoreRing
                  value={result.confidence}
                  color={
                    result.confidence >= 60
                      ? "#22c55e"
                      : result.confidence >= 40
                        ? "#eab308"
                        : "#ef4444"
                  }
                  label="Conf."
                />
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
                {[
                  {
                    l: "Best profit",
                    v: `$${result.mainProfit}`,
                    c:
                      parseFloat(result.mainProfit) > 0 ? "#4ade80" : "#ef4444",
                  },
                  { l: "ROI", v: `${result.mainROI}%`, c: "#a78bfa" },
                  {
                    l: "Days to sell",
                    v: `~${result.estDaysToSell}d`,
                    c: "#38bdf8",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      textAlign: "center",
                      padding: "10px 6px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        color: "#64748b",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        letterSpacing: 0.4,
                        marginBottom: 3,
                      }}
                    >
                      {s.l}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: s.c }}>
                      {s.v}
                    </div>
                  </div>
                ))}
              </div>
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

            {/* AI Explanation */}
            {result.aiExplanation && (
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  background:
                    "linear-gradient(135deg, rgba(139,92,246,0.06), rgba(14,165,233,0.04))",
                  border: "1px solid rgba(139,92,246,0.12)",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 14 }}>&#x1F9E0;</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#c4b5fd",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    AI Analysis
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "#94a3b8",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {result.aiExplanation}
                </p>
              </div>
            )}

            {/* Channel Comparison */}
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 20,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                Profit by channel
              </div>
              {result.channels.map((ch, i) => {
                const profit = parseFloat(ch.profit);
                const best = result.bestMarketplace
                  ? ch.id === result.bestMarketplace
                  : i === 0;
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
                      background: best
                        ? "rgba(34,197,94,0.04)"
                        : "rgba(255,255,255,0.01)",
                      border: `1px solid ${best ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)"}`,
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
                        }}
                      >
                        {ch.label}
                        {best && (
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: "rgba(34,197,94,0.12)",
                              color: "#4ade80",
                            }}
                          >
                            BEST
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>
                        Sells ~${ch.salePrice} &middot; Fees: ${ch.fees}
                        {parseFloat(ch.ship) > 0 ? ` + $${ch.ship} ship` : ""}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: profit > 0 ? "#4ade80" : "#ef4444",
                        }}
                      >
                        {profit > 0 ? "+" : ""}${ch.profit}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>
                        {ch.roi}% ROI
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pricing Strategy */}
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 20,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                Pricing strategy
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {[
                  {
                    l: "Quick sale",
                    v: `$${result.quickPrice}`,
                    c: "#f97316",
                    sub: "Fast",
                    primary: false,
                  },
                  {
                    l: "Market",
                    v: `$${result.marketPrice}`,
                    c: "#8b5cf6",
                    sub: `~${result.estDaysToSell}d`,
                    primary: true,
                  },
                  {
                    l: "Stretch",
                    v: `$${result.stretchPrice}`,
                    c: "#0ea5e9",
                    sub: "Patient",
                    primary: false,
                  },
                ].map((p, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      padding: "10px 6px",
                      borderRadius: 10,
                      textAlign: "center",
                      background: p.primary
                        ? "rgba(139,92,246,0.08)"
                        : "rgba(255,255,255,0.02)",
                      border: `1px solid ${p.primary ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)"}`,
                    }}
                  >
                    <div
                      style={{ fontSize: 9, color: "#64748b", marginBottom: 2 }}
                    >
                      {p.l}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: p.c }}>
                      {p.v}
                    </div>
                    <div
                      style={{ fontSize: 9, color: "#475569", marginTop: 2 }}
                    >
                      {p.sub}
                    </div>
                  </div>
                ))}
              </div>

              {/* Buy Box */}
              <div
                style={{
                  padding: "12px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>
                      Your cost
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color:
                          parseFloat(result.headroom) >= 0
                            ? "#e2e8f0"
                            : "#ef4444",
                      }}
                    >
                      ${costPrice}
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#64748b" }}>
                      Headroom
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color:
                          parseFloat(result.headroom) >= 0
                            ? "#22c55e"
                            : "#ef4444",
                      }}
                    >
                      {parseFloat(result.headroom) >= 0 ? "+" : ""}$
                      {result.headroom}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: "#64748b" }}>
                      Max buy
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#22c55e",
                      }}
                    >
                      ${result.maxBuy}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    height: 6,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.05)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 3,
                      width: `${Math.min((parseFloat(result.maxBuy) / parseFloat(costPrice)) * 100, 100)}%`,
                      background:
                        parseFloat(result.headroom) >= 0
                          ? "linear-gradient(90deg, #22c55e, #4ade80)"
                          : "linear-gradient(90deg, #ef4444, #f97316)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Market Info */}
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 20,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                Market data
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
                      background: "rgba(255,255,255,0.02)",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        color: "#475569",
                        marginBottom: 2,
                        textTransform: "uppercase",
                      }}
                    >
                      {s.l}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#94a3b8",
                      }}
                    >
                      {s.v}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA: Full Version */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(14,165,233,0.05))",
                border: "1px solid rgba(139,92,246,0.15)",
                borderRadius: 20,
                padding: 20,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                Want this in your pocket? 📱
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "#94a3b8",
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
                      background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      whiteSpace: "nowrap",
                      boxShadow: "0 4px 16px rgba(139,92,246,0.25)",
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
                  ✅ You&apos;re on the list! We&apos;ll notify you when FlipIQ
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
                border: "1px solid rgba(255,255,255,0.08)",
                background: "transparent",
                color: "#94a3b8",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Analyze another product
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
              borderTop: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: "#475569",
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
                  background: "linear-gradient(135deg, #8b5cf6, #0ea5e9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#fff",
                }}
              >
                F
              </div>
              <span style={{ fontSize: 12, color: "#475569" }}>
                FlipIQ · Built for resellers, by resellers
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
