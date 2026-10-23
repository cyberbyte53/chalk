import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import type { Words } from "./words";

/**
 * One experiment from the chapter on a lab bench: the apparatus before, and, once started, what
 * happens (a flame, a colour, bubbles, a precipitate, the thermometer). It plays once and rests on
 * what is seen at the end.
 */

export const BenchKind = {
  MagnesiumBurns: "magnesiumBurns",
  LeadIodide: "leadIodide",
  ZincAcid: "zincAcid",
  QuickLime: "quickLime",
  FerrousSulphateHeat: "ferrousSulphateHeat",
  LeadNitrateHeat: "leadNitrateHeat",
  SilverChlorideSun: "silverChlorideSun",
  IronNailCopperSulphate: "ironNailCopperSulphate",
  BariumSulphatePrecipitate: "bariumSulphatePrecipitate",
  CopperHeated: "copperHeated",
  CopperReduced: "copperReduced",
  BariumHydroxideCold: "bariumHydroxideCold",
} as const;
export type BenchKind = (typeof BenchKind)[keyof typeof BenchKind];

/** The four signs NCERT gives that a chemical reaction has happened. */
export const ReactionSign = {
  ChangeInState: "changeInState",
  ChangeInColour: "changeInColour",
  GasEvolved: "gasEvolved",
  ChangeInTemperature: "changeInTemperature",
} as const;
export type ReactionSign = (typeof ReactionSign)[keyof typeof ReactionSign];

export const Temperature = { Rises: "rises", Falls: "falls", Same: "same" } as const;
export type Temperature = (typeof Temperature)[keyof typeof Temperature];

export const BenchAction = { Start: "start", Reset: "reset" } as const;
export const BenchSignal = { Started: "started" } as const;
export const BenchDerived = {
  Signs: "signs",
  Temperature: "temperature",
  Observations: "observations",
} as const;
export const BenchPart = {
  Apparatus: "apparatus",
  Thermometer: "thermometer",
  Observations: "observations",
  Start: "start",
} as const;

/** How long the reaction takes to play, seconds (the view's animation; the state is instant). */
export const PLAY_SECONDS = 3;

type KindInfo = {
  /** What is on the bench, in a phrase. */
  setup: string;
  /** What is seen once it has happened, each with its words on screen. */
  seen: readonly { what: string; words: Words }[];
  signs: readonly ReactionSign[];
  temperature: Temperature;
  /** The substances on the bench, labelled when `showNames`. */
  names: readonly Words[];
};

