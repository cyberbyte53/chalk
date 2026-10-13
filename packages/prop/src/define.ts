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

export const PropRole = { Question: "question" } as const;
export type PropRole = (typeof PropRole)[keyof typeof PropRole];

/**
 * The prop contract. A prop is code the board never looks inside. From outside every prop is the
 * same: state (stored + derived), actions, signals, parts. Everything else (validation, Studio,
 * Jugnu's tools and the text he reads) is generated from this.
 */
export type PropDef<S extends StoredState = StoredState> = {
  type: string;
  describe: string;
  /** Stored fields: the few independent quantities. Validated on every change. */
  state: ZodType<S>;
  defaults: S;
  /** Fields computed from the stored ones: read-only, never stale. */
  derived?: Readonly<Record<string, DerivedSpec<S>>>;
  /** Stored fields an IS may own (e.g. a text's words). An owned field can't be set by actions. */
  inputs?: readonly (keyof S & string)[];
  /** Fields the learner can't see on screen; Jugnu must not mention them as if they could. */
  offScreen?: readonly string[];
  actions: Readonly<Record<string, ActionSpec<S>>>;
  signals?: Readonly<Record<string, SignalSpec>>;
  /** Names of the parts that exist right now (they can come and go with the state). */
  parts?: (view: PropView & S) => readonly string[];
  /** Where a part is drawn at this width, or undefined if it isn't there. */
  locate?: (view: PropView & S, part: string, width: number) => Box | undefined;
  /** Rules that span fields (e.g. from < to). Returns a message when broken. */
  invariant?: (state: S) => string | undefined;
  /** What this prop says when told to `say` (for audio generation and the voice check). */
  speech?: (state: S) => Spoken | undefined;
  role?: PropRole;
};

/** Identity helper so prop files are checked against the contract. */
export function defineProp<S extends StoredState>(def: PropDef<S>): PropDef<S> {
  return def;
}

/** A prop of any state type, as the registry, the player and the validator hold it. */
export type AnyPropDef = PropDef<StoredState>;

/** Erases a prop's state type for the registry. */
export function asAnyProp<S extends StoredState>(def: PropDef<S>): AnyPropDef {
  // Safe: everything that touches the state goes through the def's own schema first.
  return def as unknown as AnyPropDef;
}
