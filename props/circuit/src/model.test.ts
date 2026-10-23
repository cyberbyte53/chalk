import {
  EffectKind,
  type Emit,
  applyPatch,
  asAnyProp,
  initialState,
  observationOf,
  prepareAction,
  viewOf,
} from "@chalk/prop";
import { describe, expect, it } from "vitest";
import {
  type CircuitReadings,
  type CircuitState,
  type Component,
  ComponentKind,
  circuit,
} from "./model";
import { solveLinear } from "./solve";

const def = asAnyProp(circuit);

type NodeSpec = readonly [id: string, x: number, y: number];
type Read = CircuitState & CircuitReadings;

/** A circuit from nodes and components, through the prop's own schema (so defaults apply). */
function make(nodes: readonly NodeSpec[], components: readonly unknown[]): CircuitState {
  const result = initialState(def, {
    nodes: nodes.map(([id, x, y]) => ({ id, x, y })),
    components,
  });
  if (!result.isOk) throw new Error(result.errors.join("; "));
  return result.state as CircuitState;
}

/**
 * Components joined end to end in a ring: the first joins n0 → n1, the next n1 → n2, and the last
 * comes back to n0. A cell first in the ring pushes current round in that direction.
 */
function ring(...components: readonly Record<string, unknown>[]): CircuitState {
  const count = components.length;
  const nodes: NodeSpec[] = components.map((_, i) => [`n${i}`, i % 11, Math.floor(i / 11)]);
  return make(
    nodes,
    components.map((c, i) => ({ ...c, from: `n${i}`, to: `n${(i + 1) % count}` })),
  );
}

function read(state: CircuitState): Read {
  // viewOf is the public way to read a prop; its type is the generic PropView.
  return viewOf(def, state) as unknown as Read;
}

function run(state: CircuitState, name: string, args: Record<string, unknown> = {}) {
  const result = prepareAction(def, state, name, args);
  if (!result.isOk) throw new Error(result.errors.join("; "));
  if (result.effect.kind !== EffectKind.Set) throw new Error(`${name} should be instant`);
  const next = applyPatch(def, state, result.effect.set);
  if (!next.isOk) throw new Error(next.errors.join("; "));
  return { state: next.state as CircuitState, emit: result.effect.emit };
}

const signalsOf = (emit: readonly Emit[]) => emit.map((e) => e.signal);

const cell = (id: string, volts: number) => ({ kind: ComponentKind.Cell, id, volts });
const bulb = (id: string, ohms: number, ratedVolts = 3) => ({
  kind: ComponentKind.Bulb,
  id,
  ohms,
  ratedVolts,
});
const resistor = (id: string, ohms: number) => ({ kind: ComponentKind.Resistor, id, ohms });
const wire = (id: string) => ({ kind: ComponentKind.Wire, id });
const toggle = (id: string, isClosed: boolean) => ({ kind: ComponentKind.Switch, id, isClosed });
const ammeter = (id: string) => ({ kind: ComponentKind.Ammeter, id });
const voltmeter = (id: string) => ({ kind: ComponentKind.Voltmeter, id });

/** Every number anywhere in a value, with where it is. */
function numbersIn(value: unknown, path = ""): [string, number][] {
  if (typeof value === "number") return [[path, value]];
  if (value === null || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([k, v]) => numbersIn(v, `${path}.${k}`));
}

function expectAllFinite(value: unknown): void {
  for (const [path, n] of numbersIn(value)) {
    expect(Number.isFinite(n), `${path} is ${n}`).toBe(true);
  }
}

/** A 3 V cell and two bulbs side by side, both across the cell's terminals. */
function parallelPair(): CircuitState {
  return make(
    [
      ["minus", 0, 4],
      ["plus", 0, 0],
      ["a", 4, 0],
      ["b", 4, 4],
      ["c", 8, 0],
      ["d", 8, 4],
    ],
    [
      { ...cell("cellA", 3), from: "minus", to: "plus" },
      { ...wire("top1"), from: "plus", to: "a" },
      { ...wire("top2"), from: "a", to: "c" },
      { ...bulb("bulbA", 6), from: "a", to: "b" },
      { ...bulb("bulbB", 6), from: "c", to: "d" },
      { ...wire("bottom2"), from: "d", to: "b" },
      { ...wire("bottom1"), from: "b", to: "minus" },
    ],
  );
}

