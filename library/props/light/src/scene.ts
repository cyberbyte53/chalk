import { type Box, type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Story panels for the light chapter's "Movie Night" arc: Riya and her little brother Kabir build a
 * phone projector during a power cut. Each scene is a small illustration; only the power cut has
 * anything to do (a torch the learner can switch on). Drawn in a fixed 320 × 180 picture, scaled.
 */

export const SceneKind = {
  PowerCut: "powerCut",
  Spoon: "spoon",
  MakeupMirror: "makeupMirror",
  SideMirror: "sideMirror",
  GlassOfWater: "glassOfWater",
  Shoebox: "shoebox",
  Glasses: "glasses",
  MovieNight: "movieNight",
  PhoneCard: "phoneCard",
  ShoeboxBlurry: "shoeboxBlurry",
  LensShapes: "lensShapes",
  MirrorFromSphere: "mirrorFromSphere",
  SeeThrough: "seeThrough",
  RayBeam: "rayBeam",
  TinyScreen: "tinyScreen",
  HowWeSee: "howWeSee",
  StraightLines: "straightLines",
} as const;
export type SceneKind = (typeof SceneKind)[keyof typeof SceneKind];

export const SceneAction = { ToggleTorch: "toggleTorch", Next: "next" } as const;
export const SceneSignal = { TorchOn: "torchOn", Stepped: "stepped" } as const;
export const SceneDerived = { IsLit: "isLit", Step: "step" } as const;
export const ScenePart = { Picture: "picture", Torch: "torch", Next: "next" } as const;

/** How many steps a stepped scene (the mirror from a sphere) has. */
export const STEPS = 3;
/** The "next" button of a stepped scene, in picture units. */
export const NEXT = { x: 286, y: 146, r: 14 } as const;

/** The picture's own size, in its units; the view scales it to the width it is given. */
export const PICTURE = { width: 320, height: 180 } as const;
/** Where the power cut's torch sits, in picture units (its tap target). */
export const TORCH = { x: 52, y: 104, width: 40, height: 18 } as const;

const lightSceneState = z
  .object({
    scene: z.nativeEnum(SceneKind),
    /** The power cut: whether Kabir's torch is on. */
    isLit: z.boolean(),
    /** The power cut: whether the learner can tap the torch. */
    canToggle: z.boolean(),
    /** A stepped scene (the mirror from a sphere): which step is shown, 0 to 2. */
    step: z
      .number()
      .int()
      .min(0)
      .max(STEPS - 1),
    /** A stepped scene: whether the learner can tap to the next step. */
    canStep: z.boolean(),
  })
  .strict();
export type LightSceneState = z.infer<typeof lightSceneState>;

/** What each scene shows, in words: the summary a screen reader (and Jugnu) gets. */
/** Whether a scene's torch is on: in "how we see" it is always on unless the learner switches it. */
export function isSceneLit(s: Pick<LightSceneState, "scene" | "isLit" | "canToggle">): boolean {
  return s.scene === SceneKind.HowWeSee && !s.canToggle ? true : s.isLit;
}

/** Where "how we see"'s torch sits, in picture units (its tap target). */
export const SEE_TORCH = { x: 14, y: 52, width: 46, height: 20 } as const;

const STEP_WORDS = [
  "A shiny steel ball, a sphere. Its whole surface is a curved mirror.",
  "A small cap is sliced off the ball and lifted away, showing the flat cut: a spherical mirror is a piece like this cap.",
  "The cap on its own, seen from the side, twice: shiny on the inside (the hollow) it is a concave mirror; shiny on the outside (the bulge) it is a convex mirror. Behind one, the faint ball it came from: its centre C, the radius R from C to the cap, and P, the middle of the cap.",
] as const;

export function describeScene(
  s: Pick<LightSceneState, "scene" | "isLit"> &
    Partial<Pick<LightSceneState, "step" | "canToggle">>,
): string {
  switch (s.scene) {
    case SceneKind.PowerCut:
      return s.isLit
        ? "Night, power cut: a torch's straight beam falls across the table. The charger lying next to the glowing phone is lit up now, with a sharp shadow behind it."
        : "Night, power cut: a dark room with the moon at the window. On the table a phone glows with its battery at 2%; the charger next to it can hardly be seen. A torch lies at the table's edge.";
    case SceneKind.Spoon:
      return "Two shiny steel spoons. In the hollow of the first, a small face is upside down; on the back of the second, a small face is the right way up.";
    case SceneKind.MakeupMirror:
      return "Side view of a room: light from a window on the left wall, with a tree and the sun outside, travels to Mom's round concave make-up mirror on her dressing table, beside a lipstick and a powder compact, facing the window. The mirror sends it back to a white tissue box standing on the table just in front of the mirror, where a small, sharp, bright, upside-down picture of the window appears.";
    case SceneKind.SideMirror:
      return "A car's convex side mirror, close up: it shows a small, upright, wide view of the road behind, with a bus far back.";
    case SceneKind.GlassOfWater:
      return "A glass of water on a table: the lemon inside looks bigger than the same lemon lying beside the glass, and the straw looks broken where it enters the water.";
    case SceneKind.Shoebox:
      return "A shoebox projector, cut open: a phone at the back shows the movie upside down; light goes through a magnifying glass in the front and spreads out to the wall, where the picture is big and the right way up.";
    case SceneKind.Glasses:
      return "Grandpa's reading glasses beside a magnifying glass on a newspaper; through the magnifying glass the print looks much bigger.";
    case SceneKind.MovieNight:
      return "Movie night: the family on a sofa in a dark room, seen from behind, with popcorn. A cone of light from the shoebox projector throws a big, bright picture of a rocket onto the wall.";
    case SceneKind.PhoneCard:
      return "Night: Mom's round make-up mirror stands on the table, and in front of it a phone shows a bright movie. Kabir holds a white card between them, and on the card is a small, upside-down copy of the phone's picture.";
    case SceneKind.ShoeboxBlurry:
      return "The shoebox projector's first try: light from the box spreads onto the wall, but there is only a big, blurry, bright patch, no picture. Kabir scratches his head.";
    case SceneKind.LensShapes:
      return "Two lenses cut in half and seen from the side. A convex lens, thicker in the middle: three parallel rays go in and come out bending together. A concave lens, thinner in the middle: three parallel rays go in and come out spreading apart.";
    case SceneKind.MirrorFromSphere:
      return STEP_WORDS[s.step ?? 0] ?? STEP_WORDS[0];
    case SceneKind.SeeThrough:
      return "Three panes side by side in front of a lamp: through clear glass the lamp is seen sharply; through butter paper there is only a fuzzy glow; behind a wooden board there is nothing, only a shadow.";
    case SceneKind.RayBeam:
      return "A torch on the left sends out a beam, drawn as a bundle of five straight lines with arrows: rays. One ray is picked out.";
    case SceneKind.HowWeSee:
      return isSceneLit({ scene: s.scene, isLit: s.isLit, canToggle: s.canToggle ?? false })
        ? "A torch shines light along straight rays to a charger on a table. At the charger the light bounces off in many directions, and one bounced ray travels into Riya's eye: that is how she sees the charger."
        : "A dark room: a torch, switched off, on the left; a charger on a table; Riya on the right, looking. No light, so she sees nothing.";
    case SceneKind.TinyScreen:
      return "Movie night, seen from behind: the whole family squeezed together on the sofa, leaning in to watch a movie on one small phone that Riya holds up. The big wall in front of them is bare.";
    case SceneKind.StraightLines:
      return "A small bulb, a ball and a wall behind. Rays go out from the bulb in straight lines. The rays that just graze the ball's edge carry straight on to the edges of a sharp shadow on the wall; no ray bends round the ball.";
  }
}

/** Scenes with a torch to name: the power cut always, "how we see" when the learner switches it. */
function hasTorch(s: LightSceneState): boolean {
  return s.scene === SceneKind.PowerCut || (s.scene === SceneKind.HowWeSee && s.canToggle);
}

/** A stepped scene the learner can step through. */
function hasNext(s: LightSceneState): boolean {
  return s.scene === SceneKind.MirrorFromSphere && s.canStep;
}

const act = actionsFor<LightSceneState>();

export const lightScene = defineProp({
  type: "lightScene",
  describe:
    "An illustrated, partly animated panel for the light chapter: story scenes (power cut, spoon, make-up mirror, side mirror, glass of water, shoebox projector, glasses, movie night, phone and card) and theory scenes (how we see, straight lines and shadows, rays in a beam, lens shapes, a mirror cut from a sphere in steps, see-through). The torches can be switched by the learner when allowed; the sphere explainer steps on with Next.",
  state: lightSceneState,
  defaults: { scene: SceneKind.PowerCut, isLit: false, canToggle: false, step: 0, canStep: false },
  inputs: ["isLit", "canToggle", "step", "canStep"],
  derived: {
    [SceneDerived.IsLit]: {
      describe: "Whether the scene's torch is on (power cut, how we see)",
      compute: (s) => isSceneLit(s),
    },
    [SceneDerived.Step]: {
      describe: "A stepped scene: which step is shown, 0 to 2",
      compute: (s) => s.step,
    },
  },
  actions: {
    [SceneAction.ToggleTorch]: act({
      describe: "Switch Kabir's torch on, or off again (the power cut)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        s.isLit
          ? set({ isLit: false })
          : set({ isLit: true }, { signal: SceneSignal.TorchOn, payload: {} }),
    }),
    [SceneAction.Next]: act({
      describe: "A stepped scene: show the next step (after the last, back to the first)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = (s.step + 1) % STEPS;
        return set({ step }, { signal: SceneSignal.Stepped, payload: { step } });
      },
    }),
  },
  signals: {
    [SceneSignal.TorchOn]: { describe: "The learner switched the torch on" },
    [SceneSignal.Stepped]: {
      describe: "The learner moved to the next step; `step` is the one now shown",
    },
  },
  observe: (s) => {
    const elements: Element[] = [{ id: ScenePart.Picture, value: describeScene(s) }];
    if (hasTorch(s))
      elements.push({
        id: ScenePart.Torch,
        value: `a torch, ${isSceneLit(s) ? "on" : "off"}${s.canToggle ? ", tap to switch it" : ""}`,
      });
    if (hasNext(s))
      elements.push({
        id: ScenePart.Next,
        value: `step ${s.step + 1} of ${STEPS}, tap for the next`,
      });
    return { summary: describeScene(s), elements };
  },
  parts: (s) => [
    ScenePart.Picture,
    ...(hasTorch(s) ? [ScenePart.Torch] : []),
    ...(hasNext(s) ? [ScenePart.Next] : []),
  ],
  locate: (s, part, width): Box | undefined => {
    const k = width / PICTURE.width;
    if (part === ScenePart.Picture)
      return { x: 0, y: 0, width, height: Math.round(PICTURE.height * k) };
    if (part === ScenePart.Torch && hasTorch(s)) {
      const t = s.scene === SceneKind.PowerCut ? TORCH : SEE_TORCH;
      return {
        x: t.x * k - 6,
        y: t.y * k - 6,
        width: t.width * k + 12,
        height: t.height * k + 12,
      };
    }
    if (part === ScenePart.Next && hasNext(s))
      return {
        x: (NEXT.x - NEXT.r) * k - 4,
        y: (NEXT.y - NEXT.r) * k - 4,
        width: 2 * NEXT.r * k + 8,
        height: 2 * NEXT.r * k + 8,
      };
    return undefined;
  },
});
