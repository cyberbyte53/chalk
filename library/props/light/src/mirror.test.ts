import { describe, expect, it } from "vitest";
import {
  ImageCase,
  MirrorKind,
  type Setup,
  caseOf,
  crossings,
  imageOf,
  raysOf,
  smoothTimeOf,
} from "./mirror";

const concave = (u: number, h = 4.5): Setup => ({
  kind: MirrorKind.Concave,
  focalLength: 10,
  u,
  objectHeight: h,
});
const convex = (u: number, h = 4.5): Setup => ({ ...concave(u, h), kind: MirrorKind.Convex });

describe("the mirror formula, by hand (f = 10 cm)", () => {
  it("concave, object at 30 cm: v = −15 cm, m = −0.5 (real, inverted, diminished)", () => {
    const img = imageOf(concave(-30));
    expect(img?.v).toBeCloseTo(-15);
    expect(img?.m).toBeCloseTo(-0.5);
    expect(img?.isReal).toBe(true);
    expect(img?.isErect).toBe(false);
  });
  it("at C (20 cm) the image is at C, the same size, inverted", () => {
    const img = imageOf(concave(-20));
    expect(img?.v).toBeCloseTo(-20);
    expect(img?.m).toBeCloseTo(-1);
  });
  it("between C and F (15 cm): v = −30 cm, m = −2", () => {
    const img = imageOf(concave(-15));
    expect(img?.v).toBeCloseTo(-30);
    expect(img?.m).toBeCloseTo(-2);
  });
  it("at F the image is at infinity", () => {
    expect(imageOf(concave(-10))).toBeNull();
  });
  it("between F and P (5 cm): v = +10 cm behind, m = +2 (virtual, erect, enlarged)", () => {
    const img = imageOf(concave(-5));
    expect(img?.v).toBeCloseTo(10);
    expect(img?.m).toBeCloseTo(2);
    expect(img?.isReal).toBe(false);
    expect(img?.isErect).toBe(true);
  });
  it("convex, 30 cm: v = +7.5 cm, m = +0.25 (virtual, erect, diminished)", () => {
    const img = imageOf(convex(-30));
    expect(img?.v).toBeCloseTo(7.5);
    expect(img?.m).toBeCloseTo(0.25);
  });
  it("1/v + 1/u = 1/f and m = −v/u for every object, either mirror", () => {
    for (const make of [concave, convex])
      for (let d = 2; d <= 33; d += 0.7) {
        const s = make(-d);
        const img = imageOf(s);
        if (img === null) continue;
        const f = s.kind === MirrorKind.Concave ? -10 : 10;
        expect(1 / img.v + 1 / s.u).toBeCloseTo(1 / f, 9);
        expect(img.height / s.objectHeight).toBeCloseTo(-img.v / s.u, 9);
      }
  });
  it("a convex mirror's image is always virtual, erect, diminished, between P and F", () => {
    for (let d = 1; d <= 27; d += 0.5) {
      const img = imageOf(convex(-d));
      expect(img?.isReal).toBe(false);
      expect(img?.m).toBeGreaterThan(0);
      expect(img?.m).toBeLessThan(1);
      expect(img?.v).toBeLessThan(10);
    }
  });
});

