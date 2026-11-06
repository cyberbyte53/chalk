import { Board, type BoardEvent } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { Gene, type Genes, countOf, genesWord, isTallOf, peaCross, punnettOf } from "./pea-cross";

const { Tall: T, Short: t } = Gene;
const TT: Genes = [T, T];
const Tt: Genes = [T, t];
const tt: Genes = [t, t];

function board(given: Readonly<Record<string, unknown>> = {}) {
  const b = new Board(peaCross, given as never);
  const told: { signal: string; payload: unknown; at: number }[] = [];
  b.listen((e: BoardEvent) => {
    if (e.kind === "tell") told.push({ signal: e.signal, payload: e.payload, at: b.now });
  });
  return { b, told, read: () => b.read<typeof peaCross>() };
}

describe("the laws of one gene", () => {
  it("a plant is tall if it has any T, short only when both copies are t", () => {
    expect(isTallOf(TT)).toBe(true);
    expect(isTallOf(Tt)).toBe(true);
    expect(isTallOf([t, T])).toBe(true);
    expect(isTallOf(tt)).toBe(false);
  });

  it("the book writes the dominant copy first", () => {
    expect(genesWord([t, T])).toBe("Tt");
    expect(genesWord(Tt)).toBe("Tt");
    expect(genesWord(tt)).toBe("tt");
  });

  it("TT × tt: every child is Tt, all tall (the short trait seems gone)", () => {
    const kids = punnettOf(TT, tt);
    expect(kids.map(genesWord)).toEqual(["Tt", "Tt", "Tt", "Tt"]);
    expect(countOf(kids)).toEqual({ tall: 4, short: 0 });
  });

  it("Tt × Tt: TT, Tt, tT, tt, so 3 tall : 1 short (1 : 2 : 1 by genes)", () => {
    const kids = punnettOf(Tt, Tt);
    expect(kids).toEqual([TT, Tt, [t, T], tt]);
    expect(countOf(kids)).toEqual({ tall: 3, short: 1 });
  });

  it("Tt × tt: half tall, half short; tt × tt: all short", () => {
    expect(countOf(punnettOf(Tt, tt))).toEqual({ tall: 2, short: 2 });
    expect(countOf(punnettOf(tt, tt))).toEqual({ tall: 0, short: 4 });
  });

  it("over every cross, each child has one copy from each parent", () => {
    const all: Genes[] = [TT, Tt, [t, T], tt];
    for (const a of all)
      for (const b of all)
        punnettOf(a, b).forEach((kid, k) => {
          expect(a).toContain(kid[0]);
          expect(b).toContain(kid[1]);
          expect(kid[0]).toBe(a[Math.floor(k / 2)]);
          expect(kid[1]).toBe(b[k % 2]);
        });
  });
});

describe("a cross on a board", () => {
  it("starts as Mendel did: a pure tall and a pure short, nothing grown", () => {
    const { read } = board();
    expect(read().parents).toEqual([TT, tt]);
    expect(read().isCrossed).toBe(false);
    expect(read().parentLooks).toEqual(["tall", "short"]);
  });

  it("cross: the four children grow one after another, sprouted as each grows, crossed at the end", () => {
    const { b, told, read } = board();
    b.send("", "cross", { seconds: 2 });
    b.advanceTo(0.75);
    expect(read().grown).toBeCloseTo(1.5);
    b.runUntilIdle();
    expect(read().grown).toBe(4);
    expect(read().isCrossed).toBe(true);
    const sprouts = told.filter((e) => e.signal === "sprouted");
    expect(sprouts.map((e) => e.at)).toEqual([0.5, 1, 1.5, 2]);
    expect(told.at(-1)).toMatchObject({
      signal: "crossed",
      payload: { tall: 4, short: 0, generation: 1 },
      at: 2,
    });
  });

  it("cross refuses once the children have grown", () => {
    const { b, told } = board();
    b.send("", "cross", { seconds: 1 });
    b.runUntilIdle();
    const n = told.length;
    b.send("", "cross", { seconds: 1 });
    b.runUntilIdle();
    expect(told.length).toBe(n);
  });

  it("nextGeneration: two F1 rise to be the parents, and their children come out 3 tall : 1 short, the short one last", () => {
    const { b, told, read } = board();
    b.send("", "cross", { seconds: 2 });
    b.runUntilIdle();
    b.send("", "nextGeneration", { seconds: 4 });
    b.advanceTo(2.6);
    expect(read().rising).toBeGreaterThan(0);
    expect(read().rising).toBeLessThan(1);
    expect(read().chosen).toEqual([0, 1]);
    b.runUntilIdle();
    expect(read().parents).toEqual([Tt, Tt]);
    expect(read().generation).toBe(1);
    expect(read().chosen).toEqual([]);
    expect(told.find((e) => e.signal === "risen")).toMatchObject({
      payload: { generation: 1 },
      at: 3.2,
    });
    const sprouts = told.filter((e) => e.signal === "sprouted").slice(4);
    expect(sprouts.map((e) => (e.payload as { isTall: boolean }).isTall)).toEqual([
      true,
      true,
      true,
      false,
    ]);
    expect(told.at(-1)).toMatchObject({
      signal: "crossed",
      payload: { tall: 3, short: 1, generation: 2 },
      at: 7.2,
    });
  });

  it("nextGeneration refuses before the children have grown", () => {
    const { b, told, read } = board();
    b.send("", "nextGeneration", { seconds: 1 });
    b.runUntilIdle();
    expect(told).toEqual([]);
    expect(read().generation).toBe(0);
  });

  it("the student picks two children and crosses them: from F2, Tt × tt gives 2 tall : 2 short", () => {
    const { b, told, read } = board({ parents: [Tt, Tt], generation: 1 });
    b.input("", "crossParents", {});
    b.runUntilIdle();
    b.input("", "choose", { child: 1 });
    b.input("", "choose", { child: 3 });
    expect(read().chosen).toEqual([1, 3]);
    b.input("", "crossChosen", {});
    b.runUntilIdle();
    expect(read().parents).toEqual([Tt, tt]);
    expect(told.at(-1)).toMatchObject({
      signal: "crossed",
      payload: { tall: 2, short: 2, generation: 3 },
    });
  });

  it("choose: tapping again unpicks, a third pick replaces the older; nothing before they grow", () => {
    const { b, read } = board();
    b.input("", "choose", { child: 0 });
    expect(read().chosen).toEqual([]);
    b.send("", "cross", { seconds: 1 });
    b.runUntilIdle();
    b.input("", "choose", { child: 0 });
    b.input("", "choose", { child: 2 });
    b.input("", "choose", { child: 3 });
    expect(read().chosen).toEqual([2, 3]);
    b.input("", "choose", { child: 3 });
    expect(read().chosen).toEqual([2]);
    b.input("", "crossChosen", {});
    expect(read().rising).toBe(0);
  });

  it("start again: back to TT × tt, nothing grown", () => {
    const { b, read } = board({ parents: [tt, tt], generation: 3 });
    b.send("", "cross", { seconds: 1 });
    b.advanceTo(0.5);
    b.input("", "startAgain", {});
    b.runUntilIdle();
    expect(read()).toMatchObject({ parents: [TT, tt], generation: 0, grown: 0 });
  });

  it("refuses a child picked twice, or picked before the children grow", () => {
    expect(() => new Board(peaCross, { grown: 4, chosen: [1, 1] } as never).read()).toThrow();
    expect(() => new Board(peaCross, { grown: 2, chosen: [1] } as never).read()).toThrow();
  });
});
