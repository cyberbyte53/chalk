import { type Locale, NARRATOR } from "@chalk/content";
import { z } from "zod";
import type { TtsProvider } from "./providers/provider";

/**
 * Who speaks, in which voice (the guides' `voices` setting, authoring/guide.md): each character, per language, a
 * voice named with its provider ("piper:hi_IN-rohan-medium"). Lessons name characters (a line's
 * `speaker`), never voices: changing a voice, or a provider, is a change here only, and different
 * languages may use different providers.
 */
const voiceRef = z
  .string()
  .regex(/^[a-z0-9-]+:.+$/, 'a voice is "provider:voice", e.g. "piper:hi_IN-rohan-medium"');
export const castSchema = z
  .object({
    $comment: z.string().optional(),
    cast: z.record(z.string(), z.object({ en: voiceRef, hi: voiceRef }).strict()),
  })
  .strict();
export type Cast = z.infer<typeof castSchema>["cast"];

/** A voice and the provider that makes it. */
export type VoiceOf = { provider: TtsProvider; voice: string; ref: string };

/** The voice `speaker` speaks `locale` in (the narrator when a line names no one). */
export function voiceFor(
  cast: Cast,
  providers: Readonly<Record<string, TtsProvider>>,
  speaker: string | undefined,
  locale: Locale,
): VoiceOf {
  const who = speaker ?? NARRATOR;
  const ref = cast[who]?.[locale];
  if (ref === undefined)
    throw new Error(
      `the guides' voices have no "${who}" (they have ${Object.keys(cast).join(", ")})`,
    );
  const at = ref.indexOf(":");
  const name = ref.slice(0, at);
  const provider = providers[name];
  if (provider === undefined)
    throw new Error(
      `the guides' voices: "${who}" speaks with "${name}", which isn't a voice provider (there are ${Object.keys(providers).join(", ")})`,
    );
  return { provider, voice: ref.slice(at + 1), ref };
}
