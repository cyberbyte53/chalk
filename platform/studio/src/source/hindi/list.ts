import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
import { parse } from "yaml";

/**
 * The Hindi word list (platform/docs/plans/sources.md, "The Hindi word list"): `words.txt.gz` (gzipped: 1.3 MB, not 8), made by
 * make-list.ts from LibreOffice's hi_IN dictionary (GPL: COPYING, beside it). It has some junk, so
 * it only decides between candidates; it never makes a word. Used only by the authoring tools.
 */

let list: ReadonlySet<string> | undefined;

/** Every word in the list, read once. */
export function hindiWords(): ReadonlySet<string> {
  list ??= new Set(
    gunzipSync(readFileSync(join(import.meta.dirname, "words.txt.gz")))
      .toString("utf8")
      .split("\n")
      .filter((w) => w !== ""),
  );
  return list;
}

/** Whether a word (Devanagari letters only) is in the list. */
const inHindiList = (word: string): boolean => hindiWords().has(word.normalize("NFC"));

const BOOKS = join(import.meta.dirname, "../../../../../authoring/books");

let learned: ReadonlySet<string> | undefined;

/**
 * The words agents answered as real, as printed ("word अपररूप": "a real word ..."), in any book's
 * Hindi page files: what the list lacks and the books have taught us. Read once. `CHALK_LEARNED_FROM`
 * keeps only the books whose path holds it (a measure on books the words didn't come from).
 */
function learnedWords(): ReadonlySet<string> {
  if (learned !== undefined) return learned;
  const from = process.env.CHALK_LEARNED_FROM;
  const words = new Set<string>();
  const dirs = (d: string) => (existsSync(d) ? readdirSync(d) : []);
  for (const book of dirs(BOOKS))
    for (const chapter of dirs(join(BOOKS, book))) {
      const pages = join(BOOKS, book, chapter, "source", "hi", "pages");
      if (from !== undefined && !join(book, chapter).includes(from)) continue;
      for (const f of dirs(pages).filter((x) => x.endsWith(".yaml"))) {
        const file = parse(readFileSync(join(pages, f), "utf8")) as {
          answers?: Record<string, string>;
        };
        for (const [id, answer] of Object.entries(file?.answers ?? {}))
          if (id.startsWith("word ") && /real word/i.test(answer))
            words.add(id.slice(5).normalize("NFC"));
      }
    }
  learned = words;
  return learned;
}

/** Whether a word is known: in the list, or answered as real in some book. What the repair judges by. */
export const isKnownWord = (word: string): boolean =>
  inHindiList(word) || learnedWords().has(word.normalize("NFC"));
