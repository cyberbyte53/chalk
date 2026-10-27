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
import { lensCard, thinLens } from "./bench/lens-parts";

/**
 * A thin convex or concave lens on its principal axis, an upright object to its left, the
 * textbook's standard rays and the image they form.
 *
 * Only the lens, the object and what is drawn are stored. The image follows from the lens formula
 * 1/v − 1/u = 1/f with the New Cartesian sign convention (the optical centre O is the origin, light
 * travels left to right, so u < 0, f > 0 for a convex lens and f < 0 for a concave one), and each
 * ray from its one rule. Rays bend once, at the plane through O: the thin-lens (paraxial) picture.
 */

export const LensKind = { Convex: "convex", Concave: "concave" } as const;
export type LensKind = (typeof LensKind)[keyof typeof LensKind];

export const LensRay = {
  Parallel: "parallel",
  Focal: "focal",
  Centre: "centre",
} as const;
export type LensRay = (typeof LensRay)[keyof typeof LensRay];

/** The textbook's positions of the object, by its distance from O against f and 2f. */
export const LensPlace = {
  BeyondTwoF: "beyondTwoF",
  AtTwoF: "atTwoF",
  BetweenTwoFAndF: "betweenTwoFAndF",
  AtF: "atF",
  BetweenFAndO: "betweenFAndO",
} as const;
export type LensPlace = (typeof LensPlace)[keyof typeof LensPlace];

export const LensCover = { None: "none", Top: "top", Bottom: "bottom" } as const;
export type LensCover = (typeof LensCover)[keyof typeof LensCover];

export const LensAction = {
  MoveObject: "moveObject",
  SetHeight: "setHeight",
  SetFocalLength: "setFocalLength",
  SetKind: "setKind",
  PlaceObject: "placeObject",
  ShowRays: "showRays",
  Cover: "cover",
  MoveScreen: "moveScreen",
  ToggleRay: "toggleRay",
  MoveMark: "moveMark",
} as const;

export const LensSignal = {
  ObjectReleased: "objectReleased",
  ScreenReleased: "screenReleased",
  MarkReleased: "markReleased",
} as const;

export const LensDerived = {
  U: "u",
  F: "f",
  V: "v",
  ImageHeight: "imageHeight",
  Magnification: "magnification",
  IsReal: "isReal",
  IsErect: "isErect",
  PlaceOfObject: "place",
  Power: "power",
  Blur: "blur",
  IsSharp: "isSharp",
  MarkOnImage: "markOnImage",
} as const;

export const LensPart = {
  Lens: "lens",
  Centre: "centre",
  F1: "f1",
  F2: "f2",
  TwoF1: "twoF1",
  TwoF2: "twoF2",
  Object: "object",
  Image: "image",
  Readout: "readout",
  Screen: "screen",
  Mark: "mark",
  RayPrefix: "ray:",
} as const;

export const LENS_FOCAL = { min: 4, max: 40 } as const;
export const LENS_HEIGHT = { min: 1, max: 20 } as const;
/** How the object is drawn: an upright arrow, or a phone held upside down, its screen to the lens. */
export const LensObjectStyle = { Arrow: "arrow", Phone: "phone" } as const;
export type LensObjectStyle = (typeof LensObjectStyle)[keyof typeof LensObjectStyle];
/** The screen catches a sharp picture within this many cm of the image. */
export const SHARP_WITHIN = 0.6;
const screenX = z.number().min(0.5).max(200);
/** The "?" marker counts as on the image's tip within this many cm. */
export const MARK_WITHIN = 1;
const markSchema = z
  .object({ x: z.number().min(-200).max(200), y: z.number().min(-100).max(100) })
  .strict();
/** An "at F" or "at 2F" counts within this many cm. */
const AT = 0.5;

const raySchema = z.nativeEnum(LensRay);
const objectX = z.number().max(-0.5).min(-200);
const lensState = z
  .object({
    kind: z.nativeEnum(LensKind),
    /** A magnitude, cm; its sign follows from `kind`. */
    focalLength: z.number().min(LENS_FOCAL.min).max(LENS_FOCAL.max),
    /** An upright arrow on the axis: its foot at (x, 0), its tip at (x, height). */
    object: z
      .object({ x: objectX, height: z.number().min(LENS_HEIGHT.min).max(LENS_HEIGHT.max) })
      .strict(),
    /** The standard rays drawn from the object's tip, in the order listed. */
    rays: z.array(raySchema).max(3),
    /** Sunlight: parallel rays across the lens instead of the object, its rays and its image. */
    beam: z.boolean(),
    showImage: z.boolean(),
    showLabels: z.boolean(),
    /** The readout under the picture: u, v and f with their signs. */
    showDistances: z.boolean(),
    /** Whether the learner can change f (a − / + under the picture). */
    canSetFocal: z.boolean(),
    /** Half the lens covered by a black card (NCERT Exercise 9). */
    cover: z.nativeEnum(LensCover),
    /**
     * Null: the picture scales with f. A number: the axis always shows −span to +span cm (and the
     * lens keeps one size), so changing f visibly moves F along it.
     */
    span: z.number().min(10).max(200).nullable(),
    /** A white screen on the far side at x cm (> 0), catching what the lens makes; null: none. */
    screen: screenX.nullable(),
    /** Whether the learner can slide the screen along the axis. */
    canMoveScreen: z.boolean(),
    objectStyle: z.nativeEnum(LensObjectStyle),
    /** Small "object" / "image" labels beside the two arrows. */
    showNames: z.boolean(),
    /** The two spheres whose pieces make the lens's surfaces, with their centres C₁ and C₂. */
    showCentres: z.boolean(),
    /** False: the foci (F₁, F₂, 2F₁, 2F₂) are not marked, only O (for a busy picture). */
    showFocus: z.boolean(),
    /** Buttons 1 2 3 under the picture that switch the parallel, focal and centre rays on and off. */
    canPickRays: z.boolean(),
    /** A "?" marker the learner drops where they think the image's tip is. */
    markImage: z.boolean(),
    /** Where the marker is, cm; null: not yet moved (it waits in a corner). */
    mark: markSchema.nullable(),
  })
  .strict();
