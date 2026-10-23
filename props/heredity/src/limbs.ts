import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Forelimbs side by side (NCERT 9.5.1): the bones of a human arm, a dog's front leg, a bat's wing,
 * a bird's wing and a whale's flipper are the same set (upper arm, forearm, wrist, fingers), each
 * coloured the same, changed for a different job: homologous. A butterfly's wing does the same job
 * as a bird's but has no bones at all: analogous.
 */

export const Limb = {
  Human: "human",
  Dog: "dog",
  Bat: "bat",
  Bird: "bird",
  Whale: "whale",
  Butterfly: "butterfly",
} as const;
export type Limb = (typeof Limb)[keyof typeof Limb];
export const LIMBS = [
  Limb.Human,
  Limb.Dog,
  Limb.Bat,
  Limb.Bird,
  Limb.Whale,
  Limb.Butterfly,
] as const;

export const Relation = {
  /** Same bones, same plan, different jobs: from a common ancestor. */
  Homologous: "homologous",
  /** Same job, different design: not from a common ancestor. */
  Analogous: "analogous",
  /** Bird and bat: the arm bones are homologous, but the wings as wings are analogous. */
  Both: "both",
  /** Neither the same bones nor the same job. */
  Unrelated: "unrelated",
} as const;
export type Relation = (typeof Relation)[keyof typeof Relation];

export const LimbAction = { Choose: "choose", Pick: "pick" } as const;
export const LimbSignal = { Compared: "compared" } as const;
export const LimbDerived = { Relation: "relation", SameJob: "sameJob" } as const;
export const LimbPart = {
  First: "first",
  Second: "second",
  Verdict: "verdict",
  Controls: "controls",
} as const;
export const Slot = { First: "first", Second: "second" } as const;

const VERTEBRATE: ReadonlySet<Limb> = new Set([
  Limb.Human,
  Limb.Dog,
  Limb.Bat,
  Limb.Bird,
  Limb.Whale,
]);
const FLIES: ReadonlySet<Limb> = new Set([Limb.Bat, Limb.Bird, Limb.Butterfly]);

/** What each limb is for. */
export const JOB: Readonly<Record<Limb, string>> = {
  human: "holding and grasping",
  dog: "walking and running",
  bat: "flying",
  bird: "flying",
  whale: "swimming",
  butterfly: "flying",
};

/** How two limbs are related. */
export function relationOf(a: Limb, b: Limb): Relation | null {
  if (a === b) return null;
  if ((a === Limb.Bat && b === Limb.Bird) || (a === Limb.Bird && b === Limb.Bat))
    return Relation.Both;
  if (VERTEBRATE.has(a) && VERTEBRATE.has(b)) return Relation.Homologous;
  if (FLIES.has(a) && FLIES.has(b)) return Relation.Analogous;
  return Relation.Unrelated;
}

const limbState = z
  .object({
    first: z.nativeEnum(Limb).nullable(),
    second: z.nativeEnum(Limb).nullable(),
    /** Whether matching bones share a colour. */
    showColours: z.boolean(),
    canChoose: z.boolean(),
  })
  .strict();
export type LimbState = z.infer<typeof limbState>;

export function relationNow(s: Pick<LimbState, "first" | "second">): Relation | null {
  return s.first === null || s.second === null ? null : relationOf(s.first, s.second);
}

const NAME: Readonly<Record<Limb, string>> = {
  human: "a human arm",
  dog: "a dog's front leg",
  bat: "a bat's wing",
  bird: "a bird's wing",
  whale: "a whale's flipper",
  butterfly: "a butterfly's wing",
};

const VERDICT: Readonly<Record<Relation, string>> = {
  homologous:
    "homologous: the same bones in the same plan, changed for different jobs, so they come from a common ancestor",
  analogous:
    "analogous: they do the same job, but are built completely differently, so they do not come from a common ancestor",
  both: "the arm bones are homologous (same plan), but the wings are analogous: the bat's is skin stretched between long fingers, the bird's is feathers along the arm",
  unrelated: "neither the same bones nor the same job",
};

export function describeLimbs(s: LimbState): string {
  const shown = [s.first, s.second].filter((x): x is Limb => x !== null);
  const r = relationNow(s);
  return `Comparing ${shown.map((l) => `${NAME[l]} (for ${JOB[l]})`).join(" and ") || "nothing yet"}${r === null ? "" : `: ${VERDICT[r]}`}. Matching bones share a colour: upper arm, forearm, wrist, fingers; the butterfly's wing has no bones.`;
}

const act = actionsFor<LimbState>();

export const limbBones = defineProp({
  type: "limbBones",
  describe:
    "Forelimbs side by side with matching bones in matching colours (upper arm, forearm, wrist, fingers): a human arm, a dog's front leg, a bat's wing, a bird's wing, a whale's flipper, and a butterfly's wing (no bones). Pick two to compare: homologous (same bones, different jobs: common ancestry), analogous (same job, different design), or bird and bat (homologous arm bones, analogous wings).",
  state: limbState,
  defaults: { first: Limb.Human, second: Limb.Bat, showColours: true, canChoose: true },
  inputs: ["first", "second", "showColours", "canChoose"],
  derived: {
    [LimbDerived.Relation]: {
      describe:
        "How the two shown limbs are related: homologous, analogous, both (bird and bat) or unrelated",
      compute: (s) => relationNow(s),
    },
    [LimbDerived.SameJob]: {
      describe: "Whether the two shown limbs do the same job",
      compute: (s) =>
        s.first === null || s.second === null ? null : JOB[s.first] === JOB[s.second],
    },
  },
  actions: {
    [LimbAction.Choose]: act({
      describe: "Tap a limb: it joins the comparison, replacing the older of the two",
      byLearner: true,
      args: z.object({ limb: z.nativeEnum(Limb) }).strict(),
      run: (s, a) => {
        if (a.limb === s.first || a.limb === s.second) return set({});
        const next =
          s.second === null
            ? { first: s.first ?? a.limb, second: s.first === null ? null : a.limb }
            : { first: s.second, second: a.limb };
        const r =
          next.first === null || next.second === null ? null : relationOf(next.first, next.second);
        return set(next, { signal: LimbSignal.Compared, payload: { relation: r } });
      },
    }),
    [LimbAction.Pick]: act({
      describe: "Put a limb in one of the two places",
      args: z.object({ slot: z.nativeEnum(Slot), limb: z.nativeEnum(Limb) }).strict(),
      run: (_s, a) => set(a.slot === Slot.First ? { first: a.limb } : { second: a.limb }),
    }),
  },
  signals: {
    [LimbSignal.Compared]: {
      describe: "A new pair is compared; `relation` is how they are related",
    },
  },
  observe: (s) => ({
    summary: describeLimbs(s),
    elements: [
      ...(s.first === null ? [] : [{ id: LimbPart.First, value: NAME[s.first] }]),
      ...(s.second === null ? [] : [{ id: LimbPart.Second, value: NAME[s.second] }]),
      ...(relationNow(s) === null ? [] : [{ id: LimbPart.Verdict, value: relationNow(s) }]),
    ],
  }),
  parts: (s) => [
    ...(s.first === null ? [] : [LimbPart.First]),
    ...(s.second === null ? [] : [LimbPart.Second]),
    ...(relationNow(s) === null ? [] : [LimbPart.Verdict]),
    LimbPart.Controls,
  ],
});
