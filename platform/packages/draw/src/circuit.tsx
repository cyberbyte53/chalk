/** @jsxImportSource preact */
import type { JSX } from "preact";
import { type KitProps, kitClass, placeAt } from "./kit";
import type { Pt } from "./labels";

/**
 * The textbook's circuit symbols (NCERT Table 12.1) and an analogue meter, in px. Each symbol is
 * drawn centred on `at`, running along x (turned by `angle`, degrees), so a caller lays it on a
 * wire's middle. Stateless.
 */

/** Where a symbol sits and which way it runs. */
export type SymbolPlacement = KitProps & {
  /** Its centre, px (default the origin: the caller's own transform places it). */
  at?: Pt;
  /** Degrees clockwise from running left to right. */
  angle?: number;
};

const pointsOf = (points: readonly Pt[]): string => points.map(([x, y]) => `${x},${y}`).join(" ");

export type WireProps = KitProps & {
  /** The corners it runs through, px (two for a straight wire). */
  points: readonly Pt[];
  /** Current flows: drawn in the primary colour. */
  isOn?: boolean;
};

/** A wire through some points. */
export function Wire({ points, isOn = false, part, class: extra }: WireProps): JSX.Element {
  return (
    <polyline
      class={kitClass("kit-wire", isOn && "is-on", extra)}
      data-part={part}
      points={pointsOf(points)}
    />
  );
}

export type CellProps = SymbolPlacement & {
  /** Half the gap between the plates, px. */
  gap?: number;
  /** How far each lead reaches from the centre, px; 0 for no leads (a caller drawing its own). */
  lead?: number;
  /** Half the long (+) plate's length, px. */
  long?: number;
};

/** One cell: the long thin plate is +, the short thick one −; + is on the right (+x). */
export function Cell({
  at,
  angle,
  gap = 5,
  lead = 14,
  long = 12,
  part,
  class: extra,
}: CellProps): JSX.Element {
  return (
    <g class={kitClass("kit-cell", extra)} data-part={part} transform={placeAt(at, angle)}>
      {lead > gap && <line class="kit-wire" x1={-lead} y1={0} x2={-gap} y2={0} />}
      {lead > gap && <line class="kit-wire" x1={gap} y1={0} x2={lead} y2={0} />}
      <line class="kit-plate-minus" x1={-gap} y1={-6} x2={-gap} y2={6} />
      <line class="kit-plate-plus" x1={gap} y1={-long} x2={gap} y2={long} />
    </g>
  );
}

export type BatteryProps = SymbolPlacement & { cells?: number };

/** Cells side by side, + on the right, with a lead at each end. */
export function Battery({ at, angle, cells = 2, part, class: extra }: BatteryProps): JSX.Element {
  const step = 10;
  const w = (cells - 1) * step;
  return (
    <g class={kitClass("kit-cell", extra)} data-part={part} transform={placeAt(at, angle)}>
      <line class="kit-wire" x1={-w / 2 - 14} y1={0} x2={-w / 2 - 3} y2={0} />
      <line class="kit-wire" x1={w / 2 + 3} y1={0} x2={w / 2 + 14} y2={0} />
      {Array.from({ length: cells }, (_, i) => {
        const x = -w / 2 + i * step;
        return (
          <g key={i}>
            <line class="kit-plate-minus" x1={x - 3} y1={-6} x2={x - 3} y2={6} />
            <line class="kit-plate-plus" x1={x + 3} y1={-12} x2={x + 3} y2={12} />
          </g>
        );
      })}
    </g>
  );
}

export type ResistorProps = SymbolPlacement & { half?: number };

/** A zigzag resistor reaching `half` either side of its centre. */
export function Resistor({ at, angle, half = 16, part, class: extra }: ResistorProps): JSX.Element {
  const steps = 6;
  const pts = Array.from({ length: steps + 1 }, (_, i): Pt => {
    const x = -half + (2 * half * i) / steps;
    const y = i === 0 || i === steps ? 0 : i % 2 === 1 ? -6 : 6;
    return [x, y];
  });
  return (
    <polyline
      class={kitClass("kit-resistor", extra)}
      data-part={part}
      transform={placeAt(at, angle)}
      points={pointsOf(pts)}
    />
  );
}

