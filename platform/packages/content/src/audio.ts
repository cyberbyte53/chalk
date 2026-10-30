import { z } from "zod";
import type { Locale } from "./localized";

/**
 * The voice's contract between making clips (platform/studio/src/voice) and playing them (the
 * player): a line's key, the manifest of clips and their lengths, and who says a line that names
 * no one. What is said, and how, is the voice module's.
 */

/** Who reads a line when the prop doesn't name a speaker. */
export const NARRATOR = "narrator";

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