const S = ReactionSign;
export const BENCH: Record<BenchKind, KindInfo> = {
  [BenchKind.MagnesiumBurns]: {
    setup: "a cleaned magnesium ribbon held in tongs over a spirit lamp, a watch-glass below",
    seen: [
      {
        what: "it burns with a dazzling white flame",
        words: { en: "dazzling white flame", hi: "चकाचौंध करने वाली सफ़ेद लौ" },
      },
      {
        what: "a white powder (magnesium oxide) collects",
        words: { en: "white powder", hi: "सफ़ेद चूर्ण" },
      },
    ],
    signs: [S.ChangeInState, S.ChangeInColour],
    temperature: Temperature.Same,
    names: [
      { en: "magnesium ribbon", hi: "मैग्नीशियम रिबन" },
      { en: "watch-glass", hi: "वॉच-ग्लास" },
    ],
  },
  [BenchKind.LeadIodide]: {
    setup: "a test tube of colourless lead nitrate solution; potassium iodide solution is added",
    seen: [
      {
        what: "a yellow precipitate (lead iodide) forms",
        words: { en: "yellow precipitate", hi: "पीला अवक्षेप" },
      },
    ],
    signs: [S.ChangeInColour, S.ChangeInState],
    temperature: Temperature.Same,
    names: [
      { en: "lead nitrate", hi: "लेड नाइट्रेट" },
      { en: "potassium iodide", hi: "पोटैशियम आयोडाइड" },
    ],
  },
  [BenchKind.ZincAcid]: {
    setup: "zinc granules in a test tube; dilute sulphuric acid is added",
    seen: [
      {
        what: "bubbles of a gas (hydrogen) rise from the zinc",
        words: { en: "bubbles of gas", hi: "गैस के बुलबुले" },
      },
      { what: "the test tube gets warm", words: { en: "gets warm", hi: "गर्म होती है" } },
    ],
    signs: [S.GasEvolved, S.ChangeInTemperature],
    temperature: Temperature.Rises,
    names: [
      { en: "zinc granules", hi: "जिंक के दाने" },
      { en: "dilute acid", hi: "तनु अम्ल" },
    ],
  },
  [BenchKind.QuickLime]: {
    setup: "lumps of quick lime (calcium oxide) in a beaker; water is added slowly",
    seen: [
      {
        what: "it hisses and steams as it reacts",
        words: { en: "hisses and steams", hi: "सनसनाता है, भाप उठती है" },
      },
      { what: "the beaker gets very hot", words: { en: "very hot", hi: "बहुत गर्म" } },
    ],
    signs: [S.ChangeInTemperature],
    temperature: Temperature.Rises,
    names: [
      { en: "quick lime", hi: "बिना बुझा चूना" },
      { en: "water", hi: "जल" },
    ],
  },
  [BenchKind.FerrousSulphateHeat]: {
    setup: "green ferrous sulphate crystals in a dry boiling tube, heated over a burner",
    seen: [
      {
        what: "the green crystals turn reddish brown",
        words: { en: "green → reddish brown", hi: "हरा → लाल-भूरा" },
      },
      {
        what: "gases rise with the smell of burning sulphur",
        words: { en: "smell of burning sulphur", hi: "जलते सल्फ़र की गंध" },
      },
    ],
    signs: [S.ChangeInColour, S.GasEvolved],
    temperature: Temperature.Same,
    names: [{ en: "ferrous sulphate", hi: "फ़ेरस सल्फ़ेट" }],
  },
  [BenchKind.LeadNitrateHeat]: {
    setup: "white lead nitrate powder in a boiling tube held with tongs over a flame",
    seen: [
      {
        what: "brown fumes (nitrogen dioxide) come out",
        words: { en: "brown fumes", hi: "भूरा धुआँ" },
      },
    ],
    signs: [S.GasEvolved, S.ChangeInColour],
    temperature: Temperature.Same,
    names: [{ en: "lead nitrate", hi: "लेड नाइट्रेट" }],
  },
  [BenchKind.SilverChlorideSun]: {
    setup: "white silver chloride in a china dish, left in sunlight",
    seen: [
      {
        what: "the white silver chloride turns grey (silver)",
        words: { en: "white → grey", hi: "सफ़ेद → धूसर" },
      },
    ],
    signs: [S.ChangeInColour],
    temperature: Temperature.Same,
    names: [{ en: "silver chloride", hi: "सिल्वर क्लोराइड" }],
  },
  [BenchKind.IronNailCopperSulphate]: {
    setup:
      "two test tubes of blue copper sulphate solution, A and B; iron nails hang in B, and one nail is kept aside",
    seen: [
      { what: "the blue colour in B fades", words: { en: "blue fades", hi: "नीला रंग फीका" } },
      {
        what: "the nails in B turn brown",
        words: { en: "nail turns brown", hi: "कील भूरी हो जाती है" },
      },
    ],
    signs: [S.ChangeInColour],
    temperature: Temperature.Same,
    names: [
      { en: "A", hi: "A" },
      { en: "B", hi: "B" },
      { en: "kept aside", hi: "अलग रखी" },
    ],
  },
  [BenchKind.BariumSulphatePrecipitate]: {
    setup: "a test tube of sodium sulphate solution; barium chloride solution is poured in",
    seen: [
      {
        what: "a white precipitate (barium sulphate) forms",
        words: { en: "white precipitate", hi: "सफ़ेद अवक्षेप" },
      },
    ],
    signs: [S.ChangeInState],
    temperature: Temperature.Same,
    names: [
      { en: "sodium sulphate", hi: "सोडियम सल्फ़ेट" },
      { en: "barium chloride", hi: "बेरियम क्लोराइड" },
    ],
  },
  [BenchKind.CopperHeated]: {
    setup: "brown copper powder in a china dish, heated over a burner",
    seen: [
      {
        what: "the surface turns black (copper(II) oxide)",
        words: { en: "brown → black", hi: "भूरा → काला" },
      },
    ],
    signs: [S.ChangeInColour],
    temperature: Temperature.Same,
    names: [{ en: "copper powder", hi: "कॉपर चूर्ण" }],
  },
  [BenchKind.CopperReduced]: {
    setup: "the black copper(II) oxide, heated, with hydrogen gas passed over it",
    seen: [
      {
        what: "the black coating turns brown again (copper); water droplets form",
        words: { en: "black → brown", hi: "काला → भूरा" },
      },
    ],
    signs: [S.ChangeInColour],
    temperature: Temperature.Same,
    names: [
      { en: "copper(II) oxide", hi: "कॉपर(II) ऑक्साइड" },
      { en: "hydrogen", hi: "हाइड्रोजन" },
    ],
  },
  [BenchKind.BariumHydroxideCold]: {
    setup: "barium hydroxide and ammonium chloride mixed in a test tube with a glass rod",
    seen: [
      {
        what: "the test tube turns cold to the touch",
        words: { en: "turns cold", hi: "ठंडी हो जाती है" },
      },
    ],
    signs: [S.ChangeInTemperature],
    temperature: Temperature.Falls,
    names: [
      { en: "barium hydroxide", hi: "बेरियम हाइड्रॉक्साइड" },
      { en: "ammonium chloride", hi: "अमोनियम क्लोराइड" },
    ],
  },
};

