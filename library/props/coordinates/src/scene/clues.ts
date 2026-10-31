import { PropRole } from "@chalk/prop";
import { action, prop, signal } from "@chalk/prop";
import { z } from "zod";
import { clueSchema, cluesReads, stillPossible } from "../clues";
import { pointSchema } from "../plane";

/**
 * The clues, on the event model: a hidden point, and clues that each narrow where it can be. What
 * it decides by but doesn't own (the plane's window, the reading's unit, whether a tap on the plane
 * is its to take) it needs from the coordinate plane.
 */

export const clues = prop({
  type: "sceneClues",
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
