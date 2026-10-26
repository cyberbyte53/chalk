import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { type SunColour, airPathKm, sunColourOf } from "./optics";
import { num } from "./words";

/**
 * Light scattered by tiny particles, as pictures the learner can change:
 * - Tyndall: a beam of light is invisible in clean air and shows up in smoke or mist.
 * - SkyBlue: air molecules scatter blue light more than red, so the sky looks blue; with no air
 *   (an astronaut, a high flight) the sky is dark.
 * - SunPath: the lower the Sun, the longer its light's path through the air, the more blue is
 *   scattered away, the redder the Sun.
 * - HypoTank: NCERT Activity 11.3; sulphur particles forming in water scatter blue out of the
 *   sides, and the beam that gets through turns orange, then crimson.
 */

export const ScatterKind = {
  Tyndall: "tyndall",
  SkyBlue: "skyBlue",
  SunPath: "sunPath",
  HypoTank: "hypoTank",
} as const;
export type ScatterKind = (typeof ScatterKind)[keyof typeof ScatterKind];

export const TyndallPlace = { Room: "room", Forest: "forest" } as const;
export type TyndallPlace = (typeof TyndallPlace)[keyof typeof TyndallPlace];

export const ScatterAction = {
  SetParticles: "setParticles",
  SetAir: "setAir",
  SetSunHeight: "setSunHeight",
  Start: "start",
  Reset: "reset",
} as const;
export const ScatterSignal = { Changed: "changed", Started: "started" } as const;
export const ScatterDerived = {
  BeamVisible: "beamVisible",
  SkyColour: "skyColour",
  SunColour: "sunColour",
  PathKm: "pathKm",
  PathTimesNoon: "pathTimesNoon",
} as const;
export const ScatterPart = {
  Picture: "picture",
  Readout: "readout",
  Controls: "controls",
} as const;

/** Sun heights the learner can choose, degrees above the horizon. */
export const SUN_HEIGHTS = [0, 3, 10, 30, 60, 90] as const;

export const SkyColour = { Blue: "blue", Dark: "dark", Orange: "orange" } as const;
export type SkyColour = (typeof SkyColour)[keyof typeof SkyColour];

const scatterState = z
  .object({
    kind: z.nativeEnum(ScatterKind),
    /** Tyndall: a smoky room or a misty forest. */
    place: z.nativeEnum(TyndallPlace),
    /** Tyndall: smoke or mist in the air (fine particles). */
    hasParticles: z.boolean(),
    /** SkyBlue: the Earth's air is there. */
    hasAir: z.boolean(),
    /** SunPath: how high the Sun is, degrees above the horizon. */
    sunHeight: z.number().min(0).max(90),
    /** HypoTank: the acid has been added and the sulphur is forming. */
    isStarted: z.boolean(),
    showNames: z.boolean(),
    /** The learner's switch or buttons for this picture. */
    canChange: z.boolean(),
  })
  .strict();
export type ScatterState = z.infer<typeof scatterState>;

export function pathOf(s: Pick<ScatterState, "sunHeight">): number {
  return airPathKm(s.sunHeight);
}

export function sunColourNow(s: Pick<ScatterState, "sunHeight">): SunColour {
  return sunColourOf(pathOf(s));
}

export function skyColourOf(s: Pick<ScatterState, "kind" | "hasAir" | "sunHeight">): SkyColour {
  if (s.kind === ScatterKind.SkyBlue && !s.hasAir) return SkyColour.Dark;
  if (s.kind === ScatterKind.SunPath && s.sunHeight < 4) return SkyColour.Orange;
  return SkyColour.Blue;
}

export function describeScatter(s: ScatterState): string {
  switch (s.kind) {
    case ScatterKind.Tyndall: {
      const where =
        s.place === TyndallPlace.Room
          ? "A narrow beam of sunlight comes into a dark room through a small hole"
          : "Sunlight comes down through gaps in the canopy of a dense forest";
      return s.hasParticles
        ? `${where}. The air is full of ${s.place === TyndallPlace.Room ? "smoke" : "mist"}: the fine particles scatter the light, so the beam's path is seen (the Tyndall effect).`
        : `${where}. The air is clear: the beam's path cannot be seen, only the bright patch where it lands.`;
    }
    case ScatterKind.SkyBlue:
      return s.hasAir
        ? "Sunlight passes through the air. The air's molecules, smaller than the wavelength of light, scatter blue light much more strongly than red; the scattered blue reaches the observer from every part of the sky, so the sky looks blue."
        : "With no air there is nothing to scatter the sunlight: the Sun shines but the sky around it is black, as it looks to an astronaut.";
    case ScatterKind.SunPath: {
      const times = pathOf(s) / pathOf({ sunHeight: 90 });
      return `The Sun is ${num(s.sunHeight, 0)}° above the horizon. Its light passes through about ${num(times, 0)} times as much air as at noon on its way to the observer; ${s.sunHeight >= 30 ? "little blue is scattered away and the Sun looks white" : `much of the blue is scattered away on the way and the Sun looks ${sunColourNow(s)}`}.`;
    }
    case ScatterKind.HypoTank:
      return s.isStarted
        ? "NCERT Activity 11.3: after acid is added to the hypo solution, fine sulphur particles form in the tank. Blue light is scattered out of the tank's sides; the beam that passes through to the screen turns orange-red, then crimson."
        : "NCERT Activity 11.3: a lamp and a lens send a parallel beam of white light through a glass tank of clear water (with hypo dissolved in it), through a round hole, and a second lens makes a sharp white image of the hole on a screen.";
  }
}

