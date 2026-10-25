import type { Locale } from "@chalk/content";
import type {
  DerivedOf,
  DragSpec,
  PartOf,
  PartSpec,
  PressSpec,
  PropView,
  StateOf,
  StoredState,
} from "@chalk/prop";
import type { JSX } from "preact";
import { useRef } from "preact/hooks";
import { type FrameContextValue, useFrame } from "./frame";
import type { PropViewProps } from "./prop-module";

/**
 * Declared parts, wired. A prop lists its parts (`anatomy`); its view only draws, and spreads
 * `part(name)` on what it draws for each: the framework adds the address (`data-part`), and for a
 * control its focus, role, words for a screen reader, keys and pointer. No view has input code.
 */

/** What `part(name)` puts on an element. */
export type PartAttrs = {
  "data-part": string;
  tabindex?: number;
  role?: "slider" | "button";
  "aria-label"?: string;
  "aria-valuetext"?: string;
  "aria-valuenow"?: number;
  onKeyDown?: (e: JSX.TargetedKeyboardEvent<Element>) => void;
  onPointerDown?: (e: JSX.TargetedPointerEvent<Element>) => void;
  onClick?: (e: JSX.TargetedMouseEvent<Element>) => void;
  /** A button that can't be pressed now. */
  disabled?: boolean;
};

type Point = { x: number; y: number };
type AnyDef = { anatomy?: Readonly<Record<string, PartSpec<StoredState>>> };

const argsOf = (axis: DragSpec<StoredState>["axis"], p: Point) =>
  axis === "x" ? { x: p.x } : axis === "y" ? { y: p.y } : { x: p.x, y: p.y };

