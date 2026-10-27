import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Mendeléev's Periodic Table (NCERT 5.2, Table 5.4), simplified for a phone: groups I–VIII with
 * the oxide and hydride formulae at the head of each (R stands for any element of the group), and
 * eight rows of elements in order of increasing atomic mass. Three gaps hold the elements he
 * predicted (eka-boron, eka-aluminium, eka-silicon), later found as scandium, gallium and germanium.
 * Modes: the table itself; predict (Table 5.5, eka-aluminium against gallium); anomalies (cobalt
 * before nickel, hydrogen with no fixed place, the isotopes of chlorine).
 */

export const GROUP_NAMES = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"] as const;
export const OXIDES = ["R2O", "RO", "R2O3", "RO2", "R2O5", "RO3", "R2O7", "RO4"] as const;
export const HYDRIDES = ["RH", "RH2", "RH3", "RH4", "RH3", "RH2", "RH", ""] as const;

export const Gap = {
  EkaBoron: "ekaBoron",
  EkaAluminium: "ekaAluminium",
  EkaSilicon: "ekaSilicon",
} as const;
export type Gap = (typeof Gap)[keyof typeof Gap];

/** What filled each gap, and the mass Mendeléev left for it. */
export const GAPS: Readonly<Record<Gap, { predicted: number; found: string; mass: number }>> = {
  ekaBoron: { predicted: 44, found: "Sc", mass: 45.0 },
  ekaAluminium: { predicted: 68, found: "Ga", mass: 69.7 },
  ekaSilicon: { predicted: 72, found: "Ge", mass: 72.6 },
};

/** A slot: an element with the mass of the time, a gap, or nothing. Group VIII holds three. */
export type Slot = { symbol: string; mass: number } | { gap: Gap } | null;

/** Rows of the table; each row has 8 entries, and entry 7 (group VIII) may be a list of three. */
export const MENDELEEV_ROWS: readonly (readonly (Slot | readonly Slot[])[])[] = [
  [{ symbol: "H", mass: 1 }, null, null, null, null, null, null, null],
  [
    { symbol: "Li", mass: 7 },
    { symbol: "Be", mass: 9.4 },
    { symbol: "B", mass: 11 },
    { symbol: "C", mass: 12 },
    { symbol: "N", mass: 14 },
    { symbol: "O", mass: 16 },
    { symbol: "F", mass: 19 },
    null,
  ],
  [
    { symbol: "Na", mass: 23 },
    { symbol: "Mg", mass: 24 },
    { symbol: "Al", mass: 27.3 },
    { symbol: "Si", mass: 28 },
    { symbol: "P", mass: 31 },
    { symbol: "S", mass: 32 },
    { symbol: "Cl", mass: 35.5 },
    null,
  ],
  [
    { symbol: "K", mass: 39 },
    { symbol: "Ca", mass: 40 },
    { gap: Gap.EkaBoron },
    { symbol: "Ti", mass: 48 },
    { symbol: "V", mass: 51 },
    { symbol: "Cr", mass: 52 },
    { symbol: "Mn", mass: 55 },
    [
      { symbol: "Fe", mass: 56 },
      { symbol: "Co", mass: 58.9 },
      { symbol: "Ni", mass: 58.7 },
    ],
  ],
  [
    { symbol: "Cu", mass: 63 },
    { symbol: "Zn", mass: 65 },
    { gap: Gap.EkaAluminium },
    { gap: Gap.EkaSilicon },
    { symbol: "As", mass: 75 },
    { symbol: "Se", mass: 78 },
    { symbol: "Br", mass: 80 },
    null,
  ],
  [
    { symbol: "Rb", mass: 85 },
    { symbol: "Sr", mass: 87 },
    { symbol: "Y", mass: 88 },
    { symbol: "Zr", mass: 90 },
    { symbol: "Nb", mass: 94 },
    { symbol: "Mo", mass: 96 },
    null,
    [
      { symbol: "Ru", mass: 104 },
      { symbol: "Rh", mass: 104 },
      { symbol: "Pd", mass: 106 },
    ],
  ],
  [
    { symbol: "Ag", mass: 108 },
    { symbol: "Cd", mass: 112 },
    { symbol: "In", mass: 113 },
    { symbol: "Sn", mass: 118 },
    { symbol: "Sb", mass: 122 },
    { symbol: "Te", mass: 125 },
    { symbol: "I", mass: 127 },
    null,
  ],
  [{ symbol: "Cs", mass: 133 }, { symbol: "Ba", mass: 137 }, null, null, null, null, null, null],
];

/** The noble gases, added later as a new group (0) without disturbing the order. */
export const NOBLE = ["He", "Ne", "Ar", "Kr", "Xe"] as const;

/** Mendeléev's group (0-based, I = 0) of a symbol in this table, or null. */
export function mendeleevGroupOf(symbol: string): number | null {
  for (const row of MENDELEEV_ROWS)
    for (let g = 0; g < row.length; g++) {
      const slot = row[g];
      const slots = Array.isArray(slot) ? slot : [slot];
      for (const x of slots as Slot[])
        if (x !== null && "symbol" in x && x.symbol === symbol) return g;
    }
  return null;
}

