import { Actor, type EventEntry, idOf, piecePath } from "@chalk/content";
import { BOARD, namesOf, segment } from "@chalk/prop";
import { boardPathOf } from "./recorder";
import type { BoardRuntime } from "./runtime";

/**
 * Plays a board's recorded events again (docs/events.md), the one way anything does: the sandbox's
 * runs and, later, real students' sessions. Boards are deterministic, so its causes, played in
 * order on a fresh board, bring it to where it was. The reverse of recorder.ts: an event names a
 * piece by its id (a hash of its path) and an action by its last part.
 *
 * Only what the student or Jugnu did is played: signals are the board's own replies, and the
 * lesson's own causes (its start) happen again by themselves. A cause that is a view's raw signal
 * (`{ signal }`) is not played yet. Best effort for a real session where a student acted in the
 * middle of an animation (events.md, Care).
 */

type Def = { children?: Readonly<Record<string, Def>> };

/** Every node's address on the board (a piece, its children within), by the id events carry. */
export function addressesOf(runtime: BoardRuntime): Map<string, string> {
  const path = boardPathOf(runtime.board);
  const out = new Map<string, string>();
  const walk = (address: string, def: Def | undefined) => {
    out.set(idOf(piecePath(path, address)), address);
    for (const [name, child] of Object.entries(def?.children ?? {}))
      walk(`${address}/${segment(name)}`, child);
  };
  for (const name of runtime.propNames())
    walk(segment(name), runtime.getDef(name) as unknown as Def);
  return out;
}

/** The causes among events, in order, as `call`s: the piece, its dotted action, the args, the actor. */
export function causesOf(
  runtime: BoardRuntime,
  events: readonly EventEntry[],
): { prop: string; action: string; args: Readonly<Record<string, unknown>>; actor: Actor }[] {
  const addresses = addressesOf(runtime);
  return events.flatMap((e) => {
    if (e.kind !== "cause") return [];
    const payload = e.payload as { action?: string; args?: Readonly<Record<string, unknown>> };
    if (payload.action === undefined) return [];
    // Only what someone did: the board's own doings (its start) happen again by themselves.
    if (e.actor !== Actor.Learner && e.actor !== Actor.Jugnu) return [];
    const actor = e.actor;
    if (e.node === null)
      return [{ prop: BOARD, action: payload.action, args: payload.args ?? {}, actor }];
    const address = addresses.get(e.node);
    if (address === undefined) throw new Error(`No node ${e.node} on ${runtime.board.name}`);
    const [piece = "", ...inside] = namesOf(address);
    return [
      {
        prop: piece,
        action: [...inside, payload.action].join("."),
        args: payload.args ?? {},
        actor,
      },
    ];
  });
}

/** Plays the causes among events on a board, in order, each settled before the next. */
export async function replay(runtime: BoardRuntime, events: readonly EventEntry[]): Promise<void> {
  for (const c of causesOf(runtime, events)) {
    await runtime.call(c.prop, c.action, c.args, c.actor);
    runtime.settle();
  }
}
