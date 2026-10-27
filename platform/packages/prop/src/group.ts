import { type ZodType, z } from "zod";
import { SEP } from "./address";
import {
  type ActionSpec,
  type AnyPropDef,
  type Effect,
  EffectKind,
  type PropDef,
  type PropView,
  type Raised,
  type SignalSpec,
  type StoredState,
  type TaskContext,
  noteNames,
  setRaised,
  task,
} from "./define";
import { isFullChecking, prepareAction, viewOf } from "./state";
import { flatten, isInstant, runEffect } from "./steps";

/**
 * Groups: a prop made of other props joined by links (plans/props-composition.md,
 * plans/foundation-plan.md).
 *
 * **State holds facts only.** A group stores its own fields and each child's own facts. A field an
 * IS binds is never stored: it is worked out from the facts whenever the group is read. So the
 * stored schema is computed (each child's schema minus its bound fields), saved state is small, and
 * nothing computed can go stale.
 *
 * - **Children keep their laws.** Learner and lesson call a child's action by path ("input.change");
 *   it runs the child's own action on the child's full view (facts plus what is bound into it), and
 *   may change only the child's own facts.
 * - **IS**: one function per child, returning the fields bound into it (`is: { stepper: s => ({
 *   value: s.input }) }`). Worked out in the order written; each reads the ones before it. A child
 *   group's grandchildren are bound by nesting (`{ plane: s => ({ handle: { x: s.input } }) }`).
 * - **show**: whether a child is there right now. A hidden child keeps its facts but draws nothing
 *   and isn't described.
 * - **WHEN** reacts to a child's signal with steps (actions on children or the group's own).
 * - **ROUTE** takes a learner action on a child and does something else instead, or refuses with a
 *   reason (`refuse("…")`). A learner control on a bound field must be routed: checked when defined.
 * - **Invariants** across children are checked on the whole view (refused whole if broken).
 */

/** Where an element sits under its parent in descriptions and on screen: "plane/handle". */
export const PATH = SEP;

/** A refusal: the action had nowhere to go, and why. */
export type Refusal = { readonly refused: string };
/** Refuses a routed action, saying why (the learner and agents see the reason). */
export function refuse(reason: string): Refusal {
  return { refused: reason };
}
const isRefusal = (v: unknown): v is Refusal =>
  v !== null && typeof v === "object" && typeof (v as Refusal).refused === "string";

/** One step a link runs: a target ("input.change", "put", "plane.handle.put") and its arguments. */
export type Step = readonly [target: string, args?: Readonly<Record<string, unknown>>];
export type Steps = readonly Step[];

/** A group's view: its own fields and derived values, and each child's view under its name. */
export type GroupView = PropView;

/** Any props, leaves or groups (their own state types are kept by their definitions). */
// biome-ignore lint/suspicious/noExplicitAny: a child of any state type
export type GroupChildren = Readonly<Record<string, PropDef<any, any, any, any>>>;

/** The state of a prop definition (a group's from its carried type, a leaf's from its schema). */
export type StateOf<P> = P extends { readonly stateType?: infer G }
  ? G extends StoredState
    ? G
    : LeafStateOf<P>
  : LeafStateOf<P>;
type LeafStateOf<P> = P extends { state: ZodType<infer S> } ? S : never;

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[]
    ? T[K]
    : T[K] extends Record<string, unknown>
      ? DeepPartial<T[K]>
      : T[K];
};
/** What an IS may bind into a child: some of a leaf's fields, or into a child group, nested. */
export type BindOf<P> = P extends { readonly group: unknown }
  ? DeepPartial<StateOf<P>>
  : Partial<StateOf<P>>;

/** A group's full state as its links read it: own fields, then each child's state (null if left out). */
export type GroupState<O extends StoredState, C extends GroupChildren, Opt extends string> = O & {
  readonly [K in keyof C]: K extends Opt ? StateOf<C[K]> | null : StateOf<C[K]>;
};

/**
 * What a group's links read: its state, typed (`s.input.value`), and its derived values by name.
 * A child's derived values aren't typed here: read them as `(s.plane as PropView).name`, rarely.
 */
export type GroupViewOf<
  O extends StoredState,
  C extends GroupChildren,
  Opt extends string,
  D extends string = never,
> = GroupState<O, C, Opt> & { readonly [K in D]: unknown };

export type GroupSpec<
  O extends StoredState,
  C extends GroupChildren = GroupChildren,
  Opt extends string = string,
  D extends string = string,
