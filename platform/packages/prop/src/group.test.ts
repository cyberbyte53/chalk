import { describe, expect, it } from "vitest";
import { z } from "zod";
import { EffectKind, actionsFor, defineProp, set } from "./define";
import { defineGroup, groupOf } from "./group";
import {
  applyPatch,
  initialState,
  observationOf,
  prepareAction,
  setStateChecks,
  viewOf,
} from "./state";

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
    "working.tex": (s) => `${s.input.value}² = ${s.input.value ** 2}`,
    "dial.x": (s) => s.input.value,
  },
  route: {
    // The handle's x is bound to the stepper: a drag moves the stepper (and nothing past ±3).
    "dial.move": (_s, a) =>
      Math.abs(Number(a.x)) > 10 ? undefined : [["input.change", { to: a.x }]],
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

describe("groups", () => {
  it("keeps each child's own state, merges placements child by child, and makes bindings true", () => {
    const placed = initialState(machine, { input: { value: 2 } });
    if (!placed.isOk) throw new Error(placed.errors.join());
    expect(placed.state.input).toEqual({ value: 2, min: -3, max: 3 });
    expect(placed.state.working).toEqual({ tex: "2² = 4" });
    expect(placed.state.dial).toEqual({ x: 2 });
    expect(initialState(machine, { input: { nope: 1 } }).isOk).toBe(false);
  });

  it("runs a child's own law, then the group's links, as one change", () => {
    const start = initialState(machine, {});
    if (!start.isOk) throw new Error();
    const done = act(start.state, "input.change", { to: 9 });
    // The stepper clamped itself to 3; the working and the handle followed; WHEN put it in.
    expect(done.state.input).toMatchObject({ value: 3 });
    expect(done.state.working).toEqual({ tex: "3² = 9" });
    expect(done.state.dial).toEqual({ x: 3 });
    expect(done.state.tried).toEqual([3]);
    expect(done.emits).toEqual(["input.changed", "put"]);
  });

  it("routes a learner's drag on a bound field to its owner, or refuses it", () => {
    const start = initialState(machine, {});
    if (!start.isOk) throw new Error();
    const dragged = act(start.state, "dial.move", { x: -2 });
    expect(dragged.state.input).toMatchObject({ value: -2 });
    expect(dragged.state.dial).toEqual({ x: -2 });
    expect(dragged.emits).toEqual(["input.changed", "put"]);
    const refused = act(start.state, "dial.move", { x: 50 });
    expect(refused.state).toEqual(start.state);
  });

  it("refuses a group whose learner control writes a bound field without a route", () => {
    expect(() =>
      defineGroup({
        type: "bad",
        describe: "",
        children: { input: stepper, dial: handle },
        is: { "dial.x": (s) => (s.input as Stepper).value },
        summary: () => "",
        layout: { kind: "column", children: ["input", "dial"] },
      }),
    ).toThrow(/dial.move is the learner's and changes dial.x, which is bound: route it/);
  });

  it("checks the whole state: bindings hold and rules across children", () => {
    const start = initialState(machine, {});
    if (!start.isOk) throw new Error();
    expect(applyPatch(machine, start.state, { dial: { x: 2 } }).isOk).toBe(false);
    expect(applyPatch(machine, start.state, { tried: [99] }).isOk).toBe(false);
  });

  it("types its links from its children", () => {
    defineGroup({
      type: "typed",
      describe: "",
      children: { input: stepper, note: text },
      optional: ["note"],
      is: {
        // @ts-expect-error the stepper has no field "valu"
        "note.tex": (s) => String(s.input.valu),
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

  it("describes itself as a tree: each child's elements under its name, controls by path", () => {
    const start = initialState(machine, {});
    if (!start.isOk) throw new Error();
    const seen = observationOf(machine, start.state);
    expect(seen.summary).toBe("the machine, 0 tried");
    expect(seen.elements).toContainEqual({ id: "input › more", does: "input.change" });
    expect(seen.elements).toContainEqual({ id: "dial › handle", value: 0, does: "dial.move" });
    expect(viewOf(machine, start.state).input).toMatchObject({ value: 0 });
    expect(groupOf(machine)?.bound).toEqual(["working.tex", "dial.x"]);
  });

  it("is fast enough to drag: a change costs well under a frame, checked fully or lightly", () => {
    const start = initialState(machine, {});
    if (!start.isOk) throw new Error();
    const drag = (n: number) => {
      let state = start.state;
      const t0 = performance.now();
      for (let i = 0; i < n; i++) state = act(state, "dial.move", { x: (i % 6) - 3 }).state;
      return (performance.now() - t0) / n;
    };
    drag(200); // warm up
    const full = drag(2000);
    setStateChecks("light");
    const light = drag(2000);
    setStateChecks("full");
    // A frame is 16 ms. Development checks everything; the shipped app only invariants.
    expect(full).toBeLessThan(2);
    expect(light).toBeLessThan(0.5);
  });
});
