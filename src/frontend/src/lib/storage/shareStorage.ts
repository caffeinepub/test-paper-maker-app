import type { Paper } from "../../state/mockData";
import { safeGetItem, safeSetItem } from "./safeStorage";

const SHARE_KEY_PREFIX = "shared_paper_";

/**
 * Generates a short 8-char alphanumeric ID, saves the paper JSON to localStorage
 * under key `shared_paper_<id>`, and returns the generated ID.
 */
export function saveSharedPaper(paper: Paper): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }

  const key = `${SHARE_KEY_PREFIX}${id}`;
  try {
    safeSetItem(key, JSON.stringify(paper));
  } catch {
    // If storage fails, still return the ID — the view page will show a friendly error
  }

  return id;
}

/**
 * Reads and parses a shared paper from localStorage by its short ID.
 * Returns null if not found or if parsing fails.
 */
export function getSharedPaper(id: string): Paper | null {
  const key = `${SHARE_KEY_PREFIX}${id}`;
  const raw = safeGetItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Paper;
  } catch {
    return null;
  }
}
