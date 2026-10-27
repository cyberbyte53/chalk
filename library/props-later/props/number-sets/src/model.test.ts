import { EffectKind, applyPatch, asAnyProp, prepareAction, viewOf } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import {
  type Card,
  Family,
  type NumberSorterState,
  OUTSIDE,
  isInside,
  numberSorter,
  placeFor,
} from "./model";

const def = asAnyProp(numberSorter);

const card = (id: string, label: string, family: Family): Card => ({
  id,
  label,
  family,
  placedIn: null,
});

// NCERT 1.1, the teaching map's first question: 0, −7, 3/5, 12/4, 1.
const cards = [
  card("zero", "0", Family.Whole),
  card("minusSeven", "−7", Family.Integer),
  card("threeFifths", "3/5", Family.Rational),
  card("twelveQuarters", "12/4", Family.Natural),
  card("one", "1", Family.Natural),
];
const start: NumberSorterState = { ...numberSorter.defaults, cards };

function run(state: NumberSorterState, name: string, args: Record<string, unknown> = {}) {
  const result = prepareAction(def, state, name, args);
  if (!result.isOk) throw new Error(result.errors.join("; "));
  if (result.effect.kind !== EffectKind.Set) throw new Error(`${name} should be instant`);
  const next = applyPatch(def, state, result.effect.set);
  if (!next.isOk) throw new Error(next.errors.join("; "));
  return { state: next.state as NumberSorterState, emit: result.effect.emit };
}

const look = (s: NumberSorterState) => viewOf(def, s) as Record<string, unknown>;

describe("the families of real numbers", () => {
  it("nest: N ⊂ W ⊂ Z ⊂ Q ⊂ R, and irrationals are in R but not in Q", () => {
    expect(isInside(Family.Natural, Family.Rational)).toBe(true);
    expect(isInside(Family.Whole, Family.Natural)).toBe(false);
    expect(isInside(Family.Integer, Family.Whole)).toBe(false);
    expect(isInside(Family.Irrational, Family.Real)).toBe(true);
    expect(isInside(Family.Irrational, Family.Rational)).toBe(false);
    expect(isInside(Family.Rational, Family.Irrational)).toBe(false);
  });

  it("every family is inside R", () => {
    for (const f of Object.values(Family)) expect(isInside(f, Family.Real)).toBe(true);
  });

  it("a card belongs in the innermost ring shown that holds it", () => {
    const all = Object.values(Family);
    expect(placeFor(Family.Natural, all)).toBe(Family.Natural);
    expect(placeFor(Family.Whole, all)).toBe(Family.Whole);
    // With only N, W, Z drawn: −7 is in Z; 3/5 fits none.
    const some = [Family.Natural, Family.Whole, Family.Integer];
    expect(placeFor(Family.Integer, some)).toBe(Family.Integer);
    expect(placeFor(Family.Rational, some)).toBe(OUTSIDE);
    // With only N drawn, 0 doesn't fit: the bag needs to grow.
    expect(placeFor(Family.Whole, [Family.Natural])).toBe(OUTSIDE);
    // With R but no irrational ring, √2 goes in R itself.
    expect(placeFor(Family.Irrational, [Family.Rational, Family.Real])).toBe(Family.Real);
  });
});

describe("sorting", () => {
  it("pick then drop: the learner's two taps place a card and say whether it's right", () => {
    const picked = run(start, "pick", { card: "twelveQuarters" });
    expect(picked.state.selected).toBe("twelveQuarters");
    const dropped = run(picked.state, "drop", { place: Family.Rational });
    expect(dropped.state.selected).toBeNull();
    expect(look(dropped.state).placedIn).toMatchObject({ twelveQuarters: Family.Rational });
    // 12/4 = 3 belongs in N: the classic slip.
    expect(dropped.emit).toEqual([
      {
        signal: "placed",
        payload: { card: "twelveQuarters", place: Family.Rational, isRight: false },
      },
    ]);
    expect(look(dropped.state).wrongCount).toBe(1);
  });

  it("tapping the picked card again puts it down", () => {
    const picked = run(start, "pick", { card: "one" }).state;
    expect(run(picked, "pick", { card: "one" }).state.selected).toBeNull();
  });

  it("dropping with nothing picked, or into a ring not drawn, does nothing", () => {
    expect(run(start, "drop", { place: Family.Natural }).emit).toEqual([]);
    const onlyN = { ...start, families: [Family.Natural], selected: "zero" };
    expect(run(onlyN, "drop", { place: Family.Whole }).state.cards[0]?.placedIn).toBeNull();
  });

  it("is all right only when every card is where it belongs", () => {
    const done = run(start, "putEachRight").state;
    expect(look(done)).toMatchObject({ isAllPlaced: true, isAllRight: true, wrongCount: 0 });
    expect(look(done).placedIn).toEqual({
      zero: Family.Whole,
      minusSeven: Family.Integer,
      threeFifths: Family.Rational,
      twelveQuarters: Family.Natural,
      one: Family.Natural,
    });
    expect(look(start)).toMatchObject({ isAllPlaced: false, isAllRight: false });
  });

  it("drawing a new ring keeps every card where it was, so some now belong further in", () => {
    const onlyN = { ...start, families: [Family.Natural] };
    const outside = run(onlyN, "place", { card: "zero", place: OUTSIDE }).state;
    expect(look(outside).isAllRight).toBe(false);
    expect((look(outside).rightPlace as Record<string, string>).zero).toBe(OUTSIDE);
    const grown = run(outside, "showFamily", { family: Family.Whole }).state;
    expect(grown.cards[0]?.placedIn).toBe(OUTSIDE);
    expect((look(grown).rightPlace as Record<string, string>).zero).toBe(Family.Whole);
  });

  it("marks right and wrong only when asked (it gives the answer away)", () => {
    expect(numberSorter.actions.mark?.reveals).toBe(true);
    expect(numberSorter.actions.putEachRight?.reveals).toBe(true);
    expect(numberSorter.actions.drop?.reveals).toBeUndefined();
  });
});

describe("refusals and parts", () => {
  it("refuses two cards with one id, a card in a ring not drawn, or a ring listed twice", () => {
    expect(applyPatch(def, start, { cards: [cards[0] as Card, cards[0] as Card] }).isOk).toBe(
      false,
    );
    const inW = { ...start, families: [Family.Natural] };
    expect(
      applyPatch(def, inW, { cards: [{ ...(cards[0] as Card), placedIn: Family.Whole }] }).isOk,
    ).toBe(false);
    expect(applyPatch(def, start, { families: [Family.Natural, Family.Natural] }).isOk).toBe(false);
    expect(applyPatch(def, start, { selected: "nobody" }).isOk).toBe(false);
  });

  it("names its cards and rings as parts", () => {
    const parts = numberSorter.parts?.(viewOf(def, start) as never) ?? [];
    expect(parts).toContain("card:zero");
    expect(parts).toContain("region:natural");
    expect(parts).toContain("region:outside");
  });
});
