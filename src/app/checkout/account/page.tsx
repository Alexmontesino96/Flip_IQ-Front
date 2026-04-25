"use client";

import { useState, Suspense, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";
import Link from "next/link";

const BG = "#0A0A0A";
const BG2 = "#0E0E0E";
const INK = "#F5F5F2";
const DIM = "rgba(245,245,242,0.58)";
const DIMMER = "rgba(245,245,242,0.35)";
const LINE = "rgba(245,245,242,0.08)";
const LINE2 = "rgba(245,245,242,0.14)";

const PLAN_INFO: Record<
  string,
  { name: string; price: string; daily: string }
> = {
  basic: { name: "Basic", price: "$9.99", daily: "25 scans/day" },
  premium: { name: "Premium", price: "$24.99", daily: "100 scans/day" },
};

// ── Password strength ──
function getStrength(pw: string): number {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) s++;
  return s;
}
function strengthLabel(s: number) {
  return ["", "WEAK", "FAIR", "GOOD", "STRONG"][s] || "";
}
function strengthColor(s: number) {
  return s <= 1 ? "#FF6B5A" : s === 2 ? "#FFB547" : ACCENT;
}

function AccountGateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planKey = searchParams.get("plan") ?? "basic";
  const plan = PLAN_INFO[planKey] ?? PLAN_INFO.basic;

  const [step, setStep] = useState<1 | 2>(1);
  const [choice, setChoice] = useState<"new" | "existing">("new");

  // Form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = useMemo(() => getStrength(password), [password]);
  const canSubmit = firstName && email && password.length >= 8 && agreed;

  const handleContinue = useCallback(() => {
    if (choice === "existing") {
      router.push(`/login?redirect=/plans&plan=${planKey}`);
    } else {
      setStep(2);
    }
  }, [choice, planKey, router]);

  const handleSignup = useCallback(async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: `${firstName} ${lastName}`.trim() } },
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    sessionStorage.setItem("selectedPlan", planKey);
    router.push(`/plans?plan=${planKey}`);
    router.refresh();
  }, [canSubmit, firstName, lastName, email, password, planKey, router]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: BG,
        color: INK,
        fontFamily: DISPLAY,
      }}
    >
      {/* ═══ TOP BAR ═══ */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 28px",
          borderBottom: `1px solid ${LINE}`,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: INK,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: BG2,
              border: `1px solid ${ACCENT}4D`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              color: ACCENT,
              letterSpacing: -2,
              fontSize: 18,
              boxShadow: `inset 0 0 12px ${ACCENT}1F`,
            }}
          >
            F
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: -0.5 }}>
            Flip<em style={{ fontStyle: "normal", color: ACCENT }}>IQ</em>
          </span>
        </Link>

        {/* Step track */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: 1.8,
            color: DIM,
            textTransform: "uppercase",
          }}
        >
          <span>Plan</span>
          <div style={{ display: "flex", gap: 5 }}>
            <span
              style={{
                width: 24,
                height: 4,
                borderRadius: 2,
                background: `${ACCENT}66`,
              }}
            />
            <span
              style={{
                width: 24,
                height: 4,
                borderRadius: 2,
                background: step === 1 ? ACCENT : `${ACCENT}66`,
                boxShadow: step === 1 ? `0 0 6px ${ACCENT}8C` : "none",
              }}
            />
            <span
              style={{
                width: 24,
                height: 4,
                borderRadius: 2,
                background: step === 2 ? ACCENT : LINE2,
                boxShadow: step === 2 ? `0 0 6px ${ACCENT}8C` : "none",
              }}
            />
          </div>
          <span>Account</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: MONO,
            fontSize: 11,
            color: DIM,
            letterSpacing: 1,
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke={ACCENT}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          SECURE
        </div>
      </div>

      {/* ═══ PLAN STRIP ═══ */}
      <div
        style={{
          maxWidth: 1100,
          margin: "20px auto 0",
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: 1.5,
            color: DIM,
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: `${ACCENT}1F`,
              border: `1px solid ${ACCENT}66`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke={ACCENT}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12l5 5L20 7" />
            </svg>
          </span>
          Plan selected
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 14px",
            border: `1px solid ${LINE2}`,
            borderRadius: 10,
            background: BG2,
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: 0.5,
          }}
        >
          <span
            style={{
              color: ACCENT,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            {plan.name}
          </span>
          <span style={{ color: INK, fontWeight: 600 }}>
            {plan.price}{" "}
            <small style={{ color: DIM, fontWeight: 400 }}>/ mo</small>
          </span>
          <Link
            href="/plans"
            style={{
              color: DIM,
              borderLeft: `1px solid ${LINE2}`,
              paddingLeft: 10,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              fontSize: 9.5,
              textDecoration: "none",
            }}
          >
            Change
          </Link>
        </div>
      </div>

      {/* ═══ MAIN 2-COL LAYOUT ═══ */}
      <div
        className="ag-main"
        style={{
          maxWidth: 1100,
          margin: "36px auto 0",
          padding: "0 28px 60px",
          display: "grid",
          gridTemplateColumns: "1.05fr 0.95fr",
          gap: 56,
          alignItems: "start",
        }}
      >
        {/* ── LEFT: Hero ── */}
        <div style={{ paddingTop: 18 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: MONO,
              fontSize: 10.5,
              letterSpacing: 2.5,
              color: ACCENT,
              textTransform: "uppercase",
              fontWeight: 700,
              padding: "6px 12px",
              borderRadius: 6,
              background: `${ACCENT}14`,
              border: `1px solid ${ACCENT}40`,
              marginBottom: 18,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: ACCENT,
                animation: "ag-pulse 1.8s infinite",
              }}
            />
            {step === 1
              ? "Step 2 of 3 · Account"
              : "Step 2 of 3 · Create account"}
          </div>

          {step === 1 ? (
            <>
              <h1
                style={{
                  margin: "0 0 18px",
                  fontSize: 52,
                  fontWeight: 800,
                  letterSpacing: -2.2,
                  lineHeight: 1.02,
                }}
              >
                First, we need to
                <br />
                <em style={{ fontStyle: "normal", color: ACCENT }}>
                  know a bit about you.
                </em>
              </h1>
              <p
                style={{
                  fontSize: 16,
                  color: DIM,
                  lineHeight: 1.55,
                  maxWidth: 460,
                  margin: "0 0 32px",
                }}
              >
                You&apos;re one step from your{" "}
                <b style={{ color: INK, fontWeight: 600 }}>{plan.name}</b> plan.
                Tell us if you already use FlipIQ or if you&apos;re{" "}
                <b style={{ color: INK, fontWeight: 600 }}>starting today</b>.
              </p>
            </>
          ) : (
            <>
              <h1
                style={{
                  margin: "0 0 18px",
                  fontSize: 52,
                  fontWeight: 800,
                  letterSpacing: -2.2,
                  lineHeight: 1.02,
                }}
              >
                Let&apos;s get you
                <br />
                <em style={{ fontStyle: "normal", color: ACCENT }}>set up.</em>
              </h1>
              <p
                style={{
                  fontSize: 16,
                  color: DIM,
                  lineHeight: 1.55,
                  maxWidth: 460,
                  margin: "0 0 32px",
                }}
              >
                Four fields and you&apos;re in. Your{" "}
                <b style={{ color: INK, fontWeight: 600 }}>{plan.name}</b> plan
                activates after email confirmation —{" "}
                <b style={{ color: INK, fontWeight: 600 }}>
                  nothing is charged yet
                </b>
                .
              </p>
            </>
          )}

          {/* Micro-list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {(step === 1
              ? [
                  {
                    icon: "⚡",
                    text: (
                      <>
                        Your plan is linked to your account.{" "}
                        <b style={{ color: INK }}>No surprise charges</b> — you
                        confirm everything first.
                      </>
                    ),
                  },
                  {
                    icon: "🔒",
                    text: (
                      <>
                        Encrypted connection. Your password is hashed
                        client-side.{" "}
                        <b style={{ color: INK }}>
                          Nobody at FlipIQ can read it
                        </b>
                        .
                      </>
                    ),
                  },
                  {
                    icon: "↩️",
                    text: (
                      <>
                        Change your mind?{" "}
                        <b style={{ color: INK }}>Cancel in 1 click</b> from
                        Settings — no questions asked.
                      </>
                    ),
                  },
                ]
              : [
                  {
                    icon: "✓",
                    text: (
                      <>
                        <b style={{ color: INK }}>Name</b> only appears on your
                        profile. We never share it.
                      </>
                    ),
                  },
                  {
                    icon: "✉",
                    text: (
                      <>
                        <b style={{ color: INK }}>Email</b> is your login and
                        where comp alerts arrive.
                      </>
                    ),
                  },
                  {
                    icon: "🔒",
                    text: (
                      <>
                        <b style={{ color: INK }}>Min. 8 characters</b>, one
                        uppercase, one number. Never stored in plain text.
                      </>
                    ),
                  },
                ]
            ).map((item, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: `${ACCENT}14`,
                    border: `1px solid ${ACCENT}33`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: DIM,
                    lineHeight: 1.45,
                    paddingTop: 4,
                  }}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div
            style={{
              marginTop: 36,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 14,
              maxWidth: 480,
            }}
          >
            {(step === 1
              ? [
                  { n: "8.2k", l: "Active resellers" },
                  { n: "$3.4M", l: "Profit detected" },
                  { n: "4.8★", l: "App rating" },
                ]
              : [
                  { n: "~30s", l: "Full setup" },
                  { n: plan.daily, l: "Scans included" },
                  { n: "7d", l: "Free trial" },
                ]
            ).map((s, i) => (
              <div
                key={i}
                style={{
                  padding: 14,
                  border: `1px solid ${LINE}`,
                  borderRadius: 12,
                  background: BG2,
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontWeight: 700,
                    fontSize: 22,
                    color: ACCENT,
                    letterSpacing: -1,
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {s.n}
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 9,
                    letterSpacing: 1.5,
                    color: DIM,
                    textTransform: "uppercase",
                    marginTop: 8,
                  }}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Card ── */}
        <div>
          <div
            style={{
              background: BG2,
              border: `1px solid ${LINE2}`,
              borderRadius: 20,
              padding: 32,
              position: "relative",
              overflow: "hidden",
              boxShadow: `0 0 0 1px ${ACCENT}0A, 0 30px 80px rgba(0,0,0,0.4)`,
            }}
          >
            {/* Gradient border glow */}
            <div
              style={{
                position: "absolute",
                inset: -1,
                borderRadius: 21,
                pointerEvents: "none",
                zIndex: 0,
                background: `linear-gradient(160deg, ${ACCENT}2E, transparent 30%, transparent 70%, ${ACCENT}14)`,
                opacity: 0.7,
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              {/* Card head */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 28,
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 9.5,
                    letterSpacing: 2,
                    color: ACCENT,
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  Step <b style={{ color: INK }}>2</b> ·{" "}
                  {step === 1 ? "Account" : "Create account"}
                </div>
                {step === 2 && (
                  <button
                    onClick={() => setStep(1)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: DIM,
                      cursor: "pointer",
                      fontFamily: MONO,
                      fontSize: 10,
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    ← Back
                  </button>
                )}
              </div>

              {step === 1 ? (
                <>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      letterSpacing: -1,
                      lineHeight: 1.1,
                      marginBottom: 10,
                    }}
                  >
                    New here or
                    <br />
                    returning user?
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: DIM,
                      lineHeight: 1.5,
                      marginBottom: 26,
                      maxWidth: 380,
                    }}
                  >
                    Pick the right option. We&apos;ll take you to the right
                    place — <b style={{ color: INK }}>no extra steps</b>.
                  </div>

                  {/* Choice cards */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      marginBottom: 22,
                    }}
                  >
                    {[
                      {
                        id: "new" as const,
                        title: "First time here",
                        sub: `We'll create your account and apply the ${plan.name} plan.`,
                        badge: "Recommended",
                      },
                      {
                        id: "existing" as const,
                        title: "I have an account",
                        sub: `Sign in and we'll link ${plan.name} to your profile.`,
                        badge: "Login",
                      },
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setChoice(c.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          padding: "18px 20px",
                          borderRadius: 14,
                          border: `1px solid ${choice === c.id ? ACCENT : LINE2}`,
                          background: choice === c.id ? `${ACCENT}0F` : BG,
                          cursor: "pointer",
                          textAlign: "left",
                          width: "100%",
                          color: INK,
                          fontFamily: "inherit",
                          transition: "all 0.15s",
                        }}
                      >
                        <span
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            border: `1.5px solid ${choice === c.id ? ACCENT : LINE2}`,
                            background:
                              choice === c.id ? ACCENT : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {choice === c.id && (
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: BG,
                              }}
                            />
                          )}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 700,
                              letterSpacing: -0.4,
                              lineHeight: 1.2,
                            }}
                          >
                            {c.title}
                          </div>
                          <div
                            style={{
                              fontFamily: MONO,
                              fontSize: 10.5,
                              letterSpacing: 0.4,
                              color: DIM,
                              marginTop: 5,
                              lineHeight: 1.4,
                            }}
                          >
                            {c.sub}
                          </div>
                        </div>
                        <span
                          style={{
                            fontFamily: MONO,
                            fontSize: 9,
                            letterSpacing: 1.5,
                            textTransform: "uppercase",
                            fontWeight: 700,
                            padding: "4px 9px",
                            borderRadius: 5,
                            flexShrink: 0,
                            background:
                              choice === c.id ? `${ACCENT}1F` : `${INK}0D`,
                            border: `1px solid ${choice === c.id ? `${ACCENT}4D` : LINE}`,
                            color: choice === c.id ? ACCENT : DIM,
                          }}
                        >
                          {c.badge}
                        </span>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={choice === c.id ? ACCENT : DIM}
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ flexShrink: 0, transition: "all 0.15s" }}
                        >
                          <path d="M5 12h14M13 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>

                  {/* Separator */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      margin: "0 0 18px",
                    }}
                  >
                    <span style={{ flex: 1, height: 1, background: LINE }} />
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 9.5,
                        letterSpacing: 2,
                        color: DIMMER,
                        textTransform: "uppercase",
                      }}
                    >
                      or continue with
                    </span>
                    <span style={{ flex: 1, height: 1, background: LINE }} />
                  </div>

                  {/* OAuth */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                      marginBottom: 24,
                    }}
                  >
                    {[
                      {
                        label: "Google",
                        svg: (
                          <svg width="16" height="16" viewBox="0 0 24 24">
                            <path
                              fill="#FFC107"
                              d="M21.8 10.2H12v3.9h5.6c-.5 2.5-2.6 4.3-5.6 4.3-3.4 0-6.2-2.8-6.2-6.2s2.8-6.2 6.2-6.2c1.6 0 3 .6 4.1 1.6l2.8-2.8C16.9 2.7 14.6 1.7 12 1.7 6.3 1.7 1.7 6.3 1.7 12S6.3 22.3 12 22.3c5.9 0 10-4.1 10-10.3 0-.6-.1-1.2-.2-1.8z"
                            />
                          </svg>
                        ),
                      },
                      {
                        label: "Apple",
                        svg: (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill={INK}
                          >
                            <path d="M17.6 13.4c0-2.6 2.2-3.9 2.3-3.9-1.2-1.8-3.2-2-3.9-2-1.6-.2-3.2.9-4 .9s-2.1-.9-3.5-.9c-1.8 0-3.4 1-4.3 2.6-1.8 3.2-.5 7.8 1.3 10.4.9 1.3 1.9 2.7 3.3 2.6 1.3 0 1.8-.8 3.5-.8 1.6 0 2.1.8 3.5.8 1.5 0 2.4-1.3 3.3-2.6 1-1.5 1.4-2.9 1.5-3-.1 0-2.9-1.1-2.9-4.1zM15 4.6c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.2 1.2.1 2.3-.6 3-1.5z" />
                          </svg>
                        ),
                      },
                    ].map((o) => (
                      <button
                        key={o.label}
                        style={{
                          padding: 13,
                          background: BG,
                          border: `1px solid ${LINE2}`,
                          borderRadius: 12,
                          color: INK,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 9,
                          fontFamily: "inherit",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        {o.svg} {o.label}
                      </button>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={handleContinue}
                    style={{
                      width: "100%",
                      padding: "16px 18px",
                      background: ACCENT,
                      color: BG,
                      border: "none",
                      borderRadius: 13,
                      fontFamily: DISPLAY,
                      fontWeight: 800,
                      fontSize: 15,
                      letterSpacing: -0.2,
                      cursor: "pointer",
                      boxShadow: `0 12px 32px ${ACCENT}40`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                    }}
                  >
                    {choice === "new"
                      ? "Create my account"
                      : "Sign in to my account"}{" "}
                    <span style={{ fontWeight: 700 }}>→</span>
                  </button>

                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      letterSpacing: 1,
                      color: DIM,
                      textAlign: "center",
                      marginTop: 14,
                      lineHeight: 1.5,
                    }}
                  >
                    By continuing you accept the{" "}
                    <a
                      href="#"
                      style={{ color: ACCENT, textDecoration: "none" }}
                    >
                      Terms
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      style={{ color: ACCENT, textDecoration: "none" }}
                    >
                      Privacy Policy
                    </a>
                    .
                  </div>
                </>
              ) : (
                /* ════ STEP 2: SIGNUP FORM ════ */
                <>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      letterSpacing: -1,
                      lineHeight: 1.1,
                      marginBottom: 10,
                    }}
                  >
                    Your details.
                    <br />
                    Then we scan.
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: DIM,
                      lineHeight: 1.5,
                      marginBottom: 26,
                    }}
                  >
                    Four fields, no tricks. We&apos;ll send a confirmation
                    email.
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSignup();
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <FieldInput
                        icon={<UserIcon />}
                        label="First name"
                        placeholder="Alex"
                        value={firstName}
                        onChange={setFirstName}
                        autoComplete="given-name"
                        required
                      />
                      <FieldInput
                        icon={<UserIcon />}
                        label="Last name"
                        placeholder="Smith"
                        value={lastName}
                        onChange={setLastName}
                        autoComplete="family-name"
                      />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <FieldInput
                        icon={<MailIcon />}
                        label="Email"
                        placeholder="alex@email.com"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        autoComplete="email"
                        hint="Used as login"
                        required
                      />
                    </div>
                    <div style={{ marginBottom: 6 }}>
                      <FieldInput
                        icon={<LockIcon />}
                        label="Password"
                        placeholder="••••••••"
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={setPassword}
                        autoComplete="new-password"
                        hint="Min. 8 characters"
                        required
                        right={
                          <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: DIM,
                              cursor: "pointer",
                              fontFamily: MONO,
                              fontSize: 9.5,
                              letterSpacing: 1.2,
                              textTransform: "uppercase",
                              padding: "6px",
                            }}
                          >
                            {showPw ? "Hide" : "Show"}
                          </button>
                        }
                      />
                    </div>

                    {/* Strength meter */}
                    <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          style={{
                            flex: 1,
                            height: 3,
                            borderRadius: 2,
                            background:
                              i < strength ? strengthColor(strength) : LINE2,
                            boxShadow:
                              i < strength && strength >= 3
                                ? `0 0 6px ${ACCENT}66`
                                : "none",
                            transition: "all 0.3s",
                          }}
                        />
                      ))}
                    </div>
                    {password && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontFamily: MONO,
                          fontSize: 9.5,
                          letterSpacing: 1.5,
                          color: DIM,
                          textTransform: "uppercase",
                          marginBottom: 16,
                        }}
                      >
                        <span>
                          Strength ·{" "}
                          <span
                            style={{
                              color: strengthColor(strength),
                              fontWeight: 700,
                            }}
                          >
                            {strengthLabel(strength)}
                          </span>
                        </span>
                        <span>Aa · 0-9 · 8+</span>
                      </div>
                    )}

                    {/* Consent */}
                    <div
                      onClick={() => setAgreed(!agreed)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        cursor: "pointer",
                        margin: "16px 0 22px",
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 5,
                          flexShrink: 0,
                          marginTop: 1,
                          border: `1.5px solid ${agreed ? ACCENT : LINE2}`,
                          background: agreed ? ACCENT : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s",
                        }}
                      >
                        {agreed && (
                          <svg
                            width="10"
                            height="8"
                            viewBox="0 0 10 8"
                            fill="none"
                          >
                            <path
                              d="M1 4L3.5 6.5L9 1"
                              stroke={BG}
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      <span
                        style={{ fontSize: 11.5, color: DIM, lineHeight: 1.5 }}
                      >
                        I accept the{" "}
                        <a
                          href="#"
                          style={{
                            color: INK,
                            textDecoration: "underline",
                            textDecorationColor: `${INK}4D`,
                            textUnderlineOffset: 2,
                          }}
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="#"
                          style={{
                            color: INK,
                            textDecoration: "underline",
                            textDecorationColor: `${INK}4D`,
                            textUnderlineOffset: 2,
                          }}
                        >
                          Privacy Policy
                        </a>
                        .
                      </span>
                    </div>

                    {error && (
                      <p
                        style={{
                          fontFamily: DISPLAY,
                          fontSize: 13,
                          color: "#FF6464",
                          margin: "0 0 12px",
                        }}
                      >
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={!canSubmit || loading}
                      style={{
                        width: "100%",
                        padding: "16px 18px",
                        background: canSubmit ? ACCENT : `${ACCENT}66`,
                        color: BG,
                        border: "none",
                        borderRadius: 13,
                        fontFamily: DISPLAY,
                        fontWeight: 800,
                        fontSize: 15,
                        letterSpacing: -0.2,
                        cursor:
                          canSubmit && !loading ? "pointer" : "not-allowed",
                        boxShadow: canSubmit
                          ? `0 12px 32px ${ACCENT}40`
                          : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        opacity: loading ? 0.6 : 1,
                        transition: "all 0.15s",
                      }}
                    >
                      {loading
                        ? "Creating account..."
                        : `Create account & apply ${plan.name}`}{" "}
                      <span style={{ fontWeight: 700 }}>→</span>
                    </button>

                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        letterSpacing: 1,
                        color: DIM,
                        textAlign: "center",
                        marginTop: 14,
                      }}
                    >
                      Already have an account?{" "}
                      <a
                        href={`/login?redirect=/plans&plan=${planKey}`}
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`/login?redirect=/plans&plan=${planKey}`);
                        }}
                        style={{ color: ACCENT, textDecoration: "none" }}
                      >
                        Sign in
                      </a>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Trust strip */}
          <div
            style={{
              marginTop: 14,
              padding: "14px 18px",
              border: `1px solid ${LINE}`,
              borderRadius: 12,
              background: BG2,
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontFamily: MONO,
              fontSize: 10.5,
              letterSpacing: 0.4,
              color: DIM,
              lineHeight: 1.4,
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: `${ACCENT}14`,
                border: `1px solid ${ACCENT}33`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: ACCENT,
                flexShrink: 0,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            Stripe processes all payments ·{" "}
            <b style={{ color: INK, fontWeight: 600 }}>
              FlipIQ never sees your card
            </b>
            . PCI-DSS Level 1.
          </div>
        </div>
      </div>

      {/* Responsive + animations */}
      <style>{`
        @keyframes ag-pulse {
          0% { box-shadow: 0 0 0 0 rgba(212,255,58,0.55); }
          100% { box-shadow: 0 0 0 6px rgba(212,255,58,0); }
        }
        @media (max-width: 980px) {
          .ag-main { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 640px) {
          .ag-main { padding: 0 16px 40px !important; }
        }
      `}</style>
    </div>
  );
}

