import { type ZodType, z } from "zod";
import {
  type ActionSpec,
  type AnyPropDef,
  type DerivedSpec,
  type Effect,
  EffectKind,
  type Element,
  type Emit,
  type Observation,
  type PropDef,
  type PropView,
  type SignalSpec,
  type StoredState,
  type TaskContext,
  set,
  task,
} from "./define";
import { isFullChecking, observationOf, prepareAction, viewOf } from "./state";

/**
 * Groups: a prop made of other props joined by links (plans/props-composition.md).
 *
 * A group compiles to one ordinary prop whose state is nested: its own fields, then each child's
 * state under the child's name. So there is one store, and every change goes through the one door
 * (`applyPatch`), validated whole:
 *
 * - **Children keep their laws.** Learner and lesson call a child's action by path ("input.change");
 *   it runs the child's own action on the child's slice of the state.
 * - **IS** bindings are worked out after every change, inside the same change (atomic): a bound
 *   field always equals its function of the rest, and the owner's actions can't set it.
 * - **WHEN** reacts to a child's signal with steps (actions on children or the group's own).
 * - **ROUTE** takes a learner action on a child and does something else instead (or refuses).
 *   A learner control on a bound field must be routed: checked when the group is defined.
 * - **Invariants** across children are checked on the whole state (refused whole if broken).
 *
 * Signals from children reach the board as "<child>.<signal>" (e.g. machine's "input.changed"), and
 * paths name everything: "machine › input › more" in descriptions, "input.change" in actions.
 */

/** Where an element sits under its parent in descriptions and on screen: "plane › handle". */
export const PATH = " › ";

/** One step a link runs: a target ("input.change", "put", "plane.handle.put") and its arguments. */
export type Step = readonly [target: string, args?: Readonly<Record<string, unknown>>];
export type Steps = readonly Step[];

/** A group's view: its own fields and derived values, and each child's view under its name. */
export type GroupView = PropView;

/** Any props, leaves or groups (their own state types are kept by their definitions). */
// biome-ignore lint/suspicious/noExplicitAny: a child of any state type
export type GroupChildren = Readonly<Record<string, PropDef<any, any, any, any>>>;

export type GroupSpec<O extends StoredState> = {
  type: string;
  describe: string;
  /** What no child holds. */
  own?: ZodType<O>;
  ownDefaults?: O;
  children: GroupChildren;
  /** Children a placement may leave out (`with: { screen: null }`). */
  optional?: readonly string[];
  /** Overrides of the children's defaults, by child: { input: { step: 0.1 } }. */
  defaults?: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  /**
   * Bindings: "child.field" (or "child.grandchild.field") → its value from the group's view. A
   * bound field has one writer: this. Worked out in the order they're written; each may read the
   * ones before it.
   */
  is?: Readonly<Record<string, (s: GroupView) => unknown>>;
  /** "child.signal" (or "child.grandchild.signal") → steps to run, given the signal's payload. */
  when?: Readonly<
    Record<string, (s: GroupView, payload: Readonly<Record<string, unknown>>) => Steps>
  >;
  /**
   * "child.action" → steps to run instead of the child's own action, or undefined to refuse (the
   * learner's drag has nowhere to go).
   */
  route?: Readonly<
    Record<string, (s: GroupView, args: Readonly<Record<string, unknown>>) => Steps | undefined>
  >;
  /** The group's own actions: they change its own fields (`changes` names them). */
  actions?: Readonly<Record<string, ActionSpec<O>>>;
  signals?: Readonly<Record<string, SignalSpec>>;
  /** Derived values over the whole group (they can read children). */
  derived?: Readonly<Record<string, { describe: string; compute: (s: GroupView) => unknown }>>;
  /** A rule across children; the change is refused if it breaks. */
  invariant?: (s: GroupView) => string | undefined;
  /** The group's own line in its description; each child describes itself. */
  summary: (s: GroupView) => string;
  /** What the group knows that the screen doesn't show. */
  hidden?: (s: GroupView) => Readonly<Record<string, unknown>> | undefined;
  /**
   * How children are placed: top to bottom, side by side, or drawn together in one frame. In a
   * frame, `provider` owns the window and transform, `children` draw into its picture in this
   * order (later on top), `backdrop` (if any) is a picture behind it in its own coordinates, and
   * `below` are drawn under the picture (controls, readouts).
   */
  layout:
    | { kind: "column" | "row"; children: readonly string[] }
    | {
        kind: "frame";
        provider: string;
        children: readonly string[];
        backdrop?: string;
        below?: readonly string[];
      };
  isExplainer?: boolean;
};

