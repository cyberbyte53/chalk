/** @jsxImportSource preact */
import type { ComponentChildren, JSX } from "preact";
import { type KitProps, kitClass } from "./kit";

/**
 * Labware, in px: test tube, beaker, conical flask, spirit lamp, Bunsen burner, tripod with a china
 * dish, and rising bubbles. Stateless. What is inside a vessel is filled with `liquid`, a class of
 * the caller's (a substance or indicator colour from its own tokens); `children` draw inside the
 * vessel, above the liquid and under the glass (a precipitate, bubbles, a nail).
 */

export type VesselProps = KitProps & {
  /** The vessel's centre line, px. */
  x: number;
  /** Its mouth, px from the top. */
  top: number;
  /** Its base, px from the top. */
  bottom: number;
  /** The liquid's surface, px from the top; no liquid when left out. */
  level?: number;
  /** The class the liquid is filled with (default `kit-liquid`, a pale water). */
  liquid?: string;
  children?: ComponentChildren;
};

/** A test tube's outline: open at `top`, its round bottom touching `bottom`. */
export function tubePath(x: number, top: number, bottom: number, w: number): string {
  const r = w / 2;
  return `M${x - r} ${top} V${bottom - r} A${r} ${r} 0 0 0 ${x + r} ${bottom - r} V${top}`;
}

/** What fills a tube from `level` down, 2 px inside the glass. */
export function tubeFillPath(x: number, level: number, bottom: number, w: number): string {
  const r = w / 2 - 2;
  return `M${x - r} ${level} V${bottom - r - 2} A${r} ${r} 0 0 0 ${x + r} ${bottom - r - 2} V${level} Z`;
}

/** The surface of a tube filled to `fraction` (0–1) of its straight part, px: 0 leaves just the round bottom full. */
export function tubeLevel(top: number, bottom: number, w: number, fraction: number): number {
  const r = w / 2;
  return bottom - (bottom - top - r) * fraction - r;
}

export type TestTubeProps = VesselProps & {
  w?: number;
  /** The lip across its mouth. */
  hasRim?: boolean;
  /** A cork in its mouth. */
  hasCork?: boolean;
};

/** A test tube, open at the top, with a lip, filled to `level`. */
export function TestTube({
  x,
  top,
  bottom,
  w = 24,
  level,
  liquid = "kit-liquid",
  hasRim = true,
  hasCork = false,
  children,
  part,
  class: extra,
}: TestTubeProps): JSX.Element {
  return (
    <g class={kitClass("kit-test-tube", extra)} data-part={part}>
      {level !== undefined && level < bottom && (
        <path class={liquid} d={tubeFillPath(x, level, bottom, w)} />
      )}
      {children}
      <path class="kit-glass" d={tubePath(x, top, bottom, w)} />
      {hasRim && <line class="kit-glass" x1={x - w / 2 - 3} y1={top} x2={x + w / 2 + 3} y2={top} />}
      {hasCork && (
        <rect class="kit-cork" x={x - w / 2 - 1} y={top - 10} width={w + 2} height={12} rx={2} />
      )}
    </g>
  );
}

export type BeakerProps = VesselProps & { w: number };

/** A beaker `w` wide, with a lip at the top left and rounded bottom corners. */
export function Beaker({
  x,
  top,
  bottom,
  w,
  level,
  liquid = "kit-liquid",
  children,
  part,
  class: extra,
}: BeakerProps): JSX.Element {
  const l = x - w / 2;
  const r = x + w / 2;
  return (
    <g class={kitClass("kit-beaker", extra)} data-part={part}>
      {level !== undefined && (
        <path
          class={liquid}
          d={`M${l + 2} ${level} V${bottom - 4} q 0 2 4 2 H${r - 6} q 4 0 4 -2 V${level} Z`}
        />
      )}
      {children}
      <path
        class="kit-glass"
        d={`M${l - 3} ${top} q 3 0 3 4 V${bottom - 4} q 0 4 4 4 H${r - 4} q 4 0 4 -4 V${top}`}
      />
    </g>
  );
}

