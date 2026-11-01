import { contentAddress } from "@chalk/content/address";
import type { PropPage } from "@chalk/player";

export type { PropPage };

/**
 * Props in words, from their pages (@chalk/player's prop-pages.ts) and what the build recorded
 * about every board (build/reach.json): a line each to choose from, and how each is used. What the
 * chalk MCP's `show` answers at library/props/ and at a prop's address.
 */

/** How one board uses a prop where it places it. */
export type Use = {
  board: string;
  piece: string;
  /** The fields it sets where it places it. */
  given: readonly string[];
  /** The inputs its rules feed. */
  binds: readonly string[];
  /** The actions its scripts call. */
  calls: readonly string[];
};

/** What the build recorded about each board's pieces (build/reach.json), as far as uses go. */
export type PiecesReach = {
  boards: Record<
    string,
    {
      pieces: Record<
        string,
        {
          type?: string;
          given?: readonly string[];
          binds?: readonly string[];
          calls?: readonly string[];
        }
      >;
    }
  >;
};

/** Every board's use of each prop type, from what the build recorded (build/reach.json). */
export function usesOf(reach: PiecesReach): Map<string, Use[]> {
  const out = new Map<string, Use[]>();
  for (const [board, b] of Object.entries(reach.boards))
    for (const [piece, p] of Object.entries(b.pieces)) {
      if (p.type === undefined) continue;
      const list = out.get(p.type) ?? [];
      list.push({
        board,
        piece,
        given: p.given ?? [],
        binds: p.binds ?? [],
        calls: p.calls ?? [],
      });
      out.set(p.type, list);
    }
  return out;
}

const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"}`;

/** One line, to choose from: its address, role, what it is for, and how widely it is used. */
export function propLine(page: PropPage, uses: readonly Use[]): string {
  return `${page.address} · ${page.role} · ${page.purpose} · used on ${plural(new Set(uses.map((u) => u.board)).size, "board")}`;
}

/**
 * Fields and actions by how many boards use them: the settings and lesson actions no board uses
 * (its own state, which its actions change, needn't be), and whatever only one board uses. Where a
 * prop carries one board's special case shows here, measured.
 */
export function fieldUse(
  page: PropPage,
  uses: readonly Use[],
): { unused: string[]; once: Map<string, string> } {
  const byWhom = new Map<string, Set<string>>();
  const note = (name: string, board: string) => {
    if (!byWhom.has(name)) byWhom.set(name, new Set());
    byWhom.get(name)?.add(board);
  };
  for (const u of uses) for (const n of [...u.given, ...u.binds, ...u.calls]) note(n, u.board);
  const unused: string[] = [];
  const once = new Map<string, string>();
  // A learner's action is used wherever the prop is: the student does it, not the board.
  const learner = new Set(page.actions.filter((a) => a.isByLearner).map((a) => a.name));
  const changed = new Set(page.fields.filter((f) => f.changedBy.length > 0).map((f) => f.name));
  for (const name of [...page.fields.map((f) => f.name), ...page.actions.map((a) => a.name)]) {
    if (learner.has(name)) continue;
    const boards = byWhom.get(name);
    // A field its own actions change is its state: no board need set it.
    if (boards === undefined && !changed.has(name)) unused.push(name);
    else if (boards !== undefined && boards.size === 1) once.set(name, [...boards][0] as string);
  }
  return { unused, once };
}

/** The library, or one package of it: a line per prop, by package. */
export function libraryText(
  pages: readonly PropPage[],
  uses: ReadonlyMap<string, readonly Use[]>,
  pkg?: string,
): string {
  const packages = [...new Set(pages.map((p) => p.pkg))];
  if (pkg !== undefined && !packages.includes(pkg))
    throw new Error(
      `No prop package "${pkg}" under library/props (packages: ${packages.join(", ")})`,
    );
  const out: string[] = [];
  for (const name of pkg === undefined ? packages : [pkg]) {
    const mine = pages.filter((p) => p.pkg === name);
    out.push(`library/props/${name}: ${plural(mine.length, "prop")}`);
    for (const p of mine) out.push(`  ${propLine(p, uses.get(p.type) ?? [])}`);
  }
  out.push(
    "",
    "Look at a prop's address for everything about it: its fields, what can be done to it, its parts, and every board that uses it.",
  );
  return out.join("\n");
}

/** How a prop is used: every board that places it and what each uses, then what no board uses. */
export function useText(page: PropPage, uses: readonly Use[]): string {
  const boards = new Set(uses.map((u) => u.board));
  const out = [`for:      ${page.purpose}`];
  if (uses.length === 0) {
    out.push("used on:  no board yet");
    return out.join("\n");
  }
  out.push(`used on:  ${plural(boards.size, "board")}`);
  for (const u of uses) {
    const what = [
      u.given.length > 0 ? `sets ${u.given.join(", ")}` : "",
      u.binds.length > 0 ? `feeds ${u.binds.join(", ")}` : "",
      u.calls.length > 0 ? `calls ${u.calls.join(", ")}` : "",
    ].filter(Boolean);
    out.push(
      `          ${contentAddress(u.board, u.piece)}${what.length > 0 ? `  ${what.join(" · ")}` : "  as it is"}`,
    );
  }
  const { unused, once } = fieldUse(page, uses);
  if (unused.length > 0) out.push(`no board uses: ${unused.join(", ")}`);
  if (once.size > 0)
    out.push(
      `one board uses: ${[...once].map(([name, board]) => `${name} (${board.split("/").at(-1)})`).join(", ")}`,
    );
  return out.join("\n");
}
