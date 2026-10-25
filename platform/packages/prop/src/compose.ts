import { type ZodType, z } from "zod";
import { SEP } from "./address";
import type {
  ActionSpec,
  AnyPropDef,
  Box,
  DerivedSpec,
  Element,
  Observation,
  PropDef,
  PropView,
  SignalSpec,
  StoredState,
} from "./define";
import { checkStored, observationOf, viewOf } from "./state";

/**
 * Props built from parts, two ways.
 *
 * - A **host** is a small core plus optional **layers**: a number line is an axis, and the marker,
 *   the marks, the split… are layers on it. A layer is one feature: its fields, actions, what it
 *   adds to the description, where its parts are. It draws on a **frame** the host offers (a 1-D
 *   axis, a 2-D plane), so the same layer can sit on any host offering that frame. The host's
 *   state is all its layers' fields side by side (flat, so placements stay as they were); a layer
 *   showing nothing isn't described.
 * - A **composite** is a parent prop drawn with other props as its children. The parent owns the
 *   state and the laws; each child is drawn from it (`from`), and what the learner does to a child
 *   becomes one of the parent's actions (`on`). Children describe themselves; their element ids
 *   sit under the child's name ("plane/handle").
 *
 * Both come out as ordinary prop definitions: the runtime, rules and events see one prop.
 */

/** What a layer draws on. */
export const FrameKind = { Axis: "axis", Plane: "plane" } as const;
export type FrameKind = (typeof FrameKind)[keyof typeof FrameKind];

/** The stretch of an axis on screen, in its own numbers. */
export type AxisWindow = { from: number; to: number };
/** The part of a plane on screen. */
export type PlaneWindow = { xMin: number; xMax: number; yMin: number; yMax: number };
export type WindowOf<K extends FrameKind> = K extends typeof FrameKind.Axis
  ? AxisWindow
  : PlaneWindow;

/** An axis frame in pixels, at the width the prop is drawn: where a number sits. */
export type AxisPixels = AxisWindow & { width: number; toX: (v: number) => number; y: number };
/** A plane frame in pixels. */
export type PlanePixels = PlaneWindow & {
  width: number;
  height: number;
  toPx: (x: number, y: number) => readonly [number, number];
};
export type PixelsOf<K extends FrameKind> = K extends typeof FrameKind.Axis
  ? AxisPixels
  : PlanePixels;

/** Whether a number is inside the window (with a hair of slack for floating point). */
export function isInAxis(w: AxisWindow, v: number): boolean {
  const slack = (w.to - w.from) * 1e-9;
  return v >= w.from - slack && v <= w.to + slack;
}

export function isInPlane(w: PlaneWindow, x: number, y: number): boolean {
  const sx = (w.xMax - w.xMin) * 1e-9;
  const sy = (w.yMax - w.yMin) * 1e-9;
  return x >= w.xMin - sx && x <= w.xMax + sx && y >= w.yMin - sy && y <= w.yMax + sy;
}

/** What a layer adds to its host's description. */
export type LayerSeen = {
  elements: readonly Element[];
  hidden?: Readonly<Record<string, unknown>>;
  /** A few words for the host's one-line summary ("the dot at 1.75"), when it shows something. */
  summary?: string;
};

/**
 * One feature of a host. `S` is what it reads: its own fields (`fields`), and any other layer's it
 * needs (`needs`, checked when the host is defined).
 */
export type Layer<
  S extends StoredState,
  K extends FrameKind,
  A extends string = never,
  G extends string = never,
  D extends string = never,
> = {
  name: string;
  frame: K;
  describe: string;
  /** The fields it owns. */
  fields: Readonly<Record<string, ZodType>>;
  defaults: Readonly<Record<string, unknown>>;
  /** Other layers whose fields it reads. */
  needs?: readonly string[];
  /**
   * Layers that can't be on with it on one board, and why (a fixed whole-number scale and zoom).
   * The host may list both; a board turning both on is refused when content is built.
   */
  excludes?: Readonly<Record<string, string>>;
  actions?: Readonly<Record<A, ActionSpec<S>>>;
  signals?: Readonly<Record<G, SignalSpec>>;
  derived?: Readonly<Record<D, DerivedSpec<S>>>;
  inputs?: readonly string[];
  observe?: (s: S, window: WindowOf<K>) => LayerSeen;
  locate?: (s: S, part: string, at: PixelsOf<K>) => Box | undefined;
  invariant?: (s: S) => string | undefined;
};

/** A layer of any state and frame, as a host holds its list. */
export type AnyLayer = Omit<
  // biome-ignore lint/suspicious/noExplicitAny: any state
  Layer<any, FrameKind, string, string, string>,
  "observe" | "locate"
