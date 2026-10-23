import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Nuclear fission and the chain reaction (NCERT 14.3.4). A low-energy neutron hits a uranium
 * nucleus; it splits into two lighter nuclei, gives out energy and 3 more neutrons. Uncontrolled,
 * every neutron splits another nucleus, so each generation has 3 times as many fissions: 1, 3, 9,
 * 27. In a reactor the rate is controlled: all but one of each fission's neutrons are absorbed,
 * so one fission leads to exactly one more, at a steady rate. The energy comes from mass lost:
 * E = Δm c², and 1 u of mass is worth about 931 MeV (NCERT's Do You Know).
 */

export const NEUTRONS_PER_FISSION = 3;
export const MAX_GENERATION = 3;
export const MEV_PER_U = 931;
/** 1 eV in joules (NCERT). */
export const JOULES_PER_EV = 1.602e-19;

export const FissionAction = {
  Next: "next",
  Reset: "reset",
  SetControl: "setControl",
  SetMass: "setMass",
} as const;
export const FissionSignal = { Split: "split" } as const;
export const FissionDerived = {
  Fissions: "fissions",
  Total: "total",
  Neutrons: "neutrons",
  Mev: "mev",
} as const;
export const FissionPart = {
  Chain: "chain",
  Calculator: "calculator",
  Controls: "controls",
} as const;

const fissionState = z
  .object({
    /** Generations shown so far: 0 is the first neutron about to hit. */
    generation: z.number().int().min(0).max(MAX_GENERATION),
    isControlled: z.boolean(),
    /** The calculator's mass lost, in atomic mass units (u), 0 … 1 in steps of 0.05. */
    massLost: z.number().min(0).max(1),
    showCalculator: z.boolean(),
    canStep: z.boolean(),
    canControl: z.boolean(),
    canSetMass: z.boolean(),
  })
  .strict();
export type FissionState = z.infer<typeof fissionState>;

/** Fissions in generation g (1 is the first split). */
export function fissionsIn(g: number, isControlled: boolean): number {
  if (g < 1) return 0;
  return isControlled ? 1 : NEUTRONS_PER_FISSION ** (g - 1);
}

/** All fissions up to and including generation g. */
export function totalFissions(g: number, isControlled: boolean): number {
  let sum = 0;
  for (let i = 1; i <= g; i++) sum += fissionsIn(i, isControlled);
  return sum;
}

/** Free neutrons heading for the next generation's nuclei. */
export function neutronsOut(g: number, isControlled: boolean): number {
  if (g < 1) return 1;
  return isControlled ? 1 : fissionsIn(g, false) * NEUTRONS_PER_FISSION;
}

export const mevOf = (u: number): number => Math.round(u * MEV_PER_U * 10) / 10;

export function describeFission(s: FissionState): string {
  const head = s.isControlled
    ? "A controlled chain reaction, as in a reactor: from each split, all neutrons but one are absorbed."
    : "An uncontrolled chain reaction: every neutron from a split goes on to split another uranium nucleus.";
  const now =
    s.generation === 0
      ? "One slow neutron is heading for a uranium nucleus."
      : `After ${s.generation} generation${s.generation === 1 ? "" : "s"}: ${fissionsIn(s.generation, s.isControlled)} fission${fissionsIn(s.generation, s.isControlled) === 1 ? "" : "s"} in the last one, ${totalFissions(s.generation, s.isControlled)} in all, each giving out energy and 3 neutrons.`;
  const calc = s.showCalculator
    ? ` Mass lost ${s.massLost} u gives about ${mevOf(s.massLost)} MeV (E = Δm c²).`
    : "";
  return `${head} ${now}${calc}`;
}

const act = actionsFor<FissionState>();

export const fission = defineProp({
  type: "fission",
  describe:
    "Nuclear fission (NCERT 14.3.4): a slow neutron splits a uranium nucleus into two lighter nuclei, energy and 3 neutrons. Step generation by generation: uncontrolled, the splits multiply 1, 3, 9, 27; controlled, as in a reactor, one split leads to exactly one more. A calculator turns mass lost (u) into energy at 931 MeV per u (E = Δm c²).",
  state: fissionState,
  defaults: {
    generation: 0,
    isControlled: false,
    massLost: 0.2,
    showCalculator: false,
    canStep: true,
    canControl: true,
    canSetMass: false,
  },
  inputs: ["showCalculator", "canStep", "canControl", "canSetMass"],
  derived: {
    [FissionDerived.Fissions]: {
      describe: "Fissions in the latest generation",
      compute: (s) => fissionsIn(s.generation, s.isControlled),
    },
    [FissionDerived.Total]: {
      describe: "Fissions so far, all generations",
      compute: (s) => totalFissions(s.generation, s.isControlled),
    },
    [FissionDerived.Neutrons]: {
      describe: "Free neutrons heading for the next nuclei",
      compute: (s) => neutronsOut(s.generation, s.isControlled),
    },
    [FissionDerived.Mev]: {
      describe: "The calculator's energy for the mass lost, MeV (931 MeV per u)",
      compute: (s) => mevOf(s.massLost),
    },
  },
  actions: {
    [FissionAction.Next]: act({
      describe: "Let the neutrons hit: the next generation of fissions",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const generation = Math.min(MAX_GENERATION, s.generation + 1);
        return set(
          { generation },
          {
            signal: FissionSignal.Split,
            payload: {
              generation,
              fissions: fissionsIn(generation, s.isControlled),
              total: totalFissions(generation, s.isControlled),
            },
          },
        );
      },
    }),
    [FissionAction.Reset]: act({
      describe: "Start again with one neutron",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ generation: 0 }),
    }),
    [FissionAction.SetControl]: act({
      describe: "Controlled (as in a reactor) or uncontrolled; starts again",
      byLearner: true,
      args: z.object({ isControlled: z.boolean() }).strict(),
      run: (_s, a) => set({ isControlled: a.isControlled, generation: 0 }),
    }),
    [FissionAction.SetMass]: act({
      describe: "Calculator: set the mass lost, u (0 … 1)",
      byLearner: true,
      args: z.object({ massLost: z.number().min(0).max(1) }).strict(),
      run: (_s, a) => set({ massLost: Math.round(a.massLost * 100) / 100 }),
    }),
  },
  signals: {
    [FissionSignal.Split]: {
      describe: "A generation of fissions happened; the payload has how many",
    },
  },
  observe: (s) => ({
    summary: describeFission(s),
    elements: [
      {
        id: FissionPart.Chain,
        value: `generation ${s.generation}, ${totalFissions(s.generation, s.isControlled)} fissions`,
      },
      ...(s.showCalculator
        ? [{ id: FissionPart.Calculator, value: `${s.massLost} u → ${mevOf(s.massLost)} MeV` }]
        : []),
    ],
  }),
  parts: (s) => [
    FissionPart.Chain,
    ...(s.showCalculator ? [FissionPart.Calculator] : []),
    FissionPart.Controls,
  ],
});
