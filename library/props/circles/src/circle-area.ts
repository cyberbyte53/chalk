import { type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { clean } from "./kit/geometry";
import { type PiValue, piOf, piValue } from "./pi";

/**
 * Circumference and area of a circle (NCERT 12.2, Fig 12.2).
 * - roll: the wheel rolls once along the road and its rim unrolls into a straight line 2πr long.
 * - slices: the disc is cut into equal sectors (pizza slices) that rearrange, alternately point up
 *   and point down, into a near-rectangle πr long and r high, so its area is πr × r = πr². More
 *   slices make it closer to a rectangle.
 * Lengths are in cm; the centre is the origin.
 */

export const CircleAreaMode = { Roll: "roll", Slices: "slices" } as const;
export type CircleAreaMode = (typeof CircleAreaMode)[keyof typeof CircleAreaMode];

export const CircleAreaAction = {
  Roll: "roll",
  SetSlices: "setSlices",
  Arrange: "arrange",
  SetMode: "setMode",
} as const;
export const CircleAreaSignal = {
  Changed: "changed",
  Rolled: "rolled",
  Arranged: "arranged",
} as const;
export const CircleAreaDerived = {
  Circumference: "circumference",
  Area: "area",
  RectLength: "rectLength",
  Unrolled: "unrolled",
} as const;
export const CircleAreaPart = {
  Figure: "figure",
  Readout: "readout",
  Roll: "roll",
  Slices: "slices",
  Arrange: "arrange",
} as const;

const SLICE_COUNTS = [4, 6, 8, 12, 16, 24, 32] as const;

const circleAreaState = z
  .object({
    mode: z.nativeEnum(CircleAreaMode),
    /** The radius in cm. */
    r: z.number().min(0.5).max(100),
    /** roll: how much of one turn has rolled, in eighths (0 to 8). */
    rolled: z.number().int().min(0).max(8),
    /** slices: how many equal sectors the disc is cut into (an even number from the list 4…32). */
    slices: z.number().int().min(4).max(32),
    /** slices: whether the slices are laid out as the near-rectangle. */
    isArranged: z.boolean(),
    pi: piValue,
    canChange: z.boolean(),
    /** Write the formulae and the numbers. */
    showWorking: z.boolean(),
  })
  .strict();
export type CircleAreaState = z.infer<typeof circleAreaState>;

export const circumferenceOf = (s: Pick<CircleAreaState, "r" | "pi">): number =>
  clean(2 * piOf(s.pi) * s.r);
export const areaOf = (s: Pick<CircleAreaState, "r" | "pi">): number =>
  clean(piOf(s.pi) * s.r * s.r);
/** The long side of the near-rectangle: half the circumference. */
export const rectLengthOf = (s: Pick<CircleAreaState, "r" | "pi">): number =>
  clean(piOf(s.pi) * s.r);
/** How much of the rim has unrolled so far, in cm. */
export const unrolledOf = (s: Pick<CircleAreaState, "r" | "pi" | "rolled">): number =>
  clean((circumferenceOf(s) * s.rolled) / 8);

/** Where slice i sits and points, in model units: its apex and the direction (degrees) of its middle. */
export function sliceOf(
  s: Pick<CircleAreaState, "r" | "slices" | "isArranged">,
  i: number,
): { apex: [number, number]; angle: number; width: number } {
  const n = s.slices;
  const width = 360 / n;
  if (!s.isArranged) return { apex: [0, 0], angle: i * width + width / 2, width };
  const arc = (2 * Math.PI * s.r) / n;
  const left = (-Math.PI * s.r) / 2;
  if (i % 2 === 0) {
    const k = i / 2;
    return { apex: [left + (k + 0.5) * arc, s.r / 2], angle: 270, width };
  }
  const k = (i - 1) / 2;
  return { apex: [left + (k + 1) * arc, -s.r / 2], angle: 90, width };
}

const act = actionsFor<CircleAreaState>();

export const circleArea = defineProp({
  type: "circleArea",
  describe:
    "Circumference and area of a circle (NCERT 12.2, Fig 12.2). In roll mode a wheel of radius r rolls along a road one eighth of a turn per tap; its rim unrolls into a straight line, and after one full turn the line is the circumference, 2πr. In slices mode the disc is cut into 4 to 32 equal sectors (pizza slices) that rearrange, alternately pointing up and down, into a near-rectangle πr long (half the circumference) and r high, so the area is πr × r = πr²; more slices make it closer to a true rectangle. Uses π = 22/7, 3.14 or the exact value. Lengths in cm.",
  state: circleAreaState,
  defaults: {
    mode: CircleAreaMode.Slices,
    r: 7,
    rolled: 0,
    slices: 8,
    isArranged: false,
    pi: "22/7" as PiValue,
    canChange: true,
    showWorking: true,
  },
  inputs: ["canChange", "showWorking"],
  invariant: (s) =>
    (SLICE_COUNTS as readonly number[]).includes(s.slices)
      ? undefined
      : `slices must be one of ${SLICE_COUNTS.join(", ")}`,
  derived: {
    [CircleAreaDerived.Circumference]: { describe: "2πr, in cm", compute: circumferenceOf },
    [CircleAreaDerived.Area]: { describe: "πr², in cm²", compute: areaOf },
    [CircleAreaDerived.RectLength]: {
      describe:
        "The long side of the near-rectangle the slices make: πr, half the circumference (cm)",
      compute: rectLengthOf,
    },
    [CircleAreaDerived.Unrolled]: {
      describe: "How much of the rim has unrolled onto the road, in cm",
      compute: unrolledOf,
    },
  },
  actions: {
    [CircleAreaAction.Roll]: act({
      describe: "Roll the wheel an eighth of a turn forward (by: 1) or back (by: −1)",
      byLearner: true,
      args: z.object({ by: z.union([z.literal(1), z.literal(-1)]) }).strict(),
      run: (s, a) => {
        if (!s.canChange) return set({});
        const rolled = Math.min(8, Math.max(0, s.rolled + a.by));
        if (rolled === s.rolled) return set({});
        const out: Emit[] = [
          {
            signal: CircleAreaSignal.Changed,
            payload: { rolled, unrolled: unrolledOf({ ...s, rolled }) },
          },
        ];
        if (rolled === 8)
          out.push({
            signal: CircleAreaSignal.Rolled,
            payload: { circumference: circumferenceOf(s) },
          });
        return set({ rolled }, ...out);
      },
    }),
    [CircleAreaAction.SetSlices]: act({
      describe:
        "Cut the disc into more slices (by: 1) or fewer (by: −1): 4, 6, 8, 12, 16, 24 or 32",
      byLearner: true,
      args: z.object({ by: z.union([z.literal(1), z.literal(-1)]) }).strict(),
      run: (s, a) => {
        if (!s.canChange) return set({});
        const i = SLICE_COUNTS.indexOf(s.slices as (typeof SLICE_COUNTS)[number]);
        const slices = SLICE_COUNTS[
          Math.min(SLICE_COUNTS.length - 1, Math.max(0, i + a.by))
        ] as number;
        if (slices === s.slices) return set({});
        return set({ slices }, { signal: CircleAreaSignal.Changed, payload: { slices } });
      },
    }),
    [CircleAreaAction.Arrange]: act({
      describe: "Lay the slices out as a near-rectangle, or put them back into the circle",
      byLearner: true,
      args: z.object({ isArranged: z.boolean().optional() }).strict(),
      run: (s, a) => {
        if (!s.canChange) return set({});
        const isArranged = a.isArranged ?? !s.isArranged;
        if (isArranged === s.isArranged) return set({});
        return set(
          { isArranged },
          ...(isArranged
            ? [
                {
                  signal: CircleAreaSignal.Arranged,
                  payload: { slices: s.slices, length: rectLengthOf(s), height: s.r },
                },
              ]
            : []),
        );
      },
    }),
    [CircleAreaAction.SetMode]: act({
      describe: "Show the rolling wheel (circumference) or the slices (area)",
      args: z.object({ mode: z.nativeEnum(CircleAreaMode) }).strict(),
      run: (_s, a) => set({ mode: a.mode }),
    }),
  },
});
