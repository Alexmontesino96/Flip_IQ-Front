"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchSharedAnalysis, SharedAnalysisData } from "@/lib/analysis";
import TopBar from "@/components/ui/TopBar";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";

const REC_STYLE: Record<string, { label: string; color: string; bg: string }> =
  {
    buy: { label: "BUY", color: "#0A0A0A", bg: ACCENT },
    buy_small: { label: "BUY SMALL", color: "#0A0A0A", bg: "#eab308" },
    watch: { label: "WATCH", color: "#F5F5F2", bg: "rgba(245,245,242,0.1)" },
    pass: {
      label: "PASS",
      color: "rgba(245,245,242,0.5)",
      bg: "rgba(245,245,242,0.06)",
    },
  };

function formatProfit(n: number | null): string {
  if (n == null) return "—";
  const sign = n >= 0 ? "+" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

export default function SharedAnalysisPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [data, setData] = useState<SharedAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchSharedAnalysis(token)
      .then(setData)
      .catch((e) => setError(e.message || "Analysis not found"))
      .finally(() => setLoading(false));
  }, [token]);

  const rec = data?.recommendation
    ? REC_STYLE[data.recommendation] || REC_STYLE.pass
    : REC_STYLE.pass;

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0A0A0A",
        color: "#F5F5F2",
        maxWidth: 520,
        margin: "0 auto",
      }}
    >
      <TopBar title="Shared Analysis" accent={ACCENT} />

      {loading && (
        <div
          style={{
            padding: "80px 20px",
            textAlign: "center",
            fontFamily: MONO,
            fontSize: 11,
            color: "rgba(245,245,242,0.3)",
          }}
        >
          Loading...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "80px 20px",
            textAlign: "center",
            fontFamily: MONO,
            fontSize: 12,
            color: "#FF6464",
          }}
        >
          {error}
        </div>
      )}

      {data && (
        <div style={{ padding: "0 20px 40px" }}>
          {/* Product header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "20px 0 24px",
            }}
          >
            {data.product?.image_url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={data.product.image_url}
                alt=""
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  objectFit: "cover",
                  background: "rgba(245,245,242,0.06)",
                }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#F5F5F2",
                  letterSpacing: -0.3,
                }}
              >
                {data.product?.title || "Product"}
              </div>
              {data.product?.brand && (
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    color: "rgba(245,245,242,0.4)",
                    marginTop: 2,
                  }}
                >
                  {data.product.brand}
                </div>
              )}
            </div>
          </div>

          {/* Recommendation badge */}
          <div
            style={{
              display: "inline-block",
              padding: "6px 16px",
              borderRadius: 100,
              background: rec.bg,
              color: rec.color,
              fontFamily: MONO,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.5,
              marginBottom: 24,
            }}
          >
            {rec.label}
          </div>

          {/* Key metrics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {/* Flip Score */}
            <div
              style={{
                background: "rgba(245,245,242,0.04)",
                borderRadius: 14,
                padding: "16px 14px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 28,
                  fontWeight: 700,
                  color: ACCENT,
                  lineHeight: 1,
                }}
              >
                {data.flip_score ?? "—"}
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 8,
                  letterSpacing: 1.5,
                  color: "rgba(245,245,242,0.4)",
                  marginTop: 6,
                  textTransform: "uppercase",
                }}
              >
                Flip Score
              </div>
            </div>

            {/* Profit */}
            <div
              style={{
                background: "rgba(245,245,242,0.04)",
                borderRadius: 14,
                padding: "16px 14px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 22,
                  fontWeight: 700,
                  color:
                    data.net_profit != null && data.net_profit >= 0
                      ? ACCENT
                      : "#FF6464",
                  lineHeight: 1,
                }}
              >
                {formatProfit(data.net_profit)}
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 8,
                  letterSpacing: 1.5,
                  color: "rgba(245,245,242,0.4)",
                  marginTop: 6,
                  textTransform: "uppercase",
                }}
              >
                Profit
              </div>
            </div>

            {/* ROI */}
            <div
              style={{
                background: "rgba(245,245,242,0.04)",
                borderRadius: 14,
                padding: "16px 14px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#F5F5F2",
                  lineHeight: 1,
                }}
              >
                {data.roi_pct != null ? `${data.roi_pct.toFixed(0)}%` : "—"}
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 8,
                  letterSpacing: 1.5,
                  color: "rgba(245,245,242,0.4)",
                  marginTop: 6,
                  textTransform: "uppercase",
                }}
              >
                ROI
              </div>
            </div>
          </div>

          {/* Price details */}
          <div
            style={{
              background: "rgba(245,245,242,0.04)",
              borderRadius: 14,
              padding: "16px 18px",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 9,
                letterSpacing: 2,
                color: "rgba(245,245,242,0.4)",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Price Details
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: DISPLAY,
                  fontSize: 14,
                }}
              >
                <span style={{ color: "rgba(245,245,242,0.5)" }}>Cost</span>
                <span style={{ fontWeight: 600 }}>
                  ${data.cost_price.toFixed(2)}
                </span>
              </div>
              {data.estimated_sale_price != null && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily: DISPLAY,
                    fontSize: 14,
                  }}
                >
                  <span style={{ color: "rgba(245,245,242,0.5)" }}>
                    Est. Sale
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    ${data.estimated_sale_price.toFixed(2)}
                  </span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: DISPLAY,
                  fontSize: 14,
                }}
              >
                <span style={{ color: "rgba(245,245,242,0.5)" }}>
                  Marketplace
                </span>
                <span style={{ fontWeight: 600, textTransform: "capitalize" }}>
                  {data.marketplace.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>

          {/* AI Brief */}
          {data.ai_explanation && (
            <div
              style={{
                background: "rgba(245,245,242,0.04)",
                borderRadius: 14,
                padding: "16px 18px",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  letterSpacing: 2,
                  color: "rgba(245,245,242,0.4)",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                AI Brief
              </div>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "rgba(245,245,242,0.8)",
                }}
              >
                {data.ai_explanation}
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={() => (window.location.href = "/")}
            style={{
              display: "block",
              width: "100%",
              textAlign: "center",
              padding: "14px 20px",
              borderRadius: 14,
              background: ACCENT,
              color: "#0A0A0A",
              fontFamily: DISPLAY,
              fontSize: 15,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              marginTop: 8,
            }}
          >
            Try FlipIQ free
          </button>

          {/* Timestamp */}
          <div
            style={{
              fontFamily: MONO,
              fontSize: 9,
              color: "rgba(245,245,242,0.25)",
              textAlign: "center",
              marginTop: 16,
            }}
          >
            Analyzed {new Date(data.created_at).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
}
