import type { JSX } from "preact";

/**
 * The family, drawn as in the other chapters (the cs- classes of the chemistry scenes), plus the
 * people of the metals chapter: a stranger and a jeweller.
 */

export type MetalWho = "riya" | "kabir" | "grandpa" | "mom" | "stranger" | "jeweller";

/** A person: feet at (x, y), `s` the scale; `point` raises an arm towards (dx, dy). */
export function MetalPerson({
  who,
  x,
  y,
  s = 1,
  back = false,
  point,
}: {
  who: MetalWho;
  x: number;
  y: number;
  s?: number;
  back?: boolean;
  point?: [number, number];
}): JSX.Element {
  const isChild = who === "kabir";
  const h = isChild ? 34 : 44;
  const headR = isChild ? 7.5 : 7;
  const bodyW = isChild ? 15 : 17;
  const neck = h - 2 * headR;
  const shirt = who === "stranger" || who === "jeweller" ? `mn-shirt-${who}` : `cs-shirt-${who}`;
  const headY = -neck - headR + 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect
        class="cs-legs"
        x={-bodyW / 2 + 2}
        y={-neck * 0.42}
        width={bodyW - 4}
        height={neck * 0.42}
        rx={2}
      />
      <rect class={shirt} x={-bodyW / 2} y={-neck} width={bodyW} height={neck * 0.62} rx={6} />
      {point !== undefined && (
        <line
          class={`cs-arm ${shirt}-line`}
          x1={bodyW / 2 - 3}
          y1={-neck + 5}
          x2={bodyW / 2 - 3 + point[0]}
          y2={-neck + 5 + point[1]}
        />
      )}
      {who === "riya" && (
        <path
          class="cs-hair"
          d={`M${back ? 0 : -headR + 1} ${headY - 2} q ${back ? 2 : -6} 6 ${back ? -1 : -5} 14`}
          stroke-width={5}
          fill="none"
        />
      )}
      {who === "mom" && <circle class="cs-hair-fill" cx={0} cy={headY - headR + 1} r={4.5} />}
      <circle class="cs-skin" cx={0} cy={headY} r={headR} />
      {(who === "riya" || who === "mom") && (
        <path
          class="cs-hair-fill"
          d={`M${-headR} ${headY} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} -3 -${2 * headR} 0 z`}
        />
      )}
      {(who === "stranger" || who === "jeweller") && (
        <path
          class="cs-hair-fill"
          d={`M${-headR} ${headY - 1} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} -1 -${2 * headR} 0 z`}
        />
      )}
      {who === "grandpa" && (
        <path
          class="cs-hair-grey"
          d={`M${-headR} ${headY - 1} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} 2 -${2 * headR} 0 z`}
        />
      )}
      {who === "kabir" && (
        <g>
          <path
            class="cs-cap"
            d={`M${-headR - 0.5} ${headY - 1} a ${headR + 0.5} ${headR + 0.5} 0 0 1 ${2 * headR + 1} 0 z`}
          />
          {!back && (
            <rect class="cs-cap" x={0} y={headY - 2.5} width={headR + 5} height={2.5} rx={1.2} />
          )}
        </g>
      )}
      {back && (who === "riya" || who === "mom") && (
        <circle class="cs-hair-fill" cx={0} cy={headY} r={headR - 0.5} />
      )}
      {!back && (
        <g class="cs-face">
          <circle cx={-2.6} cy={headY + 0.5} r={0.9} />
          <circle cx={2.6} cy={headY + 0.5} r={0.9} />
          <path d={`M-2 ${headY + 3.4} q 2 1.6 4 0`} fill="none" />
        </g>
      )}
      {!back && who === "stranger" && (
        <path class="mn-moustache" d={`M-3.5 ${headY + 2.6} q 3.5 -1.6 7 0`} />
      )}
      {!back && (who === "grandpa" || who === "jeweller") && (
        <g class="cs-specs">
          <circle cx={-2.8} cy={headY + 0.4} r={2.2} />
          <circle cx={2.8} cy={headY + 0.4} r={2.2} />
          <line x1={-0.6} y1={headY + 0.4} x2={0.6} y2={headY + 0.4} />
        </g>
      )}
    </g>
  );
}

/** A gold bangle seen at an angle, centred on (x, y). */
export function Bangle({
  x,
  y,
  r = 9,
  shine = true,
}: { x: number; y: number; r?: number; shine?: boolean }) {
  return (
    <g>
      <ellipse class="mn-bangle" cx={x} cy={y} rx={r} ry={r * 0.55} />
      {shine && <path class="mn-glint" d={`M${x - r * 0.5} ${y - r * 0.45} l 2 -2 m 1 5 l 2 -2`} />}
    </g>
  );
}
