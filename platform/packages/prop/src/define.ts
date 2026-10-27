import type { ZodType, ZodTypeDef } from "zod";
import type { Size } from "./size";

/** Text in every supported language, by locale ("en", "hi"). */
export type Texts = Readonly<Record<string, string>>;

/**
 * A line that is shown and spoken. `speak` is plain words for the voice when `say` has maths glyphs;
 * `speaker` is whose voice reads it (a cast character), or the narrator when left out.
 */
export type Spoken = { say: Texts; speak?: Texts; speaker?: string };

/** A prop's stored fields. Values are plain JSON so state can be logged and read by Jugnu. */
export type StoredState = Readonly<Record<string, unknown>>;

/** What anyone reads from a prop: stored fields plus derived ones. A reader can't tell them apart. */
export type PropView = Readonly<Record<string, unknown>>;

/** A signal raised, by name, with its data: what the runtime passes along. */
export type Raised = {
  readonly signal: string;
  readonly payload?: Readonly<Record<string, unknown>>;
};

declare const byRaise: unique symbol;
/** One signal a prop raises, with its data: made only by `raise(signals.over, { q, r })`. */
export type Emit = Raised & { readonly [byRaise]: true };

/**
 * What an effect running over time can do. The player supplies it; a prop never touches the clock
 * or audio itself.
 */
export type TaskContext<S extends StoredState> = {
  /** Reads this prop's spoken line aloud; resolves when it ends (or fails: the text stays on screen). */
  speak: () => Promise<void>;
  /** Waits on the board's clock (so pausing the board pauses it). */
  wait: (seconds: number) => Promise<void>;
  /** Changes stored fields through the one door. */
  set: (patch: Partial<S>) => void;
  /** This prop's state right now (a long effect reads it to know when to stop). */
  get: () => S;
  emit: (signal: string, payload?: Readonly<Record<string, unknown>>) => void;
  /** Runs one of this prop's own actions through the one door; resolves when it finishes. */
  call?: (action: string, args: Readonly<Record<string, unknown>>) => Promise<void>;
  /** False once the effect was stopped (the learner took over, the board closed). */
  isLive?: () => boolean;
  /** Seconds on the board's clock (not counting pauses): tweens follow it, so a slow frame skips ahead. */
  now?: () => number;
};

/** The action every speaking prop has: read its line aloud, finishing when the line ends. */
export const SAY = "say";

export const EffectKind = {
  Set: "set",
  Tween: "tween",
  Wait: "wait",
  Say: "say",
  Call: "call",
  Seq: "seq",
  Par: "par",
  Until: "until",
  Repeat: "repeat",
  /** Old form: a function run over time. Being replaced by the steps above. */
  Task: "task",
} as const;
export type EffectKind = (typeof EffectKind)[keyof typeof EffectKind];

/** How far along a tween is, 0 to 1, from how much of its time has gone, 0 to 1. */
export type Easing = (t: number) => number;

/**
 * What an action does, as data: one step, or steps in order and together. `set` is instant (and
 * steps that only set fold into one change); the others take time. The player runs them on the
 * board's clock, so pausing the board pauses them, and a script waits for them to finish.
 */
export type Effect<S extends StoredState> =
  | { kind: typeof EffectKind.Set; set: Partial<S>; emit: readonly Raised[] }
  /**
   * Moves fields from where they are to `to` over `duration` seconds: numbers eased, anything else
   * switching at the end, or `interpolate` (a zoom that scales evenly in log). Stops the whole
   * effect if anything else changes those fields meanwhile (the learner wins).
   */
  | {
      kind: typeof EffectKind.Tween;
      duration: number;
      to: Partial<S>;
      ease?: Easing;
      interpolate?: (from: S, to: Partial<S>, t: number) => Partial<S>;
      /** It stops (and so does the effect) once this fails (the race was paused). */
      while?: (s: S) => boolean;
    }
  | { kind: typeof EffectKind.Wait; seconds: number }
  /** Reads this prop's line aloud. */
  | { kind: typeof EffectKind.Say }
  /** Runs one of this prop's own actions (through the one door), and waits for it. */
  | { kind: typeof EffectKind.Call; action: string; args: Readonly<Record<string, unknown>> }
  | { kind: typeof EffectKind.Seq; steps: readonly Effect<S>[] }
  | { kind: typeof EffectKind.Par; steps: readonly Effect<S>[] }
  /** Waits until the prop's state passes the test (at once if it already does). */
  | { kind: typeof EffectKind.Until; test: (state: S) => boolean }
  /** While the test passes: wait `every` seconds, then run `action` (a tick). */
  | {
      kind: typeof EffectKind.Repeat;
      every: number;
      action: string;
      args: Readonly<Record<string, unknown>>;
      while: (state: S) => boolean;
    }
  | { kind: typeof EffectKind.Task; run: (context: TaskContext<S>) => Promise<void> };

