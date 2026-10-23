import { type Element, actionsFor, defineProp, set, task } from "@chalk/prop";
import { z } from "zod";

/**
 * Electrolysis of water (NCERT Activity 1.7): a mug of water with a little dilute sulphuric acid,
 * two carbon electrodes through its base wired to a 6 V battery, a test tube full of water upside
 * down over each. With the current on, gas bubbles up at both electrodes: hydrogen at the one
 * joined to the battery's − terminal (cathode), oxygen at the + one (anode), always twice as much
 * hydrogen. A burning candle at each tube's mouth: hydrogen burns with a pop, oxygen makes the
 * flame brighter.
 */

export const ElectrolysisAction = { Switch: "switch", TestGas: "testGas", Reset: "reset" } as const;
export const ElectrolysisSignal = { Switched: "switched", Full: "full", Tested: "tested" } as const;
export const ElectrolysisDerived = {
  HydrogenMl: "hydrogenMl",
  OxygenMl: "oxygenMl",
  IsFull: "isFull",
} as const;
export const ElectrolysisPart = {
  Battery: "battery",
  Switch: "switch",
  Cathode: "cathode",
  Anode: "anode",
  HydrogenTube: "hydrogenTube",
  OxygenTube: "oxygenTube",
  Candle: "candle",
} as const;

/** Which tube: over the cathode (−) or the anode (+). */
export const Tube = { Cathode: "cathode", Anode: "anode" } as const;
export type Tube = (typeof Tube)[keyof typeof Tube];

/** How much each tube holds, mL; the cathode's tube fills first (twice as fast). */
export const TUBE_ML = 10;
/** Seconds of current to fill the cathode's tube. */
export const FILL_SECONDS = 6;

const electrolysisState = z
  .object({
    isOn: z.boolean(),
    /** How full the cathode's tube is, 0 to 1 (the anode's holds half as much gas). */
    progress: z.number().min(0).max(1),
    /** Name the gases on the tubes. */
    showGasNames: z.boolean(),
    /** Mark the electrodes − and + and name them. */
    showElectrodes: z.boolean(),
    /** Show how many mL are in each tube. */
    showVolumes: z.boolean(),
    /** The tube a burning candle was last brought to, or null. */
    tested: z.nativeEnum(Tube).nullable(),
    canSwitch: z.boolean(),
    canTest: z.boolean(),
  })
  .strict();
export type ElectrolysisState = z.infer<typeof electrolysisState>;

/** Read to the nearest 0.2 mL, so that half of it is a tenth. */
export const hydrogenMl = (s: Pick<ElectrolysisState, "progress">) =>
  Math.round(TUBE_ML * s.progress * 5) / 5;
/** Always exactly half the hydrogen. */
export const oxygenMl = (s: Pick<ElectrolysisState, "progress">) => hydrogenMl(s) / 2;

/** What the candle does at a tube: hydrogen pops, oxygen makes it burn brighter (if there is gas). */
export function candleResult(
  s: Pick<ElectrolysisState, "progress">,
  tube: Tube,
): "pop" | "brighter" | "nothing" {
  if (s.progress < 0.2) return "nothing";
  return tube === Tube.Cathode ? "pop" : "brighter";
}

export function describeElectrolysis(s: ElectrolysisState): string {
  const gas =
    s.progress === 0
      ? "no gas collected yet"
      : `${hydrogenMl(s)} mL of gas in the tube over the cathode (−) and ${oxygenMl(s)} mL over the anode (+), twice as much at the cathode`;
  const test =
    s.tested === null
      ? ""
      : `; a burning candle at the ${s.tested} tube: ${candleResult(s, s.tested) === "pop" ? "the gas burns with a pop (hydrogen)" : candleResult(s, s.tested) === "brighter" ? "the candle burns brighter (oxygen)" : "nothing happens"}`;
  return `Electrolysis of water: the current is ${s.isOn ? "on, bubbles rise at both electrodes" : "off"}; ${gas}${test}.`;
}

const act = actionsFor<ElectrolysisState>();

