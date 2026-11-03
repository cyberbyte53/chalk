import { describe, expect, it } from "vitest";
import {
  NodePart,
  contentAddress,
  formatAddress,
  isAboveBoard,
  parseAddress,
  previewQuery,
  propAddress,
  screenOf,
  shownAddress,
} from "./address";

describe("addresses", () => {
  it("reads a board, a piece on it, and anything above a board", () => {
    expect(parseAddress("content/b/c/l/story#game/plates")).toEqual({
      root: "content",
      path: "b/c/l/story",
      part: "game/plates",
    });
    expect(parseAddress("content/b/c/")).toEqual({ root: "content", path: "b/c" });
    expect(parseAddress("content/")).toEqual({ root: "content", path: "" });
    expect(parseAddress("content")).toEqual({ root: "content", path: "" });
  });

  it("reads a prop and a part of it", () => {
    expect(parseAddress("library/props/coordinates/coordinatePlane#handle")).toEqual({
      root: "props",
      pkg: "coordinates",
      type: "coordinatePlane",
      part: "handle",
    });
  });

  it("reads the library: every prop, or one package's", () => {
    expect(parseAddress("library/props/")).toEqual({ root: "library" });
    expect(parseAddress("library/props")).toEqual({ root: "library" });
    expect(parseAddress("library/props/basics")).toEqual({ root: "library", pkg: "basics" });
  });

  it("refuses an address without a root, a prop without its type, and nothing after #", () => {
    expect(() => parseAddress("b/c/l/story")).toThrow(/starts with content\/ or library\/props\//);
    expect(() => parseAddress("library/props/basics/choice/more")).toThrow(/<package>\/<type>/);
    expect(() => parseAddress("content/b/c/l/story#")).toThrow(/nothing after #/);
  });

  it("writes what it reads", () => {
    for (const a of [
      "content/b/c/l/story#game",
      "library/props/basics/choice#option:1",
      "library/props/basics",
      "library/props/",
    ])
      expect(formatAddress(parseAddress(a))).toBe(a);
    expect(contentAddress("b/c", "x")).toBe("content/b/c#x");
    expect(propAddress("basics", "choice")).toBe("library/props/basics/choice");
    expect(previewQuery("content/b/c/l/story#game")).toBe("at=content/b/c/l/story%23game");
  });

  it("names what a page shows: a board's parts under its pieces, a prop's straight after #", () => {
    expect(shownAddress("b/c/l/story", "game/plates")).toBe("content/b/c/l/story#game/plates");
    const plane = "library/props/coordinates/coordinatePlane";
    expect(shownAddress(plane, "coordinatePlane/handle")).toBe(`${plane}#handle`);
    expect(shownAddress(plane, "coordinatePlane")).toBe(plane);
    expect(shownAddress(plane)).toBe(plane);
  });
});

describe("what the book and chapter screens draw", () => {
  it("tells a book, chapter or lesson from a board by how deep it is", () => {
    expect(isAboveBoard("class9-maths")).toBe(true);
    expect(isAboveBoard("class9-maths/coordinate-geometry/plotting-points")).toBe(true);
    expect(isAboveBoard("class9-maths/coordinate-geometry/plotting-points/plot-a-point")).toBe(
      false,
    );
    expect(isAboveBoard("class9-maths/coordinate-geometry/questions/read-a-point/1a2b")).toBe(
      false,
    );
  });

  it("names the screen each thing is drawn on", () => {
    const lesson = "class9-maths/coordinate-geometry/plotting-points";
    expect(screenOf(lesson, NodePart.Art)).toBe("class9-maths/coordinate-geometry");
    expect(screenOf(lesson, NodePart.Glyph)).toBe("class9-maths/coordinate-geometry");
    expect(screenOf("class9-maths/coordinate-geometry", NodePart.Art)).toBe("class9-maths");
    expect(screenOf("class9-maths/coordinate-geometry", NodePart.Title)).toBe(
      "class9-maths/coordinate-geometry",
    );
    expect(screenOf("class9-maths", NodePart.Title)).toBe("class9-maths");
  });
});
