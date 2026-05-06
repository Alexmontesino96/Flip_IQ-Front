"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { addRecentSearch } from "@/lib/history";
import { runAnalysisStream, AnalysisResult } from "@/lib/analysis";
import TopBar from "@/components/ui/TopBar";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";

// Lazy-load scanner to avoid SSR issues with camera APIs
const BarcodeScanner = dynamic(() => import("@/components/BarcodeScanner"), {
  ssr: false,
});

type Phase = "scanning" | "form" | "analyzing";

export default function ScanPage() {
  const router = useRouter();

  // Scan state
  const [phase, setPhase] = useState<Phase>("scanning");
  const [barcode, setBarcode] = useState("");

  // Form state
  const [cost, setCost] = useState("");
  const [condition, setCondition] = useState("used");

  // Analysis state
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const costValue = cost ? parseFloat(cost) : null;
  const canAnalyze = barcode && costValue && costValue > 0;
  const costInputRef = useRef<HTMLInputElement>(null);

  const handleBarcodeScan = useCallback((code: string) => {
    setBarcode(code);
    setPhase("form");
    // Auto-focus cost input after a tick
    setTimeout(() => costInputRef.current?.focus(), 100);
  }, []);

  const handleAnalyze = useCallback(() => {
    if (!canAnalyze) return;
    setPhase("analyzing");
    setAnalysisProgress(0);
    setAnalysisStage("Starting...");
    setError(null);

    addRecentSearch(barcode);

    runAnalysisStream(
      barcode,
      parseFloat(cost),
      condition,
      (streamResult: AnalysisResult) => {
        // If no comps found, redirect to product-not-found page
        if (streamResult.noCompsFound) {
          const params = new URLSearchParams({ upc: barcode, cost, condition });
          router.replace(`/product-not-found?${params.toString()}`);
        }
      },
      () => {
        // AI complete
      },
      (err) => {
        setPhase("form");
        setError(err.message);
      },
      (progress) => {
        setAnalysisProgress(progress.progress);
        setAnalysisStage(progress.message);
        if (progress.progress >= 100) {
          setTimeout(async () => {
            try {
              const { fetchHistory } = await import("@/lib/history");
              const history = await fetchHistory(1);
              if (history.length > 0) {
                router.push(`/result?id=${history[0].id}`);
              } else {
                setPhase("form");
              }
            } catch {
              setPhase("form");
            }
          }, 500);
        }
      }
    ).catch((err) => {
      setPhase("form");
      setError(err instanceof Error ? err.message : "Analysis failed");
    });
  }, [barcode, cost, condition, canAnalyze, router]);

  const handleRescan = useCallback(() => {
    setBarcode("");
    setCost("");
    setCondition("used");
    setError(null);
    setPhase("scanning");
  }, []);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0A0A0A",
        display: "flex",
        flexDirection: "column",
        color: "#F5F5F2",
        maxWidth: 480,
        margin: "0 auto",
        position: "relative",
      }}
    >
      <TopBar title="Scan" accent={ACCENT} onBack={() => router.back()} />

      {/* ═══ PHASE: SCANNING ═══ */}
      {phase === "scanning" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Camera area */}
          <div
            style={{
              margin: "8px 20px 0",
              borderRadius: 20,
              overflow: "hidden",
              aspectRatio: "4/3",
              background: "#000",
              position: "relative",
            }}
          >
            <BarcodeScanner
              onScan={handleBarcodeScan}
              onClose={() => router.back()}
              inline
            />
          </div>

          {/* Manual entry option */}
          <div style={{ padding: "20px 20px 0", textAlign: "center" }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                color: "rgba(245,245,242,0.3)",
                marginBottom: 12,
              }}
            >
              Or enter barcode manually
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter UPC / EAN..."
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && barcode.trim()) {
                    handleBarcodeScan(barcode.trim());
                  }
                }}
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: `1px solid rgba(245,245,242,0.1)`,
                  background: "rgba(245,245,242,0.04)",
                  color: "#F5F5F2",
                  fontFamily: MONO,
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <button
                onClick={() => {
                  if (barcode.trim()) handleBarcodeScan(barcode.trim());
                }}
                disabled={!barcode.trim()}
                style={{
                  padding: "12px 18px",
                  borderRadius: 12,
                  background: barcode.trim()
                    ? ACCENT
                    : "rgba(245,245,242,0.06)",
                  color: barcode.trim() ? "#0A0A0A" : "rgba(245,245,242,0.3)",
                  border: "none",
                  fontFamily: MONO,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: barcode.trim() ? "pointer" : "default",
                  letterSpacing: 0.5,
                }}
              >
                GO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PHASE: FORM (barcode detected) ═══ */}
      {phase === "form" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Detected barcode */}
          <div style={{ padding: "16px 20px 0" }}>
            <div
              style={{
                padding: "14px 16px",
                borderRadius: 12,
                background: `${ACCENT}14`,
                border: `1px solid ${ACCENT}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 8,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: ACCENT,
                    marginBottom: 4,
                  }}
                >
                  Barcode detected
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#F5F5F2",
                    letterSpacing: 1,
                  }}
                >
                  {barcode}
                </div>
              </div>
              <button
                onClick={handleRescan}
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  color: "rgba(245,245,242,0.35)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Rescan
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                margin: "12px 20px 0",
                padding: "12px 14px",
                borderRadius: 10,
                background: "rgba(255,100,100,0.1)",
                border: "1px solid rgba(255,100,100,0.2)",
                fontFamily: DISPLAY,
                fontSize: 13,
                color: "#FF6464",
              }}
            >
              {error}
            </div>
          )}

          {/* Cost input */}
          <StepHeader number={1} label="Cost" />
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
                ref={costInputRef}
                autoFocus
                type="number"
                inputMode="decimal"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canAnalyze) handleAnalyze();
                }}
                placeholder="0.00"
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

          {/* Condition */}
          <StepHeader number={2} label="Condition" />
          <div style={{ padding: "0 20px", display: "flex", gap: 8 }}>
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

          <div style={{ flex: 1 }} />

          {/* Analyze button */}
          <div style={{ padding: "20px" }}>
            <button
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              style={{
                width: "100%",
                padding: "16px 20px",
                borderRadius: 14,
                background: canAnalyze ? ACCENT : "rgba(245,245,242,0.06)",
                color: canAnalyze ? "#0A0A0A" : "rgba(245,245,242,0.3)",
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
          </div>
        </div>
      )}

      {/* ═══ PHASE: ANALYZING ═══ */}
      {phase === "analyzing" && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            padding: 40,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              border: "2px solid rgba(245,245,242,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <svg
              width="120"
              height="120"
              style={{ position: "absolute", transform: "rotate(-90deg)" }}
            >
              <circle
                cx="60"
                cy="60"
                r="58"
                fill="none"
                stroke={ACCENT}
                strokeWidth="2"
                strokeDasharray={`${2 * Math.PI * 58}`}
                strokeDashoffset={`${2 * Math.PI * 58 * (1 - analysisProgress / 100)}`}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            <span
              style={{
                fontFamily: DISPLAY,
                fontSize: 32,
                fontWeight: 700,
                color: "#F5F5F2",
                letterSpacing: -1,
              }}
            >
              {Math.round(analysisProgress)}%
            </span>
          </div>

          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 16,
                fontWeight: 600,
                color: "#F5F5F2",
                marginBottom: 6,
              }}
            >
              Analyzing...
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                color: "rgba(245,245,242,0.4)",
                letterSpacing: 0.5,
              }}
            >
              {analysisStage}
            </div>
          </div>

          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              color: "rgba(245,245,242,0.3)",
              marginTop: 8,
            }}
          >
            {barcode}
          </div>
        </div>
      )}
    </div>
  );
}

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
