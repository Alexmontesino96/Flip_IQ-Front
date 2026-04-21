"use client";

interface LogoMarkProps {
  size?: number;
  color?: string;
  bg?: string;
}

export default function LogoMark({ size = 32, color, bg }: LogoMarkProps) {
  const s = size;
  const c = s / 2;
  const accent = color || "#D4FF3D";
  return (
    <svg
      viewBox={`0 0 ${s} ${s}`}
      width={s}
      height={s}
      style={{
        display: "block",
        background: bg || "transparent",
        borderRadius: bg ? s * 0.22 : 0,
      }}
    >
      <circle
        cx={c}
        cy={c}
        r={s * 0.42}
        fill="none"
        stroke={accent}
        strokeOpacity="0.4"
        strokeWidth={Math.max(0.8, s * 0.01)}
        strokeDasharray={`${s * 0.02} ${s * 0.045}`}
      />
      <circle
        cx={c}
        cy={c}
        r={s * 0.28}
        fill="none"
        stroke={accent}
        strokeOpacity="0.65"
        strokeWidth={Math.max(0.8, s * 0.012)}
      />
      <circle
        cx={c + s * 0.42}
        cy={c}
        r={Math.max(1.2, s * 0.045)}
        fill={accent}
      />
      <circle
        cx={c - s * 0.29}
        cy={c - s * 0.3}
        r={Math.max(1, s * 0.035)}
        fill={accent}
        opacity="0.75"
      />
      <circle
        cx={c + s * 0.28}
        cy={c + s * 0.3}
        r={Math.max(0.9, s * 0.028)}
        fill={accent}
        opacity="0.55"
      />
      <circle
        cx={c}
        cy={c - s * 0.28}
        r={Math.max(1, s * 0.035)}
        fill={accent}
      />
      <circle cx={c} cy={c} r={s * 0.11} fill={accent} />
      <circle cx={c} cy={c} r={s * 0.04} fill={bg || "#0A0A0A"} />
    </svg>
  );
}
