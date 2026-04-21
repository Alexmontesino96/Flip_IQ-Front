"use client";

import { useRouter } from "next/navigation";
import TopBar from "@/components/ui/TopBar";
import TinyBadge from "@/components/ui/TinyBadge";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK = {
  recommendation: "buy",
  opportunity_score: 78,
  buy_box: { recommended_max_buy: 148.4, your_cost: 80.0, headroom: 68.4 },
  sale_plan: { quick: 179, market: 199, stretch: 225 },
  returns: { profit: 94.2, roi_pct: 117.8, margin_pct: 47.3 },
  risk_score: 72,
  confidence_score: 84,
  velocity_score: 88,
  velocity_days: "2–4",
  comps: {
    total_sold: 47,
    median_price: 199,
    p25: 175,
    p75: 225,
    sales_per_day: 2.3,
  },
  channels: [
    {
      name: "eBay",
      fee: 13.25,
      sale: 199,
      net: 94.2,
      roi: 117.8,
      role: "recommended",
    },
    {
      name: "Amazon FBA",
      fee: 18.5,
      sale: 229,
      net: 86.9,
      roi: 108.6,
      role: "best_profit",
    },
    {
      name: "Facebook",
      fee: 5,
      sale: 170,
      net: 61.5,
      roi: 76.9,
      role: "test_only",
    },
  ],
  ai_text:
    "Stable market with clean comps and strong velocity. At $80 you have ~$68 of headroom over the safe max-buy. eBay is your recommended channel — fast rotation and reasonable fees.",
};

const PRODUCT_TITLE = "Apple AirPods Pro 2 (USB-C) — MagSafe";

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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ResultPage() {
  const router = useRouter();

  const shareButton = (
    <button
      aria-label="Share result"
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        border: "1px solid rgba(245,245,242,0.12)",
        background: "transparent",
        color: "#F5F5F2",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
      }}
    >
      {/* Upload / share icon */}
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
    </button>
  );

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
          {PRODUCT_TITLE}
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
              BUY
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
              Opportunity {MOCK.opportunity_score}/100
            </div>
          </div>
          {/* Score circle */}
          <div
            role="img"
            aria-label={`Score ${MOCK.opportunity_score} out of 100`}
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
              {MOCK.opportunity_score}
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
            ${fmt(MOCK.buy_box.recommended_max_buy)}
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
                ${fmt(MOCK.buy_box.your_cost)}
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
                +${fmt(MOCK.buy_box.headroom)}
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
              ${MOCK.sale_plan.quick}
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 9,
                color: "rgba(245,245,242,0.4)",
              }}
            >
              3–5 days
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
              ${MOCK.sale_plan.market}
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
              ${MOCK.sale_plan.stretch}
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
        {/* Outer wrapper acts as 1px gap separator */}
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
              value: `+$${fmt(MOCK.returns.profit)}`,
              accent: true,
            },
            { label: "ROI", value: `${MOCK.returns.roi_pct}%`, accent: false },
            {
              label: "Margin",
              value: `${MOCK.returns.margin_pct}%`,
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
          {/* Risk: display as safety (100 - risk) */}
          <ScoreBar label="Risk" value={100 - MOCK.risk_score} sublabel="Low" />
          <ScoreBar
            label="Confidence"
            value={MOCK.confidence_score}
            sublabel="High"
          />
          <ScoreBar
            label="Velocity"
            value={MOCK.velocity_score}
            sublabel="Fast"
          />
        </Card>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          6. CHANNELS
      ════════════════════════════════════════════════════════════════════ */}
      <section
        style={{ padding: "0 20px", marginBottom: 20 }}
        aria-label="Best channels"
      >
        <SectionLabel>Best channel</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {MOCK.channels.map((ch) => {
            const isRec = ch.role === "recommended";
            const isBestProfit = ch.role === "best_profit";
            const isTest = ch.role === "test_only";

            return (
              <div
                key={ch.name}
                style={{
                  background: isRec
                    ? "rgba(212,255,61,0.07)"
                    : "rgba(245,245,242,0.03)",
                  border: isRec
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
                        color: isRec ? ACCENT : "#F5F5F2",
                      }}
                    >
                      {ch.name}
                    </span>
                    {isRec && (
                      <TinyBadge color="#0A0A0A" bg={ACCENT}>
                        Best
                      </TinyBadge>
                    )}
                    {isBestProfit && (
                      <TinyBadge color={ACCENT} bg="rgba(212,255,61,0.1)">
                        +profit
                      </TinyBadge>
                    )}
                    {isTest && (
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
                    Sale ${ch.sale} &nbsp;·&nbsp; Fee ${ch.fee}
                  </div>
                </div>

                {/* Right side */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: 15,
                      fontWeight: 700,
                      color: isRec ? ACCENT : "#F5F5F2",
                      marginBottom: 2,
                    }}
                  >
                    +${fmt(ch.net)}
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

      {/* ═══════════════════════════════════════════════════════════════════
          7. AI VERDICT
      ════════════════════════════════════════════════════════════════════ */}
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
            {MOCK.ai_text}
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          8. COMPS
      ════════════════════════════════════════════════════════════════════ */}
      <section
        style={{ padding: "0 20px", marginBottom: 20 }}
        aria-label="Comparable sales"
      >
        <SectionLabel>Comps · eBay Sold · 20d</SectionLabel>
        <Card>
          {/* 3 stat columns */}
          <div
            style={{
              display: "flex",
              marginBottom: 20,
            }}
          >
            {[
              { label: "Sold", value: String(MOCK.comps.total_sold) },
              { label: "Median", value: `$${MOCK.comps.median_price}` },
              { label: "Per day", value: String(MOCK.comps.sales_per_day) },
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

          {/* Mini bar chart */}
          <MiniBarChart bars={[6, 9, 14, 11, 5, 2]} />

          {/* Price range labels */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            {[
              `$${MOCK.comps.p25}`,
              `$${MOCK.comps.median_price}`,
              `$${MOCK.comps.p75}`,
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
          aria-label="Add to watchlist"
          style={{
            flex: 1,
            height: 50,
            borderRadius: 14,
            border: "1px solid rgba(245,245,242,0.12)",
            background: "transparent",
            color: "#F5F5F2",
            fontFamily: DISPLAY,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <span aria-hidden="true">★</span> Add to watchlist
        </button>

        {/* Primary: New analysis */}
        <button
          aria-label="Start new analysis"
          onClick={() => router.push("/")}
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
          New analysis <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