/** A rheostat: a resistor with an arrow across it. */
export function Rheostat({ at, angle, half = 16, part, class: extra }: ResistorProps): JSX.Element {
  return (
    <g class={kitClass("kit-rheostat", extra)} data-part={part} transform={placeAt(at, angle)}>
      <Resistor half={half} />
      <line class="kit-rheostat-arrow" x1={-half * 0.7} y1={9} x2={half * 0.7} y2={-9} />
      <path class="kit-rheostat-head" d={`M${half * 0.7} -9 l -6 1 l 3 4 z`} />
    </g>
  );
}

export type BulbProps = SymbolPlacement & {
  r?: number;
  /** How brightly it glows, 0 (dark) to 1. */
  brightness?: number;
  /** A fused bulb: the filament drawn broken. */
  isBroken?: boolean;
};

/** A bulb: a circle with a filament loop, lit by `brightness`. */
export function Bulb({
  at,
  angle,
  r = 11,
  brightness = 0,
  isBroken = false,
  part,
  class: extra,
}: BulbProps): JSX.Element {
  const g = Math.max(0, Math.min(1, brightness));
  return (
    <g class={kitClass("kit-bulb", extra)} data-part={part} transform={placeAt(at, angle)}>
      {g > 0 && <circle class="kit-bulb-glow" r={r + 7 * g} opacity={0.5 * g} />}
      <circle class="kit-bulb-glass" r={r} />
      {g > 0 && <circle class="kit-bulb-light" r={r} opacity={0.35 + 0.65 * g} />}
      {isBroken ? (
        <path
          class="kit-filament is-broken"
          d={`M${-r} 0 L${-r * 0.4} 0 L${-r * 0.1} -${r * 0.45} M${r * 0.1} -${r * 0.25} L${r * 0.4} 0 L${r} 0`}
        />
      ) : (
        <path
          class={g > 0 ? "kit-filament is-lit" : "kit-filament"}
          d={`M${-r} 0 L${-r * 0.45} 0 C${-r * 0.45} ${-r * 0.9} ${r * 0.45} ${-r * 0.9} ${r * 0.45} 0 L${r} 0`}
        />
      )}
    </g>
  );
}

export type SwitchProps = SymbolPlacement & { half?: number; isClosed: boolean };

/** A switch: a lever between two contacts, down on the far one when closed, raised 30° when open. */
export function Switch({
  at,
  angle,
  half = 14,
  isClosed,
  part,
  class: extra,
}: SwitchProps): JSX.Element {
  const tip: Pt = isClosed
    ? [half, 0]
    : [-half + 2 * half * Math.cos(Math.PI / 6), -2 * half * Math.sin(Math.PI / 6)];
  return (
    <g
      class={kitClass("kit-switch", isClosed && "is-closed", extra)}
      data-part={part}
      transform={placeAt(at, angle)}
    >
      <line class="kit-switch-lever" x1={-half} y1={0} x2={tip[0]} y2={tip[1]} />
      <circle class="kit-switch-contact" cx={-half} cy={0} r={3} />
      <circle class="kit-switch-contact" cx={half} cy={0} r={3} />
    </g>
  );
}

export type PlugKeyProps = SymbolPlacement & { isClosed: boolean };

/** A plug key (the textbook's switch): two brass blocks with the plug in (closed) or out (open), with leads. */
export function PlugKey({ at, angle, isClosed, part, class: extra }: PlugKeyProps): JSX.Element {
  return (
    <g
      class={kitClass("kit-key", isClosed && "is-closed", extra)}
      data-part={part}
      transform={placeAt(at, angle)}
    >
      <line class="kit-wire" x1={-14} y1={0} x2={-6} y2={0} />
      <line class="kit-wire" x1={6} y1={0} x2={14} y2={0} />
      <path class="kit-key-bracket" d="M-6 -7 A 7 7 0 0 0 -6 7" />
      <path class="kit-key-bracket" d="M6 -7 A 7 7 0 0 1 6 7" />
      <circle class={isClosed ? "kit-key-plug" : "kit-key-plug is-out"} r={2.6} />
    </g>
  );
}

