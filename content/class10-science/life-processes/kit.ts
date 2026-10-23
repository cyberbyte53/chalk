import { type BoardKit, column, space } from "@chalk/author";
import type { Localized } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";

/** One multiple-choice question: the right answer, the wrong ones, and why the answer is right. */
export type Choice = {
  prompt: Localized;
  right: Localized;
  wrong: readonly Localized[];
  /** Shown on any wrong pick: the reason the right answer is right. */
  why: Localized;
};

/** A question family's board: one choice question, its options shuffled by `seed`. */
export function askChoice(b: BoardKit, c: Choice, seed: number) {
  const options: Option[] = [
    { id: "right", label: c.right },
    ...c.wrong.map((label, i) => ({ id: `wrong${i}`, label, feedback: c.why })),
  ];
  const ask = choiceQuestion(b, {
    prompt: c.prompt,
    options: settle(options, seed),
    answer: "right",
  });
  return column([ask, space()]);
}

/** A stable shuffle seed for a case, from its position in the family's list. */
export const seedOf = (cases: readonly string[], c: string): number => cases.indexOf(c) * 7 + 3;
