import type { Locale } from "@chalk/content";
import { plainText } from "@chalk/player";
import type { Spoken } from "@chalk/prop";

/**
 * What a voice says for a line, and whether it can. A line's spoken words (`speak`) are written
 * with it when its screen words aren't how it is said ("√2" is said "the square root of 2"); else
 * it says the screen words, read from the rich text by the same parser that draws them.
 */
export function spokenText(line: Spoken, locale: Locale): string | undefined {
  const speak = line.speak?.[locale];
  if (speak !== undefined) return speak;
  const say = line.say[locale];
  return say === undefined ? undefined : plainText(say);
}

/**
 * What a voice may be given: letters (Latin and Devanagari, with their marks), digits, spaces and
 * ordinary punctuation. Anything else (a symbol, a subscript, a Greek letter) needs the line's
 * spoken words: it is refused, never guessed.
 */
const SPEAKABLE = /[\p{Script=Latin}\p{Script=Devanagari}\p{M}0-9\s.,!?;:'"’‘“”()\-–—।…]/u;

/** The characters in `text` a voice can't be given, each once; empty when it can say all of it. */
export function unspeakable(text: string): string[] {
  return [...new Set([...text].filter((ch) => !SPEAKABLE.test(ch)))];
}
