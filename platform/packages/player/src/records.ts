import { Actor, type Board, type LoggedAction, type SavedBoard, propPieces } from "@chalk/content";
import { type PartSnapshot, nodeAt, partsUnder, segment } from "@chalk/prop";
import type { BoardRuntime } from "./runtime";

/** The board as events name it: its built item's id, or its name for a board made by hand. */
export function boardKey(board: Board): string {
  return board.item?.id ?? board.name;
}

/**
 * What the board was when the learner pressed Continue: every node saved (`runtime.save()`), so
 * the event stands on its own. A prop placed with `isInEvents: false` is left out. What is saved is
 * checked fully, even where changes are checked lightly (the shipped app); a prop bug is reported,
 * never in the learner's way.
 */
export function continueRecord(board: Board, runtime: BoardRuntime): SavedBoard {
  const left = new Set(
    propPieces(board.root)
      .filter((p) => p.isInEvents === false)
      .map((p) => segment(p.name)),
  );
  const saved = runtime.save();
  const out: Record<string, SavedBoard[string]> = {};
  for (const [path, node] of Object.entries(saved)) {
    if (left.has(path)) continue;
    const name = runtime.propNames().find((n) => segment(n) === path);
    const errors = name === undefined ? [] : runtime.checkFacts(name, node.facts);
    if (errors.length > 0)
      console.error(`${path} is in a state its prop refuses: ${errors.join("; ")}`);
    out[path] = node;
  }
  return out;
}

/** What the learner saw of these nodes, as drawn: every part's address, value and words. */
export function seenParts(runtime: BoardRuntime, names: readonly string[]): PartSnapshot[] {
  const snapshot = runtime.snapshot();
  return names.flatMap((name) => {
    const node = nodeAt(snapshot, segment(name));
    return node === undefined
      ? []
      : partsUnder(node).map(({ path, value, words }) => ({
          path,
          ...(value !== undefined ? { value } : {}),
          ...(words !== undefined ? { words } : {}),
        }));
  });
}

/** Keeps every learner action the board took, in order, on its clock: the session replays from it. */
export function actionLog(runtime: BoardRuntime): { actions: LoggedAction[]; stop: () => void } {
  const actions: LoggedAction[] = [];
  const stop = runtime.onAction((r) => {
    if (r.actor !== Actor.Learner || r.refused !== undefined) return;
    actions.push({
      node: segment(r.prop),
      action: r.action,
      args: { ...(r.args as Record<string, unknown>) },
      t: r.t,
    });
  });
  return { actions, stop };
}
