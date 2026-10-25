import { actionsFor, defineGroup, set } from "@chalk/prop";
import { z } from "zod";
import {
  Look,
  type OpticRay,
  type RayPiece,
  axisPoints,
  bench,
  focalStepper,
  marker,
  opticImage,
  opticObject,
  opticRays,
  opticScreen,
  rayButtons,
  readout,
} from "./bench/kit";
import { curvedMirror, kindToggle, signConvention } from "./bench/mirror-parts";

/**
 * A concave or convex mirror on its principal axis, an upright object in front of it, the
 * textbook's standard rays and the image they form.
 *
 * Only the mirror, the object and what is drawn are stored. The image follows from the mirror
 * formula with the New Cartesian sign convention (the pole is the origin, light travels left to
 * right, so u < 0 and f < 0 for a concave mirror), and each ray from its one rule.
 */

export const MirrorKind = { Concave: "concave", Convex: "convex" } as const;
export type MirrorKind = (typeof MirrorKind)[keyof typeof MirrorKind];

export const Ray = {
  Parallel: "parallel",
  Focal: "focal",
  Centre: "centre",
  Pole: "pole",
} as const;
export type Ray = (typeof Ray)[keyof typeof Ray];

/** Where an object stands, in the textbook's five cases. */
export const Place = {
  BeyondCentre: "beyondCentre",
  AtCentre: "atCentre",
  BetweenCentreAndFocus: "betweenCentreAndFocus",
  AtFocus: "atFocus",
  BetweenFocusAndPole: "betweenFocusAndPole",
} as const;
export type Place = (typeof Place)[keyof typeof Place];

export const SphericalMirrorAction = {
  MoveObject: "moveObject",
  SetHeight: "setHeight",
  SetFocalLength: "setFocalLength",
  SetKind: "setKind",
  PlaceObject: "placeObject",
  ShowRays: "showRays",
  MoveObjectSoImageIsAt: "moveObjectSoImageIsAt",
  MoveScreen: "moveScreen",
  ToggleRay: "toggleRay",
  MoveMark: "moveMark",
} as const;

export const SphericalMirrorSignal = {
  ObjectReleased: "objectReleased",
  ScreenReleased: "screenReleased",
  MarkReleased: "markReleased",
} as const;

export const SphericalMirrorDerived = {
  U: "u",
  F: "f",
  V: "v",
  ImageHeight: "imageHeight",
  Magnification: "magnification",
  IsReal: "isReal",
  IsErect: "isErect",
  PlaceOfObject: "place",
  /** 1/u + 1/v, to check the mirror formula against 1/f. */
  InverseSum: "inverseSum",
  /** |f|, cm. */
  DistanceToF: "distanceToF",
  /** R = |2f|, cm. */
  Radius: "radius",
  /** How out of focus the screen is: the half-height (cm) of the patch the tip's rays make on it. */
  Blur: "blur",
  /** The image is real and the screen stands at it (within SHARP_WITHIN cm). */
  IsSharp: "isSharp",
  /** The learner's "?" mark sits on the image's tip (within MARK_WITHIN cm); false at infinity. */
  MarkOnImage: "markOnImage",
} as const;

export const SphericalMirrorPart = {
  Mirror: "mirror",
  Pole: "pole",
  Focus: "focus",
  Centre: "centre",
  Object: "object",
  Image: "image",
  RayPrefix: "ray:",
  Beam: "beam",
  Readout: "readout",
  Signs: "signs",
  Ruler: "ruler",
  Screen: "screen",
  Mark: "mark",
  RayPicker: "rayPicker",
  FocalStepper: "focalStepper",
  KindToggle: "kindToggle",
} as const;

/** How many parallel rays the sunlight beam has. */
export const BEAM_RAYS = 5;

export const FOCAL = { min: 4, max: 40 } as const;
export const HEIGHT = { min: 1, max: 20 } as const;
/** An "at F" or "at C" counts within this many cm. */
const AT = 0.5;

const raySchema = z.nativeEnum(Ray);
const objectX = z.number().max(-0.5).min(-200);
const sphericalMirrorState = z
  .object({
    kind: z.nativeEnum(MirrorKind),
    /** A magnitude, cm; its sign follows from `kind`. */
    focalLength: z.number().min(FOCAL.min).max(FOCAL.max),
    /** An upright arrow on the axis: its foot at (x, 0), its tip at (x, height). */
    object: z.object({ x: objectX, height: z.number().min(HEIGHT.min).max(HEIGHT.max) }).strict(),
    /** The standard rays drawn, in the order they are listed. */
    rays: z.array(raySchema).max(4),
    showImage: z.boolean(),
    showLabels: z.boolean(),
    /** Sunlight: parallel rays across the aperture instead of the object, its rays and its image. */
    beam: z.boolean(),
    /** A line under the picture: u, v, f (and h, h′) with their New Cartesian signs. */
    showDistances: z.boolean(),
    /** The New Cartesian sign convention drawn at P: +x right, −x left, +y up, −y down, light from the left. */
    showSigns: z.boolean(),
    /** Tick marks along the axis every 5 cm from P, with unsigned cm numbers, to read PF and PC. */
    showRuler: z.boolean(),
    /** Whether the learner can change the focal length (a − / + stepper). */
    canSetFocal: z.boolean(),
    /** Whether the learner can switch the mirror between concave and convex. */
    canSetKind: z.boolean(),
    /**
     * Null: the picture is framed by f (it rescales when f changes). A number: a fixed frame from
     * −span cm to a little behind the pole, so changing f visibly moves F and C along the ruler.
     */
    span: z.number().min(10).max(200).nullable(),
    /** A paper screen standing at this x (cm, in front of the mirror), or null: no screen. */
    screen: z.number().min(-200).max(-0.5).nullable(),
    /** Whether the learner can slide the screen along the axis. */
    canMoveScreen: z.boolean(),
    /** Small "object" / "image" names beside the two arrows. */
    showNames: z.boolean(),
    /** False: just the mirror and its marks (no object, rays or image), for naming the parts. */
    showObject: z.boolean(),
    /** False: F is not marked (for pages before the principal focus is defined). */
    showFocus: z.boolean(),
    /** Draw-it-yourself: buttons 1–4 under the picture switch each standard ray on or off. */
    canPickRays: z.boolean(),
    /** Draw-it-yourself: a "?" the learner drops where they think the image's tip is. */
    markImage: z.boolean(),
    /** Where the "?" stands (cm), or null: at its start, in front near the mirror's top. */
    mark: z
      .object({ x: z.number().min(-200).max(200), y: z.number().min(-60).max(60) })
      .strict()
      .nullable(),
  })
  .strict();
