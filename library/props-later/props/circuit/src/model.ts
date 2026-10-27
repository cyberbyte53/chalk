import { localizedSchema } from "@chalk/content";
import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { type ZodType, z } from "zod";
import { HIT_SIZE, layoutFor, placeAll } from "./layout";
import { ElementKind, type Element as NetElement, clean, solveNetwork } from "./solve";

export const ComponentKind = {
  Cell: "cell",
  Bulb: "bulb",
  Resistor: "resistor",
  Switch: "switch",
  Wire: "wire",
  Ammeter: "ammeter",
  Voltmeter: "voltmeter",
} as const;
export type ComponentKind = (typeof ComponentKind)[keyof typeof ComponentKind];

export const CircuitSignal = {
  Switched: "switched",
  BulbTakenOut: "bulbTakenOut",
  BulbPutBack: "bulbPutBack",
  Changed: "changed",
} as const;

export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 8;
export const MAX_NODES = 20;
export const MAX_COMPONENTS = 30;
const MAX_VOLTS = 240;
const MAX_OHMS = 100_000;
/** A bulb's rated voltage when the lesson doesn't give one: a torch bulb on one cell. */
export const DEFAULT_RATED_VOLTS = 1.5;

const idSchema = z
  .string()
  .max(32)
  .regex(/^[a-z][A-Za-z0-9]*$/, "must be a camelCase name");
const voltsSchema = z.number().min(0).max(MAX_VOLTS);
const ohmsSchema = z.number().positive().max(MAX_OHMS);

const nodeSchema = z
  .object({
    id: idSchema,
    x: z.number().int().min(0).max(GRID_WIDTH),
    y: z.number().int().min(0).max(GRID_HEIGHT),
    label: localizedSchema.optional(),
  })
  .strict();
export type CircuitNode = z.infer<typeof nodeSchema>;

const ends = {
  id: idSchema,
  /** The node one end joins. */
  from: idSchema,
  /** The node the other end joins (a cell's + terminal). */
  to: idSchema,
  label: localizedSchema.optional(),
};

const componentSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal(ComponentKind.Cell), ...ends, volts: voltsSchema }).strict(),
  z
    .object({
      kind: z.literal(ComponentKind.Bulb),
      ...ends,
      ohms: ohmsSchema,
      ratedVolts: z.number().positive().max(MAX_VOLTS).default(DEFAULT_RATED_VOLTS),
      isInSocket: z.boolean().default(true),
    })
    .strict(),
  z.object({ kind: z.literal(ComponentKind.Resistor), ...ends, ohms: ohmsSchema }).strict(),
  z.object({ kind: z.literal(ComponentKind.Switch), ...ends, isClosed: z.boolean() }).strict(),
  z.object({ kind: z.literal(ComponentKind.Wire), ...ends }).strict(),
  z.object({ kind: z.literal(ComponentKind.Ammeter), ...ends }).strict(),
  z.object({ kind: z.literal(ComponentKind.Voltmeter), ...ends }).strict(),
]);
export type Component = z.infer<typeof componentSchema>;
type ComponentOf<K extends ComponentKind> = Extract<Component, { kind: K }>;

const circuitSchema = z
  .object({
    nodes: z.array(nodeSchema).max(MAX_NODES),
    components: z.array(componentSchema).max(MAX_COMPONENTS),
  })
  .strict();
export type CircuitState = z.infer<typeof circuitSchema>;

/** What follows from the circuit by its laws. Records are keyed by component id. */
export type CircuitReadings = {
  current: Record<string, number>;
  direction: Record<string, number>;
  voltage: Record<string, number>;
  power: Record<string, number>;
  brightness: Record<string, number>;
  reading: Record<string, number>;
  isShortCircuit: boolean;
  shortedCells: string[];
  isCurrentFlowing: boolean;
};

/** Below this many amps, nothing is flowing (rounding dust). */
const NO_CURRENT = 1e-9;

