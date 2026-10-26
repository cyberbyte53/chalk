import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { amps as ampsText, num } from "./words";

/**
 * The Ohm's law bench (NCERT 12.4).
 * - Cells mode, Activity 12.1: 1 to 4 cells of 1.5 V drive a current through a nichrome wire XY
 *   with an ammeter in series and a voltmeter across XY. Each reading can be recorded in a table,
 *   with V/I worked out, and plotted on a V–I graph: a straight line through the origin.
 * - Gap mode, Activity 12.2: four cells and an ammeter with a gap XY; whatever is put in the gap
 *   (nichrome, a torch bulb, a 10 W bulb, copper, rubber, glass) lets a different current through.
 * - Data mode: a table of readings given by the lesson (Exercise 7), plotted the same way.
 */

export const OhmAction = {
  SetCells: "setCells",
  SetKey: "setKey",
  Record: "record",
  ClearTable: "clearTable",
  PutInGap: "putInGap",
} as const;
export const OhmSignal = {
  Recorded: "recorded",
  KeySet: "keySet",
  GapFilled: "gapFilled",
} as const;
export const OhmDerived = {
  Volts: "volts",
  Amps: "amps",
  Ratio: "ratio",
  Slope: "slope",
  IsStraight: "isStraight",
  RowCount: "rowCount",
  GapAmps: "gapAmps",
  IsOverScale: "isOverScale",
} as const;
export const OhmPart = {
  Circuit: "circuit",
  Ammeter: "ammeter",
  Voltmeter: "voltmeter",
  Table: "table",
  Graph: "graph",
  Gap: "gap",
  Controls: "controls",
} as const;

export const OhmMode = { Cells: "cells", Gap: "gap", Data: "data" } as const;
export type OhmMode = (typeof OhmMode)[keyof typeof OhmMode];

/** What can go in gap XY (Activity 12.2). */
export const GapItem = {
  Empty: "empty",
  Nichrome: "nichrome",
  TorchBulb: "torchBulb",
  Bulb10W: "bulb10W",
  Copper: "copper",
  Rubber: "rubber",
  Glass: "glass",
} as const;
export type GapItem = (typeof GapItem)[keyof typeof GapItem];

/** Each item's resistance, Ω (Infinity: it lets no current through). */
export const GAP_OHMS: Readonly<Record<GapItem, number>> = {
  empty: Number.POSITIVE_INFINITY,
  nichrome: 3,
  torchBulb: 8.3,
  // A 10 W bulb made for 220 V: R = V²/P.
  bulb10W: 4840,
  copper: 0.02,
  rubber: Number.POSITIVE_INFINITY,
  glass: Number.POSITIVE_INFINITY,
};
export const GAP_ORDER: readonly GapItem[] = [
  GapItem.Nichrome,
  GapItem.TorchBulb,
  GapItem.Bulb10W,
  GapItem.Copper,
  GapItem.Rubber,
  GapItem.Glass,
];

export const CELL_VOLTS = 1.5;
export const MAX_CELLS = 4;
/** The four cells' own resistance in gap mode, so a copper wire gives a big (not endless) current. */
export const GAP_BATTERY_OHMS = 0.5;
/** The ammeter's range, A. */
export const AMMETER_MAX = 5;

const rowSchema = z
  .object({
    cells: z.number().int().min(0).max(MAX_CELLS),
    amps: z.number().min(0).max(100),
    volts: z.number().min(0).max(100),
  })
  .strict();
export type OhmRow = z.infer<typeof rowSchema>;

const ohmState = z
  .object({
    mode: z.nativeEnum(OhmMode),
    cells: z.number().int().min(1).max(MAX_CELLS),
    isKeyClosed: z.boolean(),
    /** The nichrome wire XY's resistance in cells mode, Ω. */
    wireOhms: z.number().positive().max(100),
    /** The table: recorded readings in cells mode, or the lesson's data in data mode. */
    rows: z.array(rowSchema).max(8),
    inGap: z.nativeEnum(GapItem),
    showTable: z.boolean(),
    showGraph: z.boolean(),
    /** Show the V/I column (and the line's slope on the graph). */
    showRatio: z.boolean(),
    canSetCells: z.boolean(),
    canRecord: z.boolean(),
    canChooseGap: z.boolean(),
  })
  .strict();
export type OhmState = z.infer<typeof ohmState>;

/** The voltmeter across XY (the cells are ideal in cells mode). */
export const voltsOf = (s: Pick<OhmState, "cells" | "isKeyClosed">) =>
  s.isKeyClosed ? Math.round(s.cells * CELL_VOLTS * 100) / 100 : 0;
export const ampsOf = (s: Pick<OhmState, "cells" | "isKeyClosed" | "wireOhms">) =>
  Math.round((voltsOf(s) / s.wireOhms) * 1000) / 1000;

/** The current in gap mode: four cells (6 V, 0.5 Ω inside) through whatever is in the gap. */
export function gapAmpsOf(s: Pick<OhmState, "inGap" | "isKeyClosed">): number {
  if (!s.isKeyClosed) return 0;
  const r = GAP_OHMS[s.inGap];
  if (!Number.isFinite(r)) return 0;
  return (MAX_CELLS * CELL_VOLTS) / (r + GAP_BATTERY_OHMS);
}

