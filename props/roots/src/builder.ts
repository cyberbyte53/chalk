import { type Box, type Emit, actionsFor, defineProp, set, task } from "@chalk/prop";
import { z } from "zod";
import { MAX_HEIGHT, around, builderLayout, builderPx, swingTip } from "./geometry";
import { glide } from "./glide";
import { floorRoot, isPerfectSquare, rootText } from "./surd";

export const RootBuilderPart = {
  Zero: "zero",
  Base: "base",
  Perpendicular: "perpendicular",
  Hypotenuse: "hypotenuse",
  Arc: "arc",
  BaseHandle: "baseHandle",
  HeightHandle: "heightHandle",
  LandedPrefix: "landed:",
  TickPrefix: "tick:",
} as const;

export const RootBuilderSignal = { Landed: "landed" } as const;

export const MAX_BASE = 64;
export const MAX_LANDED = 10;
export const MIN_LINE = 2;
export const MAX_LINE = 8;
/** How long the compass takes to swing, unless told otherwise. */
export const SWING_SECONDS = 1.6;
/** How far above the line the height handle waits when there is no perpendicular yet (px). */
export const GHOST_HANDLE_PX = 34;

const rootBuilderState = z
  .object({
    /** n, where the base is √n long (n = 4: a base of 2). */
    base: z.number().int().min(1).max(MAX_BASE),
    /** The perpendicular's height in whole units (0: none yet). */
    height: z.number().int().min(0).max(MAX_HEIGHT),
    /** How far the compass has swung the hypotenuse down onto the line (1: landed). */
    swing: z.number().min(0).max(1),
    /** n for each √n placed on the line so far, oldest first. */
    landed: z.array(z.number().int().min(2).max(MAX_BASE)).max(MAX_LANDED),
    /** How far the line goes. */
    maxValue: z.number().int().min(MIN_LINE).max(MAX_LINE),
  })
  .strict();
export type RootBuilderState = z.infer<typeof rootBuilderState>;

const act = actionsFor<RootBuilderState>();

export function hypotenuseSquared(s: RootBuilderState): number {
  return s.base + s.height * s.height;
}

/** Whether √n has a point on this line: a whole number, or a √n already landed. */
export function isOnLine(s: RootBuilderState, n: number): boolean {
  return n <= s.maxValue * s.maxValue && (isPerfectSquare(n) || s.landed.includes(n));
}

/** Every n whose √n the base's end can snap to, smallest first. */
export function basePoints(s: RootBuilderState): number[] {
  const out = new Set<number>();
  for (let k = 1; k <= s.maxValue; k++) out.add(k * k);
  for (const n of s.landed) if (isOnLine(s, n)) out.add(n);
  return [...out].sort((a, b) => a - b);
}

/** The tallest whole perpendicular at base n that still lands on the line. */
export function maxHeightAt(n: number, maxValue: number): number {
  const room = maxValue * maxValue - n;
  return room < 0 ? 0 : Math.min(MAX_HEIGHT, floorRoot(room));
}

/** `landed` with n added as the newest, dropping the oldest (never the base) past the limit. */
function withLanded(landed: readonly number[], n: number, base: number): number[] {
  const out = [...landed.filter((m) => m !== n), n];
  while (out.length > MAX_LANDED) {
    out.splice(
      out.findIndex((m) => m !== base),
      1,
    );
  }
  return out;
}

function landPatch(s: RootBuilderState): Partial<RootBuilderState> {
  return { swing: 1, landed: withLanded(s.landed, hypotenuseSquared(s), s.base) };
}

function landedEmit(squared: number): Emit {
  return {
    signal: RootBuilderSignal.Landed,
    payload: { squared, isWhole: isPerfectSquare(squared) },
  };
}

function parts(s: RootBuilderState): string[] {
  const out: string[] = [
    RootBuilderPart.Zero,
    RootBuilderPart.Base,
    RootBuilderPart.BaseHandle,
    RootBuilderPart.HeightHandle,
  ];
  if (s.height > 0) out.push(RootBuilderPart.Perpendicular, RootBuilderPart.Hypotenuse);
  if (s.swing > 0) out.push(RootBuilderPart.Arc);
  for (const n of s.landed) out.push(`${RootBuilderPart.LandedPrefix}${n}`);
  for (let k = 0; k <= s.maxValue; k++) out.push(`${RootBuilderPart.TickPrefix}${k}`);
  return out;
}

