import type { About, Locale } from "@chalk/content";
import { PropRole, SEP } from "@chalk/prop";
import type { RefObject } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { addressOf } from "./part-paths";
import type { BoardRuntime } from "./runtime";
import { t } from "./ui-text";

/** Something the student held to ask Jugnu about, with the name its chip shows. */
export type Picked = About & { label: string };

/** Hold this long, still, to pick a thing: shorter than a long-press menu, longer than a tap. */
const HOLD_MS = 450;
/** A finger that moves further than this is dragging, not holding. */
const SLOP_PX = 10;
const TEXT_MAX = 120;
const LABEL_MAX = 28;

export const isSamePick = (a: About, b: About): boolean =>
  a.prop === b.prop && a.part === b.part && a.text === b.text;

const humanize = (name: string): string =>
  name
    .replace(/[:_-]+/g, " ")
    .replace(/([a-z])([A-Z0-9])/g, "$1 $2")
    .toLowerCase()
    .trim();

const clip = (text: string, max: number): string =>
  text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;

/** The words where they held, if the finger is on words (a button, a line of text), not a drawing. */
function wordsAt(target: Element, piece: Element): string | undefined {
  if (target.closest("svg") !== null)
    return target.tagName.toLowerCase() === "text"
      ? target.textContent?.trim() || undefined
      : undefined;
  for (let at: Element | null = target; at !== null && piece.contains(at); at = at.parentElement) {
    const text = (at.textContent ?? "").replace(/\s+/g, " ").trim();
    if (text.length > TEXT_MAX) return undefined;
    if (text !== "") return text;
  }
  return undefined;
}

/**
 * What is under the finger, in the names Jugnu points with: the prop (`data-piece`), and the part,
 * tagged in the view (`data-part`). Only what the prop shows can be picked.
 */
export function pickAt(
  runtime: BoardRuntime,
  target: Element,
  x: number,
  y: number,
  locale: Locale,
): Picked | undefined {
  const piece = target.closest("[data-piece]");
  const prop = piece?.getAttribute("data-piece");
  if (piece == null || prop == null || !runtime.propNames().includes(prop)) return undefined;
  const def = runtime.getDef(prop);
  const elements = runtime.describe(prop).elements;
  const ids = new Set(elements.map((e) => e.id));
  let part: string | undefined;
  // Its address under the piece ("objectArrow/object"): what the description calls it.
  const address = addressOf(target);
  const at = address?.indexOf(SEP) ?? -1;
  const tagged = at < 0 ? undefined : address?.slice(at + 1);
  if (tagged !== undefined && ids.has(tagged)) part = tagged;
  const text = wordsAt(target, piece);
  const value = elements.find((e) => e.id === part)?.value;
  // The chip names a part by what it shows; words they held name a whole prop.
  const label =
    part !== undefined
      ? typeof value === "string"
        ? clip(value, LABEL_MAX)
        : `${humanize(part.split(":")[0] ?? part)}${value === undefined || value === null ? "" : ` ${value}`}`
      : text !== undefined
        ? clip(text, LABEL_MAX)
        : def.role === PropRole.Question
          ? t(locale, "theQuestion")
          : humanize(prop);
  return {
    prop,
    ...(part !== undefined ? { part } : {}),
    ...(text !== undefined ? { text } : {}),
    label,
  };
}

export type HoldHandlers = {
  /** Picking is on: taps pick and unpick instead of working the board. */
  isPicking: boolean;
  /** They held something still: `at` is where, relative to the board's body. */
  onHold: (picked: Picked, at: { x: number; y: number }) => void;
  /** A tap while picking: on a thing, or on nothing (undefined). */
  onTap: (picked: Picked | undefined) => void;
};

/**
 * Press and hold a thing on the board to ask Jugnu about it. A finger that moves first is a drag,
 * as before; the click that ends a hold is swallowed (holding Check doesn't press it). While
 * picking, taps never reach the board: they pick, unpick, or (on nothing) let go.
 */
export function useHoldToAsk(
  body: RefObject<HTMLElement>,
  runtime: BoardRuntime,
  locale: Locale,
  isOn: boolean,
  handlers: HoldHandlers,
): void {
  const live = useRef(handlers);
  live.current = handlers;
  useEffect(() => {
    const element = body.current;
    if (!isOn || element === null) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let start: { x: number; y: number; target: Element } | undefined;
    let swallowClick = false;
    const isPill = (target: EventTarget | null) =>
      target instanceof Element && target.closest("[data-ask-pill]") !== null;

    const down = (event: PointerEvent) => {
      if (!event.isPrimary || isPill(event.target) || !(event.target instanceof Element)) return;
      swallowClick = false;
      start = { x: event.clientX, y: event.clientY, target: event.target };
      if (live.current.isPicking) {
        // A tap that picks mustn't also press, drag or select on the board.
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      clearTimeout(timer);
      const held = start;
      timer = setTimeout(() => {
        const picked = pickAt(runtime, held.target, held.x, held.y, locale);
        if (picked === undefined) return;
        // The finger lifting after a hold ends the hold; it isn't a tap.
        start = undefined;
        swallowClick = true;
        const box = element.getBoundingClientRect();
        live.current.onHold(picked, { x: held.x - box.left, y: held.y - box.top });
        navigator.vibrate?.(12);
      }, HOLD_MS);
    };
    const move = (event: PointerEvent) => {
      if (start === undefined || !event.isPrimary) return;
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > SLOP_PX) {
        clearTimeout(timer);
        if (live.current.isPicking) start = undefined;
      }
    };
    const up = (event: PointerEvent) => {
      clearTimeout(timer);
      if (live.current.isPicking && start !== undefined && !isPill(event.target)) {
        event.stopPropagation();
        live.current.onTap(pickAt(runtime, start.target, start.x, start.y, locale));
        swallowClick = true;
      }
      start = undefined;
    };
    const click = (event: MouseEvent) => {
      if (isPill(event.target)) return;
      if (swallowClick || live.current.isPicking) {
        event.preventDefault();
        event.stopPropagation();
        swallowClick = false;
      }
    };
    // A long press must not open the phone's own menu or start selecting text.
    const menu = (event: Event) => event.preventDefault();
    const options = { capture: true } as const;
    element.addEventListener("pointerdown", down, options);
    element.addEventListener("pointermove", move, options);
    element.addEventListener("pointerup", up, options);
    element.addEventListener("pointercancel", up, options);
    element.addEventListener("click", click, options);
    element.addEventListener("contextmenu", menu, options);
    return () => {
      clearTimeout(timer);
      element.removeEventListener("pointerdown", down, options);
      element.removeEventListener("pointermove", move, options);
      element.removeEventListener("pointerup", up, options);
      element.removeEventListener("pointercancel", up, options);
      element.removeEventListener("click", click, options);
      element.removeEventListener("contextmenu", menu, options);
    };
  }, [body, runtime, locale, isOn]);
}
