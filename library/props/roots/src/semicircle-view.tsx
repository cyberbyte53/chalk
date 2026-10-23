import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useRef, useState } from "preact/hooks";
import {
  type Point,
  type SemicircleLayout,
  rightOfB,
  semicircleDragLimit,
  semicircleFigure,
  semicircleLayout,
  semicirclePx,
  swungD,
} from "./geometry";
import {
  MAX_X,
  MIN_X,
  RootSemicirclePart,
  type RootSemicircleState,
  proofTexts,
} from "./semicircle";

type RootSemicircleView = RootSemicircleState & {
  xText: string;
  bdText: string;
  hasLanded: boolean;
};

const LETTER_Y = 22;
const NUMBER_Y = 44;
const VALUE_Y = 70;

function snap(x: number, limit: number): number {
  return Math.round(Math.min(limit, Math.max(MIN_X, x)) * 10) / 10;
}

/**
 * Fig 1.15–1.17: AB = x and BC = 1 on a line, the semicircle on AC, and BD = √x standing at B; with
 * the proof, O, OD and OB with their lengths; when swung, BD lies on the line from B (as 0) to E.
 * The learner drags A; a tap on BD (or the arrow by D) swings it. It owns no prop state: the frame
 * is only held still while a finger drags A.
 */
export function RootSemicircleView({ view, width, call }: PropViewProps): JSX.Element {
  // The player hands each view its own prop's state, already checked against its schema.
  const s = view as unknown as RootSemicircleView;
  const svg = useRef<SVGSVGElement>(null);
  // While A is dragged the frame stays still, so A stays under the finger.
  const [held, setHeld] = useState<SemicircleLayout | undefined>(undefined);
  const layout = held ?? semicircleLayout(s.x, width);
  const f = semicircleFigure(s.x);
  const px = (x: number, y = 0): Point => semicirclePx(layout, s.x, { x, y });
  const a = px(f.a);
  const b = px(f.b);
  const c = px(f.c);
  const o = px(f.o);
  const d = px(f.d.x, f.d.y);
  const tip = swungD(f, s.swing);
  const tipPx = px(tip.x, tip.y);
  const e = px(f.e);
  const r = f.radius * layout.unit;
  const bd = f.bd * layout.unit;
  const proof = proofTexts(s.x);
  const canSwing = s.swing < 1;
  const y0 = layout.axisY;

  const valueAt = (clientX: number): number | undefined => {
    const box = svg.current?.getBoundingClientRect();
    if (box === undefined || box.width === 0) return undefined;
    const x = ((clientX - box.left) / box.width) * width;
    return (layout.bX - x) / layout.unit;
  };
  const onPointerDown = (event: JSX.TargetedPointerEvent<SVGGElement>) => {
    event.stopPropagation();
    svg.current?.setPointerCapture(event.pointerId);
    setHeld(layout);
  };
  const onPointerMove = (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
    if (held === undefined) return;
    const value = valueAt(event.clientX);
    if (value === undefined) return;
    const x = snap(value, Math.min(MAX_X, semicircleDragLimit(held)));
    if (x !== s.x) call("setX", { x });
  };
  const endDrag = (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setHeld(undefined);
  };
  const onAKey = (event: JSX.TargetedKeyboardEvent<SVGGElement>) => {
    // A is on the left: moving it left makes x longer.
    const delta = event.key === "ArrowLeft" ? 0.1 : event.key === "ArrowRight" ? -0.1 : 0;
    if (delta === 0) return;
    event.preventDefault();
    call("setX", { x: snap(s.x + delta, MAX_X) });
  };
  const swing = () => {
    if (canSwing) call("swing");
  };
  const onSwingKey = (event: JSX.TargetedKeyboardEvent<SVGGElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    swing();
  };

  // The arrow that invites the swing: the first stretch of the arc D will follow about B.
  const lead = 16 / bd;
  const sweep = Math.min(Math.PI / 2 - lead - 0.05, 52 / bd);
  const onArc = (angle: number) => px(f.b + f.bd * Math.cos(angle), f.bd * Math.sin(angle));
  const arrowFrom = onArc(Math.PI / 2 - lead);
  const arrowAngle = Math.PI / 2 - lead - sweep;
  const arrowTo = onArc(arrowAngle);
  const tangent = { x: Math.sin(arrowAngle), y: Math.cos(arrowAngle) };
  const head = (side: number) => ({
    x: arrowTo.x - tangent.x * 9 + side * tangent.y * 6,
    y: arrowTo.y - tangent.y * 9 - side * tangent.x * 6,
  });
  const arrowPath = `M ${arrowFrom.x} ${arrowFrom.y} A ${bd} ${bd} 0 0 1 ${arrowTo.x} ${arrowTo.y}`;

  const ticks = Array.from({ length: rightOfB(s.x) + 1 }, (_, k) => k);
  const rightEnd = Math.max(c.x, b.x + rightOfB(s.x) * layout.unit);

  return (
    <div class="rsc">
      <svg
        ref={svg}
        class="rsc-svg"
        viewBox={`0 0 ${width} ${layout.height}`}
        width="100%"
        role="img"
        aria-label={`AB = ${s.xText}, BC = 1, BD = ${s.bdText}`}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <line class="rsc-axis" x1={a.x} y1={y0} x2={rightEnd + 14} y2={y0} />

        {/* With B as 0, a number line along the same line once BD swings. */}
        {s.swing > 0 && (
          <g class="rsc-numbers" opacity={Math.min(1, s.swing * 2)}>
            {ticks.map((k) => {
              const x = b.x + k * layout.unit;
              return (
                <g key={k}>
                  <line class="rsc-tick" x1={x} y1={y0 - 5} x2={x} y2={y0 + 5} />
                  <text class="rsc-number" x={x} y={y0 + NUMBER_Y} text-anchor="middle">
                    {k}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        <path
          class="rsc-semicircle"
          data-part={RootSemicirclePart.Semicircle}
          d={`M ${a.x} ${y0} A ${r} ${r} 0 0 1 ${c.x} ${y0}`}
        />
        <line
          class="rsc-segment"
          data-part={RootSemicirclePart.XSegment}
          x1={a.x}
          y1={y0}
          x2={b.x}
          y2={y0}
        />
        <line
          class="rsc-segment"
          data-part={RootSemicirclePart.UnitSegment}
          x1={b.x}
          y1={y0}
          x2={c.x}
          y2={y0}
        />
        <text
          class="rsc-length"
          x={(a.x + (s.isProofShown ? Math.min(o.x, b.x) : b.x)) / 2}
          y={y0 - 9}
          text-anchor="middle"
        >
          {s.xText}
        </text>
        <text class="rsc-length" x={(b.x + c.x) / 2} y={y0 - 9} text-anchor="middle">
          1
        </text>

        {s.isProofShown && (
          <g class="rsc-proof">
            <line class="rsc-proof-line" x1={o.x} y1={o.y} x2={d.x} y2={d.y} />
            <line class="rsc-proof-ob" x1={o.x} y1={y0} x2={b.x} y2={y0} />
            <text
              class="rsc-proof-length"
              x={(o.x + d.x) / 2 + (o.x <= d.x ? -8 : 8)}
              y={(o.y + d.y) / 2}
              text-anchor={o.x <= d.x ? "end" : "start"}
            >
              {proof.od}
            </text>
            <text class="rsc-proof-length" x={(o.x + b.x) / 2} y={y0 - 9} text-anchor="middle">
              {proof.ob}
            </text>
            <circle class="rsc-point" data-part={RootSemicirclePart.O} cx={o.x} cy={y0} r={3.5} />
            <text class="rsc-letter" x={o.x} y={y0 + LETTER_Y} text-anchor="middle">
              O
            </text>
          </g>
        )}

        {/* BD, upright or swinging about B. */}
        {s.swing > 0 && (
          <>
            <line class="rsc-ghost" x1={b.x} y1={y0} x2={d.x} y2={d.y} />
            <path class="rsc-arc" d={`M ${d.x} ${d.y} A ${bd} ${bd} 0 0 1 ${tipPx.x} ${tipPx.y}`} />
          </>
        )}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: the arrow by D is the keyboard way to swing */}
        <g
          class={canSwing ? "rsc-bd can-swing" : "rsc-bd"}
          data-part={RootSemicirclePart.Bd}
          onClick={swing}
        >
          <line class="rsc-bd-hit" x1={b.x} y1={y0} x2={tipPx.x} y2={tipPx.y} />
          <line class="rsc-bd-line" x1={b.x} y1={y0} x2={tipPx.x} y2={tipPx.y} />
        </g>
        {s.swing === 0 && (
          <text class="rsc-root" x={b.x - 9} y={(y0 + d.y) / 2 + 6} text-anchor="end">
            {s.bdText}
          </text>
        )}
        <circle class="rsc-point" data-part={RootSemicirclePart.D} cx={d.x} cy={d.y} r={3.5} />
        <text class="rsc-letter" x={d.x} y={d.y - 10} text-anchor="middle">
          D
        </text>

        {s.swing === 0 && (
          <g
            class="rsc-swing"
            // biome-ignore lint/a11y/useSemanticElements: a <button> can't live inside SVG; this group is one
            role="button"
            tabIndex={0}
            aria-label="Swing BD onto the line"
            onClick={swing}
            onKeyDown={onSwingKey}
          >
            <path class="rsc-swing-hit" d={arrowPath} />
            <path class="rsc-swing-arrow" d={arrowPath} />
            <path
              class="rsc-swing-head"
              d={`M ${head(1).x} ${head(1).y} L ${arrowTo.x} ${arrowTo.y} L ${head(-1).x} ${head(-1).y}`}
            />
          </g>
        )}

        {s.hasLanded && (
          <g class="rsc-e" data-part={RootSemicirclePart.E}>
            <circle cx={e.x} cy={y0} r={6} />
            <text class="rsc-e-value" x={e.x} y={y0 + VALUE_Y} text-anchor="middle">
              {s.bdText}
            </text>
            <text class="rsc-letter" x={e.x} y={y0 + LETTER_Y} text-anchor="middle">
              E
            </text>
          </g>
        )}

        <circle class="rsc-point" data-part={RootSemicirclePart.B} cx={b.x} cy={y0} r={3.5} />
        <circle class="rsc-point" data-part={RootSemicirclePart.C} cx={c.x} cy={y0} r={3.5} />
        <text class="rsc-letter" x={b.x} y={y0 + LETTER_Y} text-anchor="middle">
          B
        </text>
        <text class="rsc-letter" x={c.x} y={y0 + LETTER_Y} text-anchor="middle">
          C
        </text>
        <g
          class="rsc-handle"
          data-part={RootSemicirclePart.A}
          role="slider"
          tabIndex={0}
          aria-label="A"
          aria-valuemin={MIN_X}
          aria-valuemax={MAX_X}
          aria-valuenow={s.x}
          onPointerDown={onPointerDown}
          onKeyDown={onAKey}
        >
          <circle class="rsc-handle-hit" cx={a.x} cy={y0} r={22} />
          <circle class="rsc-handle-dot" cx={a.x} cy={y0} r={9} />
          <text class="rsc-letter" x={a.x} y={y0 + LETTER_Y + 6} text-anchor="middle">
            A
          </text>
        </g>
      </svg>
      <div class="rsc-nudge" data-part="xStepper">
        <button
          type="button"
          class="rsc-nudge-button"
          aria-label="x − 0.1"
          disabled={s.x <= 0.5}
          onClick={() => call("setX", { x: snap(s.x - 0.1, MAX_X) })}
        >
          −
        </button>
        <span class="rsc-nudge-value">x = {s.xText}</span>
        <button
          type="button"
          class="rsc-nudge-button"
          aria-label="x + 0.1"
          disabled={s.x >= MAX_X}
          onClick={() => call("setX", { x: snap(s.x + 0.1, MAX_X) })}
        >
          +
        </button>
      </div>
      {s.isProofShown && (
        <p class="rsc-equation">
          BD² = {proof.od}² − {proof.ob}² = {proof.x}
        </p>
      )}
    </div>
  );
}
