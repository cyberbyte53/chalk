import type { JSX } from "preact";

/**
 * Pieces every electricity view shares: the family (drawn the way the light chapter draws them),
 * the textbook's circuit symbols (Table 12.1) and an analogue meter dial.
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
  const shirt = `el-shirt-${who}`;
  const headY = -neck - headR + 1;
  return (
    <g class="el-person" transform={`translate(${x} ${y}) scale(${s})`}>
      <rect
        class="el-legs"
        x={-bodyW / 2 + 2}
        y={-neck * 0.42}
        width={bodyW - 4}
        height={neck * 0.42}
        rx={2}
      />
      <rect class={shirt} x={-bodyW / 2} y={-neck} width={bodyW} height={neck * 0.62} rx={6} />
      {point !== undefined && (
        <line
          class={`el-arm ${shirt}-line`}
          x1={bodyW / 2 - 3}
          y1={-neck + 5}
          x2={bodyW / 2 - 3 + point[0]}
          y2={-neck + 5 + point[1]}
        />
      )}
      {who === "riya" && (
        <path
          class="el-hair"
          d={`M${back ? 0 : -headR + 1} ${headY - 2} q ${back ? 2 : -6} 6 ${back ? -1 : -5} 14`}
          stroke-width={5}
          fill="none"
        />
      )}
      {who === "mom" && <circle class="el-hair-fill" cx={0} cy={headY - headR + 1} r={4.5} />}
      <circle class="el-skin" cx={0} cy={headY} r={headR} />
      {(who === "riya" || who === "mom") && (
        <path
          class="el-hair-fill"
          d={`M${-headR} ${headY} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} ${who === "mom" ? -2 : -3} -${2 * headR} 0 z`}
        />
      )}
      {who === "grandpa" && (
        <path
          class="el-hair-grey"
          d={`M${-headR} ${headY - 1} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} 2 -${2 * headR} 0 z`}
        />
      )}
      {who === "kabir" && (
        <g>
          <path
            class="el-cap"
            d={`M${-headR - 0.5} ${headY - 1} a ${headR + 0.5} ${headR + 0.5} 0 0 1 ${2 * headR + 1} 0 z`}
          />
          {!back && (
            <rect class="el-cap" x={0} y={headY - 2.5} width={headR + 5} height={2.5} rx={1.2} />
          )}
        </g>
      )}
      {back && (who === "riya" || who === "mom") && (
        <circle class="el-hair-fill" cx={0} cy={headY} r={headR - 0.5} />
      )}
      {back && who === "grandpa" && (
        <circle class="el-hair-grey" cx={0} cy={headY - 1} r={headR - 1} />
      )}
      {!back && (
        <g class="el-face">
          <circle cx={-2.6} cy={headY + 0.5} r={0.9} />
          <circle cx={2.6} cy={headY + 0.5} r={0.9} />
          <path d={`M-2 ${headY + 3.4} q 2 1.6 4 0`} fill="none" />
        </g>
      )}
      {!back && who === "grandpa" && (
        <g class="el-specs">
          <circle cx={-2.8} cy={headY + 0.4} r={2.2} />
          <circle cx={2.8} cy={headY + 0.4} r={2.2} />
          <line x1={-0.6} y1={headY + 0.4} x2={0.6} y2={headY + 0.4} />
        </g>
      )}
    </g>
  );
}

/* ---- Circuit symbols, centred on (0, 0), running along x from -half to +half ---- */

/** The symbols of Table 12.1, by name. */
export const CircuitSymbol = {
  Cell: "cell",
  Battery: "battery",
  KeyOpen: "keyOpen",
  KeyClosed: "keyClosed",
  Joint: "joint",
  Crossing: "crossing",
  Bulb: "bulb",
  Resistor: "resistor",
  Rheostat: "rheostat",
  Ammeter: "ammeter",
  Voltmeter: "voltmeter",
} as const;
export type CircuitSymbol = (typeof CircuitSymbol)[keyof typeof CircuitSymbol];

/** A wire from (x1, y1) to (x2, y2). */
export const Wire = ({
  x1,
  y1,
  x2,
  y2,
  on = false,
}: { x1: number; y1: number; x2: number; y2: number; on?: boolean }) => (
  <line class={on ? "el-wire is-on" : "el-wire"} x1={x1} y1={y1} x2={x2} y2={y2} />
);

/** One cell: the long thin plate is +, the short thick one −; + is on the right. */
export function CellSymbol({ gap = 5 }: { gap?: number }): JSX.Element {
  return (
    <g class="el-cell">
      <line class="el-wire" x1={-14} y1={0} x2={-gap} y2={0} />
      <line class="el-wire" x1={gap} y1={0} x2={14} y2={0} />
      <line class="el-plate-minus" x1={-gap} y1={-6} x2={-gap} y2={6} />
      <line class="el-plate-plus" x1={gap} y1={-12} x2={gap} y2={12} />
    </g>
  );
}

