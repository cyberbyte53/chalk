import { localizedSchema } from "@chalk/content";
import { actionsFor, layersFor, set, signal } from "@chalk/prop";
import { z } from "zod";
import { type PlaneCore, type Point, pointSchema, windowSchema } from "./plane";

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

export type CluesState = PlaneCore & {
  hidden: Point | null;
  clueChoices: Clue[];
  given: number[];
  isHiddenShown: boolean;
  canHide: boolean;
};

const act = actionsFor<CluesState>();
const none = z.object({}).strict();

export const cluesSignals = {
  clueGiven: signal(
    "A clue was given; what is still possible: `still` (anywhere, a region, a line or one point)",
  ),
  pinned: signal("The clues leave one point: (`x`, `y`)"),
};

export const clues = layersFor<CluesState>()({
  name: "clues",
  frame: "plane",
  describe:
    'A hidden point and clues about it. Each clue given shades where the point could still be: words like "upper half" leave a region, one distance a whole line, two distances one point. Without a hidden point, a clue alone shows every point it describes (every point with y = 0: the x-axis).',
  fields: {
    /** The point no one sees, or null. */
    hidden: pointSchema.nullable(),
    /** The clues offered as buttons, from the lesson. */
    clueChoices: z.array(clueSchema).max(6),
    /** The clues given so far, by their place in `clueChoices`. */
    given: z.array(z.number().int().min(0).max(5)).max(6),
    isHiddenShown: z.boolean(),
    /** Whether the learner can hide a point of their own (a tap). */
    canHide: z.boolean(),
  },
  defaults: {
    hidden: null,
    clueChoices: [],
    given: [],
    isHiddenShown: false,
    canHide: false,
  },
  offScreen: ["hidden"],
  isOn: (s) => s.clueChoices.length > 0,
  actions: {
    giveClue: act({
      describe:
        "Give a clue, by its place among the choices; where the point could be narrows (the learner's button)",
      byLearner: true,
      args: z.object({ clue: z.number().int().min(0).max(5) }).strict(),
      changes: ["given"],
      run: () => set({}),
    }),
    clearClues: act({
      describe: "Take back every clue (the learner's ↺)",
      byLearner: true,
      args: none,
      changes: ["given", "isHiddenShown"],
      run: () => set({}),
    }),
    hideAt: act({
      describe:
        "Hide a point of the learner's own at (x, y), for the others to find (the learner's tap)",
      byLearner: true,
      args: pointSchema,
      changes: ["hidden", "given", "isHiddenShown"],
      run: () => set({}),
    }),
    showHidden: act({
      describe: "Show the hidden point",
      byLearner: true,
      reveals: true,
      args: none,
      changes: ["isHiddenShown"],
      run: () => set({}),
    }),
  },
  signals: cluesSignals,
  invariant: (s) =>
    s.given.some((g) => g >= s.clueChoices.length)
      ? "a clue given is not among the choices"
      : undefined,
});
