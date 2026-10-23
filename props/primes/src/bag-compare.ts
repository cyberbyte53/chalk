import { localizedSchema } from "@chalk/content";
import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import {
  type Bag,
  bagOf,
  bagText,
  common,
  covering,
  gcd,
  join,
  lcm,
  primesIn,
  productOf,
} from "./arithmetic";
import { option } from "./seen";

export const MAX_COMPARED = 99_999;

/** What the comparison shows: the bags side by side, what they share (HCF), or what covers them all (LCM). */
export const BagShow = { Apart: "apart", Hcf: "hcf", Lcm: "lcm", Product: "product" } as const;
export type BagShow = (typeof BagShow)[keyof typeof BagShow];

export const BagCompareAction = { SetNumbers: "setNumbers", Show: "show" } as const;

export const BagCompareDerived = {
  Bags: "bags",
  Primes: "primes",
  Hcf: "hcf",
  Lcm: "lcm",
  HcfBag: "hcfBag",
  LcmBag: "lcmBag",
  Product: "product",
  HcfTimesLcm: "hcfTimesLcm",
} as const;

export const BagCompareSignal = { Shown: "shown" } as const;

const bagCompareState = z
  .object({
    /** Two or three whole numbers to compare. */
    numbers: z.array(z.number().int().min(2).max(MAX_COMPARED)).min(2).max(3),
    show: z.nativeEnum(BagShow),
    /** Whether the learner can type new numbers in. */
    isEditable: z.boolean(),
    /** What the HCF and LCM are called, in the learner's language. */
    names: z.object({ hcf: localizedSchema, lcm: localizedSchema }).strict(),
  })
  .strict();
export type BagCompareState = z.infer<typeof bagCompareState>;

const bagsOf = (s: BagCompareState): Bag[] => s.numbers.map(bagOf);

/** Every prime in any of the bags, smallest first. */
function primesOf(bags: readonly Bag[]): number[] {
  return primesIn(bags.reduce<Bag>((all, bag) => join(all, bag), {}));
}

const act = actionsFor<BagCompareState>();

/**
 * Two or three numbers' bags of primes, row by row, one row per prime. The HCF's bag takes the
 * smaller count in every row (what all of them share); the LCM's bag takes the larger (just enough
 * to hold each of them). For two numbers, the smaller and the larger of each row are the two counts
 * themselves, so HCF × LCM = a × b.
 */
