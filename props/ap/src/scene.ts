import { defineProp } from "@chalk/prop";
import { z } from "zod";

/**
 * Story pictures for the arithmetic progressions chapter: Kabir's cycle fund (a money box that gets
 * ₹5 more each week), and the family's other patterns: Grandpa's ladder, Mom's flower bed, Gauss's
 * sum on a slate, the school tree drive, the potato race and the log stack.
 */

export const ApSceneKind = {
  MoneyBox: "moneyBox",
  CycleShop: "cycleShop",
  GrandpaLadder: "grandpaLadder",
  FlowerBed: "flowerBed",
  GaussSlate: "gaussSlate",
  TreeDrive: "treeDrive",
  PotatoRace: "potatoRace",
  LogStack: "logStack",
  CycleDay: "cycleDay",
} as const;
export type ApSceneKind = (typeof ApSceneKind)[keyof typeof ApSceneKind];

export const ApScenePart = { Picture: "picture" } as const;

export const AP_PICTURE = { width: 320, height: 180 } as const;

const sceneState = z.object({ scene: z.nativeEnum(ApSceneKind) }).strict();
export type ApSceneState = z.infer<typeof sceneState>;

const DESCRIPTIONS: Record<ApSceneKind, string> = {
  [ApSceneKind.MoneyBox]:
    "Kabir's room: Kabir drops a note into an old tin money box on the table; on the wall a chart of his weekly savings, each bar a little taller than the one before (₹100, ₹105, ₹110, …). Riya watches with her notebook.",
  [ApSceneKind.CycleShop]:
    "A cycle shop window: a shiny new cycle with a price tag of ₹4,000. Kabir presses his nose to the glass and points; Mom stands behind him with shopping bags.",
  [ApSceneKind.GrandpaLadder]:
    "The courtyard: Grandpa holds a wooden ladder whose rungs get shorter going up, 45 cm at the bottom to 31 cm at the top; Kabir counts the rungs.",
  [ApSceneKind.FlowerBed]:
    "Mom's garden: a flower bed of roses in rows, the first row the longest and each row two plants shorter than the one before; Mom waters it while Riya counts.",
  [ApSceneKind.GaussSlate]:
    "The verandah: Grandpa's slate shows 1 + 2 + 3 + … + 100 written forwards and backwards, each pair making 101, and the answer 5050 circled; Kabir stares in surprise.",
  [ApSceneKind.TreeDrive]:
    "The school ground on tree-planting day: rows of saplings, one in the first row, two in the next, three in the next, and so on; children with spades and a watering can.",
  [ApSceneKind.PotatoRace]:
    "Sports Day: a bucket at the start line, then potatoes in a straight line, the first 5 m away and the rest 3 m apart; Riya runs back to the bucket with a potato while Kabir cheers.",
  [ApSceneKind.LogStack]:
    "Grandpa's village: logs stacked in rows, the bottom row the longest and each row one log fewer than the row below it; Grandpa leans on the stack.",
  [ApSceneKind.CycleDay]:
    "Kabir's birthday: the tin money box open and empty on the step, Kabir riding his new cycle down the lane under birthday bunting, the family cheering.",
};

export function describeApScene(s: ApSceneState): string {
  return DESCRIPTIONS[s.scene];
}

export const apScene = defineProp({
  type: "apScene",
  describe:
    "An illustrated story panel for the arithmetic progressions chapter: Kabir's money box that grows by ₹5 more each week and the ₹4,000 cycle he is saving for, Grandpa's ladder with shrinking rungs, Mom's flower bed in shrinking rows, Gauss's sum on a slate, the school tree drive, the potato race, the log stack, and Kabir's birthday with the new cycle.",
  state: sceneState,
  defaults: { scene: ApSceneKind.MoneyBox },
  isExplainer: false,
  actions: {},
  observe: (s) => ({
    summary: describeApScene(s),
    elements: [{ id: ApScenePart.Picture, value: describeApScene(s) }],
  }),
  parts: () => [ApScenePart.Picture],
});
