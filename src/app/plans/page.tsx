"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/ui/TopBar";
import BigBtn from "@/components/ui/BigBtn";
import TinyBadge from "@/components/ui/TinyBadge";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";

// Usage:
// Default selected plan is 'basic'. Clicking "Choose plan →" (or "Current" for free)
// would trigger subscription flow. BigBtn is disabled-style when plan=free.

type PlanId = "free" | "basic" | "premium";

interface Plan {
  id: PlanId;
  name: string;
  price: number;
  tag?: string;
  limit: string;
  feats: string[];
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    limit: "5 scans/day",
    feats: [
      "eBay comps only",
      "Keyword search only",
      "Basic flip score",
      "1 watchlist",
    ],
  },
  {
    id: "basic",
    name: "Basic",
    price: 9.99,
    tag: "Most picked",
    limit: "25 scans/day",
    feats: [
      "eBay + Amazon comps",
      "Barcode scanning",
      "Full flip score",
      "Push alerts",
      "5 watchlists",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 24.99,
    tag: "Power sellers",
    limit: "100 scans/day",
    feats: [
      "Everything in Basic",
      "Market Intelligence AI",
      "CSV export",
      "Push + email alerts",
      "Unlimited watchlists",
      "Priority support",
    ],
  },
];

function planCardStyle(
  isSelected: boolean,
  planId: PlanId
): React.CSSProperties {
  if (isSelected && planId === "basic") {
    return {
      background: ACCENT,
      color: "#0A0A0A",
      border: "none",
      borderRadius: 18,
      padding: "16px 18px",
      cursor: "pointer",
      textAlign: "left",
      width: "100%",
    };
  }
  if (isSelected) {
    return {
      background: "rgba(245,245,242,0.06)",
      color: "#F5F5F2",
      border: `1px solid ${ACCENT}`,
      borderRadius: 18,
      padding: "16px 18px",
      cursor: "pointer",
      textAlign: "left",
      width: "100%",
    };
  }
  return {
    background: "rgba(245,245,242,0.03)",
    color: "#F5F5F2",
    border: "1px solid rgba(245,245,242,0.08)",
    borderRadius: 18,
    padding: "16px 18px",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
  };
}

export default function PlansPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<PlanId>("basic");

  const isBasicSelected = selected === "basic";
  const textColor = (planId: PlanId) =>
    planId === selected && planId === "basic" ? "#0A0A0A" : "#F5F5F2";
  const mutedColor = (planId: PlanId) =>
    planId === selected && planId === "basic"
      ? "rgba(0,0,0,0.5)"
      : "rgba(245,245,242,0.5)";
  const checkColor = (planId: PlanId) =>
    planId === selected && planId === "basic" ? "#0A0A0A" : ACCENT;

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
        paddingBottom: 32,
      }}
    >
      <TopBar title="Plans" onBack={() => router.back()} accent={ACCENT} />

      {/* Header */}
      <div style={{ padding: "20px 20px 24px" }}>
        <h1
          style={{
            fontFamily: DISPLAY,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: -0.8,
            lineHeight: 1.1,
            color: "#F5F5F2",
            margin: "0 0 8px",
          }}
        >
          Pick your plan
        </h1>
        <p
          style={{
            fontFamily: MONO,
            fontSize: 11,
            color: "rgba(245,245,242,0.45)",
            margin: 0,
            letterSpacing: 0.2,
          }}
        >
          Pays for itself with 1–2 good flips
        </p>
      </div>

      {/* Plans list */}
      <div
        style={{
          padding: "0 20px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          flex: 1,
        }}
      >
        {PLANS.map((plan) => {
          const isSelected = selected === plan.id;
          return (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              aria-pressed={isSelected}
              aria-label={`${plan.name} plan, $${plan.price}/mo, ${plan.limit}`}
              style={planCardStyle(isSelected, plan.id)}
            >
              {/* Top row: name + tag + price */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 20,
                    fontWeight: 700,
                    color: textColor(plan.id),
                    letterSpacing: -0.4,
                    flex: 1,
                  }}
                >
                  {plan.name}
                </span>

                {plan.tag && (
                  <TinyBadge
                    color={
                      isSelected && plan.id === "basic" ? "#0A0A0A" : ACCENT
                    }
                    bg={
                      isSelected && plan.id === "basic"
                        ? "rgba(0,0,0,0.15)"
                        : "rgba(212,255,61,0.12)"
                    }
                  >
                    {plan.tag}
                  </TinyBadge>
                )}

                <span
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 16,
                    fontWeight: 700,
                    color: textColor(plan.id),
                    letterSpacing: -0.3,
                    flexShrink: 0,
                  }}
                >
                  {plan.price === 0
                    ? "Free"
                    : `$${plan.price % 1 === 0 ? plan.price : plan.price.toFixed(2)}/mo`}
                </span>
              </div>

              {/* Limit */}
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  color: mutedColor(plan.id),
                  marginBottom: 10,
                }}
              >
                {plan.limit}
              </div>

              {/* Features */}
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                }}
              >
                {plan.feats.map((feat, fi) => (
                  <li
                    key={fi}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      fontFamily: DISPLAY,
                      fontSize: 13,
                      fontWeight: 400,
                      color: textColor(plan.id),
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        fontFamily: MONO,
                        fontSize: 11,
                        color: checkColor(plan.id),
                        flexShrink: 0,
                        lineHeight: 1,
                      }}
                    >
                      ✓
                    </span>
                    {feat}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* CTA button */}
      <div style={{ padding: "24px 20px 0" }}>
        <BigBtn
          onClick={() => {
            // TODO: trigger subscription flow
          }}
          accent={ACCENT}
          variant={selected === "free" ? "secondary" : "primary"}
        >
          {selected === "free" ? "Current" : "Choose plan →"}
        </BigBtn>
      </div>
    </div>
  );
}
