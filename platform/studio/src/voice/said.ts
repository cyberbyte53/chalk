import type { Locale } from "@chalk/content";
import { SpanKind, parseRich } from "@chalk/player";
import type { Spoken } from "@chalk/prop";

/**
 * What a voice says for a line: exactly words a person wrote, never rewritten. A line's spoken
 * words (`speak`), written with it when its screen words aren't how it is said ("√2" is said
 * "the square root of 2"); else its screen words, when they are words already. Formatting (bold,
 * emphasis) is left out by the parser that draws it, so nothing touches the words themselves;
 * anything that would have to be turned into words (maths, a sign) never is: that line needs its
 * spoken words, and says why.
 */
export type Said = { words: string } | { needs: string };

export function said(line: Spoken, locale: Locale): Said | undefined {
  const speak = line.speak?.[locale];
  if (speak !== undefined) return { words: speak };
  const say = line.say[locale];
  if (say === undefined) return undefined;
  const { spans, problems } = parseRich(say);
  if (problems.length > 0)
    return { needs: `its text doesn't read cleanly (${problems.join("; ")})` };
  if (spans.some((s) => s.kind === SpanKind.Math || s.kind === SpanKind.DisplayMath))
    return { needs: "it has maths" };
  const words = spans.map((s) => s.text).join("");
  const odd = unspeakable(words);
  return odd.length > 0 ? { needs: `it has "${odd.join(" ")}"` } : { words };
}

/**
 * What a voice may be given: letters (Latin and Devanagari, with their marks), digits, spaces and
 * ordinary punctuation. A line with anything else needs its spoken words: refused, never guessed.
 */
const SPEAKABLE = /[\p{Script=Latin}\p{Script=Devanagari}\p{M}0-9\s.,!?;:'"’‘“”()\-–—।…]/u;

/** The characters in `text` a voice can't be given, each once; empty when it can say all of it. */
export function unspeakable(text: string): string[] {
  return [...new Set([...text].filter((ch) => !SPEAKABLE.test(ch)))];
}
