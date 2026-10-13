import {
  type Effect,
  EffectKind,
  type Emit,
  applyPatch,
  asAnyProp,
  checkStored,
  prepareAction,
  viewOf,
} from "@chalk/prop";
import { describe, expect, it } from "vitest";
import {
  DecimalShiftPart,
  DecimalShiftSignal,
  type DecimalShiftState,
  SUBTRACT_SECONDS,
  Tape,
  decimalShift,
} from "./shift";
import { shortestPeriod, tailStart } from "./shift-maths";

const def = asAnyProp(decimalShift);

type View = DecimalShiftState & {
  numerator: number;
  denominator: number;
  period: number;
  xText: string;
  topText: string;
  bottomText: string;
  multiplier: number;
  areTailsLinedUp: boolean;
  isDifferenceWhole: boolean;
  differenceText: string;
  hasSubtracted: boolean;
  isResultShown: boolean;
  resultText: string;
};

function number(
  whole: number,
  prefix: string,
  block: string,
  topPower = 1,
  bottomPower = 0,
): DecimalShiftState {
  return { ...decimalShift.defaults, whole, prefix, block, topPower, bottomPower };
}

function look(state: DecimalShiftState): View {
  return viewOf(def, state) as unknown as View;
}

function effectOf(
  state: DecimalShiftState,
  name: string,
  args: Record<string, unknown> = {},
): Effect<DecimalShiftState> {
  const result = prepareAction(def, state, name, args);
  if (!result.isOk) throw new Error(result.errors.join("; "));
  return result.effect as Effect<DecimalShiftState>;
}

/** Runs an instant action through the one door; returns the new state and what it announced. */
function run(
  state: DecimalShiftState,
  name: string,
  args: Record<string, unknown> = {},
): { state: DecimalShiftState; emit: readonly Emit[] } {
  const effect = effectOf(state, name, args);
  if (effect.kind !== EffectKind.Set) throw new Error(`${name} should be instant`);
  const next = applyPatch(def, state, effect.set);
  if (!next.isOk) throw new Error(next.errors.join("; "));
  return { state: next.state as DecimalShiftState, emit: effect.emit };
}

/**
 * Plays a task with a fake clock: every `set` goes through the one door (and must pass it), `wait`
 * resolves at once. `meddle` may change the state between steps, as another caller would.
 */
async function play(
  state: DecimalShiftState,
  name: string,
  meddle?: (step: number, now: DecimalShiftState) => DecimalShiftState,
): Promise<{
  state: DecimalShiftState;
  steps: DecimalShiftState[];
  emit: Emit[];
  waited: number;
}> {
  const effect = effectOf(state, name);
  if (effect.kind !== EffectKind.Task) throw new Error(`${name} should be a task`);
  let now = state;
  let waited = 0;
  let step = 0;
  const steps: DecimalShiftState[] = [];
  const emit: Emit[] = [];
  await effect.run({
    speak: () => Promise.resolve(),
    wait: (seconds) => {
      waited += seconds;
      step++;
      if (meddle !== undefined) now = meddle(step, now);
      return Promise.resolve();
    },
    set: (patch) => {
      const next = applyPatch(def, now, patch);
      if (!next.isOk) throw new Error(next.errors.join("; "));
      now = next.state as DecimalShiftState;
      steps.push(now);
    },
    get: () => now,
    emit: (signal, payload) => {
      emit.push(payload === undefined ? { signal } : { signal, payload });
    },
  });
  return { state: now, steps, emit, waited };
}

/** A small seeded generator for test cases (no Math.random). */
function generator(seed: number): (n: number) => number {
  let s = seed;
  return (n) => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s % n;
  };
}

function digitsOf(random: (n: number) => number, count: number): string {
  let out = "";
  for (let i = 0; i < count; i++) out += String(random(10));
  return out;
}

/** Long division of p by q in plain numbers, written separately from the model on purpose. */
function longDivision(p: number, q: number, count: number): { whole: number; digits: string } {
  let remainder = p % q;
  let digits = "";
  for (let i = 0; i < count; i++) {
    remainder *= 10;
    digits += String(Math.floor(remainder / q));
    remainder %= q;
  }
  return { whole: Math.floor(p / q), digits };
}

