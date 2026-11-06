/**
 * The spherical mirror's laws, in cm on the principal axis, with the New Cartesian sign
 * convention: the pole P is the origin, light travels left to right, distances in front of the
 * mirror are negative (u < 0), heights above the axis positive. A concave mirror's f is negative
 * (F in front), a convex one's positive (F behind). Pure: no drawing, no board.
 */

export const MirrorKind = { Concave: "concave", Convex: "convex" } as const;
export type MirrorKind = (typeof MirrorKind)[keyof typeof MirrorKind];

/** What stands in front of the mirror: a candle (its flame's tip is the top) or an upright arrow. */
export const ObjectKind = { Candle: "candle", Arrow: "arrow" } as const;
export type ObjectKind = (typeof ObjectKind)[keyof typeof ObjectKind];

/** Where the object stands in front of a concave mirror: the rows of the textbook's table. */
export const Place = {
  BeyondC: "beyondC",
  AtC: "atC",
  BetweenCAndF: "betweenCAndF",
  AtF: "atF",
  BetweenFAndP: "betweenFAndP",
} as const;
export type Place = (typeof Place)[keyof typeof Place];

/** Which kind of image the mirror forms: a concave mirror's five places, or any convex one's. */
export const ImageCase = { ...Place, Convex: "convex" } as const;
export type ImageCase = (typeof ImageCase)[keyof typeof ImageCase];

/** The textbook's rays drawn from the object's tip. */
export const RayKind = {
  /** Parallel to the axis; reflected through F (concave) or as if from F behind (convex). */
  Parallel: "parallel",
  /** To the pole P; reflected at the same angle on the other side of the axis. */
  Pole: "pole",
} as const;
export type RayKind = (typeof RayKind)[keyof typeof RayKind];

/** "At C" and "at F" hold within this share of |f|. */
export const AT_SHARE = 0.025;

/** The mirror's half-height, as a share of |f|. */
export const APERTURE = 1.35;

export type Mirror = { kind: MirrorKind; focalLength: number };
export type Setup = Mirror & { u: number; objectHeight: number };

/** The signed focal length: negative for a concave mirror, positive for a convex one. */
export const signedF = ({ kind, focalLength }: Mirror): number =>
  kind === MirrorKind.Concave ? -focalLength : focalLength;

export type Image = {
  /** Image distance, cm: negative in front of the mirror, positive behind. */
  v: number;
  /** m = h′/h = −v/u: negative inverted. */
  m: number;
  /** h′, cm: negative below the axis (inverted). */
  height: number;
  isReal: boolean;
  isErect: boolean;
};

/** The image by 1/v + 1/u = 1/f, or null when the object is at F (the image is at infinity). */
export function imageOf(s: Setup): Image | null {
  const f = signedF(s);
  const u = s.u;
  if (Math.abs(u - f) < 1e-9) return null;
  const v = (u * f) / (u - f);
  const m = -v / u;
  return { v, m, height: m * s.objectHeight, isReal: v < 0, isErect: m > 0 };
}

/** The case the object is in, by its distance from P: "at" within AT_SHARE of |f|. */
export function caseOf(s: Mirror & { u: number }): ImageCase {
  if (s.kind === MirrorKind.Convex) return ImageCase.Convex;
  const d = -s.u;
  const f = s.focalLength;
  const at = AT_SHARE * f;
  if (Math.abs(d - 2 * f) <= at) return ImageCase.AtC;
  if (Math.abs(d - f) <= at) return ImageCase.AtF;
  if (d > 2 * f) return ImageCase.BeyondC;
  if (d > f) return ImageCase.BetweenCAndF;
  return ImageCase.BetweenFAndP;
}

/** Where `placeObject` puts the object for each place, as a distance from P (cm). */
export function distanceFor(place: Place, focalLength: number): number {
  const share: Record<Place, number> = {
    [Place.BeyondC]: 3,
    [Place.AtC]: 2,
    [Place.BetweenCAndF]: 1.5,
    [Place.AtF]: 1,
    [Place.BetweenFAndP]: 0.6,
  };
  return share[place] * focalLength;
}

/** How near and how far from P the object may stand, cm. */
export function rangeOf(s: Mirror): { nearest: number; farthest: number } {
  return {
    nearest: 0.2 * s.focalLength,
    farthest: (s.kind === MirrorKind.Concave ? 3.1 : 2.6) * s.focalLength,
  };
}

/** u kept in range (to the hundredth of a cm). */
export function keepU(s: Mirror, u: number): number {
  const { nearest, farthest } = rangeOf(s);
  const d = Math.min(farthest, Math.max(nearest, -u));
  return -Math.round(d * 100) / 100;
}

/**
 * Where on a straight path from u0 to u1 the image changes case: each place the object crosses a
 * case's edge, as a share of the path (0 to 1), and the case it enters there. In order.
 */