/** The parts of one prop on screen: `part(name)` for what draws each, `grab(name)` for a hit area. */
export function useParts(
  def: AnyDef,
  view: PropView,
  call: PropViewProps["call"],
  signal: PropViewProps["signal"],
): {
  part: (name: string, id?: string) => PartAttrs;
  grab: (name: string) => (e: JSX.TargetedPointerEvent<Element>) => void;
} {
  const frame = useFrame();
  // The latest view and where each drag last put its part (a move to the same place isn't sent).
  const latest = useRef(view);
  latest.current = view;
  const last = useRef(new Map<string, Point>());
  const specOf = (name: string): PartSpec<StoredState> => {
    const spec = def.anatomy?.[name];
    if (spec === undefined) throw new Error(`no part "${name}" declared (anatomy)`);
    return spec;
  };
  const s = () => latest.current as PropView & StoredState;

  /** The model window the frame shows now (everything, outside a frame). */
  const shown = (inset = 0) => {
    if (frame === null)
      return {
        xMin: Number.NEGATIVE_INFINITY,
        xMax: Number.POSITIVE_INFINITY,
        yMin: Number.NEGATIVE_INFINITY,
        yMax: Number.POSITIVE_INFINITY,
      };
    const [x0, y0] = frame.px.fromPx(inset, frame.px.height - inset);
    const [x1, y1] = frame.px.fromPx(frame.px.width - inset, inset);
    return {
      xMin: Math.min(x0, x1),
      xMax: Math.max(x0, x1),
      yMin: Math.min(y0, y1),
      yMax: Math.max(y0, y1),
    };
  };
  const dragTo = (name: string, drag: DragSpec<StoredState>, to: Point) => {
    const at = drag.place?.(s(), to, shown(drag.inset)) ?? to;
    const was = last.current.get(name);
    if (was !== undefined && was.x === at.x && was.y === at.y) return;
    last.current.set(name, at);
    call(drag.move, argsOf(drag.axis, at));
  };
  const letGo = (name: string, drag: DragSpec<StoredState>) => {
    const at = last.current.get(name) ?? drag.at(s());
    const args = argsOf(drag.axis, at);
    if (drag.release?.action !== undefined) call(drag.release.action, args);
    if (drag.release?.signal !== undefined) signal(drag.release.signal, args);
  };
  const grabWith =
    (name: string, drag: DragSpec<StoredState>, f: FrameContextValue | null) =>
    (e: JSX.TargetedPointerEvent<Element>) => {
      if (f === null) return;
      const start = drag.at(s());
      last.current.set(name, start);
      let first: readonly [number, number] | null = null;
      f.drag(
        e,
        (p) => {
          if (drag.follow === "finger") return dragTo(name, drag, { x: p[0], y: p[1] });
          if (first === null) first = p;
          dragTo(name, drag, { x: start.x + (p[0] - first[0]), y: start.y + (p[1] - first[1]) });
        },
        () => letGo(name, drag),
      );
    };
  const keysWith =
    (name: string, drag: DragSpec<StoredState>) => (e: JSX.TargetedKeyboardEvent<Element>) => {
      const step = drag.step(s());
      const alongX = drag.axis !== "y";
      const alongY = drag.axis !== "x";
      const dx = alongX ? (e.key === "ArrowRight" ? step : e.key === "ArrowLeft" ? -step : 0) : 0;
      const dy = alongY ? (e.key === "ArrowUp" ? step : e.key === "ArrowDown" ? -step : 0) : 0;
      if (dx === 0 && dy === 0) return;
      e.preventDefault();
      const at = drag.at(s());
      last.current.delete(name);
      dragTo(name, drag, {
        x: Number((at.x + dx).toFixed(10)),
        y: Number((at.y + dy).toFixed(10)),
      });
      letGo(name, drag);
    };
  const pressWith = (press: PressSpec<StoredState>, id: string) => () =>
    call(press.action, press.args?.(s(), id) ?? {});

  return {
    part: (name, id) => {
      const spec = specOf(name);
      const attrs: PartAttrs = { "data-part": id ?? name };
      const v = s();
      const item = id === undefined ? undefined : spec.each?.(v).find((i) => i.id === id);
      const words = item !== undefined ? item.words : spec.words?.(v);
      const label = (item === undefined ? spec.name?.(v) : undefined) ?? words;
      if (label !== undefined) attrs["aria-label"] = label;
      const drag = spec.drag;
      if (drag !== undefined && drag.enabled?.(v) !== false) {
        const at = drag.at(v);
        attrs.tabindex = 0;
        attrs.role = "slider";
        if (words !== undefined) attrs["aria-valuetext"] = words;
        attrs["aria-valuenow"] = drag.axis === "y" ? at.y : at.x;
        attrs.onKeyDown = keysWith(name, drag);
        attrs.onPointerDown = grabWith(name, drag, frame);
      } else if (spec.press !== undefined) {
        if (spec.press.enabled?.(v) === false) {
          attrs.disabled = true;
          return attrs;
        }
        const press = pressWith(spec.press, id ?? name);
        attrs.tabindex = 0;
        attrs.role = "button";
        attrs.onClick = press;
        attrs.onKeyDown = (e) => {
          // A real <button> already turns Enter and Space into a click.
          if ((e.key !== "Enter" && e.key !== " ") || e.currentTarget.tagName === "BUTTON") return;
          e.preventDefault();
          press();
        };
      }
      return attrs;
    },
    grab: (name) => {
      const drag = specOf(name).drag;
      if (drag === undefined) throw new Error(`part "${name}" is not dragged`);
      return grabWith(name, drag, frame);
    },
  };
}

/** What a typed view draws from: its state (stored and derived), its frame, and its parts. */
export type ViewContext<P extends { anatomy?: object; derived?: object }> = {
  s: StateOf<P> & { readonly [K in DerivedOf<P>]: unknown };
  frame: FrameContextValue | null;
  /** Spread on what draws a part: its address, and a control's wiring. */
  part: (name: PartOf<P>, id?: string) => PartAttrs;
  /** A hit area for a dragged part (a bigger invisible circle around it). */
  grab: (name: PartOf<P>) => (e: JSX.TargetedPointerEvent<Element>) => void;
  locale: Locale;
  width: number;
};

/**
 * A view, typed against its prop: `leafView(opticObject, ({ s, part }) => <g {...part("object")}>…</g>)`.
 * Naming a part the prop doesn't declare is a compile error.
 */
export function leafView<P extends { anatomy?: object; derived?: object }>(
  def: P,
  draw: (c: ViewContext<P>) => JSX.Element | null,
): (props: PropViewProps) => JSX.Element | null {
  return function View({ view, call, signal, locale, width }: PropViewProps) {
    const { part, grab } = useParts(def as AnyDef, view, call, signal);
    const frame = useFrame();
    return draw({
      s: view as ViewContext<P>["s"],
      frame,
      part: part as ViewContext<P>["part"],
      grab: grab as ViewContext<P>["grab"],
      locale,
      width,
    });
  };
}
