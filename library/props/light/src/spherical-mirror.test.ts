import { partPaths } from "@chalk/player";
import {
  type AnyPropDef,
  EffectKind,
  type StoredState,
  applyPatch as applyStored,
  asAnyProp,
  observationOf,
  prepareAction as prepareStored,
  viewOf as viewOfStored,
} from "@chalk/prop";
import { h } from "preact";
import { render } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import {
  BEAM_RAYS,
  MARK_WITHIN,
  MirrorKind,
  Place,
  Ray,
  SHARP_WITHIN,
  SphericalMirrorAction,
  SphericalMirrorDerived,
  SphericalMirrorSignal,
  type SphericalMirrorState,
  apertureOf,
  beamHeights,
  blurAt,
  imageOf,
  isImageShown,
  isMarkOnImage,
  isSharpAt,
  markStart,
  placeOf,
  planeBox,
  rayPath,
  readoutOf,
  rulerTicks,
  signedCm,
  sphericalMirror,
  surfaceX,
} from "./spherical-mirror";
import { SphericalMirrorView } from "./spherical-mirror-view";

const def = asAnyProp(sphericalMirror);
/** The parts drawn on screen (tagged), as the description names them. */
const drawn = (s: StoredState): Set<string> =>
  partPaths(
    render(
      h(SphericalMirrorView, {
        view: viewOf(def, s),
        width: 340,
        locale: "en",
        call: () => undefined,
        signal: () => undefined,
      }),
    ),
  );
/** Each part as the mirror's description names it now: "<leaf>/<part>". */
const P = {
  Bench: "bench/bench",
  Mirror: "face/mirror",
  Pole: "points/pole",
  Focus: "points/focus",
  Centre: "points/centre",
  Object: "objectArrow/object",
  Image: "imageArrow/image",
  RayPrefix: "rayLines/ray:",
  Beam: "rayLines/beam",
  Readout: "readout/readout",
  Signs: "signs/signs",
  Ruler: "bench/ruler",
  Screen: "whiteScreen/screen",
  Mark: "marker/mark",
  RayButtonParallel: "rayButtons/button:parallel",
  FocalMore: "focal/more",
  KindConvex: "kindToggle/convex",
} as const;
// The mirror is a group that stores only facts: a state written by hand (its own fields changed)
// is complete, and its leaves are worked out when read.
const viewOf = (d: AnyPropDef, s: StoredState) => viewOfStored(d, s);
const prepareAction = (d: AnyPropDef, s: StoredState, name: string, args: unknown) =>
  prepareStored(d, s, name, args);
const applyPatch = (d: AnyPropDef, s: StoredState, patch: StoredState) => applyStored(d, s, patch);
/** A concave mirror, f = 10: the object 30 cm in front, beyond C (NCERT Example 10.1 shape). */
const concave: SphericalMirrorState = {
  ...(sphericalMirror.defaults as SphericalMirrorState),
  kind: MirrorKind.Concave,
  focalLength: 10,
  object: { x: -30, height: 4 },
  rays: [Ray.Parallel, Ray.Focal],
  showImage: true,
  showLabels: true,
};
const convex: SphericalMirrorState = {
  ...concave,
  kind: MirrorKind.Convex,
  object: { x: -30, height: 4 },
};

function run(given: SphericalMirrorState, name: string, args: Record<string, unknown> = {}) {
  const state = given;
  const result = prepareAction(def, state, name, args);
  if (!result.isOk) throw new Error(result.errors.join("; "));
  if (result.effect.kind !== EffectKind.Set) throw new Error(`${name} should be instant`);
  const next = applyPatch(def, state, result.effect.set);
  if (!next.isOk) throw new Error(next.errors.join("; "));
  return next.state as SphericalMirrorState;
}

