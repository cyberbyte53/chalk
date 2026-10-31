import { LOCALES, type Locale, type Localized } from "../localized";

/**
 * How a line is said in phrases (platform/docs/sound.md). A line's words are a template written
 * in each language ("You're at street {x}, house {y}."): its fixed parts, and blanks filled from the
 * values of its moment. A value is said by a sayer: written once per language, from the value
 * itself, never from how it is shown. A line is said as phrases, one after another: each fixed part,
 * then each piece of each value. Any voice may say them: clips glued, a live voice, the phone's.
 */

/** A blank in a template: `{x}`. */
const BLANK = /\{(\w+)\}/g;

/**
 * A template in pieces: its words and its blanks, in order. Blanks are in the words only: inside
 * `$…$` (maths, rich-text.ts) braces are maths (`$x^{2}$`), never a blank.
 */
type Piece = { readonly words: string } | { readonly blank: string };
function piecesOf(template: string): Piece[] {
  const out: Piece[] = [];
  for (const [i, part] of template.split("$").entries()) {
    if (i % 2 === 1) {
      out.push({ words: `$${part}$` });
      continue;
    }
    for (const [j, bit] of part.split(BLANK).entries())
      out.push(j % 2 === 0 ? { words: bit } : { blank: bit });
  }
  return out;
}

/** The blanks a template has, in order. */
export function blanksOf(template: string): string[] {
  return piecesOf(template).flatMap((p) => ("blank" in p ? [p.blank] : []));
}

/** Whether a line's words have blanks (then its moment's values fill them). */
export const isTemplate = (words: Localized): boolean =>
  LOCALES.some((l) => blanksOf(words[l]).length > 0);

/** The words a number's sayer uses besides digits, in each language. */
const NUMBER_WORDS = {
  minus: { en: "minus", hi: "माइनस" },
  point: { en: "point", hi: "दशमलव" },
  hundred: { en: "hundred", hi: "सौ" },
  thousand: { en: "thousand", hi: "हज़ार" },
} as const satisfies Record<string, Localized>;

/** The whole numbers every voice keeps as clips: a number's pieces are these and the words above. */
export const KEPT_NUMBERS = 100;
/** The largest whole part the sayer says (below a lakh, said the same way in both languages). */
const LARGEST = 99_999;
/** Digits after the point it says: a value's float noise (0.1 + 0.2) is not part of it. */
const PLACES = 6;

/** A whole number below 100,000 in kept pieces: 12345 → "12", "thousand", "3", "hundred", "45". */
function wholePieces(n: number, locale: Locale): string[] {
  const thousands = Math.floor(n / 1000);
  const hundreds = Math.floor((n % 1000) / 100);
  const rest = n % 100;
  const out = [
    ...(thousands > 0 ? [String(thousands), NUMBER_WORDS.thousand[locale]] : []),
    ...(hundreds > 0 ? [String(hundreds), NUMBER_WORDS.hundred[locale]] : []),
    ...(rest > 0 || n === 0 ? [String(rest)] : []),
  ];
  return out;
}

/**
 * A number's sayer: its pieces, said one after another, every one kept as a clip. Numbers up to
 * 100 are said as digits (every voice reads "4" in its language); larger ones in hundreds and
 * thousands; the sign and the decimal point in words; the digits after the point one by one.
 * −2 → "minus", "2"; 0.375 → "0", "point", "3", "7", "5". Undefined for a number it doesn't say
 * (100,000 or more, not finite).
 */
export function numberPieces(value: number, locale: Locale): string[] | undefined {
  if (!Number.isFinite(value)) return undefined;
  const clean = Number(Math.abs(value).toFixed(PLACES));
  const whole = Math.trunc(clean);
  if (whole > LARGEST) return undefined;
  const fraction = clean === whole ? "" : (String(clean).split(".")[1] ?? "");
  return [
    ...(value < 0 && clean !== 0 ? [NUMBER_WORDS.minus[locale]] : []),
    ...wholePieces(whole, locale),
    ...(fraction === "" ? [] : [NUMBER_WORDS.point[locale], ...fraction.split("")]),
  ];
}

/** Every piece a number's sayer can use in a language: each kept as a clip. */
export function numberLibrary(locale: Locale): string[] {
  return [
    ...Array.from({ length: KEPT_NUMBERS + 1 }, (_, n) => String(n)),
    ...Object.values(NUMBER_WORDS).map((w) => w[locale]),
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
  return wordRuns(template)
    .map(part)
    .filter((p) => p !== "");
}

/** A template's words between its blanks, each run joined (maths stays with its words). */
function wordRuns(template: string): string[] {
  const runs: string[] = [""];
  for (const p of piecesOf(template))
    if ("words" in p) runs[runs.length - 1] += p.words;
    else runs.push("");
  return runs;
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
  const runs = wordRuns(template);
  const blanks = blanksOf(template);
  const out: string[] = [];
  for (const [i, run] of runs.entries()) {
    const fixed = part(run);
    if (fixed !== "") out.push(fixed);
    const blank = blanks[i];
    if (blank === undefined) continue;
    const value = values[blank];
    if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
    // A number the sayer doesn't say is written in full: no clip has it, so a voice that reads any
    // words says the line.
    out.push(
      ...(numberPieces(value, locale) ?? [
        value.toLocaleString("en-IN", { maximumFractionDigits: PLACES }),
      ]),
    );
  }
  return out;
}