export type FlaskProps = VesselProps & {
  /** The base's width, px. */
  w: number;
  /** Half the neck's width, px. */
  neck?: number;
};

/** A conical (Erlenmeyer) flask: a straight neck, then sloping sides to a flat base `w` wide. */
export function ConicalFlask({
  x,
  top,
  bottom,
  w,
  neck = 9,
  level,
  liquid = "kit-liquid",
  children,
  part,
  class: extra,
}: FlaskProps): JSX.Element {
  const shoulder = top + (bottom - top) * 0.32;
  const half = (y: number) =>
    y <= shoulder ? neck : neck + ((w / 2 - neck) * (y - shoulder)) / (bottom - shoulder);
  const body = `M${x - neck} ${top} V${shoulder} L${x - w / 2} ${bottom - 3} q 0 3 3 3 H${x + w / 2 - 3} q 3 0 3 -3 L${x + neck} ${shoulder} V${top}`;
  return (
    <g class={kitClass("kit-flask", extra)} data-part={part}>
      {level !== undefined && (
        <path
          class={liquid}
          d={`M${x - half(level) + 1.5} ${level} L${x - w / 2 + 2} ${bottom - 2} H${x + w / 2 - 2} L${x + half(level) - 1.5} ${level} Z`}
        />
      )}
      {children}
      <path class="kit-glass" d={body} />
    </g>
  );
}

export type LampProps = KitProps & {
  x: number;
  /** The bench it stands on, px from the top. */
  table: number;
  isLit?: boolean;
  /** A wick showing between the neck and the flame. */
  hasWick?: boolean;
  /** Scale about its foot (1: 36 px wide, flame tip 58 px above the table). */
  size?: number;
};

/** A spirit lamp standing on the table, lit or not; its flame flickers (held still under reduced motion). */
export function SpiritLamp({
  x,
  table,
  isLit = true,
  hasWick = false,
  size = 1,
  part,
  class: extra,
}: LampProps): JSX.Element {
  return (
    <g
      class={kitClass("kit-lamp", isLit && "is-lit", extra)}
      data-part={part}
      transform={
        size === 1 ? `translate(${x} ${table})` : `translate(${x} ${table}) scale(${size})`
      }
    >
      <path class="kit-lamp-body" d="M-18 0 q 0 -24 18 -26 q 18 2 18 26 z" />
      <rect class="kit-lamp-neck" x={-4.5} y={-34} width={9} height={8} rx={2} />
      {hasWick && <line class="kit-wick" x1={0} y1={-34} x2={0} y2={-38} />}
      {isLit && (
        <g>
          <path class="kit-flame kit-flicker" d="M0 -58 q 8 11 5 17 q -5 5 -10 0 q -3 -6 5 -17 z" />
          <path class="kit-flame-core" d="M0 -49 q 3.5 5 2.5 8 q -2.5 2.5 -5 0 q -1 -3 2.5 -8 z" />
        </g>
      )}
    </g>
  );
}

/** A Bunsen burner's flame. */
export const FlameKind = {
  None: "none",
  /** Air hole open: a blue flame with a pale core. */
  Clean: "clean",
  /** Air hole shut: a yellow, sooty flame with smoke. */
  Sooty: "sooty",
} as const;
export type FlameKind = (typeof FlameKind)[keyof typeof FlameKind];

export type FlameProps = KitProps & {
  /** The flame's foot, px. */
  x: number;
  y: number;
  kind: FlameKind;
  /** 1: 40 px tall, 24 px wide. */
  size?: number;
};

