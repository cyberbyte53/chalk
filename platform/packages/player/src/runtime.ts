import {
  Actor,
  type Board,
  type IsRule,
  type Script,
  type WhenRule,
  argExpression,
  propPieces,
  splitTarget,
} from "@chalk/content";
import {
  AnswerStatus,
  type AnyPropDef,
  BOARD,
  BoardAction,
  BoardSignal,
  EffectKind,
  type Emit,
  type Expression,
  PropRole,
  type PropView,
  SAY,
  type Spoken,
  type StoredState,
  type Template,
  applyPatch,
  boardProp,
  compileExpression,
  compileTemplate,
  initialState,
  prepareAction,
  tweenAt,
  viewOf,
} from "@chalk/prop";
import {
  type ReadonlySignal,
  type Signal,
  batch,
  computed,
  effect,
  signal,
  untracked,
} from "@preact/signals-core";

/** What the runtime needs from outside: the voice and the screen's frames. Fakes in tests. */
export type RuntimeServices = {
  /** Reads a prop's line aloud; resolves when it ends or fails (the text stays on screen either way). */
  speak: (prop: { name: string; id: number | undefined }, line: Spoken) => Promise<void>;
  /** Calls back on the next frame with the time in ms; returns a function that cancels it. */
  frame: (callback: (now: number) => void) => () => void;
  now: () => number;
  /** Something in the content broke while playing. The board carries on. */
  onError: (message: string, error?: unknown) => void;
};

/** An action someone asked for, and whether the board took it. */
export type ActionRecord = {
  prop: string;
  action: string;
  args: unknown;
  actor: Actor;
  /** Why it was refused; absent when the board took it. */
  refused?: string;
};

/** A copy of every prop's stored state, to put the board back exactly as it was. */
export type BoardSnapshot = ReadonlyMap<string, StoredState>;

/** A signal as the runtime saw it: which prop, what, with what, and who caused it. */
export type SignalRecord = {
  prop: string;
  signal: string;
  payload: Readonly<Record<string, unknown>>;
  actor: Actor;
};

/**
 * One placed prop, live. Its stored state is a signal: whatever read it (an IS rule, its view, a
 * prop on screen) runs again when it changes, and nothing else does.
 */
type Instance = {
  name: string;
  id: number | undefined;
  def: AnyPropDef;
  stored: Signal<StoredState>;
  /** Stored plus derived, worked out again only when `stored` changes. */
  view: ReadonlySignal<PropView>;
};

function liveInstance(
  name: string,
  id: number | undefined,
  def: AnyPropDef,
  start: StoredState,
): Instance {
  const stored = signal(start);
  return { name, id, def, stored, view: computed(() => viewOf(def, stored.value)) };
}

type CompiledIs = {
  prop: string;
  field: string;
  value: { expression: Expression } | { texts: Record<string, Template> };
};

type CompiledWhen = {
  prop: string;
  signal: string;
  condition: Expression | undefined;
  script: Script;
};

type Running = { cancel: () => void };

/** Waits and tweens run on the board's own clock, so pausing the board pauses them all together. */
class Clock {
  private pausedAt: number | undefined;
  private pausedTotal = 0;
  private readonly waiters = new Set<{ until: number; resolve: () => void }>();
  private readonly animations = new Set<{ step: (time: number) => boolean }>();
  private cancelFrame: (() => void) | undefined;
  private isStopped = false;

  constructor(private readonly services: RuntimeServices) {}

  /** Seconds since the board started, not counting pauses. */
  time(): number {
    const now = this.pausedAt ?? this.services.now();
    return (now - this.pausedTotal) / 1000;
  }

  pause(): void {
    if (this.pausedAt === undefined) this.pausedAt = this.services.now();
  }

  resume(): void {
    if (this.pausedAt === undefined) return;
    this.pausedTotal += this.services.now() - this.pausedAt;
    this.pausedAt = undefined;
    this.schedule();
  }

