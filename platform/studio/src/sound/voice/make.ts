import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  LOCALES,
  type Locale,
  NARRATOR,
  type SoundList,
  blanksOf,
  clipKey,
  fixedParts,
  numberLibrary,
} from "@chalk/content";
import { type ScriptLine, linePhrases, spokenWords } from "@chalk/player";
import { type Cast, voiceFor } from "./cast";
import { type Line, clipFile, speakLines } from "./clips";
import { mathsReader } from "./maths";
import type { TtsProvider } from "./providers/provider";
import { type Said, said } from "./said";

/**
 * Voicing a chapter (platform/docs/sound.md): its lines into clips in its own sound folder, and its
 * script. Each line, in each language, is read for what is said (`said`: words a person wrote, or
 * what is missing and a suggested draft) and cast (who says it → which voice). A clip says a phrase
 * (spoken.ts), keyed by its voice and words: a fixed line is one; a line with blanks has its fixed
 * parts made, and its values are said from its voice's number pieces. Only missing clips are made;
 * clips nothing says any more are removed. The folder's `sound.json` lists every clip, saying what
 * it says. Lines that still need their spoken words get no clip, and are listed.
 */

/** The chapter's sound list, in its sound folder. */
export const SOUND_LIST = "sound.json";

/** One board's lines (its script, as the player reads it). */
export type BoardLines = { id: string; path: string; lines: readonly ScriptLine[] };

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

export async function voiceChapter(spec: {
  /** The chapter's sound folder: content/<book>/<chapter>/sound. */
  soundDir: string;
  boards: readonly BoardLines[];
  /** Every board of the chapter is here: clips none of them says may go. */
  isWhole: boolean;
  cast: Cast;
  providers: Readonly<Record<string, TtsProvider>>;
  onSpeak?: (done: number, toMake: number, text: string) => void;
}): Promise<{
  list: SoundList;
  script: ChapterScript;
  /** Lines that need their spoken words written, each with what is missing (and a suggestion). */
  unsaid: string[];
  made: number;
}> {
  const readMaths = await mathsReader();
  /** Every clip to have, by its key (voice and words). */
  const toHave = new Map<string, Line & { locale: Locale }>();
  const speakers = new Map<string, Record<Locale, string>>();
  // A speaker said anything is listed with their voice in every language.
  const speak = (speaker: string) => {
    if (!speakers.has(speaker))
      speakers.set(
        speaker,
        Object.fromEntries(
          LOCALES.map((l) => [l, voiceFor(spec.cast, spec.providers, speaker, l).ref]),
        ) as Record<Locale, string>,
      );
  };
  const have = (speaker: string, locale: Locale, words: string) => {
    speak(speaker);
    const voice = voiceFor(spec.cast, spec.providers, speaker, locale);
    const key = clipKey(voice.ref, words);
    toHave.set(key, { key, text: words, voice, locale });
  };
  const unsaid: string[] = [];
  const script: ChapterScript = { boards: [] };
  for (const { id, path, lines } of spec.boards) {
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
            `${path}, ${name} (${locale}): ${what.needs}: "${written(locale)}"${what.suggested === undefined ? "" : ` (suggested: "${what.suggested}")`}`,
          );
          continue;
        }
        if (example === undefined) {
          for (const words of linePhrases(written(locale), locale) ?? [])
            have(speaker, locale, words);
          continue;
        }
        // A line with blanks: its own words, and the pieces any value is said with.
        for (const words of fixedParts(spokenWords(written(locale), locale) ?? ""))
          have(speaker, locale, words);
        for (const words of numberLibrary(locale)) have(speaker, locale, words);
      }
    }
    script.boards.push({ id, path, lines: entries });
  }
  // The narrator is every chapter's, said or not.
  speak(NARRATOR);
  const all = [...toHave.values()];
  const kept = (line: Line) => existsSync(join(spec.soundDir, clipFile(line)));
  const missing = all.filter((l) => !kept(l));
  const providers = [...new Set(missing.map((l) => l.voice.provider))];
  for (const provider of providers) {
    const voices = [
      ...new Set(missing.filter((l) => l.voice.provider === provider).map((l) => l.voice.voice)),
    ];
    const absent = await provider.missingVoices(voices);
    if (absent.length > 0)
      throw new Error(`These ${provider.id} voices aren't installed: ${absent.join(", ")}`);
  }
  let made = 0;
  let phrases: Awaited<ReturnType<typeof speakLines>>["phrases"] = {};
  try {
    const done = await speakLines(all, spec.soundDir, ".", spec.onSpeak);
    phrases = done.phrases;
    made = done.made;
  } finally {
    for (const provider of providers) await provider.close?.();
  }
  const list: SoundList = {
    speakers: Object.fromEntries([...speakers].sort(([a], [b]) => a.localeCompare(b))),
    clips: all
      .map((l) => {
        const clip = phrases[l.key];
        if (clip === undefined) throw new Error(`No clip was made for "${l.text}"`);
        return {
          file: clip.file,
          voice: l.voice.ref,
          locale: l.locale,
          words: l.text,
          seconds: clip.seconds,
        };
      })
      .sort((a, b) => a.voice.localeCompare(b.voice) || a.words.localeCompare(b.words)),
  };
  // Clips nothing says any more go, but only when every board was voiced (a board that didn't
  // build this time keeps its clips); the list is written only when it changed.
  if (spec.isWhole) {
    const wanted = new Set([SOUND_LIST, ...list.clips.map((c) => c.file)]);
    for (const entry of readdirSync(spec.soundDir, { withFileTypes: true }))
      if (entry.isFile() && !wanted.has(entry.name)) rmSync(join(spec.soundDir, entry.name));
  }
  const text = `${JSON.stringify(list, null, 2)}\n`;
  const file = join(spec.soundDir, SOUND_LIST);
  if (!existsSync(file) || readFileSync(file, "utf8") !== text) writeFileSync(file, text);
  return { list, script, unsaid, made };
}
