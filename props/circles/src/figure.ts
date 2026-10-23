import { type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * A labelled geometry figure the lesson describes as data: named points, then segments, regions,
 * circles, arcs, right-angle and angle marks, equal-length ticks, parallel marks and notes, each
 * shown from a given step. With more than one step the learner taps through it, so a proof's
 * construction lines (join BE and CD, drop DM ⊥ AC…) appear one at a time, each with its caption.
 * Built on the geometry kit; for any worked example or proof that needs "the figure".
 */

const pt = z.tuple([z.number(), z.number()]);
/** A point by its name, or a place given directly in model units. */
const at = z.union([z.string().min(1).max(4), pt]);
const tone = z.enum(["main", "accent", "result", "construction", "muted", "wrong"]);
const step = z.number().int().min(0).max(9).optional();
const words = z.object({ en: z.string(), hi: z.string() }).strict();

const pathCmd = z.union([
  z.object({ k: z.literal("M"), p: at }).strict(),
  z.object({ k: z.literal("L"), p: at }).strict(),
  z
    .object({
      k: z.literal("A"),
      c: at,
      r: z.number().positive(),
      from: z.number(),
      to: z.number(),
      cw: z.boolean().optional(),
    })
    .strict(),
  z.object({ k: z.literal("Z") }).strict(),
]);
export type FigurePathCmd = z.infer<typeof pathCmd>;

const item = z.discriminatedUnion("kind", [
  /** A segment AB. */
  z
    .object({
      kind: z.literal("seg"),
      a: at,
      b: at,
      tone: tone.optional(),
      dashed: z.boolean().optional(),
      step,
    })
    .strict(),
  /** A filled polygon (a triangle to shade). */
  z
    .object({
      kind: z.literal("poly"),
      pts: z.array(at).min(3).max(8),
      tone: tone.optional(),
      step,
    })
    .strict(),
  /** A filled region of sides and arcs (loops inside loops are holes). */
  z
    .object({
      kind: z.literal("path"),
      cmds: z.array(pathCmd).min(2).max(40),
      tone: tone.optional(),
      isOutlined: z.boolean().optional(),
      step,
    })
    .strict(),
  /** A whole circle. */
  z
    .object({
      kind: z.literal("circle"),
      c: at,
      r: z.number().positive(),
      tone: tone.optional(),
      dashed: z.boolean().optional(),
      step,
    })
    .strict(),
  /** An arc from angle `from` anticlockwise to `to` (degrees). */
  z
    .object({
      kind: z.literal("arc"),
      c: at,
      r: z.number().positive(),
      from: z.number(),
      to: z.number(),
      tone: tone.optional(),
      step,
    })
    .strict(),
  /** The right-angle square at a vertex, between the rays to p and q. */
  z
    .object({ kind: z.literal("right"), at, p: at, q: at, step })
    .strict(),
  /** An angle mark at a vertex, with an optional label (30°, θ, x). */
  z
    .object({
      kind: z.literal("angle"),
      at,
      p: at,
      q: at,
      label: z.string().max(8).optional(),
      count: z.number().int().min(1).max(3).optional(),
      tone: tone.optional(),
      step,
    })
    .strict(),
  /** Equal-length ticks across a segment. */
  z
    .object({
      kind: z.literal("ticks"),
      a: at,
      b: at,
      count: z.number().int().min(1).max(3).optional(),
      step,
    })
    .strict(),
  /** Parallel marks (arrowheads) on a segment. */
  z
    .object({
      kind: z.literal("parallel"),
      a: at,
      b: at,
      count: z.number().int().min(1).max(3).optional(),
      step,
    })
    .strict(),
  /** A short note at a place: a length ("6 cm"), a region's name ("I"). */
  z
    .object({
      kind: z.literal("note"),
      at,
      text: z.string().min(1).max(14),
      prefer: z.number().optional(),
      tone: tone.optional(),
      step,
    })
    .strict(),
]);
export type FigureItem = z.infer<typeof item>;

const point = z
  .object({
    name: z.string().min(1).max(4),
    at: pt,
    /** Shown (and labelled) from this step. */
    step,
    /** Drawn but not named (a helper point). */
    isUnnamed: z.boolean().optional(),
    /** Only a place to draw from (a centre): neither dotted nor named. */
    isHidden: z.boolean().optional(),
    /** Screen direction to put the name first (0 right, 90 down). */
    prefer: z.number().optional(),
  })
  .strict();
export type FigurePoint = z.infer<typeof point>;

export const FigureAction = { Next: "next", Back: "back", Reset: "reset", GoTo: "goTo" } as const;
export const FigureSignal = { Stepped: "stepped", Done: "done" } as const;
export const FigureDerived = { StepCount: "stepCount", IsDone: "isDone" } as const;
export const FigurePart = { Figure: "figure", Caption: "caption", Steps: "steps" } as const;

const figureState = z
  .object({
    points: z.array(point).min(1).max(24),
    items: z.array(item).max(60),
    /** A caption per step (one, for a still figure); the stepper shows when there are two or more. */
    captions: z.array(words).max(10),
    step: z.number().int().min(0).max(9),
    canStep: z.boolean(),
    /** Height in pixels. */
    height: z.number().int().min(140).max(360),
    /** What the figure shows, in words, for the description (English). */
    about: z.string().max(400),
  })
  .strict();
export type FigureState = z.infer<typeof figureState>;

/** How many steps: one per caption, at least one. */
export const figureStepCountOf = (s: Pick<FigureState, "captions">): number =>
  Math.max(1, s.captions.length);

/** A point's place by name, or the place given. */
export function placeOf(s: Pick<FigureState, "points">, p: z.infer<typeof at>): [number, number] {
  if (typeof p !== "string") return p;
  const found = s.points.find((q) => q.name === p);
  return found === undefined ? [0, 0] : found.at;
}

/** The names an item mentions, to check they exist. */
function namesIn(i: FigureItem): string[] {
  const out: unknown[] = [];
  if (i.kind === "seg" || i.kind === "ticks" || i.kind === "parallel") out.push(i.a, i.b);
  else if (i.kind === "poly") out.push(...i.pts);
  else if (i.kind === "path")
    for (const c of i.cmds) out.push(c.k === "A" ? c.c : c.k === "Z" ? 0 : c.p);
  else if (i.kind === "circle" || i.kind === "arc") out.push(i.c);
  else if (i.kind === "right" || i.kind === "angle") out.push(i.at, i.p, i.q);
  else out.push(i.at);
  return out.filter((x): x is string => typeof x === "string");
}

/** The words of the description: what the figure is, and what this step adds. */
export function describeFigure(s: FigureState): string {
  const caption = s.captions[Math.min(s.step, s.captions.length - 1)];
  const steps = figureStepCountOf(s);
  return `${s.about}${steps > 1 ? ` Step ${s.step + 1} of ${steps}` : ""}${caption === undefined || caption.en === "" ? "" : `: ${caption.en}`}`;
}

function stepped(s: FigureState, step: number): Emit[] {
  const out: Emit[] = [{ signal: FigureSignal.Stepped, payload: { step } }];
  if (step === figureStepCountOf(s) - 1 && s.step !== step)
    out.push({ signal: FigureSignal.Done, payload: {} });
  return out;
}

const act = actionsFor<FigureState>();

export const geoFigure = defineProp({
  type: "geoFigure",
  describe:
    "A labelled geometry figure described as data: named points, segments, shaded polygons and arc regions, circles, arcs, right-angle and angle marks, equal-length ticks, parallel marks and short notes such as lengths. Each piece can appear from a given step with a caption, so the learner taps through a proof's construction lines one at a time (Next, Back, Start again); with one caption it is a still figure for a worked example.",
  state: figureState,
  defaults: {
    points: [
      { name: "A", at: [1.5, 4] },
      { name: "B", at: [0, 0] },
      { name: "C", at: [5, 0] },
    ],
    items: [
      { kind: "seg", a: "A", b: "B" },
      { kind: "seg", a: "B", b: "C" },
      { kind: "seg", a: "C", b: "A" },
    ],
    captions: [],
    step: 0,
    canStep: true,
    height: 220,
    about: "Triangle ABC.",
  },
  inputs: ["canStep"],
  invariant: (s) => {
    if (s.step >= figureStepCountOf(s)) return "step is past the last caption";
    const names = new Set(s.points.map((p) => p.name));
    if (names.size !== s.points.length) return "two points share a name";
    for (const i of s.items)
      for (const n of namesIn(i)) if (!names.has(n)) return `no point named ${n}`;
    return undefined;
  },
  derived: {
    [FigureDerived.StepCount]: {
      describe: "How many steps the figure has (one per caption)",
      compute: figureStepCountOf,
    },
    [FigureDerived.IsDone]: {
      describe: "Whether the last step is showing",
      compute: (s) => s.step === figureStepCountOf(s) - 1,
    },
  },
  actions: {
    [FigureAction.Next]: act({
      describe: "Show the next step of the figure",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (!s.canStep) return set({});
        const step = Math.min(figureStepCountOf(s) - 1, s.step + 1);
        return step === s.step ? set({}) : set({ step }, ...stepped(s, step));
      },
    }),
    [FigureAction.Back]: act({
      describe: "Go back one step",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        !s.canStep || s.step === 0
          ? set({})
          : set(
              { step: s.step - 1 },
              { signal: FigureSignal.Stepped, payload: { step: s.step - 1 } },
            ),
    }),
    [FigureAction.Reset]: act({
      describe: "Start again from the first step",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        s.step === 0
          ? set({})
          : set({ step: 0 }, { signal: FigureSignal.Stepped, payload: { step: 0 } }),
    }),
    [FigureAction.GoTo]: act({
      describe: "Show a given step",
      args: z.object({ step: z.number().int().min(0).max(9) }).strict(),
      run: (s, a) => {
        const step = Math.min(figureStepCountOf(s) - 1, a.step);
        return set({ step }, ...stepped(s, step));
      },
    }),
  },
  observe: (s) => ({
    summary: describeFigure(s),
    elements: [
      { id: FigurePart.Figure, value: describeFigure(s) },
      ...(figureStepCountOf(s) > 1
        ? [{ id: FigurePart.Steps, value: `step ${s.step + 1} of ${figureStepCountOf(s)}` }]
        : []),
    ],
  }),
  parts: (s) => [
    FigurePart.Figure,
    ...(s.captions.length > 0 ? [FigurePart.Caption] : []),
    ...(figureStepCountOf(s) > 1 ? [FigurePart.Steps] : []),
  ],
});