/** A burner's flame standing on (x, y): blue with a core (clean) or yellow with smoke (sooty). */
export function Flame({
  x,
  y,
  kind,
  size = 1,
  part,
  class: extra,
}: FlameProps): JSX.Element | null {
  if (kind === FlameKind.None) return null;
  const h = 40 * size;
  const w = 12 * size;
  const d = `M${x} ${y - h} C ${x + w} ${y - h * 0.5}, ${x + w} ${y}, ${x} ${y} C ${x - w} ${y}, ${x - w} ${y - h * 0.5}, ${x} ${y - h} Z`;
  return (
    <g class={kitClass("kit-burner-flame", `is-${kind}`, extra)} data-part={part}>
      <path d={d} />
      {kind === FlameKind.Clean && (
        <path
          class="kit-burner-flame-core"
          d={`M${x} ${y - h * 0.5} C ${x + w * 0.45} ${y - h * 0.25}, ${x + w * 0.45} ${y}, ${x} ${y} C ${x - w * 0.45} ${y}, ${x - w * 0.45} ${y - h * 0.25}, ${x} ${y - h * 0.5} Z`}
        />
      )}
      {kind === FlameKind.Sooty && (
        <g class="kit-smoke">
          <path d={`M${x} ${y - h - 2} q -8 -10 0 -18 q 8 -8 0 -18`} />
          <path d={`M${x + 6} ${y - h} q 6 -10 -1 -18`} />
        </g>
      )}
    </g>
  );
}

export type BurnerProps = KitProps & {
  x: number;
  table: number;
  /** Its flame; `None` for an unlit burner. */
  flame?: FlameKind;
  /** The air hole at the barrel's foot, open or shut. */
  isAirOpen?: boolean;
};

/** A Bunsen burner on the table: base, barrel (70 px tall) with its air hole, and its flame. */
export function Burner({
  x,
  table,
  flame = FlameKind.None,
  isAirOpen = false,
  part,
  class: extra,
}: BurnerProps): JSX.Element {
  return (
    <g class={kitClass("kit-burner", extra)} data-part={part}>
      <rect class="kit-burner-metal" x={x - 28} y={table - 10} width={56} height={10} rx={3} />
      <rect class="kit-burner-metal" x={x - 8} y={table - 70} width={16} height={60} rx={2} />
      <circle
        class={isAirOpen ? "kit-airhole is-open" : "kit-airhole"}
        cx={x}
        cy={table - 24}
        r={5}
      />
      <Flame x={x} y={table - 70} kind={flame} size={1.5} />
    </g>
  );
}

export type TripodProps = KitProps & {
  x: number;
  table: number;
  /** Its top, px from the top (default 74 px above the table, over a spirit lamp). */
  top?: number;
  /** A china dish sits on it. */
  hasDish?: boolean;
  /** What is in the dish, or on the tripod, drawn last. */
  children?: ComponentChildren;
};

/** A tripod stand on the table, with a china dish on top if asked. */
export function Tripod({
  x,
  table,
  top = table - 74,
  hasDish = false,
  children,
  part,
  class: extra,
}: TripodProps): JSX.Element {
  return (
    <g class={kitClass("kit-tripod", extra)} data-part={part}>
      <line class="kit-stand" x1={x - 34} y1={table} x2={x - 28} y2={top} />
      <line class="kit-stand" x1={x + 34} y1={table} x2={x + 28} y2={top} />
      <line class="kit-stand" x1={x - 36} y1={top} x2={x + 36} y2={top} />
      {hasDish && <path class="kit-dish" d={`M${x - 34} ${top - 12} q 34 26 68 0 z`} />}
      {children}
    </g>
  );
}

export type BubblesProps = KitProps & {
  /** Where they start, px. */
  x: number;
  y: number;
  /** How far they rise before fading, px. */
  height: number;
  count?: number;
  /** How far either side of x they start, px. */
  spread?: number;
};

/** Bubbles rising from (x, y) and fading, staggered (held still under reduced motion). */
export function Bubbles({
  x,
  y,
  height,
  count = 5,
  spread = 8,
  part,
  class: extra,
}: BubblesProps): JSX.Element {
  return (
    <g class={kitClass("kit-bubbles", extra)} data-part={part}>
      {Array.from({ length: count }, (_, i) => {
        const dx = ((i * 37) % (2 * spread + 1)) - spread;
        // Custom properties (--rise) are not in Preact's CSS types.
        const style = {
          "--rise": `${-height}px`,
          animationDelay: `${(i * 0.37) % 1.6}s`,
        } as JSX.CSSProperties;
        return (
          <circle
            // biome-ignore lint/suspicious/noArrayIndexKey: the bubbles are identical and never reorder
            key={i}
            class="kit-bubble"
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
