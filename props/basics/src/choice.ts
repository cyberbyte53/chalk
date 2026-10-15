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
  set,
  task,
} from "@chalk/prop";
import { z } from "zod";

const optionSchema = z
  .object({
    id: z.string().min(1),
    label: localizedSchema,
    /** Shown when this (wrong) option is checked. */
    feedback: localizedSchema.optional(),
    /** The misconception this wrong option reveals. */
    misconception: z.string().optional(),
  })
  .strict();

const choiceState = z
  .object({
    prompt: localizedSchema,
    speak: localizedSchema.nullable(),
    options: z.array(optionSchema).min(2),
    answer: z.string().min(1),
    /** The option the learner picked, or null. */
    selected: z.string().nullable(),
    ...questionFields,
  })
  .strict();
export type ChoiceState = z.infer<typeof choiceState>;

export const ChoiceAction = { Select: "select" } as const;

const act = actionsFor<ChoiceState>();
const noArgs = z.object({}).strict();

/** Pick one option, then Check. The answer key is in the prop, checked on the phone. */
export const choice = defineProp({
  type: "choice",
  isExplainer: false,
  describe: "A multiple-choice question.",
  role: PropRole.Question,
  state: choiceState,
  defaults: {
    prompt: { en: "", hi: "" },
    speak: null,
    options: [
      { id: "a", label: { en: "A", hi: "A" } },
      { id: "b", label: { en: "B", hi: "B" } },
    ],
    answer: "a",
    selected: null,
    ...questionDefaults,
  },
  derived: {
    canCheck: {
      describe: "An option is picked and the question isn't answered yet",
      compute: (s) => s.selected !== null && s.status !== AnswerStatus.Correct,
    },
  },
  offScreen: ["answer"],
  actions: {
    [ChoiceAction.Select]: act({
      describe: "Pick an option (what the learner's tap does)",
      byLearner: true,
      args: z.object({ option: z.string() }).strict(),
      run: (s, a) =>
        s.status === AnswerStatus.Correct
          ? set({})
          : set({ selected: a.option, status: AnswerStatus.Open, feedback: null }),
    }),
    [QuestionAction.Check]: act({
      describe: "Check the picked option",
      byLearner: true,
      args: noArgs,
      run: (s) => {
        if (s.selected === null || s.status === AnswerStatus.Correct) return set({});
        const picked = s.options.find((o) => o.id === s.selected);
        const isRight = s.selected === s.answer;
        const status = isRight ? AnswerStatus.Correct : AnswerStatus.Wrong;
        const attempts = s.attempts + 1;
        return set(
          { status, attempts, feedback: isRight ? null : (picked?.feedback ?? null) },
          { signal: QuestionSignal.Checked, payload: { status, attempts, optionId: s.selected } },
          { signal: isRight ? QuestionSignal.Correct : QuestionSignal.Wrong },
        );
      },
    }),
    [QuestionAction.GiveFeedback]: act({
      describe: "Show words under the question (e.g. a hint)",
      args: z.object({ text: localizedSchema }).strict(),
      run: (_s, a) => set({ feedback: a.text }),
    }),
    [SAY]: act({
      describe: "Read the prompt aloud (narrator)",
      args: noArgs,
      run: () => task((context) => context.speak()),
    }),
  },
  signals: {
    [QuestionSignal.Checked]: { describe: "The learner pressed Check", isCommit: true },
    [QuestionSignal.Correct]: { describe: "Checked, and right" },
    [QuestionSignal.Wrong]: { describe: "Checked, and wrong" },
  },
  invariant: (s) =>
    s.options.some((o) => o.id === s.answer) ? undefined : `answer "${s.answer}" is not an option`,
  speech: (s) => ({ say: s.prompt, speak: s.speak ?? undefined }),
});
