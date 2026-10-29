import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { propHomes } from "./comments";
import { type BoardRecord, type Change, changesBetween } from "./content/board-record";

/**
 * What was reviewed, so a review is never done twice. When a reviewer (or the person) passes a
 * board, its record from the build (board-record.ts: its content and its props' code versions) is
 * kept, with who passed it and at which commit: `authoring/books/<book>/<chapter>/reviewed.yaml`.
 * A board whose record is the same now is still passed; one that differs shows exactly what
 * changed. Written only here, by the chalk MCP's `changes` tool.
 */

export const REVIEWED_FILE = "reviewed.yaml";

export type Passed = BoardRecord & { by: string; commit: string; at: string };

export type BoardChange =
  | { board: string; status: "unchanged"; passed: Passed }
  | { board: string; status: "new" }
  | {
      board: string;
      status: "changed";
      passed: Passed;
      /** What differs on the board itself: its pieces' setup and words, its rules. */
      content: Change[];
      /** Props whose code changed since, with the files that changed. */
      props: { type: string; files: string[] }[];
    }
  /** Passed once, and no longer built. */
  | { board: string; status: "gone"; passed: Passed };

const git = (root: string, ...args: string[]): string => {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return "";
  }
};

/** A board's chapter, from its path: class9-maths/coordinate-geometry. */
const chapterOf = (board: string): string => board.split("/").slice(0, 2).join("/");
const fileOf = (root: string, chapter: string) =>
  join(root, "authoring", "books", chapter, REVIEWED_FILE);

function readPassed(root: string, chapter: string): Record<string, Passed> {
  const file = fileOf(root, chapter);
  if (!existsSync(file)) return {};
  return (parseYaml(readFileSync(file, "utf8")) as Record<string, Passed> | null) ?? {};
}