  wait(seconds: number): Promise<void> {
    // Once the board is gone, nothing waits its turn again: a task's loop just stops here.
    if (this.isStopped) return new Promise(() => {});
    return new Promise((resolve) => {
      this.waiters.add({ until: this.time() + seconds, resolve });
      this.schedule();
    });
  }

  /** Calls `step` with seconds elapsed each frame until it returns false. */
  animate(step: (elapsed: number) => boolean): () => void {
    const started = this.time();
    const animation = { step: (time: number) => step(time - started) };
    this.animations.add(animation);
    this.schedule();
    return () => this.animations.delete(animation);
  }

  stop(): void {
    this.isStopped = true;
    this.cancelFrame?.();
    this.cancelFrame = undefined;
    for (const waiter of this.waiters) waiter.resolve();
    this.waiters.clear();
    this.animations.clear();
  }

  private schedule(): void {
    if (this.cancelFrame !== undefined || this.pausedAt !== undefined) return;
    if (this.waiters.size === 0 && this.animations.size === 0) return;
    this.cancelFrame = this.services.frame(() => {
      this.cancelFrame = undefined;
      this.tick();
    });
  }

  private tick(): void {
    if (this.pausedAt !== undefined) return;
    const time = this.time();
    for (const animation of [...this.animations]) {
      if (!animation.step(time)) this.animations.delete(animation);
    }
    for (const waiter of [...this.waiters]) {
      if (time >= waiter.until) {
        this.waiters.delete(waiter);
        waiter.resolve();
      }
    }
    this.schedule();
  }
}

/**
 * One board, live: its props' state, its IS rules kept true, its WHEN rules answered in order,
 * and its scripts. Every change to a prop goes through `call` (the one door).
 *
 * State is held in signals (@preact/signals-core). Each IS rule is an effect: it records which props
 * it read and runs again only when one of them changes. Each prop's view is a computed value, and a
 * prop on screen re-renders only when its own view changes (through @preact/signals in the player).
 */
export class BoardRuntime {
  private readonly instances = new Map<string, Instance>();
  private readonly isRules: CompiledIs[];
  private readonly whenRules: CompiledWhen[];
  /** Inputs owned by an IS, as "prop.field": no action may set them. */
  private readonly owned = new Set<string>();
  /** Stops each IS rule's effect. */
  private readonly stopIs: (() => void)[];
  private readonly signalListeners = new Set<(record: SignalRecord) => void>();
  private readonly actionListeners = new Set<(record: ActionRecord) => void>();
  private readonly queue: SignalRecord[] = [];
  private isDispatching = false;
  private readonly tweens = new Map<string, Running>();
  private readonly clock: Clock;
  private readonly touchedProps = signal<ReadonlySet<string>>(new Set());
  private isDisposed = false;

  constructor(
    readonly board: Board,
    lookup: (type: string) => AnyPropDef | undefined,
    private readonly services: RuntimeServices,
  ) {
    this.clock = new Clock(services);
    const hidden: string[] = [];
    for (const piece of propPieces(board.root)) {
      const def = lookup(piece.prop);
      if (def === undefined)
        throw new Error(`Board ${board.name}: no prop type "${piece.prop}" in the library`);
      const start = initialState(def, piece.with);
      if (!start.isOk)
        throw new Error(`Board ${board.name}, ${piece.name}: ${start.errors.join("; ")}`);
      this.instances.set(piece.name, liveInstance(piece.name, piece.id, def, start.state));
      if (piece.isHidden === true) hidden.push(piece.name);
    }
    this.instances.set(
      BOARD,
      liveInstance(BOARD, board.id, boardProp as unknown as AnyPropDef, {
        ...boardProp.defaults,
        hidden,
      }),
    );
    this.isRules = board.is.map((rule) => this.compileIs(rule));
    this.whenRules = board.when.map((rule) => this.compileWhen(rule));
    // Each effect runs once now, making its IS true, then again whenever what it read changes.
    this.stopIs = this.isRules.map((rule) => effect(() => this.keep(rule)));
  }