export type LensState = z.infer<typeof lensState>;

/** The fixed window, when there is one (older states have no `span`). */
type Span = { span?: number | null };
type Geometry = Pick<LensState, "kind" | "focalLength" | "object"> & Span;

/** The signed focal length: positive for a convex lens, negative for a concave one. */
export function signedLensF(s: Pick<LensState, "kind" | "focalLength">): number {
  return s.kind === LensKind.Convex ? s.focalLength : -s.focalLength;
}

export type LensImage = {
  /** Image distance, cm: positive on the far side of the lens (real), negative on the object's side (virtual). */
  v: number;
  /** Signed: negative means inverted. */
  height: number;
  magnification: number;
  isReal: boolean;
  isErect: boolean;
};

/** The image by the lens formula 1/v − 1/u = 1/f, or null when it is at infinity. */
export function lensImageOf(s: Geometry): LensImage | null {
  const u = s.object.x;
  const f = signedLensF(s);
  if (Math.abs(u + f) < 1e-9) return null;
  const v = (u * f) / (u + f);
  const magnification = v / u;
  return {
    v,
    height: magnification * s.object.height,
    magnification,
    isReal: v > 0,
    isErect: magnification > 0,
  };
}

/** Which of the five textbook positions the object is at, by its distance from O. */
export function lensPlaceOf(s: Geometry): LensPlace {
  const d = -s.object.x;
  const f = s.focalLength;
  if (Math.abs(d - 2 * f) <= AT) return LensPlace.AtTwoF;
  if (Math.abs(d - f) <= AT) return LensPlace.AtF;
  if (d > 2 * f) return LensPlace.BeyondTwoF;
  if (d > f) return LensPlace.BetweenTwoFAndF;
  return LensPlace.BetweenFAndO;
}

/** Where `placeObject` puts the object for each named position. */
export function lensXForPlace(f: number, at: LensPlace): number {
  switch (at) {
    case LensPlace.BeyondTwoF:
      return -3 * f;
    case LensPlace.AtTwoF:
      return -2 * f;
    case LensPlace.BetweenTwoFAndF:
      return -1.5 * f;
    case LensPlace.AtF:
      return -f;
    case LensPlace.BetweenFAndO:
      return -0.5 * f;
  }
}

/** The power in dioptres: 1/f with f in metres, to 2 dp. */
export function powerOf(s: Pick<LensState, "kind" | "focalLength">): number {
  return Math.round((100 / signedLensF(s)) * 100) / 100;
}

/** How far the lens reaches above and below the axis, cm. */
export function lensApertureOf(s: Pick<LensState, "focalLength"> & Span): number {
  return s.span == null ? s.focalLength : 0.3 * s.span;
}

export type LensPoint = [number, number];

export type LensRayPath = {
  /** Where the ray starts: the object's tip, or the left edge for a beam ray. */
  from: LensPoint;
  /** Where it meets the lens (on the plane through O). */
  hit: LensPoint;
  /** The direction it leaves in, always to the right. */
  out: LensPoint;
  /** A dashed line from here to `from`: the ray seems to come from F₁ (object inside F). */
  source: LensPoint | null;
  /** A dashed line from the hit on to here: the point on the far side the ray was aimed at. */
  aim: LensPoint | null;
  /** A dashed line from the hit back to here: the emerging ray traced backwards (virtual image, or F₁). */
  back: LensPoint | null;
  /** It lands beyond the lens's edge, or under the card, so it isn't drawn. */
  isOff: boolean;
};

/** Whether a ray meeting the lens at height y is blocked by the card. */
export function isCovered(s: Pick<LensState, "cover">, y: number): boolean {
  if (s.cover === LensCover.Top) return y > 1e-9;
  if (s.cover === LensCover.Bottom) return y < -1e-9;
  return false;
}

