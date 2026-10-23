import { actionsFor, defineProp, set, task } from "@chalk/prop";
import { z } from "zod";

/**
 * The electric generator of Fig 13.19, seen end-on. The field runs from N (left) to S (right).
 * The coil is turned clockwise from flat with arm AB on the left, so AB first moves up and CD
 * down. By Fleming's right-hand rule (I = v × B) the induced current in AB then runs A → B (into
 * the page) and in CD the other way; the current is largest when the arms cut straight across
 * the field (coil flat) and zero when they move along it (coil upright): output ∝ cos(angle).
 * With slip rings R1 and R2 the outside current reverses every half turn: AC. With a split ring
 * one brush always meets the arm moving up, so it never reverses: DC.
 */

export const Rings = { Slip: "slip", Split: "split" } as const;
export type Rings = (typeof Rings)[keyof typeof Rings];

export const GeneratorAction = { Turn: "turn", Run: "run", SetRings: "setRings" } as const;
export const GeneratorSignal = { Turned: "turned", Switched: "switched" } as const;
export const GeneratorDerived = {
  Output: "output",
  CurrentInAB: "currentInAB",
  OutsideFlow: "outsideFlow",
  Kind: "kind",
} as const;
export const GeneratorPart = {
  Coil: "coil",
  Rings: "rings",
  Galvanometer: "galvanometer",
  Graph: "graph",
  Controls: "controls",
} as const;

const generatorState = z
  .object({
    /** How far the coil has been turned clockwise from flat (AB on the left), degrees. */
    angle: z.number().min(-36000).max(36000),
    rings: z.nativeEnum(Rings),
    /** Turning by itself (an animation). */
    isRunning: z.boolean(),
    /** ⊙ / ⊗ on the arms for the induced current. */
    showCurrent: z.boolean(),
    /** The output current against the angle, over two turns. */
    showGraph: z.boolean(),
    showLabels: z.boolean(),
    canTurn: z.boolean(),
    canRun: z.boolean(),
    canSetRings: z.boolean(),
  })
  .strict();
export type GeneratorState = z.infer<typeof generatorState>;

const norm = (a: number) => ((a % 360) + 360) % 360;
const tidy = (v: number) => (Math.abs(v) < 1e-9 ? 0 : Math.round(v * 1000) / 1000);

/** The current in arm AB, as a share of the largest: + is A → B (into the page). */
export const armCurrentOf = (angle: number): number => tidy(Math.cos((angle * Math.PI) / 180));

/**
 * The current in the outside circuit, −1 … 1: + flows from brush B2 to B1. With slip rings it
 * follows the arm (AC); with a split ring it never turns negative (DC).
 */
export function outputOf(s: Pick<GeneratorState, "angle" | "rings">): number {
  const i = armCurrentOf(s.angle);
  return s.rings === Rings.Slip ? i : Math.abs(i);
}

export function currentInABOf(s: Pick<GeneratorState, "angle">): "in" | "out" | "none" {
  const i = armCurrentOf(s.angle);
  return i === 0 ? "none" : i > 0 ? "in" : "out";
}

export function outsideFlowOf(s: Pick<GeneratorState, "angle" | "rings">): string {
  const o = outputOf(s);
  return o === 0 ? "none" : o > 0 ? "B2 to B1" : "B1 to B2";
}

export function describeGenerator(s: GeneratorState): string {
  const a = norm(s.angle);
  const rings =
    s.rings === Rings.Slip
      ? "two slip rings R1 and R2 with brushes B1 and B2 (an AC generator)"
      : "a split ring (a DC generator)";
  const i = currentInABOf(s);
  const arm =
    i === "none"
      ? "the coil is upright: its arms move along the field, so no current is induced"
      : `AB is moving ${a < 90 || a > 270 ? "up" : "down"} through the field, and the induced current runs ${i === "in" ? "A → B (into the page)" : "B → A (out of the page)"}`;
  const out = outputOf(s);
  return `A generator seen end-on: a coil ABCD between N (left) and S (right), turned ${a}° clockwise from flat, its ends on ${rings}. Now ${arm}. The outside current is ${out === 0 ? "zero" : `${Math.round(Math.abs(out) * 100)}% of its largest, flowing from ${outsideFlowOf(s)}`}.${s.isRunning ? " The coil is being turned round and round." : ""}`;
}

