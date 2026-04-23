import { API_URL, getAuthHeaders } from "./api";

export interface WatchlistItem {
  id: number;
  product_id: number;
  product_title: string | null;
  target_buy_price: number | null;
  notes: string | null;
  added_at: string;
}

export interface Watchlist {
  id: number;
  name: string;
  items: WatchlistItem[];
  created_at: string;
}

/** GET /api/v1/watchlists/ — returns all watchlists with items nested */
export async function fetchWatchlists(): Promise<Watchlist[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/api/v1/watchlists/`, {
    credentials: "include",
    headers,
  });
  if (!res.ok) return [];
  return res.json();
}

/** POST /api/v1/watchlists/ — create a new watchlist */
export async function createWatchlist(name: string): Promise<Watchlist | null> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/api/v1/watchlists/`, {
    method: "POST",
    credentials: "include",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) return null;
  return res.json();
}

/** POST /api/v1/watchlists/{id}/items — add item (product_id required) */
export async function addWatchlistItem(
  watchlistId: number,
  productId: number,
  targetBuyPrice?: number | null,
  notes?: string | null
): Promise<WatchlistItem | null> {
  const headers = await getAuthHeaders();
  const body: Record<string, unknown> = { product_id: productId };
  if (targetBuyPrice != null) body.target_buy_price = targetBuyPrice;
  if (notes != null) body.notes = notes;

  const res = await fetch(`${API_URL}/api/v1/watchlists/${watchlistId}/items`, {
    method: "POST",
    credentials: "include",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return res.json();
}

/** DELETE /api/v1/watchlists/{wl_id}/items/{item_id} */
export async function removeWatchlistItem(
  watchlistId: number,
  itemId: number
): Promise<boolean> {
  const headers = await getAuthHeaders();
  const res = await fetch(
    `${API_URL}/api/v1/watchlists/${watchlistId}/items/${itemId}`,
    {
      method: "DELETE",
      credentials: "include",
      headers,
    }
  );
  return res.ok;
}
