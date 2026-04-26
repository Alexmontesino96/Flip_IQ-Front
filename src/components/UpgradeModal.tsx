"use client";

import { useState } from "react";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";
import { createCheckout } from "@/lib/billing";

interface UpgradeModalProps {
  onClose: () => void;
  trigger: "ai_gate" | "scan_limit";
}

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$14.99",
    perMonth: "/month",
    scans: "30 analyses per day",
    features: [
      "Full AI explanation on every result",
      "Decision Brief with action plan",
      "eBay + Amazon data",
    ],
    stripePriceId: "price_1TPOhhF4IFBF6Qp6jW0IVJoG",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29.99",
    perMonth: "/month",
    scans: "100 analyses per day",
    features: [
      "Everything in Starter",
      "Watchlist & price alerts",
      "Analysis history (30 days)",
    ],
    stripePriceId: "price_1TPOhiF4IFBF6Qp6aAoh43Oj",
  },
];

export default function UpgradeModal({ onClose, trigger }: UpgradeModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelect = async (plan: (typeof PLANS)[number]) => {
    setLoading(plan.id);
    try {
      const origin = globalThis.location?.origin || "";
      const successUrl = `${origin}/plans/success?plan=${plan.id}`;
      const cancelUrl = `${origin}/free`;
      const checkoutUrl = await createCheckout(
        plan.stripePriceId,
        successUrl,
        cancelUrl
      );
      // External redirect to Stripe
      globalThis.location?.assign(checkoutUrl);
    } catch {
      setLoading(null);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 520,
          background: "#0E0E0E",
          border: "1px solid rgba(245,245,242,0.1)",
          borderRadius: 20,
          padding: "32px 28px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            color: "rgba(245,245,242,0.4)",
            fontSize: 22,
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {/* Title */}
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 22,
            fontWeight: 700,
            color: "#F5F5F2",
            letterSpacing: -0.5,
            marginBottom: 6,
          }}
        >
          Unlock the full FlipIQ analysis
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 14,
            color: "rgba(245,245,242,0.5)",
            marginBottom: 28,
          }}
        >
          {trigger === "ai_gate"
            ? "Get AI-powered insights on every scan"
            : "You've reached your daily limit"}
        </div>

        {/* Plans */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              style={{
                padding: "20px",
                borderRadius: 16,
                border:
                  plan.id === "starter"
                    ? `1px solid rgba(139,92,246,0.4)`
                    : `1px solid rgba(245,245,242,0.08)`,
                background:
                  plan.id === "starter"
                    ? "rgba(139,92,246,0.06)"
                    : "rgba(245,245,242,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#F5F5F2",
                  }}
                >
                  {plan.name}
                </span>
                <span
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#F5F5F2",
                  }}
                >
                  {plan.price}
                  <span
                    style={{
                      fontSize: 12,
                      color: "rgba(245,245,242,0.4)",
                      fontWeight: 400,
                    }}
                  >
                    {plan.perMonth}
                  </span>
                </span>
              </div>

              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  color: ACCENT,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                {plan.scans}
              </div>

              <ul
                style={{
                  listStyle: "none",
                  margin: "0 0 16px",
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {plan.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: 13,
                      color: "rgba(245,245,242,0.7)",
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: ACCENT, fontSize: 11 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelect(plan)}
                disabled={loading !== null}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: 12,
                  border: "none",
                  background:
                    plan.id === "starter"
                      ? "linear-gradient(135deg, #8b5cf6, #6d28d9)"
                      : ACCENT,
                  color: plan.id === "starter" ? "#fff" : "#0A0A0A",
                  fontFamily: DISPLAY,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: loading ? "wait" : "pointer",
                  opacity: loading && loading !== plan.id ? 0.5 : 1,
                }}
              >
                {loading === plan.id ? "Loading..." : "Start 7-day trial"}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 13,
            color: "rgba(245,245,242,0.4)",
            textAlign: "center",
          }}
        >
          Already have an account?{" "}
          <a
            href="/login"
            style={{ color: ACCENT, textDecoration: "none", fontWeight: 600 }}
          >
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
