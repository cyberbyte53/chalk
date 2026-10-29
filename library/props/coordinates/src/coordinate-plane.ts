import { PropRole, defineHost } from "@chalk/prop";
import { clues } from "./clues";
import { dice } from "./dice";
import { places } from "./places";
import { core, planeFrame } from "./plane";
import { plotting } from "./plotting";
import { reading } from "./reading";
import { walker } from "./walker";

/**
 * The coordinate plane, from a town's streets to graph paper. Its core is two perpendicular lines
 * and their marks, drawn only as far as the lesson has defined them; everything else is a layer a
 * board turns on: places, a walker, clues, a point to read, pairs to plot, the dice game.
 */
export const coordinatePlane = defineHost({
  type: "coordinatePlane",
  role: PropRole.Explainer,
  describe:
    "A plane located by two perpendicular lines, drawn only as far as the lesson has defined it: a town's main road and a street counted from 1, a sheet's edges, or the x- and y-axes as number lines crossing at O, with their directions and quadrants. On it: places (houses, desks, crossings, stalls) with a target to find; a walker who goes along the first line, then up or down the second, on the lines only, so two numbers in order reach one place; clues that narrow where a hidden point can be; a point read off the axes as its abscissa, ordinate and (x, y); pairs to plot at a chosen scale; and the dice game.",
  frame: planeFrame,
  core,
  layers: [reading, places, walker, clues, plotting, dice],
  summary: (s) =>
    `the coordinate plane from ${s.window.xMin} to ${s.window.xMax} across and ${s.window.yMin} to ${s.window.yMax} up`,
});
