import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Respiration (NCERT 6.3). Pathways mode: glucose (a 6-carbon molecule) is first broken into
 * pyruvate (a 3-carbon molecule) in the cytoplasm; then the pyruvate goes one of three ways —
 * aerobic, in the mitochondria with oxygen, to carbon dioxide and water with a lot of energy; in
 * yeast without oxygen (fermentation) to ethanol and carbon dioxide; in muscle short of oxygen to
 * lactic acid (cramps). The energy is used to make ATP. Lime-water mode is Activities 6.4 and 6.5:
 * lime water turns milky with carbon dioxide — quickly with breathed-out air or yeast's gas, hardly
 * at all with ordinary air from a pichkari.
 */

export const RespirationMode = { Pathways: "pathways", LimeWater: "limeWater" } as const;
export type RespirationMode = (typeof RespirationMode)[keyof typeof RespirationMode];

export const Route = { Aerobic: "aerobic", Yeast: "yeast", Muscle: "muscle" } as const;
export type Route = (typeof Route)[keyof typeof Route];

export const GasSource = { Breath: "breath", Pichkari: "pichkari", Yeast: "yeast" } as const;
export type GasSource = (typeof GasSource)[keyof typeof GasSource];

export const PATH_STEPS = 3;
export const MAX_BUBBLES = 8;
/** How much milkier the lime water gets per round of bubbles, by where the gas comes from. */
export const MILK_RATE: Readonly<Record<GasSource, number>> = {
  breath: 0.34,
  pichkari: 0.06,
  yeast: 0.26,
};
/** Lime water counts as milky from this much. */
export const MILKY = 0.75;

export const RespirationAction = {
  Next: "next",
  Reset: "reset",
  SetRoute: "setRoute",
  SetSource: "setSource",
  Bubble: "bubble",
} as const;
export const RespirationSignal = {
  Stepped: "stepped",
  Bubbled: "bubbled",
  TurnedMilky: "turnedMilky",
} as const;
export const RespirationDerived = {
  Place: "place",
  NeedsOxygen: "needsOxygen",
  Products: "products",
  Energy: "energy",
  Milkiness: "milkiness",
  IsMilky: "isMilky",
} as const;
export const RespirationPart = {
  Picture: "picture",
  Next: "next",
  Routes: "routes",
  Bubble: "bubble",
} as const;

const respirationState = z
  .object({
    mode: z.nativeEnum(RespirationMode),
    route: z.nativeEnum(Route),
    /** Pathways: 0 glucose, 1 pyruvate, 2 the route's products. */
    step: z
      .number()
      .int()
      .min(0)
      .max(PATH_STEPS - 1),
    source: z.nativeEnum(GasSource),
    /** Lime water: how many rounds of gas have bubbled through. */
    bubbles: z.number().int().min(0).max(MAX_BUBBLES),
    canStep: z.boolean(),
    canSetRoute: z.boolean(),
    canSetSource: z.boolean(),
  })
  .strict();
export type RespirationState = z.infer<typeof respirationState>;

export const PRODUCTS: Readonly<Record<Route, readonly string[]>> = {
  aerobic: ["carbon dioxide", "water", "energy"],
  yeast: ["ethanol", "carbon dioxide", "energy"],
  muscle: ["lactic acid", "energy"],
};

/** Where the second stage happens. */
export const placeOf = (route: Route): "mitochondria" | "cytoplasm" =>
  route === Route.Aerobic ? "mitochondria" : "cytoplasm";

export const milkinessOf = (s: Pick<RespirationState, "source" | "bubbles">): number =>
  Math.min(1, s.bubbles * MILK_RATE[s.source]);

const ROUTE_WORDS: Readonly<Record<Route, string>> = {
  aerobic:
    "With oxygen, in the mitochondria: pyruvate is broken down completely to carbon dioxide and water. This aerobic respiration releases a lot of energy.",
  yeast:
    "In yeast, without oxygen: pyruvate becomes ethanol and carbon dioxide (fermentation). This anaerobic respiration releases much less energy.",
  muscle:
    "In our muscles when oxygen runs short: pyruvate becomes lactic acid, another 3-carbon molecule. It builds up and causes cramps. Much less energy is released.",
};

export function describeRespiration(s: RespirationState): string {
  if (s.mode === RespirationMode.LimeWater) {
    const from =
      s.source === GasSource.Breath
        ? "breathed-out air blown through a straw"
        : s.source === GasSource.Pichkari
          ? "ordinary air pushed with a pichkari"
          : "the gas from yeast in sugar solution";
    const m = milkinessOf(s);
    return `Lime water with ${from}: ${s.bubbles} rounds of bubbles so far; it is ${m >= MILKY ? "milky (lots of carbon dioxide)" : m > 0.3 ? "turning cloudy" : "still clear"}.`;
  }
  if (s.step === 0) return "A glucose molecule (6 carbon atoms) in the cytoplasm of a cell.";
  if (s.step === 1)
    return "In the cytoplasm, glucose is broken down into pyruvate (3-carbon molecules), releasing a little energy. This first step is the same in every organism.";
  return ROUTE_WORDS[s.route];
}

