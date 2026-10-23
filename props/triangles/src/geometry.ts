/**
 * Plane geometry for the triangles chapter: points, lengths, angles, a triangle from its three
 * sides, and number formatting. Pure; no drawing.
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

export const dist = (p: Pt, q: Pt): number => Math.hypot(q[0] - p[0], q[1] - p[1]);

/** The point a fraction t of the way from p to q. */
export const lerp = (p: Pt, q: Pt, t: number): Pt => [
  p[0] + (q[0] - p[0]) * t,
  p[1] + (q[1] - p[1]) * t,
];

/** The angle at vertex v between rays v→p and v→q, in degrees (0–180). */
export function angleAt(v: Pt, p: Pt, q: Pt): number {
  const a1 = Math.atan2(p[1] - v[1], p[0] - v[0]);
  const a2 = Math.atan2(q[1] - v[1], q[0] - v[0]);
  let d = Math.abs(a1 - a2);
  if (d > Math.PI) d = 2 * Math.PI - d;
  return (d * 180) / Math.PI;
}

/** The three sides of triangle ABC: AB, BC, CA. */
export type Sides = { ab: number; bc: number; ca: number };

/** Whether three lengths make a triangle (each less than the sum of the other two). */
export function isTriangle(s: Sides): boolean {
  const { ab, bc, ca } = s;
  return (
    ab > 0 && bc > 0 && ca > 0 && ab < bc + ca - 1e-9 && bc < ab + ca - 1e-9 && ca < ab + bc - 1e-9
  );
}

/** The angles at A, B, C (degrees) of the triangle with these sides (law of cosines). */
export function anglesOf(s: Sides): [number, number, number] {
  const { ab, bc, ca } = s;
  const cos = (adj1: number, adj2: number, opp: number) =>
    Math.min(1, Math.max(-1, (adj1 * adj1 + adj2 * adj2 - opp * opp) / (2 * adj1 * adj2)));
  const deg = (c: number) => (Math.acos(c) * 180) / Math.PI;
  const A = deg(cos(ab, ca, bc));
  const B = deg(cos(ab, bc, ca));
  return [A, B, 180 - A - B];
}

/**
 * Vertices for a triangle with these sides, B at the origin, C along the positive x-axis and A
 * above it (y up).
 */
export function placeTriangle(s: Sides): { a: Pt; b: Pt; c: Pt } {
  const x = (s.ab * s.ab + s.bc * s.bc - s.ca * s.ca) / (2 * s.bc);
  const y = Math.sqrt(Math.max(0, s.ab * s.ab - x * x));
  return { a: [x, y], b: [0, 0], c: [s.bc, 0] };
}

/** The side opposite an angle, from the two sides that include it (law of cosines). */
export function oppositeSide(adj1: number, adj2: number, angleDeg: number): number {
  const t = (angleDeg * Math.PI) / 180;
  return Math.sqrt(Math.max(0, adj1 * adj1 + adj2 * adj2 - 2 * adj1 * adj2 * Math.cos(t)));
}

/**
 * Sides of the triangle with base `base` (between the second and third vertex) and the angles
 * `b` and `c` at its ends (sine rule). Null if the angles leave no room for a third.
 */
export function sidesFromBaseAngles(base: number, b: number, c: number): Sides | null {
  const a = 180 - b - c;
  if (a <= 0 || b <= 0 || c <= 0) return null;
  const k = base / Math.sin((a * Math.PI) / 180);
  return {
    bc: base,
    ab: k * Math.sin((c * Math.PI) / 180),
    ca: k * Math.sin((b * Math.PI) / 180),
  };
}

/** Area of a triangle from its three sides (Heron). */
export function areaOf(s: Sides): number {
  const p = (s.ab + s.bc + s.ca) / 2;
  return Math.sqrt(Math.max(0, p * (p - s.ab) * (p - s.bc) * (p - s.ca)));
}

/** The area of a polygon (shoelace), unsigned. */
export function polygonArea(pts: readonly Pt[]): number {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i] as Pt;
    const q = pts[(i + 1) % pts.length] as Pt;
    a += p[0] * q[1] - q[0] * p[1];
  }
  return Math.abs(a) / 2;
}

/** The ratio x as the simplest whole-number ratio "p : q" when it is one (small), else a decimal. */
export function ratioText(x: number, maxDen = 12): string {
  for (let q = 1; q <= maxDen; q++) {
    const p = x * q;
    if (near(p, Math.round(p), 1e-6)) return `${Math.round(p)} : ${q}`;
  }
  return numText(x, 2);
}

/** A ratio as a fraction "p/q" when it is a simple one, else a decimal: 0.6 → 3/5. */
export function fracText(x: number, maxDen = 12): string {
  for (let q = 1; q <= maxDen; q++) {
    const p = x * q;
    if (near(p, Math.round(p), 1e-6))
      return q === 1 ? numText(Math.round(p)) : `${Math.round(p)}/${q}`;
  }
  return numText(x, 2);
}

/** Squared, as text with a superscript: AB → AB². */
export const sq = (name: string): string => `${name}²`;
