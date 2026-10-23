import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Light bent by the air and by raindrops, as pictures the learner can step through or toggle:
 * - HotAir: things seen through the hot air over a stove waver.
 * - Twinkle: starlight bends through layers of air; a star (a point) twinkles, a planet (a disc)
 *   does not; the star looks higher than it is.
 * - Sunrise: the air bends sunlight over the horizon, so the Sun is seen about 2 minutes before it
 *   has really risen, its disc a little flattened.
 * - Raindrop: white light enters a drop, splits into colours, reflects off the back and leaves:
 *   how a rainbow is made.
 */

export const AtmosphereKind = {
  HotAir: "hotAir",
  Twinkle: "twinkle",
  Sunrise: "sunrise",
  Raindrop: "raindrop",
} as const;
export type AtmosphereKind = (typeof AtmosphereKind)[keyof typeof AtmosphereKind];

export const SkySource = { Star: "star", Planet: "planet" } as const;
export type SkySource = (typeof SkySource)[keyof typeof SkySource];

export const AtmosphereAction = {
  Next: "next",
  SetSource: "setSource",
  SetHeat: "setHeat",
} as const;
export const AtmosphereSignal = { Stepped: "stepped", Changed: "changed" } as const;
export const AtmosphereDerived = {
  IsLastStep: "isLastStep",
  Twinkles: "twinkles",
  Wavers: "wavers",
} as const;
export const AtmospherePart = {
  Picture: "picture",
  Caption: "caption",
  Controls: "controls",
} as const;

/** How many steps each stepped picture has. */
export const ATMOSPHERE_STEPS: Record<AtmosphereKind, number> = {
  [AtmosphereKind.HotAir]: 1,
  [AtmosphereKind.Twinkle]: 1,
  [AtmosphereKind.Sunrise]: 2,
  [AtmosphereKind.Raindrop]: 4,
};

const atmosphereState = z
  .object({
    kind: z.nativeEnum(AtmosphereKind),
    /** Which step of a stepped picture (Sunrise 0–1, Raindrop 0–3; others ignore it). */
    step: z.number().int().min(0).max(3),
    /** Twinkle: a star or a planet. */
    source: z.nativeEnum(SkySource),
    /** HotAir: the stove is lit. */
    isHot: z.boolean(),
    /** A "next" button for stepped pictures. */
    canStep: z.boolean(),
    /** Buttons for the star/planet or stove on/off choice. */
    canToggle: z.boolean(),
    /** Short words on the picture: actual and apparent position, the colours in the drop. */
    showNames: z.boolean(),
  })
  .strict();
export type AtmosphereState = z.infer<typeof atmosphereState>;

const STEP_WORDS: Record<AtmosphereKind, readonly string[]> = {
  [AtmosphereKind.HotAir]: [""],
  [AtmosphereKind.Twinkle]: [""],
  [AtmosphereKind.Sunrise]: [
    "Without air: the Sun is still just below the horizon, so nobody could see it yet",
    "With air: the layers of air bend the sunlight over the horizon, so the Sun is seen about 2 minutes before it really rises, its disc slightly flattened",
  ],
  [AtmosphereKind.Raindrop]: [
    "A ray of white sunlight reaches a raindrop",
    "Entering the drop it refracts, and each colour bends by a different amount: the light splits (dispersion)",
    "At the back of the drop the colours reflect, inside it (internal reflection)",
    "Leaving the drop they refract again and spread further: violet and red come out in slightly different directions towards the observer",
  ],
};

/** The step to draw, kept within the picture's own steps. */
export const stepOf = (s: Pick<AtmosphereState, "kind" | "step">): number =>
  Math.min(s.step, ATMOSPHERE_STEPS[s.kind] - 1);

