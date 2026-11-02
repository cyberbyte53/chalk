import type { Locale, Localized } from "@chalk/content";

/** The prop's own words on its buttons and lines, in both languages. A lesson's words are fields. */
export const WORDS = {
  walk: { en: "Walk", hi: "चलो" },
  back: { en: "Back to the start", hi: "शुरू पर वापस" },
  nextPoint: { en: "Next point", hi: "अगला बिंदु" },
  nameQuadrants: { en: "Number the quadrants", hi: "चतुर्थांशों को गिनो" },
  bringTogether: { en: "Bring the zeroes together", hi: "दोनों शून्य मिलाओ" },
  show: { en: "Show", hi: "दिखाओ" },
  thePoint: { en: "The point", hi: "बिंदु" },
  showPoint: { en: "Show where it is", hi: "दिखाओ कहाँ है" },
  clear: { en: "Clear", hi: "हटाओ" },
  lightsOff: { en: "Lights off", hi: "रोशनी बंद" },
  blackboard: { en: "Blackboard", hi: "श्यामपट" },
  throw: { en: "Throw", hi: "फेंको" },
  newGame: { en: "New game", hi: "नया खेल" },
  /** A scale, as the book writes it (1 cm = 1 unit): one square of the paper, and what it stands for. */
  oneSquare: { en: "1 square =", hi: "1 खाना =" },
  unit: { en: "unit", hi: "इकाई" },
  units: { en: "units", hi: "इकाई" },
  up: { en: "Up", hi: "ऊपर" },
  down: { en: "Down", hi: "नीचे" },
  left: { en: "Left", hi: "बाएँ" },
  right: { en: "Right", hi: "दाएँ" },
} satisfies Record<string, Localized>;

export const word = (w: Localized, locale: Locale): string => w[locale];

/** A place's address in the axes' words: "Street number 4, House number 3". */
export function addressOf(
  names: readonly [Localized, Localized],
  p: { x: number; y: number },
  locale: Locale,
): string {
  // On the x- and y-axes, a place is its coordinates, as the book writes them: (3, 2).
  if (names[0].en === "x" && names[1].en === "y") return pair(p);
  // Each number stays on the line with its word.
  return `${names[0][locale]}\u00a0${num(p.x)}, ${names[1][locale]}\u00a0${num(p.y)}`;
}

/** A number as the book writes it: a true minus sign, and no trailing zeros. */
export const num = (v: number): string =>
  (Math.abs(v) < 1e-9 ? "0" : String(Number(v.toFixed(4)))).replace("-", "−");

/** A pair as the book writes it: (−3, 2). */
export const pair = (p: { x: number; y: number }): string => `(${num(p.x)},\u00a0${num(p.y)})`;

/** A number to so many decimal places (0: as `num`): 2.13, −0.70. */
export const numTo = (v: number, decimals: number): string =>
  decimals === 0
    ? num(v)
    : (Math.abs(v) < 0.5 * 10 ** -decimals ? 0 : v).toFixed(decimals).replace("-", "−");

/** A pair to so many decimal places: (2.13, −0.70). */
export const pairTo = (p: { x: number; y: number }, decimals: number): string =>
  decimals === 0 ? pair(p) : `(${numTo(p.x, decimals)},\u00a0${numTo(p.y, decimals)})`;
