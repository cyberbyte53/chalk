import { describe, expect, it } from "vitest";
import { bagOf } from "./arithmetic";
import { BagShow, bagCompare } from "./bag-compare";
import { beadPair } from "./bead-pair";
import { billSplit, shareOf, shareText } from "./bill-split";
import { divisionRows } from "./division-rows";
import { factorTree, nodesOf } from "./factor-tree";
import { gearPair } from "./gear-pair";
import { lapRace } from "./lap-race";
import { primeBag } from "./prime-bag";
import { primeTowers } from "./prime-towers";
import { remainderShelves } from "./remainder-shelves";
import { squareBalance } from "./square-balance";
import { type SquareCutterState, squareCutter, zoomStep } from "./square-cutter";
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

describe("divisionRows: a counters in rows of b", () => {
  const d = door(divisionRows);
  it("17 in rows of 5: 3 full rows and 2 over", () => {
    const v = d.look({ dividend: 17, divisor: 5 });
    expect([v.quotient, v.remainder]).toEqual([3, 2]);
  });
  it("fewer than b: no full row, all left over (5 = 12 × 0 + 5)", () => {
    expect(d.look({ dividend: 5, divisor: 12 }).quotient).toBe(0);
    expect(d.look({ dividend: 5, divisor: 12 }).remainder).toBe(5);
  });
  it("changing b keeps a; announces the new q and r", () => {
    const { state, emit } = d.run({ dividend: 20, divisor: 3 }, "setDivisor", { value: 4 });
    expect(state).toEqual({ dividend: 20, divisor: 4 });
    expect(emit).toEqual([{ signal: "changed", payload: { q: 5, r: 0 } }]);
  });
  it("refuses a row of 0", () => {
    expect(d.refuses({ dividend: 20, divisor: 3 }, "setDivisor", { value: 0 })).toBe(true);
  });
});

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

describe("squareCutter: Euclid's algorithm as squares", () => {
  const d = door(squareCutter);
  const base = {
    tile: 0,
    tileChoices: [] as number[],
    canCut: true,
    isEditable: false,
    cutLabel: { en: "Cut squares", hi: "वर्ग काटो" },
    isZoomedOut: false,
    letters: null as SquareCutterState["letters"],
    words: {
      showWhole: { en: "Show the whole floor", hi: "पूरा फ़र्श दिखाओ" },
      zoomIn: { en: "Zoom in", hi: "पास से दिखाओ" },
      along: { en: "Along {side}:", hi: "भुजा {side} पर:" },
      gap: { en: "gap of {r}", hi: "{r} ख़ाली" },
      fits: { en: "fits", hi: "ठीक बैठती है" },
    },
  };
  const start = { ...base, sideA: 12576, sideB: 4052, cuts: 0 };
  it("takes 7 rounds for 4052 and 12576 and ends on squares of side 4", () => {
    let s = start;
    const finished: unknown[] = [];
    for (let i = 0; i < 7; i++) {
      const out = d.run(s, "cut");
      s = out.state;
      finished.push(...out.emit.filter((e) => e.signal === "finished"));
    }
    expect(d.look(s).isDone).toBe(true);
    expect(d.look(s).hcf).toBe(4);
    expect(finished).toEqual([{ signal: "finished", payload: { hcf: 4 } }]);
    expect(d.run(s, "cut").state).toEqual(s);
  });
  it("each round's piece is the previous short side by the remainder", () => {
    const one = d.run(start, "cut");
    expect(one.emit[0]).toEqual({ signal: "cut", payload: { a: 12576, b: 4052, q: 3, r: 420 } });
    expect(d.look(one.state).piece).toEqual({ long: 4052, short: 420 });
  });
  it("a square is done before any cut; a new rectangle starts uncut", () => {
    expect(d.look({ ...base, sideA: 7, sideB: 7, cuts: 0 }).stepCount).toBe(1);
    expect(d.run({ ...start, cuts: 3 }, "setSides", { sideA: 6, sideB: 16 }).state.cuts).toBe(0);
  });
  it("a trial tile fits exactly when its side divides both sides, cut or not", () => {
    const floor = { ...base, sideA: 16, sideB: 6, cuts: 0 };
    for (const t of [1, 2, 3, 4, 5, 6]) {
      const fits = 16 % t === 0 && 6 % t === 0;
      expect(d.run(floor, "tryTile", { side: t }).emit).toEqual([
        { signal: "tried", payload: { side: t, fits } },
      ]);
      // The floor and what is left after a cut take the same tiles: HCF(16, 6) = HCF(6, 4).
      expect(fits).toBe(6 % t === 0 && 4 % t === 0);
    }
    expect(d.run({ ...floor, tile: 3 }, "tryTile", { side: 0 }).state.tile).toBe(0);
    expect(d.run({ ...floor, tile: 3 }, "setSides", { sideA: 9, sideB: 6 }).state.tile).toBe(0);
  });
  it("zooms in on a piece too small to see, until the learner zooms out; a cut zooms back in", () => {
    // 12576 × 4052: after one cut the 4052 × 420 strip is already a tiny share of the floor.
    expect(zoomStep({ ...start, cuts: 0 })).toBeNull();
    expect(zoomStep({ ...start, cuts: 1 })).toBe(1);
    expect(zoomStep({ ...start, cuts: 3 })).toBe(3);
    expect(zoomStep({ ...start, cuts: 7 })).toBe(6);
    const out = d.run({ ...start, cuts: 3 }, "toggleZoom").state;
    expect(out.isZoomedOut).toBe(true);
    expect(d.run(out, "cut").state.isZoomedOut).toBe(false);
    // 18 × 12 never needs it: its pieces are big.
    for (let k = 0; k <= 2; k++)
      expect(zoomStep({ ...base, sideA: 18, sideB: 12, cuts: k })).toBeNull();
  });
  it("cutAll reveals the HCF; more cuts than rounds are refused", () => {
    expect(d.run(start, "cutAll").state.cuts).toBe(7);
    expect(d.rejects(start, { cuts: 8 })).toBe(true);
  });
});