const act = actionsFor<ScatterState>();

export const scattering = defineProp({
  type: "scattering",
  describe:
    "Pictures of light scattered by small particles: a beam made visible by smoke or mist (the Tyndall effect); the blue sky (air scatters blue most) and a black sky with no air; the Sun's colour as it sinks (a longer path through the air scatters away more blue, so it turns red); and NCERT Activity 11.3 (sulphur particles forming in water scatter blue sideways, and the light that gets through turns red).",
  state: scatterState,
  defaults: {
    kind: ScatterKind.SkyBlue,
    place: TyndallPlace.Room,
    hasParticles: true,
    hasAir: true,
    sunHeight: 60,
    isStarted: false,
    showNames: true,
    canChange: true,
  },
  inputs: ["showNames", "canChange"],
  derived: {
    [ScatterDerived.BeamVisible]: {
      describe: "Tyndall: the beam's path can be seen (there are particles in the air)",
      compute: (s) => s.kind === ScatterKind.Tyndall && s.hasParticles,
    },
    [ScatterDerived.SkyColour]: {
      describe:
        "The sky's colour in the picture: 'blue', 'dark' (no air) or 'orange' (Sun on the horizon)",
      compute: (s) => skyColourOf(s),
    },
    [ScatterDerived.SunColour]: {
      describe: "SunPath: the Sun's colour, 'white', 'yellow', 'orange' or 'red'",
      compute: (s) => sunColourNow(s),
    },
    [ScatterDerived.PathKm]: {
      describe: "SunPath: how far the sunlight travels through the air, km (round numbers)",
      compute: (s) => Math.round(pathOf(s)),
    },
    [ScatterDerived.PathTimesNoon]: {
      describe: "SunPath: that path compared with the Sun overhead (how many times longer)",
      compute: (s) => Number((pathOf(s) / pathOf({ sunHeight: 90 })).toFixed(1)),
    },
  },
  actions: {
    [ScatterAction.SetParticles]: act({
      describe: "Fill the air with smoke or mist, or clear it",
      byLearner: true,
      args: z.object({ on: z.boolean() }).strict(),
      run: (_s, a) =>
        set(
          { hasParticles: a.on },
          { signal: ScatterSignal.Changed, payload: { particles: a.on } },
        ),
    }),
    [ScatterAction.SetAir]: act({
      describe: "Keep the Earth's air, or take it away (as for an astronaut)",
      byLearner: true,
      args: z.object({ on: z.boolean() }).strict(),
      run: (_s, a) =>
        set({ hasAir: a.on }, { signal: ScatterSignal.Changed, payload: { air: a.on } }),
    }),
    [ScatterAction.SetSunHeight]: act({
      describe:
        "Put the Sun this many degrees above the horizon (0 sunrise or sunset, 90 overhead)",
      byLearner: true,
      args: z.object({ deg: z.number().min(0).max(90) }).strict(),
      run: (_s, a) =>
        set(
          { sunHeight: a.deg },
          {
            signal: ScatterSignal.Changed,
            payload: { sunHeight: a.deg, sunColour: sunColourNow({ sunHeight: a.deg }) },
          },
        ),
    }),
    [ScatterAction.Start]: act({
      describe: "Add the acid to the tank: sulphur particles start to form",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ isStarted: true }, { signal: ScatterSignal.Started, payload: {} }),
    }),
    [ScatterAction.Reset]: act({
      describe: "Back to clear water",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ isStarted: false }),
    }),
  },
  signals: {
    [ScatterSignal.Changed]: {
      describe: "The learner changed the particles, the air or the Sun's height",
    },
    [ScatterSignal.Started]: { describe: "The hypo experiment was started" },
  },
  observe: (s) => {
    const elements: Element[] = [{ id: ScatterPart.Picture, value: describeScatter(s) }];
    if (s.kind === ScatterKind.SunPath)
      elements.push({
        id: ScatterPart.Readout,
        value: `${num(s.sunHeight, 0)}° high; path ${Math.round(pathOf(s))} km; Sun ${sunColourNow(s)}`,
      });
    return { summary: describeScatter(s), elements };
  },
  parts: (s) => [
    ScatterPart.Picture,
    ...(s.kind === ScatterKind.SunPath ? [ScatterPart.Readout] : []),
    ...(s.canChange ? [ScatterPart.Controls] : []),
  ],
});
