import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Chapter 4's demonstrations on one bench, each stepped the way the book tells it:
 * - spatula (Activity 4.3): burn alcohol, camphor or naphthalene; the clean flame leaves the
 *   plate clean, the unsaturated ones burn yellow and smoky and leave soot;
 * - burner (Activity 4.4): the air hole open gives a clean blue flame, closed a yellow sooty one;
 * - permanganate (Activity 4.5): warm ethanol takes the purple out of the first drops of
 *   alkaline KMnO₄ (it is oxidised to ethanoic acid); once it is used up, the colour stays;
 * - hydrogenation (4.3.3): oil + hydrogen with a nickel catalyst → a saturated fat;
 * - chlorination (4.3.4): methane and chlorine do nothing in the dark; in sunlight a chlorine
 *   takes the place of a hydrogen;
 * - sodium (Activity 4.6): sodium in ethanol fizzes; the gas pops: hydrogen;
 * - dehydration (4.4.1): ethanol with hot concentrated sulphuric acid gives ethene;
 * - ester (Activity 4.8): ethanoic acid + ethanol + a few drops of acid, warmed: a sweet smell;
 * - acidStrength (Activity 4.7): both turn blue litmus red, but universal indicator shows dilute
 *   ethanoic acid is the weaker acid;
 * - carbonate (Activity 4.9): ethanoic acid + sodium carbonate fizzes; the gas turns lime water
 *   milky: carbon dioxide.
 */

export const LabKind = {
  Spatula: "spatula",
  Burner: "burner",
  Permanganate: "permanganate",
  Hydrogenation: "hydrogenation",
  Chlorination: "chlorination",
  Sodium: "sodium",
  Dehydration: "dehydration",
  Ester: "ester",
  AcidStrength: "acidStrength",
  Carbonate: "carbonate",
} as const;
export type LabKind = (typeof LabKind)[keyof typeof LabKind];

export const Fuel = { Alcohol: "alcohol", Camphor: "camphor", Naphthalene: "naphthalene" } as const;
export type Fuel = (typeof Fuel)[keyof typeof Fuel];

/** How many steps each demonstration has (step 0 is the set-up). */
export const LAB_STEPS: Readonly<Record<LabKind, number>> = {
  spatula: 2,
  burner: 2,
  permanganate: 2,
  hydrogenation: 3,
  chlorination: 2,
  sodium: 3,
  dehydration: 2,
  ester: 4,
  acidStrength: 3,
  carbonate: 3,
};

/** Drops of KMnO₄ the warm ethanol in the tube can decolourise before it is all oxidised. */
export const DROPS_USED_UP = 3;
export const MAX_DROPS = 6;

export const Flame = { None: "none", Clean: "clean", Sooty: "sooty" } as const;
export type Flame = (typeof Flame)[keyof typeof Flame];

export const LabAction = {
  Next: "next",
  Reset: "reset",
  SetFuel: "setFuel",
  SetAir: "setAir",
  AddDrop: "addDrop",
  SetSun: "setSun",
} as const;
export const LabSignal = { Stepped: "stepped", Done: "done", Changed: "changed" } as const;
export const LabDerived = {
  Flame: "flame",
  Soot: "soot",
  ColourStays: "colourStays",
  Reacts: "reacts",
  IsDone: "isDone",
  StepCount: "stepCount",
  Equation: "equation",
} as const;
export const LabPart = {
  Bench: "bench",
  Next: "next",
  Fuel: "fuel",
  Air: "air",
  Drop: "drop",
  Sun: "sun",
} as const;

const labState = z
  .object({
    kind: z.nativeEnum(LabKind),
    step: z.number().int().min(0).max(3),
    fuel: z.nativeEnum(Fuel),
    isAirOpen: z.boolean(),
    drops: z.number().int().min(0).max(MAX_DROPS),
    isSunny: z.boolean(),
    showEquation: z.boolean(),
    showNames: z.boolean(),
    canAct: z.boolean(),
    /** The fuels offered on the spatula. */
    fuels: z.array(z.nativeEnum(Fuel)),
  })
  .strict();
