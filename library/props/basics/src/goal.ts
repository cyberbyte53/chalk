import { localizedSchema } from "@chalk/content";
import {
  AnswerStatus,
  PropRole,
  SizeFit,
  actionsFor,
  defineProp,
  questionDefaults,
  questionFields,
  raise,
  say,
  set,
  signal,
} from "@chalk/prop";
import { z } from "zod";

const goalState = z
  .object({
    prompt: localizedSchema,
    speak: localizedSchema.nullable(),
    /** The prop the learner works on (its name on the board): its state is their answer. */
    about: z.string().min(1),
    /** Whether that prop's state is right now. The question owns this with an IS rule. */
    isMet: z.boolean(),
    ...questionFields,
  })
  .strict();
export type GoalState = z.infer<typeof goalState>;

const act = actionsFor<GoalState>();
const noArgs = z.object({}).strict();

const signals = {
  checked: signal("The learner pressed Check"),
  correct: signal("Checked, and the prop's state was right"),
  wrong: signal("Checked, and the prop's state wasn't right"),
};

/**
 * "Do it in the prop, then Check": the answer is another prop's state. The question family says
 * what counts as right, as an IS rule on `isMet`; Check is the learner saying "this is my answer",
 * and records the attempt.
 */
export const goal = defineProp({
  type: "goal",
  /** Words and controls: they reflow with the column (text sizes grow), never scale. */
  size: { fit: SizeFit.Fill },
  describe:
    "A question answered by getting another prop into the right state, then pressing Check.",
  role: PropRole.Question,
  state: goalState,
  defaults: {
    prompt: { en: "", hi: "" },
    speak: null,
    about: "unset",
    isMet: false,
    ...questionDefaults,
  },
  inputs: ["isMet"],
  // Whether it's right is the answer: known, never on screen.
  offScreen: ["isMet"],
  derived: {
    canCheck: {
      describe: "The question isn't answered yet",
      compute: (s) => s.status !== AnswerStatus.Correct,
    },
  },
  actions: {
    check: act({
      describe: "Check the prop's state as the answer (the learner's Check)",
      changes: ["status", "attempts", "feedback"],
      byLearner: true,
      args: noArgs,
      run: (s) => {
        if (s.status === AnswerStatus.Correct) return set({});
        const status = s.isMet ? AnswerStatus.Correct : AnswerStatus.Wrong;
        const attempts = s.attempts + 1;
        return set(
          { status, attempts, feedback: null },
          raise(signals.checked, { status, attempts, isGraded: s.isGraded, about: s.about }),
          raise(s.isMet ? signals.correct : signals.wrong),
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
      describe: "Show words under the question (the note for a known wrong answer)",
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
  summary: (s) =>
    `a question answered in ${s.about}, ${s.status === "open" ? "not answered yet" : s.status}: ${s.prompt.en}`,
  speech: (s) => ({ say: s.prompt, speak: s.speak ?? undefined }),
});
