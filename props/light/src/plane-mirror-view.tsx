import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useRef } from "preact/hooks";
import {
  INSET,
  LABEL_ORDER,
  LABEL_WORDS,
  PlaneMirrorAction,
  type PlaneMirrorLabel,
  PlaneMirrorSignal,
  type PlaneMirrorState,
  ROOM,
  TORCH_HEIGHT,
  pixelsOf,
  reflectedX,
} from "./plane-mirror";

type View = PlaneMirrorState & { incidence: number; isLit: boolean };

/** Radius of the angle arcs, px. */
const ARC = 34;
/** Half the length of the torch's body, px. */
const TORCH = 11;
/** A step of the arrow keys, cm. */
const NUDGE = 1;
/** How close to the handle a press must be to take it, px. */
const GRAB = 28;
/** Where the hatching behind the mirror sits, in cm. */
const HATCH = Array.from({ length: 25 }, (_, k) => (k + 0.5) * (ROOM.width / 25));

const round = (v: number): number => Math.round(v);

/** The ruler's ticks, cm: every 5, numbered every 10. */
const TICKS = Array.from({ length: ROOM.width / 5 + 1 }, (_, k) => k * 5);
/** The right-angle mark at the foot of the normal, px. */
const SQUARE = 20;

/** Words that are not labels: the readout and the button. */
const WORDS = {
  en: { landsAt: (cm: number) => `lands at ${cm} cm`, next: "next →" },
  hi: { landsAt: (cm: number) => `${cm} सेमी पर पड़ती है`, next: "आगे →" },
} as const;

type Placed = {
  label: PlaneMirrorLabel;
  /** Where the leader line touches the thing named, px. */
  at: [number, number];
  /** Where the words sit, px, and which way they run from there. */
  text: [number, number];
  anchor: "start" | "end" | "middle";
};

/** An SVG arc from the normal (straight up) at the strike point to the ray on side `side`. */
function arcPath(cx: number, cy: number, side: -1 | 1, degrees: number): string {
  const rad = (degrees * Math.PI) / 180;
  const x = cx + side * ARC * Math.sin(rad);
  const y = cy - ARC * Math.cos(rad);
  return `M${cx} ${cy - ARC} A${ARC} ${ARC} 0 0 ${side > 0 ? 1 : 0} ${x} ${y}`;
}

/** A small filled arrowhead on the segment from (x1,y1) to (x2,y2), placed `at` of the way along. */
function Arrowhead({
  x1,
  y1,
  x2,
  y2,
  at,
}: { x1: number; y1: number; x2: number; y2: number; at: number }): JSX.Element {
  const px = x1 + (x2 - x1) * at;
  const py = y1 + (y2 - y1) * at;
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <path
      class="pm-arrowhead"
      d="M-7 -5 L5 0 L-7 5 Z"
      transform={`translate(${px} ${py}) rotate(${angle})`}
    />
  );
}

function Torch({
  x,
  y,
  toX,
  toY,
}: { x: number; y: number; toX: number; toY: number }): JSX.Element {
  const angle = (Math.atan2(toY - y, toX - x) * 180) / Math.PI;
  return (
    <g class="pm-torch" transform={`translate(${x} ${y}) rotate(${angle})`}>
      <rect x={-TORCH - 10} y={-6} width={TORCH + 4} height={12} rx={3} />
      <path d={`M${-TORCH + 4} -9 L${TORCH} -6 L${TORCH} 6 L${-TORCH + 4} 9 Z`} />
    </g>
  );
}

function Star({ x, y, isLit }: { x: number; y: number; isLit: boolean }): JSX.Element {
  const points = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? 11 : 5;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
  return (
    <g class={isLit ? "pm-target is-lit" : "pm-target"} transform={`translate(${x} ${y})`}>
      {isLit && <circle class="pm-glow" r={22} />}
      <polygon points={points} />
    </g>
  );
}

