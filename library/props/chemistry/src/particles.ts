import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import type { Words } from "./words";

/**
 * A reaction seen as particles, in three steps: before (the reactants' molecules), during (bonds
 * break, atoms and groups move), after (the products' molecules). No atom appears or disappears;
 * they only change partners.
 */

export const SwapKind = {
  Displacement: "displacement",
  DoubleDisplacement: "doubleDisplacement",
  Redox: "redox",
  Combination: "combination",
  Decomposition: "decomposition",
  WaterFormation: "waterFormation",
} as const;
export type SwapKind = (typeof SwapKind)[keyof typeof SwapKind];

export const SwapAction = { Next: "next", GoTo: "goTo" } as const;
export const SwapSignal = { Stepped: "stepped" } as const;
export const SwapDerived = { IsAfter: "isAfter" } as const;
export const SwapPart = {
  Particles: "particles",
  Equation: "equation",
  Next: "next",
  Caption: "caption",
} as const;

/** Before, during, after. */
export const SWAP_STEPS = 3;

/** One particle: an atom, or a group that stays together (SO₄). */
export type Particle = {
  id: string;
  label: string;
  /** Its element (or group), for its colour. */
  colour: string;
  r: number;
  /** Where it is at each step, in layout units (the view enlarges them to fill its picture). */
  at: readonly [readonly [number, number], readonly [number, number], readonly [number, number]];
};

type KindInfo = {
  equation: string;
  words: Words;
  particles: readonly Particle[];
  /** What each step shows, in a phrase (for descriptions). */
  steps: readonly [string, string, string];
  /** Particles drawn falling to the bottom as a solid, after. */
  precipitate?: readonly string[];
};

const R = { H: 6, O: 8, C: 8, Cu: 10, Fe: 10, Ca: 11, Na: 9, Ba: 11, Cl: 9, SO4: 13 } as const;
type P = Particle;
const p = (id: string, label: string, colour: keyof typeof R, at: P["at"]): P => ({
  id,
  label,
  colour,
  r: R[colour],
  at,
});

