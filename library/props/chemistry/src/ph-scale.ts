import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import {
  HUE_WORDS,
  NATURE_WORDS,
  SUBSTANCES,
  SubstanceId,
  UNIVERSAL_HUES,
  natureOfPh,
  strengthOfPh,
  universalBand,
} from "./acid-data";
import type { Words } from "./words";

/**
 * The pH scale (NCERT Class 10, Section 2.3): a strip from 0 to 14 in the universal indicator's
 * colours, everyday substances to test on it, a probe to slide along it, and optionally how the
 * hydrogen and hydroxide ions change along it (Fig 2.6) and a band from everyday life.
 */

export const PhAction = { Pick: "pick", Probe: "probe", Clear: "clear" } as const;
export const PhSignal = { Picked: "picked", Probed: "probed" } as const;
export const PhDerived = {
  PH: "pH",
  Nature: "nature",
  Strength: "strength",
  HydrogenVsWater: "hydrogenVsWater",
} as const;
export const PhPart = {
  Strip: "strip",
  Pointer: "pointer",
  Ions: "ions",
  Band: "band",
  Substances: "substances",
} as const;

/** A stretch of the scale that matters to living things (Section 2.3.1). */
export const LifeBand = {
  Body: "body",
  ToothDecay: "toothDecay",
  AcidRain: "acidRain",
  Stomach: "stomach",
} as const;
export type LifeBand = (typeof LifeBand)[keyof typeof LifeBand];

export const LIFE_BANDS: Record<LifeBand, { from: number; to: number; words: Words }> = {
  body: {
    from: 7,
    to: 7.8,
    words: { en: "our body works here: 7.0–7.8", hi: "हमारा शरीर यहाँ काम करता है: 7.0–7.8" },
  },
  toothDecay: {
    from: 0,
    to: 5.5,
    words: { en: "tooth decay: below 5.5", hi: "दाँतों का क्षय: 5.5 से नीचे" },
  },
  acidRain: {
    from: 0,
    to: 5.6,
    words: { en: "acid rain: below 5.6", hi: "अम्लीय वर्षा: 5.6 से नीचे" },
  },
  stomach: { from: 1, to: 3, words: { en: "stomach acid (HCl)", hi: "पेट का अम्ल (HCl)" } },
};

const phState = z
  .object({
    /** Substances on offer to test (0–12). */
    substances: z.array(z.nativeEnum(SubstanceId)).max(12),
    /** The substance tested, marked on the strip, or null. */
    picked: z.nativeEnum(SubstanceId).nullable(),
    /** Where the probe stands (pH 0–14), or null: no probe. */
    probe: z.number().min(0).max(14).nullable(),
    /** Colour the strip in the universal indicator's colours (else plain). */
    showColours: z.boolean(),
    /** Write "acidic", "neutral", "basic" under the strip. */
    showRegions: z.boolean(),
    /** Fig 2.6: H⁺ falling and OH⁻ rising along the scale. */
    showIons: z.boolean(),
    /** Every substance tested so far gets a small mark on the strip. */
    showTested: z.boolean(),
    /** Substances tested so far (for showTested). */
    tested: z.array(z.nativeEnum(SubstanceId)).max(12),
    /** A band from everyday life over the strip, or null. */
    band: z.nativeEnum(LifeBand).nullable(),
    canPick: z.boolean(),
    canProbe: z.boolean(),
  })
  .strict();
export type PhState = z.infer<typeof phState>;

/** The pH being read: the picked substance's, else the probe's, else null. */
export function readingOf(s: Pick<PhState, "picked" | "probe">): number | null {
  if (s.picked !== null) return SUBSTANCES[s.picked].pH;
  return s.probe;
}

/** How many times more hydrogen ions than in pure water (pH 7): 10^(7 − pH). */
export const hydrogenVsWater = (pH: number): number => 10 ** (7 - pH);

/** In words: "100 times more H⁺ than pure water", "the same as pure water", "1000 times fewer". */
export function hydrogenWords(pH: number): Words {
  const d = Math.round((7 - pH) * 10) / 10;
  if (Math.abs(d) < 0.05)
    return { en: "as many H⁺ ions as pure water", hi: "शुद्ध पानी जितने H⁺ आयन" };
  const times = 10 ** Math.abs(d);
  const n =
    times >= 100 ? Math.round(times).toLocaleString("en-IN") : `${Math.round(times * 10) / 10}`;
  return d > 0
    ? { en: `${n} times more H⁺ ions than pure water`, hi: `शुद्ध पानी से ${n} गुना अधिक H⁺ आयन` }
    : { en: `${n} times fewer H⁺ ions than pure water`, hi: `शुद्ध पानी से ${n} गुना कम H⁺ आयन` };
}

export function describePh(s: PhState): string {
  const pH = readingOf(s);
  const what =
    s.picked !== null
      ? `${SUBSTANCES[s.picked].name.en} is tested: pH ${pH}`
      : pH !== null
        ? `the probe is at pH ${pH}`
        : "nothing is being tested";
  const nature = pH === null ? "" : `, ${strengthOfPh(pH).en}`;
  const colour =
    pH !== null && s.showColours
      ? `; universal indicator shows ${HUE_WORDS[UNIVERSAL_HUES[universalBand(pH)] ?? "green"].en}`
      : "";
  const band = s.band === null ? "" : `; marked: ${LIFE_BANDS[s.band].words.en}`;
  return `The pH scale from 0 (very acidic) through 7 (neutral) to 14 (very basic)${s.showColours ? ", in universal indicator colours" : ""}: ${what}${nature}${colour}${band}.`;
}