const benchState = z
  .object({
    kind: z.nativeEnum(BenchKind),
    /** The reaction has been set going (it then rests at its end). */
    isStarted: z.boolean(),
    /** A thermometer in the mixture (or held to it). */
    showThermometer: z.boolean(),
    /** Name what is on the bench. */
    showNames: z.boolean(),
    /** Once it has happened, write what is seen. */
    showObservations: z.boolean(),
    /** The learner can start it (and run it again). */
    canStart: z.boolean(),
  })
  .strict();
export type BenchState = z.infer<typeof benchState>;

/** The thermometer's reading as a fraction of its column, before and after. */
export function mercuryOf(s: Pick<BenchState, "kind" | "isStarted">): number {
  const t = BENCH[s.kind].temperature;
  if (!s.isStarted || t === Temperature.Same) return 0.42;
  return t === Temperature.Rises ? (s.kind === BenchKind.QuickLime ? 0.92 : 0.62) : 0.18;
}

export function describeBench(s: BenchState): string {
  const info = BENCH[s.kind];
  if (!s.isStarted) return `On the bench: ${info.setup}. Not started yet.`;
  const temp =
    s.showThermometer && info.temperature !== Temperature.Same
      ? `; the thermometer ${info.temperature}`
      : "";
  return `${info.setup}. What happens: ${info.seen.map((x) => x.what).join("; ")}${temp}.`;
}

const act = actionsFor<BenchState>();

export const reactionBench = defineProp({
  type: "reactionBench",
  describe:
    "One experiment from Class 10 chemistry on a lab bench (burning magnesium, lead iodide, zinc and acid, quick lime and water, heating ferrous sulphate or lead nitrate, silver chloride in sunlight, an iron nail in copper sulphate, barium sulphate, heating copper and reducing it, barium hydroxide with ammonium chloride). Before it starts, only the apparatus; once started it plays out (flames, colours, bubbles, fumes, precipitates, a thermometer rising or falling) and stays showing the end. It knows which signs of a chemical reaction the experiment shows: change in state, colour, gas given off, change in temperature.",
  state: benchState,
  defaults: {
    kind: BenchKind.MagnesiumBurns,
    isStarted: false,
    showThermometer: false,
    showNames: true,
    showObservations: true,
    canStart: true,
  },
  inputs: ["showThermometer", "showNames", "showObservations", "canStart"],
  derived: {
    [BenchDerived.Signs]: {
      describe:
        "Which signs of a chemical reaction it shows once started: changeInState, changeInColour, gasEvolved, changeInTemperature (empty before it starts)",
      compute: (s) => (s.isStarted ? [...BENCH[s.kind].signs] : []),
    },
    [BenchDerived.Temperature]: {
      describe:
        "What the temperature does once started: rises, falls or same (same before it starts)",
      compute: (s) => (s.isStarted ? BENCH[s.kind].temperature : Temperature.Same),
    },
    [BenchDerived.Observations]: {
      describe: "What is seen once it has happened, in words (empty before it starts)",
      compute: (s) => (s.isStarted ? BENCH[s.kind].seen.map((x) => x.what) : []),
    },
  },
  actions: {
    [BenchAction.Start]: act({
      describe: "Start the experiment: it plays out and stays showing what happened",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        set({ isStarted: true }, { signal: BenchSignal.Started, payload: { kind: s.kind } }),
    }),
    [BenchAction.Reset]: act({
      describe: "Set the bench back to before the experiment",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ isStarted: false }),
    }),
  },
  signals: {
    [BenchSignal.Started]: { describe: "The experiment was started", isCommit: true },
  },
  observe: (s) => {
    const info = BENCH[s.kind];
    const elements: Element[] = [{ id: BenchPart.Apparatus, value: info.setup }];
    if (s.showThermometer)
      elements.push({
        id: BenchPart.Thermometer,
        value:
          s.isStarted && info.temperature !== Temperature.Same
            ? `it ${info.temperature}`
            : "steady",
      });
    if (s.isStarted && s.showObservations)
      elements.push({ id: BenchPart.Observations, value: info.seen.map((x) => x.what).join("; ") });
    if (s.canStart) elements.push({ id: BenchPart.Start, value: s.isStarted ? "again" : "start" });
    return {
      summary: describeBench(s),
      elements,
      hidden: s.isStarted ? {} : { willShow: info.seen.map((x) => x.what) },
    };
  },
  parts: (s) => [
    BenchPart.Apparatus,
    ...(s.showThermometer ? [BenchPart.Thermometer] : []),
    ...(s.isStarted && s.showObservations ? [BenchPart.Observations] : []),
    ...(s.canStart ? [BenchPart.Start] : []),
  ],
});
