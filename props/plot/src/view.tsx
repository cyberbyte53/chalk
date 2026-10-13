import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import type { GraphState } from "./graph";

const HEIGHT = 200;
const PAD = { left: 40, right: 16, top: 16, bottom: 36 };

/** Draws the graph in SVG at the width it is given. */
export function GraphView({ view, width, locale }: PropViewProps): JSX.Element {
  // The player hands each view its own prop's state, already checked against its schema.
  const s = view as unknown as GraphState;
  const plotWidth = width - PAD.left - PAD.right;
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;
  const x = (value: number) => PAD.left + (value / s.xMax) * plotWidth;
  const y = (value: number) => PAD.top + (1 - (value - s.yMin) / (s.yMax - s.yMin)) * plotHeight;
  const path = s.points.map(([px, py]) => `${x(px).toFixed(1)},${y(py).toFixed(1)}`).join(" ");
  const last = s.points.at(-1);
  return (
    <svg
      class="graph"
      viewBox={`0 0 ${width} ${HEIGHT}`}
      width="100%"
      role="img"
      aria-label={s.yLabel[locale]}
    >
      <line class="graph-axis" x1={PAD.left} y1={y(s.yMin)} x2={width - PAD.right} y2={y(s.yMin)} />
      <line class="graph-axis" x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={y(s.yMin)} />
      <text class="graph-tick" x={PAD.left - 6} y={y(s.yMax) + 4} text-anchor="end">
        {s.yMax}
      </text>
      <text class="graph-tick" x={PAD.left - 6} y={y(s.yMin) + 4} text-anchor="end">
        {s.yMin}
      </text>
      <text class="graph-tick" x={width - PAD.right} y={y(s.yMin) + 16} text-anchor="end">
        {Math.round(s.xMax)}
      </text>
      <text class="graph-label" x={PAD.left + plotWidth / 2} y={HEIGHT - 6} text-anchor="middle">
        {s.xLabel[locale]}
      </text>
      {s.guide !== null && (
        <g class="graph-guide">
          <line x1={PAD.left} y1={y(s.guide)} x2={width - PAD.right} y2={y(s.guide)} />
          <text x={PAD.left - 6} y={y(s.guide) + 4} text-anchor="end">
            {s.guideLabel}
          </text>
        </g>
      )}
      {s.points.length > 1 && <polyline class="graph-line" points={path} />}
      {last !== undefined && <circle class="graph-dot" cx={x(last[0])} cy={y(last[1])} r={4} />}
    </svg>
  );
}
