import { defineProp } from "@chalk/prop";
import { z } from "zod";

/**
 * Story pictures for Class 10 maths Ch 7, "The colony treasure hunt". On Sunday the colony's little
 * kids get a treasure hunt in the park, and Riya and Kabir are setting it with Grandpa's graph-paper
 * map of the park: the gate is the origin, the wall is the x-axis, the central path is the y-axis,
 * one square is 1 m. Mom's herb patch is in the corner.
 */

export const CoordinatesSceneKind = {
  ParkMap: "parkMap",
  CrowFlies: "crowFlies",
  ClueStones: "clueStones",
  HalfwayClue: "halfwayClue",
  FlowerBed: "flowerBed",
  HerbPatch: "herbPatch",
  HuntDay: "huntDay",
} as const;
export type CoordinatesSceneKind = (typeof CoordinatesSceneKind)[keyof typeof CoordinatesSceneKind];

export const CoordinatesScenePart = { Picture: "picture" } as const;
export const COORDINATES_PICTURE = { width: 320, height: 180 } as const;

const sceneState = z.object({ scene: z.nativeEnum(CoordinatesSceneKind) }).strict();
export type CoordinatesSceneState = z.infer<typeof sceneState>;

const DESCRIPTIONS: Record<CoordinatesSceneKind, string> = {
  [CoordinatesSceneKind.ParkMap]:
    "Grandpa spreads his old graph-paper map of the colony park on the table. Two lines cross at the gate, marked O: one along the wall, one up the central path. Dots mark the swing, the slide and the banyan tree. Riya and Kabir lean in with a pile of clue cards.",
  [CoordinatesSceneKind.CrowFlies]:
    "The park seen from above: the gate at the bottom, the banyan tree up and to the right. Kabir's footprints go 36 m along the wall and then 15 m up to the tree; a dashed straight line goes from the gate to the tree with a question mark on it. A crow flies along the dashed line.",
  [CoordinatesSceneKind.ClueStones]:
    "Kabir sets down the third of three painted clue stones on the grass. A dashed line through the three stones shows they are in one straight line; Riya checks the map.",
  [CoordinatesSceneKind.HalfwayClue]:
    "The straight path from the gate to the banyan tree. Kabir pushes a clue flag into the ground on the path, a third of the way from the gate. Small marks split the path into three equal parts: one part from the gate to the flag, two parts from the flag to the tree.",
  [CoordinatesSceneKind.FlowerBed]:
    "A flower bed shaped like a parallelogram. Three of its corners have little flags; the fourth corner has a question mark. Riya holds the map and a measuring tape; Kabir holds the last clue card.",
  [CoordinatesSceneKind.HerbPatch]:
    "Mom kneels by her triangular herb patch in the park's corner. Three pegs mark the corners, with string between them, and a bag of mulch waits beside her. Kabir reads the pegs' coordinates off the map.",
  [CoordinatesSceneKind.HuntDay]:
    "Sunday, hunt day. Little kids with clue cards run across the park. In the middle of a triangle formed by the swing, the slide and the banyan, a treasure box is dug up. Riya and Kabir grin; Mom and Grandpa clap by the gate.",
};

export function describeCoordinatesScene(s: CoordinatesSceneState): string {
  return DESCRIPTIONS[s.scene];
}

export const coordinatesScene = defineProp({
  type: "coordinatesScene",
  describe:
    "An illustrated story panel for Class 10 maths Ch 7 (coordinate geometry), \"The colony treasure hunt\": Grandpa's graph-paper map of the park with the gate as the origin, Kabir's walk to the banyan along the wall versus the crow's straight line, three clue stones in a line, a clue flag a third of the way along the path, the parallelogram flower bed with a missing corner, Mom's triangular herb patch, and the hunt day.",
  state: sceneState,
  defaults: { scene: CoordinatesSceneKind.ParkMap },
  isExplainer: false,
  actions: {},
  observe: (s) => ({
    summary: describeCoordinatesScene(s),
    elements: [{ id: CoordinatesScenePart.Picture, value: describeCoordinatesScene(s) }],
  }),
  parts: () => [CoordinatesScenePart.Picture],
});
