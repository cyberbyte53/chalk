import type { Pt } from "./point";

/**
 * What every drawing-kit piece (lab, marks, optics, circuit) takes besides its geometry. Kit pieces
 * are stateless, take positions in px (a caller converts with its own frame or the stage's scales),
 * and are coloured only by their `kit-*` classes in styles.css.
 */
export type KitProps = {
  /** The name it is pointed at by: becomes `data-part` on the piece's root. */
  part?: string;
  /** Extra classes on the root, for a prop to restyle the piece from its own tokens. */
  class?: string;
};

/** Class names joined, the empty ones left out. */
export function kitClass(...names: (string | false | null | undefined)[]): string {
  return names.filter((n) => typeof n === "string" && n !== "").join(" ");
}

/** A number rounded for a path, as the copies the kit replaces wrote them. */
export const fx = (n: number): string => n.toFixed(1);

/** `translate(x y) rotate(a)`, or nothing at the origin unrotated. */
export function placeAt(at: Pt | undefined, angle = 0): string | undefined {
  const [x, y] = at ?? [0, 0];
  if (x === 0 && y === 0 && angle === 0) return undefined;
  return angle === 0 ? `translate(${x} ${y})` : `translate(${x} ${y}) rotate(${angle})`;
}
