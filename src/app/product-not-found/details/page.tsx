"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  submitProductDetails,
  uploadProductImage,
} from "@/lib/product-requests";
import { MONO, DISPLAY, ACCENT } from "@/components/ui/theme";
import Link from "next/link";

const BG = "#0A0A0A";
const INK = "#F5F5F2";
const DIM = "rgba(245,245,242,0.55)";
const DIMMER = "rgba(245,245,242,0.35)";
const LINE2 = "rgba(245,245,242,0.14)";

const CATEGORIES = [
  { slug: "electronics", label: "Electronics" },
  { slug: "video_games", label: "Video Games" },
  { slug: "toys", label: "Toys & Games" },
  { slug: "books", label: "Books" },
  { slug: "clothing", label: "Clothing" },
  { slug: "shoes", label: "Shoes" },
  { slug: "home_garden", label: "Home & Garden" },
  { slug: "sports", label: "Sports & Outdoors" },
  { slug: "beauty", label: "Beauty & Personal Care" },
  { slug: "collectibles", label: "Collectibles" },
  { slug: "automotive", label: "Automotive" },
  { slug: "other", label: "Other" },
];

function DetailsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const analysisId = params.get("analysis_id") || "";
  const upc = params.get("upc") || "";

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!analysisId) return;
    setSubmitting(true);
    setError(false);

    let imageUrl: string | null = null;
    if (imageFile) {
      imageUrl = await uploadProductImage(analysisId, imageFile);
    }

    const ok = await submitProductDetails(Number(analysisId), {
      product_name: productName || undefined,
      product_category: category || undefined,
      image_url: imageUrl || undefined,
    });

    setSubmitting(false);
    if (ok) {
      setSubmitted(true);
    } else {
      setError(true);
    }
  };

  const hasAnyInput = productName.trim() || category || imageFile;

  if (submitted) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: BG,
          color: INK,
          fontFamily: DISPLAY,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          maxWidth: 520,
          margin: "0 auto",
          padding: "40px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            background: ACCENT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 700,
            color: BG,
            marginBottom: 20,
          }}
        >
          ✓
        </div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: -0.5,
            margin: "0 0 8px",
          }}
        >
          Details received
        </h1>
        <p
          style={{
            fontSize: 14,
            color: DIM,
            lineHeight: 1.5,
            margin: "0 0 32px",
          }}
        >
          An analyst will review this product and deliver the full analysis
          within 24 hours. No charge.
        </p>
        <Link
          href="/home"
          replace
          style={{
            fontFamily: DISPLAY,
            fontSize: 14,
            fontWeight: 600,
            color: ACCENT,
            textDecoration: "none",
          }}
        >
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: BG,
        color: INK,
        fontFamily: DISPLAY,
        display: "flex",
        flexDirection: "column",
        maxWidth: 520,
        margin: "0 auto",
        padding: "40px 20px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Link
          href={`/product-not-found?upc=${encodeURIComponent(upc)}&analysis_id=${analysisId}`}
          style={{
            fontFamily: MONO,
            fontSize: 11,
            color: DIMMER,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            marginBottom: 16,
          }}
        >
          ← Back
        </Link>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: -0.5,
            margin: "0 0 6px",
          }}
        >
          Product details
        </h1>
        <p style={{ fontSize: 13, color: DIM, margin: 0, lineHeight: 1.5 }}>
          Help our analyst identify this product faster. All fields are
          optional.
        </p>
      </div>

      {/* Product name */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            fontFamily: MONO,
            fontSize: 9,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: DIM,
            display: "block",
            marginBottom: 8,
          }}
        >
          Product name
        </label>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="e.g. Nintendo Switch OLED"
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 11,
            border: `1px solid ${LINE2}`,
            background: "rgba(245,245,242,0.04)",
            color: INK,
            fontFamily: DISPLAY,
            fontSize: 15,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Category */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            fontFamily: MONO,
            fontSize: 9,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: DIM,
            display: "block",
            marginBottom: 8,
          }}
        >
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 11,
            border: `1px solid ${LINE2}`,
            background: "rgba(245,245,242,0.04)",
            color: category ? INK : DIMMER,
            fontFamily: DISPLAY,
            fontSize: 14,
            outline: "none",
            appearance: "none",
            boxSizing: "border-box",
          }}
        >
          <option value="" style={{ background: BG, color: DIMMER }}>
            Select a category...
          </option>
          {CATEGORIES.map((c) => (
            <option
              key={c.slug}
              value={c.slug}
              style={{ background: BG, color: INK }}
            >
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Photo */}
      <div style={{ marginBottom: 28 }}>
        <label
          style={{
            fontFamily: MONO,
            fontSize: 9,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: DIM,
            display: "block",
            marginBottom: 8,
          }}
        >
          Photo
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        {imagePreview ? (
          <div
            style={{
              position: "relative",
              borderRadius: 12,
              overflow: "hidden",
              border: `1px solid ${LINE2}`,
            }}
          >
            <img
              src={imagePreview}
              alt="Product"
              style={{
                width: "100%",
                maxHeight: 240,
                objectFit: "cover",
                display: "block",
              }}
            />
            <button
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: 28,
                height: 28,
                borderRadius: 14,
                background: "rgba(0,0,0,0.7)",
                color: INK,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              width: "100%",
              padding: "28px 16px",
              borderRadius: 12,
              border: `1.5px dashed ${LINE2}`,
              background: "transparent",
              color: DIM,
              fontFamily: DISPLAY,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span>Tap to take a photo or choose from gallery</span>
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: 14,
            borderRadius: 10,
            background: "rgba(255,100,100,0.1)",
            border: "1px solid rgba(255,100,100,0.3)",
            color: "#FF6464",
            fontSize: 13,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Something went wrong. Please try again.
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!hasAnyInput || submitting}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: 14,
          border: "none",
          background:
            hasAnyInput && !submitting ? ACCENT : "rgba(245,245,242,0.06)",
          color: hasAnyInput && !submitting ? BG : DIMMER,
          fontFamily: DISPLAY,
          fontSize: 15,
          fontWeight: 700,
          cursor: hasAnyInput && !submitting ? "pointer" : "default",
          opacity: submitting ? 0.6 : 1,
        }}
      >
        {submitting ? "Submitting..." : "Submit details →"}
      </button>
    </div>
  );
}

export default function ProductDetailsPage() {
  return (
    <Suspense
      fallback={<div style={{ minHeight: "100dvh", background: "#0A0A0A" }} />}
    >
      <DetailsContent />
    </Suspense>
  );
}
