import { useSpace } from "@chalk/draw";
import { type Pt, frameOf, numText, px, unitPx } from "@chalk/prop-circles/kit";
import type { JSX } from "preact";
import type { PlaneWindow } from "./plane";

/**
 * Graph paper inside a @chalk/draw <Stage>: a line every unit, the x- and y-axes in ink with their
 * names, the origin O and numbered ticks (every unit, or every 2, 5 or 10 when units are small).
 * Drawn only with the look's tokens (co-grid-* classes).
 */

const f = (n: number) => n.toFixed(1);

/** The stage frame and height for a window at a given width (equal units across and up). */
export function planeFrame(win: PlaneWindow, width: number) {
  const [x0, x1, y0, y1] = win;
  const aspect = (y1 - y0) / (x1 - x0);
  const height = Math.round(Math.min(380, Math.max(200, width * aspect)));
  const frame = frameOf(
    [
      [x0, y0],
      [x1, y1],
    ],
    { width, height },
    14,
  );
  return { frame, height };
}

/** How often to number the ticks so labels stay at least ~22 px apart. */
function labelEvery(unit: number): number {
  for (const k of [1, 2, 5, 10, 20]) if (unit * k >= 22) return k;
  return 50;
}

export function Grid({
  win,
  names = ["x", "y"],
  quadrants = false,
}: {
  win: PlaneWindow;
  names?: [string, string];
  quadrants?: boolean;
}) {
  const space = useSpace();
  const [x0, x1, y0, y1] = win;
  const k = unitPx(space);
  const every = labelEvery(k);
  const lines: JSX.Element[] = [];
  for (let x = Math.ceil(x0); x <= x1; x++) {
    const a = px(space, [x, y0]);
    const b = px(space, [x, y1]);
    lines.push(
      <line
        key={`x${x}`}
        class={`co-grid-line${x % 5 === 0 ? " is-major" : ""}`}
        x1={f(a[0])}
        y1={f(a[1])}
        x2={f(b[0])}
        y2={f(b[1])}
      />,
    );
  }
  for (let y = Math.ceil(y0); y <= y1; y++) {
    const a = px(space, [x0, y]);
    const b = px(space, [x1, y]);
    lines.push(
      <line
        key={`y${y}`}
        class={`co-grid-line${y % 5 === 0 ? " is-major" : ""}`}
        x1={f(a[0])}
        y1={f(a[1])}
        x2={f(b[0])}
        y2={f(b[1])}
      />,
    );
  }
  const hasX = y0 <= 0 && y1 >= 0;
  const hasY = x0 <= 0 && x1 >= 0;
  const o = px(space, [hasY ? 0 : x0, hasX ? 0 : y0]);
  const left = px(space, [x0, 0]);
  const right = px(space, [x1, 0]);
  const bottom = px(space, [0, y0]);
  const top = px(space, [0, y1]);
  const ticks: JSX.Element[] = [];
  for (let x = Math.ceil(x0); x <= x1; x++) {
    if (x === 0 || x % every !== 0 || x === x1) continue;
    const p = px(space, [x, hasX ? 0 : y0]);
    ticks.push(
      <text key={`tx${x}`} class="co-grid-num" x={f(p[0])} y={f(p[1] + 12)} text-anchor="middle">
        {numText(x)}
      </text>,
    );
  }
  for (let y = Math.ceil(y0); y <= y1; y++) {
    if (y === 0 || y % every !== 0 || y === y1) continue;
    const p = px(space, [hasY ? 0 : x0, y]);
    ticks.push(
      <text key={`ty${y}`} class="co-grid-num" x={f(p[0] - 4)} y={f(p[1] + 3.5)} text-anchor="end">
        {numText(y)}
      </text>,
    );
  }
  return (
    <g class="co-grid">
      {lines}
      {hasX && (
        <g>
          <line class="co-axis" x1={f(left[0])} y1={f(left[1])} x2={f(right[0])} y2={f(right[1])} />
          <path class="co-axis-head" d={`M${f(right[0])} ${f(right[1])} l-7 -3.5 l0 7 z`} />
          <text class="co-axis-name" x={f(right[0] - 4)} y={f(right[1] - 6)} text-anchor="end">
            {names[0]}
          </text>
        </g>
      )}
      {hasY && (
        <g>
          <line class="co-axis" x1={f(bottom[0])} y1={f(bottom[1])} x2={f(top[0])} y2={f(top[1])} />
          <path class="co-axis-head" d={`M${f(top[0])} ${f(top[1])} l-3.5 7 l7 0 z`} />
          <text class="co-axis-name" x={f(top[0] + 7)} y={f(top[1] + 11)}>
            {names[1]}
          </text>
        </g>
      )}
      {hasX && hasY && (
        <text class="co-grid-num is-origin" x={f(o[0] - 4)} y={f(o[1] + 12)} text-anchor="end">
          O
        </text>
      )}
      {ticks}
      {quadrants &&
        hasX &&
        hasY &&
        (
          [
            ["I", x1 / 2, y1 / 2],
            ["II", x0 / 2, y1 / 2],
            ["III", x0 / 2, y0 / 2],
            ["IV", x1 / 2, y0 / 2],
          ] as const
        ).map(([name, x, y]) => {
          const p = px(space, [x, y]);
          return (
            <text key={name} class="co-quadrant" x={f(p[0])} y={f(p[1] + 6)} text-anchor="middle">
              {name}
            </text>
          );
        })}
    </g>
  );
}

/** A point is inside the window (with a hair of slack). */
export const isInside = (p: Pt, win: PlaneWindow): boolean =>
  p[0] >= win[0] - 1e-9 && p[0] <= win[1] + 1e-9 && p[1] >= win[2] - 1e-9 && p[1] <= win[3] + 1e-9;
