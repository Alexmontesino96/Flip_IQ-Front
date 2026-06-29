import { MONO, DISPLAY, WARN, BAD } from "@/components/ui/theme";
import type { MultipackInfo } from "@/lib/analysis";

const REASON_LABEL: Record<NonNullable<MultipackInfo["reason"]>, string> = {
  title_bundle: "detected in title",
  package_quantity: "package data",
  fee_ratio: "fee ratio",
};

const fmt = (n: number, decimals = 2) =>
  n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const fmtSignedCurrency = (n: number) =>
  `${n >= 0 ? "+" : "-"}$${fmt(Math.abs(n))}`;

/**
 * Aviso no bloqueante de multipack. El ROI nominal NUNCA se toca; este banner
 * solo añade el contexto del ROI "real" cuando se compra el pack completo.
 */
export default function MultipackBanner({
  multipack,
  nominalRoi,
  nominalProfit,
}: {
  multipack: MultipackInfo;
  nominalRoi: number;
  nominalProfit: number;
}) {
  const { bundleFactor, correctedRoiPct, correctedProfit, reason } = multipack;
  const knowFactor = bundleFactor != null && correctedRoiPct != null;

  return (
    <section
      style={{ padding: "0 20px", marginBottom: 20 }}
      aria-label="Multipack warning"
    >
      <div
        style={{
          background: "rgba(255,184,77,0.08)",
          border: "1px solid rgba(255,184,77,0.22)",
          borderRadius: 14,
          padding: "16px 18px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: knowFactor ? 14 : 8,
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 9,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: WARN,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span aria-hidden="true">&#9888;</span>
            {knowFactor
              ? `Multipack · pack of ${bundleFactor}`
              : "Possible multipack"}
          </div>
          {reason && (
            <div
              style={{
                fontFamily: MONO,
                fontSize: 9,
                letterSpacing: 0.5,
                color: "rgba(255,184,77,0.65)",
              }}
            >
              {REASON_LABEL[reason]}
            </div>
          )}
        </div>

        {knowFactor ? (
          <>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 13,
                lineHeight: 1.4,
                color: "rgba(245,245,242,0.7)",
                marginBottom: 14,
              }}
            >
              Your cost is per unit. Real ROI if you buy the pack of{" "}
              {bundleFactor}:
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              {/* Corrected ROI — el valor "real" destacado */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 30,
                    fontWeight: 800,
                    color: WARN,
                    lineHeight: 1,
                    letterSpacing: -0.8,
                  }}
                >
                  {fmt(correctedRoiPct as number, 1)}%
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 9,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    color: "rgba(255,184,77,0.7)",
                  }}
                >
                  Real ROI
                </div>
              </div>

              {/* Nominal — atenuado y tachado */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  paddingBottom: 2,
                }}
              >
                <div
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 15,
                    fontWeight: 600,
                    color: "rgba(245,245,242,0.4)",
                    textDecoration: "line-through",
                    lineHeight: 1,
                  }}
                >
                  {fmt(nominalRoi, 1)}%
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 9,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    color: "rgba(245,245,242,0.35)",
                  }}
                >
                  Shown
                </div>
              </div>

              {correctedProfit != null && (
                <div
                  style={{
                    marginLeft: "auto",
                    textAlign: "right",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    paddingBottom: 2,
                  }}
                >
                  <div
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: 15,
                      fontWeight: 700,
                      color: correctedProfit >= 0 ? "#F5F5F2" : BAD,
                      lineHeight: 1,
                    }}
                  >
                    {fmtSignedCurrency(correctedProfit)}
                  </div>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 9,
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      color: "rgba(245,245,242,0.35)",
                    }}
                  >
                    Real profit
                  </div>
                </div>
              )}
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                color: "rgba(245,245,242,0.35)",
                marginTop: 12,
              }}
            >
              Nominal profit {fmtSignedCurrency(nominalProfit)} assumes 1 unit.
            </div>
          </>
        ) : (
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 13,
              lineHeight: 1.45,
              color: "rgba(245,245,242,0.7)",
            }}
          >
            This listing could be a multipack while your cost looks per-unit.
            The ROI shown may be inflated — verify the package size before
            buying.
          </div>
        )}
      </div>
    </section>
  );
}
