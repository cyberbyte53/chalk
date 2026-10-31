import {
  type AnyPropDef,
  EffectKind,
  type PropDef,
  type Raised,
  type StoredState,
  applyPatch,
  asAnyProp,
  isInstant,
  playAction,
  prepareAction,
  viewOf,
} from "@chalk/prop";

/** For tests: runs actions through the one door, as the player does. */
export function door<S extends StoredState, A extends string, G extends string, D extends string>(
  prop: PropDef<S, A, G, D>,
) {
  const def: AnyPropDef = asAnyProp(prop);
  const effectOf = (state: S, name: A, args: Record<string, unknown>) => {
    const result = prepareAction(def, state, name, args);
    if (!result.isOk) throw new Error(result.errors.join("; "));
    return result.effect;
  };
  return {
    /** An instant action: the next state and what it announced. */
    run(
      state: S,
      name: A,
      args: Record<string, unknown> = {},
    ): { state: S; emit: readonly Raised[] } {
      const effect = effectOf(state, name, args);
      if (effect.kind !== EffectKind.Set) throw new Error(`${name} should be instant`);
      const next = applyPatch(def, state, effect.set);
      if (!next.isOk) throw new Error(next.errors.join("; "));
      return { state: next.state as S, emit: effect.emit };
    },
    /** A timed action played to its end, every frame through the one door. */
    async play(state: S, name: A, args: Record<string, unknown> = {}) {
      const effect = effectOf(state, name, args);
      if (isInstant(effect)) throw new Error(`${name} should take time`);
      return playAction(def, state, name, args);
    },
    /** Whether the door refuses these arguments. */
    refuses(state: S, name: A, args: Record<string, unknown>): boolean {
      return !prepareAction(def, state, name, args).isOk;
    },
    /** Whether a stored state is refused by the schema or the invariant. */
    rejects(state: S, patch: Partial<S>): boolean {
      return !applyPatch(def, state, patch).isOk;
    },
    look: (state: S) => viewOf(def, state) as Record<string, unknown>,
  };
}
