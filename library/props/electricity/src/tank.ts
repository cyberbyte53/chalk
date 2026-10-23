import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { num } from "./words";

/**
 * The water picture of potential difference (NCERT 12.2): a tank feeds a pipe that ends in a
 * tap. Water flows out only if the tank stands higher than the tap: a difference of level (of
 * pressure). A narrower pipe lets less through. Beside it, its circuit twin: the cells' potential
 * difference plays the height, a resistor plays the narrow pipe, and the current plays the flow.
 */

export const TankAction = { SetLevel: "setLevel", SetPipe: "setPipe", SetTap: "setTap" } as const;
export const TankSignal = { Changed: "changed" } as const;
export const TankDerived = {
  Flow: "flow",
  Volts: "volts",
  Amps: "amps",
  IsFlowing: "isFlowing",
} as const;
export const TankPart = {
  Tank: "tank",
  Pipe: "pipe",
  Tap: "tap",
  Twin: "twin",
  Controls: "controls",
} as const;

/** How the pipe is: wide (little hold-back) or narrow (more). */
export const Pipe = { Wide: "wide", Narrow: "narrow" } as const;
export type Pipe = (typeof Pipe)[keyof typeof Pipe];

/** Highest level the tank can be raised to (0 = level with the tap). */
export const MAX_LEVEL = 3;
/** Each level is one 1.5 V cell in the twin circuit. */
export const VOLTS_PER_LEVEL = 1.5;
/** The twin's resistor: 3 Ω for the wide pipe, twice that for the narrow one. */
export const PIPE_OHMS: Readonly<Record<Pipe, number>> = { wide: 3, narrow: 6 };
/** Litres a minute per level through the wide pipe (a picture, not a measurement). */
const LITRES_PER_LEVEL = 6;

const tankState = z
  .object({
    /** How many steps higher than the tap the tank stands, 0 to 3. */
    level: z.number().int().min(0).max(MAX_LEVEL),
    pipe: z.nativeEnum(Pipe),
    isOpen: z.boolean(),
    /** Draw the circuit twin under the tank. */
    showTwin: z.boolean(),
    /** Name what each part stands for (height ↔ potential difference …). */
    showLinks: z.boolean(),
    canSetLevel: z.boolean(),
    canSetPipe: z.boolean(),
    canOpen: z.boolean(),
  })
  .strict();
export type TankState = z.infer<typeof tankState>;

const isFlowing = (s: Pick<TankState, "level" | "isOpen">) => s.isOpen && s.level > 0;
export const flowOf = (s: Pick<TankState, "level" | "isOpen" | "pipe">) =>
  isFlowing(s) ? (LITRES_PER_LEVEL * s.level * PIPE_OHMS.wide) / PIPE_OHMS[s.pipe] : 0;
export const voltsOf = (s: Pick<TankState, "level">) => VOLTS_PER_LEVEL * s.level;
/** The twin's current: its key is closed when the tap is open. */
export const ampsOf = (s: Pick<TankState, "level" | "isOpen" | "pipe">) =>
  s.isOpen ? voltsOf(s) / PIPE_OHMS[s.pipe] : 0;

export function describeTank(s: TankState): string {
  const height =
    s.level === 0
      ? "standing level with the tap"
      : `standing ${s.level} step${s.level === 1 ? "" : "s"} higher than the tap`;
  const flow = !s.isOpen
    ? "The tap is shut."
    : s.level === 0
      ? "The tap is open but no water flows: there is no difference in level."
      : `The tap is open and water flows out, ${num(flowOf(s), 1)} litres a minute${s.pipe === Pipe.Narrow ? " (the narrow pipe holds it back)" : ""}.`;
  const twin = s.showTwin
    ? ` Its circuit twin: ${s.level} cell${s.level === 1 ? "" : "s"} giving ${num(voltsOf(s), 1)} V across a ${PIPE_OHMS[s.pipe]} Ω resistor, key ${s.isOpen ? "closed" : "open"}, current ${num(ampsOf(s), 2)} A.`
    : "";
  return `A water tank ${height}, feeding a ${s.pipe} pipe to a tap. ${flow}${twin}`;
}

