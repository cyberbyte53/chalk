import { type AnyProp, Place, PropRole, givenOf, prop } from "@chalk/prop";
import { z } from "zod";
import type { Part } from "./part";
import { PARTS } from "./parts";
import { Choosing, TARGET_NAME } from "./places";
import { plane } from "./plane";

// The parts (parts.ts). Nothing in this file names a part except where the plane answers that
// part in particular (its facts and `hear` below).
type Parts = typeof PARTS;
type PartName = keyof Parts & string;
const NAMES = Object.keys(PARTS) as PartName[];
// The parts' entries, read without their own types: what every part has in common.
const ENTRIES = PARTS as unknown as Readonly<Record<PartName, Part<AnyProp, unknown>>>;

/** The plane's own turns round its picture; the parts' are in their entries. */
const PLANE_TURNS: Part["turns"] = { back: 10, on: 10, front: 10, below: 10, controls: 30 };

/** Who draws in each place, by turn: the plane and every part with a turn there. */
const order = Object.fromEntries(
  Object.values(Place).map((place) => [
    place,
    [
      ...(PLANE_TURNS[place] === undefined ? [] : [["plane", PLANE_TURNS[place]] as const]),
      ...NAMES.flatMap((n) => {
        const turn = ENTRIES[n].turns[place];
        return turn === undefined ? [] : [[n, turn] as const];
      }),
    ]
      .sort((a, b) => a[1] - b[1])
      .map(([n]) => n),
  ]),
) as { [P in Place]: ("plane" | PartName)[] };

/** Each part's prop, by its name: the plane's children besides the plane. */
const propsOf = <P extends Readonly<Record<string, Part<AnyProp, never>>>>(p: P) =>
  Object.fromEntries(Object.entries(p).map(([n, e]) => [n, e.prop])) as {
    [K in keyof P]: P[K]["prop"];
  };

/** A part's state, as the plane reads it. */
const stateOf = (me: object, n: PartName) => (me as Record<PartName, unknown>)[n];
/**
 * Whether a board uses a part: its setup names it (`{ walker: {…} }`, `{ dice: {} }`). A part a
 * board doesn't use is never drawn, never answered and never read here, so nothing of its code
 * reaches that board (platform/docs/plans/adding-parts.md).
 */
const uses = (me: object, n: PartName) => givenOf(me).has(n);
/** A part is on when the board uses it and it has something to show. */
const isOn = (me: object, n: PartName) => uses(me, n) && ENTRIES[n].isOn(stateOf(me, n));

/**
 * The coordinate plane: the plane and the parts a board puts on it (PARTS). Each part knows
 * nothing of the others; this is where they meet:
 *
 * - its facts are what the parts need, under the names they need them by (the plane's window and
 *   streets, the places' target), so each part is given them by name, read live;
 * - what one part does that another answers is heard here: another house sends Riya back.
 */
export const coordinatePlane = prop({
  type: "coordinatePlane",
  role: PropRole.Explainer,
  describe: `A plane located by two perpendicular lines, drawn only as far as the lesson has defined it: a town's main road and a street counted from 1, a sheet's edges, or the x- and y-axes as number lines crossing at O, with their directions and quadrants. On it: ${NAMES.map(
    (n, i) => `${i === NAMES.length - 1 ? "and " : ""}${ENTRIES[n].says}`,
  ).join("; ")}.`,
  children: { plane, ...propsOf(PARTS) },
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
    // Where Riya is headed: the places', if the board has places.
    target: (me) => (uses(me, "places") ? me.places.target : null),
    targetName: (me) => (uses(me, "places") ? me.places.targetName : TARGET_NAME),
    canChooseTarget: (me) => isOn(me, "places") && me.places.canChoose,
    // The plane's: no part on it that takes a tap, so a tap names its parts.
    isAlone: (me) =>
      !NAMES.some((n) => isOn(me, n) && (ENTRIES[n].takesTaps?.(stateOf(me, n)) ?? false)),
    // Its numbers light the places.
    canTapNumbers: (me) => isOn(me, "places"),
    lit: (me) => (uses(me, "places") ? me.places.lit : null),
    // The clues': the unit a page's ruler reads in, and a tap is theirs once nothing is left to plot.
    unit: (me) => (uses(me, "reading") ? me.reading.unit : ""),
    isPlaneFree: (me) =>
      !isOn(me, "plotting") || me.plotting.plotted.length >= me.plotting.toPlot.length,
  },
  hear: {
    // In free play (a house chosen once the board is open), another house is a new walk, from her
    // start. (The first is only marked: she may be on her way to it.) Where a tap only marks a place
    // (a stall opened where she stands), she stays.
    "places.targetChosen": (me, p, t) =>
      p.isAnother &&
      me.places.choosing === Choosing.OnceOpen &&
      uses(me, "walker") &&
      t.to.walker.backToStart(),
    "plane.numberTapped": (me, p, t) =>
      uses(me, "places") && t.to.places.lightLine({ axis: p.axis, value: p.value, isTap: true }),
    "plotting.scaleChosen": (_, p, t) => t.to.plane.setScale({ every: p.every }),
  },
  show: Object.fromEntries(NAMES.map((n) => [n, (me: object) => isOn(me, n)])),
  summary: (me) =>
    `the coordinate plane from ${me.window.xMin} to ${me.window.xMax} across and ${me.window.yMin} to ${me.window.yMax} up`,
  layout: { provider: "plane", children: NAMES, order },
});
