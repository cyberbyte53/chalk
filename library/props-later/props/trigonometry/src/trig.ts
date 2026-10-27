/**
 * Trigonometry for the props: the six ratios of an acute angle, their exact values at 0°, 30°,
 * 45°, 60° and 90° (NCERT Table 8.1), surds, and number formatting. Pure; no drawing.
 */

/** Words a prop shows itself, in both languages. */
export type Words = { readonly en: string; readonly hi: string };
export const say = (locale: string, w: Words): string => (locale === "hi" ? w.hi : w.en);

export type Pt = readonly [number, number];

export const Ratio = {
  Sin: "sin",
  Cos: "cos",
  Tan: "tan",
  Cosec: "cosec",
  Sec: "sec",
  Cot: "cot",
} as const;
export type Ratio = (typeof Ratio)[keyof typeof Ratio];

/** The six ratios in NCERT's order. */
export const RATIOS: readonly Ratio[] = [
  Ratio.Sin,
  Ratio.Cos,
  Ratio.Tan,
  Ratio.Cosec,
  Ratio.Sec,
  Ratio.Cot,
];

/** The angles of Table 8.1. */
export const SPECIAL_ANGLES = [0, 30, 45, 60, 90] as const;
export type SpecialAngle = (typeof SPECIAL_ANGLES)[number];

/** Sides of a right triangle relative to one of its acute angles. */
export const Side = {
  Opposite: "opposite",
  Adjacent: "adjacent",
  Hypotenuse: "hypotenuse",
} as const;
export type Side = (typeof Side)[keyof typeof Side];

export const SIDE_WORDS: Record<Side, Words> = {
  [Side.Opposite]: { en: "opposite", hi: "सम्मुख भुजा" },
  [Side.Adjacent]: { en: "adjacent", hi: "संलग्न भुजा" },
  [Side.Hypotenuse]: { en: "hypotenuse", hi: "कर्ण" },
};

/** Which side over which side each ratio is. */
export const RATIO_SIDES: Record<Ratio, readonly [Side, Side]> = {
  [Ratio.Sin]: [Side.Opposite, Side.Hypotenuse],
  [Ratio.Cos]: [Side.Adjacent, Side.Hypotenuse],
  [Ratio.Tan]: [Side.Opposite, Side.Adjacent],
  [Ratio.Cosec]: [Side.Hypotenuse, Side.Opposite],
  [Ratio.Sec]: [Side.Hypotenuse, Side.Adjacent],
  [Ratio.Cot]: [Side.Adjacent, Side.Opposite],
};

/** The ratio of the complementary angle that equals this one: sin A = cos(90° − A), … */
export const PARTNER: Record<Ratio, Ratio> = {
  [Ratio.Sin]: Ratio.Cos,
  [Ratio.Cos]: Ratio.Sin,
  [Ratio.Tan]: Ratio.Cot,
  [Ratio.Cot]: Ratio.Tan,
  [Ratio.Sec]: Ratio.Cosec,
  [Ratio.Cosec]: Ratio.Sec,
};

/** Rounds away floating dust: 0.30000000000000004 → 0.3, −0 → 0. */
export function clean(x: number): number {
  const r = Math.round(x * 1e9) / 1e9;
  return Object.is(r, -0) ? 0 : r;
}

/** Whether two numbers are equal up to `tol` (relative to their size, at least `tol` absolute). */
export function near(a: number, b: number, tol = 1e-9): boolean {
  return Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
}

/** A number as text, at most `dp` decimals, no trailing zeros, minus as −: 1.50 → 1.5. */
export function numText(x: number, dp = 2): string {
  const r = clean(Math.round(x * 10 ** dp) / 10 ** dp);
  return `${r}`.replace("-", "−");
}

export const rad = (deg: number): number => (deg * Math.PI) / 180;
export const deg = (r: number): number => (r * 180) / Math.PI;

/**
 * The value of a ratio of an angle in degrees (0 ≤ θ ≤ 90), or null where it is not defined
 * (tan 90°, sec 90°, cot 0°, cosec 0°). Exact at the special angles.
 */
