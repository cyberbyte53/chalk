import type { JSX } from "preact";
import { type Hue, subscripted } from "./acid-data";
import { type Words, range, say } from "./words";

/** Pieces shared by the acids, bases and salts props: glassware, a lamp, a candle, bubbles. */

/** The CSS class that fills with an indicator hue. */
export const hueClass = (hue: Hue): string => `ac-hue-${hue}`;
/** The CSS class that fills with the universal indicator's colour for a pH band 0–14. */
export const phClass = (band: number): string => `ac-ph-${Math.max(0, Math.min(14, band))}`;

/** A test tube: open at `top`, round bottom at `bottom`, centred on x. */
export function tubePath(x: number, top: number, bottom: number, w: number): string {
  const r = w / 2;
  return `M${x - r} ${top} V${bottom - r} A${r} ${r} 0 0 0 ${x + r} ${bottom - r} V${top}`;
}

/** What is inside a tube, from `level` down. */
export function tubeFill(x: number, level: number, bottom: number, w: number): string {
  const r = w / 2 - 2;
  return `M${x - r} ${level} V${bottom - r - 2} A${r} ${r} 0 0 0 ${x + r} ${bottom - r - 2} V${level} Z`;
}

export function Tube({
  x,
  top,
  bottom,
  w = 24,
  fill,
  level,
}: {
  x: number;
  top: number;
  bottom: number;
  w?: number;
  /** Class for what is inside (a hue or a substance class). */
  fill?: string;
  level?: number;
}): JSX.Element {
  return (
    <g>
      {fill !== undefined && (
        <path class={fill} d={tubeFill(x, level ?? (top + bottom) / 2, bottom, w)} />
      )}
      <path class="ac-glass" d={tubePath(x, top, bottom, w)} />
      <line class="ac-glass" x1={x - w / 2 - 3} y1={top} x2={x + w / 2 + 3} y2={top} />
    </g>
  );
}

/** A beaker, `w` wide, from `top` to `bottom`, filled to `level` with `fill`. */
export function Beaker({
  x,
  top,
  bottom,
  w,
  fill,
  level,
}: {
  x: number;
  top: number;
  bottom: number;
  w: number;
  fill?: string;
  level?: number;
}): JSX.Element {
  const l = x - w / 2;
  const r = x + w / 2;
  return (
    <g>
      {fill !== undefined && level !== undefined && (
        <path
          class={fill}
          d={`M${l + 2} ${level} V${bottom - 4} q 0 2 4 2 H${r - 6} q 4 0 4 -2 V${level} Z`}
        />
      )}
      <path
        class="ac-glass"
        d={`M${l - 3} ${top} q 3 0 3 4 V${bottom - 4} q 0 4 4 4 H${r - 4} q 4 0 4 -4 V${top}`}
      />
    </g>
  );
}

/** A conical flask, its base `w` wide at `bottom`, neck at `top`. */
export function Flask({
  x,
  top,
  bottom,
  w,
  fill,
  level,
}: {
  x: number;
  top: number;
  bottom: number;
  w: number;
  fill?: string;
  /** Liquid surface (y); the flask's wall sets its width there. */
  level?: number;
}): JSX.Element {
  const neck = 9;
  const shoulder = top + (bottom - top) * 0.32;
  const half = (y: number) =>
    y <= shoulder ? neck : neck + ((w / 2 - neck) * (y - shoulder)) / (bottom - shoulder);
  const body = `M${x - neck} ${top} V${shoulder} L${x - w / 2} ${bottom - 3} q 0 3 3 3 H${x + w / 2 - 3} q 3 0 3 -3 L${x + neck} ${shoulder} V${top}`;
  return (
    <g>
      {fill !== undefined && level !== undefined && (
        <path
          class={fill}
          d={`M${x - half(level) + 1.5} ${level} L${x - w / 2 + 2} ${bottom - 2} H${x + w / 2 - 2} L${x + half(level) - 1.5} ${level} Z`}
        />
      )}
      <path class="ac-glass" d={body} />
    </g>
  );
}

/** A spirit lamp standing on `table`, its flame's tip at table − 58. */
export function Lamp({
  x,
  table,
  lit = true,
}: { x: number; table: number; lit?: boolean }): JSX.Element {
  return (
    <g>
      <path class="ac-lamp" d={`M${x - 18} ${table} q 0 -24 18 -26 q 18 2 18 26 z`} />
      <rect class="ac-lamp-neck" x={x - 4.5} y={table - 34} width={9} height={8} rx={2} />
      {lit && (
        <g>
          <path
            class="ac-flame ac-flicker"
            d={`M${x} ${table - 58} q 8 11 5 17 q -5 5 -10 0 q -3 -6 5 -17 z`}
          />
          <path
            class="ac-flame-core"
            d={`M${x} ${table - 49} q 3.5 5 2.5 8 q -2.5 2.5 -5 0 q -1 -3 2.5 -8 z`}
          />
        </g>
      )}
    </g>
  );
}

