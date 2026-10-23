import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import type { Words } from "./words";

/**
 * The experiments of the acids, bases and salts chapter on a lab bench. Each plays in steps the
 * way the book tells it (zinc and acid, then the candle; carbonate and acid through lime water,
 * then more gas; copper sulphate heated, then water dropped back on), and rests on what is seen.
 */

export const AcidBenchKind = {
  ZincAcid: "zincAcid",
  ZincBase: "zincBase",
  CarbonateAcid: "carbonateAcid",
  CopperOxideAcid: "copperOxideAcid",
  DryWetHcl: "dryWetHcl",
  AcidIntoWater: "acidIntoWater",
  WaterIntoAcid: "waterIntoAcid",
  MagnesiumStrongWeak: "magnesiumStrongWeak",
  CopperSulphateHeat: "copperSulphateHeat",
  GypsumHeat: "gypsumHeat",
  SodaAcidExtinguisher: "sodaAcidExtinguisher",
} as const;
export type AcidBenchKind = (typeof AcidBenchKind)[keyof typeof AcidBenchKind];

export const AcidBenchAction = { Next: "next", Reset: "reset" } as const;
export const AcidBenchSignal = { Stepped: "stepped", Done: "done" } as const;
export const AcidBenchDerived = {
  Steps: "steps",
  IsDone: "isDone",
  Observations: "observations",
  Equation: "equation",
} as const;
export const AcidBenchPart = {
  Apparatus: "apparatus",
  Observations: "observations",
  Next: "next",
  Thermometer: "thermometer",
} as const;

type Step = {
  /** The button's words for doing this step. */
  button: Words;
  /** What happens, in a phrase (for the summary and Jugnu). */
  what: string;
  /** What is seen, on screen. */
  seen: readonly Words[];
};

type BenchInfo = {
  setup: string;
  names: readonly Words[];
  steps: readonly Step[];
  /** The equation, plain text with digits for subscripts (the view typesets it). */
  equation: string;
  /** A safety warning to show (water into acid). */
  isWarning?: boolean;
};

const w = (en: string, hi: string): Words => ({ en, hi });