function elementFor(c: Component, index: (id: string) => number): NetElement {
  const from = index(c.from);
  const to = index(c.to);
  switch (c.kind) {
    case ComponentKind.Cell:
      return { kind: ElementKind.Source, from, to, volts: c.volts };
    case ComponentKind.Bulb:
      return c.isInSocket
        ? { kind: ElementKind.Resistance, from, to, ohms: c.ohms }
        : { kind: ElementKind.Gap, from, to };
    case ComponentKind.Resistor:
      return { kind: ElementKind.Resistance, from, to, ohms: c.ohms };
    case ComponentKind.Switch:
      return { kind: c.isClosed ? ElementKind.Short : ElementKind.Gap, from, to };
    case ComponentKind.Wire:
    case ComponentKind.Ammeter:
      return { kind: ElementKind.Short, from, to };
    case ComponentKind.Voltmeter:
      return { kind: ElementKind.Gap, from, to };
  }
}

/** Solves the circuit. Pure; remembered per state object, since every derived field reads it. */
function measureNow(s: CircuitState): CircuitReadings {
  const nodeIndex = new Map(s.nodes.map((n, i) => [n.id, i]));
  const index = (id: string) => nodeIndex.get(id) ?? 0; // the invariant guarantees ends exist
  const solution = solveNetwork(
    s.nodes.length,
    s.components.map((c) => elementFor(c, index)),
  );
  const out: CircuitReadings = {
    current: {},
    direction: {},
    voltage: {},
    power: {},
    brightness: {},
    reading: {},
    isShortCircuit: solution.isShortedNode.some(Boolean),
    shortedCells: [],
    isCurrentFlowing: false,
  };
  s.components.forEach((c, k) => {
    const from = index(c.from);
    const to = index(c.to);
    const isSolved = !(solution.isShortedNode[from] ?? false);
    const signed = isSolved ? (solution.current[k] ?? 0) : 0;
    const amps = Math.abs(signed) > NO_CURRENT ? Math.abs(signed) : 0;
    const across =
      isSolved && solution.piece[from] === solution.piece[to]
        ? clean(Math.abs((solution.potential[from] ?? 0) - (solution.potential[to] ?? 0)))
        : 0;
    out.current[c.id] = amps;
    out.direction[c.id] = amps === 0 ? 0 : Math.sign(signed);
    if (amps > 0) out.isCurrentFlowing = true;
    switch (c.kind) {
      case ComponentKind.Cell:
        out.voltage[c.id] = isSolved ? c.volts : 0;
        // Given out: positive when current leaves by the + end.
        out.power[c.id] = clean(c.volts * (amps === 0 ? 0 : signed));
        if (solution.isShortedSource[k]) out.shortedCells.push(c.id);
        break;
      case ComponentKind.Bulb:
      case ComponentKind.Resistor: {
        const isConducting = c.kind === ComponentKind.Resistor || c.isInSocket;
        out.voltage[c.id] = across;
        out.power[c.id] = isConducting ? clean(amps * amps * c.ohms) : 0;
        if (c.kind === ComponentKind.Bulb) {
          // Power ÷ rated power = (V ÷ rated V)², since both are across the same resistance.
          out.brightness[c.id] = c.isInSocket
            ? Math.min(1, clean((across / c.ratedVolts) ** 2))
            : 0;
        }
        break;
      }
      case ComponentKind.Switch:
      case ComponentKind.Wire:
        out.voltage[c.id] = c.kind === ComponentKind.Switch && !c.isClosed ? across : 0;
        out.power[c.id] = 0;
        break;
      case ComponentKind.Ammeter:
        out.voltage[c.id] = 0;
        out.power[c.id] = 0;
        out.reading[c.id] = amps;
        break;
      case ComponentKind.Voltmeter:
        out.voltage[c.id] = across;
        out.power[c.id] = 0;
        out.reading[c.id] = across;
        break;
    }
  });
  return out;
}

const remembered = new WeakMap<CircuitState, CircuitReadings>();

/** The circuit's readings (current, voltage, brightness…), solved once per state. */
export function measure(s: CircuitState): CircuitReadings {
  const known = remembered.get(s);
  if (known !== undefined) return known;
  const fresh = measureNow(s);
  remembered.set(s, fresh);
  return fresh;
}

const act = actionsFor<CircuitState>();
const changed: Emit = { signal: CircuitSignal.Changed };
const named = z.object({ component: idSchema }).strict();

