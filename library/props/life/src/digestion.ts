import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Digestion in human beings (NCERT 6.2.4). Journey mode follows a mouthful along the alimentary
 * canal, one part at a time: what each part adds or does, and what the starch, protein and fat in
 * the food have become so far. Saliva-test mode is Activity 6.3: starch solution with and without
 * saliva, then iodine; only the tube without saliva still has starch (blue-black).
 */

export const DigestionMode = { Journey: "journey", SalivaTest: "salivaTest" } as const;
export type DigestionMode = (typeof DigestionMode)[keyof typeof DigestionMode];

export const Stage = {
  Mouth: "mouth",
  Oesophagus: "oesophagus",
  Stomach: "stomach",
  SmallIntestine: "smallIntestine",
  Villi: "villi",
  LargeIntestine: "largeIntestine",
  Anus: "anus",
} as const;
export type Stage = (typeof Stage)[keyof typeof Stage];
export const STAGES: readonly Stage[] = Object.values(Stage);
export const SALIVA_STEPS = 3;

export const DigestionAction = {
  Next: "next",
  Back: "back",
  GoTo: "goTo",
  Reset: "reset",
} as const;
export const DigestionSignal = { Moved: "moved" } as const;
export const DigestionDerived = {
  Stage: "stage",
  Starch: "starch",
  Protein: "protein",
  Fat: "fat",
  Juices: "juices",
  StarchLeftIn: "starchLeftIn",
} as const;
export const DigestionPart = { Canal: "canal", Panel: "panel", Next: "next" } as const;

/** What the starch, protein and fat have become by each stage. */
export type Form = "whole" | "begun" | "simple" | "absorbed";

export const FORMS: Readonly<Record<Stage, { starch: Form; protein: Form; fat: Form }>> = {
  mouth: { starch: "begun", protein: "whole", fat: "whole" },
  oesophagus: { starch: "begun", protein: "whole", fat: "whole" },
  stomach: { starch: "begun", protein: "begun", fat: "whole" },
  smallIntestine: { starch: "simple", protein: "simple", fat: "simple" },
  villi: { starch: "absorbed", protein: "absorbed", fat: "absorbed" },
  largeIntestine: { starch: "absorbed", protein: "absorbed", fat: "absorbed" },
  anus: { starch: "absorbed", protein: "absorbed", fat: "absorbed" },
};

/** The juices and what each part of the canal adds or does. */
export const JUICES: Readonly<Record<Stage, readonly string[]>> = {
  mouth: ["teeth", "saliva (salivary amylase)", "tongue"],
  oesophagus: ["peristalsis"],
  stomach: ["hydrochloric acid", "pepsin", "mucus"],
  smallIntestine: [
    "bile (from the liver)",
    "pancreatic juice (trypsin, lipase)",
    "intestinal juice",
  ],
  villi: ["villi", "blood vessels"],
  largeIntestine: ["water absorbed"],
  anus: ["anal sphincter"],
};

const STAGE_WORDS: Readonly<Record<Stage, string>> = {
  mouth:
    "Mouth: teeth crush the food, saliva wets it, and the enzyme salivary amylase in saliva starts breaking starch into sugar. The tongue mixes it.",
  oesophagus:
    "Food-pipe (oesophagus): muscles in its wall contract in waves (peristalsis) and push the food down to the stomach.",
  stomach:
    "Stomach: gastric glands release hydrochloric acid (makes it acidic so pepsin can work), pepsin (starts digesting protein) and mucus (protects the stomach's lining from the acid). A sphincter muscle lets food out a little at a time.",
  smallIntestine:
    "Small intestine, the longest part: bile from the liver makes the food alkaline and breaks fat into small droplets; pancreatic juice brings trypsin (protein) and lipase (fat); intestinal juice finishes the job. Starch → glucose, protein → amino acids, fat → fatty acids and glycerol.",
  villi:
    "Villi: the inner wall of the small intestine has many finger-like projections, giving a large surface. The digested food passes into the blood vessels in them and is carried to every cell.",
  largeIntestine:
    "Large intestine: what could not be absorbed comes here, and its wall takes back more water.",
  anus: "Anus: the rest leaves the body; the anal sphincter controls when.",
};

const SALIVA_WORDS = [
  "Two test tubes of starch solution: A gets 1 mL of saliva, B gets none.",
  "Both are left for 20 to 30 minutes.",
  "A few drops of iodine in each: B turns blue-black (starch is still there); A does not change colour much (the saliva has broken the starch down).",
] as const;

