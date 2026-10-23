import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import type { Words } from "./words";

/**
 * Sorting energy sources (NCERT 14.5, Activity 14.7, Exercise 3), two ways:
 * - renewable: can it be regenerated (or is its store so large that using it barely dents it),
 *   or will it run out? Fossil fuels and nuclear fuel run out; the rest are renewable (wood only
 *   if the trees cut are replanted);
 * - sun: does its energy come, in the end, from the Sun? Fossil fuels are stored sunlight from
 *   ancient plants; biomass, wind, rain behind a dam, waves (made by wind) and ocean heat all come
 *   from the Sun. Tides come from the moon's pull; geothermal and nuclear energy from the earth's
 *   own heat and the atom.
 * The learner taps a source, then a bin.
 */

export const Source = {
  Coal: "coal",
  Petroleum: "petroleum",
  NaturalGas: "naturalGas",
  Wood: "wood",
  Biogas: "biogas",
  Hydro: "hydro",
  Wind: "wind",
  Solar: "solar",
  Tidal: "tidal",
  Wave: "wave",
  OceanThermal: "oceanThermal",
  Geothermal: "geothermal",
  Nuclear: "nuclear",
} as const;
export type Source = (typeof Source)[keyof typeof Source];
export const SOURCES = Object.values(Source);

export const SOURCE_NAMES: Readonly<Record<Source, Words>> = {
  coal: { en: "Coal", hi: "कोयला" },
  petroleum: { en: "Petroleum", hi: "पेट्रोलियम" },
  naturalGas: { en: "Natural gas", hi: "प्राकृतिक गैस" },
  wood: { en: "Wood", hi: "लकड़ी" },
  biogas: { en: "Biogas", hi: "बायोगैस" },
  hydro: { en: "Hydro", hi: "जल-विद्युत" },
  wind: { en: "Wind", hi: "पवन" },
  solar: { en: "Solar", hi: "सौर" },
  tidal: { en: "Tidal", hi: "ज्वारीय" },
  wave: { en: "Wave", hi: "तरंग" },
  oceanThermal: { en: "Ocean thermal", hi: "महासागरीय तापीय" },
  geothermal: { en: "Geothermal", hi: "भूतापीय" },
  nuclear: { en: "Nuclear", hi: "नाभिकीय" },
};

export const SortBy = { Renewable: "renewable", Sun: "sun" } as const;
export type SortBy = (typeof SortBy)[keyof typeof SortBy];

/** The two bins: "yes" (renewable / from the Sun) and "no". */
export const Bin = { Yes: "yes", No: "no" } as const;
export type Bin = (typeof Bin)[keyof typeof Bin];

export const BIN_NAMES: Readonly<Record<SortBy, Readonly<Record<Bin, Words>>>> = {
  renewable: {
    yes: { en: "Renewable", hi: "नवीकरणीय" },
    no: { en: "Non-renewable", hi: "अनवीकरणीय" },
  },
  sun: {
    yes: { en: "From the Sun", hi: "सूर्य से" },
    no: { en: "Not from the Sun", hi: "सूर्य से नहीं" },
  },
};

export const RIGHT_BIN: Readonly<Record<SortBy, Readonly<Record<Source, Bin>>>> = {
  renewable: {
    coal: Bin.No,
    petroleum: Bin.No,
    naturalGas: Bin.No,
    wood: Bin.Yes,
    biogas: Bin.Yes,
    hydro: Bin.Yes,
    wind: Bin.Yes,
    solar: Bin.Yes,
    tidal: Bin.Yes,
    wave: Bin.Yes,
    oceanThermal: Bin.Yes,
    geothermal: Bin.Yes,
    nuclear: Bin.No,
  },
  sun: {
    coal: Bin.Yes,
    petroleum: Bin.Yes,
    naturalGas: Bin.Yes,
    wood: Bin.Yes,
    biogas: Bin.Yes,
    hydro: Bin.Yes,
    wind: Bin.Yes,
    solar: Bin.Yes,
    tidal: Bin.No,
    wave: Bin.Yes,
    oceanThermal: Bin.Yes,
    geothermal: Bin.No,
    nuclear: Bin.No,
  },
};

export const SorterAction = { Select: "select", Place: "place", Clear: "clear" } as const;
export const SorterSignal = { Placed: "placed", AllRight: "allRight" } as const;
export const SorterDerived = {
  Right: "right",
  Wrong: "wrong",
  IsAllPlaced: "isAllPlaced",
  IsAllRight: "isAllRight",
} as const;
export const SorterPart = { Tray: "tray", Yes: "yes", No: "no", Controls: "controls" } as const;

const sorterState = z
  .object({
    by: z.nativeEnum(SortBy),
    sources: z.array(z.nativeEnum(Source)).min(1).max(SOURCES.length),
    /** The source tapped, waiting for a bin. */
    selected: z.nativeEnum(Source).nullable(),
    placed: z.array(z.object({ source: z.nativeEnum(Source), bin: z.nativeEnum(Bin) }).strict()),
    /** Mark each placed source right or wrong. */
    showMarks: z.boolean(),
    canSort: z.boolean(),
  })
  .strict();
export type SorterState = z.infer<typeof sorterState>;

export const binOf = (s: Pick<SorterState, "placed">, source: Source): Bin | null =>
  s.placed.find((p) => p.source === source)?.bin ?? null;