// `NoInfer`: the state type comes from the action being written, not from the patch.
/** Changes stored fields at once, raising signals (`raise(signals.over, { q, r })`) with them. */
export function set<S extends StoredState>(patch: NoInfer<Partial<S>>, ...emit: Emit[]): Effect<S> {
  return { kind: EffectKind.Set, set: patch, emit };
}

/** The same, from signals already raised (the runtime folding steps together). */
export function setRaised<S extends StoredState>(
  patch: Partial<S>,
  emit: readonly Raised[],
): Effect<S> {
  return { kind: EffectKind.Set, set: patch, emit };
}

/** One of this prop's signals raised, with its data: `raise(signals.over, { q, r })`. */
export function raise(signal: SignalSpec, payload?: Readonly<Record<string, unknown>>): Emit {
  const name = nameOf(signal);
  return (payload === undefined ? { signal: name } : { signal: name, payload }) as Emit;
}

export function tween<S extends StoredState>(
  duration: number,
  to: NoInfer<Partial<S>>,
  options: {
    ease?: Easing;
    interpolate?: (from: NoInfer<S>, to: NoInfer<Partial<S>>, t: number) => NoInfer<Partial<S>>;
    while?: (s: NoInfer<S>) => boolean;
  } = {},
): Effect<S> {
  return { kind: EffectKind.Tween, duration, to, ...options } as Effect<S>;
}

export function wait<S extends StoredState>(seconds: number): Effect<S> {
  return { kind: EffectKind.Wait, seconds };
}

export function say<S extends StoredState>(): Effect<S> {
  return { kind: EffectKind.Say };
}

/** Runs one of this prop's own actions, passed as itself: `call(arrive)`. */
export function call<S extends StoredState, Ar>(
  action: ActionSpec<NoInfer<S>, Ar>,
  ...args: ArgsParam<Ar>
): Effect<S> {
  return { kind: EffectKind.Call, action: nameOf(action), args: args[0] ?? {} };
}

/** Steps one after another. */
export function seq<S extends StoredState>(...steps: Effect<NoInfer<S>>[]): Effect<S> {
  return { kind: EffectKind.Seq, steps };
}

/** Steps together; finishes when all have. */
export function par<S extends StoredState>(...steps: Effect<NoInfer<S>>[]): Effect<S> {
  return { kind: EffectKind.Par, steps };
}

export function waitUntil<S extends StoredState>(test: (state: NoInfer<S>) => boolean): Effect<S> {
  return { kind: EffectKind.Until, test };
}

/** While `test` passes: wait `every` seconds, then run the tick `action` (mark it `internal`). */
export function repeat<S extends StoredState, Ar>(
  every: number,
  action: ActionSpec<NoInfer<S>, Ar>,
  options: { while: (state: NoInfer<S>) => boolean; args?: Ar },
): Effect<S> {
  return {
    kind: EffectKind.Repeat,
    every,
    action: nameOf(action),
    args: (options.args ?? {}) as Readonly<Record<string, unknown>>,
    while: options.while,
  } as Effect<S>;
}

export function task<S extends StoredState>(
  run: (context: TaskContext<NoInfer<S>>) => Promise<void>,
): Effect<S> {
  return { kind: EffectKind.Task, run };
}

/**
 * One action of a prop. `Ar` is what it takes, from its `args` schema: whoever calls it (a view,
 * content, another action) passes the action itself and gets its arguments checked by the compiler.
 */
