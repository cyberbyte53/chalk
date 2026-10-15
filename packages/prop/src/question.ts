import { z } from "zod";

/**
 * The question role. A prop with `role: "question"` has these fields and this action and signals,
 * so the player can log the commit without knowing the prop. A board may ask any number of them.
 */
export const AnswerStatus = { Open: "open", Correct: "correct", Wrong: "wrong" } as const;
export type AnswerStatus = (typeof AnswerStatus)[keyof typeof AnswerStatus];

export const QuestionAction = { Check: "check", GiveFeedback: "giveFeedback" } as const;

export const QuestionSignal = { Checked: "checked", Correct: "correct", Wrong: "wrong" } as const;
export type QuestionSignal = (typeof QuestionSignal)[keyof typeof QuestionSignal];

const texts = z.record(z.string(), z.string());

/** Stored fields every question has. */
export const questionFields = {
  status: z.nativeEnum(AnswerStatus),
  /** 1 after the first Check. */
  attempts: z.number().int().min(0),
  /** Shown under it after a check (e.g. a hint), or null. */
  feedback: texts.nullable(),
  /** Concept ids it is about, written in by the build: a bank question's tests, a page's concept. */
  concepts: z.array(z.string()),
  /**
   * Whether its checks count towards mastery of its concepts. The build sets it for bank questions;
   * a question on a page teaches, so it is ungraded.
   */
  isGraded: z.boolean(),
};

export const questionDefaults = {
  status: AnswerStatus.Open,
  attempts: 0,
  feedback: null,
  concepts: [] as string[],
  isGraded: false,
} as const;

/** What the player reads from any question. `canCheck` is derived by each question prop. */
export type QuestionView = {
  status: AnswerStatus;
  attempts: number;
  feedback: Readonly<Record<string, string>> | null;
  canCheck: boolean;
};

/** Payload of the `checked` signal: the commit, with what was submitted. */
export type CheckedPayload =
  | { status: AnswerStatus; attempts: number; optionId: string }
  /** A goal question: the learner's answer is the state of the prop named `about`. */
  | { status: AnswerStatus; attempts: number; about: string };
