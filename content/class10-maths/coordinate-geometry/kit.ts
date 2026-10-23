import { type BoardKit, type PlacedOf, column, family, space } from "@chalk/author";
import type { Level, Localized } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { FigureAction, type FigureState, geoFigureDef } from "@chalk/prop-circles";
import {
  AreaAction,
  type AreaState,
  type CoordinatesSceneKind,
  PlaneAction,
  type PlaneState,
  SectionAction,
  type SectionState,
  coordinatePlaneDef,
  coordinatesSceneDef,
  sectionDividerDef,
  triangleAreaDef,
} from "@chalk/prop-coordinates";
import { z } from "zod";

/** A story picture for this chapter, with what it shows. */
export function sceneOn(
  b: BoardKit,
  name: string,
  scene: CoordinatesSceneKind,
  shows: string,
): PlacedOf<typeof coordinatesSceneDef> {
  const picture = b.prop(coordinatesSceneDef, name, { scene });
  b.standsFor(picture, shows);
  return picture;
}

/** Graph paper with points (coordinatePlane); the learner may move the movable ones and step a proof. */
export function planeOn(
  b: BoardKit,
  name: string,
  state: Partial<PlaneState>,
  shows: string,
): PlacedOf<typeof coordinatePlaneDef> {
  const placed = b.prop(coordinatePlaneDef, name, {
    movable: [],
    snap: 1,
    join: "segment",
    showCoords: true,
    showLengths: false,
    showTriangle: false,
    showWorking: false,
    proof: false,
    step: 0,
    ...state,
  } as PlaneState);
  if ((state.movable ?? []).length > 0)
    for (const a of [PlaneAction.SetPoint, PlaneAction.Nudge]) b.studentOnly(placed.action(a));
  if (state.proof === true)
    for (const a of [PlaneAction.Next, PlaneAction.Back, PlaneAction.Again])
      b.studentOnly(placed.action(a));
  b.standsFor(placed, shows);
  return placed;
}

/** A segment and its dividing point (sectionDivider). */
export function dividerOn(
  b: BoardKit,
  name: string,
  state: Partial<SectionState>,
  shows: string,
): PlacedOf<typeof sectionDividerDef> {
  const placed = b.prop(sectionDividerDef, name, {
    names: ["A", "B", "P"],
    maxParts: 8,
    canRatio: true,
    canMove: false,
    showCoords: true,
    showParts: false,
    showSimilar: false,
    showWorking: true,
    ...state,
  } as SectionState);
  if (state.canRatio !== false)
    for (const a of [SectionAction.NudgeM, SectionAction.NudgeN, SectionAction.SetAlong])
      b.studentOnly(placed.action(a));
  if (state.canMove === true) b.studentOnly(placed.action(SectionAction.SetEnd));
  b.standsFor(placed, shows);
  return placed;
}

/** A triangle and its area from coordinates (triangleArea). */
export function areaOn(
  b: BoardKit,
  name: string,
  state: Partial<AreaState>,
  shows: string,
): PlacedOf<typeof triangleAreaDef> {
  const placed = b.prop(triangleAreaDef, name, {
    feet: ["P", "Q", "R"],
    movable: [],
    snap: 1,
    showCoords: true,
    showWorking: true,
    proof: false,
    step: 0,
    ...state,
  } as AreaState);
  if ((state.movable ?? []).length > 0)
    for (const a of [AreaAction.SetPoint, AreaAction.Nudge]) b.studentOnly(placed.action(a));
  if (state.proof === true)
    for (const a of [AreaAction.Next, AreaAction.Back, AreaAction.Again])
      b.studentOnly(placed.action(a));
  b.standsFor(placed, shows);
  return placed;
}

/** A figure for a worked example (geoFigure); with two or more captions the learner taps through. */
export type FigureSpec = Pick<FigureState, "points" | "items" | "captions" | "about"> & {
  height?: number;
};

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
