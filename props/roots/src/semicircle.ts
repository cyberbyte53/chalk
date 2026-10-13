import { type Box, type Emit, actionsFor, defineProp, set, task } from "@chalk/prop";
import { z } from "zod";
import { around, semicircleFigure, semicircleLayout, semicirclePx, swungD } from "./geometry";
import { glide } from "./glide";
import {
  hundredthsText,
  isTenthsPerfectSquare,
  isWholeTenths,
  rootOfTenthsText,
  tenthsText,
  toTenths,
} from "./surd";

export const RootSemicirclePart = {
  A: "a",
  B: "b",
  C: "c",
  D: "d",
  O: "o",
  E: "e",
  Bd: "bd",
  Semicircle: "semicircle",
  XSegment: "xSegment",
  UnitSegment: "unitSegment",
} as const;

export const RootSemicircleSignal = { Landed: "landed" } as const;

export const MIN_X = 0.5;
export const MAX_X = 12;
/** How long BD takes to swing onto the line, unless told otherwise. */
export const SEMICIRCLE_SWING_SECONDS = 1.6;

const rootSemicircleState = z
  .object({
    /** The length AB, in tenths. */
    x: z
      .number()
      .min(MIN_X)
      .max(MAX_X)
      .refine(isWholeTenths, { message: "x must be a whole number of tenths" }),
    /** Whether O, OD, OB and their lengths are drawn. */
    isProofShown: z.boolean(),
    /** How far BD has swung about B down onto the line (1: it lies on the line, ending at E). */
    swing: z.number().min(0).max(1),
  })
  .strict();
export type RootSemicircleState = z.infer<typeof rootSemicircleState>;

const act = actionsFor<RootSemicircleState>();

function parts(s: RootSemicircleState): string[] {
  const out: string[] = [
    RootSemicirclePart.A,
    RootSemicirclePart.B,
    RootSemicirclePart.C,
    RootSemicirclePart.D,
    RootSemicirclePart.Bd,
    RootSemicirclePart.Semicircle,
    RootSemicirclePart.XSegment,
    RootSemicirclePart.UnitSegment,
  ];
  if (s.isProofShown) out.push(RootSemicirclePart.O);
  if (s.swing >= 1) out.push(RootSemicirclePart.E);
  return out;
}

function locate(s: RootSemicircleState, part: string, width: number): Box | undefined {
  if (!parts(s).includes(part)) return undefined;
  const figure = semicircleFigure(s.x);
  const layout = semicircleLayout(s.x, width);
  const px = (x: number, y = 0) => semicirclePx(layout, s.x, { x, y });
  switch (part) {
    case RootSemicirclePart.A:
      return around([px(figure.a)]);
    case RootSemicirclePart.B:
      return around([px(figure.b)]);
    case RootSemicirclePart.C:
      return around([px(figure.c)]);
    case RootSemicirclePart.O:
      return around([px(figure.o)]);
    case RootSemicirclePart.D:
      return around([px(figure.d.x, figure.d.y)]);
    case RootSemicirclePart.E:
      return around([px(figure.e)]);
    case RootSemicirclePart.Bd: {
      const tip = swungD(figure, s.swing);
      return around([px(figure.b), px(tip.x, tip.y)], 8);
    }
    case RootSemicirclePart.Semicircle:
      return around([px(figure.a), px(figure.c), px(figure.o, figure.radius)], 4);
    case RootSemicirclePart.XSegment:
      return around([px(figure.a), px(figure.b)], 8);
    default:
      return around([px(figure.b), px(figure.c)], 8);
  }
}

function landedEmit(x: number): Emit {
  return { signal: RootSemicircleSignal.Landed, payload: { x } };
}

/**
 * √x for any x > 0 by a semicircle (NCERT Fig 1.15–1.17): AB = x, BC = 1, the semicircle on AC
 * meets the perpendicular at B in D, and BD = √x. It knows circles and lengths, nothing about any lesson.
 */