const act = actionsFor<PhState>();

export const phScale = defineProp({
  type: "phScale",
  describe:
    "The pH scale of NCERT Class 10 Chapter 2: a strip from 0 (very acidic) to 14 (very basic) with 7 neutral, coloured like universal indicator paper. Substances (laboratory acids and alkalis, lemon juice, saliva, coffee, milk of magnesia, soap…) can be tested and are pointed to at their pH; a probe can be slid along the strip. It can show how H⁺ ions fall and OH⁻ ions rise along the scale (Fig 2.6), and a band from everyday life (our body's 7.0–7.8, tooth decay below 5.5, acid rain below 5.6, stomach acid). Lower pH means more hydrogen ions: each step down is ten times more.",
  state: phState,
  defaults: {
    substances: [SubstanceId.LemonJuice, SubstanceId.DistilledWater, SubstanceId.MilkOfMagnesia],
    picked: null,
    probe: null,
    showColours: true,
    showRegions: true,
    showIons: false,
    showTested: true,
    tested: [],
    band: null,
    canPick: true,
    canProbe: false,
  },
  inputs: ["showColours", "showRegions", "showIons", "showTested", "band", "canPick", "canProbe"],
  derived: {
    [PhDerived.PH]: {
      describe: "The pH being read (the tested substance's, else the probe's), or null",
      compute: (s) => readingOf(s),
    },
    [PhDerived.Nature]: {
      describe: "acidic, neutral or basic at the reading, or null",
      compute: (s) => {
        const pH = readingOf(s);
        return pH === null ? null : natureOfPh(pH);
      },
    },
    [PhDerived.Strength]: {
      describe: "strongly/weakly acidic or basic, or neutral, at the reading (in words), or null",
      compute: (s) => {
        const pH = readingOf(s);
        return pH === null ? null : strengthOfPh(pH).en;
      },
    },
    [PhDerived.HydrogenVsWater]: {
      describe: "How many times more H⁺ ions than pure water at the reading: 10^(7 − pH), or null",
      compute: (s) => {
        const pH = readingOf(s);
        return pH === null ? null : hydrogenVsWater(pH);
      },
    },
  },
  actions: {
    [PhAction.Pick]: act({
      describe: "Test one of the substances on offer: dip universal indicator paper in it",
      byLearner: true,
      args: z.object({ substance: z.nativeEnum(SubstanceId) }).strict(),
      run: (s, a) =>
        s.substances.includes(a.substance)
          ? set(
              {
                picked: a.substance,
                probe: null,
                tested: s.tested.includes(a.substance)
                  ? s.tested
                  : [...s.tested, a.substance].slice(-12),
              },
              {
                signal: PhSignal.Picked,
                payload: { substance: a.substance, pH: SUBSTANCES[a.substance].pH },
              },
            )
          : set({}),
    }),
    [PhAction.Probe]: act({
      describe: "Slide the probe to a pH (0–14) to read the scale there",
      byLearner: true,
      args: z.object({ pH: z.number().min(0).max(14) }).strict(),
      run: (_s, a) => {
        const pH = Math.round(a.pH * 10) / 10;
        return set({ probe: pH, picked: null }, { signal: PhSignal.Probed, payload: { pH } });
      },
    }),
    [PhAction.Clear]: act({
      describe: "Take the paper and the probe away",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ picked: null, probe: null, tested: [] }),
    }),
  },
  signals: {
    [PhSignal.Picked]: {
      describe: "A substance was tested; the payload has its pH",
      isCommit: true,
    },
    [PhSignal.Probed]: { describe: "The probe was moved to a pH" },
  },
  observe: (s) => {
    const pH = readingOf(s);
    const elements: Element[] = [
      { id: PhPart.Strip, value: s.showColours ? "0–14 in universal indicator colours" : "0–14" },
    ];
    if (pH !== null)
      elements.push({
        id: PhPart.Pointer,
        value: `${s.picked !== null ? `${SUBSTANCES[s.picked].name.en}: ` : ""}pH ${pH}, ${strengthOfPh(pH).en}`,
      });
    if (s.showIons)
      elements.push({ id: PhPart.Ions, value: "H⁺ falls and OH⁻ rises from 0 to 14" });
    if (s.band !== null) elements.push({ id: PhPart.Band, value: LIFE_BANDS[s.band].words.en });
    if (s.canPick && s.substances.length > 0)
      elements.push({
        id: PhPart.Substances,
        value: s.substances.map((x) => SUBSTANCES[x].name.en).join(", "),
      });
    const untested = s.substances
      .filter((x) => x !== s.picked)
      .map(
        (x) =>
          `${SUBSTANCES[x].name.en}: pH ${SUBSTANCES[x].pH} (${NATURE_WORDS[natureOfPh(SUBSTANCES[x].pH)].en})`,
      );
    return { summary: describePh(s), elements, hidden: { wouldRead: untested } };
  },
  parts: (s) => [
    PhPart.Strip,
    ...(readingOf(s) !== null ? [PhPart.Pointer] : []),
    ...(s.showIons ? [PhPart.Ions] : []),
    ...(s.band !== null ? [PhPart.Band] : []),
    ...(s.canPick && s.substances.length > 0 ? [PhPart.Substances] : []),
  ],
});
