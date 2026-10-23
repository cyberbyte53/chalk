import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Using sunlight (NCERT 14.3.1), in three set-ups:
 * - flasks: Activity 14.5, a black-painted and a white-painted flask of water in the sun; the
 *   black one absorbs more and warms faster;
 * - cooker: a box solar cooker (Fig 14.6) whose parts can each be added: a black inside (absorbs),
 *   a glass lid (traps heat, the greenhouse effect) and a plane mirror (sends more sunlight in).
 *   Its temperature climbs towards a ceiling set by the parts; 100 °C or more cooks;
 * - panel: solar cells, each about 0.5 V and 0.7 W in sunshine (NCERT), joined in a row (series),
 *   so the volts add and the watts add.
 * The sky can be sunny, cloudy or night: clouds cut the sunlight to a fifth; at night there is none.
 * The temperatures are a simple model (rising towards a ceiling), not measured values.
 */

export const SolarMode = { Flasks: "flasks", Cooker: "cooker", Panel: "panel" } as const;
export type SolarMode = (typeof SolarMode)[keyof typeof SolarMode];

export const Sky = { Sunny: "sunny", Cloudy: "cloudy", Night: "night" } as const;
export type Sky = (typeof Sky)[keyof typeof Sky];

export const CookerPart = { Black: "black", Glass: "glass", Mirror: "mirror" } as const;
export type CookerPart = (typeof CookerPart)[keyof typeof CookerPart];

export const START_C = 30;
export const COOKS_AT = 100;
export const MINUTES_STEP = 15;
export const MAX_MINUTES = 120;
export const VOLTS_PER_CELL = 0.5;
export const WATTS_PER_CELL = 0.7;
export const MAX_CELLS = 36;
/** How fast temperatures approach their ceiling (minutes). */
const TAU = 40;

export const SUN: Readonly<Record<Sky, number>> = { sunny: 1, cloudy: 0.2, night: 0 };

/** How many °C above the start a set-up can reach in full sun. */
export function ceilingOf(parts: Readonly<Record<CookerPart, boolean>>): number {
  return 20 + (parts.black ? 25 : 0) + (parts.glass ? 30 : 0) + (parts.mirror ? 25 : 0);
}

/** Temperature after `minutes`, rising from 30 °C towards start + ceiling × sunlight. */
export function warmTo(ceiling: number, sky: Sky, minutes: number): number {
  return START_C + ceiling * SUN[sky] * (1 - Math.exp(-minutes / TAU));
}

/** Activity 14.5's flasks: black absorbs more (a ceiling of 25 °C above start), white less (8 °C). */
export const flaskTemps = (sky: Sky, minutes: number): { black: number; white: number } => ({
  black: warmTo(25, sky, minutes),
  white: warmTo(8, sky, minutes),
});

const solarState = z
  .object({
    mode: z.nativeEnum(SolarMode),
    sky: z.nativeEnum(Sky),
    minutes: z.number().int().min(0).max(MAX_MINUTES).multipleOf(MINUTES_STEP),
    hasBlack: z.boolean(),
    hasGlass: z.boolean(),
    hasMirror: z.boolean(),
    cells: z.number().int().min(1).max(MAX_CELLS),
    showNames: z.boolean(),
    canWait: z.boolean(),
    canSetParts: z.boolean(),
    canSetSky: z.boolean(),
    canSetCells: z.boolean(),
  })
  .strict();
export type SolarState = z.infer<typeof solarState>;

const partsOf = (s: SolarState) => ({ black: s.hasBlack, glass: s.hasGlass, mirror: s.hasMirror });
export const cookerTempOf = (s: SolarState): number =>
  warmTo(ceilingOf(partsOf(s)), s.sky, s.minutes);
export const voltsOf = (s: Pick<SolarState, "cells" | "sky">): number =>
  s.sky === Sky.Night ? 0 : s.cells * VOLTS_PER_CELL;
export const wattsOf = (s: Pick<SolarState, "cells" | "sky">): number =>
  s.cells * WATTS_PER_CELL * SUN[s.sky];

export const SolarAction = {
  Wait: "wait",
  Reset: "reset",
  SetPart: "setPart",
  SetSky: "setSky",
  SetCells: "setCells",
} as const;
export const SolarSignal = { Waited: "waited", Cooked: "cooked", Changed: "changed" } as const;
export const SolarDerived = {
  Black: "black",
  White: "white",
  Temperature: "temperature",
  CanCook: "canCook",
  Volts: "volts",
  Watts: "watts",
} as const;
export const SolarPart = {
  Picture: "picture",
  Thermometer: "thermometer",
  Readout: "readout",
  Controls: "controls",
} as const;

const round1 = (v: number) => Math.round(v * 10) / 10;

export function describeSolar(s: SolarState): string {
  const sky = { sunny: "in full sunshine", cloudy: "under clouds", night: "at night" }[s.sky];
  if (s.mode === SolarMode.Flasks) {
    const t = flaskTemps(s.sky, s.minutes);
    return `Activity 14.5: a black-painted and a white-painted flask of water ${sky}, after ${s.minutes} minutes. Black: about ${Math.round(t.black)} °C; white: about ${Math.round(t.white)} °C.`;
  }
  if (s.mode === SolarMode.Cooker) {
    const have = [
      s.hasBlack && "a black inside",
      s.hasGlass && "a glass lid",
      s.hasMirror && "a mirror",
    ]
      .filter(Boolean)
      .join(", ");
    const t = cookerTempOf(s);
    return `A box solar cooker with ${have || "none of its parts (a plain box)"}, ${sky}, after ${s.minutes} minutes: about ${Math.round(t)} °C, ${t >= COOKS_AT ? "hot enough to cook" : "not hot enough to cook"}.`;
  }
  return `A solar panel of ${s.cells} cell${s.cells === 1 ? "" : "s"} in a row, ${sky}: ${round1(voltsOf(s))} V and ${round1(wattsOf(s))} W.`;
}