// ── Field input ──
function FieldInput({
  icon,
  label,
  hint,
  placeholder,
  type = "text",
  value,
  onChange,
  autoComplete,
  required,
  right,
}: {
  icon?: React.ReactNode;
  label: string;
  hint?: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <label
        style={{
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: 1.8,
          color: DIM,
          textTransform: "uppercase",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>
          {label}{" "}
          {required && (
            <span style={{ color: ACCENT, fontWeight: 700 }}>*</span>
          )}
        </span>
        {hint && <span style={{ color: DIMMER, fontSize: 9 }}>{hint}</span>}
      </label>
      <div
        style={{ position: "relative", display: "flex", alignItems: "center" }}
      >
        {icon && (
          <span
            style={{
              position: "absolute",
              left: 14,
              color: DIM,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            {icon}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          style={{
            width: "100%",
            padding: "13px 14px",
            paddingLeft: icon ? 40 : 14,
            paddingRight: right ? 60 : 14,
            borderRadius: 11,
            border: `1px solid ${LINE2}`,
            background: BG,
            color: INK,
            fontSize: 14,
            fontFamily: "inherit",
            outline: "none",
            letterSpacing: -0.1,
            transition: "border-color 0.15s, background 0.15s",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = `${ACCENT}73`;
            e.currentTarget.style.background = `${ACCENT}06`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = LINE2;
            e.currentTarget.style.background = BG;
          }}
        />
        {right && (
          <span style={{ position: "absolute", right: 10 }}>{right}</span>
        )}
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h16c1 0 2 1 2 2v12c0 1-1 2-2 2H4c-1 0-2-1-2-2V6c0-1 1-2 2-2z" />
      <polyline points="22 6 12 13 2 6" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

export default function CheckoutAccountPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100dvh",
            background: BG,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              border: `2px solid ${ACCENT}`,
              borderTopColor: "transparent",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      }
    >
      <AccountGateContent />
    </Suspense>
  );
}
