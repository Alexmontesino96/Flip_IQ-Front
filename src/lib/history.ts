import { API_URL, getAuthHeaders } from "./api";

export interface AnalysisHistoryItem {
  id: number;
  product_id?: number | null;
  product_title: string;
  cost_price: number;
  net_profit: number | null;
  flip_score: number | null;
  recommendation: string | null;
  marketplace: string;
  created_at: string;
}

export async function fetchHistory(limit = 20): Promise<AnalysisHistoryItem[]> {
  const headers = await getAuthHeaders();

  const res = await fetch(`${API_URL}/api/v1/analysis/history?limit=${limit}`, {
    credentials: "include",
    headers,
  });

  if (!res.ok) return [];
  return res.json();
}

const RECENT_SEARCHES_KEY = "flipiq_recent_searches";
const MAX_RECENT = 10;

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string) {
  if (typeof window === "undefined") return;
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return;
  const current = getRecentSearches().filter((s) => s !== trimmed);
  current.unshift(trimmed);
  localStorage.setItem(
    RECENT_SEARCHES_KEY,
    JSON.stringify(current.slice(0, MAX_RECENT))
  );
}
