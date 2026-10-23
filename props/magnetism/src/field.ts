/**
 * The magnetic field in the page, worked out from the currents that make it. Every source is a
 * set of long straight currents crossing the page (⊙ out, ⊗ in); each gives circles around itself
 * (B ∝ I / r, the right-hand thumb rule). A loop seen edge-on is one ⊙ and one ⊗; a solenoid is a
 * row of them above and a row below; a bar magnet is drawn as a short, tightly wound solenoid,
 * which is what it behaves like, so its field lines are closed curves that run S → N inside.
 *
 * Units: the picture spans x from −10 to 10 and y from −6.25 to 6.25 (16 px a unit at 320 px).
 */

export const X_MAX = 10;
export const Y_MAX = 6.25;

export const Source = {
  BarMagnet: "barMagnet",
  StraightWire: "straightWire",
  Loop: "loop",
  Solenoid: "solenoid",
} as const;
export type Source = (typeof Source)[keyof typeof Source];

/** A current crossing the page at (x, y): + comes out of the page (⊙), − goes in (⊗). */
export type Wire = { x: number; y: number; current: number };

/** The bar magnet's body (and its N half: right unless flipped). */
export const MAGNET = { halfLength: 3, halfWidth: 0.9 } as const;
/** The loop's two crossings, seen edge-on. */
export const LOOP_HALF = 2.4;
/** The solenoid's turns and size, seen side-on. */
export const SOLENOID = { turns: 17, halfLength: 4, halfWidth: 1.8 } as const;

const spread = (n: number, half: number) =>
  Array.from({ length: n }, (_, i) => (n === 1 ? 0 : -half + (2 * half * i) / (n - 1)));

/**
 * The currents that make each source's field. `current` is signed: for a wire, + is out of the
 * page; for a loop or solenoid, + makes the field inside point right (the right end is N).
 */
export function wiresOf(
  source: Source,
  current: number,
  opts: { isFlipped?: boolean; turns?: number } = {},
): Wire[] {
  switch (source) {
    case Source.StraightWire:
      return [{ x: 0, y: 0, current }];
    case Source.Loop: {
      const i = current * (opts.turns ?? 1);
      return [
        { x: 0, y: LOOP_HALF, current: i },
        { x: 0, y: -LOOP_HALF, current: -i },
      ];
    }
    case Source.Solenoid:
      return spread(SOLENOID.turns, SOLENOID.halfLength).flatMap((x) => [
        { x, y: SOLENOID.halfWidth, current },
        { x, y: -SOLENOID.halfWidth, current: -current },
      ]);
    case Source.BarMagnet: {
      // A magnet's field is a solenoid's: a ring of current round its body.
      const i = opts.isFlipped === true ? -1 : 1;
      return spread(13, MAGNET.halfLength - 0.15).flatMap((x) => [
        { x, y: MAGNET.halfWidth, current: i },
        { x, y: -MAGNET.halfWidth, current: -i },
      ]);
    }
  }
}

/** The field at (x, y): the sum of each current's circles, B = I / (2π r) round it. */
export function fieldAt(wires: readonly Wire[], x: number, y: number): [number, number] {
  let bx = 0;
  let by = 0;
  for (const w of wires) {
    const dx = x - w.x;
    const dy = y - w.y;
    const r2 = Math.max(dx * dx + dy * dy, 0.04);
    const k = w.current / (2 * Math.PI * r2);
    bx += -dy * k;
    by += dx * k;
  }
  return [bx, by];
}

export const strengthOf = ([bx, by]: [number, number]): number => Math.hypot(bx, by);

/** Whether (x, y) is inside the drawing's solid parts (the magnet's body, a wire). */
export function isInsideBody(source: Source, x: number, y: number): boolean {
  if (source === Source.BarMagnet)
    return Math.abs(x) <= MAGNET.halfLength && Math.abs(y) <= MAGNET.halfWidth;
  return false;
}

const isOut = (x: number, y: number) => Math.abs(x) > X_MAX + 0.5 || Math.abs(y) > Y_MAX + 0.5;

