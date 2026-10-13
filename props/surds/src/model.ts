import { type Box, type PropView, actionsFor, defineProp, set, task, tween } from "@chalk/prop";
import { z } from "zod";
import { layoutOf, tilesOf } from "./layout";
import { type Term, addLikeTerms, factorText, sumText, termText } from "./surd";

export const SurdTilesPart = {
  TilePrefix: "tile:",
  LeftTermPrefix: "leftTerm:",
  RightTermPrefix: "rightTerm:",
  Result: "result",
} as const;

export const SurdTilesSignal = { Combined: "combined" } as const;

export const MAX_COEFFICIENT = 20;
export const MAX_RADICAND = 200;
/** How long `combine` takes unless told otherwise, and how often it steps. */
export const COMBINE_SECONDS = 1.5;
const STEPS_PER_SECOND = 30;

const term = z
  .object({
    /** A whole number, not 0. */
    coefficient: z
      .number()
      .int()
      .min(-MAX_COEFFICIENT)
      .max(MAX_COEFFICIENT)
      .refine((c) => c !== 0, "a coefficient can't be 0"),
    /** The number under the root; 1 makes the term rational. */
    radicand: z.number().int().min(1).max(MAX_RADICAND),
  })
  .strict();
const factor = z.array(term).min(1).max(2);

const surdTilesState = z
  .object({
    /** The factor down the side: 1 or 2 terms. */
    left: factor,
    /** The factor along the top: 1 or 2 terms. */
    right: factor,
    /** 0 to 1: how far the tiles have merged into the simplified sum. */
    combine: z.number().min(0).max(1),
    /** Whether the learner may change the top factor. */
    canChangeRight: z.boolean(),
  })
  .strict();
export type SurdTilesState = z.infer<typeof surdTilesState>;

const act = actionsFor<SurdTilesState>();

type TileView = Term & { row: number; col: number; text: string; isCancelled: boolean };

function termsOf(s: SurdTilesState): Term[] {
  return addLikeTerms(tilesOf(s.left, s.right));
}

/** Tiles whose like terms (same radicand) add up to 0, as "row-col". */
function cancelledTiles(s: SurdTilesState): string[] {
  const tiles = tilesOf(s.left, s.right);
  const kept = new Set(termsOf(s).map((t) => t.radicand));
  return tiles.filter((t) => !kept.has(t.radicand)).map((t) => t.key);
}

function tiles(s: SurdTilesState): TileView[] {
  const cancelled = new Set(cancelledTiles(s));
  return tilesOf(s.left, s.right).map((t) => ({
    row: t.row,
    col: t.col,
    coefficient: t.coefficient,
    radicand: t.radicand,
    text: termText(t),
    isCancelled: cancelled.has(t.key),
  }));
}

function isRational(s: SurdTilesState): boolean {
  return termsOf(s).every((t) => t.radicand === 1);
}

/** The factors, as one string: a combine run stops if they change on its way. */
function factorsKey(s: SurdTilesState): string {
  return JSON.stringify([s.left, s.right]);
}

function needsCanChange(s: SurdTilesState): void {
  if (!s.canChangeRight) throw new Error("the top factor can't be changed now (canChangeRight)");
}

