import { Board, type BoardEvent } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { coordinatePlane } from "./coordinate-plane";
import { Marks, Scene } from "./plane";
import { Direction, Roads, SECONDS_PER_BLOCK, stepFrom } from "./walker";

// The town on the event model, played as a board plays it: taps go in, the clock jumps to what is
// due, and what each part tells is heard. The same laws as model.test.ts's town.

/** Lesson 1's town: streets counted from 1 along the main road, houses up each street. */
const houses = Array.from({ length: 5 }, (_, i) =>
  Array.from({ length: 4 }, (_, j) => ({ x: i + 1, y: j + 1 })),
).flat();
const townPlane = {
  window: { xMin: 0, xMax: 6, yMin: 0, yMax: 5 },
  marks: Marks.Counts,
  scene: Scene.Town,
  axisNames: [
    { en: "Street number", hi: "गली नंबर" },
    { en: "House number", hi: "मकान नंबर" },
  ],
};

/** The whole town: the plane, its houses, Riya at the corner; what is told, as "walker.stepped 1,0". */
function town(plane: Record<string, unknown> = {}) {
  const board = new Board(coordinatePlane, {
    plane: { ...townPlane, ...plane },
    places: { places: houses },
    walker: { walkFrom: { x: 0, y: 0 }, roads: Roads.Town },
  });
  const told: string[] = [];
  board.listen((e: BoardEvent) => {
    if (e.kind !== "tell") return;
    const p = e.payload as { x?: number; y?: number; why?: string; at?: number };
    told.push(
      `${e.path}.${e.signal}${p.x !== undefined ? ` ${p.x},${p.y}` : ""}${p.why !== undefined ? `: ${p.why}` : ""}${p.at !== undefined ? ` ${p.at}` : ""}`,
    );
  });
  const read = () => board.read<typeof coordinatePlane>();
  /** Taps an arrow, each played to its end. */
  const walk = (...directions: Direction[]) => {
    for (const direction of directions) {
      board.input("walker", "step", { direction });
      board.runUntilIdle();
    }
  };
  return { board, told, read, walk };
}

const { Up, Down, Left, Right } = Direction;

describe("the town: Aman's house is any house a tap makes it, and Riya walks there on the roads", () => {
  it("a tap on Street 4, House 3 makes it Aman's house; a tap off the houses does nothing", () => {
    const { board, read } = town();
    board.input("places", "chooseTarget", { x: 4, y: 3 });
    expect(read().places.target).toEqual({ x: 4, y: 3 });
    board.input("places", "chooseTarget", { x: 6, y: 5 });
    expect(read().places.target).toEqual({ x: 4, y: 3 });
  });

  it("4 blocks right, then 3 up: she stands at Aman's house, and says she has arrived", () => {
    const { board, read, walk, told } = town();
    board.input("places", "chooseTarget", { x: 4, y: 3 });
    walk(Right, Right, Right, Right, Up, Up, Up);
    expect(read().walker.at).toEqual({ x: 4, y: 3 });
    expect(told.at(-1)).toBe("walker.arrived 4,3");
    expect(board.now).toBeCloseTo(7 * SECONDS_PER_BLOCK);
  });

  it("mid-glide she is between blocks, read from the clock", () => {
    const { board, read } = town();
    board.input("walker", "step", { direction: Right });
    board.advanceTo(SECONDS_PER_BLOCK / 2);
    expect(read().walker.at.x).toBeCloseTo(0.5);
    expect(read().walker.isWalking).toBe(true);
  });

  it("going back the way she came takes those blocks off her route", () => {
    const { read, walk } = town();
    walk(Right, Right, Right, Left);
    expect(read().walker.trail).toEqual([
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]);
  });

  it("in the town she walks only on roads: across on the main road, up and down a street", () => {
    const { read, walk, told } = town();
    walk(Up);
    expect(told.at(-1)).toBe("walker.blocked: no street going up here");
    walk(Right, Right, Up, Right);
    expect(told.at(-1)).toBe("walker.blocked: no road across here: back down to the main road");
    walk(Down, Down);
    expect(told.at(-1)).toBe("walker.blocked: the edge of the map");
    expect(read().walker.at).toEqual({ x: 2, y: 0 });
  });

  it("↺ takes her back to the start and clears her route, even mid-glide", () => {
    const { board, read } = town();
    board.input("walker", "step", { direction: Right });
    board.advanceTo(0.1);
    board.input("walker", "backToStart");
    board.runUntilIdle();
    expect(read().walker.at).toEqual({ x: 0, y: 0 });
    expect(read().walker.trail).toEqual([]);
    expect(board.queued).toEqual([]);
  });

  it("walkTo: a lesson walks her from the start to (x, y), along then up, block by block", () => {
    const { board, read, told } = town();
    board.send("walker", "walkTo", { x: 2, y: 2 });
    board.runUntilIdle();
    expect(read().walker.at).toEqual({ x: 2, y: 2 });
    expect(told).toEqual([
      "walker.stepped 1,0",
      "walker.stepped 2,0",
      "walker.stepped 2,1",
      "walker.stepped 2,2",
    ]);
    expect(board.now).toBeCloseTo(4 * SECONDS_PER_BLOCK);
  });

  it("a number tapped lights every place with it: Street 4's four houses", () => {
    const { board, read } = town();
    board.input("plane", "tapNumber", { axis: "x", value: 4 });
    expect(read().places.lit).toEqual({ axis: "x", value: 4 });
    expect(read().places.litCount).toBe(4);
    expect(read().plane.lit).toEqual({ axis: "x", value: 4 });
  });
});

