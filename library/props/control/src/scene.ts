import { type Box, defineProp } from "@chalk/prop";
import { z } from "zod";

/**
 * Story panels for the control and coordination chapter's "Fastest Hands" science-fair arc: Riya
 * and Kabir build a stall on how the body (and plants) respond, from the ruler-drop game to
 * Grandpa's chhui-mui and Riya's stage fright. Drawn in a fixed 320 × 180 picture, scaled; nothing
 * to tap.
 */

export const ControlScene = {
  ScienceFair: "scienceFair",
  RulerDrop: "rulerDrop",
  HotTawa: "hotTawa",
  ChhuiMui: "chhuiMui",
  BeanBox: "beanBox",
  StageFright: "stageFright",
  IodisedSalt: "iodisedSalt",
  FairDay: "fairDay",
} as const;
export type ControlScene = (typeof ControlScene)[keyof typeof ControlScene];

export const ControlScenePart = { Picture: "picture" } as const;
export const CONTROL_PICTURE = { width: 320, height: 180 } as const;

const sceneState = z.object({ scene: z.nativeEnum(ControlScene) }).strict();
export type ControlSceneState = z.infer<typeof sceneState>;

const WORDS: Readonly<Record<ControlScene, string>> = {
  scienceFair:
    "The school hall before the science fair: Riya and Kabir stand behind an empty stall table with a banner, 'How does your body know what to do?'. A notice says the fair is in two weeks.",
  rulerDrop:
    "The ruler-drop game: Riya holds a ruler by its top end; Kabir's open fingers wait at its bottom end, ready to catch it the moment she lets go.",
  hotTawa:
    "The kitchen: Kabir has touched the hot tawa on the stove and his hand is already jerking back, before he has even said 'ouch'. Mom turns round.",
  chhuiMui:
    "Grandpa's terrace: a chhui-mui (touch-me-not) plant in a pot. Kabir touches one leaf with a finger and its leaflets have folded up; the leaves he did not touch are still open. Grandpa smiles.",
  beanBox:
    "A shoebox on the windowsill with one side cut open towards the window. Inside, bean seedlings in a flask are all bending towards the opening and the light.",
  stageFright:
    "Riya on a small stage with a microphone, the audience's heads in front of her. Her heart is pounding, her hands are sweaty and she is breathing fast.",
  iodisedSalt:
    "The kitchen shelf: Grandpa holds up a packet of salt marked 'iodised salt' and points at the label; Riya reads it.",
  fairDay:
    "Fair day: a crowd at the 'Fastest Hands' stall. Riya presents the brain map, Kabir runs the ruler-drop game for a visitor, Grandpa's chhui-mui and the bean box sit on the table, and a ribbon hangs on the banner.",
};

export function describeControlScene(s: ControlScene): string {
  return WORDS[s];
}

export const controlScene = defineProp({
  type: "controlScene",
  describe:
    "An illustrated story panel for the control and coordination chapter's science-fair arc: the empty stall, the ruler-drop game, the hot tawa, Grandpa's chhui-mui, the bean seedlings in a box with a window, Riya's stage fright, the iodised salt packet, and fair day.",
  state: sceneState,
  defaults: { scene: ControlScene.ScienceFair },
  inputs: ["scene"],
  actions: {},
  observe: (s) => ({
    summary: describeControlScene(s.scene),
    elements: [{ id: ControlScenePart.Picture, value: describeControlScene(s.scene) }],
  }),
  parts: () => [ControlScenePart.Picture],
  locate: (_s, part, width): Box | undefined =>
    part === ControlScenePart.Picture
      ? {
          x: 0,
          y: 0,
          width,
          height: Math.round((CONTROL_PICTURE.height * width) / CONTROL_PICTURE.width),
        }
      : undefined,
});
