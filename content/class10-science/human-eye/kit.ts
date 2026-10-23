import { type BoardKit, column, space } from "@chalk/author";
import type { Localized } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";

/** One fact to ask about: the prompt, the right answer, and wrong answers that each say what was missed. */
export type Fact = {
  prompt: Localized;
  right: Localized;
  wrong: readonly { label: Localized; feedback: Localized }[];
};

/** A steady number from a string, so the options are shuffled the same way every build. */
export function seedOf(text: string): number {
  let h = 7;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) % 1000003;
  return h;
}

/** The params schema for a family of facts: one row per fact, by its key. */
export function factParams<K extends string>(facts: Record<K, Fact>) {
  const keys = Object.keys(facts) as [K, ...K[]];
  return z.object({ item: z.enum(keys) }).strict();
}

/** A bank question for one fact: a multiple-choice question, options settled by the fact's key. */
export function askFact(b: BoardKit, fact: Fact, key: string) {
  const options: Option[] = [
    { id: "right", label: fact.right },
    ...fact.wrong.map((w, i) => ({ id: `wrong${i + 1}`, label: w.label, feedback: w.feedback })),
  ];
  const ask = choiceQuestion(b, {
    prompt: fact.prompt,
    options: settle(options, seedOf(key)),
    answer: "right",
  });
  return column([ask, space()]);
}
