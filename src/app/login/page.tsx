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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    router.push("/home");
    router.refresh();
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
      {/* Center section */}
      <section
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
        aria-label="Login form"
      >
        {/* Logo + branding */}
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
            Decide before you buy.
          </p>
        </div>

        {/* Inputs */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: 28 }}
          role="group"
          aria-label="Credentials"
        >
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
            autoComplete="current-password"
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
      </section>

      {/* Bottom section */}
      <section
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
        aria-label="Actions"
      >
        <BigBtn onClick={handleLogin} style={{ opacity: loading ? 0.6 : 1 }}>
          {loading ? "Signing in..." : "Continue →"}
        </BigBtn>

        <p
          style={{
            fontFamily: DISPLAY,
            fontSize: 14,
            color: TEXT_DIM,
            textAlign: "center",
            margin: 0,
          }}
        >
          No account?{" "}
          <a
            href="/register"
            onClick={(e) => {
              e.preventDefault();
              router.push("/register");
            }}
            style={{
              color: ACCENT,
              textDecoration: "none",
              fontWeight: 600,
            }}
            aria-label="Create a new account"
          >
            Create account
          </a>
        </p>
      </section>
    </main>
  );
}
