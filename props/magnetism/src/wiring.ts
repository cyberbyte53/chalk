import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Domestic electric circuits (NCERT 13.7, Fig 13.20). The mains bring a live wire (red), a
 * neutral wire (black) and an earth wire (green); the potential difference between live and
 * neutral is 220 V. Through the meter and main fuse they feed two circuits: 5 A for the bulb, fan
 * and TV, and 15 A for the geyser, cooler and iron. Appliances sit in parallel, each with its own
 * switch, so each gets the full 220 V and its current is P / V. Each circuit has its fuse: when
 * the current in it goes above the rating (overloading, or a short circuit when live touches
 * neutral) the fuse melts and that circuit goes dead. The iron has a metal body joined to the earth
 * wire: if live touches the body, the earth carries the current away (the fuse blows) and the
 * body stays safe; without the earth wire the body sits at 220 V and touching it gives a shock.
 */

export const MAINS_VOLTS = 220;

export const Appliance = {
  Bulb: "bulb",
  Fan: "fan",
  Tv: "tv",
  Geyser: "geyser",
  Cooler: "cooler",
  Iron: "iron",
} as const;
export type Appliance = (typeof Appliance)[keyof typeof Appliance];

export const WATTS: Readonly<Record<Appliance, number>> = {
  bulb: 100,
  fan: 75,
  tv: 120,
  geyser: 2000,
  cooler: 200,
  iron: 1000,
};
/** The 2 kW oven of in-text Q2, which can be plugged into either circuit. */
export const OVEN_WATTS = 2000;

export const Circuit = { Five: "five", Fifteen: "fifteen" } as const;
export type Circuit = (typeof Circuit)[keyof typeof Circuit];
export const RATING: Readonly<Record<Circuit, number>> = { five: 5, fifteen: 15 };
export const CIRCUIT_OF: Readonly<Record<Appliance, Circuit>> = {
  bulb: "five",
  fan: "five",
  tv: "five",
  geyser: "fifteen",
  cooler: "fifteen",
  iron: "fifteen",
};
export const APPLIANCES_ON: Readonly<Record<Circuit, readonly Appliance[]>> = {
  five: [Appliance.Bulb, Appliance.Fan, Appliance.Tv],
  fifteen: [Appliance.Geyser, Appliance.Cooler, Appliance.Iron],
};

export const Fault = { None: "none", Short: "short", Leak: "leak" } as const;
export type Fault = (typeof Fault)[keyof typeof Fault];

export const WiringAction = {
  Toggle: "toggle",
  PlugOven: "plugOven",
  SetFault: "setFault",
  SetEarth: "setEarth",
  ReplaceFuse: "replaceFuse",
  Touch: "touch",
} as const;
export const WiringSignal = { Blown: "blown", Changed: "changed" } as const;
export const WiringDerived = {
  CurrentFive: "currentFive",
  CurrentFifteen: "currentFifteen",
  IsBodyLive: "isBodyLive",
  IsShock: "isShock",
} as const;
export const WiringPart = {
  Mains: "mains",
  Meter: "meter",
  FuseFive: "fuseFive",
  FuseFifteen: "fuseFifteen",
  Earth: "earth",
  Iron: "iron",
  Controls: "controls",
} as const;

const wiringState = z
  .object({
    on: z.array(z.nativeEnum(Appliance)),
    /** Where the 2 kW oven is plugged in, if anywhere. */
    oven: z.enum(["none", "five", "fifteen"]),
    fault: z.nativeEnum(Fault),
    hasEarth: z.boolean(),
    isBlownFive: z.boolean(),
    isBlownFifteen: z.boolean(),
    /** Someone's hand on the iron's metal body. */
    isTouching: z.boolean(),
    showCurrents: z.boolean(),
    canToggle: z.boolean(),
    canPlugOven: z.boolean(),
    canFault: z.boolean(),
    canEarth: z.boolean(),
  })
  .strict();
export type WiringState = z.infer<typeof wiringState>;

const amps = (watts: number) => watts / MAINS_VOLTS;
const round = (v: number) => Math.round(v * 100) / 100;

/** The current a circuit would draw if its fuse were whole, in amperes (a short: very large). */
export function demandOf(s: WiringState, c: Circuit): number {
  if (c === Circuit.Fifteen && s.fault === Fault.Short) return Number.POSITIVE_INFINITY;
  if (c === Circuit.Fifteen && s.fault === Fault.Leak && s.hasEarth)
    return Number.POSITIVE_INFINITY;
  const appliances = s.on.filter((a) => CIRCUIT_OF[a] === c);
  const watts = appliances.reduce((sum, a) => sum + WATTS[a], 0) + (s.oven === c ? OVEN_WATTS : 0);
  return amps(watts);
}

