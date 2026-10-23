import { applyPatch, asAnyProp, viewOf } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import {
  semicircleDragLimit,
  semicircleFigure,
  semicircleLayout,
  semicirclePx,
  swungD,
} from "./geometry";
import {
  RootSemicircleSignal,
  type RootSemicircleState,
  proofTexts,
  rootSemicircle,
} from "./semicircle";
import { isRefused, throughDoor } from "./test-door";

const def = asAnyProp(rootSemicircle);

type View = RootSemicircleState & {
  bd: number;
  bdSquared: number;
  isWhole: boolean;
  xText: string;
  bdText: string;
  od: number;
  ob: number;
  hasLanded: boolean;
};

function semi(patch: Partial<RootSemicircleState> = {}): RootSemicircleState {
  return { ...rootSemicircle.defaults, ...patch };
}

function look(s: RootSemicircleState): View {
  return viewOf(def, s) as unknown as View;
}

/** Every x the prop allows: 0.5 to 12 in tenths. */
const ALL_X = Array.from({ length: 116 }, (_, i) => (i + 5) / 10);

describe("rootSemicircle: BD = √x (Fig 1.15–1.17)", () => {
  it("BD² = x for every x, from the circle the view draws", () => {
    for (const x of ALL_X) {
      const f = semicircleFigure(x);
      // D is on the circle and straight above B.
      expect(Math.hypot(f.d.x - f.o, f.d.y)).toBeCloseTo(f.radius, 9);
      expect(f.d.x).toBe(f.b);
      expect(Math.abs(f.d.y * f.d.y - x)).toBeLessThan(1e-9);
      // OD = (x + 1)/2 and OB = (x − 1)/2, as the proof says.
      expect(f.radius).toBeCloseTo((x + 1) / 2, 12);
      expect(Math.abs(f.b - f.o)).toBeCloseTo(Math.abs(x - 1) / 2, 12);
    }
  });

  it("by hand: x = 9 gives BD = 3, x = 3.5 gives √3.5 with OD = 2.25, OB = 1.25", () => {
    const nine = look(semi({ x: 9 }));
    expect(nine.bdText).toBe("3");
    expect(nine.isWhole).toBe(true);
    expect(nine.bd).toBe(3);
    const v = look(semi({ x: 3.5 }));
    expect(v.bdText).toBe("√3.5");
    expect(v.xText).toBe("3.5");
    expect(v.isWhole).toBe(false);
    expect(v.od).toBe(2.25);
    expect(v.ob).toBe(1.25);
    expect(v.od * v.od - v.ob * v.ob).toBe(3.5);
    expect(proofTexts(3.5)).toEqual({ od: "2.25", ob: "1.25", x: "3.5" });
    expect(proofTexts(9.3)).toEqual({ od: "5.15", ob: "4.15", x: "9.3" });
    expect(proofTexts(0.5)).toEqual({ od: "0.75", ob: "0.25", x: "0.5" });
  });

  it("only whole perfect squares have whole roots: 1, 4, 9 and none of the tenths between", () => {
    const whole = ALL_X.filter((x) => look(semi({ x })).isWhole);
    expect(whole).toEqual([1, 4, 9]);
    expect(look(semi({ x: 2.5 })).bdText).toBe("√2.5");
    expect(look(semi({ x: 12 })).bdText).toBe("√12");
  });

  it("OD² − OB² = x exactly, in hundredths", () => {
    for (const x of ALL_X) {
      const t = Math.round(x * 10);
      const od = (t + 10) * 5;
      const ob = (t - 10) * 5;
      expect(od * od - ob * ob).toBe(t * 1000);
    }
  });

  it("the swing keeps BD's length and lands at E = B + √x", () => {
    const f = semicircleFigure(5);
    for (let i = 0; i <= 20; i++) {
      const p = swungD(f, i / 20);
      expect(Math.hypot(p.x - f.b, p.y)).toBeCloseTo(f.bd, 9);
    }
    const down = swungD(f, 1);
    expect(down.x).toBeCloseTo(f.e, 9);
    expect(down.y).toBeCloseTo(0, 9);
    expect((f.e - f.b) ** 2).toBeCloseTo(5, 9);
  });
});