/** The first `count` digits after the point of whole.prefix block block … as written. */
function written(prefix: string, block: string, count: number): string {
  let out = prefix;
  while (out.length < count) out += block;
  return out.slice(0, count);
}

describe("decimalShift: the textbook's examples", () => {
  it("Example 7: 0.333… — 10x − x = 9x = 3, so x = 1/3", () => {
    const v = look(number(0, "", "3", 1, 0));
    expect([v.numerator, v.denominator]).toEqual([1, 3]);
    expect(v.topText).toBe("10x = 3.333333…");
    expect(v.bottomText).toBe("x = 0.333333…");
    expect(v.multiplier).toBe(9);
    expect(v.areTailsLinedUp).toBe(true);
    expect(v.isDifferenceWhole).toBe(true);
    expect(v.differenceText).toBe("9x = 3");
    expect(v.resultText).toBe("x = 1/3");
  });

  it("Example 8: 1.272727… — 100x − x = 99x = 126, so x = 14/11", () => {
    const v = look(number(1, "", "27", 2, 0));
    expect([v.numerator, v.denominator]).toEqual([14, 11]);
    expect(v.topText).toBe("100x = 127.272727…");
    expect(v.bottomText).toBe("x = 1.272727…");
    expect(v.differenceText).toBe("99x = 126");
    expect(v.isDifferenceWhole).toBe(true);
    expect(v.resultText).toBe("x = 14/11");
  });

  it("Example 9: 0.2353535… — 100x − x = 23.3 (the 2 does not cancel); 1000x − 10x = 233", () => {
    const book = look(number(0, "2", "35", 2, 0));
    expect([book.numerator, book.denominator]).toEqual([233, 990]);
    expect(book.xText).toBe("0.2353535…");
    expect(book.topText).toBe("100x = 23.535353…");
    expect(book.bottomText).toBe("x = 0.2353535…");
    expect(book.areTailsLinedUp).toBe(true);
    expect(book.isDifferenceWhole).toBe(false);
    expect(book.differenceText).toBe("99x = 23.3");
    expect(book.resultText).toBe("x = 233/990");

    const whole = look(number(0, "2", "35", 3, 1));
    expect(whole.differenceText).toBe("990x = 233");
    expect(whole.isDifferenceWhole).toBe(true);
  });

  it("shifting by less than a block does not line the tails up: 10x − x for 0.2353535…", () => {
    const v = look(number(0, "2", "35", 1, 0));
    expect(v.areTailsLinedUp).toBe(false);
    expect(v.isDifferenceWhole).toBe(false);
    expect(v.differenceText).toBe("9x = 2.1181818…");
  });

  it("0.999… = 1: 9x = 9", () => {
    const v = look(number(0, "", "9", 1, 0));
    expect([v.numerator, v.denominator]).toEqual([1, 1]);
    expect(v.topText).toBe("10x = 9.999999…");
    expect(v.differenceText).toBe("9x = 9");
    expect(v.resultText).toBe("x = 1");
  });

  it("0.4545… = 5/11, 0.4777… = 43/90, 0.001001… = 1/999", () => {
    const fortyFive = look(number(0, "", "45", 2, 0));
    expect([fortyFive.numerator, fortyFive.denominator]).toEqual([5, 11]);
    expect(fortyFive.differenceText).toBe("99x = 45");

    const fortySeven = look(number(0, "4", "7", 1, 0));
    expect([fortySeven.numerator, fortySeven.denominator]).toEqual([43, 90]);
    expect(fortySeven.differenceText).toBe("9x = 4.3");
    expect(look(number(0, "4", "7", 2, 1)).differenceText).toBe("90x = 43");

    const thousandth = look(number(0, "", "001", 3, 0));
    expect([thousandth.numerator, thousandth.denominator]).toEqual([1, 999]);
    expect(thousandth.topText).toBe("1000x = 1.001001001…");
    expect(thousandth.differenceText).toBe("999x = 1");
  });

  it("a block written twice over is the same number with the same shortest period", () => {
    const v = look(number(0, "", "33", 1, 0));
    expect([v.numerator, v.denominator]).toEqual([1, 3]);
    expect(v.period).toBe(1);
    expect(v.areTailsLinedUp).toBe(true);
    expect(shortestPeriod("3535")).toBe(2);
    expect(shortestPeriod("353")).toBe(3);
  });

  it("knows only recurring decimals: no lesson-specific fields", () => {
    expect(Object.keys(look(decimalShift.defaults)).sort()).toEqual(
      [
        "whole",
        "prefix",
        "block",
        "topPower",
        "bottomPower",
        "cancel",
        "showResult",
        "numerator",
        "denominator",
        "period",
        "xText",
        "topText",
        "bottomText",
        "multiplier",
        "areTailsLinedUp",
        "isDifferenceWhole",
        "differenceText",
        "hasSubtracted",
        "isResultShown",
        "resultText",
      ].sort(),
    );
  });
});