/**
 * One field line from a seed, followed both ways along the field (midpoint steps of length h).
 * Stops at the picture's edge, near a wire, or when the line closes on itself.
 */
export function traceLine(
  wires: readonly Wire[],
  seed: [number, number],
  h = 0.08,
  maxSteps = 900,
): [number, number][] {
  const step = (p: [number, number], sign: number): [number, number] | null => {
    const b1 = fieldAt(wires, p[0], p[1]);
    const m1 = strengthOf(b1);
    if (m1 < 1e-9) return null;
    const mid: [number, number] = [
      p[0] + (sign * h * b1[0]) / (2 * m1),
      p[1] + (sign * h * b1[1]) / (2 * m1),
    ];
    const b2 = fieldAt(wires, mid[0], mid[1]);
    const m2 = strengthOf(b2);
    if (m2 < 1e-9) return null;
    return [p[0] + (sign * h * b2[0]) / m2, p[1] + (sign * h * b2[1]) / m2];
  };
  const nearWire = (p: [number, number]) =>
    wires.some((w) => Math.hypot(p[0] - w.x, p[1] - w.y) < 0.12);
  const run = (sign: number): { points: [number, number][]; isClosed: boolean } => {
    const points: [number, number][] = [];
    let p = seed;
    let travelled = 0;
    for (let i = 0; i < maxSteps; i++) {
      const next = step(p, sign);
      if (next === null || nearWire(next)) break;
      points.push(next);
      travelled += h;
      p = next;
      if (isOut(p[0], p[1])) break;
      if (travelled > 4 * h && Math.hypot(p[0] - seed[0], p[1] - seed[1]) < h * 0.75)
        return { points, isClosed: true };
    }
    return { points, isClosed: false };
  };
  const ahead = run(1);
  if (ahead.isClosed) return [seed, ...ahead.points];
  const behind = run(-1);
  return [...behind.points.reverse(), seed, ...ahead.points];
}

/** Where each source's drawn field lines start. */
export function seedsOf(source: Source): [number, number][] {
  switch (source) {
    case Source.StraightWire:
      return [0.9, 1.8, 2.9, 4.2, 5.7].map((r) => [r, 0]);
    case Source.Loop:
      return [-1.8, -1, -0.35, 0.35, 1, 1.8, 3.2, -3.2, 4.4, -4.4].map((y) => [0, y]);
    case Source.Solenoid:
      return [-1.1, -0.55, 0, 0.55, 1.1].map((y) => [0, y]);
    case Source.BarMagnet:
      // Above and below the magnet: each closes through the magnet's inside.
      return [0, 1.3, -1.3, 1.9, -1.9, 2.8, -2.8, 4, -4, 5.4, -5.4].map((y) => [0, y]);
  }
}

/** The strength a compass reads as "strong" for each source at one unit of current. */
export function referenceStrength(source: Source): number {
  const wires = wiresOf(source, 1, { turns: 1 });
  switch (source) {
    case Source.StraightWire:
      return strengthOf(fieldAt(wires, 1, 0));
    case Source.Loop:
      return strengthOf(fieldAt(wires, 0, 0));
    case Source.Solenoid:
      return strengthOf(fieldAt(wires, 0, 0));
    case Source.BarMagnet:
      return strengthOf(fieldAt(wires, MAGNET.halfLength + 0.6, 0));
  }
}

/** The field direction as an angle in degrees, counter-clockwise from "right". */
export const angleOf = ([bx, by]: [number, number]): number => {
  const a = (Math.atan2(by, bx) * 180) / Math.PI;
  return Math.round(((a % 360) + 360) % 360);
};

/** The nearest of eight compass words for an angle (right, up-right, up, …). */
export function headingOf(angle: number): string {
  const names = [
    "right",
    "up and right",
    "up",
    "up and left",
    "left",
    "down and left",
    "down",
    "down and right",
  ];
  return names[Math.round((((angle % 360) + 360) % 360) / 45) % 8] as string;
}
