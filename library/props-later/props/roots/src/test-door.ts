import {
  type AnyPropDef,
  EffectKind,
  type Emit,
  type StoredState,
  applyPatch,
  playAction,
  prepareAction,
} from "@chalk/prop";

/** What a run through the one door produced: the state after, what it announced, every frame. */
export type DoorRun<S> = { state: S; emit: Emit[]; frames: S[] };

/**
 * Runs an action the way the player does, with a clock that never waits: every change through the
 * one door. Throws if the action is refused or any frame breaks the prop's rules. `meanwhile` runs
 * before the n-th wait (for testing that the learner wins).
 */
export async function throughDoor<S extends StoredState>(
  def: AnyPropDef,
  start: S,
  name: string,
  args: Record<string, unknown> = {},
  meanwhile?: { atWait: number; patch: Partial<S> },
): Promise<DoorRun<S>> {
  return playAction(def, start, name, args, meanwhile);
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
