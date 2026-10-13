import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useRef } from "preact/hooks";
import {
  GHOST_HANDLE_PX,
  RootBuilderPart,
  type RootBuilderState,
  basePoints,
  maxHeightAt,
} from "./builder";
import { type Point, builderLayout, builderPx, swingTip } from "./geometry";
import { rootText, wholeRoot } from "./surd";

type RootBuilderView = RootBuilderState & {
  hypotenuseSquared: number;
  hypotenuseText: string;
  baseText: string;
  canSwing: boolean;
  hasLanded: boolean;
};

const Drag = { Base: "base", Height: "height" } as const;
type Drag = (typeof Drag)[keyof typeof Drag];

/** Roughly how wide a landed label is per character, and the space kept between two. */
const LABEL_CHAR_PX = 9;
const LABEL_SPACE = 4;
/** The riding label fades as the hypotenuse nears the line; the landed point takes over. */
const LABEL_FADE_START = 0.55;
const LABEL_FADE_END = 0.85;
const LABEL_STEP = 18;
/** Landed √n labels sit in a row under the whole numbers, in saffron. */
const LANDED_LABEL_Y = 50;

/** 0, 1, …, max. */
function wholeNumbers(max: number): number[] {
  const out: number[] = [];
  for (let k = 0; k <= max; k++) out.push(k);
  return out;
}

/** "√5", or "√4=2" for a perfect square: where it lands is the point. */
function landedText(n: number): string {
  const whole = wholeRoot(n);
  return whole === undefined ? rootText(n) : `√${n}=${whole}`;
}

/** How far up each landed label sits, so labels close together stack instead of overlapping. */
function labelLevels(xs: readonly { n: number; x: number }[]): Map<number, number> {
  const levels = new Map<number, number>();
  const rightEdgeAt: number[] = [];
  for (const { n, x } of [...xs].sort((a, b) => a.x - b.x)) {
    const half = (landedText(n).length * LABEL_CHAR_PX) / 2;
    let level = 0;
    while ((rightEdgeAt[level] ?? Number.NEGATIVE_INFINITY) > x - half - LABEL_SPACE) level += 1;
    rightEdgeAt[level] = x + half;
    levels.set(n, level);
  }
  return levels;
}

/**
 * The number line with its unit grid, the right triangle standing on it, and the compass swing.
 * The learner drags the base's end along the line and the top of the perpendicular up and down,
 * and taps the hypotenuse (or the arrow by it) to swing it. It owns no state.
 */