  // ---- reading ----

  /** A prop's state, stored and derived. Read while rendering, it re-renders on change. */
  getView(name: string): PropView {
    return this.instance(name).view.value;
  }

  getStored(name: string): StoredState {
    return this.instance(name).stored.value;
  }

  getDef(name: string): AnyPropDef {
    return this.instance(name).def;
  }

  idOf(name: string): number | undefined {
    return this.instance(name).id;
  }

  /** Every placed prop's name (not the board). */
  propNames(): string[] {
    return [...this.instances.keys()].filter((name) => name !== BOARD);
  }

  isHidden(name: string): boolean {
    const hidden = this.instance(BOARD).stored.value.hidden;
    return Array.isArray(hidden) && hidden.includes(name);
  }

  /** Props the learner has acted on. */
  isTouched(name: string): boolean {
    return this.touchedProps.value.has(name);
  }

  /** Every action asked of the board, by anyone, taken or refused (for Jugnu's history, logs). */
  onAction(listener: (record: ActionRecord) => void): () => void {
    this.actionListeners.add(listener);
    return () => this.actionListeners.delete(listener);
  }

  /** Every prop's stored state right now. */
  snapshot(): BoardSnapshot {
    return new Map([...this.instances].map(([name, instance]) => [name, instance.stored.peek()]));
  }

  /**
   * Puts the board back to a snapshot: used to undo what Jugnu did when it would have solved the
   * question for the student. Each state still passes its prop's schema.
   */
  restore(snapshot: BoardSnapshot): void {
    batch(() => {
      for (const [name, stored] of snapshot) {
        const instance = this.instances.get(name);
        if (instance === undefined) continue;
        this.tweens.get(name)?.cancel();
        const result = applyPatch(instance.def, instance.stored.peek(), stored);
        if (result.isOk) instance.stored.value = result.state;
      }
    });
  }

  onSignal(listener: (record: SignalRecord) => void): () => void {
    this.signalListeners.add(listener);
    return () => this.signalListeners.delete(listener);
  }

  // ---- driving ----

  /** Opens the board: raises `board.started`, which usually starts its script. */
  start(): void {
    this.enqueue({ prop: BOARD, signal: BoardSignal.Started, payload: {}, actor: Actor.Lesson });
  }

  /**
   * The one door. Runs one of a prop's actions and resolves when it has finished (at once for an
   * instant change; at the end of a tween or a spoken line). The learner always wins: their action
   * stops anything the lesson is animating on that prop.
   */
  call(
    name: string,
    action: string,
    args: unknown = {},
    actor: Actor = Actor.Lesson,
  ): Promise<void> {
    return this.invoke(name, action, args, actor, false);
  }

