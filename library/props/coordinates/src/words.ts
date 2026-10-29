import type { Locale, Localized } from "@chalk/content";

/** The prop's own words on its buttons and lines, in both languages. A lesson's words are fields. */
export const WORDS = {
  walk: { en: "Walk", hi: "चलो" },
  back: { en: "Back to the start", hi: "शुरू पर वापस" },
  nextPoint: { en: "Next point", hi: "अगला बिंदु" },
  nameQuadrants: { en: "Name the quadrants", hi: "चतुर्थांशों के नाम" },
  bringTogether: { en: "Bring the zeroes together", hi: "दोनों शून्य मिलाओ" },
  show: { en: "Show", hi: "दिखाओ" },
  showPoint: { en: "Show the point", hi: "बिंदु दिखाओ" },
  clear: { en: "Clear", hi: "हटाओ" },
  throw: { en: "Throw", hi: "फेंको" },
  newGame: { en: "New game", hi: "नया खेल" },
  scale: { en: "A mark every", hi: "हर निशान" },
  along: { en: "along", hi: "आगे" },
  up: { en: "up", hi: "ऊपर" },
} satisfies Record<string, Localized>;

export const word = (w: Localized, locale: Locale): string => w[locale];

/** A place's address in the axes' words: "Street number 4, House number 3". */
export function addressOf(
  names: readonly [Localized, Localized],
  p: { x: number; y: number },
  locale: Locale,
): string {
  return `${names[0][locale]} ${p.x}, ${names[1][locale]} ${p.y}`;
}

/** A number as the book writes it: a true minus sign, and no trailing zeros. */
export const num = (v: number): string =>
  (Math.abs(v) < 1e-9 ? "0" : String(Number(v.toFixed(4)))).replace("-", "−");

/** A pair as the book writes it: (−3, 2). */
export const pair = (p: { x: number; y: number }): string => `(${num(p.x)}, ${num(p.y)})`;
