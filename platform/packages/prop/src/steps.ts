import {
  type AnyPropDef,
  type Effect,
  EffectKind,
  type StoredState,
  type TaskContext,
} from "./define";
import { applyPatch, prepareAction, ease as smooth } from "./state";

/** Frames a second a tween moves at (each frame is one change through the one door). */
export const FRAMES_PER_SECOND = 60;
const FRAME = 1 / FRAMES_PER_SECOND;

/** Whether an effect is instant (it only sets fields and raises signals). */
export function isInstant<S extends StoredState>(effect: Effect<S>): boolean {
  if (effect.kind === EffectKind.Set) return true;
  if (effect.kind === EffectKind.Seq || effect.kind === EffectKind.Par)
    return effect.steps.every((step) => isInstant(step));
  return false;
}

/** The state part-way through a tween: numbers eased, anything else switching at the end. */
export function tweenFrame(
  from: StoredState,
  to: Readonly<Record<string, unknown>>,
  t: number,
  ease: (t: number) => number = smooth,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const x = ease(t);
  for (const [key, target] of Object.entries(to)) {
    const start = from[key];
    out[key] =
      typeof start === "number" && typeof target === "number"
        ? start + (target - start) * x
        : t >= 1
          ? target
          : start;
  }
  return out;
}

/**
 * Runs an effect against a context: the one interpreter, used by the player, by groups for their
 * children, and by tests. Instant steps run at once (steps that only set fold into the call);
 * the rest wait on the context's clock. Resolves true when it ran to the end, false when it was
 * stopped (the context went dead, or something else changed what a tween was moving).
 */
export function runEffect<S extends StoredState>(
  typed: Effect<S>,
  context: TaskContext<S>,
): Promise<boolean> | boolean {
  // Inside, any prop's state: the types are for the prop that wrote the effect.
  return run(
    typed as unknown as Effect<StoredState>,
    context as unknown as TaskContext<StoredState>,
  );
}

function run(effect: Effect<StoredState>, c: TaskContext<StoredState>): Promise<boolean> | boolean {
  const isLive = () => c.isLive?.() ?? true;
  if (!isLive()) return false;
  switch (effect.kind) {
    case EffectKind.Set:
      if (Object.keys(effect.set).length > 0) c.set(effect.set);
      for (const e of effect.emit) c.emit(e.signal, e.payload);
      return true;
    case EffectKind.Seq: {
      const steps = effect.steps;
      // Instant steps run now, in order; the first one that takes time hands over to a promise.
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i] as Effect<StoredState>;
        const ran = run(step, c);
        if (ran === false) return false;
        if (ran !== true)
          return ran.then(async (ok) => {
            if (!ok) return false;
            for (const rest of steps.slice(i + 1)) if (!(await run(rest, c))) return false;
            return true;
          });
      }
      return true;
    }
    case EffectKind.Par: {
      const runs = effect.steps.map((step) => run(step, c));
      if (runs.every((r) => r === true || r === false)) return runs.every((r) => r === true);
      return Promise.all(runs).then((all) => all.every(Boolean));
    }
    case EffectKind.Tween:
      return tweenOn(effect, c, isLive);
    case EffectKind.Wait:
      return c.wait(effect.seconds).then(isLive);
    case EffectKind.Say:
      return c.speak().then(isLive);
    case EffectKind.Call: {
      if (c.call === undefined) throw new Error(`call ${effect.action}: nothing runs actions here`);
      return c.call(effect.action, effect.args).then(isLive);
    }
    case EffectKind.Until:
      return untilOn(effect.test, c, isLive);
    case EffectKind.Repeat:
      return repeatOn(effect, c, isLive);
    case EffectKind.Task:
      return effect.run(c).then(isLive);
  }
}

async function tweenOn(
  effect: Extract<Effect<StoredState>, { kind: "tween" }>,
  c: TaskContext<StoredState>,
  isLive: () => boolean,
): Promise<boolean> {
  const start = c.get();
  const keys = Object.keys(effect.to);
  const frames = Math.max(1, Math.round(effect.duration * FRAMES_PER_SECOND));
  let last: Record<string, unknown> = Object.fromEntries(keys.map((k) => [k, start[k]]));
  const startedAt = c.now?.();
  // How far along after each frame: by the board's clock when there is one, else by frames.
  let frame = 0;
  const progress = (): number => {
    frame++;
    if (startedAt === undefined || c.now === undefined) return frame / frames;
    return effect.duration <= 0 ? 1 : Math.min(1, (c.now() - startedAt) / effect.duration);
  };
  for (let t = 0; t < 1; ) {
    await c.wait(startedAt === undefined ? effect.duration / frames : FRAME);
    if (!isLive()) return false;
    t = progress();
    const now = c.get();
    if (keys.some((k) => !Object.is(now[k], last[k]))) return false;
    if (effect.while !== undefined && !effect.while(now)) return false;
    const next =
      effect.interpolate !== undefined
        ? t >= 1
          ? { ...effect.to }
          : (effect.interpolate(start, effect.to, (effect.ease ?? ((x) => x))(t)) as Record<
              string,
              unknown
            >)
        : tweenFrame(start, effect.to, t, effect.ease);
    c.set(next);
    const after = c.get();
    last = Object.fromEntries(keys.map((k) => [k, after[k]]));
  }
  return true;
}

