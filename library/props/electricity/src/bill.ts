import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { APPLIANCE_EN, Appliance, WATTS } from "./appliances";
import { num } from "./words";

/**
 * Electric power and the bill (NCERT 12.8): each appliance's power P in watts, how many there are
 * and how many hours a day they run. Energy = P × t: watt hours, kilowatt hours (kW h, the "unit"
 * on the bill, 3.6 × 10⁶ J). Units a day, units in the month, and the cost at a rate in rupees per
 * unit. A 100 W bulb can be swapped for a 9 W LED.
 */

export const BillAction = {
  SetHours: "setHours",
  SetCount: "setCount",
  Swap: "swap",
  SetRate: "setRate",
} as const;
export const BillSignal = { Changed: "changed", Swapped: "swapped" } as const;
export const BillDerived = {
  UnitsPerDay: "unitsPerDay",
  RowUnits: "rowUnits",
  MonthUnits: "monthUnits",
  Cost: "cost",
  Biggest: "biggest",
} as const;
export const BillPart = {
  Table: "table",
  Total: "total",
  Meter: "meter",
  Controls: "controls",
} as const;

const rowSchema = z
  .object({
    appliance: z.nativeEnum(Appliance),
    count: z.number().int().min(0).max(20),
    /** Hours a day each one runs. */
    hours: z.number().min(0).max(24),
  })
  .strict();
export type BillRow = z.infer<typeof rowSchema>;

/** Steps for the hours stepper. */
export const HOUR_STEPS: readonly number[] = [
  0, 0.25, 0.5, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24,
];

const billState = z
  .object({
    rows: z.array(rowSchema).min(1).max(10),
    /** Rupees per unit (kW h). */
    rate: z.number().positive().max(50),
    days: z.number().int().min(1).max(31),
    /** Show each row's P × t working. */
    showWorking: z.boolean(),
    /** Show the bars of units by appliance. */
    showBars: z.boolean(),
    canEdit: z.boolean(),
    canSwap: z.boolean(),
  })
  .strict();
export type BillState = z.infer<typeof billState>;

/** kW h a day for one row. */
export const rowUnitsOf = (r: BillRow) => (WATTS[r.appliance] * r.count * r.hours) / 1000;
export const unitsPerDayOf = (s: Pick<BillState, "rows">) =>
  s.rows.reduce((t, r) => t + rowUnitsOf(r), 0);
export const monthUnitsOf = (s: Pick<BillState, "rows" | "days">) => unitsPerDayOf(s) * s.days;
export const costOf = (s: Pick<BillState, "rows" | "days" | "rate">) => monthUnitsOf(s) * s.rate;
export function biggestOf(s: Pick<BillState, "rows">): Appliance | null {
  let best: BillRow | null = null;
  for (const r of s.rows)
    if (rowUnitsOf(r) > 0 && (best === null || rowUnitsOf(r) > rowUnitsOf(best))) best = r;
  return best?.appliance ?? null;
}

/** ₹ with Indian grouping: 1,23,456. */
export function rupees(value: number): string {
  const whole = Math.round(value);
  const s = String(whole);
  if (s.length <= 3) return `₹${s}`;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `₹${rest},${last3}`;
}

export function describeBill(s: BillState): string {
  const rows = s.rows
    .map(
      (r) =>
        `${r.count} × ${APPLIANCE_EN[r.appliance]} (${WATTS[r.appliance]} W) for ${num(r.hours)} h a day: ${num(rowUnitsOf(r), 2)} units a day`,
    )
    .join("; ");
  const big = biggestOf(s);
  return `The family's electricity: ${rows}. In all ${num(unitsPerDayOf(s), 2)} units (kW h) a day, ${num(monthUnitsOf(s), 1)} units in ${s.days} days; at ${rupees(s.rate)} a unit the bill is ${rupees(costOf(s))}.${big === null ? "" : ` The biggest user is the ${APPLIANCE_EN[big]}.`}`;
}

const act = actionsFor<BillState>();
const changed = (s: BillState) => ({
  signal: BillSignal.Changed,
  payload: { units: monthUnitsOf(s), cost: costOf(s) },
});

