import { scaleLinear } from "d3-scale";
import { symbol } from "d3-shape";
import { describe, expect, it } from "vitest";
import { CROWD_THRESHOLD, DrawMode, chooseMode } from "./dots";
import { arrowhead, chevron } from "./shapes";
import { type Space, toPixels } from "./stage";

describe("how a collection is drawn", () => {
  it("few items are SVG, each its own element", () => {
    expect(chooseMode(12, false, true)).toBe(DrawMode.Svg);
    expect(chooseMode(CROWD_THRESHOLD, false, true)).toBe(DrawMode.Svg);
  });
  it("a crowd uses WebGL, or canvas 2D without it", () => {
    expect(chooseMode(CROWD_THRESHOLD + 1, false, true)).toBe(DrawMode.WebGl);
    expect(chooseMode(5000, false, false)).toBe(DrawMode.Canvas);
  });
  it("items with colours of their own stay SVG, however many", () => {
    expect(chooseMode(5000, true, true)).toBe(DrawMode.Svg);
  });
});

describe("our shapes, as d3 symbols", () => {
  it("an arrowhead has its tip at the origin and points right", () => {
    const d = symbol(arrowhead, 64)() ?? "";
    expect(d.startsWith("M0,0")).toBe(true);
    expect(d).toContain("Z");
  });
  it("a chevron is open (no closing edge)", () => {
    expect(symbol(chevron, 64)()).not.toContain("Z");
  });
});

describe("the stage's space", () => {
  const space: Space = {
    x: scaleLinear().domain([0, 1]).range([20, 320]),
    y: null,
    width: 340,
    height: 100,
    overlay: null,
    top: null,
  };
  it("places a number by the scale, and takes y in px on a one-dimensional stage", () => {
    expect(toPixels(space, 0.5, 60)).toEqual([170, 60]);
  });
  it("flips y on a two-dimensional stage, so up is up", () => {
    const plane: Space = { ...space, y: scaleLinear().domain([0, 10]).range([100, 0]) };
    expect(toPixels(plane, 0, 10)).toEqual([20, 0]);
  });
});
