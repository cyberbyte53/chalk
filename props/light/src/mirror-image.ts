import { type Box, type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * A plane mirror standing upright, an object (an upright arrow) in front of it and an eye. Rays
 * from the object's tip bounce off the mirror by the law of reflection into the eye; the eye
 * traces them back in straight lines, so they seem to come from one point behind the mirror: the
 * tip of the image, as far behind as the object is in front.
 *
 * Coordinates are cm: the mirror is the line x = 0, the floor is y = 0, the object and the eye are
 * in front (x < 0) and the image is behind (x > 0). Only the object and the eye are stored; the
 * rays and the image follow.
 */

export const MirrorImageAction = {
  MoveObject: "moveObject",
  MoveEye: "moveEye",
} as const;

export const MirrorImageSignal = { ObjectReleased: "objectReleased" } as const;

export const MirrorImageDerived = {
  ObjectDistance: "objectDistance",
  ImageDistance: "imageDistance",
  ObjectHeight: "objectHeight",
  ImageHeight: "imageHeight",
} as const;

export const MirrorImagePart = {
  Mirror: "mirror",
  Object: "object",
  Image: "image",
  Eye: "eye",
  Paper: "paper",
  RayPrefix: "ray:",
} as const;

export const DISTANCE = { min: 4, max: 20 } as const;
export const HEIGHT = { min: 2, max: 12 } as const;
export const EYE = { xMin: 4, xMax: 36, yMin: 0, yMax: 20 } as const;
/** How far the mirror reaches below the floor line and above it, cm. */
export const MIRROR = { bottom: -4, top: 21 } as const;
/** Half the eye's width, cm; rays end at its front, a little towards the mirror from its centre. */
export const EYE_R = 3.4;
const EYE_FRONT = 0.6 * EYE_R;
/** The paper card behind the mirror: half its width, and how far it reaches above the image's tip, cm. */
export const PAPER = { half: 2, above: 2.5 } as const;

const mirrorImageState = z
  .object({
    /** How far in front of the mirror the object stands, cm. */
    distance: z.number().min(DISTANCE.min).max(DISTANCE.max),
    /** The object's height, cm. */
    height: z.number().min(HEIGHT.min).max(HEIGHT.max),
    /** The eye: `x` cm in front of the mirror, `y` cm above the floor line. */
    eye: z
      .object({
        x: z.number().min(EYE.xMin).max(EYE.xMax),
        y: z.number().min(EYE.yMin).max(EYE.yMax),
      })
      .strict(),
    /** How many rays from the object's tip into the eye are drawn. */
    rays: z.number().int().min(0).max(3),
    showExtensions: z.boolean(),
    showImage: z.boolean(),
    /** A ruler under the floor: the object's distance in front, the image's behind. */
    showDistances: z.boolean(),
    /** Small labels: "object", "image", "mirror". */
    showNames: z.boolean(),
    /** A sheet of paper behind the mirror where the image is: it stays dark, no light reaches it. */
    showPaper: z.boolean(),
    /** Whether the learner can drag the eye. */
    canMoveEye: z.boolean(),
  })
  .strict();
export type MirrorImageState = z.infer<typeof mirrorImageState>;

export type Point = [number, number];

export type RayPath = {
  /** The object's tip. */
  from: Point;
  /** Where the ray meets the mirror (x = 0). */
  hit: Point;
  /** The point at the eye it reaches. */
  to: Point;
  /** The image's tip, where the dashed extension behind the mirror ends. */
  image: Point;
};

/** Where at the eye each ray lands, cm above or below its centre: spread so they read as separate rays. */
const SPREAD: Record<number, number[]> = { 0: [], 1: [0], 2: [-2.4, 2.4], 3: [-2.8, 0, 2.8] };

/**
 * The drawn rays: each is aimed so that, after reflecting, it reaches the eye. By the law of
 * reflection the reflected ray lies on the line from the image's tip (the object's tip mirrored
 * to the other side) to the eye, so the hit point is where that line crosses the mirror. Rays that
 * would land off the mirror are left out.
 */
export function raysOf(s: MirrorImageState): RayPath[] {
  const d = s.distance;
  const h = s.height;
  const from: Point = [-d, h];
  const image: Point = [d, h];
  const out: RayPath[] = [];
  for (const dy of SPREAD[s.rays] ?? []) {
    const to: Point = [-s.eye.x + EYE_FRONT, s.eye.y + dy];
    const t = d / (d - to[0]);
    const y = h + (to[1] - h) * t;
    if (y < MIRROR.bottom || y > MIRROR.top) continue;
    out.push({ from, hit: [0, y], to, image });
  }
  return out;
}

/** The angles in and out at the mirror, degrees from the normal (the horizontal line at the hit). */
export function anglesOf(ray: RayPath): { incidence: number; reflection: number } {
  const DEG = 180 / Math.PI;
  const [hx, hy] = ray.hit;
  const incidence = Math.atan2(Math.abs(hy - ray.from[1]), Math.abs(hx - ray.from[0])) * DEG;
  const reflection = Math.atan2(Math.abs(ray.to[1] - hy), Math.abs(ray.to[0] - hx)) * DEG;
  return { incidence, reflection };
}

/** The stretch that must fit: the eye at its farthest in front, the image at its farthest behind. */
export const WINDOW = { xMin: -40, xMax: 22.5, yMin: -7, yMax: 23 } as const;
export const ASPECT = 0.5;
const PAD = 6;

/** Pixels at a width, for the view and `locate`: a fixed window, uniform scale, centred. */
export function boxOf(width: number): {
  height: number;
  scale: number;
  toPixel: (x: number, y: number) => [number, number];
  toCm: (px: number, py: number) => [number, number];
} {
  const height = Math.round(width * ASPECT);
  const spanX = WINDOW.xMax - WINDOW.xMin;
  const spanY = WINDOW.yMax - WINDOW.yMin;
  const scale = Math.min((width - 2 * PAD) / spanX, (height - 2 * PAD) / spanY);
  const left = (width - spanX * scale) / 2;
  const top = (height - spanY * scale) / 2;
  return {
    height,
    scale,
    toPixel: (x, y) => [left + (x - WINDOW.xMin) * scale, top + (WINDOW.yMax - y) * scale],
    toCm: (px, py) => [WINDOW.xMin + (px - left) / scale, WINDOW.yMax - (py - top) / scale],
  };
}

const fmt = (v: number): string => String(Number(v.toFixed(1)));

const act = actionsFor<MirrorImageState>();

export const mirrorImage = defineProp({
  type: "mirrorImage",
  describe:
    "A plane mirror standing upright, an upright arrow object in front of it and an eye. Rays from the object's tip reflect off the mirror (angle of incidence = angle of reflection) into the eye; their dashed extensions behind the mirror meet at the image's tip. The image is virtual, erect, the same size, and as far behind the mirror as the object is in front.",
  state: mirrorImageState,
  defaults: {
    distance: 15,
    height: 8,
    eye: { x: 30, y: 12 },
    rays: 2,
    showExtensions: true,
    showImage: true,
    showDistances: false,
    showNames: true,
    showPaper: false,
    canMoveEye: false,
  },
  inputs: ["showExtensions", "showImage", "showDistances", "showNames", "showPaper"],
  derived: {
    [MirrorImageDerived.ObjectDistance]: {
      describe: "How far the object is in front of the mirror, cm",
      compute: (s) => s.distance,
    },
    [MirrorImageDerived.ImageDistance]: {
      describe: "How far the image is behind the mirror, cm (always the object's distance)",
      compute: (s) => s.distance,
    },
    [MirrorImageDerived.ObjectHeight]: {
      describe: "The object's height, cm",
      compute: (s) => s.height,
    },
    [MirrorImageDerived.ImageHeight]: {
      describe: "The image's height, cm (always the object's height: same size, erect)",
      compute: (s) => s.height,
    },
  },
  actions: {
    [MirrorImageAction.MoveObject]: act({
      describe:
        "Stand the object `distance` cm in front of the mirror (the learner's drag); the image moves to the same distance behind",
      byLearner: true,
      args: z.object({ distance: z.number().min(DISTANCE.min).max(DISTANCE.max) }).strict(),
      run: (_s, a) => set({ distance: a.distance }),
    }),
    [MirrorImageAction.MoveEye]: act({
      describe:
        "Put the eye `x` cm in front of the mirror and `y` cm above the floor line; the rays re-aim, the image stays",
      byLearner: true,
      args: z
        .object({
          x: z.number().min(EYE.xMin).max(EYE.xMax),
          y: z.number().min(EYE.yMin).max(EYE.yMax),
        })
        .strict(),
      run: (_s, a) => set({ eye: { x: a.x, y: a.y } }),
    }),
  },
  signals: {
    [MirrorImageSignal.ObjectReleased]: {
      describe: "The learner let go of the object; `distance` is how far in front it stands",
    },
  },
  observe: (s) => {
    const rays = raysOf(s);
    const d = fmt(s.distance);
    const h = fmt(s.height);
    const elements: Element[] = [
      { id: MirrorImagePart.Mirror, value: "a plane mirror, standing upright" },
      { id: MirrorImagePart.Object, value: `${d} cm in front of the mirror, ${h} cm tall` },
      {
        id: MirrorImagePart.Eye,
        value: `${fmt(s.eye.x)} cm in front of the mirror, ${fmt(s.eye.y)} cm above the floor line`,
      },
    ];
    rays.forEach((ray, k) => {
      const { incidence } = anglesOf(ray);
      const ext = s.showExtensions
        ? "; its dashed extension behind the mirror runs to the image's tip"
        : "";
      elements.push({
        id: `${MirrorImagePart.RayPrefix}${k}`,
        value: `from the object's tip to the mirror ${fmt(ray.hit[1])} cm up, reflects at ${Math.round(incidence)}° (equal angles) into the eye${ext}`,
      });
    });
    if (s.showPaper)
      elements.push({
        id: MirrorImagePart.Paper,
        value: `a sheet of paper ${d} cm behind the mirror, where the image is: it stays dark, because no light goes behind the mirror`,
      });
    if (s.showImage)
      elements.push({
        id: MirrorImagePart.Image,
        value: `${d} cm behind the mirror, ${h} cm tall: virtual, erect, the same size`,
      });
    const reach = `${rays.length} ray${rays.length === 1 ? "" : "s"} reach${rays.length === 1 ? "es" : ""} the eye`;
    const meet =
      s.showExtensions && rays.length > 0
        ? `, ${rays.length === 1 ? "its extension ends" : "their extensions meet"} at the image`
        : "";
    const summary = s.showImage
      ? `an object ${d} cm in front of a plane mirror; its image is ${d} cm behind, the same size, erect; ${reach}${meet}`
      : `an object ${d} cm in front of a plane mirror; ${reach}${meet}; the image is not drawn`;
    return s.showImage
      ? { summary, elements }
      : { summary, elements, hidden: { image: { distance: s.distance, height: s.height } } };
  },
  parts: (s) => {
    const out: string[] = [MirrorImagePart.Mirror, MirrorImagePart.Object, MirrorImagePart.Eye];
    raysOf(s).forEach((_ray, k) => out.push(`${MirrorImagePart.RayPrefix}${k}`));
    if (s.showImage) out.push(MirrorImagePart.Image);
    if (s.showPaper) out.push(MirrorImagePart.Paper);
    return out;
  },
  locate: (s, part, width): Box | undefined => {
    const box = boxOf(width);
    const around = (x: number, y: number): Box => {
      const [px, py] = box.toPixel(x, y);
      return { x: px - 24, y: py - 24, width: 48, height: 48 };
    };
    /** The upright arrow from (x, 0) to (x, height). */
    const arrow = (x: number): Box => {
      const [px, top] = box.toPixel(x, s.height);
      const [, bottom] = box.toPixel(x, 0);
      return { x: px - 16, y: top - 8, width: 32, height: bottom - top + 16 };
    };
    if (part === MirrorImagePart.Mirror) {
      const [px, top] = box.toPixel(0, MIRROR.top);
      const [, bottom] = box.toPixel(0, MIRROR.bottom);
      return { x: px - 10, y: top, width: 20, height: bottom - top };
    }
    if (part === MirrorImagePart.Object) return arrow(-s.distance);
    if (part === MirrorImagePart.Image) return s.showImage ? arrow(s.distance) : undefined;
    if (part === MirrorImagePart.Eye) return around(-s.eye.x, s.eye.y);
    if (part === MirrorImagePart.Paper) {
      if (!s.showPaper) return undefined;
      const [x0, y0] = box.toPixel(s.distance - PAPER.half, s.height + PAPER.above);
      const [x1, y1] = box.toPixel(s.distance + PAPER.half, 0);
      return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
    }
    if (part.startsWith(MirrorImagePart.RayPrefix)) {
      const ray = raysOf(s)[Number(part.slice(MirrorImagePart.RayPrefix.length))];
      if (ray === undefined) return undefined;
      const pts = [ray.from, ray.hit, ray.to].map(([x, y]) => box.toPixel(x, y));
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      return {
        x: Math.min(...xs) - 6,
        y: Math.min(...ys) - 6,
        width: Math.max(...xs) - Math.min(...xs) + 12,
        height: Math.max(...ys) - Math.min(...ys) + 12,
      };
    }
    return undefined;
  },
});