describe("circuit: Ohm's law and bulbs", () => {
  it("knows circuits only: no lesson-specific fields", () => {
    expect(Object.keys(read(circuit.defaults)).sort()).toEqual(
      [
        "brightness",
        "components",
        "current",
        "direction",
        "isCurrentFlowing",
        "isShortCircuit",
        "nodes",
        "power",
        "reading",
        "shortedCells",
        "voltage",
      ].sort(),
    );
  });

  it("starts as a cell, an open switch and a dark bulb", () => {
    const r = read(circuit.defaults);
    expect(r.isCurrentFlowing).toBe(false);
    expect(Object.values(r.brightness)).toEqual([0]);
  });

  it("drives V/R through everything in one loop: 3 V across 6 Ω is 0.5 A", () => {
    const r = read(ring(cell("cellA", 3), wire("w1"), bulb("bulbA", 6), wire("w2")));
    for (const id of ["cellA", "w1", "bulbA", "w2"]) {
      expect(r.current[id]).toBeCloseTo(0.5, 12);
      expect(r.direction[id]).toBe(1);
    }
    expect(r.voltage.bulbA).toBeCloseTo(3, 12);
    expect(r.voltage.cellA).toBeCloseTo(3, 12);
    expect(r.voltage.w1).toBe(0);
    expect(r.power.bulbA).toBeCloseTo(1.5, 12);
    expect(r.power.cellA).toBeCloseTo(1.5, 12);
    expect(r.brightness.bulbA).toBeCloseTo(1, 12);
    expect(r.isCurrentFlowing).toBe(true);
    expect(r.isShortCircuit).toBe(false);
  });

  it("gives V = IR across a resistor", () => {
    const r = read(ring(cell("cellA", 6), resistor("r1", 4), resistor("r2", 8)));
    expect(r.current.r1).toBeCloseTo(0.5, 12);
    expect(r.voltage.r1).toBeCloseTo(2, 12);
    expect(r.voltage.r2).toBeCloseTo(4, 12);
  });

  it("sends current out of the cell's + end (its `to` end) whichever way it is drawn", () => {
    const s = make(
      [
        ["a", 0, 0],
        ["b", 4, 0],
      ],
      [
        { ...cell("cellA", 3), from: "a", to: "b" },
        { ...bulb("bulbA", 6), from: "a", to: "b" },
      ],
    );
    const r = read(s);
    expect(r.direction.cellA).toBe(1); // inside the cell: − to +
    expect(r.direction.bulbA).toBe(-1); // outside: from + (b) round to − (a)
    expect(r.current.bulbA).toBeCloseTo(0.5, 12);
  });

  it("makes brightness power ÷ rated power, capped at 1", () => {
    // A 6 V bulb on 3 V: half the voltage, a quarter of the power.
    expect(read(ring(cell("c", 3), bulb("b", 6, 6))).brightness.b).toBeCloseTo(0.25, 12);
    // A 1.5 V bulb on 3 V would burn bright: capped.
    expect(read(ring(cell("c", 3), bulb("b", 6, 1.5))).brightness.b).toBe(1);
  });

  it("splits the voltage in series: equal bulbs get half each, the same current, a quarter of the power", () => {
    const single = read(ring(cell("cellA", 3), bulb("bulbA", 6)));
    const r = read(ring(cell("cellA", 3), bulb("bulbA", 6), bulb("bulbB", 6)));
    expect(r.current.bulbA).toBeCloseTo(0.25, 12);
    expect(r.current.bulbB).toBeCloseTo(0.25, 12);
    expect(r.voltage.bulbA).toBeCloseTo(1.5, 12);
    expect(r.voltage.bulbB).toBeCloseTo(1.5, 12);
    expect(r.power.bulbA).toBeCloseTo((single.power.bulbA ?? 0) / 4, 12);
    expect(r.brightness.bulbA).toBeCloseTo(0.25, 12);
  });

  it("in parallel gives each bulb the whole voltage, like a single bulb; the cell's current doubles", () => {
    const single = read(ring(cell("cellA", 3), bulb("bulbA", 6)));
    const r = read(parallelPair());
    for (const id of ["bulbA", "bulbB"]) {
      expect(r.voltage[id]).toBeCloseTo(3, 12);
      expect(r.current[id]).toBeCloseTo(0.5, 12);
      expect(r.brightness[id]).toBeCloseTo(single.brightness.bulbA ?? -1, 12);
    }
    expect(r.current.cellA).toBeCloseTo(2 * (single.current.cellA ?? 0), 12);
    expect(r.current.top1).toBeCloseTo(1, 12);
    expect(r.current.top2).toBeCloseTo(0.5, 12);
  });

  it("adds cells in series, and cells set against each other cancel", () => {
    const aiding = ring(cell("c1", 1.5), cell("c2", 1.5), bulb("b", 6));
    expect(read(aiding).voltage.b).toBeCloseTo(3, 12);
    const opposed = make(
      [
        ["a", 0, 0],
        ["b", 2, 0],
        ["c", 4, 0],
      ],
      [
        { ...cell("c1", 1.5), from: "a", to: "b" },
        { ...cell("c2", 1.5), from: "c", to: "b" },
        { ...bulb("bulbA", 6), from: "c", to: "a" },
      ],
    );
    expect(read(opposed).current.bulbA).toBe(0);
    expect(read(opposed).isCurrentFlowing).toBe(false);
  });

  it("shares current equally between equal cells side by side (not a short circuit)", () => {
    const s = make(
      [
        ["minus", 0, 0],
        ["plus", 4, 0],
      ],
      [
        { ...cell("c1", 1.5), from: "minus", to: "plus" },
        { ...cell("c2", 1.5), from: "minus", to: "plus" },
        { ...bulb("b", 3, 1.5), from: "plus", to: "minus" },
      ],
    );
    const r = read(s);
    expect(r.isShortCircuit).toBe(false);
    expect(r.voltage.b).toBeCloseTo(1.5, 12);
    expect(r.current.c1).toBeCloseTo(0.25, 12);
    expect(r.current.c2).toBeCloseTo(0.25, 12);
  });
});

