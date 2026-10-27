import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import type { Words } from "./draw";

/**
 * The reflex arc (NCERT 7.1.1, Fig. 7.2): a hand touches a hot tawa. On the reflex path the message
 * goes from the receptor in the skin along a sensory neuron to the spinal cord, is passed by a relay
 * neuron straight to a motor neuron, and the arm muscle pulls the hand away; the message still goes
 * on up to the brain, which learns about it afterwards. On the "think first" path the message goes
 * all the way up to the brain, is thought about, and comes back down: it takes so long that the hand
 * is burnt. Time here is in "ticks", a relative scale, not milliseconds.
 */

export const ReflexPath = { Reflex: "reflex", Brain: "brain" } as const;
export type ReflexPath = (typeof ReflexPath)[keyof typeof ReflexPath];

/** Where the message is, in order, on each path. */
export const ReflexAt = {
  Touch: "touch",
  Sensory: "sensory",
  SpinalCord: "spinalCord",
  UpToBrain: "upToBrain",
  Thinking: "thinking",
  DownFromBrain: "downFromBrain",
  Motor: "motor",
  Muscle: "muscle",
} as const;
export type ReflexAt = (typeof ReflexAt)[keyof typeof ReflexAt];

export const REFLEX_STEPS: Readonly<Record<ReflexPath, readonly ReflexAt[]>> = {
  [ReflexPath.Reflex]: [
    ReflexAt.Touch,
    ReflexAt.Sensory,
    ReflexAt.SpinalCord,
    ReflexAt.Motor,
    ReflexAt.Muscle,
  ],
  [ReflexPath.Brain]: [
    ReflexAt.Touch,
    ReflexAt.Sensory,
    ReflexAt.SpinalCord,
    ReflexAt.UpToBrain,
    ReflexAt.Thinking,
    ReflexAt.DownFromBrain,
    ReflexAt.Motor,
    ReflexAt.Muscle,
  ],
};

/** Ticks each stage costs: long nerves and thinking cost the most. */
export const TICKS: Readonly<Record<ReflexAt, number>> = {
  [ReflexAt.Touch]: 0,
  [ReflexAt.Sensory]: 2,
  [ReflexAt.SpinalCord]: 1,
  [ReflexAt.UpToBrain]: 3,
  [ReflexAt.Thinking]: 5,
  [ReflexAt.DownFromBrain]: 3,
  [ReflexAt.Motor]: 2,
  [ReflexAt.Muscle]: 1,
};
/** After this many ticks on the tawa, the skin burns. */
export const BURN_AT = 8;

export const ReflexAction = { Choose: "choose", Next: "next", Reset: "reset" } as const;
export const ReflexSignal = { Stepped: "stepped", Done: "done" } as const;
export const ReflexDerived = {
  At: "at",
  Ticks: "ticks",
  IsDone: "isDone",
  IsBurnt: "isBurnt",
  TotalTicks: "totalTicks",
} as const;
export const ReflexPart = {
  Hand: "hand",
  SpinalCord: "spinalCord",
  Brain: "brain",
  Muscle: "muscle",
  Next: "next",
} as const;

const reflexState = z
  .object({
    path: z.nativeEnum(ReflexPath),
    step: z.number().int().min(0).max(7),
    canChoose: z.boolean(),
    canStep: z.boolean(),
    showNames: z.boolean(),
  })
  .strict();
export type ReflexState = z.infer<typeof reflexState>;

export function stepsOf(path: ReflexPath): readonly ReflexAt[] {
  return REFLEX_STEPS[path];
}
export function atOf(s: Pick<ReflexState, "path" | "step">): ReflexAt {
  return stepsOf(s.path)[s.step] ?? ReflexAt.Touch;
}
/** Ticks used up to and including this step. */
export function ticksAt(path: ReflexPath, step: number): number {
  return stepsOf(path)
    .slice(0, step + 1)
    .reduce((sum, at) => sum + TICKS[at], 0);
}
export function totalTicks(path: ReflexPath): number {
  return ticksAt(path, stepsOf(path).length - 1);
}
export function isDone(s: Pick<ReflexState, "path" | "step">): boolean {
  return s.step === stepsOf(s.path).length - 1;
}
/** Burnt once the time on the tawa passes the limit before the hand is pulled away. */
export function isBurnt(s: Pick<ReflexState, "path" | "step">): boolean {
  return ticksAt(s.path, s.step) > BURN_AT;
}

