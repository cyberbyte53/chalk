import { EffectKind, applyPatch, asAnyProp, prepareAction, viewOf } from "@chalk/prop";
import { renderToString } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import {
  ATMOSPHERE_STEPS,
  AtmosphereAction,
  AtmosphereKind,
  SkySource,
  atmosphere,
} from "./atmosphere";
import {
  DEFECTS,
  EyeAction,
  EyeDefect,
  EyeDerived,
  type EyeState,
  Muscles,
  eyeFor,
  eyeModel,
  farOf,
  focusOf,
  musclesOf,
  nearOf,
} from "./eye-model";
import { eyeProps } from "./index";
import {
  BASE_POWER,
  COLOURS,
  GLASS_INDEX,
  ImageAt,
  SunColour,
  WATER_INDEX,
  airPathKm,
  focalOf,
  hypermetropiaLens,
  myopiaLens,
  prismAngles,
  rad,
  refract,
  scatterOf,
  sunColourOf,
} from "./optics";
import { INCIDENCE_MAX, INCIDENCE_MIN, PRISM_ANGLE, PrismAction, PrismMode, prism } from "./prism";
import { ScatterAction, ScatterKind, scattering } from "./scattering";
import { EyeSceneKind } from "./scene";

function run<S extends Record<string, unknown>>(
  def: ReturnType<typeof asAnyProp>,
  state: S,
  name: string,
  args: Record<string, unknown>,
) {
  const result = prepareAction(def, state, name, args);
  if (!result.isOk) throw new Error(result.errors.join("; "));
  if (result.effect.kind !== EffectKind.Set) throw new Error(`${name} should be instant`);
  const next = applyPatch(def, state, result.effect.set);
  if (!next.isOk) throw new Error(next.errors.join("; "));
  return { state: next.state as S, emit: result.effect.emit };
}

const eye = (defect: EyeDefect, more: Partial<EyeState> = {}): EyeState =>
  ({ ...eyeModel.defaults, ...eyeFor(defect), ...more }) as EyeState;

describe("the normal eye", () => {
  it("sees far things with relaxed muscles and near ones by accommodating", () => {
    const far = focusOf(eye(EyeDefect.Normal, { objectCm: null }));
    expect(far.imageAt).toBe(ImageAt.Retina);
    expect(musclesOf(far.effort)).toBe(Muscles.Relaxed);
    expect(far.power).toBeCloseTo(BASE_POWER);
    const book = focusOf(eye(EyeDefect.Normal, { objectCm: 25 }));
    expect(book.imageAt).toBe(ImageAt.Retina);
    expect(musclesOf(book.effort)).toBe(Muscles.Full);
    const mid = focusOf(eye(EyeDefect.Normal, { objectCm: 100 }));
    expect(musclesOf(mid.effort)).toBe(Muscles.Contracting);
  });

  it("can't focus nearer than its near point: the image falls behind the retina", () => {
    const close = focusOf(eye(EyeDefect.Normal, { objectCm: 10 }));
    expect(close.imageAt).toBe(ImageAt.Behind);
    expect(close.imageCm).toBeGreaterThan(2);
    expect(close.blur).toBeGreaterThan(0);
  });

  it("has its near point at 25 cm and its far point at infinity", () => {
    const s = eye(EyeDefect.Normal);
    expect(nearOf(s)).toBeCloseTo(25);
    expect(farOf(s)).toBe(Number.POSITIVE_INFINITY);
  });

  it("forms images farther from the lens for nearer objects only if it can't accommodate", () => {
    // NCERT exercise 9: with accommodation, the image distance stays at the retina.
    for (const cm of [25, 50, 200, null])
      expect(focusOf(eye(EyeDefect.Normal, { objectCm: cm })).imageCm).toBeCloseTo(2);
  });
});

