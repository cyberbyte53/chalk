import {
  type AnyPropDef,
  EffectKind,
  type Emit,
  type StoredState,
  applyPatch,
  prepareAction,
  tweenAt,
} from "@chalk/prop";

/** What a run through the one door produced: the state after, what it announced, every frame. */
export type DoorRun<S> = { state: S; emit: Emit[]; frames: S[] };

/**
 * Runs an action the way the player does, with a clock that never waits: an instant change, every
 * frame of a tween, or a task's every `set`, each through the one door. Throws if the action is
 * refused or any frame breaks the prop's rules. `meanwhile` runs before a task's n-th wait (for
 * testing that the learner wins).
 */
export async function throughDoor<S extends StoredState>(
  def: AnyPropDef,
  start: S,
  name: string,
  args: Record<string, unknown> = {},
  meanwhile?: { atWait: number; patch: Partial<S> },
): Promise<DoorRun<S>> {
  const prepared = prepareAction(def, start, name, args);
  if (!prepared.isOk) throw new Error(prepared.errors.join("; "));
  const effect = prepared.effect;
  let state: StoredState = start;
  const frames: S[] = [];
  const emit: Emit[] = [];
  const apply = (patch: Readonly<Record<string, unknown>>) => {
    const next = applyPatch(def, state, patch);
    if (!next.isOk) throw new Error(`${name}: ${next.errors.join("; ")}`);
    state = next.state;
    // The door has just checked it against the prop's schema.
    frames.push(state as S);
  };
  if (effect.kind === EffectKind.Set) {
    apply(effect.set);
    emit.push(...effect.emit);
  } else if (effect.kind === EffectKind.Tween) {
    for (let i = 0; i <= 100; i++) apply(tweenAt(start, effect.to, i / 100));
  } else {
    let waits = 0;
    await effect.run({
      speak: () => Promise.resolve(),
      wait: () => {
        waits += 1;
        if (meanwhile !== undefined && waits === meanwhile.atWait) apply(meanwhile.patch);
        return Promise.resolve();
      },
      set: (patch) => apply(patch),
      get: () => state,
      emit: (signal, payload) => {
        emit.push(payload === undefined ? { signal } : { signal, payload });
      },
    });
  }
  // Every frame passed the door above.
  return { state: state as S, emit, frames };
}

/** Whether the action is refused (bad arguments, the prop says no, or its result breaks the rules). */
export function isRefused(
  def: AnyPropDef,
  state: StoredState,
  name: string,
  args: Record<string, unknown> = {},
): boolean {
  const prepared = prepareAction(def, state, name, args);
  if (!prepared.isOk) return true;
  const effect = prepared.effect;
  if (effect.kind === EffectKind.Set) return !applyPatch(def, state, effect.set).isOk;
  if (effect.kind === EffectKind.Tween) return !applyPatch(def, state, effect.to).isOk;
  return false;
}
