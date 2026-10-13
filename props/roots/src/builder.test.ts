import { applyPatch, asAnyProp, viewOf } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import {
  MAX_LANDED,
  RootBuilderSignal,
  type RootBuilderState,
  basePoints,
  maxHeightAt,
  rootBuilder,
} from "./builder";
import { builderLayout, swingTip } from "./geometry";
import { isRefused, throughDoor } from "./test-door";

const def = asAnyProp(rootBuilder);

type View = RootBuilderState & {
  hypotenuseSquared: number;
  hypotenuseText: string;
  baseText: string;
  landsAt: number;
  isWhole: boolean;
  hasLanded: boolean;
  canSwing: boolean;
  maxHeight: number;
};

function look(s: RootBuilderState): View {
  return viewOf(def, s) as unknown as View;
}

function builder(patch: Partial<RootBuilderState> = {}): RootBuilderState {
  const result = applyPatch(def, rootBuilder.defaults, patch);
  if (!result.isOk) throw new Error(result.errors.join("; "));
  return result.state as RootBuilderState;
}

/** Instant action, then the state after. */
async function afterAction(
  s: RootBuilderState,
  name: string,
  args: Record<string, unknown> = {},
): Promise<RootBuilderState> {
  return (await throughDoor(def, s, name, args)).state;
}

describe("rootBuilder: hypotenuses known by hand", () => {
  it("a unit square's diagonal: base 1, height 1 gives √2 (Fig 1.6)", () => {
    const v = look(builder({ base: 1, height: 1 }));
    expect(v.hypotenuseSquared).toBe(2);
    expect(v.hypotenuseText).toBe("√2");
    expect(v.baseText).toBe("1");
    expect(v.isWhole).toBe(false);
    expect(v.landsAt).toBeCloseTo(1.41421356, 7);
  });

  it("√3 stands on √2 with a unit perpendicular (Fig 1.8)", () => {
    const v = look(builder({ base: 2, height: 1, landed: [2] }));
    expect(v.baseText).toBe("√2");
    expect(v.hypotenuseSquared).toBe(3);
    expect(v.hypotenuseText).toBe("√3");
  });

  it("√5 two ways: legs 2 and 1, or legs 1 and 2", () => {
    expect(look(builder({ base: 4, height: 1 })).hypotenuseText).toBe("√5");
    expect(look(builder({ base: 1, height: 2 })).hypotenuseText).toBe("√5");
  });

  it("perfect squares land on whole numbers: √(3 + 1) = 2, √(4 + 0)… and √8 stays √8", () => {
    const two = look(builder({ base: 3, height: 1, landed: [3] }));
    expect(two.hypotenuseText).toBe("2");
    expect(two.isWhole).toBe(true);
    expect(two.landsAt).toBe(2);
    expect(look(builder({ base: 4, height: 2 })).hypotenuseText).toBe("√8");
    expect(look(builder({ base: 4, height: 0 })).hypotenuseText).toBe("2");
  });

  it("legs a and b give √(a² + b²) for every triangle that fits (by Pythagoras, in integers)", () => {
    for (let k = 1; k <= 8; k++) {
      for (let h = 0; h <= 5; h++) {
        if (k * k + h * h > 64) continue;
        const v = look(builder({ base: k * k, height: h, maxValue: 8 }));
        expect(v.hypotenuseSquared).toBe(k * k + h * h);
        // The drawn tip, before the swing, is at (k, h); after it, on the line at √(k² + h²).
        const tip = swingTip(k, h, 0);
        expect(tip.x).toBeCloseTo(k, 9);
        expect(tip.y).toBeCloseTo(h, 9);
        const down = swingTip(k, h, 1);
        expect(down.x * down.x).toBeCloseTo(k * k + h * h, 9);
        expect(down.y).toBeCloseTo(0, 9);
      }
    }
  });

  it("the compass keeps the length while it swings", () => {
    for (let i = 0; i <= 20; i++) {
      const tip = swingTip(2, 1, i / 20);
      expect(tip.x * tip.x + tip.y * tip.y).toBeCloseTo(5, 9);
    }
  });
});