const act = actionsFor<GeneratorState>();
const turned = (s: GeneratorState) => ({
  signal: GeneratorSignal.Turned,
  payload: {
    angle: norm(s.angle),
    output: outputOf(s),
    currentInAB: currentInABOf(s),
    outsideFlow: outsideFlowOf(s),
  },
});

export const generator = defineProp({
  type: "generator",
  describe:
    "The electric generator (NCERT 13.6, Fig 13.19) seen end-on: a coil turned clockwise between N and S poles, the current induced in each arm (Fleming's right-hand rule), slip rings giving alternating current or a split ring giving direct current, and a graph of the output current against the angle over two turns. The learner turns the coil in steps, cranks it round, or swaps the rings.",
  state: generatorState,
  defaults: {
    angle: 0,
    rings: Rings.Slip,
    isRunning: false,
    showCurrent: true,
    showGraph: true,
    showLabels: true,
    canTurn: true,
    canRun: true,
    canSetRings: false,
  },
  inputs: ["showCurrent", "showGraph", "showLabels", "canTurn", "canRun", "canSetRings"],
  derived: {
    [GeneratorDerived.Output]: {
      describe: "The outside current as a share of its largest, −1 to 1 (+ from B2 to B1)",
      compute: (s) => outputOf(s),
    },
    [GeneratorDerived.CurrentInAB]: {
      describe: "The induced current in arm AB: in (A → B), out (B → A), or none",
      compute: (s) => currentInABOf(s),
    },
    [GeneratorDerived.OutsideFlow]: {
      describe: "Which way the current flows outside: B2 to B1, B1 to B2, or none",
      compute: (s) => outsideFlowOf(s),
    },
    [GeneratorDerived.Kind]: {
      describe: "AC (slip rings) or DC (split ring)",
      compute: (s) => (s.rings === Rings.Slip ? "AC" : "DC"),
    },
  },
  actions: {
    [GeneratorAction.Turn]: act({
      describe: "Turn the coil clockwise by hand, 45° or 90° at a time",
      byLearner: true,
      args: z.object({ by: z.union([z.literal(45), z.literal(90)]) }).strict(),
      run: (_s, a) =>
        task<GeneratorState>(async (c) => {
          const from = c.get().angle;
          for (let k = 1; k <= a.by / 15; k++) {
            await c.wait(0.08);
            c.set({ angle: from + 15 * k });
          }
          const e = turned(c.get());
          c.emit(e.signal, e.payload);
        }),
    }),
    [GeneratorAction.Run]: act({
      describe: "Keep turning the coil round, or stop",
      byLearner: true,
      args: z.object({ isRunning: z.boolean() }).strict(),
      run: (_s, a) =>
        set(
          { isRunning: a.isRunning },
          { signal: GeneratorSignal.Switched, payload: { isRunning: a.isRunning } },
        ),
    }),
    [GeneratorAction.SetRings]: act({
      describe: "Use slip rings (AC) or a split ring (DC)",
      byLearner: true,
      args: z.object({ rings: z.nativeEnum(Rings) }).strict(),
      run: (s, a) => set({ rings: a.rings }, turned({ ...s, rings: a.rings })),
    }),
  },
  signals: {
    [GeneratorSignal.Turned]: {
      describe: "The coil was turned or the rings swapped; the payload has the output",
      isCommit: true,
    },
    [GeneratorSignal.Switched]: { describe: "The coil started or stopped turning by itself" },
  },
  observe: (s) => ({
    summary: describeGenerator(s),
    elements: [
      { id: GeneratorPart.Coil, value: `${norm(s.angle)}°, AB current ${currentInABOf(s)}` },
      {
        id: GeneratorPart.Rings,
        value: s.rings === Rings.Slip ? "slip rings (AC)" : "split ring (DC)",
      },
      { id: GeneratorPart.Galvanometer, value: outputOf(s) },
      ...(s.showGraph ? [{ id: GeneratorPart.Graph, value: "output against angle" }] : []),
    ],
  }),
  parts: (s) => [
    GeneratorPart.Coil,
    GeneratorPart.Rings,
    GeneratorPart.Galvanometer,
    ...(s.showGraph ? [GeneratorPart.Graph] : []),
    ...(s.canTurn || s.canRun || s.canSetRings ? [GeneratorPart.Controls] : []),
  ],
});