/** Two factors multiplied as an area. It knows multiplying surds, nothing about any lesson. */
export const surdTiles = defineProp<SurdTilesState>({
  type: "surdTiles",
  describe:
    "The product of two factors, each a sum of 1 or 2 terms coefficient×√radicand (radicand 1 is rational), drawn as a rectangle: `left` down the side, `right` along the top, one tile per pair of terms. Like tiles (same surd) add; equal and opposite tiles cancel. `combine` merges the tiles into the simplified result.",
  state: surdTilesState,
  defaults: {
    left: [
      { coefficient: 1, radicand: 5 },
      { coefficient: 1, radicand: 2 },
    ],
    right: [
      { coefficient: 1, radicand: 5 },
      { coefficient: -1, radicand: 2 },
    ],
    combine: 0,
    canChangeRight: false,
  },
  inputs: ["canChangeRight"],
  offScreen: ["isRational", "cancelledTiles"],
  derived: {
    tiles: {
      describe:
        "One per (row, col), row-major: that row's term times that column's term, simplified; isCancelled when its like terms add up to 0",
      compute: tiles,
    },
    terms: {
      describe: "The simplified sum: like terms added, zeros dropped, rational first",
      compute: termsOf,
    },
    resultText: {
      describe: 'The simplified sum as text ("7 + 2√10")',
      compute: (s) => sumText(termsOf(s)),
    },
    expandedText: {
      describe: 'Every tile in order before adding like terms ("5 − √15 + √15 − 3")',
      compute: (s) => sumText(tilesOf(s.left, s.right)),
    },
    leftText: { describe: "The side factor as text", compute: (s) => factorText(s.left) },
    rightText: { describe: "The top factor as text", compute: (s) => factorText(s.right) },
    isRational: { describe: "The result has no surd term", compute: isRational },
    cancelledTiles: {
      describe: 'Tiles ("row-col") whose like terms add up to 0',
      compute: cancelledTiles,
    },
    hasCombined: {
      describe: "The tiles have merged into the result",
      compute: (s) => s.combine === 1,
    },
  },
  actions: {
    setFactors: act({
      describe: "Multiply these two factors instead (tiles separate again)",
      args: z.object({ left: factor, right: factor }).strict(),
      run: (_s, a) => set({ left: a.left, right: a.right, combine: 0 }),
    }),
    setRight: act({
      describe: "Put a different factor along the top (only when canChangeRight)",
      byLearner: true,
      args: z.object({ right: factor }).strict(),
      run: (s, a) => {
        needsCanChange(s);
        return set({ right: a.right, combine: 0 });
      },
    }),
    flipSign: act({
      describe:
        "Flip the sign of one term of the top factor, e.g. √5 + √3 → √5 − √3 (only when canChangeRight)",
      byLearner: true,
      args: z.object({ term: z.number().int().min(0).max(1) }).strict(),
      run: (s, a) => {
        needsCanChange(s);
        const old = s.right[a.term];
        if (old === undefined) throw new Error(`the top factor has no term ${a.term}`);
        const right = s.right.map((t, i) =>
          i === a.term ? { ...t, coefficient: -t.coefficient } : t,
        );
        return set({ right, combine: 0 });
      },
    }),
    combine: act({
      describe:
        "Merge the tiles into the simplified result over `over` seconds (default 1.5): equal and opposite tiles cancel, like terms gather; then raises `combined`",
      reveals: true,
      byLearner: true,
      args: z.object({ over: z.number().min(0).max(10).optional() }).strict(),
      run: (s, a) => {
        const over = a.over ?? COMBINE_SECONDS;
        const done = { signal: SurdTilesSignal.Combined, payload: { isRational: isRational(s) } };
        if (over === 0 || s.combine === 1) return set({ combine: 1 }, done);
        return task(async (context) => {
          const key = factorsKey(context.get());
          const from = context.get().combine;
          const steps = Math.max(1, Math.round(over * STEPS_PER_SECOND));
          let last = from;
          for (let i = 1; i <= steps; i++) {
            await context.wait(over / steps);
            const now = context.get();
            // Someone changed the factors or moved the tiles meanwhile: this run is over.
            if (factorsKey(now) !== key || now.combine !== last) return;
            last = i === steps ? 1 : from + ((1 - from) * i) / steps;
            context.set({ combine: last });
          }
          context.emit(done.signal, done.payload);
        });
      },
    }),
    separate: act({
      describe: "Glide back to the separate tiles",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => tween(0.5, { combine: 0 }),
    }),
  },
  signals: {
    [SurdTilesSignal.Combined]: {
      describe: "The tiles have merged into the result; `isRational` says if it has no surd term",
    },
  },
  parts: (s) => [
    ...tilesOf(s.left, s.right).map((t) => `${SurdTilesPart.TilePrefix}${t.key}`),
    ...s.left.map((_t, i) => `${SurdTilesPart.LeftTermPrefix}${i}`),
    ...s.right.map((_t, i) => `${SurdTilesPart.RightTermPrefix}${i}`),
    SurdTilesPart.Result,
  ],
  locate: (s: PropView & SurdTilesState, part: string, width: number): Box | undefined => {
    const layout = layoutOf(s.left, s.right, width);
    const index = (prefix: string) => Number(part.slice(prefix.length));
    if (part.startsWith(SurdTilesPart.TilePrefix)) {
      const key = part.slice(SurdTilesPart.TilePrefix.length);
      return layout.tiles.find((t) => t.key === key)?.box;
    }
    if (part.startsWith(SurdTilesPart.LeftTermPrefix))
      return layout.leftLabels[index(SurdTilesPart.LeftTermPrefix)];
    if (part.startsWith(SurdTilesPart.RightTermPrefix))
      return layout.rightLabels[index(SurdTilesPart.RightTermPrefix)];
    if (part === SurdTilesPart.Result) {
      const { expanded, result } = layout;
      const x = Math.min(expanded.box.x, result.box.x);
      const right = Math.max(expanded.box.x + expanded.box.width, result.box.x + result.box.width);
      return {
        x,
        y: expanded.box.y,
        width: right - x,
        height: result.box.y + result.box.height - expanded.box.y,
      };
    }
    return undefined;
  },
});
