/**
 * The physics behind the eye chapter's props, kept apart from drawing so it can be tested.
 *
 * The eye is modelled as one thin lens (cornea + crystalline lens together) a fixed distance in
 * front of the retina, whose power can be raised by accommodation between a relaxed and a fully
 * contracted value. Spectacles are a thin lens in contact with it, so powers simply add (NCERT's
 * own simplification in the exercises).
 */

/** Lens to retina, cm. The eyeball is about 2.3 cm across (NCERT); the lens sits a little inside. */
export const RETINA_CM = 2;
/** The eye's power when it sees an infinitely far object sharply with relaxed muscles: 1/d. */
export const BASE_POWER = 100 / RETINA_CM;
/** A normal young eye: near point 25 cm, far point at infinity. */
export const NORMAL_NEAR_CM = 25;

/** Dioptres of a lens with focal length f cm. */
export const powerOf = (fCm: number): number => 100 / fCm;
/** Focal length (cm) of a lens of P dioptres. */
export const focalOf = (power: number): number => 100 / power;

/** Power the eye (with any spectacles) needs to put an object at u cm (null: far away) on the retina. */
export function neededPower(objectCm: number | null): number {
  return BASE_POWER + (objectCm === null ? 0 : 100 / objectCm);
}

export type EyeRange = {
  /** The eye's own power with its muscles relaxed, dioptres. */
  relaxed: number;
  /** The eye's own power fully accommodated, dioptres. */
  contracted: number;
};

/** The eye's own power range from its far point (null: infinity) and near point, cm. */
export function rangeOf(farCm: number | null, nearCm: number): EyeRange {
  return { relaxed: neededPower(farCm), contracted: neededPower(nearCm) };
}

export const ImageAt = {
  Retina: "retina",
  InFront: "inFront",
  Behind: "behind",
} as const;
export type ImageAt = (typeof ImageAt)[keyof typeof ImageAt];

export type Focus = {
  /** Total power in use (eye + spectacles), dioptres. */
  power: number;
  /** How far the eye's own muscles are working: 0 relaxed, 1 fully contracted. */
  effort: number;
  /** Image distance behind the lens, cm (Infinity if the rays come out parallel). */
  imageCm: number;
  imageAt: ImageAt;
  /** Size of the blurred patch on the retina, as a fraction of the lens opening (0 when sharp). */
  blur: number;
};

/** Within this many dioptres the picture counts as sharp. */
const SHARP_WITHIN = 0.01;

/**
 * How the eye focuses on an object: it adjusts as well as it can (the brain keeps it trying), so
 * the image lands on the retina if any power in its range does it; otherwise it stops at the
 * nearest end of its range and the image lands in front of or behind the retina.
 */
export function focusOn(objectCm: number | null, eye: EyeRange, correction: number | null): Focus {
  const lens = correction ?? 0;
  const lo = eye.relaxed + lens;
  const hi = eye.contracted + lens;
  const need = neededPower(objectCm);
  const power = Math.min(hi, Math.max(lo, need));
  const own = power - lens;
  const span = eye.contracted - eye.relaxed;
  const effort = span <= 0 ? 0 : Math.min(1, Math.max(0, (own - eye.relaxed) / span));
  const vergence = power - (objectCm === null ? 0 : 100 / objectCm);
  const imageCm = vergence <= 0 ? Number.POSITIVE_INFINITY : 100 / vergence;
  const off = power - need;
  const imageAt =
    Math.abs(off) <= SHARP_WITHIN ? ImageAt.Retina : off > 0 ? ImageAt.InFront : ImageAt.Behind;
  const blur =
    imageAt === ImageAt.Retina
      ? 0
      : Number.isFinite(imageCm)
        ? Math.abs(imageCm - RETINA_CM) / imageCm
        : 1;
  return { power, effort, imageCm, imageAt, blur };
}

/** Far point (cm) with spectacles: null if it is at infinity, NaN if nothing far is ever sharp. */
export function farPointWith(eye: EyeRange, correction: number | null): number | null {
  const lo = eye.relaxed + (correction ?? 0) - BASE_POWER;
  const hi = eye.contracted + (correction ?? 0) - BASE_POWER;
  if (hi < 0) return Number.NaN;
  if (lo <= 0) return null;
  return 100 / lo;
}

/** Near point (cm) with spectacles: NaN if nothing at all can be made sharp. */
export function nearPointWith(eye: EyeRange, correction: number | null): number {
  const hi = eye.contracted + (correction ?? 0) - BASE_POWER;
  if (hi < 0) return Number.NaN;
  if (hi === 0) return Number.POSITIVE_INFINITY;
  return 100 / hi;
}

/** The lens that moves a myopic far point (cm) out to infinity: P = −1/far. */
export const myopiaLens = (farCm: number): number => -100 / farCm;
/** The lens that brings a far-sighted near point (cm) in to 25 cm: P = 1/0.25 − 1/near. */
export const hypermetropiaLens = (nearCm: number): number => 100 / NORMAL_NEAR_CM - 100 / nearCm;

/* ------------------------------------------------------------------ */
/* Rays in a plane: refraction at a surface (vector Snell's law)       */
/* ------------------------------------------------------------------ */

export type Vec = readonly [number, number];

export const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1]];
export const scale = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k];
export const dot = (a: Vec, b: Vec): number => a[0] * b[0] + a[1] * b[1];
export const unit = (a: Vec): Vec => {
  const l = Math.hypot(a[0], a[1]);
  return [a[0] / l, a[1] / l];
};
export const deg = (rad: number): number => (rad * 180) / Math.PI;
export const rad = (d: number): number => (d * Math.PI) / 180;
export const rotate = (a: Vec, r: number): Vec => [
  a[0] * Math.cos(r) - a[1] * Math.sin(r),
  a[0] * Math.sin(r) + a[1] * Math.cos(r),
];

