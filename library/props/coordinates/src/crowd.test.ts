import { Board, type BoardEvent, prop } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { Mistake, along, crowd, pathOf, peopleOf, pointFor } from "./crowd";
import { windowSchema } from "./plane";

// The crowd, held alone by a tiny holder that gives it the plane's window.

const holder = prop({
  type: "crowdHolder",
  describe: "test",
  variables: z.object({ window: windowSchema }).strict(),
  start: { window: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 } },
  children: { crowd },
});

const MIX = { none: 6, swapped: 4, sign: 3, offByOne: 2 };
const ASKED = { x: 3, y: 2 };

function board() {
  const b = new Board(holder, { crowd: { asked: ASKED, mix: MIX, seed: 7 } });
  const told: string[] = [];
  b.listen((e: BoardEvent) => {
    if (e.kind === "tell") told.push(`${e.path}.${e.signal}`);
  });
  return { b, told, read: () => b.read<typeof holder>().crowd };
}

describe("a crowd asked for (3, 2)", () => {
  it("each mistake puts the point where the plane's laws say", () => {
    expect(pointFor(ASKED, Mistake.None, 0.3)).toEqual({ x: 3, y: 2 });
    expect(pointFor(ASKED, Mistake.Swapped, 0.3)).toEqual({ x: 2, y: 3 });
    expect([
      { x: -3, y: 2 },
      { x: 3, y: -2 },
    ]).toContainEqual(pointFor(ASKED, Mistake.Sign, 0.8));
    const off = pointFor(ASKED, Mistake.OffByOne, 0.6);
    expect(Math.abs(off.x - 3) + Math.abs(off.y - 2)).toBe(1);
  });

  it("the mix says how many made each mistake, and the same seed gives the same crowd", () => {
    const people = peopleOf(ASKED, MIX, 7);
    expect(people).toHaveLength(15);
    expect(people.filter((p) => p.mistake === Mistake.Swapped)).toHaveLength(4);
    expect(peopleOf(ASKED, MIX, 7)).toEqual(people);
    expect(peopleOf(ASKED, MIX, 8)).not.toEqual(people);
  });

  it("a walk goes on the lines: back to O, along by the first number, then up by the second", () => {
    expect(pathOf({ x: 2, y: 3 }, ASKED, true)).toEqual([
      { x: 2, y: 3 },
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 2 },
    ]);
    const path = pathOf({ x: 0, y: 0 }, ASKED, false);
    // Halfway by distance (5 units) is 2.5 along the first line, before turning up.
    expect(along(path, 0.5)).toEqual({ x: 2.5, y: 0 });
    expect(along(path, 1)).toEqual(ASKED);
  });

  it("everyone comes in, one after another", () => {
    const { b, told, read } = board();
    expect(read().people.every((p) => p.landed === 0)).toBe(true);
    b.send("crowd", "arrive", {});
    b.advanceTo(1.5);
    const midway = read().people.filter((p) => p.landed === 1).length;
    expect(midway).toBeGreaterThan(0);
    expect(midway).toBeLessThan(15);
    b.runUntilIdle();
    expect(read().people.every((p) => p.landed === 1)).toBe(true);
    expect(told).toContain("crowd.arrived");
  });

  it("drawn together, everyone is at one point; spread again, each is back where they put it", () => {
    const { b, read } = board();
    const before = read().people.map((p) => p.at);
    b.send("crowd", "gather", {});
    b.runUntilIdle();
    expect(read().people.every((p) => p.at.x === 0 && p.at.y === 0)).toBe(true);
    b.send("crowd", "spread", {});
    b.runUntilIdle();
    expect(read().people.map((p) => p.at)).toEqual(before);
  });

  it("one walks home and the rest stay; then everyone else walks, and all stand round (3, 2)", () => {
    const { b, told, read } = board();
    const who = peopleOf(ASKED, MIX, 7).findIndex((p) => p.mistake === Mistake.Swapped);
    const others = read().people.map((p) => p.at);
    b.send("crowd", "walkHome", { who, isFromO: true });
    b.runUntilIdle();
    const after = read().people;
    const near = (p: { x: number; y: number }) => Math.hypot(p.x - 3, p.y - 2) <= 0.4;
    expect(near(after[who]?.at ?? { x: 0, y: 0 })).toBe(true);
    // Their trail went back to O, along 3, then up.
    const [, o, corner] = after[who]?.trail ?? [];
    expect(o).toEqual({ x: 0, y: 0 });
    expect(corner?.y).toBe(0);
    expect(after[who]?.isHome).toBe(true);
    expect(after.filter((_, i) => i !== who).map((p) => p.at)).toEqual(
      others.filter((_, i) => i !== who),
    );
    b.send("crowd", "walkHome", { who: null, isFromO: false });
    b.runUntilIdle();
    expect(read().people.every((p) => near(p.at))).toBe(true);
    expect(told.filter((s) => s === "crowd.walked")).toHaveLength(2);
  });
});
