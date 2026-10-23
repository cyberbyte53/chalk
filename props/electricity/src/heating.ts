import { type Element, actionsFor, defineProp, set, task } from "@chalk/prop";
import { z } from "zod";
import { APPLIANCE_EN, Appliance, WATTS } from "./appliances";
import { num } from "./words";

/**
 * The heating effect of electric current (NCERT 12.7).
 * - Coil mode: a resistor coil in half a litre of water carries a steady current I for t seconds;
 *   the heat produced is H = I²Rt (Joule's law of heating), and the water warms by H ÷ 2100 °C.
 * - Cord mode: a heater on the 220 V mains; the same current flows through the copper cord
 *   (about 0.05 Ω) and the nichrome element (about 24 Ω, a 2000 W heater), so the element makes about
 *   480 times the heat: it glows, the cord stays cool.
 * - Fuse mode: appliances switched on in parallel on the 220 V mains, through a fuse of some
 *   rating. When the current drawn is more than the rating, the fuse wire melts and everything
 *   goes off.
 */

export const HeatAction = {
  SetAmps: "setAmps",
  SetOhms: "setOhms",
  SetSeconds: "setSeconds",
  Run: "run",
  Toggle: "toggle",
  SetRating: "setRating",
  ReplaceFuse: "replaceFuse",
} as const;
export const HeatSignal = { Heated: "heated", Blown: "blown", Switched: "switched" } as const;
export const HeatDerived = {
  Heat: "heat",
  HeatSoFar: "heatSoFar",
  Power: "power",
  Volts: "volts",
  TempRise: "tempRise",
  LineCurrent: "lineCurrent",
  CordHeat: "cordHeat",
  ElementHeat: "elementHeat",
} as const;
export const HeatPart = {
  Coil: "coil",
  Water: "water",
  Thermometer: "thermometer",
  Cord: "cord",
  Element: "element",
  Fuse: "fuse",
  Readout: "readout",
  Controls: "controls",
} as const;

export const HeatMode = { Coil: "coil", Cord: "cord", Fuse: "fuse" } as const;
export type HeatMode = (typeof HeatMode)[keyof typeof HeatMode];

export const MAINS_VOLTS = 220;
/** Joules to warm the half litre of water by 1 °C (0.5 kg × 4200 J/kg °C). */
export const WATER_J_PER_C = 2100;
export const CORD_OHMS = 0.05;
export const ELEMENT_OHMS = 24;
export const FUSE_RATINGS: readonly number[] = [1, 2, 3, 5, 10, 15];
export const FUSE_APPLIANCES: readonly Appliance[] = [
  Appliance.Bulb,
  Appliance.Fan,
  Appliance.Tv,
  Appliance.Iron,
  Appliance.Heater,
  Appliance.Geyser,
];
export const AMP_STEPS: readonly number[] = [0.5, 1, 2, 3, 4, 5, 6, 8, 10];
export const OHM_STEPS: readonly number[] = [1, 2, 4, 5, 10, 20, 40, 50, 100];
export const SECOND_STEPS: readonly number[] = [1, 10, 30, 60, 120, 300, 600];

const heatState = z
  .object({
    mode: z.nativeEnum(HeatMode),
    /** Coil mode: the current, A. */
    amps: z.number().positive().max(20),
    /** Coil mode: the coil's resistance, Ω. */
    ohms: z.number().positive().max(1000),
    /** Coil mode: how long the current flows, s. */
    seconds: z.number().positive().max(3600),
    /** Coil mode: seconds of heating so far (0 to `seconds`). */
    elapsed: z.number().min(0).max(3600),
    isRunning: z.boolean(),
    /** Fuse mode: the appliances switched on. */
    on: z.array(z.nativeEnum(Appliance)),
    /** Fuse mode: the fuse's rating, A. */
    rating: z.number().positive().max(30),
    isBlown: z.boolean(),
    /** Show the working (H = I²Rt …). */
    showWorking: z.boolean(),
    canSetAmps: z.boolean(),
    canSetOhms: z.boolean(),
    canSetSeconds: z.boolean(),
    canSwitch: z.boolean(),
    canSetRating: z.boolean(),
  })
  .strict();
export type HeatState = z.infer<typeof heatState>;

export const heatOf = (s: Pick<HeatState, "amps" | "ohms" | "seconds">) =>
  s.amps ** 2 * s.ohms * s.seconds;
export const heatSoFarOf = (s: Pick<HeatState, "amps" | "ohms" | "elapsed">) =>
  s.amps ** 2 * s.ohms * s.elapsed;
export const powerOf = (s: Pick<HeatState, "amps" | "ohms">) => s.amps ** 2 * s.ohms;
/** The current the switched-on appliances draw from the mains, I = ΣP ÷ V. */
export const lineCurrentOf = (on: readonly Appliance[]) =>
  on.reduce((t, a) => t + WATTS[a], 0) / MAINS_VOLTS;
