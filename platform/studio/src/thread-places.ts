import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { type Filed, Status, propHomes } from "./comments";
import type { Reach } from "./content/build";

/**
 * Threads not yet answered (open or planned, whoever's turn it is) whose place is gone: a board or piece no
 * longer built, a prop no longer in the library, a planning file or the words it quoted no longer
 * there. Each must be re-pointed (the comment tool with the thread's id and its new address) or
 * answered (ready, saying what happened to it); a thread is never left pointing at nothing.
 * Closed and withdrawn threads are history and need nothing. Parts of a piece are not checked
 * (only drawing a board says what parts it has), but its line is: a board knows what it says.
 */
export function goneThreads(root: string, threads: readonly Filed[], reach: Reach): string[] {
  const props = propHomes(root);
  const out: string[] = [];
  for (const t of threads.filter((x) => x.status === Status.Open || x.status === Status.Planned)) {
    const why = ((): string | undefined => {
      if (t.prop !== undefined)
        return props.has(t.prop) ? undefined : `prop ${t.prop} is no longer in the library`;
      if (t.board !== undefined) {
        const board = reach.boards[t.board];
        if (board === undefined) return `board ${t.board} is no longer built`;
        const target = t.target;
        if (target === undefined) return undefined;
        const [piece, part] = target.split("/");
        // A line is part of the board: a line of its own by its name, a piece's as "<piece>/said".
        if (board.pieces[piece ?? ""] === undefined) {
          // A bare name may be a line of the board's own; with a part, it can only be a piece.
          if (part === undefined && board.lines?.[target] !== undefined) return undefined;
          return `${t.board} has no ${part === undefined ? "piece or line" : "piece"} ${piece} now`;
        }
        if (part === "said" && board.lines?.[piece ?? ""] === undefined)
          return `${t.board}'s ${piece} says nothing now`;
        return undefined;
      }
      if (t.source?.startsWith("authoring/") === true) {
        const file = t.source.replace(/:\d+(-\d+)?$/, "");
        if (!existsSync(join(root, file))) return `${file} is gone`;
        if (
          t.quote !== undefined &&
          !readFileSync(join(root, file), "utf8").includes(t.quote.split("\n")[0] ?? "")
        )
          return `${file} no longer has "${t.quote.slice(0, 60)}"`;
      }
      return undefined;
    })();
    if (why !== undefined) out.push(`${t.id} [${t.status}]: ${why}`);
  }
  return out;
}