/** Puts a symbol into a group formula: K in R2O → K2O. */
export function fill(template: string, symbol: string): string {
  return template.replace("R", symbol);
}

/** The oxide Mendeléev's table predicts for an element, e.g. Al → Al2O3. */
export function oxideOf(symbol: string): string | null {
  const g = mendeleevGroupOf(symbol);
  return g === null ? null : fill(OXIDES[g] as string, symbol);
}

export function hydrideOf(symbol: string): string | null {
  const g = mendeleevGroupOf(symbol);
  if (g === null) return null;
  const h = HYDRIDES[g] as string;
  return h === "" ? null : fill(h, symbol);
}

export const MendeleevMode = {
  Table: "table",
  Predict: "predict",
  Anomalies: "anomalies",
} as const;
export type MendeleevMode = (typeof MendeleevMode)[keyof typeof MendeleevMode];

export const Anomaly = { CoNi: "coNi", Hydrogen: "hydrogen", Isotopes: "isotopes" } as const;
export type Anomaly = (typeof Anomaly)[keyof typeof Anomaly];

/** Table 5.5: what Mendeléev predicted for eka-aluminium and what gallium turned out to be. */
export const EKA_ALUMINIUM_TABLE = [
  { property: { en: "Atomic mass", hi: "परमाणु द्रव्यमान" }, eka: "68", gallium: "69.7" },
  { property: { en: "Formula of oxide", hi: "ऑक्साइड का सूत्र" }, eka: "E2O3", gallium: "Ga2O3" },
  { property: { en: "Formula of chloride", hi: "क्लोराइड का सूत्र" }, eka: "ECl3", gallium: "GaCl3" },
] as const;

export const MendeleevAction = {
  Tap: "tap",
  Reveal: "reveal",
  SetMode: "setMode",
  ShowNoble: "showNoble",
  PickAnomaly: "pickAnomaly",
} as const;
export const MendeleevSignal = {
  Tapped: "tapped",
  Revealed: "revealed",
  Anomaly: "anomaly",
} as const;
export const MendeleevDerived = {
  Group: "group",
  Oxide: "oxide",
  Hydride: "hydride",
  RevealedCount: "revealedCount",
} as const;
export const MendeleevPart = {
  Table: "table",
  Formulae: "formulae",
  Gaps: "gaps",
  Card: "card",
  Predict: "predict",
  Anomaly: "anomaly",
  Modes: "modes",
} as const;

const mendeleevState = z
  .object({
    mode: z.nativeEnum(MendeleevMode),
    /** The tapped element's symbol, or null. */
    selected: z.string().nullable(),
    /** Gaps already filled by the element found later. */
    revealed: z.array(z.nativeEnum(Gap)),
    anomaly: z.nativeEnum(Anomaly),
    showFormulas: z.boolean(),
    /** Show group 0, the noble gases added later. */
    showNoble: z.boolean(),
    canTap: z.boolean(),
    canReveal: z.boolean(),
    canSetMode: z.boolean(),
  })
  .strict();
export type MendeleevState = z.infer<typeof mendeleevState>;

const ANOMALY_TEXT: Record<Anomaly, string> = {
  coNi: "Cobalt (58.9) is placed before nickel (58.7), against the order of mass, so that each sits with elements like it.",
  hydrogen:
    "Hydrogen is like the alkali metals (HCl, H2O, H2S like NaCl, Na2O, Na2S) and like the halogens (diatomic, forms covalent compounds): it has no fixed place.",
  isotopes:
    "Cl-35 and Cl-37 have the same chemical properties but different masses: one slot or two?",
};

export function describeMendeleev(s: MendeleevState): string {
  if (s.mode === MendeleevMode.Predict) {
    return `Mendeléev's prediction for eka-aluminium (mass 68, oxide E2O3, chloride ECl3)${
      s.revealed.includes(Gap.EkaAluminium)
        ? " beside gallium, found later (69.7, Ga2O3, GaCl3): a close match."
        : "; the element that fills the gap is not yet shown."
    }`;
  }
  if (s.mode === MendeleevMode.Anomalies) return ANOMALY_TEXT[s.anomaly];
  const base =
    "Mendeléev's table: groups I–VIII with oxide and hydride formulae at the top, elements in order of atomic mass, with gaps left for elements not yet found.";
  const card =
    s.selected === null
      ? ""
      : ` ${s.selected} is in group ${GROUP_NAMES[mendeleevGroupOf(s.selected) ?? 0]}; its oxide is ${oxideOf(s.selected)}.`;
  const filled =
    s.revealed.length === 0
      ? ""
      : ` Filled since: ${s.revealed.map((g) => GAPS[g].found).join(", ")}.`;
  return base + card + filled;
}

const act = actionsFor<MendeleevState>();

