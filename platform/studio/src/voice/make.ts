import { type AudioManifest, LOCALES, type Locale, audioKey } from "@chalk/content";
import { segment } from "@chalk/prop";
import { type Cast, voiceFor } from "./cast";
import { type Line, speakLines } from "./clips";
import type { BoardLines } from "./lines";
import { mathsReader } from "./maths";
import type { TtsProvider } from "./providers/provider";
import { type Said, said } from "./said";

/**
 * Make: a chapter's lines into clips, and its script. Each line, in each language, is read for what
 * is said (`said`: words a person wrote, or what is missing and a suggested draft), cast (who says
 * it → which voice), spoken by its voice's provider and kept, each lesson's clips in its own folder,
 * with one manifest (which clip says which line, and how long it plays). Lines that still need their
 * spoken words get no clip; they are in the script with what to write, and listed.
 */

/** One line of a board's script, as made: what is shown, what is said, and its clip's key. */
export type ScriptEntry = {
  piece: string;
  speaker: string;
  /** Said when a rule shows it, not when the board opens. */
  isLater: boolean;
  shown: Readonly<Record<Locale, string | undefined>>;
  said: Readonly<Record<Locale, Said | undefined>>;
  /** Its clips' keys in the manifest, by language. */
  keys: Readonly<Record<Locale, string>>;
};

/** A chapter's script: every board's lines, by the board's item id. */
export type ChapterScript = {
  boards: { id: string; path: string; lines: ScriptEntry[] }[];
};

export async function makeVoice(spec: {
  boards: readonly BoardLines[];
  cast: Cast;
  providers: Readonly<Record<string, TtsProvider>>;
  /** Where the folders and the manifest go. */
  outDir: string;
  onSpeak?: (done: number, toMake: number, text: string) => void;
}): Promise<{
  manifest: AudioManifest;
  script: ChapterScript;
  /** Lines that need their spoken words written, each with what is missing (and a suggestion). */
  unsaid: string[];
  made: number;
  reused: number;
}> {
  const readMaths = await mathsReader();
  const byFolder = new Map<string, Line[]>();
  const unsaid: string[] = [];
  const script: ChapterScript = { boards: [] };
  for (const { item, folder, lines } of spec.boards) {
    const into = byFolder.get(folder) ?? [];
    byFolder.set(folder, into);
    const entries: ScriptEntry[] = [];
    for (const { piece, speaker, line, isLater } of lines) {
      const keys = Object.fromEntries(
        LOCALES.map((l) => [l, audioKey(item.id, segment(piece), l)]),
      ) as Record<Locale, string>;
      const saidBy = Object.fromEntries(
        LOCALES.map((l) => [l, said(line, l, readMaths)]),
      ) as Record<Locale, Said | undefined>;
      entries.push({
        piece,
        speaker,
        isLater,
        shown: Object.fromEntries(LOCALES.map((l) => [l, line.say[l]])) as Record<Locale, string>,
        said: saidBy,
        keys,
      });
      for (const locale of LOCALES) {
        const what = saidBy[locale];
        if (what === undefined) continue;
        if ("needs" in what) {
          unsaid.push(
            `${item.path}, ${piece} (${locale}): ${what.needs}: "${line.say[locale]}"${what.suggested === undefined ? "" : `\n      suggested: "${what.suggested}"`}`,
          );
          continue;
        }
        if (what.words.trim() === "") continue;
        into.push({
          key: keys[locale],
          text: what.words,
          voice: voiceFor(spec.cast, spec.providers, speaker, locale),
        });
      }
    }
    script.boards.push({ id: item.id, path: item.path, lines: entries });
  }
  const all = [...byFolder.values()].flat();
  const providers = [...new Set(all.map((l) => l.voice.provider))];
  for (const provider of providers) {
    const voices = new Set(
      all.filter((l) => l.voice.provider === provider).map((l) => l.voice.voice),
    );
    const missing = await provider.missingVoices([...voices]);
    if (missing.length > 0)
      throw new Error(`These ${provider.id} voices aren't installed: ${missing.join(", ")}`);
  }
  const files: Record<string, string> = {};
  const seconds: Record<string, number> = {};
  let made = 0;
  let reused = 0;
  try {
    for (const [folder, lines] of byFolder) {
      const done = await speakLines(lines, spec.outDir, folder, spec.onSpeak);
      Object.assign(files, done.manifest.files);
      Object.assign(seconds, done.manifest.seconds);
      made += done.made;
      reused += done.reused;
    }
  } finally {
    for (const provider of providers) await provider.close?.();
  }
  return {
    manifest: { provider: providers.map((p) => p.id).join("+") || "none", files, seconds },
    script,
    unsaid,
    made,
    reused,
  };
}
