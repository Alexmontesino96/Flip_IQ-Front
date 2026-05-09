"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";
import Link from "next/link";

const BG = "#0A0A0A";
const INK = "#F5F5F2";
const DIM = "rgba(245,245,242,0.55)";
const DIMMER = "rgba(245,245,242,0.35)";
const LINE = "rgba(245,245,242,0.08)";
const LINE2 = "rgba(245,245,242,0.14)";

function ProductNotFoundContent() {
  const router = useRouter();
  const params = useSearchParams();
  const upc = params.get("upc") || "";
  const cost = params.get("cost") || "";
  const condition = params.get("condition") || "new";
  const analysisId = params.get("analysis_id") || "";

  const [keyword, setKeyword] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email);
    });
  }, []);

  const handleKeywordSearch = () => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    sessionStorage.setItem("flipiq_search_seed", trimmed);
    const p = new URLSearchParams();
    if (cost) p.set("cost", cost);
    if (condition) p.set("condition", condition);
    const qs = p.toString();
    router.push(`/search${qs ? `?${qs}` : ""}`);
  };

  const handleProvideDetails = () => {
    const p = new URLSearchParams();
    if (analysisId) p.set("analysis_id", analysisId);
    if (upc) p.set("upc", upc);
    if (cost) p.set("cost", cost);
    if (condition) p.set("condition", condition);
    const qs = p.toString();
    router.push(`/product-not-found/details${qs ? `?${qs}` : ""}`);
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: BG,
        color: INK,
        fontFamily: DISPLAY,
        display: "flex",
        flexDirection: "column",
        maxWidth: 520,
        margin: "0 auto",
        padding: "40px 20px",
      }}
    >
      {/* Orbital glyph */}
      <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}
      >
        <svg width="120" height="120" viewBox="0 0 160 160" fill="none">
          <circle
            cx="80"
            cy="80"
            r="60"
            fill="none"
            stroke={ACCENT}
            strokeOpacity="0.15"
            strokeWidth="1"
            strokeDasharray="2 6"
          />
          <circle
            cx="80"
            cy="80"
            r="38"
            fill="none"
            stroke="rgba(245,245,242,0.15)"
            strokeWidth="1"
          />
          <circle cx="80" cy="20" r="3" fill={ACCENT} opacity="0.6" />
          <circle cx="140" cy="72" r="2.5" fill="rgba(245,245,242,0.3)" />
          <circle cx="32" cy="110" r="2" fill="rgba(245,245,242,0.2)" />
          <path
            d="M 62 80 A 18 18 0 1 1 98 80"
            fill="none"
            stroke={ACCENT}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <text
            x="80"
            y="90"
            textAnchor="middle"
            fontFamily="JetBrains Mono"
            fontSize="32"
            fontWeight="700"
            fill={ACCENT}
          >
            ?
          </text>
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

      {/* Badge + Title */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 9,
            letterSpacing: 2,
            color: ACCENT,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          ● Not enough data
        </div>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: -0.8,
            margin: "0 0 10px",
            lineHeight: 1.2,
          }}
        >
          We couldn&apos;t analyze this one
        </h1>
        <p style={{ fontSize: 14, color: DIM, lineHeight: 1.5, margin: 0 }}>
          We couldn&apos;t find reliable comps for your search. You can try
          searching by name or provide details for manual review.
        </p>
      </div>

      {/* Query echo */}
      {upc && (
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              background: "rgba(245,245,242,0.04)",
              border: `1px solid ${LINE}`,
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
                color: DIMMER,
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
                color: INK,
                fontWeight: 500,
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              &ldquo;{upc}&rdquo;
            </span>
          </div>
        </div>
      )}

      {/* ETA bar */}
      <div style={{ marginBottom: 24 }}>
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
                fontSize: 14,
                fontWeight: 600,
                color: INK,
                letterSpacing: -0.2,
                marginBottom: 2,
              }}
            >
              Your request was submitted automatically
            </div>
            <div
              style={{
                fontSize: 12,
                color: DIM,
                lineHeight: 1.4,
              }}
            >
              No cost to you. Doesn&apos;t count against your quota.
              {email && (
                <>
                  {" "}
                  We&apos;ll notify{" "}
                  <strong style={{ color: INK }}>{email}</strong>.
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Option 1: Search by name */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 9,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: ACCENT,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: `${ACCENT}1A`,
              border: `1px solid ${ACCENT}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            1
          </span>
          Search by name
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleKeywordSearch();
            }}
            placeholder="Type the product name..."
            style={{
              flex: 1,
              padding: "14px 14px",
              borderRadius: 11,
              border: `1px solid ${LINE2}`,
              background: "rgba(245,245,242,0.04)",
              color: INK,
              fontFamily: DISPLAY,
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            onClick={handleKeywordSearch}
            disabled={!keyword.trim()}
            style={{
              padding: "14px 18px",
              borderRadius: 11,
              border: "none",
              background: keyword.trim() ? ACCENT : "rgba(245,245,242,0.06)",
              color: keyword.trim() ? BG : DIMMER,
              fontFamily: DISPLAY,
              fontSize: 13,
              fontWeight: 700,
              cursor: keyword.trim() ? "pointer" : "default",
              flexShrink: 0,
            }}
          >
            Analyze →
          </button>
        </div>
      </div>

      {/* Separator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div style={{ flex: 1, height: 1, background: LINE }} />
        <span
          style={{
            fontFamily: MONO,
            fontSize: 9,
            letterSpacing: 1.5,
            color: DIMMER,
            textTransform: "uppercase",
          }}
        >
          or
        </span>
        <div style={{ flex: 1, height: 1, background: LINE }} />
      </div>

      {/* Option 2: Provide details */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 9,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: ACCENT,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: `${ACCENT}1A`,
              border: `1px solid ${ACCENT}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            2
          </span>
          Help us find it faster
        </div>
        <button
          onClick={handleProvideDetails}
          disabled={!analysisId}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: 14,
            border: `1px solid ${LINE2}`,
            background: "rgba(245,245,242,0.04)",
            color: INK,
            fontFamily: DISPLAY,
            fontSize: 14,
            fontWeight: 600,
            cursor: analysisId ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            gap: 12,
            opacity: analysisId ? 1 : 0.5,
          }}
        >
          <span style={{ fontSize: 20 }}>📋</span>
          <div style={{ textAlign: "left", flex: 1 }}>
            <div style={{ marginBottom: 2 }}>Provide product details</div>
            <div style={{ fontSize: 12, color: DIM, fontWeight: 400 }}>
              Name, category, and photo to speed up manual review
            </div>
          </div>
          <span style={{ color: DIMMER }}>→</span>
        </button>
      </div>

      {/* Back link */}
      <Link
        href="/home"
        replace
        style={{
          fontFamily: DISPLAY,
          fontSize: 13,
          color: DIM,
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 6,
          justifyContent: "center",
        }}
      >
        ← Back to home
      </Link>
    </div>
  );
}

export default function ProductNotFoundPage() {
  return (
    <Suspense
      fallback={<div style={{ minHeight: "100dvh", background: "#0A0A0A" }} />}
    >
      <ProductNotFoundContent />
    </Suspense>
  );
}
