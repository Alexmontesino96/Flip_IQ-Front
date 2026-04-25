import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FlipIQ";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background:
          "radial-gradient(circle at top left, rgba(212,255,58,0.16), transparent 34%), #0A0A0A",
        color: "#F5F5F2",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 32,
          borderRadius: 36,
          border: "1px solid rgba(245,245,242,0.12)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "40px 48px",
          background: "rgba(245,245,242,0.03)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "#D4FF3A",
              color: "#0A0A0A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
            }}
          >
            F
          </div>
          <div style={{ display: "flex" }}>
            Flip
            <span style={{ color: "#D4FF3A", marginLeft: 4 }}>IQ</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 68,
              lineHeight: 1.02,
              fontWeight: 800,
              letterSpacing: -2.5,
              maxWidth: 860,
            }}
          >
            Know if you&apos;ll actually sell before you buy
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.4,
              color: "rgba(245,245,242,0.72)",
              maxWidth: 850,
            }}
          >
            Analyze resale profit, execution risk, max buy price, and best
            marketplace across eBay and Amazon.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 14,
            fontSize: 22,
            color: "rgba(245,245,242,0.54)",
          }}
        >
          <span>eBay</span>
          <span>Amazon</span>
          <span>Execution Score</span>
          <span>Max Buy Price</span>
        </div>
      </div>
    </div>,
    size
  );
}
