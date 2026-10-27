import { type ActionSpec, type ArgsParam, type StoredState, nameOf } from "@chalk/prop";
import { addressOf } from "./part-paths";

/**
 * What an input does, said as data on the input itself: `<button {...does(sweetShare.actions.giveRound)}>`
 * or `<SymbolButton {...does(tenMaker.actions.tryPiece, { length: 3 })} />` (the action itself, its
 * arguments checked against it). The player runs
 * it when the input is pressed, and anything that reads the board (the snapshot, the chalk MCP's
 * look and play, Jugnu) sees what each input does without pressing it: the action is a value on the
 * page (`data-does`, its arguments in `data-with`), not hidden inside a function.
 *
 * An input whose arguments are only known when it's used (a stepper's step, a drag's point, a
 * typed number) keeps its own handler and says which action it does with `says(action)`: read the
 * same way, but the player leaves the pressing to it.
 */

/** The attributes that say what an input does. */
export type DoesAttrs = {
  "data-does": string;
  "data-with"?: string;
  /** The input's own handler calls the action (its arguments are worked out when it's used). */
  "data-by-hand"?: "";
};

/** An input that does `action` (with `args`) when pressed: the player calls it. */
export function does<S extends StoredState, Ar>(
  action: ActionSpec<S, Ar>,
  ...args: ArgsParam<Ar>
): DoesAttrs {
  const name = nameOf(action);
  const given = args[0] as Readonly<Record<string, unknown>> | undefined;
  return given === undefined || Object.keys(given).length === 0
    ? { "data-does": name }
    : { "data-does": name, "data-with": JSON.stringify(given) };
}

/**
 * An input whose own handler calls `action` (its arguments known only when it's used), or calls
 * several in turn (a choice's option picks, then checks: `says(choice.actions.select, choice.actions.check)`).
 */
export function says(...actions: readonly { readonly describe: string }[]): DoesAttrs {
  return { "data-does": actions.map(nameOf).join(" "), "data-by-hand": "" };
}

/** The does-attributes among a component's props, to pass on to the element that is pressed. */
export function doesOf(props: Readonly<Record<string, unknown>>): Partial<DoesAttrs> {
  const out: Partial<DoesAttrs> = {};
  if (typeof props["data-does"] === "string") out["data-does"] = props["data-does"];
  if (typeof props["data-with"] === "string") out["data-with"] = props["data-with"];
  if (props["data-by-hand"] !== undefined) out["data-by-hand"] = "";
  return out;
}

/** Where one view's inputs end: a group's child or a composite's child is a view of its own. */
const BOUNDARY = "[data-child], .piece-drawn";

/**
 * The click handler for one view's box: a press on an input inside it that says what it does (and
 * isn't by hand, or turned off) calls that action with that view's `call`. A view inside another
 * handles its own inputs first; the outer one leaves them alone.
 */
export function pressHandler(
  call: (action: string, args?: Readonly<Record<string, unknown>>) => void,
): (e: Event) => void {
  return (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const input = target.closest<HTMLElement | SVGElement>("[data-does]");
    if (input === null || input.hasAttribute("data-by-hand")) return;
    // Only the view this input belongs to: its nearest box is the one handling the click.
    if (input.closest(BOUNDARY) !== e.currentTarget) return;
    if (
      input.hasAttribute("disabled") ||
      input.getAttribute("aria-disabled") === "true" ||
      input.closest("[disabled]") !== null
    )
      return;
    const action = input.getAttribute("data-does") ?? "";
    const raw = input.getAttribute("data-with");
    let args: Record<string, unknown> | undefined;
    try {
      args = raw === null ? undefined : (JSON.parse(raw) as Record<string, unknown>);
    } catch {
      args = undefined;
    }
    call(action, args);
  };
}

/**
 * The inputs a node's box on the page says it has (the piece, or a group's child): each one's
 * action, arguments, and address on the board. Inputs of a child inside it are the child's.
 */
export function inputsIn(box: Element): { action: string; args?: unknown; at?: string }[] {
  // (each input once for each action it says it does)
  const isOwn = (el: Element) => {
    for (let p = el.parentElement; p !== null && p !== box; p = p.parentElement)
      if (p.hasAttribute("data-child")) return false;
    return true;
  };
  return [...box.querySelectorAll("[data-does]")].filter(isOwn).flatMap((el) => {
    const raw = el.getAttribute("data-with");
    let args: unknown;
    try {
      args = raw === null ? undefined : JSON.parse(raw);
    } catch {
      args = undefined;
    }
    const at = addressOf(el);
    // An input that says several actions (says(a, b)) does each.
    return (el.getAttribute("data-does") ?? "")
      .split(/\s+/)
      .filter((action) => action !== "")
      .map((action) => ({
        action,
        ...(args === undefined ? {} : { args }),
        ...(at === undefined ? {} : { at }),
      }));
  });
}

/**
 * In the dev preview, a student action called from an input that doesn't say what it does is
 * reported (the chalk MCP's look shows page errors): `piece: a press called giveRound, but no input
 * says it does that (does or says)`. Otherwise `run` just runs.
 */
let pressed: Element | undefined;
if (typeof document !== "undefined")
  for (const kind of ["click", "pointerdown", "pointerup", "change", "input", "keydown"])
    document.addEventListener(
      kind,
      (e) => {
        pressed = e.target instanceof Element ? e.target : undefined;
        // Until this event is done: microtasks run between its listeners, a new task after.
        setTimeout(() => {
          pressed = undefined;
        }, 0);
      },
      true,
    );

const isDev = () => typeof location !== "undefined" && /[?&]dev\b/.test(location.search);

export function heard(piece: string, action: string, run: () => unknown): void {
  const from = pressed;
  if (from !== undefined && isDev() && from.closest("[data-does]") === null)
    console.error(
      `${piece}: a press called ${action}, but no input says it does that: give the input {...does(${action})} (or says, when its own handler calls it)`,
    );
  void run();
}
