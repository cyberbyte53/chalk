import { partPaths } from "@chalk/player";
import {
  type AnyPropDef,
  EffectKind,
  type StoredState,
  applyPatch,
  asAnyProp,
  observationOf,
  prepareAction,
  viewOf as viewOfStored,
} from "@chalk/prop";
import { h } from "preact";
import { render } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import {
  LensAction,
  LensCover,
  LensDerived,
  LensKind,
  LensObjectStyle,
  LensPlace,
  LensRay,
  type LensRayPath,
  type LensState,
  beamRays,
  blurOf,
  isImageDrawn,
  isSharpOf,
  leftmostObject,
  lens,
  lensApertureOf,
  lensBox,
  lensImageOf,
  lensPlaceOf,
  lensRayPath,
  lensWindowOf,
  markOnImageOf,
  patchCentreOf,
  powerOf,
  readoutOf,
  spareRays,
  toggled,
} from "./lens";
import { LensView } from "./lens-view";

const def = asAnyProp(lens);
// The lens is a group that stores only facts: a state written by hand (its own fields changed)
// is complete, and its leaves are worked out when read.
const viewOf = (d: AnyPropDef, s: StoredState) => viewOfStored(d, s);
const convex = lens.defaults as LensState;
const concave: LensState = { ...convex, kind: LensKind.Concave };
const at = (s: LensState, x: number, height = 4): LensState => ({ ...s, object: { x, height } });

function run(given: LensState, name: string, args: Record<string, unknown> = {}) {
  const state = given;
  const result = prepareAction(def, state, name, args);
  if (!result.isOk) throw new Error(result.errors.join("; "));
  if (result.effect.kind !== EffectKind.Set) throw new Error(`${name} should be instant`);
  const next = applyPatch(def, state, result.effect.set);
  if (!next.isOk) throw new Error(next.errors.join("; "));
  return next.state as LensState;
}

/** Where the drawn ray (or its dashed back-extension) is at x. */
function yAt(path: LensRayPath, x: number): number {
  const [hx, hy] = path.hit;
  const [dx, dy] = path.out;
  return hy + (dy * (x - hx)) / dx;
}

describe("lens: the lens formula", () => {
  it("NCERT Example 10.4: f = +10, u = −15 gives v = +30, m = −2, h′ = −4", () => {
    const img = lensImageOf({ ...convex, object: { x: -15, height: 2 } });
    expect(img?.v).toBeCloseTo(30, 9);
    expect(img?.magnification).toBeCloseTo(-2, 9);
    expect(img?.height).toBeCloseTo(-4, 9);
    expect(img?.isReal).toBe(true);
    expect(img?.isErect).toBe(false);
  });

  it("NCERT Example 10.3: a concave lens, f = −15, object at 30 cm gives v = −10, m = +1/3", () => {
    const s = { ...concave, focalLength: 15, object: { x: -30, height: 3 } };
    const img = lensImageOf(s);
    expect(img?.v).toBeCloseTo(-10, 9);
    expect(img?.magnification).toBeCloseTo(1 / 3, 9);
    expect(img?.isReal).toBe(false);
    expect(img?.isErect).toBe(true);
  });

  it("gives the six convex cases of Table 10.4", () => {
    const beyond = lensImageOf(at(convex, -30));
    expect(beyond?.v).toBeCloseTo(15, 9);
    expect(beyond?.isReal).toBe(true);
    expect(Math.abs(beyond?.magnification ?? 0)).toBeLessThan(1);

    const at2f = lensImageOf(at(convex, -20));
    expect(at2f?.v).toBeCloseTo(20, 9);
    expect(at2f?.magnification).toBeCloseTo(-1, 9);

    const between = lensImageOf(at(convex, -15));
    expect(between?.v).toBeGreaterThan(20);
    expect(Math.abs(between?.magnification ?? 0)).toBeGreaterThan(1);
    expect(between?.isErect).toBe(false);

    expect(lensImageOf(at(convex, -10))).toBeNull();

    const inside = lensImageOf(at(convex, -5));
    expect(inside?.v).toBeCloseTo(-10, 9);
    expect(inside?.isReal).toBe(false);
    expect(inside?.isErect).toBe(true);
    expect(inside?.magnification).toBeCloseTo(2, 9);

    // Very far away: the image closes in on F₂.
    expect(lensImageOf(at(convex, -200))?.v).toBeCloseTo(200 / 19, 9);
  });

  it("always gives a concave lens a virtual, erect, diminished image between F₁ and O", () => {
    for (const x of [-150, -40, -10, -3, -1]) {
      const img = lensImageOf(at(concave, x));
      expect(img?.isReal).toBe(false);
      expect(img?.isErect).toBe(true);
      expect(img?.magnification).toBeLessThan(1);
      expect(img?.v).toBeLessThan(0);
      expect(img?.v).toBeGreaterThan(-10);
    }
  });

  it("names where the object stands", () => {
    expect(lensPlaceOf(at(convex, -30))).toBe(LensPlace.BeyondTwoF);
    expect(lensPlaceOf(at(convex, -20))).toBe(LensPlace.AtTwoF);
    expect(lensPlaceOf(at(convex, -15))).toBe(LensPlace.BetweenTwoFAndF);
    expect(lensPlaceOf(at(convex, -10))).toBe(LensPlace.AtF);
    expect(lensPlaceOf(at(convex, -4))).toBe(LensPlace.BetweenFAndO);
  });
});

