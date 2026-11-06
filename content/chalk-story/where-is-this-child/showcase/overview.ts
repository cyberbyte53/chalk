import { page, place, scene, t } from "@chalk/author";
import { plane, words } from "@chalk/patterns";
import { Side, equationBalance } from "@chalk/prop-chemistry";
import { Marks, Reading, Scene, coordinatePlane } from "@chalk/prop-coordinates";
import { peaCross } from "@chalk/prop-heredity";
import { sphericalMirror } from "@chalk/prop-light";

const { setup, town } = plane;

/**
 * The promo's showcase: one board per prop, no words but its subject, the prop doing its best
 * moves on the board's clock (choreographed by the board's own actions), to be recorded.
 */

const FIVE = { xMin: -5.5, xMax: 5.5, yMin: -5.5, yMax: 5.5 };
const XY: [ReturnType<typeof t>, ReturnType<typeof t>] = [t("x", "x"), t("y", "y")];
const AXES = {
  window: FIVE,
  marks: Marks.Numbers,
  numbered: ["x", "y"] as ("x" | "y")[],
  axisNames: XY,
  showAxisNames: false,
};

/** Riya walks to Aman's house, along then up; then the whole town rises. */
const walk = page(
  "walk-the-streets",
  scene({
    pieces: {
      title: words.title(t("Maths", "गणित")),
      town: place(coordinatePlane, setup(town(), { walker: { showWhere: true } })),
    },
    passBy: "rules",
    onSaid: {
      title: (_, t) => [
        t.to.town.places.markTarget({ x: 4, y: 5 }),
        t.later(0.6, t.to.town.walker.walkTo({ x: 4, y: 5 })),
      ],
    },
    hear: {
      "town.walker.arrived": (_, __, t) => [t.to.town.plane.raiseAllUpLines(), t.later(3, t.self.pass())],
    },
    witness: [],
  }),
);

/** The candle glides from far away to inside F: the image shrinks, grows, flips and jumps behind. */
const mirror = page(
  "move-the-candle",
  scene({
    pieces: {
      title: words.title(t("Physics", "भौतिकी")),
      bench: place(sphericalMirror, { u: -30, showNumbers: false }),
    },
    passBy: "rules",
    onSaid: { title: (_, t) => t.later(1.5, t.to.bench.moveObjectTo({ u: -20, seconds: 3.5 })) },
    hear: {
      "bench.moved": (_, p, t) =>
        p.u === -20
          ? t.later(1.0, t.to.bench.moveObjectTo({ u: -10, seconds: 3 }))
          : p.u === -10
            ? t.later(0.6, t.to.bench.moveObjectTo({ u: -4, seconds: 2 }))
            : t.later(1.5, t.self.pass()),
    },
    witness: [],
  }),
);

/** Two number lines slide together until their zeroes meet, and the town appears behind. */
const axesForm = page(
  "two-lines-become-axes",
  scene({
    pieces: {
      title: words.title(t("Maths", "गणित")),
      sheet: place(
        coordinatePlane,
        setup({
          plane: {
            ...AXES,
            apart: { x: 2.5, y: 2.5 },
            showOrigin: false,
            showDirections: true,
            scene: Scene.Town,
            upLines: null,
            backdrop: 0,
          },
        }),
      ),
    },
    passBy: "rules",
    onSaid: { title: (_, t) => t.later(0.4, t.to.sheet.plane.bringTogether()) },
    hear: {
      "sheet.plane.crossed": (_, __, t) => [
        t.to.sheet.plane.fadeBackdrop({ to: 0.4, seconds: 1 }),
        t.later(2, t.self.pass()),
      ],
    },
    witness: [],
  }),
);

/** Water's equation balances molecule by molecule; then the atoms regroup. */
const atoms = page(
  "balance-the-atoms",
  scene({
    pieces: {
      title: words.title(t("Chemistry", "रसायन")),
      lab: place(equationBalance, {}),
    },
    passBy: "rules",
    onSaid: {
      title: (_, t) =>
        t.later(0.5, t.to.lab.setCoefficient({ side: Side.Products, index: 0, coefficient: 2 })),
    },
    hear: {
      "lab.counted": (_, p, t) =>
        p.side === Side.Products
          ? t.later(0.8, t.to.lab.setCoefficient({ side: Side.Reactants, index: 0, coefficient: 2 }))
          : t.later(0.8, t.to.lab.regroup()),
      "lab.regrouped": (_, __, t) => t.later(1.5, t.self.pass()),
    },
    witness: [],
  }),
);