const digestionState = z
  .object({
    mode: z.nativeEnum(DigestionMode),
    /** Journey: which part of the canal the food is in (index into STAGES). SalivaTest: the step. */
    step: z
      .number()
      .int()
      .min(0)
      .max(STAGES.length - 1),
    canStep: z.boolean(),
  })
  .strict();
export type DigestionState = z.infer<typeof digestionState>;

export const stepsOf = (mode: DigestionMode): number =>
  mode === DigestionMode.Journey ? STAGES.length : SALIVA_STEPS;

export const stageOf = (s: Pick<DigestionState, "mode" | "step">): Stage | null =>
  s.mode === DigestionMode.Journey ? (STAGES[s.step] ?? null) : null;

export function describeDigestion(s: DigestionState): string {
  const stage = stageOf(s);
  if (stage !== null) return STAGE_WORDS[stage];
  return SALIVA_WORDS[s.step] ?? SALIVA_WORDS[0];
}

const act = actionsFor<DigestionState>();
const moved = (step: number) => ({ signal: DigestionSignal.Moved, payload: { step } });

export const digestiveTract = defineProp({
  type: "digestiveTract",
  describe:
    "The human alimentary canal. Journey mode follows food through mouth, oesophagus, stomach, small intestine, villi, large intestine and anus, showing at each part its juices and what the starch, protein and fat have become (whole, begun, simple: glucose / amino acids / fatty acids and glycerol, absorbed). Saliva-test mode (Activity 6.3): starch with and without saliva, then iodine.",
  state: digestionState,
  defaults: { mode: DigestionMode.Journey, step: 0, canStep: true },
  inputs: ["mode", "canStep"],
  invariant: (s) => (s.step < stepsOf(s.mode) ? undefined : "step is past the last step"),
  derived: {
    [DigestionDerived.Stage]: {
      describe: "Journey: which part of the canal the food is in; null in the saliva test",
      compute: (s) => stageOf(s),
    },
    [DigestionDerived.Starch]: {
      describe: "Journey: what the starch has become (whole, begun, simple = glucose, absorbed)",
      compute: (s) => {
        const st = stageOf(s);
        return st === null ? null : FORMS[st].starch;
      },
    },
    [DigestionDerived.Protein]: {
      describe:
        "Journey: what the protein has become (whole, begun, simple = amino acids, absorbed)",
      compute: (s) => {
        const st = stageOf(s);
        return st === null ? null : FORMS[st].protein;
      },
    },
    [DigestionDerived.Fat]: {
      describe:
        "Journey: what the fat has become (whole, begun, simple = fatty acids and glycerol, absorbed)",
      compute: (s) => {
        const st = stageOf(s);
        return st === null ? null : FORMS[st].fat;
      },
    },
    [DigestionDerived.Juices]: {
      describe: "Journey: what this part adds or does (juices, enzymes, movements)",
      compute: (s) => {
        const st = stageOf(s);
        return st === null ? [] : JUICES[st];
      },
    },
    [DigestionDerived.StarchLeftIn]: {
      describe: "Saliva test, once iodine is added: which tube still has starch ('B'); null before",
      compute: (s) =>
        s.mode === DigestionMode.SalivaTest && s.step === SALIVA_STEPS - 1 ? "B" : null,
    },
  },
  actions: {
    [DigestionAction.Next]: act({
      describe: "Move the food on to the next part (or the next step of the test)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = Math.min(s.step + 1, stepsOf(s.mode) - 1);
        return set({ step }, moved(step));
      },
    }),
    [DigestionAction.Back]: act({
      describe: "Go back one part",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = Math.max(s.step - 1, 0);
        return set({ step }, moved(step));
      },
    }),
    [DigestionAction.GoTo]: act({
      describe: "Journey: jump to one part of the canal",
      args: z.object({ stage: z.nativeEnum(Stage) }).strict(),
      run: (_s, a) => {
        const step = STAGES.indexOf(a.stage);
        return set({ mode: DigestionMode.Journey, step }, moved(step));
      },
    }),
    [DigestionAction.Reset]: act({
      describe: "Back to the start",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }, moved(0)),
    }),
  },
  signals: { [DigestionSignal.Moved]: { describe: "The food (or the test) moved to `step`" } },
  observe: (s) => ({
    summary: describeDigestion(s),
    elements: [{ id: DigestionPart.Canal, value: describeDigestion(s) }],
  }),
  parts: () => [DigestionPart.Canal, DigestionPart.Panel, DigestionPart.Next],
});
