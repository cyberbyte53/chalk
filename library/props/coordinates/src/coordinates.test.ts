import { checkProp, describeView } from "@chalk/player";
import { initialState, viewOf } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { snapped } from "./coordinate-plane";
import { coordinatePlaneProp } from "./index";
import { pairText, quadrantOf } from "./plane";

const view = (given: Record<string, unknown> = {}) => {
  const start = initialState(coordinatePlaneProp.def, given);
  if (!start.isOk) throw new Error(start.errors.join("; "));
  return viewOf(coordinatePlaneProp.def, start.state);
};

describe("the laws of the plane", () => {
  it("quadrants are I to IV anticlockwise from the positive x-axis; an axis is in none", () => {
    expect(quadrantOf(4, 3)).toBe(1);
    expect(quadrantOf(-3, 4)).toBe(2);
    expect(quadrantOf(-5, -4)).toBe(3);
    expect(quadrantOf(3, -4)).toBe(4);
    expect(quadrantOf(4, 0)).toBe(0);
    expect(quadrantOf(0, -4)).toBe(0);
    expect(quadrantOf(0, 0)).toBe(0);
  });
  it("the signs in each quadrant are the book's: (+, +), (−, +), (−, −), (+, −)", () => {
    for (let x = -6; x <= 6; x++)
      for (let y = -6; y <= 6; y++) {
        const q = quadrantOf(x, y);
        if (q === 0) continue;
        expect([x > 0, y > 0]).toEqual(
          [
            [true, true],
            [false, true],
            [false, false],
            [true, false],
          ][q - 1],
        );
      }
  });
  it("points are written as the book writes them", () => {
    expect(pairText(-6, -2)).toBe("(−6, −2)");
    expect(pairText(0, -3.5)).toBe("(0, −3.5)");
  });
  it("a dragged point lands on the grid's steps, inside the window", () => {
    expect(snapped(2.4, 1, -6, 6)).toBe(2);
    expect(snapped(-3.3, 0.5, -6, 6)).toBe(-3.5);
    expect(snapped(9, 1, -6, 6)).toBe(6);
  });
  it("on the x-axis y is 0, on the y-axis x is 0, and O is both", () => {
    expect(view({ x: 4, y: 0 })).toMatchObject({ isOnXAxis: true, isOnYAxis: false, quadrant: 0 });
    expect(view({ x: 0, y: 3 })).toMatchObject({ isOnXAxis: false, isOnYAxis: true });
    expect(view({ x: 0, y: 0 })).toMatchObject({ isOnXAxis: true, isOnYAxis: true });
  });
  it("one known number is a line of places; two are one point", () => {
    expect(view({ isXKnown: true, isYKnown: false }).isKnown).toBe(false);
    expect(view({ isXKnown: true, isYKnown: true }).isKnown).toBe(true);
  });
  it("on the number line P stays on it", () => {
    expect(initialState(coordinatePlaneProp.def, { isNumberLine: true, y: 2 }).isOk).toBe(false);
  });
  it("refuses a point outside the window", () => {
    expect(initialState(coordinatePlaneProp.def, { x: 9 }).isOk).toBe(false);
  });
});

describe("what the student sees", () => {
  it("every input says what it does, and every learner's action has one", () => {
    expect(
      checkProp(coordinatePlaneProp, [
        {},
        { canSetNumbers: true, canWalk: true, x: 3, y: 5 },
        { showLines: true, canSetNumbers: true, isXKnown: false, isYKnown: false },
        { isNumberLine: true, canAddYAxis: true, canSetNumbers: true, x: -3, y: 0 },
        {
          canWalk: true,
          isMovable: false,
          pairs: [
            { x: 3, y: 5 },
            { x: 5, y: -4 },
          ],
        },
        {
          scene: "colony",
          xMin: 0,
          yMin: 0,
          showLines: true,
          canSetNumbers: true,
          isXKnown: false,
          isYKnown: false,
        },
        { scene: "cinema", xMin: 0, yMin: 0, canWalk: true, canSetNumbers: true, isMovable: false },
        { scene: "notebook", xMin: 0, yMin: 0, x: 3, y: 2 },
        { canPick: true, canWalkBoth: true },
      ]),
    ).toEqual([]);
  });
  it("P, its readout, where it is and its distances from the axes", () => {
    const seen = describeView(coordinatePlaneProp, view({ x: -3, y: 4 }));
    const at = (id: string) => seen.elements.find((e) => e.id === id);
    expect(at("point")?.value).toEqual({ x: -3, y: 4 });
    expect(at("where")?.words).toBe("Quadrant II");
    // Distances are lengths, never negative; the sign is the coordinate's.
    expect(at("toYAxis")).toMatchObject({ value: 3, words: "3 left of the y-axis" });
    expect(at("toXAxis")).toMatchObject({ value: 4, words: "4 above the x-axis" });
  });
  it("with only x known, the line x = 3 and no point", () => {
    const seen = describeView(
      coordinatePlaneProp,
      view({ showLines: true, x: 3, isXKnown: true, isYKnown: false }),
    );
    const ids = seen.elements.map((e) => e.id);
    expect(ids).toContain("xLine");
    expect(ids).not.toContain("point");
  });
});
