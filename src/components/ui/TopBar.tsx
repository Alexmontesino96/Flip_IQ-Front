"use client";

import { ReactNode } from "react";
import LogoMark from "./LogoMark";
import { MONO, DISPLAY, ACCENT } from "./theme";

interface TopBarProps {
  title?: string;
  onBack?: () => void;
  accent?: string;
  right?: ReactNode;
  showLogo?: boolean;
}

export default function TopBar({
  title,
  onBack,
  accent = ACCENT,
  right,
  showLogo,
}: TopBarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px 8px",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {onBack ? (
          <button
            onClick={onBack}
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
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path
                d="M9 2L3 7l6 5"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : null}
      </div>
      {showLogo ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LogoMark size={22} color={accent} />
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 17,
              fontWeight: 700,
              color: "#F5F5F2",
              letterSpacing: -0.5,
            }}
          >
            Flip<span style={{ color: accent }}>IQ</span>
          </div>
        </div>
      ) : (
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "rgba(245,245,242,0.55)",
            fontWeight: 500,
          }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        {right}
      </div>
    </div>
  );
}
