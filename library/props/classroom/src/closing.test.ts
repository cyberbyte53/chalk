import { Board, type BoardEvent } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import {
  Attention,
  type Standing,
  StandingKind,
  classroom,
  countsOf,
  revealOrderOf,
  sparkOrderOf,
} from "./classroom";

const { NeedsHelp, OnTrack, Curious } = StandingKind;
const say = (en: string): Standing["words"] => ({ en, hi: en });

/** Twelve standings: child 6 stuck on swapping, 2 and 9 curious, the rest on track. */
const STANDING: Standing[] = Array.from({ length: 12 }, (_, i) =>
  i === 6
    ? { kind: NeedsHelp, words: say("swaps the numbers") }
    : i === 2 || i === 9
      ? { kind: Curious, words: say("curious about mirrors") }
      : { kind: OnTrack, words: null },
);

function board(given: Record<string, unknown> = {}) {
  const b = new Board(classroom, { standing: STANDING, ...given } as never);
  const told: { signal: string; payload: unknown }[] = [];
  b.listen((e: BoardEvent) => {
    if (e.kind === "tell") told.push({ signal: e.signal, payload: e.payload });
  });
  const read = () => b.read<typeof classroom>();
  return { b, told, read, counts: () => countsOf(read().children) };
}

/** Played: everyone lit up. */
function lit() {
  const it = board();
  it.b.send("", "lightUp", { seconds: 2 });
  it.b.runUntilIdle();
  return it;
}

describe("orders", () => {
  it("standings show on-track first, then the curious, then who needs help; only children with one", () => {
    const order = revealOrderOf(STANDING, 12, 3);
    expect(order).toHaveLength(12);
    expect(order.slice(-1)).toEqual([6]);
    expect(order.slice(-3, -1).sort()).toEqual([2, 9]);
    const some = [null, { kind: Curious, words: null }, null] as (Standing | null)[];
    expect(revealOrderOf(some, 3, 3)).toEqual([1]);
    expect(sparkOrderOf(STANDING, 12, 3).sort()).toEqual([2, 9]);
  });
});

describe("lit up, one who needs help is stuck", () => {
  it("child 6 sits head down over a glowing slate; the others are lit up", () => {
    const { read, counts } = lit();
    expect(read().children[6]).toMatchObject({ attention: Attention.Stuck, glow: 1 });
    expect(read().children[6]?.drop ?? 0).toBeGreaterThan(0.5);
    expect(counts()).toMatchObject({ litUp: 11, stuck: 1 });
  });
});

describe("revealing where each child stands", () => {
  it("tags come in one after another; revealed at the end; refused once all show", () => {
    const { b, read, told } = lit();
    const from = b.now;
    b.send("", "revealStanding", { seconds: 3 });
    b.advanceTo(from + 1.5);
    const shown = read().children.filter((c) => c.tag === 1).length;
    expect(shown).toBeGreaterThan(3);
    expect(shown).toBeLessThan(9);
    // Who needs help comes last.
    expect(read().children[6]?.tag).toBe(0);
    b.runUntilIdle();
    expect(read().children.every((c) => c.tag === 1)).toBe(true);
    expect(told.at(-1)).toEqual({ signal: "revealed", payload: { count: 12 } });
    b.send("", "revealStanding", { seconds: 3 });
    b.runUntilIdle();
    expect(told.filter((t) => t.signal === "revealed")).toHaveLength(1);
  });

  it("with no standings, there is nothing to reveal", () => {
    const { b, told } = board({ standing: [] });
    b.send("", "revealStanding", { seconds: 1 });
    b.runUntilIdle();
    expect(told).toEqual([]);
  });
});

describe("the teacher visits the one who needs him", () => {
  it("he walks to child 6; their head comes up only as he arrives; visited at the end", () => {
    const { b, read, told } = lit();
    const from = b.now;
    b.send("", "visit", { child: 6, seconds: 4 });
    b.advanceTo(from + 2);
    expect(read().visiting).toBe(6);
    expect(read().children[6]?.attention).toBe(Attention.Stuck);
    b.runUntilIdle();
    expect(read().visited).toBe(6);
    expect(read().children[6]).toMatchObject({ attention: Attention.LitUp, drop: 0 });
    expect(told.at(-1)).toEqual({ signal: "visited", payload: { child: 6 } });
  });

  it("refused while he is on his way, and to the child he is already beside", () => {
    const { b, told } = lit();
    b.send("", "visit", { child: 6, seconds: 2 });
    b.send("", "visit", { child: 3, seconds: 2 });
    b.runUntilIdle();
    b.send("", "visit", { child: 6, seconds: 2 });
    b.runUntilIdle();
    expect(told.filter((t) => t.signal === "visited")).toEqual([
      { signal: "visited", payload: { child: 6 } },
    ]);
  });

  it("writing brings him back to the board", () => {
    const { b, read } = lit();
    b.send("", "visit", { child: 6, seconds: 1 });
    b.runUntilIdle();
    b.send("", "write", { line: { en: "a", hi: "a" }, seconds: 1 });
    expect(read().visited).toBe(null);
  });
});

describe("curiosity, not confusion", () => {
  it("the curious spark one by one: head up, a hand up, slate aglow, no '?'; sparked at the end", () => {
    const { b, read, counts, told } = lit();
    b.send("", "spark", { seconds: 2 });
    b.runUntilIdle();
    for (const i of [2, 9]) {
      expect(read().children[i]).toMatchObject({
        attention: Attention.Curious,
        spark: 1,
        hand: 1,
        drop: 0,
        glow: 1,
        hasQuestion: false,
      });
    }
    expect(counts()).toMatchObject({ curious: 2, litUp: 9, stuck: 1 });
    expect(told.at(-1)).toEqual({ signal: "sparked", payload: { count: 2 } });
  });

  it("a class with no curious children doesn't spark; lightUp alone sparks no one", () => {
    const onTrack = STANDING.map(() => ({ kind: OnTrack, words: null }));
    const { b, told } = board({ standing: onTrack });
    b.send("", "spark", { seconds: 1 });
    b.runUntilIdle();
    expect(told).toEqual([]);
    expect(countsOf(lit().read().children).curious).toBe(0);
  });

  it("refuses a standing for a child who isn't there", () => {
    expect(() => new Board(classroom, { count: 4, standing: STANDING } as never)).toThrow();
  });
});