describe("circuit: switches and sockets", () => {
  const withSwitch = (isClosed: boolean) =>
    ring(cell("cellA", 3), toggle("switchA", isClosed), bulb("bulbA", 6), wire("w"));

  it("an open switch stops the current everywhere in its loop", () => {
    const r = read(withSwitch(false));
    for (const id of ["cellA", "switchA", "bulbA", "w"]) expect(r.current[id]).toBe(0);
    expect(r.brightness.bulbA).toBe(0);
    expect(r.isCurrentFlowing).toBe(false);
    // The whole push of the cell sits across the gap.
    expect(r.voltage.switchA).toBeCloseTo(3, 12);
    expect(r.voltage.bulbA).toBe(0);
  });

  it("closing the switch lets the current flow", () => {
    const { state } = run(withSwitch(false), "toggleSwitch", { component: "switchA" });
    expect(read(state).current.bulbA).toBeCloseTo(0.5, 12);
  });

  it("taking out one bulb in series puts the other out", () => {
    const s = ring(cell("cellA", 3), bulb("bulbA", 6), bulb("bulbB", 6));
    const { state } = run(s, "takeOutBulb", { component: "bulbA" });
    const r = read(state);
    expect(r.brightness.bulbB).toBe(0);
    expect(r.current.bulbB).toBe(0);
    expect(r.voltage.bulbA).toBeCloseTo(3, 12); // across the empty socket
  });

  it("taking out one bulb in parallel leaves the other just as bright", () => {
    const before = read(parallelPair());
    const { state } = run(parallelPair(), "takeOutBulb", { component: "bulbA" });
    const r = read(state);
    expect(r.brightness.bulbA).toBe(0);
    expect(r.brightness.bulbB).toBeCloseTo(before.brightness.bulbB ?? -1, 12);
    expect(r.current.cellA).toBeCloseTo((before.current.cellA ?? 0) / 2, 12);
    const removed = read(run(parallelPair(), "removeComponent", { component: "bulbA" }).state);
    expect(removed.brightness.bulbB).toBeCloseTo(before.brightness.bulbB ?? -1, 12);
  });
});

