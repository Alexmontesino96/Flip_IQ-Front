"use client";

import { ReactNode } from "react";
import { MONO } from "./theme";

interface TinyBadgeProps {
  children: ReactNode;
  color?: string;
  bg?: string;
}

export default function TinyBadge({
  children,
  color = "rgba(245,245,242,0.6)",
  bg = "rgba(245,245,242,0.06)",
}: TinyBadgeProps) {
  return (
    <span
      style={{
        padding: "3px 8px",
        borderRadius: 100,
        fontFamily: MONO,
        fontSize: 9,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        color,
        background: bg,
        fontWeight: 500,
      }}
    >
      {children}
    </span>
  );
}
