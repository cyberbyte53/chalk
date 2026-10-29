/** @jsxImportSource preact */
import type { JSX } from "preact";
import { type KitProps, kitClass } from "./kit";
import type { Pt } from "./labels";
import { Arrowhead, type ArrowheadShape, HEAD_TIP } from "./marks";

/**
 * Ray-diagram pieces, in px: the object and image arrows, a ray with its mid-arrow, the principal
 * axis and the named points on it (O, F, 2F, P, C). Stateless.
 */

/** What an upright arrow on the axis stands for. */
export const OpticArrowKind = { Object: "object", Image: "image" } as const;
export type OpticArrowKind = (typeof OpticArrowKind)[keyof typeof OpticArrowKind];

export type OpticArrowProps = KitProps & {
  /** Where it stands on the axis, px. */
  foot: Pt;
  /** Its tip, px (above the axis upright, below it inverted). */
  tip: Pt;
  kind?: OpticArrowKind;
  /** A virtual image: drawn dashed. */
  isVirtual?: boolean;
};

/** An object or image: a thick line from the axis with an arrowhead at its tip. */
export function OpticArrow({
  foot,
  tip,
  kind = OpticArrowKind.Object,
  isVirtual = false,
  part,
  class: extra,
}: OpticArrowProps): JSX.Element {
  return (
    <g
      class={kitClass("kit-optic-arrow", `is-${kind}`, isVirtual && "is-virtual", extra)}
      data-part={part}
    >
      <line x1={foot[0]} y1={foot[1]} x2={tip[0]} y2={tip[1]} />
      <Arrowhead at={tip} toward={[tip[0] - foot[0], tip[1] - foot[1]]} />
    </g>
  );
}

export type RayProps = KitProps & {
  from: Pt;
  to: Pt;
  /** How far along the arrowhead sits (0–1). */
  at?: number;
  /** A ray extended back behind a mirror or lens: thin, faint and dashed. */
  isDashed?: boolean;
  /** Whether it carries an arrowhead; by default a solid ray does and a dashed one doesn't. */
  hasHead?: boolean;
  head?: ArrowheadShape;
};

/** A straight piece of ray, with an arrowhead part way along showing which way the light goes. */
export function Ray({
  from,
  to,
  at = 0.55,
  isDashed = false,
  hasHead = !isDashed,
  head = HEAD_TIP,
  part,
  class: extra,
}: RayProps): JSX.Element {
  const [x1, y1] = from;
  const [x2, y2] = to;
  return (
    <g class={kitClass("kit-ray", isDashed && "is-dashed", extra)} data-part={part}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      {hasHead && (
        <Arrowhead
          at={[x1 + (x2 - x1) * at, y1 + (y2 - y1) * at]}
          toward={[x2 - x1, y2 - y1]}
          shape={head}
        />
      )}
    </g>
  );
}

export type PrincipalAxisProps = KitProps & { from: Pt; to: Pt };

/** The principal axis: a thin line through the pole or optical centre. */
export function PrincipalAxis({ from, to, part, class: extra }: PrincipalAxisProps): JSX.Element {
  return (
    <line
      class={kitClass("kit-principal-axis", extra)}
      data-part={part}
      x1={from[0]}
      y1={from[1]}
      x2={to[0]}
      y2={to[1]}
    />
  );
}

export type OpticPointProps = KitProps & {
  at: Pt;
  /** Its name (F, 2F, C, O, P), written under it. */
  label?: string;
  /** How far below the point the name's baseline sits, px. */
  labelGap?: number;
  r?: number;
};

/** A named point on the axis: the focus, the centre of curvature, the pole or the optical centre. */
export function OpticPoint({
  at,
  label,
  labelGap = 18,
  r = 3.5,
  part,
  class: extra,
}: OpticPointProps): JSX.Element {
  return (
    <g class={kitClass("kit-optic-point", extra)} data-part={part}>
      <circle cx={at[0]} cy={at[1]} r={r} />
      {label !== undefined && (
        <text x={at[0]} y={at[1] + labelGap} text-anchor="middle">
          {label}
        </text>
      )}
    </g>
  );
}
