import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import type { Words } from "./draw";

/**
 * A nerve impulse through a neuron (NCERT 7.1, Fig. 7.1): information picked up at the dendrite
 * tips sets off a chemical reaction that makes an electrical impulse; it runs to the cell body and
 * along the axon; at the axon's end it releases chemicals that cross the gap (synapse) and start a
 * new impulse in the next neuron, or reach a muscle cell (neuromuscular junction) and make it work.
 */

export const NeuronTarget = { Neuron: "neuron", Muscle: "muscle" } as const;
export type NeuronTarget = (typeof NeuronTarget)[keyof typeof NeuronTarget];

/** Where the message is at each step, and in what form. */
export const NeuronAt = {
  Rest: "rest",
  Dendrite: "dendrite",
  CellBody: "cellBody",
  Axon: "axon",
  NerveEnding: "nerveEnding",
  Synapse: "synapse",
  Next: "next",
} as const;
export type NeuronAt = (typeof NeuronAt)[keyof typeof NeuronAt];

export const NEURON_STEPS: readonly NeuronAt[] = [
  NeuronAt.Rest,
  NeuronAt.Dendrite,
  NeuronAt.CellBody,
  NeuronAt.Axon,
  NeuronAt.NerveEnding,
  NeuronAt.Synapse,
  NeuronAt.Next,
];
export const LAST_NEURON_STEP = NEURON_STEPS.length - 1;

export const SignalForm = { None: "none", Electrical: "electrical", Chemical: "chemical" } as const;
export type SignalForm = (typeof SignalForm)[keyof typeof SignalForm];

export const NeuronAction = { Next: "next", Reset: "reset", SetTarget: "setTarget" } as const;
export const NeuronSignal = { Stepped: "stepped", Arrived: "arrived" } as const;
export const NeuronDerived = { At: "at", Form: "form", HasArrived: "hasArrived" } as const;
export const NeuronPart = {
  Dendrite: "dendrite",
  CellBody: "cellBody",
  Axon: "axon",
  NerveEnding: "nerveEnding",
  Synapse: "synapse",
  Next: "nextCell",
  Button: "next",
} as const;

const neuronState = z
  .object({
    step: z.number().int().min(0).max(LAST_NEURON_STEP),
    /** What the last neuron passes the message to: another neuron, or a muscle cell. */
    target: z.nativeEnum(NeuronTarget),
    /** Labels on the parts (dendrite, cell body, axon, nerve ending, synapse). */
    showNames: z.boolean(),
    canStep: z.boolean(),
    /** Whether the learner can switch between "next neuron" and "muscle". */
    canSetTarget: z.boolean(),
  })
  .strict();
export type NeuronState = z.infer<typeof neuronState>;

export function formAt(step: number): SignalForm {
  const at = NEURON_STEPS[step] ?? NeuronAt.Rest;
  if (at === NeuronAt.Rest) return SignalForm.None;
  if (at === NeuronAt.Synapse) return SignalForm.Chemical;
  return SignalForm.Electrical;
}

/** The caption for each step, in both languages; the last step depends on the target. */
export function neuronCaption(step: number, target: NeuronTarget): Words {
  const at = NEURON_STEPS[step] ?? NeuronAt.Rest;
  switch (at) {
    case NeuronAt.Rest:
      return {
        en: "A neuron at rest. Tap next to send a message.",
        hi: "आराम में एक तंत्रिका कोशिका। संदेश भेजने के लिए आगे दबाओ।",
      };
    case NeuronAt.Dendrite:
      return {
        en: "The dendrite tips pick up the information. A chemical reaction there makes an electrical impulse.",
        hi: "द्रुमिका के सिरे सूचना ग्रहण करते हैं। वहाँ एक रासायनिक अभिक्रिया विद्युत आवेग बनाती है।",
      };
    case NeuronAt.CellBody:
      return {
        en: "The electrical impulse travels from the dendrite to the cell body.",
        hi: "विद्युत आवेग द्रुमिका से कोशिका काय तक जाता है।",
      };
    case NeuronAt.Axon:
      return {
        en: "Then it runs along the axon, the long fibre, to its end.",
        hi: "फिर यह तंत्रिकाक्ष, यानी लंबे तंतु, के साथ उसके सिरे तक दौड़ता है।",
      };
    case NeuronAt.NerveEnding:
      return {
        en: "At the end of the axon, the impulse makes it release some chemicals.",
        hi: "तंत्रिकाक्ष के सिरे पर आवेग कुछ रसायन छुड़वाता है।",
      };
    case NeuronAt.Synapse:
      return {
        en: "The chemicals cross the tiny gap, the synapse. Here the message is chemical, not electrical.",
        hi: "रसायन छोटे-से अंतराल, सिनेप्स, को पार करते हैं। यहाँ संदेश रासायनिक है, विद्युत नहीं।",
      };
    case NeuronAt.Next:
      return target === NeuronTarget.Muscle
        ? {
            en: "They reach a muscle cell, and the muscle cell shortens: the message became an action.",
            hi: "वे एक पेशी कोशिका तक पहुँचते हैं, और पेशी कोशिका छोटी होती है: संदेश क्रिया बन गया।",
          }
        : {
            en: "They start a new electrical impulse in a dendrite of the next neuron, and the message goes on.",
            hi: "वे अगली तंत्रिका कोशिका की द्रुमिका में नया विद्युत आवेग शुरू करते हैं, और संदेश आगे बढ़ता है।",
          };
  }
}

