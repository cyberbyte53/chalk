import { EffectKind, applyPatch, asAnyProp, checkStored, prepareAction } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { Source, fieldAt, seedsOf, traceLine, wiresOf } from "./field";
import {
  FieldAction,
  type FieldState,
  magneticField,
  needleAngleOf,
  northEndOf,
  strengthAt,
} from "./field-prop";
import { Rings, currentInABOf, generator, outputOf } from "./generator";
import {
  InductionAction,
  InductionMode,
  type InductionState,
  Place,
  induction,
  kickFor,
} from "./induction";
import { type MotorState, brushXOf, currentInAB, forceOnAB, motor, spinOf } from "./motor";
import { RodAction, type RodState, forceOf, forceOnRod, pushOf } from "./rod";
import { Carrier, Rule, answerOf } from "./rule";
import { Dir, crossDir } from "./space";
import {
  Appliance,
  Circuit,
  Fault,
  WiringAction,
  type WiringState,
  currentOf,
  homeWiring,
  isBodyLiveOf,
  isShockOf,
} from "./wiring";

function run<S extends Record<string, unknown>>(
  def: ReturnType<typeof asAnyProp>,
  state: S,
  name: string,
  args: Record<string, unknown>,
) {
  const result = prepareAction(def, state, name, args);
  if (!result.isOk) throw new Error(result.errors.join("; "));
  if (result.effect.kind !== EffectKind.Set) throw new Error(`${name} should be instant`);
  const next = applyPatch(def, state, result.effect.set);
  if (!next.isOk) throw new Error(next.errors.join("; "));
  return { state: next.state as S, emit: result.effect.emit };
}

describe("directions in the page", () => {
  it("right × up = out of the page (right-handed)", () => {
    expect(crossDir(Dir.Right, Dir.Up)).toBe(Dir.Out);
    expect(crossDir(Dir.Up, Dir.Right)).toBe(Dir.In);
    expect(crossDir(Dir.Out, Dir.Right)).toBe(Dir.Up);
  });
  it("directions along one line give nothing", () => {
    expect(crossDir(Dir.Up, Dir.Down)).toBeNull();
    expect(crossDir(Dir.Left, Dir.Left)).toBeNull();
  });
});

describe("the field of a current (13.2)", () => {
  it("a current out of the page circles anticlockwise (right-hand thumb rule)", () => {
    const w = wiresOf(Source.StraightWire, 1);
    const [bx, by] = fieldAt(w, 2, 0);
    expect(bx).toBeCloseTo(0);
    expect(by).toBeGreaterThan(0); // to the right of the wire, the field points up
    const [tx] = fieldAt(w, 0, 2);
    expect(tx).toBeLessThan(0); // above it, the field points left
  });
  it("reversing the current reverses the field", () => {
    const a = fieldAt(wiresOf(Source.StraightWire, 1), 2, 0);
    const b = fieldAt(wiresOf(Source.StraightWire, -1), 2, 0);
    expect(b[1]).toBeCloseTo(-a[1]);
  });
  it("it grows with the current and weakens with distance", () => {
    const near = Math.hypot(...fieldAt(wiresOf(Source.StraightWire, 1), 1, 0));
    const far = Math.hypot(...fieldAt(wiresOf(Source.StraightWire, 1), 2, 0));
    const more = Math.hypot(...fieldAt(wiresOf(Source.StraightWire, 2), 1, 0));
    expect(far).toBeCloseTo(near / 2);
    expect(more).toBeCloseTo(2 * near);
  });
  it("the field lines round a straight wire are closed circles", () => {
    const line = traceLine(wiresOf(Source.StraightWire, 1), [2, 0]);
    for (const [x, y] of line) expect(Math.hypot(x, y)).toBeCloseTo(2, 1);
  });
  it("n turns of a loop give n times the field at its centre", () => {
    const one = Math.hypot(...fieldAt(wiresOf(Source.Loop, 1, { turns: 1 }), 0, 0));
    const three = Math.hypot(...fieldAt(wiresOf(Source.Loop, 1, { turns: 3 }), 0, 0));
    expect(three).toBeCloseTo(3 * one);
  });
  it("inside a solenoid the field is nearly the same everywhere, and points along it", () => {
    const w = wiresOf(Source.Solenoid, 1);
    const a = fieldAt(w, -1.5, 0);
    const b = fieldAt(w, 1.5, 0.6);
    expect(a[0]).toBeGreaterThan(0);
    expect(Math.abs(a[1])).toBeLessThan(0.1 * a[0]);
    expect(b[0] / a[0]).toBeGreaterThan(0.85);
    expect(b[0] / a[0]).toBeLessThan(1.15);
  });
  it("outside a bar magnet the field runs N → S; inside, S → N (closed lines)", () => {
    const w = wiresOf(Source.BarMagnet, 1);
    expect(fieldAt(w, 4.5, 0)[0]).toBeGreaterThan(0); // beyond N (right), it points away
    expect(fieldAt(w, -4.5, 0)[0]).toBeGreaterThan(0); // beyond S (left), it points in
    expect(fieldAt(w, 0, 3)[0]).toBeLessThan(0); // above the middle, it runs N → S
    expect(fieldAt(w, 0, 0)[0]).toBeGreaterThan(0); // inside, S → N
  });
  it("every source's seeded field lines are traced", () => {
    for (const source of Object.values(Source)) {
      const w = wiresOf(source, 1);
      for (const seed of seedsOf(source)) expect(traceLine(w, seed).length).toBeGreaterThan(10);
    }
  });
});