const isBlown = (s: WiringState, c: Circuit) =>
  c === Circuit.Five ? s.isBlownFive : s.isBlownFifteen;

/** The current actually flowing in a circuit (0 once its fuse has melted), A. */
export function currentOf(s: WiringState, c: Circuit): number {
  if (isBlown(s, c)) return 0;
  const d = demandOf(s, c);
  return Number.isFinite(d) ? round(d) : 0;
}

/** Melts any fuse whose circuit now asks for more than its rating. */
export function settle(s: WiringState): Pick<WiringState, "isBlownFive" | "isBlownFifteen"> {
  return {
    isBlownFive: s.isBlownFive || demandOf(s, Circuit.Five) > RATING.five,
    isBlownFifteen: s.isBlownFifteen || demandOf(s, Circuit.Fifteen) > RATING.fifteen,
  };
}

/** The iron's metal body is at 220 V: live touches it, there's no earth, and its fuse is whole. */
export const isBodyLiveOf = (s: WiringState): boolean =>
  s.fault === Fault.Leak && !s.hasEarth && !s.isBlownFifteen;

export const isShockOf = (s: WiringState): boolean => isBodyLiveOf(s) && s.isTouching;

const NAMES: Readonly<Record<Appliance, string>> = {
  bulb: "bulb",
  fan: "fan",
  tv: "TV",
  geyser: "geyser",
  cooler: "cooler",
  iron: "iron",
};

export function describeWiring(s: WiringState): string {
  const list = (c: Circuit) => {
    const names = [
      ...s.on.filter((a) => CIRCUIT_OF[a] === c).map((a) => NAMES[a]),
      ...(s.oven === c ? ["the 2 kW oven"] : []),
    ];
    return names.length === 0 ? "nothing on" : names.join(", ");
  };
  const circuit = (c: Circuit) =>
    `the ${RATING[c]} A circuit (${list(c)}) ${isBlown(s, c) ? "is dead: its fuse has melted" : `draws ${currentOf(s, c)} A`}`;
  const fault =
    s.fault === Fault.None
      ? ""
      : s.fault === Fault.Short
        ? " The iron's cord is damaged: live touches neutral (a short circuit)."
        : ` Live touches the iron's metal body${s.hasEarth ? "; the earth wire carries the current away" : " and there is no earth wire"}.`;
  const body = isBodyLiveOf(s)
    ? s.isTouching
      ? " Someone touches the iron's body and gets a severe shock."
      : " The iron's body is at 220 V: dangerous to touch."
    : "";
  return `A house's wiring: live (red), neutral (black) and earth (green${s.hasEarth ? "" : ", missing at the iron"}), 220 V, through the meter and main fuse to two circuits. Now ${circuit(Circuit.Five)}, and ${circuit(Circuit.Fifteen)}.${fault}${body}`;
}

const act = actionsFor<WiringState>();

/** The patch after a change, with fuses melted as needed, and the signals it raises. */
function after(s: WiringState, patch: Partial<WiringState>) {
  const next = { ...s, ...patch };
  const fuses = settle(next);
  const melted: Circuit[] = [];
  if (fuses.isBlownFive && !next.isBlownFive) melted.push(Circuit.Five);
  if (fuses.isBlownFifteen && !next.isBlownFifteen) melted.push(Circuit.Fifteen);
  const done = { ...next, ...fuses };
  const emits = [
    {
      signal: WiringSignal.Changed,
      payload: {
        currentFive: currentOf(done, Circuit.Five),
        currentFifteen: currentOf(done, Circuit.Fifteen),
        isBodyLive: isBodyLiveOf(done),
        isShock: isShockOf(done),
      },
    },
    ...melted.map((c) => ({
      signal: WiringSignal.Blown,
      payload: { circuit: c, rating: RATING[c] },
    })),
  ];
  return set<WiringState>({ ...patch, ...fuses }, ...emits);
}

