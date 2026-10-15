import {
  EffectKind,
  type Emit,
  type TaskContext,
  applyPatch,
  asAnyProp,
  prepareAction,
  viewOf,
} from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { type NumberLineState, numberLine, splitPoints } from "./model";
import { magnifyTarget, tickStep, ticks, zoomFrame } from "./scale";

const def = asAnyProp(numberLine);
const start: NumberLineState = {
  ...numberLine.defaults,
  from: 1,
  to: 2,
  marker: 1.414,
  showMarker: true,
};

function effect(state: NumberLineState, name: string, args: Record<string, unknown> = {}) {
  const result = prepareAction(def, state, name, args);
  if (!result.isOk) throw new Error(result.errors.join("; "));
  return result.effect;
}

function run(state: NumberLineState, name: string, args: Record<string, unknown> = {}) {
  const e = effect(state, name, args);
  if (e.kind !== EffectKind.Set) throw new Error(`${name} should be instant`);
  const next = applyPatch(def, state, e.set);
  if (!next.isOk) throw new Error(next.errors.join("; "));
  return { state: next.state as NumberLineState, emit: e.emit };
}

/** Plays a task to the end, every change through the one door; returns the states and signals. */
async function play(state: NumberLineState, name: string, args: Record<string, unknown> = {}) {
  const e = effect(state, name, args);
  if (e.kind !== EffectKind.Task) throw new Error(`${name} should take time`);
  let now = state;
  const frames: NumberLineState[] = [];
  const emitted: Emit[] = [];
  const context: TaskContext<NumberLineState> = {
    speak: async () => {},
    wait: async () => {},
    get: () => now,
    set: (patch) => {
      const next = applyPatch(def, now, patch);
      if (!next.isOk) throw new Error(`door refused ${JSON.stringify(patch)}: ${next.errors}`);
      now = next.state as NumberLineState;
      frames.push(now);
    },
    emit: (signal, payload) => {
      emitted.push(payload === undefined ? { signal } : { signal, payload });
    },
  };
  await e.run(context as never);
  return { state: now, frames, emitted };
}

const partsOf = (s: NumberLineState) => numberLine.parts?.(viewOf(def, s) as never) ?? [];

describe("numberLine", () => {
  it("knows only numbers on a line: no lesson-specific fields", () => {
    expect(Object.keys(viewOf(def, start)).sort()).toEqual(
      [
        "between",
        "from",
        "isSplittable",
        "isZoomable",
        "lens",
        "level",
        "marker",
        "marks",
        "dots",
        "dotCount",
        "pan",
        "showMarker",
        "showTicks",
        "split",
        "splitParts",
        "splitPointsBetween",
        "to",
        "color",
      ].sort(),
    );
  });

  it("says which tenths of the window the marker sits between", () => {
    expect(viewOf(def, start).between).toBe("1.4 and 1.5");
    expect(viewOf(def, { ...start, from: 1.4, to: 1.5 }).between).toBe("1.41 and 1.42");
  });

  it("knows its zoom level: decimal places of the ticks", () => {
    expect(viewOf(def, { ...start, from: 2, to: 3 }).level).toBe(1);
    expect(viewOf(def, { ...start, from: 2.6, to: 2.7 }).level).toBe(2);
    expect(viewOf(def, { ...start, from: 2.66, to: 2.67 }).level).toBe(3);
  });
});

