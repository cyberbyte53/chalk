import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import type { Words } from "./words";

/**
 * How a power station turns a source into electricity, one stage at a time (NCERT 14.2–14.3).
 * Every kind ends the same way: something moving fast spins a turbine, and the turbine turns a
 * generator (Ch13). What differs is how the turbine is made to spin:
 * - model: Activity 14.3, a jet of steam from a pressure cooker on the fins of a ping-pong ball
 *   that turns a cycle dynamo and lights a bulb;
 * - thermal: coal or oil burnt to boil water, steam on the turbine;
 * - hydro: water held high behind a dam falls through pipes to the turbine at the bottom; the
 *   higher the water, the more energy each litre brings;
 * - geothermal: underground water meets a hot spot and turns to steam;
 * - nuclear: heat from fission boils water.
 * Stepping reveals the chain of energy forms; switching on runs the station.
 */

export const PlantKind = {
  Model: "model",
  Thermal: "thermal",
  Hydro: "hydro",
  Geothermal: "geothermal",
  Nuclear: "nuclear",
} as const;
export type PlantKind = (typeof PlantKind)[keyof typeof PlantKind];

/** One stage of a chain: what is there, and the form of energy it carries. */
export type Stage = { readonly what: Words; readonly form: Words };

const F = {
  chemical: { en: "chemical energy", hi: "रासायनिक ऊर्जा" },
  heat: { en: "heat", hi: "ऊष्मा" },
  kinetic: { en: "kinetic energy", hi: "गतिज ऊर्जा" },
  potential: { en: "potential energy", hi: "स्थितिज ऊर्जा" },
  electrical: { en: "electrical energy", hi: "विद्युत ऊर्जा" },
  light: { en: "light", hi: "प्रकाश" },
  nuclear: { en: "nuclear energy", hi: "नाभिकीय ऊर्जा" },
} as const satisfies Record<string, Words>;

const TURBINE: Stage = { what: { en: "turbine spins", hi: "टरबाइन घूमता है" }, form: F.kinetic };
const GENERATOR: Stage = {
  what: { en: "generator", hi: "जनित्र" },
  form: F.electrical,
};

export const STAGES: Readonly<Record<PlantKind, readonly Stage[]>> = {
  model: [
    { what: { en: "stove heats the cooker", hi: "चूल्हा कुकर को गरम करता है" }, form: F.heat },
    { what: { en: "jet of steam", hi: "भाप की धार" }, form: F.kinetic },
    { what: { en: "fins spin", hi: "पंख घूमते हैं" }, form: F.kinetic },
    { what: { en: "cycle dynamo", hi: "साइकिल डायनेमो" }, form: F.electrical },
    { what: { en: "bulb", hi: "बल्ब" }, form: F.light },
  ],
  thermal: [
    { what: { en: "coal", hi: "कोयला" }, form: F.chemical },
    { what: { en: "burning in the furnace", hi: "भट्टी में जलना" }, form: F.heat },
    { what: { en: "steam in the boiler", hi: "बॉयलर में भाप" }, form: F.kinetic },
    TURBINE,
    GENERATOR,
  ],
  hydro: [
    { what: { en: "flowing river", hi: "बहती नदी" }, form: F.kinetic },
    { what: { en: "water high behind the dam", hi: "बाँध के पीछे ऊँचा पानी" }, form: F.potential },
    { what: { en: "falling through the pipes", hi: "पाइपों से गिरता पानी" }, form: F.kinetic },
    TURBINE,
    GENERATOR,
  ],
  geothermal: [
    { what: { en: "hot spot of molten rock", hi: "पिघली चट्टानों का तप्त स्थल" }, form: F.heat },
    { what: { en: "underground water turns to steam", hi: "भूमिगत जल भाप बनता है" }, form: F.heat },
    { what: { en: "steam up the pipe", hi: "पाइप से ऊपर भाप" }, form: F.kinetic },
    TURBINE,
    GENERATOR,
  ],
  nuclear: [
    { what: { en: "uranium fuel", hi: "यूरेनियम ईंधन" }, form: F.nuclear },
    { what: { en: "fission in the reactor", hi: "रिएक्टर में विखंडन" }, form: F.heat },
    { what: { en: "steam", hi: "भाप" }, form: F.kinetic },
    TURBINE,
    GENERATOR,
  ],
};

/** Renewable or not, as NCERT sorts them; the class model is neither. */
export const RENEWABLE: Readonly<Record<PlantKind, boolean | null>> = {
  model: null,
  thermal: false,
  hydro: true,
  geothermal: true,
  nuclear: false,
};

export const MAX_LEVEL = 3;

export const PlantAction = {
  Next: "next",
  Reset: "reset",
  Switch: "switch",
  SetLevel: "setLevel",
} as const;
export const PlantSignal = { Stepped: "stepped", Switched: "switched" } as const;
export const PlantDerived = {
  Output: "output",
  Forms: "forms",
  IsRenewable: "isRenewable",
  IsDone: "isDone",
} as const;
export const PlantPart = { Picture: "picture", Chain: "chain", Controls: "controls" } as const;

const plantState = z
  .object({
    kind: z.nativeEnum(PlantKind),
    /** How many stages of the chain are shown, 0 … the chain's length. */
    step: z.number().int().min(0).max(5),
    isOn: z.boolean(),
    /** Hydro only: how high the water stands behind the dam, 0 (empty) … 3 (full). */
    level: z.number().int().min(0).max(MAX_LEVEL),
    showChain: z.boolean(),
    canStep: z.boolean(),
    canSwitch: z.boolean(),
    canSetLevel: z.boolean(),
  })
  .strict();
