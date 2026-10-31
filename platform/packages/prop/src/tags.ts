import { SEP } from "./address";
import { type ActionSpec, type Element, type Observation, nameOf } from "./define";
import type { AnyPropDef, PropView, StoredState } from "./define";
import { groupOf, shownOf } from "./group";
import type { ActionDef } from "./next/define";

/**
 * What is on screen is written once, in the view: each part the student can tell apart says what
 * it is, as data on the element that draws it.
 *
 * - An input says what it does: `<SymbolButton {...does(sweetShare.actions.giveRound)} />`, with
 *   its arguments (`does(stickMeasure.actions.tryPiece, { length: 3 }, 3)`). The player presses it.
 *   An input whose own handler works out the arguments when it's used (a stepper, a typed number, a
 *   drag) says which action with `says(sweetShare.actions.setFriends)`.
 * - Anything else the student reads says what it shows: `<g {...shows("box", box)}>`, its value
 *   typed (a number as a number), with the words the screen writes when they aren't the value.
 *
 * Each is named: an input by its action (and a key, when several inputs do one action), a shown part
 * by the name given. The name is its address under the piece (`game/giveRound`): what `look`,
 * `play`, comments and Jugnu's pointing use. The description of a prop (for agents, Jugnu, tests)
 * is read from these tags in the view drawn from its state: there is no second copy to keep in step.
 */

/** The attributes that say what an input does. */
export type InputTags = {
  "data-part": string;
  "data-does": string;
  "data-with"?: string;
  /** The input's own handler calls the action (its arguments are worked out when it's used). */
  "data-by-hand"?: "";
};

/** The attributes that say what a part shows. */
export type ShownTags = {
  "data-part": string;
  "data-shows": string;
  "data-words"?: string;
};

/** Which one, when several inputs do one action: `tryPiece:3`. */
export type Key = string | number;

/** An input's name: its action, and which one when a prop has several doing it. */
export function inputName(action: string, key?: Key): string {
  return key === undefined ? action : `${action}:${String(key).replace(/[/\s]/g, "-")}`;
}

/**
 * An input that sends arguments says which one it is (its key), so it has a name of its own that
 * never changes with what it sends: a type error without one. One with none is named by its action.
 */
type DoesParams<Ar> = unknown extends Ar
  ? // A host's action, whose arguments its type doesn't carry: the same rule.
    [] | [args: Readonly<Record<string, unknown>>, key: Key]
  : // Nothing it must be sent (no arguments, or only optional ones): none, or arguments and a key.
    Partial<Ar> extends Ar
    ? [] | [args: Ar, key: Key]
    : [args: Ar, key: Key];

/**
 * An input that does `action` (with its arguments) when pressed: the player runs it. Named by the
 * action, and by `key` when the prop has several inputs doing it; the name never changes with what
 * the input currently sends.
 */
export function does<S extends StoredState, Ar>(
  action: ActionSpec<S, Ar> | ActionDef<Ar & Readonly<Record<string, unknown>>>,
  ...params: DoesParams<NoInfer<Ar>>
): InputTags {
  const [args, key] = params as [Ar | undefined, Key | undefined];
  const name = nameOf(action);
  const given = args as Readonly<Record<string, unknown>> | undefined;
  return {
    "data-part": inputName(name, key),
    "data-does": name,
    ...(given === undefined || Object.keys(given).length === 0
      ? {}
      : { "data-with": JSON.stringify(given) }),
  };
}

/**
 * An input whose own handler runs the action, its arguments worked out when it's used (a stepper's
 * step, a typed number, a drag). Several actions in turn (a choice's option picks, then checks):
 * `says([choice.actions.select, choice.actions.check], option.id)`. Named by the first action and
 * the key.
 */
export function says(action: object | readonly object[], key?: Key): InputTags {
  const names = (Array.isArray(action) ? action : [action]).map(nameOf);
  return {
    "data-part": inputName(names[0] ?? "", key),
    "data-does": names.join(" "),
    "data-by-hand": "",
  };
}

/**
 * A part the student reads: its name, what it shows (typed: a number as a number, a point as
 * `{ x, y }`, a list as a list), and the words the screen writes when they aren't just the value
 * printed ("1.40", "12 sweets").
 */
export function shows(name: string, value: unknown, words?: string): ShownTags {
  return {
    "data-part": name,
    "data-shows": JSON.stringify(value === undefined ? null : value),
    ...(words === undefined ? {} : { "data-words": words }),
  };
}

/** The tags among a component's props, to pass on to the element that draws or is pressed. */
export function tagsOf(
  props: Readonly<Record<string, unknown>>,
): Partial<InputTags> & Partial<ShownTags> {
  const out: Record<string, string> = {};
  for (const key of ["data-part", "data-does", "data-with", "data-shows", "data-words"])
    if (typeof props[key] === "string") out[key] = props[key] as string;
  if (props["data-by-hand"] !== undefined) out["data-by-hand"] = "";
  return out;
}

/** One tagged part, as read from a drawing. */
export type Tag = {
  /** Its name under the piece. */
  part: string;
  /** For an input: the action(s) it does, its arguments, whether its own handler runs them. */
  does?: readonly string[];
  args?: Readonly<Record<string, unknown>>;
  isByHand?: boolean;
  /** For an input: turned off now (disabled, or inside something disabled). */
  isOff?: boolean;
  /** What it shows (a part's value, or an input's own number), and the words written for it. */
  value?: unknown;
  words?: string;
};