export type SphericalMirrorState = z.infer<typeof sphericalMirrorState>;

/** What fixes the picture's frame: the mirror, and an optional fixed span. */
type Framed = Pick<SphericalMirrorState, "kind" | "focalLength"> & { span?: number | null };
type Geometry = Framed & Pick<SphericalMirrorState, "object">;

/** The screen's half-height, cm: a little taller than the mirror, so the whole patch lands on it. */
export function screenHalf(s: Framed): number {
  return Math.min(windowOf(s).yMax * 0.92, apertureOf(s) * 1.05);
}

/** The "?" counts as on the image's tip within this many cm. */
export const MARK_WITHIN = 1;

/** Where the "?" starts: in front of the mirror, near its top. */
export function markStart(s: Framed): { x: number; y: number } {
  return {
    x: Number((-0.35 * s.focalLength).toFixed(2)),
    y: Number((0.8 * apertureOf(s)).toFixed(2)),
  };
}

/** Where the "?" is now: where the learner left it, or its start. */
export function markOf(s: Geometry & { mark: { x: number; y: number } | null }): {
  x: number;
  y: number;
} {
  return s.mark ?? markStart(s);
}

/** The "?" sits on the image's tip: within MARK_WITHIN cm of it, and the image is finite. */
export function isMarkOnImage(s: Geometry & { mark: { x: number; y: number } | null }): boolean {
  const img = imageOf(s);
  if (img === null) return false;
  const m = markOf(s);
  return Math.hypot(m.x - img.v, m.y - img.height) <= MARK_WITHIN;
}

/** Whether the image arrow is drawn: shown outright, or found by the learner's "?" in draw-it-yourself. */
export function isImageShown(
  s: Geometry & { showImage: boolean; markImage: boolean; mark: { x: number; y: number } | null },
): boolean {
  return s.showImage || (s.markImage && isMarkOnImage(s));
}

/** The screen counts as at the image within this many cm. */
export const SHARP_WITHIN = 0.6;

/**
 * How out of focus a screen at `x` is: the half-height (cm) of the light patch the rays from the
 * object's tip make on it. For a real image the rays from the mirror's edges converge to the image
 * point, so the patch is aperture × |1 − x / v|: zero at the image, growing either side. A virtual
 * image (or one at infinity) never focuses on a screen: the patch is the whole aperture.
 */
export function blurAt(s: Geometry, x: number): number {
  const img = imageOf(s);
  const a = apertureOf(s);
  if (img === null || !img.isReal) return a;
  return Number((a * Math.abs(1 - x / img.v)).toFixed(4));
}

/** The image is real and a screen at `x` catches it sharp. */
export function isSharpAt(s: Geometry, x: number): boolean {
  const img = imageOf(s);
  return img?.isReal === true && Math.abs(x - img.v) <= SHARP_WITHIN;
}

/** A fixed frame's stretch behind the pole, as a share of its span: a little for concave, more for convex. */
const BEHIND = { concave: 0.12, convex: 0.6 } as const;

/** The signed focal length: negative for a concave mirror (F in front), positive for a convex one. */
export function signedF(s: Pick<SphericalMirrorState, "kind" | "focalLength">): number {
  return s.kind === MirrorKind.Concave ? -s.focalLength : s.focalLength;
}

export type Image = {
  /** Image distance, cm: negative in front of the mirror (real), positive behind (virtual). */
  v: number;
  /** Signed: negative means inverted. */
  height: number;
  magnification: number;
  isReal: boolean;
  isErect: boolean;
};

/** The image by the mirror formula 1/v + 1/u = 1/f, or null when it is at infinity. */
export function imageOf(s: Geometry): Image | null {
  const u = s.object.x;
  const f = signedF(s);
  if (Math.abs(u - f) < 1e-9) return null;
  const v = (u * f) / (u - f);
  const magnification = -v / u;
  return {
    v,
    height: magnification * s.object.height,
    magnification,
    isReal: v < 0,
    isErect: magnification > 0,
  };
}

/** Which of the five textbook positions the object is at, by its distance from the pole. */
export function placeOf(s: Geometry): Place {
  const d = -s.object.x;
  const f = s.focalLength;
  if (Math.abs(d - 2 * f) <= AT) return Place.AtCentre;
  if (Math.abs(d - f) <= AT) return Place.AtFocus;
  if (d > 2 * f) return Place.BeyondCentre;
  if (d > f) return Place.BetweenCentreAndFocus;
  return Place.BetweenFocusAndPole;
}

/** Where `placeObject` puts the object for each named position. */
export function xForPlace(f: number, at: Place): number {
  switch (at) {
    case Place.BeyondCentre:
      return -3 * f;
    case Place.AtCentre:
      return -2 * f;
    case Place.BetweenCentreAndFocus:
      return -1.5 * f;
    case Place.AtFocus:
      return -f;
    case Place.BetweenFocusAndPole:
      return -0.5 * f;
  }
}

