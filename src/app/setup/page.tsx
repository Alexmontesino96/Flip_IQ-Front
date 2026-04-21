"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BigBtn from "@/components/ui/BigBtn";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";

// Usage:
// Step 2 of 2 in onboarding flow.
// Seller type selection + profit ROI target slider.
// "Ready to analyze →" navigates to /home.

type SellerType = "ebay" | "amazon" | "local" | "multi";

interface SellerOption {
  id: SellerType;
  label: string;
}

const SELLER_OPTIONS: SellerOption[] = [
  { id: "ebay", label: "eBay flipper" },
  { id: "amazon", label: "Amazon FBA" },
  { id: "local", label: "Local / Marketplace" },
  { id: "multi", label: "Multi-channel" },
];

export default function SetupPage() {
  const router = useRouter();
  const [seller, setSeller] = useState<SellerType>("ebay");
  const [roi, setRoi] = useState(35);

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
        padding: "40px 28px 28px",
      }}
    >
      {/* Step indicator */}
      <div
        style={{
          fontFamily: MONO,
          fontSize: 9,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: ACCENT,
          marginBottom: 14,
        }}
      >
        02 / 02
      </div>

      {/* Title */}
      <h1
        style={{
          fontFamily: DISPLAY,
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: -1,
          lineHeight: 1.05,
          color: "#F5F5F2",
          margin: "0 0 10px",
        }}
      >
        Set up your profile
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: DISPLAY,
          fontSize: 15,
          fontWeight: 400,
          color: "rgba(245,245,242,0.55)",
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        We tune analysis to your model
      </p>

      {/* Seller type */}
      <section aria-label="Seller type" style={{ marginTop: 36 }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 9,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "rgba(245,245,242,0.4)",
            marginBottom: 12,
          }}
        >
          Seller Type
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {SELLER_OPTIONS.map((opt) => {
            const isSelected = seller === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSeller(opt.id)}
                aria-pressed={isSelected}
                aria-label={opt.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "13px 16px",
                  borderRadius: 14,
                  border: isSelected
                    ? `1px solid ${ACCENT}`
                    : "1px solid rgba(245,245,242,0.1)",
                  background: isSelected
                    ? "rgba(212,255,61,0.07)"
                    : "rgba(245,245,242,0.03)",
                  color: "#F5F5F2",
                  cursor: "pointer",
                  fontFamily: DISPLAY,
                  fontSize: 15,
                  fontWeight: isSelected ? 600 : 400,
                  textAlign: "left",
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <span
                    aria-hidden="true"
                    style={{
                      fontFamily: MONO,
                      fontSize: 12,
                      color: ACCENT,
                      lineHeight: 1,
                    }}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Profit target / ROI */}
      <section aria-label="Profit target ROI" style={{ marginTop: 28 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 9,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "rgba(245,245,242,0.4)",
            }}
          >
            Profit Target — ROI
          </div>
          <span
            style={{
              fontFamily: DISPLAY,
              fontSize: 20,
              fontWeight: 700,
              color: ACCENT,
              letterSpacing: -0.5,
            }}
          >
            {roi}%
          </span>
        </div>

        <input
          type="range"
          min={15}
          max={80}
          step={5}
          value={roi}
          onChange={(e) => setRoi(Number(e.target.value))}
          aria-label={`Profit target ROI: ${roi}%`}
          style={{
            width: "100%",
            accentColor: ACCENT,
            cursor: "pointer",
            height: 4,
          }}
        />

        {/* Min / Max labels */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
            fontFamily: MONO,
            fontSize: 9,
            color: "rgba(245,245,242,0.3)",
            letterSpacing: 0.5,
          }}
        >
          <span>15%</span>
          <span>80%</span>
        </div>
      </section>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* CTA */}
      <BigBtn
        onClick={() => router.push("/home")}
        accent={ACCENT}
        variant="primary"
      >
        Ready to analyze →
      </BigBtn>
    </div>
  );
}