export type LabState = z.infer<typeof labState>;

export const SOOTY_FUELS: readonly Fuel[] = [Fuel.Camphor, Fuel.Naphthalene];

export function flameOf(s: Pick<LabState, "kind" | "step" | "fuel" | "isAirOpen">): Flame {
  if (s.kind === LabKind.Spatula)
    return s.step === 0 ? Flame.None : SOOTY_FUELS.includes(s.fuel) ? Flame.Sooty : Flame.Clean;
  if (s.kind === LabKind.Burner)
    return s.step === 0 ? Flame.None : s.isAirOpen ? Flame.Clean : Flame.Sooty;
  return Flame.None;
}

/** Whether the demonstration's change is happening (chlorination needs sunlight). */
export function reactsOf(s: Pick<LabState, "kind" | "step" | "isSunny" | "drops">): boolean {
  if (s.kind === LabKind.Chlorination) return s.isSunny && s.step > 0;
  if (s.kind === LabKind.Permanganate) return s.drops > 0;
  return s.step > 0;
}

export const EQUATIONS: Readonly<Record<LabKind, string>> = {
  spatula: "C + O₂ → CO₂ + heat and light",
  burner: "CH₄ + 2O₂ → CO₂ + 2H₂O + heat and light",
  permanganate: "CH₃CH₂OH → CH₃COOH (alkaline KMnO₄ + heat)",
  hydrogenation: "R–CH=CH–R + H₂ → R–CH₂–CH₂–R (nickel catalyst)",
  chlorination: "CH₄ + Cl₂ → CH₃Cl + HCl (in the presence of sunlight)",
  sodium: "2Na + 2CH₃CH₂OH → 2CH₃CH₂O⁻Na⁺ + H₂",
  dehydration: "CH₃–CH₂OH → CH₂=CH₂ + H₂O (hot conc. H₂SO₄)",
  ester: "CH₃COOH + CH₃CH₂OH → CH₃COOCH₂CH₃ + H₂O (acid)",
  acidStrength: "CH₃COOH ⇌ CH₃COO⁻ + H⁺ (only a little ionised)",
  carbonate: "2CH₃COOH + Na₂CO₃ → 2CH₃COONa + H₂O + CO₂",
};

const CAPTION_EN: Readonly<Record<LabKind, readonly string[]>> = {
  spatula: ["A carbon compound on a spatula, a metal plate above.", "It burns."],
  burner: ["A burner with an air hole at its base.", "Lit."],
  permanganate: [
    "Warm ethanol in a test tube; alkaline potassium permanganate goes in drop by drop.",
    "Drops added.",
  ],
  hydrogenation: [
    "Vegetable oil: long carbon chains with double bonds (unsaturated), a liquid.",
    "Hydrogen is bubbled through it, with nickel as the catalyst.",
    "The double bonds take up hydrogen: a saturated fat, solid like vanaspati ghee.",
  ],
  chlorination: ["Methane and chlorine together.", "Left a while."],
  sodium: [
    "Absolute alcohol (ethanol) in a test tube.",
    "A piece of sodium the size of two rice grains goes in: it fizzes.",
    "A burning splinter at the mouth: the gas burns with a pop. It is hydrogen.",
  ],
  dehydration: [
    "Ethanol with excess hot concentrated sulphuric acid, at 443 K.",
    "The acid pulls water out of each ethanol molecule: ethene gas comes off.",
  ],
  ester: [
    "1 mL ethanol, 1 mL glacial ethanoic acid and a few drops of concentrated sulphuric acid.",
    "Warmed in a water bath for at least five minutes.",
    "Poured into a beaker of water.",
    "A sweet, fruity smell: an ester has formed.",
  ],
  acidStrength: [
    "Dilute ethanoic acid and dilute hydrochloric acid, side by side.",
    "Blue litmus: both turn it red. Both are acids.",
    "Universal indicator: hydrochloric acid red (pH about 1), ethanoic acid orange (pH about 3). Ethanoic acid is the weaker acid.",
  ],
  carbonate: [
    "Sodium carbonate in a test tube; dilute ethanoic acid is added.",
    "It fizzes: a gas comes off.",
    "The gas is passed through lime water: it turns milky. The gas is carbon dioxide.",
  ],
};