/** The mirror's half-height as a share of f: small enough that the picture can be drawn large. */
export const APERTURE = 1;

/** How far the mirror reaches above and below the axis, cm: tied to f, capped to fit a fixed frame. */
export function apertureOf(
  s: Pick<SphericalMirrorState, "focalLength"> & { kind?: MirrorKind; span?: number | null },
): number {
  const a = APERTURE * s.focalLength;
  if (s.span === undefined || s.span === null || s.kind === undefined) return a;
  return Math.min(a, fixedYMax(s.span, s.kind) / 1.15);
}

/** A fixed frame's half-height, cm: what the stage's shape leaves for the span across. */
function fixedYMax(span: number, kind: MirrorKind): number {
  const across = span * (1 + BEHIND[kind]);
  return (across * ASPECT) / 2;
}

/**
 * The drawn mirror's x at height y: a shallow arc (drawn flatter than a true sphere of radius 2f,
 * as textbooks do) curving away from the light for a concave mirror, towards it for a convex one.
 * Rays are reflected at the plane through the pole, x = 0, which is the small-aperture (paraxial)
 * picture the mirror formula describes; the arc is only what the student sees.
 */
export function surfaceX(s: Pick<SphericalMirrorState, "kind" | "focalLength">, y: number): number {
  const r = 5 * s.focalLength;
  const sag = r - Math.sqrt(Math.max(0, r * r - y * y));
  if (sag === 0) return 0;
  // Concave: the inside of a sphere centred at C on the left, so the edges come towards the light.
  return s.kind === MirrorKind.Concave ? -sag : sag;
}

export type Point = [number, number];

export type RayPath = {
  /** The object's tip, where every ray starts. */
  from: Point;
  /** Where the ray meets the mirror. */
  hit: Point;
  /** The direction it leaves in (always back towards the light). */
  reflected: Point;
  /** A point in front of the mirror the reflected ray really passes through (F or C), or null. */
  through: Point | null;
  /** The point behind the mirror the incident ray was aimed at (a convex mirror's F or C), or null. */
  aim: Point | null;
  /** Where the reflected ray's dashed extension reaches behind the mirror (the virtual image's tip), or null. */
  extension: Point | null;
  /** The ray would land beyond the mirror's edge (or never meet it), so it isn't drawn. */
  isOffMirror: boolean;
};

/** The ray from the object's tip by its one rule, as the textbook draws it (paraxial). */
export function rayPath(s: Geometry, ray: Ray): RayPath {
  const u = s.object.x;
  const h = s.object.height;
  const f = signedF(s);
  const c = 2 * f;
  const isConvex = s.kind === MirrorKind.Convex;
  const from: Point = [u, h];
  const img = imageOf(s);
  const extension: Point | null = img !== null && !img.isReal ? [img.v, img.height] : null;
  const miss = (hit: Point, reflected: Point): RayPath => ({
    from,
    hit,
    reflected,
    through: null,
    aim: null,
    extension: null,
    isOffMirror: true,
  });
  /** The ray's height where it meets the mirror, aiming at (px, 0). */
  const heightAiming = (px: number): number | null =>
    Math.abs(px - u) < 1e-9 ? null : (h * px) / (px - u);
  // Every ray meets the mirror on the plane through the pole: the paraxial picture.
  const at = (y: number): Point => [0, y];
  // A ray that would land beyond the mirror's edge isn't drawn: pick another one.
  const aperture = apertureOf(s);
  switch (ray) {
    case Ray.Parallel: {
      const hit = at(h);
      if (Math.abs(h) > aperture) return miss(hit, [-1, 0]);
      // Concave: through F. Convex: away from F, as if it came from F behind the mirror.
      const reflected: Point = isConvex ? [hit[0] - f, hit[1]] : [f - hit[0], -hit[1]];
      return {
        from,
        hit,
        reflected,
        through: isConvex ? null : [f, 0],
        aim: null,
        extension,
        isOffMirror: false,
      };
    }
    case Ray.Focal: {
      const y = heightAiming(f);
      if (y === null || Math.abs(y) > aperture) return miss(at(0), [-1, 0]);
      const hit = at(y);
      return {
        from,
        hit,
        reflected: [-1, 0],
        through: null,
        aim: isConvex ? [f, 0] : null,
        extension,
        isOffMirror: false,
      };
    }
    case Ray.Centre: {
      const y = heightAiming(c);
      if (y === null || Math.abs(y) > aperture) return miss(at(0), [-1, 0]);
      const hit = at(y);
      return {
        from,
        hit,
        reflected: [from[0] - hit[0], from[1] - hit[1]],
        through: isConvex ? null : [c, 0],
        aim: isConvex ? [c, 0] : null,
        extension,
        isOffMirror: false,
      };
    }
    case Ray.Pole: {
      const hit: Point = [0, 0];
      return {
        from,
        hit,
        reflected: [u, -h],
        through: null,
        aim: null,
        extension,
        isOffMirror: false,
      };
    }
  }
}

export type Window = { xMin: number; xMax: number; yMax: number };

/** The stage's height as a share of its width: the same shape on every page. */
export const ASPECT = 0.56;
/** The readout line's height under the stage, px (part of the view, below the drawing). */
export const READOUT_HEIGHT = 28;
/** The controls row's height under the stage (and readout), px. */
export const CONTROLS_HEIGHT = 48;
/** Room kept clear inside the stage's edges, px. */
export const PAD = 12;

