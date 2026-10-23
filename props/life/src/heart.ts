import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * The heart and circulation (NCERT 6.4.1). Steps mode follows NCERT's six steps through the four
 * chambers: oxygen-rich blood from the lungs fills the left atrium, passes to the left ventricle,
 * which pumps it to the body; carbon dioxide-rich blood from the body fills the right atrium,
 * passes to the right ventricle, which pumps it to the lungs. Valves stop blood flowing backwards.
 * Circulation mode: the two loops (lungs and body), so blood passes through the heart twice per
 * round (double circulation). Fish mode: a two-chambered heart, one loop through the gills.
 * Vessels mode: an artery, a vein and a capillary in section.
 */

export const HeartMode = {
  Steps: "steps",
  Circulation: "circulation",
  Fish: "fish",
  Vessels: "vessels",
} as const;
export type HeartMode = (typeof HeartMode)[keyof typeof HeartMode];

export const Chamber = {
  LeftAtrium: "leftAtrium",
  LeftVentricle: "leftVentricle",
  RightAtrium: "rightAtrium",
  RightVentricle: "rightVentricle",
} as const;
export type Chamber = (typeof Chamber)[keyof typeof Chamber];

/** NCERT's six steps: which chamber fills (relaxes) and which contracts, and where blood goes. */
export const HEART_STEPS: readonly {
  fills: Chamber | null;
  contracts: Chamber | null;
  from: string;
  to: string;
}[] = [
  { fills: Chamber.LeftAtrium, contracts: null, from: "lungs", to: "leftAtrium" },
  {
    fills: Chamber.LeftVentricle,
    contracts: Chamber.LeftAtrium,
    from: "leftAtrium",
    to: "leftVentricle",
  },
  { fills: null, contracts: Chamber.LeftVentricle, from: "leftVentricle", to: "body" },
  { fills: Chamber.RightAtrium, contracts: null, from: "body", to: "rightAtrium" },
  {
    fills: Chamber.RightVentricle,
    contracts: Chamber.RightAtrium,
    from: "rightAtrium",
    to: "rightVentricle",
  },
  { fills: null, contracts: Chamber.RightVentricle, from: "rightVentricle", to: "lungs" },
];

export const HeartAction = { Next: "next", Back: "back", Reset: "reset" } as const;
export const HeartSignal = { Stepped: "stepped" } as const;
export const HeartDerived = {
  Fills: "fills",
  Contracts: "contracts",
  BloodTo: "bloodTo",
  IsOxygenRich: "isOxygenRich",
} as const;
export const HeartPart = { Picture: "picture", Next: "next" } as const;

const heartState = z
  .object({
    mode: z.nativeEnum(HeartMode),
    step: z
      .number()
      .int()
      .min(0)
      .max(HEART_STEPS.length - 1),
    showNames: z.boolean(),
    canStep: z.boolean(),
  })
  .strict();
export type HeartState = z.infer<typeof heartState>;

const STEP_WORDS = [
  "Oxygen-rich blood from the lungs flows into the left atrium, the thin-walled upper chamber on the heart's left, as it relaxes.",
  "The left atrium contracts while the left ventricle below it relaxes, so the blood passes down into the left ventricle. A valve stops it flowing back.",
  "The muscular left ventricle contracts and pumps the oxygen-rich blood out to the rest of the body.",
  "Blood from the body, full of carbon dioxide, flows into the right atrium as it relaxes.",
  "The right atrium contracts while the right ventricle below it dilates, so the blood passes into the right ventricle.",
  "The right ventricle contracts and pumps the blood to the lungs, to give up carbon dioxide and take in oxygen.",
] as const;

export function describeHeart(s: HeartState): string {
  if (s.mode === HeartMode.Circulation)
    return "Double circulation: the right side of the heart pumps blood to the lungs and back to the left side; the left side pumps it round the body and back to the right side. Each round, blood passes through the heart twice, and oxygen-rich and carbon dioxide-rich blood never mix.";
  if (s.mode === HeartMode.Fish)
    return "A fish's heart has only two chambers: it pumps blood to the gills, where it takes in oxygen, and from there straight on to the rest of the body and back. Blood passes through the heart only once each round.";
  if (s.mode === HeartMode.Vessels)
    return "Three kinds of blood vessel in section: an artery (thick, elastic wall: carries blood away from the heart under high pressure), a vein (thinner wall, with valves so blood flows one way only: brings blood back to the heart), and a capillary (a wall one cell thick, where materials pass between the blood and the cells).";
  return STEP_WORDS[s.step] ?? STEP_WORDS[0];
}

const act = actionsFor<HeartState>();
const stepped = (step: number) => ({ signal: HeartSignal.Stepped, payload: { step } });

export const heart = defineProp({
  type: "heart",
  describe:
    "The human heart. Steps mode: NCERT's six steps through the four chambers (left atrium, left ventricle, right atrium, right ventricle), with valves and oxygen-rich vs carbon dioxide-rich blood. Circulation mode: the lung loop and the body loop (double circulation). Fish mode: a two-chambered heart and one loop through the gills. Vessels mode: artery, vein and capillary.",
  state: heartState,
  defaults: { mode: HeartMode.Steps, step: 0, showNames: true, canStep: true },
  inputs: ["mode", "showNames", "canStep"],
  derived: {
    [HeartDerived.Fills]: {
      describe: "Steps mode: the chamber relaxing and filling now, or null",
      compute: (s) => HEART_STEPS[s.step]?.fills ?? null,
    },
    [HeartDerived.Contracts]: {
      describe: "Steps mode: the chamber contracting now, or null",
      compute: (s) => HEART_STEPS[s.step]?.contracts ?? null,
    },
    [HeartDerived.BloodTo]: {
      describe: "Steps mode: where the blood is going now (a chamber, 'body' or 'lungs')",
      compute: (s) => HEART_STEPS[s.step]?.to ?? null,
    },
    [HeartDerived.IsOxygenRich]: {
      describe: "Steps mode: whether the blood moving now is oxygen-rich (the left side)",
      compute: (s) => s.step < 3,
    },
  },
  actions: {
    [HeartAction.Next]: act({
      describe: "Steps mode: the next step (after the sixth, back to the first)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = (s.step + 1) % HEART_STEPS.length;
        return set({ step }, stepped(step));
      },
    }),
    [HeartAction.Back]: act({
      describe: "Steps mode: the step before",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = Math.max(0, s.step - 1);
        return set({ step }, stepped(step));
      },
    }),
    [HeartAction.Reset]: act({
      describe: "Steps mode: back to the first step",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }, stepped(0)),
    }),
  },
  signals: { [HeartSignal.Stepped]: { describe: "Moved to `step`" } },
  observe: (s) => ({
    summary: describeHeart(s),
    elements: [{ id: HeartPart.Picture, value: describeHeart(s) }],
  }),
  parts: () => [HeartPart.Picture, HeartPart.Next],
});
