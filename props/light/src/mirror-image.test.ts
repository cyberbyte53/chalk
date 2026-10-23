import {
  EffectKind,
  applyPatch,
  asAnyProp,
  observationOf,
  prepareAction,
  viewOf,
} from "@chalk/prop";
import { describe, expect, it } from "vitest";
import {
  EYE_R,
  MIRROR,
  MirrorImageAction,
  MirrorImageDerived,
  MirrorImagePart,
  type MirrorImageState,
  anglesOf,
  boxOf,
  mirrorImage,
  raysOf,
} from "./mirror-image";

const def = asAnyProp(mirrorImage);
const start: MirrorImageState = { ...mirrorImage.defaults };

function run(state: MirrorImageState, name: string, args: Record<string, unknown> = {}) {
  const result = prepareAction(def, state, name, args);
  if (!result.isOk) throw new Error(result.errors.join("; "));
  if (result.effect.kind !== EffectKind.Set) throw new Error(`${name} should be instant`);
  const next = applyPatch(def, state, result.effect.set);
  if (!next.isOk) throw new Error(next.errors.join("; "));
  return next.state as MirrorImageState;
}

describe("mirror image: the rays obey the law of reflection", () => {
  it("draws as many rays as asked, all from the object's tip to the mirror to the eye", () => {
    for (const n of [0, 1, 2, 3]) {
      const rays = raysOf({ ...start, rays: n });
      expect(rays).toHaveLength(n);
      for (const ray of rays) {
        expect(ray.from).toEqual([-start.distance, start.height]);
        expect(ray.hit[0]).toBe(0);
        expect(ray.to[0]).toBeCloseTo(-start.eye.x + 0.6 * EYE_R, 9);
      }
    }
  });

  it("makes the angle of incidence equal the angle of reflection for every ray", () => {
    const cases: MirrorImageState[] = [
      start,
      { ...start, distance: 4, height: 12, eye: { x: 36, y: 0 }, rays: 3 },
      { ...start, distance: 20, height: 2, eye: { x: 4, y: 20 }, rays: 3 },
      { ...start, distance: 12.5, eye: { x: 22.5, y: 6 }, rays: 1 },
    ];
    for (const s of cases) {
      for (const ray of raysOf(s)) {
        const { incidence, reflection } = anglesOf(ray);
        expect(reflection).toBeCloseTo(incidence, 9);
        // The ray keeps going the same way up or down: reflection flips only the across part.
        const upIn = Math.sign(ray.hit[1] - ray.from[1]);
        const upOut = Math.sign(ray.to[1] - ray.hit[1]);
        if (upIn !== 0 && upOut !== 0) expect(upOut).toBe(upIn);
      }
    }
  });

  it("puts the image's tip where the extensions meet: as far behind as the object is in front", () => {
    const s = { ...start, distance: 12, height: 5, rays: 3 };
    for (const ray of raysOf(s)) {
      expect(ray.image).toEqual([12, 5]);
      // The extension continues the reflected ray straight back through the mirror.
      const [hx, hy] = ray.hit;
      const slopeOut = (ray.to[1] - hy) / (ray.to[0] - hx);
      const slopeExt = (ray.image[1] - hy) / (ray.image[0] - hx);
      expect(slopeExt).toBeCloseTo(slopeOut, 9);
    }
  });

  it("leaves out a ray that would land off the mirror", () => {
    // Every ray that is drawn meets the mirror within its height.
    const s = { ...start, height: 12, eye: { x: 4, y: 20 }, distance: 20, rays: 3 };
    for (const ray of raysOf(s)) {
      expect(ray.hit[1]).toBeGreaterThanOrEqual(MIRROR.bottom);
      expect(ray.hit[1]).toBeLessThanOrEqual(MIRROR.top);
    }
  });
});

