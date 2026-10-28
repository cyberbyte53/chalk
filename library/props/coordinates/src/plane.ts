/** Plane arithmetic and how coordinates are written, shared by the props here. */

/** A number as the book writes it: a real minus sign, halves as decimals (−3.5). */
export function numText(v: number): string {
  const n = Number(v.toFixed(6));
  return n < 0 ? `−${Math.abs(n)}` : String(n);
}

/** A point as the book writes it: (−3, 4). */
export function pairText(x: number, y: number): string {
  return `(${numText(x)}, ${numText(y)})`;
}

/** The quadrant a point is in, 1 to 4 anticlockwise from the positive x-axis, or 0 on an axis. */
export function quadrantOf(x: number, y: number): 0 | 1 | 2 | 3 | 4 {
  if (x === 0 || y === 0) return 0;
  if (x > 0) return y > 0 ? 1 : 4;
  return y > 0 ? 2 : 3;
}

/** A quadrant's number as the book writes it. */
export const ROMAN = ["", "I", "II", "III", "IV"] as const;

/** The signs of the coordinates in each quadrant. */
export const SIGNS = ["", "(+, +)", "(−, +)", "(−, −)", "(+, −)"] as const;
