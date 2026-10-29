import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { BoardRecord } from "../content/board-record";
import type { BoardReach } from "../content/build";
import type { CodeGraph } from "./graph";
import { splitFrame } from "./index";

/**
 * The code a board runs: every declaration (and file's own statements, and stylesheet) it can
 * reach through the graph, with its fingerprint. A board whose code is the same, and whose content
 * is the same, is the same board; so a review of it still holds.
 *
 * Sound before precise: it may name more than the board runs, never less; undefined when that
 * can't be told (a prop whose package isn't known).
 * - Roots: the lines that made the board and its pieces (they reach the helpers they call), and,
 *   for each prop it places, everything that prop's package exports (the player finds a prop by
 *   its type, not by an import).
 * - The one thing left out: a host's layer the board provably never has on (`everOn`, from each
 *   layer's on-rule). A layer's files are known by name: walker.ts, walker-view.tsx.
 */
export function boardCode(
  graph: CodeGraph,
  reach: BoardReach,
  layers: BoardRecord["layers"],
  homes: ReadonlyMap<string, string>,
): Map<string, string> | undefined {
  const roots = new Set<string>([`${reach.module}#`]);
  const frames = [...(reach.stack ?? []), ...Object.values(reach.pieces).flatMap((p) => p.stack)];
  for (const frame of frames) {
    const [file, line] = splitFrame(frame);
    for (const n of graph.touched(file, [[line, line]])) roots.add(n);
  }
  const types = new Set(
    Object.values(reach.pieces).flatMap((p) => (p.type === undefined ? [] : [p.type])),
  );
  for (const type of types) {
    const home = homes.get(type);
    // A prop whose code can't be found: the board's code isn't known.
    if (home === undefined) return undefined;
    for (const entry of packageEntries(graph.root, home)) {
      if (entry.endsWith(".ts") || entry.endsWith(".tsx"))
        for (const n of graph.allExports(entry)) roots.add(n);
      else roots.add(`${entry}#`);
    }
  }

  // Layers the board can't ever have on, per prop folder: their files are left out.
  const off: { home: string; layers: Set<string> }[] = [];
  for (const type of types) {
    const home = homes.get(type);
    const pieces = Object.values(layers ?? {}).filter((p) => p.prop === type);
    if (home === undefined || pieces.length === 0) continue;
    const everOn = new Set(pieces.flatMap((p) => p.everOn));
    off.push({ home, layers: new Set(pieces[0]?.all.filter((l) => !everOn.has(l))) });
  }
  const keep = (node: string) => {
    const file = node.slice(0, node.indexOf("#"));
    return !off.some((o) => file.startsWith(`${o.home}/`) && o.layers.has(layerOfFile(file) ?? ""));
  };

  const out = new Map<string, string>();
  for (const node of [...graph.dependenciesOf(roots, keep)].sort())
    out.set(node, graph.fingerprintOf(node) ?? "-");
  return out;
}

/** A file's layer name, if it is one's: walker.ts and walker-view.tsx are the walker's. */
export const layerOfFile = (file: string): string | undefined =>
  file
    .split("/")
    .at(-1)
    ?.replace(/\.tsx?$/, "")
    .replace(/-view$/, "");

/** One fingerprint for all of a board's code: what a review keeps. */
export const digestOf = (code: ReadonlyMap<string, string>): string =>
  createHash("sha256")
    .update([...code].map(([n, h]) => `${n}=${h}`).join("\n"))
    .digest("hex")
    .slice(0, 16);

/** The files a prop package offers (its package.json `exports`), from the repo root. */
function packageEntries(root: string, home: string): string[] {
  const file = join(root, home, "package.json");
  if (!existsSync(file)) return [];
  const exports = (JSON.parse(readFileSync(file, "utf8")) as { exports?: unknown }).exports;
  const values =
    typeof exports === "string"
      ? [exports]
      : Object.values((exports ?? {}) as Record<string, unknown>).filter(
          (v): v is string => typeof v === "string",
        );
  return values.map((v) => join(home, v.replace(/^\.\//, "")));
}
