import { localizedSchema } from "@chalk/content";
import {
  AnswerStatus,
  PropRole,
  QuestionAction,
  QuestionSignal,
  SAY,
  SizeFit,
  actionsFor,
  defineProp,
  questionDefaults,
  questionFields,
  say,
  set,
} from "@chalk/prop";
import { z } from "zod";

const optionSchema = z
  .object({
    id: z.string().min(1),
    label: localizedSchema,
    /** Shown when this (wrong) option is among those checked. */
    feedback: localizedSchema.optional(),
    /** The misconception this wrong option reveals. */
    misconception: z.string().optional(),
  })
  .strict();

const multiChoiceState = z
  .object({
    prompt: localizedSchema,
    speak: localizedSchema.nullable(),
    options: z.array(optionSchema).min(2),
    /** Every right option: the answer is all of them and nothing else. */
    answers: z.array(z.string().min(1)).min(1),
    /** Shown when every option picked is right but some right ones are missing. */
    missing: localizedSchema.nullable(),
    /** The options the learner has picked. */
    selected: z.array(z.string()),
    ...questionFields,
  })
  .strict();
export type MultiChoiceState = z.infer<typeof multiChoiceState>;

export const MultiChoiceAction = { Toggle: "toggle" } as const;

const act = actionsFor<MultiChoiceState>();
const noArgs = z.object({}).strict();

const sameSet = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((x) => b.includes(x));

/** Pick every option that is right, then Check. Picking one doesn't give the others away. */
export const multiChoice = defineProp({
  type: "multiChoice",
  /** Words and controls: they reflow with the column (text sizes grow), never scale. */
  size: { fit: SizeFit.Fill },
  isExplainer: false,
  describe: "A question with several right options: pick all of them, then Check.",
  role: PropRole.Question,
  state: multiChoiceState,
  defaults: {
    prompt: { en: "", hi: "" },
    speak: null,
    options: [
      { id: "a", label: { en: "A", hi: "A" } },
      { id: "b", label: { en: "B", hi: "B" } },
    ],
    answers: ["a"],
    missing: null,
    selected: [],
    ...questionDefaults,
  },
  derived: {
    canCheck: {
      describe: "Something is picked and the question isn't answered yet",
      compute: (s) => s.selected.length > 0 && s.status !== AnswerStatus.Correct,
    },
  },
  offScreen: ["answers"],
  actions: {
    [MultiChoiceAction.Toggle]: act({
      describe: "Pick or unpick an option (what the learner's tap does)",
      changes: ["selected", "status", "feedback"],
      byLearner: true,
      args: z.object({ option: z.string() }).strict(),
      run: (s, a) => {
        if (s.status === AnswerStatus.Correct) return set({});
        const selected = s.selected.includes(a.option)
          ? s.selected.filter((o) => o !== a.option)
          : [...s.selected, a.option];
        return set({ selected, status: AnswerStatus.Open, feedback: null });
      },
    }),
    [QuestionAction.Check]: act({
      describe: "Check the picked options",
      changes: ["status", "attempts", "feedback"],
      byLearner: true,
      args: noArgs,
      run: (s) => {
        if (s.selected.length === 0 || s.status === AnswerStatus.Correct) return set({});
        const isRight = sameSet(s.selected, s.answers);
        const wrongPick = s.options.find(
          (o) => s.selected.includes(o.id) && !s.answers.includes(o.id),
        );
        const feedback = isRight ? null : (wrongPick?.feedback ?? (wrongPick ? null : s.missing));
        const status = isRight ? AnswerStatus.Correct : AnswerStatus.Wrong;
        const attempts = s.attempts + 1;
        return set(
          { status, attempts, feedback },
          {
            signal: QuestionSignal.Checked,
            payload: { status, attempts, isGraded: s.isGraded, optionIds: [...s.selected] },
          },
          { signal: isRight ? QuestionSignal.Correct : QuestionSignal.Wrong },
        );
      },
    }),
    [QuestionAction.Retry]: act({
      describe: "Clear a wrong answer's result to answer again (the learner's Try again)",
      changes: ["status", "feedback"],
      byLearner: true,
      args: noArgs,
      run: (s) =>
        s.status === AnswerStatus.Wrong
          ? set({ status: AnswerStatus.Open, feedback: null })
          : set({}),
    }),
    [QuestionAction.GiveFeedback]: act({
      describe: "Show words under the question (e.g. a hint)",
      changes: ["feedback"],
      args: z.object({ text: localizedSchema }).strict(),
      run: (_s, a) => set({ feedback: a.text }),
    }),
    [SAY]: act({
      describe: "Read the prompt aloud (narrator)",
      changes: [],
      args: noArgs,
      run: () => say(),
    }),
  },
  signals: {
    [QuestionSignal.Checked]: { describe: "The learner pressed Check" },
    [QuestionSignal.Correct]: { describe: "Checked, and right" },
    [QuestionSignal.Wrong]: { describe: "Checked, and wrong" },
  },
  invariant: (s) => {
    const missing = s.answers.find((a) => !s.options.some((o) => o.id === a));
    return missing === undefined ? undefined : `answer "${missing}" is not an option`;
  },
  speech: (s) => ({ say: s.prompt, speak: s.speak ?? undefined }),
});
