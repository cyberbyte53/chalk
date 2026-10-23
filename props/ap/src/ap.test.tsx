import type { PropViewProps } from "@chalk/player";
import {
  type AnyPropDef,
  EffectKind,
  type StoredState,
  applyPatch,
  asAnyProp,
  observationOf,
  prepareAction,
  viewOf,
} from "@chalk/prop";
import type { ComponentType } from "preact";
import { renderToString } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import {
  differences,
  firstBreak,
  fracText,
  isAP,
  isTermValue,
  nFor,
  numText,
  ordinal,
  sumOf,
  termOf,
  termsOf,
  withUnit,
} from "./ap";
import { defs } from "./defs";
import {
  GAUSS_STEPS,
  GaussAction,
  GaussMode,
  GaussSignal,
  type GaussState,
  gaussSum,
  linesTex,
} from "./gauss";
import { GaussView } from "./gauss-view";
import { apProps } from "./index";
import { NthAction, NthSignal, type NthState, nthTerm, workingTex } from "./nth";
import { NthView } from "./nth-view";
import { ApSceneKind, apScene } from "./scene";
import { ApSceneView } from "./scene-view";
import {
  SequenceAction,
  SequenceSignal,
  type SequenceState,
  Verdict,
  apSequence,
} from "./sequence";
import { SequenceView } from "./sequence-view";

const seq = asAnyProp(apSequence);
const nth = asAnyProp(nthTerm);
const gauss = asAnyProp(gaussSum);
const scene = asAnyProp(apScene);

function run<S extends StoredState>(
  def: AnyPropDef,
  state: S,
  action: string,
  args: Record<string, unknown> = {},
) {
  const result = prepareAction(def, state, action, args);
  if (!result.isOk) throw new Error(result.errors.join("; "));
  const effect = result.effect;
  if (effect.kind !== EffectKind.Set) throw new Error(`${action} should be instant`);
  const next = applyPatch(def, state, effect.set);
  if (!next.isOk) throw new Error(next.errors.join("; "));
  return { state: next.state as S, emit: effect.emit };
}

const look = (def: AnyPropDef, s: StoredState) => viewOf(def, s) as Record<string, unknown>;
const signals = (emit: readonly { signal: string }[]) => emit.map((e) => e.signal);

