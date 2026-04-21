"use client";

import { useRouter } from "next/navigation";
import TopBar from "@/components/ui/TopBar";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";

// Mock data for recent analyses
const RECENT_ANALYSES = [
  {
    title: "AirPods Pro 2",
    status: "buy" as const,
    profit: "+$94",
    time: "2h",
  },
  {
    title: "Nintendo Switch OLED",
    status: "watch" as const,
    profit: "+$22",
    time: "5h",
  },
  {
    title: "Lego Icons Orchid",
    status: "pass" as const,
    profit: "-$8",
    time: "1d",
  },
];

const STATUS_DOT_COLOR: Record<"buy" | "watch" | "pass", string> = {
  buy: ACCENT,
  watch: "#FFB84D",
  pass: "rgba(245,245,242,0.4)",
};

const STATUS_LABEL: Record<"buy" | "watch" | "pass", string> = {
  buy: "BUY",
  watch: "WATCH",
  pass: "PASS",
};

export default function HomePage() {
  const router = useRouter();

  const proButton = (
    <button
      onClick={() => router.push("/plans")}
      aria-label="Upgrade to PRO"
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        border: "1px solid rgba(245,245,242,0.12)",
        background: "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: 10,
          fontWeight: 600,
          color: "#F5F5F2",
          letterSpacing: 0.5,
        }}
      >
        PRO
      </span>
    </button>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        color: "#F5F5F2",
        padding: "0 0 40px",
        maxWidth: 430,
        margin: "0 auto",
      }}
    >
      {/* 1. TopBar */}
      <TopBar showLogo accent={ACCENT} right={proButton} />

      {/* 2. Greeting section */}
      <section aria-label="Greeting" style={{ padding: "24px 20px 32px" }}>
        <p
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: 2,
            color: "rgba(245,245,242,0.4)",
            textTransform: "uppercase",
            margin: "0 0 10px",
          }}
        >
          Good afternoon, Alex
        </p>
        <h1
          style={{
            fontFamily: DISPLAY,
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: -1.2,
            lineHeight: 1.05,
            color: "#F5F5F2",
            margin: 0,
          }}
        >
          What are you flipping today?
        </h1>
      </section>

      {/* 3. Action buttons */}
      <section
        aria-label="Main actions"
        style={{
          padding: "0 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Scan barcode button */}
        <button
          onClick={() => router.push("/scan")}
          aria-label="Scan barcode"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: 20,
            borderRadius: 20,
            background: ACCENT,
            color: "#0A0A0A",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            width: "100%",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 6V3a1 1 0 011-1h3M20 6V3a1 1 0 00-1-1h-3M2 16v3a1 1 0 001 1h3M20 16v3a1 1 0 01-1 1h-3"
                stroke="#0A0A0A"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M6 7v8M10 7v8M14 7v8M18 7v8"
                stroke="#0A0A0A"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 17,
                fontWeight: 600,
                color: "#0A0A0A",
                marginBottom: 3,
              }}
            >
              Scan barcode
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                color: "rgba(0,0,0,0.55)",
              }}
            >
              UPC · EAN · ISBN
            </div>
          </div>

          <span
            style={{
              fontFamily: DISPLAY,
              fontSize: 18,
              color: "#0A0A0A",
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            →
          </span>
        </button>

        {/* Search product button */}
        <button
          onClick={() => router.push("/search")}
          aria-label="Search product"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: 20,
            borderRadius: 20,
            background: "rgba(245,245,242,0.03)",
            color: "#F5F5F2",
            border: "1px solid rgba(245,245,242,0.1)",
            cursor: "pointer",
            textAlign: "left",
            width: "100%",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "rgba(245,245,242,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="9" cy="9" r="6" stroke="#F5F5F2" strokeWidth="1.8" />
              <path
                d="M14 14l4 4"
                stroke="#F5F5F2"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 17,
                fontWeight: 600,
                color: "#F5F5F2",
                marginBottom: 3,
              }}
            >
              Search product
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                color: "rgba(245,245,242,0.4)",
              }}
            >
              title, brand, model
            </div>
          </div>

          <span
            style={{
              fontFamily: DISPLAY,
              fontSize: 18,
              color: "rgba(245,245,242,0.4)",
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            →
          </span>
        </button>
      </section>

      {/* 4. Recent analyses */}
      <section aria-label="Recent analyses" style={{ padding: "32px 20px 0" }}>
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: "rgba(245,245,242,0.4)",
              textTransform: "uppercase",
              letterSpacing: 1.5,
            }}
          >
            Recent Analyses
          </span>
          <button
            onClick={() => router.push("/history")}
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: ACCENT,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              letterSpacing: 0.5,
            }}
          >
            See all →
          </button>
        </div>

        {/* List */}
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            borderTop: "1px solid rgba(245,245,242,0.07)",
          }}
        >
          {RECENT_ANALYSES.map((item, index) => (
            <li
              key={index}
              style={{
                borderBottom: "1px solid rgba(245,245,242,0.07)",
              }}
            >
              <button
                onClick={() => router.push("/result")}
                aria-label={`View analysis for ${item.title}, ${STATUS_LABEL[item.status]}, ${item.profit}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 0",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                {/* Status dot */}
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    background: STATUS_DOT_COLOR[item.status],
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                />

                {/* Title */}
                <span
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 15,
                    fontWeight: 500,
                    color: "#F5F5F2",
                    flex: 1,
                  }}
                >
                  {item.title}
                </span>

                {/* Status + time */}
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    color: "rgba(245,245,242,0.4)",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginRight: 12,
                    whiteSpace: "nowrap",
                  }}
                >
                  {STATUS_LABEL[item.status]} · {item.time}
                </span>

                {/* Profit */}
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 14,
                    fontWeight: 600,
                    color: item.profit.startsWith("+")
                      ? ACCENT
                      : "rgba(245,245,242,0.4)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.profit}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* 5. Quick actions */}
      <section
        aria-label="Quick actions"
        style={{
          padding: "24px 20px 0",
          display: "flex",
          flexDirection: "row",
          gap: 12,
        }}
      >
        {/* Watchlist card */}
        <button
          onClick={() => router.push("/watchlist")}
          aria-label="Open watchlist, 12 items"
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 12,
            border: "1px solid rgba(245,245,242,0.1)",
            background: "transparent",
            cursor: "pointer",
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 9,
              color: "rgba(245,245,242,0.4)",
              textTransform: "uppercase",
              letterSpacing: 1.5,
            }}
          >
            Watchlist
          </span>
          <span
            style={{
              fontFamily: DISPLAY,
              fontSize: 22,
              fontWeight: 700,
              color: "#F5F5F2",
              lineHeight: 1,
            }}
          >
            12
          </span>
        </button>

        {/* History card */}
        <button
          onClick={() => router.push("/history")}
          aria-label="Open history, 47 analyses"
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 12,
            border: "1px solid rgba(245,245,242,0.1)",
            background: "transparent",
            cursor: "pointer",
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 9,
              color: "rgba(245,245,242,0.4)",
              textTransform: "uppercase",
              letterSpacing: 1.5,
            }}
          >
            History
          </span>
          <span
            style={{
              fontFamily: DISPLAY,
              fontSize: 22,
              fontWeight: 700,
              color: "#F5F5F2",
              lineHeight: 1,
            }}
          >
            47
          </span>
        </button>
      </section>
    </div>
  );
}
