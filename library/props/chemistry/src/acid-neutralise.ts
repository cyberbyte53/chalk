import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import {
  HUE_WORDS,
  INDICATORS,
  IndicatorId,
  NATURE_WORDS,
  natureOfPh,
  responseOf,
  responseWords,
} from "./acid-data";
import type { Words } from "./words";

/**
 * Neutralisation (Activity 2.6, Exercise 3): a flask of sodium hydroxide solution with a few
 * drops of an indicator, and a burette of dilute hydrochloric acid over it. Acid goes in drop by
 * drop; when exactly enough has gone in, the base is used up: salt and water, pH 7. More base
 * can be added back.
 */

export const NeutraliseAction = { AddAcid: "addAcid", AddBase: "addBase", Reset: "reset" } as const;
export const NeutraliseSignal = {
  Added: "added",
  ColourChanged: "colourChanged",
  Neutralised: "neutralised",
} as const;
export const NeutraliseDerived = {
  PH: "pH",
  Nature: "nature",
  IsNeutral: "isNeutral",
  AcidNeededMl: "acidNeededMl",
  Colour: "colour",
} as const;
export const NeutralisePart = {
  Burette: "burette",
  Flask: "flask",
  Reading: "reading",
  Ions: "ions",
  Buttons: "buttons",
} as const;

/** The indicators that can be in the flask. */
export const FLASK_INDICATORS = [
  IndicatorId.Phenolphthalein,
  IndicatorId.LitmusSolution,
  IndicatorId.MethylOrange,
  IndicatorId.RedCabbage,
  IndicatorId.Universal,
] as const;

/** Both solutions are this strong (mol per litre); it sets how sharply the pH swings. */
const STRENGTH = 0.1;

const neutraliseState = z
  .object({
    /** Sodium hydroxide solution in the flask, mL (includes any added back). */
    baseMl: z.number().min(0).max(60),
    /** Hydrochloric acid run in from the burette so far, mL. */
    acidMl: z.number().min(0).max(60),
    /** mL of this acid that exactly neutralises 1 mL of this base (1: equally strong). */
    acidPerBaseMl: z.number().min(0.2).max(4),
    /** What one press adds, mL. */
    dropMl: z.number().min(0.1).max(5),
    indicator: z.enum(FLASK_INDICATORS),
    /** The base in the flask at the start (Reset goes back to it). */
    startBaseMl: z.number().min(1).max(60),
    showPh: z.boolean(),
    showVolumes: z.boolean(),
    /** A picture of the ions: H⁺ from the acid meeting OH⁻ from the base to make water. */
    showIons: z.boolean(),
    canAddAcid: z.boolean(),
    canAddBase: z.boolean(),
  })
  .strict();
export type NeutraliseState = z.infer<typeof neutraliseState>;

/** Acid run in beyond what the base needs, in mL of acid (negative: base still left over). */
export const excessAcidMl = (
  s: Pick<NeutraliseState, "acidMl" | "baseMl" | "acidPerBaseMl">,
): number => Math.round((s.acidMl - s.baseMl * s.acidPerBaseMl) * 1000) / 1000;

/** The pH in the flask: from what is left over, spread through all the liquid. */
export function phOf(s: Pick<NeutraliseState, "acidMl" | "baseMl" | "acidPerBaseMl">): number {
  const excess = excessAcidMl(s);
  const total = s.acidMl + s.baseMl;
  if (total <= 0 || Math.abs(excess) < 1e-6) return 7;
  // Excess acid or base, as a concentration in the whole mixture.
  const leftover = excess > 0 ? excess * STRENGTH : (-excess / s.acidPerBaseMl) * STRENGTH;
  const conc = leftover / total;
  const pH = excess > 0 ? -Math.log10(conc) : 14 + Math.log10(conc);
  return Math.round(Math.max(0, Math.min(14, pH)) * 10) / 10;
}

export const isNeutral = (
  s: Pick<NeutraliseState, "acidMl" | "baseMl" | "acidPerBaseMl">,
): boolean => Math.abs(excessAcidMl(s)) < 1e-6;

/** The colour words of the flask. */
export function colourOf(
  s: Pick<NeutraliseState, "acidMl" | "baseMl" | "acidPerBaseMl" | "indicator">,
): Words {
  const r = responseOf(s.indicator, phOf(s));
  if (r.kind === "colour") return HUE_WORDS[r.hue];
  return responseWords(s.indicator, phOf(s));
}

export function describeNeutralise(s: NeutraliseState): string {
  const pH = phOf(s);
  const left = excessAcidMl(s);
  const state = isNeutral(s)
    ? "exactly neutralised: only salt (sodium chloride) and water"
    : left < 0
      ? "some base is still left"
      : "there is more acid than base now";
  return `A flask of ${s.baseMl} mL sodium hydroxide solution with ${INDICATORS[s.indicator].name.en}; ${s.acidMl} mL of hydrochloric acid has been added from the burette. It is ${colourOf(s).en}, pH ${pH} (${NATURE_WORDS[natureOfPh(pH)].en}): ${state}.`;
}

const act = actionsFor<NeutraliseState>();

/** The signals a change from `s` to `next` makes. */
function changeSignals(s: NeutraliseState, next: NeutraliseState, what: "acid" | "base") {
  const out: { signal: string; payload: Record<string, unknown> }[] = [
    {
      signal: NeutraliseSignal.Added,
      payload: { what, acidMl: next.acidMl, baseMl: next.baseMl, pH: phOf(next) },
    },
  ];
  const before = colourOf(s).en;
  const after = colourOf(next).en;
  if (before !== after)
    out.push({ signal: NeutraliseSignal.ColourChanged, payload: { from: before, to: after } });
  if (isNeutral(next) && !isNeutral(s))
    out.push({
      signal: NeutraliseSignal.Neutralised,
      payload: { acidMl: next.acidMl, baseMl: next.baseMl },
    });
  return out;
}

