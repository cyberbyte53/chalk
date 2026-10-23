import { readFileSync } from "node:fs";
import {
  EffectKind,
  applyPatch,
  asAnyProp,
  observationOf,
  prepareAction,
  viewOf,
} from "@chalk/prop";
import { renderToString } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import {
  type LightSceneState,
  SceneAction,
  SceneDerived,
  SceneKind,
  ScenePart,
  SceneSignal,
  describeScene,
  lightScene,
} from "./scene";
import { LightSceneView } from "./scene-view";

const def = asAnyProp(lightScene);
const start: LightSceneState = { ...lightScene.defaults };

function run(state: LightSceneState, name: string, args: Record<string, unknown> = {}) {
  const result = prepareAction(def, state, name, args);
  if (!result.isOk) throw new Error(result.errors.join("; "));
  if (result.effect.kind !== EffectKind.Set) throw new Error(`${name} should be instant`);
  const next = applyPatch(def, state, result.effect.set);
  if (!next.isOk) throw new Error(next.errors.join("; "));
  return next.state as LightSceneState;
}

const drawn = (s: LightSceneState): string =>
  renderToString(
    <LightSceneView
      view={viewOf(def, s)}
      locale="en"
      width={320}
      call={() => undefined}
      signal={() => undefined}
    />,
  );

describe("light scene: state", () => {
  it("starts on the power cut, dark, with the torch not tappable", () => {
    expect(start).toEqual({
      scene: SceneKind.PowerCut,
      isLit: false,
      canToggle: false,
      step: 0,
      canStep: false,
    });
  });

  it("refuses a scene it doesn't know, and fields it doesn't have", () => {
    expect(def.state.safeParse({ ...start, scene: "beach" }).success).toBe(false);
    expect(def.state.safeParse({ ...start, extra: 1 }).success).toBe(false);
    for (const scene of Object.values(SceneKind))
      expect(def.state.safeParse({ ...start, scene }).success).toBe(true);
  });
});

describe("light scene: the torch", () => {
  it("switches on and off again, and says so in its derived value", () => {
    const on = run(start, SceneAction.ToggleTorch);
    expect(on.isLit).toBe(true);
    expect((viewOf(def, on) as Record<string, unknown>)[SceneDerived.IsLit]).toBe(true);
    const off = run(on, SceneAction.ToggleTorch);
    expect(off.isLit).toBe(false);
  });

  it("is the learner's to switch", () => {
    expect(def.actions[SceneAction.ToggleTorch]?.byLearner).toBe(true);
  });

  it("is a button only when the learner may tap it", () => {
    expect(drawn(start)).not.toContain('role="button"');
    expect(drawn({ ...start, canToggle: true })).toContain('role="button"');
  });

  it("draws a beam only when lit", () => {
    expect(drawn(start)).not.toContain("ls-beam");
    expect(drawn({ ...start, isLit: true })).toContain("ls-beam");
  });
});

describe("light scene: steps", () => {
  const sphere: LightSceneState = { ...start, scene: SceneKind.MirrorFromSphere, canStep: true };

  it("steps 0 → 1 → 2 → 0, signalling the step now shown", () => {
    const steps: number[] = [];
    let s = sphere;
    for (let k = 0; k < 3; k++) {
      const result = prepareAction(def, s, SceneAction.Next, {});
      if (!result.isOk || result.effect.kind !== EffectKind.Set) throw new Error("next");
      expect(result.effect.emit[0]?.signal).toBe(SceneSignal.Stepped);
      s = run(s, SceneAction.Next);
      steps.push(s.step);
      expect(result.effect.emit[0]?.payload).toEqual({ step: s.step });
    }
    expect(steps).toEqual([1, 2, 0]);
    expect(def.actions[SceneAction.Next]?.byLearner).toBe(true);
  });

  it("says what each step shows, and offers next only when the learner may step", () => {
    expect(describeScene({ ...sphere, step: 0 })).toContain("ball");
    expect(describeScene({ ...sphere, step: 1 })).toContain("sliced");
    expect(describeScene({ ...sphere, step: 2 })).toContain("concave");
    expect(def.parts?.(sphere)).toContain(ScenePart.Next);
    expect(def.parts?.({ ...sphere, canStep: false })).not.toContain(ScenePart.Next);
    expect(drawn(sphere)).toContain('aria-label="Next step"');
    expect(drawn({ ...sphere, canStep: false })).not.toContain('aria-label="Next step"');
    expect(drawn({ ...sphere, step: 1 })).toContain("ls-cap-lift");
    expect(drawn({ ...sphere, step: 2 })).toContain(">C<");
  });
});

describe("light scene: how we see", () => {
  it("is lit and showing all its rays when not switchable, dark until switched when it is", () => {
    const see: LightSceneState = { ...start, scene: SceneKind.HowWeSee };
    expect(drawn(see)).toContain("ls-to-eye");
    expect(describeScene(see)).toContain("eye");
    const dark = { ...see, canToggle: true };
    expect(drawn(dark)).not.toContain("ls-to-eye");
    expect(drawn(dark)).toContain('role="button"');
    expect(drawn({ ...dark, isLit: true })).toContain("ls-to-eye");
    expect(def.parts?.(dark)).toContain(ScenePart.Torch);
  });

  it("moves light along the rays, and stands still for people who ask for less motion", () => {
    const css = readFileSync(new URL("./scene.css", import.meta.url), "utf8");
    expect(css).toContain("@keyframes ls-flow");
    expect(css).toContain("prefers-reduced-motion");
    expect(drawn({ ...start, scene: SceneKind.StraightLines })).toContain("ls-flow");
  });
});

describe("light scene: what it says", () => {
  it("describes every scene, and the power cut lit or not", () => {
    for (const scene of Object.values(SceneKind)) {
      const text = describeScene({ scene, isLit: false });
      expect(text.length).toBeGreaterThan(40);
      const obs = observationOf(def, { ...start, scene });
      expect(obs.summary).toBe(text);
    }
    expect(describeScene({ scene: SceneKind.PowerCut, isLit: false })).toContain("hardly");
    expect(describeScene({ scene: SceneKind.PowerCut, isLit: true })).toContain("shadow");
    expect(describeScene({ scene: SceneKind.MakeupMirror, isLit: false })).toContain("upside-down");
  });

  it("names the torch only in the power cut", () => {
    expect(def.parts?.(start)).toEqual([ScenePart.Picture, ScenePart.Torch]);
    expect(def.parts?.({ ...start, scene: SceneKind.Spoon })).toEqual([ScenePart.Picture]);
    expect(def.locate?.(start, ScenePart.Torch, 320)).toBeDefined();
    expect(
      def.locate?.({ ...start, scene: SceneKind.Spoon }, ScenePart.Torch, 320),
    ).toBeUndefined();
  });
});

describe("light scene: drawing", () => {
  it("draws every scene, with a label for screen readers", () => {
    for (const scene of Object.values(SceneKind)) {
      const html = drawn({ ...start, scene });
      expect(html).toContain("<svg");
      expect(html).toContain(`aria-label="${describeScene({ scene, isLit: false }).slice(0, 20)}`);
    }
  });

  it("colours only with the look's tokens", () => {
    const css = readFileSync(new URL("./scene.css", import.meta.url), "utf8");
    expect(
      css.split("\n").filter((line) => /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/.test(line)),
    ).toEqual([]);
    for (const scene of Object.values(SceneKind)) {
      const html = drawn({ ...start, scene });
      expect(html).not.toMatch(/(fill|stroke)="#/);
    }
  });
});