describe("circuit: meters", () => {
  it("an ammeter in series reads the series current and doesn't change it", () => {
    const plain = read(ring(cell("cellA", 3), wire("x"), bulb("bulbA", 6), resistor("r", 6)));
    const metered = read(ring(cell("cellA", 3), ammeter("am"), bulb("bulbA", 6), resistor("r", 6)));
    expect(metered.reading.am).toBeCloseTo(0.25, 12);
    expect(metered.current.bulbA).toBeCloseTo(plain.current.bulbA ?? -1, 12);
    expect(metered.voltage.am).toBe(0);
  });

  it("a voltmeter reads the voltage across a component and changes nothing", () => {
    const series = () => ring(cell("cellA", 3), bulb("bulbA", 6), resistor("r", 12));
    const plain = read(series());
    const s = series();
    const metered = read({
      ...s,
      components: [
        ...s.components,
        { kind: ComponentKind.Voltmeter, id: "vm", from: "n1", to: "n2" },
      ],
    });
    expect(metered.reading.vm).toBeCloseTo(1, 12); // 6 Ω of 18 Ω, of 3 V
    expect(metered.current.vm).toBe(0);
    for (const id of ["cellA", "bulbA", "r"]) {
      expect(metered.current[id]).toBeCloseTo(plain.current[id] ?? -1, 12);
      expect(metered.voltage[id]).toBeCloseTo(plain.voltage[id] ?? -1, 12);
    }
  });

  it("a voltmeter put in series (the common mistake) reads the cell's voltage and the bulb stays dark", () => {
    const r = read(ring(cell("cellA", 3), voltmeter("vm"), bulb("bulbA", 6)));
    expect(r.reading.vm).toBeCloseTo(3, 12);
    expect(r.brightness.bulbA).toBe(0);
  });

  it("a voltmeter across two separate pieces of circuit reads 0", () => {
    const s = make(
      [
        ["a", 0, 0],
        ["b", 2, 0],
        ["c", 5, 0],
        ["d", 7, 0],
      ],
      [
        { ...cell("c1", 3), from: "a", to: "b" },
        { ...resistor("r1", 3), from: "b", to: "a" },
        { ...cell("c2", 6), from: "c", to: "d" },
        { ...resistor("r2", 3), from: "d", to: "c" },
        { ...voltmeter("vm"), from: "b", to: "d" },
      ],
    );
    expect(read(s).reading.vm).toBe(0);
  });
});

describe("circuit: short circuits", () => {
  it("a wire straight across a cell is a short circuit: flagged, nothing NaN or infinite", () => {
    const s = ring(cell("cellA", 3), bulb("bulbA", 6));
    const shorted = run(s, "addComponent", { kind: "wire", id: "oops", from: "n0", to: "n1" });
    const r = read(shorted.state);
    expect(r.isShortCircuit).toBe(true);
    expect(r.shortedCells).toEqual(["cellA"]);
    expect(r.brightness.bulbA).toBe(0);
    expectAllFinite(r);
  });

  it("a closed switch straight across a cell is a short; opening it ends the short", () => {
    const s = make(
      [
        ["a", 0, 0],
        ["b", 4, 0],
      ],
      [
        { ...cell("cellA", 3), from: "a", to: "b" },
        { ...bulb("bulbA", 6), from: "b", to: "a" },
        { ...toggle("k", true), from: "a", to: "b" },
      ],
    );
    expect(read(s).isShortCircuit).toBe(true);
    const opened = run(s, "toggleSwitch", { component: "k" }).state;
    expect(read(opened).isShortCircuit).toBe(false);
    expect(read(opened).current.bulbA).toBeCloseTo(0.5, 12);
  });

  it("two different ideal cells side by side contradict each other: a short", () => {
    const s = make(
      [
        ["a", 0, 0],
        ["b", 4, 0],
      ],
      [
        { ...cell("c1", 1.5), from: "a", to: "b" },
        { ...cell("c2", 3), from: "a", to: "b" },
      ],
    );
    const r = read(s);
    expect(r.isShortCircuit).toBe(true);
    expect([...r.shortedCells].sort()).toEqual(["c1", "c2"]);
    expectAllFinite(r);
  });

  it("a wire across a bulb shorts the bulb, not the cell: the bulb goes out, the rest carries on", () => {
    const s = ring(cell("cellA", 3), resistor("r", 6), bulb("bulbA", 6));
    const r = read(run(s, "addComponent", { kind: "wire", id: "w", from: "n2", to: "n0" }).state);
    expect(r.isShortCircuit).toBe(false);
    expect(r.brightness.bulbA).toBe(0);
    expect(r.current.r).toBeCloseTo(0.5, 12);
    expect(r.current.w).toBeCloseTo(0.5, 12);
  });

  it("a 0 V cell joined end to end by a wire is no short", () => {
    const r = read(ring(cell("c", 0), wire("w")));
    expect(r.isShortCircuit).toBe(false);
    expect(r.isCurrentFlowing).toBe(false);
  });
});