describe("the maths of APs", () => {
  it("lists terms a, a + d, a + 2d, … (NCERT 5.2)", () => {
    expect(termsOf(6, 3, 4)).toEqual([6, 9, 12, 15]);
    expect(termsOf(6, -3, 4)).toEqual([6, 3, 0, -3]);
    expect(termsOf(-7, -2, 4)).toEqual([-7, -9, -11, -13]);
    expect(termsOf(1, 0.1, 4)).toEqual([1, 1.1, 1.2, 1.3]);
    expect(termsOf(2, 0, 3)).toEqual([2, 2, 2]);
  });

  it("subtracts each term from the next, even when the next is smaller", () => {
    expect(differences([6, 3, 0, -3])).toEqual([-3, -3, -3]);
    expect(differences([1, -1, -3, -5])).toEqual([-2, -2, -2]);
  });

  it("tells APs from lists that aren't (Example 2, Exercise 5.1)", () => {
    expect(isAP([4, 10, 16, 22])).toBe(true);
    expect(isAP([1, -1, -3, -5])).toBe(true);
    expect(isAP([-2, 2, -2, 2, -2])).toBe(false);
    expect(firstBreak([-2, 2, -2, 2])).toBe(1);
    expect(isAP([1, 1, 1, 2, 2, 2, 3, 3, 3])).toBe(false);
    expect(firstBreak([1, 1, 1, 2, 2, 2])).toBe(2);
    expect(isAP([2, 4, 8, 16])).toBe(false);
    expect(isAP([-1.2, -3.2, -5.2, -7.2])).toBe(true);
    expect(isAP([0.2, 0.22, 0.222, 0.2222])).toBe(false);
    expect(isAP([1, 1, 2, 3, 5, 8])).toBe(false);
    expect(isAP([0.6, 1.7, 2.8, 3.9])).toBe(true);
  });

  it("finds the nth term a + (n − 1)d (Examples 3, 9; Reena's salary)", () => {
    expect(termOf(2, 5, 10)).toBe(47);
    expect(termOf(80, 80, 30)).toBe(2400);
    expect(termOf(8000, 500, 15)).toBe(15000);
    expect(termOf(8000, 500, 25)).toBe(20000);
    expect(termOf(10, 7 - 10, 30)).toBe(-77);
    // the 11th term from the end of 10, 7, …, −62 is the 15th term
    expect(termOf(10, -3, 15)).toBe(-32);
    expect(termOf(-62, 3, 11)).toBe(-32);
  });

  it("finds which term a value is, exactly (Examples 4, 6, 7, 10)", () => {
    expect(nFor(21, -3, -81)).toEqual({ p: 35, q: 1 });
    expect(nFor(21, -3, 0)).toEqual({ p: 8, q: 1 });
    expect(nFor(5, 6, 301)).toEqual({ p: 151, q: 3 });
    expect(fracText(nFor(5, 6, 301) as { p: number; q: number })).toBe("151/3");
    expect(isTermValue(5, 6, 301)).toBe(false);
    expect(nFor(12, 3, 99)).toEqual({ p: 30, q: 1 });
    expect(nFor(23, -2, 5)).toEqual({ p: 10, q: 1 });
    expect(nFor(18, -2.5, -47)).toEqual({ p: 27, q: 1 });
    expect(nFor(5, 1.75, 20.75)).toEqual({ p: 10, q: 1 });
    expect(isTermValue(11, -3, -150)).toBe(false);
    // a value before the first term gives n ≤ 0: not a term
    expect(isTermValue(5, 6, -1)).toBe(false);
    expect(nFor(3, 0, 3)).toBeNull();
    expect(isTermValue(3, 0, 3)).toBe(true);
  });

  it("agrees with the term formula whenever n is whole", () => {
    for (let a = -10; a <= 10; a += 3)
      for (const d of [-4, -1.5, 0.5, 2, 7])
        for (let n = 1; n <= 40; n += 3) {
          const f = nFor(a, d, termOf(a, d, n));
          expect(f).toEqual({ p: n, q: 1 });
        }
  });

  it("adds the first n terms (Shakila, Examples 11, 13, 14, 16)", () => {
    expect(sumOf(100, 50, 21)).toBe(12600);
    expect(sumOf(8, -5, 22)).toBe(-979);
    expect(sumOf(24, -3, 4)).toBe(78);
    expect(sumOf(24, -3, 13)).toBe(78);
    expect(sumOf(1, 1, 100)).toBe(5050);
    expect(sumOf(1, 1, 1000)).toBe(500500);
    expect(sumOf(550, 25, 7)).toBe(4375);
    expect(sumOf(5, 2, 24)).toBe(672);
    // Kabir's box: ₹2,950 after 20 weeks, exactly ₹4,000 after 25
    expect(sumOf(100, 5, 20)).toBe(2950);
    expect(sumOf(100, 5, 25)).toBe(4000);
  });

  it("matches adding term by term, and Sₙ − Sₙ₋₁ is aₙ", () => {
    for (const [a, d] of [
      [3, 4],
      [9, -5],
      [0.6, 1.1],
      [-37, 4],
    ] as const) {
      let total = 0;
      for (let n = 1; n <= 30; n++) {
        total += termOf(a, d, n);
        expect(sumOf(a, d, n)).toBeCloseTo(total, 6);
        if (n > 1) expect(sumOf(a, d, n) - sumOf(a, d, n - 1)).toBeCloseTo(termOf(a, d, n), 6);
      }
    }
  });

  it("writes numbers the way the page does", () => {
    expect(numText(-81)).toBe("−81");
    expect(numText(12600)).toBe("12,600");
    expect(numText(-1.25)).toBe("−1.25");
    expect(numText(0.30000000000000004)).toBe("0.3");
    expect(withUnit(4000, "₹")).toBe("₹4,000");
    expect(withUnit(45, "cm")).toBe("45 cm");
    expect(ordinal(1)).toBe("1st");
    expect(ordinal(22)).toBe("22nd");
    expect(ordinal(13)).toBe("13th");
  });
});

