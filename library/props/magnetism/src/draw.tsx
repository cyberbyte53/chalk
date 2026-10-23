import type { JSX } from "preact";

/**
 * Pieces every magnetism view shares: the family (drawn the way the other chapters draw them),
 * currents crossing the page (⊙ / ⊗), arrows, bar-magnet poles and a centre-zero galvanometer.
 */

export type Who = "riya" | "kabir" | "grandpa" | "mom";

/** A person with feet at (x, y), `s` the scale (1 ≈ 46 units tall for an adult). */
export function Person({
  who,
  x,
  y,
  s = 1,
  back = false,
  point,
}: {
  who: Who;
  x: number;
  y: number;
  s?: number;
  back?: boolean;
  /** An arm raised towards (dx, dy) from the shoulder, in the person's own units. */
  point?: [number, number];
}): JSX.Element {
  const isChild = who === "kabir";
  const h = isChild ? 34 : 44;
  const headR = isChild ? 7.5 : 7;
  const bodyW = isChild ? 15 : 17;
  const neck = h - 2 * headR;
  const shirt = `mg-shirt-${who}`;
  const headY = -neck - headR + 1;
  return (
    <g class="mg-person" transform={`translate(${x} ${y}) scale(${s})`}>
      <rect
        class="mg-legs"
        x={-bodyW / 2 + 2}
        y={-neck * 0.42}
        width={bodyW - 4}
        height={neck * 0.42}
        rx={2}
      />
      <rect class={shirt} x={-bodyW / 2} y={-neck} width={bodyW} height={neck * 0.62} rx={6} />
      {point !== undefined && (
        <line
          class={`mg-arm ${shirt}-line`}
          x1={bodyW / 2 - 3}
          y1={-neck + 5}
          x2={bodyW / 2 - 3 + point[0]}
          y2={-neck + 5 + point[1]}
        />
      )}
      {who === "riya" && (
        <path
          class="mg-hair"
          d={`M${back ? 0 : -headR + 1} ${headY - 2} q ${back ? 2 : -6} 6 ${back ? -1 : -5} 14`}
          stroke-width={5}
          fill="none"
        />
      )}
      {who === "mom" && <circle class="mg-hair-fill" cx={0} cy={headY - headR + 1} r={4.5} />}
      <circle class="mg-skin" cx={0} cy={headY} r={headR} />
      {(who === "riya" || who === "mom") && (
        <path
          class="mg-hair-fill"
          d={`M${-headR} ${headY} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} ${who === "mom" ? -2 : -3} -${2 * headR} 0 z`}
        />
      )}
      {who === "grandpa" && (
        <path
          class="mg-hair-grey"
          d={`M${-headR} ${headY - 1} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} 2 -${2 * headR} 0 z`}
        />
      )}
      {who === "kabir" && (
        <g>
          <path
            class="mg-cap"
            d={`M${-headR - 0.5} ${headY - 1} a ${headR + 0.5} ${headR + 0.5} 0 0 1 ${2 * headR + 1} 0 z`}
          />
          {!back && (
            <rect class="mg-cap" x={0} y={headY - 2.5} width={headR + 5} height={2.5} rx={1.2} />
          )}
        </g>
      )}
      {back && (who === "riya" || who === "mom") && (
        <circle class="mg-hair-fill" cx={0} cy={headY} r={headR - 0.5} />
      )}
      {back && who === "grandpa" && (
        <circle class="mg-hair-grey" cx={0} cy={headY - 1} r={headR - 1} />
      )}
      {!back && (
        <g class="mg-face">
          <circle cx={-2.6} cy={headY + 0.5} r={0.9} />
          <circle cx={2.6} cy={headY + 0.5} r={0.9} />
          <path d={`M-2 ${headY + 3.4} q 2 1.6 4 0`} fill="none" />
        </g>
      )}
      {!back && who === "grandpa" && (
        <g class="mg-specs">
          <circle cx={-2.8} cy={headY + 0.4} r={2.2} />
          <circle cx={2.8} cy={headY + 0.4} r={2.2} />
          <line x1={-0.6} y1={headY + 0.4} x2={0.6} y2={headY + 0.4} />
        </g>
      )}
    </g>
  );
}

/* ---- Circuit symbols, centred on (0, 0), running along x from -half to +half ---- */

