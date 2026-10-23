import { Stage } from "@chalk/draw";
import type { ComponentChildren, JSX } from "preact";
import { useId } from "preact/hooks";

/** Words shown on screen, in both languages. */
export type Words = { readonly en: string; readonly hi: string };
export const say = (locale: string, w: Words): string => (locale === "hi" ? w.hi : w.en);

export type Who = "riya" | "kabir" | "grandpa" | "mom";

/**
 * A picture drawn in its own W × H units, scaled to the width it is given and clipped to rounded
 * corners. Every periodic prop draws inside one of these.
 */
export function Frame({
  w,
  h,
  width,
  label,
  cls,
  children,
}: {
  w: number;
  h: number;
  width: number;
  label: string;
  cls: string;
  children: ComponentChildren;
}): JSX.Element {
  const k = width / w;
  const height = Math.round(h * k);
  const clip = `pt-frame-${useId()}`;
  return (
    <Stage label={label} x={[0, w]} width={width} height={height} svg={{ class: `pt-svg ${cls}` }}>
      <g transform={`scale(${k})`}>
        <clipPath id={clip}>
          <rect x={0} y={0} width={w} height={h} rx={10} />
        </clipPath>
        <g clip-path={`url(#${clip})`}>{children}</g>
      </g>
    </Stage>
  );
}

/** A row of buttons under a picture. */
export function Controls({ children }: { children: ComponentChildren }): JSX.Element {
  return <div class="pt-controls">{children}</div>;
}

/** One button: `isOn` marks the chosen option in a group. */
export function Button({
  label,
  onClick,
  isOn = false,
  part,
  isDisabled = false,
}: {
  label: string;
  onClick: () => void;
  isOn?: boolean;
  part?: string;
  isDisabled?: boolean;
}): JSX.Element {
  return (
    <button
      type="button"
      class={isOn ? "pt-button is-on" : "pt-button"}
      data-part={part}
      aria-pressed={isOn}
      disabled={isDisabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

/** Step dots: which of `count` steps is showing. */
export function Dots({ step, count }: { step: number; count: number }): JSX.Element {
  return (
    <span class="pt-dots" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decoration
        <span key={i} class={i === step ? "pt-dot is-on" : "pt-dot"} />
      ))}
    </span>
  );
}

/** A straight arrow from (x1, y1) to (x2, y2) with a head at the end. */
export function Arrow({
  x1,
  y1,
  x2,
  y2,
  cls = "",
  head = 5,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cls?: string;
  head?: number;
}): JSX.Element {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const p1 = [x2 - head * Math.cos(a - 0.45), y2 - head * Math.sin(a - 0.45)];
  const p2 = [x2 - head * Math.cos(a + 0.45), y2 - head * Math.sin(a + 0.45)];
  return (
    <g class={`pt-arrow ${cls}`}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <path d={`M${x2} ${y2} L${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]} Z`} />
    </g>
  );
}

/** A small text label; `anchor` as in SVG. */
export function Label({
  x,
  y,
  text,
  anchor = "start",
  cls = "",
}: {
  x: number;
  y: number;
  text: string;
  anchor?: "start" | "middle" | "end";
  cls?: string;
}): JSX.Element {
  return (
    <text class={`pt-label ${cls}`} x={x} y={y} text-anchor={anchor}>
      {text}
    </text>
  );
}

/**
 * A person, drawn the way the light and heredity chapters draw the family: feet at (x, y), `s` the
 * scale (1 ≈ 46 units tall for an adult). From the front they have dot eyes; from the back, only
 * hair. `point` raises one arm towards (dx, dy) from the shoulder.
 */
