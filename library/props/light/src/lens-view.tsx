import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId, useRef } from "preact/hooks";
import {
  LENS_FOCAL,
  LensAction,
  LensCover,
  LensKind,
  LensObjectStyle,
  LensRay,
  type LensRayPath,
  LensSignal,
  type LensState,
  beamRays,
  blurOf,
  isImageDrawn,
  isSharpOf,
  leftmostObject,
  lensApertureOf,
  lensBox,
  lensImageOf,
  lensRayPath,
  markOnImageOf,
  markParking,
  openPart,
  patchCentreOf,
  readoutOf,
  spareRays,
} from "./lens";
import { clipSegment } from "./spherical-mirror-view";

type Px = [number, number];

/** Arrowhead length, px. */
const HEAD = 9;
/** How far below the axis O, F and 2F are named, px. */
const LABEL = 18;
/** A step of the arrow keys, cm. */
const NUDGE = 1;
/** How close to the handle a press must be to take it, px. */
const GRAB = 28;
/** Half the lens's thickness at its thick part, px. */
const THICK = 9;
/** Half the lens's thickness at its thin part, px. */
const THIN = 2.5;

/** A small filled triangle pointing along (dx, dy) with its tip at (x, y). */
function Head({ x, y, dx, dy }: { x: number; y: number; dx: number; dy: number }): JSX.Element {
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <path
      class="ln-head"
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
    <g class="ln-ray">
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

/** A phone held upside down, its screen facing the lens: from the axis up to the tip, in px. */
function Phone({ foot, tip }: { foot: Px; tip: Px }): JSX.Element {
  const h = Math.abs(foot[1] - tip[1]);
  const w = Math.max(8, Math.min(16, h * 0.45));
  const top = Math.min(foot[1], tip[1]);
  return (
    <g class="ln-phone">
      <rect class="ln-phone-body" x={foot[0] - w / 2} y={top} width={w} height={h} rx={3} />
      <rect
        class="ln-phone-glass"
        x={foot[0] + w / 2 - 3}
        y={top + 3}
        width={2.5}
        height={Math.max(0, h - 6)}
        rx={1}
      />
      {/* The camera bump sits at the phone's top, which is at the bottom when held upside down. */}
      <circle class="ln-phone-cam" cx={foot[0] - w / 4} cy={top + h - 4} r={1.6} />
    </g>
  );
}

/** The lens's outline: two arcs, thick in the middle (convex) or at the edges (concave). */
function lensPath(kind: LensState["kind"], cx: number, top: number, bottom: number): string {
  const mid = (top + bottom) / 2;
  if (kind === LensKind.Convex) {
    return `M${cx} ${top} Q${cx + 2 * THICK} ${mid} ${cx} ${bottom} Q${cx - 2 * THICK} ${mid} ${cx} ${top} Z`;
  }
  const bulge = 2 * (THICK - THIN);
  return `M${cx - THICK} ${top} L${cx + THICK} ${top} Q${cx + THICK - bulge} ${mid} ${cx + THICK} ${bottom} L${cx - THICK} ${bottom} Q${cx - THICK + bulge} ${mid} ${cx - THICK} ${top} Z`;
}

/** The lens, the axis, the object, the rays and the image, in px on a stage. The object's tip is the handle. */
/** The small names beside the arrows, by locale. */
const NAMES = {
  object: { en: "object", hi: "वस्तु" },
  phone: { en: "phone", hi: "फ़ोन" },
  image: { en: "image", hi: "प्रतिबिंब" },
} as const;

/** Each standard ray's button and what it says, by locale. */
const RAY_BUTTONS: { ray: LensRay; label: string; en: string; hi: string }[] = [
  {
    ray: LensRay.Parallel,
    label: "1",
    en: "Ray 1: parallel to the axis",
    hi: "किरण 1: अक्ष के समानांतर",
  },
  { ray: LensRay.Focal, label: "2", en: "Ray 2: through the focus", hi: "किरण 2: फोकस से होकर" },
  { ray: LensRay.Centre, label: "3", en: "Ray 3: through O", hi: "किरण 3: O से होकर" },
];

/**
 * How far each sphere's centre sits from the lens's face, px: as far as fits on the stage (`room`
 * from O to the nearer edge), so the centres show, but not so close the lens gets absurdly fat.
 */
function sphereGap(kind: LensState["kind"], c: number, room: number): number {
  const want = Math.max(1.2 * c, Math.min(room, 2.6 * c));
  if (kind === LensKind.Convex) return want;
  // A concave lens's faces stand apart by the hollow's depth, which eats into the room.
  const hollow = Math.hypot(want, c) - want + THIN;
  return Math.max(1.2 * c, Math.min(want, room - hollow));
}

/**
 * The lens drawn from two pieces of spheres of radius r px whose centres sit d px either side:
 * the shape `showCentres` explains. Returns the outline, the radius and the two centres' x.
 */
function sphericalLens(
  kind: LensState["kind"],
  cx: number,
  top: number,
  bottom: number,
  d: number,
): { path: string; r: number; left: number; right: number } {
  const c = (bottom - top) / 2;
  const r = Math.hypot(d, c);
  const sag = r - d;
  if (kind === LensKind.Convex) {
    // Each face bulges out by `sag`; the left face is part of the sphere centred on the right.
    return {
      path: `M${cx} ${top} A${r} ${r} 0 0 1 ${cx} ${bottom} A${r} ${r} 0 0 1 ${cx} ${top} Z`,
      r,
      left: cx - d,
      right: cx + d,
    };
  }
  // Each face is hollowed in by `sag`; the edges stand far enough apart to leave glass in the middle.
  const edge = sag + THIN;
  return {
    path: `M${cx - edge} ${top} L${cx + edge} ${top} A${r} ${r} 0 0 0 ${cx + edge} ${bottom} L${cx - edge} ${bottom} A${r} ${r} 0 0 0 ${cx - edge} ${top} Z`,
    r,
    left: cx - edge - d,
    right: cx + edge + d,
  };
}

export function LensView({ view, width, call, signal, locale }: PropViewProps): JSX.Element {
  // The player hands each view its own prop's state, already checked against its schema.
  const s = view as unknown as LensState;
  const svg = useRef<SVGSVGElement | null>(null);
  const id = useId();
  const clipId = `ln-clip-${id}`;
  const blurId = `ln-blur-${id}`;
  const box = lensBox(s, width);
  const { height, toPixel } = box;
  const f = s.focalLength;
  const img = lensImageOf(s);
  const leftEdge = box.toCm(0);
  const rightEdge = box.toCm(width);
  const axis: [Px, Px] = [toPixel(leftEdge, 0), toPixel(rightEdge, 0)];
  const a = lensApertureOf(s);

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
  const clampX = (x: number): number =>
    Math.min(-0.5, Math.max(leftmostObject(s), Math.round(x * 2) / 2));
  const words = (k: keyof typeof NAMES): string => (locale === "hi" ? NAMES[k].hi : NAMES[k].en);
  const mark = s.markImage ? (s.mark ?? markParking(s)) : null;
  const isOnMark = (p: Px): boolean => {
    if (mark === null || s.beam) return false;
    const [mx, my] = toPixel(mark.x, mark.y);
    return Math.hypot(p[0] - mx, p[1] - my) <= GRAB;
  };
  const clampMark = (x: number, y: number): { x: number; y: number } => ({
    x: Math.max(box.toCm(10), Math.min(box.toCm(width - 10), Math.round(x * 2) / 2)),
    y: Math.max(-box.window.yMax + 0.5, Math.min(box.window.yMax - 0.5, Math.round(y * 2) / 2)),
  });
  /** The screen's reach on the far side, cm: half a cm from the lens to just inside the right edge. */
  const clampScreen = (x: number): number =>
    Math.max(0.5, Math.min(Math.min(200, box.window.xMax - 0.5), Math.round(x * 2) / 2));
  const isOnScreen = (p: Px): boolean => {
    if (s.screen === null || !s.canMoveScreen || s.beam) return false;
    const [sx, top] = toPixel(s.screen, 1.1 * a);
    const [, bottom] = toPixel(s.screen, -1.1 * a);
    return Math.abs(p[0] - sx) <= GRAB && p[1] >= top - GRAB && p[1] <= bottom + GRAB;
  };
  // A drag moves the object (or the screen) by how far the finger has moved since it took hold.
  const drag = useRef<{
    what: "object" | "screen" | "mark";
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
  } | null>(null);
  const onPointerDown = (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
    const p = svgPoint(event);
    const what = isOnMark(p) ? "mark" : isOnHandle(p) ? "object" : isOnScreen(p) ? "screen" : null;
    if (what === null) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      what,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: what === "object" ? s.object.x : what === "mark" ? (mark?.x ?? 0) : (s.screen ?? 0),
      startY: what === "mark" ? (mark?.y ?? 0) : 0,
    };
  };
  const onPointerMove = (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (d === null || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const moved = d.startX + ((event.clientX - d.startClientX) * pxPerClient()) / box.scale;
    if (d.what === "mark") {
      const k = pxPerClient() / box.scale;
      const m = clampMark(moved, d.startY - (event.clientY - d.startClientY) * k);
      if (s.mark === null || m.x !== s.mark.x || m.y !== s.mark.y) call(LensAction.MoveMark, m);
    } else if (d.what === "object") {
      const x = clampX(moved);
      if (x !== s.object.x) call(LensAction.MoveObject, { x });
    } else {
      const x = clampScreen(moved);
      if (x !== s.screen) call(LensAction.MoveScreen, { x });
    }
  };
  const onPointerUp = (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (d === null) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (d.what === "object") signal(LensSignal.ObjectReleased, { x: s.object.x });
    else if (d.what === "mark") signal(LensSignal.MarkReleased, { x: s.mark?.x, y: s.mark?.y });
    else signal(LensSignal.ScreenReleased, { x: s.screen });
  };
  const onMarkKeyDown = (event: JSX.TargetedKeyboardEvent<SVGGElement>) => {
    if (mark === null) return;
    const dx = event.key === "ArrowRight" ? 0.5 : event.key === "ArrowLeft" ? -0.5 : 0;
    const dy = event.key === "ArrowUp" ? 0.5 : event.key === "ArrowDown" ? -0.5 : 0;
    if (dx === 0 && dy === 0) return;
    event.preventDefault();
    const m = clampMark(mark.x + dx, mark.y + dy);
    call(LensAction.MoveMark, m);
    signal(LensSignal.MarkReleased, m);
  };
  const onScreenKeyDown = (event: JSX.TargetedKeyboardEvent<SVGGElement>) => {
    const delta = event.key === "ArrowRight" ? 0.5 : event.key === "ArrowLeft" ? -0.5 : 0;
    if (delta === 0 || s.screen === null) return;
    event.preventDefault();
    const x = clampScreen(s.screen + delta);
    call(LensAction.MoveScreen, { x });
    signal(LensSignal.ScreenReleased, { x });
  };
  const onKeyDown = (event: JSX.TargetedKeyboardEvent<SVGGElement>) => {
    const delta = event.key === "ArrowRight" ? NUDGE : event.key === "ArrowLeft" ? -NUDGE : 0;
    if (delta === 0) return;
    event.preventDefault();
    const x = clampX(s.object.x + delta);
    call(LensAction.MoveObject, { x });
    signal(LensSignal.ObjectReleased, { x });
  };

  /** Where a line from `p` along `dir` reaches the right edge of the stage, px. */
  const toRightEdge = (p: [number, number], dir: [number, number]): Px => {
    const [dx, dy] = dir;
    if (dx <= 1e-9) return toPixel(p[0], p[1]);
    const t = (rightEdge - p[0]) / dx;
    return toPixel(rightEdge, p[1] + dy * t);
  };

  const drawPath = (path: LensRayPath, key: string): JSX.Element | null => {
    if (path.isOff) return null;
    const from = toPixel(path.from[0], path.from[1]);
    const hit = toPixel(path.hit[0], path.hit[1]);
    // A real image's rays are aimed through its tip so they visibly meet there.
    const out =
      img?.isReal && !s.beam
        ? toRightEdge(path.hit, [img.v - path.hit[0], img.height - path.hit[1]])
        : toRightEdge(path.hit, path.out);
    const dash = (p: [number, number] | null, k: string, start: Px = hit) => {
      if (p === null) return null;
      const c = clipSegment(start, toPixel(p[0], p[1]), width, height);
      if (c === null) return null;
      return <line key={k} class="ln-dashed" x1={c[0][0]} y1={c[0][1]} x2={c[1][0]} y2={c[1][1]} />;
    };
    const solid = (a: Px, b: Px) => {
      const c = clipSegment(a, b, width, height);
      if (c === null || Math.hypot(c[1][0] - c[0][0], c[1][1] - c[0][1]) < 1) return null;
      return <Segment from={c[0]} to={c[1]} />;
    };
    return (
      <g key={key}>
        {dash(path.source, "source", from)}
        {solid(from, hit)}
        {solid(hit, out)}
        {dash(path.aim, "aim")}
        {dash(path.back, "back")}
      </g>
    );
  };

  /** The screen at its x: a white card on a stand, the patch it catches, and the cone from the tip. */
  const screenArt = (): JSX.Element | null => {
    if (s.screen === null) return null;
    const x = s.screen;
    const [sx, top] = toPixel(x, 1.1 * a);
    const [, bottom] = toPixel(x, -1.1 * a);
    const blur = blurOf(s) ?? 0;
    const sharp = isSharpOf(s);
    const centre = patchCentreOf(s);
    const tip = toPixel(s.object.x, s.object.height);
    const [lo, hi] = openPart(s);
    // The cone: from the tip to the lens's open edges, then on (through the image) to the screen.
    const cone: JSX.Element[] = [];
    if (img?.isReal) {
      for (const edge of [lo, hi]) {
        const at = toPixel(0, edge);
        const yScreen = edge + (img.height - edge) * (x / img.v);
        for (const [k, seg] of [
          [`in${edge}`, clipSegment(tip, at, width, height)],
          [`out${edge}`, clipSegment(at, toPixel(x, yScreen), width, height)],
        ] as const) {
          if (seg !== null)
            cone.push(
              <line
                key={k}
                class="ln-cone"
                x1={seg[0][0]}
                y1={seg[0][1]}
                x2={seg[1][0]}
                y2={seg[1][1]}
              />,
            );
        }
      }
    }
    // What the screen catches: the image's shape, as it really is, blurred by how far it is out.
    let caught: JSX.Element | null = null;
    if (img?.isReal && centre !== null) {
      const k = x / img.v;
      const foot = toPixel(x, 0);
      const head = toPixel(x, img.height * k);
      if (sharp) {
        caught = (
          <g class="ln-caught is-sharp">
            <circle class="ln-glow" cx={head[0] + 3} cy={head[1]} r={8} />
            <line x1={foot[0] + 3} y1={foot[1]} x2={head[0] + 3} y2={head[1]} />
          </g>
        );
      } else {
        // Every point of the object makes its own patch, blur cm high: the shape smears out
        // and the light spreads thinner the further the screen is from the image.
        const lo = Math.min(0, centre) - blur;
        const hi = Math.max(0, centre) + blur;
        const [, yTop] = toPixel(x, hi);
        const [, yBottom] = toPixel(x, lo);
        const strength = Math.max(0.12, Math.min(0.7, 1.2 / (1 + blur)));
        caught = (
          <g class="ln-caught" filter={`url(#${blurId})`} opacity={strength}>
            <rect
              class="ln-smear"
              x={sx - 2}
              y={yTop}
              width={10}
              height={Math.max(2, yBottom - yTop)}
              rx={3}
            />
            <line x1={foot[0] + 3} y1={foot[1]} x2={head[0] + 3} y2={head[1]} />
          </g>
        );
      }
    } else {
      caught = (
        <rect class="ln-patch" x={sx - 2} y={top + 4} width={10} height={bottom - top - 8} rx={2} />
      );
    }
    return (
      <g class="ln-screen-wrap">
        {cone}
        <g
          class={s.canMoveScreen ? "ln-screen is-movable" : "ln-screen"}
          tabIndex={s.canMoveScreen ? 0 : undefined}
          onKeyDown={s.canMoveScreen ? onScreenKeyDown : undefined}
        >
          <rect class="ln-card-screen" x={sx - 4} y={top} width={14} height={bottom - top} rx={2} />
          <line
            class="ln-stand"
            x1={sx + 3}
            y1={bottom}
            x2={sx + 3}
            y2={Math.min(height - 4, bottom + 14)}
          />
          <line
            class="ln-stand"
            x1={sx - 9}
            y1={Math.min(height - 4, bottom + 14)}
            x2={sx + 15}
            y2={Math.min(height - 4, bottom + 14)}
          />
          {caught}
        </g>
      </g>
    );
  };

  const marks: [number, string][] = (
    [
      [0, "O"],
      [-f, "F₁"],
      [f, "F₂"],
      [-2 * f, "2F₁"],
      [2 * f, "2F₂"],
    ] as [number, string][]
  ).filter(([, name]) => s.showFocus || name === "O");

  // The image is drawn only when it fits the picture; otherwise a line says where it is.
  const caption = ((): string | null => {
    if (s.beam) return null;
    if (img === null) return "image at infinity: the rays come out parallel";
    const [tx, ty] = toPixel(img.v, img.height);
    const fits = tx >= 8 && tx <= width - 8 && ty >= 8 && ty <= height - 8;
    if (fits) return null;
    const side = img.isReal ? "on the other side" : "on the object's side";
    const size = Math.abs(img.magnification) > 1 ? "enlarged" : "diminished";
    return `image ${Math.round(Math.abs(img.v))} cm ${side}, ${img.isErect ? "erect" : "inverted"}, ${size}: outside the picture`;
  })();

  const paths: [LensRayPath, string][] = s.beam
    ? beamRays(s).map((p, k) => [p, `beam${k}`])
    : [
        ...s.rays.map((ray): [LensRayPath, string] => [lensRayPath(s, ray), ray]),
        ...spareRays(s).map((p, k): [LensRayPath, string] => [p, `spare${k}`]),
      ];

  const [cx, top] = toPixel(0, a);
  const [, bottom] = toPixel(0, -a);
  const [, mid] = toPixel(0, 0);
  // With the centres shown, the lens is drawn from true pieces of spheres whose centres fit on the
  // stage (thicker than the plain outline, as a textbook figure is).
  const spheres = s.showCentres
    ? sphericalLens(
        s.kind,
        cx,
        top,
        bottom,
        sphereGap(s.kind, (bottom - top) / 2, Math.min(cx, width - cx) - 22),
      )
    : null;
  const imageShown = !s.beam && img !== null && isImageDrawn(s);
  const markIsRight = s.markImage && markOnImageOf(s);
  const card: [number, number] | null =
    s.cover === LensCover.None
      ? null
      : s.cover === LensCover.Top
        ? [top - 4, mid]
        : [mid, bottom + 4];

  const setF = (next: number) => {
    const clamped = Math.min(LENS_FOCAL.max, Math.max(LENS_FOCAL.min, next));
    if (clamped !== s.focalLength) call(LensAction.SetFocalLength, { f: clamped });
  };

  return (
    <div class="ln">
      <Stage
        label={
          s.beam
            ? `Sunlight through a ${s.kind} lens`
            : `A ${s.kind} lens with an object ${Math.round(-s.object.x)} cm to the left; ${img === null ? "the image is at infinity" : `the image is ${img.isReal ? "real" : "virtual"}`}`
        }
        x={[leftEdge, box.window.xMax]}
        width={width}
        height={height}
        svg={{
          ref: svg,
          class: "ln-svg",
          onPointerDown,
          onPointerMove,
          onPointerUp,
          onPointerCancel: onPointerUp,
        }}
      >
        <defs>
          <filter id={blurId} x="-300%" y="-50%" width="700%" height="200%">
            <feGaussianBlur
              stdDeviation={`1.5 ${Math.min(10, 0.3 * (blurOf(s) ?? 0) * box.scale)}`}
            />
          </filter>
          <clipPath id={clipId}>
            <rect x={0} y={0} width={width} height={height} rx={12} />
          </clipPath>
        </defs>
        <g clip-path={`url(#${clipId})`}>
          <rect class="ln-bg" x={0} y={0} width={width} height={height} rx={12} />
          <line class="ln-axis" x1={axis[0][0]} y1={axis[0][1]} x2={axis[1][0]} y2={axis[1][1]} />
          {spheres !== null && (
            <g class="ln-spheres">
              {(
                [
                  [spheres.left, "C₁"],
                  [spheres.right, "C₂"],
                ] as const
              ).map(([x, name]) => (
                <g key={name}>
                  <circle class="ln-sphere" cx={x} cy={mid} r={spheres.r} />
                  <circle class="ln-sphere-centre" cx={x} cy={mid} r={3} />
                  <text class="ln-sphere-name" x={x} y={mid - 9} text-anchor="middle">
                    {name}
                  </text>
                </g>
              ))}
            </g>
          )}
          <path
            class="ln-glass"
            d={spheres !== null ? spheres.path : lensPath(s.kind, cx, top, bottom)}
          />
          {paths.map(([p, key]) => drawPath(p, key))}
          {card !== null && (
            <rect
              class="ln-card"
              x={cx - THICK - 4}
              y={card[0]}
              width={2 * THICK + 8}
              height={card[1] - card[0]}
              rx={2}
            />
          )}
          {marks.map(([x, name]) => {
            const [px, py] = toPixel(x, 0);
            return (
              <g key={name} class="ln-mark">
                <circle cx={px} cy={py} r={3.5} />
                {s.showLabels && (
                  <text x={px} y={py + LABEL} text-anchor="middle">
                    {name}
                  </text>
                )}
              </g>
            );
          })}
          {(s.showImage || markIsRight) && caption !== null && (
            <text class="ln-caption" x={12} y={height - 10}>
              {caption}
            </text>
          )}
          {imageShown && img !== null && caption === null && (
            <g>
              <Arrow
                foot={toPixel(img.v, 0)}
                tip={toPixel(img.v, img.height)}
                cls={`ln-image${img.isReal ? "" : " is-virtual"}${s.cover === LensCover.None ? "" : " is-dim"}`}
              />
              {s.showNames && (
                <text
                  class="ln-name is-image"
                  x={toPixel(img.v, 0)[0] + (toPixel(img.v, 0)[0] > width - 72 ? -7 : 7)}
                  y={toPixel(img.v, img.height)[1] + (img.height < 0 ? -4 : 12)}
                  text-anchor={toPixel(img.v, 0)[0] > width - 72 ? "end" : "start"}
                >
                  {words("image")}
                </text>
              )}
            </g>
          )}
          {!s.beam && s.screen !== null && screenArt()}
          {!s.beam && (
            <g class="ln-object" tabIndex={0} onKeyDown={onKeyDown}>
              {s.objectStyle === LensObjectStyle.Phone ? (
                <Phone foot={toPixel(s.object.x, 0)} tip={toPixel(s.object.x, s.object.height)} />
              ) : (
                <Arrow
                  foot={toPixel(s.object.x, 0)}
                  tip={toPixel(s.object.x, s.object.height)}
                  cls=""
                />
              )}
              <circle
                class="ln-handle"
                cx={toPixel(s.object.x, s.object.height)[0]}
                cy={toPixel(s.object.x, s.object.height)[1]}
                r={14}
              />
              {s.showNames && (
                <text
                  class="ln-name"
                  x={Math.max(34, Math.min(width - 34, toPixel(s.object.x, 0)[0]))}
                  y={Math.max(12, toPixel(s.object.x, s.object.height)[1] - 18)}
                  text-anchor="middle"
                >
                  {words(s.objectStyle === LensObjectStyle.Phone ? "phone" : "object")}
                </text>
              )}
            </g>
          )}
          {!s.beam && mark !== null && (
            <g
              class={markIsRight ? "ln-mark-q is-right" : "ln-mark-q"}
              tabIndex={0}
              onKeyDown={onMarkKeyDown}
              aria-label="Marker for the image's tip"
            >
              <circle cx={toPixel(mark.x, mark.y)[0]} cy={toPixel(mark.x, mark.y)[1]} r={11} />
              <text
                x={toPixel(mark.x, mark.y)[0]}
                y={toPixel(mark.x, mark.y)[1] + 5}
                text-anchor="middle"
              >
                {markIsRight ? "✓" : "?"}
              </text>
            </g>
          )}
        </g>
      </Stage>
      {(s.showDistances && !s.beam) || s.canSetFocal || (s.canPickRays && !s.beam) ? (
        <div class="ln-under">
          {s.canPickRays && !s.beam && (
            <span class="ln-pick">
              {RAY_BUTTONS.map((b) => (
                <button
                  key={b.ray}
                  type="button"
                  class={s.rays.includes(b.ray) ? "ln-raybtn is-on" : "ln-raybtn"}
                  aria-pressed={s.rays.includes(b.ray)}
                  aria-label={locale === "hi" ? b.hi : b.en}
                  title={locale === "hi" ? b.hi : b.en}
                  onClick={() => call(LensAction.ToggleRay, { ray: b.ray })}
                >
                  {b.label}
                </button>
              ))}
            </span>
          )}
          {s.showDistances && !s.beam && <span class="ln-readout">{readoutOf(s)}</span>}
          {s.canSetFocal && (
            <span class="ln-focal">
              <button
                type="button"
                class="ln-step"
                aria-label="Shorter focal length"
                disabled={s.focalLength <= LENS_FOCAL.min}
                onClick={() => setF(s.focalLength - 1)}
              >
                −
              </button>
              <span class="ln-focal-value">f = {s.focalLength} cm</span>
              <button
                type="button"
                class="ln-step"
                aria-label="Longer focal length"
                disabled={s.focalLength >= LENS_FOCAL.max}
                onClick={() => setF(s.focalLength + 1)}
              >
                +
              </button>
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}
