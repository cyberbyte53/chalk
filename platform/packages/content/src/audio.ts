import { z } from "zod";
import type { Locale } from "./localized";

/**
 * The voice's contract between making clips (platform/studio/src/voice) and playing them (the
 * player). A clip says one phrase: who says it, in which language, in which words. A line is said as
 * phrases (spoken.ts): a fixed line is one, a line with values a few, glued one after another. What
 * is said, and how, is the voice module's.
 */

/** Who reads a line when the prop doesn't name a speaker. */
export const NARRATOR = "narrator";

/** A phrase's key: who says it, in which language, in which words. */
export function phraseKey(speaker: string, locale: Locale, words: string): string {
  return [speaker, locale, words].join("|");
}

const clipSchema = z
  .object({
    /** Its file, relative to the manifest. */
    file: z.string().min(1),
    /** How long it plays, in seconds. */
    seconds: z.number().positive(),
  })
  .strict();
export type Clip = z.infer<typeof clipSchema>;

/** Written by `pnpm voice` beside the clips: which clip says each phrase. */
export const audioManifestSchema = z
  .object({
    /** The voice providers that made these clips (e.g. "piper+macos"). */
    provider: z.string().min(1),
    /** phraseKey → its clip. */
    phrases: z.record(z.string(), clipSchema),
  })
  .strict();
export type AudioManifest = z.infer<typeof audioManifestSchema>;

/** The clips that say `phrases` one after another, or undefined when one has none. */
export function clipsOf(
  manifest: AudioManifest,
  speaker: string,
  locale: Locale,
  phrases: readonly string[],
): Clip[] | undefined {
  const clips: Clip[] = [];
  for (const words of phrases) {
    const clip = manifest.phrases[phraseKey(speaker, locale, words)];
    if (clip === undefined) return undefined;
    clips.push(clip);
  }
  return clips;
}
