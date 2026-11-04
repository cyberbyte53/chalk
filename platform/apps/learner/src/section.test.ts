import type { GroupLearner, PointSeen, QuestionSeen, TrySeen } from "@chalk/api";
import { PointKind } from "@chalk/learning";
import { describe, expect, it } from "vitest";
import { sectionOf } from "./section";

const NOW = Date.UTC(2026, 10, 4, 12);
const HOUR = 60 * 60 * 1000;

const tried = (isRight: boolean, answer: string | null, at: number): TrySeen => ({
  opening: `o${at}`,
  version: "v",
  at,
  isRight,
  chosen: answer === null ? null : { en: answer, hi: answer },
  helped: false,
});
const question = (board: string, tries: TrySeen[]): QuestionSeen => ({
  board,
  path: `book/chapter/${board}`,
  name: `chapter/${board}`,
  concepts: [],
  level: null,
  tries,
});
const point = (kind: PointKind, questions: QuestionSeen[], mistake: string | null = null) =>
  ({ text: `${kind} point`, kind, mistake, next: null, questions }) satisfies PointSeen;
const learner = (
  name: string,
  points: PointSeen[] | null,
  o: { finishedAt?: number; wasNeedsYou?: string } = {},
): GroupLearner => ({
  id: name,
  name,
  picture: null,
  joinedAt: 0,
  lastActiveAt: null,
  progress: {},
  mastery: [],
  latestUpdate:
    points === null
      ? null
      : { finishedAt: o.finishedAt ?? NOW - HOUR, points, wasNeedsYou: o.wasNeedsYou ?? null },
});

describe("a section's home", () => {
  it("puts a child whose latest update needs the teacher first, with how sure and the proof", () => {
    const swapped = question("q1", [tried(false, "(−1, 3)", 1), tried(true, "(3, −1)", 3)]);
    const again = question("q2", [tried(false, "(2, 5)", 2)]);
    const s = sectionOf(
      [
        learner("Ravi", [point(PointKind.NeedsYou, [question("q1", [tried(false, "(1, 1)", 1)])])]),
        learner("Diya", [point(PointKind.NeedsYou, [swapped, again])]),
        learner("Asha", [point(PointKind.OnTrack, [])]),
      ],
      NOW,
    );
    expect(s.needsYou.map((n) => [n.learner.name, n.wrong, n.of])).toEqual([
      ["Diya", 2, 3],
      ["Ravi", 1, 1],
    ]);
    // The last wrong try is the one drawn.
    expect(s.needsYou[0]?.shown?.try.chosen?.en).toBe("(2, 5)");
    expect(s.onTrack.map((l) => l.name)).toEqual(["Asha"]);
  });

  it("gives the three latest a card each and names the rest", () => {
    const stuck = (name: string, hoursAgo: number) =>
      learner(name, [point(PointKind.NeedsYou, [question("q1", [tried(false, "(1, 1)", 1)])])], {
        finishedAt: NOW - hoursAgo * HOUR,
      });
    const s = sectionOf(
      [stuck("Ravi", 50), stuck("Diya", 2), stuck("Asha", 30), stuck("Kabir", 5)],
      NOW,
    );
    expect(s.needsYou.map((n) => n.learner.name)).toEqual(["Diya", "Kabir", "Asha"]);
    expect(s.alsoNeedsYou.map((l) => l.name)).toEqual(["Ravi"]);
  });

  it("shows a child who got past it on their own for a day, greyed; then they are just on track", () => {
    const past = { wasNeedsYou: "swaps the numbers" };
    const s = sectionOf(
      [
        learner("Diya", [], { ...past, finishedAt: NOW - 2 * HOUR }),
        learner("Ravi", [], { ...past, finishedAt: NOW - 30 * HOUR }),
      ],
      NOW,
    );
    expect(s.needsYou).toEqual([]);
    expect(s.gotIt.map((g) => [g.learner.name, g.was])).toEqual([["Diya", "swaps the numbers"]]);
    expect(s.onTrack.map((l) => l.name)).toEqual(["Diya", "Ravi"]);
  });

  it("groups the same wrong answer to the same question, by two or more children, biggest first", () => {
    const swap = (at: number) => question("q1", [tried(false, "(−1, 3)", at)]);
    const s = sectionOf(
      [
        learner("Diya", [point(PointKind.NeedsYou, [swap(1)], "reads the numbers backwards")]),
        learner("Ravi", [point(PointKind.GettingThere, [swap(2)], "swaps the numbers")]),
        learner("Asha", [point(PointKind.GettingThere, [swap(3)], "swaps the numbers")]),
        // A different wrong answer, or a point on track, is not that mistake.
        learner("Kabir", [
          point(PointKind.NeedsYou, [question("q1", [tried(false, "(3, 1)", 4)])]),
        ]),
        learner("Meera", [point(PointKind.OnTrack, [swap(5)])]),
        learner("Zara", null),
      ],
      NOW,
    );
    expect(s.mistakes).toHaveLength(1);
    expect(s.mistakes[0]).toMatchObject({
      answer: { en: "(−1, 3)" },
      label: "swaps the numbers",
    });
    expect(s.mistakes[0]?.learners.map((l) => l.name)).toEqual(["Diya", "Ravi", "Asha"]);
    expect(s.gettingThere.map((l) => l.name)).toEqual(["Ravi", "Asha"]);
    expect(s.notYet.map((l) => l.name)).toEqual(["Zara"]);
  });

  it("leaves out a mistake whose children are all on a bigger card: it says nothing new", () => {
    const both = (a: number) =>
      point(PointKind.NeedsYou, [
        question("q1", [tried(false, "(−1, 3)", a)]),
        question("q2", [tried(false, "(−4, 2)", a + 1)]),
      ]);
    const s = sectionOf(
      [
        learner("Diya", [both(1)]),
        learner("Ravi", [both(3)]),
        learner("Asha", [
          point(PointKind.NeedsYou, [question("q1", [tried(false, "(−1, 3)", 5)])]),
        ]),
      ],
      NOW,
    );
    expect(s.mistakes.map((m) => [m.question.board, m.learners.length])).toEqual([["q1", 3]]);
  });
});
