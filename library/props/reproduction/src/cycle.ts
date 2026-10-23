import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * What happens when the egg is not fertilised (NCERT 8.3.3 c), as a simple monthly cycle: the
 * uterus lining thickens and is richly supplied with blood; an ovary releases an egg; the egg is
 * not fertilised and lives for about a day; the lining is not needed, breaks down and comes out
 * through the vagina as blood and mucus (menstruation, usually 2 to 8 days); the cycle repeats
 * roughly every month.
 */

export const CYCLE_STEPS = 4;

export const CycleAction = { Next: "next", Reset: "reset" } as const;
export const CycleSignal = { Stepped: "stepped" } as const;
export const CycleDerived = { Lining: "lining", IsDone: "isDone" } as const;
export const CyclePart = { Picture: "picture", Next: "next" } as const;

const cycleState = z
  .object({
    step: z
      .number()
      .int()
      .min(0)
      .max(CYCLE_STEPS - 1),
    showNames: z.boolean(),
    canStep: z.boolean(),
  })
  .strict();
export type CycleState = z.infer<typeof cycleState>;

/** The uterus lining at each step: building up, thick, thick, breaking down. */
export const LINING: readonly ("thin" | "thick" | "breaking")[] = [
  "thick",
  "thick",
  "thick",
  "breaking",
];

const WORDS = [
  "Every month the uterus prepares to receive a fertilised egg: its lining becomes thick and spongy, richly supplied with blood.",
  "One of the ovaries releases an egg.",
  "The egg is not fertilised. It lives for about one day.",
  "The thick lining is not needed any longer. It slowly breaks and comes out through the vagina as blood and mucus: menstruation, which usually lasts two to eight days. The cycle repeats roughly every month.",
] as const;

export const describeCycle = (s: CycleState): string => WORDS[s.step] ?? WORDS[0];

const act = actionsFor<CycleState>();

export const menstrualCycle = defineProp({
  type: "menstrualCycle",
  describe:
    "A simple monthly cycle (4 steps), at NCERT's level: the uterus lining thickens; an ovary releases an egg; the egg is not fertilised and lives about a day; the lining breaks down and leaves as blood and mucus (menstruation, 2–8 days), roughly every month.",
  state: cycleState,
  defaults: { step: 0, showNames: true, canStep: true },
  inputs: ["showNames", "canStep"],
  derived: {
    [CycleDerived.Lining]: {
      describe: "The uterus lining now: 'thick' or 'breaking'",
      compute: (s) => LINING[s.step] ?? "thick",
    },
    [CycleDerived.IsDone]: {
      describe: "The last step (menstruation) is showing",
      compute: (s) => s.step === CYCLE_STEPS - 1,
    },
  },
  actions: {
    [CycleAction.Next]: act({
      describe: "Show the next step (stays on the last)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = Math.min(s.step + 1, CYCLE_STEPS - 1);
        return set({ step }, { signal: CycleSignal.Stepped, payload: { step } });
      },
    }),
    [CycleAction.Reset]: act({
      describe: "Back to the start of the cycle",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
  },
  signals: { [CycleSignal.Stepped]: { describe: "Moved to `step`" } },
  observe: (s) => ({
    summary: describeCycle(s),
    elements: [{ id: CyclePart.Picture, value: describeCycle(s) }],
  }),
  parts: () => [CyclePart.Picture, CyclePart.Next],
});