describe("lens: power", () => {
  it("is +2 D for f = +50 cm and −2.5 D for f = −40 cm", () => {
    expect(powerOf({ kind: LensKind.Convex, focalLength: 50 })).toBe(2);
    expect(powerOf({ kind: LensKind.Concave, focalLength: 40 })).toBe(-2.5);
    expect(def.derived?.[LensDerived.Power]?.compute({ ...convex, focalLength: 20 })).toBe(5);
  });
});

describe("lens: the rays", () => {
  const cases: [string, LensState][] = [
    ["convex, object beyond 2F", at(convex, -30)],
    ["convex, object between F and 2F", at(convex, -15)],
    ["convex, object inside F", at(convex, -5)],
    ["concave, far", at(concave, -30)],
    ["concave, near", at(concave, -6)],
  ];
  for (const [name, s] of cases) {
    it(`meet (or seem to meet) at the image's tip: ${name}`, () => {
      const img = lensImageOf(s);
      if (img === null) throw new Error("no image");
      for (const ray of [LensRay.Parallel, LensRay.Focal, LensRay.Centre]) {
        const path = lensRayPath(s, ray);
        expect(path.isOff).toBe(false);
        expect(yAt(path, img.v)).toBeCloseTo(img.height, 6);
      }
    });
  }

  it("bend a convex lens's parallel ray through F₂ and a concave one's away from F₁", () => {
    const c = lensRayPath(convex, LensRay.Parallel);
    expect(yAt(c, 10)).toBeCloseTo(0, 9);
    const d = lensRayPath(concave, LensRay.Parallel);
    expect(yAt(d, -10)).toBeCloseTo(0, 9);
    expect(d.back).toEqual([-10, 0]);
  });

  it("aim a concave lens's focal ray at F₂ and dash it there", () => {
    const p = lensRayPath(concave, LensRay.Focal);
    expect(p.aim).toEqual([10, 0]);
    expect(p.out).toEqual([1, 0]);
  });

  it("dash a convex lens's focal ray back to F₁ when the object is inside F", () => {
    expect(lensRayPath(at(convex, -5), LensRay.Focal).source).toEqual([-10, 0]);
    expect(lensRayPath(at(convex, -30), LensRay.Focal).source).toBeNull();
  });

  it("send sunlight through F₂ (convex) or out as if from F₁ (concave)", () => {
    const rays = beamRays(convex);
    expect(rays).toHaveLength(5);
    for (const r of rays) expect(yAt(r, 10)).toBeCloseTo(0, 9);
    for (const r of beamRays(concave).filter((r) => r.hit[1] !== 0))
      expect(yAt(r, -10)).toBeCloseTo(0, 9);
  });
});