export const bagCompare = defineProp({
  type: "bagCompare",
  describe:
    "Two or three numbers' prime factorisations as bags of beads, one row per prime. The HCF's bag takes the smallest count in each row (the primes all of them share), the LCM's bag the largest (just enough primes to be a multiple of each). With two numbers, HCF × LCM = a × b, because the smaller and larger count in each row add up to both counts.",
  state: bagCompareState,
  defaults: {
    numbers: [12, 18],
    show: BagShow.Apart,
    isEditable: false,
    names: { hcf: { en: "HCF", hi: "HCF" }, lcm: { en: "LCM", hi: "LCM" } },
  },
  derived: {
    [BagCompareDerived.Bags]: { describe: "Each number's bag", compute: bagsOf },
    [BagCompareDerived.Primes]: {
      describe: "Every prime in any bag, smallest first (the rows)",
      compute: (s) => primesOf(bagsOf(s)),
    },
    [BagCompareDerived.Hcf]: {
      describe: "HCF of the numbers",
      compute: (s) => s.numbers.reduce((g, n) => gcd(g, n)),
    },
    [BagCompareDerived.Lcm]: {
      describe: "LCM of the numbers",
      compute: (s) => s.numbers.reduce((l, n) => lcm(l, n)),
    },
    [BagCompareDerived.HcfBag]: {
      describe: "The HCF the book's way, from the smallest count of each prime",
      compute: (s) => bagText(common(bagsOf(s))),
    },
    [BagCompareDerived.LcmBag]: {
      describe: "The LCM the book's way, from the largest count of each prime",
      compute: (s) => bagText(covering(bagsOf(s))),
    },
    [BagCompareDerived.Product]: {
      describe: "The numbers multiplied together",
      compute: (s) => s.numbers.reduce((p, n) => p * n, 1),
    },
    [BagCompareDerived.HcfTimesLcm]: {
      describe: "HCF × LCM (equal to the product for two numbers, not in general for three)",
      compute: (s) => productOf(common(bagsOf(s))) * productOf(covering(bagsOf(s))),
    },
  },
  actions: {
    [BagCompareAction.SetNumbers]: act({
      describe: "Compare other numbers (the learner types them)",
      byLearner: true,
      args: z
        .object({ numbers: z.array(z.number().int().min(2).max(MAX_COMPARED)).min(2).max(3) })
        .strict(),
      run: (_s, a) => set({ numbers: [...a.numbers] }),
    }),
    [BagCompareAction.Show]: act({
      describe:
        "Show the bags apart, what they share (HCF), what covers them (LCM), or the product",
      byLearner: true,
      reveals: true,
      args: z.object({ show: z.nativeEnum(BagShow) }).strict(),
      run: (_s, a) =>
        set({ show: a.show }, { signal: BagCompareSignal.Shown, payload: { show: a.show } }),
    }),
  },
  signals: { [BagCompareSignal.Shown]: { describe: "The view changed to `show`" } },
  observe: (s) => {
    const bags = bagsOf(s);
    const hcf = s.numbers.reduce((g, n) => gcd(g, n));
    const lcmOf = s.numbers.reduce((l, n) => lcm(l, n));
    const hcfName = s.names.hcf.en ?? "HCF";
    const lcmName = s.names.lcm.en ?? "LCM";
    const isHcf = s.show === BagShow.Hcf;
    const isLcm = s.show === BagShow.Lcm;
    const isProduct = s.show === BagShow.Product && s.numbers.length === 2;
    const elements: Element[] = primesOf(bags).map((p) => {
      const counts = bags.map((b) => b[p] ?? 0);
      const least = Math.min(...counts);
      const most = Math.max(...counts);
      const each = s.numbers.map((n, i) => `${n} has ${counts[i]}`).join(", ");
      const extra = isHcf
        ? `; ${hcfName} takes ${least}`
        : isLcm
          ? `; ${lcmName} takes ${most}`
          : isProduct
            ? `; ${hcfName} has ${least}, ${lcmName} has ${most}`
            : "";
      return { id: `row:${p}`, value: `${p}s: ${each}${extra}` };
    });
    if (isHcf)
      elements.push({ id: "equation", value: `${hcfName} = ${bagText(common(bags))} = ${hcf}` });
    if (isLcm)
      elements.push({
        id: "equation",
        value: `${lcmName} = ${bagText(covering(bags))} = ${lcmOf}`,
      });
    if (isProduct) {
      const both = productOf(common(bags)) * productOf(covering(bags));
      elements.push({
        id: "equation",
        value: `${hcf} × ${lcmOf} = ${both} = ${s.numbers.join(" × ")}`,
      });
    }
    elements.push(
      option("show:apart", s.show === BagShow.Apart),
      option("show:hcf", isHcf),
      option("show:lcm", isLcm),
      ...(s.numbers.length === 2 ? [option("show:product", isProduct)] : []),
    );
    if (s.isEditable) {
      const names = ["a", "b", "c"];
      s.numbers.forEach((n, i) => elements.push({ id: names[i] ?? "n", value: n }));
    }
    // What isn't on screen yet: the HCF until it's shown, the LCM likewise.
    const hidden: Record<string, number> = {};
    if (!isHcf && !isProduct) hidden.hcf = hcf;
    if (!isLcm && !isProduct) hidden.lcm = lcmOf;
    const shown = isHcf
      ? `, with their ${hcfName}`
      : isLcm
        ? `, with their ${lcmName}`
        : isProduct
          ? `, with ${hcfName} × ${lcmName}`
          : "";
    return {
      summary: `${s.numbers.join(", ")} as beads of primes, one row per prime${shown}`,
      elements,
      ...(Object.keys(hidden).length > 0 ? { hidden } : {}),
    };
  },
});