export function RootBuilderView({ view, width, call }: PropViewProps): JSX.Element {
  // The player hands each view its own prop's state, already checked against its schema.
  const s = view as unknown as RootBuilderView;
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<Drag | undefined>(undefined);
  const layout = builderLayout(s.maxValue, width);
  const px = (p: Point) => builderPx(layout, p);
  const unit = layout.unit;
  const b = Math.sqrt(s.base);
  const zero = px({ x: 0, y: 0 });
  const foot = px({ x: b, y: 0 });
  const top = px({ x: b, y: s.height });
  const tip = swingTip(b, s.height, s.swing);
  const tipPx = px(tip);
  const length = Math.sqrt(s.hypotenuseSquared);
  const angle = Math.atan2(tip.y, tip.x);
  const lineEnd = layout.originX + s.maxValue * unit;
  const points = basePoints(s);
  const maxHeight = maxHeightAt(s.base, s.maxValue);

  // ---- the finger ----
  const toLocal = (event: PointerEvent): Point | undefined => {
    const box = svg.current?.getBoundingClientRect();
    if (box === undefined || box.width === 0) return undefined;
    return {
      x: ((event.clientX - box.left) / box.width) * width,
      y: ((event.clientY - box.top) / box.height) * layout.height,
    };
  };
  const dragTo = (event: PointerEvent) => {
    const at = toLocal(event);
    if (at === undefined || drag.current === undefined) return;
    if (drag.current === Drag.Base) {
      const value = (at.x - layout.originX) / unit;
      let best = s.base;
      for (const n of points) {
        if (Math.abs(Math.sqrt(n) - value) < Math.abs(Math.sqrt(best) - value)) best = n;
      }
      if (best !== s.base) call("setBase", { n: best });
    } else {
      const h = Math.min(maxHeight, Math.max(0, Math.round((layout.axisY - at.y) / unit)));
      if (h !== s.height) call("setHeight", { h });
    }
  };
  const startDrag = (kind: Drag) => (event: JSX.TargetedPointerEvent<SVGGElement>) => {
    event.stopPropagation();
    svg.current?.setPointerCapture(event.pointerId);
    drag.current = kind;
  };
  const onPointerMove = (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
    if (drag.current !== undefined) dragTo(event);
  };
  const endDrag = (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    drag.current = undefined;
  };
  const swing = () => {
    if (s.canSwing) call("swing");
  };
  const onBaseKey = (event: JSX.TargetedKeyboardEvent<SVGGElement>) => {
    const i = points.indexOf(s.base);
    const next =
      event.key === "ArrowRight"
        ? points[i + 1]
        : event.key === "ArrowLeft"
          ? points[i - 1]
          : undefined;
    if (next === undefined) return;
    event.preventDefault();
    call("setBase", { n: next });
  };
  const onHeightKey = (event: JSX.TargetedKeyboardEvent<SVGGElement>) => {
    const delta = event.key === "ArrowUp" ? 1 : event.key === "ArrowDown" ? -1 : 0;
    const h = s.height + delta;
    if (delta === 0 || h < 0 || h > maxHeight) return;
    event.preventDefault();
    call("setHeight", { h });
  };
  const onSwingKey = (event: JSX.TargetedKeyboardEvent<SVGGElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    swing();
  };

  // ---- the picture ----
  const grid: JSX.Element[] = [];
  for (let k = 0; k <= s.maxValue; k++) {
    const x = layout.originX + k * unit;
    grid.push(
      <line
        key={`v${k}`}
        x1={x}
        y1={layout.axisY}
        x2={x}
        y2={layout.axisY - layout.gridHeight * unit}
      />,
    );
  }
  for (let j = 1; j <= layout.gridHeight; j++) {
    const y = layout.axisY - j * unit;
    grid.push(<line key={`h${j}`} x1={layout.originX} y1={y} x2={lineEnd} y2={y} />);
  }

  const arcStart = px({ x: b, y: s.height });
  const arcPath =
    s.swing > 0
      ? `M ${arcStart.x} ${arcStart.y} A ${length * unit} ${length * unit} 0 0 1 ${tipPx.x} ${tipPx.y}`
      : "";

  // The arrow that invites the swing: the first stretch of the arc the tip will follow.
  const startAngle = Math.atan2(s.height, b);
  const lead = Math.min(startAngle * 0.5, 20 / (length * unit));
  const sweep = Math.min(startAngle - lead, 56 / (length * unit));
  const onArc = (a: number) => px({ x: length * Math.cos(a), y: length * Math.sin(a) });
  const arrowFrom = onArc(startAngle - lead);
  const arrowTo = onArc(startAngle - lead - sweep);
  const arrowAngle = startAngle - lead - sweep;
  // Tangent at the arrow's end, pointing the way the tip moves (clockwise), in screen coordinates.
  const tangent = { x: Math.sin(arrowAngle), y: Math.cos(arrowAngle) };
  const head = (side: number) => ({
    x: arrowTo.x - tangent.x * 9 + side * tangent.y * 6,
    y: arrowTo.y - tangent.y * 9 - side * tangent.x * 6,
  });

  const landedAt = s.landed.map((n) => ({ n, x: px({ x: Math.sqrt(n), y: 0 }).x }));
  const levels = labelLevels(landedAt);
  const newest = s.landed.at(-1);

  // The hypotenuse's label rides on its middle, on the outer side, turned along it.
  const mid = px({ x: tip.x / 2, y: tip.y / 2 });
  const normal = { x: -Math.sin(angle), y: -Math.cos(angle) };
  const label = { x: mid.x + normal.x * 16, y: mid.y + normal.y * 16 };
  const degrees = (-angle * 180) / Math.PI;

  return (
    <div class="rb">
      <svg
        ref={svg}
        class="rb-svg"
        viewBox={`0 0 ${width} ${layout.height}`}
        width="100%"
        role="img"
        aria-label={`Number line from 0 to ${s.maxValue}; right triangle with legs ${s.baseText} and ${s.height}, hypotenuse ${s.hypotenuseText}`}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <g class="rb-grid">{grid}</g>

        <line
          class="rb-axis"
          x1={layout.originX - 12}
          y1={layout.axisY}
          x2={lineEnd + 16}
          y2={layout.axisY}
        />
        {wholeNumbers(s.maxValue).map((k) => {
          const x = layout.originX + k * unit;
          return (
            <g key={k} data-part={`${RootBuilderPart.TickPrefix}${k}`}>
              <line class="rb-tick" x1={x} y1={layout.axisY - 6} x2={x} y2={layout.axisY + 6} />
              <text class="rb-tick-label" x={x} y={layout.axisY + 26} text-anchor="middle">
                {k}
              </text>
            </g>
          );
        })}

        {/* The triangle. */}
        <line
          class="rb-leg"
          data-part={RootBuilderPart.Base}
          x1={zero.x}
          y1={zero.y}
          x2={foot.x}
          y2={foot.y}
        />
        <text
          class="rb-leg-label"
          x={(zero.x + foot.x) / 2}
          y={layout.axisY - 10}
          text-anchor="middle"
        >
          {s.baseText}
        </text>
        {s.height > 0 && (
          <>
            <line
              class="rb-leg"
              data-part={RootBuilderPart.Perpendicular}
              x1={foot.x}
              y1={foot.y}
              x2={top.x}
              y2={top.y}
            />
            <path
              class="rb-right-angle"
              d={`M ${foot.x - 12} ${foot.y} L ${foot.x - 12} ${foot.y - 12} L ${foot.x} ${foot.y - 12}`}
            />
            <text
              class="rb-leg-label"
              x={top.x - 10}
              y={(foot.y + top.y) / 2 + 6}
              text-anchor="end"
            >
              {s.height}
            </text>
            {s.swing > 0 && <line class="rb-ghost" x1={zero.x} y1={zero.y} x2={top.x} y2={top.y} />}
          </>
        )}

        {/* The compass: the arc behind the swinging tip. */}
        {s.swing > 0 && <path class="rb-arc" data-part={RootBuilderPart.Arc} d={arcPath} />}

        {/* Points already landed. */}
        {landedAt.map(({ n, x }) => (
          <g
            key={n}
            class={n === newest ? "rb-landed is-newest" : "rb-landed"}
            data-part={`${RootBuilderPart.LandedPrefix}${n}`}
          >
            <circle cx={x} cy={layout.axisY} r={n === newest ? 6.5 : 5} />
            {(levels.get(n) ?? 0) > 0 && (
              <line
                class="rb-leader"
                x1={x}
                y1={layout.axisY + 8}
                x2={x}
                y2={layout.axisY + LANDED_LABEL_Y - 15 + (levels.get(n) ?? 0) * LABEL_STEP}
              />
            )}
            <text
              x={x}
              y={layout.axisY + LANDED_LABEL_Y + (levels.get(n) ?? 0) * LABEL_STEP}
              text-anchor="middle"
            >
              {landedText(n)}
            </text>
          </g>
        ))}

        {/* The hypotenuse, where the compass has it now. */}
        {s.height > 0 && (
          // biome-ignore lint/a11y/useKeyWithClickEvents: the arrow by the tip is the keyboard way to swing
          <g
            class={s.canSwing ? "rb-hyp can-swing" : "rb-hyp"}
            data-part={RootBuilderPart.Hypotenuse}
            onClick={swing}
          >
            <line class="rb-hyp-hit" x1={zero.x} y1={zero.y} x2={tipPx.x} y2={tipPx.y} />
            <line class="rb-hyp-line" x1={zero.x} y1={zero.y} x2={tipPx.x} y2={tipPx.y} />
            {s.swing < LABEL_FADE_END && (
              <text
                class="rb-hyp-label"
                opacity={Math.min(
                  1,
                  (LABEL_FADE_END - s.swing) / (LABEL_FADE_END - LABEL_FADE_START),
                )}
                x={label.x}
                y={label.y}
                text-anchor="middle"
                dominant-baseline="middle"
                transform={`rotate(${degrees} ${label.x} ${label.y})`}
              >
                {s.hypotenuseText}
              </text>
            )}
          </g>
        )}
        <circle class="rb-zero" data-part={RootBuilderPart.Zero} cx={zero.x} cy={zero.y} r={4} />

        {s.canSwing && s.swing === 0 && (
          <g
            class="rb-swing"
            // biome-ignore lint/a11y/useSemanticElements: a <button> can't live inside SVG; this group is one
            role="button"
            tabIndex={0}
            aria-label={`Swing ${s.hypotenuseText} onto the line`}
            onClick={swing}
            onKeyDown={onSwingKey}
          >
            <path
              class="rb-swing-hit"
              d={`M ${arrowFrom.x} ${arrowFrom.y} A ${length * unit} ${length * unit} 0 0 1 ${arrowTo.x} ${arrowTo.y}`}
            />
            <path
              class="rb-swing-arrow"
              d={`M ${arrowFrom.x} ${arrowFrom.y} A ${length * unit} ${length * unit} 0 0 1 ${arrowTo.x} ${arrowTo.y}`}
            />
            <path
              class="rb-swing-head"
              d={`M ${head(1).x} ${head(1).y} L ${arrowTo.x} ${arrowTo.y} L ${head(-1).x} ${head(-1).y}`}
            />
          </g>
        )}

        {/* What the finger holds. */}
        <g
          class="rb-handle"
          data-part={RootBuilderPart.HeightHandle}
          role="slider"
          tabIndex={0}
          aria-label="Height"
          aria-valuemin={0}
          aria-valuemax={maxHeight}
          aria-valuenow={s.height}
          onPointerDown={startDrag(Drag.Height)}
          onKeyDown={onHeightKey}
        >
          {s.height === 0 && (
            <line
              class="rb-handle-stem"
              x1={foot.x}
              y1={foot.y}
              x2={foot.x}
              y2={foot.y - GHOST_HANDLE_PX}
            />
          )}
          <circle
            class="rb-handle-hit"
            cx={top.x}
            cy={s.height > 0 ? top.y : top.y - GHOST_HANDLE_PX}
            r={22}
          />
          <circle
            class={s.height > 0 ? "rb-handle-dot" : "rb-handle-dot is-ghost"}
            cx={top.x}
            cy={s.height > 0 ? top.y : top.y - GHOST_HANDLE_PX}
            r={9}
          />
        </g>
        <g
          class="rb-handle"
          data-part={RootBuilderPart.BaseHandle}
          role="slider"
          tabIndex={0}
          aria-label="Base"
          aria-valuemin={1}
          aria-valuemax={s.maxValue}
          aria-valuenow={b}
          aria-valuetext={s.baseText}
          onPointerDown={startDrag(Drag.Base)}
          onKeyDown={onBaseKey}
        >
          <circle class="rb-handle-hit" cx={foot.x} cy={foot.y} r={22} />
          <circle class="rb-handle-dot" cx={foot.x} cy={foot.y} r={9} />
        </g>
      </svg>
    </div>
  );
}
