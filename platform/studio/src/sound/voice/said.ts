import { type Locale, blanksOf } from "@chalk/content";
import { type MathsReader, richSpeech } from "@chalk/player";

/**
 * What a voice says for a line: words a person wrote, never rewritten.
 *
 * - `written`: the lesson's words for the line (`says`): anything, not only the screen's.
 * - `screen`: what its piece says of itself (a text's words, a question's prompt).
 * Either is said as rich text is (rich-text-speech.ts): bold and emphasis as their words.
 * - Anything else needs its spoken words: maths (with a `suggested` draft from a maths reader, to
 *   write in as it is or edit), or a sign outside maths (write it as maths, `$-2$`, or write its words).
 */
export type Said =
  | { words: string; from: "written" | "screen" }
  | { needs: string; suggested?: string };

/** A line's words as a voice is given them: marks resolved, bold and emphasis as their words. */
const spoken = (text: string) =>
  richSpeech(text, "en")
    .pieces.map((p) => (p.kind === "words" ? p.text : `[maths ${p.latex}]`))
    .join("")
    .replace(/\s+/g, " ")
    .trim();

export function said(
  line: {
    readonly own?: Readonly<Record<string, string>>;
    readonly says?: Readonly<Record<string, string>>;
  },
  locale: Locale,
  readMaths?: MathsReader,
): Said | undefined {
  // The lesson's words for it, else what its piece says of itself: both read the same way.
  const written = line.says?.[locale];
  const from = written === undefined ? "screen" : "written";
  const say = written ?? line.own?.[locale];
  if (say === undefined) return undefined;
  // A `says` said as the line itself is (its marks resolved, its bold as words) is only a second
  // copy, which drifts: `says` is for a line rephrased for the ear.
  const ownWords = line.own?.[locale];
  if (written !== undefined && ownWords !== undefined && spoken(written) === spoken(ownWords))
    return {
      needs: "its says is the line itself: delete it (mark only the bits said differently)",
    };
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
  // A template's blanks are filled by sayers (spoken.ts): only its own words are checked.
  const own = blanksOf(words).reduce((text, blank) => text.split(`{${blank}}`).join(" "), words);
  const odd = unspeakable(own);
  return odd.length > 0
    ? { needs: `it has "${odd.join(" ")}" outside maths: write it as maths, or write its words` }
    : { words, from };
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