export function Person({
  who,
  x,
  y,
  s = 1,
  back = false,
  point,
  isTired = false,
}: {
  who: Who;
  x: number;
  y: number;
  s?: number;
  back?: boolean;
  point?: [number, number];
  /** An open mouth and sweat drops: out of breath. */
  isTired?: boolean;
}): JSX.Element {
  const isChild = who === "kabir";
  const h = isChild ? 34 : 44;
  const headR = isChild ? 7.5 : 7;
  const bodyW = isChild ? 15 : 17;
  const neck = h - 2 * headR;
  const shirt = `pt-shirt-${who}`;
  const headY = -neck - headR + 1;
  return (
    <g class="pt-person" transform={`translate(${x} ${y}) scale(${s})`}>
      <rect
        class="pt-legs"
        x={-bodyW / 2 + 2}
        y={-neck * 0.42}
        width={bodyW - 4}
        height={neck * 0.42}
        rx={2}
      />
      <rect class={shirt} x={-bodyW / 2} y={-neck} width={bodyW} height={neck * 0.62} rx={6} />
      {point !== undefined && (
        <line
          class={`pt-arm ${shirt}-line`}
          x1={bodyW / 2 - 3}
          y1={-neck + 5}
          x2={bodyW / 2 - 3 + point[0]}
          y2={-neck + 5 + point[1]}
        />
      )}
      {who === "riya" && (
        <path
          class="pt-hair"
          d={`M${back ? 0 : -headR + 1} ${headY - 2} q ${back ? 2 : -6} 6 ${back ? -1 : -5} 14`}
          stroke-width={5}
          fill="none"
        />
      )}
      {who === "mom" && <circle class="pt-hair-fill" cx={0} cy={headY - headR + 1} r={4.5} />}
      <circle class="pt-skin" cx={0} cy={headY} r={headR} />
      {(who === "riya" || who === "mom") && (
        <path
          class="pt-hair-fill"
          d={`M${-headR} ${headY} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} ${who === "mom" ? -2 : -3} -${2 * headR} 0 z`}
        />
      )}
      {who === "grandpa" && (
        <path
          class="pt-hair-grey"
          d={`M${-headR} ${headY - 1} a ${headR} ${headR} 0 0 1 ${2 * headR} 0 q -${headR} 2 -${2 * headR} 0 z`}
        />
      )}
      {who === "kabir" && (
        <g>
          <path
            class="pt-cap"
            d={`M${-headR - 0.5} ${headY - 1} a ${headR + 0.5} ${headR + 0.5} 0 0 1 ${2 * headR + 1} 0 z`}
          />
          {!back && (
            <rect class="pt-cap" x={0} y={headY - 2.5} width={headR + 5} height={2.5} rx={1.2} />
          )}
        </g>
      )}
      {back && (who === "riya" || who === "mom") && (
        <circle class="pt-hair-fill" cx={0} cy={headY} r={headR - 0.5} />
      )}
      {back && who === "grandpa" && (
        <circle class="pt-hair-grey" cx={0} cy={headY - 1} r={headR - 1} />
      )}
      {!back && (
        <g class="pt-face">
          <circle cx={-2.6} cy={headY + 0.5} r={0.9} />
          <circle cx={2.6} cy={headY + 0.5} r={0.9} />
          {isTired ? (
            <ellipse cx={0} cy={headY + 3.8} rx={1.6} ry={1.4} />
          ) : (
            <path d={`M-2 ${headY + 3.4} q 2 1.6 4 0`} fill="none" />
          )}
        </g>
      )}
      {isTired && (
        <g class="pt-sweat">
          <path d={`M${headR + 2} ${headY - 3} q 1.5 2.5 0 3.5 q -1.5 -1 0 -3.5 z`} />
          <path d={`M${-headR - 2} ${headY + 1} q 1.5 2.5 0 3.5 q -1.5 -1 0 -3.5 z`} />
        </g>
      )}
      {!back && who === "grandpa" && (
        <g class="pt-specs">
          <circle cx={-2.8} cy={headY + 0.4} r={2.2} />
          <circle cx={2.8} cy={headY + 0.4} r={2.2} />
          <line x1={-0.6} y1={headY + 0.4} x2={0.6} y2={headY + 0.4} />
        </g>
      )}
    </g>
  );
}

/**
 * What makes a part of a picture tappable: a button role, keyboard focus, and Enter/Space doing
 * the same as a tap. Nothing when `isOn` is false.
 */
export function tappable(
  isOn: boolean,
  onTap: () => void,
  label: string,
): JSX.SVGAttributes<SVGGElement> {
  if (!isOn) return {};
  return {
    role: "button",
    tabIndex: 0,
    "aria-label": label,
    onClick: onTap,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onTap();
      }
    },
  };
}

/** 0, 1, …, n − 1: for drawing a fixed number of things (keys from the value, not an index). */
export const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i);
