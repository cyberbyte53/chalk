import {
  type Effect,
  EffectKind,
  type Emit,
  applyPatch,
  asAnyProp,
  prepareAction,
  viewOf,
} from "@chalk/prop";
import { describe, expect, it } from "vitest";
import {
  DecimalExpansionPart,
  DecimalExpansionSignal,
  type DecimalExpansionState,
  MAX_DIGITS,
  decimalExpansion,
} from "./model";

const def = asAnyProp(decimalExpansion);

type View = DecimalExpansionState & {
  wholePart: number;
  digits: string;
  remainders: number[];
  remainder: number;
  isTerminating: boolean;
  repeatStart: number;
  repeatLength: number;
  hasEnded: boolean;
  hasRepeated: boolean;
  decimalText: string;
  partialDividend: number;
  slots: number;
};

function fraction(numerator: number, denominator: number, digitsShown = 0): DecimalExpansionState {
  return {
    numerator,
    denominator,
    digitsShown,
    isClockShown: false,
    isAskingDigit: false,
    isEditable: false,
    rejectedDigit: null,
  };
}

function look(state: DecimalExpansionState): View {
  return viewOf(def, state) as unknown as View;
}

function effectOf(
  state: DecimalExpansionState,
  name: string,
  args: Record<string, unknown> = {},
): Effect<DecimalExpansionState> & { kind: typeof EffectKind.Set } {
  const result = prepareAction(def, state, name, args);
  if (!result.isOk) throw new Error(result.errors.join("; "));
  if (result.effect.kind !== EffectKind.Set) throw new Error(`${name} should be instant`);
  return result.effect as Effect<DecimalExpansionState> & { kind: typeof EffectKind.Set };
}

/** Runs an action through the one door; returns the new state and what it announced. */
function run(
  state: DecimalExpansionState,
  name: string,
  args: Record<string, unknown> = {},
): { state: DecimalExpansionState; emit: readonly Emit[] } {
  const effect = effectOf(state, name, args);
  const next = applyPatch(def, state, effect.set);
  if (!next.isOk) throw new Error(next.errors.join("; "));
  return { state: next.state as DecimalExpansionState, emit: effect.emit };
}