/** A current crossing the page: ⊙ coming out (a dot), ⊗ going in (a cross); none: an empty ring. */
export function Crossing({
  x,
  y,
  r = 7,
  current,
}: {
  x: number;
  y: number;
  r?: number;
  current: "out" | "in" | "none";
}): JSX.Element {
  const d = r * 0.55;
  return (
    <g class={`mg-crossing is-${current}`} transform={`translate(${x} ${y})`}>
      <circle r={r} />
      {current === "out" && <circle class="mg-crossing-dot" r={r * 0.28} />}
      {current === "in" && (
        <g class="mg-crossing-x">
          <line x1={-d} y1={-d} x2={d} y2={d} />
          <line x1={-d} y1={d} x2={d} y2={-d} />
        </g>
      )}
    </g>
  );
}

/** A straight arrow from (x1, y1) to (x2, y2) with a filled head. */
export function Arrow({
  x1,
  y1,
  x2,
  y2,
  cls = "",
  head = 7,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cls?: string;
  head?: number;
}): JSX.Element {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const bx = x2 - head * Math.cos(a);
  const by = y2 - head * Math.sin(a);
  const w = head * 0.55;
  const p1 = `${bx + w * Math.sin(a)} ${by - w * Math.cos(a)}`;
  const p2 = `${bx - w * Math.sin(a)} ${by + w * Math.cos(a)}`;
  return (
    <g class={`mg-arrow ${cls}`}>
      <line x1={x1} y1={y1} x2={bx} y2={by} />
      <path d={`M${x2} ${y2} L ${p1} L ${p2} Z`} />
    </g>
  );
}

/** One pole face of a magnet, a block marked N or S. */
export function Pole({
  x,
  y,
  w,
  h,
  name,
}: { x: number; y: number; w: number; h: number; name: "N" | "S" }): JSX.Element {
  return (
    <g class={`mg-pole is-${name.toLowerCase()}`}>
      <rect x={x} y={y} width={w} height={h} rx={3} />
      <text x={x + w / 2} y={y + h / 2 + 5} text-anchor="middle">
        {name}
      </text>
    </g>
  );
}

/**
 * A centre-zero galvanometer at (x, y): its needle swings `swing` (−1 … 1) of the way to either
 * end. `flicks` keys the swing so each new kick replays (and returns to zero) on screen.
 */
export function Galvanometer({
  x,
  y,
  r = 26,
  swing,
  isMomentary = false,
  flicks = 0,
  label = "G",
}: {
  x: number;
  y: number;
  r?: number;
  swing: number;
  isMomentary?: boolean;
  flicks?: number;
  label?: string;
}): JSX.Element {
  const max = 55;
  const angle = Math.max(-1, Math.min(1, swing)) * max;
  const ticks = [-1, -0.5, 0, 0.5, 1];
  return (
    <g class="mg-galvo" transform={`translate(${x} ${y})`}>
      <rect class="mg-galvo-case" x={-r - 6} y={-r - 4} width={2 * r + 12} height={r + 18} rx={6} />
      <path
        class="mg-galvo-scale"
        d={`M${-r * Math.sin((max * Math.PI) / 180)} ${-r * Math.cos((max * Math.PI) / 180)} A ${r} ${r} 0 0 1 ${r * Math.sin((max * Math.PI) / 180)} ${-r * Math.cos((max * Math.PI) / 180)}`}
      />
      {ticks.map((t) => {
        const a = (t * max * Math.PI) / 180;
        return (
          <line
            key={t}
            class="mg-galvo-tick"
            x1={(r - 4) * Math.sin(a)}
            y1={-(r - 4) * Math.cos(a)}
            x2={(r + 1) * Math.sin(a)}
            y2={-(r + 1) * Math.cos(a)}
          />
        );
      })}
      <text class="mg-galvo-zero" x={0} y={-r - 7} text-anchor="middle">
        0
      </text>
      <g
        key={flicks}
        class={isMomentary && swing !== 0 ? "mg-needle is-kick" : "mg-needle"}
        style={isMomentary ? { "--mg-swing": `${angle}deg` } : undefined}
        transform={isMomentary ? undefined : `rotate(${angle})`}
      >
        <line x1={0} y1={4} x2={0} y2={-r + 3} />
      </g>
      <circle class="mg-galvo-pivot" r={3} />
      <text class="mg-galvo-label" x={0} y={12} text-anchor="middle">
        {label}
      </text>
    </g>
  );
}
