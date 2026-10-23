import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId, useRef } from "preact/hooks";
import {
  FOCAL,
  MirrorKind,
  Ray,
  SphericalMirrorAction,
  SphericalMirrorPart,
  SphericalMirrorSignal,
  type SphericalMirrorState,
  apertureOf,
  beamHeights,
  blurAt,
  imageOf,
  isImageShown,
  isMarkOnImage,
  isSharpAt,
  markOf,
  planeBox,
  rayPath,
  readoutOf,
  rulerTicks,
  screenHalf,
  signedCm,
  signedF,
  surfaceX,
} from "./spherical-mirror";

type View = SphericalMirrorState & { isReal: boolean };
type Px = [number, number];

/** Arrowhead length, px. */
const HEAD = 9;
/** How far below the axis P, F and C are named, px. */
const LABEL = 18;
/** A step of the arrow keys, cm. */
const NUDGE = 1;
/** How close to the handle a press must be to take it, px. */
const GRAB = 28;
/** The ruler's numbers sit on their own row, below the P, F and C labels, so they never collide, px. */
const RULER_ROW = 36;
/** Points sampled along the mirror's face. */
const FACE_STEPS = 24;

const pt = (p: Px): string => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;

/** A small filled triangle pointing along (dx, dy) with its tip at (x, y). */
function Head({ x, y, dx, dy }: { x: number; y: number; dx: number; dy: number }): JSX.Element {
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <path
      class="sm-head"
      d={`M0 0 L${-HEAD} ${-HEAD * 0.55} L${-HEAD} ${HEAD * 0.55} Z`}
      transform={`translate(${x} ${y}) rotate(${angle})`}
    />
  );
}

/** A straight piece of ray with one arrowhead part way along. */
function Segment({ from, to, at = 0.55 }: { from: Px; to: Px; at?: number }): JSX.Element {
  const [x1, y1] = from;
  const [x2, y2] = to;
  return (
    <g class="sm-ray">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <Head x={x1 + (x2 - x1) * at} y={y1 + (y2 - y1) * at} dx={x2 - x1} dy={y2 - y1} />
    </g>
  );
}

/** An upright arrow from the axis to (x, height), in px. */
function Arrow({ foot, tip, cls }: { foot: Px; tip: Px; cls: string }): JSX.Element {
  return (
    <g class={cls}>
      <line x1={foot[0]} y1={foot[1]} x2={tip[0]} y2={tip[1]} />
      <Head x={tip[0]} y={tip[1]} dx={0} dy={tip[1] - foot[1]} />
    </g>
  );
}

/** The mirror's surface from bottom to top, as an SVG path through sampled points. */
function facePath(s: View, toPixel: (x: number, y: number) => Px): string {
  const a = apertureOf(s);
  return Array.from({ length: FACE_STEPS + 1 }, (_, k) => {
    const y = -a + (2 * a * k) / FACE_STEPS;
    return `${k === 0 ? "M" : "L"}${pt(toPixel(surfaceX(s, y), y))}`;
  }).join(" ");
}

/** The few words the picture shows, in English and Hindi. */
const EN = {
  object: "object",
  image: "image",
  concave: "concave",
  convex: "convex",
  rays: "rays",
  parallel: "parallel to the axis",
  focal: "through F",
  centre: "through C",
  pole: "to the pole",
} as const;
const HI: Record<keyof typeof EN, string> = {
  object: "वस्तु",
  image: "प्रतिबिंब",
  concave: "अवतल",
  convex: "उत्तल",
  rays: "किरणें",
  parallel: "अक्ष के समानांतर",
  focal: "F से होकर",
  centre: "C से होकर",
  pole: "ध्रुव पर",
};

/** The standard rays in the textbook's order: the buttons 1–4. */
const RAY_ORDER: Ray[] = [Ray.Parallel, Ray.Focal, Ray.Centre, Ray.Pole];

/**
 * A small name past an arrow's tip ("object", "image"): above an upright arrow, below an inverted
 * one, so it sits clear of the arrow, its handle and the axis labels; kept inside the stage.
 */
function Name({
  tip,
  foot,
  text,
  cls,
  width,
}: { tip: Px; foot: Px; text: string; cls: string; width: number }): JSX.Element {
  const isUp = tip[1] <= foot[1];
  const x = Math.min(width - 30, Math.max(30, tip[0]));
  const y = isUp ? tip[1] - 20 : tip[1] + 28;
  return (
    <text class={`sm-arrow-name ${cls}`} x={x} y={y} text-anchor="middle">
      {text}
    </text>
  );
}

