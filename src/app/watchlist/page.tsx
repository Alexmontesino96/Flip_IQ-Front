"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  fetchWatchlists,
  createWatchlist,
  removeWatchlistItem,
  Watchlist,
  WatchlistItem,
} from "@/lib/watchlist";
import TopBar from "@/components/ui/TopBar";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";

export default function WatchlistPage() {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<Watchlist | null>(null);
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let lists = await fetchWatchlists();

      if (lists.length === 0) {
        const created = await createWatchlist("My Watchlist");
        if (created) lists = [created];
      }

      if (lists.length > 0) {
        setWatchlist(lists[0]);
        setItems(lists[0].items || []);
      }
    } catch {
      setError("Could not load watchlist");
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
        ) : error ? (
          <div
            style={{
              padding: "40px 0",
              textAlign: "center",
              fontFamily: MONO,
              fontSize: 11,
              color: "rgba(245,245,242,0.3)",
            }}
          >
            {error}
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
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
              borderTop: "1px solid rgba(245,245,242,0.07)",
            }}
          >
            {items.map((item) => (
              <li
                key={item.id}
                style={{
                  borderBottom: "1px solid rgba(245,245,242,0.07)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 0",
                  }}
                >
                  {/* Thumbnail placeholder */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: "rgba(245,245,242,0.06)",
                      border: "1px solid rgba(245,245,242,0.08)",
                      flexShrink: 0,
                    }}
                  />

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
                        marginBottom: 3,
                      }}
                    >
                      {item.product_title || `Product #${item.product_id}`}
                    </div>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        color: "rgba(245,245,242,0.4)",
                        letterSpacing: 0.3,
                        display: "flex",
                        gap: 8,
                      }}
                    >
                      {item.target_buy_price != null && (
                        <span>target ${item.target_buy_price}</span>
                      )}
                      {item.notes && <span>{item.notes}</span>}
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    aria-label={`Remove ${item.product_title || "item"}`}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(245,245,242,0.25)",
                      fontSize: 18,
                      cursor: "pointer",
                      padding: "4px 2px",
                      flexShrink: 0,
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