describe("the compass", () => {
  const base = { ...magneticField.defaults } as FieldState;
  it("near the N pole the needle's north end points away from it", () => {
    const s = { ...base, compass: { x: 5, y: 0 } };
    expect(needleAngleOf(s)).toBe(0);
  });
  it("swings harder (a stronger field) nearer the poles", () => {
    const near = strengthAt({ ...base, compass: { x: 3.8, y: 0 } });
    const far = strengthAt({ ...base, compass: { x: 8, y: 0 } });
    expect(near).toBeGreaterThan(far);
  });
  it("rests with no current", () => {
    const s = { ...base, source: Source.StraightWire, current: 0, compass: { x: 2, y: 0 } };
    expect(needleAngleOf(s)).toBeNull();
  });
  it("a solenoid's north end is where the field inside points", () => {
    expect(northEndOf({ ...base, source: Source.Solenoid, current: 2 })).toBe("right");
    expect(northEndOf({ ...base, source: Source.Solenoid, current: -1 })).toBe("left");
    expect(northEndOf({ ...base, isFlipped: true })).toBe("left");
  });
  it("placing the compass is a learner's commit", () => {
    const def = asAnyProp(magneticField);
    const r = run(def, base, FieldAction.PlaceCompass, { x: 5, y: 0 });
    expect(r.state.compass).toEqual({ x: 5, y: 0 });
    expect(r.emit[0]?.payload?.needleAngle).toBe(0);
  });
});

describe("the hand rules", () => {
  it("Example 13.1: a power line east → west; the field below and above it", () => {
    // Looking north: east is right, west left; below the wire is down the page.
    expect(
      answerOf({
        rule: Rule.ThumbRule,
        first: Dir.Left,
        second: Dir.Down,
        carrier: Carrier.Current,
      }),
    ).toBe(Dir.Out);
    expect(
      answerOf({ rule: Rule.ThumbRule, first: Dir.Left, second: Dir.Up, carrier: Carrier.Current }),
    ).toBe(Dir.In);
  });
  it("Fleming's left hand: field up, current out of the page → force to the left (Activity 13.7)", () => {
    expect(
      answerOf({
        rule: Rule.FlemingLeft,
        first: Dir.Up,
        second: Dir.Out,
        carrier: Carrier.Current,
      }),
    ).toBe(Dir.Left);
  });
  it("Example 13.2: an electron moving right across a field up the page is pushed into it", () => {
    expect(
      answerOf({
        rule: Rule.FlemingLeft,
        first: Dir.Up,
        second: Dir.Right,
        carrier: Carrier.Electron,
      }),
    ).toBe(Dir.In);
  });
  it("in-text Q3: an alpha particle going west, pushed north → the field is upward", () => {
    // Plan view: west is left, north is up the page, upward (to the sky) is out of the page.
    const field = [Dir.Out, Dir.In, Dir.Right, Dir.Down].find(
      (f) =>
        answerOf({
          rule: Rule.FlemingLeft,
          first: f,
          second: Dir.Left,
          carrier: Carrier.Positive,
        }) === Dir.Up,
    );
    expect(field).toBe(Dir.Out);
  });
  it("Fleming's right hand: field right, conductor moving up → current into the page", () => {
    expect(
      answerOf({
        rule: Rule.FlemingRight,
        first: Dir.Right,
        second: Dir.Up,
        carrier: Carrier.Current,
      }),
    ).toBe(Dir.In);
  });
  it("field and current along one line: no force", () => {
    expect(
      answerOf({
        rule: Rule.FlemingLeft,
        first: Dir.Up,
        second: Dir.Down,
        carrier: Carrier.Current,
      }),
    ).toBeNull();
  });
});

