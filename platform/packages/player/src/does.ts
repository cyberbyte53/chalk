import { pathFrom } from "./door";

/**
 * Pressing what a view's inputs say they do (`does` and `says`, @chalk/prop's tags.ts): a press on
 * an input that does an action with fixed arguments runs it; an input whose own handler runs its
 * action is left to it.
 */

/** Where one view's inputs end: its piece's box. */
const BOUNDARY = ".piece-drawn";

/** What the browser already presses with Enter or Space (it sends a click). */
const NATIVE = "button, a, input, select, textarea, label, summary";

/**
 * The click and key handler for one piece's box: a press on an input inside it that says what it
 * does (and isn't by hand, or turned off) calls that action with its arguments. Enter or Space
 * presses one the browser doesn't (an SVG shape that says what it does), so every prop's inputs
 * work from the keyboard without a handler of their own.
 */
export function pressHandler(
  call: (action: string, args?: Readonly<Record<string, unknown>>) => void,
): (e: Event) => void {
  return (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const input = target.closest<HTMLElement | SVGElement>("[data-does]");
    if (input === null || input.hasAttribute("data-by-hand")) return;
    if (e.type === "keydown") {
      const key = (e as KeyboardEvent).key;
      if ((key !== "Enter" && key !== " ") || input.matches(NATIVE)) return;
      e.preventDefault();
    }
    // Only the view this input belongs to: its nearest box is the one handling the click.
    if (input.closest(BOUNDARY) !== e.currentTarget) return;
    if (
      input.hasAttribute("disabled") ||
      input.getAttribute("aria-disabled") === "true" ||
      input.closest("[disabled]") !== null
    )
      return;
    // Inside a group's child, the action is the child's: its path runs through the child's name.
    const action = pathFrom(
      input,
      e.currentTarget as Element,
      input.getAttribute("data-does") ?? "",
    );
    const raw = input.getAttribute("data-with");
    call(action, raw === null ? undefined : (JSON.parse(raw) as Record<string, unknown>));
  };
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
      `${piece}: a press called ${action}, but no input says it does that: give the input does(…) (or says(…), when its own handler runs it)`,
    );
  void run();
}
