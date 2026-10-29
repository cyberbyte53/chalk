import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
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
 */
/**
 * A board's code: one fingerprint of all of it (its roots' deep fingerprints, graph.ts), and, to
 * name what changed, every node it reaches with its own fingerprint.
 */
export type BoardCode = { digest: string; nodes: () => Map<string, string> };

export function boardCode(
  graph: CodeGraph,
  reach: BoardReach,
  homes: ReadonlyMap<string, string>,
): BoardCode | undefined {
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

  const sorted = [...roots].sort();
  return {
    digest: createHash("sha256")
      .update(sorted.map((r) => `${r}=${graph.deepFingerprintOf(r)}`).join("\n"))
      .digest("hex")
      .slice(0, 16),
    nodes: () =>
      new Map(
        [...graph.dependenciesOf(sorted)].sort().map((n) => [n, graph.fingerprintOf(n) ?? "-"]),
      ),
  };
}

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