export const ACID_BENCH: Record<AcidBenchKind, BenchInfo> = {
  zincAcid: {
    setup:
      "zinc granules in a test tube with dilute sulphuric acid; a delivery tube runs from it into a dish of soap solution; a burning candle stands by",
    names: [
      w("zinc + dilute sulphuric acid", "जिंक + तनु सल्फ़्यूरिक अम्ल"),
      w("soap solution", "साबुन का घोल"),
    ],
    steps: [
      {
        button: w("▶ Add the acid", "▶ अम्ल डालो"),
        what: "bubbles rise from the zinc; the gas blows bubbles in the soap solution",
        seen: [
          w("bubbles on the zinc", "जिंक पर बुलबुले"),
          w("soap bubbles fill with gas", "साबुन के बुलबुलों में गैस"),
        ],
      },
      {
        button: w("Bring the candle near", "मोमबत्ती पास लाओ"),
        what: "a bubble burns with a pop: the gas is hydrogen",
        seen: [
          w("the bubble burns with a pop", "बुलबुला 'पॉप' के साथ जलता है"),
          w("so the gas is hydrogen", "तो गैस हाइड्रोजन है"),
        ],
      },
    ],
    equation: "Zn + H2SO4 → ZnSO4 + H2",
  },
  zincBase: {
    setup:
      "zinc granules in a test tube with sodium hydroxide solution, warmed; delivery tube into soap solution",
    names: [
      w("zinc + sodium hydroxide", "जिंक + सोडियम हाइड्रॉक्साइड"),
      w("soap solution", "साबुन का घोल"),
    ],
    steps: [
      {
        button: w("▶ Warm it", "▶ गर्म करो"),
        what: "bubbles of gas rise from the zinc",
        seen: [w("bubbles on the zinc", "जिंक पर बुलबुले")],
      },
      {
        button: w("Bring the candle near", "मोमबत्ती पास लाओ"),
        what: "a bubble burns with a pop: hydrogen again",
        seen: [w("pop: hydrogen again", "पॉप: फिर से हाइड्रोजन")],
      },
    ],
    equation: "2NaOH + Zn → Na2ZnO2 + H2",
  },
  carbonateAcid: {
    setup:
      "test tube A with sodium carbonate, test tube B with sodium hydrogencarbonate; dilute hydrochloric acid is added and the gas is led into lime water",
    names: [
      w("A: Na₂CO₃", "A: Na₂CO₃"),
      w("B: NaHCO₃", "B: NaHCO₃"),
      w("lime water", "चूने का पानी"),
    ],
    steps: [
      {
        button: w("▶ Add the acid", "▶ अम्ल डालो"),
        what: "both fizz; the gas turns lime water milky: carbon dioxide",
        seen: [
          w("both fizz", "दोनों में झाग"),
          w("lime water turns milky", "चूने का पानी दूधिया हो जाता है"),
        ],
      },
      {
        button: w("Keep passing the gas", "गैस गुज़ारते रहो"),
        what: "with a lot more carbon dioxide the milkiness clears again",
        seen: [w("milky lime water clears again", "दूधिया पानी फिर साफ़ हो जाता है")],
      },
    ],
    equation: "Na2CO3 + 2HCl → 2NaCl + H2O + CO2",
  },
  copperOxideAcid: {
    setup:
      "black copper oxide in a beaker; dilute hydrochloric acid is added slowly while stirring",
    names: [w("copper oxide", "कॉपर ऑक्साइड"), w("dilute HCl", "तनु HCl")],
    steps: [
      {
        button: w("▶ Add the acid and stir", "▶ अम्ल डालकर हिलाओ"),
        what: "the black copper oxide dissolves and the solution turns blue-green (copper(II) chloride)",
        seen: [
          w("black powder dissolves", "काला चूर्ण घुल जाता है"),
          w("solution turns blue-green", "विलयन नीला-हरा"),
        ],
      },
    ],
    equation: "CuO + 2HCl → CuCl2 + H2O",
  },
  dryWetHcl: {
    setup:
      "solid sodium chloride with concentrated sulphuric acid in a test tube; HCl gas comes out of a delivery tube",
    names: [w("NaCl + conc. H₂SO₄", "NaCl + सांद्र H₂SO₄"), w("HCl gas", "HCl गैस")],
    steps: [
      {
        button: w("▶ Hold dry blue litmus", "▶ सूखा नीला लिटमस रखो"),
        what: "dry blue litmus stays blue in dry HCl gas",
        seen: [w("dry litmus stays blue", "सूखा लिटमस नीला ही रहता है")],
      },
      {
        button: w("Now wet litmus", "अब गीला लिटमस"),
        what: "wet blue litmus turns red: the acid acts only with water",
        seen: [w("wet litmus turns red", "गीला लिटमस लाल हो जाता है")],
      },
    ],
    equation: "HCl + H2O → H3O⁺ + Cl⁻",
  },
  acidIntoWater: {
    setup:
      "a beaker of water; a few drops of concentrated sulphuric acid are added slowly, swirling",
    names: [w("water", "पानी"), w("concentrated acid", "सांद्र अम्ल")],
    steps: [
      {
        button: w("▶ Add the acid to the water, slowly", "▶ अम्ल को पानी में धीरे-धीरे डालो"),
        what: "the beaker gets warm; the heat spreads through the water safely",
        seen: [
          w("the beaker gets warm", "बीकर गर्म हो जाता है"),
          w("safe: acid into water", "सुरक्षित: अम्ल पानी में"),
        ],
      },
    ],
    equation: "",
  },
  waterIntoAcid: {
    setup: "a beaker of concentrated acid; water poured in (the wrong way round)",
    names: [w("concentrated acid", "सांद्र अम्ल"), w("water", "पानी")],
    steps: [
      {
        button: w("▶ See what goes wrong", "▶ देखो क्या गलत होता है"),
        what: "the heat boils the water at once: the mixture splashes out and the glass can crack",
        seen: [
          w("it splashes out: burns", "छींटे उड़ते हैं: जलने का ख़तरा"),
          w("the glass can crack", "काँच चटक सकता है"),
        ],
      },
    ],
    equation: "",
    isWarning: true,
  },
  magnesiumStrongWeak: {
    setup:
      "equal magnesium ribbons in test tube A with hydrochloric acid and test tube B with acetic acid, same amount and concentration",
    names: [w("A: hydrochloric acid", "A: हाइड्रोक्लोरिक अम्ल"), w("B: acetic acid", "B: ऐसीटिक अम्ल")],
    steps: [
      {
        button: w("▶ Drop in the ribbons", "▶ रिबन डालो"),
        what: "A fizzes fast and hard; B fizzes slowly: HCl gives more H⁺ ions, it is the stronger acid",
        seen: [w("A: fizzes hard", "A: तेज़ झाग"), w("B: fizzes slowly", "B: धीमा झाग")],
      },
    ],
    equation: "Mg + 2HCl → MgCl2 + H2",
  },
  copperSulphateHeat: {
    setup: "blue copper sulphate crystals in a dry boiling tube over a flame",
    names: [w("copper sulphate crystals", "कॉपर सल्फ़ेट के क्रिस्टल")],
    steps: [
      {
        button: w("▶ Heat", "▶ गर्म करो"),
        what: "the blue crystals turn white and water droplets form near the mouth of the tube",
        seen: [w("blue → white", "नीला → सफ़ेद"), w("water droplets appear", "पानी की बूँदें")],
      },
      {
        button: w("Add a few drops of water", "पानी की कुछ बूँदें डालो"),
        what: "the white powder turns blue again",
        seen: [w("white → blue again", "सफ़ेद → फिर नीला")],
      },
    ],
    equation: "CuSO4.5H2O → CuSO4 + 5H2O",
  },
  gypsumHeat: {
    setup: "gypsum in a dish heated to 373 K, then water mixed into the powder",
    names: [w("gypsum", "जिप्सम")],
    steps: [
      {
        button: w("▶ Heat to 373 K", "▶ 373 K तक गर्म करो"),
        what: "gypsum loses water and becomes a white powder: plaster of Paris",
        seen: [
          w("steam goes off", "भाप निकलती है"),
          w("white powder: plaster of Paris", "सफ़ेद चूर्ण: प्लास्टर ऑफ़ पेरिस"),
        ],
      },
      {
        button: w("Mix with water", "पानी मिलाओ"),
        what: "it sets into a hard solid mass: gypsum again",
        seen: [w("it sets hard: gypsum again", "सख़्त हो जाता है: फिर जिप्सम")],
      },
    ],
    equation: "CaSO4.2H2O → CaSO4.½H2O + 1½H2O",
  },
  sodaAcidExtinguisher: {
    setup:
      "a wash-bottle of sodium hydrogencarbonate solution with an ignition tube of dilute sulphuric acid hanging inside; a burning candle",
    names: [w("baking soda solution", "खाने के सोडे का घोल"), w("acid", "अम्ल")],
    steps: [
      {
        button: w("▶ Tilt the bottle", "▶ बोतल झुकाओ"),
        what: "the acid mixes with the hydrogencarbonate; carbon dioxide pushes a spray out of the nozzle",
        seen: [w("fizz inside", "अंदर झाग"), w("a spray shoots out", "फुहार निकलती है")],
      },
      {
        button: w("Aim at the candle", "मोमबत्ती पर डालो"),
        what: "the spray puts the candle out",
        seen: [w("the flame goes out", "लौ बुझ जाती है")],
      },
    ],
    equation: "2NaHCO3 + H2SO4 → Na2SO4 + 2H2O + 2CO2",
  },
};

