import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Breathing (NCERT 6.3). Chest mode: the human respiratory system; breathing in lifts the ribs and
 * flattens the diaphragm, the chest gets bigger and air is sucked in through the nostrils, throat
 * and bronchi into the lungs; breathing out reverses it (the lungs never empty fully: a residual
 * volume stays). Alveolus mode: one air sac wrapped in capillaries; oxygen passes from the air into
 * the blood, carbon dioxide from the blood into the air. Fish mode: water taken in at the mouth and
 * forced over the gills, where the blood takes up the oxygen dissolved in it.
 */

export const BreathingMode = { Chest: "chest", Alveolus: "alveolus", Fish: "fish" } as const;
export type BreathingMode = (typeof BreathingMode)[keyof typeof BreathingMode];

export const BreathingAction = { SetPhase: "setPhase" } as const;
export const BreathingSignal = { Breathed: "breathed" } as const;
export const BreathingDerived = {
  AirFlow: "airFlow",
  Ribs: "ribs",
  Diaphragm: "diaphragm",
  Chest: "chest",
} as const;
export const BreathingPart = { Picture: "picture", In: "in", Out: "out" } as const;

const breathingState = z
  .object({
    mode: z.nativeEnum(BreathingMode),
    /** Chest mode: breathing in (true) or out (false). */
    isIn: z.boolean(),
    showNames: z.boolean(),
    canBreathe: z.boolean(),
  })
  .strict();
export type BreathingState = z.infer<typeof breathingState>;

export function describeBreathing(s: BreathingState): string {
  if (s.mode === BreathingMode.Alveolus)
    return "One alveolus, a balloon-like air sac at the end of the smallest tubes in the lungs, wrapped in a network of blood capillaries. Oxygen passes from the air inside into the blood; carbon dioxide passes from the blood into the air, to be breathed out.";
  if (s.mode === BreathingMode.Fish)
    return "A fish takes water in through its mouth and forces it out over its gills, behind the eyes; the blood in the gills takes up the oxygen dissolved in the water. Water holds much less oxygen than air, so fish breathe much faster than we do.";
  return s.isIn
    ? "Breathing in: the ribs lift and the diaphragm flattens, so the chest gets bigger and air is sucked in through the nostrils, down the throat (held open by rings of cartilage) and the bronchi, into the lungs' alveoli."
    : "Breathing out: the ribs come down and the diaphragm domes up again, the chest gets smaller and air is pushed out; some air always stays in the lungs.";
}

const act = actionsFor<BreathingState>();

export const breathing = defineProp({
  type: "breathing",
  describe:
    "Breathing. Chest mode: the respiratory system (nostrils, throat with cartilage rings, bronchi, lungs, ribs, diaphragm); breathe in (ribs up, diaphragm flat, chest bigger, air in) or out. Alveolus mode: gas exchange in one air sac with its capillaries. Fish mode: water over the gills.",
  state: breathingState,
  defaults: { mode: BreathingMode.Chest, isIn: false, showNames: true, canBreathe: true },
  inputs: ["mode", "showNames", "canBreathe"],
  derived: {
    [BreathingDerived.AirFlow]: {
      describe: "Chest mode: which way air is moving ('in' or 'out')",
      compute: (s) => (s.isIn ? "in" : "out"),
    },
    [BreathingDerived.Ribs]: {
      describe: "Chest mode: the ribs 'lifted' (breathing in) or 'lowered'",
      compute: (s) => (s.isIn ? "lifted" : "lowered"),
    },
    [BreathingDerived.Diaphragm]: {
      describe: "Chest mode: the diaphragm 'flat' (breathing in) or 'domed'",
      compute: (s) => (s.isIn ? "flat" : "domed"),
    },
    [BreathingDerived.Chest]: {
      describe: "Chest mode: the chest cavity 'larger' (breathing in) or 'smaller'",
      compute: (s) => (s.isIn ? "larger" : "smaller"),
    },
  },
  actions: {
    [BreathingAction.SetPhase]: act({
      describe: "Chest mode: breathe in (true) or out (false)",
      byLearner: true,
      args: z.object({ in: z.boolean() }).strict(),
      run: (_s, a) =>
        set({ isIn: a.in }, { signal: BreathingSignal.Breathed, payload: { in: a.in } }),
    }),
  },
  signals: { [BreathingSignal.Breathed]: { describe: "A breath in or out" } },
  observe: (s) => ({
    summary: describeBreathing(s),
    elements: [{ id: BreathingPart.Picture, value: describeBreathing(s) }],
  }),
  parts: () => [BreathingPart.Picture, BreathingPart.In, BreathingPart.Out],
});
