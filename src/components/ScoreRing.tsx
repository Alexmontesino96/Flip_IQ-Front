"use client";

import { useState, useEffect } from "react";

interface ScoreRingProps {
  value: number;
  color: string;
  label: string;
  size?: number;
}

export default function ScoreRing({
  value,
  color,
  label,
  size = 64,
}: ScoreRingProps) {
  const r = (size - 5) / 2;
  const c = 2 * Math.PI * r;
  const [o, setO] = useState(c);
  useEffect(() => {
    setTimeout(() => setO(c - (value / 100) * c), 200);
  }, [value, c]);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(245,245,242,0.08)"
            strokeWidth={5}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={5}
            strokeDasharray={c}
            strokeDashoffset={o}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)",
            }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: size * 0.32, fontWeight: 800, color }}>
            {value}
          </span>
        </div>
      </div>
      <div
        style={{
          fontSize: 10,
          color: "rgba(245,245,242,0.45)",
          fontWeight: 600,
          marginTop: 4,
          letterSpacing: 0.5,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
}
