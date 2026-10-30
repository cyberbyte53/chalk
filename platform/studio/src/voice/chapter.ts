import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { type BoardItem, boardOf, moduleOf } from "@chalk/author";
import {
  type AudioManifest,
  type Board,
  Kind,
  LOCALES,
  NARRATOR,
  type Readings,
  audioKey,
  spokenText,
} from "@chalk/content";
import { type Spoken, segment } from "@chalk/prop";
import { Board as Core } from "@chalk/prop/next";
import { DEFAULT_SPEAKER, type Line, type Voices, speakLines } from "./generate";
import type { TtsProvider } from "./provider";

/**
 * A chapter's voice: every line its boards say (on the event model, every piece that speaks: its
 * words and its questions' prompts), made into audio once per language, with how long each plays.
 * The boards are made from the built chapter (build/), the way the app makes them.
 */

/** Every built page and question under a chapter's folder in build/. */
function itemsUnder(dir: string): BoardItem[] {
  const out: BoardItem[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...itemsUnder(path));
    else if (name.endsWith(".json")) {
      const item = JSON.parse(readFileSync(path, "utf8")) as { kind?: string };
      if (item.kind === Kind.Page || item.kind === Kind.Question) out.push(item as BoardItem);
    }
  }
  return out;
}

/** The lines a scene's pieces say, each as its piece reads now (its words, a question's prompt). */
function sceneLines(board: Board): { piece: string; line: Spoken }[] {
  const model = board.model;
  if (model === undefined) return [];
  const core = new Core(model.scene, model.given);
  const out: { piece: string; line: Spoken }[] = [];
  for (const [piece, def] of Object.entries(model.scene.children ?? {})) {
    const line = (def.speech as ((me: unknown) => Spoken | undefined) | undefined)?.(
      core.read(piece),
    );
    if (line !== undefined) out.push({ piece, line });
  }
  return out;
}

export async function voiceChapter(spec: {
  root: string;
  /** "class9-maths/coordinate-geometry" */
  chapter: string;
  /** Loads a module under content/ ("class9-maths/…/overview.ts"). */
  load: (module: string) => Promise<Readonly<Record<string, unknown>>>;
  roleOf: (type: string) => string | undefined;
  readings: Readings;
  provider: TtsProvider;
  voices: Voices;
  /** Where the files and the manifest go. */
  outDir: string;
  onSpeak?: (done: number, toMake: number, text: string) => void;
}): Promise<{ manifest: AudioManifest; made: number; reused: number; boards: number }> {
  const cast = spec.voices[spec.provider.id];
  if (cast === undefined)
    throw new Error(`voices.json has no voices for provider "${spec.provider.id}"`);
  const items = itemsUnder(join(spec.root, "build", spec.chapter));
  // Each lesson (a concept's pages, a question family) keeps its clips in its own folder.
  const byFolder = new Map<string, Line[]>();
  for (const item of items) {
    const folder = item.source.path.slice(spec.chapter.length + 1);
    const lines = byFolder.get(folder) ?? [];
    byFolder.set(folder, lines);
    const board = boardOf(item, await spec.load(moduleOf(item)), spec.roleOf);
    for (const { piece, line } of sceneLines(board)) {
      const voice = cast[line.speaker ?? NARRATOR] ?? cast[DEFAULT_SPEAKER];
      if (voice === undefined)
        throw new Error(
          `voices.json: "${spec.provider.id}" has no voice for "${line.speaker ?? NARRATOR}"`,
        );
      for (const locale of LOCALES) {
        const text = spokenText(line, locale, spec.readings);
        if (text !== undefined && text.trim() !== "")
          lines.push({
            key: audioKey(item.id, segment(piece), locale),
            text,
            voice: voice[locale],
          });
      }
    }
  }
  const all = [...byFolder.values()].flat();
  const missing = await spec.provider.missingVoices([...new Set(all.map((l) => l.voice))]);
  if (missing.length > 0)
    throw new Error(`These ${spec.provider.id} voices aren't installed: ${missing.join(", ")}`);
  const manifest: AudioManifest = { provider: spec.provider.id, files: {}, seconds: {} };
  let made = 0;
  let reused = 0;
  for (const [folder, lines] of byFolder) {
    const done = await speakLines(lines, spec.provider, spec.outDir, folder, spec.onSpeak);
    Object.assign(manifest.files, done.manifest.files);
    Object.assign(manifest.seconds ?? {}, done.manifest.seconds);
    made += done.made;
    reused += done.reused;
  }
  return { manifest, made, reused, boards: items.length };
}