export const isRightPlace = (by: SortBy, source: Source, bin: Bin): boolean =>
  RIGHT_BIN[by][source] === bin;
export const rightOf = (s: SorterState): number =>
  s.placed.filter((p) => isRightPlace(s.by, p.source, p.bin)).length;
export const wrongOf = (s: SorterState): Source[] =>
  s.placed.filter((p) => !isRightPlace(s.by, p.source, p.bin)).map((p) => p.source);
export const isAllPlacedOf = (s: SorterState): boolean =>
  s.sources.every((src) => binOf(s, src) !== null);
export const isAllRightOf = (s: SorterState): boolean =>
  isAllPlacedOf(s) && wrongOf(s).length === 0;

export function describeSorter(s: SorterState): string {
  const names = BIN_NAMES[s.by];
  const list = (bin: Bin) =>
    s.placed
      .filter((p) => p.bin === bin)
      .map((p) => SOURCE_NAMES[p.source].en)
      .join(", ") || "nothing";
  const left = s.sources.filter((src) => binOf(s, src) === null).map((src) => SOURCE_NAMES[src].en);
  return `Sorting energy sources into "${names.yes.en}" and "${names.no.en}". ${names.yes.en}: ${list(Bin.Yes)}. ${names.no.en}: ${list(Bin.No)}. ${left.length === 0 ? "All are sorted" : `Still to sort: ${left.join(", ")}`}${s.selected === null ? "." : `; ${SOURCE_NAMES[s.selected].en} is picked up.`}`;
}

const act = actionsFor<SorterState>();

export const energySorter = defineProp({
  type: "energySorter",
  describe:
    "Sort energy sources into two bins (NCERT 14.5, Activity 14.7): renewable or non-renewable, or whether the energy comes from the Sun in the end. Tap a source, then a bin. Placed sources can be marked right or wrong.",
  state: sorterState,
  defaults: {
    by: SortBy.Renewable,
    sources: [
      Source.Coal,
      Source.Wind,
      Source.Petroleum,
      Source.Solar,
      Source.Biogas,
      Source.Nuclear,
      Source.Hydro,
      Source.NaturalGas,
    ],
    selected: null,
    placed: [],
    showMarks: true,
    canSort: true,
  },
  inputs: ["by", "sources", "showMarks", "canSort"],
  invariant: (s) => {
    if (s.placed.some((p) => !s.sources.includes(p.source)))
      return "a placed source is not on the tray";
    if (new Set(s.placed.map((p) => p.source)).size !== s.placed.length)
      return "a source is placed twice";
    return undefined;
  },
  derived: {
    [SorterDerived.Right]: {
      describe: "How many placed sources are in the right bin",
      compute: (s) => rightOf(s),
    },
    [SorterDerived.Wrong]: {
      describe: "The placed sources in the wrong bin",
      compute: (s) => wrongOf(s),
    },
    [SorterDerived.IsAllPlaced]: {
      describe: "Whether every source has been put in a bin",
      compute: (s) => isAllPlacedOf(s),
    },
    [SorterDerived.IsAllRight]: {
      describe: "Whether every source is in its right bin",
      compute: (s) => isAllRightOf(s),
    },
  },
  actions: {
    [SorterAction.Select]: act({
      describe: "Pick up a source (tap it again to put it down)",
      byLearner: true,
      args: z.object({ source: z.nativeEnum(Source) }).strict(),
      run: (s, a) =>
        s.sources.includes(a.source)
          ? set({ selected: s.selected === a.source ? null : a.source })
          : set({}),
    }),
    [SorterAction.Place]: act({
      describe: "Put the picked-up source in a bin (yes or no); it can be moved later",
      byLearner: true,
      args: z.object({ bin: z.nativeEnum(Bin) }).strict(),
      run: (s, a) => {
        if (s.selected === null) return set({});
        const source = s.selected;
        const placed = [...s.placed.filter((p) => p.source !== source), { source, bin: a.bin }];
        const next = { ...s, placed, selected: null };
        return set(
          { placed, selected: null },
          {
            signal: SorterSignal.Placed,
            payload: { source, bin: a.bin, isRight: isRightPlace(s.by, source, a.bin) },
          },
          ...(isAllRightOf(next) ? [{ signal: SorterSignal.AllRight, payload: {} }] : []),
        );
      },
    }),
    [SorterAction.Clear]: act({
      describe: "Take every source back out of the bins",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ placed: [], selected: null }),
    }),
  },
  signals: {
    [SorterSignal.Placed]: {
      describe: "A source was put in a bin; the payload says which and whether it is right",
      isCommit: true,
    },
    [SorterSignal.AllRight]: { describe: "Every source is now in its right bin" },
  },
  observe: (s) => ({
    summary: describeSorter(s),
    elements: [
      {
        id: SorterPart.Tray,
        value: s.sources.filter((src) => binOf(s, src) === null).join(", "),
      },
      {
        id: SorterPart.Yes,
        value: s.placed
          .filter((p) => p.bin === Bin.Yes)
          .map((p) => p.source)
          .join(", "),
      },
      {
        id: SorterPart.No,
        value: s.placed
          .filter((p) => p.bin === Bin.No)
          .map((p) => p.source)
          .join(", "),
      },
    ],
    hidden: { wrong: wrongOf(s) },
  }),
  parts: () => [SorterPart.Tray, SorterPart.Yes, SorterPart.No, SorterPart.Controls],
});
