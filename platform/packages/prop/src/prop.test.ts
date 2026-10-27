import { describe, expect, it } from "vitest";
import { z } from "zod";
import { BoardAction, BoardSignal, boardProp } from "./board";
import { EffectKind, actionsFor, asAnyProp, defineProp, raise, set, signal, tween } from "./define";
import { applyPatch, initialState, prepareAction, tweenAt, viewOf } from "./state";

// A concave mirror: two stored causes (u, f); everything else follows.
const mirrorState = z
  .object({ u: z.number().min(-60).max(-5), f: z.number().min(-40).max(-5) })
  .strict();
type MirrorState = z.infer<typeof mirrorState>;
const act = actionsFor<MirrorState>();
const mirrorSignals = { objectMoved: signal("The object moved") };
const imageAt = (s: MirrorState) => 1 / (1 / s.f - 1 / s.u);

const mirror = asAnyProp(
  defineProp({
    type: "mirror",
    describe: "Concave mirror (NCERT sign convention, cm)",
    state: mirrorState,
    defaults: { u: -20, f: -15 },
    derived: {
      v: { describe: "image distance", compute: imageAt },
      m: { describe: "magnification", compute: (s) => -imageAt(s) / s.u },
    },
    offScreen: ["m"],
    actions: {
      moveObjectTo: act({
        describe: "Move the object; keeps f",
        changes: ["u"],
        args: z.object({ u: z.number() }).strict(),
        run: (_s, a) => set({ u: a.u }, raise(mirrorSignals.objectMoved, { u: a.u })),
      }),
      slideObjectTo: act({
        describe: "Slide the object over time; keeps f",
        changes: ["u"],
        args: z.object({ u: z.number(), over: z.number().positive() }).strict(),
        run: (_s, a) => tween(a.over, { u: a.u }),
      }),
      moveObjectSoImageIsAt: act({
        describe: "Move the object so the image forms at v; keeps f",
        changes: ["u"],
        args: z.object({ v: z.number() }).strict(),
        reveals: true,
        run: (s, a) => set({ u: 1 / (1 / s.f - 1 / a.v) }),
      }),
      moveObjectBehind: act({
        describe: "Always refuses: there is nothing behind a mirror",
        changes: [],
        args: z.object({}).strict(),
        run: () => {
          throw new Error("nothing behind a mirror");
        },
      }),
    },
    signals: mirrorSignals,
  }),
);

describe("prop state", () => {
  it("reads stored and derived fields alike", () => {
    const view = viewOf(mirror, mirror.defaults);
    expect(view.u).toBe(-20);
    expect(view.v).toBeCloseTo(-60);
    expect(view.m).toBeCloseTo(-3);
  });

  it("starts from defaults plus what the lesson gives, and refuses unknown fields", () => {
    expect(initialState(mirror, { u: -30 })).toEqual({ isOk: true, state: { u: -30, f: -15 } });
    expect(initialState(mirror, { v: -30 }).isOk).toBe(false);
  });

  it("checks every change at the one door", () => {
    expect(applyPatch(mirror, mirror.defaults, { u: -100 }).isOk).toBe(false);
    expect(applyPatch(mirror, mirror.defaults, { m: 2 }).isOk).toBe(false); // derived: can't be set
  });
});

describe("actions", () => {
  it("checks arguments and runs the prop's own logic", () => {
    expect(prepareAction(mirror, mirror.defaults, "moveObjectTo", { u: "far" }).isOk).toBe(false);
    expect(prepareAction(mirror, mirror.defaults, "fly").isOk).toBe(false);
    const result = prepareAction(mirror, mirror.defaults, "moveObjectTo", { u: -30 });
    expect(result.isOk && result.effect).toEqual({
      kind: EffectKind.Set,
      set: { u: -30 },
      emit: [{ signal: "objectMoved", payload: { u: -30 } }],
    });
  });

  it("turns a prop that throws into a refusal, not a crash", () => {
    const result = prepareAction(mirror, mirror.defaults, "moveObjectBehind");
    expect(result).toEqual({
      isOk: false,
      errors: ["mirror.moveObjectBehind: nothing behind a mirror"],
    });
  });

  it("solves backwards with a named action: image at −30 puts the object at −30 (f = −15)", () => {
    const result = prepareAction(mirror, mirror.defaults, "moveObjectSoImageIsAt", { v: -30 });
    if (!result.isOk || result.effect.kind !== EffectKind.Set) throw new Error("expected a set");
    expect(result.effect.set.u).toBeCloseTo(-30);
  });

  it("eases a tween from where the prop is", () => {
    expect(tweenAt({ u: -20 }, { u: -30 }, 0)).toEqual({ u: -20 });
    expect(tweenAt({ u: -20 }, { u: -30 }, 0.5).u).toBeCloseTo(-25);
    expect(tweenAt({ u: -20 }, { u: -30 }, 1)).toEqual({ u: -30 });
  });
});

describe("board prop", () => {
  it("only says Continued once the board has passed", () => {
    const board = asAnyProp(boardProp);
    const early = prepareAction(board, board.defaults, BoardAction.Continue);
    expect(early.isOk && early.effect.kind === EffectKind.Set && early.effect.emit).toEqual([]);
    const passed = { ...board.defaults, isPassed: true };
    const late = prepareAction(board, passed, BoardAction.Continue);
    expect(late.isOk && late.effect.kind === EffectKind.Set && late.effect.emit).toEqual([
      { signal: BoardSignal.Continued },
    ]);
  });
});