describe("decimalShift: laws over many numbers", () => {
  const random = generator(2026);
  const cases: DecimalShiftState[] = [];
  for (let i = 0; i < 400; i++) {
    let block = digitsOf(random, 1 + random(4));
    if (/^0+$/.test(block)) block = `${block.slice(1)}7`;
    cases.push(number(random(1000), digitsOf(random, random(5)), block));
  }

  it("p/q in lowest terms divides back out to whole.prefix block block …", () => {
    for (const s of cases) {
      const v = look(s);
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      expect(gcd(v.numerator, v.denominator)).toBe(1);
      // A block of all 9s is the same number as the next one up with 0s (0.4999… = 0.5): checked below.
      if (/^9+$/.test(s.block)) continue;
      const division = longDivision(v.numerator, v.denominator, 30);
      expect(division.whole).toBe(s.whole);
      expect(division.digits).toBe(written(s.prefix, s.block, 30));
    }
  });

  it("a block of 9s rounds up: 0.4999… = 1/2, 2.999… = 3, 0.12999… = 13/100", () => {
    const pair = (s: DecimalShiftState) => [look(s).numerator, look(s).denominator];
    expect(pair(number(0, "4", "9"))).toEqual([1, 2]);
    expect(pair(number(2, "", "9"))).toEqual([3, 1]);
    expect(pair(number(0, "12", "99"))).toEqual([13, 100]);
  });

  it("the tails line up exactly when the shift is a positive multiple of the period", () => {
    for (const s of cases) {
      const period = shortestPeriod(s.block);
      for (let top = 0; top <= 6; top++) {
        for (let bottom = 0; bottom <= 6; bottom++) {
          const v = look({ ...s, topPower: top, bottomPower: bottom });
          const shift = top - bottom;
          expect(v.areTailsLinedUp).toBe(shift > 0 && shift % period === 0);
          // Far out, past the prefix, the digits on the two tapes really agree, or really don't.
          let agree = shift > 0;
          for (let place = 20; place < 40; place++) {
            const at = (power: number) => written(s.prefix, s.block, place + power).at(-1);
            if (at(top) !== at(bottom)) agree = false;
          }
          expect(v.areTailsLinedUp).toBe(agree);
        }
      }
    }
  });

  it("lined up with the bottom tape past the prefix, the difference is whole", () => {
    for (const s of cases) {
      const period = shortestPeriod(s.block);
      const bottom = s.prefix.length;
      const top = bottom + period;
      if (top > 6) continue;
      const v = look({ ...s, topPower: top, bottomPower: bottom });
      expect(v.isDifferenceWhole).toBe(true);
      expect(v.differenceText).not.toContain(".");
      expect(v.differenceText).not.toContain("…");
    }
  });

  it("lined up, the difference ends: multiplier × x is exact, and whole iff the tail starts right after the point", () => {
    for (const s of cases) {
      for (let bottom = 0; bottom <= 2; bottom++) {
        const top = bottom + s.block.length;
        const v = look({ ...s, topPower: top, bottomPower: bottom });
        expect(v.areTailsLinedUp).toBe(true);
        expect(v.differenceText.startsWith(`${v.multiplier}x = `)).toBe(true);
        expect(v.differenceText).not.toContain("…");
        // multiplier × p / q is the difference: check it against the text, in whole numbers.
        const [, value = ""] = v.differenceText.split(" = ");
        const [whole = "", after = ""] = value.split(".");
        const scaled = BigInt(whole + after);
        const scale = 10n ** BigInt(after.length);
        expect(scaled * BigInt(v.denominator)).toBe(
          BigInt(v.multiplier) * BigInt(v.numerator) * scale,
        );
        if (!/^9+$/.test(s.block)) {
          expect(v.isDifferenceWhole).toBe(tailStart(s, top, bottom) === 1);
        }
      }
    }
  });

  it("not lined up, the difference goes on forever", () => {
    const v = look(number(1, "", "27", 1, 0));
    expect(v.differenceText).toBe("9x = 11.454545…");
    expect(look(number(0, "", "3", 0, 1)).differenceText).toBe("");
    expect(look(number(0, "", "3", 2, 2)).multiplier).toBe(0);
  });
});

