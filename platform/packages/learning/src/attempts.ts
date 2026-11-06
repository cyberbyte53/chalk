import { Actor, type ChalkEvent, Level, PlayMode, isKind, localizedSchema } from "@chalk/content";
import { z } from "zod";
import type { Catalogue } from "./catalogue";

/**
 * Every try a learner made at a question: one per `checked` signal of theirs, with what only their
 * whole record knows (their nth try at it ever, the mode it was played in, whether Jugnu had
 * helped) and what the catalogue says of that version (its concepts, its level). Worked out again
 * from the whole record each time, never folded in batch by batch: an offline phone uploads late.
 */
export const attemptSchema = z.object({
  board: z.string(),
  /** The board's opening it was made on (what joins it to its set, and to Jugnu's conversation). */
  opening: z.string(),
  /** The question on the board (a board may ask more than one). */
  node: z.string(),
  version: z.string(),
  /** Unix ms, on the phone. */
  at: z.number(),
  isRight: z.boolean(),
  /** A bank question's check counts towards mastery; a page's doesn't. */
  isGraded: z.boolean(),
  /** Their tries at this question so far, over every opening: 1 is the first ever. */
  nth: z.number().int().min(1),
  /** What they answered, in the words they saw ("(−1, 3)", an option's label), or null. */
  chosen: localizedSchema.nullable(),
  /** From the catalogue; empty and null for a question it doesn't know (a page's). */
  tests: z.array(z.string()),
  level: z.nativeEnum(Level).nullable(),
  mode: z.nativeEnum(PlayMode).nullable(),
  /** Jugnu spoke or acted on this opening before the check. */
  helped: z.boolean(),
});
export type Attempt = z.infer<typeof attemptSchema>;

/**
 * One learner's attempts from their events, in any order: ordered by session (by when each
 * started) and by seq within it, the order the phone recorded them in.
 */
export function attemptsFrom(events: readonly ChalkEvent[], catalogue: Catalogue): Attempt[] {
  const sessionStart = new Map<string, number>();
  for (const e of events)
    sessionStart.set(e.session, Math.min(sessionStart.get(e.session) ?? e.at, e.at));
  const ordered = [...events].sort(
    (a, b) =>
      (sessionStart.get(a.session) ?? 0) - (sessionStart.get(b.session) ?? 0) ||
      a.session.localeCompare(b.session) ||
      a.seq - b.seq,
  );
  const modeOf = new Map<string, PlayMode | null>();
  const helpedOn = new Set<string>();
  const tries = new Map<string, number>();
  const attempts: Attempt[] = [];
  for (const e of ordered) {
    if (e.opening === null) continue;
    if (isKind(e, "open")) modeOf.set(e.opening, e.payload.mode ?? null);
    // A turn with Jugnu (asked by the child), or anything Jugnu did on the board.
    if (isKind(e, "jugnu") || e.actor === Actor.Jugnu) helpedOn.add(e.opening);
    if (!isKind(e, "signal") || e.actor !== Actor.Learner) continue;
    if (e.payload.signal !== "checked" || e.board === null || e.node === null) continue;
    const p = e.payload.payload;
    const key = `${e.board} ${e.node}`;
    const nth = (tries.get(key) ?? 0) + 1;
    tries.set(key, nth);
    const found = catalogue(e.board, e.version);
    attempts.push({
      board: e.board,
      opening: e.opening,
      node: e.node,
      version: e.version ?? "",
      at: e.at,
      isRight: p.status === "correct",
      isGraded: p.isGraded === true,
      nth,
      chosen: localizedSchema.nullable().parse(p.answer),
      tests: found?.tests ?? [],
      level: found?.level ?? null,
      mode: modeOf.get(e.opening) ?? null,
      helped: helpedOn.has(e.opening),
    });
  }
  return attempts;
}
