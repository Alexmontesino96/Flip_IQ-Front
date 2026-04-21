"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/ui/TopBar";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";

const SUGGESTIONS = [
  { title: "Apple AirPods Pro 2 USB-C", sub: "Apple · Audio" },
  { title: "Apple AirPods Pro 2 Lightning", sub: "Apple · Audio" },
  { title: "Apple AirPods Pro (1st gen)", sub: "Apple · Audio" },
  { title: "Apple AirPods Max", sub: "Apple · Audio" },
];

const RECENT_PILLS = [
  "nintendo switch oled",
  "lego orchid",
  "xbox elite controller",
];

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("airpods pro 2");

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
      {/* TopBar */}
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
          {/* Search icon */}
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

          {/* Text input */}
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
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

          {/* Clear button */}
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

      {/* Suggestions */}
      <div style={{ padding: "20px 20px 0" }}>
        <p
          style={{
            fontFamily: MONO,
            fontSize: 9,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "rgba(245,245,242,0.4)",
            margin: "0 0 4px",
          }}
        >
          Suggestions
        </p>

        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {SUGGESTIONS.map((item) => (
            <li key={item.title}>
              <button
                onClick={() => router.push("/")}
                aria-label={`View ${item.title}`}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(245,245,242,0.06)",
                  padding: "14px 0",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                {/* Thumbnail placeholder */}
                <div
                  aria-hidden="true"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "rgba(245,245,242,0.06)",
                    flexShrink: 0,
                  }}
                />

                {/* Text */}
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
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      color: "rgba(245,245,242,0.45)",
                      marginTop: 2,
                    }}
                  >
                    {item.sub}
                  </div>
                </div>

                {/* Arrow */}
                <span
                  aria-hidden="true"
                  style={{
                    color: "rgba(245,245,242,0.35)",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  ↗
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Searches */}
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
          {RECENT_PILLS.map((pill) => (
            <button
              key={pill}
              role="listitem"
              onClick={() => setQuery(pill)}
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
    </div>
  );
}
