"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  submitProductRequest,
  buildSupportMailto,
} from "@/lib/product-requests";
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

  // Option 1: keyword search
  const [keyword, setKeyword] = useState("");

  // Option 2: submit to support
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  // Auto-fill email from Supabase session
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
    const params = new URLSearchParams();
    if (cost) params.set("cost", cost);
    if (condition) params.set("condition", condition);
    const qs = params.toString();
    router.push(`/search${qs ? `?${qs}` : ""}`);
  };

  const handleSubmit = async () => {
    if (!email || !upc) return;
    setSubmitting(true);
    setSubmitError(false);
    const ok = await submitProductRequest(upc, email);
    setSubmitting(false);
    if (ok) {
      setSubmitted(true);
    } else {
      setSubmitError(true);
    }
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
      {/* Illustration */}
      <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}
      >
        <svg width="120" height="120" viewBox="0 0 160 160" fill="none">
          <circle
            cx="80"
            cy="80"
            r="40"
            fill="rgba(245,245,242,0.03)"
            stroke={LINE2}
            strokeWidth="1"
          />
          <path
            d="M 62 100 A 18 18 0 1 1 98 100"
            fill="none"
            stroke={ACCENT}
            strokeWidth="2"
            strokeLinecap="round"
          />
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
          <line
            x1="80"
            y1="80"
            x2="130"
            y2="60"
            stroke={LINE2}
            strokeWidth="1"
            strokeDasharray="2 3"
          />
          <line
            x1="80"
            y1="80"
            x2="35"
            y2="110"
            stroke={LINE2}
            strokeWidth="1"
            strokeDasharray="2 3"
          />
        </svg>
      </div>

      {/* Apology */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: -0.8,
            margin: "0 0 10px",
            lineHeight: 1.2,
          }}
        >
          We&apos;re sorry — we couldn&apos;t find this one
        </h1>
        <p style={{ fontSize: 14, color: DIM, lineHeight: 1.5, margin: 0 }}>
          {upc ? (
            <>
              The barcode{" "}
              <span style={{ fontFamily: MONO, color: INK, fontWeight: 600 }}>
                {upc}
              </span>{" "}
              isn&apos;t in our database yet. Here&apos;s how we can help:
            </>
          ) : (
            <>
              This product isn&apos;t in our database yet. Here&apos;s how we
              can help:
            </>
          )}
        </p>
      </div>

      {/* ═══ OPTION 1: Search by name ═══ */}
      <div style={{ marginBottom: 24 }}>
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
          marginBottom: 24,
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

      {/* ═══ OPTION 2: Send to support ═══ */}
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
          Send to support
        </div>

        {submitted ? (
          /* Success state */
          <div
            style={{
              padding: "20px",
              borderRadius: 14,
              background: `${ACCENT}0A`,
              border: `1px solid ${ACCENT}33`,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: INK,
                marginBottom: 4,
              }}
            >
              Got it! We&apos;ll analyze this product manually.
            </div>
            <div style={{ fontSize: 13, color: DIM, lineHeight: 1.5 }}>
              You&apos;ll receive an email at{" "}
              <strong style={{ color: INK }}>{email}</strong> within 24 hours
              with the full analysis.
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: "18px",
              borderRadius: 14,
              background: "rgba(245,245,242,0.03)",
              border: `1px solid ${LINE2}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>📋</span>
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: INK,
                    marginBottom: 3,
                  }}
                >
                  We&apos;ll analyze this UPC manually
                </div>
                <div style={{ fontSize: 12, color: DIM, lineHeight: 1.5 }}>
                  Our team will look up this product and deliver the full
                  analysis to your email within 24 hours. No charge.
                </div>
              </div>
            </div>

            {/* Email input — only show if not auto-filled */}
            {!email && (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email (for notification)"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: `1px solid ${LINE2}`,
                  background: "rgba(245,245,242,0.04)",
                  color: INK,
                  fontFamily: DISPLAY,
                  fontSize: 14,
                  outline: "none",
                  marginBottom: 12,
                }}
              />
            )}

            {email && (
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  color: DIM,
                  marginBottom: 12,
                  letterSpacing: 0.3,
                }}
              >
                We&apos;ll notify:{" "}
                <span style={{ color: INK, fontWeight: 600 }}>{email}</span>
              </div>
            )}

            {submitError && (
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{ fontSize: 12, color: "#FF6464", marginBottom: 6 }}
                >
                  Couldn&apos;t submit. Try emailing us directly:
                </div>
                <a
                  href={buildSupportMailto(upc)}
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    color: ACCENT,
                    textDecoration: "none",
                  }}
                >
                  Email support@getflipiq.com →
                </a>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!email || submitting}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 11,
                border: `1px solid ${LINE2}`,
                background: email ? "rgba(245,245,242,0.06)" : "transparent",
                color: email ? INK : DIMMER,
                fontFamily: DISPLAY,
                fontSize: 14,
                fontWeight: 600,
                cursor: email && !submitting ? "pointer" : "default",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? "Submitting..." : "Submit for review →"}
            </button>
          </div>
        )}
      </div>

      {/* Back link */}
      <Link
        href="/scan"
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
        ← Back to scan
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