export const SWAPS: Record<SwapKind, KindInfo> = {
  [SwapKind.Displacement]: {
    equation: "Fe + CuSO₄ → FeSO₄ + Cu",
    words: {
      en: "Iron + Copper sulphate → Iron sulphate + Copper",
      hi: "लोहा + कॉपर सल्फ़ेट → आयरन सल्फ़ेट + कॉपर",
    },
    particles: [
      p("fe", "Fe", "Fe", [
        [70, 75],
        [158, 82],
        [196, 75],
      ]),
      p("cu", "Cu", "Cu", [
        [196, 75],
        [176, 40],
        [92, 112],
      ]),
      p("so4", "SO₄", "SO4", [
        [219, 75],
        [222, 78],
        [219, 75],
      ]),
    ],
    steps: [
      "an iron atom, and copper sulphate (copper joined to a sulphate group)",
      "the iron atom pushes in; the copper atom is pushed out",
      "iron sulphate (iron joined to the sulphate), and copper on its own",
    ],
    precipitate: ["cu"],
  },
  [SwapKind.DoubleDisplacement]: {
    equation: "Na₂SO₄ + BaCl₂ → BaSO₄ + 2NaCl",
    words: {
      en: "Sodium sulphate + Barium chloride → Barium sulphate + Sodium chloride",
      hi: "सोडियम सल्फ़ेट + बेरियम क्लोराइड → बेरियम सल्फ़ेट + सोडियम क्लोराइड",
    },
    particles: [
      p("na1", "Na", "Na", [
        [52, 60],
        [62, 48],
        [60, 46],
      ]),
      p("na2", "Na", "Na", [
        [52, 90],
        [74, 110],
        [236, 46],
      ]),
      p("so4", "SO₄", "SO4", [
        [70, 75],
        [124, 72],
        [173, 126],
      ]),
      p("ba", "Ba", "Ba", [
        [222, 75],
        [186, 78],
        [149, 126],
      ]),
      p("cl1", "Cl", "Cl", [
        [238, 60],
        [244, 50],
        [78, 46],
      ]),
      p("cl2", "Cl", "Cl", [
        [238, 90],
        [242, 112],
        [254, 46],
      ]),
    ],
    steps: [
      "sodium sulphate and barium chloride, each dissolved in water",
      "in water they are ions moving about: sodium, sulphate, barium, chloride",
      "barium and sulphate join and fall as a white solid (barium sulphate); sodium and chloride stay in the solution",
    ],
    precipitate: ["so4", "ba"],
  },
  [SwapKind.Redox]: {
    equation: "CuO + H₂ → Cu + H₂O",
    words: {
      en: "Copper(II) oxide + Hydrogen → Copper + Water",
      hi: "कॉपर(II) ऑक्साइड + हाइड्रोजन → कॉपर + जल",
    },
    particles: [
      p("cu", "Cu", "Cu", [
        [80, 75],
        [80, 75],
        [80, 75],
      ]),
      p("o", "O", "O", [
        [98, 75],
        [150, 66],
        [214, 70],
      ]),
      p("h1", "H", "H", [
        [206, 75],
        [196, 74],
        [201, 78],
      ]),
      p("h2", "H", "H", [
        [218, 75],
        [214, 80],
        [227, 78],
      ]),
    ],
    steps: [
      "copper(II) oxide (copper joined to oxygen) and a hydrogen molecule",
      "the oxygen leaves the copper and moves to the hydrogen",
      "copper on its own (it lost oxygen: reduced), and water (hydrogen gained oxygen: oxidised)",
    ],
  },
  [SwapKind.Combination]: {
    equation: "CaO + H₂O → Ca(OH)₂",
    words: {
      en: "Calcium oxide + Water → Calcium hydroxide",
      hi: "कैल्शियम ऑक्साइड + जल → कैल्शियम हाइड्रॉक्साइड",
    },
    particles: [
      p("ca", "Ca", "Ca", [
        [70, 75],
        [118, 75],
        [160, 75],
      ]),
      p("o1", "O", "O", [
        [89, 75],
        [139, 75],
        [141, 75],
      ]),
      p("o2", "O", "O", [
        [226, 75],
        [194, 75],
        [179, 75],
      ]),
      p("h1", "H", "H", [
        [213, 84],
        [181, 84],
        [128, 69],
      ]),
      p("h2", "H", "H", [
        [239, 84],
        [207, 84],
        [192, 69],
      ]),
    ],
    steps: [
      "calcium oxide and a water molecule",
      "they come together",
      "one single product: calcium hydroxide",
    ],
  },
  [SwapKind.Decomposition]: {
    equation: "CaCO₃ → CaO + CO₂",
    words: {
      en: "Calcium carbonate → Calcium oxide + Carbon dioxide",
      hi: "कैल्शियम कार्बोनेट → कैल्शियम ऑक्साइड + कार्बन डाइऑक्साइड",
    },
    particles: [
      p("ca", "Ca", "Ca", [
        [122, 82],
        [104, 86],
        [84, 92],
      ]),
      p("o1", "O", "O", [
        [141, 82],
        [123, 86],
        [103, 92],
      ]),
      p("c", "C", "C", [
        [157, 82],
        [170, 72],
        [214, 46],
      ]),
      p("o2", "O", "O", [
        [169, 71],
        [182, 61],
        [198, 46],
      ]),
      p("o3", "O", "O", [
        [169, 93],
        [182, 83],
        [230, 46],
      ]),
    ],
    steps: [
      "calcium carbonate, heated",
      "the heat breaks it apart",
      "two simpler products: calcium oxide, and carbon dioxide gas rising",
    ],
  },
  [SwapKind.WaterFormation]: {
    equation: "2H₂ + O₂ → 2H₂O",
    words: { en: "Hydrogen + Oxygen → Water", hi: "हाइड्रोजन + ऑक्सीजन → जल" },
    particles: [
      p("h1", "H", "H", [
        [44, 52],
        [92, 56],
        [107, 69],
      ]),
      p("h2", "H", "H", [
        [56, 52],
        [104, 56],
        [133, 69],
      ]),
      p("h3", "H", "H", [
        [44, 100],
        [92, 98],
        [187, 104],
      ]),
      p("h4", "H", "H", [
        [56, 100],
        [104, 98],
        [213, 104],
      ]),
      p("o1", "O", "O", [
        [202, 75],
        [156, 68],
        [120, 60],
      ]),
      p("o2", "O", "O", [
        [218, 75],
        [176, 84],
        [200, 95],
      ]),
    ],
    steps: [
      "two hydrogen molecules and one oxygen molecule",
      "the molecules break apart",
      "two water molecules: the same 4 hydrogen and 2 oxygen atoms, joined differently",
    ],
  },
};