describe("the rod in the magnet (Activity 13.7)", () => {
  const def = asAnyProp(forceOnRod);
  const base = { ...forceOnRod.defaults, isKeyClosed: true } as RodState;
  it("current B → A with the field up pushes the rod left", () => {
    expect(pushOf(base)).toBe("left");
  });
  it("reversing the current, or the field, reverses the push", () => {
    expect(pushOf({ ...base, isFromBToA: false })).toBe("right");
    expect(run(def, base, RodAction.FlipMagnet, {}).state.isFieldUp).toBe(false);
    expect(pushOf({ ...base, isFieldUp: false })).toBe("right");
    expect(pushOf({ ...base, isFieldUp: false, isFromBToA: false })).toBe("left");
  });
  it("more current, a stronger magnet or a longer rod: a bigger force (in-text Q2)", () => {
    const f = forceOf(base);
    expect(forceOf({ ...base, current: 3 })).toBeGreaterThan(f);
    expect(forceOf({ ...base, isStrongMagnet: true })).toBe(2 * f);
    expect(forceOf({ ...base, isLongRod: true })).toBe(2 * f);
  });
  it("no current, no force", () => {
    expect(pushOf({ ...base, isKeyClosed: false })).toBeNull();
    expect(forceOf({ ...base, current: 0 })).toBe(0);
  });
});

describe("the motor (13.4)", () => {
  const base = { ...motor.defaults } as MotorState;
  it("at the start AB carries A → B (in), is pushed down, and the coil turns anticlockwise", () => {
    expect(currentInAB(base)).toBe("in");
    expect(forceOnAB(base)).toBe("down");
    expect(spinOf(base)).toBe("anticlockwise");
  });
  it("after half a turn the split ring reverses AB's current, and the spin keeps its sense", () => {
    const half = { ...base, angle: 180 };
    expect(brushXOf(half)).toBe("Q");
    expect(currentInAB(half)).toBe("out");
    expect(forceOnAB(half)).toBe("up");
    expect(spinOf(half)).toBe("anticlockwise");
    for (const angle of [30, 60, 120, 150, 210, 240, 300, 330])
      expect(spinOf({ ...base, angle })).toBe("anticlockwise");
  });
  it("upright, the brushes sit on the gaps: no current for a moment", () => {
    expect(currentInAB({ ...base, angle: 90 })).toBe("none");
    expect(brushXOf({ ...base, angle: 270 })).toBeNull();
  });
  it("with plain slip rings the turn reverses past upright: it only rocks", () => {
    const slip = { ...base, hasSplitRing: false };
    expect(spinOf({ ...slip, angle: 30 })).toBe("anticlockwise");
    expect(spinOf({ ...slip, angle: 150 })).toBe("clockwise");
  });
  it("no battery, no force", () => {
    expect(forceOnAB({ ...base, isOn: false })).toBe("none");
  });
});

describe("induction (13.5)", () => {
  const def = asAnyProp(induction);
  const base = { ...induction.defaults } as InductionState;
  it("N pole in → right; out → left; still → none", () => {
    expect(kickFor("N", Place.Away, Place.Inside)).toBe(1);
    expect(kickFor("N", Place.Inside, Place.Away)).toBe(-1);
    expect(kickFor("N", Place.Near, Place.Near)).toBe(0);
  });
  it("the S pole kicks the other way", () => {
    expect(kickFor("S", Place.Away, Place.Near)).toBe(-1);
    expect(kickFor("S", Place.Near, Place.Away)).toBe(1);
  });
  it("a move is one swing of the needle; holding still is none", () => {
    const moved = run(def, base, InductionAction.Move, { to: Place.Inside });
    expect(moved.state.kick).toBe(1);
    expect(moved.state.flicks).toBe(1);
    expect(run(def, moved.state, InductionAction.Hold, {}).state.kick).toBe(0);
  });
  it("two coils: switching on kicks one way, off the other; steady gives nothing", () => {
    const two = { ...base, mode: InductionMode.TwoCoils };
    const on = run(def, two, InductionAction.SetKey, { isClosed: true });
    expect(on.state.kick).toBe(1);
    const off = run(def, on.state, InductionAction.SetKey, { isClosed: false });
    expect(off.state.kick).toBe(-1);
    expect(run(def, off.state, InductionAction.SetKey, { isClosed: false }).state.kick).toBe(0);
  });
});