describe("the textbook's cases", () => {
  it("each place, as the table names it", () => {
    expect(caseOf(concave(-30))).toBe(ImageCase.BeyondC);
    expect(caseOf(concave(-20))).toBe(ImageCase.AtC);
    expect(caseOf(concave(-20.2))).toBe(ImageCase.AtC);
    expect(caseOf(concave(-15))).toBe(ImageCase.BetweenCAndF);
    expect(caseOf(concave(-10))).toBe(ImageCase.AtF);
    expect(caseOf(concave(-5))).toBe(ImageCase.BetweenFAndP);
    expect(caseOf(convex(-30))).toBe(ImageCase.Convex);
  });
  it("the image's nature follows the case", () => {
    for (let d = 2; d <= 33; d += 0.37) {
      const s = concave(-d);
      const c = caseOf(s);
      const img = imageOf(s);
      if (img === null) continue;
      const m = Math.abs(img.m);
      if (c === ImageCase.BeyondC) expect(img.isReal && m < 1).toBe(true);
      if (c === ImageCase.BetweenCAndF) expect(img.isReal && m > 1).toBe(true);
      if (c === ImageCase.BetweenFAndP) expect(!img.isReal && img.isErect && m > 1).toBe(true);
      if (c === ImageCase.AtC) expect(m).toBeCloseTo(1, 1);
    }
  });
  it("gliding from 35 cm to 5 cm, the image passes every case in the table's order", () => {
    const passed = crossings(concave(-35), -35, -5);
    expect(passed.map((c) => c.to)).toEqual([
      ImageCase.AtC,
      ImageCase.BetweenCAndF,
      ImageCase.AtF,
      ImageCase.BetweenFAndP,
    ]);
    expect(passed.every((c, i) => i === 0 || c.share > (passed[i - 1]?.share ?? 0))).toBe(true);
    // Back out again, the other way round.
    expect(crossings(concave(-5), -5, -35).map((c) => c.to)).toEqual([
      ImageCase.AtF,
      ImageCase.BetweenCAndF,
      ImageCase.AtC,
      ImageCase.BeyondC,
    ]);
    expect(crossings(convex(-25), -25, -5)).toEqual([]);
  });
  it("a smooth move's moment for a share of its way: halfway is half the time", () => {
    expect(smoothTimeOf(0.5)).toBeCloseTo(0.5, 6);
    const t = smoothTimeOf(0.2);
    expect(t * t * (3 - 2 * t)).toBeCloseTo(0.2, 6);
  });
});

/** Where the line through a and b is at x. */
const yAt = (a: readonly [number, number], b: readonly [number, number], x: number) =>
  a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]);

describe("the rays, by their rules (on the plane through P)", () => {
  it("parallel, then through F: it reaches the real image's tip", () => {
    for (const d of [33, 30, 25, 20, 15, 13]) {
      const s = concave(-d);
      const img = imageOf(s);
      if (img === null) continue;
      // The rule's line: from (0, h) through F (−10, 0).
      expect(yAt([0, s.objectHeight], [-10, 0], img.v)).toBeCloseTo(img.height, 6);
    }
  });
  it("through C, back along itself: the tip and its image are on one line through C", () => {
    for (const d of [30, 25, 12, 8, 5]) {
      const s = concave(-d);
      const img = imageOf(s);
      if (img === null) continue;
      expect(yAt([s.u, s.objectHeight], [-20, 0], img.v)).toBeCloseTo(img.height, 6);
    }
  });
  it("to P, reflected at the same angle: it reaches the image's tip, real or virtual", () => {
    for (const make of [concave, convex])
      for (const d of [31, 25, 20, 15, 12, 8, 5]) {
        const s = make(-d);
        const img = imageOf(s);
        if (img === null) continue;
        // Reflected about the axis at P: the line from (0, 0) towards (u, −h).
        expect(yAt([0, 0], [s.u, -s.objectHeight], img.v)).toBeCloseTo(img.height, 6);
      }
  });
  it("each drawn ray meets the mirror within its height, wherever the object stands", () => {
    for (const make of [concave, convex])
      for (let d = 2; d <= 33; d += 0.25) {
        for (const r of raysOf(make(-d, 8.5))) expect(Math.abs(r.hit[1])).toBeLessThanOrEqual(13.5);
      }
  });
  it("a virtual image: the rays leave as if from it, drawn dashed back to it", () => {
    const s = concave(-5);
    const img = imageOf(s);
    for (const r of raysOf(s)) {
      expect(r.behind).toEqual([img?.v, img?.height]);
      expect(r.out[0]).toBeLessThan(0);
    }
  });
  it("at F both rays leave parallel: the image is at infinity", () => {
    const [a, b] = raysOf(concave(-10));
    const cross = (a?.out[0] ?? 0) * (b?.out[1] ?? 0) - (a?.out[1] ?? 0) * (b?.out[0] ?? 0);
    expect(cross).toBeCloseTo(0, 9);
  });
});
