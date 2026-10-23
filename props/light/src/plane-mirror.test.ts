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
  LABEL_ORDER,
  LABEL_WORDS,
  PlaneMirrorAction,
  PlaneMirrorDerived,
  PlaneMirrorPart,
  PlaneMirrorSignal,
  type PlaneMirrorState,
  TORCH_HEIGHT,
  incidenceOf,
  planeMirror,
  reflectedX,
  strikeToLight,
} from "./plane-mirror";

const def = asAnyProp(planeMirror);
/** Torch at 20, beam strikes at 50: 30 across, 50 down, so i = r = atan(30/50) ≈ 30.96°. */
const start: PlaneMirrorState = {
  ...planeMirror.defaults,
  torchX: 20,
  strike: 50,
  target: { x: 80, y: TORCH_HEIGHT },
  showNormal: true,
  showAngles: true,
};

function run(state: PlaneMirrorState, name: string, args: Record<string, unknown> = {}) {
  const result = prepareAction(def, state, name, args);
  if (!result.isOk) throw new Error(result.errors.join("; "));
  if (result.effect.kind !== EffectKind.Set) throw new Error(`${name} should be instant`);
  const next = applyPatch(def, state, result.effect.set);
  if (!next.isOk) throw new Error(next.errors.join("; "));
  return { state: next.state as PlaneMirrorState, emit: result.effect.emit };
}

describe("plane mirror: the law of reflection", () => {
  it("makes equal angles with the normal", () => {
    const v = viewOf(def, start);
    expect(v.incidence).toBeCloseTo(30.96, 1);
    expect(v.reflection).toBe(v.incidence);
  });

  it("measures the angle from the normal, not the mirror", () => {
    // 50 across and 50 down is 45° either way; 0 across is along the normal.
    expect(incidenceOf({ ...start, torchX: 0, strike: 50 })).toBeCloseTo(45, 6);
    expect(incidenceOf({ ...start, torchX: 50, strike: 50 })).toBe(0);
  });

  it("is symmetric: a beam from the right strikes at the same angle", () => {
    expect(incidenceOf({ ...start, torchX: 80, strike: 50 })).toBeCloseTo(
      incidenceOf({ ...start, torchX: 20, strike: 50 }),
      9,
    );
  });

  it("sends the reflected ray as far across as the incident one came, at the torch's height", () => {
    // Torch 30 cm left of the strike point: the beam climbs back to 50 cm up 30 cm to the right.
    expect(reflectedX(start, TORCH_HEIGHT)).toBeCloseTo(80, 9);
    expect(reflectedX(start, TORCH_HEIGHT / 2)).toBeCloseTo(65, 9);
  });

  it("lights a target the reflected ray passes through, and not one it misses", () => {
    expect(viewOf(def, start).isLit).toBe(true);
    expect(viewOf(def, { ...start, strike: 45 }).isLit).toBe(false);
    expect(viewOf(def, { ...start, target: null }).isLit).toBe(false);
  });
});

describe("plane mirror: actions", () => {
  it("aim moves the strike point and keeps the torch and target", () => {
    const { state, emit } = run(start, PlaneMirrorAction.Aim, { strike: 30 });
    expect(state.strike).toBe(30);
    expect(state.torchX).toBe(20);
    expect(state.target).toEqual(start.target);
    expect(emit).toEqual([]);
  });

  it("aimAtTarget finds the one strike point that lights the target", () => {
    const { state } = run({ ...start, strike: 10 }, PlaneMirrorAction.AimAtTarget);
    expect(state.strike).toBeCloseTo(50, 9);
    expect(viewOf(def, state).isLit).toBe(true);
    // A target off the torch's height needs a different point, still exact.
    const low = { ...start, target: { x: 80, y: 25 } };
    const lit = run(low, PlaneMirrorAction.AimAtTarget).state;
    expect(reflectedX(lit, 25)).toBeCloseTo(80, 9);
    expect(strikeToLight(low)).toBeCloseTo(lit.strike, 9);
  });

  it("aimAtTarget does nothing without a target", () => {
    const { state } = run({ ...start, target: null }, PlaneMirrorAction.AimAtTarget);
    expect(state.strike).toBe(start.strike);
  });

  it("placeTorch and placeTarget keep the strike point", () => {
    expect(run(start, PlaneMirrorAction.PlaceTorch, { x: 35 }).state).toMatchObject({
      torchX: 35,
      strike: 50,
    });
    expect(run(start, PlaneMirrorAction.PlaceTarget, { x: 60, y: 40 }).state).toMatchObject({
      target: { x: 60, y: 40 },
      strike: 50,
    });
    expect(run(start, PlaneMirrorAction.ClearTarget).state.target).toBeNull();
  });

  it("refuses a strike point off the mirror and a target outside the room", () => {
    expect(prepareAction(def, start, PlaneMirrorAction.Aim, { strike: 120 }).isOk).toBe(false);
    expect(applyPatch(def, start, { target: { x: 50, y: 90 } }).isOk).toBe(false);
  });

  it("marks only aim as the learner's, and aimAtTarget as revealing", () => {
    expect(planeMirror.actions[PlaneMirrorAction.Aim].byLearner).toBe(true);
    expect(planeMirror.actions[PlaneMirrorAction.AimAtTarget].reveals).toBe(true);
    expect(planeMirror.actions[PlaneMirrorAction.PlaceTorch].byLearner).toBeUndefined();
    expect(planeMirror.signals?.[PlaneMirrorSignal.Aimed]).toBeDefined();
  });
});

