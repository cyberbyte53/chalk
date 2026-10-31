import {
  type AudioManifest,
  LOCALES,
  type Locale,
  blanksOf,
  fixedParts,
  numberLibrary,
  phraseKey,
} from "@chalk/content";
import { type ScriptLine, linePhrases, spokenWords } from "@chalk/player";
import { type Cast, voiceFor } from "./cast";
import { type Line, speakLines } from "./clips";
import type { BoardLines } from "./lines";
import { mathsReader } from "./maths";
import type { TtsProvider } from "./providers/provider";
import { type Said, said } from "./said";

/**
 * Make: a chapter's lines into clips, and its script. Each line, in each language, is read for what
 * is said (`said`: words a person wrote, or what is missing and a suggested draft) and cast (who
 * says it → which voice). A clip says a phrase (spoken.ts): a fixed line is one; a line with blanks
 * has its fixed parts made, and its values are said from each voice's number library (made once,
 * shared by every line that voice says). One manifest says which clip says each phrase, and how long
 * it plays. Lines that still need their spoken words get no clip; they are in the script with what
 * to write, and listed.
 */

/** Where a chapter's clips go, beside its manifest: one folder, shared by its lessons. */
const CLIPS = "clips";

/** One line of a board's script, as made: what is shown, what is said, and its clip's key. */
export type ScriptEntry = {
  line: string;
  /** Its piece; none for narration. */
  piece?: string;
  speaker: string;
  /** When it is heard: the board opening, its piece appearing, a moment, or a rule saying it. */
  cue: ScriptLine["cue"];
  /** When it is heard, as the event it waits for (`town.walker.arrived · x 4, y 5`). */
  moment: string;
  /** The piece it is about. */
  about?: string;
  /** What its piece says of itself (a text's words), shown beside what is said. */
  shown: Readonly<Record<Locale, string | undefined>>;
  said: Readonly<Record<Locale, Said | undefined>>;
  /** What is said, as phrases (a line with blanks: its example), by language. */
  phrases: Readonly<Record<Locale, readonly string[] | undefined>>;
  /** For a line with blanks: the values its example is said with (its `where`, else 1). */
  example?: Readonly<Record<string, unknown>>;
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
  /** Every phrase to make, by its key. */
  const toMake = new Map<string, Line>();
  const make = (speaker: string, locale: Locale, words: string) =>
    void toMake.set(phraseKey(speaker, locale, words), {
      key: phraseKey(speaker, locale, words),
      text: words,
      voice: voiceFor(spec.cast, spec.providers, speaker, locale),
    });
  const unsaid: string[] = [];
  const script: ChapterScript = { boards: [] };
  for (const { item, lines } of spec.boards) {
    const entries: ScriptEntry[] = [];
    for (const line of lines) {
      const { speaker, cue } = line;
      const name = line.line;
      const saidBy = Object.fromEntries(
        LOCALES.map((l) => [l, said(line, l, readMaths)]),
      ) as Record<Locale, Said | undefined>;
      const written = (l: Locale) => line.says?.[l] ?? line.own?.[l] ?? "";
      const blanks = [...new Set(LOCALES.flatMap((l) => blanksOf(written(l))))];
      const example =
        blanks.length === 0
          ? undefined
          : Object.fromEntries(blanks.map((b) => [b, line.where?.[b] ?? 1]));
      const phrases = Object.fromEntries(
        LOCALES.map((l) => [
          l,
          saidBy[l] !== undefined && "words" in (saidBy[l] as Said)
            ? linePhrases(written(l), l, example)
            : undefined,
        ]),
      ) as Record<Locale, string[] | undefined>;
      entries.push({
        line: name,
        ...(line.piece === undefined ? {} : { piece: line.piece }),
        speaker,
        cue,
        moment: line.moment,
        ...(line.about === undefined ? {} : { about: line.about }),
        shown: Object.fromEntries(LOCALES.map((l) => [l, line.own?.[l]])) as Record<Locale, string>,
        said: saidBy,
        phrases,
        ...(example === undefined ? {} : { example }),
      });
      for (const locale of LOCALES) {
        const what = saidBy[locale];
        if (what === undefined) continue;
        if ("needs" in what) {
          unsaid.push(
            `${item.path}, ${name} (${locale}): ${what.needs}: "${written(locale)}"${what.suggested === undefined ? "" : `\n      suggested: "${what.suggested}"`}`,
          );
          continue;
        }
        if (example === undefined) {
          for (const words of linePhrases(written(locale), locale) ?? [])
            make(speaker, locale, words);
          continue;
        }
        // A line with blanks: its own words, and the pieces any value is said with.
        for (const words of fixedParts(spokenWords(written(locale), locale) ?? ""))
          make(speaker, locale, words);
        for (const words of numberLibrary(locale)) make(speaker, locale, words);
      }
    }
    script.boards.push({ id: item.id, path: item.path, lines: entries });
  }
  const all = [...toMake.values()];
  const providers = [...new Set(all.map((l) => l.voice.provider))];
  for (const provider of providers) {
    const voices = new Set(
      all.filter((l) => l.voice.provider === provider).map((l) => l.voice.voice),
    );
    const missing = await provider.missingVoices([...voices]);
    if (missing.length > 0)
      throw new Error(`These ${provider.id} voices aren't installed: ${missing.join(", ")}`);
  }
  try {
    const done = await speakLines(all, spec.outDir, CLIPS, spec.onSpeak);
    return { manifest: done.manifest, script, unsaid, made: done.made, reused: done.reused };
  } finally {
    for (const provider of providers) await provider.close?.();
  }
}