export type PlantState = z.infer<typeof plantState>;

/**
 * The share of full output, 0 … 1. Off gives nothing; a hydro station gives more the higher the
 * water (each litre falls further) and nothing from an empty reservoir.
 */
export function outputOf(s: Pick<PlantState, "kind" | "isOn" | "level">): number {
  if (!s.isOn) return 0;
  if (s.kind === PlantKind.Hydro) return s.level / MAX_LEVEL;
  return 1;
}

export const formsOf = (kind: PlantKind): string[] => STAGES[kind].map((st) => st.form.en);

export function describePlant(s: PlantState): string {
  const chain = STAGES[s.kind];
  const shown = chain
    .slice(0, s.step)
    .map((st) => `${st.what.en} (${st.form.en})`)
    .join(" → ");
  const name = {
    model:
      "Activity 14.3's model: a steam jet on a ping-pong-ball turbine turning a cycle dynamo and a bulb",
    thermal:
      "A thermal power plant: coal burnt in a furnace boils water; the steam spins a turbine that turns a generator",
    hydro: `A hydro power plant: a dam holds river water high (level ${s.level} of ${MAX_LEVEL}); it falls through pipes to a turbine at the bottom`,
    geothermal:
      "A geothermal plant: underground water meets a hot spot and turns to steam, piped up to a turbine",
    nuclear:
      "A nuclear power plant: heat from fission in the reactor boils water; the steam spins a turbine",
  }[s.kind];
  const run = s.isOn
    ? `It is running at ${Math.round(outputOf(s) * 100)}% of full output.`
    : "It is switched off.";
  return `${name}. ${s.step === 0 ? "No stage of the energy chain is shown yet." : `The chain so far: ${shown}.`} ${run}`;
}

const act = actionsFor<PlantState>();

export const powerPlant = defineProp({
  type: "powerPlant",
  describe:
    "A power station seen from the side, with its chain of energy forms stepped through: the class model of Activity 14.3 (steam jet, ping-pong-ball turbine, cycle dynamo, bulb), a thermal (coal) plant, a hydro plant behind a dam (the water level can be set: higher water, more output), a geothermal plant and a nuclear plant. Each ends in a turbine turning a generator.",
  state: plantState,
  defaults: {
    kind: PlantKind.Thermal,
    step: 0,
    isOn: false,
    level: 3,
    showChain: true,
    canStep: true,
    canSwitch: true,
    canSetLevel: false,
  },
  inputs: ["kind", "showChain", "canStep", "canSwitch", "canSetLevel"],
  derived: {
    [PlantDerived.Output]: {
      describe: "The share of full output, 0 … 1 (0 when off; hydro grows with the water level)",
      compute: (s) => outputOf(s),
    },
    [PlantDerived.Forms]: {
      describe: "The chain's energy forms in order, from the source to the generator",
      compute: (s) => formsOf(s.kind),
    },
    [PlantDerived.IsRenewable]: {
      describe: "Whether this source is renewable (null for the class model)",
      compute: (s) => RENEWABLE[s.kind],
    },
    [PlantDerived.IsDone]: {
      describe: "Whether the whole chain has been stepped through",
      compute: (s) => s.step >= STAGES[s.kind].length,
    },
  },
  actions: {
    [PlantAction.Next]: act({
      describe: "Show the next stage of the energy chain",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = Math.min(STAGES[s.kind].length, s.step + 1);
        return set(
          { step },
          { signal: PlantSignal.Stepped, payload: { step, isDone: step >= STAGES[s.kind].length } },
        );
      },
    }),
    [PlantAction.Reset]: act({
      describe: "Hide the chain again",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
    [PlantAction.Switch]: act({
      describe: "Switch the station on or off",
      byLearner: true,
      args: z.object({ isOn: z.boolean() }).strict(),
      run: (s, a) =>
        set(
          { isOn: a.isOn },
          {
            signal: PlantSignal.Switched,
            payload: { isOn: a.isOn, output: outputOf({ ...s, isOn: a.isOn }) },
          },
        ),
    }),
    [PlantAction.SetLevel]: act({
      describe: "Hydro: set how high the water stands behind the dam (0 … 3)",
      byLearner: true,
      args: z.object({ level: z.number().int().min(0).max(MAX_LEVEL) }).strict(),
      run: (s, a) =>
        set(
          { level: a.level },
          {
            signal: PlantSignal.Switched,
            payload: { isOn: s.isOn, output: outputOf({ ...s, level: a.level }) },
          },
        ),
    }),
  },
  signals: {
    [PlantSignal.Stepped]: { describe: "The next stage was shown; the payload has the step" },
    [PlantSignal.Switched]: {
      describe: "The station was switched or the water level changed; the payload has the output",
    },
  },
  invariant: (s) =>
    s.step > STAGES[s.kind].length ? "the step is beyond the end of this chain" : undefined,
  observe: (s) => ({
    summary: describePlant(s),
    elements: [
      { id: PlantPart.Picture, value: `${s.kind}, ${s.isOn ? "on" : "off"}` },
      ...(s.showChain && s.step > 0
        ? [
            {
              id: PlantPart.Chain,
              value: STAGES[s.kind]
                .slice(0, s.step)
                .map((st) => st.form.en)
                .join(" → "),
            },
          ]
        : []),
    ],
  }),
  parts: (s) => [PlantPart.Picture, ...(s.showChain ? [PlantPart.Chain] : []), PlantPart.Controls],
});
