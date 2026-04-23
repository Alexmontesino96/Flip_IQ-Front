"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  fetchWatchlists,
  fetchWatchlistItems,
  createWatchlist,
  removeWatchlistItem,
  Watchlist,
  WatchlistItem,
} from "@/lib/watchlist";
import TopBar from "@/components/ui/TopBar";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";

function normalizeRec(rec: string | null): string {
  if (!rec) return "—";
  const r = rec.toLowerCase();
  if (r === "buy") return "BUY";
  if (r === "buy_small") return "BUY SM";
  if (r === "watch") return "WATCH";
  if (r === "pass") return "PASS";
  return r.toUpperCase();
}

function recColor(rec: string | null): string {
  if (!rec) return "rgba(245,245,242,0.4)";
  const r = rec.toLowerCase();
  if (r === "buy" || r === "buy_small") return ACCENT;
  if (r === "watch") return "#FFB84D";
  return "rgba(245,245,242,0.4)";
}

export default function WatchlistPage() {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<Watchlist | null>(null);
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    let lists = await fetchWatchlists();

    // Auto-create default watchlist if none exists
    if (lists.length === 0) {
      const created = await createWatchlist("My Watchlist");
      if (created) lists = [created];
    }

    if (lists.length > 0) {
      setWatchlist(lists[0]);
      const wlItems = await fetchWatchlistItems(lists[0].id);
      setItems(wlItems);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handle = requestAnimationFrame(() => void loadData());
    return () => cancelAnimationFrame(handle);
  }, [loadData]);

  const handleRemove = async (itemId: number) => {
    if (!watchlist) return;
    const ok = await removeWatchlistItem(watchlist.id, itemId);
    if (ok) {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    }
  };

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
          products tracked
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "0 20px" }}>
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
            Loading watchlist...
          </div>
        ) : items.length === 0 ? (
          <div
            style={{
              padding: "40px 0",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                color: "rgba(245,245,242,0.3)",
                marginBottom: 16,
              }}
            >
              No products in your watchlist yet
            </div>
            <button
              onClick={() => router.push("/search")}
              style={{
                padding: "12px 24px",
                borderRadius: 12,
                background: ACCENT,
                color: "#0A0A0A",
                border: "none",
                fontFamily: DISPLAY,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Search products →
            </button>
          </div>
        ) : (
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {items.map((item) => {
              const profit = item.net_profit ?? 0;
              return (
                <li key={item.id}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 0",
                      borderBottom: "1px solid rgba(245,245,242,0.07)",
                    }}
                  >
                    {/* Rec color bar */}
                    <div
                      style={{
                        width: 4,
                        height: 36,
                        borderRadius: 2,
                        background: recColor(item.recommendation),
                        flexShrink: 0,
                      }}
                    />

                    {/* Info — clickable */}
                    <button
                      onClick={() => {
                        if (item.last_analysis_id) {
                          router.push(`/result?id=${item.last_analysis_id}`);
                        }
                      }}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        background: "none",
                        border: "none",
                        cursor: item.last_analysis_id ? "pointer" : "default",
                        textAlign: "left",
                        padding: 0,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: DISPLAY,
                          fontSize: 15,
                          fontWeight: 500,
                          color: "#F5F5F2",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          marginBottom: 3,
                        }}
                      >
                        {item.product_title}
                      </div>
                      <div
                        style={{
                          fontFamily: MONO,
                          fontSize: 10,
                          color: "rgba(245,245,242,0.4)",
                          letterSpacing: 0.3,
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        {item.recommendation && (
                          <span
                            style={{ color: recColor(item.recommendation) }}
                          >
                            {normalizeRec(item.recommendation)}
                          </span>
                        )}
                        {item.target_price != null && (
                          <span>target ${item.target_price}</span>
                        )}
                        {item.current_price != null && (
                          <span>now ${item.current_price}</span>
                        )}
                        {item.cost_price != null && (
                          <span>cost ${item.cost_price}</span>
                        )}
                        {item.flip_score != null && (
                          <span>score {item.flip_score}</span>
                        )}
                      </div>
                    </button>

                    {/* Profit */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      {item.net_profit != null && (
                        <div
                          style={{
                            fontFamily: MONO,
                            fontSize: 13,
                            fontWeight: 600,
                            color: profit >= 0 ? ACCENT : "#FF6464",
                          }}
                        >
                          {profit >= 0 ? "+" : ""}${Math.abs(profit).toFixed(2)}
                        </div>
                      )}
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      aria-label={`Remove ${item.product_title}`}
                      style={{
                        background: "none",
                        border: "none",
                        color: "rgba(245,245,242,0.25)",
                        fontSize: 16,
                        cursor: "pointer",
                        padding: "4px",
                        flexShrink: 0,
                      }}
                    >
                      ×
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
