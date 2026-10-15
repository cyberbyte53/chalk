import { actionsFor, defineProp, set, task } from "@chalk/prop";
import { z } from "zod";

/**
 * Two blocks on a frictionless track that collide head-on (an experiment: a physics prop on the
 * board model).
 *
 * Only the setup and the time are stored. Everything else, where the blocks are, how fast they
 * go, the momentum and the energy, follows from them by the textbook formulas, so any moment of
 * the collision can be shown, replayed or checked without running a simulation step by step.
 * `bounce` is the coefficient of restitution: 1 is elastic, 0 is sticky (the blocks move off
 * together), anything between loses some energy.
 */

export const Block = { A: "a", B: "b" } as const;
export type Block = (typeof Block)[keyof typeof Block];

export const CollisionAction = {
  Play: "play",
  Pause: "pause",
  Reset: "reset",
  SetMass: "setMass",
  SetVelocity: "setVelocity",
  SetBounce: "setBounce",
} as const;

export const CollisionSignal = { Collided: "collided" } as const;

/** Track length in metres. */
export const TRACK = 10;
/** Where the blocks' centres start, in metres. */
export const START = { [Block.A]: 2.5, [Block.B]: 7.5 } as const;
export const MASS = { min: 0.5, max: 5, step: 0.5 } as const;
export const VELOCITY = { min: -3, max: 3, step: 0.5 } as const;
/** The longest a run lasts, in seconds. */
export const MAX_TIME = 12;
export const STEP = 1 / 60;

const massSchema = z.number().min(MASS.min).max(MASS.max);
const velocitySchema = z.number().min(VELOCITY.min).max(VELOCITY.max);

const collisionState = z
  .object({
    massA: massSchema,
    massB: massSchema,
    /** Velocities before the collision, m/s; positive is to the right. */
    velocityA: velocitySchema,
    velocityB: velocitySchema,
    bounce: z.number().min(0).max(1),
    /** Seconds since the blocks were let go. */
    time: z.number().min(0).max(MAX_TIME),
    isRunning: z.boolean(),
  })
  .strict();
export type CollisionState = z.infer<typeof collisionState>;

/** A block's width in metres: heavier blocks are bigger. */
export function widthOf(mass: number): number {
  return 0.8 + 0.2 * mass;
}

/** When the blocks touch (seconds), or null if they never meet. */
export function contactTime(s: CollisionState): number | null {
  const gap = START.b - START.a - (widthOf(s.massA) + widthOf(s.massB)) / 2;
  const closing = s.velocityA - s.velocityB;
  return closing > 0 ? gap / closing : null;
}

/** Velocities after the collision: momentum is kept, and `bounce` sets how much they spring apart. */
export function afterCollision(s: CollisionState): { a: number; b: number } {
  const total = s.massA + s.massB;
  const momentum = s.massA * s.velocityA + s.massB * s.velocityB;
  const closing = s.velocityA - s.velocityB;
  return {
    a: (momentum - s.massB * s.bounce * closing) / total,
    b: (momentum + s.massA * s.bounce * closing) / total,
  };
}

export type Moment = {
  positionA: number;
  positionB: number;
  speedA: number;
  speedB: number;
  hasCollided: boolean;
};

/** Where the blocks are and how fast they go at time `time`. */
export function momentAt(s: CollisionState, time: number): Moment {
  const touch = contactTime(s);
  if (touch === null || time < touch) {
    return {
      positionA: START.a + s.velocityA * time,
      positionB: START.b + s.velocityB * time,
      speedA: s.velocityA,
      speedB: s.velocityB,
      hasCollided: false,
    };
  }
  const after = afterCollision(s);
  const since = time - touch;
  return {
    positionA: START.a + s.velocityA * touch + after.a * since,
    positionB: START.b + s.velocityB * touch + after.b * since,
    speedA: after.a,
    speedB: after.b,
    hasCollided: true,
  };
}

/** Both blocks still wholly on the track. */
export function isOnTrack(s: CollisionState, m: Moment): boolean {
  const a = widthOf(s.massA) / 2;
  const b = widthOf(s.massB) / 2;
  return m.positionA - a >= 0 && m.positionB + b <= TRACK;
}

const kinetic = (mass: number, speed: number): number => 0.5 * mass * speed * speed;

const act = actionsFor<CollisionState>();
const blockSchema = z.nativeEnum(Block);
/** Changing the setup puts the blocks back at the start. */
const RESTART = { time: 0, isRunning: false } as const;

