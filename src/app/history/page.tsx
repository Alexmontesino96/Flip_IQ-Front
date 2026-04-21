"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchHistory, AnalysisHistoryItem } from "@/lib/history";
import TopBar from "@/components/ui/TopBar";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";

type Rec = "buy" | "watch" | "pass" | "buy_small";

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

function normalizeRec(rec: string | null): Rec {
  if (!rec) return "pass";
  const r = rec.toLowerCase();
  if (r === "buy") return "buy";
  if (r === "buy_small") return "buy_small";
  if (r === "watch") return "watch";
  return "pass";
}

function groupByDay(
  items: AnalysisHistoryItem[]
): { label: string; items: AnalysisHistoryItem[] }[] {
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString();

  const groups: Record<string, AnalysisHistoryItem[]> = {};
  const order: string[] = [];

  for (const item of items) {
    const d = new Date(item.created_at);
    const ds = d.toDateString();
    let label: string;
    if (ds === today) {
      label = "TODAY";
    } else if (ds === yesterday) {
      label = "YESTERDAY";
    } else {
      label = d
        .toLocaleDateString("en-US", { weekday: "short", day: "numeric" })
        .toUpperCase();
    }
    if (!groups[label]) {
      groups[label] = [];
      order.push(label);
    }
    groups[label].push(item);
  }

  return order.map((label) => ({ label, items: groups[label] }));
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory(50).then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const groups = groupByDay(items);

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
          {items.length}
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

      {/* Content */}
      <div
        style={{
          padding: "0 20px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {loading ? (
          <div
            style={{
              padding: "40px 0",
              textAlign: "center",
              fontFamily: MONO,
              fontSize: 11,
              color: "rgba(245,245,242,0.3)",
            }}
          >
            Loading history...
          </div>
        ) : items.length === 0 ? (
          <div
            style={{
              padding: "40px 0",
              textAlign: "center",
              fontFamily: MONO,
              fontSize: 11,
              color: "rgba(245,245,242,0.3)",
            }}
          >
            No analyses yet
          </div>
        ) : (
          groups.map((group) => (
            <section
              key={group.label}
              aria-label={`Analyses from ${group.label}`}
            >
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

              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  borderTop: "1px solid rgba(245,245,242,0.07)",
                }}
              >
                {group.items.map((item) => {
                  const rec = normalizeRec(item.recommendation);
                  const profit = item.net_profit ?? 0;
                  return (
                    <li
                      key={item.id}
                      style={{
                        borderBottom: "1px solid rgba(245,245,242,0.07)",
                      }}
                    >
                      <button
                        onClick={() => router.push(`/result?id=${item.id}`)}
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
                        <div
                          aria-hidden="true"
                          style={{
                            width: 4,
                            height: 28,
                            borderRadius: 2,
                            background: REC_COLOR[rec],
                            flexShrink: 0,
                          }}
                        />
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
                          {item.product_title}
                        </span>
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
                          {REC_LABEL[rec]} · {formatTime(item.created_at)}
                        </span>
                        <span
                          style={{
                            fontFamily: MONO,
                            fontSize: 13,
                            fontWeight: 600,
                            color: profit >= 0 ? ACCENT : "#FF6464",
                            flexShrink: 0,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {profit >= 0 ? "+" : ""}${Math.abs(profit).toFixed(2)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
