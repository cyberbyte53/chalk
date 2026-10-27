import { localizedSchema } from "@chalk/content";
import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { amps as ampsText, num, ohms as ohmsText } from "./words";

/**
 * Resistors (or bulbs) joined to a battery (NCERT 12.6): in series (end to end, Fig 12.6), in
 * parallel (between the same two points X and Y, Fig 12.7), or mixed (two in parallel, in series
 * with three in parallel, Fig 12.12). An ammeter can sit in the main line or next to any one part;
 * a voltmeter can go across the whole combination or across one part. A bulb can be broken
 * (fused): in series everything stops, in parallel the others carry on.
 */

export const ComboAction = {
  SetOhms: "setOhms",
  SetVolts: "setVolts",
  MoveAmmeter: "moveAmmeter",
  MoveVoltmeter: "moveVoltmeter",
  ToggleBreak: "toggleBreak",
} as const;
export const ComboSignal = { Changed: "changed", Broken: "broken" } as const;
export const ComboDerived = {
  Equivalent: "equivalent",
  TotalCurrent: "totalCurrent",
  Currents: "currents",
  Voltages: "voltages",
  Powers: "powers",
  Glow: "glow",
  AmmeterReading: "ammeterReading",
  VoltmeterReading: "voltmeterReading",
} as const;
export const ComboPart = {
  Battery: "battery",
  Ammeter: "ammeter",
  Voltmeter: "voltmeter",
  Readout: "readout",
  Controls: "controls",
} as const;

export const ComboMode = { Series: "series", Parallel: "parallel", Mixed: "mixed" } as const;
export type ComboMode = (typeof ComboMode)[keyof typeof ComboMode];

export const PartKind = { Resistor: "resistor", Bulb: "bulb" } as const;
export type PartKind = (typeof PartKind)[keyof typeof PartKind];

/** The values the learner can step a resistor through, Ω. */
export const OHM_STEPS: readonly number[] = [
  1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 24, 30, 40, 50, 60, 100, 500, 1200,
];
/** Where the ammeter is: the main line, or next to part i. */
export const MAIN = -1;

const partSchema = z
  .object({
    ohms: z.number().positive().max(100_000),
    kind: z.nativeEnum(PartKind),
    isBroken: z.boolean(),
    /** The lesson's name for it (R₁, "lamp"), or the default R₁, R₂, … */
    label: localizedSchema.optional(),
  })
  .strict();
export type ComboItem = z.infer<typeof partSchema>;

const comboState = z
  .object({
    mode: z.nativeEnum(ComboMode),
    /** Series and parallel: 1 to 3 parts. Mixed: exactly 5 (the first 2 in parallel, then 3). */
    parts: z.array(partSchema).min(1).max(5),
    volts: z.number().positive().max(240),
    /** −1: the main line; i: next to part i (in its branch, in parallel). */
    ammeterAt: z.number().int().min(-1).max(4),
    /** −1: across the whole combination (X to Y); i: across part i; null: no voltmeter. */
    voltmeterAcross: z.number().int().min(-1).max(4).nullable(),
    /** Write each part's current and voltage beside it. */
    showValues: z.boolean(),
    /** Show the equivalent resistance and total current. */
    showEquivalent: z.boolean(),
    canEdit: z.boolean(),
    canMoveMeters: z.boolean(),
    canBreak: z.boolean(),
  })
  .strict();
export type ComboState = z.infer<typeof comboState>;

const rOf = (p: ComboItem) => (p.isBroken ? Number.POSITIVE_INFINITY : p.ohms);
/** Parallel resistance of some branches (Infinity for an open branch). */
function parallel(rs: readonly number[]): number {
  const g = rs.reduce((t, r) => t + (Number.isFinite(r) ? 1 / r : 0), 0);
  return g === 0 ? Number.POSITIVE_INFINITY : 1 / g;
}
const series = (rs: readonly number[]) => rs.reduce((t, r) => t + r, 0);

