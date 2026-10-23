import type { Words } from "./words";

/**
 * Directions in the page, the way NCERT draws them: right and left, up and down the page, and
 * out of the page (towards you, ⊙) or into it (away from you, ⊗). Right-handed: right × up = out.
 */
export const Dir = {
  Right: "right",
  Left: "left",
  Up: "up",
  Down: "down",
  Out: "out",
  In: "in",
} as const;
export type Dir = (typeof Dir)[keyof typeof Dir];

export const DIRS: readonly Dir[] = [Dir.Right, Dir.Left, Dir.Up, Dir.Down, Dir.Out, Dir.In];

type Vec = readonly [number, number, number];

const VEC: Readonly<Record<Dir, Vec>> = {
  right: [1, 0, 0],
  left: [-1, 0, 0],
  up: [0, 1, 0],
  down: [0, -1, 0],
  out: [0, 0, 1],
  in: [0, 0, -1],
};

export const vecOf = (d: Dir): Vec => VEC[d];

/** The direction a unit vector points along, or null for the zero vector. */
export function dirOf(v: Vec): Dir | null {
  for (const d of DIRS) {
    const u = VEC[d];
    if (u[0] === v[0] && u[1] === v[1] && u[2] === v[2]) return d;
  }
  return null;
}

export const cross = (a: Vec, b: Vec): Vec => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

export const neg = (v: Vec): Vec => [-v[0], -v[1], -v[2]];

/** The opposite direction. */
export const opposite = (d: Dir): Dir => dirOf(neg(VEC[d])) as Dir;

/** Whether two directions lie along the same line (then a cross product is zero). */
export const isAlong = (a: Dir, b: Dir): boolean => a === b || a === opposite(b);

/** a × b as a direction, or null when a and b lie along one line. */
export function crossDir(a: Dir, b: Dir): Dir | null {
  return dirOf(cross(VEC[a], VEC[b]));
}

export const DIR_WORDS: Readonly<Record<Dir, Words>> = {
  right: { en: "to the right", hi: "दाईं ओर" },
  left: { en: "to the left", hi: "बाईं ओर" },
  up: { en: "up the page", hi: "पृष्ठ में ऊपर" },
  down: { en: "down the page", hi: "पृष्ठ में नीचे" },
  out: { en: "out of the page", hi: "पृष्ठ से बाहर" },
  in: { en: "into the page", hi: "पृष्ठ के अंदर" },
};

/** Short labels for buttons. */
export const DIR_SHORT: Readonly<Record<Dir, Words>> = {
  right: { en: "→ right", hi: "→ दाएँ" },
  left: { en: "← left", hi: "← बाएँ" },
  up: { en: "↑ up", hi: "↑ ऊपर" },
  down: { en: "↓ down", hi: "↓ नीचे" },
  out: { en: "⊙ out", hi: "⊙ बाहर" },
  in: { en: "⊗ in", hi: "⊗ अंदर" },
};
