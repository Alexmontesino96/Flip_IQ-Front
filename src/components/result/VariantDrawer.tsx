import { useEffect, useState } from "react";
import { MONO, DISPLAY, ACCENT, WARN } from "@/components/ui/theme";
import {
  fetchVariantPrices,
  type CandidateAsin,
  type VariantPrice,
} from "@/lib/analysis";

const fmt = (n: number, decimals = 2) =>
  n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/**
 * Bottom-sheet para elegir la variante correcta cuando un UPC resuelve a varios
 * ASINs. Carga los precios de forma lazy (POST /variant-prices) al abrir, y al
 * confirmar dispara onSelect(asin) → el caller re-analiza por ASIN directo.
 */
export default function VariantDrawer({
  variants,
  costPrice,
  reanalyzing,
  error,
  onSelect,
  onClose,
}: {
  variants: CandidateAsin[];
  costPrice: number;
  reanalyzing: boolean;
  error?: string | null;
  onSelect: (asin: string) => void;
  onClose: () => void;
}) {
  const [prices, setPrices] = useState<Record<string, VariantPrice>>({});
  const [pricesLoading, setPricesLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    // pricesLoading ya inicia en true; el drawer se monta fresco al abrir.
    let cancelled = false;
    fetchVariantPrices(variants.map((v) => v.asin))
      .then((list) => {
        if (cancelled) return;
        const map: Record<string, VariantPrice> = {};
        for (const p of list) map[p.asin] = p;
        setPrices(map);
      })
      .catch(() => {
        /* sin precios: el drawer sigue usable solo con título/marca/imagen */
      })
      .finally(() => {
        if (!cancelled) setPricesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [variants]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose variant"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "85vh",
          background: "#0E0E0E",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          border: "1px solid rgba(245,245,242,0.08)",
          borderBottom: "none",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Grab handle */}
        <div
          style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 999,
              background: "rgba(245,245,242,0.2)",
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            padding: "14px 20px 12px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 18,
                fontWeight: 700,
                color: "#F5F5F2",
                letterSpacing: -0.3,
              }}
            >
              Choose the variant
            </div>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 13,
                color: "rgba(245,245,242,0.55)",
                marginTop: 2,
              }}
            >
              {variants.length} products share this barcode
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              border: "1px solid rgba(245,245,242,0.12)",
              background: "transparent",
              color: "#F5F5F2",
              fontSize: 16,
              cursor: "pointer",
              flexShrink: 0,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Lista de variantes */}
        <div
          style={{
            padding: "0 20px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            flex: 1,
          }}
        >
          {variants.map((v) => {
            const price = prices[v.asin];
            const unitPrice = price?.medianPrice ?? price?.buyBoxPrice ?? null;
            const spread = unitPrice != null ? unitPrice - costPrice : null;
            const isSel = selected === v.asin;
            return (
              <button
                key={v.asin}
                onClick={() => setSelected(v.asin)}
                aria-pressed={isSel}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: 12,
                  borderRadius: 14,
                  border: isSel
                    ? `1.5px solid ${ACCENT}`
                    : "1px solid rgba(245,245,242,0.08)",
                  background: isSel
                    ? "rgba(212,255,61,0.06)"
                    : "rgba(245,245,242,0.03)",
                  cursor: "pointer",
                  textAlign: "left",
                  alignItems: "center",
                }}
              >
                {/* Imagen */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 10,
                    background: "rgba(245,245,242,0.06)",
                    flexShrink: 0,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {v.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={v.imageUrl}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: 22 }}>📦</span>
                  )}
                </div>

                {/* Texto */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#F5F5F2",
                      lineHeight: 1.3,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {v.title || v.asin}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 4,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        color: "rgba(245,245,242,0.5)",
                      }}
                    >
                      {v.brand || "—"}
                      {v.packageQuantity ? ` · ${v.packageQuantity} ud` : ""}
                    </span>
                    {v.isMultipack && (
                      <span
                        style={{
                          fontFamily: MONO,
                          fontSize: 9,
                          letterSpacing: 0.5,
                          textTransform: "uppercase",
                          color: WARN,
                        }}
                      >
                        ⚠ multipack
                      </span>
                    )}
                  </div>
                  {/* Precio + margen */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 8,
                      marginTop: 6,
                    }}
                  >
                    {pricesLoading ? (
                      <span
                        style={{
                          fontFamily: MONO,
                          fontSize: 11,
                          color: "rgba(245,245,242,0.3)",
                        }}
                      >
                        loading price…
                      </span>
                    ) : unitPrice != null ? (
                      <>
                        <span
                          style={{
                            fontFamily: DISPLAY,
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#F5F5F2",
                          }}
                        >
                          ${fmt(unitPrice)}
                        </span>
                        {spread != null && (
                          <span
                            style={{
                              fontFamily: MONO,
                              fontSize: 11,
                              color: spread >= 0 ? ACCENT : "#FF6464",
                            }}
                          >
                            {spread >= 0 ? "+" : "-"}${fmt(Math.abs(spread))}{" "}
                            before fees
                          </span>
                        )}
                      </>
                    ) : (
                      <span
                        style={{
                          fontFamily: MONO,
                          fontSize: 11,
                          color: "rgba(245,245,242,0.3)",
                        }}
                      >
                        no price
                      </span>
                    )}
                  </div>
                </div>

                {/* Check */}
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    border: isSel
                      ? `1.5px solid ${ACCENT}`
                      : "1.5px solid rgba(245,245,242,0.2)",
                    background: isSel ? ACCENT : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: "#0A0A0A",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {isSel ? "✓" : ""}
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ padding: "14px 20px 22px" }}>
          {error && (
            <div
              role="alert"
              style={{
                marginBottom: 10,
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(255,100,100,0.08)",
                border: "1px solid rgba(255,100,100,0.22)",
                fontFamily: DISPLAY,
                fontSize: 12,
                lineHeight: 1.4,
                color: "#FFB8B8",
              }}
            >
              {error}
            </div>
          )}
          <button
            onClick={() => selected && onSelect(selected)}
            disabled={!selected || reanalyzing}
            style={{
              width: "100%",
              height: 50,
              borderRadius: 14,
              border: "none",
              background: selected ? ACCENT : "rgba(245,245,242,0.08)",
              color: selected ? "#0A0A0A" : "rgba(245,245,242,0.4)",
              fontFamily: DISPLAY,
              fontSize: 15,
              fontWeight: 700,
              cursor: selected && !reanalyzing ? "pointer" : "default",
              letterSpacing: -0.2,
              opacity: reanalyzing ? 0.6 : 1,
            }}
          >
            {reanalyzing ? "Analyzing…" : "Analyze chosen variant →"}
          </button>
        </div>
      </div>
    </div>
  );
}
