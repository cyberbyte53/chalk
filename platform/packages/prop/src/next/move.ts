import { Ease } from "./define";

/**
 * A planned move: where a variable is going, from where, and when. Its whole path is known when
 * it starts, so nothing ticks: where it is at any moment is worked out from the board's clock.
 */
export type Move = {
  readonly from: unknown;
  readonly to: unknown;
  readonly startedAt: number;
  readonly takes: number;
  readonly ease: Ease;
};

const EASES: Readonly<Record<Ease, (t: number) => number>> = {
  [Ease.Linear]: (t) => t,
  [Ease.Smooth]: (t) => t * t * (3 - 2 * t),
};

/**
 * Where a move is at `now`: numbers eased from `from` to `to`, objects field by field (a point),
 * anything else (text, a list) staying at `from` until the end.
 */
export function moveAt(move: Move, now: number): unknown {
  if (move.takes <= 0 || now >= move.startedAt + move.takes) return move.to;
  const t = EASES[move.ease](Math.max(0, (now - move.startedAt) / move.takes));
  return between(move.from, move.to, t);
}

function between(from: unknown, to: unknown, t: number): unknown {
  if (typeof from === "number" && typeof to === "number") return from + (to - from) * t;
  if (isPlain(from) && isPlain(to)) {
    const out: Record<string, unknown> = { ...from };
    for (const [key, value] of Object.entries(to)) out[key] = between(from[key], value, t);
    return out;
  }
  return from;
}

function isPlain(v: unknown): v is Readonly<Record<string, unknown>> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