describe("rootBuilder: actions", () => {
  it("setBase moves along points on the line and resets the swing", async () => {
    const s = await afterAction(builder({ base: 1, height: 1, swing: 1, landed: [2] }), "setBase", {
      n: 2,
    });
    expect(s.base).toBe(2);
    expect(s.swing).toBe(0);
    expect(s.height).toBe(1);
    expect(s.landed).toEqual([2]);
  });

  it("setBase lowers the height when the triangle would no longer fit", async () => {
    const s = await afterAction(builder({ base: 1, height: 2 }), "setBase", { n: 9 });
    expect(s.base).toBe(9);
    expect(s.height).toBe(0);
  });

  it("setBase refuses points that aren't on the line yet, or past its end", () => {
    expect(isRefused(def, builder(), "setBase", { n: 2 })).toBe(true);
    expect(isRefused(def, builder(), "setBase", { n: 16 })).toBe(true);
    expect(isRefused(def, builder(), "setBase", { n: 1.5 })).toBe(true);
    expect(isRefused(def, builder(), "setBase", { n: 4 })).toBe(false);
  });

  it("setHeight snaps to whole units, resets the swing, and refuses what wouldn't fit", async () => {
    const s = await afterAction(builder({ swing: 1, landed: [2] }), "setHeight", { h: 2 });
    expect(s.height).toBe(2);
    expect(s.swing).toBe(0);
    expect(s.landed).toEqual([2]);
    expect(isRefused(def, builder(), "setHeight", { h: 3 })).toBe(true); // 1 + 9 > 9
    expect(isRefused(def, builder(), "setHeight", { h: 1.5 })).toBe(true);
    expect(isRefused(def, builder({ maxValue: 6 }), "setHeight", { h: 5 })).toBe(false);
  });

  it("swing glides through the one door at every frame, then lands √2 and says so", async () => {
    const run = await throughDoor(def, builder({ base: 1, height: 1 }), "swing");
    expect(run.frames.length).toBeGreaterThan(60);
    const swings = run.frames.map((f) => f.swing);
    for (let i = 1; i < swings.length; i++) {
      expect(swings[i]).toBeGreaterThanOrEqual(swings[i - 1] ?? 0);
    }
    expect(run.state.swing).toBe(1);
    expect(run.state.landed).toEqual([2]);
    expect(run.emit).toEqual([
      { signal: RootBuilderSignal.Landed, payload: { squared: 2, isWhole: false } },
    ]);
    expect(look(run.state).hasLanded).toBe(true);
    expect(look(run.state).canSwing).toBe(false);
  });

  it("swing with over 0 lands at once; a perfect square lands as whole", async () => {
    const run = await throughDoor(def, builder({ base: 3, height: 1, landed: [3] }), "swing", {
      over: 0,
    });
    expect(run.state.landed).toEqual([3, 4]);
    expect(run.emit[0]?.payload).toEqual({ squared: 4, isWhole: true });
  });

  it("swing stops if the learner changes the triangle meanwhile (the learner wins)", async () => {
    const run = await throughDoor(
      def,
      builder({ base: 1, height: 1 }),
      "swing",
      {},
      {
        atWait: 20,
        patch: { height: 2, swing: 0 },
      },
    );
    expect(run.state.height).toBe(2);
    expect(run.state.swing).toBe(0);
    expect(run.state.landed).toEqual([]);
    expect(run.emit).toEqual([]);
  });

  it("swing is refused with no perpendicular, and does nothing once landed", async () => {
    expect(isRefused(def, builder({ height: 0 }), "swing")).toBe(true);
    const landed = builder({ swing: 1, landed: [2] });
    const run = await throughDoor(def, landed, "swing");
    expect(run.state).toEqual(landed);
    expect(run.emit).toEqual([]);
  });

  it("builds √2, then √3, then 2 by buildOn (Fig 1.8), each standing on the last", async () => {
    let s = builder({ base: 1, height: 1 });
    for (const expected of [2, 3, 4]) {
      s = (await throughDoor(def, s, "swing", { over: 0 })).state;
      expect(s.landed.at(-1)).toBe(expected);
      s = await afterAction(s, "buildOn");
      expect(s.base).toBe(expected);
      expect(s.height).toBe(0);
      s = await afterAction(s, "setHeight", { h: 1 });
    }
    expect(s.landed).toEqual([2, 3, 4]);
    expect(look(s).hypotenuseText).toBe("√5");
  });

  it("buildOn is refused when nothing has landed", () => {
    expect(isRefused(def, builder(), "buildOn")).toBe(true);
  });

  it("clearLanded empties the line and brings a base on √n back to a whole number", async () => {
    const s = await afterAction(builder({ base: 3, height: 1, landed: [2, 3] }), "clearLanded");
    expect(s.landed).toEqual([]);
    expect(s.base).toBe(1);
    expect(s.height).toBe(1);
    expect(s.swing).toBe(0);
  });

  it("startAgain goes back to a base of 1, no perpendicular, nothing landed; keeps the line", async () => {
    const s = await afterAction(
      builder({ base: 4, height: 2, landed: [5, 8], maxValue: 6 }),
      "startAgain",
    );
    expect(s).toEqual({ base: 1, height: 0, swing: 0, landed: [], maxValue: 6 });
  });

  it("keeps at most 10 landed points, dropping the oldest but never the base", async () => {
    let s = builder({
      maxValue: 8,
      base: 2,
      height: 0,
      landed: [3, 2, 5, 6, 7, 8, 10, 11, 12, 13],
    });
    expect(s.landed.length).toBe(MAX_LANDED);
    // Base √2 with height 5 lands √27, pushing out the oldest that isn't the base.
    s = await afterAction(s, "setHeight", { h: 5 });
    s = (await throughDoor(def, s, "swing", { over: 0 })).state;
    expect(s.landed.length).toBe(MAX_LANDED);
    expect(s.landed).toContain(2);
    expect(s.landed.at(-1)).toBe(27);
  });
});

