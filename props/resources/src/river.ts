import { type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * The river past a town, as NCERT's Ganga box tells it: towns pour garbage and excreta into it,
 * untreated sewage, bathing and washing, immersion of ashes, and industries' chemical effluents.
 * Coliform (bacteria from human intestines) shows contamination by disease-causing microbes;
 * chemical toxicity kills fish. Everything here is qualitative: no invented counts.
 *
 * pH mode is Activity 16.3: test water samples with universal indicator. pH alone can show that
 * water is acidic or basic, but a pH near 7 doesn't prove the water is clean.
 */

export const RiverMode = { River: "river", Ph: "ph" } as const;
export type RiverMode = (typeof RiverMode)[keyof typeof RiverMode];

export const Source = {
  Sewage: "sewage",
  Garbage: "garbage",
  Bathing: "bathing",
  Ashes: "ashes",
  Industry: "industry",
} as const;
export type Source = (typeof Source)[keyof typeof Source];
export const SOURCES: readonly Source[] = Object.values(Source);

/** Which sources add coliform (human and animal waste in the water). */
const ADDS_COLIFORM: Readonly<Record<Source, number>> = {
  sewage: 3,
  garbage: 1,
  bathing: 1,
  ashes: 1,
  industry: 0,
};

export const Coliform = { Low: "low", High: "high", VeryHigh: "veryHigh" } as const;
export type Coliform = (typeof Coliform)[keyof typeof Coliform];

export const Fish = { Thriving: "thriving", Few: "few", Dying: "dying" } as const;
export type Fish = (typeof Fish)[keyof typeof Fish];

export const Sample = {
  Tap: "tap",
  Pond: "pond",
  River: "river",
  Rain: "rain",
  Drain: "drain",
  Well: "well",
} as const;
export type Sample = (typeof Sample)[keyof typeof Sample];

/** Universal indicator colour bands, for drawing a pH. */
export const phBand = (ph: number): "acid" | "weakAcid" | "neutral" | "weakBase" | "base" =>
  ph < 4 ? "acid" : ph < 6.5 ? "weakAcid" : ph <= 7.5 ? "neutral" : ph <= 9 ? "weakBase" : "base";

export const RiverAction = {
  SetSource: "setSource",
  SetTreatment: "setTreatment",
  Test: "test",
  Clear: "clear",
} as const;
export const RiverSignal = { Changed: "changed", Tested: "tested" } as const;
export const RiverDerived = {
  Coliform: "coliform",
  IsToxic: "isToxic",
  Fish: "fish",
  IsSafeToBathe: "isSafeToBathe",
  Ph: "ph",
  Band: "band",
} as const;
export const RiverPart = { River: "river", Town: "town", Samples: "samples" } as const;

const sampleSchema = z
  .object({ sample: z.nativeEnum(Sample), ph: z.number().min(0).max(14) })
  .strict();

const riverState = z
  .object({
    mode: z.nativeEnum(RiverMode),
    /** The sources pouring into the river right now. */
    sources: z.array(z.nativeEnum(Source)),
    /** A sewage treatment plant cleans the town's sewage before it reaches the river. */
    isTreated: z.boolean(),
    /** pH mode: the samples on the bench, each with its pH (set by the lesson). */
    samples: z.array(sampleSchema).max(4),
    /** pH mode: which sample has had a drop of universal indicator. */
    tested: z.array(z.nativeEnum(Sample)),
    showNames: z.boolean(),
    canToggle: z.boolean(),
    canTreat: z.boolean(),
    canTest: z.boolean(),
  })
  .strict();
export type RiverState = z.infer<typeof riverState>;

export function coliformOf(s: Pick<RiverState, "sources" | "isTreated">): Coliform {
  const load = s.sources.reduce(
    (n, src) => n + (s.isTreated && src === Source.Sewage ? 0 : ADDS_COLIFORM[src]),
    0,
  );
  return load <= 1 ? Coliform.Low : load <= 3 ? Coliform.High : Coliform.VeryHigh;
}
export const isToxicOf = (s: Pick<RiverState, "sources">): boolean =>
  s.sources.includes(Source.Industry);
export function fishOf(s: Pick<RiverState, "sources" | "isTreated">): Fish {
  if (isToxicOf(s)) return Fish.Dying;
  return coliformOf(s) === Coliform.VeryHigh ? Fish.Few : Fish.Thriving;
}
/** Safe to bathe in only when the coliform is low and nothing toxic is coming in. */
export const isSafeOf = (s: Pick<RiverState, "sources" | "isTreated">): boolean =>
  coliformOf(s) === Coliform.Low && !isToxicOf(s);

const lastTested = (s: Pick<RiverState, "samples" | "tested">) => {
  const last = s.tested[s.tested.length - 1];
  return s.samples.find((x) => x.sample === last) ?? null;
};

const SOURCE_NAMES: Readonly<Record<Source, string>> = {
  sewage: "untreated sewage",
  garbage: "garbage",
  bathing: "bathing and washing clothes",
  ashes: "immersion of ashes",
  industry: "industrial chemical effluents",
};

export function describeRiver(s: RiverState): string {
  if (s.mode === RiverMode.Ph) {
    const parts = s.samples.map((x) =>
      s.tested.includes(x.sample) ? `${x.sample} water: pH ${x.ph}` : `${x.sample} water: untested`,
    );
    return `Testing water samples with universal indicator (Activity 16.3). ${parts.join("; ")}.`;
  }
  const into =
    s.sources.length === 0 ? "nothing" : s.sources.map((x) => SOURCE_NAMES[x]).join(", ");
  return `A river flowing past a town. Pouring into it: ${into}${s.isTreated ? "; the town's sewage is treated first" : ""}. Coliform: ${coliformOf(s)}; fish: ${fishOf(s)}${isToxicOf(s) ? "; chemicals make the water toxic" : ""}.`;
}

const act = actionsFor<RiverState>();
const changed = (next: Pick<RiverState, "sources" | "isTreated">): Emit => ({
  signal: RiverSignal.Changed,
  payload: { coliform: coliformOf(next), fish: fishOf(next), isSafe: isSafeOf(next) },
});

export const riverHealth = defineProp({
  type: "riverHealth",
  describe:
    "A river past a town (NCERT's Ganga box): switch the pollution sources (untreated sewage, garbage, bathing and washing, immersion of ashes, industrial effluents) and a sewage treatment plant, and see the coliform level (low, high, very high) and the fish. Qualitative only. In pH mode (Activity 16.3) the learner tests water samples with universal indicator.",
  state: riverState,
  defaults: {
    mode: RiverMode.River,
    sources: [Source.Sewage, Source.Garbage, Source.Bathing, Source.Ashes, Source.Industry],
    isTreated: false,
    samples: [
      { sample: Sample.Tap, ph: 7 },
      { sample: Sample.Pond, ph: 6 },
    ],
    tested: [],
    showNames: true,
    canToggle: true,
    canTreat: true,
    canTest: true,
  },
  inputs: ["mode", "samples", "showNames", "canToggle", "canTreat", "canTest"],
  invariant: (s) => {
    if (new Set(s.sources).size !== s.sources.length) return "a source is listed twice";
    if (new Set(s.samples.map((x) => x.sample)).size !== s.samples.length)
      return "a sample is listed twice";
    if (s.tested.some((t) => !s.samples.some((x) => x.sample === t)))
      return "tested a sample that isn't on the bench";
    return undefined;
  },
  derived: {
    [RiverDerived.Coliform]: { describe: "low, high or veryHigh", compute: coliformOf },
    [RiverDerived.IsToxic]: {
      describe: "Whether industrial chemicals are coming in",
      compute: isToxicOf,
    },
    [RiverDerived.Fish]: { describe: "thriving, few or dying", compute: fishOf },
    [RiverDerived.IsSafeToBathe]: {
      describe: "Low coliform and no chemicals",
      compute: isSafeOf,
    },
    [RiverDerived.Ph]: {
      describe: "pH of the sample tested last, or null",
      compute: (s) => lastTested(s)?.ph ?? null,
    },
    [RiverDerived.Band]: {
      describe: "acid, weakAcid, neutral, weakBase or base for the last tested sample, or null",
      compute: (s) => {
        const t = lastTested(s);
        return t === null ? null : phBand(t.ph);
      },
    },
  },
  actions: {
    [RiverAction.SetSource]: act({
      describe: "Turn one pollution source on or off",
      byLearner: true,
      args: z.object({ source: z.nativeEnum(Source), on: z.boolean() }).strict(),
      run: (s, a) => {
        const sources = a.on
          ? s.sources.includes(a.source)
            ? s.sources
            : [...s.sources, a.source]
          : s.sources.filter((x) => x !== a.source);
        return set({ sources }, changed({ sources, isTreated: s.isTreated }));
      },
    }),
    [RiverAction.SetTreatment]: act({
      describe: "Build or remove the sewage treatment plant",
      byLearner: true,
      args: z.object({ on: z.boolean() }).strict(),
      run: (s, a) => set({ isTreated: a.on }, changed({ sources: s.sources, isTreated: a.on })),
    }),
    [RiverAction.Test]: act({
      describe: "Add universal indicator to one sample",
      byLearner: true,
      args: z.object({ sample: z.nativeEnum(Sample) }).strict(),
      run: (s, a) => {
        const found = s.samples.find((x) => x.sample === a.sample);
        if (found === undefined) return set({});
        const tested = [...s.tested.filter((t) => t !== a.sample), a.sample];
        return set(
          { tested },
          {
            signal: RiverSignal.Tested,
            payload: { sample: a.sample, ph: found.ph, band: phBand(found.ph) },
          },
        );
      },
    }),
    [RiverAction.Clear]: act({
      describe: "Wash the samples: none tested",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ tested: [] }),
    }),
  },
  signals: {
    [RiverSignal.Changed]: {
      describe: "A source or the treatment plant changed; the payload has coliform, fish, isSafe",
    },
    [RiverSignal.Tested]: {
      describe: "A sample was tested; the payload has its pH and colour band",
      isCommit: true,
    },
  },
  observe: (s) => ({
    summary: describeRiver(s),
    elements:
      s.mode === RiverMode.Ph
        ? [{ id: RiverPart.Samples, value: describeRiver(s) }]
        : [
            { id: RiverPart.Town, value: s.sources },
            { id: RiverPart.River, value: { coliform: coliformOf(s), fish: fishOf(s) } },
          ],
  }),
  parts: (s) => (s.mode === RiverMode.Ph ? [RiverPart.Samples] : [RiverPart.Town, RiverPart.River]),
});