> = {
  type: string;
  describe: string;
  /** What no child holds. */
  own?: ZodType<O>;
  ownDefaults?: NoInfer<O>;
  /** Own fields a board's IS may own (as a leaf's `inputs`). */
  inputs?: readonly (keyof O & string)[];
  children: C;
  /** Children a placement may leave out (`with: { screen: null }`). */
  optional?: readonly Opt[];
  /** Overrides of the children's defaults, by child: { input: { step: 0.1 } }. */
  defaults?: { readonly [K in keyof C]?: Partial<StateOf<C[K]>> };
  /**
   * Bindings, one per child: the fields bound into it, worked out from the group's view. A bound
   * field is never stored and has one writer: this. Worked out in the order written; each reads
   * the ones before it. Always return the same fields.
   */
  is?: { readonly [K in keyof C]?: (s: GroupViewOf<O, C, Opt, D>) => BindOf<C[K]> };
  /** Whether a child is there right now (default: always). */
  show?: { readonly [K in keyof C]?: (s: GroupViewOf<O, C, Opt, D>) => boolean };
  /** "child.signal" (or "child.grandchild.signal") → steps to run, given the signal's payload. */
  when?: Readonly<
    Record<
      string,
      (s: GroupViewOf<O, C, Opt, D>, payload: Readonly<Record<string, unknown>>) => Steps
    >
  >;
  /**
   * "child.action" → steps to run instead of the child's own action, or `refuse("why")` (or
   * undefined) when the learner's drag has nowhere to go.
   */
  route?: Readonly<
    Record<
      string,
      (
        s: GroupViewOf<O, C, Opt, D>,
        args: Readonly<Record<string, unknown>>,
      ) => Steps | Refusal | undefined
    >
  >;
  /** The group's own actions: they change its own fields. */
  actions?: Readonly<Record<string, ActionSpec<O>>>;
  signals?: Readonly<Record<string, SignalSpec>>;
  /** Derived values over the whole group (they can read children). */
  derived?: Readonly<
    Record<D, { describe: string; compute: (s: GroupViewOf<O, C, Opt, D>) => unknown }>
  >;
  /** A rule across children; the change is refused if it breaks. */
  invariant?: (s: GroupViewOf<O, C, Opt, D>) => string | undefined;
  /** The group's own line in its description; each child describes itself. */
  summary: (s: GroupViewOf<O, C, Opt, D>) => string;
  /** How children are placed: top to bottom, or side by side. */
  layout: GroupLayoutSpec<keyof C & string>;
  isExplainer?: boolean;
};

export type GroupLayoutSpec<N extends string = string> = {
  kind: "column" | "row";
  children: readonly N[];
};

/** The fields bound into a child: `true` for a leaf's field (or a child group's own field), nested for a grandchild. */
export type BoundTree = { readonly [name: string]: true | BoundTree };

export type GroupLayout = {
  children: GroupChildren;
  optional: readonly string[];
  layout: GroupLayoutSpec;
  /** Bound fields, as paths: "plane.handle.x". */
  bound: readonly string[];
  /** The same, as a tree by child. */
  boundTree: Readonly<Record<string, BoundTree>>;
  /** Own field names. */
  own: readonly string[];
  /** What each child's binding reads, as dotted paths in the group's view ("objectArrow.x"). */
  sources: Readonly<Record<string, readonly string[]>>;
  /** Children's actions the group turns into its own changes ("objectArrow.move"). */
  routes: readonly string[];
};

/** A view that notes every value read from it, as a dotted path ("objectArrow.x"). */
function noting(view: Readonly<Record<string, unknown>>, reads: Set<string>, prefix = ""): never {
  return new Proxy(view, {
    get: (target, key) => {
      const value = (target as Record<string | symbol, unknown>)[key];
      if (typeof key !== "string") return value;
      if (isObject(value)) return noting(value, reads, `${prefix}${key}.`);
      reads.add(`${prefix}${key}`);
      return value;
    },
  }) as never;
}

/** A group: an ordinary prop (its state typed, nested) that also knows its children and links. */
export type GroupDef<S extends StoredState = StoredState> = AnyPropDef & {
  group: GroupLayout;
  /** Never set: carries the group's state type, so a parent group reads its child typed. */
  readonly stateType?: S;
};

/** What a group adds to its prop for its parent and the engine (not for authors). */
type GroupInternals = {
  /** The view when a parent binds fields into this group (`injected`), else its own. */
  viewWith: (
    stored: StoredState,
    injected: Readonly<Record<string, unknown>> | undefined,
  ) => PropView;
  /** Runs a target on this group's stored state, with what a parent binds into it. */
  actOn: (
    stored: StoredState,
    injected: Readonly<Record<string, unknown>> | undefined,
    target: string,
    args: Readonly<Record<string, unknown>>,
  ) => Effect<StoredState>;
  /** The stored schema minus fields a parent binds. */
  stateWithout: (tree: BoundTree) => z.ZodTypeAny;
  /** The rules across children, checked on a view. */
  invariantOfView: (view: PropView) => string | undefined;
};

