import { type Box, defineProp } from "@chalk/prop";
import { z } from "zod";

/**
 * Story panels for the periodic-table chapter's "Card Wall" arc: Riya and Kabir sort a shoebox of
 * 118 element cards into a display for the school's Element Quiz Night. A fixed 320 × 180 picture,
 * scaled; nothing to tap.
 */

export const PeriodicScene = {
  CardHeap: "cardHeap",
  ShopShelves: "shopShelves",
  CardTriads: "cardTriads",
  MusicClass: "musicClass",
  CardWall: "cardWall",
  HydrogenCard: "hydrogenCard",
  MoseleyNumbers: "moseleyNumbers",
  QuizNight: "quizNight",
} as const;
export type PeriodicScene = (typeof PeriodicScene)[keyof typeof PeriodicScene];

export const PeriodicScenePart = { Picture: "picture" } as const;
export const PERIODIC_PICTURE = { width: 320, height: 180 } as const;

const sceneState = z.object({ scene: z.nativeEnum(PeriodicScene) }).strict();
export type PeriodicSceneState = z.infer<typeof sceneState>;

const WORDS: Readonly<Record<PeriodicScene, string>> = {
  cardHeap:
    "Kabir tips a shoebox of element cards onto the floor: a jumbled heap of symbols. Beside it, a poster for the school's Element Quiz Night. Riya frowns at the heap.",
  shopShelves:
    "A general store: soaps on one shelf, biscuits on another, and the soaps split again into bathing soaps and washing soaps. Riya points: 'Sorted things are easy to find.'",
  cardTriads:
    "The cards laid out in piles of three on the floor: Li, Na, K in one pile, Ca, Sr, Ba in another, Cl, Br, I in a third. Kabir holds up a fourth pile that doesn't fit.",
  musicClass:
    "Riya at a harmonium in music class, the notes sa re ga ma pa da ni written on the board, and an eighth key glowing: sa again.",
  cardWall:
    "The bedroom wall covered with element cards pinned in rows and columns, with three empty spaces marked with question marks. Grandpa nods: 'That's how Mendeléev did it.'",
  hydrogenCard:
    "Kabir holds the hydrogen card in the air, unsure: one arrow points to the alkali-metal column, another to the halogen column.",
  moseleyNumbers:
    "The cards re-numbered: each card now shows a big atomic number in its corner, 1, 2, 3 … in order, and cobalt (27) and nickel (28) sit in their right places.",
  quizNight:
    "Quiz Night in the school hall: the class's card wall on a board, Riya at the microphone answering, Kabir pointing at a column, Mom and Grandpa clapping in the audience.",
};

export const describePeriodicScene = (s: PeriodicSceneState): string => WORDS[s.scene];

export const periodicScene = defineProp({
  type: "periodicScene",
  describe:
    "A story panel for the periodic-table chapter (Riya and Kabir build an element card wall for the school's Element Quiz Night): the heap of cards, sorted shop shelves, cards in triads, a harmonium with sa re ga ma, the card wall with gaps, the hydrogen card with no home, the cards numbered by atomic number, and Quiz Night. Nothing to tap.",
  state: sceneState,
  defaults: { scene: PeriodicScene.CardHeap },
  inputs: ["scene"],
  actions: {},
  observe: (s) => ({
    summary: describePeriodicScene(s),
    elements: [{ id: PeriodicScenePart.Picture, value: describePeriodicScene(s) }],
  }),
  parts: () => [PeriodicScenePart.Picture],
  locate: (_s, part, width): Box | undefined =>
    part === PeriodicScenePart.Picture
      ? {
          x: 0,
          y: 0,
          width,
          height: Math.round((PERIODIC_PICTURE.height * width) / PERIODIC_PICTURE.width),
        }
      : undefined,
});