/** A candle with its flame (or put out, with a curl of smoke). */
export function Candle({
  x,
  table,
  state,
}: {
  x: number;
  table: number;
  state: "burning" | "out" | "pop" | "brighter";
}): JSX.Element {
  const top = table - 34;
  return (
    <g>
      <rect class="ac-candle" x={x - 5} y={top} width={10} height={34} rx={2} />
      <line class="ac-wick" x1={x} y1={top} x2={x} y2={top - 4} />
      {state === "out" ? (
        <path class="ac-smoke" d={`M${x} ${top - 6} q 4 -6 0 -12 q -4 -6 0 -12`} />
      ) : (
        <path
          class={state === "brighter" ? "ac-flame is-bright" : "ac-flame ac-flicker"}
          d={`M${x} ${top - 20} q 6 9 4 14 q -4 4 -8 0 q -2 -5 4 -14 z`}
        />
      )}
      {state === "pop" && (
        <g class="ac-pop">
          <path
            d={`M${x - 16} ${top - 18} l -6 -4 M${x + 16} ${top - 18} l 6 -4 M${x} ${top - 32} v -7`}
          />
        </g>
      )}
    </g>
  );
}

/** Bubbles rising from (x, y) through `height`, `n` of them, staggered. */
export function Bubbles({
  x,
  y,
  height,
  n = 5,
  spread = 8,
  cls = "ac-bubble",
}: {
  x: number;
  y: number;
  height: number;
  n?: number;
  spread?: number;
  cls?: string;
}): JSX.Element {
  return (
    <g class="ac-bubbles">
      {range(n).map((i) => {
        const dx = ((i * 37) % (2 * spread + 1)) - spread;
        const style = {
          "--rise": `${-height}px`,
          animationDelay: `${(i * 0.37) % 1.6}s`,
        } as JSX.CSSProperties;
        return (
          <circle
            key={i}
            class={cls}
            cx={x + dx}
            cy={y - ((i * 13) % Math.max(1, height - 4))}
            r={1.6 + (i % 3) * 0.6}
            style={style}
          />
        );
      })}
    </g>
  );
}

/** Text that writes a formula with subscript digits. */
export function Formula({
  x,
  y,
  formula,
  cls = "ac-formula",
  anchor = "middle",
}: {
  x: number;
  y: number;
  formula: string;
  cls?: string;
  anchor?: "start" | "middle" | "end";
}): JSX.Element {
  return (
    <text class={cls} x={x} y={y} text-anchor={anchor}>
      {subscripted(formula)}
    </text>
  );
}

/** A row of choice buttons under a picture (one is pressed). */
export function Chips<T extends string>({
  options,
  chosen,
  label,
  onChoose,
  locale,
  part,
  swatch,
}: {
  options: readonly { id: T; words: Words }[];
  chosen: T | null;
  label: Words;
  onChoose: (id: T) => void;
  locale: string;
  part?: string;
  /** A colour class shown as a small dot on each chip. */
  swatch?: (id: T) => string | null;
}): JSX.Element {
  return (
    <fieldset class="ac-chips" data-part={part}>
      <legend class="ac-chips-label">{say(locale, label)}</legend>
      {options.map((o) => {
        const dot = swatch?.(o.id) ?? null;
        return (
          <button
            key={o.id}
            type="button"
            class={o.id === chosen ? "ac-chip is-on" : "ac-chip"}
            aria-pressed={o.id === chosen}
            onClick={() => onChoose(o.id)}
          >
            {dot !== null && (
              <svg class="ac-chip-dot" viewBox="0 0 10 10" aria-hidden="true">
                <circle class={dot} cx={5} cy={5} r={4.5} />
              </svg>
            )}
            {say(locale, o.words)}
          </button>
        );
      })}
    </fieldset>
  );
}

/** A plain action button under a picture. */
export function ActionButton({
  words,
  onPress,
  locale,
  isMain = true,
  part,
}: {
  words: Words;
  onPress: () => void;
  locale: string;
  isMain?: boolean;
  part?: string;
}): JSX.Element {
  return (
    <button
      type="button"
      class={isMain ? "ac-button" : "ac-button is-quiet"}
      data-part={part}
      onClick={onPress}
    >
      {say(locale, words)}
    </button>
  );
}
