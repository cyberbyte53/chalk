import { localizedSchema } from "@chalk/content";
import { Ease, PropRole, action, prop, signal } from "@chalk/prop";
import { z } from "zod";
import { type PlaneWindow, type Point, pointSchema, windowSchema } from "./plane";

/** How a person's point differs from the one asked for, by the plane's own laws. */
export const Mistake = {
  /** Where it was asked: (a, b). */
  None: "none",
  /** The two numbers the other way round: (b, a). */
  Swapped: "swapped",
  /** One number's sign the other way: (−a, b) or (a, −b). */
  Sign: "sign",
  /** A block off along one line: (a ± 1, b) or (a, b ± 1). */
  OffByOne: "offByOne",
} as const;
export type Mistake = (typeof Mistake)[keyof typeof Mistake];

/** How many people put the point each way. */
const mixSchema = z
  .object({
    none: z.number().int().min(0),
    swapped: z.number().int().min(0),
    sign: z.number().int().min(0),
    offByOne: z.number().int().min(0),
  })
  .strict();
export type Mix = z.infer<typeof mixSchema>;

export const MAX_CROWD = 40;

export type CrowdState = {
  asked: Point | null;
  mix: Mix;
  seed: number;
  shown: number;
  together: number;
  gatherAt: Point;
  isMarked: boolean;
  lit: Mistake | null;
  helped: number | null;
  home: number[];
  walkers: number[];
  isFromO: boolean;
  walked: number;
  fromO: number[];
  window: PlaneWindow;
};

