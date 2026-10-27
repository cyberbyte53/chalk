import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import type { Words } from "./words";

/**
 * A bio-gas (gobar-gas) plant, NCERT Fig 14.4. A slurry of cow-dung and water is made in the mixing
 * tank and fed into the digester, a sealed, brick-domed chamber with no oxygen. Anaerobic
 * micro-organisms break the slurry down over a few days, giving methane, carbon dioxide, hydrogen
 * and hydrogen sulphide; the gas collects in the tank above and is piped to the stove. The spent
 * slurry comes out as manure rich in nitrogen and phosphorus. If air leaks into the digester, the
 * anaerobic microbes can't work and no methane is made.
 */

export const BIOGAS_STEPS: readonly Words[] = [
  { en: "Mix cow-dung and water into a slurry", hi: "गोबर और पानी मिलाकर घोल बनाओ" },
  { en: "Feed the slurry into the sealed digester", hi: "घोल को बंद पाचक में डालो" },
  {
    en: "For a few days, microbes break it down without oxygen",
    hi: "कुछ दिनों तक सूक्ष्मजीव बिना ऑक्सीजन के इसे तोड़ते हैं",
  },
  { en: "The gas collects in the tank above", hi: "गैस ऊपर की टंकी में जमा होती है" },
  { en: "The gas is piped to the stove", hi: "गैस पाइप से चूल्हे तक जाती है" },
  { en: "The spent slurry comes out as manure", hi: "बचा घोल खाद बनकर बाहर आता है" },
];
export const LAST_STEP = BIOGAS_STEPS.length - 1;

/** What bio-gas is made of, as NCERT lists it: up to 75% methane. */
export const GASES: readonly { readonly name: Words; readonly formula: string }[] = [
  { name: { en: "methane (up to 75%)", hi: "मीथेन (75% तक)" }, formula: "CH₄" },
  { name: { en: "carbon dioxide", hi: "कार्बन डाइऑक्साइड" }, formula: "CO₂" },
  { name: { en: "hydrogen", hi: "हाइड्रोजन" }, formula: "H₂" },
  { name: { en: "hydrogen sulphide", hi: "हाइड्रोजन सल्फ़ाइड" }, formula: "H₂S" },
];

export const BiogasAction = {
  Next: "next",
  Back: "back",
  Reset: "reset",
  SetLeak: "setLeak",
} as const;
export const BiogasSignal = { Stepped: "stepped" } as const;
export const BiogasDerived = {
  Gas: "gas",
  HasMethane: "hasMethane",
  IsManureOut: "isManureOut",
  IsDone: "isDone",
} as const;
export const BiogasPart = {
  MixingTank: "mixingTank",
  Digester: "digester",
  GasTank: "gasTank",
  Stove: "stove",
  Manure: "manure",
  Steps: "steps",
  Controls: "controls",
} as const;

const biogasState = z
  .object({
    step: z.number().int().min(0).max(LAST_STEP),
    /** Air gets into the digester: the anaerobic microbes stop, and no methane is made. */
    hasLeak: z.boolean(),
    showNames: z.boolean(),
    showGases: z.boolean(),
    canStep: z.boolean(),
    canLeak: z.boolean(),
  })
  .strict();
export type BiogasState = z.infer<typeof biogasState>;

/** How full the gas tank is, 0 … 1: filling while the slurry digests, none with a leak. */
export function gasOf(s: Pick<BiogasState, "step" | "hasLeak">): number {
  if (s.hasLeak || s.step < 2) return 0;
  return s.step === 2 ? 0.5 : 1;
}

export function describeBiogas(s: BiogasState): string {
  const done = BIOGAS_STEPS.slice(0, s.step + 1)
    .map((w) => w.en)
    .join("; ");
  const leak = s.hasLeak
    ? " Air is leaking into the digester, so the anaerobic microbes can't work and no methane is made."
    : "";
  return `A bio-gas plant: a mixing tank, a sealed brick digester with a gas tank above it, a pipe to a stove and an outlet for the spent slurry. Steps so far: ${done}.${leak} The gas tank is ${Math.round(gasOf(s) * 100)}% full.`;
}

const act = actionsFor<BiogasState>();
const stepped = (step: number) => ({
  signal: BiogasSignal.Stepped,
  payload: { step, isDone: step >= LAST_STEP },
});

export const biogasPlant = defineProp({
  type: "biogasPlant",
  describe:
    "A bio-gas (gobar-gas) plant, NCERT Fig 14.4, stepped through: cow-dung slurry from the mixing tank into the sealed digester, anaerobic micro-organisms making methane, carbon dioxide, hydrogen and hydrogen sulphide over a few days, the gas collecting in the dome and going to a stove, and the spent slurry coming out as manure. An air leak can be switched on: then no methane is made.",
  state: biogasState,
  defaults: {
    step: 0,
    hasLeak: false,
    showNames: true,
    showGases: true,
    canStep: true,
    canLeak: false,
  },
  inputs: ["showNames", "showGases", "canStep", "canLeak"],
  derived: {
    [BiogasDerived.Gas]: {
      describe: "How full the gas tank is, 0 … 1",
      compute: (s) => gasOf(s),
    },
    [BiogasDerived.HasMethane]: {
      describe:
        "Whether methane is being made (the slurry has started digesting and no air leaks in)",
      compute: (s) => gasOf(s) > 0,
    },
    [BiogasDerived.IsManureOut]: {
      describe: "Whether the spent slurry has come out as manure",
      compute: (s) => s.step >= LAST_STEP,
    },
    [BiogasDerived.IsDone]: {
      describe: "Whether every step has been shown",
      compute: (s) => s.step >= LAST_STEP,
    },
  },
  actions: {
    [BiogasAction.Next]: act({
      describe: "Go to the next step",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = Math.min(LAST_STEP, s.step + 1);
        return set({ step }, stepped(step));
      },
    }),
    [BiogasAction.Back]: act({
      describe: "Go back a step",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => set({ step: Math.max(0, s.step - 1) }),
    }),
    [BiogasAction.Reset]: act({
      describe: "Start again from the first step",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
    [BiogasAction.SetLeak]: act({
      describe: "Let air leak into the digester, or seal it again",
      byLearner: true,
      args: z.object({ hasLeak: z.boolean() }).strict(),
      run: (_s, a) => set({ hasLeak: a.hasLeak }),
    }),
  },
  signals: {
    [BiogasSignal.Stepped]: { describe: "A new step was shown; the payload has the step" },
  },
  observe: (s) => ({
    summary: describeBiogas(s),
    elements: [
      { id: BiogasPart.Digester, value: s.step >= 1 ? "full of slurry" : "empty" },
      { id: BiogasPart.GasTank, value: `${Math.round(gasOf(s) * 100)}% full` },
      { id: BiogasPart.Steps, value: BIOGAS_STEPS[s.step]?.en ?? "" },
    ],
  }),
  parts: () => [
    BiogasPart.MixingTank,
    BiogasPart.Digester,
    BiogasPart.GasTank,
    BiogasPart.Stove,
    BiogasPart.Manure,
    BiogasPart.Steps,
    BiogasPart.Controls,
  ],
});
