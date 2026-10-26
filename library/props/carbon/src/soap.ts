import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Soaps and detergents (NCERT 4.5).
 * - molecule: a soap molecule, the sodium salt of a long-chain carboxylic acid: an ionic end that
 *   likes water (hydrophilic) and a long hydrocarbon tail that likes oil (hydrophobic).
 * - surface: at the surface of water the molecules line up, ionic ends in the water, tails out.
 * - micelle (Activity 4.10), stepped: oily dirt doesn't mix with water; soap goes in; the tails
 *   bury themselves in the oil, the ionic ends face the water: a micelle; rinsing carries the
 *   micelle, dirt and all, away.
 * - hardWater (Activities 4.11, 4.12): shake soap or detergent in soft or hard water. Soap in
 *   hard water makes little foam and a white curdy scum (it reacts with calcium and magnesium
 *   salts); detergent foams in both.
 */

export const SoapMode = {
  Molecule: "molecule",
  Surface: "surface",
  Micelle: "micelle",
  HardWater: "hardWater",
} as const;
export type SoapMode = (typeof SoapMode)[keyof typeof SoapMode];

export const Water = { Soft: "soft", Hard: "hard" } as const;
export type Water = (typeof Water)[keyof typeof Water];

export const Cleaner = { Soap: "soap", Detergent: "detergent" } as const;
export type Cleaner = (typeof Cleaner)[keyof typeof Cleaner];

export const MICELLE_STEPS = 4;

/** Foam after shaking, 0–3, and whether scum forms. */
export function resultOf(water: Water, cleaner: Cleaner): { foam: number; scum: boolean } {
  if (cleaner === Cleaner.Detergent) return { foam: 3, scum: false };
  return water === Water.Hard ? { foam: 1, scum: true } : { foam: 3, scum: false };
}

export const SoapAction = {
  Next: "next",
  Reset: "reset",
  SetWater: "setWater",
  SetCleaner: "setCleaner",
  Shake: "shake",
} as const;
export const SoapSignal = { Stepped: "stepped", Shaken: "shaken" } as const;
export const SoapDerived = { Foam: "foam", Scum: "scum", IsClean: "isClean" } as const;
export const SoapPart = {
  Picture: "picture",
  Next: "next",
  Water: "water",
  Cleaner: "cleaner",
  Shake: "shake",
} as const;

const soapState = z
  .object({
    mode: z.nativeEnum(SoapMode),
    step: z
      .number()
      .int()
      .min(0)
      .max(MICELLE_STEPS - 1),
    water: z.nativeEnum(Water),
    cleaner: z.nativeEnum(Cleaner),
    isShaken: z.boolean(),
    showNames: z.boolean(),
    canAct: z.boolean(),
  })
  .strict();
export type SoapState = z.infer<typeof soapState>;

const MICELLE_EN = [
  "Oily dirt on cloth, in water: oil and water don't mix, so water alone can't lift it.",
  "Soap goes in. Each molecule has a water-loving ionic end and an oil-loving hydrocarbon tail.",
  "The tails bury themselves in the oil; the ionic ends stay in the water: a micelle, with the oil trapped inside.",
  "Rinsing carries the micelles, dirt and all, away: the cloth is clean.",
] as const;

export function describeSoap(s: SoapState): string {
  switch (s.mode) {
    case SoapMode.Molecule:
      return "A soap molecule: a long hydrocarbon tail (hydrophobic: it mixes with oil, not water) joined to an ionic end, –COO⁻ Na⁺ (hydrophilic: it mixes with water).";
    case SoapMode.Surface:
      return "Soap at the surface of water: the molecules line up with their ionic ends in the water and their hydrocarbon tails sticking out of it.";
    case SoapMode.Micelle:
      return MICELLE_EN[s.step] ?? MICELLE_EN[0];
    default: {
      const r = resultOf(s.water, s.cleaner);
      const what = s.cleaner === Cleaner.Soap ? "Soap" : "Detergent";
      if (!s.isShaken) return `${what} in ${s.water} water, not shaken yet.`;
      return `${what} shaken in ${s.water} water: ${r.foam >= 3 ? "plenty of foam" : "very little foam"}${r.scum ? ", and a white curdy scum" : ""}.`;
    }
  }
}