/** The groups of part indices that sit in parallel, the groups themselves in series. */
export function groupsOf(s: Pick<ComboState, "mode" | "parts">): number[][] {
  const all = s.parts.map((_, i) => i);
  if (s.mode === ComboMode.Series) return all.map((i) => [i]);
  if (s.mode === ComboMode.Parallel) return [all];
  return [all.slice(0, 2), all.slice(2)];
}

export type ComboSolution = {
  equivalent: number;
  total: number;
  currents: number[];
  voltages: number[];
  powers: number[];
};

export function solve(s: Pick<ComboState, "mode" | "parts" | "volts">): ComboSolution {
  const groups = groupsOf(s);
  const groupR = groups.map((g) => parallel(g.map((i) => rOf(s.parts[i] as ComboItem))));
  const equivalent = series(groupR);
  const total = Number.isFinite(equivalent) ? s.volts / equivalent : 0;
  const currents = s.parts.map(() => 0);
  const voltages = s.parts.map(() => 0);
  groups.forEach((g, gi) => {
    const v = Number.isFinite(groupR[gi] as number) ? total * (groupR[gi] as number) : 0;
    for (const i of g) {
      const r = rOf(s.parts[i] as ComboItem);
      voltages[i] = total === 0 ? 0 : v;
      currents[i] = Number.isFinite(r) && total > 0 ? v / r : 0;
    }
  });
  // With one group broken open, the whole battery voltage appears across that gap (no current).
  const open = groups.filter((_, gi) => !Number.isFinite(groupR[gi] as number));
  if (total === 0 && open.length === 1) for (const i of open[0] as number[]) voltages[i] = s.volts;
  const powers = currents.map((i, k) => i * (voltages[k] as number));
  return { equivalent, total, currents, voltages, powers };
}

/** A bulb's glow, 0–1: its power against what it would take alone on the battery (square-rooted). */
export function glowOf(s: Pick<ComboState, "mode" | "parts" | "volts">): number[] {
  const { powers } = solve(s);
  return s.parts.map((p, i) => {
    if (p.kind !== PartKind.Bulb || p.isBroken) return 0;
    const alone = (s.volts * s.volts) / p.ohms;
    return Math.min(1, Math.sqrt((powers[i] as number) / alone));
  });
}

export function ammeterReadingOf(s: ComboState): number {
  const sol = solve(s);
  if (s.ammeterAt === MAIN || s.ammeterAt >= s.parts.length) return sol.total;
  return sol.currents[s.ammeterAt] ?? 0;
}
export function voltmeterReadingOf(s: ComboState): number | null {
  if (s.voltmeterAcross === null) return null;
  const sol = solve(s);
  // Across the whole combination it reads the (ideal) battery's voltage, current or not.
  if (s.voltmeterAcross === MAIN || s.voltmeterAcross >= s.parts.length) return s.volts;
  return sol.voltages[s.voltmeterAcross] ?? 0;
}

export const partName = (s: Pick<ComboState, "parts">, i: number, locale: "en" | "hi" = "en") =>
  s.parts[i]?.label?.[locale] ?? `R${"₁₂₃₄₅"[i] ?? ""}`;

export function describeCombo(s: ComboState): string {
  const sol = solve(s);
  const how =
    s.mode === ComboMode.Series
      ? "joined end to end, in series"
      : s.mode === ComboMode.Parallel
        ? "joined between the same two points X and Y, in parallel"
        : "two in parallel, in series with three in parallel";
  const list = s.parts
    .map(
      (p, i) =>
        `${partName(s, i)} = ${num(p.ohms)} Ω${p.kind === PartKind.Bulb ? " (a bulb)" : ""}${p.isBroken ? " (broken)" : ""}${s.showValues ? `: I = ${num(sol.currents[i] ?? 0, 3)} A, V = ${num(sol.voltages[i] ?? 0, 2)} V` : ""}`,
    )
    .join("; ");
  const eq = s.showEquivalent
    ? ` Equivalent resistance ${Number.isFinite(sol.equivalent) ? ohmsText(sol.equivalent) : "infinite (the circuit is broken)"}; current from the battery ${ampsText(sol.total)}.`
    : "";
  const am = ` The ammeter, ${s.ammeterAt === MAIN ? "in the main line" : `next to ${partName(s, s.ammeterAt)}`}, reads ${num(ammeterReadingOf(s), 3)} A.`;
  const vm =
    s.voltmeterAcross === null
      ? ""
      : ` The voltmeter across ${s.voltmeterAcross === MAIN ? "the whole combination" : partName(s, s.voltmeterAcross)} reads ${num(voltmeterReadingOf(s) ?? 0, 2)} V.`;
  return `A ${num(s.volts)} V battery with ${s.parts.length} part${s.parts.length === 1 ? "" : "s"} ${how}: ${list}.${eq}${am}${vm}`;
}

