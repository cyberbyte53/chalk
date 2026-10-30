import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { type BoardItem, boardOf, moduleOf } from "@chalk/author";
import { Kind } from "@chalk/content";
import { type ScriptLine, scriptOf } from "@chalk/player";

/**
 * Collect: every line a chapter's boards say. The boards are made from the built chapter (build/),
 * the way the app makes them, and read for their script (`scriptOf`).
 */

/** One board's lines, and where its clips go: its lesson's folder under the chapter. */
export type BoardLines = { item: BoardItem; folder: string; lines: readonly ScriptLine[] };

/** Every built page and question under a folder of build/. */
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

export async function chapterLines(spec: {
  root: string;
  /** "class9-maths/coordinate-geometry" */
  chapter: string;
  /** Loads a module under content/ ("class9-maths/…/overview.ts"). */
  load: (module: string) => Promise<Readonly<Record<string, unknown>>>;
  roleOf: (type: string) => string | undefined;
}): Promise<BoardLines[]> {
  const out: BoardLines[] = [];
  for (const item of itemsUnder(join(spec.root, "build", spec.chapter))) {
    const board = boardOf(item, await spec.load(moduleOf(item)), spec.roleOf);
    out.push({
      item,
      folder: item.source.path.slice(spec.chapter.length + 1),
      lines: scriptOf(board),
    });
  }
  return out;
}
