import { describe, expect, it } from "vitest";
import { lineDue, lineEnded, pieceHidden } from "./sound";

// The two rules, on the board's queue: the first line is being said, the rest wait.
const title = { line: "title", step: 0 };
const road = { line: "road", step: 0 };
const tap = { line: "atThree", step: 4 };

describe("the two rules", () => {
  it("1. the board talks in turn: a line waits for the one being said", () => {
    expect(lineDue([], title, false)).toEqual({ saying: [title], say: title, isCut: false });
    expect(lineDue([title], road, false)).toEqual({ saying: [title, road], isCut: false });
    expect(lineEnded([title, road], "title", 0)).toEqual({ saying: [road], next: road });
    expect(lineEnded([road], "road", 0)).toEqual({ saying: [] });
  });

  it("2. the student acts: the line being said is cut, what waits is dropped, theirs is said", () => {
    expect(lineDue([title, road], tap, true)).toEqual({ saying: [tap], say: tap, isCut: true });
    // The lines of the same step of theirs take turns among themselves.
    const alsoTap = { line: "side", step: 4 };
    expect(lineDue([tap], alsoTap, true)).toEqual({ saying: [tap, alsoTap], isCut: false });
    // The cut line still ends (what waits on it happens), but no longer moves the queue.
    expect(lineEnded([tap], "title", 0)).toBeUndefined();
  });

  it("a piece hidden is no longer heard: cut if being said, the next said instead", () => {
    expect(pieceHidden([title, road], "title")).toEqual({
      saying: [road],
      isCut: true,
      next: road,
    });
    expect(pieceHidden([title, road], "road")).toEqual({ saying: [title], isCut: false });
  });
});
