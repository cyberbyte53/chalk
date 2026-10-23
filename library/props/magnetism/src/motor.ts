import { actionsFor, defineProp, set, task } from "@chalk/prop";
import { z } from "zod";

/**
 * The simple electric motor of Fig 13.15, seen end-on from the split-ring side. The field runs
 * from the N pole (left) to the S pole (right). Arms AB and CD of the coil cross the page: at the
 * start AB is on the left and its current runs A → B, into the page (⊗); CD carries it out (⊙).
 * F = I × B pushes AB down and CD up, so the coil turns anticlockwise. The split ring swaps the
 * coil's ends between the brushes X and Y every half turn, so whichever arm is on the left always
 * carries current into the page: the push keeps the same sense and the coil keeps turning. With
 * plain (slip) rings instead, the current never swaps and the coil only rocks.
 *
 * The coil's angle is in degrees anticlockwise from that start; AB sits at 180° + angle.
 */

export const MotorAction = {
  Turn: "turn",
  SetOn: "setOn",
  Run: "run",
  SetRings: "setRings",
} as const;
export const MotorSignal = { Turned: "turned", Switched: "switched" } as const;
export const MotorDerived = {
  CurrentInAB: "currentInAB",
  ForceOnAB: "forceOnAB",
  Spin: "spin",
  BrushXTouches: "brushXTouches",
} as const;
export const MotorPart = {
  Coil: "coil",
  Rings: "rings",
  Brushes: "brushes",
  Forces: "forces",
  Controls: "controls",
} as const;

/** The angle either side of upright where a brush sits on the split ring's gap. */
export const GAP_DEG = 6;

const motorState = z
  .object({
    /** The coil's turn, degrees anticlockwise from AB on the left (any number; read mod 360). */
    angle: z.number().min(-36000).max(36000),
    /** A split ring (commutator); false: two whole slip rings. */
    hasSplitRing: z.boolean(),
    /** The battery is connected (the key closed). */
    isOn: z.boolean(),
    /** Turning by itself (an animation; the stored angle stays put). */
    isRunning: z.boolean(),
    showForces: z.boolean(),
    showLabels: z.boolean(),
    canTurn: z.boolean(),
    canRun: z.boolean(),
    canSwapRings: z.boolean(),
  })
  .strict();
export type MotorState = z.infer<typeof motorState>;

export const norm = (a: number): number => ((a % 360) + 360) % 360;

/** Where arm AB is: its angle round the axle, and its x (−1 left … 1 right). */
export const abAngle = (s: Pick<MotorState, "angle">) => norm(180 + s.angle);
const abX = (s: Pick<MotorState, "angle">) => Math.cos((abAngle(s) * Math.PI) / 180);

/** Whether the brushes touch the rings (not sitting on the split ring's gaps). */
export function isTouching(s: Pick<MotorState, "angle" | "hasSplitRing">): boolean {
  if (!s.hasSplitRing) return true;
  const a = norm(s.angle);
  return Math.abs(a - 90) > GAP_DEG && Math.abs(a - 270) > GAP_DEG;
}

/** Which half of the split ring brush X (on the left) touches: P (A's end) or Q (D's end). */
export function brushXOf(s: Pick<MotorState, "angle" | "hasSplitRing">): "P" | "Q" | null {
  if (!isTouching(s)) return null;
  if (!s.hasSplitRing) return "P";
  const a = norm(s.angle);
  return a < 90 || a > 270 ? "P" : "Q";
}

/**
 * The current in arm AB: "in" (A → B, into the page), "out" (B → A), or "none".
 * Current enters by brush X. Through P it runs A → B; through Q it runs D → C → B → A.
 */
export function currentInAB(s: MotorState): "in" | "out" | "none" {
  if (!s.isOn) return "none";
  const x = brushXOf(s);
  if (x === null) return "none";
  return x === "P" ? "in" : "out";
}

/** The force on AB: into-page current with the field to the right is pushed down (I × B). */
export function forceOnAB(s: MotorState): "up" | "down" | "none" {
  const i = currentInAB(s);
  return i === "none" ? "none" : i === "in" ? "down" : "up";
}

/**
 * Which way the pair of forces turns the coil: AB's force × its distance from the axle,
 * anticlockwise when AB is on the left and pushed down.
 */
export function spinOf(s: MotorState): "anticlockwise" | "clockwise" | "none" {
  const f = forceOnAB(s);
  const x = abX(s);
  if (f === "none" || Math.abs(x) < 0.05) return "none";
  const torque = x * (f === "up" ? 1 : -1);
  return torque > 0 ? "anticlockwise" : "clockwise";
}

export function describeMotor(s: MotorState): string {
  const a = norm(s.angle);
  const rings = s.hasSplitRing
    ? "a split ring (P and Q) pressed by brushes X and Y"
    : "two whole slip rings";
  const position =
    a === 0
      ? "the coil lies flat with AB on the left"
      : `the coil has turned ${a}° anticlockwise from flat (AB on the ${abX(s) < -0.05 ? "left" : abX(s) > 0.05 ? "right" : a < 180 ? "bottom" : "top"})`;
  const current = !s.isOn
    ? "The battery is off."
    : currentInAB(s) === "none"
      ? "The brushes sit on the gaps of the split ring, so for a moment no current flows."
      : `Current runs ${currentInAB(s) === "in" ? "A → B (into the page) in AB and C → D (out) in CD" : "B → A (out of the page) in AB and D → C (into it) in CD"}; AB is pushed ${forceOnAB(s)} and CD ${forceOnAB(s) === "down" ? "up" : "down"}, turning the coil ${spinOf(s)}${spinOf(s) === "none" ? " (the pushes are in line with the axle)" : ""}.`;
  const running = s.isRunning
    ? ` The motor is running${s.hasSplitRing ? " round and round" : ", but with plain rings the coil only rocks to and fro"}.`
    : "";
  return `An electric motor seen end-on: a coil ABCD between the N pole (left) and S pole (right), its ends on ${rings}; ${position}. ${current}${running}`;
}

