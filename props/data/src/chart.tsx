import type { JSX } from "preact";
import { numText } from "./numbers";

/**
 * A plain chart frame shared by the histogram and the ogive: axes with ticks, in SVG units
 * computed from the width. Everything inside is placed with `toX` / `toY`.
 */
export type Frame = {
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
  toX: (x: number) => number;
  toY: (y: number) => number;
};

export function frameOf(
  width: number,
  height: number,
  xRange: [number, number],
  yMax: number,
  pad = { left: 34, right: 12, top: 14, bottom: 30 },
): Frame {
  const [x0, x1] = xRange;
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  return {
    width,
    height,
    left: pad.left,
    right: width - pad.right,
    top: pad.top,
    bottom: height - pad.bottom,
    toX: (x) => pad.left + ((x - x0) / (x1 - x0 || 1)) * plotW,
    toY: (y) => height - pad.bottom - (y / (yMax || 1)) * plotH,
  };
}

/** A tidy step for axis ticks: 1, 2, 5, 10, 20, … giving about `target` ticks. */
export function niceStep(span: number, target = 5): number {
  const raw = span / target;
  const p = 10 ** Math.floor(Math.log10(raw || 1));
  const m = raw / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
}

/** The axes: x ticks at the given values, y ticks at a nice step, with axis names. */
export function Axes({
  frame,
  xTicks,
  yMax,
  xName,
  yName,
}: {
  frame: Frame;
  xTicks: readonly number[];
  yMax: number;
  xName: string;
  yName: string;
}): JSX.Element {
  const step = niceStep(yMax, 4);
  const yTicks: number[] = [];
  for (let v = 0; v <= yMax + 1e-9; v += step) yTicks.push(v);
  // Thin the x labels when they would crowd (about 30 px each).
  const every = Math.max(1, Math.ceil((xTicks.length * 30) / (frame.right - frame.left)));
  return (
    <g class="dt-axes">
      {yTicks.map((v) => (
        <g key={`y${v}`}>
          <line
            class="dt-grid"
            x1={frame.left}
            x2={frame.right}
            y1={frame.toY(v)}
            y2={frame.toY(v)}
          />
          <text class="dt-tick" x={frame.left - 4} y={frame.toY(v) + 4} text-anchor="end">
            {numText(v)}
          </text>
        </g>
      ))}
      <line class="dt-axis" x1={frame.left} x2={frame.right} y1={frame.bottom} y2={frame.bottom} />
      <line class="dt-axis" x1={frame.left} x2={frame.left} y1={frame.top} y2={frame.bottom} />
      {xTicks.map((v, i) =>
        i % every === 0 || i === xTicks.length - 1 ? (
          <text
            key={`x${v}`}
            class="dt-tick"
            x={frame.toX(v)}
            y={frame.bottom + 13}
            text-anchor="middle"
          >
            {numText(v)}
          </text>
        ) : null,
      )}
      <text class="dt-axis-name" x={frame.right} y={frame.height - 3} text-anchor="end">
        {xName}
      </text>
      <text class="dt-axis-name" x={frame.left - 30} y={frame.top - 4}>
        {yName}
      </text>
    </g>
  );
}
