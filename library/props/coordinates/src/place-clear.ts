/** A place for a word: x, y and its anchor, in the coordinates of the group it is drawn in. */
export type WordPlace = readonly [number, number, "start" | "middle" | "end"];

/**
 * Runs a label's placing, timed: every placing on the page is summed under one name, which the
 * drawing tool's label audit reads (platform/docs/plans/label-placement.md), and the boxes read
 * meanwhile are counted there.
 */
export function timedPlacing(fn: () => void): void {
  const from = performance.now();
  const placing = globalThis as { __chalkPlacing?: number };
  placing.__chalkPlacing = (placing.__chalkPlacing ?? 0) + 1;
  try {
    fn();
  } finally {
    placing.__chalkPlacing = (placing.__chalkPlacing ?? 1) - 1;
    performance.measure("chalk:labels", { start: from });
  }
}
