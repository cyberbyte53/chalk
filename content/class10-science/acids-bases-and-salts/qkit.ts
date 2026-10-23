import { type BoardKit, column, space, t } from "@chalk/author";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";

/** Words in both languages. */
export type Words = { en: string; hi: string };

/** A wrong option and why it's wrong. */
export type Wrong = { label: Words; why: Words };

/** One question in a fact family: the prompt, the right answer, and the wrong ones. */
export type Item = { prompt: Words; right: Words; wrong: readonly Wrong[] };

/** Builds one multiple-choice question from an item, its options settled by a seed. */
export function askItem(b: BoardKit, item: Item, seed: number) {
  const options: Option[] = [
    { id: "right", label: t(item.right.en, item.right.hi) },
    ...item.wrong.map((w, i) => ({
      id: `w${i}`,
      label: t(w.label.en, w.label.hi),
      feedback: t(w.why.en, w.why.hi),
    })),
  ];
  const ask = choiceQuestion(b, {
    prompt: t(item.prompt.en, item.prompt.hi),
    options: settle(options, seed),
    answer: "right",
  });
  return column([ask, space()]);
}

/** A seed from an item's key, so each item settles its options its own way. */
export const seedOf = (key: string): number =>
  [...key].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) * 7;

export const w = (en: string, hi: string): Words => ({ en, hi });
export const wrong = (label: Words, why: Words): Wrong => ({ label, why });