/** A small seeded generator (an LCG), so the random networks are the same every run. */
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function randomNetwork(random: () => number): CircuitState {
  const pick = <T>(items: readonly T[]): T => items[Math.floor(random() * items.length)] as T;
  const nodeCount = 2 + Math.floor(random() * 7);
  const nodes: NodeSpec[] = Array.from({ length: nodeCount }, (_, i) => [`n${i}`, i, i % 3]);
  const count = 2 + Math.floor(random() * 11);
  const components: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i++) {
    const from = Math.floor(random() * nodeCount);
    const to = (from + 1 + Math.floor(random() * (nodeCount - 1))) % nodeCount;
    const ends = { id: `c${i}`, from: `n${from}`, to: `n${to}` };
    const kind =
      i === 0
        ? "cell"
        : pick([
            "cell",
            "bulb",
            "bulb",
            "bulb",
            "resistor",
            "resistor",
            "resistor",
            "switch",
            "wire",
            "ammeter",
            "voltmeter",
          ]);
    const value = Math.round(1 + random() * 20);
    if (kind === "cell") components.push({ ...ends, kind, volts: pick([1.5, 3, 4.5, 6, 9]) });
    else if (kind === "bulb")
      components.push({ ...ends, kind, ohms: value, ratedVolts: 1.5, isInSocket: random() > 0.2 });
    else if (kind === "resistor") components.push({ ...ends, kind, ohms: value });
    else if (kind === "switch") components.push({ ...ends, kind, isClosed: random() > 0.3 });
    else components.push({ ...ends, kind });
  }
  return make(nodes, components);
}

describe("circuit: laws over many random networks", () => {
  const random = seeded(20261011);
  const networks = Array.from({ length: 600 }, () => randomNetwork(random));

  it("never gives NaN or infinity, shorted or not", () => {
    for (const s of networks) expectAllFinite(read(s));
  });

  it("solves enough of them to mean something", () => {
    const solved = networks.filter((s) => {
      const r = read(s);
      return !r.isShortCircuit && r.isCurrentFlowing;
    });
    expect(solved.length).toBeGreaterThan(150);
  });

  it("keeps Kirchhoff's current law at every node: current in = current out", () => {
    for (const s of networks) {
      const r = read(s);
      const net = new Map(s.nodes.map((n) => [n.id, 0]));
      let largest = 0;
      for (const c of s.components) {
        const i = (r.current[c.id] ?? 0) * (r.direction[c.id] ?? 0);
        largest = Math.max(largest, Math.abs(i));
        net.set(c.from, (net.get(c.from) ?? 0) - i);
        net.set(c.to, (net.get(c.to) ?? 0) + i);
      }
      for (const [node, value] of net) {
        expect(Math.abs(value), `node ${node}`).toBeLessThan(1e-9 * (1 + largest));
      }
    }
  });

  it("balances power: what the cells give is what the bulbs and resistors use", () => {
    for (const s of networks) {
      const r = read(s);
      let given = 0;
      let used = 0;
      for (const c of s.components) {
        if (c.kind === ComponentKind.Cell) given += r.power[c.id] ?? 0;
        else used += r.power[c.id] ?? 0;
      }
      expect(Math.abs(given - used)).toBeLessThan(1e-9 * (1 + Math.abs(used)));
    }
  });

  it("obeys each component's own law: V = IR, a cell's voltage is its volts, meters are ideal", () => {
    for (const s of networks) {
      const r = read(s);
      if (r.isShortCircuit) continue;
      for (const c of s.components) {
        const i = r.current[c.id] ?? 0;
        const v = r.voltage[c.id] ?? 0;
        if (c.kind === ComponentKind.Resistor || (c.kind === ComponentKind.Bulb && c.isInSocket)) {
          expect(Math.abs(v - i * c.ohms)).toBeLessThan(1e-9 * (1 + v));
        }
        if (c.kind === ComponentKind.Cell) expect(v).toBeCloseTo(c.volts, 9);
        if (c.kind === ComponentKind.Wire || c.kind === ComponentKind.Ammeter) expect(v).toBe(0);
        if (c.kind === ComponentKind.Ammeter) expect(r.reading[c.id]).toBe(i);
        if (c.kind === ComponentKind.Voltmeter) expect(i).toBe(0);
        if (c.kind === ComponentKind.Bulb && !c.isInSocket) expect(i).toBe(0);
        if (c.kind === ComponentKind.Bulb) {
          const b = r.brightness[c.id] ?? -1;
          expect(b).toBeGreaterThanOrEqual(0);
          expect(b).toBeLessThanOrEqual(1);
        }
      }
    }
  });
});

