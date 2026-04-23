"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fetchHistory, AnalysisHistoryItem } from "@/lib/history";
import { fetchBilling, BillingStatus } from "@/lib/usage";
import TopBar from "@/components/ui/TopBar";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";

type Rec = "buy" | "watch" | "pass" | "buy_small";

const STATUS_DOT_COLOR: Record<Rec, string> = {
  buy: ACCENT,
  buy_small: ACCENT,
  watch: "#FFB84D",
  pass: "rgba(245,245,242,0.4)",
};

const STATUS_LABEL: Record<Rec, string> = {
  buy: "BUY",
  buy_small: "BUY SMALL",
  watch: "WATCH",
  pass: "PASS",
};

function normalizeRec(rec: string | null): Rec {
  if (!rec) return "pass";
  const r = rec.toLowerCase();
  if (r === "buy") return "buy";
  if (r === "buy_small") return "buy_small";
  if (r === "watch") return "watch";
  return "pass";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

export default function HomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("there");
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisHistoryItem[]>(
    []
  );
  const [historyCount, setHistoryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState<BillingStatus | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserName(user.email.split("@")[0]);
      }
    });

    fetchHistory(20).then((items) => {
      setRecentAnalyses(items.slice(0, 3));
      setHistoryCount(items.length);
      setLoading(false);
    });

    fetchBilling().then((b) => {
      if (b) setBilling(b);
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const rightActions = (
    <div style={{ display: "flex", gap: 6 }}>
      <button
        onClick={() => router.push("/plans")}
        aria-label="Upgrade to PRO"
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          border: "1px solid rgba(245,245,242,0.12)",
          background: "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: 10,
            fontWeight: 600,
            color: "#F5F5F2",
            letterSpacing: 0.5,
          }}
        >
          PRO
        </span>
      </button>
      <button
        onClick={handleLogout}
        aria-label="Sign out"
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          border: "1px solid rgba(245,245,242,0.12)",
          background: "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#F5F5F2"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        color: "#F5F5F2",
        padding: "0 0 40px",
        maxWidth: 430,
        margin: "0 auto",
      }}
    >
      <TopBar showLogo accent={ACCENT} right={rightActions} />

      {/* Greeting */}
      <section aria-label="Greeting" style={{ padding: "24px 20px 32px" }}>
        <p
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: 2,
            color: "rgba(245,245,242,0.4)",
            textTransform: "uppercase",
            margin: "0 0 10px",
          }}
        >
          Good afternoon, {userName}
        </p>
        <h1
          style={{
            fontFamily: DISPLAY,
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: -1.2,
            lineHeight: 1.05,
            color: "#F5F5F2",
            margin: 0,
          }}
        >
          What are you flipping today?
        </h1>
      </section>

      {/* Scan usage */}
      {billing && (
        <section aria-label="Scan usage" style={{ padding: "0 20px 20px" }}>
          <div
            style={{
              padding: "16px 18px",
              borderRadius: 16,
              background: "rgba(245,245,242,0.03)",
              border: "1px solid rgba(245,245,242,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  color: "rgba(245,245,242,0.4)",
                }}
              >
                Scans today
              </span>
              <button
                onClick={() => router.push("/plans")}
                style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: ACCENT,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {billing.plan === "free"
                  ? "Upgrade →"
                  : billing.plan.toUpperCase()}
              </button>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 6,
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#F5F5F2",
                  letterSpacing: -1,
                }}
              >
                {billing.scans_remaining_today}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  color: "rgba(245,245,242,0.4)",
                }}
              >
                / {billing.daily_limit} remaining
              </span>
            </div>
            {/* Progress bar */}
            <div
              style={{
                height: 4,
                borderRadius: 2,
                background: "rgba(245,245,242,0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(100, (billing.scans_used_today / billing.daily_limit) * 100)}%`,
                  borderRadius: 2,
                  background:
                    billing.scans_remaining_today === 0
                      ? "#FF6464"
                      : billing.scans_remaining_today <= 2
                        ? "#FFB84D"
                        : ACCENT,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Action buttons */}
      <section
        aria-label="Main actions"
        style={{
          padding: "0 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <button
          onClick={() => router.push("/scan")}
          aria-label="Scan barcode"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: 20,
            borderRadius: 20,
            background: ACCENT,
            color: "#0A0A0A",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            width: "100%",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 6V3a1 1 0 011-1h3M20 6V3a1 1 0 00-1-1h-3M2 16v3a1 1 0 001 1h3M20 16v3a1 1 0 01-1 1h-3"
                stroke="#0A0A0A"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M6 7v8M10 7v8M14 7v8M18 7v8"
                stroke="#0A0A0A"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 17,
                fontWeight: 600,
                color: "#0A0A0A",
                marginBottom: 3,
              }}
            >
              Scan barcode
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                color: "rgba(0,0,0,0.55)",
              }}
            >
              UPC · EAN · ISBN
            </div>
          </div>
          <span
            style={{ fontFamily: DISPLAY, fontSize: 18, color: "#0A0A0A" }}
            aria-hidden="true"
          >
            →
          </span>
        </button>

        <button
          onClick={() => router.push("/search")}
          aria-label="Search product"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: 20,
            borderRadius: 20,
            background: "rgba(245,245,242,0.03)",
            color: "#F5F5F2",
            border: "1px solid rgba(245,245,242,0.1)",
            cursor: "pointer",
            textAlign: "left",
            width: "100%",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "rgba(245,245,242,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="9" cy="9" r="6" stroke="#F5F5F2" strokeWidth="1.8" />
              <path
                d="M14 14l4 4"
                stroke="#F5F5F2"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 17,
                fontWeight: 600,
                color: "#F5F5F2",
                marginBottom: 3,
              }}
            >
              Search product
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                color: "rgba(245,245,242,0.4)",
              }}
            >
              title, brand, model
            </div>
          </div>
          <span
            style={{
              fontFamily: DISPLAY,
              fontSize: 18,
              color: "rgba(245,245,242,0.4)",
            }}
            aria-hidden="true"
          >
            →
          </span>
        </button>
      </section>

      {/* Recent analyses */}
      <section aria-label="Recent analyses" style={{ padding: "32px 20px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: "rgba(245,245,242,0.4)",
              textTransform: "uppercase",
              letterSpacing: 1.5,
            }}
          >
            Recent Analyses
          </span>
          <button
            onClick={() => router.push("/history")}
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: ACCENT,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              letterSpacing: 0.5,
            }}
          >
            See all →
          </button>
        </div>

        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            borderTop: "1px solid rgba(245,245,242,0.07)",
          }}
        >
          {loading ? (
            <li
              style={{
                padding: "20px 0",
                textAlign: "center",
                fontFamily: MONO,
                fontSize: 11,
                color: "rgba(245,245,242,0.3)",
              }}
            >
              Loading...
            </li>
          ) : recentAnalyses.length === 0 ? (
            <li
              style={{
                padding: "20px 0",
                textAlign: "center",
                fontFamily: MONO,
                fontSize: 11,
                color: "rgba(245,245,242,0.3)",
              }}
            >
              No analyses yet — scan or search a product
            </li>
          ) : (
            recentAnalyses.map((item) => {
              const rec = normalizeRec(item.recommendation);
              const profit = item.net_profit ?? 0;
              return (
                <li
                  key={item.id}
                  style={{
                    borderBottom: "1px solid rgba(245,245,242,0.07)",
                  }}
                >
                  <button
                    onClick={() => router.push(`/result?id=${item.id}`)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "14px 0",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        background: STATUS_DOT_COLOR[rec],
                        flexShrink: 0,
                      }}
                      aria-hidden="true"
                    />
                    <span
                      style={{
                        fontFamily: DISPLAY,
                        fontSize: 15,
                        fontWeight: 500,
                        color: "#F5F5F2",
                        flex: 1,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.product_title}
                    </span>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        color: "rgba(245,245,242,0.4)",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        marginRight: 12,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {STATUS_LABEL[rec]} · {timeAgo(item.created_at)}
                    </span>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 14,
                        fontWeight: 600,
                        color: profit >= 0 ? ACCENT : "rgba(245,245,242,0.4)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {profit >= 0 ? "+" : ""}${Math.abs(profit).toFixed(0)}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </section>

      {/* Quick actions */}
      <section
        aria-label="Quick actions"
        style={{
          padding: "24px 20px 0",
          display: "flex",
          flexDirection: "row",
          gap: 12,
        }}
      >
        <button
          onClick={() => router.push("/watchlist")}
          aria-label="Open watchlist"
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 12,
            border: "1px solid rgba(245,245,242,0.1)",
            background: "transparent",
            cursor: "pointer",
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 9,
              color: "rgba(245,245,242,0.4)",
              textTransform: "uppercase",
              letterSpacing: 1.5,
            }}
          >
            Watchlist
          </span>
          <span
            style={{
              fontFamily: DISPLAY,
              fontSize: 22,
              fontWeight: 700,
              color: "#F5F5F2",
              lineHeight: 1,
            }}
          >
            —
          </span>
        </button>

        <button
          onClick={() => router.push("/history")}
          aria-label={`Open history, ${historyCount} analyses`}
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 12,
            border: "1px solid rgba(245,245,242,0.1)",
            background: "transparent",
            cursor: "pointer",
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 9,
              color: "rgba(245,245,242,0.4)",
              textTransform: "uppercase",
              letterSpacing: 1.5,
            }}
          >
            History
          </span>
          <span
            style={{
              fontFamily: DISPLAY,
              fontSize: 22,
              fontWeight: 700,
              color: "#F5F5F2",
              lineHeight: 1,
            }}
          >
            {historyCount}
          </span>
        </button>
      </section>
    </div>
  );
}