export const neutraliser = defineProp({
  type: "neutraliser",
  describe:
    "Neutralisation (NCERT Class 10, Activity 2.6 and Exercise 3): a conical flask of dilute sodium hydroxide solution with an indicator (phenolphthalein: pink in the base, colourless once neutral or acidic; or litmus, methyl orange, red cabbage, universal), under a burette of dilute hydrochloric acid. Acid is added drop by drop; when just enough has gone in the base is used up, giving salt and water at pH 7, and more acid makes it acidic. Base can be added back. It knows the pH, whether it is exactly neutral, and how much acid the base needs (acidPerBaseMl sets how strong the acid is compared with the base: 0.8 means 8 mL of acid for every 10 mL of base).",
  state: neutraliseState,
  defaults: {
    baseMl: 10,
    acidMl: 0,
    acidPerBaseMl: 1,
    dropMl: 1,
    indicator: IndicatorId.Phenolphthalein,
    startBaseMl: 10,
    showPh: true,
    showVolumes: true,
    showIons: false,
    canAddAcid: true,
    canAddBase: true,
  },
  inputs: ["showPh", "showVolumes", "showIons", "canAddAcid", "canAddBase"],
  derived: {
    [NeutraliseDerived.PH]: { describe: "The pH in the flask", compute: (s) => phOf(s) },
    [NeutraliseDerived.Nature]: {
      describe: "acidic, neutral or basic in the flask",
      compute: (s) => natureOfPh(phOf(s)),
    },
    [NeutraliseDerived.IsNeutral]: {
      describe: "Exactly the acid the base needs has been added: only salt and water",
      compute: (s) => isNeutral(s),
    },
    [NeutraliseDerived.AcidNeededMl]: {
      describe: "mL of acid that exactly neutralises the base now in the flask",
      compute: (s) => Math.round(s.baseMl * s.acidPerBaseMl * 1000) / 1000,
    },
    [NeutraliseDerived.Colour]: {
      describe: "The flask's colour (with its indicator), in words",
      compute: (s) => colourOf(s).en,
    },
  },
  actions: {
    [NeutraliseAction.AddAcid]: act({
      describe: "Open the burette's tap for one drop (dropMl) of hydrochloric acid, or a given mL",
      byLearner: true,
      args: z.object({ ml: z.number().min(0.1).max(40).optional() }).strict(),
      run: (s, a) => {
        const acidMl = Math.min(60, Math.round((s.acidMl + (a.ml ?? s.dropMl)) * 1000) / 1000);
        const next = { ...s, acidMl };
        return set({ acidMl }, ...changeSignals(s, next, "acid"));
      },
    }),
    [NeutraliseAction.AddBase]: act({
      describe:
        "Add one drop (dropMl) of sodium hydroxide solution back into the flask, or a given mL",
      byLearner: true,
      args: z.object({ ml: z.number().min(0.1).max(40).optional() }).strict(),
      run: (s, a) => {
        const baseMl = Math.min(60, Math.round((s.baseMl + (a.ml ?? s.dropMl)) * 1000) / 1000);
        const next = { ...s, baseMl };
        return set({ baseMl }, ...changeSignals(s, next, "base"));
      },
    }),
    [NeutraliseAction.Reset]: act({
      describe: "Start again with a fresh flask of base and a full burette",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => set({ acidMl: 0, baseMl: s.startBaseMl }),
    }),
  },
  signals: {
    [NeutraliseSignal.Added]: {
      describe: "Acid or base was added; the payload has the volumes and pH",
    },
    [NeutraliseSignal.ColourChanged]: {
      describe: "The indicator changed colour (payload from, to)",
    },
    [NeutraliseSignal.Neutralised]: {
      describe: "Exactly enough acid is in: only salt and water (pH 7)",
    },
  },
  observe: (s) => {
    const pH = phOf(s);
    const elements: Element[] = [
      { id: NeutralisePart.Burette, value: `hydrochloric acid; ${s.acidMl} mL run in` },
      {
        id: NeutralisePart.Flask,
        value: `${s.baseMl} mL sodium hydroxide + ${s.acidMl} mL acid, ${INDICATORS[s.indicator].name.en}: ${colourOf(s).en}`,
      },
    ];
    if (s.showPh) elements.push({ id: NeutralisePart.Reading, value: `pH ${pH}` });
    if (s.showIons)
      elements.push({
        id: NeutralisePart.Ions,
        value: isNeutral(s)
          ? "every H⁺ has met an OH⁻: only water and the salt's ions"
          : excessAcidMl(s) < 0
            ? "OH⁻ ions left over"
            : "H⁺ ions left over",
      });
    const buttons = [s.canAddAcid ? "add acid" : null, s.canAddBase ? "add base" : null].filter(
      (x) => x !== null,
    );
    if (buttons.length > 0)
      elements.push({ id: NeutralisePart.Buttons, value: buttons.join(", ") });
    return {
      summary: describeNeutralise(s),
      elements,
      hidden: {
        acidNeededMl: s.baseMl * s.acidPerBaseMl,
        ...(s.showPh ? {} : { pH }),
      },
    };
  },
  parts: (s) => [
    NeutralisePart.Burette,
    NeutralisePart.Flask,
    ...(s.showPh ? [NeutralisePart.Reading] : []),
    ...(s.showIons ? [NeutralisePart.Ions] : []),
    ...(s.canAddAcid || s.canAddBase ? [NeutralisePart.Buttons] : []),
  ],
});
