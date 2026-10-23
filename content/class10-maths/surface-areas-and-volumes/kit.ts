import { type BoardKit, type PlacedOf, column, family, space } from "@chalk/author";
import type { Level, Localized } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import {
  ComboAction,
  type ComboKind,
  type ComboState,
  type FrustumState,
  type RecastKind,
  type RecastState,
  type SolidsSceneKind,
  Sum,
  type ViewerState,
  comboBuilderDef,
  frustumCutDef,
  meltRecastDef,
  solidViewerDef,
  solidsSceneDef,
  termCount,
} from "@chalk/prop-solids";
import { z } from "zod";

/** A story picture for this chapter, with what it shows. */
export function sceneOn(
  b: BoardKit,
  name: string,
  scene: SolidsSceneKind,
  shows: string,
): PlacedOf<typeof solidsSceneDef> {
  const picture = b.prop(solidsSceneDef, name, { scene });
  b.standsFor(picture, shows);
  return picture;
}

/** One basic solid, drawn and measured. */
export function viewerOn(
  b: BoardKit,
  name: string,
  state: Partial<ViewerState>,
  shows: string,
): PlacedOf<typeof solidViewerDef> {
  const viewer = b.prop(solidViewerDef, name, state);
  b.standsFor(viewer, shows);
  return viewer;
}

/** A combination from the chapter, its sum built term by term. */
export function comboOn(
  b: BoardKit,
  name: string,
  state: Partial<ComboState> & { kind: ComboKind },
  shows: string,
): PlacedOf<typeof comboBuilderDef> {
  const combo = b.prop(comboBuilderDef, name, state);
  b.standsFor(combo, shows);
  return combo;
}

/** How many terms a combination's sum has (the goal: show them all). */
export const termsOf = (kind: ComboKind, sum: Sum = Sum.Surface): number =>
  termCount({ kind, sum });

/** Steps that show every term of a combination's sum, one Reveal each. */
export const revealAll = (combo: PlacedOf<typeof comboBuilderDef>, n: number) =>
  Array.from({ length: n }, () => combo.learner(ComboAction.Reveal, {}));

/** A conversion of one solid into another, stepped. */
export function recastOn(
  b: BoardKit,
  name: string,
  state: Partial<RecastState> & { kind: RecastKind },
  shows: string,
): PlacedOf<typeof meltRecastDef> {
  const recast = b.prop(meltRecastDef, name, state);
  b.standsFor(recast, shows);
  return recast;
}

/** A cone cut into a frustum, stepped. */
export function frustumOn(
  b: BoardKit,
  name: string,
  state: Partial<FrustumState>,
  shows: string,
): PlacedOf<typeof frustumCutDef> {
  const frustum = b.prop(frustumCutDef, name, state);
  b.standsFor(frustum, shows);
  return frustum;
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

/** An item whose answers are words (each in both languages). */
export function wordItem(
  prompt: Localized,
  right: Localized,
  wrong: readonly (readonly [Localized, Localized])[],
): Item {
  return { prompt, right, wrong: wrong.map(([label, why]) => ({ label, why })) };
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
