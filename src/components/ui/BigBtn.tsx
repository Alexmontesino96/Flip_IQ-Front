"use client";

import { CSSProperties, ReactNode } from "react";
import { DISPLAY, ACCENT } from "./theme";

interface BigBtnProps {
  children: ReactNode;
  onClick?: () => void;
  accent?: string;
  variant?: "primary" | "secondary";
  style?: CSSProperties;
}

export default function BigBtn({
  children,
  onClick,
  accent = ACCENT,
  variant = "primary",
  style = {},
}: BigBtnProps) {
  const isPrimary = variant === "primary";
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "16px 20px",
        borderRadius: 16,
        border: "none",
        background: isPrimary ? accent : "rgba(245,245,242,0.05)",
        color: isPrimary ? "#0A0A0A" : "#F5F5F2",
        fontFamily: DISPLAY,
        fontSize: 16,
        fontWeight: 600,
        letterSpacing: -0.2,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
