/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import ScoreRing from "./ScoreRing";
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

const ACCENT = "#8b5cf6";

interface OrbitalEngine {
  id: string;
  label: string;
  ring: number;
}

const ORBITAL_ENGINES: OrbitalEngine[] = [
  { id: "start", label: "Starting scan", ring: 0 },
  { id: "identify", label: "Resolving barcode", ring: 0 },
  { id: "category", label: "Classifying product", ring: 0 },
  { id: "fetch_ebay", label: "Fetching eBay comps", ring: 1 },
  { id: "fetch_amz", label: "Fetching Amazon data", ring: 1 },
  { id: "enrich", label: "Enriching titles (AI)", ring: 1 },
  { id: "relevance", label: "Filtering by relevance", ring: 1 },
  { id: "cleaner", label: "Cleaning comparables", ring: 2 },
  { id: "pricing", label: "Calculating pricing", ring: 2 },
  { id: "profit", label: "Net profit", ring: 2 },
  { id: "max_buy", label: "Max buy price", ring: 2 },
  { id: "velocity", label: "Sales velocity", ring: 2 },
  { id: "risk", label: "Risk score", ring: 2 },
  { id: "confidence", label: "Analysis confidence", ring: 2 },
  { id: "competition", label: "Market competition", ring: 2 },
  { id: "trend", label: "Demand trend", ring: 2 },
  { id: "ai", label: "AI explanation", ring: 0 },
];

const ORBITAL_STAGE_MAP: Record<string, string[]> = {
  start: ["start"],
  identify: ["identify"],
  category: ["category"],
  fetch: ["fetch_ebay", "fetch_amz"],
  matching: ["enrich", "relevance"],
  scoring: [
    "cleaner",
    "pricing",
    "profit",
    "max_buy",
    "velocity",
    "risk",
    "confidence",
    "competition",
    "trend",
  ],
  analysis: [
    "cleaner",
    "pricing",
    "profit",
    "max_buy",
    "velocity",
    "risk",
    "confidence",
    "competition",
    "trend",
  ],
  ai: ["ai"],
};

interface PositionedEngine extends OrbitalEngine {
  x: number;
  y: number;
  theta: number;
  r: number;
}

function computeOrbitals(size: number) {
  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 320;
  const rings: Record<number, number> = {
    0: 48 * scale,
    1: 100 * scale,
    2: 148 * scale,
  };
  const byRing: Record<number, OrbitalEngine[]> = { 0: [], 1: [], 2: [] };
  ORBITAL_ENGINES.forEach((e) => byRing[e.ring].push(e));
  const positioned: PositionedEngine[] = [];
  for (const ring of [0, 1, 2]) {
    const list = byRing[ring];
    const r = rings[ring];
    list.forEach((e, i) => {
      const theta = (i / list.length) * Math.PI * 2 - Math.PI / 2 + ring * 0.35;
      positioned.push({
        ...e,
        x: cx + Math.cos(theta) * r,
        y: cy + Math.sin(theta) * r,
        theta,
        r,
      });
    });
  }
  return { positioned, cx, cy, rings };
}