describe("successive magnification (NCERT 1.4, Fig 1.11–1.13)", () => {
  it("2.665: [2, 3] → [2.6, 2.7] → [2.66, 2.67] → [2.665, 2.666]", () => {
    let w = { from: 2, to: 3 };
    const steps: string[] = [];
    for (let i = 0; i < 3; i++) {
      w = magnifyTarget(w, 2.665);
      steps.push(`${w.from}–${w.to}`);
    }
    expect(steps).toEqual(["2.6–2.7", "2.66–2.67", "2.665–2.666"]);
  });

  it("5.37373…: every level lands in the tenth the next digit names, for ever", () => {
    let w = { from: 5, to: 6 };
    const x = 5 + 37 / 99;
    const digits: number[] = [];
    for (let i = 0; i < 6; i++) {
      const next = magnifyTarget(w, x);
      digits.push(Math.round((next.from - w.from) / ((w.to - w.from) / 10)));
      w = next;
    }
    expect(digits).toEqual([3, 7, 3, 7, 3, 7]);
  });

  it("puts a value on a tenth's edge into the tenth to its right, except at the window's end", () => {
    expect(magnifyTarget({ from: 2, to: 3 }, 2.6)).toEqual({ from: 2.6, to: 2.7 });
    expect(magnifyTarget({ from: 2, to: 3 }, 3)).toEqual({ from: 2.9, to: 3 });
  });

  it("magnify glides there frame by frame, every frame through the door, then says so", async () => {
    const { state, frames, emitted } = await play(
      { ...start, from: 2, to: 3, lens: { from: 2.6, to: 2.7 } },
      "magnify",
      { value: 2.665 },
    );
    expect(state).toMatchObject({ from: 2.6, to: 2.7, lens: null });
    expect(frames.length).toBeGreaterThan(30);
    expect(emitted).toEqual([{ signal: "zoomed", payload: { from: 2.6, to: 2.7, level: 2 } }]);
  });

  it("keeps the point being zoomed into still on screen while it glides", () => {
    const a = { from: 2, to: 3 };
    const b = { from: 2.6, to: 2.7 };
    // The shared point: (f − 2)/1 = (f − 2.6)/0.1, so f = 8/3, two thirds of the way along.
    const f = 8 / 3;
    for (const t of [0.1, 0.3, 0.5, 0.9]) {
      const w = zoomFrame(a, b, t);
      expect((f - w.from) / (w.to - w.from)).toBeCloseTo(2 / 3, 9);
    }
    // Evenly in log: halfway in time is √10 times narrower.
    const half = zoomFrame(a, b, 0.5);
    expect(1 / (half.to - half.from)).toBeCloseTo(Math.sqrt(10), 9);
  });

  it("stops gliding if something else moves the window", async () => {
    const e = effect({ ...start, from: 2, to: 3 }, "magnify", { value: 2.665 });
    if (e.kind !== EffectKind.Task) throw new Error("expected a task");
    let now: NumberLineState = { ...start, from: 2, to: 3 };
    let waits = 0;
    const context: TaskContext<NumberLineState> = {
      speak: async () => {},
      wait: async () => {
        waits++;
        // The learner zooms out by hand after a few frames.
        if (waits === 5) now = { ...now, from: 0, to: 10 };
      },
      get: () => now,
      set: (patch) => {
        now = { ...now, ...patch };
      },
      emit: () => {
        throw new Error("should not finish");
      },
    };
    await e.run(context as never);
    expect(now).toMatchObject({ from: 0, to: 10 });
  });

  it("won't magnify past the narrowest window", () => {
    const tiny = { ...start, from: 1.41421356, to: 1.41421357, marker: 1.414213565 };
    expect(effect(tiny, "magnify", { value: 1.414213565 }).kind).toBe(EffectKind.Set);
  });

  it("zoomIn (the + button) magnifies around the marker; zoomOut widens ten times", async () => {
    expect((await play(start, "zoomIn")).state).toMatchObject({ from: 1.4, to: 1.5 });
    const out = (await play({ ...start, from: 1.4, to: 1.5 }, "zoomOut")).state;
    expect(out.to - out.from).toBeCloseTo(1, 9);
    expect((out.from + out.to) / 2).toBeCloseTo(1.45, 9);
  });

  it("showLens picks out the tenth that will be magnified", () => {
    expect(run({ ...start, from: 2, to: 3 }, "showLens", { value: 2.665 }).state.lens).toEqual({
      from: 2.6,
      to: 2.7,
    });
  });
});

describe("marks", () => {
  it("stack: 1/2, 2/4 and 10/20 are one point with three names", () => {
    let s = start;
    for (const label of ["1/2", "2/4", "10/20"]) {
      s = run(s, "placeMark", { at: 0.5, label }).state;
    }
    expect(s.marks.map((m) => m.at)).toEqual([0.5, 0.5, 0.5]);
  });

  it("move rather than double when placed again with the same label", () => {
    let s = run(start, "placeMark", { at: 1.4, label: "x" }).state;
    s = run(s, "placeMark", { at: 1.5, label: "x" }).state;
    expect(s.marks).toEqual([{ at: 1.5, label: "x" }]);
  });

  it("are parts only while in the window", () => {
    const s = run(start, "placeMark", { at: Math.SQRT2, label: "√2" }).state;
    expect(partsOf(s)).toContain("mark:√2");
    expect(partsOf({ ...s, from: 1.5, to: 2 })).not.toContain("mark:√2");
  });
});

