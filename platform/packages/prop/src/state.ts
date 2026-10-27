import type { AnyPropDef, Effect, PropView, StoredState } from "./define";
import { EffectKind } from "./define";

export type StateResult =
  | { isOk: true; state: StoredState }
  | { isOk: false; errors: readonly string[] };

/** What anyone reads from a prop: its stored fields plus the derived ones, computed now. */
export function viewOf(def: AnyPropDef, stored: StoredState): PropView {
  // A group works out its own view: facts, what its links bind, and derived values (memoised).
  const own = (def as { view?: (s: StoredState) => PropView }).view;
  if (own !== undefined) return own(stored);
  const derived: Record<string, unknown> = {};
  for (const [key, spec] of Object.entries(def.derived ?? {})) derived[key] = spec.compute(stored);
  return { ...stored, ...derived };
}

/**
 * How much every change is checked. "full" (the default: development, tests, the content build,
 * the preview) parses the whole state against the prop's schema and runs its invariant on every
 * change, so a bug fails loudly where it happens. "light" (the shipped app) runs the invariant only;
 * action arguments are always checked, and saved state is checked fully when loaded or saved.
 */
export type StateChecks = "full" | "light";
let checks: StateChecks = "full";
export function setStateChecks(mode: StateChecks): void {
  checks = mode;
}
export function isFullChecking(): boolean {
  return checks === "full";
}

/** Checks a whole stored state against the prop's schema and invariant. */
export function checkStored(
  def: AnyPropDef,
  candidate: unknown,
  mode: StateChecks = checks,
): StateResult {
  if (mode === "light") {
    const state = candidate as StoredState;
    const broken = def.invariant?.(state);
    return broken === undefined
      ? { isOk: true, state }
      : { isOk: false, errors: [`${def.type}: ${broken}`] };
  }
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
  // A group merges child by child (group.ts); a placement is always checked fully, at build and
  // when a board opens.
  const place = (def as { place?: (g: Readonly<Record<string, unknown>>) => StoredState }).place;
  return checkStored(
    def,
    place !== undefined ? place(given) : { ...def.defaults, ...given },
    "full",
  );
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
  const merged = { ...stored, ...patch };
  return checkStored(def, merged);
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
  return runOn(def, viewOf(def, stored), name, parsed.data);
}

/**
 * The same, on a view already worked out (a piece on a board, with what the board binds into it).
 * Checks the action's name and arguments, then asks the prop what it does. Pure.
 */
export function prepareOnView(
  def: AnyPropDef,
  view: PropView,
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
  return runOn(def, view, name, parsed.data);
}

function runOn(def: AnyPropDef, view: PropView, name: string, args: unknown): ActionResult {
  const spec = def.actions[name];
  if (spec === undefined) return { isOk: false, errors: [`${def.type} has no action "${name}"`] };
  // `run` is typed per prop; the arguments were just checked against that prop's own schema.
  // A prop may throw to refuse (e.g. no component with that id): that is a refusal, not a crash.
  try {
    return { isOk: true, effect: spec.run(view as PropView & StoredState, args as never) };
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

/**
 * Where an effect leaves a state, as far as can be known without running it (for tools that play a
 * board forward, e.g. the validator): sets applied, tweens at their ends, in order.
 */
export function settle(
  def: AnyPropDef,
  stored: StoredState,
  effect: Effect<StoredState>,
): StateResult {
  if (effect.kind === EffectKind.Set) return applyPatch(def, stored, effect.set);
  if (effect.kind === EffectKind.Tween) return applyPatch(def, stored, effect.to);
  if (effect.kind === EffectKind.Seq || effect.kind === EffectKind.Par) {
    let at: StoredState = stored;
    for (const step of effect.steps) {
      const next = settle(def, at, step);
      if (!next.isOk) return next;
      at = next.state;
    }
    return { isOk: true, state: at };
  }
  return { isOk: true, state: stored }; // other steps' changes are only known when they run
}