/** The room: the mirror along the floor, the torch, the ray in and out, the normal, the angles, the target. */
export function PlaneMirrorView({ view, width, call, signal, locale }: PropViewProps): JSX.Element {
  // The player hands each view its own prop's state, already checked against its schema.
  const s = view as unknown as View;
  const svg = useRef<SVGSVGElement | null>(null);
  const px = pixelsOf(width);
  const height = px.height;

  const pxPerClient = (): number => {
    const rect = svg.current?.getBoundingClientRect();
    return rect === undefined ? 1 : width / rect.width;
  };
  const cmPerPx = ROOM.width / (width - INSET.left - INSET.right);
  const isOnHandle = (event: { clientX: number; clientY: number }): boolean => {
    const rect = svg.current?.getBoundingClientRect();
    if (rect === undefined) return false;
    const k = pxPerClient();
    const x = (event.clientX - rect.left) * k;
    const y = (event.clientY - rect.top) * k;
    return Math.hypot(x - px.x(s.strike), y - px.y(0)) <= GRAB;
  };
  const clampStrike = (v: number): number =>
    Math.round(Math.min(ROOM.width, Math.max(0, v)) * 2) / 2;
  // The drag moves the strike point by how far the finger has moved since it took the handle.
  const drag = useRef<{ startClientX: number; start: number } | null>(null);
  const onPointerDown = (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
    if (!isOnHandle(event)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startClientX: event.clientX, start: s.strike };
  };
  const onPointerMove = (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (d === null || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const strike = clampStrike(
      d.start + (event.clientX - d.startClientX) * pxPerClient() * cmPerPx,
    );
    if (strike !== s.strike) call(PlaneMirrorAction.Aim, { strike });
  };
  const onPointerUp = (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
    if (drag.current === null) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    signal(PlaneMirrorSignal.Aimed, { strike: s.strike });
  };
  const onKeyDown = (event: JSX.TargetedKeyboardEvent<SVGGElement>) => {
    const delta = event.key === "ArrowRight" ? NUDGE : event.key === "ArrowLeft" ? -NUDGE : 0;
    if (delta === 0) return;
    event.preventDefault();
    call(PlaneMirrorAction.Aim, { strike: Math.min(ROOM.width, Math.max(0, s.strike + delta)) });
    signal(PlaneMirrorSignal.Aimed, { strike: s.strike + delta });
  };

  // Geometry in px. The reflected ray is drawn up to the ceiling, or to a side wall if it gets there first.
  const tx = px.x(s.torchX);
  const ty = px.y(TORCH_HEIGHT);
  const sx = px.x(s.strike);
  const floor = px.y(0);
  const side: -1 | 1 = s.strike >= s.torchX ? 1 : -1;
  let endY: number = ROOM.height;
  let endX = reflectedX(s, endY);
  if (endX < 0 || endX > ROOM.width) {
    endX = endX < 0 ? 0 : ROOM.width;
    const dx = s.strike - s.torchX;
    endY = dx === 0 ? ROOM.height : ((endX - s.strike) * TORCH_HEIGHT) / dx;
  }
  const ex = px.x(endX);
  const ey = px.y(endY);
  const i = round(s.incidence);
  const labelY = floor - ARC - 8;
  const lang = locale === "hi" ? "hi" : "en";
  const words = WORDS[lang];
  const top = px.y(ROOM.height);
  const clampX = (x: number): number =>
    Math.min(width - INSET.right - 4, Math.max(INSET.left + 4, x));
  const clampY = (y: number): number => Math.min(floor - 8, Math.max(top + 14, y));
  /** Every label's place: worked out each time, so the labels follow the beam. */
  const placed = ((): Placed[] => {
    const toward = -side; // the torch's side of the normal
    const lerp = (a: [number, number], b: [number, number], t: number): [number, number] => [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
    ];
    const inMid = lerp([tx, ty], [sx, floor], 0.35);
    const outMid = lerp([sx, floor], [ex, ey], 0.4);
    const half = ((i / 2) * Math.PI) / 180;
    const arcAt = (dir: number): [number, number] => [
      sx + dir * ARC * Math.sin(half),
      floor - ARC * Math.cos(half),
    ];
    const anchorFor = (dir: number): "start" | "end" => (dir > 0 ? "start" : "end");
    return [
      {
        label: "incidentRay",
        at: inMid,
        text: [clampX(inMid[0] + toward * 46), clampY(inMid[1] - 18)],
        anchor: anchorFor(toward),
      },
      {
        label: "pointOfIncidence",
        at: [sx, floor],
        text: [clampX(sx + side * 64), floor - 12],
        anchor: anchorFor(side),
      },
      {
        label: "normal",
        at: [sx, top + 26],
        text: [clampX(sx + 10), top + 14],
        anchor: "start",
      },
      {
        label: "reflectedRay",
        at: outMid,
        text: [clampX(outMid[0] + side * 46), clampY(outMid[1] - 18)],
        anchor: anchorFor(side),
      },
      {
        label: "angleOfIncidence",
        at: arcAt(toward),
        text: [clampX(sx + toward * 70), clampY(floor - ARC - 44)],
        anchor: anchorFor(toward),
      },
      {
        label: "angleOfReflection",
        at: arcAt(side),
        text: [clampX(sx + side * 70), clampY(floor - ARC - 44)],
        anchor: anchorFor(side),
      },
    ];
  })();
  const shown = s.labelStep === null ? [] : placed.slice(0, s.labelStep);
  const showsNormalMark = s.labelStep !== null && s.labelStep >= 3;

  return (
    <div class="pm">
      <Stage
        label={`A torch shining on a plane mirror on the floor; the beam meets the mirror ${round(s.strike)} cm from the left and reflects at ${i} degrees`}
        x={[0, ROOM.width]}
        y={[0, ROOM.height]}
        width={width}
        height={height}
        inset={INSET}
        svg={{
          ref: svg,
          class: "pm-svg",
          onPointerDown,
          onPointerMove,
          onPointerUp,
          onPointerCancel: onPointerUp,
        }}
      >
        <rect
          class="pm-room"
          x={INSET.left}
          y={INSET.top}
          width={width - INSET.left - INSET.right}
          height={floor - INSET.top}
        />
        {/* The mirror: a bright strip along the floor with hatching behind it. */}
        <g class="pm-mirror">
          <line x1={px.x(0)} y1={floor} x2={px.x(ROOM.width)} y2={floor} />
          {HATCH.map((cm) => {
            const x = px.x(cm);
            return (
              <line key={cm} class="pm-hatch" x1={x} y1={floor + 3} x2={x - 7} y2={floor + 12} />
            );
          })}
        </g>
        {s.showNormal && (
          <line class="pm-normal" x1={sx} y1={floor} x2={sx} y2={px.y(ROOM.height)} />
        )}
        {s.showAngles && i > 0 && (
          <g class="pm-angles">
            <path d={arcPath(sx, floor, side === 1 ? -1 : 1, i)} />
            <path d={arcPath(sx, floor, side, i)} />
            <text
              class="pm-angle-label"
              x={sx - side * (ARC + 10)}
              y={labelY}
              text-anchor={side === 1 ? "end" : "start"}
            >
              i = {i}°
            </text>
            <text
              class="pm-angle-label"
              x={sx + side * (ARC + 10)}
              y={labelY}
              text-anchor={side === 1 ? "start" : "end"}
            >
              r = {i}°
            </text>
          </g>
        )}
        <g class="pm-ray">
          <line x1={tx} y1={ty} x2={sx} y2={floor} />
          <Arrowhead x1={tx} y1={ty} x2={sx} y2={floor} at={0.55} />
          <line x1={sx} y1={floor} x2={ex} y2={ey} />
          <Arrowhead x1={sx} y1={floor} x2={ex} y2={ey} at={0.55} />
        </g>
        {s.target !== null && <Star x={px.x(s.target.x)} y={px.y(s.target.y)} isLit={s.isLit} />}
        <Torch x={tx} y={ty} toX={sx} toY={floor} />
        {/* The strike point: the handle the learner drags along the mirror. */}
        <g
          class="pm-strike"
          tabIndex={0}
          onKeyDown={onKeyDown}
          transform={`translate(${sx} ${floor})`}
        >
          <circle class="pm-strike-halo" r={16} />
          <circle class="pm-strike-dot" r={6} />
        </g>
        {showsNormalMark && (
          <path
            class="pm-square"
            d={`M${sx + side * SQUARE} ${floor} L${sx + side * SQUARE} ${floor - SQUARE} L${sx} ${floor - SQUARE}`}
          />
        )}
        {shown.map((l, k) => {
          const isNew = k === shown.length - 1;
          return (
            <g key={l.label} class={isNew ? "pm-label is-new" : "pm-label"}>
              <line x1={l.at[0]} y1={l.at[1]} x2={l.text[0]} y2={l.text[1] + 4} />
              <circle cx={l.at[0]} cy={l.at[1]} r={3} />
              <text x={l.text[0]} y={l.text[1]} text-anchor={l.anchor}>
                {LABEL_WORDS[l.label][lang]}
              </text>
            </g>
          );
        })}
        {s.showStrikeAt && (
          <text class="pm-readout" x={INSET.left + 10} y={INSET.top + 20}>
            {words.landsAt(round(s.strike))}
          </text>
        )}
        {s.showRuler ? (
          <g class="pm-ruler">
            {TICKS.map((cm) => {
              const x = px.x(cm);
              const isMajor = cm % 10 === 0;
              return (
                <g key={cm}>
                  <line x1={x} y1={floor + 14} x2={x} y2={floor + (isMajor ? 21 : 18)} />
                  {isMajor && (
                    <text x={x} y={floor + 32} text-anchor="middle">
                      {cm}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        ) : (
          <>
            <text class="pm-caption" x={px.x(0)} y={height - 6}>
              0 cm
            </text>
            <text class="pm-caption" x={px.x(ROOM.width)} y={height - 6} text-anchor="end">
              {ROOM.width} cm
            </text>
          </>
        )}
      </Stage>
      {s.labelStep !== null && s.labelStep < LABEL_ORDER.length && (
        <button type="button" class="pm-next" onClick={() => call(PlaneMirrorAction.NextLabel, {})}>
          {words.next}
        </button>
      )}
    </div>
  );
}
