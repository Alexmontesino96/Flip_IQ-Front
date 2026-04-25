import Link from "next/link";
import { ACCENT, DISPLAY, MONO } from "@/components/ui/theme";

type ContentSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type StaticContentPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: ContentSection[];
};

export default function StaticContentPage({
  eyebrow,
  title,
  intro,
  sections,
}: StaticContentPageProps) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        color: "#F5F5F2",
        padding: "32px 20px 72px",
      }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            marginBottom: 40,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              color: "#F5F5F2",
              textDecoration: "none",
            }}
          >
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: 12,
                background: ACCENT,
                color: "#0A0A0A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: DISPLAY,
                fontWeight: 800,
                fontSize: 16,
              }}
            >
              F
            </span>
            <span
              style={{
                fontFamily: DISPLAY,
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: -0.4,
              }}
            >
              Flip<span style={{ color: ACCENT }}>IQ</span>
            </span>
          </Link>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link
              href="/free"
              style={{
                padding: "11px 16px",
                borderRadius: 999,
                textDecoration: "none",
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                background: ACCENT,
                color: "#0A0A0A",
              }}
            >
              Open The Calculator
            </Link>
            <Link
              href="/"
              style={{
                padding: "11px 16px",
                borderRadius: 999,
                textDecoration: "none",
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                border: "1px solid rgba(245,245,242,0.12)",
                color: "#F5F5F2",
              }}
            >
              Back To Home
            </Link>
          </div>
        </div>

        <header style={{ marginBottom: 44 }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "rgba(245,245,242,0.45)",
              marginBottom: 16,
            }}
          >
            {eyebrow}
          </div>
          <h1
            style={{
              fontFamily: DISPLAY,
              fontSize: "clamp(36px, 6vw, 64px)",
              lineHeight: 1.02,
              letterSpacing: -2,
              fontWeight: 800,
              margin: "0 0 18px",
              maxWidth: 780,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: 720,
              fontSize: 18,
              lineHeight: 1.65,
              color: "rgba(245,245,242,0.68)",
            }}
          >
            {intro}
          </p>
        </header>

        <div
          style={{
            display: "grid",
            gap: 18,
          }}
        >
          {sections.map((section) => (
            <section
              key={section.title}
              style={{
                background: "rgba(245,245,242,0.03)",
                border: "1px solid rgba(245,245,242,0.08)",
                borderRadius: 20,
                padding: "24px 24px 22px",
              }}
            >
              <h2
                style={{
                  margin: "0 0 14px",
                  fontFamily: DISPLAY,
                  fontSize: 24,
                  lineHeight: 1.15,
                  letterSpacing: -0.6,
                }}
              >
                {section.title}
              </h2>
              {section.paragraphs?.map((paragraph, index) => (
                <p
                  key={index}
                  style={{
                    margin:
                      index === section.paragraphs!.length - 1 ? 0 : "0 0 14px",
                    fontSize: 16,
                    lineHeight: 1.7,
                    color: "rgba(245,245,242,0.72)",
                  }}
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul
                  style={{
                    margin: section.paragraphs?.length ? "16px 0 0" : 0,
                    paddingLeft: 20,
                    color: "rgba(245,245,242,0.72)",
                    fontSize: 16,
                    lineHeight: 1.7,
                  }}
                >
                  {section.bullets.map((bullet) => (
                    <li key={bullet} style={{ marginBottom: 8 }}>
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
