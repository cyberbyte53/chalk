import { type BoardKit, type PlacedOf, column, family, space } from "@chalk/author";
import type { Level, Localized } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { type DataSceneKind, dataSceneDef } from "@chalk/prop-data";
import { z } from "zod";

/** A story picture for this chapter, with what it shows. */
export function sceneOn(
  b: BoardKit,
  name: string,
  scene: DataSceneKind,
  shows: string,
): PlacedOf<typeof dataSceneDef> {
  const picture = b.prop(dataSceneDef, name, { scene });
  b.standsFor(picture, shows);
  return picture;
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
export const seedOf = (name: string) =>
  [...name].reduce((s, ch) => (s * 31 + ch.charCodeAt(0)) % 2147483647, 7);

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

/** A fraction label, in maths. */
export const frac = (a: number | string, b: number | string) => String.raw`$\dfrac{${a}}{${b}}$`;
