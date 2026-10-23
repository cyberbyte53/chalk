import type { AnyPlaced, BoardKit, PlacedOf } from "@chalk/author";
import { t, theBoard } from "@chalk/author";
import type { Localized } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  Layout,
  MendeleevAction,
  type MendeleevMode,
  type MendeleevState,
  ModernAction,
  type ModernState,
  type PeriodicScene,
  type Trend,
  TriadAction,
  type TriadSet,
  mendeleevTableDef,
  periodicSceneDef,
  periodicTableDef,
  triadCheckerDef,
} from "@chalk/prop-periodic";

/** A pair of strings, English then Hindi. */
export type L = readonly [string, string];

/** A wrong option: its label (en, hi) and why it's wrong (en, hi). */
export type Wrong = readonly [string, string, string, string];

/** A story picture. */
export function sceneOn(
  b: BoardKit,
  name: string,
  scene: PeriodicScene,
  says: string,
): PlacedOf<typeof periodicSceneDef> {
  const picture = b.prop(periodicSceneDef, name, { scene });
  b.standsFor(picture, says);
  return picture;
}

/** Three element cards the learner steps through: the average, then the verdict. */
export function triadOn(
  b: BoardKit,
  name: string,
  set: TriadSet,
  choices: readonly TriadSet[] = [],
): PlacedOf<typeof triadCheckerDef> {
  const p = b.prop(triadCheckerDef, name, { set, step: 0, canStep: true, choices: [...choices] });
  b.studentOnly(p.action(TriadAction.Next));
  b.studentOnly(p.action(TriadAction.Reset));
  if (choices.length > 0) b.studentOnly(p.action(TriadAction.Pick));
  return p;
}

/** Mendeléev's 1872 table in one of its modes. */
export function mendeleevOn(
  b: BoardKit,
  name: string,
  mode: MendeleevMode,
  more: Partial<MendeleevState> = {},
): PlacedOf<typeof mendeleevTableDef> {
  const p = b.prop(mendeleevTableDef, name, { mode, ...more });
  b.studentOnly(p.action(MendeleevAction.Tap));
  b.studentOnly(p.action(MendeleevAction.Reveal));
  b.studentOnly(p.action(MendeleevAction.PickAnomaly));
  return p;
}

/** The modern table: the first 20 by default, tappable, optionally coloured by trends. */
export function tableOn(
  b: BoardKit,
  name: string,
  more: Partial<ModernState> = {},
): PlacedOf<typeof periodicTableDef> {
  const p = b.prop(periodicTableDef, name, { layout: Layout.Short, ...more });
  b.studentOnly(p.action(ModernAction.Tap));
  b.studentOnly(p.action(ModernAction.Clear));
  if ((more.trends ?? []).length > 0) b.studentOnly(p.action(ModernAction.SetTrend));
  if (more.canSetLayout === true) b.studentOnly(p.action(ModernAction.SetLayout));
  return p;
}

/** The trends a table may be coloured by, as the learner's buttons. */
export const trendsOf = (...trends: Trend[]): Trend[] => trends;

/**
 * A multiple-choice question in a lesson: the right answer and the wrong ones with their
 * feedback; shuffled (the same way every build). Not passing unless said.
 */
export function ask(
  b: BoardKit,
  name: string,
  prompt: L,
  right: L,
  wrong: readonly Wrong[],
  options: { isHidden?: boolean; passes?: boolean } = {},
) {
  return choiceQuestion(b, {
    name,
    prompt: t(prompt[0], prompt[1]),
    options: [
      { id: "right", label: t(right[0], right[1]) },
      ...wrong.map((w, i) => ({ id: `w${i}`, label: t(w[0], w[1]), feedback: t(w[2], w[3]) })),
    ],
    answer: "right",
    isHidden: options.isHidden ?? false,
    passes: options.passes ?? false,
  });
}

/**
 * Questions answered one after another: each right answer shows the next; the last one shows
 * `then` (an explanation, a log) and lets the learner go on. Every question but the first should be
 * made hidden.
 */
export function oneByOne(
  b: BoardKit,
  questions: readonly ReturnType<typeof ask>[],
  then: readonly AnyPlaced[] = [],
): void {
  questions.forEach((q, i) => {
    const next = questions[i + 1];
    if (next !== undefined) b.when(q.on(QuestionSignal.Correct), theBoard.show(next));
    else
      b.when(q.on(QuestionSignal.Correct), [...then.map((p) => theBoard.show(p)), theBoard.pass()]);
  });
}

/** A question in the bank: options shuffled by a seed, the right one anywhere. */
export function pickOne(
  b: BoardKit,
  spec: {
    prompt: Localized;
    right: Localized;
    wrong: readonly { label: Localized; why: Localized }[];
    seed: number;
  },
) {
  const options: Option[] = [
    { id: "right", label: spec.right },
    ...spec.wrong.map((w, i) => ({ id: `w${i}`, label: w.label, feedback: w.why })),
  ];
  return choiceQuestion(b, {
    prompt: spec.prompt,
    options: settle(options, spec.seed),
    answer: "right",
    keepOrder: true,
  });
}

/** A small stable number from a string, to seed the shuffle. */
export const seedOf = (...parts: string[]): number =>
  [...parts.join("|")].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) % 100003, 7);