describe("apSequence", () => {
  const base = apSequence.defaults as SequenceState;
  const list = (values: number[]): SequenceState => ({ ...base, values });

  it("reveals the differences one at a time and decides at the end", () => {
    let s = list([4, 10, 16, 22]);
    expect(look(seq, s).verdict).toBe(Verdict.Unknown);
    for (let i = 0; i < 2; i++) s = run(seq, s, SequenceAction.Reveal).state;
    expect(look(seq, s).verdict).toBe(Verdict.Unknown);
    const last = run(seq, s, SequenceAction.Reveal);
    expect(signals(last.emit)).toEqual([SequenceSignal.Revealed, SequenceSignal.Decided]);
    expect(last.emit[1]).toMatchObject({ payload: { isAP: true, d: 6 } });
    expect(look(seq, last.state).verdict).toBe(Verdict.IsAP);
    expect(look(seq, last.state).nextTerms).toEqual([28, 34, 40]);
  });

  it("decides 'not an AP' at the first different difference and stops there", () => {
    let s = list([-2, 2, -2, 2, -2]);
    s = run(seq, s, SequenceAction.Reveal).state;
    const second = run(seq, s, SequenceAction.Reveal);
    expect(second.emit[0]).toMatchObject({
      signal: SequenceSignal.Revealed,
      payload: { isSame: false },
    });
    expect(second.emit[1]).toMatchObject({
      signal: SequenceSignal.Decided,
      payload: { isAP: false, d: null },
    });
    expect(look(seq, second.state).verdict).toBe(Verdict.NotAP);
    expect(run(seq, second.state, SequenceAction.Reveal).state.shown).toBe(2);
  });

  it("builds the list from a and d, and the learner can change them", () => {
    let s: SequenceState = { ...base, canSetA: true, canSetD: true };
    expect(look(seq, s).terms).toEqual([6, 9, 12, 15, 18]);
    s = run(seq, s, SequenceAction.NudgeD, { by: -1 }).state;
    s = run(seq, s, SequenceAction.NudgeD, { by: -1 }).state;
    s = run(seq, s, SequenceAction.NudgeD, { by: -1 }).state;
    s = run(seq, s, SequenceAction.NudgeD, { by: -1 }).state;
    s = run(seq, s, SequenceAction.NudgeD, { by: -1 }).state;
    s = run(seq, s, SequenceAction.NudgeD, { by: -1 }).state;
    expect(look(seq, s).terms).toEqual([6, 3, 0, -3, -6]);
    expect(look(seq, s).commonDifference).toBe(-3);
    // a constant list is an AP with d = 0
    s = run(seq, { ...s, d: 0 }, SequenceAction.RevealAll).state;
    expect(look(seq, s).verdict).toBe(Verdict.IsAP);
    expect(look(seq, s).commonDifference).toBe(0);
  });

  it("refuses learner nudges it isn't allowed, and a list with labels that don't match", () => {
    const s = run(seq, base, SequenceAction.NudgeA, { by: 1 }).state;
    expect(s.a).toBe(base.a);
    expect(applyPatch(seq, base, { values: [1, 2, 3], labels: ["1", "2"] }).isOk).toBe(false);
  });
});

describe("nthTerm", () => {
  const base = nthTerm.defaults as NthState;

  it("moves n and reads the term", () => {
    let s: NthState = { ...base, a: 100, d: 5, n: 19, nMax: 40 };
    const r = run(nth, s, NthAction.NudgeN, { by: 1 });
    s = r.state;
    expect(s.n).toBe(20);
    expect(look(nth, s).term).toBe(195);
    expect(look(nth, s).hops).toBe(19);
    expect(r.emit[0]).toMatchObject({ signal: NthSignal.Changed, payload: { n: 20, term: 195 } });
  });

  it("says when the term hits the target", () => {
    const s: NthState = { ...base, a: 100, d: 5, n: 20, nMax: 40, target: 200 };
    const r = run(nth, s, NthAction.NudgeN, { by: 1 });
    expect(signals(r.emit)).toEqual([NthSignal.Changed, NthSignal.Hit]);
  });

  it("solves for n step by step (Example 4: −81 is the 35th term)", () => {
    let s: NthState = { ...base, a: 21, d: -3, target: -81, canStep: true };
    expect(workingTex(s)).toHaveLength(3);
    s = run(nth, s, NthAction.Next).state;
    s = run(nth, s, NthAction.Next).state;
    const r = run(nth, s, NthAction.Next);
    expect(signals(r.emit)).toEqual([NthSignal.Stepped, NthSignal.Solved]);
    expect(r.emit[1]).toMatchObject({ payload: { n: "35", isTerm: true } });
    expect(look(nth, r.state).isTerm).toBe(true);
    expect(run(nth, r.state, NthAction.Next).state.step).toBe(3);
  });

  it("knows a value that isn't a term (Example 6: 301)", () => {
    const s: NthState = { ...base, a: 5, d: 6, target: 301 };
    expect(look(nth, s).nForTarget).toBe("151/3");
    expect(look(nth, s).isTerm).toBe(false);
    expect((workingTex(s) as string[])[2]).toBe("n = \\frac{151}{3}");
  });

  it("keeps the shown term formula true over many cases", () => {
    for (let n = 1; n <= 30; n++) {
      const s: NthState = { ...base, a: 7, d: 3, n, nMax: 30 };
      expect(look(nth, s).term).toBe(7 + (n - 1) * 3);
    }
  });
});

