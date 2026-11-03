import { Level } from "@chalk/content";
import { describe, expect, it } from "vitest";
import type { Attempt } from "./attempts";
import { Band, MasteryModel, betaOf, masteryFrom } from "./mastery";

const attempt = (isRight: boolean, more: Partial<Attempt> = {}): Attempt => ({
  board: "q",
  node: "n",
  version: "v",
  at: 1,
  isRight,
  isGraded: true,
  nth: 1,
  chosen: null,
  tests: ["c1"],
  level: Level.Medium,
  mode: null,
  helped: false,
  ...more,
});
const c1 = (attempts: Attempt[]) => masteryFrom(attempts).find((m) => m.concept === "c1");

describe("mastery (Beta1)", () => {
  it("knows nothing before any try: 0.5 and unsure", () => {
    expect(betaOf(1, 1)).toMatchObject({ estimate: 0.5, band: Band.Unsure });
  });

  it("no evidence, no row: only graded first tries ever on questions the catalogue knows count", () => {
    expect(
      masteryFrom([
        attempt(true, { nth: 2 }),
        attempt(true, { isGraded: false }),
        attempt(true, { level: null, tests: [] }),
      ]),
    ).toEqual([]);
    expect(c1([attempt(true, { at: 5 }), attempt(false, { nth: 2 })])).toMatchObject({
      model: MasteryModel.Beta1,
      tries: 1,
      lastAt: 5,
      estimate: 2 / 3,
    });
  });

  it("five right is strong; three wrong is weak; mixed stays unsure", () => {
    expect(c1([1, 2, 3, 4, 5].map(() => attempt(true)))?.band).toBe(Band.Strong);
    expect(c1([1, 2, 3].map(() => attempt(false)))?.band).toBe(Band.Weak);
    expect(c1([true, false, true, false].map((r) => attempt(r)))?.band).toBe(Band.Unsure);
  });

  it("a hard right says more than an easy right", () => {
    const hard = c1([attempt(true, { level: Level.Hard })])?.estimate ?? 0;
    const easy = c1([attempt(true, { level: Level.Easy })])?.estimate ?? 1;
    expect(hard).toBeGreaterThan(easy);
  });

  it("a question testing two concepts splits its weight", () => {
    const rows = masteryFrom([attempt(false, { tests: ["c1", "c2"] })]);
    expect(rows.map((m) => [m.concept, m.estimate])).toEqual([
      ["c1", 1 / 2.5],
      ["c2", 1 / 2.5],
    ]);
  });
});
