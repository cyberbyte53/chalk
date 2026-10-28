import { describe, expect, it } from "vitest";
import {
  contentAddress,
  formatAddress,
  parseAddress,
  previewQuery,
  propAddress,
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
