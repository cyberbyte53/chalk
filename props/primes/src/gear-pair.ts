import { type TaskContext, actionsFor, defineProp, set, task } from "@chalk/prop";
import { z } from "zod";
import { lcm } from "./arithmetic";
import { button, turnsText } from "./seen";

export const MIN_TEETH = 4;
export const MAX_TEETH = 40;
/** Teeth that pass the meeting point each second while the gears turn. */
export const TEETH_PER_SECOND = 14;
/** The longest a turn takes, however many teeth it is. */
export const MAX_TURN_SECONDS = 4;
const FRAME = 1 / 30;

export const GearPairAction = {
  TurnBy: "turnBy",
  TurnToMeet: "turnToMeet",
  SetTeeth: "setTeeth",
  StartAgain: "startAgain",
} as const;

export const GearPairDerived = {
  MeetEvery: "meetEvery",
  TurnsA: "turnsA",
  TurnsB: "turnsB",
  IsMarkMet: "isMarkMet",
  TimesMet: "timesMet",
} as const;

export const GearPairSignal = { Met: "met", Stopped: "stopped" } as const;

const teeth = z.number().int().min(MIN_TEETH).max(MAX_TEETH);

const gearPairState = z
  .object({
    teethA: teeth,
    teethB: teeth,
    /** How many teeth have passed the point where the gears touch (the same for both gears). */
    turned: z.number().min(0),
  })
  .strict();
export type GearPairState = z.infer<typeof gearPairState>;

/** Whether both painted teeth are back at the meeting point: `turned` a multiple of both tooth counts. */
export function isMarkMet(s: GearPairState): boolean {
  const every = lcm(s.teethA, s.teethB);
  const k = s.turned / every;
  return s.turned > 0 && Math.abs(k - Math.round(k)) < 1e-9;
}

const act = actionsFor<GearPairState>();

/** Turns the gears smoothly through the board's clock until `turned` reaches `to`. */
function turnTo(to: number) {
  return task<GearPairState>(async (c: TaskContext<GearPairState>) => {
    const from = c.get().turned;
    const seconds = Math.min(MAX_TURN_SECONDS, Math.abs(to - from) / TEETH_PER_SECOND);
    const frames = Math.max(1, Math.round(seconds / FRAME));
    for (let i = 1; i <= frames; i++) {
      await c.wait(seconds / frames);
      c.set({ turned: from + ((to - from) * i) / frames });
    }
    c.set({ turned: to });
    const now = c.get();
    c.emit(GearPairSignal.Stopped, { turned: to });
    if (isMarkMet(now)) {
      c.emit(GearPairSignal.Met, {
        turned: to,
        turnsA: to / now.teethA,
        turnsB: to / now.teethB,
      });
    }
  });
}

/**
 * Two gears in mesh, each with one painted tooth that starts at the point where they touch. As they
 * turn, the same number of teeth passes that point on both; the painted teeth meet there again only
 * after a common multiple of the two tooth counts, first after their LCM.
 */
export const gearPair = defineProp({
  type: "gearPair",
  describe:
    "Two meshing gears with a and b teeth, one tooth on each painted, both starting at the point where the gears touch. Turning passes the same number of teeth on both gears, so the painted teeth are back together only after a common multiple of a and b teeth; the first time is LCM(a, b).",
  state: gearPairState,
  defaults: { teethA: 12, teethB: 18, turned: 0 },
  derived: {
    [GearPairDerived.MeetEvery]: {
      describe: "Teeth between meetings of the painted teeth: LCM(a, b)",
      compute: (s) => lcm(s.teethA, s.teethB),
    },
    [GearPairDerived.TurnsA]: {
      describe: "Full turns of the first gear so far (can be a fraction)",
      compute: (s) => s.turned / s.teethA,
    },
    [GearPairDerived.TurnsB]: {
      describe: "Full turns of the second gear so far",
      compute: (s) => s.turned / s.teethB,
    },
    [GearPairDerived.IsMarkMet]: {
      describe: "The painted teeth are together again at the meeting point",
      compute: isMarkMet,
    },
    [GearPairDerived.TimesMet]: {
      describe: "How many times the painted teeth have met again",
      compute: (s) => Math.floor(s.turned / lcm(s.teethA, s.teethB) + 1e-9),
    },
  },
  actions: {
    [GearPairAction.TurnBy]: act({
      describe: "Turn the gears by some teeth (the learner's turn buttons)",
      byLearner: true,
      args: z.object({ teeth: z.number().int().min(1).max(2000) }).strict(),
      run: (s, a) => turnTo(s.turned + a.teeth),
    }),
    [GearPairAction.TurnToMeet]: act({
      describe: "Turn until the painted teeth meet again",
      byLearner: true,
      reveals: true,
      args: z.object({}).strict(),
      run: (s) => {
        const every = lcm(s.teethA, s.teethB);
        return turnTo((Math.floor(s.turned / every + 1e-9) + 1) * every);
      },
    }),
    [GearPairAction.SetTeeth]: act({
      describe: "Gears with other tooth counts, back to the start",
      byLearner: true,
      args: z.object({ teethA: teeth, teethB: teeth }).strict(),
      run: (_s, a) => set({ teethA: a.teethA, teethB: a.teethB, turned: 0 }),
    }),
    [GearPairAction.StartAgain]: act({
      describe: "Back to the start, painted teeth together",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ turned: 0 }),
    }),
  },
  signals: {
    [GearPairSignal.Met]: {
      describe: "The painted teeth are together again: { turned, turnsA, turnsB }",
    },
    [GearPairSignal.Stopped]: { describe: "A turn finished: { turned }" },
  },
  observe: (s) => {
    const every = lcm(s.teethA, s.teethB);
    // A painted tooth is at the meeting point when a whole number of its turns has passed.
    const isHome = (teeth: number) => {
      const k = s.turned / teeth;
      return Math.abs(k - Math.round(k)) < 1e-9;
    };
    const atPoint = [isHome(s.teethA) ? "A" : "", isHome(s.teethB) ? "B" : ""].filter(Boolean);
    const met = Math.floor(s.turned / every + 1e-9);
    return {
      summary: `two meshing gears with ${s.teethA} and ${s.teethB} teeth, one tooth on each painted, ${Math.round(s.turned)} teeth turned${atPoint.length === 2 ? ": both painted teeth at the meeting point" : ""}`,
      elements: [
        { id: "gearA", value: `${s.teethA} teeth, ${turnsText(s.turned / s.teethA)} turns` },
        { id: "gearB", value: `${s.teethB} teeth, ${turnsText(s.turned / s.teethB)} turns` },
        {
          id: "meetingPoint",
          value:
            atPoint.length === 0
              ? "no painted tooth here"
              : atPoint.length === 2
                ? "both painted teeth here"
                : `gear ${atPoint[0]}'s painted tooth here`,
        },
        { id: "teethTurned", value: Math.round(s.turned) },
        button("turn:1"),
        { id: "turn:a", value: `turn by ${s.teethA}` },
        { id: "turn:b", value: `turn by ${s.teethB}` },
        button("startAgain", s.turned > 0),
      ],
      // When they meet again isn't on screen until it has happened.
      ...(met >= 1 ? {} : { hidden: { meetEvery: every } }),
    };
  },
});
