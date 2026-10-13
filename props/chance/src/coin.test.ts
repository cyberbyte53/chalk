import { EffectKind, applyPatch, asAnyProp, prepareAction, viewOf } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { type CoinState, Face, coin } from "./coin";

const def = asAnyProp(coin);

function tossMany(start: CoinState, times: number): CoinState {
  let state = start;
  for (let i = 0; i < times; i++) {
    const result = prepareAction(def, state, "toss");
    if (!result.isOk || result.effect.kind !== EffectKind.Set) throw new Error("toss failed");
    const next = applyPatch(def, state, result.effect.set);
    if (!next.isOk) throw new Error(next.errors.join("; "));
    state = next.state as CoinState;
  }
  return state;
}

describe("coin", () => {
  it("counts and works out the heads fraction", () => {
    const after = tossMany(coin.defaults, 10);
    const view = viewOf(def, after);
    expect(view.count).toBe(10);
    expect(view.headsFraction).toBe(after.heads / 10);
  });

  it("is replayable: the same seed gives the same tosses", () => {
    expect(tossMany(coin.defaults, 50)).toEqual(tossMany(coin.defaults, 50));
    expect(tossMany({ ...coin.defaults, seed: 7 }, 50)).not.toEqual(tossMany(coin.defaults, 50));
  });

  it("is fair: the fraction settles near a half over many tosses", () => {
    const after = tossMany(coin.defaults, 10_000);
    expect(viewOf(def, after).headsFraction).toBeGreaterThan(0.48);
    expect(viewOf(def, after).headsFraction).toBeLessThan(0.52);
  });

  it("says which way it landed", () => {
    const result = prepareAction(def, coin.defaults, "toss");
    if (!result.isOk || result.effect.kind !== EffectKind.Set) throw new Error("toss failed");
    expect(Object.values(Face)).toContain(result.effect.emit[0]?.payload?.face);
  });
});
