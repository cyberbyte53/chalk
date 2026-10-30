import { type AudioManifest, LOCALES, audioKey } from "@chalk/content";
import { segment } from "@chalk/prop";
import { type Cast, voiceFor } from "./cast";
import { type Line, speakLines } from "./clips";
import type { BoardLines } from "./lines";
import type { TtsProvider } from "./providers/provider";
import { said } from "./said";

/**
 * Make: a chapter's lines into clips. Each line, in each language, is cast (who says it → which
 * voice), checked (only words reach a voice), spoken by its voice's provider and kept, each lesson's
 * clips in its own folder, with one manifest: which clip says which line, and how long it plays.
 */
export async function makeVoice(spec: {
  boards: readonly BoardLines[];
  cast: Cast;
  providers: Readonly<Record<string, TtsProvider>>;
  /** Where the folders and the manifest go. */
  outDir: string;
  onSpeak?: (done: number, toMake: number, text: string) => void;
}): Promise<{ manifest: AudioManifest; made: number; reused: number }> {
  const byFolder = new Map<string, Line[]>();
  // Every line a voice can't say, all at once: the writer fixes them in one go.
  const unsaid: string[] = [];
  for (const { item, folder, lines } of spec.boards) {
    const into = byFolder.get(folder) ?? [];
    byFolder.set(folder, into);
    for (const { piece, speaker, line } of lines)
      for (const locale of LOCALES) {
        const what = said(line, locale);
        if (what === undefined) continue;
        if ("needs" in what) {
          unsaid.push(`${item.path}, ${piece} (${locale}): ${what.needs}: "${line.say[locale]}"`);
          continue;
        }
        const text = what.words;
        if (text.trim() === "") continue;
        into.push({
          key: audioKey(item.id, segment(piece), locale),
          text,
          voice: voiceFor(spec.cast, spec.providers, speaker, locale),
        });
      }
  }
  if (unsaid.length > 0)
    throw new Error(
      `A voice can't say these lines' screen words: write how each is said, as its "speak" (guides/pages.md):\n${unsaid.map((u) => `  ${u}`).join("\n")}`,
    );
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
    made,
    reused,
  };
}
