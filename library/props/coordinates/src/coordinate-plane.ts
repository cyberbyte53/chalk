import { PropRole } from "@chalk/prop";
import { prop } from "@chalk/prop";
import { z } from "zod";
import { areCluesOn } from "./clues";
import { clues } from "./clues";
import { crowd, isCrowdOn } from "./crowd";
import { isDiceOn } from "./dice";
import { dice } from "./dice";
import { isParabolaOn, parabola } from "./parabola";
import { Choosing, arePlacesOn } from "./places";
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
    "A plane located by two perpendicular lines, drawn only as far as the lesson has defined it: a town's main road and a street counted from 1, a sheet's edges, or the x- and y-axes as number lines crossing at O, with their directions and quadrants. On it: places (houses, desks, crossings, stalls) with a target to find; a walker who goes along the first line, then up or down the second, on the lines only, so two numbers in order reach one place; clues that narrow where a hidden point can be; a point read off the axes as its abscissa, ordinate and (x, y); pairs to plot at a chosen scale; the dice game; and a parabola y = a(x − α)(x − β) held by its zeroes, meeting the x-axis twice, once or not at all.",
  children: { plane, reading, places, walker, clues, plotting, dice, crowd, parabola },
  // Whether the board is open for play (its point made), for the parts whose play opens then.
  needs: z.object({ isOpen: z.boolean() }).strict(),
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
    backdrop: (me) => me.plane.backdrop,
    // The frame a point is read in: where the axes cross on the sheet, and how far they are turned.
    shift: (me) => me.plane.shift,
    turn: (me) => me.plane.turn,
    // Where Riya is headed: the places'.
    target: (me) => me.places.target,
    targetName: (me) => me.places.targetName,
    canChooseTarget: (me) => arePlacesOn(me.places) && me.places.canChoose,
    // The plane's: nothing else on it, so a tap names its parts; its numbers light the places.
    // Places no one can choose (a town drawn behind the axes) leave the taps to the plane.
    isAlone: (me) =>
      !(arePlacesOn(me.places) && me.places.choosing !== Choosing.Never) &&
      !isPlottingOn(me.plotting) &&
      !areCluesOn(me.clues) &&
      !isDiceOn(me.dice) &&
      !isParabolaOn(me.parabola),
    canTapNumbers: (me) => arePlacesOn(me.places),
    lit: (me) => me.places.lit,
    // The clues': the unit a page's ruler reads in, and a tap is theirs once nothing is left to plot.
    unit: (me) => me.reading.unit,
    isPlaneFree: (me) =>
      !isPlottingOn(me.plotting) || me.plotting.plotted.length >= me.plotting.toPlot.length,
  },
  hear: {
    // In free play (a house chosen once the board is open), another house is a new walk, from her
    // start. (The first is only marked: she may be on her way to it.) Where a tap only marks a place
    // (a stall opened where she stands), she stays.
    "places.targetChosen": (me, p, t) =>
      p.isAnother && me.places.choosing === Choosing.OnceOpen && t.to.walker.backToStart(),
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
    crowd: (me) => isCrowdOn(me.crowd),
    parabola: (me) => isParabolaOn(me.parabola),
  },
  summary: (me) =>
    `the coordinate plane from ${me.window.xMin} to ${me.window.xMax} across and ${me.window.yMin} to ${me.window.yMax} up`,
  layout: {
    kind: "frame",
    provider: "plane",
    children: ["reading", "places", "walker", "clues", "plotting", "dice", "crowd", "parabola"],
    order: {
      above: ["places", "clues", "plotting"],
      back: ["plane", "walker", "clues"],
      on: ["plane", "clues", "plotting", "places", "walker", "parabola"],
      // The plane's named points over Riya, so the mark she has just made stays in view.
      front: ["plane", "plotting", "clues", "dice", "reading", "crowd", "parabola"],
      below: ["plane", "reading", "walker", "plotting", "dice", "crowd", "parabola"],
      controls: ["walker", "places", "plane", "reading", "clues", "plotting", "dice", "parabola"],
    },
  },
});