/** The stretch of axis and height that must fit: the object, F, C, the image and the mirror. */
export function windowOf(s: Framed): Window {
  if (s.span !== undefined && s.span !== null)
    return { xMin: -s.span, xMax: BEHIND[s.kind] * s.span, yMax: fixedYMax(s.span, s.kind) };
  const f = s.focalLength;
  // Fixed for a mirror: from well beyond C to a little behind the pole (further for a convex
  // mirror, whose F and C are behind it). Nothing moves when the object does.
  // Tight, so the arrows read large: just room for an object beyond C (at 3f) on the left.
  // Concave: room behind the mirror for the virtual image of an object inside F (at f/2 → v = f).
  const left = (s.kind === MirrorKind.Concave ? -3.1 : -2.4) * f;
  const right = (s.kind === MirrorKind.Concave ? 1.05 : 2.15) * f;
  const yMax = 1.1 * apertureOf(s);
  return { xMin: left, xMax: right, yMax };
}

/**
 * Pixels at a width, for the view and `locate`: a fixed-shape stage, the drawing scaled uniformly
 * to fit it and centred, so cm are the same size up and across.
 */
export function planeBox(
  s: Framed,
  width: number,
): {
  width: number;
  height: number;
  window: Window;
  /** px per cm */
  scale: number;
  toPixel: (x: number, y: number) => [number, number];
  /** cm across, from a px x */
  toCm: (px: number) => number;
} {
  const window = windowOf(s);
  const height = Math.round(width * ASPECT);
  const span = window.xMax - window.xMin;
  const scale = Math.min((width - 2 * PAD) / span, (height - 2 * PAD) / (2 * window.yMax));
  const left = (width - span * scale) / 2;
  return {
    width,
    height,
    window,
    scale,
    toPixel: (x, y) => [left + (x - window.xMin) * scale, height / 2 - y * scale],
    toCm: (px) => window.xMin + (px - left) / scale,
  };
}

const fmt = (v: number): string => String(Number(v.toFixed(1)));

/** The ruler's tick spacing, cm. */
export const RULER_STEP = 5;

/** Where the ruler's ticks fall: every RULER_STEP cm from P inside the window, P itself left out. */
export function rulerTicks(s: Framed): number[] {
  const w = windowOf(s);
  const out: number[] = [];
  for (let x = -RULER_STEP; x >= w.xMin; x -= RULER_STEP) out.unshift(x);
  for (let x = RULER_STEP; x <= w.xMax; x += RULER_STEP) out.push(x);
  return out;
}

/** The beam's rays: heights across the aperture, evenly spaced, none on the axis's edge. */
export function beamHeights(s: Framed): number[] {
  const a = apertureOf(s) * 0.85;
  return Array.from({ length: BEAM_RAYS }, (_, k) => -a + (2 * a * k) / (BEAM_RAYS - 1));
}

/** A signed cm value the way the readout writes it: "−30", "+15", "0" (1 dp, true minus sign). */
export function signedCm(v: number): string {
  const r = Number(v.toFixed(1));
  if (r === 0) return "0";
  return r < 0 ? `−${fmt(-r)}` : `+${fmt(r)}`;
}

/** The readout line: u, v, f and, with an image, h and h′. With the image hidden, v and h′ are "?". */
export function readoutOf(s: Geometry, isImageShown = true): string {
  const img = imageOf(s);
  const v = !isImageShown ? "?" : img === null ? "∞" : `${signedCm(img.v)} cm`;
  const parts = [`u = ${signedCm(s.object.x)} cm`, `v = ${v}`, `f = ${signedCm(signedF(s))} cm`];
  if (img !== null)
    parts.push(
      `h = ${signedCm(s.object.height)} cm`,
      `h′ = ${isImageShown ? `${signedCm(img.height)} cm` : "?"}`,
    );
  return parts.join("   ");
}

/** The image in words, as the textbook's table has it. */
export function describeImage(s: Geometry, img: Image): string {
  const m = Math.abs(img.magnification);
  const size = Math.abs(m - 1) < 0.02 ? "same size" : m > 1 ? "enlarged" : "diminished";
  const d = Math.abs(img.v);
  const f = s.focalLength;
  const place = !img.isReal
    ? "behind the mirror"
    : Math.abs(d - 2 * f) <= AT
      ? "at C"
      : d > 2 * f
        ? "beyond C"
        : "between F and C";
  const side = img.isReal ? "in front" : "behind the mirror";
  return `${img.isReal ? "real" : "virtual"}, ${img.isErect ? "erect" : "inverted"}, ${size}, ${fmt(d)} cm ${side}${img.isReal ? `, ${place}` : ""}`;
}

const placeWords: Record<Place, string> = {
  [Place.BeyondCentre]: "beyond C",
  [Place.AtCentre]: "at C",
  [Place.BetweenCentreAndFocus]: "between C and F",
  [Place.AtFocus]: "at F",
  [Place.BetweenFocusAndPole]: "between F and P",
};

function describeRay(s: Geometry, ray: Ray): string {
  const path = rayPath(s, ray);
  if (path.isOffMirror) return "misses the mirror";
  const isConvex = s.kind === MirrorKind.Convex;
  switch (ray) {
    case Ray.Parallel:
      return isConvex
        ? "parallel to the axis, reflects as if from F behind the mirror"
        : "parallel to the axis, reflects through F";
    case Ray.Focal:
      return isConvex
        ? "aimed at F behind the mirror, reflects parallel to the axis"
        : "through F, reflects parallel to the axis";
    case Ray.Centre:
      return isConvex
        ? "aimed at C behind the mirror, reflects back along itself"
        : "through C, reflects back along itself";
    case Ray.Pole:
      return "to the pole, reflects at the same angle on the other side of the axis";
  }
}