export type ActionSpec<S extends StoredState, Ar = unknown> = {
  describe: string;
  /** Arguments, checked before the action runs. */
  args: ZodType<Ar, ZodTypeDef, unknown>;
  /** Gives an answer away: never allowed on a board with a question, never offered to Jugnu there. */
  reveals?: boolean;
  /** The learner's finger does this (through the prop's view, or the player's Check). */
  byLearner?: boolean;
  /** A step of the prop's own effects (a tick): not offered to anyone as something to do. */
  internal?: boolean;
  /**
   * The stored fields it can change, and no others: the runtime refuses a change outside them.
   * What tells setup (fixed where placed) from live (changes on this board) in the board model.
   */
  changes?: readonly string[];
  /** Pure: reads the prop's view and the checked arguments, says what changes. */
  run: (view: PropView & S, args: never) => Effect<S>;
};

/**
 * Typed action helper for one prop's state: `const act = actionsFor<MyState>()`, then
 * `act({ args: z.object(...), run: (view, args) => ... })` infers `args` from the schema.
 */
export function actionsFor<S extends StoredState>() {
  return <A>(spec: {
    describe: string;
    args: ZodType<A, ZodTypeDef, unknown>;
    reveals?: boolean;
    byLearner?: boolean;
    internal?: boolean;
    changes?: readonly (keyof S & string)[];
    run: (view: PropView & S, args: A) => Effect<S>;
  }): ActionSpec<S, A> => spec as ActionSpec<S, A>;
}

/** What an action takes, as a rest parameter: nothing when its arguments are empty. */
export type ArgsParam<Ar> = [keyof Ar] extends [never] ? [args?: Ar] : [args: Ar];

/** An action's arguments, from the action itself. */
export type ArgsOf<X> = X extends ActionSpec<infer _S, infer Ar> ? Ar : never;

export type DerivedSpec<S extends StoredState> = {
  describe: string;
  compute: (state: S) => unknown;
};

export type SignalSpec = {
  describe: string;
};

/** A signal: what it announces. Its name is its key in the prop's `signals`. */
export function signal(describe: string): SignalSpec {
  return { describe };
}

/**
 * The name each action and signal has in its prop: its key there, noted when the prop is defined.
 * So views, content and a prop's own actions pass actions and signals as themselves, never as
 * names, and the name is looked up only where it becomes data (a press on the page, a script).
 */
const names = new WeakMap<object, string>();

/** The name of an action or signal in its prop. */
export function nameOf(spec: { readonly describe: string }): string {
  const name = names.get(spec);
  if (name === undefined)
    throw new Error(
      `"${spec.describe}" isn't an action or signal of a defined prop: pass the prop's own (defineProp notes their names)`,
    );
  return name;
}

/** Notes the names of a prop's actions or signals (their keys), for `nameOf`. */
export function noteNames(type: string, specs: Readonly<Record<string, object>> | undefined): void {
  for (const [name, spec] of Object.entries(specs ?? {})) {
    const known = names.get(spec);
    if (known !== undefined && known !== name)
      throw new Error(`${type}: one action or signal can't be both "${known}" and "${name}"`);
    names.set(spec, name);
  }
}

/** A screen-space box, in the prop's own pixels at the given width. */
export type Box = { x: number; y: number; width: number; height: number };

/** One thing the student can see and tell apart, with what it shows them right now. */
export type Element = {
  /** What `point` takes: stable while the element is there. */
  id: string;
  /**
   * What it shows, typed: a number as a number, a point as { x, y }, an id as its id. Left out for
   * a thing with no value (a button).
   */
  value?: unknown;
  /** The value as the screen writes it ("1.40", "½"), when that isn't just the value printed. */
  words?: string;
  /** For a control: the action(s) touching it does (a button's press; a handle's drag, then its let-go). */
  does?: string | readonly string[];
};

/**
 * What a student sees of a prop right now, in the prop's own words: the only way Jugnu sees it.
 * Faithful: every element is drawn right now, with the value it shows (a hidden dot has no
 * element). Addressable: an element's id can be pointed at. What the prop knows but the screen
 * doesn't show goes under `hidden`, labelled.
 */
export type Observation = {
  /** One line: what this is and where it stands. */
  summary: string;
  elements: readonly Element[];
  hidden?: Readonly<Record<string, unknown>>;
};

export const PropRole = { Question: "question" } as const;
export type PropRole = (typeof PropRole)[keyof typeof PropRole];

/**
 * The prop contract. A prop is code the board never looks inside. From outside every prop is the
 * same: state (stored + derived), actions, signals. Everything else (validation, Studio,
 * Jugnu's tools and the text he reads) is generated from this.
 */