const benchState = z
  .object({
    kind: z.nativeEnum(AcidBenchKind),
    /** Steps done so far (0: nothing yet). */
    step: z.number().int().min(0).max(3),
    showNames: z.boolean(),
    showObservations: z.boolean(),
    /** Write the equation once the last step is done. */
    showEquation: z.boolean(),
    canStep: z.boolean(),
  })
  .strict();
export type AcidBenchState = z.infer<typeof benchState>;

export const stepsOf = (kind: AcidBenchKind): number => ACID_BENCH[kind].steps.length;

/** Everything seen so far, in order. */
export const seenSoFar = (s: AcidBenchState): Words[] =>
  ACID_BENCH[s.kind].steps.slice(0, s.step).flatMap((x) => x.seen);

export function describeAcidBench(s: AcidBenchState): string {
  const info = ACID_BENCH[s.kind];
  if (s.step === 0) return `On the bench: ${info.setup}. Nothing done yet.`;
  const done = info.steps
    .slice(0, s.step)
    .map((x) => x.what)
    .join("; then ");
  return `${info.setup}. ${done}.${info.isWarning === true ? " Never add water to concentrated acid." : ""}`;
}

const act = actionsFor<AcidBenchState>();

export const acidBench = defineProp({
  type: "acidBench",
  describe:
    "The experiments of NCERT Class 10 Chapter 2 (acids, bases and salts) on a lab bench, each in the book's steps: zinc with dilute acid or with sodium hydroxide (bubbles, then the hydrogen pop), sodium carbonate and hydrogencarbonate with acid through lime water (milky, then clear with more gas), copper oxide dissolving in acid (blue-green), dry and wet litmus in HCl gas, acid into water (warm, safe) and water into acid (splashes), magnesium in a strong and a weak acid, copper sulphate crystals heated (white, droplets) and wetted again (blue), gypsum heated to plaster of Paris and set again, and a soda-acid fire extinguisher. Each step is a button; what is seen stays on screen.",
  state: benchState,
  defaults: {
    kind: AcidBenchKind.ZincAcid,
    step: 0,
    showNames: true,
    showObservations: true,
    showEquation: false,
    canStep: true,
  },
  inputs: ["showNames", "showObservations", "showEquation", "canStep"],
  invariant: (s) =>
    s.step <= stepsOf(s.kind) ? undefined : "step is beyond the experiment's last step",
  derived: {
    [AcidBenchDerived.Steps]: {
      describe: "How many steps this experiment has (1 or 2)",
      compute: (s) => stepsOf(s.kind),
    },
    [AcidBenchDerived.IsDone]: {
      describe: "Every step has been done",
      compute: (s) => s.step >= stepsOf(s.kind),
    },
    [AcidBenchDerived.Observations]: {
      describe: "What has been seen so far, in words",
      compute: (s) => seenSoFar(s).map((x) => x.en),
    },
    [AcidBenchDerived.Equation]: {
      describe: "The reaction's equation (empty when the experiment has none)",
      compute: (s) => ACID_BENCH[s.kind].equation,
    },
  },
  actions: {
    [AcidBenchAction.Next]: act({
      describe: "Do the next step of the experiment (the button says what it is)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const n = stepsOf(s.kind);
        if (s.step >= n) return set({});
        const step = s.step + 1;
        const stepped = { signal: AcidBenchSignal.Stepped, payload: { kind: s.kind, step } };
        return step === n
          ? set({ step }, stepped, { signal: AcidBenchSignal.Done, payload: { kind: s.kind } })
          : set({ step }, stepped);
      },
    }),
    [AcidBenchAction.Reset]: act({
      describe: "Set the bench back to before the experiment",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
  },
  signals: {
    [AcidBenchSignal.Stepped]: {
      describe: "A step of the experiment was done (payload: step)",
      isCommit: true,
    },
    [AcidBenchSignal.Done]: { describe: "The experiment's last step was done" },
  },
  observe: (s) => {
    const info = ACID_BENCH[s.kind];
    const elements: Element[] = [{ id: AcidBenchPart.Apparatus, value: info.setup }];
    if (s.step > 0 && s.showObservations)
      elements.push({
        id: AcidBenchPart.Observations,
        value: seenSoFar(s)
          .map((x) => x.en)
          .join("; "),
      });
    const next = info.steps[s.step];
    if (s.canStep)
      elements.push({
        id: AcidBenchPart.Next,
        value: next === undefined ? "again" : next.button.en,
      });
    return {
      summary: describeAcidBench(s),
      elements,
      hidden: { stillToSee: info.steps.slice(s.step).map((x) => x.what) },
    };
  },
  parts: (s) => [
    AcidBenchPart.Apparatus,
    ...(s.step > 0 && s.showObservations ? [AcidBenchPart.Observations] : []),
    ...(s.canStep ? [AcidBenchPart.Next] : []),
  ],
});
