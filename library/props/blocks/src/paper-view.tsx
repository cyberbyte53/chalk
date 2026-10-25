import { groupView, leafView, type useFrame } from "@chalk/player";
import type { JSX } from "preact";
import { Grid } from "./grid";
import {
  DotsPart,
  DropLinePart,
  GraphPaperPart,
  XHandlePart,
  dotPlane,
  dots,
  dropLine,
  graphPaper,
  xHandle,
} from "./paper";

const f = (n: number) => n.toFixed(1);

/** The model window a frame shows: [xMin, xMax, yMin, yMax]. */
function shown(frame: NonNullable<ReturnType<typeof useFrame>>) {
  const [x0, y0] = frame.px.fromPx(0, frame.px.height);
  const [x1, y1] = frame.px.fromPx(frame.px.width, 0);
  return { xMin: x0, xMax: x1, yMin: y0, yMax: y1 };
}

export const GraphPaperView = leafView(graphPaper, ({ s, part }) => (
  <g {...part(GraphPaperPart.Plane)}>
    <Grid
      win={s.window}
      names={s.axisNames}
      quadrants={s.showQuadrants}
      lineGap={s.isEqualUnits ? 0 : 8}
    />
  </g>
));

export const DotsView = leafView(dots, ({ s, frame, part }) => {
  if (frame === null) return null;
  const w = shown(frame);
  const inside = s.dots.filter(
    (p) => p.x >= w.xMin && p.x <= w.xMax && p.y >= w.yMin && p.y <= w.yMax,
  );
  if (inside.length === 0) return null;
  return (
    <g {...part(DotsPart.Dots)}>
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
});

export const DropLineView = leafView(dropLine, ({ s, frame, part }) => {
  if (frame === null || s.at === null) return null;
  const w = shown(frame);
  const top = Math.min(w.yMax, Math.max(w.yMin, s.at.y));
  const [x1, y1] = frame.px.toPx(s.at.x, 0);
  const [x2, y2] = frame.px.toPx(s.at.x, top);
  return (
    <line
      class="bk-guide"
      {...part(DropLinePart.Line)}
      x1={f(x1)}
      y1={f(y1)}
      x2={f(x2)}
      y2={f(y2)}
    />
  );
});

/** The handle, and the paper under it as its touch area (the wiring is the handle's, declared). */
export const XHandleView = leafView(xHandle, ({ s, frame, part, grab }) => {
  if (frame === null) return null;
  const [px, py] = frame.px.toPx(s.x, 0);
  const y = Math.min(frame.px.height, Math.max(0, py));
  return (
    <>
      <rect
        class="bk-touch"
        width={frame.px.width}
        height={frame.px.height}
        fill="transparent"
        onPointerDown={grab(XHandlePart.Handle)}
      />
      <g class="bk-handle" transform={`translate(${f(px)} ${f(y)})`} {...part(XHandlePart.Handle)}>
        <circle class="bk-handle-ring" r={11} />
        <text class="bk-handle-label" y={30} text-anchor="middle">
          {s.label}
        </text>
      </g>
    </>
  );
});

/** Graph paper, then the drop line, the dots and the handle, in one picture. */
export const DotPlaneView = groupView(
  dotPlane,
  { paper: GraphPaperView, guide: DropLineView, dots: DotsView, handle: XHandleView },
  { look: (v) => `bk-plane-svg${v.handle === null ? "" : " is-dial"}` },
);
