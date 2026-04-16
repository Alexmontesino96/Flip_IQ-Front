const STORAGE_KEY = "flipiq_usage";
const DAILY_LIMIT = 3;

interface UsageData {
  count: number;
  date: string;
  email: string | null;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function read(): UsageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { count: 0, date: today(), email: null };
}

function write(data: UsageData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getUsage(): UsageData {
  const data = read();
  if (data.date !== today()) {
    const reset = { count: 0, date: today(), email: data.email };
    write(reset);
    return reset;
  }
  return data;
}

export function incrementUsage(): void {
  const data = getUsage();
  data.count += 1;
  write(data);
}

export function setEmail(email: string): void {
  const data = getUsage();
  data.email = email;
  write(data);
}

export function canAnalyze(): {
  allowed: boolean;
  reason: "needs_email" | "limit_reached" | null;
} {
  const data = getUsage();
  // First analysis is always free
  if (data.count === 0) return { allowed: true, reason: null };
  // After first, need email
  if (!data.email) return { allowed: false, reason: "needs_email" };
  // Check daily limit
  if (data.count >= DAILY_LIMIT)
    return { allowed: false, reason: "limit_reached" };
  return { allowed: true, reason: null };
}

export { DAILY_LIMIT };