describe("plane mirror: observation", () => {
  it("reports what is drawn: the angles only while shown, the target as lit or dark", () => {
    const shown = observationOf(def, viewOf(def, start));
    const ids = shown.elements.map((e) => e.id);
    expect(ids).toEqual([
      PlaneMirrorPart.Torch,
      PlaneMirrorPart.Strike,
      PlaneMirrorPart.Normal,
      PlaneMirrorPart.AngleIn,
      PlaneMirrorPart.AngleOut,
      PlaneMirrorPart.Target,
    ]);
    expect(shown.elements.find((e) => e.id === PlaneMirrorPart.AngleIn)?.value).toBe("31°");
    expect(shown.elements.find((e) => e.id === PlaneMirrorPart.Target)?.value).toBe("lit");
    expect(shown.hidden).toBeUndefined();

    const bare = observationOf(
      def,
      viewOf(def, { ...start, showNormal: false, showAngles: false, target: null }),
    );
    expect(bare.elements.map((e) => e.id)).toEqual([PlaneMirrorPart.Torch, PlaneMirrorPart.Strike]);
    expect(bare.hidden).toEqual({ incidence: 31, reflection: 31 });
  });

  it("locates the torch, strike point and target with tap targets at least 44 px", () => {
    const view = viewOf(def, start) as ReturnType<typeof viewOf> & PlaneMirrorState;
    for (const part of [PlaneMirrorPart.Torch, PlaneMirrorPart.Strike, PlaneMirrorPart.Target]) {
      const box = planeMirror.locate?.(view, part, 340);
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
    const noTarget = viewOf(def, { ...start, target: null }) as typeof view;
    expect(planeMirror.locate?.(noTarget, PlaneMirrorPart.Target, 340)).toBeUndefined();
    expect(planeMirror.locate?.(view, "nothing", 340)).toBeUndefined();
  });
});

describe("plane mirror: the labelled diagram", () => {
  const off = { ...start, labelStep: null };
  const on = { ...start, labelStep: 0 };

  it("is off by default, with the ruler and the readout on", () => {
    expect(planeMirror.defaults.labelStep).toBeNull();
    expect(planeMirror.defaults.showRuler).toBe(true);
    expect(planeMirror.defaults.showStrikeAt).toBe(true);
    expect(viewOf(def, off)[PlaneMirrorDerived.LabelStep]).toBeNull();
  });

  it("shows one more label each step and says so, stopping after the sixth", () => {
    let s: PlaneMirrorState = on;
    for (let k = 1; k <= LABEL_ORDER.length; k++) {
      const next = run(s, PlaneMirrorAction.NextLabel);
      expect(next.state.labelStep).toBe(k);
      expect(next.emit).toEqual([{ signal: PlaneMirrorSignal.LabelShown, payload: { step: k } }]);
      s = next.state;
    }
    const after = run(s, PlaneMirrorAction.NextLabel);
    expect(after.state.labelStep).toBe(6);
    expect(after.emit).toEqual([]);
  });

  it("does nothing while the diagram is off", () => {
    const next = run(off, PlaneMirrorAction.NextLabel);
    expect(next.state.labelStep).toBeNull();
    expect(next.emit).toEqual([]);
  });

  it("is the learner's to step through", () => {
    expect(def.actions[PlaneMirrorAction.NextLabel]?.byLearner).toBe(true);
  });

  it("names the labels in order, newest last, and can point at them", () => {
    expect(LABEL_ORDER).toEqual([
      "incidentRay",
      "pointOfIncidence",
      "normal",
      "reflectedRay",
      "angleOfIncidence",
      "angleOfReflection",
    ]);
    const three = { ...start, labelStep: 3 };
    const o = observationOf(def, three);
    const labels = o.elements.find((e) => e.id === PlaneMirrorPart.Labels);
    expect(labels?.value).toBe(
      "labelled: incident ray, point of incidence, normal; newest: normal",
    );
    expect(o.summary).toContain("3 of 6 parts labelled");
    expect(def.parts?.(three)).toContain(PlaneMirrorPart.Labels);
    expect(def.locate?.(three, PlaneMirrorPart.Labels, 600)).toBeDefined();
    expect(def.parts?.(on)).not.toContain(PlaneMirrorPart.Labels);
  });

  it("has every label in Hindi too", () => {
    for (const l of LABEL_ORDER) expect(LABEL_WORDS[l].hi.length).toBeGreaterThan(0);
    expect(LABEL_WORDS.angleOfIncidence.hi).toBe("आपतन कोण i");
  });
});
