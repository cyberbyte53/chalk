import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { bagOf, bagText, times } from "./arithmetic";
import { count, shortenedText, sup } from "./seen";

export const MAX_BASE = 999;
export const MAX_POWER = 12;

export const PrimeBagAction = { SetBase: "setBase", SetPower: "setPower" } as const;

export const PrimeBagDerived = {
  Bag: "bag",
  BagText: "bagText",
  ValueText: "valueText",
  LastDigit: "lastDigit",
  HasTwoAndFive: "hasTwoAndFive",
} as const;

const primeBagState = z
  .object({
    /** The number whose bag it is (with the power, nᵖᵒʷᵉʳ). */
    base: z.number().int().min(1).max(MAX_BASE),
    power: z.number().int().min(1).max(MAX_POWER),
    /** Whether the power is drawn and can be changed (off: just the number n). */
    isPowerShown: z.boolean(),
    /** Whether the learner can type the number (off: the page fixes it, and only the power moves). */
    isBaseEditable: z.boolean(),
    /** The power's letter on the slider, from the lesson (k, or n when the page asks about 4ⁿ). */
    powerName: z.string().min(1).max(3),
  })
  .strict();
export type PrimeBagState = z.infer<typeof primeBagState>;

/** nᵏ exactly, as digits (it can be far bigger than a JavaScript number holds). */
export function powerText(base: number, power: number): string {
  return (BigInt(base) ** BigInt(power)).toString();
}

const act = actionsFor<PrimeBagState>();

/**
 * A number's bag of primes: one bead for each prime factor, as many times as it divides. The bag of
 * nᵏ is the bag of n, k times over. A number ends in 0 exactly when its bag has a 2 and a 5 (10 = 2 × 5).
 */
export const primeBag = defineProp({
  type: "primeBag",
  describe:
    "A whole number's prime factorisation drawn as a bag of beads, one bead per prime factor (360 holds 2, 2, 2, 3, 3, 5). With a power shown it is the bag of nᵏ: the bag of n copied k times, so only primes already in n ever appear. A number ends in 0 exactly when its bag holds a 2 and a 5.",
  state: primeBagState,
  defaults: { base: 360, power: 1, isPowerShown: false, isBaseEditable: true, powerName: "k" },
  derived: {
    [PrimeBagDerived.Bag]: {
      describe: "The beads by prime: how many of each",
      compute: (s) => times(bagOf(s.base), s.power),
    },
    [PrimeBagDerived.BagText]: {
      describe: "The bag the book's way: 2³ × 3² × 5",
      compute: (s) => bagText(times(bagOf(s.base), s.power)),
    },
    [PrimeBagDerived.ValueText]: {
      describe: "nᵏ written out in full",
      compute: (s) => powerText(s.base, s.power),
    },
    [PrimeBagDerived.LastDigit]: {
      describe: "The last digit of nᵏ",
      compute: (s) => Number(powerText(s.base, s.power).slice(-1)),
    },
    [PrimeBagDerived.HasTwoAndFive]: {
      describe: "The bag holds at least one 2 and one 5 (a factor 10)",
      compute: (s) => s.base % 10 === 0 || (s.base % 2 === 0 && s.base % 5 === 0),
    },
  },
  actions: {
    [PrimeBagAction.SetBase]: act({
      describe: "A different number n",
      byLearner: true,
      args: z.object({ base: z.number().int().min(1).max(MAX_BASE) }).strict(),
      run: (_s, a) => set({ base: a.base }),
    }),
    [PrimeBagAction.SetPower]: act({
      describe: "A different power k (the learner's slider)",
      byLearner: true,
      args: z.object({ power: z.number().int().min(1).max(MAX_POWER) }).strict(),
      run: (_s, a) => set({ power: a.power }),
    }),
  },
  observe: (s) => {
    const name = s.isPowerShown ? `${s.base}${sup(s.power)}` : `${s.base}`;
    const shownBag = bagText(times(bagOf(s.base), s.power));
    const beads =
      s.isPowerShown && s.power > 1
        ? `${count(s.power, "copy", "copies")} of ${s.base}'s beads, ${bagText(bagOf(s.base))}`
        : `beads ${shownBag}`;
    return {
      summary: `${name} as a bag of prime beads`,
      elements: [
        { id: "value", value: `${name} = ${shortenedText(powerText(s.base, s.power))}` },
        { id: "beads", value: beads },
        { id: "equation", value: `${name} = ${shownBag}` },
        ...(s.isBaseEditable ? [{ id: "n", value: s.base }] : []),
        ...(s.isPowerShown ? [{ id: "k", value: s.power }] : []),
      ],
    };
  },
});
