import { PropRole } from "@chalk/prop";
import { prop } from "@chalk/prop";
import { areCluesOn } from "./clues";
import { clues } from "./clues";
import { isDiceOn } from "./dice";
import { dice } from "./dice";
import { arePlacesOn } from "./places";
import { places } from "./places";
import { plane } from "./plane";
import { isPlottingOn } from "./plotting";
import { plotting } from "./plotting";
import { isReadingOn } from "./reading";
import { reading } from "./reading";
import { isWalkerOn } from "./walker";
import { walker } from "./walker";

/**
 * The coordinate plane: the plane and the parts a board puts on it (places, a
 * walker, clues, a point to read, pairs to plot, the dice game). Each part knows nothing of the
 * others; this is where they meet:
 *
 * - its facts are what the parts need, under the names they need them by (the plane's window and
 *   streets, the places' target), so each part is given them by name, read live;
 * - what one part does that another answers is heard here: another house sends Riya back.
 */
export const coordinatePlane = prop({
  type: "coordinatePlane",
  role: PropRole.Explainer,
  describe:
    "A plane located by two perpendicular lines, drawn only as far as the lesson has defined it: a town's main road and a street counted from 1, a sheet's edges, or the x- and y-axes as number lines crossing at O, with their directions and quadrants. On it: places (houses, desks, crossings, stalls) with a target to find; a walker who goes along the first line, then up or down the second, on the lines only, so two numbers in order reach one place; clues that narrow where a hidden point can be; a point read off the axes as its abscissa, ordinate and (x, y); pairs to plot at a chosen scale; and the dice game.",
  children: { plane, reading, places, walker, clues, plotting, dice },
  facts: {
    // The plane's, for every part that draws or decides by them.
    window: (me) => me.plane.window,
    upLines: (me) => me.plane.upLines,
    rising: (me) => me.plane.rising,
    axes: (me) => me.plane.axes,
    marks: (me) => me.plane.marks,
    axisNames: (me) => me.plane.axisNames,
    scene: (me) => me.plane.scene,
    tickEvery: (me) => me.plane.tickEvery,
    // Where Riya is headed: the places'.
    target: (me) => me.places.target,
    targetName: (me) => me.places.targetName,
    canChooseTarget: (me) => arePlacesOn(me.places) && me.places.canChooseTarget,
    // The plane's: nothing else on it, so a tap names its parts; its numbers light the places.
    isAlone: (me) =>
      !arePlacesOn(me.places) &&
      !isPlottingOn(me.plotting) &&
      !areCluesOn(me.clues) &&
      !isDiceOn(me.dice),
    canTapNumbers: (me) => arePlacesOn(me.places),
    lit: (me) => me.places.lit,
    // The clues': the unit a page's ruler reads in, and a tap is theirs once nothing is left to plot.
    unit: (me) => me.reading.unit,
    isPlaneFree: (me) =>
      !isPlottingOn(me.plotting) || me.plotting.plotted.length >= me.plotting.toPlot.length,
  },
  hear: {
    // Another house, once one was chosen, is a new walk, from her start. (The first is only marked:
    // she may be on her way to it.)
    "places.targetChosen": (_, p, t) => p.isAnother && t.to.walker.backToStart(),
    "plane.numberTapped": (_, p, t) =>
      t.to.places.lightLine({ axis: p.axis, value: p.value, isTap: true }),
    "plotting.scaleChosen": (_, p, t) => t.to.plane.setScale({ every: p.every }),
  },
  show: {
    reading: (me) => isReadingOn(me.reading),
    places: (me) => arePlacesOn(me.places),
    walker: (me) => isWalkerOn(me.walker),
    clues: (me) => areCluesOn(me.clues),
    plotting: (me) => isPlottingOn(me.plotting),
    dice: (me) => isDiceOn(me.dice),
  },
  summary: (me) =>
    `the coordinate plane from ${me.window.xMin} to ${me.window.xMax} across and ${me.window.yMin} to ${me.window.yMax} up`,
  layout: {
    kind: "frame",
    provider: "plane",
    children: ["reading", "places", "walker", "clues", "plotting", "dice"],
    order: {
      above: ["places", "clues", "plotting"],
      back: ["plane", "walker", "clues"],
      on: ["plane", "clues", "plotting", "places", "walker"],
      // The plane's named points over Riya, so the mark she has just made stays in view.
      front: ["plane", "plotting", "clues", "dice", "reading"],
      below: ["plane", "walker", "plotting", "dice"],
      controls: ["walker", "places", "plane", "reading", "clues", "plotting", "dice"],
    },
  },
});