export function ratioValue(ratio: Ratio, angle: number): number | null {
  const s = angle === 0 ? 0 : angle === 90 ? 1 : angle === 30 ? 0.5 : Math.sin(rad(angle));
  const c = angle === 90 ? 0 : angle === 0 ? 1 : angle === 60 ? 0.5 : Math.cos(rad(angle));
  const t = angle === 45 ? 1 : c === 0 ? null : s / c;
  switch (ratio) {
    case Ratio.Sin:
      return s;
    case Ratio.Cos:
      return c;
    case Ratio.Tan:
      return t;
    case Ratio.Cosec:
      return s === 0 ? null : 1 / s;
    case Ratio.Sec:
      return c === 0 ? null : 1 / c;
    case Ratio.Cot:
      return angle === 45 ? 1 : s === 0 ? null : c / s;
  }
}

/** Table 8.1 in TeX; null is "not defined". */
export const EXACT: Record<SpecialAngle, Record<Ratio, string | null>> = {
  0: { sin: "0", cos: "1", tan: "0", cosec: null, sec: "1", cot: null },
  30: {
    sin: "\\tfrac{1}{2}",
    cos: "\\tfrac{\\sqrt{3}}{2}",
    tan: "\\tfrac{1}{\\sqrt{3}}",
    cosec: "2",
    sec: "\\tfrac{2}{\\sqrt{3}}",
    cot: "\\sqrt{3}",
  },
  45: {
    sin: "\\tfrac{1}{\\sqrt{2}}",
    cos: "\\tfrac{1}{\\sqrt{2}}",
    tan: "1",
    cosec: "\\sqrt{2}",
    sec: "\\sqrt{2}",
    cot: "1",
  },
  60: {
    sin: "\\tfrac{\\sqrt{3}}{2}",
    cos: "\\tfrac{1}{2}",
    tan: "\\sqrt{3}",
    cosec: "\\tfrac{2}{\\sqrt{3}}",
    sec: "2",
    cot: "\\tfrac{1}{\\sqrt{3}}",
  },
  90: { sin: "1", cos: "0", tan: null, cosec: "1", sec: null, cot: "0" },
};

export const isSpecial = (angle: number): angle is SpecialAngle =>
  (SPECIAL_ANGLES as readonly number[]).includes(angle);

/** The value of a ratio as TeX: exact at the special angles, else to 2 decimals; null if undefined. */
export function ratioTex(ratio: Ratio, angle: number): string | null {
  if (isSpecial(angle)) return EXACT[angle][ratio];
  const v = ratioValue(ratio, angle);
  return v === null ? null : numText(v).replace("−", "-");
}

/** √n simplified: 8 → [2, 2] (2√2), 9 → [3, 1], 12 → [2, 3]. */
export function simplifySqrt(n: number): [number, number] {
  let outside = 1;
  let inside = n;
  for (let f = 2; f * f <= inside; f++) {
    while (inside % (f * f) === 0) {
      outside *= f;
      inside /= f * f;
    }
  }
  return [outside, inside];
}

/** √n as TeX, simplified: 8 → 2\sqrt{2}, 9 → 3. */
export function sqrtTex(n: number): string {
  const [out, inside] = simplifySqrt(n);
  if (inside === 1) return `${out}`;
  return `${out === 1 ? "" : out}\\sqrt{${inside}}`;
}

/** A fraction as TeX, reduced: (8, 12) → \tfrac{2}{3}; whole numbers stay whole. */
export function fracTex(num: string | number, den: string | number): string {
  if (typeof num === "number" && typeof den === "number") {
    const g = gcd(Math.abs(num), Math.abs(den));
    const n = num / g;
    const d = den / g;
    return d === 1 ? `${n}` : `\\tfrac{${n}}{${d}}`;
  }
  return den === 1 || den === "1" ? `${num}` : `\\tfrac{${num}}{${den}}`;
}

export function gcd(a: number, b: number): number {
  let x = Math.round(a);
  let y = Math.round(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x === 0 ? 1 : x;
}

/** The TeX name of a ratio of an angle: \sin A, \operatorname{cosec} 30^\circ. */
export function ratioName(ratio: Ratio, angle: string): string {
  const op = ratio === Ratio.Cosec ? "\\operatorname{cosec}" : `\\${ratio}`;
  return `${op} ${angle}`;
}

/** An angle in TeX: 30 → 30^\circ. */
export const degTex = (a: number): string => `${numText(a, 1)}^\\circ`;