> & {
  // biome-ignore lint/suspicious/noExplicitAny: any state and frame
  observe?: (s: any, window: any) => LayerSeen;
  // biome-ignore lint/suspicious/noExplicitAny: any state and frame
  locate?: (s: any, part: string, at: any) => Box | undefined;
};

/** Identity helper, so a layer's names stay literal. */
export function defineLayer<
  S extends StoredState,
  K extends FrameKind,
  A extends string = never,
  G extends string = never,
  D extends string = never,
>(layer: Layer<S, K, A, G, D>): Layer<S, K, A, G, D> {
  return layer;
}

/** Which layer owns each field, action, signal and derived value, and the element ids it adds. */
export type HostLayout = {
  frame: FrameKind;
  layers: readonly {
    name: string;
    describe: string;
    fields: readonly string[];
    actions: readonly string[];
    derived: readonly string[];
  }[];
  /** The layer that added each element id (ids not listed are the core's). */
  layerOf: (s: StoredState, id: string) => string | undefined;
  /** The layers showing something now. */
  layersOn: (s: StoredState) => string[];
  /** The layer that owns an action, field or derived value (undefined: the core's). */
  ownerOf: (name: string) => string | undefined;
  /** Pairs of layers on together (from the state, plus layers whose actions the board uses) that exclude each other. */
  clashes: (s: StoredState, usedActions?: readonly string[]) => string[];
};

