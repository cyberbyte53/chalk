import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { ELEMENTS, RADII, configOf, element, shellsOf, valenceOf, valencyOf } from "./elements";

/**
 * The Modern Periodic Table (NCERT 5.3): elements in order of atomic number, 18 groups and
 * 7 periods. On a phone it starts with the first 20 elements in eight short columns (groups 1, 2,
 * 13–18); the full table shows all 118 as small tiles, with the two inner rows below. Tapping an
 * element shows its card (atomic number, group, period, shells, valence electrons, valency, metal
 * or not). A trend view colours the table: metals and non-metals, valency, atomic size, metallic
 * character or electronegativity, each with the direction it changes.
 */

export const Layout = { Short: "short", Full: "full" } as const;
export type Layout = (typeof Layout)[keyof typeof Layout];

export const Trend = {
  None: "none",
  Kind: "kind",
  Valency: "valency",
  Size: "size",
  Metallic: "metallic",
  Electronegativity: "electronegativity",
} as const;
export type Trend = (typeof Trend)[keyof typeof Trend];

/** The columns of the short table: groups 1, 2, 13–18. */
export const SHORT_GROUPS = [1, 2, 13, 14, 15, 16, 17, 18] as const;
export const SHORT_MAX_Z = 20;

/** The elements a layout draws. */
export function elementsIn(layout: Layout): number[] {
  return layout === Layout.Short
    ? ELEMENTS.filter((e) => e.z <= SHORT_MAX_Z).map((e) => e.z)
    : ELEMENTS.map((e) => e.z);
}

export const ModernAction = {
  Tap: "tap",
  SetTrend: "setTrend",
  SetLayout: "setLayout",
  Highlight: "highlight",
  Clear: "clear",
} as const;
export const ModernSignal = {
  Tapped: "tapped",
  TrendSet: "trendSet",
  Highlighted: "highlighted",
} as const;
export const ModernDerived = {
  Symbol: "symbol",
  Group: "group",
  Period: "period",
  Config: "config",
  Valence: "valence",
  Valency: "valency",
  Kind: "kind",
  Radius: "radius",
  Shells: "shells",
  SameGroup: "sameGroup",
  SamePeriod: "samePeriod",
} as const;
export const ModernPart = {
  Table: "table",
  Card: "card",
  Shells: "shells",
  Trends: "trends",
  Legend: "legend",
  Layouts: "layouts",
} as const;

const modernState = z
  .object({
    layout: z.nativeEnum(Layout),
    /** The tapped element's atomic number, or null. */
    selected: z.number().int().min(1).max(118).nullable(),
    trend: z.nativeEnum(Trend),
    /** Trends the learner may switch between; empty: none offered. */
    trends: z.array(z.nativeEnum(Trend)),
    highlightGroup: z.number().int().min(1).max(18).nullable(),
    highlightPeriod: z.number().int().min(1).max(7).nullable(),
    showShells: z.boolean(),
    canTap: z.boolean(),
    canSetLayout: z.boolean(),
  })
  .strict();
export type ModernState = z.infer<typeof modernState>;

const TREND_WORDS: Record<Trend, string> = {
  none: "",
  kind: "Metals are on the left, non-metals on the right, metalloids along the zig-zag between them.",
  valency:
    "Valency: across a period it rises 1, 2, 3, 4 then falls 3, 2, 1, 0; down a group it stays the same.",
  size: "Atomic size: decreases across a period, increases down a group.",
  metallic: "Metallic character: decreases across a period, increases down a group.",
  electronegativity:
    "Tendency to gain electrons (non-metallic character): increases across a period, decreases down a group.",
};

export function sameGroup(z: number, layout: Layout): string[] {
  const g = element(z).group;
  if (g === null) return [];
  return elementsIn(layout)
    .map(element)
    .filter((e) => e.group === g)
    .map((e) => e.symbol);
}