/** Cord mode: the current, and the heat per second in each part. */
export const CORD_AMPS = MAINS_VOLTS / (CORD_OHMS + ELEMENT_OHMS);
export const cordWatts = () => CORD_AMPS ** 2 * CORD_OHMS;
export const elementWatts = () => CORD_AMPS ** 2 * ELEMENT_OHMS;

export function describeHeat(s: HeatState): string {
  if (s.mode === HeatMode.Cord)
    return `A heater on the 220 V mains: the same current, ${num(CORD_AMPS, 2)} A, flows through the copper cord (${CORD_OHMS} Ω) and the nichrome element (${ELEMENT_OHMS} Ω). Each second the element makes ${num(elementWatts(), 0)} J of heat and glows red hot; the cord makes about ${num(cordWatts(), 1)} J and stays cool.`;
  if (s.mode === HeatMode.Fuse) {
    const list = s.on.length === 0 ? "nothing" : s.on.map((a) => APPLIANCE_EN[a]).join(", ");
    return s.isBlown
      ? `The fuse (rated ${num(s.rating)} A) has melted: too much current was drawn, so the circuit is broken and everything is off.`
      : `Appliances on the 220 V mains through a ${num(s.rating)} A fuse. Switched on: ${list}; they draw ${num(lineCurrentOf(s.on), 2)} A in all.`;
  }
  return `A resistor coil of ${num(s.ohms)} Ω in half a litre of water carries ${num(s.amps)} A. In ${num(s.seconds)} s it makes H = I²Rt = ${num(heatOf(s), 0)} J of heat${s.elapsed > 0 ? `; after ${num(s.elapsed, 1)} s, ${num(heatSoFarOf(s), 0)} J so far and the water ${num(heatSoFarOf(s) / WATER_J_PER_C, 1)} °C warmer` : ""}.`;
}

const act = actionsFor<HeatState>();