describe("circuit: actions change what they say and keep the rest", () => {
  const start = (): CircuitState =>
    make(
      [
        ["a", 0, 4],
        ["b", 0, 0],
        ["c", 4, 0],
        ["d", 4, 4],
      ],
      [
        { ...cell("cellA", 3), from: "a", to: "b" },
        { ...bulb("bulbA", 6), from: "b", to: "c" },
        { ...toggle("switchA", false), from: "c", to: "d" },
        { ...resistor("r", 6), from: "d", to: "a" },
      ],
    );
  const only = (s: CircuitState, id: string) => s.components.find((c) => c.id === id);
  const others = (s: CircuitState, id: string) => s.components.filter((c) => c.id !== id);

  /** Runs an action and checks that nothing but the named component changed. */
  function changesOnly(name: string, args: Record<string, unknown>, id: string) {
    const before = start();
    const after = run(before, name, args);
    expect(after.state.nodes).toEqual(before.nodes);
    expect(others(after.state, id)).toEqual(others(before, id));
    return { before: only(before, id), after: only(after.state, id), emit: after.emit };
  }

  it("toggleSwitch flips one switch and says so", () => {
    const { before, after, emit } = changesOnly(
      "toggleSwitch",
      { component: "switchA" },
      "switchA",
    );
    expect(after).toEqual({ ...before, isClosed: true });
    expect(emit).toEqual([
      { signal: "switched", payload: { component: "switchA", isClosed: true } },
      { signal: "changed" },
    ]);
  });

  it("setSwitch sets one switch, and is silent when nothing changes", () => {
    const { after, emit } = changesOnly(
      "setSwitch",
      { component: "switchA", isClosed: true },
      "switchA",
    );
    expect(after).toMatchObject({ isClosed: true });
    expect(signalsOf(emit)).toEqual(["switched", "changed"]);
    const same = run(start(), "setSwitch", { component: "switchA", isClosed: false });
    expect(same.emit).toEqual([]);
    expect(same.state).toEqual(start());
  });

  it("takeOutBulb and putBackBulb change only the socket", () => {
    const out = changesOnly("takeOutBulb", { component: "bulbA" }, "bulbA");
    expect(out.after).toEqual({ ...out.before, isInSocket: false });
    expect(out.emit).toEqual([
      { signal: "bulbTakenOut", payload: { component: "bulbA" } },
      { signal: "changed" },
    ]);
    const outState = run(start(), "takeOutBulb", { component: "bulbA" }).state;
    const back = run(outState, "putBackBulb", { component: "bulbA" });
    expect(back.state).toEqual(start());
    expect(signalsOf(back.emit)).toEqual(["bulbPutBack", "changed"]);
    expect(run(start(), "putBackBulb", { component: "bulbA" }).emit).toEqual([]);
  });

  it("setVolts changes one cell's volts and keeps its + end", () => {
    const { before, after, emit } = changesOnly(
      "setVolts",
      { component: "cellA", volts: 6 },
      "cellA",
    );
    expect(after).toEqual({ ...before, volts: 6 });
    expect(signalsOf(emit)).toEqual(["changed"]);
  });

  it("setOhms changes one bulb's or resistor's ohms and keeps its rating and socket", () => {
    const b = changesOnly("setOhms", { component: "bulbA", ohms: 12 }, "bulbA");
    expect(b.after).toEqual({ ...b.before, ohms: 12 });
    const r = changesOnly("setOhms", { component: "r", ohms: 2 }, "r");
    expect(r.after).toEqual({ ...r.before, ohms: 2 });
  });

  it("addComponent adds one component and keeps the rest; a bulb gets its defaults", () => {
    const before = start();
    const after = run(before, "addComponent", {
      kind: "bulb",
      id: "bulbB",
      from: "a",
      to: "c",
      ohms: 4,
    });
    expect(after.state.nodes).toEqual(before.nodes);
    expect(after.state.components.slice(0, -1)).toEqual(before.components);
    expect(after.state.components.at(-1)).toEqual({
      kind: "bulb",
      id: "bulbB",
      from: "a",
      to: "c",
      ohms: 4,
      ratedVolts: 1.5,
      isInSocket: true,
    });
    expect(signalsOf(after.emit)).toEqual(["changed"]);
  });

  it("removeComponent removes one component and keeps every node", () => {
    const before = start();
    const after = run(before, "removeComponent", { component: "r" });
    expect(after.state.nodes).toEqual(before.nodes);
    expect(after.state.components).toEqual(others(before, "r"));
    expect(signalsOf(after.emit)).toEqual(["changed"]);
  });

  it("addNode adds one node and keeps every component", () => {
    const before = start();
    const after = run(before, "addNode", { id: "e", x: 8, y: 0 });
    expect(after.state.components).toEqual(before.components);
    expect(after.state.nodes).toEqual([...before.nodes, { id: "e", x: 8, y: 0 }]);
  });

  it("fails loudly on a component that isn't there or is the wrong kind", () => {
    expect(() => run(start(), "toggleSwitch", { component: "nope" })).toThrow(/no switch/);
    expect(() => run(start(), "setVolts", { component: "bulbA", volts: 3 })).toThrow(/no cell/);
    expect(() => run(start(), "setOhms", { component: "cellA", ohms: 3 })).toThrow(
      /no bulb or resistor/,
    );
    expect(() => run(start(), "takeOutBulb", { component: "r" })).toThrow(/no bulb/);
    expect(() => run(start(), "removeComponent", { component: "nope" })).toThrow(/no component/);
  });

  it("refuses an added component that breaks the rules", () => {
    expect(() =>
      run(start(), "addComponent", { kind: "wire", id: "bulbA", from: "a", to: "c" }),
    ).toThrow(/unique/);
    expect(() =>
      run(start(), "addComponent", { kind: "wire", id: "w", from: "a", to: "zz" }),
    ).toThrow(/zz/);
    expect(() =>
      run(start(), "addComponent", { kind: "resistor", id: "w", from: "a", to: "c", ohms: 0 }),
    ).toThrow();
    expect(() => run(start(), "addNode", { id: "e", x: 0, y: 0 })).toThrow(/same place/);
    expect(() => run(start(), "setVolts", { component: "cellA", volts: -1 })).toThrow();
  });
});