export const electrolysisCell = defineProp({
  type: "electrolysisCell",
  describe:
    "Electrolysis of water (NCERT Activity 1.7): water with a little dilute sulphuric acid, two carbon electrodes joined to a battery, and an upside-down test tube of water over each. With the current on, gas collects in both tubes, twice as much at the cathode (−, hydrogen) as at the anode (+, oxygen): water decomposes into hydrogen and oxygen in the ratio 2 : 1 by volume. A burning candle brought to a tube: hydrogen burns with a pop, oxygen makes the candle brighter.",
  state: electrolysisState,
  defaults: {
    isOn: false,
    progress: 0,
    showGasNames: false,
    showElectrodes: true,
    showVolumes: true,
    tested: null,
    canSwitch: true,
    canTest: true,
  },
  inputs: ["showGasNames", "showElectrodes", "showVolumes", "canSwitch", "canTest"],
  derived: {
    [ElectrolysisDerived.HydrogenMl]: {
      describe: "mL of gas in the tube over the cathode (hydrogen)",
      compute: (s) => hydrogenMl(s),
    },
    [ElectrolysisDerived.OxygenMl]: {
      describe: "mL of gas in the tube over the anode (oxygen): always half the hydrogen",
      compute: (s) => oxygenMl(s),
    },
    [ElectrolysisDerived.IsFull]: {
      describe: "The cathode's tube is full of gas",
      compute: (s) => s.progress >= 1,
    },
  },
  actions: {
    [ElectrolysisAction.Switch]: act({
      describe:
        "Switch the current on or off. While on, gas collects until the cathode's tube is full (about 6 seconds from empty)",
      byLearner: true,
      args: z.object({ on: z.boolean() }).strict(),
      run: (s, a) => {
        if (!a.on || s.progress >= 1)
          return set(
            { isOn: a.on && s.progress < 1 },
            { signal: ElectrolysisSignal.Switched, payload: { on: a.on } },
          );
        return task(async (c) => {
          c.set({ isOn: true });
          c.emit(ElectrolysisSignal.Switched, { on: true });
          const step = 0.1;
          while (c.get().isOn && c.get().progress < 1) {
            await c.wait(step);
            if (!c.get().isOn) break;
            c.set({ progress: Math.min(1, c.get().progress + step / FILL_SECONDS) });
          }
          if (c.get().progress >= 1) {
            c.set({ isOn: false });
            c.emit(ElectrolysisSignal.Full, { hydrogenMl: TUBE_ML, oxygenMl: TUBE_ML / 2 });
          }
        });
      },
    }),
    [ElectrolysisAction.TestGas]: act({
      describe: "Bring a burning candle to the mouth of one tube (lifted out of the water)",
      byLearner: true,
      args: z.object({ tube: z.nativeEnum(Tube) }).strict(),
      run: (s, a) =>
        set(
          { tested: a.tube },
          {
            signal: ElectrolysisSignal.Tested,
            payload: { tube: a.tube, result: candleResult(s, a.tube) },
          },
        ),
    }),
    [ElectrolysisAction.Reset]: act({
      describe: "Empty both tubes and switch off",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ isOn: false, progress: 0, tested: null }),
    }),
  },
  signals: {
    [ElectrolysisSignal.Switched]: {
      describe: "The current was switched on or off",
      isCommit: true,
    },
    [ElectrolysisSignal.Full]: { describe: "The cathode's tube has filled with gas" },
    [ElectrolysisSignal.Tested]: {
      describe:
        "A burning candle was brought to a tube; the payload says which and what happened (pop, brighter, nothing)",
      isCommit: true,
    },
  },
  observe: (s) => {
    const elements: Element[] = [
      { id: ElectrolysisPart.Battery, value: "6 V battery" },
      { id: ElectrolysisPart.Switch, value: s.isOn ? "on" : "off" },
      {
        id: ElectrolysisPart.Cathode,
        value: s.showElectrodes ? "carbon electrode joined to −" : "carbon electrode",
      },
      {
        id: ElectrolysisPart.Anode,
        value: s.showElectrodes ? "carbon electrode joined to +" : "carbon electrode",
      },
      {
        id: ElectrolysisPart.HydrogenTube,
        value: `${s.showVolumes ? `${hydrogenMl(s)} mL of gas` : "gas"}${s.showGasNames ? " (hydrogen)" : ""}`,
      },
      {
        id: ElectrolysisPart.OxygenTube,
        value: `${s.showVolumes ? `${oxygenMl(s)} mL of gas` : "gas"}${s.showGasNames ? " (oxygen)" : ""}`,
      },
    ];
    if (s.tested !== null)
      elements.push({
        id: ElectrolysisPart.Candle,
        value: `at the ${s.tested} tube: ${candleResult(s, s.tested)}`,
      });
    return {
      summary: describeElectrolysis(s),
      elements,
      hidden: s.showGasNames ? {} : { cathodeGas: "hydrogen", anodeGas: "oxygen" },
    };
  },
  parts: (s) => [
    ElectrolysisPart.Battery,
    ElectrolysisPart.Switch,
    ElectrolysisPart.Cathode,
    ElectrolysisPart.Anode,
    ElectrolysisPart.HydrogenTube,
    ElectrolysisPart.OxygenTube,
    ...(s.tested !== null ? [ElectrolysisPart.Candle] : []),
  ],
});
