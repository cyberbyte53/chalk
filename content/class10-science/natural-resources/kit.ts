import { type BoardKit, column, space } from "@chalk/author";
import type { Localized } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { type ResScene, resourcesSceneDef } from "@chalk/prop-resources";

/** A story picture: one panel of the Village Audit. */
export function sceneOn(b: BoardKit, name: string, scene: ResScene, what: string) {
  const p = b.prop(resourcesSceneDef, name, { scene });
  b.standsFor(p, what);
  return p;
}

/** A wrong option: what it says, and what the learner missed when they pick it. */
export type Wrong = readonly [label: Localized, feedback: Localized];

/**
 * A lesson's multiple-choice question: the right answer and the wrong ones, each wrong one with its
 * own feedback. The options are shuffled by `choiceQuestion` (the same way every build).
 */
export function ask(
  b: BoardKit,
  spec: {
    name: string;
    prompt: Localized;
    right: Localized;
    wrong: readonly Wrong[];
    passes?: boolean;
    isHidden?: boolean;
  },
) {
  return choiceQuestion(b, {
    name: spec.name,
    prompt: spec.prompt,
    options: [
      { id: "right", label: spec.right },
      ...spec.wrong.map(([label, feedback], i) => ({ id: `wrong${i}`, label, feedback })),
    ],
    answer: "right",
    ...(spec.passes === undefined ? {} : { passes: spec.passes }),
    ...(spec.isHidden === undefined ? {} : { isHidden: spec.isHidden }),
  });
}

/** One question in a family: the right answer, the wrong ones, and why the answer is right. */
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
  const q = choiceQuestion(b, {
    prompt: c.prompt,
    options: settle(options, seed),
    answer: "right",
    keepOrder: true,
  });
  return column([q, space()]);
}

/** A stable shuffle seed for a case, from its position in the family's list. */
export const seedOf = (cases: readonly string[], c: string): number => cases.indexOf(c) * 7 + 3;