const act = actionsFor<TankState>();
const changed = (s: TankState) => ({
  signal: TankSignal.Changed,
  payload: { level: s.level, pipe: s.pipe, isOpen: s.isOpen, flow: flowOf(s), amps: ampsOf(s) },
});

export const waterTank = defineProp({
  type: "waterTank",
  describe:
    "The water picture of potential difference (NCERT 12.2): a tank feeding a pipe to a tap. Water flows only when the tank is higher than the tap (a difference of level, or pressure), and a narrower pipe lets less through. Its circuit twin: the cells' potential difference plays the height, a resistor plays the narrow pipe, the current plays the flow, and a key plays the tap. The learner raises or lowers the tank, swaps the pipe, and opens the tap.",
  state: tankState,
  defaults: {
    level: 2,
    pipe: Pipe.Wide,
    isOpen: false,
    showTwin: true,
    showLinks: true,
    canSetLevel: true,
    canSetPipe: false,
    canOpen: true,
  },
  inputs: ["showTwin", "showLinks", "canSetLevel", "canSetPipe", "canOpen"],
  derived: {
    [TankDerived.Flow]: {
      describe: "Litres of water a minute out of the tap (0 when level with the tap or shut)",
      compute: (s) => flowOf(s),
    },
    [TankDerived.Volts]: {
      describe: "The twin circuit's potential difference, V (1.5 V per level)",
      compute: (s) => voltsOf(s),
    },
    [TankDerived.Amps]: {
      describe: "The twin circuit's current, A (V ÷ the resistor)",
      compute: (s) => ampsOf(s),
    },
    [TankDerived.IsFlowing]: {
      describe: "Water is flowing out of the tap",
      compute: (s) => isFlowing(s),
    },
  },
  actions: {
    [TankAction.SetLevel]: act({
      describe: "Raise or lower the tank: 0 is level with the tap, 3 the highest",
      byLearner: true,
      args: z.object({ level: z.number().int().min(0).max(MAX_LEVEL) }).strict(),
      run: (s, a) => set({ level: a.level }, changed({ ...s, level: a.level })),
    }),
    [TankAction.SetPipe]: act({
      describe: "Use the wide pipe or the narrow one",
      byLearner: true,
      args: z.object({ pipe: z.nativeEnum(Pipe) }).strict(),
      run: (s, a) => set({ pipe: a.pipe }, changed({ ...s, pipe: a.pipe })),
    }),
    [TankAction.SetTap]: act({
      describe: "Open or shut the tap (in the twin, close or open the key)",
      byLearner: true,
      args: z.object({ isOpen: z.boolean() }).strict(),
      run: (s, a) => set({ isOpen: a.isOpen }, changed({ ...s, isOpen: a.isOpen })),
    }),
  },
  signals: {
    [TankSignal.Changed]: {
      describe: "The tank, pipe or tap changed; the payload has the new flow and current",
      isCommit: true,
    },
  },
  observe: (s) => {
    const elements: Element[] = [
      { id: TankPart.Tank, value: s.level === 0 ? "level with the tap" : `${s.level} steps up` },
      { id: TankPart.Pipe, value: s.pipe },
      {
        id: TankPart.Tap,
        value: isFlowing(s)
          ? `open, ${num(flowOf(s), 1)} L/min`
          : s.isOpen
            ? "open, no flow"
            : "shut",
      },
    ];
    if (s.showTwin)
      elements.push({
        id: TankPart.Twin,
        value: `${num(voltsOf(s), 1)} V, ${PIPE_OHMS[s.pipe]} Ω, ${num(ampsOf(s), 2)} A`,
      });
    return { summary: describeTank(s), elements };
  },
  parts: (s) => [
    TankPart.Tank,
    TankPart.Pipe,
    TankPart.Tap,
    ...(s.showTwin ? [TankPart.Twin] : []),
    ...(s.canSetLevel || s.canSetPipe || s.canOpen ? [TankPart.Controls] : []),
  ],
});
