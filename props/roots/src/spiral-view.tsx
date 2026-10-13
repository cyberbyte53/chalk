import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { type Point, spiralLayout, spiralPoints } from "./geometry";
import { MAX_STEPS, RootSpiralPart, type RootSpiralState } from "./spiral";
import { isPerfectSquare, rootText } from "./surd";

const LABEL_OFFSET = 15;
/** The smallest gap (radians) between OP1 and the newest hypotenuse that O's letter fits in. */
const O_LABEL_MIN_GAP = 0.9;

function lerp(p: Point, q: Point, t: number): Point {
  return { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t };
}

function unitFrom(from: Point, to: Point): Point {
  const length = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  return { x: (to.x - from.x) / length, y: (to.y - from.y) / length };
}

/**
 * The square-root spiral, centred and scaled to fit: unit legs in ink with small 1s, right-angle
 * marks, and each hypotenuse's length at its outer end (whole numbers stand out). A tap adds the
 * next triangle. It owns no state.
 */
export function RootSpiralView({ view, width, call }: PropViewProps): JSX.Element {
  // The player hands each view its own prop's state, already checked against its schema.
  const s = view as unknown as RootSpiralState;
  const layout = spiralLayout(s.steps, width);
  const points = spiralPoints(s.steps + 1).map(layout.px);
  const at = (k: number): Point => points[k] ?? { x: 0, y: 0 };
  const o = at(0);
  const legDrawn = Math.min(1, s.grow * 2);
  const hypDrawn = Math.max(0, s.grow * 2 - 1);
  const canAdd = s.steps < MAX_STEPS;
  const mark = Math.min(9, layout.scale * 0.2);
  const labelSize = Math.max(12, Math.min(18, layout.scale * 0.3));
  const isLegLabelled = layout.scale >= 30;

  const legs: JSX.Element[] = [];
  const hypotenuses: JSX.Element[] = [];
  const labels: JSX.Element[] = [];

  // OP1 = 1: the first side, along the line.
  hypotenuses.push(
    <line
      key="h1"
      class="rs-first"
      data-part={`${RootSpiralPart.HypotenusePrefix}1`}
      x1={o.x}
      y1={o.y}
      x2={at(1).x}
      y2={at(1).y}
    />,
  );
  labels.push(
    <text
      key="l1"
      class="rs-one"
      x={(o.x + at(1).x) / 2 + 4}
      y={o.y - 10}
      text-anchor="middle"
      dominant-baseline="middle"
    >
      1
    </text>,
  );

  for (let k = 1; k <= s.steps; k++) {
    const isNewest = k === s.steps;
    const p = at(k);
    const q = at(k + 1);
    const legEnd = isNewest ? lerp(p, q, legDrawn) : q;
    const toO = unitFrom(p, o);
    const along = unitFrom(p, q);
    legs.push(
      <g key={`g${k}`} data-part={`${RootSpiralPart.LegPrefix}${k}`}>
        <line class="rs-leg" x1={p.x} y1={p.y} x2={legEnd.x} y2={legEnd.y} />
        <path
          class="rs-right-angle"
          d={`M ${p.x + toO.x * mark} ${p.y + toO.y * mark} l ${along.x * mark} ${along.y * mark} l ${-toO.x * mark} ${-toO.y * mark}`}
        />
      </g>,
    );
    if (isLegLabelled && (!isNewest || legDrawn >= 1)) {
      const mid = lerp(p, q, 0.5);
      const inward = unitFrom(mid, o);
      labels.push(
        <text
          key={`one${k}`}
          class="rs-one"
          x={mid.x + inward.x * 11}
          y={mid.y + inward.y * 11}
          text-anchor="middle"
          dominant-baseline="middle"
        >
          1
        </text>,
      );
    }

    const n = k + 1;
    const drawn = isNewest ? hypDrawn : 1;
    if (drawn <= 0) continue;
    const end = lerp(o, q, drawn);
    const classes = ["rs-hyp"];
    if (isPerfectSquare(n)) classes.push("is-whole");
    if (isNewest) classes.push("is-newest");
    hypotenuses.push(
      <line
        key={`h${n}`}
        class={classes.join(" ")}
        data-part={`${RootSpiralPart.HypotenusePrefix}${n}`}
        x1={o.x}
        y1={o.y}
        x2={end.x}
        y2={end.y}
      />,
    );
    const out = unitFrom(o, q);
    labels.push(
      <text
        key={`r${n}`}
        class={classes.map((c) => c.replace("rs-hyp", "rs-root")).join(" ")}
        x={q.x + out.x * LABEL_OFFSET}
        y={q.y + out.y * LABEL_OFFSET}
        text-anchor="middle"
        dominant-baseline="middle"
        font-size={isNewest || isPerfectSquare(n) ? labelSize + 1 : labelSize}
        opacity={drawn}
      >
        {rootText(n)}
      </text>,
    );
  }

  // O's letter sits in the gap between OP1 and the newest hypotenuse, while there is room.
  const last = at(s.steps + 1);
  const lastAngle = (Math.atan2(o.y - last.y, last.x - o.x) + 2 * Math.PI) % (2 * Math.PI);
  const gap = 2 * Math.PI - lastAngle;
  const middle = lastAngle + gap / 2;
  const oLabel =
    gap > O_LABEL_MIN_GAP
      ? { x: o.x + Math.cos(middle) * 14, y: o.y - Math.sin(middle) * 14 }
      : undefined;

  const add = () => {
    if (canAdd) call("addStep");
  };
  return (
    <button
      type="button"
      class="rs"
      disabled={!canAdd}
      aria-label={`Square-root spiral to ${rootText(s.steps + 1)}`}
      onClick={add}
    >
      <svg class="rs-svg" viewBox={`0 0 ${width} ${layout.height}`} width="100%" aria-hidden="true">
        {hypotenuses}
        {legs}
        <circle class="rs-centre" data-part={RootSpiralPart.Centre} cx={o.x} cy={o.y} r={3.5} />
        {oLabel !== undefined && (
          <text
            class="rs-o"
            x={oLabel.x}
            y={oLabel.y}
            text-anchor="middle"
            dominant-baseline="middle"
          >
            O
          </text>
        )}
        {labels}
      </svg>
    </button>
  );
}
