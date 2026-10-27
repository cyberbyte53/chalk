import { describe, expect, it } from "vitest";
import { bagOf } from "./arithmetic";
import { billSplit, shareOf, shareText } from "./bill-split";
import { factorTree, nodesOf } from "./factor-tree";
import { lapRace } from "./lap-race";
import { primeTowers } from "./prime-towers";
import { fitLines, stickMeasure } from "./stick-measure";
import { sweetShare } from "./sweet-share";
import { TenStage, primesText, tenMaker, terminatingDecimal, workingOf } from "./ten-maker";
import { door } from "./test-door";

const extra = {
  isEditable: false,
  cancelLabel: { en: "Cancel", hi: "काटो" },
  pairLabel: { en: "Pair into tens", hi: "दहाई में जोड़ो" },
  topUpLabel: { en: "Add {p}s", hi: "{p} जोड़ो" },
};

describe("sweetShare: a sweets among b friends, a round at a time", () => {
  const d = door(sweetShare);
  const start = {
    sweets: 17,
    friends: 5,
    rounds: 0,
    isEditable: false,
    showSum: false,
    showLog: false,
    shareLabel: { en: "Give everyone one", hi: "सबको एक दो" },
    roundsLabel: { en: "Rounds", hi: "बारियाँ" },
    boxLabel: { en: "Left in the box", hi: "डिब्बे में बचीं" },
  };
  it("17 among 5: three rounds, 2 left, and then no round is possible", () => {
    let s = start;
    const over: unknown[] = [];
    for (let i = 0; i < 3; i++) {
      const out = d.run(s, "giveRound");
      s = out.state;
      over.push(...out.emit.filter((e) => e.signal === "over"));
    }
    expect(s.rounds).toBe(3);
    expect(d.look(s).box).toBe(2);
    expect(d.look(s).isOver).toBe(true);
    expect(over).toEqual([{ signal: "over", payload: { q: 3, r: 2 } }]);
    expect(d.run(s, "giveRound").state).toEqual(s);
  });
  it("ends on a = bq + r with 0 ≤ r < b, the lemma's q and r, for every a ≤ 120 and b ≤ 12", () => {
    for (let a = 0; a <= 120; a++) {
      for (let b = 1; b <= 12; b++) {
        let s = { ...start, sweets: a, friends: b };
        while (d.look(s).canGiveRound === true) s = d.run(s, "giveRound").state;
        const box = d.look(s).box as number;
        expect(a).toBe(b * s.rounds + box);
        expect(box >= 0 && box < b).toBe(true);
        expect([d.look(s).quotient, d.look(s).remainder]).toEqual([s.rounds, box]);
      }
    }
  });
  it("fewer sweets than friends: over before it starts (3 among 7 is 7 × 0 + 3)", () => {
    const s = { ...start, sweets: 3, friends: 7 };
    expect(d.look(s).isOver).toBe(true);
    expect(d.look(s).box).toBe(3);
  });
  it("changing a or b starts again; giveAll reveals; too many rounds are refused", () => {
    const mid = { ...start, rounds: 2 };
    expect(d.run(mid, "setFriends", { value: 4 }).state).toEqual({ ...start, friends: 4 });
    expect(d.run(mid, "startAgain").state.rounds).toBe(0);
    expect(d.run(start, "giveAll").state.rounds).toBe(3);
    expect(d.rejects(start, { rounds: 4 })).toBe(true);
    expect(d.refuses(start, "setFriends", { value: 0 })).toBe(true);
  });
});

