import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { divide } from "./arithmetic";
import { count } from "./seen";

/** The most counters drawn: enough for 12 full rows of 10. */
export const MAX_COUNTERS = 120;
export const MAX_ROW = 12;

export const DivisionRowsAction = {
  SetDividend: "setDividend",
  SetDivisor: "setDivisor",
} as const;

export const DivisionRowsDerived = { Quotient: "quotient", Remainder: "remainder" } as const;

export const DivisionRowsSignal = { Changed: "changed" } as const;

const divisionRowsState = z
  .object({
    /** a: how many counters. */
    dividend: z.number().int().min(0).max(MAX_COUNTERS),
    /** b: how many go in each row. */
    divisor: z.number().int().min(1).max(MAX_ROW),
  })
  .strict();
export type DivisionRowsState = z.infer<typeof divisionRowsState>;

const act = actionsFor<DivisionRowsState>();
const value = (max: number, min: number) =>
  z.object({ value: z.number().int().min(min).max(max) }).strict();

/** a counters laid out in rows of b: q full rows and r left over, r always less than b. */
export const divisionRows = defineProp({
  type: "divisionRows",
  describe:
    "a counters laid out in rows of b. The full rows are the quotient q and the counters left over are the remainder r, so a = b × q + r with 0 ≤ r < b: a row of b would be one more full row.",
  state: divisionRowsState,
  defaults: { dividend: 17, divisor: 5 },
  derived: {
    [DivisionRowsDerived.Quotient]: {
      describe: "q: how many full rows",
      compute: (s) => divide(s.dividend, s.divisor).q,
    },
    [DivisionRowsDerived.Remainder]: {
      describe: "r: the counters left over, always less than b",
      compute: (s) => divide(s.dividend, s.divisor).r,
    },
  },
  actions: {
    [DivisionRowsAction.SetDividend]: act({
      describe: "Change a, how many counters (the learner's − and + buttons)",
      byLearner: true,
      args: value(MAX_COUNTERS, 0),
      run: (s, a) => {
        const { q, r } = divide(a.value, s.divisor);
        return set(
          { dividend: a.value },
          { signal: DivisionRowsSignal.Changed, payload: { q, r } },
        );
      },
    }),
    [DivisionRowsAction.SetDivisor]: act({
      describe: "Change b, how many in a row (the learner's − and + buttons)",
      byLearner: true,
      args: value(MAX_ROW, 1),
      run: (s, a) => {
        const { q, r } = divide(s.dividend, a.value);
        return set({ divisor: a.value }, { signal: DivisionRowsSignal.Changed, payload: { q, r } });
      },
    }),
  },
  signals: {
    [DivisionRowsSignal.Changed]: { describe: "a or b changed; `q` and `r` are the new ones" },
  },
  observe: (s) => {
    const { q, r } = divide(s.dividend, s.divisor);
    const b = s.divisor;
    return {
      summary: `${count(s.dividend, "counter")} in rows of ${b}: ${count(q, "full row")} and ${r} left over`,
      elements: [
        { id: "a", value: s.dividend },
        { id: "b", value: b },
        ...(q > 0 ? [{ id: "rows", value: `${count(q, "row")} of ${b}, numbered 1 to ${q}` }] : []),
        { id: "leftOver", value: `r = ${r}: ${r} counters and ${b - r} empty places` },
        { id: "equation", value: `${s.dividend} = ${b} × ${q} + ${r}, ${r} < ${b}` },
      ],
    };
  },
});