const act = actionsFor<RespirationState>();

export const respirationPaths = defineProp({
  type: "respirationPaths",
  describe:
    "Respiration. Pathways mode, in 3 steps: glucose (6-carbon) → pyruvate (3-carbon) in the cytoplasm → one of three routes: aerobic in mitochondria (carbon dioxide + water, a lot of energy), yeast without oxygen (ethanol + carbon dioxide), muscle short of oxygen (lactic acid, cramps); an energy bar shows how much ATP-making energy each gives. Lime-water mode: bubble breathed-out air, pichkari air or yeast's gas through lime water; carbon dioxide turns it milky.",
  state: respirationState,
  defaults: {
    mode: RespirationMode.Pathways,
    route: Route.Aerobic,
    step: 0,
    source: GasSource.Breath,
    bubbles: 0,
    canStep: true,
    canSetRoute: true,
    canSetSource: true,
  },
  inputs: ["mode", "canStep", "canSetRoute", "canSetSource"],
  derived: {
    [RespirationDerived.Place]: {
      describe: "Where the route's second stage happens: 'mitochondria' (aerobic) or 'cytoplasm'",
      compute: (s) => placeOf(s.route),
    },
    [RespirationDerived.NeedsOxygen]: {
      describe: "Whether the chosen route uses oxygen",
      compute: (s) => s.route === Route.Aerobic,
    },
    [RespirationDerived.Products]: {
      describe: "What the chosen route makes from pyruvate",
      compute: (s) => PRODUCTS[s.route],
    },
    [RespirationDerived.Energy]: {
      describe: "How much energy the chosen route releases: 'a lot' (aerobic) or 'a little'",
      compute: (s) => (s.route === Route.Aerobic ? "a lot" : "a little"),
    },
    [RespirationDerived.Milkiness]: {
      describe: "Lime water: how milky it is, 0 (clear) to 1",
      compute: (s) => milkinessOf(s),
    },
    [RespirationDerived.IsMilky]: {
      describe: "Lime water has turned milky",
      compute: (s) => milkinessOf(s) >= MILKY,
    },
  },
  actions: {
    [RespirationAction.Next]: act({
      describe: "Pathways: the next step of breaking down glucose",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = Math.min(s.step + 1, PATH_STEPS - 1);
        return set(
          { step },
          { signal: RespirationSignal.Stepped, payload: { step, route: s.route } },
        );
      },
    }),
    [RespirationAction.Reset]: act({
      describe: "Start again: glucose again, or fresh lime water",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0, bubbles: 0 }),
    }),
    [RespirationAction.SetRoute]: act({
      describe: "Pathways: choose the route the pyruvate takes (aerobic, yeast, muscle)",
      byLearner: true,
      args: z.object({ route: z.nativeEnum(Route) }).strict(),
      run: (s, a) =>
        set(
          { route: a.route },
          { signal: RespirationSignal.Stepped, payload: { step: s.step, route: a.route } },
        ),
    }),
    [RespirationAction.SetSource]: act({
      describe: "Lime water: choose where the gas comes from, with fresh lime water",
      byLearner: true,
      args: z.object({ source: z.nativeEnum(GasSource) }).strict(),
      run: (_s, a) => set({ source: a.source, bubbles: 0 }),
    }),
    [RespirationAction.Bubble]: act({
      describe:
        "Lime water: one more round of gas through it (blow, push the pichkari, or wait ten minutes for the yeast)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const bubbles = Math.min(s.bubbles + 1, MAX_BUBBLES);
        const was = milkinessOf(s) >= MILKY;
        const now = milkinessOf({ ...s, bubbles }) >= MILKY;
        const signals: { signal: string; payload: Record<string, unknown> }[] = [
          { signal: RespirationSignal.Bubbled, payload: { bubbles, milky: now } },
        ];
        if (now && !was)
          signals.push({
            signal: RespirationSignal.TurnedMilky,
            payload: { bubbles, milky: true },
          });
        return set({ bubbles }, ...signals);
      },
    }),
  },
  signals: {
    [RespirationSignal.Stepped]: { describe: "Pathways moved to `step` or changed `route`" },
    [RespirationSignal.Bubbled]: { describe: "Gas bubbled through the lime water" },
    [RespirationSignal.TurnedMilky]: { describe: "The lime water has just turned milky" },
  },
  observe: (s) => ({
    summary: describeRespiration(s),
    elements: [{ id: RespirationPart.Picture, value: describeRespiration(s) }],
  }),
  parts: () => [
    RespirationPart.Picture,
    RespirationPart.Next,
    RespirationPart.Routes,
    RespirationPart.Bubble,
  ],
});
