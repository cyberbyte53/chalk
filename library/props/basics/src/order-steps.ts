import { localizedSchema } from "@chalk/content";
import {
  AnswerStatus,
  PropRole,
  SizeFit,
  actionsFor,
  checkedFields,
  defineProp,
  questionDefaults,
  questionFields,
  raise,
  say,
  set,
  signal,
} from "@chalk/prop";
import { z } from "zod";

const stepSchema = z
  .object({
    id: z.string().min(1),
    label: localizedSchema,
    /** Said when this step is placed too early: what it needs before it. */
    hint: localizedSchema.optional(),
  })
  .strict();

const orderStepsState = z
  .object({
    prompt: localizedSchema,
    speak: localizedSchema.nullable(),
    /** The steps, in the shuffled order they are offered. */
    steps: z.array(stepSchema).min(2),
    /** Every right order (some steps can swap); each lists every step's id. */
    answers: z.array(z.array(z.string().min(1))).min(1),
    /** Said when a step is out of place and has no hint of its own. */
    outOfOrder: localizedSchema,
    /** The steps placed so far, in order. */
    placed: z.array(z.string()),
    ...questionFields,
  })
  .strict();
export type OrderStepsState = z.infer<typeof orderStepsState>;

const act = actionsFor<OrderStepsState>();
const noArgs = z.object({}).strict();

/** The first place where the learner's order leaves every right order, or -1 if it matches one. */
export function firstWrong(
  placed: readonly string[],
  answers: readonly (readonly string[])[],
): number {
  let best = -1;
  for (const answer of answers) {
    const k = placed.findIndex((id, i) => answer[i] !== id);
    if (k === -1 && placed.length === answer.length) return -1;
    best = Math.max(best, k === -1 ? placed.length : k);
  }
  return best;
}

const signals = {
  checked: signal(
    "The learner pressed Check: the `status` it got, its `attempts` so far, whether it `isGraded`, and the `optionIds` of the steps in the learner's order",
    { ...checkedFields, optionIds: z.array(z.string().min(1)).min(1) },
  ),
  correct: signal("Checked, and in a right order"),
  wrong: signal("Checked, and out of order"),
};
/**
 * Put the steps of a proof (or any argument) in order: tap a step to add it as the next line, tap a
 * placed line to take it back, then Check. A step out of place says what it needs before it.
 */
export const orderSteps = defineProp({
  type: "orderSteps",
  /** Words and controls: they reflow with the column (text sizes grow), never scale. */
  size: { fit: SizeFit.Fill },
  describe:
    "A proof's steps, shuffled: the learner taps them into order, one line at a time, then checks. A step placed too early gets its hint: what has to come before it.",
  role: PropRole.Question,
  state: orderStepsState,
  defaults: {
    prompt: { en: "", hi: "" },
    speak: null,
    steps: [
      { id: "a", label: { en: "A", hi: "A" } },
      { id: "b", label: { en: "B", hi: "B" } },
    ],
    answers: [["a", "b"]],
    outOfOrder: {
      en: "That line doesn't follow from the lines above it yet.",
      hi: "यह पंक्ति अभी ऊपर की पंक्तियों से नहीं निकलती।",
    },
    placed: [],
    ...questionDefaults,
  },
  derived: {
    canCheck: {
      describe: "Every step is placed and the question isn't answered yet",
      compute: (s) => s.placed.length === s.steps.length && s.status !== AnswerStatus.Correct,
    },
  },
  offScreen: ["answers"],
  actions: {
    place: act({
      describe: "Add a step as the next line (what the learner's tap on a step does)",
      changes: ["placed", "status", "feedback"],
      byLearner: true,
      args: z.object({ step: z.string() }).strict(),
      run: (s, a) => {
        if (s.status === AnswerStatus.Correct || s.placed.includes(a.step)) return set({});
        if (!s.steps.some((st) => st.id === a.step)) return set({});
        return set({ placed: [...s.placed, a.step], status: AnswerStatus.Open, feedback: null });
      },
    }),
    remove: act({
      describe: "Take a placed line back (what the learner's tap on a placed line does)",
      changes: ["placed", "status", "feedback"],
      byLearner: true,
      args: z.object({ step: z.string() }).strict(),
      run: (s, a) => {
        if (s.status === AnswerStatus.Correct) return set({});
        return set({
          placed: s.placed.filter((id) => id !== a.step),
          status: AnswerStatus.Open,
          feedback: null,
        });
      },
    }),
    check: act({
      describe: "Check the order",
      changes: ["status", "attempts", "feedback"],
      byLearner: true,
      args: noArgs,
      run: (s) => {
        if (s.placed.length !== s.steps.length || s.status === AnswerStatus.Correct) return set({});
        const k = firstWrong(s.placed, s.answers);
        const isRight = k === -1;
        const wrong = isRight ? undefined : s.steps.find((st) => st.id === s.placed[k]);
        const feedback = isRight ? null : (wrong?.hint ?? s.outOfOrder);
        const status = isRight ? AnswerStatus.Correct : AnswerStatus.Wrong;
        const attempts = s.attempts + 1;
        return set(
          { status, attempts, feedback },
          // The learner's order, as the ids of the steps line by line.
          raise(signals.checked, {
            status,
            attempts,
            isGraded: s.isGraded,
            optionIds: [...s.placed],
          }),
          raise(isRight ? signals.correct : signals.wrong),
        );
      },
    }),
    retry: act({
      describe: "Clear a wrong answer's result to answer again (the learner's Try again)",
      changes: ["status", "feedback"],
      byLearner: true,
      args: noArgs,
      run: (s) =>
        s.status === AnswerStatus.Wrong
          ? set({ status: AnswerStatus.Open, feedback: null })
          : set({}),
    }),
    giveFeedback: act({
      describe: "Show words under the question (e.g. a hint)",
      changes: ["feedback"],
      args: z.object({ text: localizedSchema }).strict(),
      run: (_s, a) => set({ feedback: a.text }),
    }),
    say: act({
      describe: "Read the prompt aloud (narrator)",
      changes: [],
      args: noArgs,
      run: () => say(),
    }),
  },
  signals,
  invariant: (s) => {
    const ids = s.steps.map((st) => st.id);
    for (const answer of s.answers) {
      if (answer.length !== ids.length || !ids.every((id) => answer.includes(id))) {
        return "every answer must list every step once";
      }
    }
    return undefined;
  },
  summary: (s) =>
    `steps to put in order, ${s.status === "open" ? "not answered yet" : s.status}: ${s.prompt.en}`,
  speech: (s) => ({ say: s.prompt, speak: s.speak ?? undefined }),
});
