import { Board, type BoardEvent } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { ImageCase, MirrorKind, Place } from "./mirror";
import { sphericalMirror } from "./spherical-mirror";

function board(given: Readonly<Record<string, unknown>> = {}) {
  const b = new Board(sphericalMirror, { u: -35, ...given });
  const told: { signal: string; payload: unknown; at: number }[] = [];
  let now = 0;
  b.listen((e: BoardEvent) => {
    if (e.kind === "tell") told.push({ signal: e.signal, payload: e.payload, at: now });
  });
  const advance = (t: number) => {
    now = t;
    b.advanceTo(t);
  };
  return { b, told, advance, read: () => b.read<typeof sphericalMirror>() };
}

describe("a concave mirror, f = 10 cm, as a board plays it", () => {
  it("starts with a candle far beyond C: the image real, inverted, diminished", () => {
    const { read } = board();
    const s = read();
    expect(s.imageCase).toBe(ImageCase.BeyondC);
    expect(s.v).toBeCloseTo(-14);
    expect(s.m).toBeCloseTo(-0.4);
    expect(s.isReal).toBe(true);
    expect(s.isErect).toBe(false);
  });

  it("a glide to 5 cm passes every case, told on the way in order, then moved at its end", () => {
    const { b, told, advance, read } = board();
    b.send("", "moveObjectTo", { u: -5, seconds: 10 });
    advance(5);
    // Halfway in time is halfway along a smooth move: 20 cm, at C.
    expect(read().u).toBeCloseTo(-20);
    expect(read().imageCase).toBe(ImageCase.AtC);
    b.runUntilIdle();
    expect(read().u).toBe(-5);
    expect(told.map((t) => t.signal)).toEqual([
      "caseChanged",
      "caseChanged",
      "caseChanged",
      "caseChanged",
      "moved",
    ]);
    expect(told.map((t) => (t.payload as { to: string }).to)).toEqual([
      ImageCase.AtC,
      ImageCase.BetweenCAndF,
      ImageCase.AtF,
      ImageCase.BetweenFAndP,
      ImageCase.BetweenFAndP,
    ]);
  });

  it("each case is told when the object really is there", () => {
    const { b, read } = board();
    const seen: string[] = [];
    b.listen((e) => {
      if (e.kind === "tell" && e.signal === "caseChanged")
        seen.push(`${(e.payload as { to: string }).to}=${read().imageCase}`);
    });
    b.send("", "moveObjectTo", { u: -5, seconds: 8 });
    b.runUntilIdle();
    for (const s of seen) {
      const [told, now] = s.split("=");
      expect(now).toBe(told);
    }
  });

  it("placeObject glides to the textbook's place; refused for a convex mirror", () => {
    const { b, read, told } = board();
    b.send("", "placeObject", { at: Place.AtC, seconds: 2 });
    b.runUntilIdle();
    expect(read().u).toBe(-20);
    expect(read().m).toBeCloseTo(-1);
    expect(told.at(-1)?.signal).toBe("moved");
    const c = board({ kind: MirrorKind.Convex, u: -20 });
    c.b.send("", "placeObject", { at: Place.AtF, seconds: 2 });
    c.b.runUntilIdle();
    expect(c.read().u).toBe(-20);
    expect(c.told).toEqual([]);
  });

  it("a glide asked beyond the range stops at its end; at once (0 s) it is there", () => {
    const { b, read } = board();
    b.send("", "moveObjectTo", { u: -500, seconds: 0 });
    expect(read().u).toBe(-31);
    b.send("", "moveObjectTo", { u: 0, seconds: 0 });
    expect(read().u).toBe(-2);
  });

  it("the student's drag stops a glide where it is, and tells a change of case", () => {
    const { b, read, told, advance } = board();
    b.send("", "moveObjectTo", { u: -5, seconds: 10 });
    advance(1);
    b.input("", "moveObject", { x: -15 });
    expect(read().u).toBe(-15);
    expect(told.at(-1)?.payload).toEqual({ to: ImageCase.BetweenCAndF });
    b.runUntilIdle();
    expect(read().u).toBe(-15);
    expect(told.some((t) => t.signal === "moved")).toBe(false);
    b.input("", "letGo", { x: -15 });
    expect(told.at(-1)).toMatchObject({
      signal: "released",
      payload: { u: -15, to: ImageCase.BetweenCAndF },
    });
  });

  it("a drag is refused when the object is fixed", () => {
    const { b, read } = board({ canMoveObject: false });
    b.input("", "moveObject", { x: -15 });
    expect(read().u).toBe(-35);
  });

  it("switched to convex, the object is kept in range and the image is virtual, erect, diminished", () => {
    const { b, read, told } = board({ canSwitchKind: true });
    b.input("", "setKind", { kind: MirrorKind.Convex });
    const s = read();
    expect(s.u).toBe(-26);
    expect(s.imageCase).toBe(ImageCase.Convex);
    expect(s.isReal).toBe(false);
    expect(s.m).toBeGreaterThan(0);
    expect(s.m).toBeLessThan(1);
    expect(told.at(-1)?.payload).toEqual({ to: ImageCase.Convex });
  });

  it("the variables' schema refuses an object behind the mirror", () => {
    expect(() => new Board(sphericalMirror, { u: 5 })).toThrow();
    expect(() => new Board(sphericalMirror, { objectHeight: 13 })).toThrow();
    expect(new Board(sphericalMirror).read<typeof sphericalMirror>().imageCase).toBe(
      ImageCase.BeyondC,
    );
  });
});