  private invoke(
    name: string,
    action: string,
    args: unknown,
    actor: Actor,
    isSetOff: boolean,
  ): Promise<void> {
    if (this.isDisposed) return Promise.resolve();
    const instance = this.instance(name);
    const notify = (refused?: string) => {
      const record: ActionRecord = { prop: name, action, args, actor };
      if (refused !== undefined) record.refused = refused;
      for (const listener of this.actionListeners) listener(record);
    };
    if (actor === Actor.Jugnu) {
      const why = this.whyNotJugnu(name, action, isSetOff);
      if (why !== undefined) {
        notify(why);
        return Promise.resolve();
      }
    }
    if (actor === Actor.Learner) {
      this.tweens.get(name)?.cancel();
      if (!this.touchedProps.peek().has(name))
        this.touchedProps.value = new Set([...this.touchedProps.peek(), name]);
    }
    const prepared = prepareAction(instance.def, instance.stored.peek(), action, args);
    if (!prepared.isOk) {
      notify(prepared.errors.join("; "));
      return this.fail(`${name}.${action}: ${prepared.errors.join("; ")}`, actor);
    }
    notify();
    const effect = prepared.effect;
    // An action changes only the fields it says it changes: anything else is refused here.
    const allowed = instance.def.actions[action]?.changes;
    const outside = (patch: Readonly<Record<string, unknown>>) =>
      allowed === undefined ? [] : Object.keys(patch).filter((key) => !allowed.includes(key));
    // A prop bug, whoever acted: always reported.
    const refuse = (keys: string[]) => {
      this.services.onError(
        `Board ${this.board.name}: ${name}.${action} changed ${keys.join(", ")}, outside what it declares (changes)`,
      );
      return Promise.resolve();
    };
    switch (effect.kind) {
      case EffectKind.Set:
        if (outside(effect.set).length > 0) return refuse(outside(effect.set));
        this.change(instance, effect.set, actor);
        for (const emit of effect.emit) this.emitFrom(name, emit, actor);
        return Promise.resolve();
      case EffectKind.Tween:
        if (outside(effect.to).length > 0) return refuse(outside(effect.to));
        return this.runTween(instance, effect.duration, effect.to, actor);
      case EffectKind.Task: {
        const spoken = instance.def.speech?.(instance.stored.peek());
        return effect
          .run({
            speak: () =>
              spoken === undefined || this.isDisposed
                ? Promise.resolve()
                : this.services.speak({ name, id: instance.id }, spoken),
            wait: (seconds) => this.clock.wait(seconds),
            set: (patch) => {
              if (outside(patch).length > 0) void refuse(outside(patch));
              else this.change(instance, patch, actor);
            },
            get: () => instance.stored.peek(),
            emit: (signal, payload) => this.emitFrom(name, { signal, payload }, actor),
          })
          .catch((error: unknown) => this.services.onError(`${name}.${action} failed`, error));
      }
    }
  }

  /**
   * Runs a script as someone other than the lesson: Jugnu acting on the board. Same language and
   * same door as the lesson's own scripts; resolves when it has finished.
   */
  perform(script: Script, actor: Actor): Promise<void> {
    return this.run(script, actor);
  }

  /** A prop's view raises one of its signals (e.g. the learner let go of the marker). */
  signal(
    name: string,
    signal: string,
    payload: Readonly<Record<string, unknown>> = {},
    actor: Actor = Actor.Learner,
  ): void {
    this.emitFrom(name, { signal, payload }, actor);
  }

  /** Pauses everything moving on the board (e.g. while Jugnu's chat is open). */
  pause(): void {
    this.clock.pause();
  }

  resume(): void {
    this.clock.resume();
  }

  /** The board is gone: stop every tween, wait and script. */
  dispose(): void {
    this.isDisposed = true;
    for (const running of this.tweens.values()) running.cancel();
    this.tweens.clear();
    this.clock.stop();
    for (const stop of this.stopIs) stop();
    this.signalListeners.clear();
    this.actionListeners.clear();
  }

  // ---- internals ----

  private instance(name: string): Instance {
    const instance = this.instances.get(name);
    if (instance === undefined) throw new Error(`Board ${this.board.name}: no prop "${name}"`);
    return instance;
  }

  private fail(message: string, actor: Actor): Promise<void> {
    // A drag past the end is normal, and Jugnu hears his own refusals; anything the lesson does
    // wrong is a content bug.
    if (actor === Actor.Lesson || actor === Actor.App)
      this.services.onError(`Board ${this.board.name}: ${message}`);
    return Promise.resolve();
  }

