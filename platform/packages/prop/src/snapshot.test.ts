import { describe, expect, it } from "vitest";
import { type BoardSnapshot, type NodeSnapshot, type PartSnapshot, seenBetween } from "./snapshot";

const node = (parts: PartSnapshot[], extra: Partial<NodeSnapshot> = {}): NodeSnapshot => ({
  path: "game",
  prop: "sweetShare",
  isShown: true,
  summary: "",
  setup: {},
  given: [],
  live: {},
  bound: {},
  parts,
  can: [],
  problems: [],
  ...extra,
});
const board = (n: NodeSnapshot): BoardSnapshot => ({ board: "b", isPassed: false, nodes: [n] });

describe("what the student sees, before and after", () => {
  it("lists each part that moved, appeared or went, and inputs turned on or off", () => {
    const was = node([
      { path: "game/plates", value: { each: 0 }, words: "6 friends, 0 sweets each" },
      { path: "game/startAgain", does: "startAgain", isOff: true },
      { path: "game/hint", value: "go on" },
    ]);
    const now = node([
      { path: "game/plates", value: { each: 1 }, words: "6 friends, 1 sweet each" },
      { path: "game/startAgain", does: "startAgain" },
      { path: "game/log", value: [{ rounds: 1 }] },
    ]);
    expect(seenBetween(board(was), board(now))).toEqual([
      { path: "game/plates", was: "6 friends, 0 sweets each", now: "6 friends, 1 sweet each" },
      { path: "game/startAgain", was: "off", now: "on" },
      { path: "game/hint", was: "go on", now: undefined },
      { path: "game/log", was: undefined, now: [{ rounds: 1 }] },
    ]);
  });

  it("says nothing when nothing on screen moved, and notes what it knows but doesn't show", () => {
    const a = node([{ path: "game/box", value: 3 }], { hidden: { remainder: 2 } });
    expect(seenBetween(board(a), board(a))).toEqual([]);
    const b = node([{ path: "game/box", value: 3 }], { hidden: { remainder: 1 } });
    expect(seenBetween(board(a), board(b))).toEqual([
      { path: "game.remainder (hidden)", was: 2, now: 1 },
    ]);
  });
});
