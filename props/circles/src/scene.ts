import { defineProp } from "@chalk/prop";
import { z } from "zod";

/**
 * Story pictures for Class 10 maths Ch 10–12, "Kabir's cycle poster". The school science fair asks
 * for a poster on "How a cycle works". Kabir brings the cycle he saved up for; Riya draws the poster.
 * Ch 10: the wheel touches the road at one point and the spoke there stands straight up on it (a
 * tangent is perpendicular to the radius); the chain runs off the sprockets along tangents; Grandpa's
 * village well pulley. Ch 11: Riya draws the cycle to scale with compass and ruler. Ch 12: how far
 * one turn of the wheel goes, the sector-shaped mudguard and reflector, the poster's shaded
 * designs, and the fair.
 */

export const CirclesSceneKind = {
  FairNotice: "fairNotice",
  WheelRoad: "wheelRoad",
  WellPulley: "wellPulley",
  ChainSprockets: "chainSprockets",
  CompassBox: "compassBox",
  PosterDesk: "posterDesk",
  WheelRoll: "wheelRoll",
  Mudguard: "mudguard",
  PosterDesign: "posterDesign",
  FairDay: "fairDay",
} as const;
export type CirclesSceneKind = (typeof CirclesSceneKind)[keyof typeof CirclesSceneKind];

export const CirclesScenePart = { Picture: "picture" } as const;
export const CIRCLES_PICTURE = { width: 320, height: 180 } as const;

const sceneState = z.object({ scene: z.nativeEnum(CirclesSceneKind) }).strict();
export type CirclesSceneState = z.infer<typeof sceneState>;

const DESCRIPTIONS: Record<CirclesSceneKind, string> = {
  [CirclesSceneKind.FairNotice]:
    'The school notice board: a poster announces the science fair, theme "How a cycle works". Kabir stands beside his new cycle and Riya points at the notice: they will make the poster together.',
  [CirclesSceneKind.WheelRoad]:
    "Close up of the cycle's front wheel on the road. The wheel touches the road at just one point, and the spoke to that point stands straight up from the road, marked with a small square for a right angle. Kabir crouches and points at the spot.",
  [CirclesSceneKind.WellPulley]:
    "Grandpa's village well: a rope runs over a round pulley on a wooden frame, down into the well on one side and to Grandpa's hands on the other. Each straight part of the rope just touches the pulley's rim.",
  [CirclesSceneKind.ChainSprockets]:
    "Kabir kneels by the cycle with the chain cover off: the chain runs round a big front sprocket and a small rear sprocket, and its two straight runs leave each sprocket just touching it.",
  [CirclesSceneKind.CompassBox]:
    "Riya at the study table with an open geometry box: she draws a circle with a compass, a ruler and a set square beside the chart paper.",
  [CirclesSceneKind.PosterDesk]:
    "The chart paper on the table: a small sketch of the cycle frame and Riya's bigger copy of it with the same shape, with ruler lines and compass arcs showing how she scaled it up.",
  [CirclesSceneKind.WheelRoll]:
    "The colony lane: Kabir wheels the cycle forward one full turn of the wheel. A chalk mark on the tyre started on the road, and two chalk lines on the road mark how far one turn carried it: the wheel's circumference.",
  [CirclesSceneKind.Mudguard]:
    "The back of the cycle: the mudguard covers a slice of the wheel like a piece of pizza between two spokes, and a red reflector on the spokes is cut off by a straight edge. Riya measures the mudguard's angle with a protractor.",
  [CirclesSceneKind.PosterDesign]:
    "The finished poster border: a square tile with four circles inside it, a square with petals drawn by semicircles, and shaded corners; Kabir colours the shaded parts while Riya adds up their areas.",
  [CirclesSceneKind.FairDay]:
    'Science fair day: the poster "How a cycle works" hangs over the stall with the cycle in front, Riya and Kabir explain it to a visitor, and Grandpa and Mom cheer.',
};

export function describeCirclesScene(s: CirclesSceneState): string {
  return DESCRIPTIONS[s.scene];
}

export const circlesScene = defineProp({
  type: "circlesScene",
  describe:
    "An illustrated story panel for Class 10 maths Ch 10–12 (circles, constructions, areas related to circles), \"Kabir's cycle poster\": the science fair notice, the wheel touching the road with its spoke upright, Grandpa's well pulley, the chain running off the sprockets, Riya's geometry box, the poster drawn to scale, one turn of the wheel along the lane, the sector-shaped mudguard and cut-off reflector, the poster's shaded designs, and the fair day.",
  state: sceneState,
  defaults: { scene: CirclesSceneKind.FairNotice },
  isExplainer: false,
  actions: {},
  observe: (s) => ({
    summary: describeCirclesScene(s),
    elements: [{ id: CirclesScenePart.Picture, value: describeCirclesScene(s) }],
  }),
  parts: () => [CirclesScenePart.Picture],
});
