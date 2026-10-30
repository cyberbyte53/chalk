import { localizedSchema } from "@chalk/content";
import { type Emit, PropRole, actionsFor, defineProp, raise, set, signal } from "@chalk/prop";
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

const act = actionsFor<CluesState>();
const none = z.object({}).strict();

export const cluesSignals = {
  clueGiven: signal(
    "A clue was given; what is still possible: `still` (anywhere, a region, a line or one point)",
  ),
  pinned: signal("The clues leave one point: (`x`, `y`)"),
};

/** Whether it is drawn on the plane. */
export const areCluesOn = (s: Pick<CluesState, "clueChoices">) => s.clueChoices.length > 0;

export const clues = defineProp({
  type: "planeClues",
  role: PropRole.Explainer,
  drawsOn: "plane",
  describe:
    'A hidden point and clues about it. Each clue given shades where the point could still be: words like "upper half" leave a region, one distance a whole line, two distances one point. Without a hidden point, a clue alone shows every point it describes (every point with y = 0: the x-axis).',
  state: z
    .object({
      ...cluesReads.fields,
      /** Written after a distance in a clue ("30 m"), as the point's reading has it. */
      unit: z.string().max(4),
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
  defaults: {
    ...cluesReads.defaults,
    unit: "",
    hidden: null,
    clueChoices: [],
    given: [],
    isHiddenShown: false,
    canHide: false,
    canGiveClues: true,
  },
  offScreen: ["hidden"],
  actions: {
    giveClue: act({
      describe:
        "Give a clue, by its place among the choices; where the point could be narrows (the learner's button)",
      byLearner: true,
      args: z.object({ clue: z.number().int().min(0).max(5) }).strict(),
      changes: ["given"],
      run: (s, { clue }) => {
        if (clue >= s.clueChoices.length || s.given.includes(clue)) return set({});
        const given = [...s.given, clue];
        const still = stillPossible(s, given);
        const emit: Emit[] = [raise(cluesSignals.clueGiven, { still: still.kind })];
        if (still.kind === "point")
          emit.push(raise(cluesSignals.pinned, { x: still.x, y: still.y }));
        return set({ given }, ...emit);
      },
    }),
    clearClues: act({
      describe: "Take back every clue (the learner's ↺)",
      byLearner: true,
      args: none,
      changes: ["given", "isHiddenShown"],
      run: () => set({ given: [], isHiddenShown: false }),
    }),
    hideAt: act({
      describe:
        "Hide a point of the learner's own at (x, y), for the others to find (the learner's tap)",
      byLearner: true,
      args: pointSchema,
      changes: ["hidden", "given", "isHiddenShown"],
      run: (s, p) =>
        s.canHide ? set({ hidden: { x: p.x, y: p.y }, given: [], isHiddenShown: false }) : set({}),
    }),
    showHidden: act({
      describe: "Show the hidden point",
      byLearner: true,
      reveals: true,
      args: none,
      changes: ["isHiddenShown"],
      run: (s) => (s.hidden === null ? set({}) : set({ isHiddenShown: true })),
    }),
  },
  signals: cluesSignals,
  derived: {
    still: {
      describe: "Where the point could still be: anywhere, a region, a line, one point, or nowhere",
      compute: (s) => stillPossible(s, s.given),
    },
  },
  invariant: (s) =>
    s.given.some((g) => g >= s.clueChoices.length)
      ? "a clue given is not among the choices"
      : undefined,
});