export function describeNeuron(s: NeuronState): string {
  const next = s.target === NeuronTarget.Muscle ? "a muscle cell" : "the next neuron";
  return `A neuron drawn left to right: branching dendrites, the cell body with its nucleus, the long axon and its nerve endings, then a small gap (the synapse) and ${next}. Step ${s.step} of ${LAST_NEURON_STEP}: ${neuronCaption(s.step, s.target).en}`;
}

const act = actionsFor<NeuronState>();

export const neuronSignal = defineProp({
  type: "neuronSignal",
  describe:
    "One neuron and what comes after it (the next neuron, or a muscle cell), stepped through how a message travels: dendrite tips pick up information and make an electrical impulse; it travels to the cell body, along the axon, and at the nerve ending releases chemicals; the chemicals cross the synapse and start a new impulse in the next neuron, or make the muscle cell shorten. The derived `form` says whether the message is electrical or chemical at the current step.",
  state: neuronState,
  defaults: {
    step: 0,
    target: NeuronTarget.Neuron,
    showNames: true,
    canStep: true,
    canSetTarget: false,
  },
  inputs: ["target", "showNames", "canStep", "canSetTarget"],
  derived: {
    [NeuronDerived.At]: {
      describe:
        "Where the message is: rest, dendrite, cellBody, axon, nerveEnding, synapse or next (the next cell)",
      compute: (s) => NEURON_STEPS[s.step] ?? NeuronAt.Rest,
    },
    [NeuronDerived.Form]: {
      describe: "What form the message is in now: none, electrical or chemical",
      compute: (s) => formAt(s.step),
    },
    [NeuronDerived.HasArrived]: {
      describe: "Whether the message has reached the next cell",
      compute: (s) => s.step === LAST_NEURON_STEP,
    },
  },
  actions: {
    [NeuronAction.Next]: act({
      describe: "Move the message one step on (after the last step, back to rest)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = s.step >= LAST_NEURON_STEP ? 0 : s.step + 1;
        const at = NEURON_STEPS[step] ?? NeuronAt.Rest;
        if (step === LAST_NEURON_STEP)
          return set(
            { step },
            { signal: NeuronSignal.Arrived, payload: { step, at, target: s.target } },
          );
        return set({ step }, { signal: NeuronSignal.Stepped, payload: { step, at } });
      },
    }),
    [NeuronAction.Reset]: act({
      describe: "Back to rest",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
    [NeuronAction.SetTarget]: act({
      describe: "What the message goes to: the next neuron, or a muscle cell (starts again)",
      byLearner: true,
      args: z.object({ target: z.nativeEnum(NeuronTarget) }).strict(),
      run: (_s, a) => set({ target: a.target, step: 0 }),
    }),
  },
  signals: {
    [NeuronSignal.Stepped]: { describe: "The message moved on; `at` says where it is" },
    [NeuronSignal.Arrived]: {
      describe: "The message reached the next cell (`target`: neuron or muscle)",
    },
  },
  observe: (s) => ({
    summary: describeNeuron(s),
    elements: [{ id: NeuronPart.Axon, value: describeNeuron(s) }],
  }),
  parts: () => [
    NeuronPart.Dendrite,
    NeuronPart.CellBody,
    NeuronPart.Axon,
    NeuronPart.NerveEnding,
    NeuronPart.Synapse,
    NeuronPart.Next,
    NeuronPart.Button,
  ],
});
