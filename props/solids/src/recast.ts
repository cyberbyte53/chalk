import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import {
  type Dims,
  Pi,
  Solid,
  type Words,
  clean,
  measuresOf,
  numText,
  piValue,
  withUnit,
} from "./solids";

/**
 * Converting a solid into another (13.4): melted and recast, poured, dug out and spread. The volume
 * stays the same, so the one unknown (a radius, a height, or how many) comes from
 * volume before = volume after. Each preset is from NCERT; the answer is solved from the volumes.
 */

export const RecastKind = {
  /** Example 8: a clay cone reshaped into a sphere. */
  ClayCone: "clayCone",
  /** Example 9: a cuboid sump fills a cylindrical tank; the water left in the sump. */
  Sump: "sump",
  /** Example 10: a copper rod drawn into a wire. */
  Wire: "wire",
  /** Exercise 13.3 Q1: a sphere recast into a cylinder. */
  SphereToCylinder: "sphereToCylinder",
  /** Exercise 13.3 Q2: three spheres melted into one. */
  ThreeSpheres: "threeSpheres",
  /** Exercise 13.3 Q3: a well's earth spread into a platform. */
  Well: "well",
  /** Exercise 13.3 Q5: ice cream from a cylinder into cones topped with hemispheres. */
  IceCream: "iceCream",
  /** Exercise 13.3 Q6: silver coins melted into a cuboid. */
  Coins: "coins",
  /** Exercise 13.3 Q7: a bucket of sand emptied into a conical heap. */
  SandHeap: "sandHeap",
  /** Exercise 13.3 Q9 (the tank's volume as a length of pipe): how long the pipe's water is. */
  Pipe: "pipe",
  /** Exercise 13.2 Q5: lead shots dropped in a cone of water till a quarter flows out. */
  LeadShots: "leadShots",
} as const;
export type RecastKind = (typeof RecastKind)[keyof typeof RecastKind];

/** One solid on either side. `share`: how much of it counts (¼ of the cone's water); `sign` −1 takes it away. */
export type Piece = {
  solid: Solid;
  dims: Partial<Dims>;
  share?: number;
  sign?: 1 | -1;
};

/** What is found: a measurement of the new solid, or how many of it. */
export type Unknown = { kind: "dim"; name: keyof Dims } | { kind: "count" };

export type Recast = {
  kind: RecastKind;
  name: Words;
  /** What happens: melted, poured, dug and spread. */
  verb: Words;
  pi: Pi;
  unit: string;
  from: Piece[];
  /** The new solid (several pieces make one: a cone with a hemisphere on top). */
  to: Piece[];
  unknown: Unknown;
};

const w = (en: string, hi: string): Words => ({ en, hi });
const MELT = w("melted and recast", "पिघलाकर ढाला");
const POUR = w("poured", "उड़ेला");
const SPREAD = w("dug out and spread", "खोदकर फैलाया");