const act = actionsFor<SoapState>();

export const soapAction = defineProp({
  type: "soapAction",
  describe:
    "How soap cleans. Modes: molecule (hydrophilic ionic end, hydrophobic hydrocarbon tail), surface (molecules line up at the water's surface), micelle (stepped: oily dirt; soap added; tails in the oil, ionic ends out: a micelle; rinsed away), hardWater (shake soap or detergent in soft or hard water: soap in hard water gives little foam and white scum; detergent foams in both).",
  state: soapState,
  defaults: {
    mode: SoapMode.Micelle,
    step: 0,
    water: Water.Soft,
    cleaner: Cleaner.Soap,
    isShaken: false,
    showNames: true,
    canAct: true,
  },
  inputs: ["mode", "showNames", "canAct"],
  derived: {
    [SoapDerived.Foam]: {
      describe: "Foam after shaking, 0 (none) to 3 (plenty); 0 before shaking",
      compute: (s) => (s.isShaken ? resultOf(s.water, s.cleaner).foam : 0),
    },
    [SoapDerived.Scum]: {
      describe: "A white curdy scum has formed",
      compute: (s) => s.isShaken && resultOf(s.water, s.cleaner).scum,
    },
    [SoapDerived.IsClean]: {
      describe: "The cloth is clean (the micelle has been rinsed away)",
      compute: (s) => s.mode === SoapMode.Micelle && s.step === MICELLE_STEPS - 1,
    },
  },
  actions: {
    [SoapAction.Next]: act({
      describe: "The next step of the micelle story (stays on the last)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = Math.min(s.step + 1, MICELLE_STEPS - 1);
        return set({ step }, { signal: SoapSignal.Stepped, payload: { step } });
      },
    }),
    [SoapAction.Reset]: act({
      describe: "Back to the start",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0, isShaken: false }),
    }),
    [SoapAction.SetWater]: act({
      describe: "Use soft (distilled or rain) water or hard water (tubewell, hand-pump)",
      byLearner: true,
      args: z.object({ water: z.nativeEnum(Water) }).strict(),
      run: (_, a) => set({ water: a.water, isShaken: false }),
    }),
    [SoapAction.SetCleaner]: act({
      describe: "Use soap solution or detergent solution",
      byLearner: true,
      args: z.object({ cleaner: z.nativeEnum(Cleaner) }).strict(),
      run: (_, a) => set({ cleaner: a.cleaner, isShaken: false }),
    }),
    [SoapAction.Shake]: act({
      describe: "Shake the test tube and see the foam",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const r = resultOf(s.water, s.cleaner);
        return set(
          { isShaken: true },
          { signal: SoapSignal.Shaken, payload: { water: s.water, cleaner: s.cleaner, ...r } },
        );
      },
    }),
  },
  signals: {
    [SoapSignal.Stepped]: { describe: "Moved to `step`" },
    [SoapSignal.Shaken]: {
      describe: "Shaken: `foam` (0–3) and `scum` for this `water` and `cleaner`",
    },
  },
  observe: (s) => ({
    summary: describeSoap(s),
    elements: [{ id: SoapPart.Picture, value: describeSoap(s) }],
  }),
  parts: (s) => {
    const parts: string[] = [SoapPart.Picture];
    if (!s.canAct) return parts;
    if (s.mode === SoapMode.Micelle) parts.push(SoapPart.Next);
    if (s.mode === SoapMode.HardWater) parts.push(SoapPart.Water, SoapPart.Cleaner, SoapPart.Shake);
    return parts;
  },
});
