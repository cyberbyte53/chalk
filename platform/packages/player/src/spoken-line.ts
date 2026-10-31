import { type Locale, blanksOf, phrasesOf } from "@chalk/content";
import { richSpeech } from "./rich-text-speech";

/**
 * A line as the voice gets it, worked out in one place for the build (its clips) and the player
 * (which clips to play), so the two always agree.
 */

/**
 * A line's words as the voice gets them: its rich text read for speech (bold and emphasis as their
 * words). Undefined when it has maths: nothing turns maths into words, so it has none to say (the
 * build lists it, to have its spoken words written).
 */
export function spokenWords(source: string, locale: Locale): string | undefined {
  const { pieces } = richSpeech(source, locale);
  if (pieces.some((p) => p.kind !== "words")) return undefined;
  return pieces
    .map((p) => (p.kind === "words" ? p.text : ""))
    .join("")
    .trim();
}

/**
 * A line's phrases in one language: a fixed line is one phrase, its words; a line with blanks is its
 * fixed parts with its moment's values' pieces between (spoken.ts). Undefined when a blank has no
 * value.
 */
export function linePhrases(
  words: string,
  locale: Locale,
  values: Readonly<Record<string, unknown>> = {},
): string[] | undefined {
  const spoken = spokenWords(words, locale);
  if (spoken === undefined) return undefined;
  if (spoken === "") return [];
  return blanksOf(words).length > 0 ? phrasesOf(spoken, values, locale) : [spoken];
}