/** The ray from the object's tip by its one rule, as the textbook draws it. */
export function lensRayPath(s: Geometry & Pick<LensState, "cover">, ray: LensRay): LensRayPath {
  const u = s.object.x;
  const h = s.object.height;
  const f = signedLensF(s);
  const isConvex = s.kind === LensKind.Convex;
  const from: LensPoint = [u, h];
  const img = lensImageOf(s);
  const tip: LensPoint | null = img === null ? null : [img.v, img.height];
  const aperture = lensApertureOf(s);
  const off = (hit: LensPoint): LensRayPath => ({
    from,
    hit,
    out: [1, 0],
    source: null,
    aim: null,
    back: null,
    isOff: true,
  });
  /** The emerging ray traced back, for a virtual image: to the image's tip. */
  const backToImage = (): LensPoint | null => (tip !== null && !img?.isReal ? tip : null);
  switch (ray) {
    case LensRay.Parallel: {
      const hit: LensPoint = [0, h];
      if (Math.abs(h) > aperture || isCovered(s, h)) return off(hit);
      // Convex: on through F₂. Concave: away from F₁, as if it came from F₁.
      const out: LensPoint = isConvex ? [f, -h] : [-f, h];
      return {
        from,
        hit,
        out,
        source: null,
        aim: null,
        back: isConvex ? backToImage() : [f, 0],
        isOff: false,
      };
    }
    case LensRay.Focal: {
      // Through F₁ (convex), or aimed at F₂ on the far side (concave): either way the line
      // through the tip and the point (−f, 0), which meets the lens at y = h f / (u + f).
      if (Math.abs(u + f) < 1e-9) return off([0, 0]);
      const y = (h * f) / (u + f);
      const hit: LensPoint = [0, y];
      if (Math.abs(y) > aperture || isCovered(s, y)) return off(hit);
      // Convex with the object inside F: the ray seems to come from F₁, behind the object.
      const isInsideF = isConvex && -u < f;
      return {
        from,
        hit,
        out: [1, 0],
        source: isInsideF ? [-f, 0] : null,
        aim: isConvex ? null : [-f, 0],
        back: backToImage(),
        isOff: false,
      };
    }
    case LensRay.Centre: {
      const hit: LensPoint = [0, 0];
      if (s.cover !== LensCover.None) return off(hit);
      // Straight on, undeviated. A virtual image on this line is behind the object only for a
      // convex lens; a concave lens's lies between the object and O, on the ray itself.
      const b = backToImage();
      return {
        from,
        hit,
        out: [-u, -h],
        source: null,
        aim: null,
        back: b !== null && Math.abs(b[0]) > Math.abs(u) ? b : null,
        isOff: false,
      };
    }
  }
}

/**
 * Extra rays from the tip through the open half when a card covers the other: the image still
 * forms, from fewer rays. Each leaves through the image's tip (real), away from it (virtual), or
 * parallel to the undeviated ray (image at infinity).
 */
export function spareRays(s: Geometry & Pick<LensState, "cover">): LensRayPath[] {
  if (s.cover === LensCover.None) return [];
  const a = lensApertureOf(s);
  const sign = s.cover === LensCover.Top ? -1 : 1;
  const img = lensImageOf(s);
  const u = s.object.x;
  const h = s.object.height;
  return [0.35, 0.75].map((k): LensRayPath => {
    const hit: LensPoint = [0, sign * k * a];
    const out: LensPoint =
      img === null
        ? [-u, -h]
        : img.isReal
          ? [img.v - hit[0], img.height - hit[1]]
          : [hit[0] - img.v, hit[1] - img.height];
    return {
      from: [u, h],
      hit,
      out,
      source: null,
      aim: null,
      back: img !== null && !img.isReal ? [img.v, img.height] : null,
      isOff: false,
    };
  });
}

/** Sunlight: five parallel rays across the open part of the lens, from the left edge. */
export function beamRays(
  s: Pick<LensState, "kind" | "focalLength" | "cover"> & Span,
): LensRayPath[] {
  const f = signedLensF(s);
  const a = lensApertureOf(s);
  const isConvex = s.kind === LensKind.Convex;
  const left = lensWindowOf(s).xMin;
  return [-0.8, -0.4, 0, 0.4, 0.8]
    .map((k) => k * a)
    .filter((y) => !isCovered(s, y))
    .map(
      (y): LensRayPath => ({
        from: [left, y],
        hit: [0, y],
        out: Math.abs(y) < 1e-9 ? [1, 0] : isConvex ? [f, -y] : [-f, y],
        source: null,
        aim: null,
        back: !isConvex && Math.abs(y) > 1e-9 ? [f, 0] : null,
        isOff: false,
      }),
    );
}

export type LensWindow = { xMin: number; xMax: number; yMax: number };

/** The stage's height as a share of its width: the same shape on every page. */
export const LENS_ASPECT = 0.6;
/** Room kept clear inside the stage's edges, px. */
export const LENS_PAD = 8;

type WindowInput = Pick<LensState, "kind" | "focalLength"> &
  Span &
  Partial<Pick<LensState, "object" | "beam" | "screen">>;

/** How far, in f, the picture may reach along the axis either way when it follows the object. */
const REACH = 4;

/**
 * The stretch of axis and height that must fit. With a span: fixed. Without one, the picture is
 * framed tightly around what matters (O, both F's and 2F's, the object, the image and the screen),
 * so the arrows stay big on a phone; it zooms out as the object moves away and back in as it
 * comes near.
 */