describe("gaussSum", () => {
  const base = gaussSum.defaults as GaussState;

  it("steps to the sum and announces it", () => {
    let s: GaussState = { ...base, a: 1, d: 1, n: 6 };
    s = run(gauss, s, GaussAction.Next).state;
    s = run(gauss, s, GaussAction.Next).state;
    const r = run(gauss, s, GaussAction.Next);
    expect(r.state.step).toBe(GAUSS_STEPS);
    expect(signals(r.emit)).toEqual([GaussSignal.Stepped, GaussSignal.Done]);
    expect(r.emit[1]).toMatchObject({ payload: { sum: 21 } });
    expect(look(gauss, r.state).pairSum).toBe(7);
  });

  it("writes Gauss's lines for 1 to 100", () => {
    const lines = linesTex({ a: 1, d: 1, n: 100 });
    expect(lines[0]).toBe("S = 1 + 2 + 3 + \\dots + 99 + 100");
    expect(lines[1]).toBe("S = 100 + 99 + 98 + \\dots + 2 + 1");
    expect(lines[2]).toContain("100 \\times 101 = 10100");
    expect(lines[3]).toBe("S = \\frac{10100}{2} = 5050");
  });

  it("starts again when n changes, and refuses negative columns in bars mode", () => {
    let s: GaussState = { ...base, step: 2, canSetN: true };
    const r = run(gauss, s, GaussAction.NudgeN, { by: 1 });
    expect(r.state.n).toBe(7);
    expect(r.state.step).toBe(0);
    s = { ...base, a: 3, d: -1, n: 3, canSetN: true };
    expect(run(gauss, s, GaussAction.NudgeN, { by: 1 }).state.n).toBe(4);
    expect(run(gauss, { ...s, n: 4 }, GaussAction.NudgeN, { by: 1 }).state.n).toBe(4);
    expect(applyPatch(gauss, base, { a: -2 }).isOk).toBe(false);
    expect(applyPatch(gauss, base, { mode: GaussMode.Pairs, a: -2 }).isOk).toBe(true);
  });
});

describe("views", () => {
  type View = ComponentType<PropViewProps>;
  const cases: [string, AnyPropDef, View, StoredState][] = [
    [
      "sequence built",
      seq,
      SequenceView,
      {
        ...(apSequence.defaults as SequenceState),
        canSetA: true,
        canSetD: true,
        showGeneral: true,
      },
    ],
    [
      "sequence list, all revealed",
      seq,
      SequenceView,
      { ...(apSequence.defaults as SequenceState), values: [1, 1, 2, 3, 5, 8], shown: 3 },
    ],
    [
      "sequence fractions",
      seq,
      SequenceView,
      {
        ...(apSequence.defaults as SequenceState),
        values: [1.5, 0.5, -0.5, -1.5],
        labels: ["\\frac{3}{2}", "\\frac{1}{2}", "-\\frac{1}{2}", "-\\frac{3}{2}"],
        shown: 3,
        showNext: 2,
      },
    ],
    [
      "sequence salary",
      seq,
      SequenceView,
      { ...(apSequence.defaults as SequenceState), a: 8000, d: 500, count: 12, unit: "₹" },
    ],
    ["nth", nth, NthView, { ...(nthTerm.defaults as NthState) }],
    ["nth many hops", nth, NthView, { ...(nthTerm.defaults as NthState), a: 100, d: 5, n: 20 }],
    [
      "nth target",
      nth,
      NthView,
      { ...(nthTerm.defaults as NthState), a: 5, d: 6, target: 301, step: 3, canStep: true },
    ],
    ["gauss bars", gauss, GaussView, { ...(gaussSum.defaults as GaussState), step: 2 }],
    [
      "gauss pairs",
      gauss,
      GaussView,
      { ...(gaussSum.defaults as GaussState), mode: GaussMode.Pairs, n: 100, nMax: 100, step: 3 },
    ],
    ...Object.values(ApSceneKind).map((kind): [string, AnyPropDef, View, StoredState] => [
      `scene ${kind}`,
      scene,
      ApSceneView,
      { scene: kind },
    ]),
  ];
  for (const [name, def, View, s] of cases) {
    it(`draws ${name} in both languages at phone widths`, () => {
      for (const locale of ["en", "hi"] as const)
        for (const width of [300, 340, 420]) {
          const html = renderToString(
            <View
              view={viewOf(def, s)}
              locale={locale}
              width={width}
              call={() => undefined}
              signal={() => undefined}
            />,
          );
          expect(html).not.toMatch(/NaN|undefined|Infinity/);
        }
      expect(observationOf(def, s).summary.length).toBeGreaterThan(10);
    });
  }

  it("lists every prop in defs and in the modules", () => {
    expect(defs.map((d) => d.type).sort()).toEqual(apProps.map((m) => m.def.type).sort());
  });
});
