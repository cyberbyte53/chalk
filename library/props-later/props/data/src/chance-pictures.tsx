import type { JSX } from "preact";
import { Colour, type Marbles, type SUITS, SUIT_SYMBOL, cardParts, isRedSuit } from "./chance";

/** Small pictures of the experiments' objects, drawn in SVG units around (x, y). */

/** A coin showing H or T (or blank). */
export function Coin({
  x,
  y,
  r = 16,
  face,
}: { x: number; y: number; r?: number; face: string | null }) {
  return (
    <g class="dt-coin">
      <circle cx={x} cy={y} r={r} />
      <circle class="dt-coin-rim" cx={x} cy={y} r={r - 3} />
      {face !== null && (
        <text x={x} y={y + r * 0.35} text-anchor="middle" style={{ fontSize: `${r}px` }}>
          {face}
        </text>
      )}
    </g>
  );
}

const PIPS: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [
    [-1, -1],
    [1, 1],
  ],
  3: [
    [-1, -1],
    [0, 0],
    [1, 1],
  ],
  4: [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ],
  5: [
    [-1, -1],
    [1, -1],
    [0, 0],
    [-1, 1],
    [1, 1],
  ],
  6: [
    [-1, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [-1, 1],
    [1, 1],
  ],
};

/** A die showing a face: pips for 1–6, the number otherwise; `tone` 0 or 1 tells two dice apart. */
export function Die({
  x,
  y,
  s = 30,
  value,
  tone = 0,
}: { x: number; y: number; s?: number; value: number | null; tone?: 0 | 1 }) {
  const pips = value === null ? [] : (PIPS[value] ?? null);
  return (
    <g class={`dt-die${tone === 1 ? " is-second" : ""}`}>
      <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={s * 0.18} />
      {pips === null ? (
        <text x={x} y={y + s * 0.18} text-anchor="middle" style={{ fontSize: `${s * 0.5}px` }}>
          {value}
        </text>
      ) : (
        pips.map(([dx, dy]) => (
          <circle
            key={`${dx},${dy}`}
            class="dt-pip"
            cx={x + dx * s * 0.26}
            cy={y + dy * s * 0.26}
            r={s * 0.08}
          />
        ))
      )}
    </g>
  );
}

/** Marble fills: the content's own colours (a red marble is red in every theme). */
export const MARBLE_FILL: Record<Colour, string> = {
  [Colour.Red]: "#d64545",
  [Colour.Blue]: "#3b6fd4",
  [Colour.White]: "#f4f4f2",
  [Colour.Green]: "#2f9e5b",
  [Colour.Yellow]: "#f2c230",
  [Colour.Black]: "#2b2b30",
};

/** A bag (jar) of marbles, packed in rows; `pick` circles one colour (the last drawn). */
export function Bag({
  x,
  y,
  w,
  h,
  marbles,
  pick,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  marbles: readonly Marbles[];
  pick: string | null;
}) {
  const all = marbles.flatMap((m) => Array.from({ length: m.count }, () => m.colour));
  const per = Math.max(4, Math.ceil(Math.sqrt(all.length * (w / h))));
  const r = Math.min((w - 10) / per / 2, 9);
  return (
    <g class="dt-bag">
      <path d={`M${x} ${y} h ${w} v ${h} q 0 10 -10 10 h ${-(w - 20)} q -10 0 -10 -10 z`} />
      {all.map((c, i) => {
        const col = i % per;
        const row = Math.floor(i / per);
        return (
          <circle
            // biome-ignore lint/suspicious/noArrayIndexKey: marbles are positional
            key={i}
            class="dt-marble"
            cx={x + 5 + r + col * 2 * r}
            cy={y + h + 4 - r - row * 2 * r}
            r={r - 0.6}
            fill={MARBLE_FILL[c as Colour]}
          />
        );
      })}
      {pick !== null && (
        <circle
          class="dt-pick"
          cx={x + w + 18}
          cy={y + h / 2}
          r={11}
          fill={MARBLE_FILL[pick as Colour]}
        />
      )}
    </g>
  );
}

/** A spinner of equal sectors with a pointer at the one landed on. */
export function Spinner({
  x,
  y,
  r,
  labels,
  at,
}: { x: number; y: number; r: number; labels: readonly string[]; at: number | null }) {
  const n = labels.length;
  const wedge = (i: number) => {
    const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
    const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
    const p = (a: number) => `${x + r * Math.cos(a)} ${y + r * Math.sin(a)}`;
    return `M${x} ${y} L${p(a0)} A ${r} ${r} 0 0 1 ${p(a1)} Z`;
  };
  const mid = (i: number) => ((i + 0.5) / n) * 2 * Math.PI - Math.PI / 2;
  return (
    <g class="dt-spinner">
      {labels.map((label, i) => (
        <g key={`${i}-${label}`} class={`dt-sector is-${i % 4}${at === i ? " is-on" : ""}`}>
          <path d={wedge(i)} />
          <text
            x={x + r * 0.62 * Math.cos(mid(i))}
            y={y + r * 0.62 * Math.sin(mid(i)) + 4}
            text-anchor="middle"
          >
            {label}
          </text>
        </g>
      ))}
      {at !== null && (
        <line
          class="dt-needle"
          x1={x}
          y1={y}
          x2={x + r * 0.9 * Math.cos(mid(at))}
          y2={y + r * 0.9 * Math.sin(mid(at))}
        />
      )}
      <circle class="dt-hub" cx={x} cy={y} r={4} />
    </g>
  );
}

/** A playing card, face up. */
export function Card({
  x,
  y,
  w,
  id,
}: { x: number; y: number; w: number; id: string }): JSX.Element {
  const { rank, suit } = cardParts(id);
  const h = w * 1.4;
  return (
    <g class={`dt-card${isRedSuit(suit) ? " is-red" : ""}`}>
      <rect x={x} y={y} width={w} height={h} rx={w * 0.12} />
      <text
        x={x + w / 2}
        y={y + h * 0.45}
        text-anchor="middle"
        style={{ fontSize: `${w * 0.42}px` }}
      >
        {rank}
      </text>
      <text
        x={x + w / 2}
        y={y + h * 0.82}
        text-anchor="middle"
        style={{ fontSize: `${w * 0.4}px` }}
      >
        {SUIT_SYMBOL[suit as (typeof SUITS)[number]]}
      </text>
    </g>
  );
}