export type GroupLayout = {
  children: GroupChildren;
  optional: readonly string[];
  layout: GroupSpec<StoredState>["layout"];
  /** Bound fields, as paths: "plane.handle.x". */
  bound: readonly string[];
  /** Own field names. */
  own: readonly string[];
};

export type GroupDef = AnyPropDef & { group: GroupLayout };

/** The group layout of a prop, if it is a group. */
export function groupOf(def: AnyPropDef): GroupLayout | undefined {
  return (def as Partial<GroupDef>).group;
}

/** The top-level fields that changed (unchanged slices keep their identity). */
const diff = (before: StoredState, after: StoredState): Record<string, unknown> =>
  Object.fromEntries(Object.entries(after).filter(([k]) => after[k] !== before[k]));

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

/** A value at a path in a nested state ("plane.handle.x"). */
function getPath(s: unknown, path: readonly string[]): unknown {
  let at: unknown = s;
  for (const key of path) {
    if (!isObject(at)) return undefined;
    at = at[key];
  }
  return at;
}

/** A copy of a nested state with one value replaced (only the objects along the path are copied). */
function setPath(s: StoredState, path: readonly string[], value: unknown): StoredState {
  const [head, ...rest] = path;
  if (head === undefined) return s;
  if (rest.length === 0) return { ...s, [head]: value };
  const inner = isObject(s[head]) ? (s[head] as StoredState) : {};
  return { ...s, [head]: setPath(inner, rest, value) };
}

/**
 * Splits a dotted target into the child path and the last name, walking only real children:
 * "plane.handle.put" → { children: ["plane", "handle"], name: "put" }.
 */
function resolve(
  def: AnyPropDef,
  dotted: string,
): { children: string[]; name: string; leaf: AnyPropDef } {
  const parts = dotted.split(".");
  const children: string[] = [];
  let at: AnyPropDef = def;
  while (parts.length > 1) {
    const layout = groupOf(at);
    const next = parts[0] ?? "";
    const child = layout?.children[next];
    if (child === undefined) break;
    children.push(next);
    parts.shift();
    at = child;
  }
  return { children, name: parts.join("."), leaf: at };
}

/** Every child a layout places, in drawing order (backdrop, provider, frame children, below). */
export function layoutChildren(layout: GroupSpec<StoredState>["layout"]): string[] {
  if (layout.kind !== "frame") return [...layout.children];
  return [
    ...(layout.backdrop !== undefined ? [layout.backdrop] : []),
    layout.provider,
    ...layout.children,
    ...(layout.below ?? []),
  ];
}

