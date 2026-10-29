/**
 * The kinds of address the preview (`?dev&…`, preview-shell.tsx) opens, in one list: the app sends
 * exactly these to it, so a kind can't be added to the preview and forgotten in the app's routing
 * (a question family's `source=` once opened the app's home screen).
 */
export const PREVIEW_KEYS = ["at", "source", "review", "reviews"] as const;

/** Whether this address is one the preview opens. */
export const isPreviewAddress = (query: URLSearchParams): boolean =>
  PREVIEW_KEYS.some((key) => query.has(key));
