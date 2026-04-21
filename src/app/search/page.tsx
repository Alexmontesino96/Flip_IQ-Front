"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getRecentSearches, addRecentSearch } from "@/lib/history";
import {
  fetchProductSuggestions,
  registerSuggestionSelect,
  ProductSuggestion,
} from "@/lib/search";
import TopBar from "@/components/ui/TopBar";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [recentPills, setRecentPills] = useState<string[]>(() =>
    getRecentSearches()
  );
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Debounced suggestion fetch
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      // Clear handled via cleanup — no direct setState in effect body
      const handle = requestAnimationFrame(() => setSuggestions([]));
      return () => cancelAnimationFrame(handle);
    }

    const timer = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoadingSuggestions(true);
      fetchProductSuggestions(trimmed, 8, controller.signal)
        .then((res) => setSuggestions(res.results))
        .catch(() => {})
        .finally(() => setLoadingSuggestions(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

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

  const handleSuggestionClick = useCallback(
    (s: ProductSuggestion) => {
      if (s.id) {
        registerSuggestionSelect(s.id);
      }
      const searchTerm = s.title;
      addRecentSearch(searchTerm);
      setRecentPills(getRecentSearches());
      router.push(`/?q=${encodeURIComponent(searchTerm)}`);
    },
    [router]
  );

  const showSuggestions = query.trim().length >= 2 && suggestions.length > 0;
  const showRecent =
    !showSuggestions && recentPills.length > 0 && !query.trim();

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
              onClick={() => {
                setQuery("");
                setSuggestions([]);
              }}
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

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div style={{ padding: "0 20px" }}>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              borderBottom: "1px solid rgba(245,245,242,0.07)",
            }}
            role="listbox"
            aria-label="Search suggestions"
          >
            {suggestions.map((s, i) => (
              <li
                key={s.id ?? `s-${i}`}
                role="option"
                aria-selected={false}
                style={{ borderBottom: "1px solid rgba(245,245,242,0.05)" }}
              >
                <button
                  onClick={() => handleSuggestionClick(s)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 0",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left",
                  }}
                >
                  {/* Image or placeholder */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: "rgba(245,245,242,0.06)",
                      flexShrink: 0,
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {s.image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={s.image_url}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="rgba(245,245,242,0.2)"
                        strokeWidth="1.5"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 16l5-5 4 4 4-6 5 7" />
                      </svg>
                    )}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: DISPLAY,
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#F5F5F2",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {s.title}
                    </div>
                    {(s.brand || s.category) && (
                      <div
                        style={{
                          fontFamily: MONO,
                          fontSize: 10,
                          color: "rgba(245,245,242,0.35)",
                          marginTop: 2,
                        }}
                      >
                        {[s.brand, s.category].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </div>

                  {/* Price hint */}
                  {s.price_hint != null && s.price_hint > 0 && (
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 12,
                        fontWeight: 600,
                        color: ACCENT,
                        flexShrink: 0,
                      }}
                    >
                      ~${s.price_hint.toFixed(0)}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Loading indicator */}
      {loadingSuggestions &&
        query.trim().length >= 2 &&
        suggestions.length === 0 && (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              fontFamily: MONO,
              fontSize: 10,
              color: "rgba(245,245,242,0.3)",
            }}
          >
            Searching...
          </div>
        )}

      {/* Analyze button */}
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
      {showRecent && (
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
      {!showSuggestions && !showRecent && !query.trim() && (
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