export function lensWindowOf(s: WindowInput): LensWindow {
  if (s.span != null) return { xMin: -s.span, xMax: s.span, yMax: s.span * LENS_ASPECT };
  const f = s.focalLength;
  const a = lensApertureOf(s);
  if (s.beam || s.object === undefined) return { xMin: -2.6 * f, xMax: 2.6 * f, yMax: 1.1 * a };
  const margin = 0.25 * f;
  let xMin = Math.min(-2.15 * f, s.object.x - margin);
  let xMax = 2.15 * f;
  let yMax = Math.max(1.1 * a, s.object.height + 0.3 * f);
  const img = lensImageOf({ kind: s.kind, focalLength: f, object: s.object });
  if (img !== null) {
    const fits = img.isReal ? img.v + margin <= REACH * f : img.v - margin >= -REACH * f;
    if (img.isReal) xMax = Math.max(xMax, Math.min(img.v + margin, REACH * f));
    else xMin = Math.min(xMin, Math.max(img.v - margin, -REACH * f));
    if (fits) yMax = Math.max(yMax, Math.min(Math.abs(img.height) + 0.3 * f, 2.5 * f));
  }
  if (s.screen != null) xMax = Math.max(xMax, Math.min(s.screen + margin, REACH * f));
  xMin = Math.max(xMin, -REACH * f);
  return { xMin, xMax, yMax };
}

/** How far left the learner can drag the object, cm. */
export function leftmostObject(s: Pick<LensState, "focalLength"> & Span): number {
  return s.span != null ? -s.span + 0.4 * s.focalLength : -(REACH - 0.3) * s.focalLength;
}