const act = actionsFor<ComboState>();
const changed = (s: ComboState) => ({
  signal: ComboSignal.Changed,
  payload: {
    equivalent: solve(s).equivalent,
    total: solve(s).total,
    ammeter: ammeterReadingOf(s),
    voltmeter: voltmeterReadingOf(s),
  },
});

export const resistorCombo = defineProp({
  type: "resistorCombo",
  describe:
    "Resistors or bulbs joined to a battery (NCERT 12.6): in series (end to end: the same current through each, V = V₁ + V₂ + V₃, Rs = R₁ + R₂ + R₃), in parallel (the same voltage across each, I = I₁ + I₂ + I₃, 1/Rp = 1/R₁ + 1/R₂ + 1/R₃), or mixed (two in parallel in series with three in parallel, Example 12.9). An ammeter in the main line or next to any part, a voltmeter across the whole or across one part; the learner can move the meters, change values, and break a bulb (in series all go out, in parallel the rest stay lit).",
  state: comboState,
  defaults: {
    mode: ComboMode.Series,
    parts: [
      { ohms: 1, kind: PartKind.Resistor, isBroken: false },
      { ohms: 2, kind: PartKind.Resistor, isBroken: false },
      { ohms: 3, kind: PartKind.Resistor, isBroken: false },
    ],
    volts: 6,
    ammeterAt: MAIN,
    voltmeterAcross: null,
    showValues: false,
    showEquivalent: false,
    canEdit: false,
    canMoveMeters: true,
    canBreak: false,
  },
  inputs: ["showValues", "showEquivalent", "canEdit", "canMoveMeters", "canBreak"],
  invariant: (s) =>
    s.mode === ComboMode.Mixed
      ? s.parts.length === 5
        ? undefined
        : "a mixed combination has exactly 5 parts"
      : s.parts.length <= 3
        ? undefined
        : "series and parallel take 1 to 3 parts",
  derived: {
    [ComboDerived.Equivalent]: {
      describe: "The equivalent resistance of the combination, Ω (Infinity when it is broken open)",
      compute: (s) => solve(s).equivalent,
    },
    [ComboDerived.TotalCurrent]: {
      describe: "The current from the battery, A",
      compute: (s) => solve(s).total,
    },
    [ComboDerived.Currents]: {
      describe: "The current through each part, A, in order",
      compute: (s) => solve(s).currents,
    },
    [ComboDerived.Voltages]: {
      describe: "The potential difference across each part, V, in order",
      compute: (s) => solve(s).voltages,
    },
    [ComboDerived.Powers]: {
      describe: "The power each part uses, W, in order",
      compute: (s) => solve(s).powers,
    },
    [ComboDerived.Glow]: {
      describe: "Each bulb's glow from 0 (dark) to 1 (as bright as alone on the battery)",
      compute: (s) => glowOf(s),
    },
    [ComboDerived.AmmeterReading]: {
      describe: "What the ammeter reads, A",
      compute: (s) => ammeterReadingOf(s),
    },
    [ComboDerived.VoltmeterReading]: {
      describe: "What the voltmeter reads, V (null with no voltmeter)",
      compute: (s) => voltmeterReadingOf(s),
    },
  },
  actions: {
    [ComboAction.SetOhms]: act({
      describe: "Change one part's resistance",
      byLearner: true,
      args: z
        .object({ index: z.number().int().min(0).max(4), ohms: z.number().positive().max(100_000) })
        .strict(),
      run: (s, a) => {
        if (a.index >= s.parts.length) return set({});
        const parts = s.parts.map((p, i) => (i === a.index ? { ...p, ohms: a.ohms } : p));
        return set({ parts }, changed({ ...s, parts }));
      },
    }),
    [ComboAction.SetVolts]: act({
      describe: "Change the battery's voltage",
      byLearner: false,
      args: z.object({ volts: z.number().positive().max(240) }).strict(),
      run: (s, a) => set({ volts: a.volts }, changed({ ...s, volts: a.volts })),
    }),
    [ComboAction.MoveAmmeter]: act({
      describe: "Put the ammeter in the main line (−1) or next to part i",
      byLearner: true,
      args: z.object({ at: z.number().int().min(-1).max(4) }).strict(),
      run: (s, a) => {
        const at = a.at >= s.parts.length ? MAIN : a.at;
        return set({ ammeterAt: at }, changed({ ...s, ammeterAt: at }));
      },
    }),
    [ComboAction.MoveVoltmeter]: act({
      describe: "Put the voltmeter across the whole combination (−1) or across part i",
      byLearner: true,
      args: z.object({ across: z.number().int().min(-1).max(4) }).strict(),
      run: (s, a) => {
        const across = a.across >= s.parts.length ? MAIN : a.across;
        return set({ voltmeterAcross: across }, changed({ ...s, voltmeterAcross: across }));
      },
    }),
    [ComboAction.ToggleBreak]: act({
      describe: "Break a bulb (its filament fuses) or mend it",
      byLearner: true,
      args: z.object({ index: z.number().int().min(0).max(4) }).strict(),
      run: (s, a) => {
        if (a.index >= s.parts.length) return set({});
        const parts = s.parts.map((p, i) => (i === a.index ? { ...p, isBroken: !p.isBroken } : p));
        const next = { ...s, parts };
        return set(
          { parts },
          {
            signal: ComboSignal.Broken,
            payload: {
              index: a.index,
              isBroken: parts[a.index]?.isBroken ?? false,
              lit: glowOf(next).filter((g) => g > 0).length,
            },
          },
          changed(next),
        );
      },
    }),
  },
  signals: {
    [ComboSignal.Changed]: {
      describe:
        "Something changed; the payload has the equivalent resistance, current and meter readings",
    },
    [ComboSignal.Broken]: {
      describe:
        "A bulb was broken or mended; the payload has which, and how many bulbs are still lit",
    },
  },
  observe: (s) => {
    const sol = solve(s);
    const elements: Element[] = [
      { id: ComboPart.Battery, value: `${num(s.volts)} V` },
      ...s.parts.map((p, i) => ({
        id: `part${i}`,
        value: `${partName(s, i)} ${num(p.ohms)} Ω${p.isBroken ? " broken" : ""}${s.showValues ? `, ${num(sol.currents[i] ?? 0, 3)} A, ${num(sol.voltages[i] ?? 0, 2)} V` : ""}`,
      })),
      { id: ComboPart.Ammeter, value: `${num(ammeterReadingOf(s), 3)} A` },
    ];
    if (s.voltmeterAcross !== null)
      elements.push({ id: ComboPart.Voltmeter, value: `${num(voltmeterReadingOf(s) ?? 0, 2)} V` });
    if (s.showEquivalent)
      elements.push({
        id: ComboPart.Readout,
        value: `R = ${Number.isFinite(sol.equivalent) ? ohmsText(sol.equivalent) : "∞"}, I = ${ampsText(sol.total)}`,
      });
    return {
      summary: describeCombo(s),
      elements,
      hidden: s.showEquivalent ? {} : { equivalent: sol.equivalent, total: sol.total },
    };
  },
  parts: (s) => [
    ComboPart.Battery,
    ...s.parts.map((_, i) => `part${i}`),
    ComboPart.Ammeter,
    ...(s.voltmeterAcross !== null ? [ComboPart.Voltmeter] : []),
    ...(s.showEquivalent ? [ComboPart.Readout] : []),
    ...(s.canEdit || s.canMoveMeters || s.canBreak ? [ComboPart.Controls] : []),
  ],
});
