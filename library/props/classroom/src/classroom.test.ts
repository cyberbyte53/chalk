import { Board, type BoardEvent } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import {
  Attention,
  MAX_LINES,
  askOrderOf,
  classroom,
  countsOf,
  litOrderOf,
  lostOrderOf,
  orderOf,
} from "./classroom";

const LINE = { en: "The lessons weren't interesting enough", hi: "पाठ काफ़ी रोचक नहीं थे" };

function board(given: Record<string, unknown> = {}) {
  const b = new Board(classroom, given as never);
  const told: { signal: string; payload: unknown }[] = [];
  b.listen((e: BoardEvent) => {
    if (e.kind === "tell") told.push({ signal: e.signal, payload: e.payload });
  });
  const read = () => b.read<typeof classroom>();
  const counts = () => countsOf(read().children);
  return { b, told, read, counts, signals: () => told.map((t) => t.signal) };
}

describe("the seed's orders", () => {
  it("each is every child once, the same for the same seed, different for another", () => {
    const order = orderOf(12, 3, 100);
    expect([...order].sort((a, b) => a - b)).toEqual(Array.from({ length: 12 }, (_, i) => i));
    expect(orderOf(12, 3, 100)).toEqual(order);
    expect(orderOf(12, 4, 100)).not.toEqual(order);
    expect(lostOrderOf(12, 3)).not.toEqual(litOrderOf(12, 3));
  });

  it("hands go up from the back two rows first", () => {
    const ask = askOrderOf(12, 3);
    expect(ask.slice(0, 8).every((i) => i >= 4)).toBe(true);
  });
});

describe("a class at the start", () => {
  it("everyone is following; the board is clean; the teacher isn't writing", () => {
    const { read, counts } = board();
    expect(counts()).toEqual({ following: 12, lost: 0, asking: 0, litUp: 0, stuck: 0, curious: 0 });
    expect(read().lines).toEqual([]);
    expect(read().isWriting).toBe(false);
  });
});

describe("losing them", () => {
  it("heads drop one after another in the seed's order, and lost is told at the end", () => {
    const { b, read, counts, told } = board();
    b.send("", "loseThem", { seconds: 6 });
    b.advanceTo(3);
    const midway = counts().lost;
    expect(midway).toBeGreaterThan(3);
    expect(midway).toBeLessThan(9);
    // Those lost so far are the first in the seed's order.
    const first = lostOrderOf(12, 3).slice(0, midway - 1);
    expect(first.every((i) => read().children[i]?.attention === Attention.Lost)).toBe(true);
    b.runUntilIdle();
    expect(counts().lost).toBe(12);
    expect(told.at(-1)).toEqual({ signal: "lost", payload: { count: 12 } });
  });

  it("only howMany, if given; and a second call that loses no one more is refused", () => {
    const { b, counts, signals } = board();
    b.send("", "loseThem", { seconds: 2, howMany: 7 });
    b.runUntilIdle();
    expect(counts().lost).toBe(7);
    b.send("", "loseThem", { seconds: 2, howMany: 5 });
    b.runUntilIdle();
    expect(counts().lost).toBe(7);
    expect(signals().filter((s) => s === "lost")).toHaveLength(1);
  });

  it("some of the lost have a '?' over them; none of the following do", () => {
    const { b, read } = board();
    b.send("", "loseThem", { seconds: 2 });
    b.runUntilIdle();
    const marks = read().children.filter((c) => c.hasQuestion).length;
    expect(marks).toBeGreaterThan(0);
    expect(marks).toBeLessThan(12);
    expect(
      board()
        .read()
        .children.some((c) => c.hasQuestion),
    ).toBe(false);
  });
});

describe("hands up", () => {
  it("two hands go up and stay up, heads up while they wait; raised says whose", () => {
    const { b, read, counts, told } = board();
    b.send("", "loseThem", { seconds: 2 });
    b.runUntilIdle();
    b.send("", "raiseHands", {});
    b.advanceTo(b.now + 0.4);
    const rising = read().rising;
    expect(rising).toHaveLength(2);
    const hand = read().children[rising[0] as number]?.hand ?? 0;
    expect(hand).toBeGreaterThan(0);
    expect(hand).toBeLessThan(1);
    b.runUntilIdle();
    expect(counts()).toMatchObject({ asking: 2, lost: 10 });
    const who = read().asking;
    expect(who.every((i) => read().children[i]?.drop === 0)).toBe(true);
    expect(told.at(-1)).toEqual({ signal: "raised", payload: { who } });
    // They stay up.
    b.advanceTo(b.now + 30);
    expect(counts().asking).toBe(2);
  });

  it("these children, if named; a hand already up is not raised again", () => {
    const { b, read } = board();
    b.send("", "raiseHands", { who: [5, 9] });
    b.runUntilIdle();
    expect(read().asking).toEqual([5, 9]);
    b.send("", "raiseHands", { who: [9] });
    b.runUntilIdle();
    expect(read().asking).toEqual([5, 9]);
  });
});

