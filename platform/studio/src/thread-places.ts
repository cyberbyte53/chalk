import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { type Filed, isUnanswered, propHomes } from "./comments";
import type { Reach } from "./content/build";

/**
 * Threads still waiting on a fixer (open or planned) whose place is gone: a board or piece no
 * longer built, a prop no longer in the library, a planning file or the words it quoted no longer
 * there. Each must be re-pointed (the comment tool with the thread's id and its new address) or
 * answered (ready, saying what happened to it); a thread is never left pointing at nothing.
 * Closed and withdrawn threads are history and need nothing. Parts of a piece are not checked:
 * only drawing a board says what parts it has.
 */
export function goneThreads(root: string, threads: readonly Filed[], reach: Reach): string[] {
  const props = propHomes(root);
  const out: string[] = [];
  for (const t of threads.filter(isUnanswered)) {
    const why = ((): string | undefined => {
      if (t.prop !== undefined)
        return props.has(t.prop) ? undefined : `prop ${t.prop} is no longer in the library`;
      if (t.board !== undefined) {
        const board = reach.boards[t.board];
        if (board === undefined) return `board ${t.board} is no longer built`;
        const piece = t.target?.split("/")[0];
        if (piece !== undefined && board.pieces[piece] === undefined)
          return `${t.board} has no piece ${piece} now`;
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
