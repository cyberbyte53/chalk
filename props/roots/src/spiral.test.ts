import { applyPatch, asAnyProp, viewOf } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { spiralLayout, spiralPoints } from "./geometry";
import { MAX_STEPS, RootSpiralSignal, type RootSpiralState, rootSpiral } from "./spiral";
import { isRefused, throughDoor } from "./test-door";

const def = asAnyProp(rootSpiral);

function spiral(steps: number, grow = 1): RootSpiralState {
  return { steps, grow };
}

function look(s: RootSpiralState): { lastSquared: number; lastText: string } {
  return viewOf(def, s) as unknown as { lastSquared: number; lastText: string };
}

describe("rootSpiral: the square-root spiral (Fig 1.9)", () => {
  it("OPk = √k for every point, by construction", () => {
    const points = spiralPoints(MAX_STEPS + 1);
    for (let k = 1; k <= MAX_STEPS + 1; k++) {
      const p = points[k] ?? { x: 0, y: 0 };
      expect(p.x * p.x + p.y * p.y).toBeCloseTo(k, 9);
    }
  });

  it("each leg is 1 long and perpendicular to OPk", () => {
    const points = spiralPoints(MAX_STEPS + 1);
    for (let k = 1; k <= MAX_STEPS; k++) {
      const p = points[k] ?? { x: 0, y: 0 };
      const q = points[k + 1] ?? { x: 0, y: 0 };
      const leg = { x: q.x - p.x, y: q.y - p.y };
      expect(Math.hypot(leg.x, leg.y)).toBeCloseTo(1, 9);
      expect(leg.x * p.x + leg.y * p.y).toBeCloseTo(0, 9);
    }
  });

  it("starts with OP1 = 1 along the line and turns anticlockwise", () => {
    const [o, p1, p2] = spiralPoints(2);
    expect(o).toEqual({ x: 0, y: 0 });
    expect(p1).toEqual({ x: 1, y: 0 });
    expect(p2?.x).toBeCloseTo(1, 9);
    expect(p2?.y).toBeCloseTo(1, 9);
  });

  it("names the newest hypotenuse: √2, √3, 2, √5 … 3 … 4, √17", () => {
    expect(look(spiral(1)).lastText).toBe("√2");
    expect(look(spiral(2)).lastText).toBe("√3");
    expect(look(spiral(3)).lastText).toBe("2");
    expect(look(spiral(4)).lastText).toBe("√5");
    expect(look(spiral(8)).lastText).toBe("3");
    expect(look(spiral(15)).lastText).toBe("4");
    expect(look(spiral(16)).lastText).toBe("√17");
    expect(look(spiral(16)).lastSquared).toBe(17);
  });
});

describe("rootSpiral: actions", () => {
  it("addStep draws one more triangle through the one door at every frame, then says so", async () => {
    const run = await throughDoor(def, spiral(2), "addStep");
    expect(run.frames[0]).toEqual({ steps: 3, grow: 0 });
    expect(run.frames.length).toBeGreaterThan(50);
    for (const f of run.frames) expect(f.steps).toBe(3);
    expect(run.state).toEqual({ steps: 3, grow: 1 });
    expect(run.emit).toEqual([{ signal: RootSpiralSignal.Grown, payload: { squared: 4 } }]);
  });

  it("addStep stops drawing if the spiral is changed meanwhile", async () => {
    const run = await throughDoor(
      def,
      spiral(2),
      "addStep",
      {},
      {
        atWait: 10,
        patch: { steps: 5, grow: 1 },
      },
    );
    expect(run.state).toEqual({ steps: 5, grow: 1 });
    expect(run.emit).toEqual([]);
  });

  it("addStep is refused at 16 triangles", () => {
    expect(isRefused(def, spiral(MAX_STEPS), "addStep")).toBe(true);
  });

  it("removeStep takes one away but never the first", async () => {
    expect((await throughDoor(def, spiral(4, 0.3), "removeStep")).state).toEqual(spiral(3));
    expect((await throughDoor(def, spiral(1), "removeStep")).state).toEqual(spiral(1));
  });

  it("showSteps and startAgain draw at once", async () => {
    expect((await throughDoor(def, spiral(1), "showSteps", { steps: 8 })).state).toEqual(spiral(8));
    expect((await throughDoor(def, spiral(8, 0.5), "startAgain")).state).toEqual(spiral(1));
    expect(isRefused(def, spiral(1), "showSteps", { steps: 17 })).toBe(true);
    expect(isRefused(def, spiral(1), "showSteps", { steps: 0 })).toBe(true);
  });

  it("refuses states that break its rules", () => {
    for (const patch of [
      { steps: 0 },
      { steps: 17 },
      { steps: 2.5 },
      { grow: -0.1 },
      { grow: 2 },
    ]) {
      expect(applyPatch(def, rootSpiral.defaults, patch).isOk).toBe(false);
    }
  });
});

describe("rootSpiral: parts and layout", () => {
  it("lists every hypotenuse and leg", () => {
    const parts = rootSpiral.parts?.(viewOf(def, spiral(3)) as never) ?? [];
    expect(parts).toEqual([
      "centre",
      "hypotenuse:1",
      "hypotenuse:2",
      "hypotenuse:3",
      "hypotenuse:4",
      "leg:1",
      "leg:2",
      "leg:3",
    ]);
  });

  it("fits the width at every size, and locates parts inside the figure", () => {
    for (let steps = 1; steps <= MAX_STEPS; steps++) {
      const layout = spiralLayout(steps, 340);
      for (const p of spiralPoints(steps + 1).map(layout.px)) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(340);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThanOrEqual(layout.height);
      }
      expect(layout.height).toBeLessThanOrEqual(340);
    }
    const box = rootSpiral.locate?.(viewOf(def, spiral(4)) as never, "leg:4", 340);
    expect(box).toBeDefined();
    expect(rootSpiral.locate?.(viewOf(def, spiral(4)) as never, "leg:5", 340)).toBeUndefined();
  });
});