describe("spherical mirror: the mirror formula", () => {
  it("puts the image between F and C, real, inverted and smaller, for an object beyond C", () => {
    const img = imageOf(concave);
    expect(img?.v).toBeCloseTo(-15, 9);
    expect(img?.height).toBeCloseTo(-2, 9);
    expect(img?.magnification).toBeCloseTo(-0.5, 9);
    expect(img?.isReal).toBe(true);
    expect(img?.isErect).toBe(false);
  });

  it("puts the image at C, same size, for an object at C", () => {
    const img = imageOf({ ...concave, object: { x: -20, height: 4 } });
    expect(img?.v).toBeCloseTo(-20, 9);
    expect(img?.height).toBeCloseTo(-4, 9);
  });

  it("sends the image to infinity for an object at F", () => {
    expect(imageOf({ ...concave, object: { x: -10, height: 4 } })).toBeNull();
  });

  it("makes a virtual, erect, enlarged image for an object between F and P", () => {
    const img = imageOf({ ...concave, object: { x: -5, height: 4 } });
    expect(img?.v).toBeCloseTo(10, 9);
    expect(img?.height).toBeCloseTo(8, 9);
    expect(img?.isReal).toBe(false);
    expect(img?.isErect).toBe(true);
  });

  it("makes a virtual, erect, diminished image behind a convex mirror wherever the object is", () => {
    for (const x of [-60, -30, -10, -2]) {
      const img = imageOf({ ...convex, object: { x, height: 4 } });
      expect(img?.v).toBeGreaterThan(0);
      expect(img?.v).toBeLessThan(10);
      expect(img?.isErect).toBe(true);
      expect(img?.height).toBeLessThan(4);
    }
    expect(imageOf(convex)?.v).toBeCloseTo(7.5, 9);
  });

  it("names where the object stands", () => {
    expect(placeOf({ ...concave, object: { x: -30, height: 4 } })).toBe(Place.BeyondCentre);
    expect(placeOf({ ...concave, object: { x: -20, height: 4 } })).toBe(Place.AtCentre);
    expect(placeOf({ ...concave, object: { x: -15, height: 4 } })).toBe(
      Place.BetweenCentreAndFocus,
    );
    expect(placeOf({ ...concave, object: { x: -10, height: 4 } })).toBe(Place.AtFocus);
    expect(placeOf({ ...concave, object: { x: -4, height: 4 } })).toBe(Place.BetweenFocusAndPole);
  });
});

describe("spherical mirror: the drawn surface", () => {
  it("curves towards the light for a concave mirror and away for a convex one", () => {
    expect(surfaceX(concave, 8)).toBeLessThan(0);
    expect(surfaceX(convex, 8)).toBeGreaterThan(0);
    expect(surfaceX(concave, 0)).toBe(0);
  });
});

describe("spherical mirror: the standard rays", () => {
  it("reflects the parallel ray through F on a concave mirror", () => {
    const path = rayPath(concave, Ray.Parallel);
    expect(path.hit[1]).toBeCloseTo(4, 9);
    // The reflected ray passes through the focus (-10, 0) and the image tip (-15, -2).
    expect(path.through).toEqual([-10, 0]);
    expect(path.extension).toBeNull();
  });

  it("reflects the focal ray parallel to the axis", () => {
    const path = rayPath(concave, Ray.Focal);
    expect(path.reflected[1]).toBe(0);
    expect(path.reflected[0]).toBeLessThan(0);
    expect(path.hit[1]).toBeCloseTo(-2, 9);
  });

  it("sends the centre ray back along itself", () => {
    const path = rayPath(concave, Ray.Centre);
    expect(path.through).toEqual([-20, 0]);
  });

  it("reflects the pole ray symmetrically about the axis", () => {
    const path = rayPath(concave, Ray.Pole);
    expect(path.hit[1]).toBeCloseTo(0, 9);
    // Heading back towards x = -30 it is 4 cm below the axis: the mirror image of the object tip.
    const [dx, dy] = path.reflected;
    expect(dx).toBeLessThan(0);
    expect(dy).toBeLessThan(0);
    expect(dy / dx).toBeCloseTo(4 / 30, 9);
  });

  it("sends every reflected ray through the image the formula gives, for any object position", () => {
    for (const kind of [MirrorKind.Concave, MirrorKind.Convex]) {
      for (const x of [-45, -30, -20, -15, -12, -6, -3]) {
        const s = { ...concave, kind, object: { x, height: 4 } };
        const img = imageOf(s);
        if (img === null) continue;
        for (const ray of [Ray.Parallel, Ray.Focal, Ray.Centre, Ray.Pole]) {
          const path = rayPath(s, ray);
          if (path.isOffMirror) continue;
          // The reflected line from the hit point along `reflected` reaches (v, h') at some t.
          const [hx, hy] = path.hit;
          const [dx, dy] = path.reflected;
          const t = (img.v - hx) / dx;
          expect(hy + dy * t).toBeCloseTo(img.height, 6);
        }
      }
    }
  });

  it("gives every reflected ray a dashed extension behind a convex mirror, meeting at the image", () => {
    const img = imageOf(convex);
    for (const ray of [Ray.Parallel, Ray.Focal, Ray.Centre, Ray.Pole]) {
      const path = rayPath(convex, ray);
      expect(path.extension).not.toBeNull();
      expect(path.extension?.[0]).toBeCloseTo(img?.v ?? Number.NaN, 6);
      expect(path.extension?.[1]).toBeCloseTo(img?.height ?? Number.NaN, 6);
    }
  });
});

