"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LogoMark from "@/components/ui/LogoMark";
import BigBtn from "@/components/ui/BigBtn";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";

const TEXT = "#F5F5F2";
const TEXT_DIM = "rgba(245,245,242,0.5)";
const TEXT_LABEL = "rgba(245,245,242,0.4)";
const BORDER_SUBTLE = "rgba(245,245,242,0.12)";

interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"];
}

function InputField({
  label,
  type,
  value,
  onChange,
  autoComplete,
  inputMode,
}: InputFieldProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        borderBottom: `1px solid ${BORDER_SUBTLE}`,
        paddingBottom: 10,
      }}
    >
      <label
        style={{
          fontFamily: MONO,
          fontSize: 9,
          letterSpacing: 2,
          color: TEXT_LABEL,
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        style={{
          border: "none",
          background: "transparent",
          color: TEXT,
          fontFamily: DISPLAY,
          fontSize: 17,
          outline: "none",
          padding: 0,
          width: "100%",
        }}
        aria-label={label}
      />
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !email || !password) return;
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: `${firstName} ${lastName}`.trim(),
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setSuccess(true);
  };

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#0A0A0A",
        display: "flex",
        flexDirection: "column",
        padding: "40px 28px 32px",
        maxWidth: 430,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <section
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 48,
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <LogoMark size={40} color={ACCENT} />
          </div>
          <h1
            style={{
              fontFamily: DISPLAY,
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: -1.5,
              color: TEXT,
              margin: 0,
              lineHeight: 1,
            }}
          >
            FlipIQ
          </h1>
          <p
            style={{
              fontFamily: DISPLAY,
              fontSize: 16,
              color: TEXT_DIM,
              margin: "10px 0 0",
            }}
          >
            Create your account
          </p>
        </div>

        {success ? (
          <div
            style={{
              padding: 20,
              borderRadius: 16,
              background: "rgba(212,255,61,0.08)",
              border: "1px solid rgba(212,255,61,0.2)",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: DISPLAY,
                fontSize: 15,
                color: ACCENT,
                fontWeight: 600,
                margin: "0 0 6px",
              }}
            >
              Check your email
            </p>
            <p
              style={{
                fontFamily: DISPLAY,
                fontSize: 13,
                color: TEXT_DIM,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              We sent a confirmation link to {email}
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: 28 }}
            role="group"
            aria-label="Registration"
          >
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <InputField
                  label="First name"
                  type="text"
                  value={firstName}
                  onChange={setFirstName}
                  autoComplete="given-name"
                />
              </div>
              <div style={{ flex: 1 }}>
                <InputField
                  label="Last name"
                  type="text"
                  value={lastName}
                  onChange={setLastName}
                  autoComplete="family-name"
                />
              </div>
            </div>
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              inputMode="email"
            />
            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
            />
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
          </div>
        )}
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {!success && (
          <>
            <BigBtn
              onClick={handleRegister}
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Creating account..." : "Create account →"}
            </BigBtn>

            {/* Separator */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(245,245,242,0.12)",
                }}
              />
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  letterSpacing: 1.5,
                  color: "rgba(245,245,242,0.4)",
                  textTransform: "uppercase",
                }}
              >
                or
              </span>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(245,245,242,0.12)",
                }}
              />
            </div>

            {/* Sign up with Apple */}
            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signInWithOAuth({
                  provider: "apple",
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                  },
                });
              }}
              style={{
                width: "100%",
                padding: "14px 20px",
                borderRadius: 14,
                border: "1px solid rgba(245,245,242,0.12)",
                background: "transparent",
                color: "#F5F5F2",
                fontFamily: DISPLAY,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#F5F5F2">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Continue with Apple
            </button>
          </>
        )}

        <p
          style={{
            fontFamily: DISPLAY,
            fontSize: 14,
            color: TEXT_DIM,
            textAlign: "center",
            margin: 0,
          }}
        >
          Already have an account?{" "}
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              router.push("/login");
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
      </section>
    </main>
  );
}
