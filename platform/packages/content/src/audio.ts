import type { Spoken } from "@chalk/prop";
import { z } from "zod";
import type { Locale } from "./localized";

/** Who reads a line when the prop doesn't name a speaker. */
export const NARRATOR = "narrator";

/**
 * How text on screen is said aloud (authoring/pronunciations.json): ordered groups of rules, each a
 * pattern and its wording per language. Maths is one group among others (units, chemistry, short
 * forms); adding a reading is a line of content, not code. A line's own `speak` always wins.
 */
const ruleSchema = z
  .object({
    /** A regular expression; `$1`… in the wording put back what its brackets caught. */
    match: z.string().min(1),
    en: z.string(),
    hi: z.string(),
  })
  .strict();

export const pronunciationsSchema = z
  .object({
    $comment: z.string().optional(),
    groups: z.array(
      z
        .object({
          name: z.string().min(1),
          describe: z.string().optional(),
          rules: z.array(ruleSchema),
        })
        .strict(),
    ),
  })
  .strict();
export type Pronunciations = z.infer<typeof pronunciationsSchema>;

/** Compiled once: every rule, in order. */
export type Readings = readonly { pattern: RegExp; wording: Readonly<Record<Locale, string>> }[];

export function compileReadings(input: unknown): Readings {
  const pronunciations = pronunciationsSchema.parse(input);
  return pronunciations.groups.flatMap((group) =>
    group.rules.map((rule) => {
      try {
        return { pattern: new RegExp(rule.match, "gu"), wording: { en: rule.en, hi: rule.hi } };
      } catch (error) {
        throw new Error(
          `pronunciations, ${group.name}: bad pattern "${rule.match}" (${String(error)})`,
        );
      }
    }),
  );
}

/** Turns screen text into what the voice says ("√2" → "square root of 2", "25°C" → "25 degrees Celsius"). */
export function toSpoken(text: string, locale: Locale, readings: Readings): string {
  let out = text;
  for (const reading of readings) out = out.replace(reading.pattern, reading.wording[locale]);
  return out
    .replace(/\s+([,.?!।])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * What a voice can safely be given: letters (Latin and Devanagari, with their marks), digits,
 * spaces and ordinary punctuation. Everything else is refused, so anything we didn't think of
 * (a symbol, a subscript, a Greek letter, an emoji) is caught instead of read out wrongly.
 */
const SPEAKABLE = /[\p{Script=Latin}\p{Script=Devanagari}\p{M}0-9\s.,!?;:'"’‘“”()\-–—।…]/u;

/** The characters in spoken text that a voice shouldn't be given, each once; empty when it's fine. */
export function unspeakable(text: string): string[] {
  return [...new Set([...text].filter((ch) => !SPEAKABLE.test(ch)))];
}

/** What the voice says for a line: the author's own words if given, else the screen text read by the rules. */
export function spokenText(line: Spoken, locale: Locale, readings: Readings): string | undefined {
  const speak = line.speak?.[locale];
  if (speak !== undefined) return speak;
  const say = line.say[locale];
  return say === undefined ? undefined : toSpoken(say, locale, readings);
}

/** The key for one spoken line in one language: the board's item id (or name), the prop's address. */
export function audioKey(board: string, path: string, locale: Locale): string {
  return `${board}.${path}.${locale}`;
}

/** Written by publish next to the published lesson: which audio file plays for each spoken line. */
export const audioManifestSchema = z
  .object({
    /** The voice provider that made these files (e.g. "macos", "tone"). */
    provider: z.string().min(1),
    /** audioKey → file path relative to the manifest. */
    files: z.record(z.string(), z.string().min(1)),
    /** audioKey → how long its file plays, in seconds (a board knows when a line ends without playing it). */
    seconds: z.record(z.string(), z.number().positive()).optional(),
  })
  .strict();
export type AudioManifest = z.infer<typeof audioManifestSchema>;

/** Words a second a voice says, roughly: for a line with no audio (failed, muted, not made yet). */
const WORDS_PER_SECOND = 2.5;
/** A short breath before and after any line. */
const LINE_PAUSE = 0.4;

/** How long a line would take to say, from its words, when there is no audio to measure. */
export function estimatedSeconds(text: string): number {
  const words = text.split(/\s+/).filter((w) => w !== "").length;
  return LINE_PAUSE + words / WORDS_PER_SECOND;
}
