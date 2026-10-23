import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { SUBSTANCES, SubstanceId } from "./acid-data";

/**
 * Does the solution conduct? (Activity 2.8): two nails through a cork in a beaker, wired through
 * a bulb and a switch to a 6 volt battery. Pick a solution and switch on: the bulb glows only if
 * the solution has ions to carry the current. A close-up shows what is in the water.
 */

export const ConductAction = { Choose: "choose", Switch: "switch" } as const;
export const ConductSignal = { Switched: "switched", Chosen: "chosen" } as const;
export const ConductDerived = { Glows: "glows", Brightness: "brightness", Ions: "ions" } as const;
export const ConductPart = {
  Bulb: "bulb",
  Beaker: "beaker",
  Switch: "switch",
  CloseUp: "closeUp",
  Solutions: "solutions",
} as const;

/** The solutions this bench knows (Activity 2.8 and around it). */
export const CONDUCT_SOLUTIONS = [
  SubstanceId.HydrochloricAcid,
  SubstanceId.SulphuricAcid,
  SubstanceId.AceticAcid,
  SubstanceId.SodiumHydroxide,
  SubstanceId.CalciumHydroxide,
  SubstanceId.GlucoseSolution,
  SubstanceId.Alcohol,
  SubstanceId.DistilledWater,
  SubstanceId.RainWater,
  SubstanceId.SaltWater,
  SubstanceId.SugarSolution,
] as const;
export type ConductSolution = (typeof CONDUCT_SOLUTIONS)[number];

/** What is in the water: ions (with their charge) or whole molecules. */
export type Particle = { label: string; charge: 1 | -1 | 0 };

export const PARTICLES: Record<ConductSolution, readonly Particle[]> = {
  hydrochloricAcid: [
    { label: "H₃O⁺", charge: 1 },
    { label: "Cl⁻", charge: -1 },
  ],
  sulphuricAcid: [
    { label: "H₃O⁺", charge: 1 },
    { label: "SO₄²⁻", charge: -1 },
  ],
  aceticAcid: [
    { label: "CH₃COOH", charge: 0 },
    { label: "H₃O⁺", charge: 1 },
    { label: "CH₃COO⁻", charge: -1 },
  ],
  sodiumHydroxide: [
    { label: "Na⁺", charge: 1 },
    { label: "OH⁻", charge: -1 },
  ],
  calciumHydroxide: [
    { label: "Ca²⁺", charge: 1 },
    { label: "OH⁻", charge: -1 },
  ],
  glucoseSolution: [{ label: "C₆H₁₂O₆", charge: 0 }],
  alcohol: [{ label: "C₂H₅OH", charge: 0 }],
  distilledWater: [{ label: "H₂O", charge: 0 }],
  rainWater: [
    { label: "H₂O", charge: 0 },
    { label: "H₃O⁺", charge: 1 },
    { label: "HCO₃⁻", charge: -1 },
  ],
  saltWater: [
    { label: "Na⁺", charge: 1 },
    { label: "Cl⁻", charge: -1 },
  ],
  sugarSolution: [{ label: "C₁₂H₂₂O₁₁", charge: 0 }],
};

const conductState = z
  .object({
    solution: z.enum(CONDUCT_SOLUTIONS),
    /** The solutions the learner may pour in (1–8). */
    solutions: z.array(z.enum(CONDUCT_SOLUTIONS)).min(1).max(8),
    isOn: z.boolean(),
    /** A close-up of what is in the water. */
    showIons: z.boolean(),
    canChoose: z.boolean(),
    canSwitch: z.boolean(),
  })
  .strict();
export type ConductState = z.infer<typeof conductState>;

/** 0: dark, 1: dim, 2: bright. */
export const brightnessOf = (s: Pick<ConductState, "solution" | "isOn">): 0 | 1 | 2 =>
  s.isOn ? SUBSTANCES[s.solution].conducts : 0;

export const hasIons = (solution: ConductSolution): boolean =>
  PARTICLES[solution].some((p) => p.charge !== 0);

export function describeConduct(s: ConductState): string {
  const name = SUBSTANCES[s.solution].name.en;
  const b = brightnessOf(s);
  const bulb = !s.isOn
    ? "switched off"
    : b === 2
      ? "glows brightly"
      : b === 1
        ? "glows dimly"
        : "does not glow";
  const ions = hasIons(s.solution)
    ? `it has ions (${PARTICLES[s.solution]
        .filter((p) => p.charge !== 0)
        .map((p) => p.label)
        .join(", ")})`
    : "it has no ions, only whole molecules";
  return `Two nails in a beaker of ${name}, wired to a 6 V battery through a bulb and a switch. The bulb ${bulb}${s.showIons ? `; ${ions}` : ""}.`;
}