describe("writing on the board", () => {
  it("the teacher chalks the line over its seconds, and written says which line", () => {
    const { b, read, told } = board();
    b.send("", "write", { line: LINE, seconds: 3 });
    expect(read().lines).toEqual([LINE]);
    b.advanceTo(1.5);
    expect(read().isWriting).toBe(true);
    expect(read().writing).toBeCloseTo(0.5, 5);
    b.runUntilIdle();
    expect(read().isWriting).toBe(false);
    expect(told.at(-1)).toEqual({ signal: "written", payload: { line: 0 } });
    b.send("", "write", { line: LINE, seconds: 3 });
    b.runUntilIdle();
    expect(told.at(-1)).toEqual({ signal: "written", payload: { line: 1 } });
  });

  it("refuses a line while one is being written, and a full board", () => {
    const { b, read } = board();
    b.send("", "write", { line: LINE, seconds: 3 });
    b.advanceTo(1);
    b.send("", "write", { line: LINE, seconds: 3 });
    expect(read().lines).toHaveLength(1);
    b.runUntilIdle();
    for (let k = 1; k < MAX_LINES + 2; k++) {
      b.send("", "write", { line: LINE, seconds: 1 });
      b.runUntilIdle();
    }
    expect(read().lines).toHaveLength(MAX_LINES);
  });

  it("the duster clears it, wiped at the end; a clean board isn't wiped", () => {
    const { b, read, signals } = board({ lines: [LINE, LINE] });
    b.send("", "wipe", {});
    b.advanceTo(0.6);
    expect(read().lines).toHaveLength(2);
    b.runUntilIdle();
    expect(read().lines).toEqual([]);
    expect(signals()).toEqual(["wiped"]);
    b.send("", "wipe", {});
    b.runUntilIdle();
    expect(signals()).toEqual(["wiped"]);
  });
});

describe("the student turns to a child", () => {
  it("a lost child looks up; one already following is not helped", () => {
    const { b, read, told } = board();
    b.send("", "loseThem", { seconds: 2 });
    b.runUntilIdle();
    b.input("", "help", { child: 4 });
    b.advanceTo(b.now + 0.35);
    const drop = read().children[4]?.drop ?? 0;
    expect(drop).toBeGreaterThan(0);
    expect(drop).toBeLessThan(1);
    b.runUntilIdle();
    expect(read().children[4]?.attention).toBe(Attention.Following);
    expect(told.at(-1)).toEqual({ signal: "helped", payload: { child: 4, wasAsking: false } });
    b.input("", "help", { child: 4 });
    b.runUntilIdle();
    expect(told.filter((t) => t.signal === "helped")).toHaveLength(1);
  });

  it("a raised hand is answered: it comes down, and the rest stay as they were", () => {
    const { b, read, counts, told } = board();
    b.send("", "loseThem", { seconds: 2 });
    b.runUntilIdle();
    b.send("", "raiseHands", { who: [6, 10] });
    b.runUntilIdle();
    b.input("", "help", { child: 10 });
    b.runUntilIdle();
    expect(read().children[10]).toMatchObject({ attention: Attention.Following, hand: 0, drop: 0 });
    expect(counts()).toEqual({ following: 1, lost: 10, asking: 1, litUp: 0, stuck: 0, curious: 0 });
    expect(told.at(-1)).toEqual({ signal: "helped", payload: { child: 10, wasAsking: true } });
  });
});

describe("lighting up", () => {
  it("one by one every head comes up over a glowing slate, hands down too; lit at the end", () => {
    const { b, read, counts, told } = board();
    b.send("", "loseThem", { seconds: 2 });
    b.runUntilIdle();
    b.send("", "raiseHands", {});
    b.runUntilIdle();
    const start = b.now;
    b.send("", "lightUp", { seconds: 6 });
    b.advanceTo(start + 3);
    const some = counts().litUp;
    expect(some).toBeGreaterThan(3);
    expect(some).toBeLessThan(9);
    const first = litOrderOf(12, 3)[0] as number;
    expect(read().children[first]?.attention).toBe(Attention.LitUp);
    b.runUntilIdle();
    expect(counts()).toEqual({ following: 0, lost: 0, asking: 0, litUp: 12, stuck: 0, curious: 0 });
    expect(read().children.every((c) => c.glow === 1 && c.drop === 0 && c.hand === 0)).toBe(true);
    expect(told.at(-1)).toEqual({ signal: "lit", payload: { count: 12 } });
  });

  it("a lit child can't be helped; settle brings the class back to following", () => {
    const { b, read, counts, signals } = board();
    b.send("", "lightUp", { seconds: 1 });
    b.runUntilIdle();
    b.input("", "help", { child: 0 });
    b.runUntilIdle();
    expect(signals()).not.toContain("helped");
    b.send("", "settle", {});
    expect(counts().following).toBe(12);
    expect(read().lit).toBe(0);
  });
});

describe("states the class refuses", () => {
  it("more lost than children, a child twice, a hand rising that isn't up", () => {
    expect(() => new Board(classroom, { count: 4, lost: 5 } as never)).toThrow();
    expect(() => new Board(classroom, { asking: [2, 2] } as never)).toThrow();
    expect(() => new Board(classroom, { rising: [3] } as never)).toThrow();
    expect(() => new Board(classroom, { count: 4, helped: [7] } as never)).toThrow();
  });
});