const act = actionsFor<SolarState>();

export const solarLab = defineProp({
  type: "solarLab",
  describe:
    "Using sunlight (NCERT 14.3.1): Activity 14.5's black and white flasks warming in the sun; a box solar cooker whose black inside, glass lid and mirror can each be added, warming over time (100 °C cooks); and a solar panel of cells (about 0.5 V and 0.7 W each) whose volts and watts add. The sky can be sunny, cloudy or night.",
  state: solarState,
  defaults: {
    mode: SolarMode.Flasks,
    sky: Sky.Sunny,
    minutes: 0,
    hasBlack: true,
    hasGlass: true,
    hasMirror: true,
    cells: 4,
    showNames: true,
    canWait: true,
    canSetParts: false,
    canSetSky: false,
    canSetCells: false,
  },
  inputs: ["mode", "showNames", "canWait", "canSetParts", "canSetSky", "canSetCells"],
  derived: {
    [SolarDerived.Black]: {
      describe: "Flasks: the black flask's water temperature, °C",
      compute: (s) => round1(flaskTemps(s.sky, s.minutes).black),
    },
    [SolarDerived.White]: {
      describe: "Flasks: the white flask's water temperature, °C",
      compute: (s) => round1(flaskTemps(s.sky, s.minutes).white),
    },
    [SolarDerived.Temperature]: {
      describe: "Cooker: the temperature inside, °C",
      compute: (s) => round1(cookerTempOf(s)),
    },
    [SolarDerived.CanCook]: {
      describe: "Cooker: whether it has reached 100 °C, hot enough to cook",
      compute: (s) => cookerTempOf(s) >= COOKS_AT,
    },
    [SolarDerived.Volts]: {
      describe: "Panel: the voltage of the cells in a row, V",
      compute: (s) => round1(voltsOf(s)),
    },
    [SolarDerived.Watts]: {
      describe: "Panel: the power it gives, W",
      compute: (s) => round1(wattsOf(s)),
    },
  },
  actions: {
    [SolarAction.Wait]: act({
      describe: "Let 15 more minutes pass in the sun",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const minutes = Math.min(MAX_MINUTES, s.minutes + MINUTES_STEP);
        const next = { ...s, minutes };
        const didCook =
          s.mode === SolarMode.Cooker &&
          cookerTempOf(next) >= COOKS_AT &&
          cookerTempOf(s) < COOKS_AT;
        return set(
          { minutes },
          { signal: SolarSignal.Waited, payload: { minutes } },
          ...(didCook ? [{ signal: SolarSignal.Cooked, payload: { minutes } }] : []),
        );
      },
    }),
    [SolarAction.Reset]: act({
      describe: "Start the clock again at 0 minutes",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ minutes: 0 }),
    }),
    [SolarAction.SetPart]: act({
      describe: "Cooker: add or remove the black inside, the glass lid or the mirror",
      byLearner: true,
      args: z.object({ part: z.nativeEnum(CookerPart), has: z.boolean() }).strict(),
      run: (_s, a) =>
        set(
          a.part === CookerPart.Black
            ? { hasBlack: a.has }
            : a.part === CookerPart.Glass
              ? { hasGlass: a.has }
              : { hasMirror: a.has },
          { signal: SolarSignal.Changed, payload: { part: a.part, has: a.has } },
        ),
    }),
    [SolarAction.SetSky]: act({
      describe: "Set the sky: sunny, cloudy or night",
      byLearner: true,
      args: z.object({ sky: z.nativeEnum(Sky) }).strict(),
      run: (_s, a) => set({ sky: a.sky }, { signal: SolarSignal.Changed, payload: { sky: a.sky } }),
    }),
    [SolarAction.SetCells]: act({
      describe: "Panel: set how many cells are in the row (1 … 36)",
      byLearner: true,
      args: z.object({ cells: z.number().int().min(1).max(MAX_CELLS) }).strict(),
      run: (_s, a) =>
        set({ cells: a.cells }, { signal: SolarSignal.Changed, payload: { cells: a.cells } }),
    }),
  },
  signals: {
    [SolarSignal.Waited]: { describe: "Time passed; the payload has the minutes so far" },
    [SolarSignal.Cooked]: { describe: "The cooker just reached 100 °C" },
    [SolarSignal.Changed]: { describe: "A part, the sky or the number of cells changed" },
  },
  observe: (s) => ({
    summary: describeSolar(s),
    elements: [
      { id: SolarPart.Picture, value: `${s.mode}, ${s.sky}` },
      {
        id: SolarPart.Readout,
        value:
          s.mode === SolarMode.Flasks
            ? `black ${Math.round(flaskTemps(s.sky, s.minutes).black)} °C, white ${Math.round(flaskTemps(s.sky, s.minutes).white)} °C`
            : s.mode === SolarMode.Cooker
              ? `${Math.round(cookerTempOf(s))} °C`
              : `${round1(voltsOf(s))} V, ${round1(wattsOf(s))} W`,
      },
    ],
  }),
  parts: () => [SolarPart.Picture, SolarPart.Readout, SolarPart.Controls],
});
