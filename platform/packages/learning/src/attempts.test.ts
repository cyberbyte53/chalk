import { Level, PlayMode } from "@chalk/content";
import { describe, expect, it } from "vitest";
import { attemptsFrom } from "./attempts";
import { catalogueOf } from "./catalogue";
import { session } from "./testing";

const catalogue = catalogueOf([
  { board: "q1", version: "v1", tests: ["c1"], level: Level.Hard },
  { board: "q2", version: "v0", tests: ["c2"], level: Level.Easy },
]);

describe("attempts", () => {
  it("numbers a learner's tries at a question over every opening and session, in the order made", () => {
    const morning = session("a", 1000);
    const evening = session("b", 9000);
    const record = [
      evening.open("q1"),
      evening.check("q1", true),
      morning.open("q1", PlayMode.Guided),
      morning.check("q1", false),
      morning.check("q1", true),
    ];
    // Uploaded in any order, the same attempts.
    for (const order of [record, [...record].reverse()]) {
      const tries = attemptsFrom(order, catalogue);
      expect(tries.map((t) => [t.nth, t.isRight, t.mode])).toEqual([
        [1, false, PlayMode.Guided],
        [2, true, PlayMode.Guided],
        [3, true, null],
      ]);
    }
  });

  it("reads a version's concepts and level from the catalogue, any version when it lacks that one", () => {
    const s = session("a");
    const [q1, q2, page] = attemptsFrom(
      [
        s.open("q1"),
        s.check("q1", true),
        s.open("q2"),
        s.check("q2", true),
        s.open("p"),
        s.check("p", true, { isGraded: false }),
      ],
      catalogue,
    );
    expect(q1).toMatchObject({ tests: ["c1"], level: Level.Hard, chosen: "a" });
    expect(q2).toMatchObject({ tests: ["c2"], level: Level.Easy });
    expect(page).toMatchObject({ tests: [], level: null, isGraded: false });
  });

  it("two questions on one board are two questions", () => {
    const s = session("a");
    const tries = attemptsFrom(
      [s.open("q1"), s.check("q1", true, { node: "x" }), s.check("q1", true, { node: "y" })],
      catalogue,
    );
    expect(tries.map((t) => [t.node, t.nth])).toEqual([
      ["x", 1],
      ["y", 1],
    ]);
  });

  it("marks a try helped once Jugnu spoke on that opening before it, not on another", () => {
    const s = session("a");
    const tries = attemptsFrom(
      [
        s.open("q1"),
        s.check("q1", false),
        s.jugnu("q1"),
        s.check("q1", true),
        s.open("q1"),
        s.check("q1", true),
      ],
      catalogue,
    );
    expect(tries.map((t) => t.helped)).toEqual([false, true, false]);
  });
});
