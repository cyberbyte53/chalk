import { localizedSchema } from "@chalk/content";
import { SizeFit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

export const ButtonAction = { Press: "press" } as const;
export const ButtonSignal = { Pressed: "pressed" } as const;

const buttonState = z
  .object({
    label: localizedSchema,
    /** Off while it makes no sense to press it (e.g. a run is going). The lesson may own this with an IS. */
    isEnabled: z.boolean(),
  })
  .strict();
export type ButtonState = z.infer<typeof buttonState>;

const act = actionsFor<ButtonState>();

/** A button on the board. Pressing it only announces `pressed`; WHEN rules decide what happens. */
export const button = defineProp({
  type: "button",
  /** Words and controls: they reflow with the column (text sizes grow), never scale. */
  size: { fit: SizeFit.Fill },
  isExplainer: false,
  describe: "A button. Pressing it raises `pressed`; the lesson's rules decide what it does.",
  state: buttonState,
  defaults: { label: { en: "Go", hi: "चलो" }, isEnabled: true },
  inputs: ["label", "isEnabled"],
  actions: {
    [ButtonAction.Press]: act({
      describe: "Press it (what the learner's tap does)",
      changes: [],
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => (s.isEnabled ? set({}, { signal: ButtonSignal.Pressed }) : set({})),
    }),
  },
  signals: { [ButtonSignal.Pressed]: { describe: "It was pressed" } },
});
