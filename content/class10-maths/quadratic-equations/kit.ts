import type { BoardKit, PlacedOf } from "@chalk/author";
import type { Localized } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { type QuadraticSceneKind, quadraticSceneDef } from "@chalk/prop-quadratics";

/** A story picture for this chapter, with what it shows. */
export function sceneOn(
  b: BoardKit,
  name: string,
  scene: QuadraticSceneKind,
  shows: string,
): PlacedOf<typeof quadraticSceneDef> {
  const picture = b.prop(quadraticSceneDef, name, { scene });
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
  });
}

/** A seed from an item's name, so each item shuffles its own way. */
export const seedOf = (name: string) => [...name].reduce((s, ch) => s * 31 + ch.charCodeAt(0), 7);
