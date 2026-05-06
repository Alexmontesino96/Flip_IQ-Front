import { API_URL, getAuthHeaders } from "./api";

export async function submitProductRequest(
  upc: string,
  email: string,
  notes?: string
): Promise<boolean> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/v1/product-requests`, {
      method: "POST",
      credentials: "include",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ upc, email, notes }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function buildSupportMailto(upc: string): string {
  const subject = encodeURIComponent(`UPC Request: ${upc}`);
  const body = encodeURIComponent(
    `Hi FlipIQ team,\n\nI scanned a product with UPC/EAN: ${upc}\n\nIt wasn't found in your database. Could you add it for analysis?\n\nThank you.`
  );
  return `mailto:support@getflipiq.com?subject=${subject}&body=${body}`;
}