export const mendeleevTable = defineProp({
  type: "mendeleevTable",
  describe:
    "Mendeléev's Periodic Table (NCERT Table 5.4, simplified): groups I–VIII headed by oxide (R2O, RO, R2O3, …) and hydride formulae, elements in order of atomic mass, gaps for eka-boron, eka-aluminium and eka-silicon. Tap an element to see its group and predicted oxide. Modes: predict (Table 5.5, eka-aluminium vs gallium) and anomalies (Co before Ni, hydrogen, isotopes of chlorine).",
  state: mendeleevState,
  defaults: {
    mode: MendeleevMode.Table,
    selected: null,
    revealed: [],
    anomaly: Anomaly.CoNi,
    showFormulas: true,
    showNoble: false,
    canTap: true,
    canReveal: true,
    canSetMode: false,
  },
  inputs: ["showFormulas", "showNoble", "canTap", "canReveal", "canSetMode"],
  derived: {
    [MendeleevDerived.Group]: {
      describe: "The tapped element's group as a Roman numeral, or null",
      compute: (s) => {
        if (s.selected === null) return null;
        const g = mendeleevGroupOf(s.selected);
        return g === null ? null : GROUP_NAMES[g];
      },
    },
    [MendeleevDerived.Oxide]: {
      describe: "The oxide formula the table predicts for the tapped element (e.g. Al2O3), or null",
      compute: (s) => (s.selected === null ? null : oxideOf(s.selected)),
    },
    [MendeleevDerived.Hydride]: {
      describe: "The hydride formula for the tapped element (e.g. CH4), or null",
      compute: (s) => (s.selected === null ? null : hydrideOf(s.selected)),
    },
    [MendeleevDerived.RevealedCount]: {
      describe: "How many gaps have been filled by the elements found later",
      compute: (s) => s.revealed.length,
    },
  },
  actions: {
    [MendeleevAction.Tap]: act({
      describe: "Tap an element card to see its group and formulae",
      byLearner: true,
      args: z.object({ symbol: z.string() }).strict(),
      run: (s, a) =>
        s.canTap && mendeleevGroupOf(a.symbol) !== null
          ? set(
              { selected: a.symbol },
              {
                signal: MendeleevSignal.Tapped,
                payload: { symbol: a.symbol, oxide: oxideOf(a.symbol) },
              },
            )
          : set({}),
    }),
    [MendeleevAction.Reveal]: act({
      describe: "Fill a gap with the element discovered later",
      byLearner: true,
      args: z.object({ gap: z.nativeEnum(Gap) }).strict(),
      run: (s, a) =>
        s.revealed.includes(a.gap)
          ? set({})
          : set(
              { revealed: [...s.revealed, a.gap] },
              {
                signal: MendeleevSignal.Revealed,
                payload: { gap: a.gap, found: GAPS[a.gap].found },
              },
            ),
    }),
    [MendeleevAction.SetMode]: act({
      describe: "Show the table, the eka-aluminium prediction, or the anomalies",
      byLearner: true,
      args: z.object({ mode: z.nativeEnum(MendeleevMode) }).strict(),
      run: (s, a) => (s.canSetMode ? set({ mode: a.mode }) : set({})),
    }),
    [MendeleevAction.ShowNoble]: act({
      describe: "Add (or hide) group 0, the noble gases found later",
      args: z.object({ isOn: z.boolean() }).strict(),
      run: (_s, a) => set({ showNoble: a.isOn }),
    }),
    [MendeleevAction.PickAnomaly]: act({
      describe: "Look at one of the table's problems: cobalt and nickel, hydrogen, or isotopes",
      byLearner: true,
      args: z.object({ anomaly: z.nativeEnum(Anomaly) }).strict(),
      run: (_s, a) =>
        set(
          { anomaly: a.anomaly },
          { signal: MendeleevSignal.Anomaly, payload: { anomaly: a.anomaly } },
        ),
    }),
  },
  signals: {
    [MendeleevSignal.Tapped]: { describe: "An element was tapped; `oxide` is its predicted oxide" },
    [MendeleevSignal.Revealed]: { describe: "A gap was filled by `found`" },
    [MendeleevSignal.Anomaly]: { describe: "Now showing `anomaly`" },
  },
  observe: (s) => ({
    summary: describeMendeleev(s),
    elements: [
      ...(s.selected === null
        ? []
        : [{ id: MendeleevPart.Card, value: `${s.selected}: ${oxideOf(s.selected) ?? ""}` }]),
      ...(s.revealed.length === 0
        ? []
        : [{ id: MendeleevPart.Gaps, value: s.revealed.map((g) => GAPS[g].found).join(", ") }]),
    ],
  }),
  parts: (s) => {
    const modes = s.canSetMode ? [MendeleevPart.Modes] : [];
    if (s.mode === MendeleevMode.Predict) return [MendeleevPart.Predict, ...modes];
    if (s.mode === MendeleevMode.Anomalies) return [MendeleevPart.Anomaly, ...modes];
    return [
      MendeleevPart.Table,
      MendeleevPart.Gaps,
      ...(s.showFormulas ? [MendeleevPart.Formulae] : []),
      ...(s.selected === null ? [] : [MendeleevPart.Card]),
      ...modes,
    ];
  },
});