const act = actionsFor<ConductState>();

export const conductivityTester = defineProp({
  type: "conductivityTester",
  describe:
    "Activity 2.8 of NCERT Class 10 Chapter 2: does a solution conduct electricity? Two iron nails in a cork in a beaker, connected through a bulb and a switch to a 6 V battery. Choose the solution (hydrochloric, sulphuric or acetic acid, sodium or calcium hydroxide, glucose, alcohol, sugar, distilled water, rain water, salt water) and switch on: the bulb glows brightly when the solution has many ions, dimly with few, and not at all with none. A close-up shows the particles: ions (H₃O⁺, Cl⁻, Na⁺, OH⁻…) or whole uncharged molecules (glucose, alcohol).",
  state: conductState,
  defaults: {
    solution: SubstanceId.HydrochloricAcid,
    solutions: [SubstanceId.HydrochloricAcid, SubstanceId.GlucoseSolution, SubstanceId.Alcohol],
    isOn: false,
    showIons: false,
    canChoose: true,
    canSwitch: true,
  },
  inputs: ["showIons", "canChoose", "canSwitch"],
  derived: {
    [ConductDerived.Glows]: {
      describe: "The bulb glows (switched on and the solution has ions)",
      compute: (s) => brightnessOf(s) > 0,
    },
    [ConductDerived.Brightness]: {
      describe: "0 dark, 1 dim (few ions), 2 bright (many ions)",
      compute: (s) => brightnessOf(s),
    },
    [ConductDerived.Ions]: {
      describe: "The ions in the solution (empty when it has none)",
      compute: (s) => PARTICLES[s.solution].filter((p) => p.charge !== 0).map((p) => p.label),
    },
  },
  actions: {
    [ConductAction.Choose]: act({
      describe: "Empty the beaker and pour in another solution",
      byLearner: true,
      args: z.object({ solution: z.enum(CONDUCT_SOLUTIONS) }).strict(),
      run: (s, a) =>
        s.solutions.includes(a.solution)
          ? set(
              { solution: a.solution },
              {
                signal: ConductSignal.Chosen,
                payload: {
                  solution: a.solution,
                  glows: brightnessOf({ solution: a.solution, isOn: s.isOn }) > 0,
                },
              },
            )
          : set({}),
    }),
    [ConductAction.Switch]: act({
      describe: "Switch the current on or off",
      byLearner: true,
      args: z.object({ on: z.boolean() }).strict(),
      run: (s, a) =>
        set(
          { isOn: a.on },
          {
            signal: ConductSignal.Switched,
            payload: {
              on: a.on,
              solution: s.solution,
              glows: brightnessOf({ solution: s.solution, isOn: a.on }) > 0,
            },
          },
        ),
    }),
  },
  signals: {
    [ConductSignal.Switched]: {
      describe: "The switch was turned (payload: on, and whether the bulb glows)",
      isCommit: true,
    },
    [ConductSignal.Chosen]: {
      describe: "Another solution was poured in (payload: whether the bulb glows)",
    },
  },
  observe: (s) => {
    const b = brightnessOf(s);
    const elements: Element[] = [
      { id: ConductPart.Beaker, value: SUBSTANCES[s.solution].name.en },
      {
        id: ConductPart.Bulb,
        value: !s.isOn ? "off" : b === 2 ? "bright" : b === 1 ? "dim" : "dark",
      },
    ];
    if (s.canSwitch) elements.push({ id: ConductPart.Switch, value: s.isOn ? "on" : "off" });
    if (s.showIons)
      elements.push({
        id: ConductPart.CloseUp,
        value: PARTICLES[s.solution].map((p) => p.label).join(", "),
      });
    if (s.canChoose)
      elements.push({
        id: ConductPart.Solutions,
        value: s.solutions.map((x) => SUBSTANCES[x].name.en).join(", "),
      });
    return {
      summary: describeConduct(s),
      elements,
      hidden: s.isOn
        ? {}
        : { whenOn: SUBSTANCES[s.solution].conducts > 0 ? "it would glow" : "it would stay dark" },
    };
  },
  parts: (s) => [
    ConductPart.Bulb,
    ConductPart.Beaker,
    ...(s.canSwitch ? [ConductPart.Switch] : []),
    ...(s.showIons ? [ConductPart.CloseUp] : []),
    ...(s.canChoose ? [ConductPart.Solutions] : []),
  ],
});