describe("lens: half the lens covered (NCERT Exercise 9)", () => {
  const top = {
    ...convex,
    cover: LensCover.Top,
    rays: [LensRay.Parallel, LensRay.Focal, LensRay.Centre],
  };

  it("blocks the rays through the covered half", () => {
    expect(lensRayPath(top, LensRay.Parallel).isOff).toBe(true);
    expect(lensRayPath(top, LensRay.Centre).isOff).toBe(true);
    // The focal ray from an object beyond 2F meets the lens below the axis.
    expect(lensRayPath(top, LensRay.Focal).isOff).toBe(false);
    expect(beamRays(top).every((r) => r.hit[1] <= 0)).toBe(true);
  });

  it("still forms the whole image, through the open half", () => {
    const img = lensImageOf(top);
    expect(img?.v).toBeCloseTo(15, 9);
    const spare = spareRays(top);
    expect(spare).toHaveLength(2);
    for (const r of spare) {
      expect(r.hit[1]).toBeLessThan(0);
      expect(yAt(r, img?.v ?? 0)).toBeCloseTo(img?.height ?? 0, 6);
    }
    expect(spareRays(convex)).toHaveLength(0);
  });

  it("is set by its action and said in the observation", () => {
    const next = run(convex, LensAction.Cover, { cover: LensCover.Bottom });
    expect(next.cover).toBe(LensCover.Bottom);
    expect(observationOf(def, viewOf(def, next)).summary).toContain("bottom half covered");
  });
});

describe("lens: actions and observation", () => {
  it("moves the object and keeps its height", () => {
    const next = run(convex, LensAction.MoveObject, { x: -15 });
    expect(next.object).toEqual({ x: -15, height: 4 });
  });

  it("places the object by name", () => {
    expect(run(convex, LensAction.PlaceObject, { at: LensPlace.AtTwoF }).object.x).toBe(-20);
    expect(run(convex, LensAction.PlaceObject, { at: LensPlace.BetweenFAndO }).object.x).toBe(-5);
  });

  it("changes f and kind", () => {
    expect(run(convex, LensAction.SetFocalLength, { f: 15 }).focalLength).toBe(15);
    expect(run(convex, LensAction.SetKind, { kind: LensKind.Concave }).kind).toBe(LensKind.Concave);
  });

  it("reads out u, v and f with their signs", () => {
    expect(readoutOf(convex)).toBe("u = −30 cm, v = +15 cm, f = +10 cm");
    expect(readoutOf(at(convex, -10))).toBe("u = −10 cm, v = ∞, f = +10 cm");
    expect(readoutOf(at(concave, -10))).toBe("u = −10 cm, v = −5 cm, f = −10 cm");
  });

  it("describes the picture in the textbook's words", () => {
    const o = observationOf(def, viewOf(def, convex));
    expect(o.summary).toContain("beyond 2F₁");
    expect(o.summary).toContain(
      "real, inverted, diminished, 15 cm on the other side, between F₂ and 2F₂",
    );
    const c = observationOf(def, viewOf(def, at(concave, -30)));
    expect(c.summary).toContain("virtual, erect, diminished");
    expect(c.summary).toContain("between F₁ and O");
  });

  it("hides the image's place when the image isn't shown", () => {
    const o = observationOf(def, viewOf(def, { ...convex, showImage: false }));
    expect(o.summary).toContain("the image is not drawn");
  });
});

describe("lens: a fixed window (span)", () => {
  it("keeps the axis from −span to +span whatever f is", () => {
    const a = lensBox({ ...convex, span: 60, focalLength: 10 }, 600);
    const b = lensBox({ ...convex, span: 60, focalLength: 30 }, 600);
    expect(a.window).toEqual(b.window);
    expect(a.window.xMin).toBe(-60);
    expect(a.window.xMax).toBe(60);
    // F₂ lands at a different pixel: a shorter f focuses closer to the lens.
    expect(a.toPixel(10, 0)[0]).toBeLessThan(b.toPixel(30, 0)[0]);
    expect(lensApertureOf({ focalLength: 10, span: 60 })).toBe(
      lensApertureOf({ focalLength: 30, span: 60 }),
    );
  });

  it("still sends the beam through F₂ inside it", () => {
    for (const r of beamRays({ ...convex, span: 60, focalLength: 15 }))
      expect(yAt(r, 15)).toBeCloseTo(0, 9);
  });

  it("is null by default and validated to 10..200", () => {
    expect(lens.defaults.span).toBeNull();
    expect(lensWindowOf(convex).xMin).toBe(-32.5);
    expect(lens.state.safeParse({ ...convex, span: 5 }).success).toBe(false);
    expect(lens.state.safeParse({ ...convex, span: 80 }).success).toBe(true);
  });
});