/** A tiny concave or convex arc for the kind switch (props show no words; the label is for screen readers). */
function MirrorIcon({ kind }: { kind: MirrorKind }): JSX.Element {
  const d = kind === MirrorKind.Concave ? "M14 3 Q6 12 14 21" : "M8 3 Q16 12 8 21";
  return (
    <svg width="22" height="24" viewBox="0 0 22 24" role="img" aria-label={kind}>
      <path d={d} fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
    </svg>
  );
}

/**
 * The part of the segment a→b inside the box [0, w] × [0, h] (Liang–Barsky), or null when none of
 * it is: so no ray is ever drawn past the picture's edge.
 */
export function clipSegment(a: Px, b: Px, w: number, h: number): [Px, Px] | null {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  let t0 = 0;
  let t1 = 1;
  const edges: [number, number][] = [
    [-dx, a[0]],
    [dx, w - a[0]],
    [-dy, a[1]],
    [dy, h - a[1]],
  ];
  for (const [p, q] of edges) {
    if (Math.abs(p) < 1e-12) {
      if (q < 0) return null;
      continue;
    }
    const r = q / p;
    if (p < 0) {
      if (r > t1) return null;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return null;
      if (r < t1) t1 = r;
    }
  }
  return [
    [a[0] + t0 * dx, a[1] + t0 * dy],
    [a[0] + t1 * dx, a[1] + t1 * dy],
  ];
}

type Size = [number, number];

/** A ray segment, clipped to the stage; nothing when it lies wholly outside. */
function Clipped({
  from,
  to,
  at,
  size,
}: { from: Px; to: Px; at?: number; size: Size }): JSX.Element | null {
  const c = clipSegment(from, to, size[0], size[1]);
  if (c === null || Math.hypot(c[1][0] - c[0][0], c[1][1] - c[0][1]) < 1) return null;
  return <Segment from={c[0]} to={c[1]} at={at} />;
}

/** A dashed line, clipped to the stage. */
function Dashed({ from, to, size }: { from: Px; to: Px; size: Size }): JSX.Element | null {
  const c = clipSegment(from, to, size[0], size[1]);
  if (c === null) return null;
  return <line class="sm-dashed" x1={c[0][0]} y1={c[0][1]} x2={c[1][0]} y2={c[1][1]} />;
}

/** Where the line from `a` through `b` reaches x = `edge` (px), or `b` itself when it runs vertically. */
function toEdge(a: Px, b: Px, edge: number): Px {
  const dx = b[0] - a[0];
  if (Math.abs(dx) < 1e-9) return b;
  const t = (edge - a[0]) / dx;
  return [edge, a[1] + (b[1] - a[1]) * t];
}

/** Sunlight: parallel rays from the left edge to the mirror, then through F (concave) or away from it (convex). */
function Beam({
  s,
  toPixel,
  f,
  size,
}: {
  s: View;
  toPixel: (x: number, y: number) => Px;
  f: number;
  size: Size;
}): JSX.Element {
  const focus = toPixel(f, 0);
  const isConcave = s.kind === MirrorKind.Concave;
  return (
    <g class="sm-beam">
      {beamHeights(s).map((y) => {
        const from: Px = [0, toPixel(0, y)[1]];
        const hit = toPixel(surfaceX(s, y), y);
        // Concave: through F, on to the left edge. Convex: along the line from F through the hit point.
        const out = isConcave ? toEdge(hit, focus, 0) : toEdge(focus, hit, 0);
        return (
          <g key={y}>
            <Clipped from={from} to={hit} size={size} />
            <Clipped from={hit} to={out} at={0.35} size={size} />
            {!isConcave && <Dashed from={hit} to={focus} size={size} />}
          </g>
        );
      })}
      {isConcave && <circle class="sm-spot" cx={focus[0]} cy={focus[1]} r={7} />}
    </g>
  );
}