/** Every built board at or under `under` (a content path), and its record now. */
function builtUnder(root: string, under: string): Map<string, BoardRecord> {
  const dir = join(root, "build", "review");
  const out = new Map<string, BoardRecord>();
  const walk = (d: string) => {
    if (!existsSync(d)) return;
    for (const name of readdirSync(d)) {
      const path = join(d, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (name.endsWith(".json")) {
        const board = relative(dir, path).replace(/\.json$/, "");
        if (board === under || board.startsWith(`${under}/`))
          out.set(board, JSON.parse(readFileSync(path, "utf8")) as BoardRecord);
      }
    }
  };
  walk(join(dir, chapterOf(under)));
  return out;
}

/** A file's layer, by name: walker.ts and walker-view.tsx are the walker's; any other, the core's. */
const layerOfFile = (file: string, layers: readonly string[]): string | undefined => {
  const stem = (file.split("/").at(-1) ?? "").replace(/\.(test\.)?tsx?$/, "").replace(/-view$/, "");
  return layers.includes(stem) ? stem : undefined;
};

/**
 * Whether a change to a prop's files reaches this board: always for a prop that isn't built of
 * layers, or when the files aren't known; for a host, when a core file changed (every board has
 * the core) or a file of a layer this board has on.
 */
function reaches(type: string, files: readonly string[], layers: BoardRecord["layers"]): boolean {
  const pieces = Object.values(layers ?? {}).filter((p) => p.prop === type);
  if (pieces.length === 0 || files.length === 0) return true;
  const all = pieces[0]?.all ?? [];
  const on = new Set(pieces.flatMap((p) => p.on));
  return files.some((f) => {
    const layer = layerOfFile(f, all);
    return layer === undefined || on.has(layer);
  });
}

/** What changed on every board at or under `under` since each was passed. */
export function changesUnder(root: string, under: string): BoardChange[] {
  const now = builtUnder(root, under);
  const passed = readPassed(root, chapterOf(under));
  const homes = propHomes(root);
  const out: BoardChange[] = [];
  for (const [board, record] of now) {
    const was = passed[board];
    if (was === undefined) {
      out.push({ board, status: "new" });
      continue;
    }
    if (was.stamp === record.stamp) {
      out.push({ board, status: "unchanged", passed: was });
      continue;
    }
    const props = Object.keys({ ...was.props, ...record.props })
      .filter((type) => was.props[type] !== record.props[type])
      .sort()
      .map((type) => {
        const home = homes.get(type);
        const files =
          home === undefined
            ? []
            : git(root, "diff", "--name-only", was.commit, "--", home).split("\n").filter(Boolean);
        return { type, files };
      })
      .filter((p) => reaches(p.type, p.files, record.layers));
    const content = changesBetween(was.content, record.content);
    // Its own content is the same, and no prop change reaches a layer it has: nothing to look at.
    if (content.length === 0 && props.length === 0) {
      out.push({ board, status: "unchanged", passed: was });
      continue;
    }
    out.push({ board, status: "changed", passed: was, content, props });
  }
  for (const [board, was] of Object.entries(passed))
    if ((board === under || board.startsWith(`${under}/`)) && !now.has(board))
      out.push({ board, status: "gone", passed: was });
  return out.sort((a, b) => a.board.localeCompare(b.board));
}

/**
 * Passes every board at or under `under` as it is built now, by `by`: its record is kept, and the
 * boards no longer built are dropped. Returns how many were passed.
 */
export function passUnder(root: string, under: string, by: string): number {
  const now = builtUnder(root, under);
  const chapter = chapterOf(under);
  const isHere = (board: string) => board === under || board.startsWith(`${under}/`);
  const commit = git(root, "rev-parse", "--short=12", "HEAD").trim();
  const at = new Date().toISOString();
  // Elsewhere in the chapter, as it was; here, every board as built now (one no longer built goes).
  const kept = Object.entries(readPassed(root, chapter)).filter(([board]) => !isHere(board));
  const fresh = [...now].map(([board, record]): [string, Passed] => [
    board,
    { ...record, by, commit, at },
  ]);
  const sorted = Object.fromEntries([...kept, ...fresh].sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(
    fileOf(root, chapter),
    `# Written only by the chalk MCP's changes tool (platform/studio/src/reviewed.ts). Don't edit by hand.\n${stringifyYaml(sorted, { lineWidth: 0 })}`,
  );
  return now.size;
}

/** Where a change is, by piece names only: "sheet › with › marks", not "root › children › …". */
const placeOf = (at: string) => at.replace(/^root › /, "").replace(/(^| › )children › /g, "$1");

/** A change in words: "sheet › with › marks: counts → none". */
function changeWords(c: Change): string {
  const short = (v: unknown) => {
    const text = typeof v === "string" ? v : JSON.stringify(v);
    return text.length > 80 ? `${text.slice(0, 77)}…` : text;
  };
  const at = placeOf(c.at);
  if (c.was === undefined) return `${at}: added ${short(c.now)}`;
  if (c.now === undefined) return `${at}: removed (was ${short(c.was)})`;
  return `${at}: ${short(c.was)} → ${short(c.now)}`;
}

/** The changes, as the reviewer reads them: changed boards first, with what changed on each. */
export function changesWords(changes: readonly BoardChange[]): string {
  const of = (s: BoardChange["status"]) => changes.filter((c) => c.status === s);
  const lines: string[] = [];
  for (const c of of("changed")) {
    if (c.status !== "changed") continue;
    lines.push(`${c.board}   changed since passed by ${c.passed.by} at ${c.passed.commit}`);
    for (const change of c.content) lines.push(`  ${changeWords(change)}`);
    for (const p of c.props)
      lines.push(
        `  prop ${p.type}: code changed${p.files.length > 0 ? `: ${p.files.join(", ")}` : ""}`,
      );
  }
  for (const c of of("new")) lines.push(`${c.board}   new: never passed`);
  for (const c of of("gone")) lines.push(`${c.board}   gone: passed once, no longer built`);
  const same = of("unchanged");
  if (same.length > 0)
    lines.push(
      `${same.length} unchanged since passed: ${same.map((c) => c.board.split("/").slice(-1)[0]).join(", ")}`,
    );
  return lines.join("\n") || "No boards here.";
}
