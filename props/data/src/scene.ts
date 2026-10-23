import { defineProp } from "@chalk/prop";
import { z } from "zod";

/**
 * Story pictures for Statistics and Probability, one mission across both: Fun Fair Week at
 * school. Riya makes the "10B in Numbers" poster for Annual Day (marks, cricket, family sizes,
 * heights), and Kabir runs a games stall at the fair whose fairness Riya checks (coins, dice,
 * a spinner, a bag of marbles, cards).
 */

export const DataSceneKind = {
  Poster: "poster",
  MarksSheet: "marksSheet",
  Cricket: "cricket",
  FamilySurvey: "familySurvey",
  HeightQueue: "heightQueue",
  CoinToss: "coinToss",
  GameStall: "gameStall",
  DiceGame: "diceGame",
  CardTable: "cardTable",
  Finale: "finale",
} as const;
export type DataSceneKind = (typeof DataSceneKind)[keyof typeof DataSceneKind];

export const DataScenePart = { Picture: "picture" } as const;
export const DATA_PICTURE = { width: 320, height: 180 } as const;

const sceneState = z.object({ scene: z.nativeEnum(DataSceneKind) }).strict();
export type DataSceneState = z.infer<typeof sceneState>;

const DESCRIPTIONS: Record<DataSceneKind, string> = {
  [DataSceneKind.Poster]:
    "The classroom: Riya pins up a big blank chart headed '10B in Numbers' for Annual Day, with empty boxes for 'average', 'most common' and 'middle'; Kabir hands her pins.",
  [DataSceneKind.MarksSheet]:
    "Riya's desk: a marks sheet of the class's maths test grouped in tens (10–20, 20–30, …) with tally marks beside each class; Riya works it out with a pencil while Grandpa looks over her shoulder.",
  [DataSceneKind.Cricket]:
    "The school ground: Kabir bowls at the stumps while a scoreboard at the side lists wickets taken per match in groups; Riya keeps the scorebook.",
  [DataSceneKind.FamilySurvey]:
    "A lane of houses: Riya with a clipboard at a door, asking how many people live there; small numbers (3, 4, 2, 5) float above the houses.",
  [DataSceneKind.HeightQueue]:
    "The morning assembly line: children stand in order of height, shortest to tallest, and Riya points at the one in the middle; a height chart is on the wall.",
  [DataSceneKind.CoinToss]:
    "The verandah: Grandpa flicks a coin into the air while Kabir calls 'Heads!'; a tally of H and T marks is chalked on the wall.",
  [DataSceneKind.GameStall]:
    "Kabir's fun fair stall: a striped awning, a coloured spinner on a board and a glass jar of red, blue and white marbles; a sign says 'Win a prize!'; Riya stands in front with her notebook, checking.",
  [DataSceneKind.DiceGame]:
    "A table at the fair: two dice of different colours have just been thrown, showing a 3 and a 5; Kabir and Mom lean in to see the sum.",
  [DataSceneKind.CardTable]:
    "Grandpa's card table: a pack of cards fanned out in four rows by suit (spades, hearts, diamonds, clubs); Grandpa holds up the ace of spades, and Riya guesses.",
  [DataSceneKind.Finale]:
    "Annual Day: the '10B in Numbers' poster is full of charts (a histogram, an ogive, a 6 × 6 dice grid); the whole family and Kabir's stall banner in the background, everyone cheering.",
};

export const describeDataScene = (s: DataSceneState): string => DESCRIPTIONS[s.scene];

export const dataScene = defineProp({
  type: "dataScene",
  describe:
    "An illustrated story panel for Statistics and Probability (Fun Fair Week): Riya's '10B in Numbers' Annual Day poster, the class marks sheet, the cricket scorebook, the family-size survey, the height line at assembly, Grandpa's coin toss, Kabir's games stall with a spinner and a jar of marbles, two dice at the fair, Grandpa's pack of cards, and the finished poster on Annual Day.",
  state: sceneState,
  defaults: { scene: DataSceneKind.Poster },
  isExplainer: false,
  actions: {},
  observe: (s) => ({
    summary: describeDataScene(s),
    elements: [{ id: DataScenePart.Picture, value: describeDataScene(s) }],
  }),
  parts: () => [DataScenePart.Picture],
});