/** Shows every digit up to `count` (or as far as it goes) with `showDigits`. */
function shown(numerator: number, denominator: number, count: number): View {
  return look(run(fraction(numerator, denominator), "showDigits", { count }).state);
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** Only 2s and 5s, by trial division: written separately from the model on purpose. */
function isOnlyTwosAndFives(n: number): boolean {
  for (let k = 3; k <= n; k++) {
    if (k !== 5 && n % k === 0) {
      let isPrime = true;
      for (let j = 2; j * j <= k; j++) if (k % j === 0) isPrime = false;
      if (isPrime) return false;
    }
  }
  return true;
}

describe("decimalExpansion: known by hand", () => {
  it("1/8 = 0.125 ends after 3 digits", () => {
    const v = shown(1, 8, 60);
    expect(v.digitsShown).toBe(3);
    expect(v.digits).toBe("125");
    expect(v.remainders).toEqual([1, 2, 4, 0]);
    expect(v.isTerminating).toBe(true);
    expect(v.repeatStart).toBe(3);
    expect(v.repeatLength).toBe(0);
    expect(v.hasEnded).toBe(true);
    expect(v.hasRepeated).toBe(false);
    expect(v.decimalText).toBe("0.125");
  });

  it("1/3 = 0.333… with 3 repeating", () => {
    const v = shown(1, 3, 1);
    expect(v.digits).toBe("3");
    expect(v.remainders).toEqual([1, 1]);
    expect(v.isTerminating).toBe(false);
    expect([v.repeatStart, v.repeatLength]).toEqual([0, 1]);
    expect(v.hasRepeated).toBe(true);
    expect(v.hasEnded).toBe(false);
    expect(v.decimalText).toBe("0.3…");
    expect(shown(1, 3, 5).digits).toBe("33333");
  });

  it("1/7 = 0.142857 repeating: starts at once, 6 long", () => {
    const v = shown(1, 7, 6);
    expect(v.digits).toBe("142857");
    expect(v.remainders).toEqual([1, 3, 2, 6, 4, 5, 1]);
    expect([v.repeatStart, v.repeatLength]).toEqual([0, 6]);
    expect(v.hasRepeated).toBe(true);
    expect(shown(1, 7, 5).hasRepeated).toBe(false);
  });

  it("1/6 = 0.1666…: one digit, then 6 repeats", () => {
    const v = shown(1, 6, 2);
    expect(v.digits).toBe("16");
    expect(v.remainders).toEqual([1, 4, 4]);
    expect([v.repeatStart, v.repeatLength]).toEqual([1, 1]);
    expect(v.hasRepeated).toBe(true);
    expect(shown(1, 6, 1).hasRepeated).toBe(false);
  });

  it("22/7 = 3.142857 repeating", () => {
    const v = shown(22, 7, 6);
    expect(v.wholePart).toBe(3);
    expect(v.digits).toBe("142857");
    expect([v.repeatStart, v.repeatLength]).toEqual([0, 6]);
    expect(v.decimalText).toBe("3.142857…");
    expect(shown(22, 7, 12).digits).toBe("142857142857");
  });

  it("7/1 terminates with no digits after the point", () => {
    const v = look(fraction(7, 1));
    expect(v.wholePart).toBe(7);
    expect(v.isTerminating).toBe(true);
    expect(v.repeatStart).toBe(0);
    expect(v.hasEnded).toBe(true);
    expect(v.decimalText).toBe("7");
    expect(applyPatch(def, fraction(7, 1), { digitsShown: 1 }).isOk).toBe(false);
  });

  it("3/12 is 1/4 in lowest terms: 0.25", () => {
    const v = shown(3, 12, 60);
    expect(v.digits).toBe("25");
    expect(v.isTerminating).toBe(true);
    expect(v.hasEnded).toBe(true);
    expect(v.decimalText).toBe("0.25");
    const quarter = shown(1, 4, 60);
    expect([v.repeatStart, v.repeatLength]).toEqual([quarter.repeatStart, quarter.repeatLength]);
  });

  it("knows whether it terminates before any digit is shown", () => {
    expect(look(fraction(1, 8)).isTerminating).toBe(true);
    expect(look(fraction(1, 7)).isTerminating).toBe(false);
    expect(look(fraction(21, 14)).isTerminating).toBe(true); // 3/2
    expect(look(fraction(0, 9)).isTerminating).toBe(true);
    expect(look(fraction(1, 7)).hasRepeated).toBe(false);
    expect(look(fraction(1, 7)).decimalText).toBe("0…");
  });
});

describe("decimalExpansion: laws over many fractions", () => {
  it("terminates exactly when q, in lowest terms, has only 2 and 5 as prime factors (q ≤ 200)", () => {
    for (let q = 1; q <= 200; q++) {
      for (let p = 1; p <= q; p++) {
        const v = look(fraction(p, q));
        expect(v.isTerminating, `${p}/${q}`).toBe(isOnlyTwosAndFives(q / gcd(p, q)));
      }
    }
  });

  it("the theory agrees with the long division: a remainder of 0 shows up iff it terminates", () => {
    for (let q = 1; q <= 60; q++) {
      for (let p = 0; p <= 2 * q; p++) {
        const v = shown(p, q, MAX_DIGITS);
        expect(v.remainders.includes(0), `${p}/${q}`).toBe(v.isTerminating);
        if (v.isTerminating) expect(v.hasEnded, `${p}/${q}`).toBe(true);
      }
    }
  });

  it("every remainder is less than q", () => {
    for (const q of [1, 2, 3, 7, 13, 17, 97, 999]) {
      for (const p of [0, 1, 5, q - 1, q, 3 * q + 2, 99999]) {
        for (const r of shown(p, q, MAX_DIGITS).remainders) {
          expect(r).toBeGreaterThanOrEqual(0);
          expect(r).toBeLessThan(q);
        }
      }
    }
  });

  it("the period is at most q − 1 and the digits really repeat with it", () => {
    for (let q = 2; q <= 61; q++) {
      for (let p = 1; p < 3 * q; p += 2) {
        const v = shown(p, q, MAX_DIGITS);
        if (v.isTerminating) {
          expect(v.repeatLength).toBe(0);
          continue;
        }
        expect(v.repeatLength).toBeGreaterThan(0);
        expect(v.repeatLength).toBeLessThanOrEqual(q - 1);
        const { repeatStart: start, repeatLength: length, digits } = v;
        for (let i = start; i + length < digits.length; i++) {
          expect(digits[i + length], `${p}/${q} digit ${i}`).toBe(digits[i]);
        }
        // and no shorter block, starting no earlier, would do (checked on the remainders)
        expect(v.remainders[start + length]).toBe(v.remainders[start]);
        expect(new Set(v.remainders.slice(0, start + length)).size).toBe(start + length);
      }
    }
  });

  it("the digits are the decimal of p/q", () => {
    for (const [p, q] of [
      [1, 7],
      [5, 13],
      [355, 113],
      [2, 9],
      [99999, 999],
    ] as const) {
      const v = shown(p, q, 12);
      expect(Number(`${v.wholePart}.${v.digits}`)).toBeCloseTo(p / q, 10);
    }
  });
});

describe("decimalExpansion: actions", () => {
  it("nextDigit works out one more digit and keeps the fraction", () => {
    const { state, emit } = run(fraction(22, 7, 2), "nextDigit");
    expect(state).toEqual(fraction(22, 7, 3));
    expect(emit).toEqual([
      {
        signal: DecimalExpansionSignal.DigitFound,
        payload: { position: 3, digit: 2, remainder: 6 },
      },
    ]);
  });

  it("nextDigit announces the end on the step that reaches remainder 0, then does nothing", () => {
    expect(run(fraction(1, 8, 1), "nextDigit").emit.map((e) => e.signal)).toEqual([
      DecimalExpansionSignal.DigitFound,
    ]);
    const last = run(fraction(1, 8, 2), "nextDigit");
    expect(last.emit.map((e) => e.signal)).toEqual([
      DecimalExpansionSignal.DigitFound,
      DecimalExpansionSignal.Ended,
    ]);
    const after = run(last.state, "nextDigit");
    expect(after.state).toEqual(fraction(1, 8, 3));
    expect(after.emit).toEqual([]);
  });

  it("nextDigit announces the repeat on the step a remainder comes back, and only then", () => {
    const signalsAt = (p: number, q: number, from: number) =>
      run(fraction(p, q, from), "nextDigit").emit.map((e) => e.signal);
    expect(signalsAt(1, 6, 0)).toEqual([DecimalExpansionSignal.DigitFound]);
    expect(run(fraction(1, 6, 1), "nextDigit").emit).toEqual([
      {
        signal: DecimalExpansionSignal.DigitFound,
        payload: { position: 2, digit: 6, remainder: 4 },
      },
      { signal: DecimalExpansionSignal.Repeated, payload: { start: 1, length: 1 } },
    ]);
    expect(signalsAt(1, 6, 2)).toEqual([DecimalExpansionSignal.DigitFound]);
    expect(signalsAt(1, 7, 4)).toEqual([DecimalExpansionSignal.DigitFound]);
    expect(signalsAt(1, 7, 5)).toEqual([
      DecimalExpansionSignal.DigitFound,
      DecimalExpansionSignal.Repeated,
    ]);
  });

  it("nextDigit stops at the most digits it can show", () => {
    const { state, emit } = run(fraction(1, 7, MAX_DIGITS), "nextDigit");
    expect(state.digitsShown).toBe(MAX_DIGITS);
    expect(emit).toEqual([]);
  });

  it("showDigits shows that many, stops at the end, keeps the fraction", () => {
    expect(run(fraction(1, 7, 5), "showDigits", { count: 2 }).state).toEqual(fraction(1, 7, 2));
    expect(run(fraction(1, 8), "showDigits", { count: 10 }).state).toEqual(fraction(1, 8, 3));
    expect(run(fraction(1, 8), "showDigits", { count: 10 }).emit.map((e) => e.signal)).toEqual([
      DecimalExpansionSignal.Ended,
    ]);
    expect(run(fraction(1, 7), "showDigits", { count: 10 }).emit).toEqual([
      { signal: DecimalExpansionSignal.Repeated, payload: { start: 0, length: 6 } },
    ]);
    expect(run(fraction(1, 7, 8), "showDigits", { count: 10 }).emit).toEqual([]);
  });

  it("completeDivision goes to the end or the first repeat, and is flagged as revealing", () => {
    expect(decimalExpansion.actions.completeDivision?.reveals).toBe(true);
    expect(decimalExpansion.actions.nextDigit?.reveals).not.toBe(true);
    expect(decimalExpansion.actions.showDigits?.reveals).not.toBe(true);
    expect(run(fraction(1, 8), "completeDivision").state).toEqual(fraction(1, 8, 3));
    expect(run(fraction(1, 6), "completeDivision").state).toEqual(fraction(1, 6, 2));
    expect(run(fraction(22, 7), "completeDivision").state).toEqual(fraction(22, 7, 6));
    // 1/997 repeats after 166 digits: more than can be shown
    expect(run(fraction(1, 997), "completeDivision").state).toEqual(fraction(1, 997, MAX_DIGITS));
  });

  it("startAgain goes back to no digits and keeps the fraction", () => {
    const { state, emit } = run(fraction(22, 7, 9), "startAgain");
    expect(state).toEqual(fraction(22, 7, 0));
    expect(emit).toEqual([]);
  });

  it("setFraction sets a new p/q with no digits shown", () => {
    expect(run(fraction(22, 7, 9), "setFraction", { numerator: 3, denominator: 12 }).state).toEqual(
      fraction(3, 12, 0),
    );
  });

  it("refuses what isn't a fraction it can divide", () => {
    const ok = fraction(1, 7);
    expect(applyPatch(def, ok, { denominator: 0 }).isOk).toBe(false);
    expect(applyPatch(def, ok, { denominator: 1000 }).isOk).toBe(false);
    expect(applyPatch(def, ok, { denominator: 2.5 }).isOk).toBe(false);
    expect(applyPatch(def, ok, { numerator: -1 }).isOk).toBe(false);
    expect(applyPatch(def, ok, { numerator: 100000 }).isOk).toBe(false);
    expect(applyPatch(def, ok, { digitsShown: MAX_DIGITS + 1 }).isOk).toBe(false);
    expect(applyPatch(def, ok, { digitsShown: -1 }).isOk).toBe(false);
    expect(applyPatch(def, fraction(1, 8), { digitsShown: 4 }).isOk).toBe(false);
    expect(applyPatch(def, ok, { base: 2 }).isOk).toBe(false);
    expect(prepareAction(def, ok, "setFraction", { numerator: 1, denominator: 0 }).isOk).toBe(
      false,
    );
    expect(prepareAction(def, ok, "showDigits", { count: 1.5 }).isOk).toBe(false);
  });
});

describe("decimalExpansion: parts", () => {
  const parts = (s: DecimalExpansionState) => decimalExpansion.parts?.(look(s) as never) ?? [];

  it("has a part for each digit and each remainder shown", () => {
    expect(parts(fraction(1, 7, 2))).toEqual([
      `${DecimalExpansionPart.DigitPrefix}1`,
      `${DecimalExpansionPart.DigitPrefix}2`,
      `${DecimalExpansionPart.RemainderPrefix}0`,
      `${DecimalExpansionPart.RemainderPrefix}1`,
      `${DecimalExpansionPart.RemainderPrefix}2`,
    ]);
  });

  it("has the repeat bar only once it has repeated", () => {
    expect(parts(fraction(1, 7, 5))).not.toContain(DecimalExpansionPart.RepeatBar);
    expect(parts(fraction(1, 7, 6))).toContain(DecimalExpansionPart.RepeatBar);
    expect(parts(fraction(1, 8, 3))).not.toContain(DecimalExpansionPart.RepeatBar);
  });
});

describe("a fraction the learner types", () => {
  it("names p and q when editable, first", () => {
    const parts = decimalExpansion.parts?.(look({ ...fraction(3, 8), isEditable: true }) as never);
    expect(parts?.slice(0, 2)).toEqual([
      DecimalExpansionPart.Numerator,
      DecimalExpansionPart.Denominator,
    ]);
    expect(decimalExpansion.parts?.(look(fraction(3, 8)) as never)).not.toContain(
      DecimalExpansionPart.Numerator,
    );
  });
});

describe("the learner works out each digit", () => {
  const asking = (n: number, d: number, shown = 0) => ({
    ...fraction(n, d, shown),
    isAskingDigit: true,
  });

  it("knows the partial dividend: the remainder with a 0 brought down", () => {
    // 1 ÷ 7: remainder 1, bring down 0 → 10; then 3 → 30; then 2 → 20.
    expect(look(asking(1, 7)).partialDividend).toBe(10);
    expect(look(asking(1, 7, 1)).partialDividend).toBe(30);
    expect(look(asking(1, 7, 2)).partialDividend).toBe(20);
    // 10 ÷ 3: whole part 3, remainder 1 → 10.
    expect(look(asking(10, 3)).partialDividend).toBe(10);
  });

  it("takes the right digit: one more step, as nextDigit does", () => {
    // How many 7s in 30? 4 (28), remainder 2.
    const { state, emit } = run(asking(1, 7, 1), "tryDigit", { digit: 4 });
    expect(state.digitsShown).toBe(2);
    expect(look(state).digits).toBe("14");
    expect(emit[0]).toEqual({
      signal: DecimalExpansionSignal.DigitFound,
      payload: { position: 2, digit: 4, remainder: 2 },
    });
  });

  it("refuses a digit that is too big: its product is more than the dividend", () => {
    const { state, emit } = run(asking(1, 7, 1), "tryDigit", { digit: 5 });
    expect(state.digitsShown).toBe(1);
    expect(state.rejectedDigit).toBe(5);
    expect(emit).toEqual([
      {
        signal: DecimalExpansionSignal.DigitRejected,
        payload: { digit: 5, dividend: 30, product: 35, isTooBig: true },
      },
    ]);
  });

  it("refuses a digit that is too small: what is left would still hold another 7", () => {
    const { emit } = run(asking(1, 7, 1), "tryDigit", { digit: 3 });
    expect(emit[0]?.payload).toMatchObject({ product: 21, isTooBig: false });
  });

  it("takes 0 when the divisor doesn't go in at all (1 ÷ 13: 10 holds no 13)", () => {
    const { state } = run(asking(1, 13), "tryDigit", { digit: 0 });
    expect(look(state).digits).toBe("0");
    expect(look(state).partialDividend).toBe(100);
  });

  it("clears the last wrong try once a digit is found", () => {
    const wrong = run(asking(1, 7, 1), "tryDigit", { digit: 5 }).state;
    expect(run(wrong, "tryDigit", { digit: 4 }).state.rejectedDigit).toBeNull();
    expect(run(wrong, "nextDigit").state.rejectedDigit).toBeNull();
  });

  it("raises ended / repeated on the step that gets there, like nextDigit", () => {
    // 7 ÷ 8 = 0.875: the third right digit ends it.
    const { emit } = run(asking(7, 8, 2), "tryDigit", { digit: 5 });
    expect(emit.map((e) => e.signal)).toContain(DecimalExpansionSignal.Ended);
    // 1 ÷ 3: the first 3 already leaves remainder 1 again, so the repeat shows.
    const repeat = run(asking(1, 3), "tryDigit", { digit: 3 });
    expect(repeat.emit.map((e) => e.signal)).toContain(DecimalExpansionSignal.Repeated);
  });

  it("does nothing once the division has ended", () => {
    const { state, emit } = run(asking(7, 8, 3), "tryDigit", { digit: 1 });
    expect(state.digitsShown).toBe(3);
    expect(emit).toEqual([]);
  });

  it("always has exactly one right digit, for every step of every fraction up to q = 40", () => {
    for (let q = 1; q <= 40; q++) {
      for (let p = 0; p < q * 2; p += 3) {
        let state = asking(p, q);
        for (let i = 0; i < 12 && !look(state).hasEnded; i++) {
          const fits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => {
            const effect = effectOf(state, "tryDigit", { digit: d });
            return effect.set.digitsShown === state.digitsShown + 1;
          });
          expect(fits).toHaveLength(1);
          state = run(state, "tryDigit", { digit: fits[0] ?? 0 }).state;
        }
      }
    }
  });
});

