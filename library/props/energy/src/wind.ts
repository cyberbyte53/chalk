import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * A wind energy farm (NCERT 14.2.4). A windmill's blades turn a generator; the wind must blow
 * faster than 15 km/h to keep the turbine at its speed. One mill's output is small, so many are
 * coupled in a farm. Each mill here is a 1 MW generator, which needs about 2 hectares of land
 * (NCERT). Below the cut-in speed the mills stop, and only a back-up (storage cells) keeps the
 * lights on. Between 15 and 30 km/h a mill gives more the faster the wind; at 30 km/h and above it
 * gives its full 1 MW.
 */

export const CUT_IN = 15;
export const FULL_SPEED = 30;
export const MAX_SPEED = 40;
export const SPEED_STEP = 5;
export const MAX_MILLS = 12;
/** NCERT: about 2 hectares of land for a 1 MW generator. */
export const HECTARES_PER_MW = 2;
export const MW_PER_MILL = 1;

export const WindAction = {
  SetSpeed: "setSpeed",
  SetMills: "setMills",
  SetBattery: "setBattery",
} as const;
export const WindSignal = { Changed: "changed" } as const;
export const WindDerived = {
  IsTurning: "isTurning",
  PerMill: "perMill",
  Output: "output",
  Land: "land",
  Supply: "supply",
} as const;
export const WindPart = { Farm: "farm", Readout: "readout", Controls: "controls" } as const;

export const Supply = { Wind: "wind", Battery: "battery", None: "none" } as const;
export type Supply = (typeof Supply)[keyof typeof Supply];

const windState = z
  .object({
    /** Wind speed in km/h, in steps of 5. */
    speed: z.number().int().min(0).max(MAX_SPEED).multipleOf(SPEED_STEP),
    mills: z.number().int().min(1).max(MAX_MILLS),
    hasBattery: z.boolean(),
    showReadout: z.boolean(),
    canSetSpeed: z.boolean(),
    canSetMills: z.boolean(),
    canSetBattery: z.boolean(),
  })
  .strict();
export type WindState = z.infer<typeof windState>;

export const isTurningAt = (speed: number): boolean => speed > CUT_IN;

/** One mill's output in MW: 0 at or below 15 km/h, rising to 1 MW at 30 km/h and above. */
export function perMillOf(speed: number): number {
  if (!isTurningAt(speed)) return 0;
  return Math.min(1, (speed - CUT_IN) / (FULL_SPEED - CUT_IN)) * MW_PER_MILL;
}

export const outputOf = (s: Pick<WindState, "speed" | "mills">): number =>
  perMillOf(s.speed) * s.mills;
export const landOf = (mills: number): number => mills * MW_PER_MILL * HECTARES_PER_MW;

/** What keeps the lights on: the wind, the back-up cells, or nothing. */
export function supplyOf(s: Pick<WindState, "speed" | "hasBattery">): Supply {
  if (isTurningAt(s.speed)) return Supply.Wind;
  return s.hasBattery ? Supply.Battery : Supply.None;
}

export function describeWind(s: WindState): string {
  const turning = isTurningAt(s.speed);
  return `A wind energy farm of ${s.mills} windmill${s.mills === 1 ? "" : "s"} (1 MW each) on ${landOf(s.mills)} hectares, wind ${s.speed} km/h. ${turning ? `The blades turn and the farm gives ${Math.round(outputOf(s) * 100) / 100} MW.` : "The wind is too slow (15 km/h or less): the blades stand still."} ${supplyOf(s) === Supply.Battery ? "The back-up storage cells keep the lights on." : supplyOf(s) === Supply.None ? "With no back-up, the lights go out." : ""}`.trim();
}

const act = actionsFor<WindState>();
const changed = (s: WindState) => ({
  signal: WindSignal.Changed,
  payload: { isTurning: isTurningAt(s.speed), output: outputOf(s), supply: supplyOf(s) },
});

export const windFarm = defineProp({
  type: "windFarm",
  describe:
    "A wind energy farm on a ridge (NCERT 14.2.4): set the wind speed and the number of 1 MW windmills. The blades turn only when the wind is faster than 15 km/h; the farm's output adds up the mills, and the land needed is about 2 hectares per MW. With no wind, only back-up storage cells keep the lights on.",
  state: windState,
  defaults: {
    speed: 20,
    mills: 1,
    hasBattery: false,
    showReadout: true,
    canSetSpeed: true,
    canSetMills: false,
    canSetBattery: false,
  },
  inputs: ["showReadout", "canSetSpeed", "canSetMills", "canSetBattery"],
  derived: {
    [WindDerived.IsTurning]: {
      describe: "Whether the blades turn (wind faster than 15 km/h)",
      compute: (s) => isTurningAt(s.speed),
    },
    [WindDerived.PerMill]: {
      describe: "One mill's output, MW (0 … 1)",
      compute: (s) => perMillOf(s.speed),
    },
    [WindDerived.Output]: {
      describe: "The whole farm's output, MW",
      compute: (s) => outputOf(s),
    },
    [WindDerived.Land]: {
      describe: "Land the farm needs, hectares (2 per MW)",
      compute: (s) => landOf(s.mills),
    },
    [WindDerived.Supply]: {
      describe: "What powers the village now: wind, battery (back-up cells) or none",
      compute: (s) => supplyOf(s),
    },
  },
  actions: {
    [WindAction.SetSpeed]: act({
      describe: "Set the wind speed, km/h (0 … 40, steps of 5)",
      byLearner: true,
      args: z
        .object({ speed: z.number().int().min(0).max(MAX_SPEED).multipleOf(SPEED_STEP) })
        .strict(),
      run: (s, a) => set({ speed: a.speed }, changed({ ...s, speed: a.speed })),
    }),
    [WindAction.SetMills]: act({
      describe: "Set how many windmills the farm has (1 … 12)",
      byLearner: true,
      args: z.object({ mills: z.number().int().min(1).max(MAX_MILLS) }).strict(),
      run: (s, a) => set({ mills: a.mills }, changed({ ...s, mills: a.mills })),
    }),
    [WindAction.SetBattery]: act({
      describe: "Add or remove back-up storage cells",
      byLearner: true,
      args: z.object({ hasBattery: z.boolean() }).strict(),
      run: (s, a) => set({ hasBattery: a.hasBattery }, changed({ ...s, hasBattery: a.hasBattery })),
    }),
  },
  signals: {
    [WindSignal.Changed]: {
      describe: "The wind, the number of mills or the back-up changed; the payload has the output",
    },
  },
  observe: (s) => ({
    summary: describeWind(s),
    elements: [
      {
        id: WindPart.Farm,
        value: `${s.mills} mills, ${isTurningAt(s.speed) ? "turning" : "still"}`,
      },
      ...(s.showReadout
        ? [{ id: WindPart.Readout, value: `${outputOf(s)} MW, ${landOf(s.mills)} ha` }]
        : []),
    ],
  }),
  parts: (s) => [WindPart.Farm, ...(s.showReadout ? [WindPart.Readout] : []), WindPart.Controls],
});
