import { describe, expect, it } from "vitest";
import { z } from "zod";
import { EffectKind, actionsFor, defineProp, set } from "./define";
import { defineGroup, groupOf, refuse } from "./group";
import {
  applyPatch,
  initialState,
  observationOf,
  prepareAction,
  setStateChecks,
  viewOf,
} from "./state";

/** A view read by path in a test (its shape is the prop's). */
type Seen = { readonly [key: string]: Seen };

// Small stand-ins for real blocks: a stepper with its own law (it clamps), a line of text, a
// handle on an axis the learner drags, and a button.

const stepperState = z.object({ value: z.number(), min: z.number(), max: z.number() }).strict();
type Stepper = z.infer<typeof stepperState>;
const onStepper = actionsFor<Stepper>();
const stepper = defineProp({
  type: "stepper",
  describe: "",
  state: stepperState,
  defaults: { value: 0, min: -5, max: 5 },
  actions: {
    change: onStepper({
      describe: "",
      byLearner: true,
      args: z.object({ to: z.number() }).strict(),
      changes: ["value"],
      run: (s, a) => {
        const to = Math.min(s.max, Math.max(s.min, a.to));
        return set({ value: to }, { signal: "changed", payload: { to } });
      },
    }),
  },
  signals: { changed: { describe: "" } },
  observe: (s) => ({
    summary: "",
    elements: [
      { id: "value", value: s.value },
      { id: "more", does: "change" },
    ],
  }),
});

const text = defineProp({
  type: "text",
  describe: "",
  state: z.object({ tex: z.string() }).strict(),
  defaults: { tex: "" },
  actions: {},
  observe: (s) => ({ summary: "", elements: [{ id: "line", value: s.tex }] }),
});

const handleState = z.object({ x: z.number() }).strict();
const onHandle = actionsFor<z.infer<typeof handleState>>();
const handle = defineProp({
  type: "handle",
  describe: "",
  state: handleState,
  defaults: { x: 0 },
  actions: {
    move: onHandle({
      describe: "",
      byLearner: true,
      args: z.object({ x: z.number() }).strict(),
      changes: ["x"],
      run: (_s, a) => set({ x: a.x }, { signal: "moved" }),
    }),
  },
  signals: { moved: { describe: "" } },
  observe: (s) => ({ summary: "", elements: [{ id: "handle", value: s.x, does: "move" }] }),
});

const machineOwn = z.object({ tried: z.array(z.number()).max(5) }).strict();
type Own = z.infer<typeof machineOwn>;
const onMachine = actionsFor<Own>();

const machine = defineGroup({
  type: "machine",
  describe: "x² from a stepper and a handle",
  own: machineOwn,
  ownDefaults: { tried: [] },
  children: { input: stepper, working: text, dial: handle, note: text },
  optional: ["note"],
  defaults: { input: { min: -3, max: 3 } },
  is: {
    // Typed from the children: s.input is the stepper's state.
    working: (s) => ({ tex: `${s.input.value}² = ${s.input.value ** 2}` }),
    dial: (s) => ({ x: s.input.value }),
  },
  route: {
    // The handle's x is bound to the stepper: a drag moves the stepper (and nothing past ±10).
    "dial.move": (_s, a) =>
      Math.abs(Number(a.x)) > 10
        ? refuse("x is limited to −10…10")
        : [["input.change", { to: a.x }]],
  },
  when: { "input.changed": (_s, p) => [["put", { x: p.to }]] },
  actions: {
    put: onMachine({
      describe: "",
      args: z.object({ x: z.number() }).strict(),
      changes: ["tried"],
      run: (s, a) => set({ tried: [...s.tried, a.x].slice(-5) }, { signal: "put" }),
    }),
  },
  signals: { put: { describe: "" } },
  invariant: (s) => (s.tried.includes(99) ? "99 is never tried" : undefined),
  summary: (s) =>
    `the machine, ${s.tried.length} tried${s.note === null || s.note.tex === "" ? "" : `, ${s.note.tex}`}`,
  layout: { kind: "column", children: ["input", "working", "dial", "note"] },
});

/** Runs an action on the group and applies its instant change, as the runtime does. */
function act(state: Record<string, unknown>, action: string, args: Record<string, unknown>) {
  const prepared = prepareAction(machine, state, action, args);
  if (!prepared.isOk) throw new Error(prepared.errors.join("; "));
  if (prepared.effect.kind !== EffectKind.Set) throw new Error("expected an instant change");
  const next = applyPatch(machine, state, prepared.effect.set);
  if (!next.isOk) throw new Error(next.errors.join("; "));
  return { state: next.state, emits: prepared.effect.emit.map((e) => e.signal) };
}

