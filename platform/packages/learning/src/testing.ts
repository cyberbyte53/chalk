import { Actor, type ChalkEvent, EVENT_SCHEMA_VERSION, type PlayMode } from "@chalk/content";

/**
 * A learner's record for tests: entries of one app session, numbered in order as the bus would.
 * Each board opened gets its own opening.
 */
export function session(id: string, start = 1000) {
  let seq = 0;
  let opening = 0;
  const base = (board: string, node: string | null) => ({
    id: `${id}-${seq}`,
    schemaVersion: EVENT_SCHEMA_VERSION,
    session: id,
    seq,
    at: start + seq++,
    commit: "abc",
    opening: `${id}-o${opening}`,
    board,
    version: "v1",
    node,
  });
  const signal = (board: string, node: string | null, name: string, payload = {}): ChalkEvent =>
    ({
      ...base(board, node),
      actor: Actor.Learner,
      kind: "signal",
      payload: { signal: name, payload, from: null },
    }) as ChalkEvent;
  return {
    /** Opens a board: what follows is on this opening. */
    open: (board: string, mode?: PlayMode): ChalkEvent => {
      opening += 1;
      return {
        ...base(board, null),
        actor: Actor.App,
        kind: "open",
        payload: mode === undefined ? {} : { mode },
      } as ChalkEvent;
    },
    pass: (board: string) => signal(board, null, "continued"),
    check: (
      board: string,
      isRight: boolean,
      { isGraded = true, node = "q", optionId = "a" } = {},
    ) =>
      signal(board, node, "checked", {
        status: isRight ? "correct" : "wrong",
        attempts: 1,
        isGraded,
        optionId,
      }),
    /** One of Jugnu's turns on the board open now: the child asked, so the child's entry. */
    jugnu: (board: string): ChalkEvent =>
      ({
        ...base(board, null),
        actor: Actor.Learner,
        kind: "jugnu",
        payload: { asked: "why?", reply: "look again", steps: [], model: "m" },
      }) as ChalkEvent,
  };
}
