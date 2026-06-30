import type { AdType } from "../types/ad";

export interface SavedAdEntry {
  id: string;
  title: string;
  price: string;
  url: string;
  type: AdType;
  createdAt: number;
  /** Payload codificado na URL — snapshot local para decode offline */
  payload?: string;
}

const STORAGE_KEY = "anunciolink_my_ads";
const MAX_ENTRIES = 30;

function readAll(): SavedAdEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedAdEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: SavedAdEntry[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      try {
        const trimmed = entries.slice(0, Math.max(5, Math.floor(MAX_ENTRIES / 2)));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

export function listSavedAds(): SavedAdEntry[] {
  return readAll().sort((a, b) => b.createdAt - a.createdAt);
}

export function saveAdToHistory(entry: Omit<SavedAdEntry, "id" | "createdAt">): SavedAdEntry | null {
  const items = readAll();
  const duplicate = items.find((item) => item.url === entry.url);
  if (duplicate) {
    duplicate.title = entry.title;
    duplicate.price = entry.price;
    duplicate.type = entry.type;
    duplicate.createdAt = Date.now();
    if (entry.payload) duplicate.payload = entry.payload;
    if (!writeAll(items)) return null;
    return duplicate;
  }

  const newEntry: SavedAdEntry = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    ...entry,
  };
  if (!writeAll([newEntry, ...items])) return null;
  return newEntry;
}

export function deleteSavedAd(id: string): void {
  writeAll(readAll().filter((item) => item.id !== id));
}

export function clearSavedAds(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* quota ou modo privado */
  }
}
