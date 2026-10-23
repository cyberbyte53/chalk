import { defineProp } from "@chalk/prop";
import { z } from "zod";

/**
 * Story pictures for the trigonometry chapters, "The Kite Hill". Makar Sankranti is coming and the
 * family will fly kites from the old fort on the hill. Nobody can climb a kite string, so Grandpa
 * shows Riya and Kabir how to measure with angles: a homemade clinometer and a ratio card (Ch 8),
 * then a festival day of measuring the tower, the kite, the temple flag and the river (Ch 9).
 */

export const TrigSceneKind = {
  FortHill: "fortHill",
  Clinometer: "clinometer",
  LadderCourtyard: "ladderCourtyard",
  RatioCard: "ratioCard",
  TowerSighting: "towerSighting",
  KiteFlying: "kiteFlying",
  TempleAcrossRiver: "templeAcrossRiver",
  BalloonDrift: "balloonDrift",
  SankrantiSunset: "sankrantiSunset",
} as const;
export type TrigSceneKind = (typeof TrigSceneKind)[keyof typeof TrigSceneKind];

export const TrigScenePart = { Picture: "picture" } as const;

export const TRIG_PICTURE = { width: 320, height: 180 } as const;

const sceneState = z.object({ scene: z.nativeEnum(TrigSceneKind) }).strict();
export type TrigSceneState = z.infer<typeof sceneState>;

const DESCRIPTIONS: Record<TrigSceneKind, string> = {
  [TrigSceneKind.FortHill]:
    "The old fort on a hill above the town, its watch-tower against the sky and a few kites already flying over it. Kabir points up at a kite: how high does it go? Riya and Grandpa look up beside him.",
  [TrigSceneKind.Clinometer]:
    "Grandpa's table: a protractor with a drinking straw taped along its straight edge and a thread with a nut hanging from the centre. Grandpa holds it up to his eye; Riya and Kabir watch the thread hang straight down across the degree marks.",
  [TrigSceneKind.LadderCourtyard]:
    "The fort courtyard: a ladder leans against the old wall, making a right triangle with the wall and the ground. Riya measures the ladder's foot from the wall with a tape; Kabir holds the ladder.",
  [TrigSceneKind.RatioCard]:
    "Riya's ratio card pinned to the clinometer: a small table of sin, cos and tan for 0°, 30°, 45°, 60° and 90°. Riya holds it up proudly; Kabir reads it.",
  [TrigSceneKind.TowerSighting]:
    "Festival morning at the fort: Kabir stands 30 m from the foot of the watch-tower and looks through the clinometer's straw at the top; a dashed line of sight runs from his eye to the top, above the level line. Riya writes the reading, 45°, in her notebook.",
  [TrigSceneKind.KiteFlying]:
    "On the fort terrace Kabir flies his kite; the string runs straight up to it at an angle of 30° to the ground. Grandpa winds the spool; the kite is level with the watch-tower top.",
  [TrigSceneKind.TempleAcrossRiver]:
    "From the top of the fort wall Riya looks down at the temple on the far bank of the river; the level line from her eye and the dashed line of sight down to the temple make the angle of depression. A flag flies on the temple roof.",
  [TrigSceneKind.BalloonDrift]:
    "A hot-air balloon drifts over the valley at a fixed height; Kabir sights it twice from the same spot, first steeply at 60°, then at 30° once it has drifted away with the wind at the same height.",
  [TrigSceneKind.SankrantiSunset]:
    "Sunset on Makar Sankranti: kites fill the orange sky over the fort, Kabir's kite highest of all. The family cheers on the terrace; Riya holds up the notebook with every height they measured.",
};

export function describeTrigScene(s: TrigSceneState): string {
  return DESCRIPTIONS[s.scene];
}

export const trigScene = defineProp({
  type: "trigScene",
  describe:
    "An illustrated story panel for the trigonometry chapters, \"The Kite Hill\": the fort on the hill with kites over it, Grandpa's homemade clinometer (protractor, straw and plumb line), a ladder against the fort wall, Riya's ratio card of special values, sighting the watch-tower top with the clinometer, Kabir's kite on its string, looking down from the wall at the temple across the river (angle of depression), a drifting hot-air balloon sighted twice, and the Makar Sankranti sunset with kites.",
  state: sceneState,
  defaults: { scene: TrigSceneKind.FortHill },
  isExplainer: false,
  actions: {},
  observe: (s) => ({
    summary: describeTrigScene(s),
    elements: [{ id: TrigScenePart.Picture, value: describeTrigScene(s) }],
  }),
  parts: () => [TrigScenePart.Picture],
});
