"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getRecentSearches, addRecentSearch } from "@/lib/history";
import {
  fetchProductSuggestions,
  registerSuggestionSelect,
  ProductSuggestion,
} from "@/lib/search";
import { runAnalysisStream, AnalysisResult } from "@/lib/analysis";
import TopBar from "@/components/ui/TopBar";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [recentPills, setRecentPills] = useState<string[]>(() =>
    getRecentSearches()
  );
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Picked product (Step 1 complete)
  const [picked, setPicked] = useState<ProductSuggestion | null>(null);

  // Step 2: Cost
  const [cost, setCost] = useState("");

  // Step 3: Condition
  const [condition, setCondition] = useState("used");

  // Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);
  const targetProgressRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const [analysisStage, setAnalysisStage] = useState("");
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Smooth lerp animation for progress
  useEffect(() => {
    if (!analyzing) {
      setDisplayProgress(0);
      targetProgressRef.current = 0;
      return;
    }

    let lastTime = performance.now();

    function tick(now: number) {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      setDisplayProgress((prev) => {
        const target = targetProgressRef.current;
        const gap = target - prev;

        // Lerp toward target
        let next = prev + gap * 0.08;

        // Creep forward slightly between events (~1.5%/sec)
        if (gap < 2 && prev < 95) {
          next = Math.max(next, prev + dt * 1.5);
          // Don't overtake: cap at target - 0.5
          next = Math.min(next, target > 0 ? target - 0.5 : prev + dt * 1.5);
        }

        return Math.min(100, Math.max(prev, next));
      });

      animFrameRef.current = requestAnimationFrame(tick);
    }

    // Start creeping immediately
    targetProgressRef.current = 3;
    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [analyzing]);

  const costValue = cost ? parseFloat(cost) : null;
  const canAnalyze = picked !== null && costValue !== null && costValue > 0;

  // Debounced suggestion fetch
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2 || picked !== null) {
      const handle = requestAnimationFrame(() => {
        setSuggestions([]);
        if (trimmed.length < 2) setHasSearched(false);
      });
      return () => cancelAnimationFrame(handle);
    }

    const timer = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoadingSuggestions(true);
      fetchProductSuggestions(trimmed, 8, controller.signal)
        .then((res) => {
          setSuggestions(res.results);
          setHasSearched(true);
        })
        .catch(() => {})
        .finally(() => setLoadingSuggestions(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query, picked]);

  const handleSuggestionClick = useCallback((s: ProductSuggestion) => {
    if (s.id) {
      registerSuggestionSelect(s.id);
    }
    setQuery(s.title);
    setPicked(s);
    setSuggestions([]);
    addRecentSearch(s.title);
    setRecentPills(getRecentSearches());
  }, []);

  const handleClearPicked = useCallback(() => {
    setPicked(null);
    setSuggestions([]);
    setCost("");
    setHasSearched(false);
  }, []);

  const executeAnalysis = useCallback(
    (q: string, costStr: string, cond: string) => {
      setAnalyzing(true);
      targetProgressRef.current = 3;
      setDisplayProgress(0);
      setAnalysisStage("Starting...");
      setAnalysisError(null);

      runAnalysisStream(
        q,
        parseFloat(costStr),
        cond,
        (streamResult: AnalysisResult) => {
          // Cache the full stream result (has sample_comps, fee breakdown, etc.)
          try {
            sessionStorage.setItem(
              "flipiq_last_result",
              JSON.stringify(streamResult)
            );
          } catch {
            /* ignore */
          }
          // Navigate immediately — analysis data ready, AI loads in background
          if (streamResult.analysisId) {
            router.push(`/result?id=${streamResult.analysisId}`);
          }
        },
        () => {
          // AI complete — user already on result page, they can reload to see AI
        },
        (err) => {
          setAnalyzing(false);
          setAnalysisError(err.message);
        },
        (progress) => {
          // Scale 0-88 from backend to 0-100 for display (we navigate at 88%)
          const scaled = Math.min(
            100,
            Math.round((progress.progress / 88) * 100)
          );
          targetProgressRef.current = scaled; // lerp will smoothly chase this
          setAnalysisStage(progress.message);
          // Navigate when we get the analysis_id from progress details
          // This arrives in the "ai complete" stage (progress ~100)
          const aid = progress.details?.analysis_id as number | undefined;
          if (aid) {
            router.push(`/result?id=${aid}`);
            return;
          }
          // Fallback: if progress hits 100 without analysis_id
          if (progress.progress >= 100) {
            setTimeout(async () => {
              try {
                const { fetchHistory } = await import("@/lib/history");
                const history = await fetchHistory(1);
                if (history.length > 0) {
                  router.push(`/result?id=${history[0].id}`);
                } else {
                  setAnalyzing(false);
                }
              } catch {
                setAnalyzing(false);
              }
            }, 500);
          }
        }
      ).catch((err) => {
        setAnalyzing(false);
        setAnalysisError(
          err instanceof Error ? err.message : "Analysis failed"
        );
      });
    },
    [router]
  );

  const handleAnalyze = useCallback(() => {
    if (!canAnalyze || analyzing) return;
    const q = picked!.title;
    addRecentSearch(q);
    setRecentPills(getRecentSearches());
    executeAnalysis(q, cost, condition);
  }, [canAnalyze, analyzing, picked, cost, condition, executeAnalysis]);

  const handleDirectAnalyze = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed || !costValue || costValue <= 0 || analyzing) return;
    addRecentSearch(trimmed);
    setRecentPills(getRecentSearches());
    executeAnalysis(trimmed, cost, condition);
  }, [query, cost, costValue, condition, analyzing, executeAnalysis]);

  const showSuggestions =
    picked === null && query.trim().length >= 2 && suggestions.length > 0;
  const showNoResults =
    picked === null &&
    hasSearched &&
    query.trim().length >= 2 &&
    suggestions.length === 0 &&
    !loadingSuggestions;
  const showRecent =
    picked === null &&
    !showSuggestions &&
    recentPills.length > 0 &&
    !query.trim();

  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: "#0A0A0A",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      <TopBar title="Search" accent={ACCENT} onBack={() => router.back()} />

      {/* ── Analyzing overlay (matches iOS AnalyzingScreen) ── */}
      {analyzing && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            background: "#0A0A0A",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
          }}
        >
          {/* Product info */}
          {picked && (
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#F5F5F2",
                  letterSpacing: -0.4,
                  marginBottom: 4,
                }}
              >
                {picked.title}
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: "rgba(245,245,242,0.35)",
                }}
              >
                Live market scan
              </div>
            </div>
          )}

          {/* Metaball sphere */}
          <div
            style={{
              position: "relative",
              width: 260,
              height: 260,
              marginBottom: 16,
            }}
          >
            {/* Sphere container */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                overflow: "hidden",
                border: `1px solid ${ACCENT}1F`,
                background:
                  "radial-gradient(circle at 50% 40%, #0B1005 0%, #060606 80%)",
                boxShadow: `inset 0 0 60px ${ACCENT}14, 0 0 80px ${ACCENT}0A`,
              }}
            >
              {/* SVG metaballs */}
              <svg
                viewBox="0 0 260 260"
                style={{ width: "100%", height: "100%", display: "block" }}
              >
                <defs>
                  <filter id="analyze-goo">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
                    <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" />
                  </filter>
                  <radialGradient id="analyze-grad" cx="50%" cy="40%" r="70%">
                    <stop offset="0%" stopColor="#E8FF7A" />
                    <stop offset="55%" stopColor="#D4FF3A" />
                    <stop offset="100%" stopColor="#7AA018" />
                  </radialGradient>
                </defs>
                <g filter="url(#analyze-goo)">
                  <g fill="url(#analyze-grad)">
                    {/* Central blob — grows with progress */}
                    <circle
                      cx="130"
                      cy="130"
                      r={12 + (displayProgress / 100) * 80}
                      style={{ transition: "r 0.8s ease" }}
                    >
                      <animate
                        attributeName="cx"
                        values="128;132;128"
                        dur="4s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="cy"
                        values="132;128;132"
                        dur="5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    {/* Orbiting blobs */}
                    {[0, 1, 2, 3, 4, 5].map((i) => {
                      const angle = (i / 6) * Math.PI * 2;
                      const pull = 1 - (displayProgress / 100) * 0.55;
                      const bx = 130 + Math.cos(angle) * 60 * pull;
                      const by = 130 + Math.sin(angle) * 60 * pull;
                      const r = 14 + (displayProgress / 100) * 16;
                      return (
                        <circle
                          key={i}
                          cx={bx}
                          cy={by}
                          r={Math.max(4, r)}
                          style={{ transition: "cx 0.8s, cy 0.8s, r 0.8s" }}
                        >
                          <animate
                            attributeName="cx"
                            values={`${bx - 4};${bx + 4};${bx - 4}`}
                            dur={`${3 + i * 0.5}s`}
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="cy"
                            values={`${by + 3};${by - 3};${by + 3}`}
                            dur={`${4 + i * 0.3}s`}
                            repeatCount="indefinite"
                          />
                        </circle>
                      );
                    })}
                  </g>
                </g>
              </svg>
            </div>

            {/* Center readout — mix-blend-mode difference */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                mixBlendMode: "difference",
                pointerEvents: "none",
                zIndex: 3,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <span
                  style={{
                    fontFamily: DISPLAY,
                    fontWeight: 900,
                    fontSize: 72,
                    letterSpacing: -4,
                    color: "#F5F5F2",
                    lineHeight: 1,
                  }}
                >
                  {Math.round(displayProgress)}
                </span>
                <span
                  style={{
                    fontFamily: DISPLAY,
                    fontWeight: 900,
                    fontSize: 28,
                    letterSpacing: -1,
                    color: "#F5F5F2",
                    marginTop: 6,
                    marginLeft: 2,
                  }}
                >
                  %
                </span>
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: "#F5F5F2",
                  opacity: 0.85,
                  marginTop: 10,
                }}
              >
                {displayProgress >= 100 ? "complete" : "analyzing"}
              </div>
            </div>
          </div>

          {/* Message + engine count */}
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 15,
                fontWeight: 500,
                color: "#F5F5F2",
                letterSpacing: -0.2,
                marginBottom: 6,
                maxWidth: 300,
              }}
            >
              {analysisStage}
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 9,
                letterSpacing: 2,
                color: "rgba(245,245,242,0.35)",
                textTransform: "uppercase",
              }}
            >
              {displayProgress < 28
                ? "02"
                : displayProgress < 59
                  ? "05"
                  : displayProgress < 82
                    ? "09"
                    : displayProgress < 100
                      ? "12"
                      : "13"}
              /13 engines
            </div>
          </div>

          {/* Stage chips */}
          <div style={{ display: "flex", gap: 6 }}>
            {["fetch", "matching", "scoring", "done"].map((s) => {
              const thresholds: Record<string, number> = {
                fetch: 28,
                matching: 59,
                scoring: 82,
                done: 100,
              };
              const currentStage =
                displayProgress < 28
                  ? "start"
                  : displayProgress < 59
                    ? "fetch"
                    : displayProgress < 82
                      ? "matching"
                      : displayProgress < 100
                        ? "scoring"
                        : "done";
              const isActive = s === currentStage;
              const isDone = displayProgress >= thresholds[s];
              return (
                <span
                  key={s}
                  style={{
                    fontFamily: MONO,
                    fontSize: 8,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    padding: "4px 8px",
                    borderRadius: 4,
                    background: "rgba(10,10,10,0.5)",
                    border: `1px solid ${isActive ? ACCENT : isDone ? `${ACCENT}40` : "rgba(245,245,242,0.08)"}`,
                    color: isActive
                      ? ACCENT
                      : isDone
                        ? ACCENT
                        : "rgba(245,245,242,0.3)",
                    transition: "all 0.3s",
                  }}
                >
                  {s}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Analysis error ── */}
      {analysisError && !analyzing && (
        <div
          style={{
            margin: "0 20px",
            padding: "14px 16px",
            borderRadius: 12,
            background: "rgba(255,100,100,0.1)",
            border: "1px solid rgba(255,100,100,0.2)",
            fontFamily: DISPLAY,
            fontSize: 13,
            color: "#FF6464",
            marginBottom: 8,
          }}
        >
          {analysisError}
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* ── Step 1: Product ── */}
        <StepHeader number={1} label="Product" />

        {/* Search Input */}
        <div style={{ padding: "0 20px" }}>
          <div
            style={{
              borderBottom: `1px solid ${ACCENT}`,
              paddingBottom: 10,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 22 22"
              fill="none"
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            >
              <circle cx="9" cy="9" r="6" stroke={ACCENT} strokeWidth="1.8" />
              <path
                d="M14 14l4 4"
                stroke={ACCENT}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>

            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (picked) setPicked(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (picked && canAnalyze) {
                    handleAnalyze();
                  } else if (!picked && query.trim()) {
                    // Direct search — create a pseudo-picked from the query text
                    const trimmed = query.trim();
                    setPicked({
                      id: null,
                      title: trimmed,
                      brand: null,
                      category: null,
                      image_url: null,
                      barcode: null,
                      price_hint: null,
                      search_count: 0,
                    });
                    setSuggestions([]);
                    addRecentSearch(trimmed);
                    setRecentPills(getRecentSearches());
                  }
                }
              }}
              placeholder="Search products..."
              aria-label="Search products"
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                color: "#F5F5F2",
                fontFamily: DISPLAY,
                fontSize: 20,
                fontWeight: 500,
                letterSpacing: -0.3,
                outline: "none",
                caretColor: ACCENT,
                minWidth: 0,
              }}
            />

            {query.length > 0 && (
              <button
                onClick={() => {
                  setQuery("");
                  setSuggestions([]);
                  setPicked(null);
                  setCost("");
                  setHasSearched(false);
                }}
                aria-label="Clear search"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(245,245,242,0.45)",
                  fontSize: 20,
                  lineHeight: 1,
                  cursor: "pointer",
                  padding: "0 2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* ── Suggestions (hidden once picked) ── */}
        {picked === null && (
          <>
            {loadingSuggestions &&
              query.trim().length >= 2 &&
              suggestions.length === 0 && (
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    fontFamily: MONO,
                    fontSize: 10,
                    color: "rgba(245,245,242,0.3)",
                  }}
                >
                  Searching...
                </div>
              )}

            {showSuggestions && (
              <div style={{ padding: "0 20px" }}>
                {/* Direct search option — like iOS "Analyze [query]" */}
                <button
                  onClick={() => {
                    const trimmed = query.trim();
                    setPicked({
                      id: null,
                      title: trimmed,
                      brand: null,
                      category: null,
                      image_url: null,
                      barcode: null,
                      price_hint: null,
                      search_count: 0,
                    });
                    setSuggestions([]);
                    addRecentSearch(trimmed);
                    setRecentPills(getRecentSearches());
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 0",
                    background: "none",
                    border: "none",
                    borderBottom: `1px solid ${ACCENT}22`,
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: `${ACCENT}1A`,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={ACCENT}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: DISPLAY,
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#F5F5F2",
                      }}
                    >
                      Analyze &quot;{query.trim()}&quot;
                    </div>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        color: "rgba(245,245,242,0.35)",
                        marginTop: 2,
                      }}
                    >
                      Direct keyword search
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 9,
                      fontWeight: 700,
                      color: ACCENT,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      flexShrink: 0,
                    }}
                  >
                    GO →
                  </span>
                </button>

                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 9,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: "rgba(245,245,242,0.4)",
                    margin: "10px 0 8px",
                  }}
                >
                  Suggestions
                </div>
                <ul
                  style={{
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                  }}
                  role="listbox"
                  aria-label="Search suggestions"
                >
                  {suggestions.map((s, i) => (
                    <li
                      key={s.id ?? `s-${i}`}
                      role="option"
                      aria-selected={false}
                      style={{
                        borderBottom: "1px solid rgba(245,245,242,0.05)",
                      }}
                    >
                      <button
                        onClick={() => handleSuggestionClick(s)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 0",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          width: "100%",
                          textAlign: "left",
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: "rgba(245,245,242,0.06)",
                            flexShrink: 0,
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {s.image_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={s.image_url}
                              alt=""
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="rgba(245,245,242,0.2)"
                              strokeWidth="1.5"
                            >
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <path d="M3 16l5-5 4 4 4-6 5 7" />
                            </svg>
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontFamily: DISPLAY,
                              fontSize: 15,
                              fontWeight: 500,
                              color: "#F5F5F2",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {s.title}
                          </div>
                          {(s.brand || s.category) && (
                            <div
                              style={{
                                fontFamily: MONO,
                                fontSize: 10,
                                color: "rgba(245,245,242,0.35)",
                                marginTop: 2,
                              }}
                            >
                              {[s.brand, s.category]
                                .filter(Boolean)
                                .join(" · ")}
                            </div>
                          )}
                        </div>

                        {s.price_hint != null && s.price_hint > 0 && (
                          <span
                            style={{
                              fontFamily: MONO,
                              fontSize: 12,
                              fontWeight: 600,
                              color: ACCENT,
                              flexShrink: 0,
                            }}
                          >
                            ~${s.price_hint.toFixed(0)}
                          </span>
                        )}

                        <span
                          style={{
                            fontSize: 16,
                            color: "rgba(245,245,242,0.25)",
                            flexShrink: 0,
                          }}
                        >
                          +
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* No results */}
            {showNoResults && (
              <div
                style={{
                  padding: "24px 20px",
                  textAlign: "center",
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 22 22"
                  fill="none"
                  style={{
                    margin: "0 auto 8px",
                    display: "block",
                    opacity: 0.3,
                  }}
                >
                  <circle
                    cx="9"
                    cy="9"
                    r="6"
                    stroke="rgba(245,245,242,0.4)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M14 14l4 4"
                    stroke="rgba(245,245,242,0.4)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <div
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 15,
                    fontWeight: 500,
                    color: "rgba(245,245,242,0.6)",
                    marginBottom: 4,
                  }}
                >
                  No results for &quot;{query}&quot;
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    color: "rgba(245,245,242,0.3)",
                  }}
                >
                  You can analyze directly with the button below
                </div>
              </div>
            )}

            {/* Recent searches */}
            {showRecent && (
              <div style={{ padding: "20px 20px 0" }}>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 9,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: "rgba(245,245,242,0.4)",
                    margin: "0 0 10px",
                  }}
                >
                  Recent Searches
                </div>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                  role="list"
                  aria-label="Recent searches"
                >
                  {recentPills.map((pill) => (
                    <button
                      key={pill}
                      role="listitem"
                      onClick={() => {
                        setQuery(pill);
                      }}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 100,
                        background: "rgba(245,245,242,0.06)",
                        border: "none",
                        color: "rgba(245,245,242,0.75)",
                        fontFamily: DISPLAY,
                        fontSize: 13,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!showSuggestions &&
              !showRecent &&
              !showNoResults &&
              !query.trim() && (
                <div
                  style={{
                    padding: "60px 20px",
                    textAlign: "center",
                    fontFamily: MONO,
                    fontSize: 11,
                    color: "rgba(245,245,242,0.3)",
                  }}
                >
                  Type a product name to search
                </div>
              )}
          </>
        )}

        {/* ── Picked chip ── */}
        {picked && (
          <>
            <div style={{ padding: "14px 20px 0" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: `${ACCENT}14`,
                  border: `1px solid ${ACCENT}40`,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "rgba(245,245,242,0.06)",
                    flexShrink: 0,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {picked.image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={picked.image_url}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(245,245,242,0.2)"
                      strokeWidth="1.5"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                    </svg>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 8,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      color: ACCENT,
                      marginBottom: 2,
                    }}
                  >
                    Selected
                  </div>
                  <div
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#F5F5F2",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {picked.title}
                  </div>
                </div>

                <button
                  onClick={handleClearPicked}
                  style={{
                    background: "none",
                    border: "none",
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    color: "rgba(245,245,242,0.35)",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  Change
                </button>
              </div>
            </div>

            {/* ── Step 2: Cost ── */}
            <StepHeader number={2} label="Cost" />
            <div style={{ padding: "0 20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 4,
                  borderBottom: `1px solid ${ACCENT}`,
                  paddingBottom: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 26,
                    fontWeight: 600,
                    color: "rgba(245,245,242,0.3)",
                  }}
                >
                  $
                </span>
                <input
                  autoFocus
                  type="number"
                  inputMode="decimal"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canAnalyze) handleAnalyze();
                  }}
                  placeholder="0.00"
                  aria-label="Cost price"
                  style={{
                    flex: 1,
                    border: "none",
                    background: "transparent",
                    color: "#F5F5F2",
                    fontFamily: DISPLAY,
                    fontSize: 32,
                    fontWeight: 700,
                    letterSpacing: -1.2,
                    outline: "none",
                    caretColor: ACCENT,
                    minWidth: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: 1.5,
                    color: "rgba(245,245,242,0.3)",
                  }}
                >
                  USD
                </span>
              </div>
            </div>

            {/* ── Step 3: Condition ── */}
            <StepHeader number={3} label="Condition" />
            <div
              style={{
                padding: "0 20px",
                display: "flex",
                gap: 8,
              }}
            >
              <ConditionButton
                label="New"
                sub="sealed"
                isActive={condition === "new"}
                onClick={() => setCondition("new")}
              />
              <ConditionButton
                label="Used"
                sub="open · working"
                isActive={condition === "used"}
                onClick={() => setCondition("used")}
              />
            </div>
          </>
        )}

        {/* bottom spacer for CTA */}
        <div style={{ height: 100 }} />
      </div>

      {/* ── Bottom CTA ── */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: "#0A0A0A",
          borderTop: "1px solid rgba(245,245,242,0.07)",
          padding: "16px 20px",
        }}
      >
        {picked ? (
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze || analyzing}
            style={{
              width: "100%",
              padding: "16px 20px",
              borderRadius: 14,
              background:
                canAnalyze && !analyzing ? ACCENT : "rgba(245,245,242,0.06)",
              color:
                canAnalyze && !analyzing ? "#0A0A0A" : "rgba(245,245,242,0.3)",
              border: "none",
              fontFamily: DISPLAY,
              fontSize: 15,
              fontWeight: 700,
              cursor: canAnalyze ? "pointer" : "default",
              letterSpacing: -0.2,
            }}
          >
            {canAnalyze
              ? `Analyze · $${parseFloat(cost).toFixed(0)} ${condition} →`
              : "Analyze →"}
          </button>
        ) : query.trim() ? (
          <button
            onClick={handleDirectAnalyze}
            disabled={!costValue || costValue <= 0}
            style={{
              width: "100%",
              padding: "16px 20px",
              borderRadius: 14,
              background:
                costValue && costValue > 0 ? ACCENT : "rgba(245,245,242,0.06)",
              color:
                costValue && costValue > 0
                  ? "#0A0A0A"
                  : "rgba(245,245,242,0.3)",
              border: "none",
              fontFamily: DISPLAY,
              fontSize: 15,
              fontWeight: 700,
              cursor: costValue && costValue > 0 ? "pointer" : "default",
              letterSpacing: -0.2,
            }}
          >
            Analyze &quot;{query.trim()}&quot; →
          </button>
        ) : null}
      </div>
    </div>
  );
}

// ── Step Header ──
function StepHeader({ number, label }: { number: number; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "16px 20px 8px",
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: 10,
          fontWeight: 700,
          color: "#0A0A0A",
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: ACCENT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {number}
      </span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 9,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "rgba(245,245,242,0.35)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Condition Button ──
function ConditionButton({
  label,
  sub,
  isActive,
  onClick,
}: {
  label: string;
  sub: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "12px 14px",
        borderRadius: 12,
        background: isActive ? ACCENT : "transparent",
        border: isActive ? "none" : "1px solid rgba(245,245,242,0.1)",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 15,
          fontWeight: 700,
          color: isActive ? "#0A0A0A" : "#F5F5F2",
          letterSpacing: -0.3,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 9,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: isActive ? "rgba(10,10,10,0.6)" : "rgba(245,245,242,0.35)",
          marginTop: 2,
        }}
      >
        {sub}
      </div>
    </button>
  );
}