describe("factorTree: any splits, the same primes (NCERT 1.3, Fig 1.1)", () => {
  const d = door(factorTree);
  type Tree = {
    number: number;
    splits: { node: string; factor: number }[];
    selected: string | null;
    isEditable: boolean;
  };
  const split = (s: Tree, node: string, factor: number) =>
    d.run(s, "split", { node, factor }).state;
  const fresh = (number: number): Tree => ({
    number,
    splits: [],
    selected: null,
    isEditable: false,
  });
  it("360 = 36 × 10 and 360 = 8 × 45 end in the same primes", () => {
    let one = fresh(360);
    one = split(one, "r", 36);
    one = split(one, "r0", 6);
    one = split(one, "r1", 2);
    one = split(one, "r00", 2);
    one = split(one, "r01", 3);
    let two = fresh(360);
    two = split(two, "r", 8);
    two = split(two, "r0", 2);
    two = split(two, "r1", 5);
    two = split(two, "r01", 2);
    two = split(two, "r11", 3);
    expect(d.look(one).isComplete).toBe(true);
    expect(d.look(two).isComplete).toBe(true);
    expect(d.look(one).bag).toEqual(bagOf(360));
    expect(d.look(two).bag).toEqual(d.look(one).bag);
    expect(d.look(one).bagText).toBe("2³ × 3² × 5");
  });
  it("a split that isn't a factor, or of a prime, changes nothing", () => {
    const s = fresh(360);
    expect(d.run(s, "split", { node: "r", factor: 7 }).state).toEqual(s);
    const prime = split(s, "r", 2);
    expect(d.run(prime, "split", { node: "r0", factor: 2 }).state).toEqual(prime);
  });
  it("announces completion with the factorisation", () => {
    const { emit } = d.run(fresh(6), "split", { node: "r", factor: 2 });
    expect(emit.at(-1)).toEqual({ signal: "completed", payload: { primes: "2 × 3" } });
  });
  it("splitAll finishes any tree for every number up to 400", () => {
    for (let n = 2; n <= 400; n++) {
      const done = d.run(fresh(n), "splitAll").state;
      expect(
        nodesOf(done)
          .filter((x) => x.children === null)
          .every((x) => x.isPrime),
      ).toBe(true);
      expect(d.look(done).bag).toEqual(bagOf(n));
    }
  });
  it("refuses a stored split that doesn't divide", () => {
    expect(d.rejects(fresh(360), { splits: [{ node: "r", factor: 7 }] })).toBe(true);
  });
  it("select picks an end that can be split, and a split puts it down", () => {
    const picked = d.run(fresh(360), "select", { node: "r" }).state;
    expect(picked.selected).toBe("r");
    expect(split(picked, "r", 10).selected).toBeNull();
    const prime = split(fresh(6), "r", 2);
    expect(d.run(prime, "select", { node: "r0" }).state.selected).toBeNull();
  });
});