/** The best straight line through the origin, V = slope × I (least squares). */
export function slopeOf(rows: readonly OhmRow[]): number | null {
  const used = rows.filter((r) => r.amps > 0);
  if (used.length === 0) return null;
  const vi = used.reduce((t, r) => t + r.volts * r.amps, 0);
  const ii = used.reduce((t, r) => t + r.amps * r.amps, 0);
  return vi / ii;
}

/** Every recorded V/I within 8% of the line's slope (and at least two readings). */
export function isStraightOf(rows: readonly OhmRow[]): boolean {
  const k = slopeOf(rows);
  const used = rows.filter((r) => r.amps > 0);
  if (k === null || used.length < 2) return false;
  return used.every((r) => Math.abs(r.volts / r.amps - k) <= 0.08 * k);
}

const GAP_WORDS: Readonly<Record<GapItem, string>> = {
  empty: "nothing",
  nichrome: "a nichrome wire",
  torchBulb: "a torch bulb",
  bulb10W: "a 10 W bulb",
  copper: "a copper wire",
  rubber: "a rubber strip",
  glass: "a glass rod",
};

export function describeOhm(s: OhmState): string {
  if (s.mode === OhmMode.Data) {
    const pts = s.rows.map((r) => `(${num(r.amps)} A, ${num(r.volts)} V)`).join(", ");
    return `A table of current I and potential difference V for one resistor: ${pts}, plotted as a V–I graph${s.showRatio && slopeOf(s.rows) !== null ? `; the best straight line through the origin has V/I ≈ ${num(slopeOf(s.rows) ?? 0, 2)} Ω` : ""}.`;
  }
  if (s.mode === OhmMode.Gap) {
    const i = gapAmpsOf(s);
    const reading = !s.isKeyClosed
      ? "the key is open, so no current"
      : i === 0
        ? "the ammeter reads 0: no current flows"
        : i > AMMETER_MAX
          ? `the ammeter's needle hits the end of its 0–${AMMETER_MAX} A scale (about ${num(i, 0)} A)`
          : `the ammeter reads ${ampsText(i)}`;
    return `Four 1.5 V cells, a plug key and an ammeter in series with a gap XY; ${GAP_WORDS[s.inGap]} in the gap; ${reading}.`;
  }
  const table =
    s.showTable && s.rows.length > 0
      ? ` Table: ${s.rows.map((r) => `${r.cells} cell${r.cells === 1 ? "" : "s"}: I = ${num(r.amps)} A, V = ${num(r.volts)} V${s.showRatio && r.amps > 0 ? `, V/I = ${num(r.volts / r.amps)}` : ""}`).join("; ")}.`
      : "";
  return `Activity 12.1: ${s.cells} cell${s.cells === 1 ? "" : "s"} of 1.5 V, a plug key (${s.isKeyClosed ? "closed" : "open"}), an ammeter in series and a voltmeter across a nichrome wire XY. Ammeter: ${num(ampsOf(s), 2)} A; voltmeter: ${num(voltsOf(s), 2)} V.${table}`;
}

const act = actionsFor<OhmState>();

