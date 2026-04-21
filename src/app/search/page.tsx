"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getRecentSearches, addRecentSearch } from "@/lib/history";
import TopBar from "@/components/ui/TopBar";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [recentPills, setRecentPills] = useState<string[]>(() =>
    getRecentSearches()
  );

  const handleSearch = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      addRecentSearch(trimmed);
      setRecentPills(getRecentSearches());
      router.push(`/?q=${encodeURIComponent(trimmed)}`);
    },
    [router]
  );

  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: "#0A0A0A",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      <TopBar title="Search" accent={ACCENT} onBack={() => router.back()} />

      {/* Search Input */}
      <div style={{ padding: "16px 20px 0" }}>
        <div
          style={{
            borderBottom: `1px solid ${ACCENT}`,
            paddingBottom: 10,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 22 22"
            fill="none"
            aria-hidden="true"
            style={{ flexShrink: 0 }}
          >
            <circle cx="9" cy="9" r="6" stroke={ACCENT} strokeWidth="1.8" />
            <path
              d="M14 14l4 4"
              stroke={ACCENT}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>

          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
            placeholder="Search products..."
            aria-label="Search products"
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              color: "#F5F5F2",
              fontFamily: DISPLAY,
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: -0.3,
              outline: "none",
              caretColor: ACCENT,
              minWidth: 0,
            }}
          />

          {query.length > 0 && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(245,245,242,0.45)",
                fontSize: 20,
                lineHeight: 1,
                cursor: "pointer",
                padding: "0 2px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Search button */}
      {query.trim() && (
        <div style={{ padding: "16px 20px 0" }}>
          <button
            onClick={() => handleSearch(query)}
            style={{
              width: "100%",
              padding: "14px 20px",
              borderRadius: 14,
              background: ACCENT,
              color: "#0A0A0A",
              border: "none",
              fontFamily: DISPLAY,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Analyze &quot;{query.trim()}&quot; →
          </button>
        </div>
      )}

      {/* Recent Searches */}
      {recentPills.length > 0 && (
        <div style={{ padding: "24px 20px 0" }}>
          <p
            style={{
              fontFamily: MONO,
              fontSize: 9,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "rgba(245,245,242,0.4)",
              margin: "0 0 12px",
            }}
          >
            Recent Searches
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}
            role="list"
            aria-label="Recent searches"
          >
            {recentPills.map((pill) => (
              <button
                key={pill}
                role="listitem"
                onClick={() => {
                  setQuery(pill);
                  handleSearch(pill);
                }}
                style={{
                  padding: "7px 14px",
                  borderRadius: 100,
                  background: "rgba(245,245,242,0.06)",
                  border: "none",
                  color: "rgba(245,245,242,0.75)",
                  fontFamily: DISPLAY,
                  fontSize: 13,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {pill}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {recentPills.length === 0 && !query.trim() && (
        <div
          style={{
            padding: "60px 20px",
            textAlign: "center",
            fontFamily: MONO,
            fontSize: 11,
            color: "rgba(245,245,242,0.3)",
          }}
        >
          Type a product name and press Enter to analyze
        </div>
      )}
    </div>
  );
}