const act = actionsFor<SphericalMirrorState>();

/** Points sampled along the mirror's face. */
const FACE_STEPS = 24;
/** The standard rays in the textbook's order: the buttons 1–4, with what each says. */
const RAY_BUTTONS = [
  { ray: Ray.Parallel, en: "parallel to the axis", hi: "अक्ष के समानांतर" },
  { ray: Ray.Focal, en: "through F", hi: "F से होकर" },
  { ray: Ray.Centre, en: "through C", hi: "C से होकर" },
  { ray: Ray.Pole, en: "to the pole", hi: "ध्रुव पर" },
];

/** The face the student sees, bottom to top. */
function faceOf(s: SphericalMirrorState): [number, number][] {
  const a = apertureOf(s);
  return Array.from({ length: FACE_STEPS + 1 }, (_, k) => {
    const y = -a + (2 * a * k) / FACE_STEPS;
    return [surfaceX(s, y), y];
  });
}

/**
 * A ray as pieces on the bench. Rays are worked out on the plane through the pole but drawn to the
 * arc the student sees; the reflected line is then aimed through the image itself, so they still
 * meet there.
 */
function rayPiecesOf(s: SphericalMirrorState, ray: Ray): RayPiece[] {
  const path = rayPath(s, ray);
  const img = imageOf(s);
  const hitY = path.hit[1];
  const hit: [number, number] = [surfaceX(s, hitY), hitY];
  const out: RayPiece =
    img !== null && Math.abs(img.v - hit[0]) > 1e-6
      ? { from: hit, toward: [img.v - hit[0], img.height - hit[1]], edge: "left" }
      : { from: hit, via: path.hit, toward: path.reflected, edge: "left" };
  const pieces: RayPiece[] = [{ from: path.from, to: hit }, out];
  if (path.aim !== null) pieces.push({ from: hit, to: path.aim, isDashed: true });
  if (path.extension !== null)
    pieces.push({
      from: hit,
      to: [path.extension[0], ray === Ray.Focal ? hitY : path.extension[1]],
      isDashed: true,
    });
  return pieces;
}

/** The rays drawn: a listed ray that would miss the mirror is swapped for the pole ray. */
function raysOf(s: SphericalMirrorState): OpticRay[] {
  if (s.beam) {
    const f = signedF(s);
    const isConcave = s.kind === MirrorKind.Concave;
    return beamHeights(s).map((y, k): OpticRay => {
      const hit: [number, number] = [surfaceX(s, y), y];
      const out: RayPiece = isConcave
        ? { from: hit, toward: [f - hit[0], -hit[1]], edge: "left", at: 0.35 }
        : { from: hit, via: [f, 0], toward: [hit[0] - f, hit[1]], edge: "left", at: 0.35 };
      return {
        id: `beam${k}`,
        kind: "beam",
        says: "",
        pieces: [
          { from: [hit[0] - 1, y], to: hit, fromLeftEdge: true },
          out,
          ...(isConcave ? [] : [{ from: hit, to: [f, 0] as [number, number], isDashed: true }]),
        ],
      };
    });
  }
  if (!s.showObject) return [];
  const drawn: Ray[] = [];
  for (const ray of s.rays) {
    const want = rayPath(s, ray).isOffMirror ? Ray.Pole : ray;
    if (!drawn.includes(want)) drawn.push(want);
  }
  return drawn.map((ray) => ({
    id: ray,
    kind: "ray",
    says: describeRay(s, ray),
    pieces: rayPiecesOf(s, ray),
  }));
}

/** The two edge rays from the object's tip: to the mirror's edges, then on through a real image. */
function coneOf(s: SphericalMirrorState): RayPiece[] {
  if (s.screen === null || s.beam) return [];
  const a = apertureOf(s);
  const img = imageOf(s);
  const tip: [number, number] = [s.object.x, s.object.height];
  return [a, -a].flatMap((y): RayPiece[] => {
    const edge: [number, number] = [surfaceX(s, y), y];
    return [
      { from: tip, to: edge },
      ...(img?.isReal
        ? [
            {
              from: edge,
              toward: [img.v - edge[0], img.height - edge[1]] as [number, number],
              edge: "left" as const,
            },
          ]
        : []),
    ];
  });
}

function screenWords(s: SphericalMirrorState): string {
  if (s.screen === null) return "";
  const img = imageOf(s);
  const caught =
    img === null
      ? "nothing focuses on it: the image is at infinity"
      : !img.isReal
        ? "only a faint patch of light: the image is virtual, behind the mirror"
        : isSharpAt(s, s.screen)
          ? "a sharp, inverted image of the object"
          : `a blurred patch ${fmt(2 * blurAt(s, s.screen))} cm tall: the rays cross ${s.screen < img.v ? "after passing" : "before reaching"} the screen`;
  return `a screen ${fmt(-s.screen)} cm in front of the mirror${s.canMoveScreen ? " (slide it)" : ""}; on it, ${caught}`;
}

function outsideWords(s: SphericalMirrorState): string {
  const img = imageOf(s);
  if (img === null) return "";
  const where = img.isReal ? "in front" : "behind";
  const size = Math.abs(img.magnification) > 1 ? "enlarged" : "diminished";
  return `image ${Math.round(Math.abs(img.v))} cm ${where}, ${img.isErect ? "erect" : "inverted"}, ${size}: outside the picture`;
}

const hasObject = (s: SphericalMirrorState) => !s.beam && s.showObject;

/**
 * A concave or convex mirror on the optical bench: a group of the optics kit's leaves and its own
 * face. The mirror holds the facts; every leaf shows them, bound; what the learner moves is routed
 * back here.
 */
