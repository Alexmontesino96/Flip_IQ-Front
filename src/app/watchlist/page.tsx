"use client";

import { useRouter } from "next/navigation";
import TopBar from "@/components/ui/TopBar";
import TinyBadge from "@/components/ui/TinyBadge";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";

// Usage:
// Navigates to /result on item click.
// Alert dot (8px ACCENT circle) shown when alert=true.

interface WatchlistItem {
  title: string;
  target: number;
  current: number;
  change: number;
  alert: boolean;
}

const ITEMS: WatchlistItem[] = [
  {
    title: "AirPods Pro 2 USB-C",
    target: 180,
    current: 199,
    change: +10.6,
    alert: true,
  },
  {
    title: "Nintendo Switch OLED",
    target: 300,
    current: 285,
    change: -4.9,
    alert: false,
  },
  {
    title: "Xbox Elite Series 2",
    target: 120,
    current: 135,
    change: +12.5,
    alert: true,
  },
  {
    title: "Lego Icons 10311 Orchid",
    target: 45,
    current: 42,
    change: -6.7,
    alert: false,
  },
  {
    title: "Dyson V11 Animal",
    target: 350,
    current: 369,
    change: +5.4,
    alert: false,
  },
];

export default function WatchlistPage() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        color: "#F5F5F2",
        maxWidth: 430,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        paddingBottom: 40,
      }}
    >
      <TopBar title="Watchlist" onBack={() => router.back()} accent={ACCENT} />

      {/* Header */}
      <div style={{ padding: "20px 20px 28px" }}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: -1.5,
            lineHeight: 1,
            color: "#F5F5F2",
          }}
        >
          {ITEMS.length}
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "rgba(245,245,242,0.4)",
            marginTop: 6,
          }}
        >
          products tracked
        </div>
      </div>

      {/* List */}
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: "0 20px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {ITEMS.map((item, i) => (
          <li key={i}>
            <button
              onClick={() => router.push("/result")}
              aria-label={`View ${item.title}, target $${item.target}, now $${item.current}, change ${item.change > 0 ? "+" : ""}${item.change}%`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                background: "none",
                border: "none",
                borderBottom: "1px solid rgba(245,245,242,0.07)",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
              }}
            >
              {/* Thumbnail placeholder with optional alert dot */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: "rgba(245,245,242,0.06)",
                    border: "1px solid rgba(245,245,242,0.08)",
                  }}
                  aria-hidden="true"
                />
                {item.alert && (
                  <div
                    aria-label="Price alert active"
                    style={{
                      position: "absolute",
                      top: -2,
                      right: -2,
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      background: ACCENT,
                      border: "2px solid #0A0A0A",
                    }}
                  />
                )}
              </div>

              {/* Info */}
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
                    marginBottom: 4,
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    color: "rgba(245,245,242,0.4)",
                    letterSpacing: 0.3,
                  }}
                >
                  target ${item.target} · now ${item.current}
                </div>
              </div>

              {/* Change percentage */}
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  fontWeight: 600,
                  color: item.change >= 0 ? ACCENT : "#FF6464",
                  flexShrink: 0,
                }}
              >
                {item.change >= 0 ? "+" : ""}
                {item.change}%
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