function locate(s: RootBuilderState, part: string, width: number): Box | undefined {
  if (!parts(s).includes(part)) return undefined;
  const layout = builderLayout(s.maxValue, width);
  const px = (x: number, y: number) => builderPx(layout, { x, y });
  const b = Math.sqrt(s.base);
  const top = px(b, s.height);
  switch (part) {
    case RootBuilderPart.Zero:
      return around([px(0, 0)]);
    case RootBuilderPart.Base:
      return around([px(0, 0), px(b, 0)], 8);
    case RootBuilderPart.Perpendicular:
      return around([px(b, 0), top], 8);
    case RootBuilderPart.Hypotenuse: {
      const tip = swingTip(b, s.height, s.swing);
      return around([px(0, 0), px(tip.x, tip.y)], 8);
    }
    case RootBuilderPart.Arc:
      return around([px(0, 0), px(Math.sqrt(hypotenuseSquared(s)), 0), top], 4);
    case RootBuilderPart.BaseHandle:
      return around([px(b, 0)], 22);
    case RootBuilderPart.HeightHandle:
      return around([s.height > 0 ? top : { x: top.x, y: top.y - GHOST_HANDLE_PX }], 22);
  }
  if (part.startsWith(RootBuilderPart.LandedPrefix)) {
    const n = Number(part.slice(RootBuilderPart.LandedPrefix.length));
    return around([px(Math.sqrt(n), 0)]);
  }
  const tick = px(Number(part.slice(RootBuilderPart.TickPrefix.length)), 0);
  return around([tick, { x: tick.x, y: tick.y + 30 }]);
}

/**
 * A number line with a right triangle standing on it, and a compass at 0 that swings the
 * hypotenuse onto the line. It knows right triangles and lengths on a line, nothing about any lesson.
 */
