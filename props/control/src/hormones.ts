import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import type { Words } from "./draw";

/**
 * Plant hormones (NCERT 7.2): four chemical messengers, each tapped to show where on a plant it
 * works and what it does. Auxin (made at the shoot tip, makes cells grow longer), gibberellins
 * (growth of the stem), cytokinins (cell division; plenty in fruits and seeds) promote growth;
 * abscisic acid stops growth, and wilting of leaves is one of its effects.
 */

export const PlantHormone = {
  Auxin: "auxin",
  Gibberellin: "gibberellin",
  Cytokinin: "cytokinin",
  AbscisicAcid: "abscisicAcid",
} as const;
export type PlantHormone = (typeof PlantHormone)[keyof typeof PlantHormone];

export const Effect = { Promotes: "promotes", Inhibits: "inhibits" } as const;
export type Effect = (typeof Effect)[keyof typeof Effect];

/** Where on the drawn plant each hormone is shown working. */
export const Spot = { ShootTip: "shootTip", Stem: "stem", Fruit: "fruit", Leaf: "leaf" } as const;
export type Spot = (typeof Spot)[keyof typeof Spot];

export const HORMONES: Readonly<
  Record<PlantHormone, { name: Words; effect: Effect; spot: Spot; job: Words }>
> = {
  [PlantHormone.Auxin]: {
    name: { en: "Auxin", hi: "ऑक्सिन" },
    effect: Effect.Promotes,
    spot: Spot.ShootTip,
    job: {
      en: "Made at the shoot tip. It helps cells grow longer. When light comes from one side, auxin moves to the shady side, cells there grow longer, and the shoot bends towards the light.",
      hi: "प्ररोह के सिरे पर बनता है। यह कोशिकाओं को लंबा बढ़ने में मदद करता है। जब प्रकाश एक ओर से आता है, तो ऑक्सिन छाया वाली ओर चला जाता है, वहाँ की कोशिकाएँ लंबी होती हैं, और प्ररोह प्रकाश की ओर मुड़ता है।",
    },
  },
  [PlantHormone.Gibberellin]: {
    name: { en: "Gibberellins", hi: "जिबरेलिन" },
    effect: Effect.Promotes,
    spot: Spot.Stem,
    job: {
      en: "Like auxin, they help the stem grow.",
      hi: "ऑक्सिन की तरह, ये तने की वृद्धि में मदद करते हैं।",
    },
  },
  [PlantHormone.Cytokinin]: {
    name: { en: "Cytokinins", hi: "साइटोकाइनिन" },
    effect: Effect.Promotes,
    spot: Spot.Fruit,
    job: {
      en: "They make cells divide, so there is more of them where cells divide fast, such as in fruits and seeds.",
      hi: "ये कोशिकाओं को विभाजित करवाते हैं, इसलिए जहाँ कोशिकाएँ तेज़ी से बँटती हैं, जैसे फलों और बीजों में, वहाँ ये अधिक होते हैं।",
    },
  },
  [PlantHormone.AbscisicAcid]: {
    name: { en: "Abscisic acid", hi: "एब्सिसिक अम्ल" },
    effect: Effect.Inhibits,
    spot: Spot.Leaf,
    job: {
      en: "A signal to stop growing: it slows growth down. Wilting of leaves is one of its effects.",
      hi: "वृद्धि रोकने का संकेत: यह वृद्धि को धीमा करता है। पत्तियों का मुरझाना इसका एक प्रभाव है।",
    },
  },
};

export const HormoneAction = { Pick: "pick", Clear: "clear" } as const;
export const HormoneSignal = { Picked: "picked" } as const;
export const HormoneDerived = { Effect: "effect", Spot: "spot" } as const;
export const HormonePart = { Plant: "plant", Chips: "chips", Card: "card" } as const;

const hormoneState = z
  .object({
    selected: z.nativeEnum(PlantHormone).nullable(),
    /** Show "promotes growth" / "stops growth" on the chips before anything is tapped. */
    showEffects: z.boolean(),
    canPick: z.boolean(),
  })
  .strict();
export type HormoneState = z.infer<typeof hormoneState>;

export function describeHormones(s: HormoneState): string {
  const picked =
    s.selected === null
      ? "None picked yet."
      : `Picked: ${HORMONES[s.selected].name.en}, which ${HORMONES[s.selected].effect === Effect.Promotes ? "promotes" : "stops"} growth: ${HORMONES[s.selected].job.en}`;
  return `A plant with a shoot tip, a stem, a fruit with seeds and a wilting leaf, and four plant hormones to tap: auxin, gibberellins, cytokinins and abscisic acid. ${picked}`;
}

const act = actionsFor<HormoneState>();

export const plantHormones = defineProp({
  type: "plantHormones",
  describe:
    "Four plant hormones to tap, each lighting up where on a drawn plant it works: auxin at the shoot tip (cells grow longer; bending towards light), gibberellins in the stem (stem growth), cytokinins in a fruit with seeds (cell division), abscisic acid in a wilting leaf (stops growth). Each card says whether the hormone promotes or stops growth.",
  state: hormoneState,
  defaults: { selected: null, showEffects: false, canPick: true },
  inputs: ["showEffects", "canPick"],
  derived: {
    [HormoneDerived.Effect]: {
      describe: "Whether the picked hormone promotes or inhibits growth; null if none",
      compute: (s) => (s.selected === null ? null : HORMONES[s.selected].effect),
    },
    [HormoneDerived.Spot]: {
      describe: "Where the picked hormone is shown: shootTip, stem, fruit or leaf; null if none",
      compute: (s) => (s.selected === null ? null : HORMONES[s.selected].spot),
    },
  },
  actions: {
    [HormoneAction.Pick]: act({
      describe: "Tap a hormone to see where it works and what it does",
      byLearner: true,
      args: z.object({ hormone: z.nativeEnum(PlantHormone) }).strict(),
      run: (_s, a) =>
        set(
          { selected: a.hormone },
          {
            signal: HormoneSignal.Picked,
            payload: { hormone: a.hormone, effect: HORMONES[a.hormone].effect },
          },
        ),
    }),
    [HormoneAction.Clear]: act({
      describe: "Clear the picked hormone",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ selected: null }),
    }),
  },
  signals: {
    [HormoneSignal.Picked]: {
      describe: "A hormone was tapped; `effect` is promotes or inhibits",
    },
  },
  observe: (s) => ({
    summary: describeHormones(s),
    elements: [{ id: HormonePart.Card, value: describeHormones(s) }],
  }),
  parts: () => [HormonePart.Plant, HormonePart.Chips, HormonePart.Card],
});
