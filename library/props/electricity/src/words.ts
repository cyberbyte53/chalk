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

/** A number to `digits` significant figures, in plain or ×10ⁿ form for very large or small. */
export function sig(value: number, digits = 3): string {
  if (value === 0) return "0";
  if (!Number.isFinite(value)) return "—";
  const exp = Math.floor(Math.log10(Math.abs(value)));
  if (exp >= -3 && exp < 6)
    return num(Number(value.toPrecision(digits)), Math.max(0, digits - 1 - exp));
  const mantissa = Number((value / 10 ** exp).toPrecision(digits));
  return `${mantissa} × 10${superscript(exp)}`;
}

const SUPER: Record<string, string> = {
  "-": "⁻",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};
export const superscript = (n: number): string =>
  String(n)
    .split("")
    .map((c) => SUPER[c] ?? c)
    .join("");

/** Amps in A, or in mA when small. */
export function amps(value: number): string {
  if (value > 0 && value < 0.1) return `${sig(value * 1000, 3)} mA`;
  return `${num(value, 2)} A`;
}

/** Ohms in Ω, kΩ or mΩ. */
export function ohms(value: number): string {
  if (value >= 10_000) return `${sig(value / 1000, 3)} kΩ`;
  if (value > 0 && value < 0.1) return `${sig(value * 1000, 3)} mΩ`;
  return `${sig(value, 3)} Ω`;
}