describe("circuit: schema and invariant refusals", () => {
  const nodes = [
    { id: "a", x: 0, y: 0 },
    { id: "b", x: 2, y: 0 },
  ];
  const refuse = (state: Record<string, unknown>) => initialState(def, state).isOk;

  it("accepts a good circuit", () => {
    expect(refuse({ nodes, components: [{ kind: "wire", id: "w", from: "a", to: "b" }] })).toBe(
      true,
    );
  });

  it("refuses broken circuits", () => {
    const w = { kind: "wire", id: "w", from: "a", to: "b" };
    expect(refuse({ nodes, components: [w, w] })).toBe(false); // ids repeat
    expect(refuse({ nodes, components: [{ ...w, id: "a" }] })).toBe(false); // id is a node's
    expect(refuse({ nodes, components: [{ ...w, to: "a" }] })).toBe(false); // both ends the same
    expect(refuse({ nodes, components: [{ ...w, to: "c" }] })).toBe(false); // no such node
    expect(refuse({ nodes: [...nodes, { id: "c", x: 0, y: 0 }], components: [] })).toBe(false);
    expect(refuse({ nodes: [{ id: "a", x: 11, y: 0 }], components: [] })).toBe(false); // off the grid
    expect(refuse({ nodes: [{ id: "a", x: 0.5, y: 0 }], components: [] })).toBe(false);
    expect(refuse({ nodes, components: [{ ...w, kind: "fuse" }] })).toBe(false);
    expect(refuse({ nodes, components: [{ ...w, colour: "red" }] })).toBe(false); // strict
    expect(refuse({ nodes, components: [{ ...w, kind: "cell", volts: -1 }] })).toBe(false);
    expect(refuse({ nodes, components: [{ ...w, kind: "bulb", ohms: 0 }] })).toBe(false);
    expect(refuse({ nodes, components: [{ ...w, kind: "switch" }] })).toBe(false); // needs isClosed
    expect(refuse({ nodes, components: [{ ...w, id: "Bad id" }] })).toBe(false);
    expect(refuse({ nodes, components: [{ ...w, label: { en: "Wire" } }] })).toBe(false);
    const many = Array.from({ length: 21 }, (_, i) => ({
      id: `n${i}`,
      x: i % 11,
      y: Math.floor(i / 11),
    }));
    expect(refuse({ nodes: many, components: [] })).toBe(false);
  });
});