describe("decimalShift: actions", () => {
  const example9 = number(0, "2", "35", 1, 0);

  it("×10 on a tape raises its power by one and says so; ÷10 lowers it; past 0 or 6 it does nothing", () => {
    const up = run(example9, "shift", { tape: Tape.Top, by: 1 });
    expect(up.state.topPower).toBe(2);
    expect(up.state.bottomPower).toBe(0);
    expect(up.emit).toEqual([
      { signal: DecimalShiftSignal.Shifted, payload: { tape: Tape.Top, power: 2 } },
    ]);
    const down = run({ ...example9, bottomPower: 1 }, "shift", { tape: Tape.Bottom, by: -1 });
    expect(down.state.bottomPower).toBe(0);
    expect(run(example9, "shift", { tape: Tape.Bottom, by: -1 })).toEqual({
      state: example9,
      emit: [],
    });
    expect(run({ ...example9, topPower: 6 }, "shift", { tape: Tape.Top, by: 1 }).emit).toEqual([]);
  });

  it("moving a tape un-subtracts, keeping x and the other tape", () => {
    const done = { ...number(0, "2", "35", 2, 0), cancel: 1 };
    const moved = run(done, "setPower", { tape: Tape.Bottom, power: 1 }).state;
    expect(moved).toEqual({ ...done, bottomPower: 1, cancel: 0 });
    expect(run(done, "shift", { tape: Tape.Top, by: 1 }).state.cancel).toBe(0);
  });

  it("startAgain un-subtracts and keeps everything else", () => {
    const done = { ...number(0, "2", "35", 2, 0), cancel: 1 };
    expect(run(done, "startAgain").state).toEqual({ ...done, cancel: 0 });
  });

  it("setNumber writes a new x, keeps the tapes' powers, and un-subtracts", () => {
    const done = { ...number(0, "2", "35", 2, 0), cancel: 1 };
    const next = run(done, "setNumber", { whole: 1, prefix: "", block: "27" }).state;
    expect(next).toEqual({ ...done, whole: 1, prefix: "", block: "27", cancel: 0 });
  });

  it("revealResult shows x = p/q and is marked as giving the answer away", () => {
    expect(decimalShift.actions.revealResult?.reveals).toBe(true);
    const done = { ...number(0, "", "3", 1, 0), cancel: 1 };
    const shown = run(done, "revealResult").state;
    expect(shown.showResult).toBe(true);
    expect(look(shown).isResultShown).toBe(true);
    expect(look({ ...shown, cancel: 0.5 }).isResultShown).toBe(false);
    expect(look({ ...number(0, "2", "35", 1, 0), cancel: 1, showResult: true }).isResultShown).toBe(
      false,
    );
  });

  it("only the finger's moves are marked byLearner", () => {
    const byLearner = Object.entries(decimalShift.actions)
      .filter(([, spec]) => spec.byLearner === true)
      .map(([name]) => name)
      .sort();
    expect(byLearner).toEqual(["shift", "subtract"]);
    expect(decimalShift.inputs).toEqual(["showResult"]);
  });

  it("subtract glides cancel to 1 through the one door, then announces what happened", async () => {
    const start = number(0, "2", "35", 2, 0);
    const played = await play(start, "subtract");
    expect(played.waited).toBeCloseTo(SUBTRACT_SECONDS, 6);
    expect(played.steps.length).toBeGreaterThan(10);
    let last = 0;
    for (const step of played.steps) {
      expect(checkStored(def, step).isOk).toBe(true);
      expect(step.cancel).toBeGreaterThanOrEqual(last);
      expect({ ...step, cancel: 0 }).toEqual(start);
      last = step.cancel;
    }
    expect(played.state.cancel).toBe(1);
    expect(look(played.state).hasSubtracted).toBe(true);
    expect(played.emit).toEqual([
      {
        signal: DecimalShiftSignal.Subtracted,
        payload: { isLinedUp: true, isWhole: false, multiplier: 99 },
      },
    ]);
  });

  it("subtract with tails not lined up still subtracts, and says they did not cancel", async () => {
    const played = await play(number(0, "2", "35", 1, 0), "subtract");
    expect(played.emit[0]?.payload).toEqual({ isLinedUp: false, isWhole: false, multiplier: 9 });
  });

  it("subtract stops quietly if anything else changes the prop meanwhile", async () => {
    const start = number(0, "", "3", 1, 0);
    const played = await play(start, "subtract", (step, now) =>
      step === 5 ? { ...now, topPower: 2, cancel: 0 } : now,
    );
    expect(played.state.cancel).toBe(0);
    expect(played.emit).toEqual([]);
  });

  it("subtract does nothing once subtracted, and is refused unless the top tape is the larger", () => {
    const done = { ...number(0, "", "3", 1, 0), cancel: 1 };
    const again = effectOf(done, "subtract");
    expect(again.kind === EffectKind.Set && again.set).toEqual({});
    expect(prepareAction(def, number(0, "", "3", 0, 0), "subtract").isOk).toBe(false);
    expect(prepareAction(def, number(0, "", "3", 0, 1), "subtract").isOk).toBe(false);
  });
});

