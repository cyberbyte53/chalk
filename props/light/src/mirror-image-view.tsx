import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useRef } from "preact/hooks";
import {
  DISTANCE,
  EYE,
  EYE_R,
  MIRROR,
  MirrorImageAction,
  MirrorImageSignal,
  type MirrorImageState,
  PAPER,
  WINDOW,
  boxOf,
  raysOf,
} from "./mirror-image";

type Px = [number, number];

/** Arrowhead length, px. */
const HEAD = 9;
/** A step of the arrow keys, cm. */
const NUDGE = 1;
/** How close to a handle a press must be to take it, px. */
const GRAB = 28;
/** Hatch marks behind the mirror, cm up. */
const HATCH = Array.from(
  { length: 14 },
  (_, k) => MIRROR.bottom + 1 + (k * (MIRROR.top - MIRROR.bottom - 2)) / 13,
);

/** The labels, in the page's language. */
const NAMES = {
  en: { object: "object", image: "image", mirror: "mirror" },
  hi: { object: "वस्तु", image: "प्रतिबिंब", mirror: "दर्पण" },
} as const;

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));
const half = (v: number): number => Math.round(v * 2) / 2;
const fmt = (v: number): string => String(Number(v.toFixed(1)));

function Head({ x, y, dx, dy }: { x: number; y: number; dx: number; dy: number }): JSX.Element {
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <path
      class="mi-head"
      d={`M0 0 L${-HEAD} ${-HEAD * 0.55} L${-HEAD} ${HEAD * 0.55} Z`}
      transform={`translate(${x} ${y}) rotate(${angle})`}
    />
  );
}

function Segment({ from, to, at = 0.55 }: { from: Px; to: Px; at?: number }): JSX.Element {
  return (
    <g class="mi-ray">
      <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} />
      <Head
        x={from[0] + (to[0] - from[0]) * at}
        y={from[1] + (to[1] - from[1]) * at}
        dx={to[0] - from[0]}
        dy={to[1] - from[1]}
      />
    </g>
  );
}

function Arrow({ foot, tip, cls }: { foot: Px; tip: Px; cls: string }): JSX.Element {
  return (
    <g class={cls}>
      <line x1={foot[0]} y1={foot[1]} x2={tip[0]} y2={tip[1]} />
      <Head x={tip[0]} y={tip[1]} dx={0} dy={tip[1] - foot[1]} />
    </g>
  );
}

/** An eye looking right, towards the mirror, centred on (x, y) px; `r` is half its width. */
function Eye({ x, y, r }: { x: number; y: number; r: number }): JSX.Element {
  const h = r * 0.62;
  return (
    <g class="mi-eye" transform={`translate(${x} ${y})`}>
      <path d={`M${-r} 0 Q0 ${-h * 1.6} ${r} 0 Q0 ${h * 1.6} ${-r} 0 Z`} />
      <circle class="mi-iris" cx={r * 0.35} cy={0} r={h * 0.8} />
      <circle class="mi-pupil" cx={r * 0.45} cy={0} r={h * 0.38} />
    </g>
  );
}

