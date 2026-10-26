import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * The thermit reaction (NCERT 3.4.4, Fig 3.11): a mixture of iron(III) oxide and aluminium powder
 * in a crucible above the gap between two railway tracks. Lit, aluminium (more reactive) takes the
 * oxygen from iron oxide so violently that the iron comes out molten; it runs into the gap and,
 * once it cools, joins the tracks.
 */

export const ThermitAction = { Ignite: "ignite", Reset: "reset" } as const;
export const ThermitSignal = { Ignited: "ignited" } as const;
export const ThermitDerived = { IsJoined: "isJoined" } as const;
export const ThermitPart = {
  Rails: "rails",
  Crucible: "crucible",
  Equation: "equation",
  Ignite: "ignite",
} as const;

export const THERMIT_EQUATION = "Fe₂O₃ + 2Al → 2Fe + Al₂O₃ + heat";
export const THERMIT_EQUATION_WORDS = {
  en: THERMIT_EQUATION,
  hi: "Fe₂O₃ + 2Al → 2Fe + Al₂O₃ + ऊष्मा",
} as const;

const thermitState = z
  .object({
    isIgnited: z.boolean(),
    showEquation: z.boolean(),
    canIgnite: z.boolean(),
  })
  .strict();
export type ThermitState = z.infer<typeof thermitState>;

export const describeThermit = (s: ThermitState): string =>
  s.isIgnited
    ? `The thermit mixture burns with a blinding glow; molten iron pours into the gap and, cooled, joins the two rails (${THERMIT_EQUATION}).`
    : "Two railway tracks with a gap between them; above it, a crucible of iron(III) oxide and aluminium powder, not lit yet.";

const act = actionsFor<ThermitState>();

export const thermitWeld = defineProp({
  type: "thermitWeld",
  describe:
    "The thermit reaction joining railway tracks (NCERT 3.4.4, Fig 3.11): iron(III) oxide and aluminium powder in a crucible above the gap between two rails. Lit, the aluminium displaces iron from its oxide; so much heat is given out that the iron is molten. It runs into the gap and joins the rails when it cools.",
  state: thermitState,
  defaults: { isIgnited: false, showEquation: true, canIgnite: true },
  inputs: ["showEquation", "canIgnite"],
  derived: {
    [ThermitDerived.IsJoined]: {
      describe: "The molten iron has run into the gap and joined the rails",
      compute: (s) => s.isIgnited,
    },
  },
  actions: {
    [ThermitAction.Ignite]: act({
      describe: "Light the thermit mixture",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ isIgnited: true }, { signal: ThermitSignal.Ignited }),
    }),
    [ThermitAction.Reset]: act({
      describe: "Back to the unlit crucible and the gap",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ isIgnited: false }),
    }),
  },
  signals: {
    [ThermitSignal.Ignited]: { describe: "The thermit mixture was lit" },
  },
  observe: (s) => {
    const elements: Element[] = [
      { id: ThermitPart.Rails, value: s.isIgnited ? "joined by iron" : "a gap between them" },
      {
        id: ThermitPart.Crucible,
        value: s.isIgnited ? "burnt out" : "iron(III) oxide and aluminium powder",
      },
    ];
    if (s.showEquation) elements.push({ id: ThermitPart.Equation, value: THERMIT_EQUATION });
    return { summary: describeThermit(s), elements };
  },
  parts: (s) => [
    ThermitPart.Rails,
    ThermitPart.Crucible,
    ...(s.showEquation ? [ThermitPart.Equation] : []),
    ...(s.canIgnite ? [ThermitPart.Ignite] : []),
  ],
});