/** The four quadrants number themselves, anticlockwise. */
const quadrants = page(
  "number-the-quadrants",
  scene({
    pieces: {
      title: words.title(t("Maths", "गणित")),
      sheet: place(
        coordinatePlane,
        setup({ plane: { ...AXES, showDirections: true, canNumberQuadrants: true, tintsQuadrants: true } }),
      ),
    },
    passBy: "rules",
    onSaid: { title: (_, t) => t.later(0.3, t.to.sheet.plane.numberQuadrants()) },
    hear: { "sheet.plane.quadrantsNumbered": (_, __, t) => t.later(2, t.self.pass()) },
    witness: [],
  }),
);

/** The axes move and turn under a point that stays still: only its numbers change. */
const turnAxes = page(
  "turn-the-axes",
  scene({
    pieces: {
      title: words.title(t("Maths", "गणित")),
      sheet: place(
        coordinatePlane,
        setup({
          plane: { ...AXES, showDirections: false, canMoveAxes: true },
          reading: { point: { x: 3, y: 2 }, reading: Reading.Pair, unit: "", decimals: 2, canMovePoint: false },
        }),
      ),
    },
    passBy: "rules",
    onSaid: {
      title: (_, t) => [
        t.later(0.5, t.to.sheet.plane.turnTo({ degrees: 30, seconds: 2.5 })),
        t.later(3.5, t.to.sheet.plane.turnTo({ degrees: -20, seconds: 2.5 })),
        t.later(6.5, t.to.sheet.plane.turnTo({ degrees: 0, seconds: 1.5 })),
        t.later(8.5, t.self.pass()),
      ],
    },
    witness: [],
  }),
);

/** Tall × short: all tall; two of them crossed: a short one comes back, 3 : 1. */
const peas = page(
  "cross-the-peas",
  scene({
    pieces: {
      title: words.title(t("Biology", "जीव विज्ञान")),
      field: place(peaCross, {}),
    },
    passBy: "rules",
    onSaid: { title: (_, t) => t.later(0.3, t.to.field.cross({ seconds: 2.4 })) },
    hear: {
      // Tall × short: all tall. Two of those: 3 : 1, the short one back. A tall carrying the
      // hidden short gene × that short one: 2 : 2.
      "field.crossed": (_, p, t) =>
        p.generation === 1
          ? t.later(1.2, t.to.field.nextGeneration({ seconds: 3.6 }))
          : p.generation === 2
            ? t.later(1.6, t.to.field.nextGeneration({ seconds: 3.6, children: [1, 3] }))
            : t.later(2, t.self.pass()),
    },
    witness: [],
  }),
);

/** Each pair plotted, its swap drawn with it: (2, 5) and (5, 2) are different points. */
const PAIRS = [
  { x: 5, y: 0 },
  { x: 0, y: 5 },
  { x: 2, y: 5 },
  { x: 5, y: 2 },
  { x: -3, y: 5 },
  { x: 5, y: -3 },
];
const swap = page(
  "swap-the-numbers",
  scene({
    pieces: {
      title: words.title(t("Maths", "गणित")),
      sheet: place(
        coordinatePlane,
        setup({
          plane: { ...AXES, window: { xMin: -6.5, xMax: 6.5, yMin: -6.5, yMax: 7.5 }, hasGrid: true, showDirections: true },
          plotting: { toPlot: PAIRS, showTable: true, showSwaps: true },
        }),
      ),
    },
    passBy: "rules",
    onSaid: {
      title: (_, t) => [
        ...PAIRS.map((_, i) => t.later(0.4 + i * 0.9, t.to.sheet.plotting.plotNext())),
        t.later(0.4 + PAIRS.length * 0.9 + 2, t.self.pass()),
      ],
    },
    witness: [],
  }),
);

/** The pages, in reading order. */
export const overview = [walk, mirror, axesForm, atoms, quadrants, turnAxes, peas, swap];