/** `n` cells side by side, + on the right, dotted if there are many. */
export function BatterySymbol({ n = 2 }: { n?: number }): JSX.Element {
  const step = 10;
  const w = (n - 1) * step;
  return (
    <g class="el-cell">
      <line class="el-wire" x1={-w / 2 - 14} y1={0} x2={-w / 2 - 3} y2={0} />
      <line class="el-wire" x1={w / 2 + 3} y1={0} x2={w / 2 + 14} y2={0} />
      {Array.from({ length: n }, (_, i) => {
        const x = -w / 2 + i * step;
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: the cells are identical and never reorder
          <g key={i}>
            <line class="el-plate-minus" x1={x - 3} y1={-6} x2={x - 3} y2={6} />
            <line class="el-plate-plus" x1={x + 3} y1={-12} x2={x + 3} y2={12} />
          </g>
        );
      })}
    </g>
  );
}

/** A zigzag resistor `half` long either side. */
export function ResistorSymbol({ half = 16, cls = "" }: { half?: number; cls?: string }) {
  const steps = 6;
  const pts = Array.from({ length: steps + 1 }, (_, i) => {
    const x = -half + (2 * half * i) / steps;
    const y = i === 0 || i === steps ? 0 : i % 2 === 1 ? -6 : 6;
    return `${x},${y}`;
  }).join(" ");
  return <polyline class={`el-resistor ${cls}`} points={pts} />;
}

/** A bulb: a circle with a filament loop; `glow` 0–1 lights it, `isBroken` draws it fused. */
export function BulbSymbol({
  r = 11,
  glow = 0,
  isBroken = false,
}: { r?: number; glow?: number; isBroken?: boolean }): JSX.Element {
  const g = Math.max(0, Math.min(1, glow));
  return (
    <g class="el-bulb">
      {g > 0 && <circle class="el-glow" r={r + 7 * g} opacity={0.5 * g} />}
      <circle class="el-bulb-glass" r={r} />
      {g > 0 && <circle class="el-bulb-light" r={r} opacity={0.35 + 0.65 * g} />}
      {isBroken ? (
        <path
          class="el-filament is-broken"
          d={`M${-r} 0 L${-r * 0.4} 0 L${-r * 0.1} -${r * 0.45} M${r * 0.1} -${r * 0.25} L${r * 0.4} 0 L${r} 0`}
        />
      ) : (
        <path
          class={g > 0 ? "el-filament is-lit" : "el-filament"}
          d={`M${-r} 0 L${-r * 0.45} 0 C${-r * 0.45} ${-r * 0.9} ${r * 0.45} ${-r * 0.9} ${r * 0.45} 0 L${r} 0`}
        />
      )}
    </g>
  );
}

/** A plug key: two brass blocks with the plug in (closed) or out (open). */
export function KeySymbol({ isClosed }: { isClosed: boolean }): JSX.Element {
  return (
    <g class="el-key">
      <line class="el-wire" x1={-14} y1={0} x2={-6} y2={0} />
      <line class="el-wire" x1={6} y1={0} x2={14} y2={0} />
      <path class="el-key-bracket" d="M-6 -7 A 7 7 0 0 0 -6 7" />
      <path class="el-key-bracket" d="M6 -7 A 7 7 0 0 1 6 7" />
      {isClosed && <circle class="el-key-plug" r={2.6} />}
      {!isClosed && <circle class="el-key-plug is-out" r={2.6} />}
    </g>
  );
}

/** A meter: a circle with A or V, and + on the side current comes in. */
export function MeterSymbol({ letter, r = 11 }: { letter: "A" | "V"; r?: number }) {
  return (
    <g class="el-meter">
      <circle class="el-meter-ring" r={r} />
      <text class="el-meter-letter" y={0.5} text-anchor="middle" dominant-baseline="central">
        {letter}
      </text>
      <text class="el-meter-sign" x={-r - 4} y={-r + 2} text-anchor="middle">
        +
      </text>
      <text class="el-meter-sign" x={r + 4} y={-r + 2} text-anchor="middle">
        −
      </text>
    </g>
  );
}

/** A rheostat: a resistor with an arrow through it. */
export function RheostatSymbol({ half = 16 }: { half?: number }): JSX.Element {
  return (
    <g>
      <ResistorSymbol half={half} />
      <line class="el-rheo-arrow" x1={-half * 0.7} y1={9} x2={half * 0.7} y2={-9} />
      <path class="el-rheo-head" d={`M${half * 0.7} -9 l -6 1 l 3 4 z`} />
    </g>
  );
}

