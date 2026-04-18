"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

const CONTAINER_ID = "flipiq-barcode-reader";

export default function BarcodeScanner({
  onScan,
  onClose,
}: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const stoppedRef = useRef(false);
  const onScanRef = useRef(onScan);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    // Wait a tick for the DOM element to be ready
    const timeout = setTimeout(() => {
      const el = document.getElementById(CONTAINER_ID);
      if (!el || stoppedRef.current) return;

      const scanner = new Html5Qrcode(CONTAINER_ID, {
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

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
      };

      const onSuccess = (decodedText: string) => {
        if (stoppedRef.current) return;
        stoppedRef.current = true;
        // Stop scanner first, then notify parent
        scanner
          .stop()
          .catch(() => {})
          .finally(() => {
            onScanRef.current(decodedText);
          });
      };

      scanner
        .start({ facingMode: "environment" }, config, onSuccess, () => {})
        .then(() => {
          if (!stoppedRef.current) setStarting(false);
        })
        .catch(() => {
          if (stoppedRef.current) return;
          scanner
            .start({ facingMode: "user" }, config, onSuccess, () => {})
            .then(() => {
              if (!stoppedRef.current) setStarting(false);
            })
            .catch((err: unknown) => {
              if (stoppedRef.current) return;
              const msg = err instanceof Error ? err.message : String(err);
              setStarting(false);
              if (
                msg.includes("Permission") ||
                msg.includes("NotAllowedError")
              ) {
                setError(
                  "Camera permission denied. Please allow camera access in your browser settings and try again."
                );
              } else if (
                msg.includes("NotFoundError") ||
                msg.includes("no camera")
              ) {
                setError("No camera found on this device.");
              } else {
                setError("Could not start camera: " + msg);
              }
            });
        });
    }, 50);

    return () => {
      clearTimeout(timeout);
      stoppedRef.current = true;
      const s = scannerRef.current;
      if (s) {
        s.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

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
      <style>{`
        #${CONTAINER_ID} video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
        }
        #${CONTAINER_ID} img[alt="Info icon"] { display: none !important; }
      `}</style>

      {/* Close button */}
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
        {starting ? "Starting camera..." : "Point camera at barcode"}
      </div>

      {/* Camera viewport */}
      <div
        style={{
          width: "min(90vw, 360px)",
          height: "min(65vw, 300px)",
          borderRadius: 16,
          overflow: "hidden",
          border: "2px solid rgba(139,92,246,0.5)",
          background: "#000",
        }}
      >
        <div id={CONTAINER_ID} style={{ width: "100%", height: "100%" }} />
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