export function describeAtmosphere(s: AtmosphereState): string {
  switch (s.kind) {
    case AtmosphereKind.HotAir:
      return s.isHot
        ? "Hot air rises from a lit stove; a signboard seen through it seems to waver, because the hot air's refractive index is less than the cooler air's and keeps changing."
        : "A stove, switched off, with a signboard behind it; seen through the still air the signboard is steady.";
    case AtmosphereKind.Twinkle:
      return s.source === SkySource.Star
        ? "Light from a star bends little by little through layers of air, denser lower down, so the star is seen a little higher than it really is. Because a star is so far away it is a point of light; as the air shifts, its apparent position and brightness flicker: it twinkles."
        : "Light from a planet bends through the layers of air the same way, but a planet is much nearer, so it is seen as a small disc, many points of light together; their flickers average out and it shines steadily.";
    case AtmosphereKind.Sunrise:
    case AtmosphereKind.Raindrop:
      return `${STEP_WORDS[s.kind][stepOf(s)] ?? ""}.`;
  }
}

const act = actionsFor<AtmosphereState>();

export const atmosphere = defineProp({
  type: "atmosphere",
  describe:
    "Pictures of light bent by the air or by a raindrop: an object wavering seen through hot air over a stove; a star twinkling (and seen higher than it is) while a planet does not; the Sun seen before it has really risen; and one raindrop splitting sunlight into colours (refraction, dispersion, internal reflection) to make a rainbow.",
  state: atmosphereState,
  defaults: {
    kind: AtmosphereKind.Twinkle,
    step: 0,
    source: SkySource.Star,
    isHot: true,
    canStep: true,
    canToggle: true,
    showNames: true,
  },
  inputs: ["canStep", "canToggle", "showNames"],
  derived: {
    [AtmosphereDerived.IsLastStep]: {
      describe: "A stepped picture is on its last step (always true for pictures without steps)",
      compute: (s) => stepOf(s) === ATMOSPHERE_STEPS[s.kind] - 1,
    },
    [AtmosphereDerived.Twinkles]: {
      describe: "The twinkle picture shows a star (which twinkles), not a planet",
      compute: (s) => s.kind === AtmosphereKind.Twinkle && s.source === SkySource.Star,
    },
    [AtmosphereDerived.Wavers]: {
      describe: "The hot-air picture's stove is lit, so things behind it waver",
      compute: (s) => s.kind === AtmosphereKind.HotAir && s.isHot,
    },
  },
  actions: {
    [AtmosphereAction.Next]: act({
      describe: "Go to the next step of a stepped picture (after the last, back to the first)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = (stepOf(s) + 1) % ATMOSPHERE_STEPS[s.kind];
        return set({ step }, { signal: AtmosphereSignal.Stepped, payload: { step } });
      },
    }),
    [AtmosphereAction.SetSource]: act({
      describe: "Show a star or a planet in the night sky",
      byLearner: true,
      args: z.object({ source: z.nativeEnum(SkySource) }).strict(),
      run: (_s, a) =>
        set(
          { source: a.source },
          { signal: AtmosphereSignal.Changed, payload: { source: a.source } },
        ),
    }),
    [AtmosphereAction.SetHeat]: act({
      describe: "Light the stove, or put it out",
      byLearner: true,
      args: z.object({ on: z.boolean() }).strict(),
      run: (_s, a) =>
        set({ isHot: a.on }, { signal: AtmosphereSignal.Changed, payload: { on: a.on } }),
    }),
  },
  signals: {
    [AtmosphereSignal.Stepped]: {
      describe: "The picture moved to a step; the payload has the step",
    },
    [AtmosphereSignal.Changed]: {
      describe: "The learner switched between star and planet, or lit or put out the stove",
    },
  },
  observe: (s) => {
    const elements: Element[] = [{ id: AtmospherePart.Picture, value: describeAtmosphere(s) }];
    if (ATMOSPHERE_STEPS[s.kind] > 1)
      elements.push({
        id: AtmospherePart.Caption,
        value: `step ${stepOf(s) + 1} of ${ATMOSPHERE_STEPS[s.kind]}`,
      });
    return { summary: describeAtmosphere(s), elements };
  },
  parts: (s) => [
    AtmospherePart.Picture,
    ...(ATMOSPHERE_STEPS[s.kind] > 1 ? [AtmospherePart.Caption] : []),
    ...((s.canStep && ATMOSPHERE_STEPS[s.kind] > 1) ||
    (s.canToggle && (s.kind === AtmosphereKind.Twinkle || s.kind === AtmosphereKind.HotAir))
      ? [AtmospherePart.Controls]
      : []),
  ],
});