describe("spherical mirror: actions", () => {
  it("moveObject changes only the object's x", () => {
    const next = run(concave, SphericalMirrorAction.MoveObject, { x: -12 });
    expect(next.object).toEqual({ x: -12, height: 4 });
    expect(next.focalLength).toBe(10);
  });

  it("placeObject puts the object at a named textbook position", () => {
    expect(run(concave, SphericalMirrorAction.PlaceObject, { at: Place.AtCentre }).object.x).toBe(
      -20,
    );
    expect(run(concave, SphericalMirrorAction.PlaceObject, { at: Place.AtFocus }).object.x).toBe(
      -10,
    );
    const between = run(concave, SphericalMirrorAction.PlaceObject, {
      at: Place.BetweenFocusAndPole,
    });
    expect(placeOf(between)).toBe(Place.BetweenFocusAndPole);
  });

  it("moveObjectSoImageIsAt is the inverse of the formula", () => {
    const next = run(concave, SphericalMirrorAction.MoveObjectSoImageIsAt, { v: -30 });
    expect(next.object.x).toBeCloseTo(-15, 9);
    expect(sphericalMirror.actions[SphericalMirrorAction.MoveObjectSoImageIsAt]?.reveals).toBe(
      true,
    );
  });

  it("refuses an object behind the mirror, or a focal length of zero", () => {
    expect(prepareAction(def, concave, SphericalMirrorAction.MoveObject, { x: 5 }).isOk).toBe(
      false,
    );
    expect(applyPatch(def, concave, { focalLength: 0 }).isOk).toBe(false);
  });

  it("marks moveObject, setFocalLength and setKind as the learner's, and nothing else", () => {
    expect(sphericalMirror.actions[SphericalMirrorAction.MoveObject]?.byLearner).toBe(true);
    expect(sphericalMirror.actions[SphericalMirrorAction.SetFocalLength]?.byLearner).toBe(true);
    expect(sphericalMirror.actions[SphericalMirrorAction.SetKind]?.byLearner).toBe(true);
    expect(sphericalMirror.actions[SphericalMirrorAction.PlaceObject]?.byLearner).toBeUndefined();
  });
});

describe("spherical mirror: observation", () => {
  it("reports the drawn rays and the image only while shown", () => {
    const shown = observationOf(def, viewOf(def, concave));
    // In drawing order: the bench, the mirror, the rays, its points, the image, the object.
    expect(shown.elements.map((e) => e.id)).toEqual([
      P.Bench,
      P.Mirror,
      `${P.RayPrefix}${Ray.Parallel}`,
      `${P.RayPrefix}${Ray.Focal}`,
      P.Pole,
      P.Focus,
      P.Centre,
      P.Image,
      P.Object,
    ]);
    expect(shown.elements.find((e) => e.id === P.Image)?.value).toBe(
      "real, inverted, diminished, 15 cm in front, between F and C",
    );
    expect(shown.hidden).toBeUndefined();

    const bare = observationOf(
      def,
      viewOf(def, { ...concave, showImage: false, showLabels: false, rays: [] }),
    );
    expect(bare.elements.map((e) => e.id)).toEqual([P.Bench, P.Mirror, P.Object]);
    expect(bare.hidden).toMatchObject({ image: { v: -15 } });
  });

  it("says the image is at infinity for an object at F", () => {
    const o = observationOf(def, viewOf(def, { ...concave, object: { x: -10, height: 4 } }));
    expect(o.elements.find((e) => e.id === P.Image)).toBeUndefined();
    expect(o.summary).toContain("infinity");
  });

  it("draws every part it describes, each found on screen by its path", () => {
    for (const state of [
      concave,
      convex,
      { ...concave, showDistances: true, screen: -15, canMoveScreen: true },
      { ...concave, beam: true },
      {
        ...concave,
        markImage: true,
        canPickRays: true,
        canSetKind: true,
        canSetFocal: true,
        showRuler: true,
        showSigns: true,
      },
    ]) {
      const onScreen = drawn(state);
      const seen = observationOf(def, viewOf(def, state)).elements.map((e) => e.id);
      for (const id of seen) expect(onScreen.has(id), id).toBe(true);
      // And the other way: nothing drawn that the description leaves out.
      for (const path of onScreen) expect(seen, path).toContain(path);
    }
  });
});