describe("rootSemicircle: actions", () => {
  it("setX snaps to tenths and resets the swing; keeps the proof", async () => {
    const run = await throughDoor(def, semi({ swing: 1, isProofShown: true }), "setX", {
      x: 9.27,
    });
    expect(run.state).toEqual({ x: 9.3, swing: 0, isProofShown: true });
  });

  it("setX refuses x outside 0.5 to 12", () => {
    expect(isRefused(def, semi(), "setX", { x: 0.4 })).toBe(true);
    expect(isRefused(def, semi(), "setX", { x: 12.1 })).toBe(true);
    expect(isRefused(def, semi(), "setX", { x: 12 })).toBe(false);
  });

  it("showProof shows and hides, keeping x and the swing", async () => {
    const shown = await throughDoor(def, semi({ swing: 1 }), "showProof", { isShown: true });
    expect(shown.state).toEqual({ x: 3.5, swing: 1, isProofShown: true });
  });

  it("swing glides through the one door at every frame and lands at E", async () => {
    const run = await throughDoor(def, semi({ x: 9.3 }), "swing");
    expect(run.frames.length).toBeGreaterThan(60);
    expect(run.state.swing).toBe(1);
    expect(look(run.state).hasLanded).toBe(true);
    expect(run.emit).toEqual([{ signal: RootSemicircleSignal.Landed, payload: { x: 9.3 } }]);
    const instant = await throughDoor(def, semi(), "swing", { over: 0 });
    expect(instant.state.swing).toBe(1);
    expect(instant.emit.length).toBe(1);
  });

  it("swing stops if the learner moves A meanwhile, and does nothing once landed", async () => {
    const run = await throughDoor(
      def,
      semi(),
      "swing",
      {},
      { atWait: 5, patch: { x: 2, swing: 0 } },
    );
    expect(run.state).toEqual({ x: 2, swing: 0, isProofShown: false });
    expect(run.emit).toEqual([]);
    const done = await throughDoor(def, semi({ swing: 1 }), "swing");
    expect(done.emit).toEqual([]);
  });

  it("startAgain folds the swing and proof away, keeping x", async () => {
    const run = await throughDoor(def, semi({ x: 7, swing: 1, isProofShown: true }), "startAgain");
    expect(run.state).toEqual({ x: 7, swing: 0, isProofShown: false });
  });

  it("refuses states that break its rules", () => {
    for (const patch of [{ x: 0.4 }, { x: 12.5 }, { x: 3.55 }, { swing: 1.5 }, { swing: -1 }]) {
      expect(applyPatch(def, rootSemicircle.defaults, patch).isOk).toBe(false);
    }
  });
});

describe("rootSemicircle: parts and layout", () => {
  it("lists parts that come and go", () => {
    const partsOf = (s: RootSemicircleState) => rootSemicircle.parts?.(look(s)) ?? [];
    expect(partsOf(semi())).not.toContain("o");
    expect(partsOf(semi())).not.toContain("e");
    expect(partsOf(semi({ isProofShown: true, swing: 1 }))).toEqual(
      expect.arrayContaining(["o", "e", "d", "bd", "semicircle", "xSegment", "unitSegment"]),
    );
  });

  it("fits every x inside the width, with a constant height", () => {
    const heights = new Set<number>();
    for (const x of ALL_X) {
      const layout = semicircleLayout(x, 340);
      heights.add(Math.round(layout.height));
      const f = semicircleFigure(x);
      const a = semicirclePx(layout, x, { x: f.a, y: 0 });
      const e = semicirclePx(layout, x, { x: f.e, y: 0 });
      const top = semicirclePx(layout, x, { x: f.o, y: f.radius });
      expect(a.x).toBeGreaterThanOrEqual(0);
      expect(e.x).toBeLessThanOrEqual(340);
      expect(top.y).toBeGreaterThanOrEqual(0);
      expect(semicircleDragLimit(layout)).toBeGreaterThanOrEqual(Math.min(x, 12) - 1e-9);
    }
    expect(heights.size).toBe(1);
  });

  it("locates D straight above B", () => {
    const s = semi({ x: 4 });
    const b = rootSemicircle.locate?.(look(s), "b", 340);
    const d = rootSemicircle.locate?.(look(s), "d", 340);
    expect(b && d && Math.abs(b.x - d.x)).toBeLessThan(1e-9);
    expect(rootSemicircle.locate?.(look(s), "e", 340)).toBeUndefined();
  });
});