  /**
   * Why Jugnu may not run `prop.action` right now, or undefined if he may. The one place his hard
   * limits live, checked on every call he makes and on everything his actions set off through the
   * lesson's rules (`isSetOff`): nothing he does answers the question, lets the board pass, does
   * what the board leaves to the student, or gives an answer away while a question is open. He
   * also never directly speaks the lesson's lines or shows and hides its props; the lesson's own
   * rules still may, in answer to what he did.
   */
  whyNotJugnu(name: string, action: string, isSetOff = false): string | undefined {
    const instance = this.instances.get(name);
    if (instance === undefined) return `there is no prop "${name}" on this board`;
    if (name === BOARD && (action === BoardAction.Pass || action === BoardAction.Continue))
      return "only the student's own work moves the board on";
    if (name === BOARD && !isSetOff)
      return "the board itself is the student's (Continue) and the lesson's";
    if (instance.def.role === PropRole.Question)
      return `${name} is the question: only the student answers it`;
    if (this.board.studentOnly.includes(`${name}.${action}`))
      return `${name}.${action} is the student's job on this board`;
    if (action === SAY && !isSetOff) return "lesson lines are the lesson's to say";
    const spec = instance.def.actions[action];
    if (spec === undefined) return undefined; // the action itself refuses, with its own words
    if (spec.reveals === true && this.hasOpenQuestion())
      return `${name}.${action} would give the answer away while the question is open`;
    return undefined;
  }

  /** True while some question on the board isn't answered correctly yet. */
  hasOpenQuestion(): boolean {
    return [...this.instances.values()].some(
      (instance) =>
        instance.def.role === PropRole.Question &&
        instance.stored.value.status !== AnswerStatus.Correct,
    );
  }

  private change(
    instance: Instance,
    patch: Readonly<Record<string, unknown>>,
    actor: Actor,
  ): boolean {
    const blocked = Object.keys(patch).filter((field) =>
      this.owned.has(`${instance.name}.${field}`),
    );
    if (blocked.length > 0) {
      void this.fail(
        `${instance.name}: ${blocked.join(", ")} is set by an IS rule; actions can't change it`,
        actor,
      );
      return false;
    }
    if (Object.keys(patch).length === 0) return true;
    const result = applyPatch(instance.def, instance.stored.peek(), patch);
    if (!result.isOk) {
      void this.fail(`${instance.name}: ${result.errors.join("; ")}`, actor);
      return false;
    }
    // Every IS that read this prop runs again before this returns.
    instance.stored.value = result.state;
    return true;
  }

  private runTween(
    instance: Instance,
    duration: number,
    to: Readonly<Record<string, unknown>>,
    actor: Actor,
  ): Promise<void> {
    const end = applyPatch(instance.def, instance.stored.peek(), to);
    if (!end.isOk) return this.fail(`${instance.name}: ${end.errors.join("; ")}`, actor);
    this.tweens.get(instance.name)?.cancel();
    const from = instance.stored.peek();
    return new Promise((resolve) => {
      let stopAnimation = () => {};
      const finish = () => {
        stopAnimation();
        if (this.tweens.get(instance.name) === running) this.tweens.delete(instance.name);
        resolve();
      };
      const running: Running = { cancel: finish };
      this.tweens.set(instance.name, running);
      stopAnimation = this.clock.animate((elapsed) => {
        const progress = duration <= 0 ? 1 : Math.min(1, elapsed / duration);
        const isOk = this.change(instance, tweenAt(from, to, progress), actor);
        if (!isOk || progress >= 1) {
          finish();
          return false;
        }
        return true;
      });
    });
  }

  private scope = (name: string): Readonly<Record<string, unknown>> => this.getView(name);

  // ---- IS ----

  private compileIs(rule: IsRule): CompiledIs {
    const { prop, member } = splitTarget(rule.set);
    this.owned.add(rule.set);
    const value =
      "to" in rule
        ? { expression: compileExpression(rule.to) }
        : {
            texts: Object.fromEntries(
              Object.entries(rule.text).map(([locale, source]) => [
                locale,
                compileTemplate(source),
              ]),
            ),
          };
    return { prop, field: member, value };
  }