describe("tenMaker: terminating exactly when q is 2s and 5s (NCERT 1.5, Theorems 1.5–1.7)", () => {
  const d = door(tenMaker);
  it("the book's fractions (Ex 1.4 Q1, Q2)", () => {
    expect(terminatingDecimal(13, 3125)).toBe("0.00416");
    expect(terminatingDecimal(17, 8)).toBe("2.125");
    expect(terminatingDecimal(64, 455)).toBeNull();
    expect(terminatingDecimal(15, 1600)).toBe("0.009375");
    expect(terminatingDecimal(29, 343)).toBeNull();
    expect(terminatingDecimal(23, 200)).toBe("0.115");
    expect(terminatingDecimal(6, 15)).toBe("0.4");
    expect(terminatingDecimal(35, 50)).toBe("0.7");
    expect(terminatingDecimal(77, 210)).toBeNull();
  });
  it("agrees with long division for every p/q with q ≤ 200", () => {
    for (let q = 1; q <= 200; q++) {
      for (const p of [1, 3, 7, q + 1]) {
        const dec = terminatingDecimal(p, q);
        if (dec !== null) expect(Number(dec)).toBeCloseTo(p / q, 12);
      }
    }
  });
  it("6/15: cancel the 3s, pair 2 with 5, and 2/5 is already a ten", () => {
    const s = { numerator: 6, denominator: 15, stage: TenStage.Given, ...extra };
    const cancelled = d.run(s, "cancel");
    expect(cancelled.emit).toEqual([
      { signal: "cancelled", payload: { numerator: 2, denominator: 5 } },
    ]);
    const paired = d.run(cancelled.state, "pair");
    expect(paired.state.stage).toBe(TenStage.Paired);
    expect(workingOf(d.run(paired.state, "topUp").state)).toEqual([
      "6/15",
      "= 2/5",
      "= (2 × 2)/(2 × 5)",
      "= 4/10",
      "= 0.4",
    ]);
  });
  it("3/8: pair finds three 2s and no 5, Add 5s makes 375/1000", () => {
    const s = { numerator: 3, denominator: 8, stage: TenStage.Cancelled, ...extra };
    const paired = d.run(s, "pair");
    expect(paired.emit).toEqual([{ signal: "paired", payload: { tens: 0, others: [] } }]);
    expect(d.look(paired.state).multiplier).toBe(125);
    const topped = d.run(paired.state, "topUp");
    expect(topped.emit).toEqual([{ signal: "toppedUp", payload: { decimal: "0.375" } }]);
    expect(workingOf(topped.state)).toEqual([
      "3/8",
      "nothing to cancel",
      "= 3/2³",
      "= (3 × 5³)/(2³ × 5³)",
      "= 375/1000",
      "= 0.375",
    ]);
  });
  it("a denominator of 2s and 5s in equal number is a power of 10 once paired", () => {
    const s = { numerator: 7, denominator: 100, stage: TenStage.Cancelled, ...extra };
    const paired = d.run(s, "pair");
    expect(paired.state.stage).toBe(TenStage.ToppedUp);
    expect(paired.emit.map((e) => e.signal)).toEqual(["paired", "toppedUp"]);
  });
  it("7/30: the 3 has no partner, so pairing says it can't terminate and Add does nothing", () => {
    const s = { numerator: 7, denominator: 30, stage: TenStage.Cancelled, ...extra };
    const paired = d.run(s, "pair");
    expect(paired.emit).toEqual([
      { signal: "paired", payload: { tens: 1, others: [3] } },
      { signal: "cantTopUp", payload: { others: [3] } },
    ]);
    expect(d.run(paired.state, "topUp").state).toEqual(paired.state);
    expect(workingOf(paired.state)).toEqual(["7/30", "nothing to cancel", "= 7/(2 × 3 × 5)"]);
    expect(primesText(40)).toBe("2³ × 5");
  });
});

describe("stickMeasure: Euclid's method with two sticks", () => {
  const d = door(stickMeasure);
  const start = { ...stickMeasure.defaults, stickA: 51, stickB: 21 };
  it("51 and 21: lay, keep, lay, keep, lay, and 3 is left measuring both", () => {
    let s = start;
    const signals: string[] = [];
    for (const a of ["lay", "keep", "lay", "keep", "lay"] as const) {
      const out = d.run(s, a);
      s = out.state;
      signals.push(...out.emit.map((e) => e.signal));
    }
    expect(signals).toEqual(["laid", "kept", "laid", "kept", "laid", "finished"]);
    expect(d.look(s).isDone).toBe(true);
    expect(d.look(s).pair).toEqual({ long: 9, short: 3 });
  });
  it("can't keep before laying, nor lay twice", () => {
    expect(d.run(start, "keep").state).toEqual(start);
    const laid = d.run(start, "lay").state;
    expect(d.run(laid, "lay").state).toEqual(laid);
  });
  it("a piece that measures both sticks: tried says so", () => {
    expect(d.run(start, "tryPiece", { length: 3 }).emit).toEqual([
      { signal: "tried", payload: { length: 3, fitsBoth: true } },
    ]);
    expect(d.run(start, "tryPiece", { length: 7 }).emit[0]?.payload).toEqual({
      length: 7,
      fitsBoth: false,
    });
  });
  it("fit lines: one per stick, the leftover too once laid", () => {
    const fitWords = {
      fits: { en: "{stick}: {n} of {piece}, nothing left", hi: "" },
      leaves: { en: "{stick}: {n} of {piece}, {gap} left", hi: "" },
    };
    const ribbons = { ...stickMeasure.defaults, fitWords, piece: 4 };
    expect(fitLines(ribbons, "en")).toEqual([
      { text: "18: 4 of 4, 2 left", fits: false },
      { text: "12: 3 of 4, nothing left", fits: true },
    ]);
    expect(fitLines({ ...ribbons, isLaid: true, piece: 3 }, "en").map((l) => l.text)).toEqual([
      "18: 6 of 3, nothing left",
      "12: 4 of 3, nothing left",
      "6: 2 of 3, nothing left",
    ]);
    expect(fitLines({ ...ribbons, piece: 0 }, "en")).toEqual([]);
    expect(fitLines({ ...stickMeasure.defaults, piece: 4 }, "en")).toEqual([]);
  });
});