export const rootBuilder = defineProp<RootBuilderState>({
  type: "rootBuilder",
  describe:
    "A number line with a faint unit grid and a right triangle standing on it: the base lies along the line from 0 to √base (a whole number or a √n already landed), a perpendicular of whole-number `height` stands at its end, and the hypotenuse √(base + height²) goes from 0 to its top. A compass centred at 0 swings the hypotenuse down onto the line, giving √(base + height²) an exact point.",
  state: rootBuilderState,
  defaults: { base: 1, height: 1, swing: 0, landed: [], maxValue: 3 },
  derived: {
    hypotenuseSquared: {
      describe: "The hypotenuse squared: base + height²",
      compute: hypotenuseSquared,
    },
    hypotenuseText: {
      describe: 'The hypotenuse as maths, e.g. "√5", or "2" when it is √4',
      compute: (s) => rootText(hypotenuseSquared(s)),
    },
    baseText: {
      describe: 'The base as maths, e.g. "1" or "√2"',
      compute: (s) => rootText(s.base),
    },
    landsAt: {
      describe: "Where the hypotenuse lands on the line, as a decimal",
      compute: (s) => Math.sqrt(hypotenuseSquared(s)),
    },
    isWhole: {
      describe: "The hypotenuse is a whole number (base + height² is a perfect square)",
      compute: (s) => isPerfectSquare(hypotenuseSquared(s)),
    },
    hasLanded: { describe: "The swing is finished", compute: (s) => s.swing >= 1 },
    canSwing: {
      describe: "There is a perpendicular and it hasn't been swung yet",
      compute: (s) => s.height > 0 && s.swing < 1,
    },
    maxHeight: {
      describe: "The tallest perpendicular that still lands on the line at this base",
      compute: (s) => maxHeightAt(s.base, s.maxValue),
    },
  },
  offScreen: ["landsAt", "maxHeight"],
  actions: {
    setBase: act({
      describe:
        "Move the base's end to √n on the line (a whole number squared, or a landed √n). Swing goes back to 0; the height is lowered if the triangle would no longer fit. Keeps what has landed.",
      byLearner: true,
      args: z.object({ n: z.number().int().min(1).max(MAX_BASE) }).strict(),
      run: (s, a) => {
        if (!isOnLine(s, a.n)) {
          throw new Error(`√${a.n} is not a point on this line yet (whole numbers and landed √n)`);
        }
        return set({
          base: a.n,
          height: Math.min(s.height, maxHeightAt(a.n, s.maxValue)),
          swing: 0,
        });
      },
    }),
    setHeight: act({
      describe:
        "Make the perpendicular `h` whole units tall (0 removes it). Swing goes back to 0. Keeps the base.",
      byLearner: true,
      args: z.object({ h: z.number().int().min(0).max(MAX_HEIGHT) }).strict(),
      run: (s, a) => {
        if (a.h > maxHeightAt(s.base, s.maxValue)) {
          throw new Error(`a height of ${a.h} would land past the end of the line`);
        }
        return set({ height: a.h, swing: 0 });
      },
    }),
    swing: act({
      describe:
        "Swing the hypotenuse about 0 down onto the line with the compass (over `over` seconds, 1.6 by default), then mark where it lands. Keeps the triangle. Raises `landed`.",
      byLearner: true,
      args: z.object({ over: z.number().min(0).max(10).optional() }).strict(),
      run: (s, a) => {
        if (s.height === 0) throw new Error("there is no perpendicular to swing yet (height is 0)");
        if (s.swing >= 1) return set({});
        const landed = landedEmit(hypotenuseSquared(s));
        const over = a.over ?? SWING_SECONDS;
        if (over === 0) return set(landPatch(s), landed);
        return task(async (c) => {
          const start = c.get();
          let last = start.swing;
          // The learner wins: if anything else changes the triangle or the swing, stop here.
          const isSame = () => {
            const now = c.get();
            return now.base === start.base && now.height === start.height && now.swing === last;
          };
          const isDone = await glide(c.wait, over, start.swing, (value) => {
            if (!isSame()) return false;
            c.set({ swing: value });
            last = value;
            return true;
          });
          if (!isDone || !isSame()) return;
          c.set(landPatch(c.get()));
          c.emit(landed.signal, landed.payload);
        });
      },
    }),
    buildOn: act({
      describe:
        "Make the last landed point the new base, with no perpendicular yet (the next step of the construction). Keeps what has landed.",
      args: z.object({}).strict(),
      run: (s) => {
        const last = s.landed.at(-1);
        if (last === undefined) throw new Error("nothing has landed on the line yet");
        return set({ base: last, height: 0, swing: 0 });
      },
    }),
    clearLanded: act({
      describe:
        "Take every landed point off the line. A base standing on one moves back to the whole number below it.",
      args: z.object({}).strict(),
      run: (s) => {
        const base = isPerfectSquare(s.base) ? s.base : floorRoot(s.base) ** 2;
        return set({
          landed: [],
          base,
          height: Math.min(s.height, maxHeightAt(base, s.maxValue)),
          swing: 0,
        });
      },
    }),
    startAgain: act({
      describe: "Back to a base of 1 with no perpendicular and nothing landed. Keeps the line.",
      args: z.object({}).strict(),
      run: () => set({ base: 1, height: 0, swing: 0, landed: [] }),
    }),
  },
  signals: {
    [RootBuilderSignal.Landed]: {
      describe:
        "The swing finished: √`squared` has its point on the line (`isWhole`: it is a whole number)",
    },
  },
  parts,
  locate,
  invariant: (s) => {
    const room = s.maxValue * s.maxValue;
    if (!isOnLine(s, s.base)) return "base must be a whole number squared or a landed √n";
    if (hypotenuseSquared(s) > room) {
      return "the hypotenuse must land on the line (base + height² ≤ maxValue²)";
    }
    if (s.landed.some((n) => n > room)) return "every landed √n must be on the line";
    if (new Set(s.landed).size !== s.landed.length) return "landed must not repeat a point";
    if (s.swing > 0 && s.height === 0) return "only a hypotenuse can be swung (height must be > 0)";
    if (s.swing >= 1 && !s.landed.includes(hypotenuseSquared(s))) {
      return "a finished swing has its point in landed";
    }
    return undefined;
  },
});