describe("the remainder clock", () => {
  it("has a slot for every non-zero remainder: q − 1 of them", () => {
    expect(look(fraction(1, 7)).slots).toBe(6);
    expect(look(fraction(1, 13)).slots).toBe(12);
    expect(look(fraction(1, 17)).slots).toBe(16);
  });

  it("lists the clock and its slots as parts only while it is shown", () => {
    const parts = (s: DecimalExpansionState) =>
      decimalExpansion.parts?.(viewOf(def, s) as never) ?? [];
    expect(parts(fraction(1, 7))).not.toContain(DecimalExpansionPart.Clock);
    const shown = parts({ ...fraction(1, 7), isClockShown: true });
    expect(shown).toContain(DecimalExpansionPart.Clock);
    expect(shown).toContain(`${DecimalExpansionPart.SlotPrefix}6`);
    expect(shown).not.toContain(`${DecimalExpansionPart.SlotPrefix}7`);
  });

  it("can never visit more than q − 1 different non-zero remainders before one comes back", () => {
    for (let q = 2; q <= 60; q++) {
      for (let p = 1; p < q; p++) {
        const s = look(run(fraction(p, q), "completeDivision").state);
        const seen = new Set(s.remainders.slice(0, s.repeatStart + s.repeatLength));
        seen.delete(0);
        expect(seen.size).toBeLessThanOrEqual(q - 1);
        expect(s.repeatLength).toBeLessThanOrEqual(q - 1);
      }
    }
  });

  it("is switched by showClock, keeping the division", () => {
    const { state } = run(fraction(1, 7, 3), "showClock", { isShown: true });
    expect(state).toMatchObject({ isClockShown: true, digitsShown: 3 });
  });
});