describe("lapRace: two runners meet at the start at the LCM", () => {
  const d = door(lapRace);
  const start = { ...lapRace.defaults };
  it("18 and 12: Play runs the clock on to 36, where they meet, and stops", async () => {
    const played = await d.play(start, "play");
    expect(played.state.time).toBe(36);
    expect(played.state.isRunning).toBe(false);
    expect(played.emit).toEqual([{ signal: "met", payload: { time: 36 } }]);
    expect(d.look(played.state).isMet).toBe(true);
    // Every frame on the way through the one door, the clock only going forward.
    const times = played.frames.map((f) => f.time);
    expect(times.every((t, i) => i === 0 || t >= (times[i - 1] ?? 0))).toBe(true);
    expect((await d.play(played.state, "play")).state.time).toBe(72);
  });
  it("Arrive takes a running race on to the next meeting at once", () => {
    const out = d.run({ ...start, isRunning: true, time: 5 }, "arrive");
    expect(out.state.time).toBe(36);
    expect(out.emit).toEqual([{ signal: "met", payload: { time: 36 } }]);
  });
  it("Pause stops the clock at the whole minute it shows", () => {
    const paused = d.run({ ...start, isRunning: true, time: 20.6 }, "pause").state;
    expect([paused.time, paused.isRunning]).toEqual([20, false]);
    expect(d.look(paused).isMet).toBe(false);
  });
});

describe("primeTowers: shorter towers make the HCF, taller the LCM", () => {
  const d = door(primeTowers);
  it("18 and 12: HCF 6, LCM 36; only the offered buttons work", () => {
    const start = { ...primeTowers.defaults };
    expect([d.look(start).hcf, d.look(start).lcm]).toEqual([6, 36]);
    expect(d.run(start, "show", { show: "hcf" }).emit).toEqual([
      { signal: "shown", payload: { show: "hcf" } },
    ]);
    expect(d.run(start, "show", { show: "product" }).state).toEqual(start);
  });
});

describe("billSplit: which shares of a bill end", () => {
  const d = door(billSplit);
  it("shares end for 2, 4, 5, 8, 10 and repeat for 3, 6, 7, 9", () => {
    const text = (n: number) => shareText(shareOf(100, n));
    expect([2, 4, 5, 8, 10].map(text)).toEqual(["50", "25", "20", "12.5", "10"]);
    expect([3, 6, 7, 9].map(text)).toEqual(["33.(3)", "16.(6)", "14.(285714)", "11.(1)"]);
    expect(shareOf(1, 12)).toEqual({ whole: 0, once: "08", repeats: "3" });
  });
  it("each try is listed once, in order of size, and says whether it ends", () => {
    const seven = d.run(billSplit.defaults, "split", { n: 7 });
    expect(seven.emit).toEqual([
      { signal: "split", payload: { n: 7, share: "14.(285714)", ends: false } },
    ]);
    const s = d.run(d.run(seven.state, "split", { n: 4 }).state, "split", { n: 7 }).state;
    expect(s.tried).toEqual([4, 7]);
    expect(d.look(s).endsFor).toEqual([4]);
    expect(d.run(s, "split", { n: 11 }).state).toEqual(s);
  });
});