describe("mirror image: actions and derived values", () => {
  it("moves the object, and the image distance follows", () => {
    const next = run(start, MirrorImageAction.MoveObject, { distance: 18 });
    const v = viewOf(def, next);
    expect(v[MirrorImageDerived.ObjectDistance]).toBe(18);
    expect(v[MirrorImageDerived.ImageDistance]).toBe(18);
    expect(v[MirrorImageDerived.ImageHeight]).toBe(start.height);
  });

  it("moves the eye", () => {
    expect(run(start, MirrorImageAction.MoveEye, { x: 35, y: 2 }).eye).toEqual({ x: 35, y: 2 });
  });

  it("refuses distances and eye positions out of range", () => {
    expect(prepareAction(def, start, MirrorImageAction.MoveObject, { distance: 3 }).isOk).toBe(
      false,
    );
    expect(prepareAction(def, start, MirrorImageAction.MoveObject, { distance: 21 }).isOk).toBe(
      false,
    );
    expect(prepareAction(def, start, MirrorImageAction.MoveEye, { x: 40, y: 0 }).isOk).toBe(false);
    expect(prepareAction(def, start, MirrorImageAction.MoveEye, { x: 10, y: 25 }).isOk).toBe(false);
  });

  it("keeps the two rays clearly apart where they reach the mirror", () => {
    const [a, b] = raysOf(start);
    expect(a && b).toBeTruthy();
    if (a === undefined || b === undefined) return;
    // At least 1.5 cm apart on the mirror, and 4 cm apart at the eye.
    expect(Math.abs(a.hit[1] - b.hit[1])).toBeGreaterThan(1.5);
    expect(Math.abs(a.to[1] - b.to[1])).toBeGreaterThanOrEqual(4.8);
  });

  it("lets the learner move both the object and the eye", () => {
    expect(def.actions[MirrorImageAction.MoveObject]?.byLearner).toBe(true);
    expect(def.actions[MirrorImageAction.MoveEye]?.byLearner).toBe(true);
  });
});

describe("mirror image: what it says", () => {
  it("describes the image in the summary", () => {
    const o = observationOf(def, start);
    expect(o.summary).toContain("15 cm in front of a plane mirror");
    expect(o.summary).toContain("15 cm behind, the same size, erect");
    expect(o.summary).toContain("2 rays reach the eye, their extensions meet at the image");
    expect(o.elements.map((e) => e.id)).toContain(MirrorImagePart.Image);
  });

  it("hides the image when it isn't drawn, but keeps it for the checker", () => {
    const o = observationOf(def, { ...start, showImage: false });
    expect(o.summary).toContain("the image is not drawn");
    expect(o.summary).not.toContain("behind");
    expect(o.elements.map((e) => e.id)).not.toContain(MirrorImagePart.Image);
    expect(o.hidden).toEqual({ image: { distance: 15, height: 8 } });
  });

  it("names every part it draws, and can point at each", () => {
    const parts = def.parts?.(start) ?? [];
    expect(parts).toEqual(["mirror", "object", "eye", "ray:0", "ray:1", "image"]);
    const withPaper = { ...start, showPaper: true };
    expect(def.parts?.(withPaper)).toContain(MirrorImagePart.Paper);
    expect(def.locate?.(withPaper, MirrorImagePart.Paper, 600)).toBeDefined();
    expect(observationOf(def, withPaper).elements.map((e) => e.id)).toContain(
      MirrorImagePart.Paper,
    );
    for (const part of parts) expect(def.locate?.(start, part, 600)).toBeDefined();
    expect(
      def.locate?.({ ...start, showImage: false }, MirrorImagePart.Image, 600),
    ).toBeUndefined();
  });

  it("keeps the same scale wherever the object stands", () => {
    const box = boxOf(600);
    const [x0] = box.toPixel(0, 0);
    const [x1] = box.toPixel(10, 0);
    expect(x1 - x0).toBeCloseTo(10 * box.scale, 9);
    // The image at its farthest and the eye at its farthest both fit.
    expect(box.toPixel(20 + 2, 0)[0]).toBeLessThan(600);
    expect(box.toPixel(-36 - EYE_R, 0)[0]).toBeGreaterThan(0);
    // The object at its default size is a quarter of the stage's height.
    const [, foot] = box.toPixel(-15, 0);
    const [, tip] = box.toPixel(-15, 8);
    expect((foot - tip) / box.height).toBeGreaterThanOrEqual(0.25);
  });
});