export type PropDef<
  S extends StoredState = StoredState,
  /** Its action names, kept as literals so content can't name an action the prop doesn't have. */
  A extends string = string,
  /** Its signal names. */
  G extends string = string,
  /** Its derived field names. */
  D extends string = string,
> = {
  type: string;
  describe: string;
  /** Stored fields: the few independent quantities. Validated on every change. */
  state: ZodType<S>;
  /** Not a source for inferring S: the state comes from `state` alone. */
  defaults: NoInfer<S>;
  /** Fields computed from the stored ones: read-only, never stale. */
  derived?: Readonly<Record<D, DerivedSpec<S>>>;
  /** Stored fields an IS may own (e.g. a text's words). An owned field can't be set by actions. */
  inputs?: readonly (keyof S & string)[];
  /**
   * Fields the learner can't see on screen; Jugnu must not mention them as if they could. Only
   * for a prop without `observe`: the default observation leaves them out of the elements and
   * lists them under `hidden`.
   */
  offScreen?: readonly string[];
  actions: Readonly<Record<A, ActionSpec<S>>>;
  signals?: Readonly<Record<G, SignalSpec>>;
  /**
   * What the student sees right now, as the prop describes it (see `Observation`). Without it, the
   * default is every field as an element (minus `offScreen`), plus each part: a prop should define
   * its own once it can show something that isn't on screen (a hidden marker, a wire's current).
   */
  observe?: (view: PropView & S) => Observation;
  /** Its one line in the description. */
  summary?: (view: PropView & S) => string;
  /** Rules that span fields (e.g. from < to). Returns a message when broken. */
  invariant?: (state: S) => string | undefined;
  /** What this prop says when told to `say` (for audio generation and the voice check). */
  speech?: (state: S) => Spoken | undefined;
  role?: PropRole;
  /**
   * How it is sized on screens wider or shorter than a phone (size.ts): by default drawn for a
   * phone and scaled with the column; a board can override it where it places the prop.
   */
  size?: Size;
  /**
   * Whether Jugnu may bring this prop in to explain a concept (a number line, tiles). Words, buttons,
   * questions and timers are not explainers. Default: true.
   */
  isExplainer?: boolean;
};

/**
 * Identity helper so prop files are checked against the contract. Everything is inferred from the
 * definition itself (the state from `state`, the names from the keys of `actions`, `signals` and
 * `derived`), so write `defineProp({ ... })` with no type arguments.
 */
export function defineProp<
  S extends StoredState,
  const X extends Readonly<Record<string, ActionSpec<S, unknown>>>,
  const Dv extends Readonly<Record<string, DerivedSpec<S>>> = Record<never, DerivedSpec<S>>,
  G extends string = never,
>(
  def: PropDef<S, keyof X & string, G, keyof Dv & string> & { actions: X; derived?: Dv },
): PropDef<S, keyof X & string, G, keyof Dv & string> & { actions: X; derived?: Dv } {
  noteNames(def.type, def.actions);
  noteNames(def.type, def.signals);
  return def;
}

/**
 * What a prop's view and rules read: its stored fields, and each derived value typed by what it
 * computes.
 */
export type ViewOf<P> = (P extends { state: ZodType<infer S> } ? S : never) &
  (P extends { derived?: infer Dv }
    ? {
        readonly [K in keyof NonNullable<Dv>]: NonNullable<Dv>[K] extends {
          compute: (s: never) => infer R;
        }
          ? R
          : never;
      }
    : unknown);

/** A prop definition's action names, signal names and derived field names, as literal unions. */
export type ActionOf<P extends { actions: object }> = keyof P["actions"] & string;
export type SignalOf<P extends { signals?: object }> = keyof NonNullable<P["signals"]> & string;
export type DerivedOf<P extends { derived?: object }> = keyof NonNullable<P["derived"]> & string;

/** A prop of any state type, as the registry, the player and the validator hold it. */
export type AnyPropDef = PropDef<StoredState>;

/** Erases a prop's state type for the registry. */
export function asAnyProp<
  S extends StoredState,
  A extends string,
  G extends string,
  D extends string,
>(def: PropDef<S, A, G, D>): AnyPropDef {
  // Safe: everything that touches the state goes through the def's own schema first.
  return def as unknown as AnyPropDef;
}
