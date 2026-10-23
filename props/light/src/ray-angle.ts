import { type Box, type Element, defineProp } from "@chalk/prop";
import { z } from "zod";

/**
 * A textbook figure for angle questions about reflection off a plane mirror: a horizontal mirror,
 * the point of incidence, the dashed normal, the incident ray from the upper left at i to the
 * normal and (optionally) the reflected ray. Up to four angles are marked with an arc and either
 * their value or a "?": to the normal (i), to the surface (90° − i), the reflected ray to the
 * normal (r = i), and between the two rays (2i). Static: nothing to drag.
 *
 * The layout (where each label sits) is worked out here, so the view and `locate` agree and tests
 * can check that no label lands on a ray, the normal, the mirror or another label.
 */

export const AngleLabel = { Value: "value", Ask: "?" } as const;
export type AngleLabel = (typeof AngleLabel)[keyof typeof AngleLabel];

export const RayAnglePart = {
  Mirror: "mirror",
  Normal: "normal",
  Incident: "incident",
  Reflected: "reflected",
  NormalAngle: "normalAngle",
  SurfaceAngle: "surfaceAngle",
  ReflectAngle: "reflectAngle",
  BetweenAngle: "betweenAngle",
} as const;

const labelSchema = z.enum([AngleLabel.Value, AngleLabel.Ask]).nullable();
const rayAngleState = z
  .object({
    /** Angle of incidence, whole degrees from the normal. */
    i: z.number().int().min(1).max(89),
    showReflected: z.boolean(),
    /** The arc between the incident ray and the normal (i). */
    normalLabel: labelSchema,
    /** The arc between the incident ray and the mirror's surface (90° − i). */
    surfaceLabel: labelSchema,
    /** The arc between the reflected ray and the normal (r = i). Needs the reflected ray. */
    reflectLabel: labelSchema,
    /** The arc between the incident and reflected rays (2i). Needs the reflected ray. */
    betweenLabel: labelSchema,
  })
  .strict();
export type RayAngleState = z.infer<typeof rayAngleState>;

export type Px = [number, number];
type Rect = { x: number; y: number; width: number; height: number };

export type ArcId =
  | typeof RayAnglePart.NormalAngle
  | typeof RayAnglePart.SurfaceAngle
  | typeof RayAnglePart.ReflectAngle
  | typeof RayAnglePart.BetweenAngle;

export type ArcLayout = {
  id: ArcId;
  /** Radius, px. */
  r: number;
  /** From and to, screen degrees (clockwise from +x; −90 is straight up), a0 < a1. */
  a0: number;
  a1: number;
  /** The angle it marks, degrees. */
  degrees: number;
  /** "30°" or "?". */
  text: string;
  /** The label's box, px. */
  label: Rect;
};

export type Figure = {
  width: number;
  height: number;
  o: Px;
  mirrorY: number;
  /** Where the incident ray starts, and where the reflected ray ends. */
  start: Px;
  end: Px;
  normalTop: Px;
  /** The right-angle box sits on this side of the normal. */
  boxSide: -1 | 1;
  arcs: ArcLayout[];
};

/** Height as a share of width. */
export const ASPECT = 0.5;
const RAD = Math.PI / 180;
/** How big a label's box is, px: a little room around the text. */
const LABEL_H = 17;
const labelWidth = (text: string): number => 8.5 * text.length + 6;
/** Room kept between a label and any line, px. */
const PAD = 2;
const HATCH = 10;

const at = (o: Px, r: number, deg: number): Px => [
  o[0] + r * Math.cos(deg * RAD),
  o[1] + r * Math.sin(deg * RAD),
];

/** Does segment a→b come within `pad` of the rectangle? (Liang–Barsky on the padded box.) */
function hits(a: Px, b: Px, rect: Rect, pad: number): boolean {
  const x0 = rect.x - pad;
  const y0 = rect.y - pad;
  const x1 = rect.x + rect.width + pad;
  const y1 = rect.y + rect.height + pad;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  let t0 = 0;
  let t1 = 1;
  const edges: [number, number][] = [
    [-dx, a[0] - x0],
    [dx, x1 - a[0]],
    [-dy, a[1] - y0],
    [dy, y1 - a[1]],
  ];
  for (const [p, q] of edges) {
    if (Math.abs(p) < 1e-12) {
      if (q < 0) return false;
      continue;
    }
    const r = q / p;
    if (p < 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    }
  }
  return true;
}

const overlaps = (a: Rect, b: Rect, pad: number): boolean =>
  a.x < b.x + b.width + pad &&
  b.x < a.x + a.width + pad &&
  a.y < b.y + b.height + pad &&
  b.y < a.y + a.height + pad;

/** The arc as short straight pieces, for collision checks. */
function arcPieces(o: Px, r: number, a0: number, a1: number): [Px, Px][] {
  const n = Math.max(2, Math.ceil((a1 - a0) / 6));
  const out: [Px, Px][] = [];
  for (let k = 0; k < n; k++) {
    out.push([at(o, r, a0 + ((a1 - a0) * k) / n), at(o, r, a0 + ((a1 - a0) * (k + 1)) / n)]);
  }
  return out;
}