export const electricityBill = defineProp({
  type: "electricityBill",
  describe:
    "Electric power and the electricity bill (NCERT 12.8): a list of household appliances, each with its power (W), how many and how many hours a day. Energy = power × time in kilowatt hours (1 kW h = 1 'unit' = 3.6 × 10⁶ J); units a day, units in the month and the bill at a rate in rupees per unit, with bars showing which appliance uses most. The learner changes hours and counts and can swap a 100 W bulb for a 9 W LED.",
  state: billState,
  defaults: {
    rows: [
      { appliance: Appliance.Bulb, count: 4, hours: 6 },
      { appliance: Appliance.Fan, count: 3, hours: 8 },
      { appliance: Appliance.Fridge, count: 1, hours: 8 },
      { appliance: Appliance.Tv, count: 1, hours: 4 },
      { appliance: Appliance.Iron, count: 1, hours: 0.5 },
      { appliance: Appliance.Heater, count: 1, hours: 6 },
      { appliance: Appliance.Geyser, count: 1, hours: 2 },
    ],
    rate: 6,
    days: 30,
    showWorking: true,
    showBars: true,
    canEdit: true,
    canSwap: true,
  },
  inputs: ["showWorking", "showBars", "canEdit", "canSwap"],
  invariant: (s) =>
    new Set(s.rows.map((r) => r.appliance)).size === s.rows.length
      ? undefined
      : "each appliance has one row",
  derived: {
    [BillDerived.UnitsPerDay]: {
      describe: "Units (kW h) used each day",
      compute: (s) => unitsPerDayOf(s),
    },
    [BillDerived.RowUnits]: {
      describe: "Units a day for each row, in order",
      compute: (s) => s.rows.map(rowUnitsOf),
    },
    [BillDerived.MonthUnits]: {
      describe: "Units (kW h) in the month",
      compute: (s) => monthUnitsOf(s),
    },
    [BillDerived.Cost]: { describe: "The month's bill, ₹", compute: (s) => costOf(s) },
    [BillDerived.Biggest]: {
      describe: "The appliance using the most energy, or null",
      compute: (s) => biggestOf(s),
    },
  },
  actions: {
    [BillAction.SetHours]: act({
      describe: "Change how many hours a day one row's appliances run",
      byLearner: true,
      args: z
        .object({ index: z.number().int().min(0).max(9), hours: z.number().min(0).max(24) })
        .strict(),
      run: (s, a) => {
        if (a.index >= s.rows.length) return set({});
        const rows = s.rows.map((r, i) => (i === a.index ? { ...r, hours: a.hours } : r));
        return set({ rows }, changed({ ...s, rows }));
      },
    }),
    [BillAction.SetCount]: act({
      describe: "Change how many of one row's appliance there are",
      byLearner: true,
      args: z
        .object({ index: z.number().int().min(0).max(9), count: z.number().int().min(0).max(20) })
        .strict(),
      run: (s, a) => {
        if (a.index >= s.rows.length) return set({});
        const rows = s.rows.map((r, i) => (i === a.index ? { ...r, count: a.count } : r));
        return set({ rows }, changed({ ...s, rows }));
      },
    }),
    [BillAction.Swap]: act({
      describe: "Swap a row of 100 W bulbs for 9 W LED bulbs (or back)",
      byLearner: true,
      args: z.object({ index: z.number().int().min(0).max(9) }).strict(),
      run: (s, a) => {
        const row = s.rows[a.index];
        if (
          row === undefined ||
          (row.appliance !== Appliance.Bulb && row.appliance !== Appliance.Led)
        )
          return set({});
        const to = row.appliance === Appliance.Bulb ? Appliance.Led : Appliance.Bulb;
        const rows = s.rows.map((r, i) => (i === a.index ? { ...r, appliance: to } : r));
        const next = { ...s, rows };
        return set(
          { rows },
          {
            signal: BillSignal.Swapped,
            payload: { to, units: monthUnitsOf(next), cost: costOf(next) },
          },
          changed(next),
        );
      },
    }),
    [BillAction.SetRate]: act({
      describe: "Change the price of one unit, ₹",
      byLearner: false,
      args: z.object({ rate: z.number().positive().max(50) }).strict(),
      run: (s, a) => set({ rate: a.rate }, changed({ ...s, rate: a.rate })),
    }),
  },
  signals: {
    [BillSignal.Changed]: {
      describe: "Hours, counts or the rate changed; the payload has the month's units and cost",
    },
    [BillSignal.Swapped]: { describe: "Bulbs were swapped for LEDs (or back)", isCommit: true },
  },
  observe: (s) => {
    const elements: Element[] = s.rows.map((r, i) => ({
      id: `row${i}`,
      value: `${r.count} × ${APPLIANCE_EN[r.appliance]}, ${num(r.hours)} h: ${num(rowUnitsOf(r), 2)} units a day`,
    }));
    elements.push({
      id: BillPart.Total,
      value: `${num(monthUnitsOf(s), 1)} units, ${rupees(costOf(s))}`,
    });
    return { summary: describeBill(s), elements };
  },
  parts: (s) => [
    BillPart.Table,
    ...s.rows.map((_, i) => `row${i}`),
    BillPart.Total,
    BillPart.Meter,
  ],
});
