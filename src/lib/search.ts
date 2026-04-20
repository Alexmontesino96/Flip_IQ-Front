const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://flip-iq-fastapi.onrender.com";

export interface ProductSuggestion {
  id: number | null;
  title: string;
  brand: string | null;
  category: string | null;
  image_url: string | null;
  barcode: string | null;
  price_hint: number | null;
  search_count: number;
}

export interface ProductSuggestResponse {
  source: "local" | "hybrid" | "local_only" | string;
  results: ProductSuggestion[];
}

export async function fetchProductSuggestions(
  query: string,
  limit = 8,
  signal?: AbortSignal
): Promise<ProductSuggestResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
  });

  const res = await fetch(`${API_URL}/api/v1/search/suggest?${params}`, {
    signal,
  });

  if (!res.ok) {
    throw new Error(`Suggestion request failed with ${res.status}`);
  }

  return res.json();
}

export async function registerSuggestionSelect(productId: number) {
  await fetch(`${API_URL}/api/v1/search/suggest/${productId}/select`, {
    method: "POST",
  });
}