describe("circuit: parts", () => {
  it("names every component the student can tell apart: not wires, not junctions", () => {
    const view = read(circuit.defaults);
    const parts = circuit.parts?.(view) ?? [];
    for (const c of circuit.defaults.components)
      if (c.kind === ComponentKind.Wire) expect(parts).not.toContain(c.id);
      else expect(parts).toContain(c.id);
    for (const n of circuit.defaults.nodes) expect(parts).not.toContain(n.id);
  });

  it("is seen as its symbols show it: dials, switch positions, glow; currents stay hidden", () => {
    const seen = observationOf(asAnyProp(circuit), circuit.defaults);
    const byId = new Map(seen.elements.map((e) => [e.id, String(e.value)]));
    for (const c of circuit.defaults.components) {
      if (c.kind === ComponentKind.Wire) expect(byId.has(c.id)).toBe(false);
      else expect(byId.has(c.id), c.id).toBe(true);
    }
    for (const [id, text] of byId) {
      const c = circuit.defaults.components.find((x) => x.id === id);
      if (c?.kind === ComponentKind.Ammeter) expect(text).toMatch(/reads \d+\.\d\d A$/);
      if (c?.kind === ComponentKind.Switch) expect(text).toMatch(/closed|open/);
      if (c?.kind === ComponentKind.Bulb) expect(text).toMatch(/glowing|dark|taken out/);
    }
    // What the circuit works out but no symbol shows is labelled hidden, never an element.
    expect(Object.keys(seen.hidden ?? {})).toEqual(["current", "voltage"]);
    expect(JSON.stringify(seen.elements)).not.toContain("brightness");
  });

  it("locates switches and bulbs with tap targets at least 44 px, and nothing else by guesswork", () => {
    const view = read(circuit.defaults);
    const switchId =
      circuit.defaults.components.find((c: Component) => c.kind === "switch")?.id ?? "";
    const box = circuit.locate?.(view, switchId, 340);
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(circuit.locate?.(view, "nothing", 340)).toBeUndefined();
  });
});

describe("solveLinear", () => {
  it("solves a small system with pivoting", () => {
    const x = solveLinear(
      [
        [0, 2, 1],
        [1, 1, 1],
        [2, 1, 0],
      ],
      [7, 6, 4],
    );
    expect(x[0]).toBeCloseTo(1, 12);
    expect(x[1]).toBeCloseTo(2, 12);
    expect(x[2]).toBeCloseTo(3, 12);
  });

  it("stays finite on a singular system", () => {
    const x = solveLinear(
      [
        [1, 1],
        [1, 1],
      ],
      [1, 2],
    );
    for (const v of x) expect(Number.isFinite(v)).toBe(true);
  });
});