export function describeLab(s: LabState): string {
  const lines = CAPTION_EN[s.kind];
  if (s.kind === LabKind.Spatula && s.step > 0)
    return `${s.fuel} burns with a ${flameOf(s) === Flame.Sooty ? "yellow, smoky flame and leaves black soot on the plate" : "clean flame and leaves the plate clean"}.`;
  if (s.kind === LabKind.Burner && s.step > 0)
    return `The burner with its air hole ${s.isAirOpen ? "open burns with a clean blue flame" : "closed burns with a yellow, sooty flame"}.`;
  if (s.kind === LabKind.Permanganate)
    return s.drops === 0
      ? (lines[0] ?? "")
      : s.drops <= DROPS_USED_UP
        ? `${s.drops} drop(s) added: the purple colour disappears each time; the ethanol is being oxidised to ethanoic acid.`
        : `${s.drops} drops added: now the purple colour stays. The ethanol is used up, so the extra permanganate has nothing to oxidise.`;
  if (s.kind === LabKind.Chlorination && s.step > 0)
    return s.isSunny
      ? "In sunlight: a chlorine atom takes the place of a hydrogen atom: CH₃Cl and HCl form."
      : "In the dark: nothing happens. Saturated hydrocarbons are fairly unreactive.";
  return lines[s.step] ?? lines[0] ?? "";
}

const act = actionsFor<LabState>();
const stepsOf = (s: Pick<LabState, "kind">) => LAB_STEPS[s.kind];