export function recastOf(kind: RecastKind): Recast {
  switch (kind) {
    case RecastKind.ClayCone:
      return {
        kind,
        name: w("clay cone into a sphere", "मिट्टी का शंकु, गोले में"),
        verb: w("reshaped", "नया आकार दिया"),
        pi: Pi.Sevenths,
        unit: "cm",
        from: [{ solid: Solid.Cone, dims: { r: 6, h: 24 } }],
        to: [{ solid: Solid.Sphere, dims: {} }],
        unknown: { kind: "dim", name: "r" },
      };
    case RecastKind.Sump:
      return {
        kind,
        name: w("Selvi's sump and tank", "सेल्वी का हौज़ और टंकी"),
        verb: POUR,
        pi: Pi.Hundredths,
        unit: "cm",
        from: [
          { solid: Solid.Cuboid, dims: { l: 157, b: 144, h: 95 } },
          { solid: Solid.Cylinder, dims: { r: 60, h: 95 }, sign: -1 },
        ],
        to: [{ solid: Solid.Cuboid, dims: { l: 157, b: 144 } }],
        unknown: { kind: "dim", name: "h" },
      };
    case RecastKind.Wire:
      return {
        kind,
        name: w("copper rod into a wire", "ताँबे की छड़ से तार"),
        verb: w("drawn out", "खींचा"),
        pi: Pi.Symbol,
        unit: "cm",
        from: [{ solid: Solid.Cylinder, dims: { r: 0.5, h: 8 } }],
        to: [{ solid: Solid.Cylinder, dims: { h: 1800 } }],
        unknown: { kind: "dim", name: "r" },
      };
    case RecastKind.SphereToCylinder:
      return {
        kind,
        name: w("sphere into a cylinder", "गोले से बेलन"),
        verb: MELT,
        pi: Pi.Sevenths,
        unit: "cm",
        from: [{ solid: Solid.Sphere, dims: { r: 4.2 } }],
        to: [{ solid: Solid.Cylinder, dims: { r: 6 } }],
        unknown: { kind: "dim", name: "h" },
      };
    case RecastKind.ThreeSpheres:
      return {
        kind,
        name: w("three spheres into one", "तीन गोलों से एक"),
        verb: MELT,
        pi: Pi.Sevenths,
        unit: "cm",
        from: [
          { solid: Solid.Sphere, dims: { r: 6 } },
          { solid: Solid.Sphere, dims: { r: 8 } },
          { solid: Solid.Sphere, dims: { r: 10 } },
        ],
        to: [{ solid: Solid.Sphere, dims: {} }],
        unknown: { kind: "dim", name: "r" },
      };
    case RecastKind.Well:
      return {
        kind,
        name: w("a well and its platform", "कुआँ और उसका चबूतरा"),
        verb: SPREAD,
        pi: Pi.Sevenths,
        unit: "m",
        from: [{ solid: Solid.Cylinder, dims: { r: 3.5, h: 20 } }],
        to: [{ solid: Solid.Cuboid, dims: { l: 22, b: 14 } }],
        unknown: { kind: "dim", name: "h" },
      };
    case RecastKind.IceCream:
      return {
        kind,
        name: w("ice cream into cones", "आइसक्रीम, कोनों में"),
        verb: w("filled", "भरा"),
        pi: Pi.Sevenths,
        unit: "cm",
        from: [{ solid: Solid.Cylinder, dims: { r: 6, h: 15 } }],
        to: [
          { solid: Solid.Cone, dims: { r: 3, h: 12 } },
          { solid: Solid.Hemisphere, dims: { r: 3 } },
        ],
        unknown: { kind: "count" },
      };
    case RecastKind.Coins:
      return {
        kind,
        name: w("coins for a cuboid", "घनाभ के लिए सिक्के"),
        verb: MELT,
        pi: Pi.Sevenths,
        unit: "cm",
        from: [{ solid: Solid.Cuboid, dims: { l: 5.5, b: 10, h: 3.5 } }],
        to: [{ solid: Solid.Cylinder, dims: { r: 0.875, h: 0.2 } }],
        unknown: { kind: "count" },
      };
    case RecastKind.SandHeap:
      return {
        kind,
        name: w("a bucket of sand into a heap", "रेत की बाल्टी से ढेर"),
        verb: w("emptied", "खाली किया"),
        pi: Pi.Sevenths,
        unit: "cm",
        from: [{ solid: Solid.Cylinder, dims: { r: 18, h: 32 } }],
        to: [{ solid: Solid.Cone, dims: { h: 24 } }],
        unknown: { kind: "dim", name: "r" },
      };
    case RecastKind.Pipe:
      return {
        kind,
        name: w("filling a tank through a pipe", "पाइप से टंकी भरना"),
        verb: POUR,
        pi: Pi.Sevenths,
        unit: "m",
        from: [{ solid: Solid.Cylinder, dims: { r: 5, h: 2 } }],
        to: [{ solid: Solid.Cylinder, dims: { r: 0.1 } }],
        unknown: { kind: "dim", name: "h" },
      };
    case RecastKind.LeadShots:
      return {
        kind,
        name: w("lead shots in a cone of water", "पानी भरे शंकु में सीसे की गोलियाँ"),
        verb: w("dropped in", "डाला"),
        pi: Pi.Sevenths,
        unit: "cm",
        from: [{ solid: Solid.Cone, dims: { r: 5, h: 8 }, share: 0.25 }],
        to: [{ solid: Solid.Sphere, dims: { r: 0.5 } }],
        unknown: { kind: "count" },
      };
  }
}

