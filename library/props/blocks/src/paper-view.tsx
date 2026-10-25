import { type PropViewProps, groupView, useFrame } from "@chalk/player";
import type { JSX } from "preact";
import { Grid } from "./grid";
import {
  DotsPart,
  type DotsState,
  DropLinePart,
  type DropLineState,
  GraphPaperPart,
  type GraphPaperState,
  XHandleAction,
  XHandlePart,
  type XHandleState,
  dotPlane,
} from "./paper";

const f = (n: number) => n.toFixed(1);

/** The model window a frame shows: [xMin, xMax, yMin, yMax]. */
function shown(frame: NonNullable<ReturnType<typeof useFrame>>) {
  const [x0, y0] = frame.px.fromPx(0, frame.px.height);
  const [x1, y1] = frame.px.fromPx(frame.px.width, 0);
  return { xMin: x0, xMax: x1, yMin: y0, yMax: y1 };
}

export function GraphPaperView({ view }: PropViewProps): JSX.Element {
  const s = view as unknown as GraphPaperState;
  return (
    <g data-part={GraphPaperPart.Plane}>
      <Grid
        win={s.window}
        names={s.axisNames}
        quadrants={s.showQuadrants}
        lineGap={s.isEqualUnits ? 0 : 8}
      />
    </g>
  );
}

export function DotsView({ view }: PropViewProps): JSX.Element | null {
  const s = view as unknown as DotsState;
  const frame = useFrame();
  if (frame === null) return null;
  const w = shown(frame);
  const inside = s.dots.filter(
    (p) => p.x >= w.xMin && p.x <= w.xMax && p.y >= w.yMin && p.y <= w.yMax,
  );
  if (inside.length === 0) return null;
  return (
    <g data-part={DotsPart.Dots}>
      {inside.map((p) => {
        const [x, y] = frame.px.toPx(p.x, p.y);
        return (
          <circle
            key={`${p.x},${p.y}`}
            class={`bk-dot is-${p.tone}${p.isFaded ? " is-faded" : ""}`}
            cx={f(x)}
            cy={f(y)}
            r={6}
          />
        );
      })}
    </g>
  );
}

export function DropLineView({ view }: PropViewProps): JSX.Element | null {
  const s = view as unknown as DropLineState;
  const frame = useFrame();
  if (frame === null || s.at === null) return null;
  const w = shown(frame);
  const top = Math.min(w.yMax, Math.max(w.yMin, s.at.y));
  const [x1, y1] = frame.px.toPx(s.at.x, 0);
  const [x2, y2] = frame.px.toPx(s.at.x, top);
  return (
    <line
      class="bk-guide"
      data-part={DropLinePart.Line}
      x1={f(x1)}
      y1={f(y1)}
      x2={f(x2)}
      y2={f(y2)}
    />
  );
}

/**
 * The handle, and the paper under it as its touch area: touching anywhere moves the handle to that
 * x, dragging slides it, letting go puts it down; arrow keys nudge it by its step.
 */
export function XHandleView({ view, call }: PropViewProps): JSX.Element | null {
  const s = view as unknown as XHandleState;
  const frame = useFrame();
  if (frame === null) return null;
  const w = shown(frame);
  const [px, py] = frame.px.toPx(s.x, 0);
  const y = Math.min(frame.px.height, Math.max(0, py));
  return (
    <>
      <rect
        class="bk-touch"
        width={frame.px.width}
        height={frame.px.height}
        fill="transparent"
        onPointerDown={(e) =>
          frame.drag(
            e,
            ([x]) => call(XHandleAction.Move, { x }),
            ([x]) => call(XHandleAction.Put, { x }),
          )
        }
      />
      <g
        class="bk-handle"
        data-part={XHandlePart.Handle}
        tabindex={0}
        role="slider"
        aria-label={s.name}
        aria-valuemin={w.xMin}
        aria-valuemax={w.xMax}
        aria-valuenow={s.x}
        aria-valuetext={`${s.name} = ${s.label}`}
        transform={`translate(${f(px)} ${f(y)})`}
        onKeyDown={(e) => {
          const by = e.key === "ArrowLeft" ? -s.step : e.key === "ArrowRight" ? s.step : 0;
          if (by === 0) return;
          e.preventDefault();
          call(XHandleAction.Put, { x: Number((s.x + by).toFixed(10)) });
        }}
        onPointerDown={(e) =>
          frame.drag(
            e,
            ([x]) => call(XHandleAction.Move, { x }),
            ([x]) => call(XHandleAction.Put, { x }),
          )
        }
      >
        <circle class="bk-handle-ring" r={11} />
        <text class="bk-handle-label" y={30} text-anchor="middle">
          {s.label}
        </text>
      </g>
    </>
  );
}

/** Graph paper, then the drop line, the dots and the handle, in one picture. */
export const DotPlaneView = groupView(
  dotPlane,
  { paper: GraphPaperView, guide: DropLineView, dots: DotsView, handle: XHandleView },
  { look: (v) => `bk-plane-svg${v.handle === null ? "" : " is-dial"}` },
);
