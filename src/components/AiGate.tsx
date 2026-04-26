"use client";

import { DISPLAY } from "@/components/ui/theme";

interface AiGateProps {
  onUpgrade: () => void;
}

export default function AiGate({ onUpgrade }: AiGateProps) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 20,
        padding: 20,
        marginBottom: 12,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Blur overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          background: "rgba(8,8,13,0.6)",
          borderRadius: 20,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: 20,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 28 }}>🔒</div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#e2e8f0",
            fontFamily: DISPLAY,
          }}
        >
          AI Analysis — Starter plan
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#94a3b8",
            lineHeight: 1.6,
            maxWidth: 280,
            fontFamily: DISPLAY,
          }}
        >
          You have the numbers. Unlock the reasoning: which channel to
          prioritize, why this product is or isn&apos;t worth buying, and the
          exact action to take.
        </div>
        <button
          onClick={onUpgrade}
          style={{
            padding: "12px 24px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 4px 20px rgba(139,92,246,0.3)",
          }}
        >
          Unlock for $14.99/mo
        </button>
        <div style={{ fontSize: 11, color: "#475569" }}>
          7-day free trial · Cancel anytime
        </div>
      </div>

      {/* Blurred preview text */}
      <div
        style={{
          filter: "blur(3px)",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <span style={{ fontSize: 18 }}>🧠</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>
            AI Analysis
          </span>
        </div>
        <p
          style={{
            fontSize: 13,
            color: "#94a3b8",
            lineHeight: 1.6,
            margin: "0 0 8px",
          }}
        >
          The market for this product shows strong demand across both platforms.
          On eBay, the median sale price is competitive based on recent analyzed
          sales, with a healthy sell-through rate indicating items move
          quickly...
        </p>
        <p
          style={{
            fontSize: 13,
            color: "#94a3b8",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Considering your purchase cost, selling on the recommended channel
          would yield a net profit with an excellent ROI. The weakest factor in
          this analysis is market stability, which should be monitored
          closely...
        </p>
      </div>
    </div>
  );
}
