import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { COLOURS, GLASS_INDEX, prismAngles } from "./optics";
import { num } from "./words";

/**
 * A triangular glass prism seen from above, as in NCERT Activity 11.1 and 11.2.
 * - Ray: one ray of light goes in, bends towards the normal, bends away from it coming out, and
 *   leaves turned through the angle of deviation; the normals and the angles i, r, e, A and D marked.
 * - Dispersion: a narrow beam of white light comes out as a fan of seven colours on a screen.
 * - Recombine: a second, upside-down prism turns the fan back into white light (Newton).
 */

export const PrismMode = { Ray: "ray", Dispersion: "dispersion", Recombine: "recombine" } as const;
export type PrismMode = (typeof PrismMode)[keyof typeof PrismMode];

export const PrismAction = { SetIncidence: "setIncidence", SetMode: "setMode" } as const;
export const PrismSignal = { Changed: "changed" } as const;
export const PrismDerived = {
  Refraction: "refraction",
  Emergence: "emergence",
  Deviation: "deviation",
  RedDeviation: "redDeviation",
  VioletDeviation: "violetDeviation",
} as const;
export const PrismPart = {
  Prism: "prism",
  Ray: "ray",
  Angles: "angles",
  Spectrum: "spectrum",
  SecondPrism: "secondPrism",
  Controls: "controls",
} as const;

/** The prism's angle A, degrees (an equilateral prism, as in most school labs). */
export const PRISM_ANGLE = 60;
/** The glass of the one-ray picture. */
export const RAY_INDEX = 1.5;
export const INCIDENCE_MIN = 35;
export const INCIDENCE_MAX = 70;
export const INCIDENCE_STEP = 5;

const prismState = z
  .object({
    mode: z.nativeEnum(PrismMode),
    /** Angle of incidence at the first face, degrees. */
    incidence: z.number().min(INCIDENCE_MIN).max(INCIDENCE_MAX),
    showNormals: z.boolean(),
    /** The angles i, r, e (and A, D) written on the picture. */
    showAngles: z.boolean(),
    /** "incident ray", "refracted ray", "emergent ray" beside the rays. */
    showNames: z.boolean(),
    /** The letters V I B G Y O R beside the screen. */
    showColourNames: z.boolean(),
    canSetIncidence: z.boolean(),
    /** Buttons to switch between one prism and two (Newton's experiment). */
    canSetMode: z.boolean(),
  })
  .strict();
export type PrismState = z.infer<typeof prismState>;

export function anglesOf(s: Pick<PrismState, "incidence">) {
  return prismAngles(s.incidence, PRISM_ANGLE, RAY_INDEX);
}

export function describePrism(s: PrismState): string {
  const a = anglesOf(s);
  if (s.mode === PrismMode.Ray)
    return `A ray strikes the first face of a glass prism (angle A = ${PRISM_ANGLE}°) at i = ${s.incidence}°. It bends towards the normal (r = ${num(a.r1)}°), crosses the prism, and bends away from the normal as it leaves (e = ${num(a.e ?? 0)}°). The emergent ray is turned from the incident ray's direction by the angle of deviation D = ${num(a.deviation ?? 0)}°.`;
  const split =
    "A narrow beam of white light enters the prism and comes out split into a band of seven colours, violet bent the most and red the least";
  if (s.mode === PrismMode.Dispersion)
    return `${split}, on a screen: violet, indigo, blue, green, yellow, orange, red (VIBGYOR).`;
  return `${split}. A second, identical prism, upside down, bends the colours back together: white light comes out of it.`;
}

const act = actionsFor<PrismState>();