/**
 * Direction of a ray after crossing a surface. `d` the incoming direction, `normal` the surface's
 * unit normal (either side), `ratio` = n(from) / n(to). Null if the ray is totally reflected.
 */
export function refract(d: Vec, normal: Vec, ratio: number): Vec | null {
  const dir = unit(d);
  let n = normal;
  let cosI = -dot(n, dir);
  if (cosI < 0) {
    n = scale(n, -1);
    cosI = -cosI;
  }
  const sin2T = ratio * ratio * (1 - cosI * cosI);
  if (sin2T > 1) return null;
  const cosT = Math.sqrt(1 - sin2T);
  return unit(add(scale(dir, ratio), scale(n, ratio * cosI - cosT)));
}

/** Mirror a direction in a surface with unit normal `normal`. */
export function reflect(d: Vec, normal: Vec): Vec {
  return sub(d, scale(normal, 2 * dot(d, normal)));
}

/** Where the ray p + t·d first meets segment a–b (t > tiny), or null. */
export function hitSegment(p: Vec, d: Vec, a: Vec, b: Vec): { t: number; at: Vec } | null {
  const e = sub(b, a);
  const den = d[0] * e[1] - d[1] * e[0];
  if (Math.abs(den) < 1e-12) return null;
  const w = sub(a, p);
  const t = (w[0] * e[1] - w[1] * e[0]) / den;
  const s = (w[0] * d[1] - w[1] * d[0]) / den;
  if (t <= 1e-9 || s < -1e-9 || s > 1 + 1e-9) return null;
  return { t, at: add(p, scale(d, t)) };
}

/** Angle between two directions, degrees (0–180). */
export function angleBetween(a: Vec, b: Vec): number {
  const c = dot(unit(a), unit(b));
  return deg(Math.acos(Math.max(-1, Math.min(1, c))));
}

/* ------------------------------------------------------------------ */
/* The prism                                                            */
/* ------------------------------------------------------------------ */

/** The seven colours of white light, red (bends least) to violet (bends most). */
export const COLOURS = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"] as const;
export type Colour = (typeof COLOURS)[number];

/**
 * Refractive index of the glass for each colour. Real crown glass spreads only about 1.51–1.53;
 * the drawing spreads it more so the fan of colours can be seen on a phone.
 */
export const GLASS_INDEX: Record<Colour, number> = {
  red: 1.47,
  orange: 1.485,
  yellow: 1.5,
  green: 1.515,
  blue: 1.53,
  indigo: 1.545,
  violet: 1.56,
};

/** The same, for water in a raindrop (real: about 1.331–1.343, spread for the drawing). */
export const WATER_INDEX: Record<Colour, number> = {
  red: 1.3,
  orange: 1.315,
  yellow: 1.33,
  green: 1.345,
  blue: 1.36,
  indigo: 1.375,
  violet: 1.39,
};

export type PrismAngles = {
  /** Angle of refraction at the first face, degrees. */
  r1: number;
  /** Angle of incidence at the second face (inside), degrees: A − r1. */
  r2: number;
  /** Angle of emergence, degrees, or null if the ray is trapped (total internal reflection). */
  e: number | null;
  /** Angle of deviation D = i + e − A, degrees, or null. */
  deviation: number | null;
};

/** NCERT's angles for a ray through a prism of angle A (degrees) and index n, at incidence i. */
export function prismAngles(i: number, prismAngle: number, n: number): PrismAngles {
  const r1 = deg(Math.asin(Math.sin(rad(i)) / n));
  const r2 = prismAngle - r1;
  const s = n * Math.sin(rad(r2));
  if (Math.abs(s) > 1) return { r1, r2, e: null, deviation: null };
  const e = deg(Math.asin(s));
  return { r1, r2, e, deviation: i + e - prismAngle };
}

/* ------------------------------------------------------------------ */
/* The atmosphere                                                       */
/* ------------------------------------------------------------------ */

/** Earth's radius and the thickness of air that scatters light, km (round numbers). */
const EARTH_KM = 6371;
const AIR_KM = 100;

/** How far sunlight travels through the air to reach you with the Sun this high, km. */
export function airPathKm(sunHeightDeg: number): number {
  const h = rad(Math.max(0, Math.min(90, sunHeightDeg)));
  const r = EARTH_KM;
  const big = r + AIR_KM;
  // Distance along the line of sight from the ground to the top of the air shell.
  return -r * Math.sin(h) + Math.sqrt(r * r * Math.sin(h) ** 2 + big * big - r * r);
}

export const SunColour = {
  White: "white",
  Yellow: "yellow",
  Orange: "orange",
  Red: "red",
} as const;
export type SunColour = (typeof SunColour)[keyof typeof SunColour];

/** The colour the Sun looks with this much air in the way (more air, more blue scattered off). */
export function sunColourOf(pathKm: number): SunColour {
  const thick = pathKm / AIR_KM;
  if (thick < 1.6) return SunColour.White;
  if (thick < 3.5) return SunColour.Yellow;
  if (thick < 8) return SunColour.Orange;
  return SunColour.Red;
}

/**
 * How strongly air molecules scatter each colour, relative to red (Rayleigh: 1/λ⁴). Red's wavelength
 * is about 1.8 times blue's (NCERT), so blue is scattered about 1.8⁴ ≈ 10 times more.
 */
export const WAVELENGTH_NM: Record<Colour, number> = {
  red: 700,
  orange: 620,
  yellow: 580,
  green: 530,
  blue: 470,
  indigo: 445,
  violet: 400,
};
export const scatterOf = (c: Colour): number => (WAVELENGTH_NM.red / WAVELENGTH_NM[c]) ** 4;
