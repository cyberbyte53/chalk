import { type BoardKit, type PlacedOf, column, family, space } from "@chalk/author";
import type { Level, Localized } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import {
  type CirclesSceneKind,
  FigureAction,
  type FigureState,
  circlesSceneDef,
  geoFigureDef,
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

/** A figure for a worked example or question: what it draws, step by step when it has captions. */
export type FigureSpec = Pick<FigureState, "points" | "items" | "captions" | "about"> & {
  height?: number;
};

/** A drawn figure (geoFigure); with two or more captions the learner taps through its steps. */
export function figureOn(
  b: BoardKit,
  name: string,
  fig: FigureSpec,
): PlacedOf<typeof geoFigureDef> {
  const placed = b.prop(geoFigureDef, name, { step: 0, canStep: true, height: 220, ...fig });
  if (fig.captions.length > 1)
    for (const a of [FigureAction.Next, FigureAction.Back, FigureAction.Reset])
      b.studentOnly(placed.action(a));
  b.standsFor(placed, fig.about);
  return placed;
}

/** One question in a bank: the prompt, the right answer and the wrong answers with why. */
export type Item = {
  prompt: Localized;
  right: Localized;
  wrong: readonly { label: Localized; why: Localized }[];
};

/** A choice question built from an item, its options shuffled by the seed. */
export function itemQuestion(b: BoardKit, item: Item, seed: number) {
  const options: Option[] = [
    { id: "right", label: item.right },
    ...item.wrong.map((w, i) => ({ id: `wrong${i}`, label: w.label, feedback: w.why })),
  ];
  return choiceQuestion(b, {
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