export const ohmLab = defineProp({
  type: "ohmLab",
  describe:
    "The Ohm's law bench (NCERT 12.4). Cells mode (Activity 12.1): 1–4 cells of 1.5 V, a plug key, an ammeter in series and a voltmeter across a nichrome wire XY; the learner adds cells, plugs the key and records each pair of readings in a table with V/I, plotted on a V–I graph, a straight line through the origin: V ∝ I, V = IR. Gap mode (Activity 12.2): four cells and an ammeter with a gap XY; putting a nichrome wire, a torch bulb, a 10 W bulb, copper, rubber or glass in the gap gives different currents (copper sends the needle off the scale, rubber and glass let none through). Data mode: a given table of readings (Exercise 7) plotted the same way.",
  state: ohmState,
  defaults: {
    mode: OhmMode.Cells,
    cells: 1,
    isKeyClosed: false,
    wireOhms: 2,
    rows: [],
    inGap: GapItem.Empty,
    showTable: true,
    showGraph: true,
    showRatio: true,
    canSetCells: true,
    canRecord: true,
    canChooseGap: true,
  },
  inputs: ["showTable", "showGraph", "showRatio", "canSetCells", "canRecord", "canChooseGap"],
  derived: {
    [OhmDerived.Volts]: {
      describe: "The voltmeter's reading across XY, V (cells mode)",
      compute: (s) => voltsOf(s),
    },
    [OhmDerived.Amps]: {
      describe: "The ammeter's reading, A (cells mode)",
      compute: (s) => ampsOf(s),
    },
    [OhmDerived.Ratio]: {
      describe: "V/I for the present reading, Ω, or null with no current",
      compute: (s) => (ampsOf(s) > 0 ? voltsOf(s) / ampsOf(s) : null),
    },
    [OhmDerived.Slope]: {
      describe: "The slope of the best straight line through the origin on the V–I graph (= R)",
      compute: (s) => slopeOf(s.rows),
    },
    [OhmDerived.IsStraight]: {
      describe:
        "At least two readings, all with nearly the same V/I: a straight line through the origin",
      compute: (s) => isStraightOf(s.rows),
    },
    [OhmDerived.RowCount]: {
      describe: "How many rows the table has",
      compute: (s) => s.rows.length,
    },
    [OhmDerived.GapAmps]: {
      describe: "The current through whatever is in gap XY, A (gap mode)",
      compute: (s) => gapAmpsOf(s),
    },
    [OhmDerived.IsOverScale]: {
      describe: "In gap mode, the current is more than the ammeter's 5 A scale",
      compute: (s) => gapAmpsOf(s) > AMMETER_MAX,
    },
  },
  actions: {
    [OhmAction.SetCells]: act({
      describe: "Use 1 to 4 cells",
      byLearner: true,
      args: z.object({ cells: z.number().int().min(1).max(MAX_CELLS) }).strict(),
      run: (_s, a) => set({ cells: a.cells }),
    }),
    [OhmAction.SetKey]: act({
      describe: "Put the plug in the key (closed) or take it out (open)",
      byLearner: true,
      args: z.object({ isClosed: z.boolean() }).strict(),
      run: (_s, a) =>
        set(
          { isKeyClosed: a.isClosed },
          { signal: OhmSignal.KeySet, payload: { isClosed: a.isClosed } },
        ),
    }),
    [OhmAction.Record]: act({
      describe:
        "Write the present ammeter and voltmeter readings in the table (one row per number of cells; again replaces it). Needs the key closed",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (!s.isKeyClosed || s.mode !== OhmMode.Cells) return set({});
        const row: OhmRow = { cells: s.cells, amps: ampsOf(s), volts: voltsOf(s) };
        const rows = [...s.rows.filter((r) => r.cells !== s.cells), row].sort(
          (a, b) => a.cells - b.cells,
        );
        return set(
          { rows },
          { signal: OhmSignal.Recorded, payload: { ...row, rowCount: rows.length } },
        );
      },
    }),
    [OhmAction.ClearTable]: act({
      describe: "Clear the table (cells mode)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => (s.mode === OhmMode.Data ? set({}) : set({ rows: [] })),
    }),
    [OhmAction.PutInGap]: act({
      describe: "Put something in gap XY (gap mode)",
      byLearner: true,
      args: z.object({ item: z.nativeEnum(GapItem) }).strict(),
      run: (s, a) =>
        set(
          { inGap: a.item },
          {
            signal: OhmSignal.GapFilled,
            payload: { item: a.item, amps: gapAmpsOf({ ...s, inGap: a.item }) },
          },
        ),
    }),
  },
  signals: {
    [OhmSignal.Recorded]: {
      describe: "A reading was written in the table; the payload has cells, amps, volts, rowCount",
    },
    [OhmSignal.KeySet]: { describe: "The plug key was put in or taken out" },
    [OhmSignal.GapFilled]: {
      describe: "Something was put in gap XY; the payload has the item and the current",
    },
  },
  observe: (s) => {
    const elements: Element[] = [];
    if (s.mode === OhmMode.Cells) {
      elements.push(
        {
          id: OhmPart.Circuit,
          value: `${s.cells} cells, key ${s.isKeyClosed ? "closed" : "open"}`,
        },
        { id: OhmPart.Ammeter, value: `${num(ampsOf(s), 2)} A` },
        { id: OhmPart.Voltmeter, value: `${num(voltsOf(s), 2)} V` },
      );
    }
    if (s.mode === OhmMode.Gap) {
      const i = gapAmpsOf(s);
      elements.push(
        { id: OhmPart.Gap, value: GAP_WORDS[s.inGap] },
        { id: OhmPart.Ammeter, value: i > AMMETER_MAX ? "off the scale" : ampsText(i) },
      );
    }
    if (s.mode !== OhmMode.Gap && s.showTable)
      elements.push({ id: OhmPart.Table, value: `${s.rows.length} rows` });
    if (s.mode !== OhmMode.Gap && s.showGraph)
      elements.push({ id: OhmPart.Graph, value: `${s.rows.length} points` });
    return { summary: describeOhm(s), elements };
  },
  parts: (s) =>
    s.mode === OhmMode.Gap
      ? [
          OhmPart.Circuit,
          OhmPart.Gap,
          OhmPart.Ammeter,
          ...(s.canChooseGap ? [OhmPart.Controls] : []),
        ]
      : s.mode === OhmMode.Data
        ? [...(s.showTable ? [OhmPart.Table] : []), ...(s.showGraph ? [OhmPart.Graph] : [])]
        : [
            OhmPart.Circuit,
            OhmPart.Ammeter,
            OhmPart.Voltmeter,
            ...(s.showTable ? [OhmPart.Table] : []),
            ...(s.showGraph ? [OhmPart.Graph] : []),
            OhmPart.Controls,
          ],
});
