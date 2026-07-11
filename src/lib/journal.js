// ── Season tagging ──────────────────────────────────────────
// The one quiet nod to the larger "life almanac" vision without
// building any of it. Northern-hemisphere meteorological seasons.
const SEASONS = [
  { name: "winter", months: [12, 1, 2] },
  { name: "spring", months: [3, 4, 5] },
  { name: "summer", months: [6, 7, 8] },
  { name: "autumn", months: [9, 10, 11] },
];

export function currentSeason(date = new Date()) {
  const m = date.getMonth() + 1;
  return SEASONS.find((s) => s.months.includes(m))?.name ?? "spring";
}

export function formatEntryDate(date = new Date()) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Light history (localStorage) ────────────────────────────
// Deliberately minimal: this is a reflective companion, not an archive.
const STORAGE_KEY = "kagami.entries.v1";

export function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEntry(entry) {
  const entries = loadEntries();
  const next = [entry, ...entries].slice(0, 30); // keep it light
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // If storage is unavailable, the app still works for the session.
  }
  return next;
}
