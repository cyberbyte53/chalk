import { useSpace } from "@chalk/draw";
import type { JSX } from "preact";
import { px, unitPx } from "./frame";
import type { Pt } from "./geometry";

/**
 * The geometry box drawn on the picture: a compass standing on its needle with the pencil on the
 * arc it is drawing, and a ruler lying along a line. They show which tool makes each step of a
 * construction; draw one at a time, for the step being made.
 */

const f = (n: number) => n.toFixed(1);

/** A compass with its needle at `centre` and its pencil `r` away at `angle` degrees (model). */
export function Compass({
  centre,
  r,
  angle,
}: {
  centre: Pt;
  r: number;
  angle: number;
}): JSX.Element {
  const space = useSpace();
  const needle = px(space, centre);
  const rp = r * unitPx(space);
  const a = (angle * Math.PI) / 180;
  const pencil: Pt = [needle[0] + rp * Math.cos(a), needle[1] - rp * Math.sin(a)];
  const midX = (needle[0] + pencil[0]) / 2;
  const midY = (needle[1] + pencil[1]) / 2;
  // The hinge stands up off the paper, above the middle of the opening (screen up).
  const lift = Math.min(54, Math.max(22, rp * 0.75));
  const hinge: Pt = [midX, Math.min(needle[1], pencil[1], midY) - lift];
  return (
    // biome-ignore lint/a11y/noAriaHiddenOnFocusable: a drawing of the tool, never focusable
    <g class="gk-compass" aria-hidden="true">
      <line
        class="gk-compass-leg"
        x1={f(needle[0])}
        y1={f(needle[1])}
        x2={f(hinge[0])}
        y2={f(hinge[1])}
      />
      <line
        class="gk-compass-leg"
        x1={f(pencil[0])}
        y1={f(pencil[1])}
        x2={f(hinge[0])}
        y2={f(hinge[1])}
      />
      <path class="gk-compass-pencil" d={`M${f(pencil[0])} ${f(pencil[1])} l -3 -9 l 6 0 z`} />
      <rect
        class="gk-compass-grip"
        x={f(hinge[0] - 3)}
        y={f(hinge[1] - 12)}
        width={6}
        height={12}
        rx={2}
      />
      <circle class="gk-compass-hinge" cx={f(hinge[0])} cy={f(hinge[1])} r={3.5} />
      <circle class="gk-compass-needle" cx={f(needle[0])} cy={f(needle[1])} r={2} />
    </g>
  );
}

/** A ruler lying along the line from `from` to `to`, a little past both ends, on one side of it. */
export function Ruler({ from, to }: { from: Pt; to: Pt }): JSX.Element {
  const space = useSpace();
  const a = px(space, from);
  const b = px(space, to);
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const angle = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  const over = 14;
  const width = 16;
  const ticks = Array.from({ length: Math.floor((len + 2 * over) / 8) + 1 }, (_, i) => i * 8);
  return (
    // biome-ignore lint/a11y/noAriaHiddenOnFocusable: a drawing of the tool, never focusable
    <g
      class="gk-ruler"
      aria-hidden="true"
      transform={`translate(${f(a[0])} ${f(a[1])}) rotate(${f(angle)})`}
    >
      <rect class="gk-ruler-body" x={-over} y={2} width={f(len + 2 * over)} height={width} rx={2} />
      {ticks.map((t, i) => (
        <line
          key={t}
          class="gk-ruler-tick"
          x1={f(t - over)}
          y1={2}
          x2={f(t - over)}
          y2={i % 5 === 0 ? 9 : 6}
        />
      ))}
    </g>
  );
}