/** A prop's invariant on its view: a leaf's on its fields, a group's across its children. */
export function invariantOfView(def: AnyPropDef, view: PropView): string | undefined {
  const inner = internalsOf(def);
  return inner !== undefined ? inner.invariantOfView(view) : def.invariant?.(view as StoredState);
}

/** The group layout of a prop, if it is a group. */
export function groupOf(def: AnyPropDef): GroupLayout | undefined {
  return (def as Partial<GroupDef>).group;
}
const internalsOf = (def: AnyPropDef): GroupInternals | undefined =>
  groupOf(def) === undefined ? undefined : (def as unknown as GroupInternals);

/** The stored facts a group's view was made from (and what its parent bound into it). */
const STORED = Symbol("stored");
const INJECTED = Symbol("injected");
const SHOWN = Symbol("shown");

/** Which children of a group are there right now, from its view (all, when it isn't a group's). */
export function shownOf(view: PropView): Readonly<Record<string, boolean>> | undefined {
  return (view as Record<symbol, Record<string, boolean>>)[SHOWN];
}

/** The top-level fields that changed (unchanged slices keep their identity). */
const diff = (before: StoredState, after: StoredState): Record<string, unknown> =>
  Object.fromEntries(Object.entries(after).filter(([k]) => after[k] !== before[k]));

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

/** Deep equality of plain data, whatever order an object's keys are in. */
function isSame(a: unknown, b: unknown): boolean {
  if (Object.is(a, b) || (a === 0 && b === 0)) return true;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((x, i) => isSame(x, b[i]));
  }
  if (!isObject(a) || !isObject(b)) return false;
  const keys = (o: Record<string, unknown>) => Object.keys(o).filter((k) => o[k] !== undefined);
  const ka = keys(a);
  return ka.length === keys(b).length && ka.every((k) => isSame(a[k], b[k]));
}

/** Two bindings into a child group merged: own fields replaced, grandchildren merged. */
function mergeBound(
  a: Readonly<Record<string, unknown>> | undefined,
  b: Readonly<Record<string, unknown>> | undefined,
  tree: BoundTree | undefined,
): Readonly<Record<string, unknown>> | undefined {
  if (a === undefined) return b;
  if (b === undefined) return a;
  const out: Record<string, unknown> = { ...a };
  for (const [k, v] of Object.entries(b)) {
    const sub = tree?.[k];
    out[k] =
      sub !== undefined && sub !== true && isObject(out[k]) && isObject(v)
        ? mergeBound(out[k] as Record<string, unknown>, v, sub)
        : v;
  }
  return out;
}

/** A state without the fields a tree binds (for a leaf: its fields; for a group: own and nested). */
export function without(s: StoredState, tree: BoundTree | undefined): StoredState {
  if (tree === undefined) return s;
  const out: Record<string, unknown> = { ...s };
  for (const [k, sub] of Object.entries(tree)) {
    if (sub === true) delete out[k];
    else if (isObject(out[k])) out[k] = without(out[k] as StoredState, sub);
  }
  return out;
}

/** Each bound field as a path: { plane: { handle: { x: true } } } → ["plane.handle.x"]. */
function pathsOf(tree: BoundTree, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([k, sub]) =>
    sub === true ? [`${prefix}${k}`] : pathsOf(sub, `${prefix}${k}.`),
  );
}

/**
 * The fields a binding returns, as a tree checked against the child: a leaf's fields, or a child
 * group's own fields and (nested) its children's.
 */
function shapeOf(where: string, child: AnyPropDef, value: unknown): BoundTree {
  if (!isObject(value)) throw new Error(`${where}: a binding returns an object of fields`);
  const g = groupOf(child);
  const tree: Record<string, true | BoundTree> = {};
  for (const [k, v] of Object.entries(value)) {
    if (g !== undefined && g.children[k] !== undefined) {
      tree[k] = shapeOf(`${where}.${k}`, g.children[k] as AnyPropDef, v);
      continue;
    }
    if (!Object.hasOwn(child.defaults, k) && !g?.own.includes(k))
      throw new Error(`${where}: ${child.type} has no field "${k}"`);
    tree[k] = true;
  }
  return tree;
}

/** Whether two trees bind the same field. */
function overlap(a: BoundTree, b: BoundTree, prefix = ""): string | undefined {
  for (const [k, sub] of Object.entries(a)) {
    const other = b[k];
    if (other === undefined) continue;
    if (sub === true || other === true) return `${prefix}${k}`;
    const deeper = overlap(sub, other, `${prefix}${k}.`);
    if (deeper !== undefined) return deeper;
  }
  return undefined;
}

