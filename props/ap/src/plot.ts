/**
 * Shared geometry for drawing terms as bars: a vertical scale that includes zero, unless every
 * term is far from zero (a salary of 8000, 8500, …), when the axis is broken so the steps show.
 */

export type BarScale = {
  /** The pixel y of a value. */
  y: (v: number) => number;
  /** The value the bars grow from: 0, or the broken bottom (or top) of the axis. */
  base: number;
  /** Whether the axis is broken (it doesn't start at zero). */
  isBroken: boolean;
};

/** A scale for values drawn between pixel rows top and bottom. */
export function barScale(values: readonly number[], top: number, bottom: number): BarScale {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min;
  let lo = Math.min(0, min);
  let hi = Math.max(0, max);
  let base = 0;
  let isBroken = false;
  if (min > 0 && range > 0 && range < 0.45 * max) {
    lo = min - range * 0.6;
    base = lo;
    isBroken = true;
  } else if (max < 0 && range > 0 && range < 0.45 * -min) {
    hi = max + range * 0.6;
    base = hi;
    isBroken = true;
  }
  if (hi === lo) hi = lo + 1;
  const y = (v: number) => top + ((hi - v) / (hi - lo)) * (bottom - top);
  return { y, base, isBroken };
}

/** Simple TeX as plain text for SVG labels: \frac{3}{2} → 3/2, \sqrt{2} → √2, - → −. */
export function texToPlain(tex: string): string {
  return tex
    .replace(/\\[dt]?frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2")
    .replace(/\\sqrt\{([^}]*)\}/g, "√$1")
    .replace(/\\sqrt\s*(\d+)/g, "√$1")
    .replace(/\^\{?2\}?/g, "²")
    .replace(/\^\{?3\}?/g, "³")
    .replace(/\\cdot|\\times/g, "×")
    .replace(/[{}]/g, "")
    .replace(/\\,|\\ /g, " ")
    .replace(/-/g, "−");
}