/** Which arcs are drawn, in the order their labels are placed. */
export function arcsShown(s: RayAngleState): ArcId[] {
  const out: ArcId[] = [];
  if (s.normalLabel !== null) out.push(RayAnglePart.NormalAngle);
  if (s.showReflected && s.reflectLabel !== null) out.push(RayAnglePart.ReflectAngle);
  if (s.surfaceLabel !== null) out.push(RayAnglePart.SurfaceAngle);
  if (s.showReflected && s.betweenLabel !== null) out.push(RayAnglePart.BetweenAngle);
  return out;
}

/** The angle each arc marks, degrees. */
export function anglesOf(i: number): Record<ArcId, number> {
  return {
    [RayAnglePart.NormalAngle]: i,
    [RayAnglePart.SurfaceAngle]: 90 - i,
    [RayAnglePart.ReflectAngle]: i,
    [RayAnglePart.BetweenAngle]: 2 * i,
  };
}

function labelOf(s: RayAngleState, id: ArcId): AngleLabel | null {
  switch (id) {
    case RayAnglePart.NormalAngle:
      return s.normalLabel;
    case RayAnglePart.SurfaceAngle:
      return s.surfaceLabel;
    case RayAnglePart.ReflectAngle:
      return s.reflectLabel;
    case RayAnglePart.BetweenAngle:
      return s.betweenLabel;
  }
}

/** Everything the view draws, in px at this width, with every label placed clear of the lines. */
export function figureOf(s: RayAngleState, width: number): Figure {
  const height = Math.round(width * ASPECT);
  const mirrorY = Math.round(height * 0.84);
  const o: Px = [width / 2, mirrorY];
  const len = height * 0.76;
  const up = -90;
  const inDeg = up - s.i;
  const outDeg = up + s.i;
  const start = at(o, len, inDeg);
  const end = at(o, len, outDeg);
  const normalTop: Px = [o[0], mirrorY - height * 0.8];
  const boxSide: -1 | 1 = !s.showReflected ? 1 : s.surfaceLabel === null ? -1 : 1;

  // The lines labels must stay clear of.
  const lines: [Px, Px][] = [
    [start, o],
    [o, normalTop],
    [
      [0, mirrorY],
      [width, mirrorY],
    ],
  ];
  if (s.showReflected) lines.push([o, end]);

  const radius: Record<ArcId, number> = {
    [RayAnglePart.SurfaceAngle]: height * 0.2,
    [RayAnglePart.NormalAngle]: height * 0.3,
    [RayAnglePart.ReflectAngle]: height * 0.3,
    [RayAnglePart.BetweenAngle]: height * 0.46,
  };
  const span: Record<ArcId, [number, number]> = {
    [RayAnglePart.SurfaceAngle]: [-180, inDeg],
    [RayAnglePart.NormalAngle]: [inDeg, up],
    [RayAnglePart.ReflectAngle]: [up, outDeg],
    [RayAnglePart.BetweenAngle]: [inDeg, outDeg],
  };
  const degrees = anglesOf(s.i);
  const ids = arcsShown(s);
  // Every drawn arc is an obstacle for every label.
  for (const id of ids) {
    const [a0, a1] = span[id];
    lines.push(...arcPieces(o, radius[id], a0, a1));
  }

  const placed: Rect[] = [];
  const arcs: ArcLayout[] = [];
  for (const id of ids) {
    const kind = labelOf(s, id);
    const text = kind === AngleLabel.Ask ? "?" : `${degrees[id]}°`;
    const w = labelWidth(text);
    const r = radius[id];
    const [a0, a1] = span[id];
    const mid = (a0 + a1) / 2;
    const boxAt = (deg: number, dist: number): Rect => {
      const c = at(o, dist, deg);
      return { x: c[0] - w / 2, y: c[1] - LABEL_H / 2, width: w, height: LABEL_H };
    };
    const isFree = (box: Rect): boolean =>
      box.x >= 2 &&
      box.y >= 2 &&
      box.x + box.width <= width - 2 &&
      box.y + box.height <= mirrorY - 2 &&
      lines.every(([a, b]) => !hits(a, b, box, PAD)) &&
      placed.every((p) => !overlaps(p, box, 3));
    // Nearest free spot to the middle of the arc, just outside it: inside the wedge first.
    const candidates: { box: Rect; cost: number }[] = [];
    for (const dr of [14, 22, 32, 44, 58, 74]) {
      for (let da = -80; da <= 80; da += 4) {
        const deg = mid + da;
        const inWedge = deg >= a0 && deg <= a1;
        candidates.push({
          box: boxAt(deg, r + dr),
          cost: Math.abs(da) * 0.9 + dr + (inWedge ? 0 : 25),
        });
      }
      // Inside the arc, for a wide wedge.
      candidates.push({ box: boxAt(mid, Math.max(18, r - dr - 6)), cost: dr + 40 });
    }
    candidates.sort((x, y) => x.cost - y.cost);
    const free = candidates.find((c) => isFree(c.box));
    const label = free?.box ?? boxAt(mid, r + 14);
    placed.push(label);
    arcs.push({ id, r, a0, a1, degrees: degrees[id], text, label });
  }
  return { width, height, o, mirrorY, start, end, normalTop, boxSide, arcs };
}