describe("the generator (13.6)", () => {
  const base = { ...generator.defaults } as Parameters<typeof outputOf>[0] & { angle: number };
  it("AB moving up through a field to the right carries A → B (Fleming's right hand)", () => {
    expect(currentInABOf({ angle: 0 })).toBe("in");
    expect(
      answerOf({
        rule: Rule.FlemingRight,
        first: Dir.Right,
        second: Dir.Up,
        carrier: Carrier.Current,
      }),
    ).toBe(Dir.In);
  });
  it("AC reverses every half turn (in-text Q4: once each half revolution)", () => {
    const signs = [0, 45, 135, 180, 225, 315].map((angle) =>
      Math.sign(outputOf({ ...base, angle, rings: Rings.Slip })),
    );
    expect(signs).toEqual([1, 1, -1, -1, -1, 1]);
    expect(outputOf({ ...base, angle: 90 })).toBe(0);
  });
  it("with a split ring the current never reverses (DC)", () => {
    for (let angle = 0; angle < 720; angle += 15)
      expect(outputOf({ ...base, angle, rings: Rings.Split })).toBeGreaterThanOrEqual(0);
  });
});

describe("the wiring at home (13.7)", () => {
  const def = asAnyProp(homeWiring);
  const base = { ...homeWiring.defaults } as WiringState;
  it("appliances in parallel: each current is P / 220 V, and they add", () => {
    expect(currentOf(base, Circuit.Five)).toBeCloseTo((100 + 75) / 220, 2);
  });
  it("in-text Q2: a 2 kW oven on the 5 A circuit melts its fuse", () => {
    const r = run(def, base, WiringAction.PlugOven, { socket: "five" });
    expect(r.state.isBlownFive).toBe(true);
    expect(currentOf(r.state, Circuit.Five)).toBe(0);
    expect(r.emit.some((e) => e.signal === "blown")).toBe(true);
  });
  it("on the 15 A circuit the oven is fine until too much is on (overloading)", () => {
    let s = run(def, base, WiringAction.PlugOven, { socket: "fifteen" }).state;
    expect(s.isBlownFifteen).toBe(false);
    s = run(def, s, WiringAction.Toggle, { appliance: Appliance.Cooler }).state;
    s = run(def, s, WiringAction.Toggle, { appliance: Appliance.Iron }).state;
    expect(s.isBlownFifteen).toBe(false);
    s = run(def, s, WiringAction.Toggle, { appliance: Appliance.Geyser }).state;
    expect(s.isBlownFifteen).toBe(true);
  });
  it("a short circuit melts the fuse; a new fuse melts again until it's mended", () => {
    let s = run(def, base, WiringAction.SetFault, { fault: Fault.Short }).state;
    expect(s.isBlownFifteen).toBe(true);
    s = run(def, s, WiringAction.ReplaceFuse, { circuit: Circuit.Fifteen }).state;
    expect(s.isBlownFifteen).toBe(true);
    s = run(def, s, WiringAction.SetFault, { fault: Fault.None }).state;
    s = run(def, s, WiringAction.ReplaceFuse, { circuit: Circuit.Fifteen }).state;
    expect(s.isBlownFifteen).toBe(false);
  });
  it("live touching the iron's body: earthed, the fuse blows and it's safe; no earth, a shock", () => {
    const earthed = run(def, base, WiringAction.SetFault, { fault: Fault.Leak }).state;
    expect(earthed.isBlownFifteen).toBe(true);
    expect(isBodyLiveOf(earthed)).toBe(false);
    const bare = run(def, { ...base, hasEarth: false }, WiringAction.SetFault, {
      fault: Fault.Leak,
    }).state;
    expect(bare.isBlownFifteen).toBe(false);
    expect(isBodyLiveOf(bare)).toBe(true);
    expect(isShockOf(run(def, bare, WiringAction.Touch, { isTouching: true }).state)).toBe(true);
  });
  it("refuses an appliance listed twice", () => {
    expect(checkStored(def, { ...base, on: [Appliance.Bulb, Appliance.Bulb] }).isOk).toBe(false);
  });
});
