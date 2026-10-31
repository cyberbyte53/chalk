import { localizedSchema } from "@chalk/content";
import { PropRole, action, prop, signal } from "@chalk/prop";
import { z } from "zod";
import {
  type PlaneCore,
  type PlaneWindow,
  type Point,
  fromPlane,
  pointSchema,
  windowSchema,
} from "./plane";

/**
 * A clue about where a point is: words, and what they allow. A region ("upper half"), one distance
 * (every point with x = 5: a whole line), or both distances (one point).
 */
export const clueSchema = z
  .object({
    words: localizedSchema,
    region: windowSchema.optional(),
    x: z.number().optional(),
    y: z.number().optional(),
  })
  .strict();
export type Clue = z.infer<typeof clueSchema>;

/** The plane's fields it draws or decides by. */
export const cluesReads = fromPlane("window");

export type CluesState = Pick<PlaneCore, (typeof cluesReads.keys)[number]> & {
  unit: string;
  isPlaneFree: boolean;
  hidden: Point | null;
  clueChoices: Clue[];
  given: number[];
  isHiddenShown: boolean;
  canHide: boolean;
  canGiveClues: boolean;
};

/**
 * Where the point could still be after these clues: anywhere in the window, a region, a line
 * (x = 5, or y = 0), one point, or nowhere (clues that disagree).
 */
export type Still =
  | { kind: "anywhere" }
  | { kind: "region"; region: PlaneWindow }
  | { kind: "line"; axis: "x" | "y"; value: number; region: PlaneWindow }
  | { kind: "point"; x: number; y: number }
  | { kind: "nowhere" };

export function stillPossible(
  s: Pick<CluesState, "window" | "clueChoices">,
  given: readonly number[],
): Still {
  let r: PlaneWindow = { ...s.window };
  let x: number | undefined;
  let y: number | undefined;
  for (const g of given) {
    const c = s.clueChoices[g];
    if (c === undefined) continue;
    if (c.region !== undefined)
      r = {
        xMin: Math.max(r.xMin, c.region.xMin),
        xMax: Math.min(r.xMax, c.region.xMax),
        yMin: Math.max(r.yMin, c.region.yMin),
        yMax: Math.min(r.yMax, c.region.yMax),
      };
    if (c.x !== undefined) {
      if (x !== undefined && x !== c.x) return { kind: "nowhere" };
      x = c.x;
    }
    if (c.y !== undefined) {
      if (y !== undefined && y !== c.y) return { kind: "nowhere" };
      y = c.y;
    }
  }
  if (r.xMin > r.xMax || r.yMin > r.yMax) return { kind: "nowhere" };
  const isIn = (v: number, lo: number, hi: number) => v >= lo && v <= hi;
  if (x !== undefined && !isIn(x, r.xMin, r.xMax)) return { kind: "nowhere" };
  if (y !== undefined && !isIn(y, r.yMin, r.yMax)) return { kind: "nowhere" };
  if (x !== undefined && y !== undefined) return { kind: "point", x, y };
  if (x !== undefined) return { kind: "line", axis: "x", value: x, region: r };
  if (y !== undefined) return { kind: "line", axis: "y", value: y, region: r };
  const isWhole =
    r.xMin === s.window.xMin &&
    r.xMax === s.window.xMax &&
    r.yMin === s.window.yMin &&
    r.yMax === s.window.yMax;
  return isWhole ? { kind: "anywhere" } : { kind: "region", region: r };
}

/** Whether it is drawn on the plane. */
export const areCluesOn = (s: Pick<CluesState, "clueChoices">) => s.clueChoices.length > 0;

/**
 * The clues: a hidden point, and clues that each narrow where it can be. What
 * it decides by but doesn't own (the plane's window, the reading's unit, whether a tap on the plane
 * is its to take) it needs from the coordinate plane.
 */
export const clues = prop({
  type: "clues",
  role: PropRole.Explainer,
  // Where the hidden point is: the answer, never on screen until shown.
  offScreen: ["hidden"],
  describe:
    'A hidden point and clues about it. Each clue given shades where the point could still be: words like "upper half" leave a region, one distance a whole line, two distances one point. Without a hidden point, a clue alone shows every point it describes (every point with y = 0: the x-axis).',
  variables: z
    .object({
      /** The point no one sees, or null. */
      hidden: pointSchema.nullable(),
      /** The clues offered as buttons, from the lesson. */
      clueChoices: z.array(clueSchema).max(6),
      /** The clues given so far, by their place in `clueChoices`. */
      given: z.array(z.number().int().min(0).max(5)).max(6),
      isHiddenShown: z.boolean(),
      /** Whether the learner can hide a point of their own (a tap). */
      canHide: z.boolean(),
      /** Whether the clues are buttons; off for a picture of clues already given (nothing to tap). */
      canGiveClues: z.boolean(),
    })
    .strict(),
  start: {
    hidden: null,
    clueChoices: [],
    given: [],
    isHiddenShown: false,
    canHide: false,
    canGiveClues: true,
  },
  needs: z
    .object({
      ...cluesReads.fields,
      /** Written after a distance in a clue ("30 m"), as the point's reading has it. */
      unit: z.string().max(4),
      /** A tap on the plane is the clues' to take (on the coordinate plane, unless pairs are being plotted). */
      isPlaneFree: z.boolean(),
    })
    .strict(),
  facts: { still: (me) => stillPossible(me, me.given) },
  actions: {
    giveClue: action(
      { clue: z.number().int().min(0).max(5) },
      {
        from: "screen",
        describe:
          "Give a clue, by its place among the choices; where the point could be narrows (the learner's button)",
      },
    ),
    clearClues: action({}, { from: "screen", describe: "Take back every clue (the learner's ↺)" }),
    hideAt: action(pointSchema.shape, {
      from: "screen",
      describe:
        "Hide a point of the learner's own at (x, y), for the others to find (the learner's tap)",
    }),
    showHidden: action({}, { from: "screen", describe: "Show the hidden point" }),
  },
  signals: {
    clueGiven: signal({ still: z.enum(["anywhere", "region", "line", "point", "nowhere"]) }),
    pinned: signal(pointSchema.shape),
  },
  on: {
    giveClue: (me, { clue }, t) => {
      if (clue >= me.clueChoices.length || me.given.includes(clue)) return;
      const given = [...me.given, clue];
      const still = stillPossible(me, given);
      return [
        t.set({ given }),
        t.tell.clueGiven({ still: still.kind }),
        ...(still.kind === "point" ? [t.tell.pinned({ x: still.x, y: still.y })] : []),
      ];
    },
    clearClues: (_, __, t) => t.set({ given: [], isHiddenShown: false }),
    hideAt: (me, p, t) =>
      me.canHide && t.set({ hidden: { x: p.x, y: p.y }, given: [], isHiddenShown: false }),
    showHidden: (me, _, t) => me.hidden !== null && t.set({ isHiddenShown: true }),
  },
  invariant: (s) =>
    s.given.some((g) => g >= s.clueChoices.length)
      ? "a clue given is not among the choices"
      : undefined,
});
