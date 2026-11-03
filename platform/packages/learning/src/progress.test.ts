import { Level } from "@chalk/content";
import { describe, expect, it } from "vitest";
import { attemptsFrom } from "./attempts";
import { catalogueOf } from "./catalogue";
import {
  Mark,
  isConceptDone,
  mergeProgress,
  passesFrom,
  practiceOf,
  progressFrom,
} from "./progress";
import { session } from "./testing";

const catalogue = catalogueOf(
  ["q2", "q3", "q4"].map((board) => ({ board, version: "v1", tests: ["c1"], level: Level.Medium })),
);
const progressOf = (events: Parameters<typeof passesFrom>[0]) =>
  progressFrom(passesFrom(events), attemptsFrom(events, catalogue), [plan]);

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
    const progress = progressOf(events);
    expect(progress.c1).toMatchObject({
      isLearnt: true,
      practice: { right: 2, of: 3, marks: [Mark.Right, Mark.Wrong, Mark.Right] },
    });
    expect(isConceptDone(progress.c1, true)).toBe(true);
    // Order of arrival doesn't matter.
    expect(progressOf([...events].reverse())).toEqual(progress);
  });

  it("a first try is the earliest graded check, ever; a page's own question doesn't count", () => {
    const early = session("a", 1000);
    const late = session("b", 5000);
    const progress = progressOf([
      late.check("q2", true),
      early.check("q2", false),
      early.check("p1", true, { isGraded: false }),
      early.check("q3", true),
      late.check("q4", true),
    ]);
    expect(progress.c1?.practice?.marks).toEqual([Mark.Wrong, Mark.Right, Mark.Right]);
  });

  it("half a practice: touched, not practised; nothing done: not there", () => {
    const progress = progressOf([session("a").check("q2", true)]);
    expect(progress.c1).toEqual({ isLearnt: false, practice: null });
    expect(isConceptDone(progress.c1, true)).toBe(false);
    expect(progressOf([]).c1).toBeUndefined();
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
