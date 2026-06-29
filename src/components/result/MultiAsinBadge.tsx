import { MONO, DISPLAY, ACCENT, BAD } from "@/components/ui/theme";

/**
 * Badge Multi-ASIN. Dos niveles de urgencia:
 *  - identityReview === false → el sistema eligió con confianza (informativo, sutil).
 *  - identityReview === true  → marcas en conflicto (destacado, rojo).
 * En ambos casos abre el VariantDrawer para ver / cambiar la variante.
 */
export default function MultiAsinBadge({
  count,
  identityReview,
  onOpen,
}: {
  count: number;
  identityReview: boolean;
  onOpen: () => void;
}) {
  if (identityReview) {
    return (
      <div
        style={{
          background: "rgba(255,100,100,0.08)",
          border: "1px solid rgba(255,100,100,0.25)",
          borderRadius: 14,
          padding: "16px 18px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 9,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: BAD,
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8,
          }}
        >
          <span aria-hidden="true">&#9888;</span>
          Conflicting variants
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 13,
            lineHeight: 1.45,
            color: "rgba(245,245,242,0.7)",
            marginBottom: 14,
          }}
        >
          This barcode maps to {count} variants, and brands may conflict. Pick
          the correct variant before buying.
        </div>
        <button
          onClick={onOpen}
          style={{
            width: "100%",
            height: 44,
            borderRadius: 12,
            border: "none",
            background: BAD,
            color: "#0A0A0A",
            fontFamily: DISPLAY,
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: -0.2,
          }}
        >
          Pick the right variant →
        </button>
      </div>
    );
  }

  // Informativo
  return (
    <button
      onClick={onOpen}
      aria-label={`${count} variants share this barcode - view or change`}
      style={{
        width: "100%",
        background: "rgba(245,245,242,0.04)",
        border: "1px solid rgba(245,245,242,0.1)",
        borderRadius: 12,
        padding: "12px 16px",
        marginBottom: 16,
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 15, lineHeight: 1 }}>
        &#9638;
      </span>
      <span
        style={{
          flex: 1,
          fontFamily: DISPLAY,
          fontSize: 13,
          fontWeight: 500,
          color: "rgba(245,245,242,0.75)",
        }}
      >
        {count} variants share this barcode
      </span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: ACCENT,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        View ›
      </span>
    </button>
  );
}