describe("rootBuilder: snapping and rules", () => {
  it("the base snaps to whole numbers and landed √n, in order along the line", () => {
    expect(basePoints(builder({ landed: [2, 5] }))).toEqual([1, 2, 4, 5, 9]);
    expect(basePoints(builder({ maxValue: 2 }))).toEqual([1, 4]);
  });

  it("the tallest perpendicular is the one that still lands on the line", () => {
    expect(maxHeightAt(1, 3)).toBe(2);
    expect(maxHeightAt(4, 3)).toBe(2);
    expect(maxHeightAt(9, 3)).toBe(0);
    expect(maxHeightAt(1, 8)).toBe(5);
  });

  it("refuses states that break its rules", () => {
    const bad: Partial<RootBuilderState>[] = [
      { base: 2 }, // √2 hasn't landed
      { base: 0 },
      { height: 6 },
      { height: 3 }, // 1 + 9 > 3²
      { swing: 1.2 },
      { height: 0, swing: 0.5 },
      { swing: 1 }, // finished but √2 not landed
      { landed: [2, 2] },
      { landed: [1] },
      { landed: [10] }, // past the end of a line to 3
      { maxValue: 9 },
      { maxValue: 1 },
    ];
    for (const patch of bad) expect(applyPatch(def, rootBuilder.defaults, patch).isOk).toBe(false);
  });
});

describe("rootBuilder: parts", () => {
  const partsOf = (s: RootBuilderState) => rootBuilder.parts?.(look(s)) ?? [];

  it("lists parts that come and go with the state", () => {
    expect(partsOf(builder())).toEqual(
      expect.arrayContaining(["zero", "base", "perpendicular", "hypotenuse", "tick:3"]),
    );
    expect(partsOf(builder({ height: 0 }))).not.toContain("hypotenuse");
    expect(partsOf(builder())).not.toContain("arc");
    expect(partsOf(builder({ swing: 1, landed: [2] }))).toEqual(
      expect.arrayContaining(["arc", "landed:2"]),
    );
  });

  it("locates parts where the view draws them", () => {
    const s = builder({ base: 4, height: 1, maxValue: 3 });
    const layout = builderLayout(3, 360);
    const box = rootBuilder.locate?.(look(s), "baseHandle", 360);
    expect(box).toBeDefined();
    if (box === undefined) return;
    expect(box.x + box.width / 2).toBeCloseTo(layout.originX + 2 * layout.unit, 6);
    expect(box.y + box.height / 2).toBeCloseTo(layout.axisY, 6);
    expect(rootBuilder.locate?.(look(s), "landed:5", 360)).toBeUndefined();
    expect(rootBuilder.locate?.(look(s), "tick:3", 360)).toBeDefined();
  });

  it("fits a line to 3 on a 360 px phone with big units", () => {
    const layout = builderLayout(3, 360);
    expect(layout.unit).toBeGreaterThanOrEqual(90);
    expect(layout.originX + 3 * layout.unit).toBeLessThanOrEqual(360);
  });
});
