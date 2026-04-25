"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";

function SuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = params.get("plan") || "basic";
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          router.push("/home");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0A0A0A",
        color: "#F5F5F2",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        textAlign: "center",
      }}
    >
      {/* Check circle */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: ACCENT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path
            d="M10 18l6 6 10-12"
            stroke="#0A0A0A"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: -1,
          marginBottom: 8,
        }}
      >
        You&apos;re on {plan.charAt(0).toUpperCase() + plan.slice(1)}!
      </div>

      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 15,
          color: "rgba(245,245,242,0.6)",
          marginBottom: 32,
          maxWidth: 300,
          lineHeight: 1.5,
        }}
      >
        Your upgraded limits are active now. Start scanning!
      </div>

      <button
        onClick={() => router.push("/home")}
        style={{
          padding: "16px 40px",
          borderRadius: 14,
          background: ACCENT,
          color: "#0A0A0A",
          border: "none",
          fontFamily: DISPLAY,
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          letterSpacing: -0.2,
          marginBottom: 16,
        }}
      >
        Go to dashboard →
      </button>

      <div
        style={{
          fontFamily: MONO,
          fontSize: 10,
          color: "rgba(245,245,242,0.3)",
        }}
      >
        Redirecting in {countdown}s...
      </div>
    </div>
  );
}

export default function PlanSuccessPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100dvh",
            background: "#0A0A0A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(245,245,242,0.3)",
            fontFamily: MONO,
            fontSize: 11,
          }}
        >
          Loading...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