describe("decimalShift: refusals", () => {
  const ok = number(0, "2", "35");
  const refused = (patch: Record<string, unknown>) => applyPatch(def, ok, patch).isOk === false;

  it("refuses an empty, all-zero, too long or non-digit block", () => {
    expect(refused({ block: "" })).toBe(true);
    expect(refused({ block: "00" })).toBe(true);
    expect(refused({ block: "12345" })).toBe(true);
    expect(refused({ block: "3a" })).toBe(true);
    expect(refused({ block: "07" })).toBe(false);
  });

  it("refuses a bad prefix, whole part, power or cancel", () => {
    expect(refused({ prefix: "12345" })).toBe(true);
    expect(refused({ prefix: "-1" })).toBe(true);
    expect(refused({ whole: 1000 })).toBe(true);
    expect(refused({ whole: 1.5 })).toBe(true);
    expect(refused({ topPower: 7 })).toBe(true);
    expect(refused({ bottomPower: -1 })).toBe(true);
    expect(refused({ cancel: 1.2 })).toBe(true);
  });

  it("refuses a part-subtracted state unless the top tape is the larger", () => {
    expect(refused({ cancel: 0.5 })).toBe(false);
    expect(refused({ cancel: 0.5, topPower: 0 })).toBe(true);
  });

  it("refuses bad action arguments", () => {
    expect(prepareAction(def, ok, "setPower", { tape: Tape.Top, power: 7 }).isOk).toBe(false);
    expect(prepareAction(def, ok, "shift", { tape: Tape.Top, by: 2 }).isOk).toBe(false);
    expect(prepareAction(def, ok, "shift", { tape: "middle", by: 1 }).isOk).toBe(false);
    expect(prepareAction(def, ok, "setNumber", { whole: 0, prefix: "", block: "000" }).isOk).toBe(
      false,
    );
  });
});

describe("decimalShift: parts", () => {
  const parts = (s: DecimalShiftState) => decimalShift.parts?.(viewOf(def, s) as never) ?? [];

  it("names the tapes and buttons always, the tail while lined up, the difference and result once there", () => {
    const start = number(0, "2", "35", 1, 0);
    expect(parts(start)).toEqual(
      expect.arrayContaining([
        DecimalShiftPart.TopTape,
        DecimalShiftPart.BottomTape,
        DecimalShiftPart.TopShift,
        DecimalShiftPart.BottomShift,
        DecimalShiftPart.Minus,
        `${DecimalShiftPart.TopDigitPrefix}1`,
        `${DecimalShiftPart.BottomDigitPrefix}1`,
      ]),
    );
    expect(parts(start)).not.toContain(DecimalShiftPart.Tail);
    expect(parts(start)).not.toContain(DecimalShiftPart.Difference);
    const lined = { ...start, topPower: 2 };
    expect(parts(lined)).toContain(DecimalShiftPart.Tail);
    const done = { ...lined, cancel: 1, showResult: true };
    expect(parts(done)).toContain(DecimalShiftPart.Difference);
    expect(parts(done)).toContain(DecimalShiftPart.Result);
  });
});
