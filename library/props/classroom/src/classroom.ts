import { localizedSchema } from "@chalk/content";
import { Ease, PropRole, action, prop, signal } from "@chalk/prop";
import { z } from "zod";

/** Where a child's attention is: what the teacher would see from the front. */
export const Attention = {
  /** Head up, with the lesson. */
  Following: "following",
  /** Head dropped: the thread lost. */
  Lost: "lost",
  /** A hand up, waiting to be answered. */
  Asking: "asking",
  /** Head up over a lit slate of their own: following at their own pace. */
  LitUp: "litUp",
  /** Over a lit slate but stuck on it, head down, until the teacher comes to them. */
  Stuck: "stuck",
  /** Lit by something they want to know: head up, a hand up with a "!". */
  Curious: "curious",
} as const;
export type Attention = (typeof Attention)[keyof typeof Attention];

/** Where a child stands, as the teacher can now see it on their slate. */
export const StandingKind = {
  /** Stuck on something: needs the teacher. */
  NeedsHelp: "needsHelp",
  /** Going well. */
  OnTrack: "onTrack",
  /** Ready to go further: curious about something. */
  Curious: "curious",
} as const;
export type StandingKind = (typeof StandingKind)[keyof typeof StandingKind];

/** A child's standing: its kind, and a few words from the lesson ("swaps the numbers"), or none. */
export const standingSchema = z
  .object({ kind: z.nativeEnum(StandingKind), words: localizedSchema.nullable() })
  .strict();
export type Standing = z.infer<typeof standingSchema>;

/** At most this many children: three rows of four. */
export const MAX_CHILDREN = 12;
/** Children sit four to a row, two to a bench. */
export const PER_ROW = 4;
/** The blackboard holds this many lines. */
export const MAX_LINES = 4;
/** Seconds a child takes to look up when the student turns to them. */
export const SECONDS_TO_HELP = 0.7;
/** Seconds the duster takes across the board. */
export const SECONDS_TO_WIPE = 1.2;
/** Seconds hands take to go up. */
export const SECONDS_TO_RAISE = 0.8;
/** How many hands go up when a board doesn't say whose. */
const HANDS_BY_DEFAULT = 2;

