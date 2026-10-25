import { type Element, actionsFor, defineProp, repeat, seq, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Electrolytic refining of copper (NCERT 3.4.6, Fig 3.12): a thick block of impure copper as the
 * anode (+), a thin strip of pure copper as the cathode (−), in acidified copper sulphate solution.
 * With the current on, copper from the anode dissolves into the solution and the same amount of
 * pure copper deposits on the cathode; soluble impurities stay in the solution, insoluble ones
 * fall under the anode as anode mud.
 */

export const RefiningAction = { Switch: "switch", Tick: "tick", Reset: "reset" } as const;
export const RefiningSignal = { Switched: "switched", Done: "done" } as const;
export const RefiningDerived = {
  AnodeLeft: "anodeLeft",
  CathodeGained: "cathodeGained",
  IsDone: "isDone",
} as const;
export const RefiningPart = {
  Anode: "anode",
  Cathode: "cathode",
  Solution: "solution",
  Mud: "mud",
  Switch: "switch",
} as const;

/** Seconds of current from start to the anode being used up. */
export const REFINE_SECONDS = 8;
/** The share of the anode that is copper; the rest is impurity (some of it falls as mud). */
export const COPPER_SHARE = 0.85;

const refiningState = z
  .object({
    isOn: z.boolean(),
    /** How far the refining has gone, 0 to 1. */
    progress: z.number().min(0).max(1),
    /** Name the anode, cathode, solution and anode mud. */
    showLabels: z.boolean(),
    canSwitch: z.boolean(),
  })
  .strict();
export type RefiningState = z.infer<typeof refiningState>;

/** Of the anode's copper, the share still on it. */
export const anodeLeft = (s: Pick<RefiningState, "progress">) => 1 - s.progress;
/** The cathode gains exactly the copper the anode lost. */
export const cathodeGained = (s: Pick<RefiningState, "progress">) => s.progress;

export function describeRefining(s: RefiningState): string {
  const pct = Math.round(s.progress * 100);
  return `Electrolytic refining of copper: impure copper anode (+), pure copper cathode (−), acidified copper sulphate solution. ${s.isOn ? "The current is on: copper ions move from the anode to the cathode." : "The current is off."} ${pct === 0 ? "Nothing has moved yet." : `${pct}% of the anode's copper has dissolved and the same amount of pure copper has deposited on the cathode; anode mud has collected under the anode.`}`;
}

/** Seconds between steps while the current is on. */
const STEP = 0.1;

const act = actionsFor<RefiningState>();

export const refiningCell = defineProp({
  type: "refiningCell",
  describe:
    "Electrolytic refining of copper (NCERT Fig 3.12): an impure copper anode (+), a thin pure copper cathode (−), acidified copper sulphate solution. With the current on, copper dissolves from the anode as Cu²⁺ ions and deposits as pure copper on the cathode: the anode thins, the cathode thickens by the same amount. Soluble impurities stay in the solution; insoluble ones settle under the anode as anode mud.",
  state: refiningState,
  defaults: { isOn: false, progress: 0, showLabels: true, canSwitch: true },
  inputs: ["showLabels", "canSwitch"],
  derived: {
    [RefiningDerived.AnodeLeft]: {
      describe: "The share of the anode's copper still on it, 1 to 0",
      compute: (s) => anodeLeft(s),
    },
    [RefiningDerived.CathodeGained]: {
      describe:
        "The copper the cathode has gained, as a share of the anode's: always what the anode lost",
      compute: (s) => cathodeGained(s),
    },
    [RefiningDerived.IsDone]: {
      describe: "The anode's copper is used up",
      compute: (s) => s.progress >= 1,
    },
  },
  actions: {
    [RefiningAction.Switch]: act({
      describe: "Switch the current on or off; while on, refining goes on (about 8 seconds in all)",
      byLearner: true,
      args: z.object({ on: z.boolean() }).strict(),
      run: (s, a) => {
        if (!a.on || s.progress >= 1)
          return set(
            { isOn: a.on && s.progress < 1 },
            { signal: RefiningSignal.Switched, payload: { on: a.on } },
          );
        return seq(
          set({ isOn: true }, { signal: RefiningSignal.Switched, payload: { on: true } }),
          repeat(STEP, RefiningAction.Tick, { while: (now) => now.isOn && now.progress < 1 }),
        );
      },
    }),
    [RefiningAction.Tick]: act({
      describe: "Move on by one step while the current is on (its own clock)",
      internal: true,
      args: z.object({}).strict(),
      run: (s) => {
        const progress = Math.min(1, s.progress + STEP / REFINE_SECONDS);
        if (progress < 1) return set({ progress });
        return set({ progress, isOn: false }, { signal: RefiningSignal.Done, payload: {} });
      },
    }),
    [RefiningAction.Reset]: act({
      describe: "Start again with a fresh impure anode",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ isOn: false, progress: 0 }),
    }),
  },
  signals: {
    [RefiningSignal.Switched]: { describe: "The current was switched on or off", isCommit: true },
    [RefiningSignal.Done]: { describe: "The anode's copper has all moved to the cathode" },
  },
  observe: (s) => {
    const elements: Element[] = [
      {
        id: RefiningPart.Anode,
        value: `impure copper (+), ${Math.round(anodeLeft(s) * 100)}% left`,
      },
      {
        id: RefiningPart.Cathode,
        value: `pure copper (−), gained ${Math.round(cathodeGained(s) * 100)}%`,
      },
      { id: RefiningPart.Solution, value: "acidified copper sulphate" },
      { id: RefiningPart.Switch, value: s.isOn ? "on" : "off" },
    ];
    if (s.progress > 0) elements.push({ id: RefiningPart.Mud, value: "anode mud under the anode" });
    return { summary: describeRefining(s), elements };
  },
  parts: (s) => [
    RefiningPart.Anode,
    RefiningPart.Cathode,
    RefiningPart.Solution,
    ...(s.progress > 0 ? [RefiningPart.Mud] : []),
    ...(s.canSwitch ? [RefiningPart.Switch] : []),
  ],
});
