import { applyPatch, asAnyProp } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { type GasState, gas, positions } from "./model";

const def = asAnyProp(gas);
const s: GasState = {
  count: 1000,
  temperature: 1,
  travel: 0,
  isRunning: false,
  seed: 7,
};

describe("gas", () => {
  it("puts every particle inside the box, however far it has travelled", () => {
    for (const travel of [0, 0.37, 5, 123.4]) {
      const p = positions({ ...s, travel }, 0.7);
      expect(p.every((v) => v >= 0 && v <= 1)).toBe(true);
    }
  });

  it("is the same gas for the same seed and travel", () => {
    expect(positions({ ...s, travel: 3 }, 0.7)).toEqual(positions({ ...s, travel: 3 }, 0.7));
  });

  it("moves when it travels", () => {
    expect(positions({ ...s, travel: 0.1 }, 0.7)).not.toEqual(positions(s, 0.7));
  });

  it("refuses more particles than it can hold", () => {
    expect(applyPatch(def, s, { count: 6000 }).isOk).toBe(false);
  });
});