  /**
   * Makes one IS true. Run inside its effect: the props its expression reads are recorded, and it
   * runs again when any of them changes. The prop it sets is only peeked at, so setting it doesn't
   * count as reading it. Rules can feed each other, never in a loop (the validator checks).
   */
  private keep(rule: CompiledIs): void {
    const instance = this.instance(rule.prop);
    let value: unknown;
    try {
      value =
        "expression" in rule.value
          ? rule.value.expression.evaluate(this.scope)
          : Object.fromEntries(
              Object.entries(rule.value.texts).map(([locale, t]) => [locale, t.render(this.scope)]),
            );
    } catch (error) {
      this.services.onError(`Board ${this.board.name}: IS ${rule.prop}.${rule.field}`, error);
      return;
    }
    untracked(() => {
      const stored = instance.stored.value;
      if (JSON.stringify(stored[rule.field]) === JSON.stringify(value)) return;
      const result = applyPatch(instance.def, stored, { [rule.field]: value });
      if (!result.isOk) {
        this.services.onError(
          `Board ${this.board.name}: IS ${rule.prop}.${rule.field}: ${result.errors.join("; ")}`,
        );
        return;
      }
      instance.stored.value = result.state;
    });
  }

  // ---- WHEN ----

  private compileWhen(rule: WhenRule): CompiledWhen {
    const { prop, member } = splitTarget(rule.on);
    return {
      prop,
      signal: member,
      condition: rule.if === undefined ? undefined : compileExpression(rule.if),
      script: rule.do,
    };
  }

  private emitFrom(name: string, emit: Emit, actor: Actor): void {
    this.enqueue({ prop: name, signal: emit.signal, payload: emit.payload ?? {}, actor });
  }

  /** Signals are answered one at a time, in order. A signal raised while answering waits its turn. */
  private enqueue(record: SignalRecord): void {
    if (this.isDisposed) return;
    this.queue.push(record);
    if (this.isDispatching) return;
    this.isDispatching = true;
    try {
      for (let next = this.queue.shift(); next !== undefined; next = this.queue.shift())
        this.dispatch(next);
    } finally {
      this.isDispatching = false;
    }
  }

  private dispatch(record: SignalRecord): void {
    for (const listener of this.signalListeners) listener(record);
    for (const rule of this.whenRules) {
      if (rule.prop !== record.prop || rule.signal !== record.signal) continue;
      if (rule.condition !== undefined) {
        try {
          if (!rule.condition.evaluate(this.scope)) continue;
        } catch (error) {
          this.services.onError(
            `Board ${this.board.name}: WHEN ${record.prop}.${record.signal} condition`,
            error,
          );
          continue;
        }
      }
      // The rule's script runs on its own; the next signal doesn't wait for it to finish. What
      // Jugnu sets off stays Jugnu's, so his limits hold through the lesson's own rules too.
      if (record.actor === Actor.Jugnu) void this.run(rule.script, Actor.Jugnu, true);
      else void this.run(rule.script, Actor.Lesson);
    }
  }

  // ---- THEN ----

  /** `isSetOff`: a lesson rule answering something Jugnu did (his limits still hold). */
  private async run(script: Script, actor: Actor = Actor.Lesson, isSetOff = false): Promise<void> {
    if (this.isDisposed) return;
    if (Array.isArray(script)) {
      for (const step of script) await this.run(step, actor, isSetOff);
      return;
    }
    if ("seq" in script) {
      for (const step of script.seq) await this.run(step, actor, isSetOff);
      return;
    }
    if ("par" in script) {
      await Promise.all(script.par.map((step) => this.run(step, actor, isSetOff)));
      return;
    }
    if ("wait" in script) {
      await this.clock.wait(script.wait);
      return;
    }
    const { prop, member } = splitTarget(script.call);
    let args: Record<string, unknown>;
    try {
      args = this.resolveArgs(script.args ?? {});
    } catch (error) {
      this.services.onError(`Board ${this.board.name}: ${script.call} arguments`, error);
      return;
    }
    await this.invoke(prop, member, args, actor, isSetOff);
  }

  /** Arguments are plain values, or `{ "expr": "coin.count" }`, worked out when the call runs. */
  private resolveArgs(args: Readonly<Record<string, unknown>>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(args)) {
      const source = argExpression(value);
      out[key] = source === undefined ? value : compileExpression(source).evaluate(this.scope);
    }
    return out;
  }
}
