"use client";

import { useRef } from "react";
import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  /** Render inline (fills parent container) instead of fullscreen overlay */
  inline?: boolean;
}

export default function BarcodeScanner({
  onScan,
  onClose,
  inline = false,
}: BarcodeScannerProps) {
  const handledRef = useRef(false);

  const handleScan = (results: IDetectedBarcode[]) => {
    if (handledRef.current || results.length === 0) return;
    const code = results[0].rawValue;
    if (!code) return;
    handledRef.current = true;
    onScan(code);
  };

  const scannerEl = (
    <Scanner
      onScan={handleScan}
      formats={[
        "ean_13",
        "ean_8",
        "upc_a",
        "upc_e",
        "code_128",
        "code_39",
        "itf",
      ]}
      components={{ torch: false, finder: true, onOff: false, zoom: false }}
      styles={{
        container: { width: "100%", height: "100%" },
        video: { objectFit: "cover" },
      }}
    />
  );

  // Inline mode — fills parent container, no overlay
  if (inline) {
    return (
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        {scannerEl}
      </div>
    );
  }

  // Fullscreen overlay mode (original behavior)
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        zIndex: 99999,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.3)",
          background: "rgba(255,255,255,0.15)",
          color: "#fff",
          fontSize: 22,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
        aria-label="Close scanner"
      >
        &times;
      </button>

      <div
        style={{
          color: "#94a3b8",
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        Point camera at barcode
      </div>

      <div
        style={{
          width: "min(90vw, 360px)",
          height: "min(65vw, 300px)",
          borderRadius: 16,
          overflow: "hidden",
          border: "2px solid rgba(139,92,246,0.5)",
        }}
      >
        {scannerEl}
      </div>

      <button
        onClick={onClose}
        style={{
          marginTop: 20,
          padding: "12px 28px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(255,255,255,0.08)",
          color: "#94a3b8",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Cancel
      </button>
    </div>
  );
}
