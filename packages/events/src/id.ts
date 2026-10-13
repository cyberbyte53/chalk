/**
 * A random id. `crypto.randomUUID` only exists on secure pages (https or localhost),
 * so on a phone opening the dev server over the network we fall back to random bytes.
 */
export function makeId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
