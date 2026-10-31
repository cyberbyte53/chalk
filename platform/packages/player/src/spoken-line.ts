import { type Locale, blanksOf, phrasesOf } from "@chalk/content";
import { richSpeech } from "./rich-text-speech";

/**
 * A line as the voice gets it, worked out in one place for the build (its clips) and the player
 * (which clips to play), so the two always agree.
 */

/** A line's words as the voice gets them: its rich text read for speech, maths left as written. */
export function spokenWords(source: string, locale: Locale): string {
  return richSpeech(source, locale)
    .pieces.map((p) => (p.kind === "words" ? p.text : `$${p.latex}$`))
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
  if (spoken === "") return [];
  return blanksOf(words).length > 0 ? phrasesOf(spoken, values, locale) : [spoken];
}