export function reflexCaption(s: Pick<ReflexState, "path" | "step">): Words {
  const at = atOf(s);
  const reflex = s.path === ReflexPath.Reflex;
  switch (at) {
    case ReflexAt.Touch:
      return {
        en: "The hand touches the hot tawa. Receptors in the skin detect the heat.",
        hi: "हाथ गरम तवे को छूता है। त्वचा के ग्राही ऊष्मा का पता लगाते हैं।",
      };
    case ReflexAt.Sensory:
      return {
        en: "The message travels along a sensory neuron, from the skin towards the spinal cord.",
        hi: "संदेश एक संवेदी तंत्रिका कोशिका के साथ, त्वचा से मेरुरज्जु की ओर जाता है।",
      };
    case ReflexAt.SpinalCord:
      return reflex
        ? {
            en: "In the spinal cord, a relay neuron passes it straight to a motor neuron. A copy also goes on up to the brain.",
            hi: "मेरुरज्जु में एक प्रसारण तंत्रिका कोशिका इसे सीधे प्रेरक तंत्रिका कोशिका को दे देती है। एक प्रति ऊपर मस्तिष्क तक भी जाती है।",
          }
        : {
            en: "The message reaches the spinal cord, but this time it is not passed on here.",
            hi: "संदेश मेरुरज्जु तक पहुँचता है, पर इस बार यहाँ आगे नहीं दिया जाता।",
          };
    case ReflexAt.UpToBrain:
      return {
        en: "It travels all the way up the spinal cord to the brain.",
        hi: "यह मेरुरज्जु के साथ ऊपर पूरा मस्तिष्क तक जाता है।",
      };
    case ReflexAt.Thinking:
      return {
        en: "The brain thinks: hot... pain... I might get burnt... move the hand! Thinking takes time.",
        hi: "मस्तिष्क सोचता है: गरम... दर्द... जल सकता हूँ... हाथ हटाओ! सोचने में समय लगता है।",
      };
    case ReflexAt.DownFromBrain:
      return {
        en: "The order comes all the way back down the spinal cord.",
        hi: "आदेश मेरुरज्जु के साथ पूरा नीचे वापस आता है।",
      };
    case ReflexAt.Motor:
      return {
        en: "A motor neuron carries the order to the arm muscle.",
        hi: "एक प्रेरक तंत्रिका कोशिका आदेश को बाँह की पेशी तक ले जाती है।",
      };
    case ReflexAt.Muscle:
      return reflex
        ? {
            en: "The muscle pulls the hand away, in time. You did it without thinking: a reflex action.",
            hi: "पेशी हाथ को समय पर खींच लेती है। तुमने यह बिना सोचे किया: एक प्रतिवर्ती क्रिया।",
          }
        : {
            en: "The muscle pulls the hand away, but too late: the hand is already burnt.",
            hi: "पेशी हाथ खींचती है, पर बहुत देर से: हाथ पहले ही जल चुका है।",
          };
  }
}

export function describeReflex(s: ReflexState): string {
  const which =
    s.path === ReflexPath.Reflex
      ? "the reflex path (turned round in the spinal cord)"
      : "the think-first path (up to the brain and back)";
  return `A hand on a hot tawa, the arm's nerves, the spinal cord in the back and the brain in the head; the message follows ${which}. ${reflexCaption(s).en} Time so far: ${ticksAt(s.path, s.step)} of ${BURN_AT} ticks before the skin burns.`;
}

const act = actionsFor<ReflexState>();

export const reflexArc = defineProp({
  type: "reflexArc",
  describe:
    "A hand touches a hot tawa and the message is stepped along one of two paths: the reflex arc (receptor → sensory neuron → relay in the spinal cord → motor neuron → arm muscle, with a copy going on up to the brain) or the think-first path (up the spinal cord to the brain, thinking, and back down). A time bar fills as the message travels; the think-first path passes the burn line before the hand is pulled away, the reflex path does not. Ticks are a relative scale, not real milliseconds.",
  state: reflexState,
  defaults: {
    path: ReflexPath.Reflex,
    step: 0,
    canChoose: true,
    canStep: true,
    showNames: true,
  },
  inputs: ["path", "canChoose", "canStep", "showNames"],
  invariant: (s) =>
    s.step < stepsOf(s.path).length ? undefined : "step must be within the chosen path",
  derived: {
    [ReflexDerived.At]: {
      describe:
        "Where the message is: touch, sensory, spinalCord, upToBrain, thinking, downFromBrain, motor or muscle",
      compute: (s) => atOf(s),
    },
    [ReflexDerived.Ticks]: {
      describe: "Time used so far, in ticks (relative)",
      compute: (s) => ticksAt(s.path, s.step),
    },
    [ReflexDerived.TotalTicks]: {
      describe: "The time the whole path takes, in ticks",
      compute: (s) => totalTicks(s.path),
    },
    [ReflexDerived.IsDone]: {
      describe: "Whether the hand has been pulled away",
      compute: (s) => isDone(s),
    },
    [ReflexDerived.IsBurnt]: {
      describe: "Whether the time so far has passed the burn line",
      compute: (s) => isBurnt(s),
    },
  },
  actions: {
    [ReflexAction.Choose]: act({
      describe: "Pick the path for the message (starts again from the touch)",
      byLearner: true,
      args: z.object({ path: z.nativeEnum(ReflexPath) }).strict(),
      run: (_s, a) => set({ path: a.path, step: 0 }),
    }),
    [ReflexAction.Next]: act({
      describe: "Move the message one stage on (after the hand is pulled away, start again)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (isDone(s)) return set({ step: 0 });
        const step = s.step + 1;
        const next = { path: s.path, step };
        if (isDone(next))
          return set(
            { step },
            {
              signal: ReflexSignal.Done,
              payload: {
                path: s.path,
                isBurnt: isBurnt(next),
                ticks: ticksAt(s.path, step),
              },
            },
          );
        return set({ step }, { signal: ReflexSignal.Stepped, payload: { step, at: atOf(next) } });
      },
    }),
    [ReflexAction.Reset]: act({
      describe: "Back to the moment of touching",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
  },
  signals: {
    [ReflexSignal.Stepped]: { describe: "The message moved on; `at` says where" },
    [ReflexSignal.Done]: {
      describe: "The hand was pulled away; `path`, `isBurnt` and `ticks` say how it went",
    },
  },
  observe: (s) => ({
    summary: describeReflex(s),
    elements: [{ id: ReflexPart.SpinalCord, value: describeReflex(s) }],
  }),
  parts: () => [
    ReflexPart.Hand,
    ReflexPart.SpinalCord,
    ReflexPart.Brain,
    ReflexPart.Muscle,
    ReflexPart.Next,
  ],
});
