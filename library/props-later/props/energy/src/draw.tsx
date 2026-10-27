import type { JSX } from "preact";

/**
 * Pieces every energy view shares: the family (drawn the way the other chapters draw them), an
 * arrow, a turbine wheel and a generator box with a bulb, which every power station here ends in.
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
  const shirt = `en-shirt-${who}`;
  const headY = -neck - headR + 1;
  return (
    <g class="en-person" transform={`translate(${x} ${y}) scale(${s})`}>
      <rect
        class="en-legs"
        x={-bodyW / 2 + 2}
        y={-neck * 0.42}
        width={bodyW - 4}
        height={neck * 0.42}
        rx={2}
      />
      <rect class={shirt} x={-bodyW / 2} y={-neck} width={bodyW} height={neck * 0.62} rx={6} />
      {point !== undefined && (
        <line
          class={`en-arm ${shirt}-line`}
          x1={bodyW / 2 - 3}
          y1={-neck + 5}
          x2={bodyW / 2 - 3 + point[0]}
          y2={-neck + 5 + point[1]}
        />
      )}
      {who === "riya" && (
        <path
          class="en-hair"
          d={`M${back ? 0 : -headR + 1} ${headY - 2} q ${back ? 2 : -6} 6 ${back ? -1 : -5} 14`}
          stroke-width={5}
          fill="none"
        />
      )}
      {who === "mom" && <circle class="en-hair-fill" cx={0} cy={headY - headR + 1} r={4.5} />}
      <circle class="en-skin" cx={0} cy={headY} r={headR} />
      {(who === "riya" || who === "mom") && (
        <path
          class="en-hair-fill"
          d={`M${-headR} ${headY} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} ${who === "mom" ? -2 : -3} -${2 * headR} 0 z`}
        />
      )}
      {who === "grandpa" && (
        <path
          class="en-hair-grey"
          d={`M${-headR} ${headY - 1} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} 2 -${2 * headR} 0 z`}
        />
      )}
      {who === "kabir" && (
        <g>
          <path
            class="en-cap"
            d={`M${-headR - 0.5} ${headY - 1} a ${headR + 0.5} ${headR + 0.5} 0 0 1 ${2 * headR + 1} 0 z`}
          />
          {!back && (
            <rect class="en-cap" x={0} y={headY - 2.5} width={headR + 5} height={2.5} rx={1.2} />
          )}
        </g>
      )}
      {back && (who === "riya" || who === "mom") && (
        <circle class="en-hair-fill" cx={0} cy={headY} r={headR - 0.5} />
      )}
      {back && who === "grandpa" && (
        <circle class="en-hair-grey" cx={0} cy={headY - 1} r={headR - 1} />
      )}
      {!back && (
        <g class="en-face">
          <circle cx={-2.6} cy={headY + 0.5} r={0.9} />
          <circle cx={2.6} cy={headY + 0.5} r={0.9} />
          <path d={`M-2 ${headY + 3.4} q 2 1.6 4 0`} fill="none" />
        </g>
      )}
      {!back && who === "grandpa" && (
        <g class="en-specs">
          <circle cx={-2.8} cy={headY + 0.4} r={2.2} />
          <circle cx={2.8} cy={headY + 0.4} r={2.2} />
          <line x1={-0.6} y1={headY + 0.4} x2={0.6} y2={headY + 0.4} />
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
    <g class={`en-arrow ${cls}`}>
      <line x1={x1} y1={y1} x2={bx} y2={by} />
      <path d={`M${x2} ${y2} L ${p1} L ${p2} Z`} />
    </g>
  );
}

/** A turbine wheel at (x, y): blades that spin (CSS) while `isTurning`. */
export function Turbine({
  x,
  y,
  r = 16,
  isTurning,
  blades = 6,
}: {
  x: number;
  y: number;
  r?: number;
  isTurning: boolean;
  blades?: number;
}): JSX.Element {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g class={isTurning ? "en-rotor is-turning" : "en-rotor"}>
        {Array.from({ length: blades }, (_, i) => {
          const a = (i * 360) / blades;
          return (
            <path
              key={a}
              class="en-blade"
              transform={`rotate(${a})`}
              d={`M0 0 Q ${r * 0.35} ${-r * 0.4} ${r * 0.15} ${-r} L ${-r * 0.15} ${-r} Q ${-r * 0.1} ${-r * 0.4} 0 0 Z`}
            />
          );
        })}
      </g>
      <circle class="en-hub" r={r * 0.22} />
    </g>
  );
}

/** A generator box at (x, y) wired to a bulb above it that glows with `glow` (0 … 1). */
export function GeneratorBulb({
  x,
  y,
  glow,
  label,
}: {
  x: number;
  y: number;
  glow: number;
  label: string;
}): JSX.Element {
  const g = Math.max(0, Math.min(1, glow));
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect class="en-genbox" x={-18} y={-12} width={36} height={24} rx={4} />
      <text class="en-tiny is-light" x={0} y={4} text-anchor="middle">
        {label}
      </text>
      <line class="en-wire" x1={0} y1={-12} x2={0} y2={-30} />
      {g > 0 && <circle class="en-glow" cx={0} cy={-40} r={8 + 14 * g} style={{ opacity: g }} />}
      <circle class={g > 0 ? "en-bulb is-on" : "en-bulb"} cx={0} cy={-40} r={8} />
    </g>
  );
}
