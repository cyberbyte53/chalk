import type { ZodType, ZodTypeDef } from "zod";

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

/** One signal a prop raises, with its data. */
export type Emit = { signal: string; payload?: Readonly<Record<string, unknown>> };

/** What a running task can do. The player supplies it; a prop never touches the clock or audio itself. */
export type TaskContext<S extends StoredState> = {
  /** Reads this prop's spoken line aloud; resolves when it ends (or fails: the text stays on screen). */
  speak: () => Promise<void>;
  /** Waits on the board's clock (so pausing the board pauses it). */
  wait: (seconds: number) => Promise<void>;
  /** Changes stored fields through the one door. */
  set: (patch: Partial<S>) => void;
  /** This prop's stored state right now (a long task reads it to know when to stop). */
  get: () => S;
  emit: (signal: string, payload?: Readonly<Record<string, unknown>>) => void;
};

/** The action every speaking prop has: read its line aloud, finishing when the line ends. */
export const SAY = "say";

export const EffectKind = { Set: "set", Tween: "tween", Task: "task" } as const;
export type EffectKind = (typeof EffectKind)[keyof typeof EffectKind];

/**
 * What an action does. `set` is instant. `tween` and `task` take time; the player runs them,
 * can pause or cancel them, and a script waits for them to finish.
 */
export type Effect<S extends StoredState> =
  | { kind: typeof EffectKind.Set; set: Partial<S>; emit: readonly Emit[] }
  /** Eases numeric stored fields from where they are to `to` over `duration` seconds. */
  | { kind: typeof EffectKind.Tween; duration: number; to: Partial<S> }
  | { kind: typeof EffectKind.Task; run: (context: TaskContext<S>) => Promise<void> };

// `NoInfer`: the state type comes from the action being written, not from the patch.
export function set<S extends StoredState>(patch: NoInfer<Partial<S>>, ...emit: Emit[]): Effect<S> {
  return { kind: EffectKind.Set, set: patch, emit };
}

export function tween<S extends StoredState>(duration: number, to: NoInfer<Partial<S>>): Effect<S> {
  return { kind: EffectKind.Tween, duration, to };
}

export function task<S extends StoredState>(
  run: (context: TaskContext<NoInfer<S>>) => Promise<void>,
): Effect<S> {
  return { kind: EffectKind.Task, run };
}

export type ActionSpec<S extends StoredState> = {
  describe: string;
  /** Arguments, checked before the action runs. */
  args: ZodType;
  /** Gives an answer away: never allowed on a board with a question, never offered to Jugnu there. */
  reveals?: boolean;
  /** The learner's finger does this (through the prop's view, or the player's Check). */
  byLearner?: boolean;
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
    run: (view: PropView & S, args: A) => Effect<S>;
  }): ActionSpec<S> => spec as ActionSpec<S>;
}

export type DerivedSpec<S extends StoredState> = {
  describe: string;
  compute: (state: S) => unknown;
};

export type SignalSpec = {
  describe: string;
  /** A commit: a moment the learner decides something. Only commits are logged. */
  isCommit?: boolean;
};

/** A screen-space box, in the prop's own pixels at the given width. */
export type Box = { x: number; y: number; width: number; height: number };

/** One thing the student can see and tell apart, with what it shows them right now. */
export type Element = {
  /** What `point` takes, and `locate` finds: stable while the element is there. */
  id: string;
  /** What it shows, in the prop's own words or numbers; left out for a thing with no value. */
  value?: unknown;
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
 * same: state (stored + derived), actions, signals, parts. Everything else (validation, Studio,
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
  /** Names of the parts that exist right now (they can come and go with the state). */
  parts?: (view: PropView & S) => readonly string[];
  /** Where a part is drawn at this width, or undefined if it isn't there. */
  locate?: (view: PropView & S, part: string, width: number) => Box | undefined;
  /** Rules that span fields (e.g. from < to). Returns a message when broken. */
  invariant?: (state: S) => string | undefined;
  /** What this prop says when told to `say` (for audio generation and the voice check). */
  speech?: (state: S) => Spoken | undefined;
  role?: PropRole;
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
  A extends string,
  G extends string = never,
  D extends string = never,
>(def: PropDef<S, A, G, D>): PropDef<S, A, G, D> {
  return def;
}

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
