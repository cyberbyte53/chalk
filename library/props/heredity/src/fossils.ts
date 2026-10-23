import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Fossils in rock layers (NCERT 9.5.2): dig down through the layers and the fossils get older —
 * horse-like animals near the top, dinosaurs below, sea creatures deepest. A stepped mode shows how
 * the layers formed one on top of another over millions of years.
 */

export const FossilMode = { Dig: "dig", Form: "form" } as const;
export type FossilMode = (typeof FossilMode)[keyof typeof FossilMode];

export const FossilAction = { Dig: "dig", Next: "next", Reset: "reset" } as const;
export const FossilSignal = { Dug: "dug", Stepped: "stepped" } as const;
export const FossilDerived = { Deepest: "deepest", OldestAge: "oldestAge" } as const;
export const FossilPart = { Section: "section", Next: "next" } as const;

/** The layers from the top down: what is in each and roughly how long ago (millions of years). */
export const LAYERS = [
  { id: "horse", name: "horse-like animals", age: 10 },
  { id: "dinosaur", name: "a dinosaur skull", age: 70 },
  { id: "sea", name: "sea creatures (shells)", age: 100 },
] as const;
export const FORM_STEPS = 4;

const fossilState = z
  .object({
    mode: z.nativeEnum(FossilMode),
    /** Dig mode: how many layers have been dug open, from the top. */
    dug: z.number().int().min(0).max(LAYERS.length),
    /** Form mode: which step of the story is shown. */
    step: z
      .number()
      .int()
      .min(0)
      .max(FORM_STEPS - 1),
    canDig: z.boolean(),
    canStep: z.boolean(),
  })
  .strict();
export type FossilState = z.infer<typeof fossilState>;

const FORM_WORDS = [
  "About 100 million years ago: sea creatures on the sea-bed die and are buried in sand. More sand piles on, and under its pressure it becomes sandstone, with the shells inside.",
  "Millions of years later, dinosaurs living there die and are buried in mud, which also hardens into rock, above the rock with the sea creatures.",
  "Millions of years later again, horse-like animals die and are fossilised in rock above these.",
  "Much later, water wears away some rock and shows the horse-like fossils. Dig deeper and the fossils get older and older.",
] as const;

export function describeFossils(s: FossilState): string {
  if (s.mode === FossilMode.Form) return FORM_WORDS[s.step] ?? "";
  const open = LAYERS.slice(0, s.dug);
  return `Rock layers seen from the side, the newest on top.${open.length === 0 ? " Nothing dug yet." : ` Dug open: ${open.map((l) => `${l.name}, about ${l.age} million years old`).join("; ")}.`} The deeper the layer, the older its fossils.`;
}

const act = actionsFor<FossilState>();

export const fossilLayers = defineProp({
  type: "fossilLayers",
  describe:
    "A cross-section of rock layers with fossils: horse-like animals near the top (about 10 million years old), a dinosaur skull below (about 70 million), sea creatures' shells deepest (about 100 million). Dig down one layer at a time: deeper is older. Form mode steps through how the layers piled up over millions of years and how erosion exposes them.",
  state: fossilState,
  defaults: { mode: FossilMode.Dig, dug: 0, step: 0, canDig: true, canStep: true },
  inputs: ["mode", "canDig", "canStep"],
  derived: {
    [FossilDerived.Deepest]: {
      describe: "The deepest layer dug open so far (horse, dinosaur, sea), or null",
      compute: (s) => (s.dug === 0 ? null : (LAYERS[s.dug - 1]?.id ?? null)),
    },
    [FossilDerived.OldestAge]: {
      describe: "The age in millions of years of the oldest fossil dug up, or null",
      compute: (s) => (s.dug === 0 ? null : (LAYERS[s.dug - 1]?.age ?? null)),
    },
  },
  actions: {
    [FossilAction.Dig]: act({
      describe: "Dig one layer deeper and see its fossils",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (s.dug >= LAYERS.length) return set({});
        const dug = s.dug + 1;
        return set(
          { dug },
          { signal: FossilSignal.Dug, payload: { dug, layer: LAYERS[dug - 1]?.id } },
        );
      },
    }),
    [FossilAction.Next]: act({
      describe: "Form mode: the next step of how the layers formed (after the last, the first)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = (s.step + 1) % FORM_STEPS;
        return set({ step }, { signal: FossilSignal.Stepped, payload: { step } });
      },
    }),
    [FossilAction.Reset]: act({
      describe: "Fill the hole back in / back to the first step",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ dug: 0, step: 0 }),
    }),
  },
  signals: {
    [FossilSignal.Dug]: { describe: "A layer was dug open; `layer` is which" },
    [FossilSignal.Stepped]: { describe: "Form mode moved to `step`" },
  },
  observe: (s) => ({
    summary: describeFossils(s),
    elements: [{ id: FossilPart.Section, value: describeFossils(s) }],
  }),
  parts: () => [FossilPart.Section, FossilPart.Next],
});
