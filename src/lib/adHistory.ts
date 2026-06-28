import type { AdType } from "../types/ad";

export interface SavedAdEntry {
  id: string;
  title: string;
  price: string;
  url: string;
  type: AdType;
  createdAt: number;
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

function writeAll(entries: SavedAdEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function listSavedAds(): SavedAdEntry[] {
  return readAll().sort((a, b) => b.createdAt - a.createdAt);
}

export function saveAdToHistory(entry: Omit<SavedAdEntry, "id" | "createdAt">): SavedAdEntry {
  const items = readAll();
  const duplicate = items.find((item) => item.url === entry.url);
  if (duplicate) {
    duplicate.title = entry.title;
    duplicate.price = entry.price;
    duplicate.type = entry.type;
    duplicate.createdAt = Date.now();
    writeAll(items);
    return duplicate;
  }

  const newEntry: SavedAdEntry = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    ...entry,
  };
  writeAll([newEntry, ...items]);
  return newEntry;
}

export function deleteSavedAd(id: string): void {
  writeAll(readAll().filter((item) => item.id !== id));
}

export function clearSavedAds(): void {
  localStorage.removeItem(STORAGE_KEY);
}