const act = actionsFor<MotorState>();
const turned = (s: MotorState) => ({
  signal: MotorSignal.Turned,
  payload: {
    angle: norm(s.angle),
    currentInAB: currentInAB(s),
    forceOnAB: forceOnAB(s),
    spin: spinOf(s),
  },
});

export const motor = defineProp({
  type: "motor",
  describe:
    "The simple electric motor (NCERT 13.4, Fig 13.15) seen end-on: coil arms AB and CD between N and S poles, the forces on them by Fleming's left-hand rule, and the split ring with brushes X and Y that reverses the coil's current every half turn so it keeps turning one way. The learner turns the coil in steps to watch the forces and the commutator, runs it, or swaps in plain rings to see the coil only rock.",
  state: motorState,
  defaults: {
    angle: 0,
    hasSplitRing: true,
    isOn: true,
    isRunning: false,
    showForces: true,
    showLabels: true,
    canTurn: true,
    canRun: true,
    canSwapRings: false,
  },
  inputs: ["showForces", "showLabels", "canTurn", "canRun", "canSwapRings"],
  derived: {
    [MotorDerived.CurrentInAB]: {
      describe: "The current in arm AB: in (A → B, into the page), out (B → A), or none",
      compute: (s) => currentInAB(s),
    },
    [MotorDerived.ForceOnAB]: {
      describe: "The force on arm AB: up, down, or none",
      compute: (s) => forceOnAB(s),
    },
    [MotorDerived.Spin]: {
      describe: "Which way the forces turn the coil: anticlockwise, clockwise, or none",
      compute: (s) => spinOf(s),
    },
    [MotorDerived.BrushXTouches]: {
      describe: "Which half of the split ring brush X touches: P, Q, or null (on a gap)",
      compute: (s) => brushXOf(s),
    },
  },
  actions: {
    [MotorAction.Turn]: act({
      describe: "Turn the coil anticlockwise by hand, 45° or 90° at a time",
      byLearner: true,
      args: z.object({ by: z.union([z.literal(45), z.literal(90)]) }).strict(),
      run: (_s, a) =>
        task<MotorState>(async (c) => {
          const from = c.get().angle;
          const steps = a.by / 15;
          for (let k = 1; k <= steps; k++) {
            await c.wait(0.08);
            c.set({ angle: from + 15 * k });
          }
          const end = c.get();
          const e = turned(end);
          c.emit(e.signal, e.payload);
        }),
    }),
    [MotorAction.SetOn]: act({
      describe: "Connect or disconnect the battery",
      byLearner: true,
      args: z.object({ isOn: z.boolean() }).strict(),
      run: (s, a) =>
        set(
          { isOn: a.isOn, isRunning: a.isOn ? s.isRunning : false },
          { signal: MotorSignal.Switched, payload: { isOn: a.isOn } },
        ),
    }),
    [MotorAction.Run]: act({
      describe: "Let the motor run by itself, or stop it",
      byLearner: true,
      args: z.object({ isRunning: z.boolean() }).strict(),
      run: (s, a) =>
        set(
          { isRunning: a.isRunning, isOn: a.isRunning ? true : s.isOn },
          { signal: MotorSignal.Switched, payload: { isRunning: a.isRunning } },
        ),
    }),
    [MotorAction.SetRings]: act({
      describe: "Use the split ring, or two plain slip rings",
      byLearner: true,
      args: z.object({ hasSplitRing: z.boolean() }).strict(),
      run: (s, a) =>
        set({ hasSplitRing: a.hasSplitRing }, turned({ ...s, hasSplitRing: a.hasSplitRing })),
    }),
  },
  signals: {
    [MotorSignal.Turned]: {
      describe:
        "The coil was turned (or the rings swapped); the payload has the current, force and spin",
      isCommit: true,
    },
    [MotorSignal.Switched]: { describe: "The battery or the running changed" },
  },
  observe: (s) => ({
    summary: describeMotor(s),
    elements: [
      { id: MotorPart.Coil, value: `${norm(s.angle)}°` },
      { id: MotorPart.Rings, value: s.hasSplitRing ? "split ring" : "slip rings" },
      {
        id: MotorPart.Brushes,
        value: brushXOf(s) === null ? "on the gaps" : `X on ${brushXOf(s)}`,
      },
      ...(s.showForces && forceOnAB(s) !== "none"
        ? [{ id: MotorPart.Forces, value: `AB ${forceOnAB(s)}` }]
        : []),
    ],
  }),
  parts: (s) => [
    MotorPart.Coil,
    MotorPart.Rings,
    MotorPart.Brushes,
    ...(s.showForces && forceOnAB(s) !== "none" ? [MotorPart.Forces] : []),
    ...(s.canTurn || s.canRun || s.canSwapRings ? [MotorPart.Controls] : []),
  ],
});
