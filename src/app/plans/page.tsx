"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/ui/TopBar";
import BigBtn from "@/components/ui/BigBtn";
import TinyBadge from "@/components/ui/TinyBadge";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";
import {
  fetchPlans,
  getSubscriptionStatus,
  createCheckout,
  openPortal,
  BillingPlan,
  SubscriptionStatus,
} from "@/lib/billing";

type PlanId = "free" | "basic" | "premium";

interface Plan {
  id: PlanId;
  name: string;
  price: number;
  stripePriceId: string;
  tag?: string;
  limit: string;
  feats: string[];
}

const PLAN_META: Record<
  string,
  { price: number; tag?: string; feats: string[] }
> = {
  free: {
    price: 0,
    feats: [
      "eBay comps only",
      "Keyword search only",
      "Basic flip score",
      "1 watchlist",
    ],
  },
  basic: {
    price: 9.99,
    tag: "Most picked",
    feats: [
      "eBay + Amazon comps",
      "Barcode scanning",
      "Full flip score",
      "Push alerts",
      "5 watchlists",
    ],
  },
  premium: {
    price: 24.99,
    tag: "Power sellers",
    feats: [
      "Everything in Basic",
      "Market Intelligence AI",
      "CSV export",
      "Push + email alerts",
      "Unlimited watchlists",
      "Priority support",
    ],
  },
};

function buildPlans(apiPlans: BillingPlan[]): Plan[] {
  const freeMeta = PLAN_META.free;
  const plans: Plan[] = [
    {
      id: "free",
      name: "Free",
      stripePriceId: "",
      limit: "5 scans/day",
      price: freeMeta.price,
      feats: freeMeta.feats,
    },
  ];

  for (const ap of apiPlans) {
    const meta = PLAN_META[ap.id] || { price: 0, feats: [] };
    plans.push({
      id: ap.id as PlanId,
      name: ap.name,
      price: meta.price,
      stripePriceId: ap.stripe_price_id,
      tag: meta.tag,
      limit: `${ap.daily_limit} scans/day`,
      feats: meta.feats,
    });
  }

  return plans;
}

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
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans().then((apiPlans) => setPlans(buildPlans(apiPlans)));
    getSubscriptionStatus().then((sub) => {
      if (sub) {
        setSubscription(sub);
        // Pre-select current plan
        if (sub.plan && sub.plan !== "free") {
          setSelected(sub.plan as PlanId);
        }
      }
    });
  }, []);

  const currentPlan = subscription?.plan || "free";
  const isCurrentPlan = selected === currentPlan;
  const selectedPlan = plans.find((p) => p.id === selected);

  const textColor = (planId: PlanId) =>
    planId === selected && planId === "basic" ? "#0A0A0A" : "#F5F5F2";
  const mutedColor = (planId: PlanId) =>
    planId === selected && planId === "basic"
      ? "rgba(0,0,0,0.5)"
      : "rgba(245,245,242,0.5)";
  const checkColor = (planId: PlanId) =>
    planId === selected && planId === "basic" ? "#0A0A0A" : ACCENT;

  const handleCTA = async () => {
    if (loading) return;
    setError(null);

    // Current plan — open Stripe portal to manage
    if (isCurrentPlan && subscription?.has_subscription) {
      setLoading(true);
      try {
        const portalUrl = await openPortal(window.location.href);
        window.location.href = portalUrl;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to open portal");
        setLoading(false);
      }
      return;
    }

    // Free selected — nothing to do
    if (selected === "free") {
      router.push("/home");
      return;
    }

    // Upgrade/change — create Stripe checkout
    if (!selectedPlan?.stripePriceId) {
      setError("This plan is not available for purchase yet");
      return;
    }

    setLoading(true);
    try {
      const successUrl = `${window.location.origin}/plans/success?plan=${selected}`;
      const cancelUrl = window.location.href;
      const checkoutUrl = await createCheckout(
        selectedPlan.stripePriceId,
        successUrl,
        cancelUrl
      );
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  };

  const ctaLabel = () => {
    if (loading) return "Loading...";
    if (isCurrentPlan && subscription?.has_subscription) return "Manage plan";
    if (isCurrentPlan) return "Current plan";
    if (selected === "free") return "Continue with Free";
    return "Choose plan →";
  };

  // Use fallback plans while API loads
  const displayPlans =
    plans.length > 0
      ? plans
      : buildPlans([
          { id: "basic", name: "Basic", stripe_price_id: "", daily_limit: 25 },
          {
            id: "premium",
            name: "Premium",
            stripe_price_id: "",
            daily_limit: 100,
          },
        ]);

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
          Pays for itself with 1-2 good flips
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
        {displayPlans.map((plan) => {
          const isSelected = selected === plan.id;
          const isCurrent = currentPlan === plan.id;
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

                {isCurrent && (
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
                    Current
                  </TinyBadge>
                )}

                {plan.tag && !isCurrent && (
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

      {/* Error */}
      {error && (
        <div
          style={{
            margin: "12px 20px 0",
            padding: "12px 14px",
            borderRadius: 10,
            background: "rgba(255,100,100,0.1)",
            border: "1px solid rgba(255,100,100,0.2)",
            fontFamily: DISPLAY,
            fontSize: 13,
            color: "#FF6464",
          }}
        >
          {error}
        </div>
      )}

      {/* Subscription info */}
      {subscription?.has_subscription && subscription.cancel_at_period_end && (
        <div
          style={{
            margin: "12px 20px 0",
            padding: "12px 14px",
            borderRadius: 10,
            background: "rgba(255,184,77,0.1)",
            border: "1px solid rgba(255,184,77,0.2)",
            fontFamily: MONO,
            fontSize: 11,
            color: "#FFB84D",
          }}
        >
          Your plan cancels at end of period
          {subscription.current_period_end &&
            ` (${new Date(subscription.current_period_end).toLocaleDateString()})`}
        </div>
      )}

      {/* CTA button */}
      <div style={{ padding: "24px 20px 0" }}>
        <BigBtn
          onClick={handleCTA}
          accent={ACCENT}
          variant={
            isCurrentPlan && !subscription?.has_subscription
              ? "secondary"
              : "primary"
          }
        >
          {ctaLabel()}
        </BigBtn>
      </div>
    </div>
  );
}
