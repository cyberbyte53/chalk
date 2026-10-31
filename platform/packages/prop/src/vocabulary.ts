/** What every prop shares, whatever it is: its role, its frame, what it shows, its actions' names. */

/** A prop's variables. Values are plain JSON, so they can be logged and replayed. */
export type StoredState = Readonly<Record<string, unknown>>;

/** What anyone reads from a prop: its variables, needs and facts. A reader can't tell them apart. */
export type PropView = Readonly<Record<string, unknown>>;

/**
 * The name each action and signal has in its prop: its key there, noted when the prop is defined.
 * So views, content and a prop's own actions pass actions and signals as themselves, never as
 * names, and the name is looked up only where it becomes data (a press on the page, a script).
 */
const names = new WeakMap<object, string>();

/** The name of an action or signal in its prop. */
export function nameOf(spec: object): string {
  const name = names.get(spec);
  if (name === undefined)
    throw new Error(
      `"${(spec as { describe?: string }).describe ?? "this"}" isn't an action or signal of a defined prop: pass the prop's own (prop() notes their names)`,
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

/** What a frame offers: a 1-D axis (numbers along a line), a 2-D plane, or an optical bench. */
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

/**
 * A picture other props draw into (graph paper, an optical bench, an axis): its kind, and where
 * things go at a width. `pixels` is pure, so tests and the view use the same mapping.
 */
export type FrameSpec<S extends StoredState> = {
  kind: FrameKindName;
  pixels: (state: S, width: number) => FramePixels;
  /** What the picture shows, for a screen reader ("Graph paper from −3 to 6 across"). */
  label?: (state: S) => string;
};

/** One thing the student can see and tell apart, with what it shows them right now. */
export type Element = {
  /** Its name under the piece: what `point`, steps and comments take. */
  id: string;
  /** What it shows, typed: a number as a number, a point as { x, y }. None for an input. */
  value?: unknown;
  /** The value as the screen writes it ("1.40", "½"), when that isn't just the value printed. */
  words?: string;
  /** For an input: the action(s) touching it does (when it's on: see isOff). */
  does?: string | readonly string[];
  /** For an input that does an action with fixed arguments: those arguments. */
  args?: Readonly<Record<string, unknown>>;
  /** For an input whose own handler works out the arguments when it's used (a stepper, a typed number). */
  isByHand?: true;
  /** For an input: it is drawn, but turned off now. */
  isOff?: true;
};

/**
 * What a student sees of a prop right now, read from what its view draws (tags.ts): the only way
 * agents and Jugnu see it. Every element is drawn right now, with the value it shows. What the
 * prop knows but the screen doesn't show goes under `hidden`, labelled.
 */
export type Observation = {
  /** One line: what this is and where it stands. */
  summary: string;
  elements: readonly Element[];
  hidden?: Readonly<Record<string, unknown>>;
};

/**
 * What a prop is for on a board. An **explainer** shows a world the student works in (a number
 * line, tiles, a race): Jugnu may bring one in to explain. A **question** asks, and is checked. A
 * **page** prop is part of the page around them (words, the board itself): never brought in.
 */
export const PropRole = { Explainer: "explainer", Question: "question", Page: "page" } as const;
export type PropRole = (typeof PropRole)[keyof typeof PropRole];

/**
 * What a prop is for: the first sentence of its `describe`, which is written to say it. Shown
 * where props are listed to be chosen from (the chalk MCP's `look` at library/props/, the
 * catalogue, Studio's library); the rest of `describe` is its world, in full.
 */
export function purposeOf(def: { readonly describe: string }): string {
  const text = def.describe.trim().replace(/\s+/g, " ");
  const end = text.search(/[.!?](\s|$)/);
  return end === -1 ? text : text.slice(0, end + 1);
}

/** The board itself, by name: what its own actions and signals are called. */
export const BOARD = "board";

export const BoardSignal = { Started: "started", Continued: "continued" } as const;
export type BoardSignal = (typeof BoardSignal)[keyof typeof BoardSignal];

export const BoardAction = {
  Pass: "pass",
  Show: "show",
  Hide: "hide",
  Continue: "continue",
} as const;
export type BoardAction = (typeof BoardAction)[keyof typeof BoardAction];