export function samePeriod(z: number, layout: Layout): string[] {
  const p = element(z).period;
  return elementsIn(layout)
    .map(element)
    .filter((e) => e.period === p)
    .map((e) => e.symbol);
}

export function describeModern(s: ModernState): string {
  const base =
    s.layout === Layout.Short
      ? "The first 20 elements of the Modern Periodic Table, in order of atomic number: groups 1, 2 and 13–18, periods 1–4."
      : "The Modern Periodic Table: all 118 elements in 18 groups and 7 periods, the lanthanoids and actinoids in two rows below.";
  const trend = s.trend === Trend.None ? "" : ` ${TREND_WORDS[s.trend]}`;
  let card = "";
  if (s.selected !== null) {
    const e = element(s.selected);
    const config = configOf(e.z);
    card = ` ${e.name.en} (${e.symbol}), atomic number ${e.z}: ${e.group === null ? "an inner-row element" : `group ${e.group}`}, period ${e.period}${config === null ? "" : `, electrons ${config}, valency ${valencyOf(e.z)}`}; a ${e.kind === "nonMetal" ? "non-metal" : e.kind}.`;
  }
  const hl =
    (s.highlightGroup === null ? "" : ` Group ${s.highlightGroup} is lit.`) +
    (s.highlightPeriod === null ? "" : ` Period ${s.highlightPeriod} is lit.`);
  return base + trend + card + hl;
}

const act = actionsFor<ModernState>();

