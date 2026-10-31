import { AGENT_LOCALE, localizedSchema } from "@chalk/content";
import {
  AnswerStatus,
  PropRole,
  SizeFit,
  checkedFields,
  colorSchema,
  questionDefaults,
  questionFields,
} from "@chalk/prop";
import { action, prop, signal } from "@chalk/prop";
import { z } from "zod";

/**
 * The words and questions every lesson uses, on the event model (platform/docs/event-model.md),
 * for scenes: the same variables and actions as text, goal and choice, so the same views draw
 * them. How they sound (a text says its words, a question its prompt) is their sound view
 * (scene-sound.ts), beside their drawing: nothing here knows about sound.
 */

/** Words a lesson hasn't given yet (it always gives its own). */
/** How words sit on the board. A definition is set apart in an outlined box. */
export const TextStyle = {
  Title: "title",
  Body: "body",
  Note: "note",
  Definition: "definition",
} as const;
export type TextStyle = (typeof TextStyle)[keyof typeof TextStyle];

const UNSET = { en: "…", hi: "…" };

/** Words on the board. */
export const sceneText = prop({
  type: "sceneText",
  describe: "Words on the board, in the learner's language.",
  role: PropRole.Page,
  size: { fit: SizeFit.Fill },
  variables: z
    .object({
      text: localizedSchema,
      style: z.nativeEnum(TextStyle),
      /** The colour a definition is drawn in, or null for none. */
      color: colorSchema.nullable(),
    })
    .strict(),
  start: { text: UNSET, style: TextStyle.Body, color: null },
  summary: (me) => `words: ${me.text[AGENT_LOCALE]}`,
});

const questionVariables = { prompt: localizedSchema, ...questionFields };
const questionStart = { prompt: UNSET, ...questionDefaults };
const retry = action({}, { from: "screen", describe: "Clear a wrong answer to try again" });
const giveFeedback = action({ text: localizedSchema }, { describe: "Show words under it" });

/**
 * "Do it in the prop, then Check": the answer is another piece's state. Whether it is right is a
 * need (`isMet`) the scene gives it; Check records the attempt.
 */
export const sceneGoal = prop({
  type: "sceneGoal",
  describe:
    "A question answered by getting another prop into the right state, then pressing Check.",
  role: PropRole.Question,
  size: { fit: SizeFit.Fill },
  variables: z
    .object({
      ...questionVariables,
      /** The piece the learner works on (its name on the board). */
      about: z.string().min(1),
    })
    .strict(),
  start: { ...questionStart, about: "unset" },
  needs: z.object({ isMet: z.boolean() }).strict(),
  facts: { canCheck: (me) => me.status !== AnswerStatus.Correct },
  actions: {
    check: action({}, { from: "screen", describe: "Check the prop's state as the answer" }),
    retry,
    giveFeedback,
  },
  signals: {
    checked: signal({ ...checkedFields, about: z.string().min(1) }),
    correct: signal(),
    wrong: signal(),
  },
  on: {
    check: (me, _, t) => {
      if (me.status === AnswerStatus.Correct) return;
      const status = me.isMet ? AnswerStatus.Correct : AnswerStatus.Wrong;
      const attempts = me.attempts + 1;
      return [
        t.set({ status, attempts, feedback: null }),
        t.tell.checked({ status, attempts, isGraded: me.isGraded, about: me.about }),
        me.isMet ? t.tell.correct() : t.tell.wrong(),
      ];
    },
    retry: (me, _, t) =>
      me.status === AnswerStatus.Wrong && t.set({ status: AnswerStatus.Open, feedback: null }),
    giveFeedback: (_, { text }, t) => t.set({ feedback: text }),
  },
  summary: (me) =>
    `a question answered in ${me.about}, ${me.status === AnswerStatus.Open ? "not answered yet" : me.status}: ${me.prompt[AGENT_LOCALE]}`,
});

const optionSchema = z
  .object({
    id: z.string().min(1),
    label: localizedSchema,
    /** Shown when this (wrong) option is checked. */
    feedback: localizedSchema.optional(),
    misconception: z.string().optional(),
  })
  .strict();

/** Pick one option, then Check. */
export const sceneChoice = prop({
  type: "sceneChoice",
  describe: "A multiple-choice question.",
  role: PropRole.Question,
  size: { fit: SizeFit.Fill },
  variables: z
    .object({
      ...questionVariables,
      options: z.array(optionSchema).min(2),
      answer: z.string().min(1),
      /** The option the learner picked, or null. */
      selected: z.string().nullable(),
    })
    .strict(),
  start: {
    ...questionStart,
    options: [
      { id: "a", label: { en: "A", hi: "A" } },
      { id: "b", label: { en: "B", hi: "B" } },
    ],
    answer: "a",
    selected: null,
  },
  facts: { canCheck: (me) => me.selected !== null && me.status !== AnswerStatus.Correct },
  actions: {
    select: action({ option: z.string() }, { from: "screen", describe: "Pick an option" }),
    check: action({}, { from: "screen", describe: "Check the picked option" }),
    retry,
    giveFeedback,
  },
  signals: {
    checked: signal({ ...checkedFields, optionId: z.string().min(1) }),
    correct: signal(),
    wrong: signal(),
  },
  on: {
    select: (me, { option }, t) =>
      me.status !== AnswerStatus.Correct &&
      t.set({ selected: option, status: AnswerStatus.Open, feedback: null }),
    check: (me, _, t) => {
      if (me.selected === null || me.status === AnswerStatus.Correct) return;
      const picked = me.options.find((o) => o.id === me.selected);
      const isRight = me.selected === me.answer;
      const status = isRight ? AnswerStatus.Correct : AnswerStatus.Wrong;
      const attempts = me.attempts + 1;
      return [
        t.set({ status, attempts, feedback: isRight ? null : (picked?.feedback ?? null) }),
        t.tell.checked({ status, attempts, isGraded: me.isGraded, optionId: me.selected }),
        isRight ? t.tell.correct() : t.tell.wrong(),
      ];
    },
    retry: (me, _, t) =>
      me.status === AnswerStatus.Wrong &&
      t.set({ status: AnswerStatus.Open, feedback: null, selected: null }),
    giveFeedback: (_, { text }, t) => t.set({ feedback: text }),
  },
  invariant: (v) =>
    v.options.some((o) => o.id === v.answer) ? undefined : `answer "${v.answer}" isn't an option`,
  summary: (me) =>
    `a multiple-choice question, ${me.status === AnswerStatus.Open ? "not answered yet" : me.status}: ${me.prompt[AGENT_LOCALE]}`,
});