describe("remainderShelves: every number has one remainder", () => {
  const d = door(remainderShelves);
  it("1 to 9 on 3 shelves fill all three, three each", () => {
    const v = d.look({ divisor: 3, power: 1, placed: 9 });
    expect(v.litShelves).toEqual([0, 1, 2]);
  });
  it("squares on 3 shelves reach only 0 and 1 (NCERT Ex 1.1 Q4)", () => {
    expect(d.look({ divisor: 3, power: 2, placed: 60 }).litShelves).toEqual([0, 1]);
  });
  it("cubes on 9 shelves reach only 0, 1 and 8 (NCERT Ex 1.1 Q5)", () => {
    expect(d.look({ divisor: 9, power: 3, placed: 60 }).litShelves).toEqual([0, 1, 8]);
  });
  it("odd numbers on 4 shelves land on 1 and 3 only (NCERT Example 3)", () => {
    const placements = d.look({ divisor: 4, power: 1, placed: 40 }).placements as {
      n: number;
      shelf: number;
    }[];
    const odd = new Set(placements.filter((p) => p.n % 2 === 1).map((p) => p.shelf));
    expect([...odd].sort()).toEqual([1, 3]);
  });
  it("placeNext drops n + 1 and says where", () => {
    const { state, emit } = d.run({ divisor: 4, power: 2, placed: 2 }, "placeNext");
    expect(state.placed).toBe(3);
    expect(emit).toEqual([{ signal: "placed", payload: { n: 3, value: 9, shelf: 1 } }]);
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

describe("primeBag: the bag of nᵏ", () => {
  const d = door(primeBag);
  it("4ⁿ has only 2s, so it never ends in 0 (NCERT Example 5)", () => {
    for (let k = 1; k <= 12; k++) {
      const v = d.look({
        base: 4,
        power: k,
        isPowerShown: true,
        isBaseEditable: true,
        powerName: "k",
      });
      expect(Object.keys(v.bag as object)).toEqual(["2"]);
      expect(v.lastDigit).not.toBe(0);
    }
  });
  it("6ⁿ never ends in 0; 10ⁿ always does; a 2 and a 5 is exactly ending in 0", () => {
    for (let base = 1; base <= 200; base++) {
      for (const k of [1, 2, 5]) {
        const v = d.look({
          base,
          power: k,
          isPowerShown: true,
          isBaseEditable: true,
          powerName: "k",
        });
        expect(v.lastDigit === 0).toBe(v.hasTwoAndFive);
      }
    }
  });
  it("writes huge powers exactly", () => {
    expect(
      d.look({ base: 999, power: 12, isPowerShown: true, isBaseEditable: true, powerName: "k" })
        .valueText,
    ).toBe((999n ** 12n).toString());
  });
});

describe("bagCompare: HCF and LCM from the bags", () => {
  const d = door(bagCompare);
  it("26 and 91: HCF 13, LCM 182, and 13 × 182 = 26 × 91 (NCERT Ex 1.2 Q2)", () => {
    const v = d.look({
      numbers: [26, 91],
      show: BagShow.Apart,
      isEditable: false,
      names: bagCompare.defaults.names,
    });
    expect([v.hcf, v.lcm, v.hcfTimesLcm, v.product]).toEqual([13, 182, 2366, 2366]);
    expect(v.primes).toEqual([2, 7, 13]);
  });
  it("12, 15 and 21: HCF 3, LCM 420 (NCERT Ex 1.2 Q3)", () => {
    const v = d.look({
      numbers: [12, 15, 21],
      show: BagShow.Lcm,
      isEditable: false,
      names: bagCompare.defaults.names,
    });
    expect([v.hcf, v.lcm, v.hcfBag, v.lcmBag]).toEqual([3, 420, "3", "2² × 3 × 5 × 7"]);
  });
  it("show changes only what is shown", () => {
    const s = {
      numbers: [12, 18],
      show: BagShow.Apart,
      isEditable: false,
      names: bagCompare.defaults.names,
    };
    expect(d.run(s, "show", { show: BagShow.Hcf }).state).toEqual({ ...s, show: BagShow.Hcf });
  });
});

describe("gearPair: the painted teeth meet after the LCM", () => {
  const d = door(gearPair);
  it("18 and 12 teeth meet again after 36 teeth: 2 turns and 3 turns (NCERT Ex 1.2 Q7, as gears)", async () => {
    const out = await d.play({ teethA: 18, teethB: 12, turned: 0 }, "turnToMeet");
    expect(out.state.turned).toBe(36);
    expect(d.look(out.state).isMarkMet).toBe(true);
    expect(out.emit.at(-1)).toEqual({
      signal: "met",
      payload: { turned: 36, turnsA: 2, turnsB: 3 },
    });
    // every frame went through the door, smoothly forward
    const turned = out.frames.map((f) => f.turned);
    expect(turned.every((t, i) => i === 0 || t >= (turned[i - 1] ?? 0))).toBe(true);
  });
  it("12 teeth on is not a meeting for 18 and 12", async () => {
    const out = await d.play({ teethA: 18, teethB: 12, turned: 0 }, "turnBy", { teeth: 12 });
    expect(d.look(out.state).isMarkMet).toBe(false);
    expect(out.emit.map((e) => e.signal)).toEqual(["stopped"]);
  });
  it("meets at every multiple of the LCM and nowhere else", () => {
    for (let t = 1; t <= 200; t++) {
      expect(d.look({ teethA: 8, teethB: 12, turned: t }).isMarkMet).toBe(t % 24 === 0);
    }
  });
});

describe("squareBalance: a² never equals 2b²", () => {
  const d = door(squareBalance);
  it("17/12: 289 against 288, the 2s are even on the left and odd on the right", () => {
    const v = d.look({ root: 2, a: 17, b: 12 });
    expect([v.left, v.right, v.isBalanced]).toEqual([289, 288, false]);
    expect(v.oddOnRight).toEqual([2]);
  });
  it("never balances for √2, √3, √5, √6 with a, b up to 300", () => {
    for (const root of [2, 3, 5, 6]) {
      for (let a = 1; a <= 300; a++) {
        for (let b = 1; b <= 300; b++) {
          if (a * a === root * b * b) throw new Error(`${a}/${b} = √${root}?`);
        }
      }
      expect(d.look({ root, a: 7, b: 5 }).oddOnRight).not.toEqual([]);
    }
  });
  it("balances for √4 = 2/1: a perfect square has no odd prime", () => {
    const v = d.look({ root: 4, a: 2, b: 1 });
    expect(v.isBalanced).toBe(true);
    expect(v.oddOnRight).toEqual([]);
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
    expect(fitLines(ribbons)).toEqual([
      { text: "18: 4 of 4, 2 left", fits: false },
      { text: "12: 3 of 4, nothing left", fits: true },
    ]);
    expect(fitLines({ ...ribbons, isLaid: true, piece: 3 }).map((l) => l.text)).toEqual([
      "18: 6 of 3, nothing left",
      "12: 4 of 3, nothing left",
      "6: 2 of 3, nothing left",
    ]);
    expect(fitLines({ ...ribbons, piece: 0 })).toEqual([]);
    expect(fitLines({ ...stickMeasure.defaults, piece: 4 })).toEqual([]);
  });
});

describe("lapRace: two runners meet at the start at the LCM", () => {
  const d = door(lapRace);
  const start = { ...lapRace.defaults };
  it("18 and 12: Play, then the clock arrives at 36, where they meet", () => {
    const running = d.run(start, "play").state;
    expect(running.isRunning).toBe(true);
    const out = d.run(running, "arrive");
    expect(out.state.time).toBe(36);
    expect(out.emit).toEqual([{ signal: "met", payload: { time: 36 } }]);
    expect(d.look(out.state).isMet).toBe(true);
    const again = d.run(d.run(out.state, "play").state, "arrive");
    expect(again.state.time).toBe(72);
  });
  it("Pause stops the clock where it is", () => {
    const running = d.run(start, "play").state;
    const paused = d.run(running, "pause", { time: 20 }).state;
    expect([paused.time, paused.isRunning]).toEqual([20, false]);
    expect(d.look(paused).isMet).toBe(false);
  });
});

describe("beadPair: pairing primes gives the HCF and LCM", () => {
  const d = door(beadPair);
  const start = { ...beadPair.defaults };
  it("18 and 12: pair a 2 and a 3, and it's done", () => {
    const one = d.run(start, "pair", { prime: 2 });
    expect(one.emit).toEqual([{ signal: "paired", payload: { prime: 2 } }]);
    const two = d.run(one.state, "pair", { prime: 3 });
    expect(two.emit.at(-1)).toEqual({ signal: "done", payload: { hcf: 6, lcm: 36 } });
  });
  it("a second 2 has no partner left", () => {
    const one = d.run(start, "pair", { prime: 2 }).state;
    expect(d.run(one, "pair", { prime: 2 }).emit).toEqual([
      { signal: "noMatch", payload: { prime: 2 } },
    ]);
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
