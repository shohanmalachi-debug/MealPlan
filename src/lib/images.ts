import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CACHE_PATH = join(process.cwd(), "data", "image-cache.json");
const PLACEHOLDER = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=60";
const CACHE_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

interface CacheEntry {
  url: string;
  source: "unsplash" | "pexels" | "placeholder";
  fetchedAt: number;
}

function readCache(): Record<string, CacheEntry> {
  if (!existsSync(CACHE_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CACHE_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function writeCache(cache: Record<string, CacheEntry>) {
  try {
    writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
  } catch {
    // best-effort cache; ignore write failures (e.g. read-only fs)
  }
}

async function fetchFromUnsplash(query: string): Promise<string | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1`,
      { headers: { Authorization: `Client-ID ${key}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.results?.[0]?.urls?.regular ?? null;
  } catch {
    return null;
  }
}

async function fetchFromPexels(query: string): Promise<string | null> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
      { headers: { Authorization: key } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.photos?.[0]?.src?.large ?? null;
  } catch {
    return null;
  }
}

export async function getRecipeImageUrl(recipeId: string, imageQuery: string): Promise<string> {
  const cache = readCache();
  const entry = cache[recipeId];
  if (entry && Date.now() - entry.fetchedAt < CACHE_TTL_MS) {
    return entry.url;
  }

  let url = await fetchFromUnsplash(imageQuery);
  let source: CacheEntry["source"] = "unsplash";

  if (!url) {
    url = await fetchFromPexels(imageQuery);
    source = "pexels";
  }

  if (!url) {
    url = PLACEHOLDER;
    source = "placeholder";
  }

  cache[recipeId] = { url, source, fetchedAt: Date.now() };
  writeCache(cache);
  return url;
}