export const rootSemicircle = defineProp<RootSemicircleState>({
  type: "rootSemicircle",
  describe:
    "On a line, AB = x and BC = 1. O is the midpoint of AC; the semicircle with centre O through C meets the perpendicular to the line at B in D, and BD = √x (OD = (x+1)/2, OB = (x−1)/2, so BD² = OD² − OB² = x). With B as 0, BD swings about B down onto the line, landing at E = √x.",
  state: rootSemicircleState,
  defaults: { x: 3.5, isProofShown: false, swing: 0 },
  derived: {
    bd: { describe: "The length BD, √x, as a decimal", compute: (s) => Math.sqrt(s.x) },
    bdSquared: { describe: "BD², exactly x", compute: (s) => toTenths(s.x) / 10 },
    isWhole: {
      describe: "x is a perfect square, so BD is a whole number",
      compute: (s) => isTenthsPerfectSquare(toTenths(s.x)),
    },
    xText: { describe: 'x as text, e.g. "3.5"', compute: (s) => tenthsText(toTenths(s.x)) },
    bdText: {
      describe: 'BD as maths, e.g. "√3.5", or "3" when x is 9',
      compute: (s) => rootOfTenthsText(toTenths(s.x)),
    },
    od: { describe: "OD = (x + 1)/2, the radius", compute: (s) => (toTenths(s.x) + 10) / 20 },
    ob: {
      describe: "OB = (x − 1)/2 (negative when B is left of O)",
      compute: (s) => (toTenths(s.x) - 10) / 20,
    },
    hasLanded: { describe: "BD has swung down onto the line", compute: (s) => s.swing >= 1 },
  },
  offScreen: ["bd"],
  actions: {
    setX: act({
      describe:
        "Make AB = x (rounded to the nearest 0.1, 0.5 to 12): A moves, B and C stay together. Swing goes back to 0. Keeps the proof shown or hidden.",
      byLearner: true,
      args: z.object({ x: z.number().min(MIN_X).max(MAX_X) }).strict(),
      run: (_s, a) => set({ x: toTenths(a.x) / 10, swing: 0 }),
    }),
    showProof: act({
      describe: "Show or hide O, OD and OB with their lengths, and BD² = OD² − OB² = x",
      args: z.object({ isShown: z.boolean() }).strict(),
      run: (_s, a) => set({ isProofShown: a.isShown }),
    }),
    swing: act({
      describe:
        "With B as 0, swing BD about B down onto the line (over `over` seconds, 1.6 by default), landing at E = √x. Keeps x. Raises `landed`.",
      byLearner: true,
      args: z.object({ over: z.number().min(0).max(10).optional() }).strict(),
      run: (s, a) => {
        if (s.swing >= 1) return set({});
        const over = a.over ?? SEMICIRCLE_SWING_SECONDS;
        if (over === 0) return set({ swing: 1 }, landedEmit(s.x));
        return task(async (c) => {
          const start = c.get();
          let last = start.swing;
          // The learner wins: if anything else changes x or the swing, stop here.
          const isSame = () => c.get().x === start.x && c.get().swing === last;
          const isDone = await glide(c.wait, over, start.swing, (swing) => {
            if (!isSame()) return false;
            c.set({ swing });
            last = swing;
            return true;
          });
          if (!isDone || !isSame()) return;
          c.set({ swing: 1 });
          const landed = landedEmit(start.x);
          c.emit(landed.signal, landed.payload);
        });
      },
    }),
    startAgain: act({
      describe: "Fold away the swing and the proof. Keeps x.",
      args: z.object({}).strict(),
      run: () => set({ swing: 0, isProofShown: false }),
    }),
  },
  signals: {
    [RootSemicircleSignal.Landed]: { describe: "BD has landed on the line: E is at √x" },
  },
  parts,
  locate,
});

/** OD and OB as text, exactly (x in tenths makes them whole hundredths). */
export function proofTexts(x: number): { od: string; ob: string; x: string } {
  const tenths = toTenths(x);
  return {
    od: hundredthsText((tenths + 10) * 5),
    ob: hundredthsText(Math.abs(tenths - 10) * 5),
    x: tenthsText(tenths),
  };
}