describe("defects of vision and their correction", () => {
  it("myopia: a far object's image falls in front of the retina; a concave lens fixes it", () => {
    const riya = eye(EyeDefect.Myopia, { objectCm: null });
    expect(focusOf(riya).imageAt).toBe(ImageAt.InFront);
    const p = myopiaLens(DEFECTS[EyeDefect.Myopia].farCm as number);
    expect(p).toBeCloseTo(-0.5);
    const fixed = { ...riya, correction: p };
    expect(focusOf(fixed).imageAt).toBe(ImageAt.Retina);
    expect(farOf(fixed)).toBe(Number.POSITIVE_INFINITY);
  });

  it("matches NCERT's numbers: far point 1.2 m and 80 cm, near point 1 m", () => {
    expect(myopiaLens(120)).toBeCloseTo(-0.833, 3);
    expect(myopiaLens(80)).toBeCloseTo(-1.25);
    expect(hypermetropiaLens(100)).toBeCloseTo(3);
    // Exercise 5: −5.5 D and +1.5 D.
    expect(focalOf(-5.5)).toBeCloseTo(-18.18, 2);
    expect(focalOf(1.5)).toBeCloseTo(66.67, 2);
    // In-text question 2, done with the prop: the lens moves the far point to infinity.
    const q2 = eye(EyeDefect.Myopia, {
      farPointCm: 120,
      objectCm: null,
      correction: myopiaLens(120),
    });
    expect(focusOf(q2).imageAt).toBe(ImageAt.Retina);
  });

  it("hypermetropia: a book at 25 cm focuses behind the retina; +3 D brings it on", () => {
    const grandpa = eye(EyeDefect.Hypermetropia, { objectCm: 25 });
    expect(focusOf(grandpa).imageAt).toBe(ImageAt.Behind);
    expect(nearOf(grandpa)).toBeCloseTo(100);
    const fixed = { ...grandpa, correction: 3 };
    expect(focusOf(fixed).imageAt).toBe(ImageAt.Retina);
    expect(nearOf(fixed)).toBeCloseTo(25);
  });

  it("too strong a concave lens leaves nothing sharp", () => {
    const s = eye(EyeDefect.Myopia, { correction: -8 });
    expect(Number.isNaN(nearOf(s))).toBe(true);
  });
});

describe("the eye model's actions", () => {
  const def = asAnyProp(eyeModel);
  it("moving the object says whether it is sharp", () => {
    const { state, emit } = run(def, eye(EyeDefect.Normal), EyeAction.MoveObject, { cm: 10 });
    expect(state.objectCm).toBe(10);
    expect(emit[0]?.payload).toMatchObject({ isSharp: false, imageAt: ImageAt.Behind });
  });

  it("choosing a defect sets that eye's own near and far points", () => {
    const { state } = run(def, eye(EyeDefect.Normal), EyeAction.SetDefect, {
      defect: EyeDefect.Hypermetropia,
    });
    expect(state).toMatchObject({
      defect: EyeDefect.Hypermetropia,
      farPointCm: null,
      nearPointCm: 100,
    });
  });

  it("derives sharpness and the near and far points with glasses on", () => {
    const view = viewOf(def, eye(EyeDefect.Myopia, { correction: -0.5 })) as Record<
      string,
      unknown
    >;
    expect(view[EyeDerived.IsSharp]).toBe(true);
    expect(view[EyeDerived.FarPoint]).toBeNull();
    expect(view[EyeDerived.CanSeeFar]).toBe(true);
    // The state's own far point is untouched by the derived one.
    expect(view.farPointCm).toBe(200);
  });
});

describe("refraction through a prism", () => {
  it("bends towards the normal going in and away coming out, as Snell's law says", () => {
    const a = prismAngles(50, PRISM_ANGLE, 1.5);
    expect(Math.sin(rad(50)) / Math.sin(rad(a.r1))).toBeCloseTo(1.5);
    expect(a.r1).toBeLessThan(50);
    expect(a.r2).toBeCloseTo(PRISM_ANGLE - a.r1);
    expect(a.e as number).toBeGreaterThan(a.r2);
    expect(a.deviation as number).toBeCloseTo(50 + (a.e as number) - PRISM_ANGLE);
  });

  it("refracts a direction vector the same way", () => {
    const d = refract([Math.sin(rad(30)), Math.cos(rad(30))], [0, -1], 1 / 1.5);
    expect(d).not.toBeNull();
    expect((d as readonly number[])[0]).toBeCloseTo(Math.sin(rad(30)) / 1.5);
    // Glass to air beyond the critical angle: trapped.
    expect(refract([Math.sin(rad(60)), Math.cos(rad(60))], [0, -1], 1.5)).toBeNull();
  });

  it("bends violet the most and red the least, at every allowed angle, with nothing trapped", () => {
    for (let i = INCIDENCE_MIN; i <= INCIDENCE_MAX; i += 5) {
      const ds = COLOURS.map((c) => prismAngles(i, PRISM_ANGLE, GLASS_INDEX[c]).deviation);
      for (const d of ds) expect(d).not.toBeNull();
      for (let k = 1; k < ds.length; k++)
        expect(ds[k] as number).toBeGreaterThan(ds[k - 1] as number);
    }
  });

  it("the learner turns the ray and adds the second prism", () => {
    const def = asAnyProp(prism);
    expect(run(def, prism.defaults, PrismAction.SetIncidence, { deg: 60 }).state.incidence).toBe(
      60,
    );
    expect(
      run(def, prism.defaults, PrismAction.SetMode, { mode: PrismMode.Recombine }).state.mode,
    ).toBe(PrismMode.Recombine);
    expect(() => run(def, prism.defaults, PrismAction.SetIncidence, { deg: 20 })).toThrow();
  });
});

