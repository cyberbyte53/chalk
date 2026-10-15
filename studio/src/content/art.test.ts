import { ArtFrame } from "@chalk/content";
import { h } from "preact";
import { describe, expect, it } from "vitest";
import { artProblems, renderArt } from "./art";

const svg = (body: string) =>
  `<div class="draw-stage"><svg viewBox="0 0 320 140">${body}</svg></div>`;

describe("art checks", () => {
  it("passes pieces drawn with the look's colours and a content colour", () => {
    expect(
      artProblems(svg('<circle class="draw-dot" r="6" style="--piece-color:#2B4CD3"/>')),
    ).toEqual([]);
  });
  it("refuses a raw colour, a script, a link, a handler, and a drawing with no viewBox", () => {
    expect(artProblems(svg('<rect fill="#ff0000"/>'))[0]).toMatch(/raw colour #ff0000/);
    expect(artProblems(svg("<script></script>"))[0]).toMatch(/<script>/);
    expect(artProblems(svg('<image href="x.png"/>')).join()).toMatch(/outside itself/);
    expect(artProblems(svg('<circle onclick="x()"/>'))[0]).toMatch(/event handler/);
    expect(artProblems("<svg></svg>")[0]).toMatch(/viewBox/);
  });
  it("refuses art that is too big", () => {
    expect(artProblems(svg("<g></g>".repeat(4000))).join()).toMatch(/bytes/);
  });
});

describe("rendering art", () => {
  it("draws it at its frame's size", () => {
    const result = renderArt({
      frame: ArtFrame.Card,
      draw: ({ width, height }: { width: number; height: number }) =>
        h("svg", { viewBox: `0 0 ${width} ${height}` }, h("circle", { r: 4 })),
    });
    expect(result).toEqual({
      art: { frame: "card", svg: '<svg viewBox="0 0 320 140"><circle r="4"></circle></svg>' },
    });
  });
  it("says what's wrong with an art.tsx that exports something else", () => {
    expect(renderArt(undefined)).toEqual({
      problems: [expect.stringMatching(/must export `art`/)],
    });
  });
});