/** The component with this id and kind, or a loud error naming what was asked for. */
function find<K extends ComponentKind>(
  s: CircuitState,
  id: string,
  kinds: readonly K[],
  action: string,
  what: string,
): ComponentOf<K> {
  const c = s.components.find((x) => x.id === id);
  if (c === undefined || !(kinds as readonly string[]).includes(c.kind)) {
    throw new Error(`circuit.${action}: there is no ${what} named "${id}"`);
  }
  // Just checked: its kind is one of `kinds`.
  return c as ComponentOf<K>;
}

/** The components with one replaced (same place in the list). */
function replace(s: CircuitState, next: Component): Component[] {
  return s.components.map((c) => (c.id === next.id ? next : c));
}

function setSwitch(s: CircuitState, id: string, isClosed: boolean, action: string) {
  const c = find(s, id, [ComponentKind.Switch], action, "switch");
  if (c.isClosed === isClosed) return set<CircuitState>({});
  return set<CircuitState>(
    { components: replace(s, { ...c, isClosed }) },
    { signal: CircuitSignal.Switched, payload: { component: id, isClosed } },
    changed,
  );
}

function setSocket(s: CircuitState, id: string, isInSocket: boolean, action: string) {
  const c = find(s, id, [ComponentKind.Bulb], action, "bulb");
  if (c.isInSocket === isInSocket) return set<CircuitState>({});
  return set<CircuitState>(
    { components: replace(s, { ...c, isInSocket }) },
    {
      signal: isInSocket ? CircuitSignal.BulbPutBack : CircuitSignal.BulbTakenOut,
      payload: { component: id },
    },
    changed,
  );
}

const reading = (describe: string, pick: (r: CircuitReadings) => unknown) => ({
  describe,
  compute: (s: CircuitState) => pick(measure(s)),
});