/** A number from 0 to 1, the same for the same seed and n (mulberry32, as the crowd's). */
export function chance(seed: number, n: number): number {
  let t = (seed * 2654435761 + n * 40503 + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** The children 0…count−1 in a seeded order (Fisher–Yates); `salt` gives each use its own order. */
export function orderOf(count: number, seed: number, salt: number): number[] {
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(chance(seed, salt + i) * (i + 1));
    [order[i], order[j]] = [order[j] as number, order[i] as number];
  }
  return order;
}

const LOST_SALT = 100;
const LIT_SALT = 200;
const ASK_SALT = 300;
const QUESTION_SALT = 400;
/** How far a stuck child's head hangs over their slate. */
const STUCK_DROP = 0.75;
/** A visit: he walks for the first part, crouches, and the child looks up at the end. */
export const VISIT_WALK = 0.72;
const VISIT_LOOK_UP = 0.8;

/** Who loses the thread first, second, …: the seed's order. */
export const lostOrderOf = (count: number, seed: number) => orderOf(count, seed, LOST_SALT);
/** Who lights up first, second, …: the seed's order. */
export const litOrderOf = (count: number, seed: number) => orderOf(count, seed, LIT_SALT);
/** Whose hands go up when a board doesn't say: the seed's order, from the back two rows first. */
export function askOrderOf(count: number, seed: number): number[] {
  const order = orderOf(count, seed, ASK_SALT);
  const back = Math.max(0, count - 2 * PER_ROW);
  return [...order.filter((i) => i >= back), ...order.filter((i) => i < back)];
}

/** Whose standing shows first, second, …: the on-track, then the curious, then those who need help, each in the seed's order. */
export function revealOrderOf(
  standing: readonly (Standing | null)[],
  count: number,
  seed: number,
): number[] {
  const lit = litOrderOf(count, seed).filter((i) => standing[i] != null);
  const of = (k: StandingKind) => lit.filter((i) => standing[i]?.kind === k);
  return [...of(StandingKind.OnTrack), ...of(StandingKind.Curious), ...of(StandingKind.NeedsHelp)];
}

/** Who is sparked first, second, …: the curious, in the seed's order. */
export const sparkOrderOf = (standing: readonly (Standing | null)[], count: number, seed: number) =>
  litOrderOf(count, seed).filter((i) => standing[i]?.kind === StandingKind.Curious);

/** Which row a child sits in: 0 is nearest the board. */
export const rowOf = (child: number) => Math.floor(child / PER_ROW);

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => {
  const x = clamp(v);
  return x * x * (3 - 2 * x);
};

/** One child as drawn now: where their attention is, and how far each pose has gone (0 to 1). */
export type Child = {
  attention: Attention;
  /** How far the head has dropped. */
  drop: number;
  /** How far the hand is up. */
  hand: number;
  /** How bright their slate is. */
  glow: number;
  /** Whether a "?" floats over them (some of the lost). */
  hasQuestion: boolean;
  /** How far their standing's tag has come in, 0 to 1. */
  tag: number;
  /** How far their curiosity has sparked: a hand up with a "!". */
  spark: number;
};

export type ClassState = {
  count: number;
  seed: number;
  lost: number;
  asking: number[];
  rising: number[];
  raised: number;
  helped: number[];
  lifting: number | null;
  lift: number;
  lit: number;
  standing: (Standing | null)[];
  revealed: number;
  visiting: number | null;
  visit: number;
  sparked: number;
};

/** Every child as drawn now, from the class's variables (some mid-move). */
export function childrenNow(s: ClassState): Child[] {
  const lostRank = lostOrderOf(s.count, s.seed);
  const litRank = litOrderOf(s.count, s.seed);
  const revealRank = revealOrderOf(s.standing, s.count, s.seed);
  const sparkRank = sparkOrderOf(s.standing, s.count, s.seed);
  return Array.from({ length: s.count }, (_, i) => {
    let drop = smooth(s.lost - lostRank.indexOf(i));
    let hand = s.asking.includes(i) ? (s.rising.includes(i) ? smooth(s.raised) : 1) : 0;
    // A hand up lifts the head too: they are waiting, not lost.
    drop *= 1 - hand;
    let glow = smooth(s.lit - litRank.indexOf(i));
    drop *= 1 - glow;
    hand *= 1 - glow;
    // One who needs help sits stuck over their lit slate until the teacher comes.
    const kind = s.standing[i]?.kind;
    if (kind === StandingKind.NeedsHelp) drop = Math.max(drop, STUCK_DROP * glow);
    if (s.helped.includes(i)) {
      const f = s.lifting === i ? smooth(s.lift) : 1;
      drop *= 1 - f;
      hand *= 1 - f;
    }
    if (s.visiting === i) {
      const f = smooth((s.visit - VISIT_LOOK_UP) / (1 - VISIT_LOOK_UP));
      drop *= 1 - f;
      hand *= 1 - f;
    }
    const spark = kind === StandingKind.Curious ? smooth(s.sparked - sparkRank.indexOf(i)) : 0;
    drop *= 1 - spark;
    glow = Math.max(glow, spark);
    const isStuck = glow > 0.5 && drop > 0.5;
    const attention =
      spark > 0.5
        ? Attention.Curious
        : hand > 0.5
          ? Attention.Asking
          : isStuck
            ? Attention.Stuck
            : drop > 0.5
              ? Attention.Lost
              : glow > 0.5
                ? Attention.LitUp
                : Attention.Following;
    const hasQuestion = attention === Attention.Lost && chance(s.seed, QUESTION_SALT + i) < 0.45;
    const rank = revealRank.indexOf(i);
    const tag = rank < 0 ? 0 : smooth(s.revealed - rank);
    return { attention, drop, hand: Math.max(hand, spark), glow, hasQuestion, tag, spark };
  });
}

/** How many children are in each state now. */
export function countsOf(children: readonly Child[]): Record<Attention, number> {
  const counts: Record<Attention, number> = {
    [Attention.Following]: 0,
    [Attention.Lost]: 0,
    [Attention.Asking]: 0,
    [Attention.LitUp]: 0,
    [Attention.Stuck]: 0,
    [Attention.Curious]: 0,
  };
  for (const c of children) counts[c.attention] += 1;
  return counts;
}

const child = z
  .number()
  .int()
  .min(0)
  .max(MAX_CHILDREN - 1);
const seconds = z.number().positive().max(30);

/**
 * A classroom seen from the back: a blackboard at the front with the teacher beside it, and rows
 * of children at benches, each a little different (the seed draws them). Each child is following
 * (head up), lost (head dropped), or asking (a hand up, waiting). The teacher chalks lines on the
 * board one at a time, his back to the class. In the end every child can light up: head up over a
 * glowing slate of their own, where the teacher can see where each one stands (stuck, on track,
 * curious), walk to the one who needs him, and watch the curious spark.
 */
export const classroom = prop({
  type: "classroom",
  role: PropRole.Explainer,
  offScreen: ["seed"],
  describe:
    "A classroom seen from the back: a blackboard at the front with the teacher beside it, and rows of children at benches. Each child is following (head up), lost (head dropped, sometimes a '?'), or asking (a hand up, waiting). The teacher, a young man, chalks lines on the board one at a time; children can lose the thread one by one, raise their hands, be helped one at a time, or all light up, each over a glowing slate of their own. Lit up, each child's standing can show over them (needs help, on track, curious, in the lesson's words); one who needs help sits stuck until the teacher walks down to them and crouches beside them; the curious spark, a hand up with a '!'.",
  variables: z
    .object({
      /** How many children: rows of four. */
      count: z.number().int().min(1).max(MAX_CHILDREN),
      /** Draws the children (their looks) and the order things happen to them. */
      seed: z.number().int().min(0),
      /** The lines on the blackboard, the last perhaps still being written. */
      lines: z.array(localizedSchema).max(MAX_LINES),
      /** How far the last line is written, 0 to 1 (moving): the teacher walks up, writes, steps back. */
      writing: z.number().min(0).max(1),
      /** How far the duster has gone across the board, 0 to 1 (moving). */
      wiping: z.number().min(0).max(1),
      /** How many have lost the thread, in the seed's order (moving: a fraction is a head dropping). */
      lost: z.number().min(0).max(MAX_CHILDREN),
      /** Who has a hand up, in the order they raised it. */
      asking: z.array(child),
      /** Whose hands are going up now. */
      rising: z.array(child),
      /** How far the rising hands are up, 0 to 1 (moving). */
      raised: z.number().min(0).max(1),
      /** Who has been helped: turned to, so they look up (a hand up answered). */
      helped: z.array(child),
      /** The one being helped now, or none. */
      lifting: child.nullable(),
      /** How far they have looked up, 0 to 1 (moving). */
      lift: z.number().min(0).max(1),
      /** How many have lit up, in the seed's order (moving). */
      lit: z.number().min(0).max(MAX_CHILDREN),
      /** Where each child stands (by child, front row first), or null: not known. */
      standing: z.array(standingSchema.nullable()).max(MAX_CHILDREN),
      /** How many standings show, in their order (moving: a fraction is a tag coming in). */
      revealed: z.number().min(0).max(MAX_CHILDREN),
      /** The child the teacher is walking to now, or none. */
      visiting: child.nullable(),
      /** How far his visit has gone, 0 to 1 (moving): he walks, crouches, and they look up. */
      visit: z.number().min(0).max(1),
      /** The child he is crouched beside, or none (he is at the board). */
      visited: child.nullable(),
      /** How many of the curious have sparked, in the seed's order (moving). */
      sparked: z.number().min(0).max(MAX_CHILDREN),
    })
    .strict(),
  start: {
    count: MAX_CHILDREN,
    seed: 3,
    lines: [],
    writing: 1,
    wiping: 0,
    lost: 0,
    asking: [],
    rising: [],
    raised: 0,
    helped: [],
    lifting: null,
    lift: 0,
    lit: 0,
    standing: [],
    revealed: 0,
    visiting: null,
    visit: 0,
    visited: null,
    sparked: 0,
  },
  facts: {
    children: (me) => childrenNow(me),
    isWriting: (me) => me.lines.length > 0 && me.writing < 1,
  },
  actions: {
    loseThem: action(
      { seconds, howMany: z.number().int().min(1).max(MAX_CHILDREN).optional() },
      {
        describe:
          "Children lose the thread one after another, in the seed's order, over these seconds: heads drop, a few '?' (all of them, or howMany)",
      },
    ),
    raiseHands: action(
      { who: z.array(child).min(1).max(MAX_CHILDREN).optional() },
      {
        describe:
          "Hands go up (these children, else two the seed picks) and stay up, waiting to be answered",
      },
    ),
    write: action(
      { line: localizedSchema, seconds },
      {
        describe:
          "The teacher chalks the next line on the board: he walks up, writes it left to right, and steps back",
      },
    ),
    wipe: action({}, { describe: "The duster clears the board" }),
    lightUp: action(
      { seconds },
      {
        describe:
          "The after: one by one, every child's head comes up over a slate of their own that glows",
      },
    ),
    settle: action(
      {},
      { describe: "Back to a class all following: no one lost, no hands, no slates" },
    ),
    revealStanding: action(
      { seconds },
      {
        describe:
          "Each child's standing shows over them, one after another over these seconds: the on-track, the curious, then those who need help",
      },
    ),
    visit: action(
      { child, seconds },
      {
        describe:
          "The teacher walks from where he is down to this child and crouches beside them; they look up as he arrives",
      },
    ),
    spark: action(
      { seconds },
      {
        describe:
          "The curious spark, one after another over these seconds: head up, a hand up with a '!', their slate aglow",
      },
    ),
    help: action(
      { child },
      {
        from: "screen",
        describe: "Turn to one child: a lost child looks up; a raised hand is answered",
      },
    ),
  },
  signals: {
    lost: signal({ count: z.number().int().min(0) }),
    raised: signal({ who: z.array(child) }),
    written: signal({ line: z.number().int().min(0) }),
    wiped: signal({}),
    lit: signal({ count: z.number().int().min(0) }),
    helped: signal({ child, wasAsking: z.boolean() }),
    revealed: signal({ count: z.number().int().min(0) }),
    visited: signal({ child }),
    sparked: signal({ count: z.number().int().min(0) }),
  },
  on: {
    loseThem: (me, { seconds: takes, howMany }, t) => {
      const to = Math.min(me.count, howMany ?? me.count);
      if (to <= me.lost) return;
      return t.move("lost", to, takes, { atEnd: [t.tell.lost({ count: to })] });
    },
    raiseHands: (me, { who }, t) => {
      if (me.rising.length > 0) return;
      const isFree = (i: number) =>
        i < me.count && !me.asking.includes(i) && !me.helped.includes(i);
      const chosen =
        who?.filter(isFree) ??
        askOrderOf(me.count, me.seed).filter(isFree).slice(0, HANDS_BY_DEFAULT);
      if (chosen.length === 0) return;
      return [
        t.set({ asking: [...me.asking, ...chosen], rising: chosen, raised: 0 }),
        t.move("raised", 1, SECONDS_TO_RAISE, {
          ease: Ease.Linear,
          atEnd: [t.set({ rising: [] }), t.tell.raised({ who: chosen })],
        }),
      ];
    },
    write: (me, { line, seconds: takes }, t) => {
      if (me.writing < 1 || me.wiping > 0 || me.lines.length >= MAX_LINES) return;
      const index = me.lines.length;
      // He is back at the board to write.
      return [
        t.set({ lines: [...me.lines, line], writing: 0, visited: null }),
        t.move("writing", 1, takes, { atEnd: [t.tell.written({ line: index })] }),
      ];
    },
    wipe: (me, _, t) => {
      if (me.lines.length === 0 || me.writing < 1 || me.wiping > 0) return;
      return t.move("wiping", 1, SECONDS_TO_WIPE, {
        ease: Ease.Smooth,
        atEnd: [t.set({ lines: [], wiping: 0 }), t.tell.wiped({})],
      });
    },
    lightUp: (me, { seconds: takes }, t) => {
      if (me.lit >= me.count) return;
      return t.move("lit", me.count, takes, { atEnd: [t.tell.lit({ count: me.count })] });
    },
    revealStanding: (me, { seconds: takes }, t) => {
      const n = revealOrderOf(me.standing, me.count, me.seed).length;
      if (n === 0 || me.revealed >= n) return;
      return t.move("revealed", n, takes, { atEnd: [t.tell.revealed({ count: n })] });
    },
    visit: (me, { child: i, seconds: takes }, t) => {
      if (i >= me.count || me.visiting !== null || me.visited === i || me.writing < 1) return;
      return [
        t.set({ visiting: i, visit: 0 }),
        t.move("visit", 1, takes, {
          ease: Ease.Linear,
          atEnd: [
            t.set({
              visiting: null,
              visit: 0,
              visited: i,
              helped: me.helped.includes(i) ? me.helped : [...me.helped, i],
            }),
            t.tell.visited({ child: i }),
          ],
        }),
      ];
    },
    spark: (me, { seconds: takes }, t) => {
      const n = sparkOrderOf(me.standing, me.count, me.seed).length;
      if (n === 0 || me.sparked >= n) return;
      return t.move("sparked", n, takes, { atEnd: [t.tell.sparked({ count: n })] });
    },
    settle: (_, __, t) => [
      t.stop(),
      t.set({
        lost: 0,
        asking: [],
        rising: [],
        raised: 0,
        helped: [],
        lifting: null,
        lift: 0,
        lit: 0,
        revealed: 0,
        visiting: null,
        visit: 0,
        visited: null,
        sparked: 0,
      }),
    ],
    help: (me, { child: i }, t) => {
      if (i >= me.count || me.lifting !== null) return;
      const now = childrenNow(me)[i];
      if (now === undefined) return;
      const canHelp = [Attention.Lost, Attention.Asking, Attention.Stuck] as Attention[];
      if (!canHelp.includes(now.attention)) return;
      const wasAsking = now.attention === Attention.Asking;
      return [
        t.set({ helped: [...me.helped, i], lifting: i, lift: 0 }),
        t.move("lift", 1, SECONDS_TO_HELP, {
          ease: Ease.Linear,
          atEnd: [t.set({ lifting: null, lift: 0 }), t.tell.helped({ child: i, wasAsking })],
        }),
      ];
    },
  },
  summary: (me) => {
    const c = countsOf(me.children);
    const board =
      me.lines.length === 0 ? "the board is clean" : `${me.lines.length} lines on the board`;
    return `A classroom of ${me.count} children: ${c.following} following, ${c.lost} lost, ${c.asking} with a hand up, ${c.litUp} lit up, ${c.stuck} stuck, ${c.curious} curious; ${board}.`;
  },
  invariant: (s) =>
    s.lost > s.count
      ? "more children lost than in the class"
      : s.lit > s.count
        ? "more children lit up than in the class"
        : [...s.asking, ...s.helped].some((i) => i >= s.count)
          ? "a child who isn't in the class"
          : new Set(s.asking).size !== s.asking.length || new Set(s.helped).size !== s.helped.length
            ? "a child counted twice"
            : s.rising.some((i) => !s.asking.includes(i))
              ? "a hand rising that isn't asking"
              : s.standing.length > s.count
                ? "a standing for a child who isn't in the class"
                : undefined,
});