export function crossings(s: Mirror, u0: number, u1: number): { share: number; to: ImageCase }[] {
  if (s.kind === MirrorKind.Convex || u0 === u1) return [];
  const f = s.focalLength;
  const at = AT_SHARE * f;
  const edges = [2 * f + at, 2 * f - at, f + at, f - at].map((d) => -d);
  const toward = Math.sign(u1 - u0);
  return edges
    .filter((e) => (e - u0) * toward > 0 && (u1 - e) * toward > 1e-3)
    .map((e) => {
      // Just past the edge (a thousandth of a cm), so the object is in the new case when told.
      const past = e + toward * 1e-3;
      const share = Math.min(1, (past - u0) / (u1 - u0));
      return { share, to: caseOf({ ...s, u: past }) };
    })
    .sort((a, b) => a.share - b.share);
}

/** The moment (0 to 1) a smooth move has gone this share of its way: smoothstep's inverse. */
export function smoothTimeOf(share: number): number {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (mid * mid * (3 - 2 * mid) < share) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export type Pt = readonly [number, number];

/**
 * The drawn mirror's x at height y: a shallow arc (flatter than a true sphere of radius 2f, as
 * textbooks draw it), its edges toward the light for a concave mirror, away for a convex one.
 * Rays are worked out on the plane through P (the small-aperture picture the formula describes);
 * the arc is what the student sees.
 */
export function surfaceX(s: Mirror, y: number): number {
  const r = 5 * s.focalLength;
  const sag = r - Math.sqrt(Math.max(0, r * r - y * y));
  return s.kind === MirrorKind.Concave ? -sag : sag;
}

/** One ray from the object's tip, as drawn. */
export type RayPath = {
  ray: RayKind;
  /** The object's tip. */
  from: Pt;
  /** Where it meets the mirror's arc. */
  hit: Pt;
  /** Where it meets the plane through P: the rule's own point. */
  paraxialHit: Pt;
  /** The way it leaves, from `hit` (back towards the light, to the picture's edge). */
  out: Pt;
  /** A dashed line behind the mirror, from `hit` to here (to a virtual image, F or C), or none. */
  behind: Pt | null;
};

/** The point on the line from a through b where it reaches x. */
const atX = (a: Pt, b: Pt, x: number): Pt => {
  const dx = b[0] - a[0];
  return Math.abs(dx) < 1e-12 ? b : [x, a[1] + ((b[1] - a[1]) * (x - a[0])) / dx];
};

/**
 * The two rays the textbook draws from the object's tip: parallel to the axis, and to the pole
 * (both meet the mirror however tall the object, so it can be drawn large). Each meets the mirror
 * where the rule says (on the plane through P), is drawn to the arc, and leaves through the image
 * (real), away from it (virtual: dashed back to it), or by its rule when the image is at infinity.
 */
export function raysOf(s: Setup): RayPath[] {
  const f = signedF(s);
  const u = s.u;
  const h = s.objectHeight;
  const from: Pt = [u, h];
  const img = imageOf(s);
  const isAtInfinity = img === null || caseOf(s) === ImageCase.AtF;
  const tip: Pt | null = img === null ? null : [img.v, img.height];
  const isConvex = s.kind === MirrorKind.Convex;

  const ray = (kind: RayKind, y: number, byRule: Pt, aim: number | null): RayPath => {
    const hit: Pt = [surfaceX(s, y), y];
    const paraxialHit: Pt = [0, y];
    if (isAtInfinity || tip === null)
      return { ray: kind, from, hit, paraxialHit, out: byRule, behind: null };
    if (img?.isReal === true)
      return {
        ray: kind,
        from,
        hit,
        paraxialHit,
        out: [tip[0] - hit[0], tip[1] - hit[1]],
        behind: null,
      };
    // Virtual: the ray leaves as if from the image behind the mirror (and from F, convex).
    return {
      ray: kind,
      from,
      hit,
      paraxialHit,
      out: [hit[0] - tip[0], hit[1] - tip[1]],
      behind: aim === null ? tip : atX(hit, tip, aim),
    };
  };

  return [
    // Parallel: concave, reflected through F; convex, as if from F behind.
    ray(RayKind.Parallel, h, [f, -h], isConvex ? f : null),
    // To P: reflected with the axis as the normal, so it leaves towards (u, −h).
    ray(RayKind.Pole, 0, [u, -h], null),
  ];
}

/** The stretch of axis drawn (cm), and the picture's shape. */
export type Window = { xMin: number; xMax: number };

/** The picture's height as a share of its width. */
export const ASPECT = 0.62;
/** Room kept inside the picture's edges, px. */
export const PAD = 8;

/** The axis drawn: from beyond the farthest object to behind the mirror (to C for a convex one). */
export function windowOf(s: Mirror): Window {
  const f = s.focalLength;
  return s.kind === MirrorKind.Concave
    ? { xMin: -3.25 * f, xMax: 1.65 * f }
    : { xMin: -2.8 * f, xMax: 2.1 * f };
}
