import { API_URL, getAuthHeaders } from "./api";

export interface Watchlist {
  id: number;
  name: string;
  created_at: string;
}

export interface WatchlistItem {
  id: number;
  watchlist_id: number;
  product_id: number | null;
  product_title: string;
  target_price: number | null;
  current_price: number | null;
  cost_price: number | null;
  last_analysis_id: number | null;
  recommendation: string | null;
  flip_score: number | null;
  net_profit: number | null;
  created_at: string;
}

export async function fetchWatchlists(): Promise<Watchlist[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/api/v1/watchlists/`, {
    credentials: "include",
    headers,
  });
  if (!res.ok) return [];
  return res.json();
}

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

export async function fetchWatchlistItems(
  watchlistId: number
): Promise<WatchlistItem[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/api/v1/watchlists/${watchlistId}/items`, {
    credentials: "include",
    headers,
  });
  if (!res.ok) return [];
  return res.json();
}

export async function addWatchlistItem(
  watchlistId: number,
  item: {
    product_title: string;
    product_id?: number | null;
    target_price?: number | null;
    cost_price?: number | null;
    last_analysis_id?: number | null;
  }
): Promise<WatchlistItem | null> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/api/v1/watchlists/${watchlistId}/items`, {
    method: "POST",
    credentials: "include",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  if (!res.ok) return null;
  return res.json();
}

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