/** Reads one element's tag from its attributes (`get` reads an attribute, null when absent). */
export function tagFrom(get: (name: string) => string | null, isOff: boolean): Tag | undefined {
  const part = get("data-part");
  if (part === null) return undefined;
  const does = get("data-does");
  const shown = get("data-shows");
  if (does !== null) {
    const raw = get("data-with");
    return {
      part,
      does: does.split(" ").filter((a) => a !== ""),
      ...(raw === null ? {} : { args: JSON.parse(raw) as Record<string, unknown> }),
      ...(get("data-by-hand") === null ? {} : { isByHand: true }),
      ...(isOff ? { isOff: true } : {}),
      // An input may show a value too (a stepper's number).
      ...(shown === null ? {} : { value: JSON.parse(shown) as unknown }),
    };
  }
  if (shown === null)
    throw new Error(`the part "${part}" says neither what it does nor what it shows`);
  const words = get("data-words");
  return { part, value: JSON.parse(shown) as unknown, ...(words === null ? {} : { words }) };
}

const VOID = new Set(
  "area base br col embed hr img input link meta source track wbr".split(" ").map((t) => t),
);

const unescapeHtml = (s: string) =>
  s
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");

/**
 * A tag found inside a group's child (`data-child`): named under the child ("dial/handle"), and
 * doing the child's action by its path in the group ("dial.move").
 */
function underChildren(tag: Tag, children: readonly string[]): Tag {
  if (children.length === 0) return tag;
  return {
    ...tag,
    part: [...children, tag.part].join(SEP),
    ...(tag.does !== undefined ? { does: tag.does.map((a) => [...children, a].join(".")) } : {}),
  };
}

/**
 * Every tagged part in a view's markup (as `preact-render-to-string` writes it), in order. An input
 * inside a disabled element is off. A part inside a group's child is named under it. A view still
 * waiting for its drawing code is refused: what it would show isn't known yet.
 */
export function tagsInMarkup(html: string): Tag[] {
  const out: Tag[] = [];
  const open: { isOff: boolean; child: string | undefined }[] = [];
  for (const m of html.matchAll(/<(\/?)([a-zA-Z][\w:-]*)((?:[^>"]|"[^"]*")*?)(\/?)>/g)) {
    const [, closing, tag = "", attrs = "", selfClosing] = m;
    if (closing === "/") {
      open.pop();
      continue;
    }
    const values = new Map<string, string>();
    for (const a of attrs.matchAll(/([\w:-]+)(?:="([^"]*)")?/g))
      values.set(a[1] ?? "", unescapeHtml(a[2] ?? ""));
    if (values.has("data-waiting"))
      throw new Error("a view is still loading its drawing code: describe it once it has loaded");
    const isOff =
      open.at(-1)?.isOff === true ||
      values.has("disabled") ||
      values.get("aria-disabled") === "true";
    const children = open.flatMap((o) => (o.child === undefined ? [] : [o.child]));
    const found = tagFrom((name) => values.get(name) ?? null, isOff);
    if (found !== undefined) out.push(underChildren(found, children));
    if (selfClosing !== "/" && !VOID.has(tag.toLowerCase()))
      open.push({ isOff, child: values.get("data-child") });
  }
  return out;
}

/**
 * A prop as the student sees it right now, from what its view draws: its one line (`summary`),
 * each tagged part (an input with what it does, unless it's off; a shown part with its value), and
 * what it knows but doesn't show (`offScreen`), labelled hidden. Two parts with one name are refused.
 */
/** What describing a prop reads of its definition: its name, what it is, its parts. */
export type Describable = {
  readonly type: string;
  readonly describe: string;
  readonly summary?: (view: never) => string;
  readonly offScreen?: readonly string[];
  readonly children?: Readonly<Record<string, Describable>>;
};

export function describe(def: Describable, view: PropView, tags: readonly Tag[]): Observation {
  const elements: Element[] = [];
  const seen = new Set<string>();
  for (const t of tags) {
    if (seen.has(t.part))
      throw new Error(
        `${def.type}: two parts are named "${t.part}"; give each input doing one action a key (does(action, args, key))`,
      );
    seen.add(t.part);
    elements.push({
      id: t.part,
      ...(t.value !== undefined ? { value: t.value } : {}),
      ...(t.words !== undefined ? { words: t.words } : {}),
      ...(t.does !== undefined
        ? { does: t.does.length === 1 ? (t.does[0] as string) : t.does }
        : {}),
      ...(t.args !== undefined ? { args: t.args } : {}),
      ...(t.isByHand === true ? { isByHand: true } : {}),
      ...(t.isOff === true ? { isOff: true } : {}),
    });
  }
  const hidden = hiddenOf(def, view);
  return {
    summary: def.summary?.(view as never) ?? def.describe,
    elements,
    ...(Object.keys(hidden).length > 0 ? { hidden } : {}),
  };
}

/** What a prop knows but doesn't show: its `offScreen` fields, and each shown part's, by name. */
function hiddenOf(def: Describable, view: PropView): Record<string, unknown> {
  const hidden: Record<string, unknown> = {};
  for (const field of def.offScreen ?? []) hidden[field] = view[field];
  const shown = shownOf(view);
  for (const [name, child] of Object.entries(def.children ?? {})) {
    const childView = view[name];
    if (childView === null || childView === undefined || shown?.[name] === false) continue;
    const inner = hiddenOf(child, childView as PropView);
    if (Object.keys(inner).length > 0) hidden[name] = inner;
  }
  return hidden;
}
