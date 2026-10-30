import type { Locale } from "@chalk/content";
import { type MathsReader, richSpeech } from "@chalk/player";
import type { Spoken } from "@chalk/prop";

/**
 * What a voice says for a line: words a person wrote, never rewritten.
 *
 * - `written`: the line's spoken words (`speak`), written with it when its screen words aren't how it
 *   is said.
 * - `screen`: its screen words, when they are words already (bold and emphasis said as their words,
 *   rich-text-speech.ts).
 * - Anything else needs its spoken words: maths (with a `suggested` draft from a maths reader, to
 *   write in as it is or edit), or a sign outside maths (write it as maths, `$-2$`, or write its words).
 */
export type Said =
  | { words: string; from: "written" | "screen" }
  | { needs: string; suggested?: string };

export function said(line: Spoken, locale: Locale, readMaths?: MathsReader): Said | undefined {
  const speak = line.speak?.[locale];
  if (speak !== undefined) return { words: speak, from: "written" };
  const say = line.say[locale];
  if (say === undefined) return undefined;
  const { pieces, problems } = richSpeech(say, locale, readMaths);
  if (problems.length > 0)
    return { needs: `its text doesn't read cleanly (${problems.join("; ")})` };
  if (pieces.some((p) => p.kind === "maths")) {
    const drafts = pieces.map((p) => (p.kind === "words" ? p.text : p.draft));
    return drafts.every((d) => d !== undefined)
      ? { needs: "it has maths", suggested: drafts.join("").trim() }
      : { needs: "it has maths" };
  }
  const words = pieces.map((p) => (p.kind === "words" ? p.text : "")).join("");
  const odd = unspeakable(words);
  return odd.length > 0
    ? { needs: `it has "${odd.join(" ")}" outside maths: write it as maths, or write its words` }
    : { words, from: "screen" };
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