type StateOf<L> = L extends Layer<infer S, infer _K, infer _A, infer _G, infer _D> ? S : never;
type ActionsOf<L> = L extends Layer<infer _S, infer _K, infer A, infer _G, infer _D> ? A : never;
type SignalsOf<L> = L extends Layer<infer _S, infer _K, infer _A, infer G, infer _D> ? G : never;
type DerivedOf<L> = L extends Layer<infer _S, infer _K, infer _A, infer _G, infer D> ? D : never;
type Both<U> = (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void
  ? I
  : never;

/** A host's whole state: its core's and every layer's fields, side by side. */
export type HostState<C extends AnyLayer, L extends readonly AnyLayer[]> = Both<
  StateOf<C> | StateOf<L[number]>
> &
  StoredState;

export type HostSpec<K extends FrameKind, C extends AnyLayer, L extends readonly AnyLayer[]> = {
  type: string;
  describe: string;
  frame: K;
  /** The frame's own fields (the window) and what it draws itself; its `observe` gives the summary. */
  core: C;
  layers: L;
  /** The window, from the state. */
  window: (s: HostState<C, L>) => WindowOf<K>;
  /** Where it's drawn at a width (the view uses the same, so locate matches the picture). */
  pixels: (s: HostState<C, L>, width: number) => PixelsOf<K>;
  isExplainer?: boolean;
};

export type HostDef<
  S extends StoredState,
  A extends string,
  G extends string,
  D extends string,
> = PropDef<S, A, G, D> & { host: HostLayout };

/**
 * A host prop from a core and its layers. Throws if two parts claim the same field or name, or a
 * layer needs one that isn't there.
 */
export function defineHost<
  K extends FrameKind,
  C extends AnyLayer,
  const L extends readonly AnyLayer[],
>(
  spec: HostSpec<K, C, L>,
): HostDef<
  HostState<C, L>,
  ActionsOf<C> | ActionsOf<L[number]>,
  SignalsOf<C> | SignalsOf<L[number]>,
  DerivedOf<C> | DerivedOf<L[number]>
> {
  type S = HostState<C, L>;
  const parts: readonly AnyLayer[] = [spec.core, ...spec.layers];
  const claim = (what: string, keys: Iterable<string>, seen: Map<string, string>, by: string) => {
    for (const key of keys) {
      const other = seen.get(key);
      if (other !== undefined)
        throw new Error(`${spec.type}: ${what} "${key}" is in ${other} and ${by}`);
      seen.set(key, by);
    }
  };
  const fields = new Map<string, string>();
  const actions = new Map<string, string>();
  const signals = new Map<string, string>();
  const derived = new Map<string, string>();
  for (const p of parts) {
    claim("field", Object.keys(p.fields), fields, p.name);
    claim("action", Object.keys(p.actions ?? {}), actions, p.name);
    claim("signal", Object.keys(p.signals ?? {}), signals, p.name);
    claim("derived value", Object.keys(p.derived ?? {}), derived, p.name);
  }
  const names = new Set(parts.map((l) => l.name));
  for (const l of parts) {
    if (l.frame !== spec.frame)
      throw new Error(`${spec.type}: ${l.name} draws on ${l.frame}, the host is ${spec.frame}`);
    for (const need of l.needs ?? [])
      if (!names.has(need)) throw new Error(`${spec.type}: layer ${l.name} needs layer ${need}`);
    for (const other of Object.keys(l.excludes ?? {}))
      if ((l.needs ?? []).includes(other))
        throw new Error(`${spec.type}: layer ${l.name} both needs and excludes ${other}`);
  }
  const shape = Object.assign({}, ...parts.map((p) => p.fields)) as z.ZodRawShape;
  const defaults = Object.assign({}, ...parts.map((p) => p.defaults)) as S;
  const state = z.object(shape).strict() as unknown as ZodType<S>;
  const merge = <T>(pick: (p: AnyLayer) => Readonly<Record<string, T>> | undefined) =>
    Object.assign({}, ...parts.map((p) => pick(p) ?? {})) as Record<string, T>;

  // A layer is on when it shows something now: what it describes is exactly what it draws.
  const seenBy = (s: S) => {
    const window = spec.window(s);
    const core = spec.core.observe?.(s, window) ?? { elements: [] };
    const layered = spec.layers.map((l) => ({ name: l.name, seen: l.observe?.(s, window) }));
    return { core, layered };
  };
  const layerOn = (l: AnyLayer, s: StoredState) =>
    (seenBy(s as S).layered.find((x) => x.name === l.name)?.seen?.elements.length ?? 0) > 0;
  const layout: HostLayout = {
    frame: spec.frame,
    layers: spec.layers.map((l) => ({
      name: l.name,
      describe: l.describe,
      fields: Object.keys(l.fields),
      actions: Object.keys(l.actions ?? {}),
      derived: Object.keys(l.derived ?? {}),
    })),
    layerOf: (s, id) =>
      seenBy(s as S).layered.find((l) => l.seen?.elements.some((e) => e.id === id))?.name,
    layersOn: (s) => spec.layers.filter((l) => layerOn(l, s)).map((l) => l.name),
    ownerOf: (name) =>
      spec.layers.find(
        (l) => name in l.fields || name in (l.actions ?? {}) || name in (l.derived ?? {}),
      )?.name,
    clashes: (s, usedActions = []) => {
      const on = new Set(spec.layers.filter((l) => layerOn(l, s)).map((l) => l.name));
      for (const action of usedActions)
        for (const l of spec.layers) if (action in (l.actions ?? {})) on.add(l.name);
      const out: string[] = [];
      for (const l of spec.layers)
        for (const [other, why] of Object.entries(l.excludes ?? {}))
          if (on.has(l.name) && on.has(other))
            out.push(`${spec.type}: ${l.name} and ${other} can't be on together: ${why}`);
      return out;
    },
  };
  const observe = (s: S): Observation => {
    const { core, layered } = seenBy(s);
    const extra = layered.flatMap((l) => (l.seen?.summary ? [l.seen.summary] : []));
    const hidden = Object.assign(
      {},
      core.hidden ?? {},
      ...layered.map((l) => l.seen?.hidden ?? {}),
    ) as Record<string, unknown>;
    return {
      summary: [core.summary ?? spec.describe, ...extra].join(", "),
      elements: [...core.elements, ...layered.flatMap((l) => l.seen?.elements ?? [])],
      ...(Object.keys(hidden).length > 0 ? { hidden } : {}),
    };
  };
  return {
    type: spec.type,
    describe: spec.describe,
    state,
    defaults,
    derived: merge((p) => p.derived) as never,
    inputs: parts.flatMap((p) => p.inputs ?? []) as never,
    actions: merge((p) => p.actions) as never,
    signals: merge((p) => p.signals) as never,
    observe: observe as never,
    // Parts are what the description names: one vocabulary for pointing, steps and comments.
    parts: ((s: S) => observe(s).elements.map((e) => e.id)) as never,
    locate: ((s: S, part: string, width: number) => {
      const at = spec.pixels(s, width);
      for (const p of parts) {
        const box = p.locate?.(s, part, at as never);
        if (box !== undefined) return box;
      }
      return undefined;
    }) as never,
    invariant: (s) => {
      for (const p of parts) {
        const broken = p.invariant?.(s);
        if (broken !== undefined) return broken;
      }
      return undefined;
    },
    ...(spec.isExplainer !== undefined ? { isExplainer: spec.isExplainer } : {}),
    host: layout,
  };
}

// ---- composites ----

/**
 * One child of a composite: a prop, its state made from the parent's, and what the learner doing
 * one of its actions does to the parent (an action and its arguments, or nothing).
 */
export type Child<P extends StoredState> = {
  def: AnyPropDef;
  from: (parent: PropView & P) => StoredState;
  on?: Readonly<
    Record<
      string,
      (
        parent: PropView & P,
        args: Record<string, unknown>,
      ) => readonly [string, unknown] | undefined
    >
  >;
};

/**
 * Typed child helper for one composite's state, like `actionsFor`: `const kid = childrenFor<S>()`,
 * then `kid(stepper, (s) => ({ value: s.input }), { change: (s, a) => [Put, { x: a.to }] })`.
 */
export function childrenFor<P extends StoredState>() {
  return <C extends StoredState>(
    def: PropDef<C, string, string, string>,
    from: (parent: PropView & P) => Partial<C>,
    on?: Child<P>["on"],
  ): Child<P> => ({
    def: def as unknown as AnyPropDef,
    from: (p) => ({ ...def.defaults, ...from(p) }) as StoredState,
    ...(on !== undefined ? { on } : {}),
  });
}

/** Where a child id sits under its parent: "plane/handle". */
const PATH = SEP;

export type CompositeLayout = {
  /** Children in the order they are drawn, top to bottom. */
  children: readonly string[];
  childOf: (name: string) => Child<StoredState>;
  /** A child's state now, made from the parent's view (and checked against the child's schema). */
  stateOf: (parent: PropView, name: string) => StoredState;
  /** What a learner's action on a child does to the parent, or undefined when it does nothing. */
  route: (
    parent: PropView,
    name: string,
    action: string,
    args: Record<string, unknown>,
  ) => readonly [string, unknown] | undefined;
};

export type CompositeSpec<
  S extends StoredState,
  A extends string,
  G extends string,
  D extends string,
> = Omit<PropDef<S, A, G, D>, "observe" | "parts" | "locate" | "offScreen"> & {
  children: Readonly<Record<string, Child<S>>>;
  /** Top to bottom. */
  order: readonly string[];
  /** The parent's own line, and anything it alone knows that isn't on screen. */
  summary: (view: PropView & S) => string;
  hidden?: (view: PropView & S) => Readonly<Record<string, unknown>> | undefined;
};

export type CompositeDef<
  S extends StoredState,
  A extends string,
  G extends string,
  D extends string,
> = PropDef<S, A, G, D> & { composite: CompositeLayout };

export function defineComposite<
  S extends StoredState,
  A extends string,
  G extends string = never,
  D extends string = never,
>(spec: CompositeSpec<S, A, G, D>): CompositeDef<S, A, G, D> {
  const { children, order, summary, hidden, ...rest } = spec;
  for (const name of order)
    if (children[name] === undefined) throw new Error(`${spec.type}: no child named ${name}`);
  const childOf = (name: string) => {
    const c = children[name];
    if (c === undefined) throw new Error(`${spec.type} has no child ${name}`);
    return c as unknown as Child<StoredState>;
  };
  const stateOf = (parent: PropView, name: string) => {
    const made = childOf(name).from(parent as never);
    const checked = checkStored(childOf(name).def, made);
    if (!checked.isOk) throw new Error(`${spec.type}/${name}: ${checked.errors.join("; ")}`);
    return checked.state;
  };
  const observe = (view: PropView & S): Observation => {
    const elements: Element[] = [];
    const inner: Record<string, unknown> = {};
    for (const name of order) {
      const seen = observationOf(childOf(name).def, stateOf(view, name));
      const c = childOf(name);
      for (const e of seen.elements) {
        // A child's control does what the parent routes it to, or nothing.
        const does = e.does === undefined ? [] : typeof e.does === "string" ? [e.does] : e.does;
        const routed = does.filter((a) => c.on?.[a] !== undefined).map((a) => `${name}${PATH}${a}`);
        const { does: _d, ...plain } = e;
        elements.push({
          ...plain,
          id: `${name}${PATH}${e.id}`,
          ...(routed.length === 1
            ? { does: routed[0] }
            : routed.length > 1
              ? { does: routed }
              : {}),
        });
      }
      if (seen.hidden !== undefined) inner[name] = seen.hidden;
    }
    const own = hidden?.(view);
    const all = { ...(own ?? {}), ...(Object.keys(inner).length > 0 ? { children: inner } : {}) };
    return {
      summary: summary(view),
      elements,
      ...(Object.keys(all).length > 0 ? { hidden: all } : {}),
    };
  };
  return {
    ...rest,
    observe,
    parts: (view) => observe(view).elements.map((e) => e.id),
    composite: {
      children: order,
      childOf,
      stateOf,
      route: (parent, name, action, args) => childOf(name).on?.[action]?.(parent as never, args),
    },
  } as CompositeDef<S, A, G, D>;
}

/** A host's layout, if the prop is a host. */
export function hostOf(def: AnyPropDef): HostLayout | undefined {
  return (def as { host?: HostLayout }).host;
}

/** A composite's layout, if the prop is a composite. */
export function compositeOf(def: AnyPropDef): CompositeLayout | undefined {
  return (def as { composite?: CompositeLayout }).composite;
}

/** A child's view: its stored state from the parent's, with its derived values. */
export function childView(def: AnyPropDef, parent: PropView, name: string): PropView {
  const c = compositeOf(def);
  if (c === undefined) throw new Error(`${def.type} is not a composite`);
  return viewOf(c.childOf(name).def, c.stateOf(parent, name));
}
