import { type Box, defineProp } from "@chalk/prop";
import { z } from "zod";

/**
 * Story pictures for the eye chapter: Riya's blurry blackboard and her eye test, Grandpa's
 * newspaper and his bifocals, then the family's trip to the hills with Kabir's notebook of "why"
 * questions (the waterfall rainbow, the twinkling stars, the misty forest, the sunrise).
 */

export const EyeSceneKind = {
  MovieEye: "movieEye",
  Blackboard: "blackboard",
  GrandpaPaper: "grandpaPaper",
  BrightToDim: "brightToDim",
  EyeTest: "eyeTest",
  Bifocals: "bifocals",
  EyePledge: "eyePledge",
  HillDrive: "hillDrive",
  Waterfall: "waterfall",
  StarryNight: "starryNight",
  MistyForest: "mistyForest",
  SunrisePoint: "sunrisePoint",
} as const;
export type EyeSceneKind = (typeof EyeSceneKind)[keyof typeof EyeSceneKind];

export const EyeScenePart = { Picture: "picture" } as const;
export const EYE_PICTURE = { width: 320, height: 180 } as const;

const sceneState = z.object({ scene: z.nativeEnum(EyeSceneKind) }).strict();
export type EyeSceneState = z.infer<typeof sceneState>;

const DESCRIPTIONS: Record<EyeSceneKind, string> = {
  [EyeSceneKind.MovieEye]:
    "Movie night: the shoebox projector throws the film on the wall; Riya, on the sofa, imagines her own eye beside it: a lens at the front and an upside-down picture on the back, just like the box.",
  [EyeSceneKind.Blackboard]:
    "A classroom from the back: the blackboard's writing is a blur from the last row, where Riya sits squinting; the front rows read it easily.",
  [EyeSceneKind.GrandpaPaper]:
    "Grandpa on the sofa holding the newspaper at arm's length, squinting, his old glasses pushed up on his forehead; Kabir watches, amused.",
  [EyeSceneKind.BrightToDim]:
    "Riya steps from the sunny verandah into the dim storeroom: at first she can see almost nothing inside, though everything is there.",
  [EyeSceneKind.EyeTest]:
    "At the eye clinic: a letter chart on the far wall, big E at the top and tiny letters below; Riya sits wearing a trial frame while the optician slips in a lens; Mom waits.",
  [EyeSceneKind.Bifocals]:
    "Grandpa in his new bifocal glasses: he looks up through the top part to see the TV across the room, and down through the bottom part to read the newspaper in his lap.",
  [EyeSceneKind.EyePledge]:
    "At the clinic's desk, Mom fills in an eye donation pledge card; a poster says one pair of eyes can give sight to up to four people.",
  [EyeSceneKind.HillDrive]:
    "The family's car on a winding mountain road at dawn; in the back seat Kabir holds up his notebook titled 'Why?'.",
  [EyeSceneKind.Waterfall]:
    "A waterfall in the hills with a rainbow in its spray; the Sun is low behind the family, who stand with their backs to it, looking at the rainbow.",
  [EyeSceneKind.StarryNight]:
    "Night at a roadside dhaba in the hills: a sky full of stars, one bright steady 'star' (a planet) low in the west; Kabir points up while Grandpa holds a cup of chai over the glowing stove.",
  [EyeSceneKind.MistyForest]:
    "A misty pine forest in the morning: beams of sunlight slant down between the trees, clearly visible in the mist; the family walks along the path.",
  [EyeSceneKind.SunrisePoint]:
    "The sunrise point: the family on a ridge watching a big red Sun just above the far hills, the sky orange near the horizon and blue higher up.",
};

export function describeEyeScene(s: EyeSceneState): string {
  return DESCRIPTIONS[s.scene];
}

export const eyeScene = defineProp({
  type: "eyeScene",
  describe:
    "An illustrated story panel for the eye chapter: Riya's blurry blackboard and eye test, Grandpa's newspaper and bifocals, an eye-donation pledge, then the family's hill trip (the drive, a waterfall rainbow, stars and a planet at night, sunbeams in a misty forest, a red sunrise).",
  state: sceneState,
  defaults: { scene: EyeSceneKind.Blackboard },
  isExplainer: false,
  actions: {},
  observe: (s) => ({
    summary: describeEyeScene(s),
    elements: [{ id: EyeScenePart.Picture, value: describeEyeScene(s) }],
  }),
  parts: () => [EyeScenePart.Picture],
  locate: (_s, part, width): Box | undefined =>
    part === EyeScenePart.Picture
      ? { x: 0, y: 0, width, height: Math.round((EYE_PICTURE.height * width) / EYE_PICTURE.width) }
      : undefined,
});
