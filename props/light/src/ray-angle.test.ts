import { asAnyProp, observationOf, viewOf } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import {
  AngleLabel,
  HATCH,
  RayAnglePart,
  type RayAngleState,
  anglesOf,
  figureOf,
  hits,
  overlaps,
  rayAngle,
} from "./ray-angle";

const def = asAnyProp(rayAngle);
const start: RayAngleState = { ...rayAngle.defaults };
const all: RayAngleState = {
  ...start,
  normalLabel: AngleLabel.Value,
  surfaceLabel: AngleLabel.Ask,
  reflectLabel: AngleLabel.Value,
  betweenLabel: AngleLabel.Ask,
};
const v = (s: RayAngleState) => viewOf(def, s) as ReturnType<typeof viewOf> & RayAngleState;

/** Every label inside the picture, clear of the rays, the normal, the mirror, the arcs and each other. */
function clashes(s: RayAngleState, width: number): string[] {
  const f = figureOf(s, width);
  const RAD = Math.PI / 180;
  const at = (r: number, d: number): [number, number] => [
    f.o[0] + r * Math.cos(d * RAD),
    f.o[1] + r * Math.sin(d * RAD),
  ];
  const lines: [[number, number], [number, number]][] = [
    [f.start, f.o],
    [f.o, f.normalTop],
    [
      [0, f.mirrorY],
      [width, f.mirrorY],
    ],
  ];
  if (s.showReflected) lines.push([f.o, f.end]);
  for (const a of f.arcs)
    for (let k = 0; k < 24; k++)
      lines.push([
        at(a.r, a.a0 + ((a.a1 - a.a0) * k) / 24),
        at(a.r, a.a0 + ((a.a1 - a.a0) * (k + 1)) / 24),
      ]);
  const out: string[] = [];
  f.arcs.forEach((a, k) => {
    const b = a.label;
    if (b.x < 0 || b.y < 0 || b.x + b.width > width || b.y + b.height > f.height)
      out.push(`${a.id} outside`);
    if (b.y + b.height > f.mirrorY) out.push(`${a.id} on the mirror`);
    for (const [p, q] of lines) if (hits(p, q, b, 0.5)) out.push(`${a.id} on a line`);
    for (const other of f.arcs.slice(k + 1))
      if (overlaps(b, other.label, 0)) out.push(`${a.id} on ${other.id}`);
  });
  return out;
}

describe("rayAngle: the figure", () => {
  it("marks i, 90° − i, i and 2i", () => {
    expect(anglesOf(30)).toEqual({
      normalAngle: 30,
      surfaceAngle: 60,
      reflectAngle: 30,
      betweenAngle: 60,
    });
  });

  it("keeps every label clear for every angle, label set and width", () => {
    const sets: Partial<RayAngleState>[] = [
      {},
      { surfaceLabel: AngleLabel.Ask },
      { normalLabel: null, surfaceLabel: AngleLabel.Value },
      { reflectLabel: AngleLabel.Ask },
      { betweenLabel: AngleLabel.Ask },
      { showReflected: false, surfaceLabel: AngleLabel.Value },
      {
        surfaceLabel: AngleLabel.Ask,
        reflectLabel: AngleLabel.Value,
        betweenLabel: AngleLabel.Ask,
      },
    ];
    const bad: string[] = [];
    for (const width of [300, 340, 420]) {
      for (const extra of sets) {
        for (let i = 1; i <= 89; i++) {
          const s = { ...start, ...extra, i };
          for (const c of clashes(s, width))
            bad.push(`w${width} i${i} ${JSON.stringify(extra)}: ${c}`);
        }
      }
    }
    expect(bad.slice(0, 10)).toEqual([]);
  });

  it("shows ? for an asked angle, the value otherwise", () => {
    const f = figureOf(all, 340);
    expect(f.arcs.map((a) => a.text)).toEqual(["30°", "30°", "?", "?"]);
  });

  it("drops the reflected ray's arcs when the reflected ray is hidden", () => {
    const f = figureOf({ ...all, showReflected: false }, 340);
    expect(f.arcs.map((a) => a.id)).toEqual([RayAnglePart.NormalAngle, RayAnglePart.SurfaceAngle]);
  });

  it("puts the mirror's hatching inside the picture", () => {
    const f = figureOf(start, 340);
    expect(f.mirrorY + HATCH).toBeLessThan(f.height);
    expect(f.height).toBe(170);
  });
});

describe("rayAngle: the prop", () => {
  it("has the textbook defaults and no actions", () => {
    expect(rayAngle.defaults).toMatchObject({
      i: 30,
      showReflected: true,
      normalLabel: "value",
      surfaceLabel: null,
      reflectLabel: null,
      betweenLabel: null,
    });
    expect(Object.keys(rayAngle.actions)).toEqual([]);
  });

  it("refuses an angle outside 1..89 or a fraction", () => {
    expect(rayAngle.state.safeParse({ ...start, i: 0 }).success).toBe(false);
    expect(rayAngle.state.safeParse({ ...start, i: 90 }).success).toBe(false);
    expect(rayAngle.state.safeParse({ ...start, i: 30.5 }).success).toBe(false);
  });

  it("says the marked angles and keeps the asked ones hidden", () => {
    const o = observationOf(def, v(all));
    expect(o.summary).toContain("the angle with the normal is 30°");
    expect(o.summary).toContain("the angle with the mirror is asked (?)");
    expect(o.hidden).toEqual({ surfaceAngle: 60, betweenAngle: 60 });
    expect(observationOf(def, v(start)).hidden).toBeUndefined();
  });

  it("lists and locates every part with tap targets at least 44 px", () => {
    const view = v(all);
    const parts = rayAngle.parts?.(view) ?? [];
    expect(parts).toEqual([
      "mirror",
      "normal",
      "incident",
      "reflected",
      "normalAngle",
      "reflectAngle",
      "surfaceAngle",
      "betweenAngle",
    ]);
    for (const part of parts) {
      const box = rayAngle.locate?.(view, part, 340);
      expect(box, part).toBeDefined();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
    expect(rayAngle.locate?.(v(start), "surfaceAngle", 340)).toBeUndefined();
  });
});
