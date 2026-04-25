"use client";

import { useState, Suspense, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";

/* ── colour tokens ── */
const BG = "#0A0A0A";
const INK = "#F5F5F2";
const DIM = "rgba(245,245,242,0.55)";
const DIMMER = "rgba(245,245,242,0.35)";
const LINE = "rgba(245,245,242,0.08)";
const LINE2 = "rgba(245,245,242,0.14)";

/* ── plan data ── */
const PLAN_INFO: Record<string, { name: string; price: string }> = {
  basic: { name: "Basic", price: "$9.99/mo" },
  premium: { name: "Premium", price: "$24.99/mo" },
};

/* ── password strength ── */
function getStrength(pw: string): number {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0-4
}

function strengthColor(level: number, idx: number): string {
  if (idx >= level) return LINE2;
  if (level <= 1) return "#FF5555";
  if (level <= 2) return "#FFB84D";
  return ACCENT;
}

function strengthLabel(level: number): string {
  if (level === 0) return "";
  if (level <= 1) return "Weak";
  if (level <= 2) return "Fair";
  if (level <= 3) return "Good";
  return "Strong";
}

/* ── step indicator pips ── */
function StepPips({ step }: { step: 1 | 2 }) {
  const states: ("done" | "active" | "pending")[] =
    step === 1
      ? ["active", "pending", "pending"]
      : ["done", "active", "pending"];

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        justifyContent: "center",
        marginBottom: 28,
      }}
    >
      {states.map((s, i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: s === "done" ? ACCENT : s === "active" ? INK : LINE2,
            transition: "background 0.3s",
          }}
        />
      ))}
    </div>
  );
}

/* ── plan pill ── */
function PlanPill({ name, price }: { name: string; price: string }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 16px",
        borderRadius: 100,
        border: `1px solid ${ACCENT}40`,
        background: `${ACCENT}10`,
        alignSelf: "center",
        marginBottom: 28,
      }}
    >
      <span
        style={{
          fontFamily: DISPLAY,
          fontSize: 13,
          fontWeight: 600,
          color: ACCENT,
        }}
      >
        {name}
      </span>
      <span style={{ fontFamily: MONO, fontSize: 12, color: DIM }}>
        {price}
      </span>
    </div>
  );
}