function formatElapsed(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

type EngineState = "idle" | "active" | "complete";

function OrbitalAnalysis({
  progress,
  elapsedSeconds,
  size = 280,
}: {
  progress: AnalysisProgress | null;
  elapsedSeconds: number;
  size?: number;
}) {
  const { positioned, cx, cy, rings } = useMemo(
    () => computeOrbitals(size),
    [size]
  );

  const [tick, setTick] = useState(0);

  useEffect(() => {
    let raf: number;
    const loop = () => {
      setTick((t) => t + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Derive engine states purely from current progress (no refs, no effects)
  const STAGE_ORDER = [
    "start",
    "identify",
    "category",
    "fetch",
    "matching",
    "scoring",
    "ai",
  ];
  const engineStates = useMemo(() => {
    const states: Record<string, EngineState> = {};
    ORBITAL_ENGINES.forEach((e) => {
      states[e.id] = "idle";
    });
    if (!progress) return states;

    const currentStage =
      progress.stage === "analysis" ? "scoring" : progress.stage;
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    if (currentIndex < 0) return states;

    for (let i = 0; i <= currentIndex; i++) {
      const stage = STAGE_ORDER[i];
      const engines = ORBITAL_STAGE_MAP[stage] || [];
      if (i < currentIndex) {
        engines.forEach((id) => {
          states[id] = "complete";
        });
      } else {
        engines.forEach((id) => {
          states[id] = progress.status === "complete" ? "complete" : "active";
        });
      }
    }
    return states;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress?.stage, progress?.status]);

  const t = tick * 0.008;
  const completedCount = Object.values(engineStates).filter(
    (s) => s === "complete"
  ).length;
  const activeCount = Object.values(engineStates).filter(
    (s) => s === "active"
  ).length;
  const progressPct = progress?.progress ?? 0;
  const message = progress?.message || "Connecting...";
  const stageName = progress?.stage || "start";

  const completedPositioned = positioned.filter(
    (e) => engineStates[e.id] === "complete"
  );

  return (
    <div
      className="fade-up"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: "20px 16px",
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
        marginBottom: 14,
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg
          width={size}
          height={size}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          <defs>
            <radialGradient id="orbCoreGlow" cx="50%" cy="50%">
              <stop offset="0%" stopColor={ACCENT} stopOpacity="0.5" />
              <stop offset="50%" stopColor={ACCENT} stopOpacity="0.08" />
              <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
            </radialGradient>
            <radialGradient id="orbNodeGlow" cx="50%" cy="50%">
              <stop offset="0%" stopColor={ACCENT} stopOpacity="0.6" />
              <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Orbit rings */}
          {[1, 2].map((ring) => (
            <circle
              key={ring}
              cx={cx}
              cy={cy}
              r={rings[ring]}
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
              strokeDasharray="2 5"
            />
          ))}

          {/* Sweep ring on outer orbit — rotates while processing */}
          {progressPct < 100 && (
            <g transform={`rotate(${t * 30} ${cx} ${cy})`}>
              <circle
                cx={cx}
                cy={cy}
                r={rings[2]}
                fill="none"
                stroke={ACCENT}
                strokeWidth="1"
                strokeDasharray={`${rings[2] * 0.08} ${rings[2] * 6}`}
                opacity={0.8}
              />
            </g>
          )}

          {/* Core glow */}
          <circle
            cx={cx}
            cy={cy}
            r={72 * (size / 320)}
            fill="url(#orbCoreGlow)"
          />

          {/* Connection lines from completed nodes to center */}
          {completedPositioned.map((e) => (
            <line
              key={`c2c-${e.id}`}
              x1={e.x}
              y1={e.y}
              x2={cx}
              y2={cy}
              stroke={ACCENT}
              strokeWidth="0.75"
              opacity={0.28}
            />
          ))}

          {/* Nodes */}
          {positioned.map((e, i) => {
            const st = engineStates[e.id];
            const isActive = st === "active";
            const isDone = st === "complete";
            const wobble = Math.sin(t * 1.1 + i * 0.7) * 1.2;
            const x = e.x + wobble;
            const y = e.y + wobble * 0.6;
            const pulse = isActive ? Math.sin(tick * 0.16 + i) * 1.8 : 0;
            const baseR = e.ring === 0 ? 8 : 5.5;
            const r = baseR + pulse + (isDone ? 1 : 0);

            const fill = isDone || isActive ? ACCENT : "rgba(255,255,255,0.18)";
            const nodeOpacity = isDone ? 1 : isActive ? 0.95 : 0.55;

            return (
              <g key={e.id}>
                {isActive && (
                  <circle
                    cx={x}
                    cy={y}
                    r={r + 10}
                    fill="url(#orbNodeGlow)"
                    opacity={0.9}
                  />
                )}
                <circle cx={x} cy={y} r={r} fill={fill} opacity={nodeOpacity} />
                {isDone && (
                  <circle
                    cx={x}
                    cy={y}
                    r={Math.max(1.5, r - 3)}
                    fill="#08080d"
                  />
                )}
              </g>
            );
          })}

          {/* Center — radiating pulse when anything active */}
          <circle
            cx={cx}
            cy={cy}
            r={14 + (activeCount > 0 ? Math.sin(tick * 0.12) * 2.5 : 0)}
            fill={ACCENT}
            opacity={0.95}
          />
          <circle cx={cx} cy={cy} r={5.5} fill="#08080d" />
        </svg>

        {/* Progress % below core */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: ACCENT,
              marginTop: 48,
              letterSpacing: 2,
              fontWeight: 500,
              opacity: 0.75,
            }}
          >
            {String(Math.round(progressPct)).padStart(2, "0")}%
          </div>
        </div>
      </div>

      {/* Status block */}
      <div
        style={{
          textAlign: "center",
          minHeight: 74,
          width: "100%",
          maxWidth: 300,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
            marginBottom: 10,
          }}
        >
          <span>
            {String(completedCount).padStart(2, "0")} / {ORBITAL_ENGINES.length}
          </span>
          <span style={{ color: ACCENT }}>{stageName}</span>
          <span>{formatElapsed(elapsedSeconds)}</span>
        </div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: "#e2e8f0",
            letterSpacing: -0.2,
            lineHeight: 1.35,
            minHeight: 42,
          }}
        >
          {message}
        </div>
      </div>
    </div>
  );
}

function ResultPreviewSkeleton() {
  return (
    <div
      className="fade-up"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
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
              background: "rgba(255,255,255,0.03)",
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
  const resultRef = useRef<HTMLDivElement>(null);
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

  const handleAnalyze = async () => {
    if (!query || !costPrice) return;
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
    setQuery(q);
    if (cost) setCostPrice(cost);
    trackEvent("example_clicked", { product: q });
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
        @keyframes pulseDot { 0%, 100% { opacity: 0.45; transform: scale(0.85) } 50% { opacity: 1; transform: scale(1) } }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 0 4px rgba(34,197,94,0.12); display: inline-block; animation: pulseDot 1.2s ease-in-out infinite; flex-shrink: 0; }
        .skeleton-line { height: 12px; border-radius: 6px; margin-bottom: 8px; background: linear-gradient(90deg, rgba(255,255,255,0.045) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.045) 75%); background-size: 200% 100%; animation: shimmer 1.4s ease-in-out infinite; }
        .skeleton-block { border-radius: 12px; background: linear-gradient(90deg, rgba(255,255,255,0.045) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.045) 75%); background-size: 200% 100%; animation: shimmer 1.4s ease-in-out infinite; }
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
            Know if you&apos;ll actually sell before you buy
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
                color: "#475569",
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

        {loading && !result && (
          <>
            <OrbitalAnalysis
              progress={analysisProgress}
              elapsedSeconds={elapsedSeconds}
            />
            <ResultPreviewSkeleton />
          </>
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

              <details
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  padding: "10px 0",
                }}
              >
                <summary
                  style={{
                    cursor: "pointer",
                    color: "#94a3b8",
                    fontSize: 12,
                    fontWeight: 700,
                    listStyle: "none",
                  }}
                >
                  Score details
                </summary>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                    padding: "16px 0 6px",
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
              </details>

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
                  const profitNum = parseFloat(result.mainProfit);
                  const lowTrust = isLowTrustResult(result);
                  return [
                    {
                      l: "Confidence",
                      v: `${result.confidence}/100`,
                      c: "#a78bfa",
                    },
                    {
                      l: lowTrust ? "Profit signal *" : "Expected profit",
                      v: lowTrust
                        ? `$${result.mainProfit}*`
                        : `$${result.mainProfit}`,
                      c: lowTrust
                        ? "#fbbf24"
                        : profitNum > 0
                          ? "#4ade80"
                          : "#ef4444",
                    },
                    {
                      l:
                        result.confidence < 60
                          ? "Days to sell *"
                          : "Days to sell",
                      v: result.estDaysToSell,
                      c: result.confidence < 60 ? "#fbbf24" : "#38bdf8",
                    },
                  ];
                })().map((s, i) => (
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

            {/* AI Explanation — skeleton while loading, real text when ready */}
            {aiLoading && (
              <div
                style={{
                  padding: "14px 16px 16px",
                  borderRadius: 14,
                  background: "rgba(139,92,246,0.04)",
                  border: "1px solid rgba(139,92,246,0.08)",
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
                    style={{ fontSize: 12, color: "#c4b5fd", fontWeight: 700 }}
                  >
                    Writing AI brief
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      fontFamily: "'JetBrains Mono', monospace",
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
                        background: "rgba(139,92,246,0.045)",
                        border: "1px solid rgba(139,92,246,0.08)",
                        textAlign: "center",
                        fontSize: 10,
                        color: "#a78bfa",
                        fontWeight: 700,
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
                          fontSize: 13,
                          color: "#94a3b8",
                          lineHeight: 1.6,
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
                              color: "#c4b5fd",
                              fontSize: 12,
                              fontWeight: 700,
                              listStyle: "none",
                            }}
                          >
                            Full analysis
                          </summary>
                          <p
                            style={{
                              fontSize: 12,
                              color: "#94a3b8",
                              lineHeight: 1.6,
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
              {result.channels.map((ch) => {
                const profit = parseFloat(ch.profit);
                const isHighlighted = Boolean(ch.badge);

                let badgeText = "";
                let badgeBg = "";
                let badgeColor = "";
                if (ch.badge) {
                  badgeText = ch.badge;
                  if (ch.badge === "BEST ROI") {
                    badgeBg = "rgba(167,139,250,0.12)";
                    badgeColor = "#a78bfa";
                  } else {
                    badgeBg = "rgba(34,197,94,0.12)";
                    badgeColor = "#4ade80";
                  }
                }

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
                      background: isHighlighted
                        ? "rgba(34,197,94,0.04)"
                        : "rgba(255,255,255,0.01)",
                      border: `1px solid ${
                        isHighlighted
                          ? "rgba(34,197,94,0.15)"
                          : "rgba(255,255,255,0.04)"
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
                        }}
                      >
                        {ch.label}
                        {badgeText && (
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: badgeBg,
                              color: badgeColor,
                            }}
                          >
                            {badgeText}
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
              {(() => {
                const q = parseFloat(result.quickPrice);
                const m = parseFloat(result.marketPrice);
                const s = parseFloat(result.stretchPrice);
                const hasQuick = q > 0 && q !== m;
                const hasStretch = s > 0 && s !== m;

                if (!hasQuick && !hasStretch) {
                  // Only market price available
                  return (
                    <div style={{ marginBottom: 12 }}>
                      <div
                        style={{
                          padding: "14px 6px",
                          borderRadius: 10,
                          textAlign: "center",
                          background: "rgba(139,92,246,0.08)",
                          border: "1px solid rgba(139,92,246,0.2)",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 9,
                            color: "#64748b",
                            marginBottom: 2,
                          }}
                        >
                          Market price
                        </div>
                        <div
                          style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: "#8b5cf6",
                          }}
                        >
                          ${result.marketPrice}
                        </div>
                        <div
                          style={{
                            fontSize: 9,
                            color: "#475569",
                            marginTop: 2,
                          }}
                        >
                          {result.estDaysToSell}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#64748b",
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
                    sub: result.estDaysToSell,
                    primary: true,
                  },
                  hasStretch && {
                    l: "Stretch",
                    v: `$${result.stretchPrice}`,
                    c: "#0ea5e9",
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
                          style={{
                            fontSize: 9,
                            color: "#64748b",
                            marginBottom: 2,
                          }}
                        >
                          {p.l}
                        </div>
                        <div
                          style={{ fontSize: 16, fontWeight: 700, color: p.c }}
                        >
                          {p.v}
                        </div>
                        <div
                          style={{
                            fontSize: 9,
                            color: "#475569",
                            marginTop: 2,
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
                {parseFloat(result.headroom) < 0 && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: "#fbbf24",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    Pay ${result.maxBuy} or less to profit on this item
                  </div>
                )}
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

            {/* Marketplace Deep Dive */}
            {result.marketplaceDetails &&
              result.marketplaceDetails.length > 1 && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 20,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}
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
                            border: `1px solid ${activeTab === idx ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.08)"}`,
                            background:
                              activeTab === idx
                                ? "rgba(139,92,246,0.12)"
                                : "transparent",
                            color: activeTab === idx ? "#c4b5fd" : "#94a3b8",
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
                    );
                  })()}
                </div>
              )}

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
