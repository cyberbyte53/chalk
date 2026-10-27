/** Words a prop shows itself, in both languages. */
export type Words = { readonly en: string; readonly hi: string };

export const say = (locale: string, w: Words): string => (locale === "hi" ? w.hi : w.en);

/** 0, 1, …, n − 1. */
export const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i);

/** A number as people write it: at most `places` decimals, no trailing zeros, a real minus sign. */
export function num(x: number, places = 1): string {
  const r = Number(x.toFixed(places));
  const text = String(Object.is(r, -0) ? 0 : r);
  return text.replace("-", "−");
}

/** A power in dioptres with its sign: +3 D, −1.25 D, 0 D. */
export function dioptres(p: number, places = 2): string {
  const text = num(p, places);
  return p > 0.0001 ? `+${text}` : text;
}
