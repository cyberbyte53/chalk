/** Words a prop shows itself, in both languages. */
export type Words = { readonly en: string; readonly hi: string };

export const say = (locale: string, w: Words): string => (locale === "hi" ? w.hi : w.en);

/** 0, 1, …, n − 1. */
export const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i);

/** Rounds to `places` decimals and drops trailing zeros: 0.50 → "0.5", 2.00 → "2". */
export function num(value: number, places = 2): string {
  if (!Number.isFinite(value)) return "—";
  const f = 10 ** places;
  const r = Math.round(value * f) / f;
  return String(Object.is(r, -0) ? 0 : r);
}

export const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));
