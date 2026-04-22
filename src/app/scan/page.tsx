"use client";

// Usage:
// Navigate to /scan — mobile barcode scanning screen.
// Simulates a live camera viewfinder with animated scan line.
// Detected product + cost input feeds into the analyzer at /.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/ui/TopBar";
import BigBtn from "@/components/ui/BigBtn";
import TinyBadge from "@/components/ui/TinyBadge";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";

export default function ScanPage() {
  const router = useRouter();
  const [tick, setTick] = useState(0);
  const [cost, setCost] = useState("80.00");

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
    }, 50);
    return () => clearInterval(id);
  }, []);

  const scanLineTop = `${30 + Math.sin(tick * 0.08) * 25}%`;

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
      }}
    >
      {/* 1. TopBar */}
      <TopBar title="Scan" accent={ACCENT} onBack={() => router.back()} />

      {/* 2. Camera viewport */}
      <div
        style={{
          margin: "8px 20px 0",
          borderRadius: 20,
          overflow: "hidden",
          aspectRatio: "4/3",
          background: "#000",
          position: "relative",
          backgroundImage:
            "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 60%, #141414 100%)",
        }}
      >
        {/* Center placeholder */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "60%",
              height: "60%",
              border: "1px dashed rgba(245,245,242,0.15)",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10,
                color: "rgba(245,245,242,0.2)",
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              CAMERA
            </span>
          </div>
        </div>

        {/* Corner brackets */}
        {/* Top-left */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            width: 28,
            height: 28,
            borderTop: `2px solid ${ACCENT}`,
            borderLeft: `2px solid ${ACCENT}`,
            borderRadius: "4px 0 0 0",
          }}
        />
        {/* Top-right */}
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            width: 28,
            height: 28,
            borderTop: `2px solid ${ACCENT}`,
            borderRight: `2px solid ${ACCENT}`,
            borderRadius: "0 4px 0 0",
          }}
        />
        {/* Bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            width: 28,
            height: 28,
            borderBottom: `2px solid ${ACCENT}`,
            borderLeft: `2px solid ${ACCENT}`,
            borderRadius: "0 0 0 4px",
          }}
        />
        {/* Bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            width: 28,
            height: 28,
            borderBottom: `2px solid ${ACCENT}`,
            borderRight: `2px solid ${ACCENT}`,
            borderRadius: "0 0 4px 0",
          }}
        />

        {/* Animated scan line */}
        <div
          style={{
            position: "absolute",
            left: "15%",
            right: "15%",
            height: 1,
            background: ACCENT,
            boxShadow: `0 0 12px ${ACCENT}`,
            opacity: 0.8,
            top: scanLineTop,
            transition: "top 50ms linear",
          }}
        />

        {/* Bottom status bar */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <TinyBadge color={ACCENT} bg={`${ACCENT}22`}>
            ● LIVE
          </TinyBadge>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: "rgba(245,245,242,0.45)",
              letterSpacing: 0.5,
            }}
          >
            Point at the barcode
          </span>
        </div>
      </div>

      {/* 3. Detected product */}
      <div style={{ padding: "16px 20px 0" }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 9,
            letterSpacing: 2,
            color: ACCENT,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          ✓ DETECTED
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 18,
            fontWeight: 600,
            color: "#F5F5F2",
            lineHeight: 1.3,
            marginBottom: 4,
          }}
        >
          Apple AirPods Pro 2 (USB-C) — MagSafe
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            color: "rgba(245,245,242,0.5)",
          }}
        >
          UPC 194253397298 · Audio
        </div>
      </div>

      {/* 4. Cost input */}
      <div style={{ padding: "20px 20px 0" }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 9,
            letterSpacing: 2,
            color: "rgba(245,245,242,0.45)",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          YOUR COST
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 6,
            borderBottom: `1.5px solid ${ACCENT}`,
            paddingBottom: 8,
          }}
        >
          <span
            style={{
              fontFamily: DISPLAY,
              fontSize: 28,
              fontWeight: 600,
              color: "rgba(245,245,242,0.5)",
              lineHeight: 1,
              paddingBottom: 2,
            }}
          >
            $
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              color: "#F5F5F2",
              fontFamily: DISPLAY,
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: -1.5,
              lineHeight: 1,
              outline: "none",
              padding: 0,
              minWidth: 0,
            }}
            aria-label="Your cost in USD"
          />
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: "rgba(245,245,242,0.35)",
              letterSpacing: 1.5,
              paddingBottom: 4,
            }}
          >
            USD
          </span>
        </div>
      </div>

      {/* 5. Spacer */}
      <div style={{ flex: 1 }} />

      {/* 6. Bottom button */}
      <div style={{ padding: "20px 20px 24px" }}>
        <BigBtn onClick={() => router.push("/free")} accent={ACCENT}>
          Analyze →
        </BigBtn>
      </div>
    </div>
  );
}
