import { type Box, defineProp } from "@chalk/prop";
import { z } from "zod";

/**
 * Story panels for the chapter's "never again in the dark" arc: another power cut, Kabir's compass
 * going wild beside the long wire of his battery circuit, the kabadiwala's crane lifting a car with no hook, Grandpa's
 * old mixer opened up, Kabir's bicycle dynamo lighting its lamp, Mom's iron giving a tingle, the
 * meter board's red, black and green wires, and the hand-crank torch glowing in the next power
 * cut. A fixed 320 × 180 picture, scaled; nothing to tap.
 */

export const MagnetismScene = {
  PowerCutAgain: "powerCutAgain",
  CompassJumps: "compassJumps",
  ScrapCrane: "scrapCrane",
  MixerOpen: "mixerOpen",
  BicycleDynamo: "bicycleDynamo",
  IronTingle: "ironTingle",
  MeterBoard: "meterBoard",
  CrankTorch: "crankTorch",
} as const;
export type MagnetismScene = (typeof MagnetismScene)[keyof typeof MagnetismScene];

export const MagnetismScenePart = { Picture: "picture" } as const;
export const SCENE_PICTURE = { width: 320, height: 180 } as const;

const sceneState = z.object({ scene: z.nativeEnum(MagnetismScene) }).strict();
export type MagnetismSceneState = z.infer<typeof sceneState>;

const WORDS: Readonly<Record<MagnetismScene, string>> = {
  powerCutAgain:
    "Night, another power cut: the family in a dark room by one candle. Grandpa tells of his father's bicycle lamp that lit with no cell inside; Riya and Kabir listen, a dead torch on the table.",
  compassJumps:
    "Kabir kneels on the floor by his science kit: a 4.5 V battery, a switch, and one long loose wire running across the floor to a small bulb. A compass lies right beside the wire. The switch is closed, the bulb glows, and the needle has swung away from north; Kabir stares.",
  scrapCrane:
    "The kabadiwala's yard: a crane holds a big flat round disc over an old car, and the car's roof is lifted up against the disc with no hook or rope. Kabir and Grandpa watch from the gate.",
  mixerOpen:
    "Grandpa's old mixer opened on newspaper on the table: inside, a coil of copper wire on an iron core between curved magnets, and two small carbon brushes. Grandpa points with a screwdriver; Riya leans in.",
  bicycleDynamo:
    "Evening: Kabir rides his bicycle and a small dynamo rubs against the turning tyre; the front lamp glows. When he stops, the lamp goes out.",
  ironTingle:
    "Mom jerks her hand back from the iron on the ironing board, startled by a tingle. Grandpa unplugs it and looks at the plug: its third, earth pin's wire has come loose.",
  meterBoard:
    "The meter board by the door with its cover off: the meter, a fuse box, the main switch, and wires in red, black and green running off to the rooms. Riya points at each colour; Kabir holds the torch.",
  crankTorch:
    "The next power cut: Kabir turns the handle of a small home-made torch and its bulb glows, lighting the whole family's smiling faces. Grandpa claps.",
};

export function describeMagnetismScene(s: MagnetismScene): string {
  return WORDS[s];
}

export const magnetismScene = defineProp({
  type: "magnetismScene",
  describe:
    "An illustrated story panel for the magnetic effects chapter: another power cut, a compass swinging by a battery circuit's wire, a scrapyard electromagnet lifting a car, an old mixer's motor opened up, a bicycle dynamo lighting its lamp, an iron with a loose earth wire, the meter board's red, black and green wires, and the hand-crank torch glowing at the end.",
  state: sceneState,
  defaults: { scene: MagnetismScene.PowerCutAgain },
  inputs: ["scene"],
  actions: {},
  observe: (s) => ({
    summary: describeMagnetismScene(s.scene),
    elements: [{ id: MagnetismScenePart.Picture, value: describeMagnetismScene(s.scene) }],
  }),
  parts: () => [MagnetismScenePart.Picture],
  locate: (_s, part, width): Box | undefined =>
    part === MagnetismScenePart.Picture
      ? {
          x: 0,
          y: 0,
          width,
          height: Math.round((SCENE_PICTURE.height * width) / SCENE_PICTURE.width),
        }
      : undefined,
  isExplainer: false,
});
