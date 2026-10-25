import { type PropViewProps, useFrame } from "@chalk/player";
import type { JSX } from "preact";
import { CardCover, GlassKind } from "./lens-parts";

/** Half the lens's thickness at its thick part, px. */
export const THICK = 9;
/** Half the lens's thickness at its thin part, px. */
const THIN = 2.5;

type Kind = (typeof GlassKind)[keyof typeof GlassKind];

/** The lens's outline: two arcs, thick in the middle (convex) or at the edges (concave). */
function lensPath(kind: Kind, cx: number, top: number, bottom: number): string {
  const mid = (top + bottom) / 2;
  if (kind === GlassKind.Convex)
    return `M${cx} ${top} Q${cx + 2 * THICK} ${mid} ${cx} ${bottom} Q${cx - 2 * THICK} ${mid} ${cx} ${top} Z`;
  const bulge = 2 * (THICK - THIN);
  return `M${cx - THICK} ${top} L${cx + THICK} ${top} Q${cx + THICK - bulge} ${mid} ${cx + THICK} ${bottom} L${cx - THICK} ${bottom} Q${cx - THICK + bulge} ${mid} ${cx - THICK} ${top} Z`;
}

/**
 * How far each sphere's centre sits from the lens's face, px: as far as fits on the stage (`room`
 * from O to the nearer edge), so the centres show, but not so close the lens gets absurdly fat.
 */
function sphereGap(kind: Kind, c: number, room: number): number {
  const want = Math.max(1.2 * c, Math.min(room, 2.6 * c));
  if (kind === GlassKind.Convex) return want;
  // A concave lens's faces stand apart by the hollow's depth, which eats into the room.
  const hollow = Math.hypot(want, c) - want + THIN;
  return Math.max(1.2 * c, Math.min(want, room - hollow));
}

/** The lens drawn from two pieces of spheres of radius r px whose centres sit d px either side. */
function sphericalLens(kind: Kind, cx: number, top: number, bottom: number, d: number) {
  const c = (bottom - top) / 2;
  const r = Math.hypot(d, c);
  const sag = r - d;
  if (kind === GlassKind.Convex)
    return {
      path: `M${cx} ${top} A${r} ${r} 0 0 1 ${cx} ${bottom} A${r} ${r} 0 0 1 ${cx} ${top} Z`,
      r,
      left: cx - d,
      right: cx + d,
    };
  const edge = sag + THIN;
  return {
    path: `M${cx - edge} ${top} L${cx + edge} ${top} A${r} ${r} 0 0 0 ${cx + edge} ${bottom} L${cx - edge} ${bottom} A${r} ${r} 0 0 0 ${cx - edge} ${top} Z`,
    r,
    left: cx - edge - d,
    right: cx + edge + d,
  };
}

export function ThinLensView({ view }: PropViewProps): JSX.Element | null {
  const s = view as unknown as { kind: Kind; aperture: number; showCentres: boolean };
  const frame = useFrame();
  if (frame === null) return null;
  const { width } = frame.px;
  const [cx, top] = frame.px.toPx(0, s.aperture);
  const [, bottom] = frame.px.toPx(0, -s.aperture);
  const [, mid] = frame.px.toPx(0, 0);
  const spheres = s.showCentres
    ? sphericalLens(
        s.kind,
        cx,
        top,
        bottom,
        sphereGap(s.kind, (bottom - top) / 2, Math.min(cx, width - cx) - 22),
      )
    : null;
  return (
    <g>
      {spheres !== null && (
        <g class="ln-spheres">
          {(
            [
              [spheres.left, "C₁", "c1"],
              [spheres.right, "C₂", "c2"],
            ] as const
          ).map(([x, name, id]) => (
            <g key={name} data-part={id}>
              <circle class="ln-sphere" cx={x} cy={mid} r={spheres.r} />
              <circle class="ln-sphere-centre" cx={x} cy={mid} r={3} />
              <text class="ln-sphere-name" x={x} y={mid - 9} text-anchor="middle">
                {name}
              </text>
            </g>
          ))}
        </g>
      )}
      <path
        class="ln-glass"
        data-part="lens"
        d={spheres !== null ? spheres.path : lensPath(s.kind, cx, top, bottom)}
      />
    </g>
  );
}

export function LensCardView({ view }: PropViewProps): JSX.Element | null {
  const s = view as unknown as { cover: string; aperture: number };
  const frame = useFrame();
  if (frame === null || s.cover === CardCover.None) return null;
  const [cx, top] = frame.px.toPx(0, s.aperture);
  const [, bottom] = frame.px.toPx(0, -s.aperture);
  const [, mid] = frame.px.toPx(0, 0);
  const [y0, y1] = s.cover === CardCover.Top ? [top - 4, mid] : [mid, bottom + 4];
  return (
    <rect
      class="ln-card"
      data-part="card"
      x={cx - THICK - 4}
      y={y0}
      width={2 * THICK + 8}
      height={y1 - y0}
      rx={2}
    />
  );
}