/** Pixels at a width: a fixed-shape stage, the drawing scaled uniformly to fit it and centred. */
export function lensBox(
  s: WindowInput,
  width: number,
): {
  width: number;
  height: number;
  window: LensWindow;
  /** px per cm */
  scale: number;
  toPixel: (x: number, y: number) => [number, number];
  /** cm across, from a px x */
  toCm: (px: number) => number;
} {
  const window = lensWindowOf(s);
  const height = Math.round(width * LENS_ASPECT);
  const span = window.xMax - window.xMin;
  const scale = Math.min(
    (width - 2 * LENS_PAD) / span,
    (height - 2 * LENS_PAD) / (2 * window.yMax),
  );
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
const signed = (v: number): string => (v > 0 ? `+${fmt(v)}` : v < 0 ? `−${fmt(-v)}` : "0");

/** The readout line: u, v and f with their signs. */
export function readoutOf(s: Geometry): string {
  const img = lensImageOf(s);
  const v = img === null ? "∞" : `${signed(img.v)} cm`;
  return `u = ${signed(s.object.x)} cm, v = ${v}, f = ${signed(signedLensF(s))} cm`;
}

/** The image in words, as the textbook's tables have it. */
export function describeLensImage(s: Geometry, img: LensImage): string {
  const m = Math.abs(img.magnification);
  const size = Math.abs(m - 1) < 0.02 ? "same size" : m > 1 ? "enlarged" : "diminished";
  const d = Math.abs(img.v);
  const f = s.focalLength;
  const place = !img.isReal
    ? s.kind === LensKind.Concave
      ? "between F₁ and O"
      : "beyond the object"
    : Math.abs(d - 2 * f) <= AT
      ? "at 2F₂"
      : d > 2 * f
        ? "beyond 2F₂"
        : "between F₂ and 2F₂";
  const side = img.isReal ? "on the other side" : "on the same side as the object";
  return `${img.isReal ? "real" : "virtual"}, ${img.isErect ? "erect" : "inverted"}, ${size}, ${fmt(d)} cm ${side}, ${place}`;
}

/** What the screen shows, in words. */
function screenWords(s: LensState): string {
  const x = s.screen ?? 0;
  const img = lensImageOf(s);
  const where = `a screen ${fmt(x)} cm to the right of the lens`;
  if (img === null) return `${where}: only a blur, the rays come out parallel (image at infinity)`;
  if (!img.isReal) return `${where}: only a faint patch of light, the image is virtual`;
  if (isSharpOf(s))
    return `${where}: a sharp, ${img.isErect ? "erect" : "inverted"} picture of the object`;
  const side = x < img.v ? "move it further away" : "move it closer";
  return `${where}: a blurred picture; the sharp image is ${fmt(img.v)} cm away, so ${side}`;
}

const placeWords: Record<LensPlace, string> = {
  [LensPlace.BeyondTwoF]: "beyond 2F₁",
  [LensPlace.AtTwoF]: "at 2F₁",
  [LensPlace.BetweenTwoFAndF]: "between 2F₁ and F₁",
  [LensPlace.AtF]: "at F₁",
  [LensPlace.BetweenFAndO]: "between F₁ and O",
};

function describeRay(s: Geometry & Pick<LensState, "cover">, ray: LensRay): string {
  const path = lensRayPath(s, ray);
  if (path.isOff) return isCovered(s, path.hit[1]) ? "blocked by the card" : "misses the lens";
  const isConvex = s.kind === LensKind.Convex;
  switch (ray) {
    case LensRay.Parallel:
      return isConvex
        ? "parallel to the axis, refracts through F₂"
        : "parallel to the axis, refracts as if it came from F₁";
    case LensRay.Focal:
      return isConvex
        ? "through F₁, comes out parallel to the axis"
        : "aimed at F₂, comes out parallel to the axis";
    case LensRay.Centre:
      return "through the optical centre O, goes straight on";
  }
}

/** The lens's open part, as [lowest, highest] heights a ray can pass at (the card blocks half). */
export function openPart(s: Pick<LensState, "focalLength" | "cover"> & Span): [number, number] {
  const a = lensApertureOf(s);
  if (s.cover === LensCover.Top) return [-a, 0];
  if (s.cover === LensCover.Bottom) return [0, a];
  return [-a, a];
}

/**
 * The light patch the object's tip makes on the screen: the cone of rays from the tip through the
 * open part of the lens, converging to the image's tip. By similar triangles, a ray through the
 * lens at height y reaches the screen at y + (H − y)·x/v, so the patch's half-height is
 * (half the open part)·|1 − x/v|. A virtual image (or one at infinity) never converges: the patch
 * is as big as the lens. Null without a screen.
 */
export function blurOf(s: Geometry & Pick<LensState, "cover" | "screen">): number | null {
  if (s.screen === null) return null;
  const [lo, hi] = openPart(s);
  const half = (hi - lo) / 2;
  const img = lensImageOf(s);
  if (img === null || !img.isReal) return lensApertureOf(s);
  return Math.abs(half * (1 - s.screen / img.v));
}

/** The screen catches a sharp picture: a real image, and the screen within SHARP_WITHIN of it. */
export function isSharpOf(s: Geometry & Pick<LensState, "screen">): boolean {
  if (s.screen === null) return false;
  const img = lensImageOf(s);
  if (!img?.isReal) return false;
  return Math.abs(s.screen - img.v) <= SHARP_WITHIN;
}

/** Where the patch from the tip is centred on the screen, cm: the line from O's open part to the image. */
export function patchCentreOf(s: Geometry & Pick<LensState, "cover" | "screen">): number | null {
  if (s.screen === null) return null;
  const img = lensImageOf(s);
  if (img === null || !img.isReal) return null;
  const [lo, hi] = openPart(s);
  const mid = (lo + hi) / 2;
  return mid + (img.height - mid) * (s.screen / img.v);
}

/** Where the marker waits before it is first moved: high on the far side. */
export function markParking(s: WindowInput): { x: number; y: number } {
  const w = lensWindowOf(s);
  return { x: Math.round(w.xMax * 0.75), y: Math.round(w.yMax * 0.7) };
}

/** The marker is on the image's tip: a finite image, and the marker within MARK_WITHIN cm of it. */
export function markOnImageOf(s: Geometry & Pick<LensState, "mark">): boolean {
  if (s.mark === null) return false;
  const img = lensImageOf(s);
  if (img === null) return false;
  return Math.hypot(s.mark.x - img.v, s.mark.y - img.height) <= MARK_WITHIN;
}

/** The rays with one switched on or off, kept in the order parallel, focal, centre. */
export function toggled(rays: readonly LensRay[], ray: LensRay): LensRay[] {
  const on = new Set(rays);
  if (on.has(ray)) on.delete(ray);
  else on.add(ray);
  return [LensRay.Parallel, LensRay.Focal, LensRay.Centre].filter((r) => on.has(r));
}

/** Whether the image arrow is drawn: shown, or found by the learner's marker. */
export function isImageDrawn(s: LensState): boolean {
  return s.showImage || (s.markImage && markOnImageOf(s));
}

const act = actionsFor<LensState>();

/** Each standard ray's button: what it says, by locale. */
const RAY_BUTTONS = [
  { ray: LensRay.Parallel, en: "Ray 1: parallel to the axis", hi: "किरण 1: अक्ष के समानांतर" },
  { ray: LensRay.Focal, en: "Ray 2: through the focus", hi: "किरण 2: फोकस से होकर" },
  { ray: LensRay.Centre, en: "Ray 3: through O", hi: "किरण 3: O से होकर" },
];

/** A ray from its path, as pieces on the bench: dashed where it is only traced or aimed. */
function piecesOf(s: LensState, path: LensRayPath): RayPiece[] {
  const img = lensImageOf(s);
  // A real image's rays are aimed through its tip so they visibly meet there.
  const toward: [number, number] =
    img?.isReal && !s.beam ? [img.v - path.hit[0], img.height - path.hit[1]] : path.out;
  const dashed = (to: LensPoint | null, from: LensPoint = path.hit): RayPiece[] =>
    to === null ? [] : [{ from, to, isDashed: true }];
  return [
    ...dashed(path.source, path.from),
    { from: path.from, to: path.hit },
    { from: path.hit, toward, edge: "right" },
    ...dashed(path.aim),
    ...dashed(path.back),
  ];
}

/** Every ray drawn: the beam, or the chosen standard rays and, under a card, the spare ones. */
function raysOf(s: LensState): OpticRay[] {
  const ray = (
    id: string,
    path: LensRayPath,
    says = "",
    kind: "ray" | "beam" = "ray",
  ): OpticRay[] => (path.isOff ? [] : [{ id, pieces: piecesOf(s, path), kind, says }]);
  if (s.beam) return beamRays(s).flatMap((p, k) => ray(`beam${k}`, p, "", "beam"));
  return [
    ...s.rays.flatMap((r) => ray(r, lensRayPath(s, r), describeRay(s, r))),
    ...spareRays(s).flatMap((p, k) => ray(`spare${k}`, p)),
  ];
}

/** The image's words when it falls outside the picture. */
function outsideWords(s: LensState): string {
  const img = lensImageOf(s);
  if (img === null) return "";
  const side = img.isReal ? "on the other side" : "on the object's side";
  const size = Math.abs(img.magnification) > 1 ? "enlarged" : "diminished";
  return `image ${Math.round(Math.abs(img.v))} cm ${side}, ${img.isErect ? "erect" : "inverted"}, ${size}: outside the picture`;
}

/** The cone of light from the object's tip to the lens's open edges and on to the screen. */
function coneOf(s: LensState): RayPiece[] {
  const img = lensImageOf(s);
  if (s.screen === null || !img?.isReal) return [];
  const x = s.screen;
  const tip: [number, number] = [s.object.x, s.object.height];
  return openPart(s).flatMap((edge): RayPiece[] => [
    { from: tip, to: [0, edge] },
    { from: [0, edge], to: [x, edge + (img.height - edge) * (x / img.v)] },
  ]);
}

const coverWords = (s: LensState) =>
  s.cover === LensCover.None ? "" : `, its ${s.cover} half covered by a card`;

function imageWords(s: LensState): string {
  const img = lensImageOf(s);
  return img === null
    ? "the image is at infinity"
    : `the image is ${img.isReal ? "real" : "virtual"}`;
}

/** O, the foci and twice the foci, as points on the axis (only O while F isn't defined yet). */
function axisPointsOf(s: LensState) {
  const f = s.focalLength;
  const all = [
    { id: LensPart.Centre, x: 0, name: "O", says: "O, the optical centre" },
    { id: LensPart.F1, x: -f, name: "F₁", says: `F₁, ${fmt(f)} cm to the left` },
    { id: LensPart.F2, x: f, name: "F₂", says: `F₂, ${fmt(f)} cm to the right` },
    { id: LensPart.TwoF1, x: -2 * f, name: "2F₁", says: `2F₁, ${fmt(2 * f)} cm to the left` },
    { id: LensPart.TwoF2, x: 2 * f, name: "2F₂", says: `2F₂, ${fmt(2 * f)} cm to the right` },
  ];
  return all.filter((p) => s.showFocus || p.name === "O");
}

/** What the screen catches from a real image: the tip's height there, the patch, and how sharp. */
function caughtOf(s: LensState) {
  const img = lensImageOf(s);
  const centre = patchCentreOf(s);
  if (s.screen === null || !img?.isReal || centre === null) return null;
  return {
    height: img.height * (s.screen / img.v),
    centre,
    blur: blurOf(s) ?? 0,
    isSharp: isSharpOf(s),
  };
}

/**
 * A thin convex or concave lens on the optical bench: a group of the optics kit's leaves. The lens
 * holds the facts (kind, f, the object, which rays, the screen and the marker); every leaf shows
 * them, bound, and what the learner moves is routed back here.
 */
export const lens = defineGroup({
  type: "lens",
  describe:
    "A thin convex or concave lens on its principal axis with an upright object to its left: the standard rays (parallel, through F, through the optical centre O) and the image they form, by the lens formula 1/v − 1/u = 1/f with the New Cartesian sign convention (u < 0; f > 0 for convex). Optionally sunlight as a parallel beam, a readout of u, v and f, and a card covering half the lens.",
  own: lensState,
  ownDefaults: {
    kind: LensKind.Convex,
    focalLength: 10,
    object: { x: -30, height: 4 },
    rays: [LensRay.Parallel, LensRay.Centre],
    beam: false,
    showImage: true,
    showLabels: true,
    showDistances: false,
    canSetFocal: false,
    cover: LensCover.None,
    span: null,
    screen: null,
    canMoveScreen: false,
    objectStyle: LensObjectStyle.Arrow,
    showNames: true,
    showCentres: false,
    showFocus: true,
    canPickRays: false,
    markImage: false,
    mark: null,
  },
  inputs: ["showImage", "showLabels", "showDistances", "beam"],
  children: {
    bench,
    glass: thinLens,
    rayLines: opticRays,
    card: lensCard,
    points: axisPoints,
    imageArrow: opticImage,
    whiteScreen: opticScreen,
    objectArrow: opticObject,
    marker,
    rayButtons,
    readout,
    focal: focalStepper,
  },
  is: {
    bench: (s) => ({
      window: lensWindowOf(s),
      aspect: LENS_ASPECT,
      pad: LENS_PAD,
      label: s.beam
        ? `Sunlight through a ${s.kind} lens`
        : `A ${s.kind} lens with an object ${Math.round(-s.object.x)} cm to the left; ${imageWords(s)}`,
    }),
    glass: (s) => ({
      kind: s.kind,
      aperture: lensApertureOf(s),
      showCentres: s.showCentres,
      says: `${s.kind} lens, f = ${fmt(s.focalLength)} cm, power ${powerOf(s)} D${coverWords(s)}`,
    }),
    rayLines: (s) => ({
      rays: raysOf(s),
      beamSays: !s.beam
        ? ""
        : `sunlight, parallel to the axis: ${s.kind === LensKind.Convex ? "the rays meet at F₂, on the far side" : "the rays spread out as if they came from F₁"}`,
    }),
    card: (s) => ({ cover: s.cover, aperture: lensApertureOf(s) }),
    points: (s) => ({ points: axisPointsOf(s), showNames: s.showLabels }),
    imageArrow: (s) => {
      const img = lensImageOf(s);
      return {
        tip: img === null ? null : { x: img.v, height: img.height, isReal: img.isReal },
        isDim: s.cover !== LensCover.None,
        showName: s.showNames,
        whenOutside: outsideWords(s),
        whenInfinite: "image at infinity: the rays come out parallel",
        says: img === null ? "" : describeLensImage(s, img),
      };
    },
    whiteScreen: (s) => ({
      x: s.screen ?? 10,
      half: 1.1 * lensApertureOf(s),
      canMove: s.canMoveScreen,
      min: 0.5,
      max: Math.min(200, lensWindowOf(s).xMax - 0.5),
      nudge: 0.5,
      caught: caughtOf(s),
      blur: blurOf(s) ?? 0,
      cone: coneOf(s),
      says: s.screen === null ? "" : screenWords(s),
    }),
    objectArrow: (s) => ({
      x: s.object.x,
      height: s.object.height,
      style: s.objectStyle,
      name: s.showNames
        ? s.objectStyle === LensObjectStyle.Phone
          ? ("phone" as const)
          : ("object" as const)
        : null,
      min: leftmostObject(s),
      max: -0.5,
      nudge: 1,
      says: `${fmt(-s.object.x)} cm to the left, ${fmt(s.object.height)} cm tall, ${placeWords[lensPlaceOf(s)]}`,
    }),
    marker: (s) => {
      const y = lensWindowOf(s).yMax - 0.5;
      return {
        at: s.mark ?? markParking(s),
        isRight: markOnImageOf(s),
        bounds: { xMin: -200, xMax: 200, yMin: -y, yMax: y },
        says:
          s.mark === null
            ? "the ? marker, not yet placed"
            : `the ? marker at (${fmt(s.mark.x)}, ${fmt(s.mark.y)}) cm: ${markOnImageOf(s) ? "on" : "not on"} the image's tip`,
      };
    },
    rayButtons: (s) => ({ buttons: RAY_BUTTONS, on: s.rays }),
    readout: (s) => ({ text: readoutOf(s) }),
    focal: (s) => ({ value: s.focalLength, min: LENS_FOCAL.min, max: LENS_FOCAL.max }),
  },
  show: {
    imageArrow: (s) => !s.beam && isImageDrawn(s),
    whiteScreen: (s) => !s.beam && s.screen !== null,
    objectArrow: (s) => !s.beam,
    marker: (s) => !s.beam && s.markImage,
    rayButtons: (s) => s.canPickRays && !s.beam,
    readout: (s) => s.showDistances && !s.beam,
    focal: (s) => s.canSetFocal,
  },
  route: {
    // What the learner moves is the lens's: the object, the screen, the marker, rays, f.
    "objectArrow.move": (_s, a) => [[LensAction.MoveObject, { x: a.x }]],
    "whiteScreen.move": (_s, a) => [[LensAction.MoveScreen, { x: a.x }]],
    "marker.move": (_s, a) => [[LensAction.MoveMark, { x: a.x, y: a.y }]],
    "rayButtons.toggle": (_s, a) => [[LensAction.ToggleRay, { ray: a.ray }]],
    "focal.change": (_s, a) => [[LensAction.SetFocalLength, { f: a.to }]],
  },
  derived: {
    [LensDerived.U]: {
      describe: "Object distance u (cm, negative)",
      compute: (s) => s.object.x,
    },
    [LensDerived.F]: {
      describe: "Focal length f with its sign (cm; + convex, − concave)",
      compute: (s) => signedLensF(s),
    },
    [LensDerived.V]: {
      describe:
        "Image distance v (cm; + on the far side, − on the object's side), or null at infinity",
      compute: (s) => lensImageOf(s)?.v ?? null,
    },
    [LensDerived.ImageHeight]: {
      describe: "Image height h' (cm; negative when inverted), or null at infinity",
      compute: (s) => lensImageOf(s)?.height ?? null,
    },
    [LensDerived.Magnification]: {
      describe: "Magnification m = h'/h = v/u, or null at infinity",
      compute: (s) => lensImageOf(s)?.magnification ?? null,
    },
    [LensDerived.IsReal]: {
      describe: "The image is real (on the far side)",
      compute: (s) => lensImageOf(s)?.isReal ?? true,
    },
    [LensDerived.IsErect]: {
      describe: "The image is erect",
      compute: (s) => lensImageOf(s)?.isErect ?? false,
    },
    [LensDerived.PlaceOfObject]: {
      describe: "Where the object stands: beyondTwoF, atTwoF, betweenTwoFAndF, atF or betweenFAndO",
      compute: (s) => lensPlaceOf(s),
    },
    [LensDerived.Power]: {
      describe: "Power P = 1/f in dioptres (f in metres), to 2 dp",
      compute: (s) => powerOf(s),
    },
    [LensDerived.Blur]: {
      describe:
        "Half-height (cm) of the patch of light from the object's tip on the screen: 0 when the screen is at a real image, the lens's half-height for a virtual image; null without a screen",
      compute: (s) => blurOf(s),
    },
    [LensDerived.MarkOnImage]: {
      describe:
        "The learner's ? marker is on the image's tip (within 1 cm; never for an image at infinity)",
      compute: (s) => markOnImageOf(s),
    },
    [LensDerived.IsSharp]: {
      describe:
        "The screen catches a sharp picture: a real image and the screen within 0.6 cm of it",
      compute: (s) => isSharpOf(s),
    },
  },
  actions: {
    [LensAction.MoveObject]: act({
      describe:
        "Move the object to x cm (negative: left of O); its height, the lens and the rays stay",
      byLearner: true,
      args: z.object({ x: objectX }).strict(),
      run: (s, a) => set({ object: { x: a.x, height: s.object.height } }),
    }),
    [LensAction.SetHeight]: act({
      describe: "Set the object's height (cm); where it stands stays",
      args: z.object({ height: z.number().min(LENS_HEIGHT.min).max(LENS_HEIGHT.max) }).strict(),
      run: (s, a) => set({ object: { x: s.object.x, height: a.height } }),
    }),
    [LensAction.SetFocalLength]: act({
      describe: "Set the focal length's magnitude (cm); the object stays where it is",
      byLearner: true,
      args: z.object({ f: z.number().min(LENS_FOCAL.min).max(LENS_FOCAL.max) }).strict(),
      run: (_s, a) => set({ focalLength: a.f }),
    }),
    [LensAction.SetKind]: act({
      describe: "Make the lens convex or concave; everything else stays",
      args: z.object({ kind: z.nativeEnum(LensKind) }).strict(),
      run: (_s, a) => set({ kind: a.kind }),
    }),
    [LensAction.PlaceObject]: act({
      describe:
        "Put the object at one of the textbook's positions by name (beyondTwoF, atTwoF, betweenTwoFAndF, atF, betweenFAndO)",
      args: z.object({ at: z.nativeEnum(LensPlace) }).strict(),
      run: (s, a) =>
        set({ object: { x: lensXForPlace(s.focalLength, a.at), height: s.object.height } }),
    }),
    [LensAction.ShowRays]: act({
      describe: "Choose which standard rays are drawn (parallel, focal, centre)",
      args: z.object({ rays: z.array(raySchema).max(3) }).strict(),
      run: (_s, a) => set({ rays: [...new Set(a.rays)] }),
    }),
    [LensAction.Cover]: act({
      describe: "Cover the top or bottom half of the lens with a black card, or take it away",
      args: z.object({ cover: z.nativeEnum(LensCover) }).strict(),
      run: (_s, a) => set({ cover: a.cover }),
    }),
    [LensAction.MoveScreen]: act({
      describe: "Slide the screen to x cm on the far side of the lens (the learner's drag)",
      byLearner: true,
      args: z.object({ x: screenX }).strict(),
      run: (_s, a) => set({ screen: a.x }),
    }),
    [LensAction.ToggleRay]: act({
      describe: "Switch one standard ray on or off (the learner's buttons 1 2 3)",
      byLearner: true,
      args: z.object({ ray: raySchema }).strict(),
      run: (s, a) => set({ rays: toggled(s.rays, a.ray) }),
    }),
    [LensAction.MoveMark]: act({
      describe: "Put the ? marker at (x, y) cm: where the learner thinks the image's tip is",
      byLearner: true,
      args: markSchema,
      run: (_s, a) => set({ mark: { x: a.x, y: a.y } }),
    }),
  },
  summary: (s) => {
    const f = s.focalLength;
    const img = lensImageOf(s);
    const cover = s.cover === LensCover.None ? "" : `, its ${s.cover} half covered by a card`;
    if (s.beam) {
      const where =
        s.kind === LensKind.Convex
          ? "they meet at F₂, on the far side"
          : "they spread out as if they came from F₁";
      return `sunlight, parallel to the axis, through a ${s.kind} lens (f = ${fmt(f)} cm)${cover}: ${where}`;
    }
    const where =
      img === null
        ? "the image is at infinity (the object is at F₁)"
        : isImageDrawn(s)
          ? `the image is ${describeLensImage(s, img)}`
          : "the image is not drawn";
    return `a ${s.kind} lens (f = ${fmt(f)} cm)${cover} with a ${fmt(s.object.height)} cm object ${fmt(-s.object.x)} cm to the left, ${placeWords[lensPlaceOf(s)]}; ${s.rays.length} ray(s) drawn; ${where}${s.screen === null ? "" : `; ${screenWords(s)}`}`;
  },
  hidden: (s) => {
    const img = lensImageOf(s);
    if (s.beam || img === null || isImageDrawn(s)) return undefined;
    return { image: { v: img.v, height: img.height, magnification: img.magnification } };
  },
  layout: {
    kind: "frame",
    provider: "bench",
    children: [
      "glass",
      "rayLines",
      "card",
      "points",
      "imageArrow",
      "whiteScreen",
      "objectArrow",
      "marker",
    ],
    below: ["rayButtons", "readout", "focal"],
  },
});
