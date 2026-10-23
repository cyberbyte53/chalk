import { type Pt, clean, gcd, near, numText } from "@chalk/prop-circles/kit";
import { z } from "zod";

/**
 * Coordinate geometry for NCERT Class 10 Ch 7: distances, the section formula and the area of a
 * triangle from coordinates, plus the number text the props write (surds, fractions, signed terms).
 * Pure; no drawing. Coordinates are in units, x to the right and y up.
 */

/** A named point on the plane. */
export const namedPoint = z
  .object({
    name: z.string().min(1).max(3),
    x: z.number().min(-60).max(60),
    y: z.number().min(-60).max(60),
  })
  .strict();
export type NamedPoint = z.infer<typeof namedPoint>;

/** The part of the plane a prop shows: [xMin, xMax, yMin, yMax], in whole units. */
export const planeWindow = z
  .tuple([z.number().int(), z.number().int(), z.number().int(), z.number().int()])
  .refine((w) => w[0] < w[1] && w[2] < w[3], "the window must have xMin < xMax and yMin < yMax");
export type PlaneWindow = z.infer<typeof planeWindow>;

export const ptOf = (p: { x: number; y: number }): Pt => [p.x, p.y];

/** The square of the distance between two points: (x₂ − x₁)² + (y₂ − y₁)². */
export const dist2 = (p: Pt, q: Pt): number => clean((q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2);

/** The distance between two points (the distance formula). */
export const distance = (p: Pt, q: Pt): number => Math.sqrt(dist2(p, q));

/** The point dividing AB internally in the ratio m : n (the section formula). */
export const divide = (a: Pt, b: Pt, m: number, n: number): Pt => [
  clean((m * b[0] + n * a[0]) / (m + n)),
  clean((m * b[1] + n * a[1]) / (m + n)),
];

/** The mid-point of AB. */
export const midpointOf = (a: Pt, b: Pt): Pt => divide(a, b, 1, 1);

/** x₁(y₂ − y₃) + x₂(y₃ − y₁) + x₃(y₁ − y₂): twice the signed area of the triangle. */
export const bracketOf = (a: Pt, b: Pt, c: Pt): number =>
  clean(a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));

/** The area of the triangle with vertices a, b, c: the numerical value of ½ × the bracket. */
export const triangleAreaOf = (a: Pt, b: Pt, c: Pt): number =>
  clean(Math.abs(bracketOf(a, b, c)) / 2);

/** Whether three points lie on one line (the triangle they make has no area). */
export const isCollinear = (a: Pt, b: Pt, c: Pt): boolean => near(bracketOf(a, b, c), 0, 1e-9);

/** The centroid of a triangle: the average of its vertices. */
export const centroidOf = (a: Pt, b: Pt, c: Pt): Pt => [
  clean((a[0] + b[0] + c[0]) / 3),
  clean((a[1] + b[1] + c[1]) / 3),
];

/** Rounds a value to the nearest multiple of `step`. */
export const snapTo = (v: number, step: number): number => clean(Math.round(v / step) * step);

/** Keeps a value inside [lo, hi]. */
export const within = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/**
 * √n in simplest surd form for a whole n: √8 → 2√2, √25 → 5, √170 → √170. For a quarter-whole n
 * (half-unit points) the root of 4n is halved: √15.25 → √61/2. Otherwise a decimal.
 */
export function sqrtText(n: number): string {
  if (n < 0) return "—";
  const tryWhole = (k: number): [number, number] | null => {
    if (!near(k, Math.round(k), 1e-9)) return null;
    let out = 1;
    let rest = Math.round(k);
    for (let f = 2; f * f <= rest; f++)
      while (rest % (f * f) === 0) {
        out *= f;
        rest /= f * f;
      }
    return [out, rest];
  };
  const whole = tryWhole(n);
  if (whole !== null) {
    const [out, rest] = whole;
    if (rest === 0) return "0";
    if (rest === 1) return `${out}`;
    return out === 1 ? `√${rest}` : `${out}√${rest}`;
  }
  const quarter = tryWhole(n * 4);
  if (quarter !== null) {
    const [out, rest] = quarter;
    if (rest === 1) return fraction(out, 2);
    const g = gcd(out, 2);
    const top = out / g === 1 ? `√${rest}` : `${out / g}√${rest}`;
    return 2 / g === 1 ? top : `${top}/${2 / g}`;
  }
  return numText(Math.sqrt(n), 2);
}

/** The same surd in TeX: 2√2 → 2\sqrt{2}, √61/2 → \frac{\sqrt{61}}{2}. */
export function sqrtTex(n: number): string {
  const s = sqrtText(n).replace("−", "-");
  const frac = s.match(/^(.*)\/(\d+)$/);
  const root = (x: string) => x.replace(/√(\d+)/, "\\sqrt{$1}");
  if (frac !== null) return `\\frac{${root(frac[1] as string)}}{${frac[2]}}`;
  return root(s);
}

/** p/q in lowest terms as text: 6/4 → 3/2, 4/2 → 2, −1/3 → −1/3. */
export function fraction(p: number, q: number): string {
  if (q === 0) return "—";
  const sign = p * q < 0 ? "−" : "";
  const a = Math.abs(Math.round(p));
  const b = Math.abs(Math.round(q));
  if (!near(Math.abs(p), a) || !near(Math.abs(q), b)) return numText(p / q, 2);
  const g = gcd(a, b) || 1;
  return b / g === 1 ? `${sign}${a / g}` : `${sign}${a / g}/${b / g}`;
}

/** A coordinate as a short fraction when it is one (thirds, sevenths…), else a decimal. */
export function coordText(v: number): string {
  for (let q = 1; q <= 12; q++) {
    const p = v * q;
    if (near(p, Math.round(p), 1e-9)) return fraction(Math.round(p), q);
  }
  return numText(v, 2);
}

/** The same coordinate in TeX: −13/3 → -\frac{13}{3}. */
export function coordTex(v: number): string {
  const s = coordText(v);
  const m = s.match(/^(−?)(\d+)\/(\d+)$/);
  if (m !== null) return `${m[1] === "−" ? "-" : ""}\\frac{${m[2]}}{${m[3]}}`;
  return s.replace("−", "-");
}

/** (x, y) as text. */
export const pairText = (p: Pt): string => `(${coordText(p[0])}, ${coordText(p[1])})`;

/** A number in TeX, bracketed when negative so it can follow a sign: −3 → (-3). */
export const term = (v: number): string => (clean(v) < 0 ? `(${coordTex(v)})` : coordTex(v));

/** The best whole ratio m : n (m + n ≤ max) for a point a fraction t of the way from A to B. */
export function ratioNear(t: number, max: number): [number, number] {
  let best: [number, number] = [1, 1];
  let err = Number.POSITIVE_INFINITY;
  for (let total = 2; total <= max; total++)
    for (let k = 1; k < total; k++) {
      const e = Math.abs(t - k / total) + total * 1e-4;
      if (e < err) {
        err = e;
        const g = gcd(k, total - k);
        best = [k / g, (total - k) / g];
      }
    }
  return best;
}