export const prism = defineProp({
  type: "prism",
  describe:
    "A triangular glass prism seen from above. In one mode a single ray refracts through it (towards the normal going in, away from it coming out) with the angles of incidence, refraction, emergence and deviation marked; in another a white beam is split into the seven colours of the spectrum on a screen (dispersion); in a third a second, inverted prism recombines the colours into white light.",
  state: prismState,
  defaults: {
    mode: PrismMode.Ray,
    incidence: 50,
    showNormals: true,
    showAngles: true,
    showNames: true,
    showColourNames: true,
    canSetIncidence: true,
    canSetMode: false,
  },
  inputs: [
    "showNormals",
    "showAngles",
    "showNames",
    "showColourNames",
    "canSetIncidence",
    "canSetMode",
  ],
  derived: {
    [PrismDerived.Refraction]: {
      describe: "Angle of refraction at the first face, degrees (one-ray glass, n = 1.5)",
      compute: (s) => Number(anglesOf(s).r1.toFixed(1)),
    },
    [PrismDerived.Emergence]: {
      describe: "Angle of emergence, degrees (one-ray glass)",
      compute: (s) => Number((anglesOf(s).e ?? 0).toFixed(1)),
    },
    [PrismDerived.Deviation]: {
      describe: "Angle of deviation D = i + e − A, degrees (one-ray glass)",
      compute: (s) => Number((anglesOf(s).deviation ?? 0).toFixed(1)),
    },
    [PrismDerived.RedDeviation]: {
      describe: "How far red light is turned, degrees (it bends the least)",
      compute: (s) =>
        Number((prismAngles(s.incidence, PRISM_ANGLE, GLASS_INDEX.red).deviation ?? 0).toFixed(1)),
    },
    [PrismDerived.VioletDeviation]: {
      describe: "How far violet light is turned, degrees (it bends the most)",
      compute: (s) =>
        Number(
          (prismAngles(s.incidence, PRISM_ANGLE, GLASS_INDEX.violet).deviation ?? 0).toFixed(1),
        ),
    },
  },
  actions: {
    [PrismAction.SetIncidence]: act({
      describe: `Turn the incoming ray: the angle of incidence, ${INCIDENCE_MIN}° to ${INCIDENCE_MAX}°`,
      byLearner: true,
      args: z.object({ deg: z.number().min(INCIDENCE_MIN).max(INCIDENCE_MAX) }).strict(),
      run: (_s, a) =>
        set({ incidence: a.deg }, { signal: PrismSignal.Changed, payload: { incidence: a.deg } }),
    }),
    [PrismAction.SetMode]: act({
      describe: "One ray, a white beam split into colours, or a second prism to recombine them",
      byLearner: true,
      args: z.object({ mode: z.nativeEnum(PrismMode) }).strict(),
      run: (_s, a) =>
        set({ mode: a.mode }, { signal: PrismSignal.Changed, payload: { mode: a.mode } }),
    }),
  },
  signals: {
    [PrismSignal.Changed]: {
      describe: "The learner turned the ray or switched the mode; the payload has what changed",
    },
  },
  observe: (s) => {
    const a = anglesOf(s);
    const elements: Element[] = [{ id: PrismPart.Prism, value: `A = ${PRISM_ANGLE}°` }];
    if (s.mode === PrismMode.Ray) {
      elements.push({ id: PrismPart.Ray, value: `i = ${s.incidence}°` });
      if (s.showAngles)
        elements.push({
          id: PrismPart.Angles,
          value: `r = ${num(a.r1)}°, e = ${num(a.e ?? 0)}°, D = ${num(a.deviation ?? 0)}°`,
        });
    } else {
      elements.push({ id: PrismPart.Spectrum, value: COLOURS.join(", ") });
      if (s.mode === PrismMode.Recombine)
        elements.push({ id: PrismPart.SecondPrism, value: "upside down; white light comes out" });
    }
    return { summary: describePrism(s), elements };
  },
  parts: (s) => [
    PrismPart.Prism,
    ...(s.mode === PrismMode.Ray ? [PrismPart.Ray, PrismPart.Angles] : [PrismPart.Spectrum]),
    ...(s.mode === PrismMode.Recombine ? [PrismPart.SecondPrism] : []),
    ...(s.canSetIncidence || s.canSetMode ? [PrismPart.Controls] : []),
  ],
});