/** A leaf's or group's stored schema minus the fields a parent binds. */
export function schemaWithout(def: AnyPropDef, tree: BoundTree | undefined): z.ZodTypeAny {
  const base = def.state as unknown as z.ZodTypeAny;
  if (tree === undefined || Object.keys(tree).length === 0) return base;
  const inner = internalsOf(def);
  if (inner !== undefined) return inner.stateWithout(tree);
  const object = base as unknown as { omit?: (m: Record<string, true>) => z.ZodTypeAny };
  if (typeof object.omit !== "function")
    throw new Error(`${def.type}: a bound child's state must be a plain z.object`);
  const keys = Object.fromEntries(
    Object.entries(tree).flatMap(([k, sub]) => (sub === true ? [[k, true as const]] : [])),
  );
  return object.omit(keys);
}

/**
 * Splits a dotted target into the child path and the last name, walking only real children:
 * "plane.handle.put" → { children: ["plane", "handle"], name: "put" }.
 */
function resolve(
  children: GroupChildren,
  dotted: string,
): { children: string[]; name: string; leaf: AnyPropDef | undefined } {
  const parts = dotted.split(".");
  const path: string[] = [];
  let at: AnyPropDef | undefined;
  let kids: GroupChildren | undefined = children;
  while (parts.length > 1 && kids !== undefined) {
    const next = parts[0] ?? "";
    const child: AnyPropDef | undefined = kids[next] as AnyPropDef | undefined;
    if (child === undefined) break;
    path.push(next);
    parts.shift();
    at = child;
    kids = groupOf(child)?.children;
  }
  return { children: path, name: parts.join("."), leaf: at };
}

/** Every child a layout places, in order. */
export function layoutChildren(layout: GroupLayoutSpec): string[] {
  return [...layout.children];
}

/** A child's view, made again only when its facts or what is bound into it changed. */
type ChildMemo = WeakMap<object, { injected: unknown; view: PropView }>;

export function defineGroup<
  C extends GroupChildren,
  O extends StoredState = Record<never, never>,
  Opt extends keyof C & string = never,
  D extends string = never,
