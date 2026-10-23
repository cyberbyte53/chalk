import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Transport in plants (NCERT 6.4.2). Water mode: water and minerals go up the xylem from the roots
 * to the leaves; by day, with stomata open, evaporation from the leaves (transpiration) pulls the
 * water up; at night, root pressure (water entering the roots) does most of the pushing. Food mode:
 * the phloem carries sugar where it is needed, using energy from ATP: in summer from the leaves to
 * the roots, fruits and seeds; in spring from stores in the roots and stem up to the growing buds.
 * Bag mode is Activity 6.8: a plant and a stick under plastic in the sun; only the plant's cover
 * mists over with water.
 */

export const TransportMode = { Water: "water", Food: "food", Bag: "bag" } as const;
export type TransportMode = (typeof TransportMode)[keyof typeof TransportMode];

export const Season = { Summer: "summer", Spring: "spring" } as const;
export type Season = (typeof Season)[keyof typeof Season];

export const BAG_STEPS = 2;

export const TransportAction = {
  SetDay: "setDay",
  SetSeason: "setSeason",
  Next: "next",
  Reset: "reset",
} as const;
export const TransportSignal = { Changed: "changed" } as const;
export const TransportDerived = {
  MainForce: "mainForce",
  Direction: "direction",
  DropletsOn: "dropletsOn",
} as const;
export const TransportPart = { Plant: "plant", Toggle: "toggle", Next: "next" } as const;

const transportState = z
  .object({
    mode: z.nativeEnum(TransportMode),
    isDay: z.boolean(),
    season: z.nativeEnum(Season),
    /** Bag mode: 0 just covered, 1 after half an hour in the sun. */
    step: z
      .number()
      .int()
      .min(0)
      .max(BAG_STEPS - 1),
    canToggle: z.boolean(),
  })
  .strict();
export type TransportState = z.infer<typeof transportState>;

export const mainForceOf = (isDay: boolean): "transpirationPull" | "rootPressure" =>
  isDay ? "transpirationPull" : "rootPressure";

export function describeTransport(s: TransportState): string {
  if (s.mode === TransportMode.Water)
    return s.isDay
      ? "Day: the stomata are open and water evaporates from the leaves (transpiration). This pulls water and the minerals in it up the xylem from the roots: the transpiration pull is the main force."
      : "Night: the stomata are closed and little water evaporates. Root cells take in ions from the soil, water follows them into the roots, and this root pressure pushes water up the xylem.";
  if (s.mode === TransportMode.Food)
    return s.season === Season.Summer
      ? "Summer: sugar made in the leaves travels in the phloem down to the roots, fruits and seeds, where it is stored. Moving it uses energy from ATP."
      : "Spring: sugar stored in the roots and stem travels up the phloem to the buds, which need energy to grow. The phloem can move food up or down.";
  return s.step === 0
    ? "Two pots, one with a plant and one with a stick of the same height, the soil covered so nothing evaporates from it, each covered with a plastic sheet."
    : "After half an hour in bright sun, the plastic over the plant is misty with water drops; the stick's is dry. The water came out of the plant's leaves: transpiration.";
}

const act = actionsFor<TransportState>();
const changed = (s: TransportState) => ({
  signal: TransportSignal.Changed,
  payload: { isDay: s.isDay, season: s.season, step: s.step },
});

export const plantTransport = defineProp({
  type: "plantTransport",
  describe:
    "Transport in a plant. Water mode: water and minerals up the xylem; by day the transpiration pull (water evaporating from open stomata), at night root pressure. Food mode: sugar in the phloem, down to roots, fruits and seeds in summer and up from the stores to the buds in spring, using ATP. Bag mode (Activity 6.8): a plant and a stick under plastic in the sun; only the plant's cover mists over.",
  state: transportState,
  defaults: {
    mode: TransportMode.Water,
    isDay: true,
    season: Season.Summer,
    step: 0,
    canToggle: true,
  },
  inputs: ["mode", "canToggle"],
  derived: {
    [TransportDerived.MainForce]: {
      describe:
        "Water mode: what mainly moves water up ('transpirationPull' by day, 'rootPressure' at night)",
      compute: (s) => mainForceOf(s.isDay),
    },
    [TransportDerived.Direction]: {
      describe: "Food mode: which way sugar moves in the phloem ('down' in summer, 'up' in spring)",
      compute: (s) => (s.season === Season.Summer ? "down" : "up"),
    },
    [TransportDerived.DropletsOn]: {
      describe: "Bag mode: which cover has water drops ('plant' after the sun, else null)",
      compute: (s) => (s.mode === TransportMode.Bag && s.step === 1 ? "plant" : null),
    },
  },
  actions: {
    [TransportAction.SetDay]: act({
      describe: "Water mode: day or night",
      byLearner: true,
      args: z.object({ day: z.boolean() }).strict(),
      run: (s, a) => set({ isDay: a.day }, changed({ ...s, isDay: a.day })),
    }),
    [TransportAction.SetSeason]: act({
      describe: "Food mode: summer or spring",
      byLearner: true,
      args: z.object({ season: z.nativeEnum(Season) }).strict(),
      run: (s, a) => set({ season: a.season }, changed({ ...s, season: a.season })),
    }),
    [TransportAction.Next]: act({
      describe: "Bag mode: leave them in the sun for half an hour",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => set({ step: 1 }, changed({ ...s, step: 1 })),
    }),
    [TransportAction.Reset]: act({
      describe: "Bag mode: start again",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => set({ step: 0 }, changed({ ...s, step: 0 })),
    }),
  },
  signals: {
    [TransportSignal.Changed]: { describe: "Day/night, the season or the bag step changed" },
  },
  observe: (s) => ({
    summary: describeTransport(s),
    elements: [{ id: TransportPart.Plant, value: describeTransport(s) }],
  }),
  parts: () => [TransportPart.Plant, TransportPart.Toggle, TransportPart.Next],
});