/** The New Cartesian sign convention at P: +x right, −x left, +y up, −y down, light from the left. */
function Signs({ pole, height }: { pole: Px; height: number }): JSX.Element {
  const [px, py] = pole;
  const L = 52;
  const V = Math.min(46, height / 2 - 26);
  return (
    <g class="sm-signs">
      <circle cx={px} cy={py} r={4.5} />
      <g class="sm-sign-pos">
        <line x1={px} y1={py} x2={px + L} y2={py} />
        <Head x={px + L} y={py} dx={1} dy={0} />
        <text x={px + L - 2} y={py - 8} text-anchor="end">
          +x
        </text>
        <line x1={px} y1={py} x2={px} y2={py - V} />
        <Head x={px} y={py - V} dx={0} dy={-1} />
        <text x={px + 8} y={py - V + 6}>
          +y
        </text>
      </g>
      <g class="sm-sign-neg">
        <line x1={px} y1={py} x2={px - L} y2={py} />
        <Head x={px - L} y={py} dx={-1} dy={0} />
        <text x={px - L + 2} y={py - 8}>
          −x
        </text>
        <line x1={px} y1={py} x2={px} y2={py + V} />
        <Head x={px} y={py + V} dx={0} dy={1} />
        <text x={px + 8} y={py + V}>
          −y
        </text>
      </g>
      <g class="sm-light-dir">
        <line x1={16} y1={22} x2={78} y2={22} />
        <Head x={78} y={22} dx={1} dy={0} />
        <text x={16} y={14}>
          light
        </text>
      </g>
    </g>
  );
}