describe("spherical mirror: sunlight, readout, signs and controls", () => {
  it("defaults every new field off, so older content draws as before", () => {
    const d = sphericalMirror.defaults;
    expect([
      d.beam,
      d.showDistances,
      d.showSigns,
      d.showRuler,
      d.canSetFocal,
      d.canSetKind,
    ]).toEqual([false, false, false, false, false, false]);
  });

  it("spreads the beam's rays evenly across the aperture, about the axis", () => {
    const ys = beamHeights(concave);
    expect(ys).toHaveLength(BEAM_RAYS);
    expect(ys[0]).toBeCloseTo(-(ys[BEAM_RAYS - 1] ?? 0), 9);
    expect(ys[2]).toBeCloseTo(0, 9);
  });

  it("in sunlight, reports the beam and not the object, its rays or its image", () => {
    const sun = { ...concave, beam: true };
    const o = observationOf(def, viewOf(def, sun));
    const ids = o.elements.map((e) => e.id);
    expect(ids).toContain(P.Beam);
    expect(ids).not.toContain(P.Object);
    expect(ids).not.toContain(P.Image);
    expect(o.summary).toContain("through F");
    const back = observationOf(def, viewOf(def, { ...convex, beam: true }));
    expect(back.summary).toContain("as if it came from F");
    expect(sphericalMirror.parts?.(viewOf(def, sun) as never)).not.toContain(P.Object);
    expect(drawn(sun).has(P.Object)).toBe(false);
  });

  it("writes u, v, f, h and h′ with New Cartesian signs and a true minus", () => {
    expect(signedCm(-30)).toBe("−30");
    expect(signedCm(7.5)).toBe("+7.5");
    expect(signedCm(-0.04)).toBe("0");
    expect(readoutOf(concave)).toBe(
      "u = −30 cm   v = −15 cm   f = −10 cm   h = +4 cm   h′ = −2 cm",
    );
    expect(readoutOf({ ...concave, object: { x: -10, height: 4 } })).toBe(
      "u = −10 cm   v = ∞   f = −10 cm",
    );
    expect(readoutOf(concave, false)).toBe("u = −30 cm   v = ?   f = −10 cm   h = +4 cm   h′ = ?");
    const o = observationOf(def, viewOf(def, { ...concave, showDistances: true }));
    expect(o.elements.find((e) => e.id === P.Readout)?.value).toContain("v = −15 cm");
    expect(drawn({ ...concave, showDistances: true }).has(P.Readout)).toBe(true);
  });

  it("shows the sign convention as a part when asked", () => {
    const v = viewOf(def, { ...concave, showSigns: true });
    expect(sphericalMirror.parts?.(v as never)).toContain(P.Signs);
    expect(observationOf(def, v).elements.find((e) => e.id === P.Signs)?.value).toContain("+x");
    expect(drawn({ ...concave, showSigns: true }).has(P.Signs)).toBe(true);
  });

  it("lets the learner change f and the kind, keeping the object", () => {
    const longer = run({ ...concave, canSetFocal: true }, SphericalMirrorAction.SetFocalLength, {
      f: 15,
    });
    expect(longer.focalLength).toBe(15);
    expect(longer.object).toEqual(concave.object);
    const flipped = run({ ...concave, canSetKind: true }, SphericalMirrorAction.SetKind, {
      kind: MirrorKind.Convex,
    });
    expect(flipped.kind).toBe(MirrorKind.Convex);
    const parts = sphericalMirror.parts?.(
      viewOf(def, { ...concave, canSetFocal: true, canSetKind: true }) as never,
    );
    expect(parts).toContain(P.FocalMore);
    expect(parts).toContain(P.KindConvex);
  });

  it("derives 1/u + 1/v equal to 1/f, and |f| and R", () => {
    const v = viewOf(def, concave) as Record<string, unknown>;
    expect(v[SphericalMirrorDerived.InverseSum]).toBeCloseTo(-0.1, 4);
    expect(v[SphericalMirrorDerived.DistanceToF]).toBe(10);
    expect(v[SphericalMirrorDerived.Radius]).toBe(20);
    const cv = viewOf(def, { ...convex, object: { x: -20, height: 4 } }) as Record<string, unknown>;
    expect(cv[SphericalMirrorDerived.InverseSum]).toBeCloseTo(0.1, 4);
    const atF = viewOf(def, { ...concave, object: { x: -10, height: 4 } }) as Record<
      string,
      unknown
    >;
    expect(atF[SphericalMirrorDerived.InverseSum]).toBeNull();
  });

  it("ticks the axis every 5 cm from P, both sides for a convex mirror, as a part", () => {
    const front = rulerTicks(concave);
    expect(front).toContain(-10);
    expect(front).toContain(-20);
    expect(front).not.toContain(0);
    expect(front.every((x) => x % 5 === 0)).toBe(true);
    expect(rulerTicks(convex).some((x) => x > 0)).toBe(true);
    const v = viewOf(def, { ...concave, showRuler: true });
    expect(sphericalMirror.parts?.(v as never)).toContain(P.Ruler);
    expect(drawn({ ...concave, showRuler: true }).has(P.Ruler)).toBe(true);
  });
});