export const homeWiring = defineProp({
  type: "homeWiring",
  describe:
    "A domestic electric circuit (NCERT 13.7, Fig 13.20): mains live, neutral and earth wires at 220 V, the meter and main fuse, and two circuits (5 A: bulb, fan, TV; 15 A: geyser, cooler, iron), appliances in parallel with their own switches. The learner switches appliances on and reads each circuit's current (P ÷ 220 V), plugs a 2 kW oven into either circuit, makes a short circuit or a leak to the iron's metal body, removes the earth wire, and replaces a melted fuse. Too much current melts that circuit's fuse; a live body with no earth gives a shock.",
  state: wiringState,
  defaults: {
    on: [Appliance.Bulb, Appliance.Fan],
    oven: "none",
    fault: Fault.None,
    hasEarth: true,
    isBlownFive: false,
    isBlownFifteen: false,
    isTouching: false,
    showCurrents: true,
    canToggle: true,
    canPlugOven: false,
    canFault: false,
    canEarth: false,
  },
  inputs: ["showCurrents", "canToggle", "canPlugOven", "canFault", "canEarth"],
  invariant: (s) =>
    new Set(s.on).size === s.on.length ? undefined : "an appliance is listed twice in `on`",
  derived: {
    [WiringDerived.CurrentFive]: {
      describe: "Current in the 5 A circuit now, A (0 if its fuse has melted)",
      compute: (s) => currentOf(s, Circuit.Five),
    },
    [WiringDerived.CurrentFifteen]: {
      describe: "Current in the 15 A circuit now, A (0 if its fuse has melted)",
      compute: (s) => currentOf(s, Circuit.Fifteen),
    },
    [WiringDerived.IsBodyLive]: {
      describe: "The iron's metal body is at 220 V (live touches it and there is no earth)",
      compute: (s) => isBodyLiveOf(s),
    },
    [WiringDerived.IsShock]: {
      describe: "Someone touching the iron gets a shock",
      compute: (s) => isShockOf(s),
    },
  },
  actions: {
    [WiringAction.Toggle]: act({
      describe: "Switch an appliance on or off",
      byLearner: true,
      args: z.object({ appliance: z.nativeEnum(Appliance) }).strict(),
      run: (s, a) =>
        after(s, {
          on: s.on.includes(a.appliance)
            ? s.on.filter((x) => x !== a.appliance)
            : [...s.on, a.appliance],
        }),
    }),
    [WiringAction.PlugOven]: act({
      describe: "Plug the 2 kW oven into the 5 A circuit, the 15 A circuit, or unplug it",
      byLearner: true,
      args: z.object({ socket: z.enum(["none", "five", "fifteen"]) }).strict(),
      run: (s, a) => after(s, { oven: a.socket }),
    }),
    [WiringAction.SetFault]: act({
      describe: "Make a fault in the iron: none, a short circuit, or live touching its metal body",
      byLearner: true,
      args: z.object({ fault: z.nativeEnum(Fault) }).strict(),
      run: (s, a) => after(s, { fault: a.fault }),
    }),
    [WiringAction.SetEarth]: act({
      describe: "Connect or remove the earth wire to the iron's metal body",
      byLearner: true,
      args: z.object({ hasEarth: z.boolean() }).strict(),
      run: (s, a) => after(s, { hasEarth: a.hasEarth }),
    }),
    [WiringAction.ReplaceFuse]: act({
      describe: "Put a new fuse wire in a circuit (it melts again if the trouble is still there)",
      byLearner: true,
      args: z.object({ circuit: z.nativeEnum(Circuit) }).strict(),
      run: (s, a) =>
        after(s, a.circuit === Circuit.Five ? { isBlownFive: false } : { isBlownFifteen: false }),
    }),
    [WiringAction.Touch]: act({
      describe: "Touch the iron's metal body, or let go",
      byLearner: true,
      args: z.object({ isTouching: z.boolean() }).strict(),
      run: (s, a) => after(s, { isTouching: a.isTouching }),
    }),
  },
  signals: {
    [WiringSignal.Changed]: {
      describe: "Something changed; the payload has both currents and whether the iron is live",
      isCommit: true,
    },
    [WiringSignal.Blown]: { describe: "A circuit's fuse melted; the payload says which" },
  },
  observe: (s) => ({
    summary: describeWiring(s),
    elements: [
      { id: WiringPart.Mains, value: "220 V" },
      {
        id: WiringPart.FuseFive,
        value: s.isBlownFive ? "melted" : `${currentOf(s, Circuit.Five)} A of 5 A`,
      },
      {
        id: WiringPart.FuseFifteen,
        value: s.isBlownFifteen ? "melted" : `${currentOf(s, Circuit.Fifteen)} A of 15 A`,
      },
      { id: WiringPart.Earth, value: s.hasEarth ? "connected" : "missing" },
      { id: WiringPart.Iron, value: isBodyLiveOf(s) ? "body live" : "body safe" },
    ],
  }),
  parts: () => [
    WiringPart.Mains,
    WiringPart.Meter,
    WiringPart.FuseFive,
    WiringPart.FuseFifteen,
    WiringPart.Earth,
    WiringPart.Iron,
    WiringPart.Controls,
  ],
});
