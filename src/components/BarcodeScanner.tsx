"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({
  onScan,
  onClose,
}: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const onScanRef = useRef(onScan);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);
  const reactId = useId();
  const containerId = "barcode-reader-" + reactId.replace(/:/g, "");

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId, {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.ITF,
      ],
      verbose: false,
    });
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: { width: 280, height: 180 },
          aspectRatio: 1,
        },
        (decodedText) => {
          scanner.stop().catch(() => {});
          onScanRef.current(decodedText);
        },
        () => {} // ignore scan failures (no match yet)
      )
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("Permission")) {
          setError(
            "Camera permission denied. Please allow camera access and try again."
          );
        } else {
          setError("Could not start camera: " + msg);
        }
      });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [containerId]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.92)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(255,255,255,0.1)",
          color: "#fff",
          fontSize: 20,
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

      {/* Camera viewport */}
      <div
        style={{
          width: 300,
          height: 300,
          borderRadius: 16,
          overflow: "hidden",
          border: "2px solid rgba(139,92,246,0.4)",
          background: "#000",
        }}
      >
        <div id={containerId} style={{ width: "100%", height: "100%" }} />
      </div>

      {error && (
        <div
          style={{
            marginTop: 20,
            padding: "12px 20px",
            borderRadius: 12,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#f87171",
            fontSize: 13,
            maxWidth: 320,
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={onClose}
        style={{
          marginTop: 20,
          padding: "10px 24px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "transparent",
          color: "#94a3b8",
          fontSize: 13,
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
