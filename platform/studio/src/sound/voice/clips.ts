import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { VoiceOf } from "./cast";
import { audioSeconds } from "./length";

/** Each phrase's clip, by its key: the file and how long it plays. */
export type GenerateResult = {
  phrases: Record<string, { file: string; seconds: number }>;
  made: number;
  reused: number;
};

/** One phrase to say: its key (`clipKey`: voice and words), its words, and the voice that says them. */
export type Line = { key: string; text: string; voice: VoiceOf };

/** A clip's file name: named by its voice and words, so the same words in the same voice are one file. */
export function clipFile(line: Line): string {
  const hash = createHash("sha1")
    .update([line.voice.ref, line.text].join("\u0000"))
    .digest("hex")
    .slice(0, 16);
  return `${hash}.${line.voice.provider.extension}`;
}

/**
 * Keep: says each line into `<dir>/<folder>/`, once: a clip is named by what is said and in which voice,
 * so unchanged lines are kept and only new or edited lines are spoken again. Each clip's length is
 * measured and kept with it. Lines may use different providers (Hindi from one, English another).
 */
export async function speakLines(
  lines: readonly Line[],
  dir: string,
  folder: string,
  onSpeak?: (done: number, toMake: number, text: string) => void,
): Promise<GenerateResult> {
  mkdirSync(join(dir, folder), { recursive: true });
  const phrases: GenerateResult["phrases"] = {};
  let made = 0;
  let reused = 0;
  const fileOf = (line: Line) => (folder === "." ? clipFile(line) : `${folder}/${clipFile(line)}`);
  const toMake = new Set(lines.filter((l) => !existsSync(join(dir, fileOf(l)))).map(fileOf)).size;
  for (const line of lines) {
    const relative = fileOf(line);
    const absolute = join(dir, relative);
    if (existsSync(absolute)) reused++;
    else {
      onSpeak?.(made, toMake, line.text);
      await line.voice.provider.synthesize(line.text, line.voice.voice, absolute);
      made++;
    }
    phrases[line.key] = {
      file: relative,
      seconds: audioSeconds(readFileSync(absolute), line.voice.provider.extension),
    };
  }
  return { phrases, made, reused };
}