async function untilOn(
  test: (s: StoredState) => boolean,
  c: TaskContext<StoredState>,
  isLive: () => boolean,
): Promise<boolean> {
  while (!test(c.get())) {
    await c.wait(FRAME);
    if (!isLive()) return false;
  }
  return true;
}

async function repeatOn(
  effect: Extract<Effect<StoredState>, { kind: "repeat" }>,
  c: TaskContext<StoredState>,
  isLive: () => boolean,
): Promise<boolean> {
  if (c.call === undefined) throw new Error(`repeat ${effect.action}: nothing runs actions here`);
  // Ticks keep to the clock (the k-th at k × every), so a late frame doesn't push the rest back.
  const startedAt = c.now?.();
  let ticks = 0;
  while (effect.while(c.get())) {
    ticks++;
    const now = c.now?.();
    await c.wait(
      startedAt === undefined || now === undefined
        ? effect.every
        : Math.max(0, startedAt + ticks * effect.every - now),
    );
    if (!isLive()) return false;
    if (!effect.while(c.get())) break;
    await c.call(effect.action, effect.args);
    if (!isLive()) return false;
  }
  return true;
}

/** An instant effect as one change: the fields it sets (later ones win) and the signals it raises. */
export function flatten<S extends StoredState>(
  typed: Effect<S>,
): {
  set: Record<string, unknown>;
  emit: { signal: string; payload?: Readonly<Record<string, unknown>> }[];
} {
  const out = {
    set: {} as Record<string, unknown>,
    emit: [] as { signal: string; payload?: Readonly<Record<string, unknown>> }[],
  };
  const walk = (e: Effect<StoredState>) => {
    if (e.kind === EffectKind.Set) {
      Object.assign(out.set, e.set);
      out.emit.push(...e.emit);
    } else if (e.kind === EffectKind.Seq || e.kind === EffectKind.Par) e.steps.forEach(walk);
    else throw new Error(`a ${e.kind} step is not instant`);
  };
  walk(typed as unknown as Effect<StoredState>);
  return out;
}

/** What playing an action headlessly produced: the state after, what it raised, every change. */
export type Played<S extends StoredState> = {
  state: S;
  emit: { signal: string; payload?: Readonly<Record<string, unknown>> }[];
  frames: S[];
};

/**
 * Plays one of a prop's actions to its end with a clock that never waits (for tests and tools):
 * every change through the one door, every `call` and tick on the same prop. Throws if the action
 * or any change is refused. `meanwhile` may change the state before the n-th wait (to test that
 * the learner wins).
 */
export async function playAction<S extends StoredState>(
  def: AnyPropDef,
  start: S,
  name: string,
  args: Readonly<Record<string, unknown>> = {},
  meanwhile?: { atWait: number; patch: Partial<S> },
): Promise<Played<S>> {
  let state: StoredState = start;
  const frames: S[] = [];
  const emitted: Played<S>["emit"] = [];
  let waits = 0;
  const apply = (patch: Readonly<Record<string, unknown>>) => {
    const next = applyPatch(def, state, patch);
    if (!next.isOk) throw new Error(`${name}: ${next.errors.join("; ")}`);
    state = next.state;
    frames.push(state as S);
  };
  const context: TaskContext<StoredState> = {
    speak: () => Promise.resolve(),
    wait: () => {
      waits += 1;
      if (meanwhile !== undefined && waits === meanwhile.atWait) apply(meanwhile.patch);
      return Promise.resolve();
    },
    set: apply,
    get: () => state,
    emit: (signal, payload) => {
      emitted.push(payload === undefined ? { signal } : { signal, payload });
    },
    call: async (action, callArgs) => {
      await run(action, callArgs);
    },
  };
  const run = async (action: string, actionArgs: Readonly<Record<string, unknown>>) => {
    const prepared = prepareAction(def, state, action, actionArgs);
    if (!prepared.isOk) throw new Error(prepared.errors.join("; "));
    await runEffect(prepared.effect, context);
  };
  await run(name, args);
  return { state: state as S, emit: emitted, frames };
}
