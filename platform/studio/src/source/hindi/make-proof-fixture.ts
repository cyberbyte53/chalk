import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { expand } from "../build";
import { type PageFile, pageFileSchema } from "../schema";

/**
 * Makes `proof.fixture.yaml`, what the Hindi repair is proved on (hindi.test.ts): the proof chapter's
 * Hindi readings (each span's words as the PDF gives them, and the agent's reading of it, the key),
 * and every other Hindi word of those pages. Made once from the page files and the words files (not
 * in git), so the test needs neither: `npx tsx platform/studio/src/source/hindi/make-proof-fixture.ts`.
 */

const ROOT = join(import.meta.dirname, "../../../../..");
const CHAPTER = "class9-science/cell-the-building-block-of-life";
const PAGES = join(ROOT, "authoring/books", CHAPTER, "source/hi/pages");
const WORDS = join(ROOT, ".chalk-source-pages", CHAPTER, "hi");

/** A words file's words by id (`L12.3`), in order, without the `*` that marks a broken one. */
export function readWordsFile(text: string): Map<string, string> {
  const words = new Map<string, string>();
  for (const line of text.split("\n")) {
    const m = /^L(\d+) \[[^\]]*\] (.*)$/.exec(line);
    if (m === null) continue;
    for (const w of (m[2] ?? "").matchAll(/(?:^| )(\d+):\*?(.*?)(?= \d+:|$)/g))
      words.set(`L${m[1]}.${w[1]}`, w[2] ?? "");
  }
  return words;
}

/** A reading: its page, its span, the span's words as the PDF gives them, and the agent's reading. */
export type ProofReading = [page: number, span: string, pdf: string[], reading: string];
/** A Hindi word no reading covers: its page, its id, and the word as the PDF gives it. */
export type ProofWord = [page: number, id: string, pdf: string];

const DEVANAGARI = /[\u0900-\u097F]/u;

function main() {
  const readings: ProofReading[] = [];
  const unread: ProofWord[] = [];
  for (const name of readdirSync(PAGES).sort()) {
    const file: PageFile = pageFileSchema.parse(parse(readFileSync(join(PAGES, name), "utf8")));
    const n = name.replace(/\D/g, "");
    const words = readWordsFile(readFileSync(join(WORDS, `page-${n}.words.txt`), "utf8"));
    const read = new Set<string>();
    for (const block of file.blocks)
      for (const [span, reading] of Object.entries(block.read ?? {})) {
        const ids = expand(span, words);
        for (const id of ids) read.add(id);
        readings.push([file.page, span, ids.map((id) => words.get(id) ?? ""), reading]);
      }
    for (const [id, pdf] of words)
      if (!read.has(id) && DEVANAGARI.test(pdf)) unread.push([file.page, id, pdf]);
  }
  // One entry a line (JSON is YAML): `[page, span, pdf words, reading]`, `[page, id, pdf word]`.
  const lines = (list: unknown[]) => list.map((x) => `  - ${JSON.stringify(x)}`).join("\n");
  writeFileSync(
    join(import.meta.dirname, "proof.fixture.yaml"),
    `# Made by make-proof-fixture.ts from ${CHAPTER}'s Hindi page files and words files.\nreadings:\n${lines(readings)}\nunread:\n${lines(unread)}\n`,
  );
  console.log(`${readings.length} readings, ${unread.length} other Hindi words`);
}

if (process.argv[1] === import.meta.filename) main();
