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

const act = actionsFor<ChoiceState>();
const noArgs = z.object({}).strict();

const signals = {
  checked: signal(
    "The learner pressed Check: the `status` it got, its `attempts` so far, whether it `isGraded`, and the `optionId` picked",
    { ...checkedFields, optionId: z.string().min(1) },
  ),
  correct: signal("Checked, and right"),
  wrong: signal("Checked, and wrong"),
};
/** Pick one option, then Check. The answer key is in the prop, checked on the phone. */
export const choice = defineProp({
  type: "choice",
  /** Words and controls: they reflow with the column (text sizes grow), never scale. */
  size: { fit: SizeFit.Fill },
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
    select: act({
      describe: "Pick an option (what the learner's tap does)",
      changes: ["selected", "status", "feedback"],
      byLearner: true,
      args: z.object({ option: z.string() }).strict(),
      run: (s, a) =>
        s.status === AnswerStatus.Correct
          ? set({})
          : set({ selected: a.option, status: AnswerStatus.Open, feedback: null }),
    }),
    check: act({
      describe: "Check the picked option",
      changes: ["status", "attempts", "feedback"],
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
          raise(signals.checked, { status, attempts, isGraded: s.isGraded, optionId: s.selected }),
          raise(isRight ? signals.correct : signals.wrong),
        );
      },
    }),
    retry: act({
      describe: "Clear a wrong answer's result to answer again (the learner's Try again)",
      changes: ["status", "feedback", "selected"],
      byLearner: true,
      args: noArgs,
      run: (s) =>
        s.status === AnswerStatus.Wrong
          ? set({ status: AnswerStatus.Open, feedback: null, selected: null })
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
  invariant: (s) =>
    s.options.some((o) => o.id === s.answer) ? undefined : `answer "${s.answer}" is not an option`,
  summary: (s) =>
    `a multiple-choice question, ${s.status === "open" ? "not answered yet" : s.status}: ${s.prompt.en}`,
  speech: (s) => ({ say: s.prompt, speak: s.speak ?? undefined }),
});
