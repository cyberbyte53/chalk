import { localizedSchema } from "@chalk/content";
import {
  AnswerStatus,
  PropRole,
  QuestionAction,
  QuestionSignal,
  SAY,
  actionsFor,
  defineProp,
  questionDefaults,
  questionFields,
  say,
  set,
} from "@chalk/prop";
import { z } from "zod";

const goalState = z
  .object({
    prompt: localizedSchema,
    speak: localizedSchema.nullable(),
    /** The prop the learner works on; its state is their answer. */
    about: z.string().min(1),
    /** Whether the goal is met right now. The lesson owns this with an IS (e.g. marker² near 2). */
    isMet: z.boolean(),
    ...questionFields,
  })
  .strict();
export type GoalState = z.infer<typeof goalState>;

const act = actionsFor<GoalState>();
const noArgs = z.object({}).strict();

/** "Get the prop into this state, then Check." The lesson says what counts, as an IS on `isMet`. */
export const goal = defineProp({
  type: "goal",
  isExplainer: false,
  describe: "A question answered by getting another prop into a goal state, then pressing Check.",
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
  offScreen: ["isMet"],
  derived: {
    canCheck: {
      describe: "The question isn't answered yet",
      compute: (s) => s.status !== AnswerStatus.Correct,
    },
  },
  actions: {
    [QuestionAction.Check]: act({
      describe: "Check whether the goal is met",
      byLearner: true,
      args: noArgs,
      run: (s) => {
        if (s.status === AnswerStatus.Correct) return set({});
        const status = s.isMet ? AnswerStatus.Correct : AnswerStatus.Wrong;
        const attempts = s.attempts + 1;
        return set(
          { status, attempts, feedback: null },
          { signal: QuestionSignal.Checked, payload: { status, attempts, about: s.about } },
          { signal: s.isMet ? QuestionSignal.Correct : QuestionSignal.Wrong },
        );
      },
    }),
    [QuestionAction.Retry]: act({
      describe: "Clear a wrong answer's result to answer again (the learner's Try again)",
      byLearner: true,
      args: noArgs,
      run: (s) =>
        s.status === AnswerStatus.Wrong
          ? set({ status: AnswerStatus.Open, feedback: null })
          : set({}),
    }),
    [QuestionAction.GiveFeedback]: act({
      describe: "Show words under the question (e.g. a hint)",
      args: z.object({ text: localizedSchema }).strict(),
      run: (_s, a) => set({ feedback: a.text }),
    }),
    [SAY]: act({
      describe: "Read the prompt aloud (narrator)",
      args: noArgs,
      run: () => say(),
    }),
  },
  signals: {
    [QuestionSignal.Checked]: { describe: "The learner pressed Check", isCommit: true },
    [QuestionSignal.Correct]: { describe: "Checked, and the goal was met" },
    [QuestionSignal.Wrong]: { describe: "Checked, and the goal wasn't met" },
  },
  speech: (s) => ({ say: s.prompt, speak: s.speak ?? undefined }),
});