export const collision = defineProp({
  type: "collision",
  isExplainer: false,
  describe:
    "Two blocks on a frictionless track that collide head-on; shows momentum (always kept) and kinetic energy (kept only when the collision is elastic).",
  state: collisionState,
  defaults: {
    massA: 2,
    massB: 1,
    velocityA: 2,
    velocityB: -1,
    bounce: 1,
    time: 0,
    isRunning: false,
  },
  derived: {
    collidesAt: { describe: "When the blocks touch (s), or null", compute: (s) => contactTime(s) },
    hasCollided: {
      describe: "The blocks have hit each other",
      compute: (s) => momentAt(s, s.time).hasCollided,
    },
    speedA: {
      describe: "Block A's velocity now (m/s)",
      compute: (s) => momentAt(s, s.time).speedA,
    },
    speedB: {
      describe: "Block B's velocity now (m/s)",
      compute: (s) => momentAt(s, s.time).speedB,
    },
    momentumBefore: {
      describe: "Total momentum before (kg·m/s)",
      compute: (s) => s.massA * s.velocityA + s.massB * s.velocityB,
    },
    momentumNow: {
      describe: "Total momentum now (kg·m/s)",
      compute: (s) => {
        const m = momentAt(s, s.time);
        return s.massA * m.speedA + s.massB * m.speedB;
      },
    },
    energyBefore: {
      describe: "Total kinetic energy before (J)",
      compute: (s) => kinetic(s.massA, s.velocityA) + kinetic(s.massB, s.velocityB),
    },
    energyNow: {
      describe: "Total kinetic energy now (J)",
      compute: (s) => {
        const m = momentAt(s, s.time);
        return kinetic(s.massA, m.speedA) + kinetic(s.massB, m.speedB);
      },
    },
  },
  actions: {
    [CollisionAction.Play]: act({
      describe: "Let the blocks go (from where they are) until they leave the track",
      byLearner: true,
      args: z.object({}).strict(),
      run: () =>
        task(async (context) => {
          const start = context.get();
          if (!isOnTrack(start, momentAt(start, start.time)) || start.time >= MAX_TIME) {
            context.set({ time: 0 });
          }
          context.set({ isRunning: true });
          while (context.get().isRunning) {
            await context.wait(STEP);
            const s = context.get();
            if (!s.isRunning) break;
            const time = Math.min(MAX_TIME, s.time + STEP);
            const moment = momentAt(s, time);
            const isDone = !isOnTrack(s, moment) || time >= MAX_TIME;
            context.set(isDone ? { time, isRunning: false } : { time });
            if (moment.hasCollided && !momentAt(s, s.time).hasCollided) {
              context.emit(CollisionSignal.Collided, {
                speedA: moment.speedA,
                speedB: moment.speedB,
              });
            }
          }
        }),
    }),
    [CollisionAction.Pause]: act({
      describe: "Freeze the blocks where they are",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ isRunning: false }),
    }),
    [CollisionAction.Reset]: act({
      describe: "Put the blocks back at the start",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set(RESTART),
    }),
    [CollisionAction.SetMass]: act({
      describe: "Set a block's mass (kg)",
      byLearner: true,
      args: z.object({ block: blockSchema, mass: massSchema }).strict(),
      run: (_s, a) =>
        set(a.block === Block.A ? { ...RESTART, massA: a.mass } : { ...RESTART, massB: a.mass }),
    }),
    [CollisionAction.SetVelocity]: act({
      describe: "Set a block's velocity before the collision (m/s, positive to the right)",
      byLearner: true,
      args: z.object({ block: blockSchema, velocity: velocitySchema }).strict(),
      run: (_s, a) =>
        set(
          a.block === Block.A
            ? { ...RESTART, velocityA: a.velocity }
            : { ...RESTART, velocityB: a.velocity },
        ),
    }),
    [CollisionAction.SetBounce]: act({
      describe: "How bouncy the collision is: 1 elastic, 0 sticky",
      byLearner: true,
      args: z.object({ bounce: z.number().min(0).max(1) }).strict(),
      run: (_s, a) => set({ ...RESTART, bounce: a.bounce }),
    }),
  },
  signals: {
    [CollisionSignal.Collided]: { describe: "The blocks hit; `speedA` and `speedB` are after" },
  },
});