export const periodicTable = defineProp({
  type: "periodicTable",
  describe:
    "The Modern Periodic Table. Layout 'short' shows elements 1–20 in groups 1, 2, 13–18 (phone friendly); 'full' shows all 118 with the inner rows below. Tap an element for its card: atomic number, group, period, shells (first 20), valence electrons, valency, metal/metalloid/non-metal, NCERT's atomic radius where given. A trend colours the table (kind, valency, atomic size, metallic character, electronegativity). A group or period can be highlighted.",
  state: modernState,
  defaults: {
    layout: Layout.Short,
    selected: null,
    trend: Trend.None,
    trends: [],
    highlightGroup: null,
    highlightPeriod: null,
    showShells: true,
    canTap: true,
    canSetLayout: false,
  },
  inputs: [
    "layout",
    "trends",
    "highlightGroup",
    "highlightPeriod",
    "showShells",
    "canTap",
    "canSetLayout",
  ],
  derived: {
    [ModernDerived.Symbol]: {
      describe: "The tapped element's symbol, or null",
      compute: (s) => (s.selected === null ? null : element(s.selected).symbol),
    },
    [ModernDerived.Group]: {
      describe: "The tapped element's group (1–18; null for inner-row elements or none)",
      compute: (s) => (s.selected === null ? null : element(s.selected).group),
    },
    [ModernDerived.Period]: {
      describe: "The tapped element's period (1–7), or null",
      compute: (s) => (s.selected === null ? null : element(s.selected).period),
    },
    [ModernDerived.Config]: {
      describe: "Electronic configuration as NCERT writes it (e.g. '2, 8, 2'); first 20 only",
      compute: (s) => (s.selected === null ? null : configOf(s.selected)),
    },
    [ModernDerived.Valence]: {
      describe: "Electrons in the outermost shell (first 20 only)",
      compute: (s) => (s.selected === null ? null : valenceOf(s.selected)),
    },
    [ModernDerived.Valency]: {
      describe: "Valency from the outer electrons (first 20 only)",
      compute: (s) => (s.selected === null ? null : valencyOf(s.selected)),
    },
    [ModernDerived.Kind]: {
      describe: "metal, metalloid or nonMetal",
      compute: (s) => (s.selected === null ? null : element(s.selected).kind),
    },
    [ModernDerived.Radius]: {
      describe: "Atomic radius in pm where NCERT gives one, else null",
      compute: (s) => (s.selected === null ? null : (RADII[element(s.selected).symbol] ?? null)),
    },
    [ModernDerived.Shells]: {
      describe: "How many shells hold electrons (first 20 only)",
      compute: (s) => (s.selected === null ? null : (shellsOf(s.selected)?.length ?? null)),
    },
    [ModernDerived.SameGroup]: {
      describe: "Symbols in the tapped element's group, in this layout",
      compute: (s) => (s.selected === null ? [] : sameGroup(s.selected, s.layout)),
    },
    [ModernDerived.SamePeriod]: {
      describe: "Symbols in the tapped element's period, in this layout",
      compute: (s) => (s.selected === null ? [] : samePeriod(s.selected, s.layout)),
    },
  },
  actions: {
    [ModernAction.Tap]: act({
      describe: "Tap an element (atomic number) to see its card",
      byLearner: true,
      args: z.object({ z: z.number().int().min(1).max(118) }).strict(),
      run: (s, a) => {
        if (!s.canTap || !elementsIn(s.layout).includes(a.z)) return set({});
        const e = element(a.z);
        return set(
          { selected: a.z },
          {
            signal: ModernSignal.Tapped,
            payload: { z: a.z, symbol: e.symbol, group: e.group, period: e.period },
          },
        );
      },
    }),
    [ModernAction.SetTrend]: act({
      describe: "Colour the table by a trend (one of `trends`)",
      byLearner: true,
      args: z.object({ trend: z.nativeEnum(Trend) }).strict(),
      run: (s, a) =>
        a.trend === Trend.None || s.trends.includes(a.trend)
          ? set({ trend: a.trend }, { signal: ModernSignal.TrendSet, payload: { trend: a.trend } })
          : set({}),
    }),
    [ModernAction.SetLayout]: act({
      describe: "Switch between the first 20 and the full table",
      byLearner: true,
      args: z.object({ layout: z.nativeEnum(Layout) }).strict(),
      run: (s, a) => {
        if (!s.canSetLayout) return set({});
        const keep = s.selected !== null && elementsIn(a.layout).includes(s.selected);
        return set({ layout: a.layout, selected: keep ? s.selected : null });
      },
    }),
    [ModernAction.Highlight]: act({
      describe: "Light a group and/or a period (null clears it)",
      byLearner: true,
      args: z
        .object({
          group: z.number().int().min(1).max(18).nullable(),
          period: z.number().int().min(1).max(7).nullable(),
        })
        .strict(),
      run: (_s, a) =>
        set(
          { highlightGroup: a.group, highlightPeriod: a.period },
          { signal: ModernSignal.Highlighted, payload: { group: a.group, period: a.period } },
        ),
    }),
    [ModernAction.Clear]: act({
      describe: "Close the element card",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ selected: null }),
    }),
  },
  signals: {
    [ModernSignal.Tapped]: {
      describe: "An element was tapped: `symbol`, its `group` and `period`",
    },
    [ModernSignal.TrendSet]: { describe: "The table is coloured by `trend`" },
    [ModernSignal.Highlighted]: { describe: "A `group` and/or `period` is lit" },
  },
  observe: (s) => ({
    summary: describeModern(s),
    elements: [
      ...(s.selected === null
        ? []
        : [
            {
              id: ModernPart.Card,
              value: `${element(s.selected).symbol}: group ${element(s.selected).group ?? "-"}, period ${element(s.selected).period}${configOf(s.selected) === null ? "" : `, ${configOf(s.selected)}`}`,
            },
          ]),
      ...(s.trend === Trend.None ? [] : [{ id: ModernPart.Legend, value: TREND_WORDS[s.trend] }]),
    ],
  }),
  parts: (s) => [
    ModernPart.Table,
    ...(s.selected === null ? [] : [ModernPart.Card]),
    ...(s.selected !== null && s.showShells && s.selected <= SHORT_MAX_Z
      ? [ModernPart.Shells]
      : []),
    ...(s.trends.length > 0 ? [ModernPart.Trends] : []),
    ...(s.trend === Trend.None ? [] : [ModernPart.Legend]),
    ...(s.canSetLayout ? [ModernPart.Layouts] : []),
  ],
});