describe("spherical mirror view: clipping", () => {
  it("keeps only the part of a segment inside the stage", async () => {
    const { clipSegment } = await import("./spherical-mirror-view");
    expect(clipSegment([10, 10], [50, 50], 100, 100)).toEqual([
      [10, 10],
      [50, 50],
    ]);
    const c = clipSegment([50, 50], [50, -500], 100, 100);
    expect(c?.[1]).toEqual([50, 0]);
    const d = clipSegment([80, 50], [-200, 330], 100, 100);
    expect(d?.[1][0]).toBeCloseTo(30, 9);
    expect(d?.[1][1]).toBeCloseTo(100, 9);
    expect(clipSegment([-10, -10], [-5, -50], 100, 100)).toBeNull();
  });
});

describe("spherical mirror: a fixed frame", () => {
  it("defaults to no span, framing the picture by f", () => {
    expect(sphericalMirror.defaults.span).toBeNull();
    const a = planeBox(concave, 340);
    const b = planeBox({ ...concave, focalLength: 15 }, 340);
    expect(a.toPixel(-10, 0)[0]).toBeCloseTo(b.toPixel(-15, 0)[0], 6);
  });

  it("with a span, keeps the frame and the scale fixed, so F and C move when f changes", () => {
    const at10 = planeBox({ ...concave, span: 60 }, 340);
    const at15 = planeBox({ ...concave, focalLength: 15, span: 60 }, 340);
    expect(at10.scale).toBeCloseTo(at15.scale, 9);
    expect(at10.window).toEqual(at15.window);
    expect(at10.window.xMin).toBe(-60);
    expect(at10.window.xMax).toBeGreaterThan(0);
    expect(at10.toPixel(-15, 0)[0]).toBeCloseTo(at15.toPixel(-15, 0)[0], 9);
    expect(at10.toPixel(-10, 0)[0]).toBeGreaterThan(at15.toPixel(-15, 0)[0]);
    const cv = planeBox({ ...convex, span: 60 }, 340);
    expect(cv.window.xMax).toBeCloseTo(36, 9);
  });

  it("caps the mirror's aperture so it fits the fixed frame", () => {
    const big = { ...concave, focalLength: 40, span: 60 };
    const box = planeBox(big, 340);
    expect(apertureOf(big)).toBeLessThan(40);
    expect(1.15 * apertureOf(big)).toBeLessThanOrEqual(box.window.yMax + 1e-9);
    expect(apertureOf({ ...concave, span: 200 })).toBe(10);
  });

  it("refuses a span outside 10 to 200 cm", () => {
    expect(applyPatch(def, concave, { span: 5 }).isOk).toBe(false);
    expect(applyPatch(def, concave, { span: 250 }).isOk).toBe(false);
    expect(applyPatch(def, concave, { span: 60 }).isOk).toBe(true);
  });
});