export const carbonLab = defineProp({
  type: "carbonLab",
  describe:
    "NCERT Chapter 4's demonstrations, stepped: spatula (alcohol burns clean; camphor and naphthalene sooty), burner (air hole open: blue; closed: yellow and sooty), permanganate (warm ethanol decolourises the first 3 drops of alkaline KMnO₄, then the purple stays), hydrogenation (oil + H₂ over nickel → saturated fat), chlorination (CH₄ + Cl₂ only in sunlight), sodium (ethanol + Na fizzes, hydrogen pops), dehydration (ethanol + hot conc. H₂SO₄ → ethene), ester (ethanoic acid + ethanol → sweet smell), acidStrength (litmus and universal indicator: ethanoic acid weaker than HCl), carbonate (ethanoic acid + Na₂CO₃ → CO₂ turns lime water milky).",
  state: labState,
  defaults: {
    kind: LabKind.Spatula,
    step: 0,
    fuel: Fuel.Alcohol,
    isAirOpen: true,
    drops: 0,
    isSunny: false,
    showEquation: false,
    showNames: true,
    canAct: true,
    fuels: [Fuel.Alcohol, Fuel.Camphor, Fuel.Naphthalene],
  },
  inputs: ["kind", "showEquation", "showNames", "canAct", "fuels"],
  invariant: (s) => (s.step < stepsOf(s) ? undefined : "step is past the last step"),
  derived: {
    [LabDerived.Flame]: {
      describe: "The flame: none, clean (blue) or sooty (yellow)",
      compute: (s) => flameOf(s),
    },
    [LabDerived.Soot]: {
      describe: "Black soot is being left on the plate or vessel",
      compute: (s) => flameOf(s) === Flame.Sooty,
    },
    [LabDerived.ColourStays]: {
      describe: "The permanganate's purple colour stays (the ethanol is used up)",
      compute: (s) => s.kind === LabKind.Permanganate && s.drops > DROPS_USED_UP,
    },
    [LabDerived.Reacts]: { describe: "The change is happening", compute: (s) => reactsOf(s) },
    [LabDerived.IsDone]: {
      describe: "The last step is showing",
      compute: (s) =>
        s.kind === LabKind.Permanganate ? s.drops > DROPS_USED_UP : s.step === stepsOf(s) - 1,
    },
    [LabDerived.StepCount]: { describe: "How many steps", compute: (s) => stepsOf(s) },
    [LabDerived.Equation]: {
      describe: "The reaction, as an equation",
      compute: (s) => EQUATIONS[s.kind],
    },
  },
  actions: {
    [LabAction.Next]: act({
      describe: "The next step (lighting the flame, adding the next thing); stays on the last",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = Math.min(s.step + 1, stepsOf(s) - 1);
        const isLast = step === stepsOf(s) - 1;
        return set(
          { step },
          { signal: LabSignal.Stepped, payload: { step } },
          ...(isLast
            ? [{ signal: LabSignal.Done, payload: { flame: flameOf({ ...s, step }) } }]
            : []),
        );
      },
    }),
    [LabAction.Reset]: act({
      describe: "Start the demonstration again",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0, drops: 0 }),
    }),
    [LabAction.SetFuel]: act({
      describe: "Put another compound on the spatula (and light it)",
      byLearner: true,
      args: z.object({ fuel: z.nativeEnum(Fuel) }).strict(),
      run: (s, a) =>
        s.fuels.includes(a.fuel)
          ? set(
              { fuel: a.fuel, step: s.kind === LabKind.Spatula ? 1 : s.step },
              {
                signal: LabSignal.Changed,
                payload: {
                  fuel: a.fuel,
                  flame: SOOTY_FUELS.includes(a.fuel) ? Flame.Sooty : Flame.Clean,
                },
              },
            )
          : set({}),
    }),
    [LabAction.SetAir]: act({
      describe: "Open or close the burner's air hole",
      byLearner: true,
      args: z.object({ isOpen: z.boolean() }).strict(),
      run: (s, a) =>
        set(
          { isAirOpen: a.isOpen },
          {
            signal: LabSignal.Changed,
            payload: { isAirOpen: a.isOpen, flame: flameOf({ ...s, isAirOpen: a.isOpen }) },
          },
        ),
    }),
    [LabAction.AddDrop]: act({
      describe: "Add one drop of alkaline potassium permanganate",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const drops = Math.min(MAX_DROPS, s.drops + 1);
        return set(
          { drops, step: 1 },
          { signal: LabSignal.Changed, payload: { drops, colourStays: drops > DROPS_USED_UP } },
          ...(drops === DROPS_USED_UP + 1 ? [{ signal: LabSignal.Done, payload: { drops } }] : []),
        );
      },
    }),
    [LabAction.SetSun]: act({
      describe: "Put the tube in sunlight, or in the dark",
      byLearner: true,
      args: z.object({ isSunny: z.boolean() }).strict(),
      run: (_, a) =>
        set({ isSunny: a.isSunny }, { signal: LabSignal.Changed, payload: { isSunny: a.isSunny } }),
    }),
  },
  signals: {
    [LabSignal.Stepped]: { describe: "Moved to `step`" },
    [LabSignal.Done]: { describe: "The demonstration has reached its result", isCommit: true },
    [LabSignal.Changed]: { describe: "A setting changed (fuel, air hole, drops, sunlight)" },
  },
  observe: (s) => ({
    summary: describeLab(s),
    elements: [
      { id: LabPart.Bench, value: describeLab(s) },
      ...(s.showEquation ? [{ id: "equation", value: EQUATIONS[s.kind] }] : []),
    ],
  }),
  parts: (s) => {
    const parts: string[] = [LabPart.Bench];
    if (!s.canAct) return parts;
    if (s.kind === LabKind.Spatula) parts.push(LabPart.Fuel);
    else if (s.kind === LabKind.Burner) parts.push(LabPart.Air, LabPart.Next);
    else if (s.kind === LabKind.Permanganate) parts.push(LabPart.Drop);
    else if (s.kind === LabKind.Chlorination) parts.push(LabPart.Sun, LabPart.Next);
    else parts.push(LabPart.Next);
    return parts;
  },
});

/** A lab state for one demonstration, the rest defaults. */
export const labOf = (kind: LabKind, more: Partial<LabState> = {}): LabState => ({
  ...carbonLab.defaults,
  kind,
  ...more,
});
