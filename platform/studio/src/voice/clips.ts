import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { AudioManifest } from "@chalk/content";
import type { VoiceOf } from "./cast";
import { audioSeconds } from "./length";

export type GenerateResult = { manifest: AudioManifest; made: number; reused: number };

/** One phrase to say: its key (`phraseKey`), its words, and the voice that says them. */
export type Line = { key: string; text: string; voice: VoiceOf };

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
  const phrases: AudioManifest["phrases"] = {};
  let made = 0;
  let reused = 0;
  const fileOf = (line: Line) => {
    const hash = createHash("sha1")
      .update([line.voice.ref, line.text].join("\u0000"))
      .digest("hex")
      .slice(0, 16);
    const name = `${hash}.${line.voice.provider.extension}`;
    return folder === "." ? name : `${folder}/${name}`;
  };
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
  const used = [...new Set(lines.map((l) => l.voice.provider.id))];
  return { manifest: { provider: used.join("+") || "none", phrases }, made, reused };
}