/** Any Table 12.1 symbol drawn with its leads, half-length about 22. */
export function TableSymbol({ symbol }: { symbol: CircuitSymbol }): JSX.Element {
  const lead = (a: number, b: number) => <line class="el-wire" x1={a} y1={0} x2={b} y2={0} />;
  switch (symbol) {
    case CircuitSymbol.Cell:
      return (
        <g>
          {lead(-24, -14)}
          <CellSymbol />
          {lead(14, 24)}
        </g>
      );
    case CircuitSymbol.Battery:
      return (
        <g>
          {lead(-24, -19)}
          <BatterySymbol n={3} />
          {lead(19, 24)}
        </g>
      );
    case CircuitSymbol.KeyOpen:
      return (
        <g>
          {lead(-24, -14)}
          <KeySymbol isClosed={false} />
          {lead(14, 24)}
        </g>
      );
    case CircuitSymbol.KeyClosed:
      return (
        <g>
          {lead(-24, -14)}
          <KeySymbol isClosed />
          {lead(14, 24)}
        </g>
      );
    case CircuitSymbol.Joint:
      return (
        <g>
          {lead(-24, 24)}
          <line class="el-wire" x1={0} y1={0} x2={0} y2={16} />
          <circle class="el-joint" r={3} />
        </g>
      );
    case CircuitSymbol.Crossing:
      return (
        <g>
          {lead(-24, 24)}
          <path class="el-wire el-hop" d="M0 -16 V -5 A 5 5 0 0 1 0 5 V 16" />
        </g>
      );
    case CircuitSymbol.Bulb:
      return (
        <g>
          {lead(-24, -11)}
          <BulbSymbol />
          {lead(11, 24)}
        </g>
      );
    case CircuitSymbol.Resistor:
      return (
        <g>
          {lead(-24, -16)}
          <ResistorSymbol />
          {lead(16, 24)}
        </g>
      );
    case CircuitSymbol.Rheostat:
      return (
        <g>
          {lead(-24, -16)}
          <RheostatSymbol />
          {lead(16, 24)}
        </g>
      );
    case CircuitSymbol.Ammeter:
    case CircuitSymbol.Voltmeter:
      return (
        <g>
          {lead(-24, -11)}
          <MeterSymbol letter={symbol === CircuitSymbol.Ammeter ? "A" : "V"} />
          {lead(11, 24)}
        </g>
      );
  }
}

/**
 * An analogue meter: an arc scale from 0 to `max`, a needle at `value` (past the end it pins at
 * the stop), the letter in the middle and the reading underneath.
 */
export function Dial({
  x,
  y,
  r = 34,
  value,
  max,
  letter,
  reading,
  ticks = 5,
}: {
  x: number;
  y: number;
  r?: number;
  value: number;
  max: number;
  letter: string;
  reading: string;
  ticks?: number;
}): JSX.Element {
  const from = Math.PI * 1.15;
  const to = Math.PI * 1.85;
  const angleOf = (v: number) => from + ((to - from) * Math.max(0, Math.min(v, max * 1.04))) / max;
  const at = (a: number, rr: number) => [x + rr * Math.cos(a), y + rr * Math.sin(a)] as const;
  const [ax, ay] = at(from, r - 6);
  const [bx, by] = at(to, r - 6);
  const [nx, ny] = at(angleOf(value), r - 8);
  const isOver = value > max * 1.02;
  return (
    <g class={isOver ? "el-dial is-over" : "el-dial"}>
      <rect
        class="el-dial-case"
        x={x - r}
        y={y - r * 0.95}
        width={2 * r}
        height={r * 1.55}
        rx={8}
      />
      <path class="el-dial-arc" d={`M${ax} ${ay} A ${r - 6} ${r - 6} 0 0 1 ${bx} ${by}`} />
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const a = from + ((to - from) * i) / ticks;
        const [t1x, t1y] = at(a, r - 6);
        const [t2x, t2y] = at(a, r - 10);
        const [lx, ly] = at(a, r - 16);
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: ticks never reorder
          <g key={i}>
            <line class="el-dial-tick" x1={t1x} y1={t1y} x2={t2x} y2={t2y} />
            {(i === 0 || i === ticks || 2 * i === ticks) && (
              <text
                class="el-dial-num"
                x={lx}
                y={ly}
                text-anchor="middle"
                dominant-baseline="central"
              >
                {Number(((max * i) / ticks).toPrecision(3))}
              </text>
            )}
          </g>
        );
      })}
      <line class="el-dial-needle" x1={x} y1={y + 2} x2={nx} y2={ny} />
      <circle class="el-dial-pivot" cx={x} cy={y + 2} r={2.5} />
      <text class="el-dial-letter" x={x} y={y + 16} text-anchor="middle">
        {letter}
      </text>
      <text class="el-dial-reading" x={x} y={y + r * 0.6 + 14} text-anchor="middle">
        {reading}
      </text>
    </g>
  );
}
