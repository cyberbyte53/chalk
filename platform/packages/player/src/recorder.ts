import {
  Actor,
  type Board,
  type EventEntry,
  type PayloadOf,
  idOf,
  piecePath,
} from "@chalk/content";
import type { RecordEvent } from "@chalk/events";
import { BOARD } from "@chalk/prop";
import type { ActionRecord, BoardRuntime, SignalRecord } from "./runtime";

/** A board's path in the course tree (its item's), or its name for a board made by hand. */
export const boardPathOf = (board: Board): string => board.item?.path ?? board.name;

/** Its id, as events carry it. */
export const boardIdOf = (board: Board): string => board.item?.id ?? idOf(board.name);

export type BoardRecorder = {
  /** The board opened: how. */
  open: (payload: PayloadOf<"open">) => void;
  /** Something around the board: a line's audio failed, the app passed it. `node`: the piece's address. */
  app: (what: string, details?: Readonly<Record<string, unknown>>, node?: string) => void;
  /** One turn with Jugnu on this board. */
  jugnu: (payload: PayloadOf<"jugnu">) => void;
  /** A pointer went down on the board, or came up: a drag between is one entry. */
  gesture: (isDown: boolean) => void;
  /** Turns recording off and on (Jugnu trying something on the phone's own board). */
  pause: (isPaused: boolean) => void;
  /** The board closed: the last entries, and no more. */
  close: () => void;
};

/**
 * The one producer for boards (docs/events.md): everything the learner or Jugnu does on the board is
 * recorded, with every signal it raises and the cause that set it off. Nothing about it is written
 * per board, prop or signal. Not recorded: what the lesson's own rules do (consequences), and a
 * prop's own steps over time.
 */
export function recordBoard(
  runtime: BoardRuntime,
  record: RecordEvent,
  opening: string,
): BoardRecorder {
  const board = runtime.board;
  const path = boardPathOf(board);
  const place = {
    opening,
    board: boardIdOf(board),
    version: board.item?.version ?? null,
  };
  const ids = new Map<string, string>();
  const nodeId = (address: string | null): string | null => {
    if (address === null) return null;
    let id = ids.get(address);
    if (id === undefined) {
      id = idOf(piecePath(path, address));
      ids.set(address, id);
    }
    return id;
  };
  /** The runtime's numbers (ActionRecord.n) of the causes recorded, to their seqs. */
  const seqOf = new Map<number, number>();
  let isPaused = false;
  let isClosed = false;
  let isDown = false;

  // A drag waits here while it lasts: one entry when it ends, or when anything else comes first.
  let pending:
    | {
        n: number[];
        node: string | null;
        actor: Actor;
        payload: PayloadOf<"cause">;
        at: number;
        steps: number;
      }
    | undefined;
  const put = (entry: EventEntry): number => {
    flush();
    return record(entry);
  };
  function flush(): void {
    if (pending === undefined) return;
    const { n, node, actor, payload, at, steps } = pending;
    pending = undefined;
    const merged = steps > 1 ? { ...payload, startAt: at, steps } : payload;
    const seq = record({ ...place, actor, node: nodeId(node), kind: "cause", payload: merged });
    for (const one of n) seqOf.set(one, seq);
  }

  const where = (prop: string, member: string) => {
    if (prop === BOARD) return { node: null, member };
    const { node, member: inside } = runtime.nodeOf(prop, member);
    return { node, member: inside };
  };

  const onAction = (r: ActionRecord) => {
    // A prop's own steps, and what the lesson's rules do, are consequences: not recorded.
    if (isPaused || isClosed || r.isStep || r.cause !== undefined) return;
    const { node, member } = where(r.prop, r.action);
    const args = r.args !== null && typeof r.args === "object" ? { ...(r.args as object) } : {};
    const payload: PayloadOf<"cause"> = {
      action: member,
      args,
      ...(r.refused !== undefined ? { refused: r.refused } : {}),
    };
    const isSame =
      pending !== undefined &&
      isDown &&
      r.actor === Actor.Learner &&
      pending.actor === r.actor &&
      pending.node === node &&
      "action" in pending.payload &&
      pending.payload.action === member &&
      r.refused === undefined &&
      pending.payload.refused === undefined;
    if (isSame && pending !== undefined) {
      pending.payload = payload;
      pending.n.push(r.n);
      pending.steps += 1;
      return;
    }
    flush();
    if (isDown && r.actor === Actor.Learner && r.refused === undefined) {
      pending = { n: [r.n], node, actor: r.actor, payload, at: Date.now(), steps: 1 };
      return;
    }
    seqOf.set(
      r.n,
      record({ ...place, actor: r.actor, node: nodeId(node), kind: "cause", payload }),
    );
  };

  const onSignal = (r: SignalRecord) => {
    if (isPaused || isClosed) return;
    const { node, member } = where(r.prop, r.signal);
    const payload = { ...r.payload } as Record<string, unknown>;
    let from: number | null = r.from === undefined ? null : (seqOf.get(r.from) ?? null);
    // A signal a view raised for the learner (or Jugnu) is an act itself: its cause entry first.
    if (r.from === undefined && (r.actor === Actor.Learner || r.actor === Actor.Jugnu)) {
      from = put({
        ...place,
        actor: r.actor,
        node: nodeId(node),
        kind: "cause",
        payload: { signal: member, payload },
      });
      seqOf.set(r.n, from);
    }
    put({
      ...place,
      actor: r.actor,
      node: nodeId(node),
      kind: "signal",
      payload: { signal: member, payload, from },
    });
  };

  const offAction = runtime.onAction(onAction);
  const offSignal = runtime.onSignal(onSignal);

  return {
    open: (payload) => {
      put({ ...place, actor: Actor.App, node: null, kind: "open", payload });
    },
    app: (what, details, node) => {
      if (isClosed) return;
      put({
        ...place,
        actor: Actor.App,
        node: nodeId(node ?? null),
        kind: "app",
        payload: { ...(details ?? {}), what },
      });
    },
    jugnu: (payload) => {
      if (isClosed) return;
      put({ ...place, actor: Actor.Learner, node: null, kind: "jugnu", payload });
    },
    gesture: (down) => {
      isDown = down;
      if (!down) flush();
    },
    pause: (paused) => {
      flush();
      isPaused = paused;
    },
    close: () => {
      if (isClosed) return;
      put({ ...place, actor: Actor.App, node: null, kind: "close", payload: {} });
      isClosed = true;
      offAction();
      offSignal();
    },
  };
}
