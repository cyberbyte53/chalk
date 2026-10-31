import { LOCALES, type Locale, type Localized } from "./localized";

/**
 * How a line is said in phrases (platform/docs/sound.md). A line's words are a template written
 * in each language ("You're at street {x}, house {y}."): its fixed parts, and blanks filled from the
 * values of its moment. A value is said by a sayer: written once per language, from the value
 * itself, never from how it is shown. A line is said as phrases, one after another: each fixed part,
 * then each piece of each value. Any voice may say them: clips glued, a live voice, the phone's.
 */

/** A blank in a template: `{x}`. */
const BLANK = /\{(\w+)\}/g;

/** The blanks a template has, in order. */
export function blanksOf(template: string): string[] {
  return [...template.matchAll(BLANK)].map((m) => m[1] as string);
}

/** Whether a line's words have blanks (then its moment's values fill them). */
export const isTemplate = (words: Localized): boolean =>
  LOCALES.some((l) => blanksOf(words[l]).length > 0);

/** The words a number's sayer uses besides digits, in each language. */
const NUMBER_WORDS = {
  minus: { en: "minus", hi: "माइनस" },
  point: { en: "point", hi: "दशमलव" },
} as const satisfies Record<string, Localized>;

/** The whole numbers every voice keeps as clips: what a number's pieces are made of. */
export const KEPT_NUMBERS = 100;

/**
 * A number's sayer: its pieces, said one after another. Digits are said by the voice as digits
 * (every voice reads "4" in its language); what could be misread is said in words: the sign, the
 * decimal point. −2 → "minus", "2"; 0.375 → "0", "point", "3", "7", "5".
 */
export function numberPieces(value: number, locale: Locale): string[] {
  const sign = value < 0 ? [NUMBER_WORDS.minus[locale]] : [];
  const [whole = "0", fraction] = String(Math.abs(value)).split(".");
  return [
    ...sign,
    whole,
    ...(fraction === undefined ? [] : [NUMBER_WORDS.point[locale], ...fraction.split("")]),
  ];
}

/** Every piece a number's sayer can use in a language (with the whole numbers kept as clips). */
export function numberLibrary(locale: Locale): string[] {
  return [
    ...Array.from({ length: KEPT_NUMBERS + 1 }, (_, n) => String(n)),
    NUMBER_WORDS.minus[locale],
    NUMBER_WORDS.point[locale],
  ];
}

/**
 * A template's fixed part as said: without the spaces and joining marks around it; nothing when
 * it has no words (a full stop after the last blank).
 */
const part = (text: string): string => {
  const words = text.trim().replace(/^[,;:]\s*/, "");
  return /[\p{L}\p{N}]/u.test(words) ? words : "";
};

/** A template's fixed parts, in order (what a voice keeps as clips). */
export function fixedParts(template: string): string[] {
  return template
    .split(BLANK)
    .filter((_, i) => i % 2 === 0)
    .map(part)
    .filter((p) => p !== "");
}

/**
 * A line said as phrases, in one language: its words with the blanks filled by their values'
 * sayers. Undefined when a blank has no value, or one no sayer says.
 */
export function phrasesOf(
  template: string,
  values: Readonly<Record<string, unknown>>,
  locale: Locale,
): string[] | undefined {
  const out: string[] = [];
  const pieces = template.split(BLANK);
  for (const [i, piece] of pieces.entries()) {
    if (i % 2 === 0) {
      const fixed = part(piece);
      if (fixed !== "") out.push(fixed);
      continue;
    }
    const value = values[piece];
    if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
    out.push(...numberPieces(value, locale));
  }
  return out;
}