describe("lens: a screen to catch the image (Activity 10.12)", () => {
  const withScreen = (x: number, s: LensState = convex): LensState => ({
    ...s,
    screen: x,
    canMoveScreen: true,
  });

  it("is off by default", () => {
    expect(lens.defaults.screen).toBeNull();
    expect(lens.defaults.canMoveScreen).toBe(false);
    expect(lens.defaults.objectStyle).toBe(LensObjectStyle.Arrow);
    expect(blurOf(convex)).toBeNull();
    expect(isSharpOf(convex)).toBe(false);
  });

  it("is sharp at the image and blurs by similar triangles away from it", () => {
    // f = 10, u = −30: v = 15, aperture 10.
    expect(blurOf(withScreen(15))).toBeCloseTo(0, 9);
    expect(isSharpOf(withScreen(15))).toBe(true);
    expect(isSharpOf(withScreen(15.5))).toBe(true);
    expect(isSharpOf(withScreen(16))).toBe(false);
    expect(blurOf(withScreen(7.5))).toBeCloseTo(5, 9);
    expect(blurOf(withScreen(30))).toBeCloseTo(10, 9);
    // The patch is centred on the line through the image: at x = v it is the image's tip.
    expect(patchCentreOf(withScreen(15))).toBeCloseTo(-2, 9);
  });

  it("halves the cone when half the lens is covered, but stays sharp at the image", () => {
    const covered = { ...withScreen(7.5), cover: LensCover.Top };
    expect(blurOf(covered)).toBeCloseTo(2.5, 9);
    expect(isSharpOf({ ...covered, screen: 15 })).toBe(true);
  });

  it("catches only a faint patch for a virtual image or one at infinity", () => {
    expect(blurOf(withScreen(10, at(convex, -5)))).toBe(10);
    expect(isSharpOf(withScreen(10, at(convex, -5)))).toBe(false);
    expect(blurOf(withScreen(10, at(convex, -10)))).toBe(10);
    expect(blurOf(withScreen(10, concave))).toBe(10);
  });

  it("moves with its action and gives derived blur and isSharp", () => {
    const next = run(withScreen(5), LensAction.MoveScreen, { x: 15 });
    expect(next.screen).toBe(15);
    expect(def.derived?.[LensDerived.IsSharp]?.compute(next)).toBe(true);
    expect(def.derived?.[LensDerived.Blur]?.compute(next)).toBeCloseTo(0, 9);
    expect(prepareAction(def, next, LensAction.MoveScreen, { x: 0 }).isOk).toBe(false);
  });

  it("says what the screen shows", () => {
    const o = observationOf(def, viewOf(def, withScreen(10)));
    expect(o.summary).toContain("blurred picture");
    expect(o.summary).toContain("move it further away");
    expect(observationOf(def, viewOf(def, withScreen(15))).summary).toContain(
      "sharp, inverted picture",
    );
    expect(observationOf(def, viewOf(def, withScreen(10, at(convex, -5)))).summary).toContain(
      "faint patch",
    );
  });

  it("takes a phone as the object", () => {
    expect(lens.state.safeParse({ ...convex, objectStyle: LensObjectStyle.Phone }).success).toBe(
      true,
    );
  });
});

