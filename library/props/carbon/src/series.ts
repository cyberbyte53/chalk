import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { Group, bookFormula, chainOf, countsOf, molecularFormula, nameOf } from "./chain";
import { massOf } from "./chem";

/**
 * A homologous series (NCERT 4.2.4): the same family, one carbon longer each row. Successive
 * members differ by a –CH2– unit (14 u); the general formula holds for every row; boiling points
 * rise steadily down the series while the chemical properties stay alike.
 */

export const Series = {
  Alkanes: "alkanes",
  Alkenes: "alkenes",
  Alkynes: "alkynes",
  Alcohols: "alcohols",
  Acids: "acids",
} as const;
export type Series = (typeof Series)[keyof typeof Series];

/** Boiling points, K (standard data; NCERT Table 4.1 gives methane 111 K, ethanol 351 K). */
const BOILING: Readonly<Record<Series, readonly (number | null)[]>> = {
  alkanes: [111, 184, 231, 273, 309, 342],
  alkenes: [null, 169, 225, 267, 303, 337],
  alkynes: [null, 189, 250, 281, 313, 344],
  alcohols: [338, 351, 370, 391, 411, 431],
  acids: [374, 391, 414, 437, 459, 479],
};

export const GENERAL: Readonly<Record<Series, string>> = {
  alkanes: "CnH2n+2",
  alkenes: "CnH2n",
  alkynes: "CnH2n−2",
  alcohols: "CnH2n+1OH",
  acids: "Cn−1H2n−1COOH",
};

export type Row = {
  n: number;
  name: { en: string; hi: string };
  formula: string;
  mass: number;
  boiling: number | null;
};

/** The first member's carbon count: 1, or 2 for alkenes and alkynes. */
export const firstOf = (series: Series): number =>
  series === Series.Alkenes || series === Series.Alkynes ? 2 : 1;

export function rowsOf(series: Series, upTo: number): Row[] {
  const rows: Row[] = [];
  for (let n = firstOf(series); n <= upTo; n++) {
    const bonds = [1, 1, 1, 1, 1, 1];
    if (series === Series.Alkenes) bonds[0] = 2;
    if (series === Series.Alkynes) bonds[0] = 3;
    const group =
      series === Series.Alcohols
        ? Group.Alcohol
        : series === Series.Acids
          ? Group.Acid
          : Group.None;
    const c = chainOf({ carbons: n, bonds, group });
    rows.push({
      n,
      name: nameOf(c),
      formula: group === Group.None ? molecularFormula(c) : bookFormula(c),
      mass: massOf(countsOf(c)),
      boiling: BOILING[series][n - 1] ?? null,
    });
  }
  return rows;
}

export const SeriesAction = { Pick: "pick", Highlight: "highlight", Grow: "grow" } as const;
export const SeriesSignal = { Picked: "picked", Highlighted: "highlighted" } as const;
export const SeriesDerived = { General: "general", Rows: "rows", Step: "step" } as const;
export const SeriesPart = { Table: "table", Series: "series", Row: "row", Grow: "grow" } as const;

const seriesState = z
  .object({
    series: z.nativeEnum(Series),
    /** The last row's carbon count. */
    upTo: z.number().int().min(1).max(6),
    /** The row picked to compare with the one above it, by carbon count; null: none. */
    highlight: z.number().int().min(1).max(6).nullable(),
    showMass: z.boolean(),
    showStep: z.boolean(),
    showBoiling: z.boolean(),
    showGeneral: z.boolean(),
    /** The series the learner can switch between (empty: no switch). */
    choices: z.array(z.nativeEnum(Series)),
    canGrow: z.boolean(),
  })
  .strict();
export type SeriesState = z.infer<typeof seriesState>;

export function describeSeries(s: SeriesState): string {
  const rows = rowsOf(s.series, s.upTo);
  return `The ${s.series} as a homologous series: ${rows.map((r) => `${r.name.en} ${r.formula}`).join(", ")}. Each differs from the next by CH2 (14 u)${s.showGeneral ? `; general formula ${GENERAL[s.series]}` : ""}.`;
}

const act = actionsFor<SeriesState>();

export const homologousSeries = defineProp({
  type: "homologousSeries",
  describe:
    "A homologous series as a ladder of rows (alkanes, alkenes, alkynes, alcohols, carboxylic acids), one carbon longer each row: name, formula, molecular mass, the –CH2– / 14 u step between rows, boiling points rising steadily, and the general formula (CnH2n+2, CnH2n, CnH2n−2).",
  state: seriesState,
  defaults: {
    series: Series.Alkanes,
    upTo: 6,
    highlight: null,
    showMass: true,
    showStep: true,
    showBoiling: false,
    showGeneral: false,
    choices: [],
    canGrow: false,
  },
  inputs: ["showMass", "showStep", "showBoiling", "showGeneral", "choices", "canGrow"],
  invariant: (s) => {
    if (s.upTo < firstOf(s.series)) return "the series must show at least its first member";
    if (s.highlight !== null && (s.highlight <= firstOf(s.series) || s.highlight > s.upTo))
      return "the highlighted row must have a row above it";
    if (s.choices.length > 0 && !s.choices.includes(s.series)) return "series must be a choice";
    return undefined;
  },
  derived: {
    [SeriesDerived.General]: { describe: "The general formula", compute: (s) => GENERAL[s.series] },
    [SeriesDerived.Rows]: {
      describe: "Each row: carbons, name, formula, mass (u), boiling point (K)",
      compute: (s) => rowsOf(s.series, s.upTo).map((r) => ({ ...r, name: r.name.en })),
    },
    [SeriesDerived.Step]: { describe: "Mass difference between rows, u", compute: () => 14 },
  },
  actions: {
    [SeriesAction.Pick]: act({
      describe: "Show another of the offered series",
      byLearner: true,
      args: z.object({ series: z.nativeEnum(Series) }).strict(),
      run: (s, a) =>
        s.choices.includes(a.series)
          ? set(
              { series: a.series, highlight: null, upTo: Math.max(s.upTo, firstOf(a.series)) },
              { signal: SeriesSignal.Picked, payload: { series: a.series } },
            )
          : set({}),
    }),
    [SeriesAction.Highlight]: act({
      describe: "Compare a row with the one above it (by its carbon count)",
      byLearner: true,
      args: z.object({ n: z.number().int().min(1).max(6) }).strict(),
      run: (s, a) =>
        a.n > firstOf(s.series) && a.n <= s.upTo
          ? set({ highlight: a.n }, { signal: SeriesSignal.Highlighted, payload: { n: a.n } })
          : set({}),
    }),
    [SeriesAction.Grow]: act({
      describe: "Add the next member (up to 6 carbons)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => set({ upTo: Math.min(6, s.upTo + 1) }),
    }),
  },
  signals: {
    [SeriesSignal.Picked]: { describe: "Switched to `series`" },
    [SeriesSignal.Highlighted]: { describe: "Row `n` compared with the row above" },
  },
  observe: (s) => ({
    summary: describeSeries(s),
    elements: [
      {
        id: SeriesPart.Table,
        value: rowsOf(s.series, s.upTo).map((r) => `${r.formula} ${r.mass} u`),
      },
    ],
  }),
  parts: (s) => [
    SeriesPart.Table,
    SeriesPart.Row,
    ...(s.choices.length > 0 ? [SeriesPart.Series] : []),
    ...(s.canGrow ? [SeriesPart.Grow] : []),
  ],
});
