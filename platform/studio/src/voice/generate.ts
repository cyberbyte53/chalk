import { createHash } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  type AudioManifest,
  LOCALES,
  type Lesson,
  NARRATOR,
  type Readings,
  audioKey,
  propPieces,
  spokenText,
} from "@chalk/content";
import { type AnyPropDef, initialState, segment } from "@chalk/prop";
import { z } from "zod";
import { spokenPropsOf } from "../validate";
import type { TtsProvider } from "./provider";

/** The speaker anyone without their own entry falls back to (e.g. one voice for the whole cast). */
export const DEFAULT_SPEAKER = "default";

/**
 * authoring/voices.json: for each provider, which of its voices speaks for each speaker in each
 * language. Lessons never name voices, so swapping a provider or a voice is a change here only.
 */
export const voicesSchema = z.record(
  z.string(),
  z.record(z.string(), z.object({ en: z.string(), hi: z.string() })),
);
export type Voices = z.infer<typeof voicesSchema>;

export type GenerateResult = { manifest: AudioManifest; made: number; reused: number };

type Line = { key: string; text: string; voice: string };

/** Every line a script tells a prop to `say`: only those need audio. */
function linesOf(
  lesson: Lesson,
  readings: Readings,
  defs: Readonly<Record<string, AnyPropDef>>,
  provider: TtsProvider,
  voices: Voices,
): Line[] {
  const cast = voices[provider.id];
  if (cast === undefined)
    throw new Error(`voices.json has no voices for provider "${provider.id}"`);
  const lines: Line[] = [];
  for (const board of lesson.boards) {
    const said = spokenPropsOf(board);
    for (const piece of propPieces(board.root)) {
      if (!said.has(piece.name)) continue;
      const def = defs[piece.prop];
      const start = def === undefined ? undefined : initialState(def, piece.with);
      const line =
        def !== undefined && start?.isOk === true ? def.speech?.(start.state) : undefined;
      if (line === undefined) continue;
      const speaker = line.speaker ?? NARRATOR;
      const voice = cast[speaker] ?? cast[DEFAULT_SPEAKER];
      if (voice === undefined)
        throw new Error(`voices.json: provider "${provider.id}" has no voice for "${speaker}"`);
      for (const locale of LOCALES) {
        const text = spokenText(line, locale, readings);
        if (text !== undefined)
          lines.push({
            key: audioKey(board.item?.id ?? board.name, segment(piece.name), locale),
            text,
            voice: voice[locale],
          });
      }
    }
  }
  return lines;
}

/**
 * Publish step 5: speak every line of a published lesson once, per language, into
 * `<publishedDir>/audio/<lessonName>/`. Files are named by what was said and by whom, so
 * unchanged lines are reused and only new or edited lines are spoken again.
 */
export async function generateAudio(
  lesson: Lesson,
  readings: Readings,
  defs: Readonly<Record<string, AnyPropDef>>,
  provider: TtsProvider,
  voices: Voices,
  publishedDir: string,
  lessonName: string,
  /** Called before each new line is spoken (slow providers take seconds per line). */
  onSpeak?: (done: number, toMake: number, text: string) => void,
): Promise<GenerateResult> {
  const lines = linesOf(lesson, readings, defs, provider, voices);
  const missing = await provider.missingVoices([...new Set(lines.map((l) => l.voice))]);
  if (missing.length > 0) {
    throw new Error(
      `These ${provider.id} voices aren't installed: ${missing.join(", ")}. On a Mac: System Settings → Accessibility → Spoken Content → System voice → Manage Voices.`,
    );
  }
  const folder = join("audio", lessonName);
  mkdirSync(join(publishedDir, folder), { recursive: true });
  const files: Record<string, string> = {};
  let made = 0;
  let reused = 0;
  const fileOf = (line: Line) => {
    const hash = createHash("sha1")
      .update([provider.id, line.voice, line.text].join("\u0000"))
      .digest("hex")
      .slice(0, 16);
    return `${folder}/${hash}.${provider.extension}`;
  };
  const toMake = lines.filter((line) => !existsSync(join(publishedDir, fileOf(line)))).length;
  try {
    for (const line of lines) {
      const relative = fileOf(line);
      const absolute = join(publishedDir, relative);
      if (existsSync(absolute)) reused++;
      else {
        onSpeak?.(made, toMake, line.text);
        await provider.synthesize(line.text, line.voice, absolute);
        made++;
      }
      files[line.key] = relative;
    }
  } finally {
    await provider.close?.();
  }
  return { manifest: { provider: provider.id, files }, made, reused };
}