describe("lens: big enough to read on a phone", () => {
  const px = (x: number, h = 5) => {
    const st = { ...convex, object: { x, height: h } };
    const box = lensBox(st, 360);
    return box.toPixel(x, 0)[1] - box.toPixel(x, h)[1];
  };
  it("draws a 5 cm object at f = 10 tall on a 360 px stage, for every textbook place", () => {
    for (const x of [-30, -20, -15, -10, -5]) expect(px(x)).toBeGreaterThanOrEqual(30);
    expect(px(-20)).toBeGreaterThanOrEqual(36);
    expect(px(-5)).toBeGreaterThanOrEqual(36);
  });
  it("keeps the object, both 2F's and a real image inside the picture", () => {
    for (const x of [-30, -20, -15]) {
      const st = { ...convex, object: { x, height: 5 } };
      const w = lensWindowOf(st);
      const img = lensImageOf(st);
      expect(w.xMin).toBeLessThan(x);
      expect(w.xMin).toBeLessThan(-20);
      expect(w.xMax).toBeGreaterThan(Math.max(20, img?.v ?? 0));
    }
  });
  it("lets the object be dragged out to nearly 4f, whatever the window is now", () => {
    expect(leftmostObject(convex)).toBeCloseTo(-37, 9);
    expect(leftmostObject({ ...convex, span: 60 })).toBe(-56);
  });
});

describe("lens: names, centres and drawing it yourself", () => {
  it("names the arrows and hides the centres by default", () => {
    expect(lens.defaults.showNames).toBe(true);
    expect(lens.defaults.showCentres).toBe(false);
    expect(lens.defaults.canPickRays).toBe(false);
    expect(lens.defaults.markImage).toBe(false);
    expect(lens.defaults.mark).toBeNull();
  });

  it("switches rays on and off in a fixed order", () => {
    expect(toggled([LensRay.Centre], LensRay.Parallel)).toEqual([LensRay.Parallel, LensRay.Centre]);
    expect(toggled([LensRay.Parallel, LensRay.Centre], LensRay.Parallel)).toEqual([LensRay.Centre]);
    const next = run({ ...convex, rays: [], canPickRays: true }, LensAction.ToggleRay, {
      ray: LensRay.Focal,
    });
    expect(next.rays).toEqual([LensRay.Focal]);
  });

  it("knows when the marker is on the image's tip, and then draws the image", () => {
    // f = 10, u = −30: the tip is at (15, −2).
    const hidden = { ...convex, showImage: false, markImage: true };
    expect(markOnImageOf(hidden)).toBe(false);
    expect(isImageDrawn(hidden)).toBe(false);
    const near = run(hidden, LensAction.MoveMark, { x: 15.5, y: -2.5 });
    expect(markOnImageOf(near)).toBe(true);
    expect(def.derived?.[LensDerived.MarkOnImage]?.compute(near)).toBe(true);
    expect(isImageDrawn(near)).toBe(true);
    expect(observationOf(def, viewOf(def, near)).summary).toContain("real, inverted");
    const far = run(hidden, LensAction.MoveMark, { x: 13, y: -2 });
    expect(markOnImageOf(far)).toBe(false);
    expect(observationOf(def, viewOf(def, far)).summary).toContain("not drawn");
  });

  it("never counts the marker for an image at infinity", () => {
    expect(markOnImageOf({ ...at(convex, -10), mark: { x: 30, y: 0 } })).toBe(false);
  });
});

describe("lens: drawn as described", () => {
  it("draws every part it describes, each found on screen by its path", () => {
    const cases: LensState[] = [
      convex,
      at(concave, -30),
      { ...convex, showCentres: true, cover: LensCover.Top },
      { ...convex, screen: 15, canMoveScreen: true, showDistances: true },
      { ...convex, markImage: true, canPickRays: true, canSetFocal: true },
      { ...convex, beam: true },
    ];
    for (const s of cases) {
      const html = render(
        h(LensView, {
          view: viewOf(def, s),
          width: 340,
          locale: "en",
          call: () => undefined,
          signal: () => undefined,
        }),
      );
      const onScreen = partPaths(html);
      const seen = observationOf(def, viewOf(def, s)).elements.map((e) => e.id);
      for (const id of seen) expect(onScreen.has(id), id).toBe(true);
    }
  });

  it("names the spheres' centres C₁ and C₂ when it shows them", () => {
    const o = observationOf(def, viewOf(def, { ...convex, showCentres: true }));
    expect(o.elements.find((e) => e.id === "glass › c1")?.value).toContain("right face");
    expect(o.elements.find((e) => e.id === "glass › c2")?.value).toContain("left face");
  });
});