/** A number from 0 to 1, the same for the same seed and n (mulberry32, as the dice). */
function chance(seed: number, n: number): number {
  let t = (seed * 2654435761 + n * 40503 + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const ORDER: readonly Mistake[] = [Mistake.None, Mistake.Swapped, Mistake.Sign, Mistake.OffByOne];

/** How many people: everyone in the mix. */
export const sizeOf = (mix: Mix) => ORDER.reduce((n, m) => n + mix[m], 0);

/**
 * Each person in turn, as the seed has them: the mistake they made and the point they put for
 * `asked`. The same seed, the same crowd; the order they come in is shuffled, so kinds mix.
 */
export function peopleOf(asked: Point, mix: Mix, seed: number): { mistake: Mistake; at: Point }[] {
  const kinds = ORDER.flatMap((m) => Array.from({ length: mix[m] }, () => m));
  // A seeded shuffle (Fisher–Yates), so the kinds come in mixed.
  for (let i = kinds.length - 1; i > 0; i--) {
    const j = Math.floor(chance(seed, 1000 + i) * (i + 1));
    [kinds[i], kinds[j]] = [kinds[j] as Mistake, kinds[i] as Mistake];
  }
  return kinds.map((mistake, i) => ({ mistake, at: pointFor(asked, mistake, chance(seed, i)) }));
}

/** The point a person puts for `asked`, making this mistake; `r` (0 to 1) picks which way. */
export function pointFor({ x, y }: Point, mistake: Mistake, r: number): Point {
  switch (mistake) {
    case Mistake.None:
      return { x, y };
    case Mistake.Swapped:
      return { x: y, y: x };
    case Mistake.Sign:
      return r < 0.5 ? { x: -x, y } : { x, y: -y };
    case Mistake.OffByOne: {
      const k = Math.floor(r * 4);
      return [
        { x: x + 1, y },
        { x: x - 1, y },
        { x, y: y + 1 },
        { x, y: y - 1 },
      ][k] as Point;
    }
  }
}

/**
 * How far from its point a person's dot is drawn, in the plane's units, so many on one point read
 * as many: each is placed round it, the first at its centre.
 */
export function spreadOf(seed: number, i: number, nth: number): Point {
  if (nth === 0) return { x: 0, y: 0 };
  const ring = Math.ceil(Math.sqrt(nth));
  const angle = chance(seed, 500 + i) * 2 * Math.PI;
  const r = 0.13 * Math.min(ring, 3);
  return { x: r * Math.cos(angle), y: r * Math.sin(angle) };
}

/**
 * The path a person walks from `from` to `to`, on the lines only: along, then up or down. From O,
 * first back to O (a straight line), then along by the first number and up by the second.
 */
export function pathOf(from: Point, to: Point, isFromO: boolean): Point[] {
  return isFromO
    ? [from, { x: 0, y: 0 }, { x: to.x, y: 0 }, to]
    : [from, { x: to.x, y: from.y }, to];
}

/** Where along a path a walker is, `p` from 0 (its start) to 1 (its end), by distance. */
export function along(path: readonly Point[], p: number): Point {
  const legs = path.slice(1).map((b, i) => {
    const a = path[i] as Point;
    return Math.hypot(b.x - a.x, b.y - a.y);
  });
  const total = legs.reduce((s, d) => s + d, 0);
  if (total === 0 || p <= 0) return path[0] as Point;
  let left = Math.min(1, p) * total;
  for (let i = 0; i < legs.length; i++) {
    const d = legs[i] as number;
    const a = path[i] as Point;
    const b = path[i + 1] as Point;
    if (left <= d || i === legs.length - 1) {
      const f = d === 0 ? 1 : Math.min(1, left / d);
      return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
    }
    left -= d;
  }
  return path.at(-1) as Point;
}

/** How far along a path (0 to 1, by distance) its k-th corner is. */
function progressAt(path: readonly Point[], k: number): number {
  const total = pathLength(path);
  return total === 0 ? 1 : pathLength(path.slice(0, k + 1)) / total;
}

/** How much later each walker starts than the one before, as a share of a whole walk. */
const STAGGER = 0.6;

/** One person as drawn now: where, whether yet in, their mistake, and whether home. */
export type Person = {
  at: Point;
  /** The way they have walked so far (none until they set off). */
  trail: Point[];
  /** 0: not in yet, 1: landed; between, falling in. */
  landed: number;
  mistake: Mistake;
  isHome: boolean;
};

/** Everyone in the crowd as drawn now, from the crowd's variables (some mid-move). */
export function crowdNow(s: CrowdState): Person[] {
  if (s.asked === null) return [];
  const asked = s.asked;
  const people = peopleOf(asked, s.mix, s.seed);
  const seen = new Map<string, number>();
  return people.map(({ mistake, at }, i) => {
    const key = `${at.x},${at.y}`;
    const nth = seen.get(key) ?? 0;
    seen.set(key, nth + 1);
    const off = spreadOf(s.seed, i, nth);
    const spot = { x: at.x + off.x, y: at.y + off.y };
    const isHome = s.home.includes(i);
    const rank = s.walkers.indexOf(i);
    // There, they stand round the point, so many there still read as many.
    const round = spreadOf(s.seed, i, i);
    const there = { x: asked.x + round.x, y: asked.y + round.y };
    const path = pathOf(spot, there, rank >= 0 ? s.isFromO : s.fromO.includes(i));
    let where = isHome ? there : spot;
    let trail: Point[] = isHome ? path : [];
    if (rank >= 0) {
      const n = s.walkers.length;
      const delay = n > 1 ? (STAGGER * rank) / (n - 1) : 0;
      const p = Math.max(0, Math.min(1, s.walked * (1 + STAGGER) - delay));
      where = along(path, p);
      trail = p > 0 ? [...path.filter((_, k) => k === 0 || progressAt(path, k) < p), where] : [];
    }
    const g = s.together;
    const gathered = {
      x: where.x + (s.gatherAt.x - where.x) * g,
      y: where.y + (s.gatherAt.y - where.y) * g,
    };
    return { at: gathered, trail, landed: Math.max(0, Math.min(1, s.shown - i)), mistake, isHome };
  });
}

/** Whether it is on the plane: there is a point asked for. */
export const isCrowdOn = (s: Pick<CrowdState, "asked">) => s.asked !== null;

/** Seconds for everyone to come in, and for one to land. */
const SECONDS_TO_ARRIVE = 3;
const SECONDS_TO_GATHER = 1.4;
/** Seconds a walker takes per unit of path. */
const SECONDS_PER_UNIT = 0.35;
const SECONDS_FOR_ALL = 5;

const index = z
  .number()
  .int()
  .min(0)
  .max(MAX_CROWD - 1);

/**
 * A crowd: many people, each asked to put the same point on the plane, each a dot where they put
 * it. Their mistakes follow from the point asked (the numbers swapped, a sign, a block off); the
 * seed says who made which, so the same seed gives the same crowd. A lesson brings them in, draws
 * them together into one, marks each one's mistake, and walks them, one or all, to where the point
 * really is: along the lines, along then up.
 */
export const crowd = prop({
  type: "crowd",
  role: PropRole.Explainer,
  offScreen: ["seed"],
  describe:
    "A crowd of people each asked to put the same point (a, b) on the plane, each drawn as a dot where they put it: right, the numbers swapped (b, a), a sign the other way, or a block off. They come in one by one, can be drawn together into one dot, have their mistakes marked, and walk, one or all, along the lines to where the point really is.",
  variables: z
    .object({
      /** The point everyone was asked to put, or null: no crowd. */
      asked: pointSchema.nullable(),
      mix: mixSchema,
      seed: z.number().int().min(0),
      /** How many have come in (eased: a fraction is one falling in). */
      shown: z.number().min(0).max(MAX_CROWD),
      /** 0: each where they put it; 1: all at `gatherAt` (eased). */
      together: z.number().min(0).max(1),
      gatherAt: pointSchema,
      /** What the one dot is called, drawn together ("Class 9"). */
      gatherName: localizedSchema.nullable(),
      /** Whether each dot shows its mistake. */
      isMarked: z.boolean(),
      /** The mistake lit, the rest faded; or none. */
      lit: z.nativeEnum(Mistake).nullable(),
      /** The one with a light beside them (someone helping them think), or none. */
      helped: index.nullable(),
      /** Who has walked to the point asked. */
      home: z.array(index),
      /** Who is walking now, in the order they set off. */
      walkers: z.array(index),
      /** Whether they walk from O (back to O, along, up) or from where they are. */
      isFromO: z.boolean(),
      /** How far the walk has gone, 0 to 1 (eased). */
      walked: z.number().min(0).max(1),
      /** Who walked from O, so their trail is drawn that way. */
      fromO: z.array(index),
    })
    .strict(),
  start: {
    asked: null,
    mix: { none: 0, swapped: 0, sign: 0, offByOne: 0 },
    seed: 1,
    shown: 0,
    together: 0,
    gatherAt: { x: 0, y: 0 },
    gatherName: null,
    isMarked: false,
    lit: null,
    helped: null,
    home: [],
    walkers: [],
    isFromO: false,
    walked: 0,
    fromO: [],
  },
  needs: z.object({ window: windowSchema }).strict(),
  facts: {
    size: (me) => sizeOf(me.mix),
    people: (me) => crowdNow(me),
  },
  actions: {
    arrive: action(
      {},
      { describe: "Everyone comes in, one after another, each to where they put the point" },
    ),
    gather: action({}, { describe: "Everyone drawn together into one dot, at gatherAt" }),
    spread: action({}, { describe: "Everyone back to where they put it" }),
    mark: action({}, { describe: "Each dot shows its mistake" }),
    light: action(
      { mistake: z.nativeEnum(Mistake).nullable() },
      { describe: "Light everyone who made this mistake, the rest faded (null: all lit)" },
    ),
    help: action({ who: index.nullable() }, { describe: "A light beside one person (null: none)" }),
    walkHome: action(
      { who: index.nullable(), isFromO: z.boolean() },
      { describe: "One person (or everyone not yet there) walks to the point asked, on the lines" },
    ),
  },
  signals: {
    arrived: signal({}),
    gathered: signal({}),
    spread: signal({}),
    walked: signal({ count: z.number().int().min(1) }),
  },
  on: {
    arrive: (me, _, t) =>
      me.asked !== null &&
      t.move("shown", sizeOf(me.mix), SECONDS_TO_ARRIVE, { atEnd: [t.tell.arrived({})] }),
    gather: (_, __, t) =>
      t.move("together", 1, SECONDS_TO_GATHER, { ease: Ease.Smooth, atEnd: [t.tell.gathered({})] }),
    spread: (_, __, t) =>
      t.move("together", 0, SECONDS_TO_GATHER, { ease: Ease.Smooth, atEnd: [t.tell.spread({})] }),
    mark: (_, __, t) => t.set({ isMarked: true }),
    light: (_, { mistake }, t) => t.set({ lit: mistake }),
    help: (me, { who }, t) => (who === null || who < sizeOf(me.mix)) && t.set({ helped: who }),
    walkHome: (me, { who, isFromO }, t) => {
      if (me.asked === null || me.walkers.length > 0) return;
      const all = Array.from({ length: sizeOf(me.mix) }, (_, i) => i).filter(
        (i) => !me.home.includes(i),
      );
      const walkers = who === null ? all : all.filter((i) => i === who);
      if (walkers.length === 0) return;
      // One walks at a walker's pace, by the length of their path; everyone together, in a set time.
      const person = crowdNow(me)[walkers[0] as number] as Person;
      const takes =
        walkers.length > 1
          ? SECONDS_FOR_ALL
          : SECONDS_PER_UNIT * pathLength(pathOf(person.at, me.asked, isFromO));

      return [
        t.set({ walkers, isFromO, walked: 0 }),
        t.move("walked", 1, takes, {
          atEnd: [
            t.set({
              home: [...me.home, ...walkers],
              fromO: isFromO ? [...me.fromO, ...walkers] : me.fromO,
              walkers: [],
              walked: 0,
              helped: null,
            }),
            t.tell.walked({ count: walkers.length }),
          ],
        }),
      ];
    },
  },
  invariant: (s) =>
    sizeOf(s.mix) > MAX_CROWD
      ? `at most ${MAX_CROWD} people in a crowd`
      : s.shown > sizeOf(s.mix)
        ? "more have come in than are in the crowd"
        : undefined,
});

function pathLength(path: readonly Point[]): number {
  return path.slice(1).reduce((s, b, i) => {
    const a = path[i] as Point;
    return s + Math.hypot(b.x - a.x, b.y - a.y);
  }, 0);
}
