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

/** A clip of a chapter's store: one phrase, in one voice and language (spoken.ts). */
const clipSchema = z
  .object({
    /** Its file, in the chapter's sound folder. */
    file: z.string().min(1),
    /** The voice that made it ("piper:en_US-lessac-medium"). */
    voice: z.string().min(1),
    locale: z.enum(["en", "hi"]),
    /** What it says. */
    words: z.string(),
    /** How long it plays. */
    seconds: z.number().positive(),
  })
  .strict();
export type Clip = z.infer<typeof clipSchema>;

/**
 * A chapter's sound list (`sound/sound.json`): who voices whom in it, and every clip it holds,
 * each saying what it says. Made by the content build, committed with the chapter, shipped with
 * it; the store's index, what review reads, and what the chapter's download fetches.
 */
export const soundListSchema = z
  .object({
    /** Each speaker's voice, by language, as the chapter's settings resolve it. */
    speakers: z.record(z.string(), z.object({ en: z.string(), hi: z.string() }).strict()),
    clips: z.array(clipSchema),
  })
  .strict();
export type SoundList = z.infer<typeof soundListSchema>;

/** A clip's key in the store: the voice, and the words. */
export const clipKey = (voice: string, words: string): string => `${voice}|${words}`;

/** The clips that say `phrases` one after another in a speaker's voice, or undefined when one has none. */
export function clipsOf(
  list: SoundList,
  speaker: string,
  locale: Locale,
  phrases: readonly string[],
): Clip[] | undefined {
  const voice = list.speakers[speaker]?.[locale];
  if (voice === undefined) return undefined;
  const byKey = new Map(list.clips.map((c) => [clipKey(c.voice, c.words), c]));
  const clips: Clip[] = [];
  for (const words of phrases) {
    const clip = byKey.get(clipKey(voice, words));
    if (clip === undefined) return undefined;
    clips.push(clip);
  }
  return clips;
}

/**
 * A sound effect (platform/docs/sound.md): its name (what `play` and the log show) and where its
 * recording is. A package declares its own, beside its code (`new URL("./sounds/step.mp3",
 * import.meta.url)`), so a sound ships with the code that uses it: a lesson's props load theirs
 * when its chapter opens, the app's own (right, wrong) come with the app.
 */
export type Effect = { readonly name: string; readonly url: string };

/** An effect, from its name and its recording. */
export function effect(name: string, url: URL | string): Effect {
  return { name, url: String(url) };
}