export const jouleHeating = defineProp({
  type: "jouleHeating",
  describe:
    "The heating effect of electric current (NCERT 12.7). Coil mode: a resistor coil in half a litre of water carries current I for t seconds; it makes H = I²Rt of heat (Joule's law: ∝ I², ∝ R, ∝ t) and the water warms; the learner sets I, R and t and runs it. Cord mode: a heater on the mains, where the same current flows through the low-resistance copper cord and the high-resistance element, so only the element glows. Fuse mode: appliances (bulb, fan, TV, iron, heater, geyser) switched on in parallel on the 220 V mains through a fuse of a chosen rating; drawing more current than the rating melts the fuse and breaks the circuit.",
  state: heatState,
  defaults: {
    mode: HeatMode.Coil,
    amps: 2,
    ohms: 10,
    seconds: 60,
    elapsed: 0,
    isRunning: false,
    on: [],
    rating: 5,
    isBlown: false,
    showWorking: true,
    canSetAmps: true,
    canSetOhms: true,
    canSetSeconds: true,
    canSwitch: true,
    canSetRating: true,
  },
  inputs: ["showWorking", "canSetAmps", "canSetOhms", "canSetSeconds", "canSwitch", "canSetRating"],
  derived: {
    [HeatDerived.Heat]: {
      describe: "Coil mode: H = I²Rt for the whole time, J",
      compute: (s) => heatOf(s),
    },
    [HeatDerived.HeatSoFar]: {
      describe: "Coil mode: heat made so far, J",
      compute: (s) => heatSoFarOf(s),
    },
    [HeatDerived.Power]: {
      describe: "Coil mode: the rate of heating, I²R, W",
      compute: (s) => powerOf(s),
    },
    [HeatDerived.Volts]: {
      describe: "Coil mode: the potential difference across the coil, IR, V",
      compute: (s) => s.amps * s.ohms,
    },
    [HeatDerived.TempRise]: {
      describe: "Coil mode: how much warmer the water is so far, °C",
      compute: (s) => heatSoFarOf(s) / WATER_J_PER_C,
    },
    [HeatDerived.LineCurrent]: {
      describe:
        "Fuse mode: the current the switched-on appliances draw, A (0 once the fuse has blown)",
      compute: (s) => (s.isBlown ? 0 : lineCurrentOf(s.on)),
    },
    [HeatDerived.CordHeat]: {
      describe: "Cord mode: heat made in the cord each second, J",
      compute: () => cordWatts(),
    },
    [HeatDerived.ElementHeat]: {
      describe: "Cord mode: heat made in the element each second, J",
      compute: () => elementWatts(),
    },
  },
  actions: {
    [HeatAction.SetAmps]: act({
      describe: "Set the current through the coil, A",
      byLearner: true,
      args: z.object({ amps: z.number().positive().max(20) }).strict(),
      run: (_s, a) => set({ amps: a.amps, elapsed: 0, isRunning: false }),
    }),
    [HeatAction.SetOhms]: act({
      describe: "Set the coil's resistance, Ω",
      byLearner: true,
      args: z.object({ ohms: z.number().positive().max(1000) }).strict(),
      run: (_s, a) => set({ ohms: a.ohms, elapsed: 0, isRunning: false }),
    }),
    [HeatAction.SetSeconds]: act({
      describe: "Set how long the current flows, s",
      byLearner: true,
      args: z.object({ seconds: z.number().positive().max(3600) }).strict(),
      run: (_s, a) => set({ seconds: a.seconds, elapsed: 0, isRunning: false }),
    }),
    [HeatAction.Run]: act({
      describe:
        "Pass the current for the set time (shown speeded up, about 3 seconds) and watch the water warm",
      byLearner: true,
      args: z.object({}).strict(),
      run: () =>
        task(async (c) => {
          c.set({ elapsed: 0, isRunning: true });
          const total = c.get().seconds;
          const frames = 20;
          for (let f = 1; f <= frames; f++) {
            await c.wait(0.15);
            if (!c.get().isRunning) return;
            c.set({ elapsed: Math.round(((total * f) / frames) * 100) / 100 });
          }
          c.set({ isRunning: false, elapsed: total });
          const s = c.get();
          c.emit(HeatSignal.Heated, {
            amps: s.amps,
            ohms: s.ohms,
            seconds: s.seconds,
            heat: heatOf(s),
          });
        }),
    }),
    [HeatAction.Toggle]: act({
      describe: "Switch one appliance on or off (fuse mode); too much current melts the fuse",
      byLearner: true,
      args: z.object({ appliance: z.nativeEnum(Appliance) }).strict(),
      run: (s, a) => {
        if (s.isBlown) return set({});
        const on = s.on.includes(a.appliance)
          ? s.on.filter((x) => x !== a.appliance)
          : [...s.on, a.appliance];
        const current = lineCurrentOf(on);
        if (current > s.rating)
          return set(
            { on, isBlown: true },
            { signal: HeatSignal.Switched, payload: { appliance: a.appliance, current } },
            { signal: HeatSignal.Blown, payload: { current, rating: s.rating } },
          );
        return set(
          { on },
          { signal: HeatSignal.Switched, payload: { appliance: a.appliance, current } },
        );
      },
    }),
    [HeatAction.SetRating]: act({
      describe: "Use a fuse of another rating, A (only before it blows)",
      byLearner: true,
      args: z.object({ rating: z.number().positive().max(30) }).strict(),
      run: (s, a) => {
        if (s.isBlown) return set({ rating: a.rating });
        const current = lineCurrentOf(s.on);
        return current > a.rating
          ? set(
              { rating: a.rating, isBlown: true },
              { signal: HeatSignal.Blown, payload: { current, rating: a.rating } },
            )
          : set({ rating: a.rating });
      },
    }),
    [HeatAction.ReplaceFuse]: act({
      describe: "Switch everything off and fit a new fuse wire",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ isBlown: false, on: [] }),
    }),
  },
  signals: {
    [HeatSignal.Heated]: {
      describe: "The coil finished heating; the payload has amps, ohms, seconds and heat",
      isCommit: true,
    },
    [HeatSignal.Switched]: {
      describe: "An appliance was switched; the payload has the current drawn",
      isCommit: true,
    },
    [HeatSignal.Blown]: {
      describe: "The fuse melted: the current was more than its rating",
      isCommit: true,
    },
  },
  observe: (s) => {
    const elements: Element[] = [];
    if (s.mode === HeatMode.Coil)
      elements.push(
        { id: HeatPart.Coil, value: `${num(s.ohms)} Ω, ${num(s.amps)} A, ${num(s.seconds)} s` },
        { id: HeatPart.Thermometer, value: `+${num(heatSoFarOf(s) / WATER_J_PER_C, 1)} °C` },
        { id: HeatPart.Readout, value: `H = ${num(heatSoFarOf(s), 0)} J` },
      );
    else if (s.mode === HeatMode.Cord)
      elements.push(
        { id: HeatPart.Cord, value: `copper, ${num(cordWatts(), 1)} J each second, cool` },
        {
          id: HeatPart.Element,
          value: `nichrome, ${num(elementWatts(), 0)} J each second, glowing`,
        },
      );
    else {
      elements.push({
        id: HeatPart.Fuse,
        value: s.isBlown ? "melted" : `${num(s.rating)} A, whole`,
      });
      for (const a of FUSE_APPLIANCES)
        elements.push({ id: a, value: s.on.includes(a) && !s.isBlown ? "on" : "off" });
      elements.push({
        id: HeatPart.Readout,
        value: `${num(s.isBlown ? 0 : lineCurrentOf(s.on), 2)} A`,
      });
    }
    return { summary: describeHeat(s), elements };
  },
  parts: (s) =>
    s.mode === HeatMode.Coil
      ? [HeatPart.Coil, HeatPart.Water, HeatPart.Thermometer, HeatPart.Readout, HeatPart.Controls]
      : s.mode === HeatMode.Cord
        ? [HeatPart.Cord, HeatPart.Element, HeatPart.Readout]
        : [HeatPart.Fuse, ...FUSE_APPLIANCES, HeatPart.Readout, HeatPart.Controls],
});
