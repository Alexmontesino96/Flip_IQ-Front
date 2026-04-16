"use client";

import { useState } from "react";

interface EmailGateProps {
  onSubmit: (email: string) => void;
  onClose: () => void;
}

export default function EmailGate({ onSubmit, onClose }: EmailGateProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (!email.includes("@")) {
      setError(true);
      return;
    }
    onSubmit(email.trim());
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#111118",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 20,
          padding: 28,
          textAlign: "center",
          fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>&#x1F680;</div>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#e2e8f0",
            marginBottom: 6,
          }}
        >
          You&apos;re on a roll!
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "#94a3b8",
            lineHeight: 1.6,
            marginBottom: 20,
          }}
        >
          Enter your email to unlock{" "}
          <span style={{ color: "#c4b5fd", fontWeight: 600 }}>
            3 free analyses per day
          </span>
          . No spam, ever.
        </p>

        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: 12,
            border: `1px solid ${error ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`,
            background: "rgba(255,255,255,0.04)",
            color: "#e2e8f0",
            fontSize: 15,
            fontFamily: "inherit",
            outline: "none",
            marginBottom: error ? 6 : 14,
          }}
        />
        {error && (
          <p
            style={{
              fontSize: 12,
              color: "#ef4444",
              marginBottom: 14,
              textAlign: "left",
            }}
          >
            Please enter a valid email address
          </p>
        )}

        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: 16,
            borderRadius: 14,
            border: "none",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
            color: "#fff",
            boxShadow: "0 4px 20px rgba(139,92,246,0.25)",
            marginBottom: 10,
          }}
        >
          Continue
        </button>

        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#475569",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
