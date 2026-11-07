import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { Locale } from "@chalk/content";
import { PNG } from "pngjs";
import { type Block, type BuiltPage, NO_CAUSE, type PageTools, buildPage } from "./build";
import { type Built, JoinSide, asciiDigits, buildChapter, digitsOf } from "./chapter";
import {
  type Issue,
  NOT_PROOFREAD,
  type Numbered,
  answer,
  chapterIssues,
  issueLine,
  numbered,
  pageIssues,
  readingQuestion,
} from "./check";
import { lettersOnly } from "./check";
import { showsOn } from "./crop";
import { type Extract, PAGE_PREFIX, chapterOf, extractPaths, readYaml, sha256 } from "./files";
import { isCandidate } from "./hindi/candidates";
import { isKnownWord } from "./hindi/list";
import { hasHindi } from "./hindi/script";
import { cachedObjects } from "./objects";
import { PAGE_SCALE, numberedPages, renderPages } from "./read";
import {
  type Book,
  CROPPED,
  type Item,
  ItemKind,
  Maker,
  type PageFile,
  SourceFile,
  type Term,
  type Tool,
  bookSchema,
  itemsSchema,
  pageFileName,
  pageFileSchema,
  termsSchema,
} from "./schema";
import { TOOL_VERSIONS } from "./tools";

/**
 * Once boards.md cites an item, its id never changes: what a later build would change of a cited
 * item, found before it is written.
 */

/** The ids boards.md cites: a list item's bold id, and each line's last bracketed group. */
export function citedIn(markdown: string): Set<string> {
  const out = new Set<string>();
  for (const line of markdown.split("\n")) {
    const bold = /^\s*-\s+\*\*([\d.]+)\*\*/.exec(line)?.[1];
    if (bold !== undefined) out.add(bold);
    const last = [...line.matchAll(/\(([^()]*)\)/g)].at(-1)?.[1];
    for (const x of (last ?? "").split(/[,;]/).map((s) => s.trim()))
      if (/^\d+(\.\d+)*$/.test(x)) out.add(x);
  }
  return out;
}

/**
 * Whether an id still names the block it named: the same kind, and at least half its words. A
 * reading fixed keeps the block; a block moved into the id doesn't.
 */
export function isSameBlock(was: Item, now: Item | undefined): boolean {
  if (now === undefined || was.kind !== now.kind) return false;
  const words = (t: string) =>
    new Set(
      t
        .split(/\s+/)
        .map(lettersOnly)
        .filter((w) => w !== ""),
    );
  const a = words(was.text);
  const b = words(now.text);
  const shared = [...a].filter((w) => b.has(w)).length;
  return Math.max(a.size, b.size) === 0 || shared / Math.max(a.size, b.size) >= 0.5;
}

/** The cited ids (in the chapter's boards.md) that the build would move: each a problem. */
export function citedChanges(x: Extract, was: readonly Item[], now: readonly Item[]): string[] {
  if (x.lang !== Locale.En) return [];
  const boards = join(x.dir, "..", "..", "..", "boards.md");
  if (!existsSync(boards)) return [];
  const byId = new Map(now.map((i) => [i.id, i]));
  const cited = citedIn(readFileSync(boards, "utf8"));
  return was
    .filter((i) => cited.has(i.id) && !isSameBlock(i, byId.get(i.id)))
    .map(
      (i) =>
        `${i.id} is cited in boards.md and would change: it was "${i.text.slice(0, 50)}", the page files build "${byId.get(i.id)?.text.slice(0, 50) ?? "(nothing)"}"`,
    );
}