/* ── radio card ── */
function ChoiceCard({
  selected,
  onClick,
  title,
  subtitle,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 18px",
        borderRadius: 14,
        border: `1px solid ${selected ? ACCENT + "60" : LINE2}`,
        background: selected ? `${ACCENT}08` : "transparent",
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        transition: "all 0.2s",
      }}
    >
      {/* radio circle */}
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          border: `2px solid ${selected ? ACCENT : DIMMER}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "border-color 0.2s",
        }}
      >
        {selected && (
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: ACCENT,
            }}
          />
        )}
      </div>
      <div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 15,
            fontWeight: 600,
            color: INK,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 13,
            color: DIM,
            marginTop: 2,
          }}
        >
          {subtitle}
        </div>
      </div>
    </button>
  );
}

/* ── oauth button (non-functional) ── */
function OAuthBtn({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <button
      type="button"
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "12px 0",
        borderRadius: 11,
        border: `1px solid ${LINE2}`,
        background: "transparent",
        color: INK,
        fontFamily: DISPLAY,
        fontSize: 14,
        fontWeight: 500,
        cursor: "not-allowed",
        opacity: 0.5,
      }}
    >
      {icon}
      {label}
    </button>
  );
}

/* ── trust strip ── */
function TrustStrip() {
  return (
    <p
      style={{
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: 0.5,
        color: DIMMER,
        textAlign: "center",
        margin: 0,
        lineHeight: 1.6,
      }}
    >
      🔒 Stripe processes all payments · FlipIQ never sees your card
    </p>
  );
}

/* ── main content (needs searchParams) ── */
function AccountGateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planKey = searchParams.get("plan") ?? "basic";
  const plan = PLAN_INFO[planKey] ?? PLAN_INFO.basic;

  const [step, setStep] = useState<1 | 2>(1);
  const [choice, setChoice] = useState<"new" | "existing">("new");

  // form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = useMemo(() => getStrength(password), [password]);

  const handleContinue = useCallback(() => {
    if (choice === "existing") {
      router.push(`/login?redirect=/plans&plan=${planKey}`);
    } else {
      setStep(2);
    }
  }, [choice, planKey, router]);

  const handleSignup = useCallback(async () => {
    if (!firstName || !email || !password) return;
    if (!agreed) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: `${firstName} ${lastName}`.trim() },
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    // store plan so plans page can auto-select
    sessionStorage.setItem("selectedPlan", planKey);
    router.push(`/plans?plan=${planKey}`);
    router.refresh();
  }, [firstName, lastName, email, password, agreed, planKey, router]);

  const canSubmit = firstName && email && password.length >= 6 && agreed;

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: BG,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px 32px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <StepPips step={step} />

        {/* plan pill */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <PlanPill name={plan.name} price={plan.price} />
        </div>

        {/* card */}
        <div
          style={{
            borderRadius: 20,
            border: `1px solid ${LINE2}`,
            background: "#111111",
            padding: "32px 28px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* subtle lime gradient border glow */}
          <div
            style={{
              position: "absolute",
              inset: -1,
              borderRadius: 21,
              background: `linear-gradient(135deg, ${ACCENT}18, transparent 50%)`,
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            {step === 1 ? (
              /* ────── STEP 1 ────── */
              <>
                <h1
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 22,
                    fontWeight: 700,
                    color: INK,
                    margin: "0 0 6px",
                    letterSpacing: -0.5,
                  }}
                >
                  Create your account
                </h1>
                <p
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 14,
                    color: DIM,
                    margin: "0 0 24px",
                  }}
                >
                  One step away from your {plan.name} plan
                </p>

                {/* choice cards */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginBottom: 24,
                  }}
                >
                  <ChoiceCard
                    selected={choice === "new"}
                    onClick={() => setChoice("new")}
                    title="First time here"
                    subtitle="Create a new FlipIQ account"
                  />
                  <ChoiceCard
                    selected={choice === "existing"}
                    onClick={() => setChoice("existing")}
                    title="I have an account"
                    subtitle="Sign in to continue"
                  />
                </div>

                {/* separator */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    margin: "0 0 20px",
                  }}
                >
                  <div style={{ flex: 1, height: 1, background: LINE }} />
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      letterSpacing: 1,
                      color: DIMMER,
                      textTransform: "uppercase",
                    }}
                  >
                    or continue with
                  </span>
                  <div style={{ flex: 1, height: 1, background: LINE }} />
                </div>

                {/* OAuth buttons */}
                <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
                  <OAuthBtn
                    label="Google"
                    icon={
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                    }
                  />
                  <OAuthBtn
                    label="Apple"
                    icon={
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={INK}
                      >
                        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                      </svg>
                    }
                  />
                </div>

                {/* CTA */}
                <button
                  type="button"
                  onClick={handleContinue}
                  style={{
                    width: "100%",
                    padding: "15px 0",
                    borderRadius: 13,
                    border: "none",
                    background: ACCENT,
                    color: "#0A0A0A",
                    fontFamily: DISPLAY,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                    letterSpacing: -0.3,
                  }}
                >
                  Continue →
                </button>
              </>
            ) : (
              /* ────── STEP 2 ────── */
              <>
                {/* back button */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    background: "none",
                    border: "none",
                    color: DIM,
                    fontFamily: DISPLAY,
                    fontSize: 13,
                    cursor: "pointer",
                    padding: 0,
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  ← Back
                </button>

                <h1
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 22,
                    fontWeight: 700,
                    color: INK,
                    margin: "0 0 24px",
                    letterSpacing: -0.5,
                  }}
                >
                  Create your account
                </h1>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSignup();
                  }}
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {/* name row */}
                  <div style={{ display: "flex", gap: 10 }}>
                    <FormInput
                      icon="👤"
                      placeholder="First name"
                      value={firstName}
                      onChange={setFirstName}
                      autoComplete="given-name"
                    />
                    <FormInput
                      placeholder="Last name"
                      value={lastName}
                      onChange={setLastName}
                      autoComplete="family-name"
                    />
                  </div>

                  {/* email */}
                  <FormInput
                    icon="✉"
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    autoComplete="email"
                  />

                  {/* password */}
                  <div style={{ position: "relative" }}>
                    <FormInput
                      icon="🔑"
                      placeholder="Password (min 6 chars)"
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={setPassword}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      style={{
                        position: "absolute",
                        right: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: DIM,
                        fontSize: 13,
                        cursor: "pointer",
                        fontFamily: MONO,
                      }}
                    >
                      {showPw ? "HIDE" : "SHOW"}
                    </button>
                  </div>

                  {/* strength meter */}
                  {password && (
                    <div>
                      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              height: 3,
                              borderRadius: 2,
                              background: strengthColor(strength, i),
                              transition: "background 0.3s",
                            }}
                          />
                        ))}
                      </div>
                      <span
                        style={{
                          fontFamily: MONO,
                          fontSize: 10,
                          color: strengthColor(strength, 0),
                          letterSpacing: 0.5,
                        }}
                      >
                        {strengthLabel(strength)}
                      </span>
                    </div>
                  )}

                  {/* terms checkbox */}
                  <label
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      cursor: "pointer",
                      marginTop: 4,
                    }}
                  >
                    <div
                      onClick={() => setAgreed(!agreed)}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        border: `1.5px solid ${agreed ? ACCENT : DIMMER}`,
                        background: agreed ? ACCENT : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 1,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {agreed && (
                        <svg
                          width="11"
                          height="9"
                          viewBox="0 0 11 9"
                          fill="none"
                        >
                          <path
                            d="M1 4L4 7L10 1"
                            stroke="#0A0A0A"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      style={{
                        fontFamily: DISPLAY,
                        fontSize: 13,
                        color: DIM,
                        lineHeight: 1.4,
                      }}
                    >
                      I agree to the{" "}
                      <span style={{ color: INK, textDecoration: "underline" }}>
                        Terms of Service
                      </span>{" "}
                      and{" "}
                      <span style={{ color: INK, textDecoration: "underline" }}>
                        Privacy Policy
                      </span>
                    </span>
                  </label>

                  {error && (
                    <p
                      style={{
                        fontFamily: DISPLAY,
                        fontSize: 13,
                        color: "#FF6464",
                        margin: 0,
                      }}
                    >
                      {error}
                    </p>
                  )}

                  {/* CTA */}
                  <button
                    type="submit"
                    disabled={!canSubmit || loading}
                    style={{
                      width: "100%",
                      padding: "15px 0",
                      borderRadius: 13,
                      border: "none",
                      background: canSubmit ? ACCENT : `${ACCENT}40`,
                      color: "#0A0A0A",
                      fontFamily: DISPLAY,
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: canSubmit && !loading ? "pointer" : "not-allowed",
                      letterSpacing: -0.3,
                      opacity: loading ? 0.6 : 1,
                      transition: "all 0.2s",
                      marginTop: 4,
                    }}
                  >
                    {loading
                      ? "Creating account..."
                      : `Create account & apply ${plan.name} →`}
                  </button>
                </form>

                {/* sign-in link */}
                <p
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 13,
                    color: DIM,
                    textAlign: "center",
                    margin: "18px 0 0",
                  }}
                >
                  Already have an account?{" "}
                  <a
                    href={`/login?redirect=/plans&plan=${planKey}`}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/login?redirect=/plans&plan=${planKey}`);
                    }}
                    style={{
                      color: ACCENT,
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    Sign in
                  </a>
                </p>
              </>
            )}
          </div>
        </div>

        {/* trust strip */}
        <div style={{ marginTop: 20 }}>
          <TrustStrip />
        </div>
      </div>
    </main>
  );
}

/* ── form input component ── */
function FormInput({
  icon,
  placeholder,
  type = "text",
  value,
  onChange,
  autoComplete,
}: {
  icon?: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <div style={{ position: "relative", flex: 1 }}>
      {icon && (
        <span
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 14,
            pointerEvents: "none",
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
          borderRadius: 11,
          border: `1px solid ${LINE2}`,
          background: `${INK}06`,
          color: INK,
          fontFamily: DISPLAY,
          fontSize: 14,
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = `${ACCENT}50`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = LINE2;
        }}
      />
    </div>
  );
}

/* ── page wrapper with Suspense ── */
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