const wordFor: Record<ArcId, string> = {
  [RayAnglePart.NormalAngle]: "between the incident ray and the normal",
  [RayAnglePart.SurfaceAngle]: "between the incident ray and the mirror",
  [RayAnglePart.ReflectAngle]: "between the reflected ray and the normal",
  [RayAnglePart.BetweenAngle]: "between the incident and reflected rays",
};

export const rayAngle = defineProp({
  type: "rayAngle",
  describe:
    "A textbook figure of a ray reflecting off a plane mirror: the mirror, the dashed normal at the point of incidence, the incident ray at i to the normal and the reflected ray, with up to four angles marked by their value or a question mark: to the normal (i), to the surface (90° − i), the reflected ray to the normal (i), and between the rays (2i). Static.",
  state: rayAngleState,
  defaults: {
    i: 30,
    showReflected: true,
    normalLabel: AngleLabel.Value,
    surfaceLabel: null,
    reflectLabel: null,
    betweenLabel: null,
  },
  inputs: ["showReflected", "normalLabel", "surfaceLabel", "reflectLabel", "betweenLabel"],
  actions: {},
  observe: (s) => {
    const ids = arcsShown(s);
    const deg = anglesOf(s.i);
    const elements: Element[] = [
      { id: RayAnglePart.Mirror, value: "a plane mirror, drawn flat" },
      { id: RayAnglePart.Normal, value: "dashed, at right angles to the mirror" },
      { id: RayAnglePart.Incident, value: "comes in from the upper left" },
    ];
    if (s.showReflected)
      elements.push({ id: RayAnglePart.Reflected, value: "leaves to the upper right" });
    const hidden: Record<string, number> = {};
    for (const id of ids) {
      const isAsk = labelOf(s, id) === AngleLabel.Ask;
      elements.push({
        id,
        value: `the angle ${wordFor[id]}: ${isAsk ? "marked ?" : `${deg[id]}°`}`,
      });
      if (isAsk) hidden[id] = deg[id];
    }
    const said = (id: ArcId, words: string): string | null => {
      if (!ids.includes(id)) return null;
      return labelOf(s, id) === AngleLabel.Ask
        ? `${words} is asked (?)`
        : `${words} is ${deg[id]}°`;
    };
    const parts = [
      said(RayAnglePart.NormalAngle, "the angle with the normal"),
      said(RayAnglePart.SurfaceAngle, "the angle with the mirror"),
      said(RayAnglePart.ReflectAngle, "the reflected ray's angle with the normal"),
      said(RayAnglePart.BetweenAngle, "the angle between the rays"),
    ].filter((p): p is string => p !== null);
    const summary = `a ray strikes a plane mirror${s.showReflected ? " and is reflected" : ""}; ${parts.length === 0 ? "no angle is marked" : parts.join("; ")}`;
    return Object.keys(hidden).length === 0 ? { summary, elements } : { summary, elements, hidden };
  },
  parts: (s) => {
    const out: string[] = [RayAnglePart.Mirror, RayAnglePart.Normal, RayAnglePart.Incident];
    if (s.showReflected) out.push(RayAnglePart.Reflected);
    out.push(...arcsShown(s));
    return out;
  },
  locate: (s, part, width): Box | undefined => {
    const f = figureOf(s, width);
    const grow = (r: Rect): Box => {
      const w = Math.max(44, r.width);
      const h = Math.max(44, r.height);
      return { x: r.x + r.width / 2 - w / 2, y: r.y + r.height / 2 - h / 2, width: w, height: h };
    };
    const span = (a: Px, b: Px): Box =>
      grow({
        x: Math.min(a[0], b[0]),
        y: Math.min(a[1], b[1]),
        width: Math.abs(b[0] - a[0]),
        height: Math.abs(b[1] - a[1]),
      });
    switch (part) {
      case RayAnglePart.Mirror:
        return grow({ x: 0, y: f.mirrorY - 4, width: f.width, height: HATCH + 8 });
      case RayAnglePart.Normal:
        return span(f.normalTop, f.o);
      case RayAnglePart.Incident:
        return span(f.start, f.o);
      case RayAnglePart.Reflected:
        return s.showReflected ? span(f.o, f.end) : undefined;
      default: {
        const arc = f.arcs.find((a) => a.id === part);
        return arc === undefined ? undefined : grow(arc.label);
      }
    }
  },
});

export { HATCH, LABEL_H, hits, overlaps };
