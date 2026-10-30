import { PropRole, defineGroup } from "@chalk/prop";
import { areCluesOn, clues, cluesReads } from "./clues";
import { dice, isDiceOn } from "./dice";
import { arePlacesOn, places, placesReads } from "./places";
import { plane } from "./plane";
import { isPlottingOn, plotting, plottingReads } from "./plotting";
import { isReadingOn, reading, readingReads } from "./reading";
import { isWalkerOn, walker, walkerReads } from "./walker";

/** Some of an object's fields. */
const pick = <T, K extends keyof T>(o: T, keys: readonly K[]): Pick<T, K> =>
  Object.fromEntries(keys.map((k) => [k, o[k]])) as Pick<T, K>;

/**
 * The coordinate plane, from a town's streets to graph paper: the plane (two perpendicular lines
 * and their marks, drawn only as far as the lesson has defined them) and the parts a board puts on
 * it: places, a walker, clues, a point to read, pairs to plot, the dice game.
 *
 * Each part keeps its own fields and knows nothing of the others; this is where they meet. The
 * plane's fields a part draws by are passed down to it (`is`), as are the places' target to the
 * walker; what one part does that another answers is a signal here (`when`): a new target sends
 * the walker back to her start.
 */
export const coordinatePlane = defineGroup({
  type: "coordinatePlane",
  role: PropRole.Explainer,
  describe:
    "A plane located by two perpendicular lines, drawn only as far as the lesson has defined it: a town's main road and a street counted from 1, a sheet's edges, or the x- and y-axes as number lines crossing at O, with their directions and quadrants. On it: places (houses, desks, crossings, stalls) with a target to find; a walker who goes along the first line, then up or down the second, on the lines only, so two numbers in order reach one place; clues that narrow where a hidden point can be; a point read off the axes as its abscissa, ordinate and (x, y); pairs to plot at a chosen scale; and the dice game.",
  children: { plane, reading, places, walker, clues, plotting, dice },
  is: {
    plane: (s) => ({
      isAlone:
        !arePlacesOn(s.places) &&
        !isPlottingOn(s.plotting) &&
        !areCluesOn(s.clues) &&
        !isDiceOn(s.dice),
      canTapNumbers: arePlacesOn(s.places),
      lit: s.places.lit,
    }),
    reading: (s) => pick(s.plane, readingReads.keys),
    places: (s) => pick(s.plane, placesReads.keys),
    walker: (s) => ({
      ...pick(s.plane, walkerReads.keys),
      target: s.places.target,
      targetName: s.places.targetName,
      canChooseTarget: arePlacesOn(s.places) && s.places.canChooseTarget,
    }),
    clues: (s) => ({ ...pick(s.plane, cluesReads.keys), unit: s.reading.unit }),
    plotting: (s) => pick(s.plane, plottingReads.keys),
  },
  show: {
    reading: (s) => isReadingOn(s.reading),
    places: (s) => arePlacesOn(s.places),
    walker: (s) => isWalkerOn(s.walker),
    clues: (s) => areCluesOn(s.clues),
    plotting: (s) => isPlottingOn(s.plotting),
    dice: (s) => isDiceOn(s.dice),
  },
  when: {
    // Another house, once one was chosen, is a new walk, from her start. (The first one is only
    // marked: she may be on her way to it.)
    places: {
      targetChosen: (_s, p, run) => (p.isAnother === true ? [run.walker.backToStart()] : []),
    },
    plane: {
      numberTapped: (_s, p, run) => [
        run.places.lightLine({ axis: p.axis as "x" | "y", value: p.value as number }),
      ],
    },
    plotting: { scaleChosen: (_s, p, run) => [run.plane.setScale({ every: p.every as number })] },
  },
  summary: (s) =>
    `the coordinate plane from ${s.plane.window.xMin} to ${s.plane.window.xMax} across and ${s.plane.window.yMin} to ${s.plane.window.yMax} up`,
  layout: {
    kind: "frame",
    provider: "plane",
    children: ["reading", "places", "walker", "clues", "plotting", "dice"],
    order: {
      above: ["places", "clues", "plotting"],
      back: ["plane", "walker", "clues"],
      // The next pair to plot over a hidden point's tap: plotting on top.
      on: ["plane", "clues", "plotting", "places", "walker"],
      // The plane's named points over Riya, so the mark she has just made stays in view.
      front: ["plane", "plotting", "clues", "dice", "reading"],
      below: ["plane", "walker", "plotting", "dice"],
      controls: ["walker", "places", "plane", "reading", "clues", "plotting", "dice"],
    },
  },
});
