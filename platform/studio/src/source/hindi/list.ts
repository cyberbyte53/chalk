import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";

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
export const inHindiList = (word: string): boolean => hindiWords().has(word.normalize("NFC"));