const view = (state: Record<string, unknown>) => viewOf(machine, state) as unknown as Seen;

describe("groups", () => {
  it("stores only facts: bound fields are left out of the state and worked out when read", () => {
    const placed = initialState(machine, { input: { value: 2 } });
    if (!placed.isOk) throw new Error(placed.errors.join());
    // The working's text and the handle's x are bound: not stored.
    expect(placed.state.input).toEqual({ value: 2, min: -3, max: 3 });
    expect(placed.state.working).toEqual({});
    expect(placed.state.dial).toEqual({});
    // Read, they are there.
    expect(view(placed.state).working).toEqual({ tex: "2² = 4" });
    expect(view(placed.state).dial).toEqual({ x: 2 });
    expect(initialState(machine, { input: { nope: 1 } }).isOk).toBe(false);
    // A placement can't set a bound field: it isn't a fact.
    expect(initialState(machine, { dial: { x: 1 } }).isOk).toBe(false);
    expect(groupOf(machine)?.bound).toEqual(["working.tex", "dial.x"]);
  });

  it("runs a child's own law, then the group's links, as one change", () => {
    const start = initialState(machine, {});
    if (!start.isOk) throw new Error();
    const done = act(start.state, "input.change", { to: 9 });
    // The stepper clamped itself to 3; the working and the handle follow; WHEN put it in.
    expect(done.state.input).toMatchObject({ value: 3 });
    expect(view(done.state).working).toEqual({ tex: "3² = 9" });
    expect(view(done.state).dial).toEqual({ x: 3 });
    expect(done.state.tried).toEqual([3]);
    expect(done.emits).toEqual(["input.changed", "put"]);
  });

  it("routes a learner's drag on a bound field to its owner, or refuses it with a reason", () => {
    const start = initialState(machine, {});
    if (!start.isOk) throw new Error();
    const dragged = act(start.state, "dial.move", { x: -2 });
    expect(dragged.state.input).toMatchObject({ value: -2 });
    expect(view(dragged.state).dial).toEqual({ x: -2 });
    expect(dragged.emits).toEqual(["input.changed", "put"]);
    const refused = prepareAction(machine, start.state, "dial.move", { x: 50 });
    expect(refused.isOk).toBe(false);
    expect(refused.isOk ? "" : refused.errors.join()).toContain("x is limited to −10…10");
  });

  it("refuses a group whose learner control writes a bound field without a route", () => {
    expect(() =>
      defineGroup({
        type: "bad",
        describe: "",
        children: { input: stepper, dial: handle },
        is: { dial: (s) => ({ x: s.input.value }) },
        summary: () => "",
        layout: { kind: "column", children: ["input", "dial"] },
      }),
    ).toThrow(/dial.move is the learner's and changes dial.x, which is bound: route it/);
  });

  it("checks the whole state: no bound field stored, rules across children", () => {
    const start = initialState(machine, {});
    if (!start.isOk) throw new Error();
    expect(applyPatch(machine, start.state, { dial: { x: 2 } }).isOk).toBe(false);
    expect(applyPatch(machine, start.state, { tried: [99] }).isOk).toBe(false);
    // Own fields set from outside (a board's IS): the leaves follow when read.
    const set = applyPatch(machine, start.state, { tried: [1, 2] });
    if (!set.isOk) throw new Error(set.errors.join());
    expect(set.state.tried).toEqual([1, 2]);
  });

  it("types its links from its children", () => {
    defineGroup({
      type: "typed",
      describe: "",
      children: { input: stepper, note: text },
      optional: ["note"],
      is: {
        // @ts-expect-error the stepper has no field "valu"
        note: (s) => ({ tex: String(s.input.valu) }),
      },
      // @ts-expect-error an optional child may be null
      summary: (s) => s.note.tex,
      layout: { kind: "column", children: ["input", "note"] },
    });
    expect(() =>
      defineGroup({
        type: "typed",
        describe: "",
        children: { input: stepper },
        summary: () => "",
        // @ts-expect-error the layout can only name its children
        layout: { kind: "column", children: ["nope"] },
      }),
    ).toThrow(/layout names no child "nope"/);
    expect(() =>
      defineGroup({
        type: "clash",
        describe: "",
        children: { input: stepper },
        derived: { input: { describe: "", compute: () => 1 } },
        summary: () => "",
        layout: { kind: "column", children: ["input"] },
      }),
    ).toThrow(/derived "input" has the name of a child/);
    expect(() =>
      defineGroup({
        type: "unknownField",
        describe: "",
        children: { input: stepper, note: text },
        // @ts-expect-error text has no field "words"
        is: { note: () => ({ words: "x" }) },
        summary: () => "",
        layout: { kind: "column", children: ["input", "note"] },
      }),
    ).toThrow(/text has no field "words"/);
  });

  it("shows a child or not: a hidden child keeps its facts but isn't described", () => {
    const shy = defineGroup({
      type: "shy",
      describe: "",
      children: { input: stepper, note: text },
      is: { note: (s) => ({ tex: `x = ${s.input.value}` }) },
      show: { note: (s) => s.input.value > 0 },
      summary: () => "",
      layout: { kind: "column", children: ["input", "note"] },
    });
    const hidden = initialState(shy, {});
    if (!hidden.isOk) throw new Error();
    expect(observationOf(shy, hidden.state).elements.map((e) => e.id)).not.toContain("note › line");
    const shown = initialState(shy, { input: { value: 2 } });
    if (!shown.isOk) throw new Error();
    expect(observationOf(shy, shown.state).elements).toContainEqual({
      id: "note › line",
      value: "x = 2",
    });
  });

  it("lets a placement leave out an optional child, which then does nothing", () => {
    const placed = initialState(machine, { note: null });
    if (!placed.isOk) throw new Error(placed.errors.join());
    expect(placed.state.note).toBeNull();
    expect(observationOf(machine, placed.state).elements.map((e) => e.id)).not.toContain(
      "note › line",
    );
    expect(initialState(machine, { input: null }).isOk).toBe(false);
  });

  it("binds into a child group's children, nested", () => {
    const inner = defineGroup({
      type: "inner",
      describe: "",
      children: { dial: handle, note: text },
      summary: () => "",
      layout: { kind: "column", children: ["dial", "note"] },
    });
    const outer = defineGroup({
      type: "outer",
      describe: "",
      children: { input: stepper, pane: inner },
      is: { pane: (s) => ({ dial: { x: s.input.value }, note: { tex: `at ${s.input.value}` } }) },
      route: { "pane.dial.move": (_s, a) => [["input.change", { to: a.x }]] },
      summary: () => "",
      layout: { kind: "column", children: ["input", "pane"] },
    });
    const start = initialState(outer, { input: { value: 1 } });
    if (!start.isOk) throw new Error(start.errors.join());
    expect(start.state.pane).toEqual({ dial: {}, note: {} });
    const v = viewOf(outer, start.state) as unknown as Seen;
    expect(v?.pane?.dial).toEqual({ x: 1 });
    expect(v?.pane?.note).toEqual({ tex: "at 1" });
    const prepared = prepareAction(outer, start.state, "pane.dial.move", { x: -2 });
    if (!prepared.isOk || prepared.effect.kind !== EffectKind.Set) throw new Error();
    const next = applyPatch(outer, start.state, prepared.effect.set);
    if (!next.isOk) throw new Error(next.errors.join());
    expect((viewOf(outer, next.state) as unknown as Seen)?.pane?.dial).toEqual({ x: -2 });
  });

  it("describes itself as a tree: each child's elements under its name, controls by path", () => {
    const start = initialState(machine, {});
    if (!start.isOk) throw new Error();
    const seen = observationOf(machine, start.state);
    expect(seen.summary).toBe("the machine, 0 tried");
    expect(seen.elements).toContainEqual({ id: "input › more", does: "input.change" });
    expect(seen.elements).toContainEqual({ id: "dial › handle", value: 0, does: "dial.move" });
  });

  it("is fast enough to drag: a change costs well under a frame, checked fully or lightly", () => {
    const start = initialState(machine, {});
    if (!start.isOk) throw new Error();
    const drag = (n: number) => {
      let state = start.state;
      const t0 = performance.now();
      for (let i = 0; i < n; i++) {
        state = act(state, "dial.move", { x: (i % 6) - 3 }).state;
        viewOf(machine, state);
      }
      return (performance.now() - t0) / n;
    };
    drag(200); // warm up
    const full = drag(2000);
    setStateChecks("light");
    const light = drag(2000);
    setStateChecks("full");
    // A frame is 16 ms. Development checks everything; the shipped app only invariants.
    expect(full).toBeLessThan(1);
    expect(light).toBeLessThan(0.3);
  });
});
