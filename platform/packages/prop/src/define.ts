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
  | { kind: typeof EffectKind.Set; set: Partial<S>; emit: readonly Emit[] }
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
export function set<S extends StoredState>(patch: NoInfer<Partial<S>>, ...emit: Emit[]): Effect<S> {
  return { kind: EffectKind.Set, set: patch, emit };
}

/** Raises a signal (with nothing changed). */
export function emit<S extends StoredState>(
  signal: string,
  payload?: Readonly<Record<string, unknown>>,
): Effect<S> {
  return {
    kind: EffectKind.Set,
    set: {},
    emit: [payload === undefined ? { signal } : { signal, payload }],
  };
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

export function call<S extends StoredState>(
  action: string,
  args: Readonly<Record<string, unknown>> = {},
): Effect<S> {
  return { kind: EffectKind.Call, action, args };
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
export function repeat<S extends StoredState>(
  every: number,
  action: string,
  options: { while: (state: NoInfer<S>) => boolean; args?: Readonly<Record<string, unknown>> },
): Effect<S> {
  return {
    kind: EffectKind.Repeat,
    every,
    action,
    args: options.args ?? {},
    while: options.while,
  } as Effect<S>;
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

/** What a frame offers: a 1-D axis (numbers along a line) or a 2-D plane. */
export type FrameKindName = "axis" | "plane" | "bench";

/** Where things are drawn in a frame at a width: its height, and model ↔ pixels (y down). */
export type FramePixels = {
  width: number;
  height: number;
  /**
   * The model stretch across (and up) the picture, when the transform is linear: the frame is then
   * also a drawing stage, so drawing-kit pieces and grids that take the stage's scales draw in it.
   */
  domain?: { x: readonly [number, number]; y?: readonly [number, number] };
  toPx: (x: number, y?: number) => readonly [number, number];
  fromPx: (px: number, py?: number) => readonly [number, number];
};

export type FrameSpec<S extends StoredState> = {
  kind: FrameKindName;
  pixels: (state: S, width: number) => FramePixels;
  /** What the picture shows, for a screen reader ("Graph paper from −3 to 6 across"). */
  label?: (state: S) => string;
};

/**
 * A drag, declared: the framework wires the pointer (against the frame's transform as it was when
 * the drag began), arrow keys, focus, the slider's role and words, and the let-go. The view only
 * draws. `x`/`y` are model units in the frame the prop draws on.
 */
export type DragSpec<S extends StoredState> = {
  /** Which way it moves: along x, along y, or anywhere. */
  axis: "x" | "y" | "xy";
  /** Where it is now (where a grab starts, what a key nudges). */
  at: (s: S) => { x: number; y: number };
  /**
   * "grab" (default): it moves by how far the finger moved, so a press near it doesn't make it
   * jump; "finger": it goes where the finger is (a touch anywhere on a track).
   */
  follow?: "grab" | "finger";
  /**
   * Where a point it is dragged to lands (snapped, kept in bounds; `shown` is the window the frame
   * shows now). Default: as it is.
   */
  place?: (
    s: S,
    to: { x: number; y: number },
    shown: { xMin: number; xMax: number; yMin: number; yMax: number },
  ) => { x: number; y: number };
  /** Whether it can be dragged now (default: always). */
  enabled?: (s: S) => boolean;
  /** How far inside the frame's edges `shown` stops, px (so a round handle isn't cut off). */
  inset?: number;
  /** The action each move runs, with `{ x }`, `{ y }` or `{ x, y }`. */
  move: string;
  /** On let-go (and after a key): an action to run and/or a signal to raise, with the same. */
  release?: { action?: string; signal?: string };
  /** How far one arrow key moves it, model units. */
  step: (s: S) => number;
};

/** A button, declared: tapping it (or Enter / Space on it) runs the action. */
export type PressSpec<S extends StoredState> = {
  action: string;
  /** Its arguments; `id` is which one, for a part with `each`. */
  args?: (s: S, id: string) => Readonly<Record<string, unknown>>;
  /** Whether it can be pressed now (default: always). */
  enabled?: (s: S) => boolean;
};

/**
 * One named part of a prop, declared up front: what it is, whether it is there now, what it shows,
 * and, for a control, what touching it does. The default description is made from these, the
 * framework wires the controls, and a view names the parts it draws (`part("object")`).
 */
export type PartSpec<S extends StoredState> = {
  is: "control" | "readout" | "label" | "drawing";
  /** Whether it is there now (default: always). */
  when?: (s: S) => boolean;
  /** What it shows, typed (a number as a number, a point as { x, y }). */
  value?: (s: S) => unknown;
  /** How the screen writes it ("1.40", "½"), when that isn't just the value. */
  words?: (s: S) => string | undefined;
  /** What it is called, for a screen reader (default: its words). */
  name?: (s: S) => string;
  /** Several of it, one per item (the points on an axis): each item's id, value and words. */
  each?: (s: S) => readonly { id: string; value?: unknown; words?: string }[];
  drag?: DragSpec<S>;
  press?: PressSpec<S>;
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
  /** Its declared part names. */
  N extends string = string,
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
  /**
   * Its parts, declared (see `PartSpec`). With these and `summary`, the prop needs no `observe`:
   * its description is made from them, and its view draws them with `part(name)`.
   */
  anatomy?: Readonly<Record<N, PartSpec<S>>>;
  /** Its one line in the description, when the description is made from `anatomy`. */
  summary?: (view: PropView & S) => string;
  /** Where a part is drawn at this width, or undefined if it isn't there. */
  locate?: (view: PropView & S, part: string, width: number) => Box | undefined;
  /** Rules that span fields (e.g. from < to). Returns a message when broken. */
  invariant?: (state: S) => string | undefined;
  /** What this prop says when told to `say` (for audio generation and the voice check). */
  speech?: (state: S) => Spoken | undefined;
  role?: PropRole;
  /**
   * A frame this prop provides: other props in a group's frame layout draw into its picture through
   * its transform (graph paper, an optical bench, an axis). `pixels` is pure, so `locate` and tests
   * use the same mapping the view draws with.
   */
  frame?: FrameSpec<S>;
  /** The kind of frame this prop draws on, when it only draws inside one (a ray, a marker). */
  drawsOn?: FrameKindName;
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
  N extends string = never,
>(def: PropDef<S, A, G, D, N>): PropDef<S, A, G, D, N> {
  return def;
}

/** A prop definition's action names, signal names and derived field names, as literal unions. */
export type ActionOf<P extends { actions: object }> = keyof P["actions"] & string;
export type SignalOf<P extends { signals?: object }> = keyof NonNullable<P["signals"]> & string;
export type DerivedOf<P extends { derived?: object }> = keyof NonNullable<P["derived"]> & string;
export type PartOf<P extends { anatomy?: object }> = keyof NonNullable<P["anatomy"]> & string;

/** A prop of any state type, as the registry, the player and the validator hold it. */
export type AnyPropDef = PropDef<StoredState>;

/** Erases a prop's state type for the registry. */
export function asAnyProp<
  S extends StoredState,
  A extends string,
  G extends string,
  D extends string,
  N extends string,
>(def: PropDef<S, A, G, D, N>): AnyPropDef {
  // Safe: everything that touches the state goes through the def's own schema first.
  return def as unknown as AnyPropDef;
}
