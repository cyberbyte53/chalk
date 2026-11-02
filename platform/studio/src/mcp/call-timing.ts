import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Where a tool call's time goes: every call keeps its own tally (seconds per phase, and counts such
 * as drawings made and reused), so two calls drawing at once never mix their numbers, and every
 * answer ends with its tally. `timing` is the old switch for a tally across calls (/dev-timing),
 * kept for measuring a run of calls.
 */
type Tally = { spent: Map<string, number>; counts: Map<string, number>; since: number };

const current = new AsyncLocalStorage<Tally>();

export const timing = { isOn: false, spent: new Map<string, number>() };

/** Runs one phase of the call, adding its seconds to the call's tally (and to `timing`, when on). */
export async function timed<T>(phase: string, fn: () => Promise<T>): Promise<T> {
  const tally = current.getStore();
  if (tally === undefined && !timing.isOn) return fn();
  const t = performance.now();
  try {
    return await fn();
  } finally {
    const seconds = (performance.now() - t) / 1000;
    if (tally !== undefined) tally.spent.set(phase, (tally.spent.get(phase) ?? 0) + seconds);
    if (timing.isOn) {
      timing.spent.set(phase, (timing.spent.get(phase) ?? 0) + seconds);
      // How many times, beside how long: many loads and slow loads are different problems.
      timing.spent.set(`${phase} (times)`, (timing.spent.get(`${phase} (times)`) ?? 0) + 1);
    }
  }
}

/** Adds seconds to a phase, for a span measured by hand (a loop with early exits). */
export function spend(phase: string, seconds: number): void {
  const tally = current.getStore();
  if (tally !== undefined) tally.spent.set(phase, (tally.spent.get(phase) ?? 0) + seconds);
  if (timing.isOn) timing.spent.set(phase, (timing.spent.get(phase) ?? 0) + seconds);
}

/** Counts something the call did ("drawings made", "drawings reused"). */
export function count(what: string, n = 1): void {
  const tally = current.getStore();
  if (tally !== undefined) tally.counts.set(what, (tally.counts.get(what) ?? 0) + n);
}

/** Runs a whole call in its own tally; gives its answer and the tally's one line. */
export async function withTally<T>(fn: () => Promise<T>): Promise<{ value: T; line: string }> {
  const tally: Tally = { spent: new Map(), counts: new Map(), since: performance.now() };
  const value = await current.run(tally, fn);
  return { value, line: lineOf(tally) };
}

/** The longest phases only: the line says where time went, not everything. */
const SHOWN = 5;

/**
 * "⏱ 8.2 s · drawings made 2 · drawings reused 4 · longest, summed over drawings: wait: board idle
 * 3.1 s · …". Drawings run side by side, so their phases can add up to more than the whole.
 */
function lineOf(tally: Tally): string {
  const total = (performance.now() - tally.since) / 1000;
  const counts = [...tally.counts].map(([what, n]) => `${what} ${n}`);
  const phases = [...tally.spent]
    .filter(([, s]) => s >= 0.1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, SHOWN)
    .map(([phase, s]) => `${phase} ${s.toFixed(1)} s`);
  const longest =
    phases.length === 0 ? [] : [`longest, summed over drawings: ${phases.join(", ")}`];
  return `\n⏱ ${[`${total.toFixed(1)} s`, ...counts, ...longest].join(" · ")}`;
}
