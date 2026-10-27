import { type Emit, actionsFor, defineProp, raise, set, signal } from "@chalk/prop";
import { z } from "zod";
import { type Bag, bagOf, gcd, lcm, primesIn } from "./arithmetic";
import { option } from "./seen";

export const MAX_TOWERED = 99_999;

export const TowerShow = {
  Apart: "apart",
  Hcf: "hcf",
  Lcm: "lcm",
  Product: "product",
} as const;
export type TowerShow = (typeof TowerShow)[keyof typeof TowerShow];

const primeTowersState = z
  .object({
    numberA: z.number().int().min(2).max(MAX_TOWERED),
    numberB: z.number().int().min(2).max(MAX_TOWERED),
    /** What is marked: nothing, the HCF line (shorter towers), the LCM line (taller), or both. */
    show: z.nativeEnum(TowerShow),
    /** The buttons the learner has: which of HCF, LCM and HCF × LCM. */
    choices: z.array(z.nativeEnum(TowerShow)),
    /** Whether the learner can type the two numbers. */
    isEditable: z.boolean(),
  })
  .strict();
export type PrimeTowersState = z.infer<typeof primeTowersState>;

const act = actionsFor<PrimeTowersState>();

/** Every prime in either number, smallest first, with its height in each. */
export function towersOf(a: number, b: number): { prime: number; inA: number; inB: number }[] {
  const ba: Bag = bagOf(a);
  const bb: Bag = bagOf(b);
  const primes = [...new Set([...primesIn(ba), ...primesIn(bb)])].sort((x, y) => x - y);
  return primes.map((prime) => ({ prime, inA: ba[prime] ?? 0, inB: bb[prime] ?? 0 }));
}

const sup = (n: number) => String(n).replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)] ?? d);
const power = (p: number, k: number) => (k === 1 ? `${p}` : `${p}${sup(k)}`);

/** HCF from the towers: each prime at its shorter height. "2 × 3 = 6". */
export function hcfLine(a: number, b: number): string {
  const parts = towersOf(a, b)
    .filter((t) => Math.min(t.inA, t.inB) > 0)
    .map((t) => power(t.prime, Math.min(t.inA, t.inB)));
  return `${parts.length > 0 ? parts.join(" × ") : "1"} = ${gcd(a, b)}`;
}

/** LCM from the towers: each prime at its taller height. "2² × 3² = 36". */
export function lcmLine(a: number, b: number): string {
  const parts = towersOf(a, b).map((t) => power(t.prime, Math.max(t.inA, t.inB)));
  return `${parts.join(" × ")} = ${lcm(a, b)}`;
}

/** One prime's pair of towers in words: "2: 18 has 1, 12 has 2". */
export function towerText(t: { prime: number; inA: number; inB: number }, a: number, b: number) {
  return `${t.prime}: ${a} has ${t.inA}, ${b} has ${t.inB}`;
}

const signals = {
  shown: signal("The towers now mark `show`"),
};
/**
 * Two numbers as towers of primes: for each prime, the two numbers' towers stand side by side, as
 * high as the prime's power in each. The HCF line sits at the shorter tower's top (the height both
 * reach), the LCM line at the taller's (the height that covers both). For each prime the shorter
 * and the taller are the two towers, so HCF × LCM = a × b.
 */
export const primeTowers = defineProp({
  type: "primeTowers",
  describe:
    "Two numbers' prime factorisations as towers: for each prime, the two numbers' towers side by side, each as tall as that prime's power in the number (18 = 2 × 3²: a 2-tower of 1 and a 3-tower of 2). HCF: a line at the shorter tower's top in each column (each prime at its smaller power). LCM: a line at the taller tower's top (each prime at its greater power). HCF × LCM: both lines; shorter + taller = the two heights together, so HCF × LCM = a × b.",
  state: primeTowersState,
  defaults: {
    numberA: 18,
    numberB: 12,
    show: TowerShow.Apart,
    choices: [TowerShow.Hcf, TowerShow.Lcm],
    isEditable: false,
  },
  inputs: ["show"],
  derived: {
    hcf: {
      describe: "HCF of the two numbers",
      compute: (s) => gcd(s.numberA, s.numberB),
    },
    lcm: {
      describe: "LCM of the two numbers",
      compute: (s) => lcm(s.numberA, s.numberB),
    },
  },
  actions: {
    show: act({
      describe: "Mark the HCF, the LCM or HCF × LCM on the towers (the learner's buttons)",
      changes: ["show"],
      byLearner: true,
      args: z.object({ show: z.nativeEnum(TowerShow) }).strict(),
      run: (s, a) => {
        if (a.show !== TowerShow.Apart && !s.choices.includes(a.show)) return set({});
        const emits: Emit[] = [raise(signals.shown, { show: a.show })];
        return set({ show: a.show }, ...emits);
      },
    }),
    setNumbers: act({
      describe: "Two new numbers (the learner types them); nothing marked",
      changes: ["numberA", "numberB", "show"],
      byLearner: true,
      args: z
        .object({
          numberA: z.number().int().min(2).max(MAX_TOWERED),
          numberB: z.number().int().min(2).max(MAX_TOWERED),
        })
        .strict(),
      run: (_s, a) => set({ numberA: a.numberA, numberB: a.numberB, show: TowerShow.Apart }),
    }),
  },
  signals,
  observe: (s) => {
    const towers = towersOf(s.numberA, s.numberB);
    const result =
      s.show === TowerShow.Hcf
        ? `HCF = ${hcfLine(s.numberA, s.numberB)}`
        : s.show === TowerShow.Lcm
          ? `LCM = ${lcmLine(s.numberA, s.numberB)}`
          : s.show === TowerShow.Product
            ? `HCF × LCM = ${gcd(s.numberA, s.numberB)} × ${lcm(s.numberA, s.numberB)} = ${s.numberA * s.numberB} = ${s.numberA} × ${s.numberB}`
            : null;
    return {
      summary: `${s.numberA} and ${s.numberB} as towers of primes, side by side${s.show === TowerShow.Apart ? "" : `, marking the ${s.show}`}`,
      elements: [
        ...(s.isEditable
          ? [
              { id: "a", value: s.numberA },
              { id: "b", value: s.numberB },
            ]
          : []),
        ...towers.map((t) => ({
          id: `tower:${t.prime}`,
          value: towerText(t, s.numberA, s.numberB),
        })),
        ...(result === null ? [] : [{ id: "result", value: result }]),
        ...s.choices.map((c) => option(c, s.show === c)),
      ],
      ...(s.show === TowerShow.Apart
        ? { hidden: { hcf: gcd(s.numberA, s.numberB), lcm: lcm(s.numberA, s.numberB) } }
        : {}),
    };
  },
});
