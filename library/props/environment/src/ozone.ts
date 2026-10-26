import { type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * The ozone layer (NCERT 15.2.1).
 * - formation: high in the atmosphere, UV from the Sun splits some O₂ into two free O atoms (step 1);
 *   each O joins an O₂ to make ozone, O₃ (step 2).
 * - shield: the ozone layer stops most UV from reaching the Earth. CFCs (refrigerants, fire
 *   extinguishers) thin it, so more UV gets through. Levels are illustrative, not measurements.
 */

export const OzoneMode = { Formation: "formation", Shield: "shield" } as const;
export type OzoneMode = (typeof OzoneMode)[keyof typeof OzoneMode];

export const FORMATION_STEPS = 3;
export const MAX_CFC = 3;
/** UV rays drawn arriving from the Sun. */
export const UV_RAYS = 5;

/** How thick the layer is, as a share of its full thickness, for a CFC level 0–3. */
export const ozoneShareOf = (cfc: number): number => 1 - 0.25 * cfc;
/** How many of the UV rays get through to the ground. */
export const uvThroughOf = (cfc: number): number =>
  cfc === 0 ? 0 : Math.min(UV_RAYS, cfc + Math.floor(cfc / 2));

export const OzoneAction = { Next: "next", Reset: "reset", SetCfc: "setCfc" } as const;
export const OzoneSignal = { Stepped: "stepped", Formed: "formed", Changed: "changed" } as const;
export const OzoneDerived = {
  OzoneShare: "ozoneShare",
  UvThrough: "uvThrough",
  IsShielded: "isShielded",
  IsFormed: "isFormed",
} as const;
export const OzonePart = { Sky: "sky", Next: "next", Cfc: "cfc" } as const;

const ozoneState = z
  .object({
    mode: z.nativeEnum(OzoneMode),
    /** formation: 0 = O₂ and incoming UV, 1 = split into O atoms, 2 = O + O₂ → O₃. */
    step: z
      .number()
      .int()
      .min(0)
      .max(FORMATION_STEPS - 1),
    /** shield: how much CFC has reached the ozone layer, 0 (none) to 3 (a lot). */
    cfc: z.number().int().min(0).max(MAX_CFC),
    showNames: z.boolean(),
    showEquation: z.boolean(),
    canStep: z.boolean(),
    canSetCfc: z.boolean(),
  })
  .strict();
export type OzoneState = z.infer<typeof ozoneState>;

const STEP_WORDS = [
  "High in the atmosphere there are oxygen molecules, O₂ (two oxygen atoms each), and high-energy ultraviolet (UV) radiation arrives from the Sun.",
  "The UV splits some O₂ molecules apart into free oxygen atoms: O₂ → O + O.",
  "Each free O atom joins an O₂ molecule to make ozone, O₃ (three oxygen atoms): O + O₂ → O₃.",
];

export function describeOzone(s: OzoneState): string {
  if (s.mode === OzoneMode.Formation)
    return `How ozone forms, step ${s.step + 1} of ${FORMATION_STEPS}: ${STEP_WORDS[s.step]}`;
  const share = Math.round(ozoneShareOf(s.cfc) * 100);
  const through = uvThroughOf(s.cfc);
  return s.cfc === 0
    ? `The ozone layer high above the Earth is at its full thickness and stops the Sun's UV rays; none reach the ground.`
    : `CFCs (from refrigerators and fire extinguishers) have reached the ozone layer and thinned it to about ${share}% of its thickness. ${through} of ${UV_RAYS} UV rays now get through to the ground, where UV can cause skin cancer.`;
}

const act = actionsFor<OzoneState>();

export const ozoneLayer = defineProp({
  type: "ozoneLayer",
  describe:
    "The ozone layer. Formation mode steps through how ozone forms high in the atmosphere: UV splits O₂ into two O atoms, then O + O₂ → O₃. Shield mode shows the layer stopping the Sun's UV; adding CFCs (refrigerants, fire extinguishers) thins it and lets UV reach the ground (levels illustrative).",
  state: ozoneState,
  defaults: {
    mode: OzoneMode.Formation,
    step: 0,
    cfc: 0,
    showNames: true,
    showEquation: true,
    canStep: true,
    canSetCfc: true,
  },
  inputs: ["mode", "showNames", "showEquation", "canStep", "canSetCfc"],
  derived: {
    [OzoneDerived.OzoneShare]: {
      describe: "How thick the ozone layer is, as a share of its full thickness (0 to 1)",
      compute: (s) => ozoneShareOf(s.cfc),
    },
    [OzoneDerived.UvThrough]: {
      describe: `How many of the ${UV_RAYS} UV rays reach the ground`,
      compute: (s) => uvThroughOf(s.cfc),
    },
    [OzoneDerived.IsShielded]: {
      describe: "Whether the layer stops all the UV (no CFCs)",
      compute: (s) => s.cfc === 0,
    },
    [OzoneDerived.IsFormed]: {
      describe: "Whether the formation steps have reached ozone, O₃",
      compute: (s) => s.step === FORMATION_STEPS - 1,
    },
  },
  actions: {
    [OzoneAction.Next]: act({
      describe: "Next step of how ozone forms",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = Math.min(s.step + 1, FORMATION_STEPS - 1);
        const emit: Emit[] = [{ signal: OzoneSignal.Stepped, payload: { step } }];
        if (step === FORMATION_STEPS - 1 && s.step < step)
          emit.push({ signal: OzoneSignal.Formed, payload: { step } });
        return set({ step }, ...emit);
      },
    }),
    [OzoneAction.Reset]: act({
      describe: "Back to the first step",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
    [OzoneAction.SetCfc]: act({
      describe: "Set how much CFC has reached the ozone layer, 0 (none) to 3 (a lot)",
      byLearner: true,
      args: z.object({ level: z.number().int().min(0).max(MAX_CFC) }).strict(),
      run: (_s, a) =>
        set(
          { cfc: a.level },
          {
            signal: OzoneSignal.Changed,
            payload: { cfc: a.level, uvThrough: uvThroughOf(a.level) },
          },
        ),
    }),
  },
  signals: {
    [OzoneSignal.Stepped]: { describe: "Moved to formation step `step`" },
    [OzoneSignal.Formed]: { describe: "The steps have reached ozone, O₃" },
    [OzoneSignal.Changed]: {
      describe: "The CFC level changed; the payload says how many UV rays get through",
    },
  },
  observe: (s) => ({
    summary: describeOzone(s),
    elements: [{ id: OzonePart.Sky, value: describeOzone(s) }],
  }),
  parts: () => [OzonePart.Sky, OzonePart.Next, OzonePart.Cfc],
});
