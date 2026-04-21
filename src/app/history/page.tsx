"use client";

import { useRouter } from "next/navigation";
import TopBar from "@/components/ui/TopBar";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";

// Usage:
// Items grouped by day. Each item navigates to /result on click.
// Rec color bar: buy=ACCENT, watch=#FFB84D, pass=rgba(245,245,242,0.4).

type Rec = "buy" | "watch" | "pass" | "buy_small";

interface HistoryItem {
  title: string;
  rec: Rec;
  profit: number;
  time: string;
}

interface DayGroup {
  label: string;
  items: HistoryItem[];
}

const REC_COLOR: Record<Rec, string> = {
  buy: ACCENT,
  watch: "#FFB84D",
  pass: "rgba(245,245,242,0.4)",
  buy_small: ACCENT,
};

const REC_LABEL: Record<Rec, string> = {
  buy: "BUY",
  watch: "WATCH",
  pass: "PASS",
  buy_small: "BUY SMALL",
};

const TOTAL = 47;

const GROUPS: DayGroup[] = [
  {
    label: "TODAY",
    items: [
      { title: "AirPods Pro 2 USB-C", rec: "buy", profit: 94.2, time: "14:32" },
      {
        title: "Nintendo Switch OLED",
        rec: "watch",
        profit: 22.5,
        time: "12:08",
      },
      { title: "Lego Icons Orchid", rec: "pass", profit: -8.3, time: "10:41" },
    ],
  },
  {
    label: "YESTERDAY",
    items: [
      {
        title: "Xbox Elite Controller",
        rec: "buy",
        profit: 62.1,
        time: "18:22",
      },
      {
        title: "Kindle Paperwhite",
        rec: "buy_small",
        profit: 28.4,
        time: "16:05",
      },
      { title: "Dyson V8 Absolute", rec: "pass", profit: -15.6, time: "11:50" },
    ],
  },
  {
    label: "MON 15",
    items: [
      { title: "iPad Air M2", rec: "buy", profit: 112.0, time: "20:14" },
      {
        title: "Samsung Buds 2 Pro",
        rec: "watch",
        profit: 18.2,
        time: "17:33",
      },
    ],
  },
];

export default function HistoryPage() {
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
      <TopBar title="History" onBack={() => router.back()} accent={ACCENT} />

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
          {TOTAL}
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
          total analyses
        </div>
      </div>

      {/* Grouped list */}
      <div
        style={{
          padding: "0 20px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {GROUPS.map((group) => (
          <section
            key={group.label}
            aria-label={`Analyses from ${group.label}`}
          >
            {/* Day header */}
            <div
              style={{
                fontFamily: MONO,
                fontSize: 9,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: ACCENT,
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ opacity: 0.5 }}>—</span>
              <span>{group.label}</span>
            </div>

            {/* Items */}
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                borderTop: "1px solid rgba(245,245,242,0.07)",
              }}
            >
              {group.items.map((item, i) => (
                <li
                  key={i}
                  style={{ borderBottom: "1px solid rgba(245,245,242,0.07)" }}
                >
                  <button
                    onClick={() => router.push("/result")}
                    aria-label={`${item.title}, ${REC_LABEL[item.rec]}, ${item.profit >= 0 ? "+" : ""}$${Math.abs(item.profit).toFixed(2)}, at ${item.time}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "13px 0",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    {/* Color bar */}
                    <div
                      aria-hidden="true"
                      style={{
                        width: 4,
                        height: 28,
                        borderRadius: 2,
                        background: REC_COLOR[item.rec],
                        flexShrink: 0,
                      }}
                    />

                    {/* Title */}
                    <span
                      style={{
                        fontFamily: DISPLAY,
                        fontSize: 15,
                        fontWeight: 500,
                        color: "#F5F5F2",
                        flex: 1,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.title}
                    </span>

                    {/* Rec + time */}
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        color: "rgba(245,245,242,0.4)",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        flexShrink: 0,
                        marginRight: 10,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {REC_LABEL[item.rec]} · {item.time}
                    </span>

                    {/* Profit */}
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 13,
                        fontWeight: 600,
                        color: item.profit >= 0 ? ACCENT : "#FF6464",
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.profit >= 0 ? "+" : ""}$
                      {Math.abs(item.profit).toFixed(2)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