describe("spherical mirror: catching the image on a screen", () => {
  const withScreen = (screen: number | null, extra: Partial<SphericalMirrorState> = {}) =>
    viewOf(def, { ...concave, screen, ...extra }) as Record<string, unknown>;

  it("has no screen by default, so no blur", () => {
    expect(sphericalMirror.defaults.screen).toBeNull();
    expect(sphericalMirror.defaults.canMoveScreen).toBe(false);
    expect(withScreen(null)[SphericalMirrorDerived.Blur]).toBeNull();
    expect(withScreen(null)[SphericalMirrorDerived.IsSharp]).toBe(false);
  });

  it("is sharp exactly at v, a real image (concave, object beyond C: v = −15)", () => {
    expect(blurAt(concave, -15)).toBe(0);
    const v = withScreen(-15);
    expect(v[SphericalMirrorDerived.Blur]).toBe(0);
    expect(v[SphericalMirrorDerived.IsSharp]).toBe(true);
    expect(isSharpAt(concave, -15 + SHARP_WITHIN)).toBe(true);
    expect(isSharpAt(concave, -15 + SHARP_WITHIN + 0.1)).toBe(false);
  });

  it("blurs more the farther the screen is from v, on either side", () => {
    const near = blurAt(concave, -14);
    const far = blurAt(concave, -10);
    const beyond = blurAt(concave, -16);
    const wayBeyond = blurAt(concave, -25);
    expect(near).toBeGreaterThan(0);
    expect(far).toBeGreaterThan(near);
    expect(beyond).toBeGreaterThan(0);
    expect(wayBeyond).toBeGreaterThan(beyond);
    expect(far).toBeCloseTo(apertureOf(concave) * (1 - 10 / 15), 3);
  });

  it("never focuses a virtual image, or one at infinity", () => {
    const inside = { ...concave, object: { x: -5, height: 4 } };
    for (const x of [-1, -5, -10, -20]) expect(isSharpAt(inside, x)).toBe(false);
    expect(blurAt(inside, -5)).toBe(apertureOf(inside));
    expect(isSharpAt(convex, -7.5)).toBe(false);
    const atF = { ...concave, object: { x: -10, height: 4 } };
    expect(blurAt(atF, -10)).toBe(apertureOf(atF));
  });

  it("lets the learner slide the screen, kept in front of the mirror and inside the picture", () => {
    expect(sphericalMirror.actions[SphericalMirrorAction.MoveScreen]?.byLearner).toBe(true);
    const moved = run(
      { ...concave, screen: -20, canMoveScreen: true },
      SphericalMirrorAction.MoveScreen,
      {
        x: -15,
      },
    );
    expect(moved.screen).toBe(-15);
    const far = run({ ...concave, screen: -20 }, SphericalMirrorAction.MoveScreen, { x: -199 });
    expect(far.screen).toBeGreaterThanOrEqual(-34);
    expect(prepareAction(def, concave, SphericalMirrorAction.MoveScreen, { x: 3 }).isOk).toBe(
      false,
    );
    expect(applyPatch(def, concave, { screen: 2 }).isOk).toBe(false);
    expect(SphericalMirrorSignal.ScreenReleased).toBe("screenReleased");
  });

  it("observes, lists and locates the screen, and says what it catches", () => {
    const sharp = viewOf(def, { ...concave, screen: -15 });
    const o = observationOf(def, sharp);
    expect(o.elements.find((e) => e.id === P.Screen)?.value).toContain("sharp");
    const blurred = observationOf(def, viewOf(def, { ...concave, screen: -25 }));
    expect(blurred.elements.find((e) => e.id === P.Screen)?.value).toContain("after passing");
    expect(sphericalMirror.parts?.(sharp as never)).toContain(P.Screen);
    expect(drawn({ ...concave, screen: -15 }).has(P.Screen)).toBe(true);
  });
});