export const sphericalMirror = defineGroup({
  type: "sphericalMirror",
  describe:
    "A concave or convex mirror on its principal axis with an upright object in front of it: the standard rays (parallel, through F, through C, to the pole) and the image they form, by the mirror formula with the New Cartesian sign convention (u < 0; f < 0 for concave).",
  own: sphericalMirrorState,
  ownDefaults: {
    kind: MirrorKind.Concave,
    focalLength: 10,
    object: { x: -30, height: 4 },
    rays: [Ray.Parallel, Ray.Focal],
    showImage: true,
    showLabels: true,
    beam: false,
    showDistances: false,
    showSigns: false,
    showRuler: false,
    canSetFocal: false,
    canSetKind: false,
    span: null,
    screen: null,
    canMoveScreen: false,
    showNames: true,
    showObject: true,
    showFocus: true,
    canPickRays: false,
    markImage: false,
    mark: null,
  },
  inputs: [
    "showImage",
    "showLabels",
    "beam",
    "showDistances",
    "showSigns",
    "showRuler",
    "canSetFocal",
    "canSetKind",
    "span",
    "canMoveScreen",
    "showNames",
    "showObject",
    "showFocus",
    "canPickRays",
    "markImage",
  ],
  children: {
    bench,
    face: curvedMirror,
    rayLines: opticRays,
    points: axisPoints,
    whiteScreen: opticScreen,
    signs: signConvention,
    imageArrow: opticImage,
    objectArrow: opticObject,
    marker,
    readout,
    kindToggle,
    focal: focalStepper,
    rayButtons,
  },
  is: {
    "bench.window": (s) => windowOf(s),
    "bench.aspect": () => ASPECT,
    "bench.pad": () => PAD,
    "bench.ticks": (s) => (s.showRuler ? rulerTicks(s) : []),
    "bench.label": (s) => {
      const img = imageOf(s);
      return `A ${s.kind} mirror with an object ${Math.round(-s.object.x)} cm in front; ${img === null ? "the image is at infinity" : `the image is ${img.isReal ? "real" : "virtual"}`}`;
    },
    "bench.look": () => Look.Mirror,
    "face.face": (s) => faceOf(s),
    "face.says": (s) =>
      `${s.kind} mirror, f = ${fmt(s.focalLength)} cm, C at ${fmt(2 * s.focalLength)} cm`,
    "rayLines.rays": (s) => raysOf(s),
    "rayLines.spots": (s) =>
      s.beam && s.kind === MirrorKind.Concave ? [[signedF(s), 0] as [number, number]] : [],
    "rayLines.beamSays": (s) =>
      !s.beam
        ? ""
        : `${BEAM_RAYS} rays of sunlight parallel to the principal axis; ${s.kind === MirrorKind.Concave ? "every ray reflects through F, where they meet in a bright spot" : "every ray reflects away, as if it came from F behind the mirror (dashed)"}`,
    "rayLines.look": () => Look.Mirror,
    "points.points": (s) => {
      const f = signedF(s);
      const side = s.kind === MirrorKind.Concave ? "in front" : "behind";
      const all = [
        { id: SphericalMirrorPart.Pole, x: 0, name: "P", says: "P" },
        {
          id: SphericalMirrorPart.Focus,
          x: f,
          name: "F",
          says: `F, ${fmt(s.focalLength)} cm ${side}`,
        },
        {
          id: SphericalMirrorPart.Centre,
          x: 2 * f,
          name: "C",
          says: `C, ${fmt(2 * s.focalLength)} cm ${side}`,
        },
      ];
      return all.filter((p) => s.showFocus || p.name !== "F");
    },
    "points.showNames": (s) => s.showLabels,
    "points.look": () => Look.Mirror,
    "whiteScreen.isShown": (s) => s.screen !== null && !s.beam,
    "whiteScreen.x": (s) => s.screen ?? -10,
    "whiteScreen.half": (s) => screenHalf(s),
    "whiteScreen.canMove": (s) => s.canMoveScreen,
    "whiteScreen.min": (s) => windowOf(s).xMin,
    "whiteScreen.max": () => -0.5,
    "whiteScreen.nudge": () => 1,
    "whiteScreen.caught": (s) => {
      const img = imageOf(s);
      if (s.screen === null || !img?.isReal) return null;
      const height = img.height * (s.screen / img.v);
      return {
        height,
        centre: height,
        blur: blurAt(s, s.screen),
        isSharp: isSharpAt(s, s.screen),
      };
    },
    "whiteScreen.blur": (s) => (s.screen === null ? 0 : blurAt(s, s.screen)),
    "whiteScreen.cone": (s) => coneOf(s),
    "whiteScreen.says": (s) => screenWords(s),
    "whiteScreen.look": () => Look.Mirror,
    "signs.isShown": (s) => s.showSigns,
    "imageArrow.isShown": (s) => hasObject(s) && isImageShown(s),
    "imageArrow.tip": (s) => {
      const img = imageOf(s);
      return img === null ? null : { x: img.v, height: img.height, isReal: img.isReal };
    },
    "imageArrow.isDim": () => false,
    "imageArrow.showName": (s) => s.showNames,
    "imageArrow.whenOutside": (s) => outsideWords(s),
    "imageArrow.whenInfinite": () => "image at infinity",
    "imageArrow.says": (s) => {
      const img = imageOf(s);
      return img === null ? "" : describeImage(s, img);
    },
    "imageArrow.look": () => Look.Mirror,
    "objectArrow.isShown": (s) => hasObject(s),
    "objectArrow.x": (s) => s.object.x,
    "objectArrow.height": (s) => s.object.height,
    "objectArrow.name": (s) => (s.showNames ? "object" : null),
    "objectArrow.min": (s) => windowOf(s).xMin + 0.15 * s.focalLength,
    "objectArrow.max": () => -0.5,
    "objectArrow.nudge": () => 1,
    "objectArrow.says": (s) =>
      `${fmt(-s.object.x)} cm in front, ${fmt(s.object.height)} cm tall, ${placeWords[placeOf(s)]}`,
    "objectArrow.look": () => Look.Mirror,
    "marker.isShown": (s) => !s.beam && s.markImage,
    "marker.at": (s) => markOf(s),
    "marker.isRight": (s) => isImageShown(s) && isMarkOnImage(s),
    "marker.hideWhenRight": () => true,
    "marker.bounds": (s) => {
      const w = windowOf(s);
      return { xMin: w.xMin, xMax: w.xMax, yMin: -w.yMax, yMax: w.yMax };
    },
    "marker.says": (s) => {
      const m = markOf(s);
      return `the learner's ? mark at (${fmt(m.x)}, ${fmt(m.y)}) cm${isMarkOnImage(s) ? ": on the image's tip" : s.mark === null ? ": not moved yet" : ": not on the image's tip"}`;
    },
    "marker.look": () => Look.Mirror,
    "readout.text": (s) =>
      !s.showDistances
        ? null
        : s.beam
          ? `f = ${signedCm(signedF(s))} cm`
          : readoutOf(s, isImageShown(s)),
    "readout.look": () => Look.Mirror,
    "kindToggle.isShown": (s) => s.canSetKind,
    "kindToggle.kind": (s) => s.kind,
    "focal.isShown": (s) => s.canSetFocal,
    "focal.value": (s) => s.focalLength,
    "focal.min": () => FOCAL.min,
    "focal.max": () => FOCAL.max,
    "focal.look": () => Look.Mirror,
    "rayButtons.isShown": (s) => s.canPickRays && !s.beam,
    "rayButtons.buttons": () => RAY_BUTTONS,
    "rayButtons.on": (s) => s.rays,
    "rayButtons.look": () => Look.Mirror,
  },
  route: {
    "objectArrow.move": (_s, a) => [[SphericalMirrorAction.MoveObject, { x: a.x }]],
    "whiteScreen.move": (_s, a) => [[SphericalMirrorAction.MoveScreen, { x: a.x }]],
    "marker.move": (_s, a) => [[SphericalMirrorAction.MoveMark, { x: a.x, y: a.y }]],
    "rayButtons.toggle": (_s, a) => [[SphericalMirrorAction.ToggleRay, { ray: a.ray }]],
    "focal.change": (_s, a) => [[SphericalMirrorAction.SetFocalLength, { f: a.to }]],
    "kindToggle.set": (_s, a) => [[SphericalMirrorAction.SetKind, { kind: a.kind }]],
  },
  derived: {
    [SphericalMirrorDerived.U]: {
      describe: "Object distance u (cm, negative)",
      compute: (s) => s.object.x,
    },
    [SphericalMirrorDerived.F]: {
      describe: "Focal length f with its sign (cm)",
      compute: (s) => signedF(s),
    },
    [SphericalMirrorDerived.V]: {
      describe: "Image distance v (cm; negative in front, positive behind), or null at infinity",
      compute: (s) => imageOf(s)?.v ?? null,
    },
    [SphericalMirrorDerived.ImageHeight]: {
      describe: "Image height h' (cm; negative when inverted), or null at infinity",
      compute: (s) => imageOf(s)?.height ?? null,
    },
    [SphericalMirrorDerived.Magnification]: {
      describe: "Magnification m = h'/h = -v/u, or null at infinity",
      compute: (s) => imageOf(s)?.magnification ?? null,
    },
    [SphericalMirrorDerived.IsReal]: {
      describe: "The image is real (in front)",
      compute: (s) => imageOf(s)?.isReal ?? false,
    },
    [SphericalMirrorDerived.IsErect]: {
      describe: "The image is erect",
      compute: (s) => imageOf(s)?.isErect ?? false,
    },
    [SphericalMirrorDerived.PlaceOfObject]: {
      describe:
        "Where the object stands: beyondCentre, atCentre, betweenCentreAndFocus, atFocus or betweenFocusAndPole",
      compute: (s) => placeOf(s),
    },
    [SphericalMirrorDerived.InverseSum]: {
      describe: "1/u + 1/v (cm⁻¹, 4 dp), or null at infinity: equal to 1/f by the mirror formula",
      compute: (s) => {
        const img = imageOf(s);
        if (img === null) return null;
        const v = Number((1 / s.object.x + 1 / img.v).toFixed(4));
        return Object.is(v, -0) ? 0 : v;
      },
    },
    [SphericalMirrorDerived.Blur]: {
      describe:
        "Null with no screen; else the half-height (cm) of the patch the tip's rays make on the screen: 0 when the screen is at a real image, the whole aperture for a virtual image",
      compute: (s) => (s.screen === null ? null : blurAt(s, s.screen)),
    },
    [SphericalMirrorDerived.IsSharp]: {
      describe: "The screen catches a sharp image: the image is real and the screen is at it",
      compute: (s) => s.screen !== null && isSharpAt(s, s.screen),
    },
    [SphericalMirrorDerived.MarkOnImage]: {
      describe:
        "The learner's ? mark is within 1 cm of the image's tip (false when the image is at infinity, or with no mark game)",
      compute: (s) => s.markImage && isMarkOnImage(s),
    },
    [SphericalMirrorDerived.DistanceToF]: {
      describe: "|f|, the distance from P to F (cm)",
      compute: (s) => s.focalLength,
    },
    [SphericalMirrorDerived.Radius]: {
      describe: "R = 2|f|, the distance from P to C (cm)",
      compute: (s) => 2 * s.focalLength,
    },
  },
  actions: {
    [SphericalMirrorAction.MoveObject]: act({
      describe:
        "Move the object to x cm (negative: in front of the pole); its height, the mirror and the rays stay",
      byLearner: true,
      args: z.object({ x: objectX }).strict(),
      run: (s, a) => set({ object: { x: a.x, height: s.object.height } }),
    }),
    [SphericalMirrorAction.SetHeight]: act({
      describe: "Set the object's height (cm); where it stands stays",
      args: z.object({ height: z.number().min(HEIGHT.min).max(HEIGHT.max) }).strict(),
      run: (s, a) => set({ object: { x: s.object.x, height: a.height } }),
    }),
    [SphericalMirrorAction.SetFocalLength]: act({
      describe: "Set the focal length's magnitude (cm); the object stays where it is",
      byLearner: true,
      args: z.object({ f: z.number().min(FOCAL.min).max(FOCAL.max) }).strict(),
      run: (_s, a) => set({ focalLength: a.f }),
    }),
    [SphericalMirrorAction.SetKind]: act({
      describe: "Make the mirror concave or convex; everything else stays",
      byLearner: true,
      args: z.object({ kind: z.nativeEnum(MirrorKind) }).strict(),
      run: (_s, a) => set({ kind: a.kind }),
    }),
    [SphericalMirrorAction.PlaceObject]: act({
      describe:
        "Put the object at one of the textbook's positions by name (beyondCentre, atCentre, betweenCentreAndFocus, atFocus, betweenFocusAndPole)",
      args: z.object({ at: z.nativeEnum(Place) }).strict(),
      run: (s, a) =>
        set({ object: { x: xForPlace(s.focalLength, a.at), height: s.object.height } }),
    }),
    [SphericalMirrorAction.ShowRays]: act({
      describe: "Choose which standard rays are drawn (parallel, focal, centre, pole)",
      args: z.object({ rays: z.array(raySchema).max(4) }).strict(),
      run: (_s, a) => set({ rays: [...new Set(a.rays)] }),
    }),
    [SphericalMirrorAction.ToggleRay]: act({
      describe: "Switch one standard ray on or off (the learner's ray buttons 1–4)",
      byLearner: true,
      args: z.object({ ray: raySchema }).strict(),
      run: (s, a) => {
        const on = s.rays.includes(a.ray);
        const rays = on ? s.rays.filter((r) => r !== a.ray) : [...s.rays, a.ray];
        // Keep the textbook's order: parallel, focal, centre, pole.
        const order = Object.values(Ray);
        return set({ rays: order.filter((r) => rays.includes(r)) });
      },
    }),
    [SphericalMirrorAction.MoveMark]: act({
      describe: "Put the learner's ? mark at (x, y) cm: where they think the image's tip is",
      byLearner: true,
      args: z.object({ x: z.number().min(-200).max(200), y: z.number().min(-60).max(60) }).strict(),
      run: (s, a) => {
        const w = windowOf(s);
        const x = Math.min(w.xMax, Math.max(w.xMin, a.x));
        const y = Math.min(w.yMax, Math.max(-w.yMax, a.y));
        return set({ mark: { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) } });
      },
    }),
    [SphericalMirrorAction.MoveObjectSoImageIsAt]: act({
      describe:
        "Move the object so the image forms at v cm (the inverse of the mirror formula; gives the answer away)",
      reveals: true,
      args: z.object({ v: z.number() }).strict(),
      run: (s, a) => {
        const f = signedF(s);
        if (Math.abs(a.v - f) < 1e-9) return set({});
        const u = (f * a.v) / (a.v - f);
        if (!Number.isFinite(u) || u > -0.5 || u < -200) return set({});
        return set({ object: { x: u, height: s.object.height } });
      },
    }),
    [SphericalMirrorAction.MoveScreen]: act({
      describe:
        "Slide the screen to x cm (in front of the mirror, kept inside the picture); puts one there if there is none",
      byLearner: true,
      args: z.object({ x: z.number().max(-0.5).min(-200) }).strict(),
      run: (s, a) => {
        const w = windowOf(s);
        const x = Math.min(-0.5, Math.max(w.xMin, a.x));
        return set({ screen: Number(x.toFixed(2)) });
      },
    }),
  },
  summary: (s) => {
    const f = s.focalLength;
    if (s.beam) {
      const where =
        s.kind === MirrorKind.Concave
          ? "every ray reflects through F, where they meet in a bright spot"
          : "every ray reflects away, as if it came from F behind the mirror (dashed)";
      return `a ${s.kind} mirror (f = ${fmt(f)} cm) in sunlight: ${BEAM_RAYS} parallel rays; ${where}`;
    }
    const img = imageOf(s);
    const where =
      img === null
        ? "the image is at infinity (the object is at F)"
        : isImageShown(s)
          ? `the image is ${describeImage(s, img)}`
          : "the image is not drawn";
    return `a ${s.kind} mirror (f = ${fmt(f)} cm) with a ${fmt(s.object.height)} cm object ${fmt(-s.object.x)} cm in front, ${placeWords[placeOf(s)]}; ${s.rays.length} ray(s) drawn; ${where}`;
  },
  hidden: (s) => {
    const img = imageOf(s);
    if (s.beam || img === null || isImageShown(s)) return undefined;
    return { image: { v: img.v, height: img.height, magnification: img.magnification } };
  },
  layout: {
    kind: "frame",
    provider: "bench",
    children: [
      "face",
      "rayLines",
      "points",
      "whiteScreen",
      "signs",
      "imageArrow",
      "objectArrow",
      "marker",
    ],
    below: ["readout", "kindToggle", "focal", "rayButtons"],
  },
});
