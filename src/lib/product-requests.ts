import { API_URL, getAuthHeaders } from "./api";
import { createClient } from "./supabase/client";

export interface ProductDetails {
  product_name?: string;
  product_category?: string;
  image_url?: string;
}

/**
 * Submit product details to an existing manual review request.
 * The review is auto-created by the backend when no comps are found.
 */
export async function submitProductDetails(
  analysisId: number,
  details: ProductDetails
): Promise<boolean> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(
      `${API_URL}/api/v1/analysis/manual-reviews/${analysisId}/details`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(details),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Upload a product image to Supabase Storage and return the public URL.
 */
export async function uploadProductImage(
  reviewId: string,
  file: File
): Promise<string | null> {
  try {
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `reviews/${reviewId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("product-photos")
      .upload(path, file, { upsert: true });

    if (error) return null;

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-photos").getPublicUrl(path);

    return publicUrl;
  } catch {
    return null;
  }
}

export function buildSupportMailto(upc: string): string {
  const subject = encodeURIComponent(`UPC Request: ${upc}`);
  const body = encodeURIComponent(
    `Hi FlipIQ team,\n\nI scanned a product with UPC/EAN: ${upc}\n\nIt wasn't found in your database. Could you add it for analysis?\n\nThank you.`
  );
  return `mailto:support@getflipiq.com?subject=${subject}&body=${body}`;
}
