import type { AnyPropDef, Effect, Element, Observation, PropView, StoredState } from "./define";
import { EffectKind } from "./define";

export type StateResult =
  | { isOk: true; state: StoredState }
  | { isOk: false; errors: readonly string[] };

/** What anyone reads from a prop: its stored fields plus the derived ones, computed now. */
export function viewOf(def: AnyPropDef, stored: StoredState): PropView {
  const derived: Record<string, unknown> = {};
  for (const [key, spec] of Object.entries(def.derived ?? {})) derived[key] = spec.compute(stored);
  return { ...stored, ...derived };
}

/**
 * What the student sees of a prop right now: its own `observe`, or the default made from its view
 * (every field an element, `offScreen` ones under `hidden`) and its parts.
 */
export function observationOf(def: AnyPropDef, stored: StoredState): Observation {
  const view = viewOf(def, stored);
  if (def.observe !== undefined) return def.observe(view as never);
  const hiddenFields = new Set(def.offScreen ?? []);
  const elements: Element[] = [];
  const hidden: Record<string, unknown> = {};
  for (const [field, value] of Object.entries(view)) {
    if (hiddenFields.has(field)) hidden[field] = value;
    else elements.push({ id: field, value });
  }
  const seen = new Set(elements.map((e) => e.id));
  for (const part of def.parts?.(view as never) ?? [])
    if (!seen.has(part)) elements.push({ id: part });
  return {
    summary: def.describe,
    elements,
    ...(Object.keys(hidden).length > 0 ? { hidden } : {}),
  };
}

/** Checks a whole stored state against the prop's schema and invariant. */
export function checkStored(def: AnyPropDef, candidate: unknown): StateResult {
  const parsed = def.state.safeParse(candidate);
  if (!parsed.success) {
    return {
      isOk: false,
      errors: parsed.error.issues.map(
        (issue) => `${def.type}.${issue.path.join(".") || "state"}: ${issue.message}`,
      ),
    };
  }
  const state = parsed.data as StoredState;
  const broken = def.invariant?.(state);
  return broken === undefined
    ? { isOk: true, state }
    : { isOk: false, errors: [`${def.type}: ${broken}`] };
}

/** The starting state of a placed prop: its defaults, overridden by what the lesson gives. */
export function initialState(
  def: AnyPropDef,
  given: Readonly<Record<string, unknown>> = {},
): StateResult {
  const unknownKeys = Object.keys(given).filter((key) => !(key in def.defaults));
  if (unknownKeys.length > 0) {
    return {
      isOk: false,
      errors: unknownKeys.map(
        (key) =>
          `${def.type} has no field "${key}" (fields: ${Object.keys(def.defaults).join(", ")})`,
      ),
    };
  }
  return checkStored(def, { ...def.defaults, ...given });
}

/**
 * The one door: every change to a prop's stored fields, from any driver, goes through here.
 * Returns the new state, or every reason the change was refused.
 */
export function applyPatch(
  def: AnyPropDef,
  stored: StoredState,
  patch: Readonly<Record<string, unknown>>,
): StateResult {
  const unknownKeys = Object.keys(patch).filter((key) => !(key in def.defaults));
  if (unknownKeys.length > 0) {
    return {
      isOk: false,
      errors: unknownKeys.map((key) => `${def.type} has no stored field "${key}"`),
    };
  }
  return checkStored(def, { ...stored, ...patch });
}

export type ActionResult =
  | { isOk: true; effect: Effect<StoredState> }
  | { isOk: false; errors: readonly string[] };

/** Checks an action's name and arguments, then asks the prop what it does. Pure. */
export function prepareAction(
  def: AnyPropDef,
  stored: StoredState,
  name: string,
  args: unknown = {},
): ActionResult {
  const spec = def.actions[name];
  if (spec === undefined) {
    return {
      isOk: false,
      errors: [
        `${def.type} has no action "${name}" (actions: ${Object.keys(def.actions).join(", ")})`,
      ],
    };
  }
  const parsed = spec.args.safeParse(args);
  if (!parsed.success) {
    return {
      isOk: false,
      errors: parsed.error.issues.map(
        (i) => `${def.type}.${name}(${i.path.join(".")}): ${i.message}`,
      ),
    };
  }
  const view = viewOf(def, stored) as PropView & StoredState;
  // `run` is typed per prop; the arguments were just checked against that prop's own schema.
  // A prop may throw to refuse (e.g. no component with that id): that is a refusal, not a crash.
  try {
    return { isOk: true, effect: spec.run(view, parsed.data as never) };
  } catch (error) {
    return {
      isOk: false,
      errors: [`${def.type}.${name}: ${error instanceof Error ? error.message : String(error)}`],
    };
  }
}

/** Smooth start and stop. */
export function ease(x: number): number {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
}

/** The state part-way through a tween: numeric fields eased, anything else switches at the end. */
export function tweenAt(
  from: StoredState,
  to: Readonly<Record<string, unknown>>,
  progress: number,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const x = ease(progress);
  for (const [key, target] of Object.entries(to)) {
    const start = from[key];
    out[key] =
      typeof start === "number" && typeof target === "number"
        ? start + (target - start) * x
        : progress >= 1
          ? target
          : start;
  }
  return out;
}

/** Applies an instant effect to a state (for tools that play a board forward, e.g. the validator). */
export function settle(
  def: AnyPropDef,
  stored: StoredState,
  effect: Effect<StoredState>,
): StateResult {
  if (effect.kind === EffectKind.Set) return applyPatch(def, stored, effect.set);
  if (effect.kind === EffectKind.Tween) return applyPatch(def, stored, effect.to);
  return { isOk: true, state: stored }; // a task's changes are only known when it runs
}