/** A simple DC circuit of ideal components. It knows circuits and Ohm's law, nothing about any lesson. */
export const circuit = defineProp({
  type: "circuit",
  describe:
    "A simple electric circuit: cells, bulbs, resistors, switches, wires, ammeters and voltmeters joined at nodes on a grid, all ideal. It works out the current through and voltage across every component, how bright each bulb glows and what each meter reads. The learner can open and close switches and take bulbs out of their sockets.",
  // The schema fills in bulbs' defaults (rated volts, in the socket), so what it accepts is looser
  // than what it gives; every state still passes through it, so the stored state is always whole.
  state: circuitSchema as unknown as ZodType<CircuitState>,
  defaults: {
    nodes: [
      { id: "a", x: 0, y: 4 },
      { id: "b", x: 0, y: 0 },
      { id: "c", x: 6, y: 0 },
      { id: "d", x: 6, y: 4 },
    ],
    components: [
      { kind: ComponentKind.Cell, id: "cellA", from: "a", to: "b", volts: 1.5 },
      {
        kind: ComponentKind.Bulb,
        id: "bulbA",
        from: "b",
        to: "c",
        ohms: 5,
        ratedVolts: DEFAULT_RATED_VOLTS,
        isInSocket: true,
      },
      { kind: ComponentKind.Switch, id: "switchA", from: "c", to: "d", isClosed: false },
      { kind: ComponentKind.Wire, id: "wireA", from: "d", to: "a" },
    ],
  },
  derived: {
    current: reading("Amps through each component, by id (never negative)", (r) => r.current),
    direction: reading(
      "Which way conventional current goes through each component: 1 from its `from` end to its `to` end, -1 the other way, 0 none",
      (r) => r.direction,
    ),
    voltage: reading("Volts across each component, by id (never negative)", (r) => r.voltage),
    power: reading(
      "Watts each component uses, by id; for a cell, the watts it gives",
      (r) => r.power,
    ),
    brightness: reading(
      "How bright each bulb glows, 0 to 1: its power ÷ its rated power, capped at 1",
      (r) => r.brightness,
    ),
    reading: reading(
      "What each ammeter (amps) and voltmeter (volts) reads, by id",
      (r) => r.reading,
    ),
    isShortCircuit: reading(
      "A cell's terminals are joined with no resistance between them (or ideal cells contradict each other); then that piece of circuit reads 0 everywhere",
      (r) => r.isShortCircuit,
    ),
    shortedCells: reading("The ids of the short-circuited cells", (r) => r.shortedCells),
    isCurrentFlowing: reading("Current flows somewhere in the circuit", (r) => r.isCurrentFlowing),
  },
  actions: {
    toggleSwitch: act({
      describe:
        "Close an open switch or open a closed one (what the learner's finger does). Keeps every other component and the nodes fixed.",
      byLearner: true,
      args: named,
      run: (s, a) => {
        const c = find(s, a.component, [ComponentKind.Switch], "toggleSwitch", "switch");
        return setSwitch(s, a.component, !c.isClosed, "toggleSwitch");
      },
    }),
    takeOutBulb: act({
      describe:
        "Take a bulb out of its socket, breaking the circuit there (the learner's finger). Keeps its ohms and rating, every other component and the nodes fixed.",
      byLearner: true,
      args: named,
      run: (s, a) => setSocket(s, a.component, false, "takeOutBulb"),
    }),
    putBackBulb: act({
      describe:
        "Put a bulb back in its socket (the learner's finger). Keeps its ohms and rating, every other component and the nodes fixed.",
      byLearner: true,
      args: named,
      run: (s, a) => setSocket(s, a.component, true, "putBackBulb"),
    }),
    setSwitch: act({
      describe:
        "Open or close a switch. Keeps every other component and the nodes fixed; does nothing if it is already so.",
      args: z.object({ component: idSchema, isClosed: z.boolean() }).strict(),
      run: (s, a) => setSwitch(s, a.component, a.isClosed, "setSwitch"),
    }),
    setVolts: act({
      describe:
        "Change a cell's volts. Keeps which end is +, every other component and the nodes fixed.",
      args: z.object({ component: idSchema, volts: voltsSchema }).strict(),
      run: (s, a) => {
        const c = find(s, a.component, [ComponentKind.Cell], "setVolts", "cell");
        return set({ components: replace(s, { ...c, volts: a.volts }) }, changed);
      },
    }),
    setOhms: act({
      describe:
        "Change a bulb's or resistor's resistance in ohms. Keeps a bulb's rating and socket, every other component and the nodes fixed.",
      args: z.object({ component: idSchema, ohms: ohmsSchema }).strict(),
      run: (s, a) => {
        const kinds = [ComponentKind.Bulb, ComponentKind.Resistor] as const;
        const c = find(s, a.component, kinds, "setOhms", "bulb or resistor");
        return set({ components: replace(s, { ...c, ohms: a.ohms }) }, changed);
      },
    }),
    addComponent: act({
      describe:
        "Add a component between two existing nodes ({ kind, id, from, to, … }). Keeps the nodes and every other component fixed.",
      args: componentSchema,
      run: (s, a) => set({ components: [...s.components, a] }, changed),
    }),
    removeComponent: act({
      describe:
        "Take a component out of the circuit. Keeps the nodes (even ones left bare) and every other component fixed.",
      args: named,
      run: (s, a) => {
        if (!s.components.some((c) => c.id === a.component)) {
          throw new Error(`circuit.removeComponent: there is no component named "${a.component}"`);
        }
        return set({ components: s.components.filter((c) => c.id !== a.component) }, changed);
      },
    }),
    addNode: act({
      describe:
        "Add a node (a point components can join) on the grid. Keeps every component and node fixed.",
      args: nodeSchema,
      run: (s, a) => set({ nodes: [...s.nodes, a] }, changed),
    }),
  },
  signals: {
    [CircuitSignal.Switched]: {
      describe: "A switch was opened or closed; `component` says which, `isClosed` how it is now",
    },
    [CircuitSignal.BulbTakenOut]: { describe: "A bulb was taken out of its socket (`component`)" },
    [CircuitSignal.BulbPutBack]: { describe: "A bulb was put back in its socket (`component`)" },
    [CircuitSignal.Changed]: {
      describe: "Something in the circuit changed, so its currents may have too",
    },
  },
  observe: (s) => {
    // What the student sees: each component as drawn, with the one thing its symbol shows. Wires
    // show nothing; currents are seen only on an ammeter's dial; nodes are unlabelled junctions.
    const r = measure(s);
    const elements: Element[] = [];
    const bulbs: string[] = [];
    for (const c of s.components) {
      const name = c.label?.en ?? c.id;
      switch (c.kind) {
        case ComponentKind.Cell:
          elements.push({
            id: c.id,
            value: `cell, ${c.volts} V${r.shortedCells.includes(c.id) ? ", short-circuited" : ""}`,
          });
          break;
        case ComponentKind.Bulb: {
          const glow = !c.isInSocket
            ? "taken out of its socket"
            : (r.brightness[c.id] ?? 0) > 0
              ? "glowing"
              : "dark";
          elements.push({ id: c.id, value: `bulb ${name}, ${c.ohms} Ω, ${glow}` });
          bulbs.push(`${name} ${glow}`);
          break;
        }
        case ComponentKind.Resistor:
          elements.push({ id: c.id, value: `resistor, ${c.ohms} Ω` });
          break;
        case ComponentKind.Switch:
          elements.push({ id: c.id, value: `switch ${name}, ${c.isClosed ? "closed" : "open"}` });
          break;
        case ComponentKind.Ammeter:
          elements.push({
            id: c.id,
            value: `ammeter ${name} reads ${(r.reading[c.id] ?? 0).toFixed(2)} A`,
          });
          break;
        case ComponentKind.Voltmeter:
          elements.push({
            id: c.id,
            value: `voltmeter ${name} reads ${(r.reading[c.id] ?? 0).toFixed(2)} V`,
          });
          break;
        case ComponentKind.Wire:
          break;
      }
    }
    const count = (kind: ComponentKind) => s.components.filter((c) => c.kind === kind).length;
    const summary = `a circuit with ${count(ComponentKind.Cell)} cell(s), ${count(ComponentKind.Bulb)} bulb(s)${count(ComponentKind.Switch) > 0 ? `, ${count(ComponentKind.Switch)} switch(es)` : ""}${count(ComponentKind.Ammeter) > 0 ? `, ${count(ComponentKind.Ammeter)} ammeter(s)` : ""}${count(ComponentKind.Voltmeter) > 0 ? `, ${count(ComponentKind.Voltmeter)} voltmeter(s)` : ""}${bulbs.length > 0 ? `: ${bulbs.join(", ")}` : ""}${r.isShortCircuit ? " (short circuit)" : ""}`;
    return {
      summary,
      elements,
      // Worked out by the circuit, shown nowhere: what each wire and bulb carries.
      hidden: { current: r.current, voltage: r.voltage },
    };
  },
  parts: (s) => s.components.filter((c) => c.kind !== ComponentKind.Wire).map((c) => c.id),
  locate: (s, part, width) => {
    const layout = layoutFor(s.nodes, width);
    const node = s.nodes.find((n) => n.id === part);
    if (node !== undefined) {
      const p = layout.at(node);
      return { x: p.x - 14, y: p.y - 14, width: 28, height: 28 };
    }
    const place = placeAll(layout, s.nodes, s.components).get(part);
    if (place === undefined) return undefined;
    const half = HIT_SIZE / 2;
    return { x: place.mid.x - half, y: place.mid.y - half, width: HIT_SIZE, height: HIT_SIZE };
  },
  invariant: (s) => {
    const seen = new Set<string>();
    for (const id of [...s.nodes.map((n) => n.id), ...s.components.map((c) => c.id)]) {
      if (seen.has(id)) return `ids must be unique across nodes and components: "${id}" repeats`;
      seen.add(id);
    }
    const places = new Map<string, string>();
    for (const n of s.nodes) {
      const key = `${n.x},${n.y}`;
      const other = places.get(key);
      if (other !== undefined) return `nodes "${other}" and "${n.id}" are at the same place`;
      places.set(key, n.id);
    }
    const nodeIds = new Set(s.nodes.map((n) => n.id));
    for (const c of s.components) {
      for (const end of [c.from, c.to]) {
        if (!nodeIds.has(end)) return `${c.id} joins "${end}", which is not a node`;
      }
      if (c.from === c.to) return `${c.id} must join two different nodes`;
    }
    return undefined;
  },
});