describe("splitting into equal parts (NCERT Example 2)", () => {
  it("cuts [1, 2] into 6 parts at 1, 7/6, …, 2 and counts 5 points strictly between", () => {
    const { state, emit } = run(start, "splitInto", { from: 1, to: 2, parts: 6 });
    expect(splitPoints({ from: 1, to: 2, parts: 6 }).map((p) => Math.round(p * 6))).toEqual([
      6, 7, 8, 9, 10, 11, 12,
    ]);
    expect(viewOf(def, state).splitPointsBetween).toBe(5);
    expect(emit).toEqual([{ signal: "split", payload: { parts: 6, between: 5 } }]);
  });

  it("the learner's stepper changes the parts, keeping the ends", () => {
    const split = run({ ...start, isSplittable: true }, "splitInto", { from: 3, to: 4, parts: 6 });
    const more = run(split.state, "changeParts", { by: 1 });
    expect(more.state.split).toEqual({ from: 3, to: 4, parts: 7 });
    expect(viewOf(def, more.state).splitPointsBetween).toBe(6);
    const one = { ...more.state, split: { from: 3, to: 4, parts: 1 } };
    expect(run(one, "changeParts", { by: -1 }).emit).toEqual([]);
  });

  it("refuses a split that runs backwards", () => {
    expect(applyPatch(def, start, { split: { from: 2, to: 1, parts: 3 } }).isOk).toBe(false);
  });
});

describe("refusals and parts", () => {
  it("refuses an empty or huge window", () => {
    expect(applyPatch(def, start, { to: 1 + 1e-10 }).isOk).toBe(false);
    expect(applyPatch(def, { ...start, from: -10 }, { to: 10.5 }).isOk).toBe(false);
  });

  it("lists parts that come and go with the state", () => {
    expect(partsOf(start)).toContain("marker");
    expect(partsOf({ ...start, showMarker: false })).not.toContain("marker");
    expect(partsOf(start)).toContain("tick:1.4");
    expect(partsOf(start)).not.toContain("zoomIn");
    expect(partsOf({ ...start, isZoomable: true })).toContain("zoomIn");
    expect(partsOf({ ...start, lens: { from: 1.4, to: 1.5 } })).toContain("lens");
    expect(partsOf({ ...start, showTicks: false })).not.toContain("tick:1.4");
  });

  it("locates parts by name, never by pixels from outside", () => {
    const locate = (part: string) => numberLine.locate?.(viewOf(def, start) as never, part, 340);
    expect(locate("marker")?.x).toBeGreaterThan(0);
    expect(locate("tick:1.4")).toBeDefined();
    expect(locate("tick:1.45")).toBeUndefined();
  });
});

describe("dots", () => {
  it("places unlabelled dots, recolouring one already there instead of doubling it", () => {
    const one = run(start, "placeDot", { at: 1.5 }).state;
    const two = run(one, "placeDot", { at: 1.75, color: "#A21CAF" }).state;
    const recoloured = run(two, "placeDot", { at: 1.75, color: "#15171C" }).state;
    expect(recoloured.dots).toEqual([{ at: 1.5 }, { at: 1.75, color: "#15171C" }]);
    expect(viewOf(def, recoloured).dotCount).toBe(2);
    expect(run(recoloured, "clearDots").state.dots).toEqual([]);
  });
});

describe("sliding the line", () => {
  const counting: NumberLineState = {
    ...start,
    from: 0.5,
    to: 10.5,
    pan: { min: 0.5, max: 1_000_000 },
  };

  it("slides the window and keeps its width", () => {
    const { state } = run(counting, "panTo", { from: 120.5 });
    expect(state.from).toBe(120.5);
    expect(state.to).toBe(130.5);
  });

  it("stops at both ends of the pan", () => {
    expect(run(counting, "panTo", { from: -40 }).state.from).toBe(0.5);
    const far = run(counting, "panTo", { from: 2_000_000 }).state;
    expect(far.to).toBe(1_000_000);
    expect(far.to - far.from).toBeCloseTo(10);
  });

  it("stays put without a pan", () => {
    expect(run(start, "panTo", { from: 5 }).state.from).toBe(1);
  });

  it("refuses a pan narrower than the window", () => {
    expect(applyPatch(def, start, { pan: { min: 1, max: 1.5 } }).isOk).toBe(false);
  });
});

describe("scale", () => {
  it("picks readable tick steps: exactly tenths for a power-of-ten window", () => {
    expect(tickStep(3)).toBe(0.5);
    expect(tickStep(1)).toBe(0.1);
    expect(tickStep(0.01)).toBeCloseTo(0.001);
    expect(ticks({ from: 1, to: 2, width: 340 })).toEqual([
      1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2,
    ]);
    expect(ticks({ from: 2.66, to: 2.67, width: 340 })).toHaveLength(11);
  });
});