/** The axis, the mirror, the object, the rays and the image, in px on a stage. The object's tip is the handle. */
export function SphericalMirrorView({
  view,
  width,
  call,
  signal,
  locale,
}: PropViewProps): JSX.Element {
  // The player hands each view its own prop's state, already checked against its schema.
  const s = view as unknown as View;
  const svg = useRef<SVGSVGElement | null>(null);
  const box = planeBox(s, width);
  const { height, toPixel } = box;
  const f = signedF(s);
  const img = imageOf(s);
  const size: Size = [width, height];
  const clipId = `sm-clip-${useId()}`;
  const words = locale === "hi" ? HI : EN;
  const shown = isImageShown(s);
  // The axis and the reflected rays run to the stage's own edges, not just the window's.
  const leftEdge = box.toCm(0);
  const axis: [Px, Px] = [toPixel(leftEdge, 0), toPixel(box.toCm(width), 0)];

  /** px per CSS px: the SVG is scaled to the element's width. */
  const pxPerClient = (): number => {
    const rect = svg.current?.getBoundingClientRect();
    return rect === undefined ? 1 : width / rect.width;
  };
  const svgPoint = (event: { clientX: number; clientY: number }): Px => {
    const rect = svg.current?.getBoundingClientRect();
    if (rect === undefined) return [0, 0];
    const k = pxPerClient();
    return [(event.clientX - rect.left) * k, (event.clientY - rect.top) * k];
  };
  const isOnHandle = (p: Px): boolean => {
    if (s.beam) return false;
    const [hx, hy] = toPixel(s.object.x, s.object.height);
    return Math.hypot(p[0] - hx, p[1] - hy) <= GRAB;
  };
  // The screen is taken anywhere along its card or stand.
  const isOnScreen = (p: Px): boolean => {
    if (s.screen === null || !s.canMoveScreen || s.beam) return false;
    const [sx, top] = toPixel(s.screen, screenHalf(s));
    return Math.abs(p[0] - sx) <= GRAB * 0.8 && p[1] >= top - 10;
  };
  const clampScreen = (x: number): number =>
    Math.min(-0.5, Math.max(box.window.xMin, Math.round(x * 2) / 2));
  const clampX = (x: number): number =>
    Math.min(-0.5, Math.max(box.window.xMin + 0.15 * s.focalLength, Math.round(x * 2) / 2));
  const clampMark = (x: number, y: number): { x: number; y: number } => ({
    x: Math.min(box.window.xMax, Math.max(box.window.xMin, Math.round(x * 2) / 2)),
    y: Math.min(box.window.yMax, Math.max(-box.window.yMax, Math.round(y * 2) / 2)),
  });
  const mark = markOf(s);
  const isOnMark = (p: Px): boolean => {
    if (!s.markImage || s.beam) return false;
    const [mx, my] = toPixel(mark.x, mark.y);
    return Math.hypot(p[0] - mx, p[1] - my) <= GRAB;
  };
  // The drag moves the object by how far the finger has moved since it took the handle.
  const drag = useRef<{
    what: "object" | "screen" | "mark";
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
  } | null>(null);
  const onPointerDown = (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
    const p = svgPoint(event);
    // The mark sits on top, so it is taken first.
    const what = isOnMark(p) ? "mark" : isOnHandle(p) ? "object" : isOnScreen(p) ? "screen" : null;
    if (what === null) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const startX = what === "object" ? s.object.x : what === "mark" ? mark.x : (s.screen ?? 0);
    const startY = what === "mark" ? mark.y : 0;
    drag.current = {
      what,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX,
      startY,
    };
  };
  const onPointerMove = (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (d === null || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const raw = d.startX + ((event.clientX - d.startClientX) * pxPerClient()) / box.scale;
    if (d.what === "mark") {
      const rawY = d.startY - ((event.clientY - d.startClientY) * pxPerClient()) / box.scale;
      const to = clampMark(raw, rawY);
      if (to.x !== mark.x || to.y !== mark.y) call(SphericalMirrorAction.MoveMark, to);
    } else if (d.what === "object") {
      const x = clampX(raw);
      if (x !== s.object.x) call(SphericalMirrorAction.MoveObject, { x });
    } else {
      const x = clampScreen(raw);
      if (x !== s.screen) call(SphericalMirrorAction.MoveScreen, { x });
    }
  };
  const onPointerUp = (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (d === null) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (d.what === "object") signal(SphericalMirrorSignal.ObjectReleased, { x: s.object.x });
    else if (d.what === "mark")
      signal(SphericalMirrorSignal.MarkReleased, { ...mark, isOnImage: isMarkOnImage(s) });
    else signal(SphericalMirrorSignal.ScreenReleased, { x: s.screen });
  };
  const onScreenKey = (event: JSX.TargetedKeyboardEvent<SVGGElement>) => {
    const delta = event.key === "ArrowRight" ? NUDGE : event.key === "ArrowLeft" ? -NUDGE : 0;
    if (delta === 0 || s.screen === null) return;
    event.preventDefault();
    const x = clampScreen(s.screen + delta);
    call(SphericalMirrorAction.MoveScreen, { x });
    signal(SphericalMirrorSignal.ScreenReleased, { x });
  };
  const onMarkKey = (event: JSX.TargetedKeyboardEvent<SVGGElement>) => {
    const dx = event.key === "ArrowRight" ? 0.5 : event.key === "ArrowLeft" ? -0.5 : 0;
    const dy = event.key === "ArrowUp" ? 0.5 : event.key === "ArrowDown" ? -0.5 : 0;
    if (dx === 0 && dy === 0) return;
    event.preventDefault();
    const to = clampMark(mark.x + dx, mark.y + dy);
    call(SphericalMirrorAction.MoveMark, to);
    signal(SphericalMirrorSignal.MarkReleased, {
      ...to,
      isOnImage: isMarkOnImage({ ...s, mark: to }),
    });
  };
  const onKeyDown = (event: JSX.TargetedKeyboardEvent<SVGGElement>) => {
    const delta = event.key === "ArrowRight" ? NUDGE : event.key === "ArrowLeft" ? -NUDGE : 0;
    if (delta === 0) return;
    event.preventDefault();
    const x = clampX(s.object.x + delta);
    call(SphericalMirrorAction.MoveObject, { x });
    signal(SphericalMirrorSignal.ObjectReleased, { x });
  };

  const drawRay = (ray: Ray): JSX.Element | null => {
    const path = rayPath(s, ray);
    if (path.isOffMirror) return null;
    const from = toPixel(path.from[0], path.from[1]);
    // Rays are worked out on the plane through the pole, but drawn to the arc the student sees;
    // the reflected line is then aimed through the image itself, so the rays still meet there.
    const hitY = path.hit[1];
    const hit = toPixel(surfaceX(s, hitY), hitY);
    let out: Px;
    if (img !== null && Math.abs(img.v - surfaceX(s, hitY)) > 1e-6) {
      const tip = toPixel(img.v, img.height);
      // Through the tip (real: the ray itself; virtual: its extension) on to the left edge.
      const t = (0 - hit[0]) / (tip[0] - hit[0]);
      out = [0, hit[1] + (tip[1] - hit[1]) * t];
    } else {
      const [dx, dy] = path.reflected;
      out = toPixel(leftEdge, hitY + (dy * (leftEdge - path.hit[0])) / dx);
    }
    const aim = path.aim === null ? null : toPixel(path.aim[0], path.aim[1]);
    const ext = path.extension === null ? null : toPixel(path.extension[0], path.extension[1]);
    return (
      <g key={ray}>
        <Clipped from={from} to={hit} size={size} />
        <Clipped from={hit} to={out} size={size} />
        {aim !== null && <Dashed from={hit} to={aim} size={size} />}
        {ext !== null && (
          <Dashed from={hit} to={[ext[0], ray === Ray.Focal ? hit[1] : ext[1]]} size={size} />
        )}
      </g>
    );
  };

  const blurId = `sm-blur-${useId()}`;
  const screenPart = ((): JSX.Element | null => {
    if (s.screen === null || s.beam) return null;
    const xs = s.screen;
    const half = screenHalf(s);
    const [sx, top] = toPixel(xs, half);
    const [, bottom] = toPixel(xs, -half);
    const sharp = isSharpAt(s, xs);
    const blurCm = blurAt(s, xs);
    const picture = ((): JSX.Element => {
      if (img === null || !img.isReal) {
        // Nothing focuses: a faint, even patch of light over the screen.
        return (
          <rect
            class="sm-patch"
            x={sx - 3}
            y={top + 6}
            width={6}
            height={bottom - top - 12}
            rx={3}
          />
        );
      }
      // The patch's centre on the screen follows the tip's cone: h′ × x / v; it spreads ± blur.
      const tipY = img.height * (xs / img.v);
      const foot = toPixel(xs, 0);
      const tip = toPixel(xs, tipY);
      const [, patchTop] = toPixel(xs, tipY + blurCm);
      const [, patchBottom] = toPixel(xs, tipY - blurCm);
      return (
        <g class={sharp ? "sm-caught is-sharp" : "sm-caught"}>
          {sharp ? (
            <circle
              class="sm-glow"
              cx={tip[0]}
              cy={(tip[1] + foot[1]) / 2}
              r={Math.max(14, Math.abs(tip[1] - foot[1]) / 2 + 8)}
            />
          ) : (
            <rect
              class="sm-patch is-real"
              x={sx - 5}
              y={Math.max(top, patchTop)}
              width={10}
              height={Math.max(2, Math.min(bottom, patchBottom) - Math.max(top, patchTop))}
              rx={4}
              filter={`url(#${blurId})`}
            />
          )}
          <g filter={sharp ? undefined : `url(#${blurId})`}>
            <Arrow foot={foot} tip={tip} cls="sm-caught-arrow" />
          </g>
        </g>
      );
    })();
    const std = Math.min(14, blurCm * box.scale * 0.35);
    return (
      <g
        class={s.canMoveScreen ? "sm-screen is-movable" : "sm-screen"}
        tabIndex={s.canMoveScreen ? 0 : undefined}
        onKeyDown={s.canMoveScreen ? onScreenKey : undefined}
        aria-label="screen"
      >
        <defs>
          <filter id={blurId} x="-200%" y="-50%" width="500%" height="200%">
            <feGaussianBlur stdDeviation={std.toFixed(2)} />
          </filter>
        </defs>
        <line class="sm-stand" x1={sx} y1={bottom} x2={sx} y2={height - 6} />
        <line class="sm-stand" x1={sx - 12} y1={height - 6} x2={sx + 12} y2={height - 6} />
        <rect class="sm-card" x={sx - 4} y={top} width={8} height={bottom - top} rx={2} />
        {picture}
        {sharp && (
          <text class="sm-tick" x={sx} y={top - 6} text-anchor="middle">
            ✓
          </text>
        )}
      </g>
    );
  })();
  // The two edge rays from the object's tip: to the mirror's edges, then on through a real image.
  const cone = ((): JSX.Element | null => {
    if (s.screen === null || s.beam) return null;
    const a = apertureOf(s);
    const tip = toPixel(s.object.x, s.object.height);
    return (
      <g class="sm-cone">
        {[a, -a].map((y) => {
          const edge = toPixel(surfaceX(s, y), y);
          const lines: [Px, Px][] = [[tip, edge]];
          if (img?.isReal) {
            const at = toPixel(img.v, img.height);
            lines.push([edge, toEdge(edge, at, 0)]);
          }
          return lines.map(([from, to]) => {
            const c = clipSegment(from, to, width, height);
            return c === null ? null : (
              <line key={`${y}-${from[0]}`} x1={c[0][0]} y1={c[0][1]} x2={c[1][0]} y2={c[1][1]} />
            );
          });
        })}
      </g>
    );
  })();
  const marks: [number, string][] = (
    [
      [0, "P"],
      [f, "F"],
      [2 * f, "C"],
    ] as [number, string][]
  ).filter(([, name]) => s.showFocus || name !== "F");
  // Without the object there are no rays and no image: just the mirror and its marks.
  const hasObject = !s.beam && s.showObject;
  const face = facePath(s, toPixel);
  // The image is drawn only when it fits the picture; otherwise a line says where it is.
  const caption = ((): string | null => {
    if (img === null) return "image at infinity";
    const [tx, ty] = toPixel(img.v, img.height);
    const [fx] = toPixel(img.v, 0);
    const fits = fx >= 8 && fx <= width - 8 && ty >= 8 && ty <= height - 8 && tx >= 8;
    if (fits) return null;
    const where = img.isReal ? "in front" : "behind";
    const size = Math.abs(img.magnification) > 1 ? "enlarged" : "diminished";
    return `image ${Math.round(Math.abs(img.v))} cm ${where}, ${img.isErect ? "erect" : "inverted"}, ${size}: outside the picture`;
  })();
  // A listed ray that would miss the mirror is swapped for the pole ray, which always reaches it.
  const raysToDraw: Ray[] = [];
  for (const ray of s.rays) {
    const want = rayPath(s, ray).isOffMirror ? Ray.Pole : ray;
    if (!raysToDraw.includes(want)) raysToDraw.push(want);
  }

  return (
    <div class="sm">
      <Stage
        label={`A ${s.kind} mirror with an object ${Math.round(-s.object.x)} cm in front; ${img === null ? "the image is at infinity" : `the image is ${img.isReal ? "real" : "virtual"}`}`}
        x={[leftEdge, box.window.xMax]}
        width={width}
        height={height}
        svg={{
          ref: svg,
          class: "sm-svg",
          onPointerDown,
          onPointerMove,
          onPointerUp,
          onPointerCancel: onPointerUp,
        }}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={0} y={0} width={width} height={height} rx={12} />
          </clipPath>
        </defs>
        <g clip-path={`url(#${clipId})`}>
          <rect class="sm-bg" x={0} y={0} width={width} height={height} rx={12} />
          {s.showRuler && (
            <g class="sm-ruler">
              {rulerTicks(s).map((x) => {
                const [px, py] = toPixel(x, 0);
                const isMajor = x % 10 === 0;
                return (
                  <g key={x}>
                    <line x1={px} y1={py} x2={px} y2={py + (isMajor ? 8 : 5)} />
                    {isMajor && (
                      <text x={px} y={py + RULER_ROW} text-anchor="middle">
                        {Math.abs(x)}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          )}
          <line class="sm-axis" x1={axis[0][0]} y1={axis[0][1]} x2={axis[1][0]} y2={axis[1][1]} />
          {/* The mirror: a shaded back behind the reflecting face. */}
          <path class="sm-back" d={face} transform="translate(5 0)" />
          <path class="sm-face" d={face} />
          {cone}
          {hasObject && raysToDraw.map(drawRay)}
          {s.beam && <Beam s={s} toPixel={toPixel} f={f} size={size} />}
          {marks.map(([x, name]) => {
            const [px, py] = toPixel(x, 0);
            return (
              <g key={name} class="sm-mark">
                <circle cx={px} cy={py} r={3.5} />
                {s.showLabels && (
                  <text x={px} y={py + LABEL} text-anchor="middle">
                    {name}
                  </text>
                )}
              </g>
            );
          })}
          {screenPart}
          {s.showSigns && <Signs pole={toPixel(0, 0)} height={height} />}
          {hasObject && shown && caption !== null && (
            <text class="sm-caption" x={12} y={height - 10}>
              {caption}
            </text>
          )}
          {hasObject && shown && img !== null && caption === null && (
            <Arrow
              foot={toPixel(img.v, 0)}
              tip={toPixel(img.v, img.height)}
              cls={img.isReal ? "sm-image" : "sm-image is-virtual"}
            />
          )}
          {hasObject && s.showNames && (
            <Name
              tip={toPixel(s.object.x, s.object.height)}
              foot={toPixel(s.object.x, 0)}
              text={words.object}
              cls="sm-name-object"
              width={width}
            />
          )}
          {hasObject && s.showNames && shown && img !== null && caption === null && (
            <Name
              tip={toPixel(img.v, img.height)}
              foot={toPixel(img.v, 0)}
              text={words.image}
              cls="sm-name-image"
              width={width}
            />
          )}
          {hasObject && (
            <g class="sm-object" tabIndex={0} onKeyDown={onKeyDown}>
              <Arrow
                foot={toPixel(s.object.x, 0)}
                tip={toPixel(s.object.x, s.object.height)}
                cls=""
              />
              <circle
                class="sm-handle"
                cx={toPixel(s.object.x, s.object.height)[0]}
                cy={toPixel(s.object.x, s.object.height)[1]}
                r={14}
              />
            </g>
          )}
          {!s.beam && s.markImage && !(shown && isMarkOnImage(s)) && (
            <g
              class="sm-mark-q"
              tabIndex={0}
              onKeyDown={onMarkKey}
              data-part={SphericalMirrorPart.Mark}
              aria-label="your guess for the image's tip"
            >
              <circle cx={toPixel(mark.x, mark.y)[0]} cy={toPixel(mark.x, mark.y)[1]} r={13} />
              <text
                x={toPixel(mark.x, mark.y)[0]}
                y={toPixel(mark.x, mark.y)[1] + 5}
                text-anchor="middle"
              >
                ?
              </text>
            </g>
          )}
        </g>
      </Stage>
      {s.showDistances && (
        <p class="sm-readout" data-part={SphericalMirrorPart.Readout}>
          {s.beam ? `f = ${signedCm(f)} cm` : readoutOf(s, shown)}
        </p>
      )}
      {(s.canSetFocal || s.canSetKind) && (
        <div class="sm-controls">
          {s.canSetKind && (
            <fieldset
              class="sm-toggle"
              data-part={SphericalMirrorPart.KindToggle}
              aria-label="mirror kind"
            >
              {[MirrorKind.Concave, MirrorKind.Convex].map((kind) => (
                <button
                  key={kind}
                  type="button"
                  class={kind === s.kind ? "sm-button is-on" : "sm-button"}
                  aria-pressed={kind === s.kind}
                  onClick={() => kind !== s.kind && call(SphericalMirrorAction.SetKind, { kind })}
                >
                  <MirrorIcon kind={kind} />
                  <span class="sm-kind-word">{words[kind]}</span>
                </button>
              ))}
            </fieldset>
          )}
          {s.canSetFocal && (
            <div class="sm-stepper" data-part={SphericalMirrorPart.FocalStepper}>
              <button
                type="button"
                class="sm-button"
                aria-label="focal length − 1 cm"
                disabled={s.focalLength - 1 < FOCAL.min}
                onClick={() => call(SphericalMirrorAction.SetFocalLength, { f: s.focalLength - 1 })}
              >
                −
              </button>
              <span class="sm-stepper-value">
                <span class="sm-name">f</span> = {s.focalLength} cm
              </span>
              <button
                type="button"
                class="sm-button"
                aria-label="focal length + 1 cm"
                disabled={s.focalLength + 1 > FOCAL.max}
                onClick={() => call(SphericalMirrorAction.SetFocalLength, { f: s.focalLength + 1 })}
              >
                +
              </button>
            </div>
          )}
        </div>
      )}
      {s.canPickRays && !s.beam && (
        <fieldset class="sm-rays" data-part={SphericalMirrorPart.RayPicker} aria-label={words.rays}>
          {RAY_ORDER.map((ray, k) => (
            <button
              key={ray}
              type="button"
              class={s.rays.includes(ray) ? "sm-button sm-ray-pick is-on" : "sm-button sm-ray-pick"}
              aria-pressed={s.rays.includes(ray)}
              aria-label={`${k + 1}: ${words[ray]}`}
              title={words[ray]}
              onClick={() => call(SphericalMirrorAction.ToggleRay, { ray })}
            >
              {k + 1}
            </button>
          ))}
        </fieldset>
      )}
    </div>
  );
}