const FILL: Dims = { l: 1, b: 1, h: 1, a: 1, r: 1, r1: 2, r2: 1 };

function full(d: Partial<Dims>): Dims {
  return { ...FILL, ...d };
}

/** One piece's volume (with its share and sign). */
export function volumeOfPiece(p: Piece, pi: Pi): number {
  return (p.sign ?? 1) * (p.share ?? 1) * measuresOf(p.solid, full(p.dims), piValue(pi)).volume;
}

/** The volume before: the sources together. */
export function volumeBefore(r: Recast): number {
  return r.from.reduce((v, p) => v + volumeOfPiece(p, r.pi), 0);
}

/** The new solid's volume when its unknown measurement is x (or one of it, for a count). */
export function volumeAfter(r: Recast, x: number): number {
  return r.to.reduce((v, p) => {
    const d = r.unknown.kind === "dim" ? { ...p.dims, [r.unknown.name]: x } : p.dims;
    return v + volumeOfPiece({ ...p, dims: d }, r.pi);
  }, 0);
}

/**
 * The answer: the unknown measurement (solved from volume before = volume after; every volume
 * here grows with its measurements, so halving the interval finds it), or the count (whole ones).
 */
export function answerOf(r: Recast): number {
  const v = volumeBefore(r);
  if (r.unknown.kind === "count") return Math.floor(clean(v / volumeAfter(r, 1)) + 1e-9);
  let lo = 0;
  let hi = 1;
  while (volumeAfter(r, hi) < v) hi *= 2;
  for (let i = 0; i < 100; i += 1) {
    const mid = (lo + hi) / 2;
    if (volumeAfter(r, mid) < v) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** The new solid's measurements with the answer filled in (for drawing it). */
export function solvedTo(r: Recast): Piece[] {
  if (r.unknown.kind === "count") return r.to;
  const x = answerOf(r);
  const name = r.unknown.name;
  return r.to.map((p) => ({ ...p, dims: { ...p.dims, [name]: x } }));
}

export const RecastAction = { Step: "step", Back: "back", SetKind: "setKind" } as const;
export const RecastSignal = { Stepped: "stepped", Solved: "solved" } as const;
export const RecastDerived = { Before: "before", Answer: "answer" } as const;
export const RecastPart = {
  Before: "before",
  After: "after",
  Lines: "lines",
  Step: "step",
  Back: "back",
} as const;

/**
 * The steps: 0, the solid(s) before and their volume; 1, melted (the material in between);
 * 2, the new solid with its unknown; 3, solved.
 */
export const RecastStep = { Before: 0, Melted: 1, After: 2, Solved: 3 } as const;
export const RECAST_STEPS = 4;

const recastState = z
  .object({
    kind: z.nativeEnum(RecastKind),
    step: z
      .number()
      .int()
      .min(0)
      .max(RECAST_STEPS - 1),
    showLines: z.boolean(),
    canStep: z.boolean(),
  })
  .strict();
export type RecastState = z.infer<typeof recastState>;

const SOLID_EN: Record<Solid, string> = {
  [Solid.Cuboid]: "cuboid",
  [Solid.Cube]: "cube",
  [Solid.Cylinder]: "cylinder",
  [Solid.Cone]: "cone",
  [Solid.Sphere]: "sphere",
  [Solid.Hemisphere]: "hemisphere",
  [Solid.Frustum]: "frustum",
};

function pieceText(p: Piece, unit: string): string {
  const dims = Object.entries(p.dims)
    .map(([k, v]) => `${k} = ${withUnit(v as number, unit)}`)
    .join(", ");
  const share = p.share === undefined ? "" : `${numText(p.share)} of `;
  return `${p.sign === -1 ? "minus " : ""}${share}a ${SOLID_EN[p.solid]}${dims === "" ? "" : ` (${dims})`}`;
}

/** The answer as words, e.g. "r = 6 cm" or "10 of them". */
export function answerText(r: Recast): string {
  const x = answerOf(r);
  return r.unknown.kind === "count" ? `${x} of them` : `${r.unknown.name} = ${withUnit(x, r.unit)}`;
}

const act = actionsFor<RecastState>();

export const meltRecast = defineProp({
  type: "meltRecast",
  describe:
    "Converting one solid into another with the same volume, from the chapter's examples and exercises: a clay cone reshaped into a sphere, spheres melted into a cylinder or one sphere, a well's earth spread into a platform, ice cream filled into cones, coins melted into a cuboid, a bucket of sand emptied into a conical heap, a tank filled through a pipe. In steps: the solid before and its volume; melted; the new solid with its unknown (a radius, a height, or how many); solved from volume before = volume after. The new solid fills up as it is made (still, with reduced motion).",
  state: recastState,
  defaults: { kind: RecastKind.ClayCone, step: 0, showLines: true, canStep: true },
  inputs: ["showLines", "canStep"],
  derived: {
    [RecastDerived.Before]: {
      describe: "The volume before (the material that is reshaped)",
      compute: (s) => clean(volumeBefore(recastOf(s.kind))),
    },
    [RecastDerived.Answer]: {
      describe: "The unknown: a measurement of the new solid, or how many of it can be made",
      compute: (s) => clean(answerOf(recastOf(s.kind))),
    },
  },
  actions: {
    [RecastAction.Step]: act({
      describe: "Go on to the next step (before → melted → the new solid → solved)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (!s.canStep || s.step >= RECAST_STEPS - 1) return set({});
        const step = s.step + 1;
        const r = recastOf(s.kind);
        const emits: Emit[] = [{ signal: RecastSignal.Stepped, payload: { step } }];
        if (step === RecastStep.Solved)
          emits.push({
            signal: RecastSignal.Solved,
            payload: { step, answer: clean(answerOf(r)) },
          });
        return set({ step }, ...emits);
      },
    }),
    [RecastAction.Back]: act({
      describe: "Go back to the first step",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        !s.canStep || s.step === 0
          ? set({})
          : set({ step: 0 }, { signal: RecastSignal.Stepped, payload: { step: 0 } }),
    }),
    [RecastAction.SetKind]: act({
      describe: "Show a different conversion, from its first step",
      args: z.object({ kind: z.nativeEnum(RecastKind) }).strict(),
      run: (_s, a) => set({ kind: a.kind, step: 0 }),
    }),
  },
  signals: {
    [RecastSignal.Stepped]: { describe: "The learner moved to another step; the payload has it" },
    [RecastSignal.Solved]: { describe: "The answer is shown; the payload has it" },
  },
  observe: (s) => {
    const r = recastOf(s.kind);
    const v = volumeBefore(r);
    const before = r.from.map((p) => pieceText(p, r.unit)).join(", ");
    const after = r.to.map((p) => pieceText(p, r.unit)).join(" topped with ");
    const unknown = r.unknown.kind === "count" ? "how many" : `${r.unknown.name} = ?`;
    const elements: Element[] = [
      { id: RecastPart.Before, value: `${before}; volume ${withUnit(v, r.unit, 3)}` },
    ];
    if (s.step >= RecastStep.After)
      elements.push({
        id: RecastPart.After,
        value: `${r.unknown.kind === "count" ? "each new solid: " : "the new solid: "}${after}; ${s.step === RecastStep.Solved ? answerText(r) : unknown}`,
      });
    return {
      summary: `${r.name.en}: ${["the solid before", "melted", "the new solid", "solved"][s.step]} (step ${s.step + 1} of ${RECAST_STEPS}).`,
      elements,
      hidden: { answer: answerText(r) },
    };
  },
  parts: (s) => [
    RecastPart.Before,
    ...(s.step >= RecastStep.After ? [RecastPart.After] : []),
    ...(s.showLines ? [RecastPart.Lines] : []),
    ...(s.canStep && s.step < RECAST_STEPS - 1 ? [RecastPart.Step] : []),
    ...(s.canStep && s.step > 0 ? [RecastPart.Back] : []),
  ],
});
