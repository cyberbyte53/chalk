import { type ZodType, z } from "zod";
import {
  type ActionSpec,
  type AnyPropDef,
  type DerivedSpec,
  type FrameKindName,
  type FrameSpec,
  type PropDef,
  type SignalSpec,
  type StoredState,
  noteNames,
} from "./define";

/**
 * Hosts: a prop made of a small core plus optional **layers**. A number line is an axis, and the
 * marker, the marks, the split… are layers on it. A layer is one feature: its fields, actions,
 * signals and derived values. It draws on a kind of frame (an axis, a plane), so the same layer can
 * sit on any host offering that frame. The host's state is all its layers' fields side by side
 * (flat, so placements stay as they are); the runtime, rules and events see one prop. Its view draws
 * every layer and tags what each shows (tags.ts), as any view does.
 *
 * A prop made of whole props, each with its own state and laws, is a group (group.ts).
 */

/** Whether a number is inside an axis's window (with a hair of slack for floating point). */
export function isInAxis(w: { from: number; to: number }, v: number): boolean {
  const slack = (w.to - w.from) * 1e-9;
  return v >= w.from - slack && v <= w.to + slack;
}

/** Whether a point is inside a plane's window. */
export function isInPlane(
  w: { xMin: number; xMax: number; yMin: number; yMax: number },
  x: number,
  y: number,
): boolean {
  const sx = (w.xMax - w.xMin) * 1e-9;
  const sy = (w.yMax - w.yMin) * 1e-9;
  return x >= w.xMin - sx && x <= w.xMax + sx && y >= w.yMin - sy && y <= w.yMax + sy;
}

/**
 * One feature of a host. `S` is what it reads: its own fields (`fields`), and any other layer's it
 * needs (`needs`, checked when the host is defined).
 */
export type Layer<S extends StoredState> = {
  name: string;
  frame: FrameKindName;
  describe: string;
  /** The fields it owns. */
  fields: Readonly<Record<string, ZodType>>;
  defaults: Readonly<Record<string, unknown>>;
  /** Other layers whose fields it reads. */
  needs?: readonly string[];
  /**
   * Layers that can't be on with it on one board, and why (a fixed whole-number scale and zoom).
   * A board turning both on is refused when content is built.
   */
  excludes?: Readonly<Record<string, string>>;
  /** Whether it is on: showing something (default: always, for a core). */
  isOn?: (s: S) => boolean;
  actions?: Readonly<Record<string, ActionSpec<S>>>;
  signals?: Readonly<Record<string, SignalSpec>>;
  derived?: Readonly<Record<string, DerivedSpec<S>>>;
  inputs?: readonly string[];
  invariant?: (s: S) => string | undefined;
};

/** A layer of any state, as a host holds its list. */
// biome-ignore lint/suspicious/noExplicitAny: any state
export type AnyLayer = Layer<any>;

/**
 * Layers on one state, checked against the contract with their names kept: `const layer =
 * layersFor<Dot>()`, then `layer({ name: "dot", … })`.
 */
export function layersFor<S extends StoredState>() {
  return <const L extends Layer<S>>(layer: L): L & { readonly stateType?: S } => layer;
}

/** Which layer owns what, and which are on. */
export type HostLayout = {
  frame: FrameKindName;
  layers: readonly {
    name: string;
    describe: string;
    fields: readonly string[];
    actions: readonly string[];
    derived: readonly string[];
  }[];
  /** The layers on now. */
  layersOn: (s: StoredState) => string[];
  /** The layer that owns an action, field or derived value (undefined: the core's). */
  ownerOf: (name: string) => string | undefined;
  /** Layers on together (from the state, plus layers whose actions a board uses) that exclude each other. */
  clashes: (s: StoredState, usedActions?: readonly string[]) => string[];
};

