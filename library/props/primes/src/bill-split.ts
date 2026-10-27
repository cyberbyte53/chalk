import { localizedSchema } from "@chalk/content";
import { actionsFor, defineProp, raise, set, signal } from "@chalk/prop";
import { z } from "zod";
import { option } from "./seen";

/** A share as a decimal: whole rupees, then digits that come once, then digits that repeat forever. */
export type Share = { whole: number; once: string; repeats: string };

/**
 * `amount ÷ n` by long division: the digits after the point, split into the part that comes once
 * and the block that repeats (empty when the division ends). Remainders are 0 … n − 1, so one
 * comes back within n steps.
 */
export function shareOf(amount: number, n: number): Share {
  const whole = Math.floor(amount / n);
  let rest = amount % n;
  const seen = new Map<number, number>();
  let digits = "";
  while (rest !== 0 && !seen.has(rest)) {
    seen.set(rest, digits.length);
    rest *= 10;
    digits += String(Math.floor(rest / n));
    rest %= n;
  }
  if (rest === 0) return { whole, once: digits, repeats: "" };
  const start = seen.get(rest) ?? 0;
  return { whole, once: digits.slice(0, start), repeats: digits.slice(start) };
}

/** A share in words for the observation: "25", "12.5", "33.(3)". */
export function shareText(s: Share): string {
  const after = s.once + (s.repeats === "" ? "" : `(${s.repeats})`);
  return after === "" ? String(s.whole) : `${s.whole}.${after}`;
}

const billSplitState = z
  .object({
    /** The bill, in rupees. */
    amount: z.number().int().min(1).max(100_000),
    /** The group sizes the learner can try. */
    sizes: z.array(z.number().int().min(2).max(99)),
    /** The sizes tried so far, each written in the list once. */
    tried: z.array(z.number().int().min(2).max(99)),
    /** The size tried last; null before the first. */
    chosen: z.number().int().min(2).max(99).nullable(),
    /** Words from the lesson: "{n} friends", "terminates", "doesn't terminate". */
    words: z
      .object({ friends: localizedSchema, ends: localizedSchema, repeats: localizedSchema })
      .strict(),
  })
  .strict();
export type BillSplitState = z.infer<typeof billSplitState>;

const act = actionsFor<BillSplitState>();

const signals = {
  split: signal("The bill was shared among `n`: each `share`, and whether it `ends`"),
};
/**
 * A bill shared equally by n friends: each tap of a group size writes each friend's share. Some
 * shares end (₹100 among 8: ₹12.50); some never do (among 3: ₹33.33…). Tried sizes stay listed in
 * order, so the pattern shows: the ones that end have only 2s and 5s.
 */
export const billSplit = defineProp({
  type: "billSplit",
  describe:
    "A bill of `amount` rupees shared equally by n friends, for n among `sizes`. Each try lists n and each friend's share as a decimal: it ends (₹100 ÷ 8 = ₹12.50) or repeats forever (₹100 ÷ 3 = ₹33.33…). The shares that end are the n whose only primes are 2 and 5.",
  state: billSplitState,
  defaults: {
    amount: 100,
    sizes: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    tried: [],
    chosen: null,
    words: {
      friends: { en: "{n} friends", hi: "{n} दोस्त" },
      ends: { en: "terminates", hi: "सांत" },
      repeats: { en: "doesn't terminate", hi: "असांत" },
    },
  },
  derived: {
    endsFor: {
      describe: "The sizes tried so far whose share ends",
      compute: (s) => s.tried.filter((n) => shareOf(s.amount, n).repeats === ""),
    },
  },
  actions: {
    split: act({
      describe: "Share the bill among n friends (the learner's button)",
      changes: ["tried", "chosen"],
      byLearner: true,
      args: z.object({ n: z.number().int().min(2).max(99) }).strict(),
      run: (s, a) => {
        if (!s.sizes.includes(a.n)) return set({});
        const tried = s.tried.includes(a.n) ? s.tried : [...s.tried, a.n].sort((x, y) => x - y);
        const share = shareOf(s.amount, a.n);
        return set(
          { tried, chosen: a.n },
          raise(signals.split, { n: a.n, share: shareText(share), ends: share.repeats === "" }),
        );
      },
    }),
    startAgain: act({
      describe: "Clear the list",
      changes: ["tried", "chosen"],
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ tried: [], chosen: null }),
    }),
  },
  signals,
  observe: (s) => ({
    summary: `₹${s.amount} shared equally; tried: ${
      s.tried.length === 0
        ? "none yet"
        : s.tried.map((n) => `${n} → ₹${shareText(shareOf(s.amount, n))}`).join(", ")
    }`,
    elements: [
      ...s.sizes.map((n) => option(`size-${n}`, s.chosen === n)),
      ...(s.tried.length > 0
        ? [
            {
              id: "shares",
              value: s.tried.map((n) => `${n}: ₹${shareText(shareOf(s.amount, n))}`),
            },
          ]
        : []),
    ],
  }),
});
