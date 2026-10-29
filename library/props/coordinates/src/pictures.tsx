import type { JSX } from "preact";
import { PlaceKind } from "./places";

/**
 * The small pictures drawn at points: a house, a desk, a crossing, a stall, Riya, a counter. Each
 * is drawn centred on (0, 0) at `size` px across; the caller moves it to its point.
 */

/** A house: a square with a roof and a door. */
function House({ size }: { size: number }): JSX.Element {
  const h = size / 2;
  return (
    <>
      <path class="cp-house-roof" d={`M ${-h} ${-h * 0.1} L 0 ${-h} L ${h} ${-h * 0.1} Z`} />
      <rect class="cp-house-wall" x={-h * 0.78} y={-h * 0.1} width={h * 1.56} height={h * 1.0} />
      <rect class="cp-house-door" x={-h * 0.18} y={h * 0.35} width={h * 0.36} height={h * 0.55} />
    </>
  );
}

/** A desk seen from above: a top with a chair behind it. */
function Desk({ size }: { size: number }): JSX.Element {
  const h = size / 2;
  return (
    <>
      <rect
        class="cp-desk-chair"
        x={-h * 0.4}
        y={h * 0.25}
        width={h * 0.8}
        height={h * 0.55}
        rx={2}
      />
      <rect class="cp-desk-top" x={-h * 0.9} y={-h * 0.6} width={h * 1.8} height={h * 0.8} rx={2} />
    </>
  );
}

/** A crossing: where a street meets an avenue. */
function Crossing({ size }: { size: number }): JSX.Element {
  return <circle class="cp-crossing" r={size * 0.28} />;
}

/** A stall: a striped awning over a counter. */
function Stall({ size }: { size: number }): JSX.Element {
  const h = size / 2;
  return (
    <>
      <rect class="cp-stall-counter" x={-h * 0.8} y={-h * 0.05} width={h * 1.6} height={h * 0.8} />
      <path
        class="cp-stall-awning"
        d={`M ${-h} ${-h * 0.05} L ${-h * 0.8} ${-h * 0.8} L ${h * 0.8} ${-h * 0.8} L ${h} ${-h * 0.05} Z`}
      />
      <path
        class="cp-stall-stripe"
        d={`M ${-h * 0.3} ${-h * 0.8} L ${-h * 0.35} ${-h * 0.05} M ${h * 0.3} ${-h * 0.8} L ${h * 0.35} ${-h * 0.05}`}
      />
    </>
  );
}

export function PlacePicture({ kind, size }: { kind: PlaceKind; size: number }): JSX.Element {
  switch (kind) {
    case PlaceKind.Desk:
      return <Desk size={size} />;
    case PlaceKind.Crossing:
      return <Crossing size={size} />;
    case PlaceKind.Stall:
      return <Stall size={size} />;
    default:
      return <House size={size} />;
  }
}

/** A person standing, seen from the front: Riya, the walker. */
export function Walker({ size }: { size: number }): JSX.Element {
  const h = size / 2;
  return (
    <>
      <path
        class="cp-walker-body"
        d={`M ${-h * 0.45} ${h * 0.9} L ${-h * 0.3} ${-h * 0.15} Q 0 ${-h * 0.4} ${h * 0.3} ${-h * 0.15} L ${h * 0.45} ${h * 0.9} Z`}
      />
      <circle class="cp-walker-head" cy={-h * 0.55} r={h * 0.32} />
    </>
  );
}

/** A bus, seen from the side: a body with windows and two wheels, its front to the right. */
export function Bus({ size }: { size: number }): JSX.Element {
  const h = size / 2;
  return (
    <>
      <rect
        class="cp-bus-body"
        x={-h * 1.1}
        y={-h * 0.55}
        width={h * 2.2}
        height={h * 1.05}
        rx={h * 0.22}
      />
      {[-0.75, -0.25, 0.25].map((x) => (
        <rect
          key={x}
          class="cp-bus-window"
          x={h * x}
          y={-h * 0.38}
          width={h * 0.38}
          height={h * 0.34}
          rx={2}
        />
      ))}
      <circle class="cp-bus-wheel" cx={-h * 0.6} cy={h * 0.5} r={h * 0.22} />
      <circle class="cp-bus-wheel" cx={h * 0.6} cy={h * 0.5} r={h * 0.22} />
    </>
  );
}

/** A player's counter: a coin with the player's initial. */
export function Counter({
  size,
  initial,
  tone,
}: {
  size: number;
  initial: string;
  tone: "a" | "b";
}): JSX.Element {
  return (
    <g class={`cp-counter is-${tone}`}>
      <circle r={size / 2} />
      <text text-anchor="middle" dominant-baseline="central">
        {initial}
      </text>
    </g>
  );
}