type StateOf<L> = L extends { readonly stateType?: infer S } ? S : never;
type Both<U> = (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void
  ? I
  : never;
type KeysOf<L, K extends "actions" | "signals" | "derived"> = L extends { [P in K]?: infer R }
  ? keyof NonNullable<R> & string
  : never;

/** A host's whole state: its core's and every layer's fields, side by side. */
export type HostState<C extends AnyLayer, L extends readonly AnyLayer[]> = Both<
  StateOf<C> | StateOf<L[number]>
> &
  StoredState;

export type HostSpec<C extends AnyLayer, L extends readonly AnyLayer[]> = {
  type: string;
  describe: string;
  /** The frame the host offers its layers (and, in a group's frame layout, other props). */
  frame: FrameSpec<HostState<C, L>>;
  /** The frame's own fields (the window). */
  core: C;
  layers: L;
  summary?: (s: HostState<C, L>) => string;
  isExplainer?: boolean;
};

export type HostDef<
  S extends StoredState,
  A extends string,
  G extends string,
  D extends string,
> = PropDef<S, A, G, D> & { host: HostLayout };

/**
 * A host prop from a core and its layers. Throws if two parts claim the same field or name, a
 * layer draws on another kind of frame, or a layer needs one that isn't there.
 */
export function defineHost<C extends AnyLayer, const L extends readonly AnyLayer[]>(
  spec: HostSpec<C, L>,
): HostDef<
  HostState<C, L>,
  KeysOf<C | L[number], "actions">,
  KeysOf<C | L[number], "signals">,
  KeysOf<C | L[number], "derived">
> {
  const parts: readonly AnyLayer[] = [spec.core, ...spec.layers];
  const claim = (what: string, keys: Iterable<string>, seen: Map<string, string>, by: string) => {
    for (const key of keys) {
      const other = seen.get(key);
      if (other !== undefined)
        throw new Error(`${spec.type}: ${what} "${key}" is in ${other} and ${by}`);
      seen.set(key, by);
    }
  };
  const seen = {
    field: new Map<string, string>(),
    action: new Map<string, string>(),
    signal: new Map<string, string>(),
    derived: new Map<string, string>(),
  };
  for (const p of parts) {
    claim("field", Object.keys(p.fields), seen.field, p.name);
    claim("action", Object.keys(p.actions ?? {}), seen.action, p.name);
    claim("signal", Object.keys(p.signals ?? {}), seen.signal, p.name);
    claim("derived value", Object.keys(p.derived ?? {}), seen.derived, p.name);
  }
  const names = new Set(parts.map((l) => l.name));
  for (const l of parts) {
    if (l.frame !== spec.frame.kind)
      throw new Error(
        `${spec.type}: ${l.name} draws on ${l.frame}, the host is ${spec.frame.kind}`,
      );
    for (const need of l.needs ?? [])
      if (!names.has(need)) throw new Error(`${spec.type}: layer ${l.name} needs layer ${need}`);
    for (const other of Object.keys(l.excludes ?? {}))
      if ((l.needs ?? []).includes(other))
        throw new Error(`${spec.type}: layer ${l.name} both needs and excludes ${other}`);
  }
  const merge = <T>(pick: (p: AnyLayer) => Readonly<Record<string, T>> | undefined) =>
    Object.assign({}, ...parts.map((p) => pick(p) ?? {})) as Record<string, T>;
  const isOn = (l: AnyLayer, s: StoredState) => l.isOn?.(s) ?? true;
  const layout: HostLayout = {
    frame: spec.frame.kind,
    layers: spec.layers.map((l) => ({
      name: l.name,
      describe: l.describe,
      fields: Object.keys(l.fields),
      actions: Object.keys(l.actions ?? {}),
      derived: Object.keys(l.derived ?? {}),
    })),
    layersOn: (s) => spec.layers.filter((l) => isOn(l, s)).map((l) => l.name),
    ownerOf: (name) =>
      spec.layers.find(
        (l) => name in l.fields || name in (l.actions ?? {}) || name in (l.derived ?? {}),
      )?.name,
    clashes: (s, usedActions = []) => {
      const on = new Set(layout.layersOn(s));
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
  const actions = merge((p) => p.actions);
  const signals = merge((p) => p.signals);
  noteNames(spec.type, actions);
  noteNames(spec.type, signals);
  const def: AnyPropDef & { host: HostLayout } = {
    type: spec.type,
    describe: spec.describe,
    state: z
      .object(merge((p) => p.fields) as z.ZodRawShape)
      .strict() as unknown as ZodType<StoredState>,
    defaults: merge((p) => p.defaults) as StoredState,
    derived: merge((p) => p.derived),
    inputs: parts.flatMap((p) => p.inputs ?? []),
    actions,
    signals,
    frame: spec.frame as unknown as FrameSpec<StoredState>,
    invariant: (s) => {
      for (const p of parts) {
        const broken = p.invariant?.(s);
        if (broken !== undefined) return broken;
      }
      return undefined;
    },
    ...(spec.summary !== undefined ? { summary: spec.summary as never } : {}),
    ...(spec.isExplainer !== undefined ? { isExplainer: spec.isExplainer } : {}),
    host: layout,
  };
  return def as never;
}

/** A host's layout, if the prop is a host. */
export function hostOf(def: AnyPropDef): HostLayout | undefined {
  return (def as { host?: HostLayout }).host;
}