describe("the town grown past the corner", () => {
  // The step rule alone: where Riya may go from where she stands, in a town of this window.
  const at = (x: number, y: number, window = { xMin: -4.5, xMax: 4.5, yMin: -3.5, yMax: 3.5 }) => ({
    walkFrom: { x: 0, y: 0 },
    at: { x, y },
    roads: Roads.Town,
    window,
    upLines: null,
  });
  it("west along the road, south on a street, up her corner's street", () => {
    expect(stepFrom(at(0, 0), Direction.Left)).toEqual({ to: { x: -1, y: 0 } });
    expect(stepFrom(at(0, 0), Direction.Up)).toEqual({ to: { x: 0, y: 1 } });
    expect(stepFrom(at(-2, 0), Direction.Down)).toEqual({ to: { x: -2, y: -1 } });
  });
  it("lesson 1's town, which starts at the corner: none of that", () => {
    const lesson1 = { xMin: 0, xMax: 6.5, yMin: 0, yMax: 5.5 };
    expect("blocked" in stepFrom(at(2, 0, lesson1), Direction.Down)).toBe(true);
    expect("blocked" in stepFrom(at(0, 0, lesson1), Direction.Up)).toBe(true);
  });
});

describe("streets rise from the road: the number line first, then the town", () => {
  it("with no street risen, Riya can walk the road but not up it", () => {
    const { read, walk, told } = town({ upLines: [] });
    walk(Right, Right, Up);
    expect(told.at(-1)).toBe("walker.blocked: this street isn't there yet");
    expect(read().walker.at).toEqual({ x: 2, y: 0 });
  });

  it("Street 2 rises: it grows, then counts as risen, and Riya can walk up it", () => {
    const { board, read, walk, told } = town({ upLines: [] });
    walk(Right, Right);
    board.send("plane", "raiseUpLine", { at: 2 });
    board.advanceTo(board.now + 0.6);
    expect(read().plane.rising?.height).toBeCloseTo(0.5);
    expect(read().walker.upLines).toEqual([]);
    board.runUntilIdle();
    expect(read().plane.upLines).toEqual([2]);
    expect(told.at(-1)).toBe("plane.risen 2");
    walk(Up);
    expect(read().walker.at).toEqual({ x: 2, y: 1 });
  });

  it("then every street rises, one after another, and the town is as usual", () => {
    const { board, read, told } = town({ upLines: [2] });
    board.send("plane", "raiseAllUpLines");
    board.runUntilIdle();
    expect(told.filter((t) => t.startsWith("plane.risen"))).toEqual([
      "plane.risen 1",
      "plane.risen 3",
      "plane.risen 4",
      "plane.risen 5",
      "plane.risen 6",
    ]);
    expect(read().plane.upLines).toBeNull();
  });
});

describe("a new house is a new walk", () => {
  it("the first house is only marked: Riya stays where she is", () => {
    const { board, read, walk } = town();
    walk(Right, Right);
    board.input("places", "chooseTarget", { x: 4, y: 3 });
    expect(read().walker.at).toEqual({ x: 2, y: 0 });
  });

  it("making another house Aman's sends Riya back to the corner", () => {
    const { board, read, walk } = town();
    board.input("places", "chooseTarget", { x: 4, y: 3 });
    walk(Right, Right);
    board.input("places", "chooseTarget", { x: 2, y: 1 });
    expect(read().walker.at).toEqual({ x: 0, y: 0 });
    expect(read().walker.target).toEqual({ x: 2, y: 1 });
  });
});