/** The mirror, the object, the eye, the rays into the eye, their extensions and the image. */
export function MirrorImageView({ view, width, call, signal, locale }: PropViewProps): JSX.Element {
  // The player hands each view its own prop's state, already checked against its schema.
  const s = view as unknown as MirrorImageState;
  const svg = useRef<SVGSVGElement | null>(null);
  const box = boxOf(width);
  const { height, toPixel, scale } = box;
  const rays = raysOf(s);
  const names = locale === "hi" ? NAMES.hi : NAMES.en;

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
  const near = (p: Px, x: number, y: number): boolean => {
    const [hx, hy] = toPixel(x, y);
    return Math.hypot(p[0] - hx, p[1] - hy) <= GRAB;
  };
  type Drag =
    | { what: "object"; startClient: Px; start: number }
    | { what: "eye"; startClient: Px; start: Px };
  const drag = useRef<Drag | null>(null);
  const onPointerDown = (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
    const p = svgPoint(event);
    const client: Px = [event.clientX, event.clientY];
    if (near(p, -s.distance, s.height)) {
      drag.current = { what: "object", startClient: client, start: s.distance };
    } else if (s.canMoveEye && near(p, -s.eye.x, s.eye.y)) {
      drag.current = { what: "eye", startClient: client, start: [s.eye.x, s.eye.y] };
    } else return;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (d === null || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const k = pxPerClient() / scale;
    const dx = (event.clientX - d.startClient[0]) * k;
    const dy = (event.clientY - d.startClient[1]) * k;
    if (d.what === "object") {
      // Dragging left moves the object away from the mirror.
      const distance = clamp(half(d.start - dx), DISTANCE.min, DISTANCE.max);
      if (distance !== s.distance) call(MirrorImageAction.MoveObject, { distance });
    } else {
      const x = clamp(half(d.start[0] - dx), EYE.xMin, EYE.xMax);
      const y = clamp(half(d.start[1] - dy), EYE.yMin, EYE.yMax);
      if (x !== s.eye.x || y !== s.eye.y) call(MirrorImageAction.MoveEye, { x, y });
    }
  };
  const onPointerUp = (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (d === null) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (d.what === "object") signal(MirrorImageSignal.ObjectReleased, { distance: s.distance });
  };
  const onObjectKey = (event: JSX.TargetedKeyboardEvent<SVGGElement>) => {
    // The object is left of the mirror: the left arrow moves it away, the right arrow nearer.
    const delta = event.key === "ArrowLeft" ? NUDGE : event.key === "ArrowRight" ? -NUDGE : 0;
    if (delta === 0) return;
    event.preventDefault();
    const distance = clamp(s.distance + delta, DISTANCE.min, DISTANCE.max);
    call(MirrorImageAction.MoveObject, { distance });
    signal(MirrorImageSignal.ObjectReleased, { distance });
  };
  const onEyeKey = (event: JSX.TargetedKeyboardEvent<SVGGElement>) => {
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [NUDGE, 0],
      ArrowRight: [-NUDGE, 0],
      ArrowUp: [0, NUDGE],
      ArrowDown: [0, -NUDGE],
    };
    const m = moves[event.key];
    if (m === undefined) return;
    event.preventDefault();
    call(MirrorImageAction.MoveEye, {
      x: clamp(s.eye.x + m[0], EYE.xMin, EYE.xMax),
      y: clamp(s.eye.y + m[1], EYE.yMin, EYE.yMax),
    });
  };

  const [mx, mTop] = toPixel(0, MIRROR.top);
  const [, mBottom] = toPixel(0, MIRROR.bottom);
  const floorY = toPixel(0, 0)[1];
  const objFoot = toPixel(-s.distance, 0);
  const objTip = toPixel(-s.distance, s.height);
  const imgFoot = toPixel(s.distance, 0);
  const imgTip = toPixel(s.distance, s.height);
  const eye = toPixel(-s.eye.x, s.eye.y);
  const rulerY = floorY + 22;
  const extensions = (cls: string) =>
    s.showExtensions &&
    rays.map((ray) => {
      const hit = toPixel(ray.hit[0], ray.hit[1]);
      const tip = toPixel(ray.image[0], ray.image[1]);
      return (
        <line key={`ext${ray.to[1]}`} class={cls} x1={hit[0]} y1={hit[1]} x2={tip[0]} y2={tip[1]} />
      );
    });
  const [paperX0, paperY0] = toPixel(s.distance - PAPER.half, s.height + PAPER.above);
  const [paperX1, paperY1] = toPixel(s.distance + PAPER.half, -0.6);
  // Clear of the object's drag handle.
  const labelGap = 20;
  const isClose = s.distance < 9;

  return (
    <div class="mi">
      <Stage
        label={`A plane mirror with an object ${fmt(s.distance)} cm in front of it and an eye looking at its reflection${s.showImage ? `; the image is ${fmt(s.distance)} cm behind the mirror` : ""}`}
        x={[WINDOW.xMin, WINDOW.xMax]}
        width={width}
        height={height}
        svg={{
          ref: svg,
          class: "mi-svg",
          onPointerDown,
          onPointerMove,
          onPointerUp,
          onPointerCancel: onPointerUp,
        }}
      >
        <rect class="mi-bg" x={0} y={0} width={width} height={height} rx={12} />
        {/* Behind the mirror: a quieter background, where light never really goes. */}
        <rect class="mi-behind" x={mx} y={0} width={width - mx} height={height} />
        <line class="mi-floor" x1={0} y1={floorY} x2={width} y2={floorY} />
        <g class="mi-mirror">
          <line x1={mx} y1={mTop} x2={mx} y2={mBottom} />
          {HATCH.map((cm) => {
            const y = toPixel(0, cm)[1];
            return <line key={cm} class="mi-hatch" x1={mx + 3} y1={y} x2={mx + 11} y2={y + 7} />;
          })}
        </g>
        {rays.map((ray) => {
          const from = toPixel(ray.from[0], ray.from[1]);
          const hit = toPixel(ray.hit[0], ray.hit[1]);
          const to = toPixel(ray.to[0], ray.to[1]);
          return (
            <g key={`ray${ray.to[1]}`}>
              <Segment from={from} to={hit} />
              <Segment from={hit} to={to} at={0.5} />
            </g>
          );
        })}
        {!s.showPaper && extensions("mi-dashed")}
        {s.showImage && <Arrow foot={imgFoot} tip={imgTip} cls="mi-image" />}
        {/* The paper: drawn over the image, blank, because no light ever reaches it. */}
        {s.showPaper && (
          <rect
            class="mi-paper"
            x={paperX0}
            y={paperY0}
            width={paperX1 - paperX0}
            height={paperY1 - paperY0}
            rx={2}
          />
        )}
        {s.showPaper && extensions("mi-dashed is-faint")}
        {s.showNames && (
          <g class="mi-name">
            {/* Close to the mirror the two names lean apart so they never collide. */}
            <text
              x={objTip[0] + (isClose ? 6 : 0)}
              y={objTip[1] - labelGap}
              text-anchor={isClose ? "end" : "middle"}
            >
              {names.object}
            </text>
            {s.showImage && (
              <text
                x={imgTip[0] - (isClose ? 6 : 0)}
                y={(s.showPaper ? paperY0 : imgTip[1]) - labelGap}
                text-anchor={isClose ? "start" : "middle"}
              >
                {names.image}
              </text>
            )}
            <text x={mx} y={mBottom + 16} text-anchor="middle">
              {names.mirror}
            </text>
          </g>
        )}
        {s.showDistances && (
          <g class="mi-ruler">
            <line x1={objFoot[0]} y1={rulerY} x2={imgFoot[0]} y2={rulerY} />
            {[objFoot[0], mx, imgFoot[0]].map((x) => (
              <line key={x} x1={x} y1={rulerY - 5} x2={x} y2={rulerY + 5} />
            ))}
            <text x={(objFoot[0] + mx) / 2} y={rulerY - 8} text-anchor="middle">
              {fmt(s.distance)} cm
            </text>
            <text x={(mx + imgFoot[0]) / 2} y={rulerY - 8} text-anchor="middle">
              {fmt(s.distance)} cm
            </text>
          </g>
        )}
        <g
          class={s.canMoveEye ? "mi-eye-handle is-movable" : "mi-eye-handle"}
          tabIndex={s.canMoveEye ? 0 : -1}
          onKeyDown={s.canMoveEye ? onEyeKey : undefined}
        >
          <Eye x={eye[0]} y={eye[1]} r={EYE_R * scale} />
          {s.canMoveEye && <circle class="mi-handle" cx={eye[0]} cy={eye[1]} r={16} />}
        </g>
        <g class="mi-object" tabIndex={0} onKeyDown={onObjectKey}>
          <Arrow foot={objFoot} tip={objTip} cls="" />
          <circle class="mi-handle" cx={objTip[0]} cy={objTip[1]} r={14} />
        </g>
      </Stage>
    </div>
  );
}