export function defineGroup<O extends StoredState = Record<string, never>>(
  spec: GroupSpec<O>,
): GroupDef {
  const childNames = Object.keys(spec.children);
  const optional = new Set(spec.optional ?? []);
  const own = (spec.own ?? z.object({}).strict()) as unknown as ZodType<StoredState>;
  const ownDefaults = (spec.ownDefaults ?? {}) as StoredState;
  const ownFields = Object.keys(ownDefaults);
  for (const name of childNames)
    if (ownFields.includes(name))
      throw new Error(`${spec.type}: "${name}" is both an own field and a child`);
  const placed = layoutChildren(spec.layout);
  for (const name of placed)
    if (spec.children[name] === undefined)
      throw new Error(`${spec.type}: layout names no child "${name}"`);
  if (spec.layout.kind === "frame") {
    const provider = spec.children[spec.layout.provider] as AnyPropDef | undefined;
    const kind = provider?.frame?.kind;
    if (kind === undefined)
      throw new Error(`${spec.type}: ${spec.layout.provider} provides no frame`);
    for (const name of spec.layout.children) {
      const drawsOn = (spec.children[name] as AnyPropDef).drawsOn;
      if (drawsOn !== undefined && drawsOn !== kind)
        throw new Error(`${spec.type}: ${name} draws on ${drawsOn}, the frame is ${kind}`);
    }
    for (const name of spec.layout.below ?? [])
      if ((spec.children[name] as AnyPropDef).drawsOn !== undefined)
        throw new Error(`${spec.type}: ${name} draws on a frame; it can't go below it`);
  }

  // ---- the nested state ----
  const ownShape = (own as unknown as { shape?: z.ZodRawShape }).shape ?? {};
  const shape: z.ZodRawShape = { ...ownShape };
  for (const name of childNames) {
    const childState = (spec.children[name] as AnyPropDef).state as unknown as z.ZodTypeAny;
    shape[name] = optional.has(name) ? childState.nullable() : childState;
  }
  const defaults: Record<string, unknown> = { ...ownDefaults };
  for (const name of childNames) {
    const child = spec.children[name] as AnyPropDef;
    defaults[name] = { ...child.defaults, ...(spec.defaults?.[name] ?? {}) };
  }

  // ---- bindings ----
  const bindings = Object.entries(spec.is ?? {}).map(([target, fn]) => {
    const { children, name, leaf } = resolve(
      { group: { children: spec.children } } as never,
      target,
    );
    if (children.length === 0)
      throw new Error(`${spec.type}: IS ${target} must name a child's field ("child.field")`);
    const field = name.split(".");
    if (!Object.hasOwn(leaf.defaults, field[0] ?? ""))
      throw new Error(
        `${spec.type}: IS ${target}: ${children.join(".")} has no field "${field[0]}"`,
      );
    return { target, path: [...children, ...field], children, field, fn };
  });
  const bound = new Set(bindings.map((b) => b.target));
  if (bound.size !== bindings.length) throw new Error(`${spec.type}: a field is bound twice`);

  const viewOfGroup = (s: StoredState): GroupView => {
    const out: Record<string, unknown> = {};
    for (const f of ownFields) out[f] = s[f];
    for (const name of childNames) {
      const child = spec.children[name] as AnyPropDef;
      out[name] = s[name] === null ? null : viewOf(child, s[name] as StoredState);
    }
    for (const [d, { compute }] of Object.entries(spec.derived ?? {})) out[d] = compute(out);
    return out;
  };

  /** Makes every binding true, in order; each reads the state as the ones before it left it. */
  const settle = (s: StoredState): StoredState => {
    let at = s;
    for (const b of bindings) {
      if (b.children.some((_, i) => getPath(at, b.children.slice(0, i + 1)) === null)) continue;
      at = setPath(at, b.path, b.fn(viewOfGroup(at)));
    }
    return at;
  };

  // ---- one writer: a learner control on a bound field must be routed ----
  for (const b of bindings) {
    const leafDef = resolve(
      { group: { children: spec.children } } as never,
      `${b.children.join(".")}.x`,
    ).leaf;
    for (const [action, a] of Object.entries(leafDef.actions)) {
      const changesIt = a.changes === undefined || a.changes.includes(b.field[0] ?? "");
      const key = `${b.children.join(".")}.${action}`;
      if (a.byLearner === true && changesIt && spec.route?.[key] === undefined)
        throw new Error(
          `${spec.type}: ${key} is the learner's and changes ${b.target}, which is bound: route it to the owner`,
        );
    }
  }

  // ---- running steps, purely: fold every instant change into one ----
  type Folded = {
    state: StoredState;
    emits: Emit[];
    later: ((c: TaskContext<StoredState>) => Promise<void>)[];
  };
  const groupDef = {} as GroupDef;

  /** Applies a child's effect to its slice. */
  const onSlice = (
    state: StoredState,
    children: readonly string[],
    effect: Effect<StoredState>,
    signalPrefix: string,
    out: Folded,
  ): StoredState => {
    if (effect.kind === EffectKind.Set) {
      const slice = getPath(state, children) as StoredState;
      const next = setPath(state, children, { ...slice, ...effect.set });
      for (const e of effect.emit) out.emits.push({ ...e, signal: `${signalPrefix}${e.signal}` });
      return next;
    }
    // Over time: runs after the instant part, writing the slice through the group's one door.
    out.later.push(async (c) => {
      const sliceContext: TaskContext<StoredState> = {
        speak: c.speak,
        wait: c.wait,
        get: () => getPath(c.get(), children) as StoredState,
        set: (patch) => {
          const whole = c.get();
          const slice = getPath(whole, children) as StoredState;
          const next = settle(setPath(whole, children, { ...slice, ...patch }));
          c.set(diff(whole, next));
        },
        emit: (signal, payload) => {
          const name = `${signalPrefix}${signal}`;
          c.emit(name, payload);
          // A signal a child raises later (a glide ending) sets off WHEN too.
          if (spec.when?.[name] === undefined) return;
          const whole = c.get();
          const later: Folded = { state: whole, emits: [], later: [] };
          const next = reactAll(whole, [{ signal: name, payload: payload ?? {} }], later, 0);
          c.set(diff(whole, next));
          for (const e of later.emits) c.emit(e.signal, e.payload);
          for (const run of later.later) void run(c);
        },
      };
      if (effect.kind === EffectKind.Task) await effect.run(sliceContext);
      else {
        // A child's tween: eased over its duration, a frame at a time, through the slice.
        const from = sliceContext.get();
        const frames = Math.max(1, Math.round(effect.duration * 60));
        for (let i = 1; i <= frames; i++) {
          await c.wait(effect.duration / frames);
          const t = i / frames;
          const x = t * t * (3 - 2 * t);
          const patch: Record<string, unknown> = {};
          for (const [k, to] of Object.entries(effect.to)) {
            const start = from[k];
            patch[k] =
              typeof start === "number" && typeof to === "number"
                ? start + (to - start) * x
                : t >= 1
                  ? to
                  : start;
          }
          sliceContext.set(patch);
        }
      }
    });
    return state;
  };

  /** Runs one target ("input.change", "put") on a state, folding its instant change in. */
  const runStep = (
    state: StoredState,
    step: Step,
    out: Folded,
    depth: number,
    isRouted: boolean,
  ): StoredState => {
    if (depth > 16) throw new Error(`${spec.type}: links run too deep (a loop?)`);
    const [target, args = {}] = step;
    const { children, name } = resolve(groupDef, target);
    if (children.length === 0) {
      // The group's own action.
      const prepared = prepareAction(ownProp, state, name, args);
      if (!prepared.isOk) throw new Error(prepared.errors.join("; "));
      const e = prepared.effect;
      if (e.kind === EffectKind.Set) {
        const next = { ...state, ...e.set };
        out.emits.push(...e.emit);
        return reactAll(next, e.emit, out, depth);
      }
      // Over time: each step writes through the group's door, with the bindings made true.
      out.later.push(async (c) => {
        if (e.kind !== EffectKind.Task) return;
        await e.run({
          ...c,
          set: (patch) => {
            const whole = c.get();
            const next = settle({ ...whole, ...patch });
            c.set(diff(whole, next));
          },
        });
      });
      return state;
    }
    const childKey = `${children.join(".")}.${name}`;
    const route = isRouted ? undefined : spec.route?.[childKey];
    if (route !== undefined) {
      const steps = route(viewOfGroup(state), args);
      if (steps === undefined) return state; // refused: nowhere for it to go
      let at = state;
      for (const s of steps) at = runStep(at, s, out, depth + 1, true);
      return at;
    }
    // The child's own action, on its slice (a child group runs its own links inside).
    const [first, ...rest] = children;
    const child = spec.children[first ?? ""] as AnyPropDef;
    const slice = state[first ?? ""];
    if (slice === null || slice === undefined) return state; // an absent child does nothing
    const childAction = [...rest, name].join(".");
    const prepared = prepareAction(child, slice as StoredState, childAction, args);
    if (!prepared.isOk) throw new Error(prepared.errors.join("; "));
    const before = out.emits.length;
    const next = onSlice(state, [first ?? ""], prepared.effect, `${first}.`, out);
    return reactAll(next, out.emits.slice(before), out, depth);
  };

  /** WHEN: each signal raised so far may set off steps. */
  const reactAll = (
    state: StoredState,
    emits: readonly Emit[],
    out: Folded,
    depth: number,
  ): StoredState => {
    let at = settle(state);
    for (const e of emits) {
      const react = spec.when?.[e.signal];
      if (react === undefined) continue;
      for (const s of react(viewOfGroup(at), e.payload ?? {}))
        at = runStep(at, s, out, depth + 1, false);
      at = settle(at);
    }
    return at;
  };

  /** A target as one action of the group's prop: instant parts folded into one change. */
  const actionFor = (
    target: string,
    spec0: Pick<ActionSpec<StoredState>, "describe" | "args" | "byLearner" | "reveals">,
    changes: readonly string[],
  ): ActionSpec<StoredState> => ({
    ...spec0,
    changes,
    run: (view, args) => {
      const state = storedOf(view);
      const out: Folded = { state, emits: [], later: [] };
      const next = runStep(state, [target, args as Record<string, unknown>], out, 0, false);
      const patch = diff(state, next);
      if (out.later.length === 0) return set(patch, ...out.emits);
      return task(async (c) => {
        if (Object.keys(patch).length > 0) c.set(patch);
        for (const e of out.emits) c.emit(e.signal, e.payload);
        for (const run of out.later) await run(c);
      });
    },
  });

  /** The stored part of a view: own fields and children's stored fields (derived values dropped). */
  const storedOf = (view: PropView): StoredState => {
    const out: Record<string, unknown> = {};
    for (const f of ownFields) out[f] = view[f];
    for (const name of childNames) {
      const child = spec.children[name] as AnyPropDef;
      const v = view[name];
      out[name] = v === null || v === undefined ? null : storedOfChild(child, v as PropView);
    }
    return out;
  };
  const storedOfChild = (def: AnyPropDef, view: PropView): StoredState => {
    const g = groupOf(def);
    if (g !== undefined)
      return (def as unknown as { storedOf: (v: PropView) => StoredState }).storedOf(view);
    return Object.fromEntries(Object.keys(def.defaults).map((k) => [k, view[k]]));
  };

  // The group's own fields as a prop of their own, so its own actions run through the same code.
  const ownProp: AnyPropDef = {
    type: `${spec.type}:own`,
    describe: spec.describe,
    state: z.any() as unknown as ZodType<StoredState>,
    defaults: defaults as StoredState,
    actions: (spec.actions ?? {}) as Readonly<Record<string, ActionSpec<StoredState>>>,
  };

  // Every action: the group's own, then each child's by path (a child group's include its children's).
  const actions: Record<string, ActionSpec<StoredState>> = {};
  for (const [name, a] of Object.entries(spec.actions ?? {}))
    actions[name] = actionFor(name, a as ActionSpec<StoredState>, [
      ...(a.changes ?? ownFields),
      ...childNames,
    ]);
  for (const name of childNames) {
    const child = spec.children[name] as AnyPropDef;
    for (const [action, a] of Object.entries(child.actions))
      actions[`${name}.${action}`] = actionFor(`${name}.${action}`, a, [
        ...ownFields,
        ...childNames,
      ]);
  }

  // Signals: the group's own, and each child's by path.
  const signals: Record<string, SignalSpec> = { ...(spec.signals ?? {}) };
  for (const name of childNames)
    for (const [signal, s] of Object.entries((spec.children[name] as AnyPropDef).signals ?? {}))
      signals[`${name}.${signal}`] = s;

  // Each child's view, made again only when its own slice changed (a change copies only the slices
  // it touches), so a view that draws children redraws only the ones that changed.
  const derived: Record<string, DerivedSpec<StoredState>> = {};
  for (const name of childNames) {
    const cache = new WeakMap<object, PropView>();
    derived[name] = {
      describe: `${name}'s view`,
      compute: (s) => {
        const slice = s[name];
        if (slice === null || typeof slice !== "object") return null;
        const known = cache.get(slice);
        if (known !== undefined) return known;
        const made = viewOf(spec.children[name] as AnyPropDef, slice as StoredState);
        cache.set(slice, made);
        return made;
      },
    };
  }
  for (const [d, { describe, compute }] of Object.entries(spec.derived ?? {}))
    derived[d] = { describe, compute: (s) => compute(viewOfGroup(s)) };

  const observe = (view: PropView): Observation => {
    const s = storedOf(view);
    const elements: Element[] = [];
    const inner: Record<string, unknown> = {};
    for (const name of placed) {
      if (s[name] === null) continue;
      const child = spec.children[name] as AnyPropDef;
      const seen = observationOf(child, s[name] as StoredState);
      for (const e of seen.elements) {
        const does = e.does === undefined ? [] : typeof e.does === "string" ? [e.does] : e.does;
        // A control does the child's action by path (the group routes it, or the child runs it).
        const paths = does.map((a) => `${name}.${a}`);
        const { does: _d, ...plain } = e;
        elements.push({
          ...plain,
          id: `${name}${PATH}${e.id}`,
          ...(paths.length === 1 ? { does: paths[0] } : paths.length > 1 ? { does: paths } : {}),
        });
      }
      if (seen.hidden !== undefined) inner[name] = seen.hidden;
    }
    const v = viewOfGroup(s);
    const all = {
      ...(spec.hidden?.(v) ?? {}),
      ...(Object.keys(inner).length > 0 ? { children: inner } : {}),
    };
    return {
      summary: spec.summary(v),
      elements,
      ...(Object.keys(all).length > 0 ? { hidden: all } : {}),
    };
  };

  const state = z.object(shape).strict() as unknown as ZodType<StoredState>;
  const settledDefaults = settle(defaults as StoredState);
  Object.assign(groupDef, {
    type: spec.type,
    describe: spec.describe,
    state,
    defaults: settledDefaults,
    derived,
    actions,
    signals,
    observe,
    parts: (view: PropView) => observe(view).elements.map((e) => e.id),
    invariant: (s: StoredState) => {
      for (const name of childNames) {
        const v = s[name];
        if (v === null) {
          if (!optional.has(name)) return `${name} can't be left out`;
          continue;
        }
        const broken = (spec.children[name] as AnyPropDef).invariant?.(v as StoredState);
        if (broken !== undefined) return `${name}: ${broken}`;
      }
      // Bindings hold, whoever changed the state (a development check).
      if (!isFullChecking()) return spec.invariant?.(viewOfGroup(s));
      const settledNow = settle(s);
      for (const b of bindings)
        if (JSON.stringify(getPath(settledNow, b.path)) !== JSON.stringify(getPath(s, b.path)))
          return `${b.target} is bound and must equal its rule`;
      return spec.invariant?.(viewOfGroup(s));
    },
    ...(spec.isExplainer !== undefined ? { isExplainer: spec.isExplainer } : {}),
    group: {
      children: spec.children,
      optional: [...optional],
      layout: spec.layout,
      bound: [...bound],
      own: ownFields,
    },
    storedOf,
    /** Makes the bindings true on a state (placement, restore). */
    settle,
    /** A placement's state: defaults merged child by child with what it gives, bindings true. */
    place: (given: Readonly<Record<string, unknown>>) => {
      const merged = mergeGiven(groupDef, given) as StoredState;
      // A placement that leaves out a child it can't is reported by the check, not thrown here.
      try {
        return settle(merged);
      } catch {
        return merged;
      }
    },
  });
  return groupDef;
}

/** A placement's state for a group: defaults, overridden child by child, bindings made true. */
export function settleGroup(def: AnyPropDef, state: StoredState): StoredState {
  const g = def as unknown as { settle?: (s: StoredState) => StoredState };
  return g.settle === undefined ? state : g.settle(state);
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