>(typed: GroupSpec<O, C, Opt, D>): GroupDef<GroupState<O, C, Opt>> {
  // Inside, the state is handled untyped; the types are for the links an author writes.
  const spec = typed as unknown as GroupSpec<StoredState> & {
    is?: Readonly<Record<string, (s: PropView) => unknown>>;
    show?: Readonly<Record<string, (s: PropView) => boolean>>;
  };
  const kids = spec.children;
  const childNames = Object.keys(kids);
  const childDef = (name: string) => kids[name] as AnyPropDef;
  const optional = new Set(spec.optional ?? []);
  const own = (spec.own ?? z.object({}).strict()) as unknown as ZodType<StoredState>;
  const ownDefaults = (spec.ownDefaults ?? {}) as StoredState;
  const ownFields = Object.keys(ownDefaults);
  for (const name of childNames)
    if (ownFields.includes(name))
      throw new Error(`${spec.type}: "${name}" is both an own field and a child`);
  for (const name of Object.keys(spec.derived ?? {}))
    if (childNames.includes(name) || ownFields.includes(name))
      throw new Error(`${spec.type}: derived "${name}" has the name of a child or an own field`);
  for (const name of [...Object.keys(spec.is ?? {}), ...Object.keys(spec.show ?? {})])
    if (kids[name] === undefined) throw new Error(`${spec.type}: no child "${name}" to bind`);
  const placed = layoutChildren(spec.layout);
  for (const name of placed)
    if (kids[name] === undefined) throw new Error(`${spec.type}: layout names no child "${name}"`);

  // ---- each child's facts before bindings: its defaults, with the group's overrides ----
  const fullDefaults: Record<string, StoredState> = {};
  for (const name of childNames)
    fullDefaults[name] = { ...childDef(name).defaults, ...(spec.defaults?.[name] ?? {}) };

  // ---- which fields each binding binds: run once on the defaults, checked against the child ----
  const bindings = Object.entries(spec.is ?? {});
  const boundTree: Record<string, BoundTree> = {};
  const sources: Record<string, string[]> = {};
  {
    const probe: Record<string, unknown> = { ...ownDefaults };
    for (const name of childNames)
      probe[name] = viewOf(childDef(name), fullDefaults[name] as StoredState);
    for (const [d, { compute }] of Object.entries(spec.derived ?? {})) {
      try {
        probe[d] = compute(probe);
      } catch {
        probe[d] = undefined;
      }
    }
    for (const [name, fn] of bindings) {
      const reads = new Set<string>();
      const value = fn(noting(probe, reads));
      sources[name] = [...reads];
      const tree = shapeOf(`${spec.type}: IS ${name}`, childDef(name), value);
      const inner = groupOf(childDef(name))?.boundTree;
      if (inner !== undefined) {
        const twice = overlap(tree, inner as unknown as BoundTree);
        if (twice !== undefined)
          throw new Error(
            `${spec.type}: ${name}.${twice} is bound twice (here and in ${childDef(name).type})`,
          );
      }
      boundTree[name] = tree;
      // Later bindings read this one's result.
      const base = fullDefaults[name] as StoredState;
      probe[name] = viewOf(childDef(name), { ...base, ...(value as object) });
    }
  }
  const bound = Object.entries(boundTree).flatMap(([name, tree]) => pathsOf(tree, `${name}.`));

  // ---- one writer: a learner control on a bound field must be routed ----
  for (const [name, tree] of Object.entries(boundTree)) {
    const fields = Object.entries(tree).flatMap(([k, sub]) => (sub === true ? [k] : []));
    if (fields.length === 0) continue;
    for (const [action, a] of Object.entries(childDef(name).actions)) {
      // Only what an action declares it changes is known before it runs; any other write to a
      // bound field is refused when it happens.
      const writes = a.changes?.some((f) => fields.includes(f)) === true;
      const key = `${name}.${action}`;
      if (a.byLearner === true && writes && spec.route?.[key] === undefined)
        throw new Error(
          `${spec.type}: ${key} is the learner's and changes ${name}.${fields.join("/")}, which is bound: route it to the owner`,
        );
    }
  }

  // ---- the stored state: own fields, and each child's facts (its bound fields left out) ----
  const childSchema = (name: string, extra?: BoundTree): z.ZodTypeAny => {
    const tree = mergeTrees(boundTree[name], extra);
    const schema = schemaWithout(childDef(name), tree);
    return optional.has(name) ? schema.nullable() : schema;
  };
  const ownShape = (own as unknown as { shape?: z.ZodRawShape }).shape ?? {};
  const stateWithout = (tree: BoundTree): z.ZodTypeAny => {
    const shape: z.ZodRawShape = {};
    for (const [k, v] of Object.entries(ownShape)) if (tree[k] !== true) shape[k] = v;
    for (const name of childNames) {
      const sub = tree[name];
      shape[name] = childSchema(name, sub === true || sub === undefined ? undefined : sub);
    }
    return z.object(shape).strict();
  };
  const state = stateWithout({}) as unknown as ZodType<StoredState>;
  const defaults: Record<string, unknown> = { ...ownDefaults };
  for (const name of childNames)
    defaults[name] = without(fullDefaults[name] as StoredState, boundTree[name]);

  // ---- reading the group: facts plus everything bound and derived ----
  const memo: Record<string, ChildMemo> = Object.fromEntries(
    childNames.map((n) => [n, new WeakMap() as ChildMemo]),
  );
  /** A child's view from its facts and what is bound into it (reused while neither changed). */
  const childView = (
    name: string,
    slice: StoredState,
    injected: Readonly<Record<string, unknown>> | undefined,
  ): PropView => {
    const known = memo[name]?.get(slice);
    if (known !== undefined && isSame(known.injected, injected)) return known.view;
    const def = childDef(name);
    const inner = internalsOf(def);
    const view =
      inner !== undefined
        ? inner.viewWith(slice, injected)
        : viewOf(def, injected === undefined ? slice : { ...slice, ...injected });
    memo[name]?.set(slice, { injected, view });
    return view;
  };

  type Reading = {
    view: PropView;
    /** Per child: its facts and what is bound into it. */
    inputs: Record<
      string,
      { slice: StoredState; injected: Readonly<Record<string, unknown>> | undefined } | null
    >;
  };
  const top = new WeakMap<object, Reading>();

  const read = (stored: StoredState, injected?: Readonly<Record<string, unknown>>): Reading => {
    if (injected === undefined) {
      const known = top.get(stored);
      if (known !== undefined) return known;
    }
    const out: Record<string, unknown> = {};
    for (const f of ownFields)
      out[f] = injected !== undefined && f in injected ? injected[f] : stored[f];
    const inputs: Reading["inputs"] = {};
    for (const name of childNames) {
      const slice = stored[name];
      if (slice === null || slice === undefined) {
        inputs[name] = null;
        out[name] = null;
        continue;
      }
      const fromAbove = injected?.[name];
      inputs[name] = {
        slice: slice as StoredState,
        injected: isObject(fromAbove) ? fromAbove : undefined,
      };
      out[name] = childView(name, slice as StoredState, inputs[name]?.injected);
    }
    const derive = () => {
      for (const [d, { compute }] of Object.entries(spec.derived ?? {})) out[d] = compute(out);
    };
    derive();
    for (const [name, fn] of bindings) {
      const input = inputs[name];
      if (input === null || input === undefined) continue;
      const value = fn(out) as Record<string, unknown>;
      if (isFullChecking()) {
        const tree = shapeOf(`${spec.type}: IS ${name}`, childDef(name), value);
        const want = boundTree[name] as BoundTree;
        if (!isSame(Object.keys(tree).sort(), Object.keys(want).sort()))
          throw new Error(`${spec.type}: IS ${name} must always bind the same fields`);
      }
      input.injected = mergeBound(input.injected, value, boundTree[name]);
      out[name] = childView(name, input.slice, input.injected);
      derive();
    }
    const shown: Record<string, boolean> = {};
    for (const name of childNames)
      shown[name] = out[name] !== null && (spec.show?.[name]?.(out) ?? true);
    Object.defineProperty(out, STORED, { value: stored });
    Object.defineProperty(out, INJECTED, { value: injected });
    Object.defineProperty(out, SHOWN, { value: shown });
    const reading: Reading = { view: out, inputs };
    if (injected === undefined) top.set(stored, reading);
    return reading;
  };
  const storedOf = (view: PropView): StoredState => {
    const s = (view as Record<symbol, unknown>)[STORED];
    if (s === undefined) throw new Error(`${spec.type}: not a view of this group`);
    return s as StoredState;
  };
  const injectedOf = (view: PropView) =>
    (view as Record<symbol, Readonly<Record<string, unknown>> | undefined>)[INJECTED];

  // ---- running steps, purely: fold every instant change into one ----
  type Folded = {
    emits: Raised[];
    later: ((c: TaskContext<StoredState>) => Promise<void>)[];
    refused?: string;
  };
  const groupDef = {} as GroupDef;

  /** Applies a child's effect to its facts (a write to a bound field is refused). */
  const onSlice = (
    state: StoredState,
    name: string,
    effect: Effect<StoredState>,
    out: Folded,
  ): StoredState => {
    const tree = boundTree[name];
    const writesBound = (patch: Readonly<Record<string, unknown>>) =>
      tree !== undefined && Object.keys(patch).some((k) => tree[k] === true);
    if (effect.kind !== EffectKind.Set && isInstant(effect)) {
      const flat = flatten(effect);
      return onSlice(state, name, setRaised(flat.set, flat.emit), out);
    }
    if (effect.kind === EffectKind.Set) {
      if (writesBound(effect.set))
        throw new Error(
          `${name}: ${Object.keys(effect.set)
            .filter((k) => tree?.[k] === true)
            .join(", ")} is bound: change what it is worked out from`,
        );
      const slice = state[name] as StoredState;
      for (const e of effect.emit) out.emits.push({ ...e, signal: `${name}.${e.signal}` });
      return { ...state, [name]: { ...slice, ...effect.set } };
    }
    // Over time: runs after the instant part, writing the child's facts through the group's door.
    out.later.push(async (c) => {
      const sliceContext: TaskContext<StoredState> = {
        speak: c.speak,
        wait: c.wait,
        get: () => {
          const whole = c.get();
          const reading = read(whole);
          return { ...(whole[name] as StoredState), ...(reading.inputs[name]?.injected ?? {}) };
        },
        set: (patch) => {
          const whole = c.get();
          const facts = without(patch as StoredState, tree);
          c.set({ [name]: { ...(whole[name] as StoredState), ...facts } });
        },
        emit: (signal, payload) => {
          const full = `${name}.${signal}`;
          c.emit(full, payload);
          // A signal a child raises later (a glide ending) sets off WHEN too.
          if (spec.when?.[full] === undefined) return;
          const whole = c.get();
          const later: Folded = { emits: [], later: [] };
          const next = reactAll(
            whole,
            undefined,
            [{ signal: full, payload: payload ?? {} }],
            later,
            0,
          );
          c.set(diff(whole, next));
          for (const e of later.emits) c.emit(e.signal, e.payload);
          for (const run of later.later) void run(c);
        },
        call: (action, args) => {
          if (c.call === undefined) throw new Error(`${name}.${action}: nothing runs actions here`);
          return c.call(`${name}.${action}`, args);
        },
        ...(c.isLive !== undefined ? { isLive: c.isLive } : {}),
        ...(c.now !== undefined ? { now: c.now } : {}),
      };
      await runEffect(effect, sliceContext);
    });
    return state;
  };

  /** Runs one target ("input.change", "put") on a state, folding its instant change in. */
  const runStep = (
    state: StoredState,
    injected: Readonly<Record<string, unknown>> | undefined,
    step: Step,
    out: Folded,
    depth: number,
    isRouted: boolean,
  ): StoredState => {
    if (depth > 16) throw new Error(`${spec.type}: links run too deep (a loop?)`);
    const [target, args = {}] = step;
    const { children, name } = resolve(kids, target);
    if (children.length === 0) {
      // The group's own action, on its full view.
      const a = spec.actions?.[name] as ActionSpec<StoredState> | undefined;
      if (a === undefined) throw new Error(`${spec.type} has no action "${name}"`);
      const parsed = a.args.safeParse(args);
      if (!parsed.success)
        throw new Error(
          `${spec.type}.${name}: ${parsed.error.issues.map((i) => i.message).join("; ")}`,
        );
      const ran = a.run(read(state, injected).view as never, parsed.data as never);
      const flat = ran.kind !== EffectKind.Set && isInstant(ran) ? flatten(ran) : undefined;
      const e = flat === undefined ? ran : setRaised(flat.set, flat.emit);
      if (e.kind === EffectKind.Set) {
        const extra = Object.keys(e.set).filter((k) => !ownFields.includes(k));
        if (extra.length > 0)
          throw new Error(
            `${spec.type}.${name} can change only its own fields, not ${extra.join(", ")}`,
          );
        out.emits.push(...e.emit);
        return reactAll({ ...state, ...e.set }, injected, e.emit, out, depth);
      }
      // Over time: each step writes the group's own facts through its door.
      out.later.push(async (c) => {
        await runEffect(e, { ...c, get: () => read(c.get()).view as StoredState });
      });
      return state;
    }
    const [first = ""] = children;
    const route = isRouted ? undefined : spec.route?.[`${children.join(".")}.${name}`];
    if (route !== undefined) {
      const steps = route(read(state, injected).view, args);
      if (steps === undefined || isRefusal(steps)) {
        out.refused ??= isRefusal(steps) ? steps.refused : `${first}: nowhere for this to go`;
        return state;
      }
      let at = state;
      for (const s of steps) at = runStep(at, injected, s, out, depth + 1, true);
      return at;
    }
    // The child's own action, on its full view (a child group runs its own links inside).
    const input = read(state, injected).inputs[first];
    if (input === null || input === undefined) return state; // an absent child does nothing
    const child = childDef(first);
    const childAction = [...children.slice(1), name].join(".");
    const inner = internalsOf(child);
    let effect: Effect<StoredState>;
    if (inner !== undefined) {
      effect = inner.actOn(input.slice, input.injected, childAction, args);
    } else {
      const full =
        input.injected === undefined ? input.slice : { ...input.slice, ...input.injected };
      const prepared = prepareAction(child, full, childAction, args);
      if (!prepared.isOk) throw new Error(prepared.errors.join("; "));
      effect = prepared.effect;
    }
    const before = out.emits.length;
    const next = onSlice(state, first, effect, out);
    return reactAll(next, injected, out.emits.slice(before), out, depth);
  };

  /** WHEN: each signal raised so far may set off steps. */
  const reactAll = (
    state: StoredState,
    injected: Readonly<Record<string, unknown>> | undefined,
    emits: readonly Raised[],
    out: Folded,
    depth: number,
  ): StoredState => {
    let at = state;
    for (const e of emits) {
      const react = spec.when?.[e.signal];
      if (react === undefined) continue;
      for (const s of react(read(at, injected).view, e.payload ?? {}))
        at = runStep(at, injected, s, out, depth + 1, false);
    }
    return at;
  };

  /** A target run on this group's facts, as one effect: instant parts folded into one change. */
  const actOn: GroupInternals["actOn"] = (stored, injected, target, args) => {
    const out: Folded = { emits: [], later: [] };
    const next = runStep(stored, injected, [target, args], out, 0, false);
    const patch = diff(stored, next);
    if (out.refused !== undefined && Object.keys(patch).length === 0 && out.emits.length === 0)
      throw new Error(out.refused);
    if (out.later.length === 0) return setRaised(patch, out.emits);
    return task(async (c) => {
      if (Object.keys(patch).length > 0) c.set(patch);
      for (const e of out.emits) c.emit(e.signal, e.payload);
      for (const run of out.later) await run(c);
    });
  };

  const actionFor = (
    target: string,
    spec0: Pick<ActionSpec<StoredState>, "describe" | "args" | "byLearner" | "reveals">,
    /** The group's facts it can change: an own action's own, a child's action its child's. */
    changes: readonly string[],
  ): ActionSpec<StoredState> => ({
    describe: spec0.describe,
    args: spec0.args,
    changes,
    ...(spec0.byLearner !== undefined ? { byLearner: spec0.byLearner } : {}),
    ...(spec0.reveals !== undefined ? { reveals: spec0.reveals } : {}),
    run: (view, args) =>
      actOn(storedOf(view), injectedOf(view), target, args as Record<string, unknown>),
  });

  // Every action: the group's own, then each child's by path (a child group's include its children's).
  const routes = new Set(Object.keys(spec.route ?? {}));
  const actions: Record<string, ActionSpec<StoredState>> = {};
  for (const [name, a] of Object.entries(spec.actions ?? {}))
    actions[name] = actionFor(
      name,
      a as ActionSpec<StoredState>,
      (a as ActionSpec<StoredState>).changes,
    );
  // A routed action can change anything in the group; a child's own changes only that child.
  for (const name of childNames)
    for (const [action, a] of Object.entries(childDef(name).actions))
      actions[`${name}.${action}`] = actionFor(
        `${name}.${action}`,
        a,
        routes.has(`${name}.${action}`) ? [...ownFields, ...childNames] : [name],
      );

  // Signals: the group's own, and each child's by path.
  const signals: Record<string, SignalSpec> = { ...(spec.signals ?? {}) };
  for (const name of childNames)
    for (const [signal, s] of Object.entries(childDef(name).signals ?? {}))
      signals[`${name}.${signal}`] = s;

  /** The rules across children, on a view (with whatever a parent binds into the group). */
  const invariantOfView = (view: PropView): string | undefined => {
    for (const name of childNames) {
      const v = view[name];
      if (v === null || v === undefined) continue;
      const def = childDef(name);
      const inner = internalsOf(def);
      const broken =
        inner !== undefined
          ? inner.invariantOfView(v as PropView)
          : def.invariant?.(v as StoredState);
      if (broken !== undefined) return `${name}: ${broken}`;
    }
    return spec.invariant?.(view);
  };

  const internals: GroupInternals = {
    viewWith: (stored, injected) => read(stored, injected).view,
    actOn,
    stateWithout,
    invariantOfView,
  };
  Object.assign(groupDef, internals, {
    type: spec.type,
    describe: spec.describe,
    state,
    defaults,
    actions,
    signals,
    // Its derived values, for whoever lists or reads them by name (the board, the validator).
    derived: Object.fromEntries(
      Object.entries(spec.derived ?? {}).map(([d, { describe }]) => [
        d,
        { describe, compute: (s: StoredState) => read(s).view[d] },
      ]),
    ),
    /** The group's view: its facts, with everything bound and derived worked out (memoised). */
    view: (stored: StoredState) => read(stored).view,
    summary: (view: PropView) => spec.summary(view as never),
    invariant: (s: StoredState) => {
      for (const name of childNames) {
        if (s[name] === null && !optional.has(name)) return `${name} can't be left out`;
      }
      return invariantOfView(read(s).view);
    },
    ...(spec.isExplainer !== undefined ? { isExplainer: spec.isExplainer } : {}),
    ...(spec.inputs !== undefined ? { inputs: spec.inputs } : {}),
    group: {
      children: kids,
      optional: [...optional],
      layout: spec.layout,
      bound,
      boundTree,
      own: ownFields,
      sources,
      routes: Object.keys(spec.route ?? {}),
    },
    /** A placement's facts: defaults merged child by child with what it gives. */
    place: (given: Readonly<Record<string, unknown>>) => mergeGiven(groupDef, given),
  });
  noteNames(spec.type, spec.actions);
  noteNames(spec.type, spec.signals);
  return groupDef as unknown as GroupDef<GroupState<O, C, Opt>>;
}

function mergeTrees(a: BoundTree | undefined, b: BoundTree | undefined): BoundTree | undefined {
  if (a === undefined) return b;
  if (b === undefined) return a;
  const out: Record<string, true | BoundTree> = { ...a };
  for (const [k, sub] of Object.entries(b)) {
    const mine = out[k];
    out[k] =
      mine === undefined || mine === true || sub === true
        ? sub
        : (mergeTrees(mine, sub) as BoundTree);
  }
  return out;
}

/** Merges a nested placement over a group's defaults (child by child), for `initialState`. */
export function mergeGiven(
  def: AnyPropDef,
  given: Readonly<Record<string, unknown>>,
): Record<string, unknown> {
  const layout = groupOf(def);
  if (layout === undefined) return { ...def.defaults, ...given };
  const out: Record<string, unknown> = { ...def.defaults };
  for (const [key, value] of Object.entries(given)) {
    const child = layout.children[key];
    if (child === undefined || value === null || !isObject(value)) out[key] = value;
    else out[key] = mergeGiven(child, { ...(def.defaults[key] as object), ...value } as never);
  }
  return out;
}

export type { PropDef };