describe("spherical mirror: readable pictures and names", () => {
  it("draws a 5 cm object at f = 10 at least 40 px tall at 360 px", () => {
    const s = { ...concave, object: { x: -30, height: 5 } };
    const box = planeBox(s, 360);
    expect(box.toPixel(-30, 0)[1] - box.toPixel(-30, 5)[1]).toBeGreaterThanOrEqual(40);
    const cv = { ...convex, object: { x: -20, height: 5 } };
    const cbox = planeBox(cv, 360);
    expect(cbox.toPixel(-20, 0)[1] - cbox.toPixel(-20, 5)[1]).toBeGreaterThanOrEqual(34);
  });

  it("still fits an object beyond C, F and C, and the image for the textbook positions", () => {
    const w = planeBox(concave, 360).window;
    expect(w.xMin).toBeLessThanOrEqual(-30);
    expect(w.xMax).toBeGreaterThan(0);
    const cw = planeBox(convex, 360).window;
    expect(cw.xMax).toBeGreaterThan(20);
  });

  it("names the arrows by default", () => {
    expect(sphericalMirror.defaults.showNames).toBe(true);
  });
});

describe("spherical mirror: draw it yourself", () => {
  const game: SphericalMirrorState = {
    ...concave,
    rays: [],
    showImage: false,
    canPickRays: true,
    markImage: true,
  };

  it("lets the learner switch each ray on and off, keeping the textbook's order", () => {
    expect(sphericalMirror.actions[SphericalMirrorAction.ToggleRay]?.byLearner).toBe(true);
    const a = run(game, SphericalMirrorAction.ToggleRay, { ray: Ray.Focal });
    const b = run(a, SphericalMirrorAction.ToggleRay, { ray: Ray.Parallel });
    expect(b.rays).toEqual([Ray.Parallel, Ray.Focal]);
    const c = run(b, SphericalMirrorAction.ToggleRay, { ray: Ray.Focal });
    expect(c.rays).toEqual([Ray.Parallel]);
    expect(sphericalMirror.parts?.(viewOf(def, game) as never)).toContain(P.RayButtonParallel);
  });

  it("starts the ? in front of the mirror near its top, not on the image", () => {
    const m = markStart(game);
    expect(m.x).toBeLessThan(0);
    expect(m.y).toBeGreaterThan(0);
    expect(isMarkOnImage({ ...game, mark: null })).toBe(false);
    const v = viewOf(def, game) as Record<string, unknown>;
    expect(v[SphericalMirrorDerived.MarkOnImage]).toBe(false);
  });

  it("finds the image when the ? is within 1 cm of its tip, and only then draws it", () => {
    expect(sphericalMirror.actions[SphericalMirrorAction.MoveMark]?.byLearner).toBe(true);
    // Object beyond C: image tip at (−15, −2).
    const near = run(game, SphericalMirrorAction.MoveMark, { x: -15.5, y: -2.5 });
    expect(isMarkOnImage(near)).toBe(true);
    expect(isImageShown(near)).toBe(true);
    const off = run(game, SphericalMirrorAction.MoveMark, { x: -15, y: -2 - MARK_WITHIN - 0.5 });
    expect(isMarkOnImage(off)).toBe(false);
    expect(isImageShown(off)).toBe(false);
    const found = observationOf(def, viewOf(def, near));
    expect(found.elements.map((e) => e.id)).toContain(P.Image);
    // Found: the ? gives way to the image itself (it is no longer on screen).
    expect(found.elements.map((e) => e.id)).not.toContain(P.Mark);
    const hidden = observationOf(def, viewOf(def, off));
    expect(hidden.elements.map((e) => e.id)).not.toContain(P.Image);
    expect(hidden.hidden).toMatchObject({ image: { v: -15 } });
    expect(SphericalMirrorSignal.MarkReleased).toBe("markReleased");
  });

  it("finds a virtual image behind the mirror too, but never one at infinity", () => {
    const inside = { ...game, object: { x: -5, height: 4 } }; // image at (+10, +8)
    expect(isMarkOnImage(run(inside, SphericalMirrorAction.MoveMark, { x: 10, y: 8 }))).toBe(true);
    const atF = { ...game, object: { x: -10, height: 4 }, mark: { x: -10, y: 4 } };
    expect(isMarkOnImage(atF)).toBe(false);
  });

  it("keeps the ? inside the picture", () => {
    const m = run(game, SphericalMirrorAction.MoveMark, { x: -199, y: 59 });
    const w = planeBox(game, 340).window;
    expect(m.mark?.x).toBeGreaterThanOrEqual(w.xMin);
    expect(m.mark?.y).toBeLessThanOrEqual(w.yMax);
  });
});