/** Which quantity a meter measures. */
export const MeterKind = { Ammeter: "A", Voltmeter: "V" } as const;
export type MeterKind = (typeof MeterKind)[keyof typeof MeterKind];

export type MeterProps = SymbolPlacement & {
  kind: MeterKind;
  r?: number;
  /** + and − beside it, + on the side current comes in. */
  hasSigns?: boolean;
};

/** A meter's symbol: a circle with A or V in it. The letter stays upright whatever the angle. */
export function Meter({
  at,
  angle = 0,
  kind,
  r = 11,
  hasSigns = true,
  part,
  class: extra,
}: MeterProps): JSX.Element {
  return (
    <g class={kitClass("kit-meter", extra)} data-part={part} transform={placeAt(at, angle)}>
      <circle class="kit-meter-ring" r={r} />
      <text
        class="kit-meter-letter"
        y={0.5}
        text-anchor="middle"
        dominant-baseline="central"
        transform={angle === 0 ? undefined : `rotate(${-angle})`}
      >
        {kind}
      </text>
      {hasSigns && (
        <>
          <text class="kit-meter-sign" x={-r - 4} y={-r + 2} text-anchor="middle">
            +
          </text>
          <text class="kit-meter-sign" x={r + 4} y={-r + 2} text-anchor="middle">
            −
          </text>
        </>
      )}
    </g>
  );
}

export type DialProps = KitProps & {
  /** The needle's pivot, px. */
  at: Pt;
  r?: number;
  value: number;
  max: number;
  /** The unit's letter on the face (A, V, mA). */
  letter: string;
  /** The reading written under the face ("0.25 A"). */
  reading: string;
  ticks?: number;
};

/**
 * An analogue meter: an arc scale from 0 to `max`, a needle at `value` (past the end it pins at the
 * stop, and the reading turns to the wrong colour), the letter in the middle and the reading underneath.
 */
export function Dial({
  at,
  r = 34,
  value,
  max,
  letter,
  reading,
  ticks = 5,
  part,
  class: extra,
}: DialProps): JSX.Element {
  const [x, y] = at;
  const from = Math.PI * 1.15;
  const to = Math.PI * 1.85;
  const angleOf = (v: number) => from + ((to - from) * Math.max(0, Math.min(v, max * 1.04))) / max;
  const on = (a: number, rr: number): Pt => [x + rr * Math.cos(a), y + rr * Math.sin(a)];
  const [ax, ay] = on(from, r - 6);
  const [bx, by] = on(to, r - 6);
  const [nx, ny] = on(angleOf(value), r - 8);
  const isOver = value > max * 1.02;
  return (
    <g class={kitClass("kit-dial", isOver && "is-over", extra)} data-part={part}>
      <rect
        class="kit-dial-case"
        x={x - r}
        y={y - r * 0.95}
        width={2 * r}
        height={r * 1.55}
        rx={8}
      />
      <path class="kit-dial-arc" d={`M${ax} ${ay} A ${r - 6} ${r - 6} 0 0 1 ${bx} ${by}`} />
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const a = from + ((to - from) * i) / ticks;
        const [t1x, t1y] = on(a, r - 6);
        const [t2x, t2y] = on(a, r - 10);
        const [lx, ly] = on(a, r - 16);
        return (
          <g key={i}>
            <line class="kit-dial-tick" x1={t1x} y1={t1y} x2={t2x} y2={t2y} />
            {(i === 0 || i === ticks || 2 * i === ticks) && (
              <text
                class="kit-dial-number"
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
      <line class="kit-dial-needle" x1={x} y1={y + 2} x2={nx} y2={ny} />
      <circle class="kit-dial-pivot" cx={x} cy={y + 2} r={2.5} />
      <text class="kit-dial-letter" x={x} y={y + 16} text-anchor="middle">
        {letter}
      </text>
      <text class="kit-dial-reading" x={x} y={y + r * 0.6 + 14} text-anchor="middle">
        {reading}
      </text>
    </g>
  );
}