describe("the atmosphere", () => {
  it("water bends violet more than red too", () => {
    for (let k = 1; k < COLOURS.length; k++)
      expect(WATER_INDEX[COLOURS[k] as (typeof COLOURS)[number]]).toBeGreaterThan(
        WATER_INDEX[COLOURS[k - 1] as (typeof COLOURS)[number]],
      );
  });

  it("the lower the Sun, the longer its path through air and the redder it looks", () => {
    expect(airPathKm(90)).toBeCloseTo(100);
    const heights = [90, 60, 30, 10, 3, 0];
    const paths = heights.map(airPathKm);
    for (let k = 1; k < paths.length; k++)
      expect(paths[k] as number).toBeGreaterThan(paths[k - 1] as number);
    expect(sunColourOf(airPathKm(90))).toBe(SunColour.White);
    expect(sunColourOf(airPathKm(10))).toBe(SunColour.Orange);
    expect(sunColourOf(airPathKm(0))).toBe(SunColour.Red);
  });

  it("air scatters blue several times more than red", () => {
    expect(scatterOf("blue")).toBeGreaterThan(4);
    expect(scatterOf("red")).toBe(1);
  });

  it("steps through the raindrop and back to the start", () => {
    const def = asAnyProp(atmosphere);
    let s = { ...atmosphere.defaults, kind: AtmosphereKind.Raindrop, step: 0 };
    for (let k = 0; k < ATMOSPHERE_STEPS[AtmosphereKind.Raindrop]; k++)
      s = run(def, s, AtmosphereAction.Next, {}).state;
    expect(s.step).toBe(0);
    const planet = run(def, atmosphere.defaults, AtmosphereAction.SetSource, {
      source: SkySource.Planet,
    });
    expect((viewOf(def, planet.state) as Record<string, unknown>).twinkles).toBe(false);
  });
});

describe("scattering", () => {
  const def = asAnyProp(scattering);
  it("says the Sun's colour when the learner moves it", () => {
    const { emit } = run(
      def,
      { ...scattering.defaults, kind: ScatterKind.SunPath },
      ScatterAction.SetSunHeight,
      {
        deg: 0,
      },
    );
    expect(emit[0]?.payload).toMatchObject({ sunColour: SunColour.Red });
  });

  it("shows the beam only with particles, and a dark sky with no air", () => {
    const room = { ...scattering.defaults, kind: ScatterKind.Tyndall };
    expect((viewOf(def, room) as Record<string, unknown>).beamVisible).toBe(true);
    const clear = run(def, room, ScatterAction.SetParticles, { on: false }).state;
    expect((viewOf(def, clear) as Record<string, unknown>).beamVisible).toBe(false);
    const space = run(def, scattering.defaults, ScatterAction.SetAir, { on: false }).state;
    expect((viewOf(def, space) as Record<string, unknown>).skyColour).toBe("dark");
  });
});

describe("every eye-chapter prop", () => {
  it("keeps its derived values apart from its state (the view holds both)", () => {
    for (const m of eyeProps) {
      const stateKeys = Object.keys(m.def.defaults as object);
      const derivedKeys = Object.keys((m.def as { derived?: object }).derived ?? {});
      for (const k of derivedKeys) expect(stateKeys).not.toContain(k);
    }
  });

  const cases: [string, Record<string, unknown>][] = [
    [
      "eyeModel",
      {
        ...eyeModel.defaults,
        showNames: true,
        showReadout: true,
        canSetCorrection: true,
        canSetDefect: true,
        canSetLight: true,
      },
    ],
    ["eyeModel", { ...eye(EyeDefect.Myopia, { correction: -0.5 }) }],
    ["eyeModel", { ...eye(EyeDefect.Hypermetropia, { objectCm: 25 }) }],
    ...Object.values(PrismMode).map((mode): [string, Record<string, unknown>] => [
      "prism",
      { ...prism.defaults, mode, canSetMode: true },
    ]),
    ...Object.values(AtmosphereKind).flatMap((kind) =>
      Array.from(
        { length: ATMOSPHERE_STEPS[kind] },
        (_, step): [string, Record<string, unknown>] => [
          "atmosphere",
          { ...atmosphere.defaults, kind, step },
        ],
      ),
    ),
    ...Object.values(ScatterKind).map((kind): [string, Record<string, unknown>] => [
      "scattering",
      { ...scattering.defaults, kind, isStarted: true, sunHeight: 3 },
    ]),
    ...Object.values(EyeSceneKind).map((scene): [string, Record<string, unknown>] => [
      "eyeScene",
      { scene },
    ]),
  ];

  it.each(cases)("%s draws in English and Hindi at phone widths without gaps", (type, state) => {
    const m = eyeProps.find((p) => p.def.type === type);
    if (m === undefined) throw new Error(type);
    const View = m.View;
    for (const locale of ["en", "hi"] as const)
      for (const width of [300, 340, 420]) {
        const html = renderToString(
          <View
            view={viewOf(m.def, state)}
            locale={locale}
            width={width}
            call={() => undefined}
            signal={() => undefined}
          />,
        );
        expect(html).not.toMatch(/NaN|undefined|Infinity/);
      }
  });
});