const captionSchema = z.object({ en: z.string(), hi: z.string() }).strict();

const swapState = z
  .object({
    kind: z.nativeEnum(SwapKind),
    /** 0 before, 1 during, 2 after. */
    step: z
      .number()
      .int()
      .min(0)
      .max(SWAP_STEPS - 1),
    canStep: z.boolean(),
    /** Show the equation under the picture. */
    showEquation: z.boolean(),
    /** The lesson's words for each step (before, during, after); none shown when empty. */
    captions: z.array(captionSchema).max(SWAP_STEPS),
  })
  .strict();
export type SwapState = z.infer<typeof swapState>;

export function describeSwap(s: Pick<SwapState, "kind" | "step">): string {
  const info = SWAPS[s.kind];
  const where = ["Before", "During", "After"][s.step];
  return `${info.equation}, as particles. ${where}: ${info.steps[s.step]}.`;
}

const act = actionsFor<SwapState>();

export const particleSwap = defineProp({
  type: "particleSwap",
  describe:
    "A chemical reaction drawn as particles (atoms as coloured balls with their symbols, a sulphate group as one ball), stepped through before, during and after: displacement (Fe + CuSO₄), double displacement (Na₂SO₄ + BaCl₂, a precipitate falls), redox (CuO + H₂: oxygen moves from copper to hydrogen), combination (CaO + H₂O), decomposition (CaCO₃ on heating) and 2H₂ + O₂ → 2H₂O. Atoms keep their identity; they only change partners.",
  state: swapState,
  defaults: {
    kind: SwapKind.Displacement,
    step: 0,
    canStep: true,
    showEquation: true,
    captions: [],
  },
  inputs: ["canStep", "showEquation", "captions"],
  derived: {
    [SwapDerived.IsAfter]: {
      describe: "It is showing the products (the last step)",
      compute: (s) => s.step === SWAP_STEPS - 1,
    },
  },
  actions: {
    [SwapAction.Next]: act({
      describe: "Go to the next step (after the last, back to the start)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = (s.step + 1) % SWAP_STEPS;
        return set({ step }, { signal: SwapSignal.Stepped, payload: { step } });
      },
    }),
    [SwapAction.GoTo]: act({
      describe: "Show one step: 0 before, 1 during, 2 after",
      args: z
        .object({
          step: z
            .number()
            .int()
            .min(0)
            .max(SWAP_STEPS - 1),
        })
        .strict(),
      run: (_s, a) =>
        set({ step: a.step }, { signal: SwapSignal.Stepped, payload: { step: a.step } }),
    }),
  },
  signals: {
    [SwapSignal.Stepped]: {
      describe:
        "The picture moved to a step; the payload has the step (0 before, 1 during, 2 after)",
    },
  },
  observe: (s) => {
    const info = SWAPS[s.kind];
    const caption = s.captions[s.step];
    const elements: Element[] = [{ id: SwapPart.Particles, value: info.steps[s.step] }];
    if (s.showEquation) elements.push({ id: SwapPart.Equation, value: info.equation });
    if (caption !== undefined) elements.push({ id: SwapPart.Caption, value: caption.en });
    if (s.canStep)
      elements.push({ id: SwapPart.Next, value: `step ${s.step + 1} of ${SWAP_STEPS}` });
    return { summary: describeSwap(s), elements };
  },
  parts: (s) => [
    SwapPart.Particles,
    ...(s.showEquation ? [SwapPart.Equation] : []),
    ...(s.captions[s.step] !== undefined ? [SwapPart.Caption] : []),
    ...(s.canStep ? [SwapPart.Next] : []),
  ],
});
