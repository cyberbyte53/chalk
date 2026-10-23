/**
 * Plane geometry for the circles and constructions chapters: points, lines, circles, where a line
 * meets a circle, tangents from a point, and number formatting. Pure; no drawing. Model
 * coordinates are in cm with y up.
 */

/** Words a prop shows itself, in both languages. */
export type Words = { readonly en: string; readonly hi: string };
export const say = (locale: string, w: Words): string => (locale === "hi" ? w.hi : w.en);

export type Pt = readonly [number, number];

/** Rounds away floating dust: 0.30000000000000004 → 0.3, −0 → 0. */
export function clean(x: number): number {
  const r = Math.round(x * 1e9) / 1e9;
  return Object.is(r, -0) ? 0 : r;
}

/** Whether two numbers are equal up to `tol` (relative to their size, at least `tol` absolute). */
export function near(a: number, b: number, tol = 1e-6): boolean {
  return Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
}

/** A number as text, at most `dp` decimals, no trailing zeros, minus as −: 1.50 → 1.5. */
export function numText(x: number, dp = 2): string {
  const r = clean(Math.round(x * 10 ** dp) / 10 ** dp);
  return `${r}`.replace("-", "−");
}

/** The ratio x as the simplest whole-number ratio "p : q" when it is one (small), else a decimal. */
export function ratioText(x: number, maxDen = 12): string {
  for (let q = 1; q <= maxDen; q++) {
    const p = x * q;
    if (near(p, Math.round(p), 1e-6)) return `${Math.round(p)} : ${q}`;
  }
  return numText(x, 2);
}

/** A ratio as a fraction "p/q" when it is a simple one, else a decimal: 0.75 → 3/4. */
export function fracText(x: number, maxDen = 12): string {
  for (let q = 1; q <= maxDen; q++) {
    const p = x * q;
    if (near(p, Math.round(p), 1e-6))
      return q === 1 ? numText(Math.round(p)) : `${Math.round(p)}/${q}`;
  }
  return numText(x, 2);
}

/** Greatest common divisor of two positive whole numbers. */
export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y > 0) [x, y] = [y, x % y];
  return x;
}

export const add = (p: Pt, q: Pt): Pt => [p[0] + q[0], p[1] + q[1]];
export const sub = (p: Pt, q: Pt): Pt => [p[0] - q[0], p[1] - q[1]];
export const scale = (p: Pt, k: number): Pt => [p[0] * k, p[1] * k];
export const dot = (p: Pt, q: Pt): number => p[0] * q[0] + p[1] * q[1];
export const cross = (p: Pt, q: Pt): number => p[0] * q[1] - p[1] * q[0];
export const dist = (p: Pt, q: Pt): number => Math.hypot(q[0] - p[0], q[1] - p[1]);
export const mid = (p: Pt, q: Pt): Pt => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];

/** The point a fraction t of the way from p to q. */
export const lerp = (p: Pt, q: Pt, t: number): Pt => [
  p[0] + (q[0] - p[0]) * t,
  p[1] + (q[1] - p[1]) * t,
];

export const rad = (deg: number): number => (deg * Math.PI) / 180;
export const deg = (r: number): number => (r * 180) / Math.PI;

/** The unit vector at `angle` degrees from the positive x-axis (anticlockwise, y up). */
export const unit = (angle: number): Pt => [Math.cos(rad(angle)), Math.sin(rad(angle))];

/** The point on the circle with centre c and radius r at `angle` degrees. */
export const onCircle = (c: Pt, r: number, angle: number): Pt => add(c, scale(unit(angle), r));

/** The direction from p to q, in degrees (−180 to 180). */
export const angleOf = (p: Pt, q: Pt): number => deg(Math.atan2(q[1] - p[1], q[0] - p[0]));

/** The angle at vertex v between rays v→p and v→q, in degrees (0–180). */
export function angleAt(v: Pt, p: Pt, q: Pt): number {
  const a = sub(p, v);
  const b = sub(q, v);
  const c = dot(a, b) / ((Math.hypot(...a) || 1) * (Math.hypot(...b) || 1));
  return deg(Math.acos(Math.min(1, Math.max(-1, c))));
}

/** The distance from point o to the line through p in direction u. */
export function distanceToLine(o: Pt, p: Pt, u: Pt): number {
  return Math.abs(cross(sub(o, p), u)) / (Math.hypot(...u) || 1);
}

/** Where the line through p with direction u meets the line through q with direction v; null if parallel. */
export function meet(p: Pt, u: Pt, q: Pt, v: Pt): Pt | null {
  const d = cross(u, v);
  if (Math.abs(d) < 1e-12) return null;
  const t = cross(sub(q, p), v) / d;
  return add(p, scale(u, t));
}

/**
 * Where the line through p with direction u meets the circle (centre c, radius r): 0, 1 or 2
 * points, ordered along u. A line that touches within `tol` counts as touching once.
 */
export function lineCircle(p: Pt, u: Pt, c: Pt, r: number, tol = 1e-9): Pt[] {
  const len = Math.hypot(...u) || 1;
  const w: Pt = [u[0] / len, u[1] / len];
  const foot = add(p, scale(w, dot(sub(c, p), w)));
  const d = dist(c, foot);
  if (d > r + tol) return [];
  if (Math.abs(d - r) <= tol) return [foot];
  const h = Math.sqrt(r * r - d * d);
  return [add(foot, scale(w, -h)), add(foot, scale(w, h))];
}

/** Where two circles meet: 0 or 2 points (1 if they just touch). */
export function circleCircle(c1: Pt, r1: number, c2: Pt, r2: number): Pt[] {
  const d = dist(c1, c2);
  if (d < 1e-12 || d > r1 + r2 + 1e-9 || d < Math.abs(r1 - r2) - 1e-9) return [];
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
  const u = scale(sub(c2, c1), 1 / d);
  const base = add(c1, scale(u, a));
  if (h < 1e-9) return [base];
  const n: Pt = [-u[1], u[0]];
  return [add(base, scale(n, h)), add(base, scale(n, -h))];
}

/**
 * The points where the tangents from p touch the circle (centre c, radius r): none if p is inside,
 * p itself if it is on the circle, two if it is outside.
 */
export function tangentPoints(p: Pt, c: Pt, r: number): Pt[] {
  const d = dist(p, c);
  if (d < r - 1e-9) return [];
  if (Math.abs(d - r) <= 1e-9) return [p];
  return circleCircle(c, r, mid(p, c), d / 2);
}

/** The length of the tangent from a point at distance d from the centre of a circle of radius r. */
export function tangentLength(d: number, r: number): number | null {
  return d < r - 1e-9 ? null : clean(Math.sqrt(Math.max(0, d * d - r * r)));
}

/** The vertices of a triangle with these sides: B at the origin, C along +x, A above (y up). */
export function placeTriangle(s: { ab: number; bc: number; ca: number }): { a: Pt; b: Pt; c: Pt } {
  const x = (s.ab * s.ab + s.bc * s.bc - s.ca * s.ca) / (2 * s.bc);
  const y = Math.sqrt(Math.max(0, s.ab * s.ab - x * x));
  return { a: [x, y], b: [0, 0], c: [s.bc, 0] };
}

/** Whether three lengths make a triangle (each less than the sum of the other two). */
export function isTriangle(s: { ab: number; bc: number; ca: number }): boolean {
  const { ab, bc, ca } = s;
  return (
    ab > 0 && bc > 0 && ca > 0 && ab < bc + ca - 1e-9 && bc < ab + ca - 1e-9 && ca < ab + bc - 1e-9
  );
}
