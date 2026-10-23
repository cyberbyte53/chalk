import { type BoardKit, type PlacedOf, column, family, space } from "@chalk/author";
import type { Level, Localized } from "@chalk/content";
import {
  type Option,
  type OrderStep,
  choiceQuestion,
  goalQuestion,
  orderQuestion,
  settle,
} from "@chalk/patterns";
import {
  type CirclesSceneKind,
  ConstructionAction,
  ConstructionDerived,
  ConstructionKind,
  type ConstructionState,
  circlesSceneDef,
  constructionDef,
  constructionStepCountOf,
} from "@chalk/prop-circles";
import { z } from "zod";

/** A story picture for this chapter, with what it shows. */
export function sceneOn(
  b: BoardKit,
  name: string,
  scene: CirclesSceneKind,
  shows: string,
): PlacedOf<typeof circlesSceneDef> {
  const picture = b.prop(circlesSceneDef, name, { scene });
  b.standsFor(picture, shows);
  return picture;
}

/** Every field a construction can take; a lesson sets the ones its kind uses. */
const BASE: ConstructionState = {
  kind: ConstructionKind.Divide,
  step: 0,
  canStep: true,
  showTool: true,
  length: 7.6,
  m: 3,
  n: 2,
  ab: 5,
  bc: 6,
  ca: 7,
  r: 3,
  d: 6,
  angle: 60,
};

/**
 * A construction the learner steps through, with a goal to reach its last step (Continue once the
 * figure is finished). Returns the prop and the goal.
 */
export function constructionOn(
  b: BoardKit,
  name: string,
  setup: Partial<ConstructionState> & { kind: ConstructionKind },
  shows: string,
  prompt: Localized,
) {
  const state: ConstructionState = { ...BASE, ...setup };
  const steps = constructionStepCountOf(state);
  const figure = b.prop(constructionDef, name, state);
  b.studentOnly(figure.action(ConstructionAction.Next));
  b.studentOnly(figure.action(ConstructionAction.Back));
  b.studentOnly(figure.action(ConstructionAction.Reset));
  b.standsFor(figure, shows);
  const goal = goalQuestion(b, {
    about: figure,
    prompt,
    isMet: figure.derived(ConstructionDerived.IsDone),
    solve: Array.from({ length: steps - 1 }, () => figure.learner(ConstructionAction.Next, {})),
  });
  return { figure, goal };
}

/** One question in a bank: the prompt, the right answer and the wrong answers with why. */
export type Item = {
  prompt: Localized;
  right: Localized;
  wrong: readonly { label: Localized; why: Localized }[];
};

/** A choice question built from an item, its options shuffled by the seed. */
export function itemQuestion(b: BoardKit, item: Item, seed: number, name?: string) {
  const options: Option[] = [
    { id: "right", label: item.right },
    ...item.wrong.map((w, i) => ({ id: `wrong${i}`, label: w.label, feedback: w.why })),
  ];
  return choiceQuestion(b, {
    ...(name === undefined ? {} : { name }),
    prompt: item.prompt,
    options: settle(options, seed),
    answer: "right",
    keepOrder: true,
  });
}

/** A seed from an item's name, so each item shuffles its own way. */
export const seedOf = (name: string) => [...name].reduce((s, ch) => s * 31 + ch.charCodeAt(0), 7);

/** The same text in both languages (numbers and maths only). */
export const both = (text: string): Localized => ({ en: text, hi: text });

/** A wrong answer: what it says (maths, same in both languages) and why it's wrong. */
export type Slip = readonly [label: string, why: Localized];

/** An item whose answers are numbers or maths (the same in both languages). */
export function numItem(prompt: Localized, right: string, wrong: readonly Slip[]): Item {
  return {
    prompt,
    right: both(right),
    wrong: wrong.map(([label, why]) => ({ label: both(label), why })),
  };
}

/**
 * A question family built from a bank of items: each case picks one item by name. The build reads
 * the family's params from params.yaml (one row per item).
 */
export function bankFamily<N extends string, C extends string>(
  items: Readonly<Record<N, Item>>,
  spec: { level: Level; tests: readonly [C, ...C[]] },
) {
  const names = Object.keys(items) as [N, ...N[]];
  return family({
    level: spec.level,
    tests: spec.tests,
    params: z.object({ item: z.enum(names) }).strict(),
    build: ({ item }, b) =>
      column([itemQuestion(b, items[item as N], seedOf(item as string)), space()]),
  });
}

/** Steps of a construction to put in order, in the right order. */
export type StepsItem = { prompt: Localized; steps: readonly OrderStep[] };

/** An order question from a steps item, offered shuffled (never already in order). */
export function stepsQuestion(b: BoardKit, item: StepsItem, seed: number, name?: string) {
  const answer = item.steps.map((s) => s.id);
  let shown = settle(answer, seed);
  if (shown.every((id, i) => id === answer[i])) shown = [...answer].reverse();
  return orderQuestion(b, {
    ...(name === undefined ? {} : { name }),
    prompt: item.prompt,
    steps: item.steps,
    shown,
    answers: [answer],
  });
}

/** A family of "put the construction's steps in order" questions, one per item. */
export function stepsFamily<N extends string, C extends string>(
  items: Readonly<Record<N, StepsItem>>,
  spec: { level: Level; tests: readonly [C, ...C[]] },
) {
  const names = Object.keys(items) as [N, ...N[]];
  return family({
    level: spec.level,
    tests: spec.tests,
    params: z.object({ item: z.enum(names) }).strict(),
    build: ({ item }, b) =>
      column([stepsQuestion(b, items[item as N], seedOf(item as string)), space()]),
  });
}
