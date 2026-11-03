import { Actor, type ChalkEvent, EVENT_SCHEMA_VERSION } from "@chalk/content";
import { describe, expect, it } from "vitest";
import {
  Mark,
  boardFactsFrom,
  isConceptDone,
  mergeBoardFacts,
  mergeProgress,
  practiceOf,
  progressFrom,
} from "./progress";

/** Entries of one app session, numbered in order, as the bus would. */
function session(id: string, start = 1000) {
  let seq = 0;
  const signal = (
    board: string,
    node: string | null,
    name: string,
    payload: Record<string, unknown> = {},
  ): ChalkEvent => ({
    id: `${id}-${seq}`,
    schemaVersion: EVENT_SCHEMA_VERSION,
    session: id,
    seq,
    at: start + seq++,
    commit: "abc",
    actor: Actor.Learner,
    opening: "o",
    board,
    version: "v",
    node,
    kind: "signal",
    payload: { signal: name, payload, from: null },
  });
  const pass = (board: string) => signal(board, null, "continued");
  const check = (board: string, isRight: boolean, isGraded = true) =>
    signal(board, "q", "checked", { status: isRight ? "correct" : "wrong", isGraded });
  return { pass, check };
}

const plan = { id: "c1", pages: ["p1", "p2"], practice: ["q2", "q3", "q4"] };

describe("progress", () => {
  it("learnt once every page is passed; practised once every first question has a first try", () => {
    const s = session("s1");
    const events = [
      s.pass("p1"),
      s.pass("p2"),
      s.check("q2", true),
      s.check("q3", false),
      s.check("q3", true),
      s.check("q4", true),
    ];
    const progress = progressFrom(boardFactsFrom(events), [plan]);
    expect(progress.c1).toMatchObject({
      isLearnt: true,
      practice: { right: 2, of: 3, marks: [Mark.Right, Mark.Wrong, Mark.Right] },
    });
    expect(isConceptDone(progress.c1, true)).toBe(true);
    // Order of arrival doesn't matter.
    expect(progressFrom(boardFactsFrom([...events].reverse()), [plan])).toEqual(progress);
  });

  it("a first try is the earliest graded check, ever; a page's own question doesn't count", () => {
    const early = session("a", 1000);
    const late = session("b", 5000);
    const facts = boardFactsFrom([
      late.check("q2", true),
      early.check("q2", false),
      early.check("p1", true, false),
    ]);
    expect(facts.get("q2")?.first).toEqual({ isRight: false, at: 1000 });
    expect(facts.get("p1")).toBeUndefined();
    // Half a practice: touched, not practised.
    const progress = progressFrom(facts, [plan]);
    expect(progress.c1).toEqual({ isLearnt: false, practice: null });
    expect(isConceptDone(progress.c1, true)).toBe(false);
    expect(progressFrom(new Map(), [plan]).c1).toBeUndefined();
  });

  it("board facts from two places merge to the earlier of each", () => {
    const a = boardFactsFrom([session("a", 3000).check("q2", true)]);
    const b = boardFactsFrom([
      session("b", 1000).check("q2", false),
      session("b", 2000).pass("p1"),
    ]);
    const merged = mergeBoardFacts(a, b);
    expect(merged.get("q2")?.first).toEqual({ isRight: false, at: 1000 });
    expect(merged.get("p1")?.passedAt).toBe(2000);
  });

  it("practice is the questions marked firstTry, in order, else every question testing it", () => {
    const qs = [
      { id: "a", tests: ["c"] },
      { id: "b", tests: ["c"], firstTry: 2 },
      { id: "c", tests: ["c"], firstTry: 1 },
      { id: "d", tests: ["x"] },
    ];
    expect(practiceOf(qs, "c").map((q) => q.id)).toEqual(["c", "b"]);
    expect(practiceOf(qs, "x").map((q) => q.id)).toEqual(["d"]);
  });
});

describe("mergeProgress", () => {
  it("keeps learnt from either and the later practice", () => {
    const early = { right: 1, of: 2, marks: [Mark.Right, Mark.Wrong], at: 1 };
    const late = { right: 2, of: 2, marks: [Mark.Right, Mark.Right], at: 2 };
    expect(
      mergeProgress(
        { a: { isLearnt: true, practice: early }, b: { isLearnt: false, practice: null } },
        { a: { isLearnt: false, practice: late }, c: { isLearnt: true, practice: null } },
      ),
    ).toEqual({
      a: { isLearnt: true, practice: late },
      b: { isLearnt: false, practice: null },
      c: { isLearnt: true, practice: null },
    });
  });
});
