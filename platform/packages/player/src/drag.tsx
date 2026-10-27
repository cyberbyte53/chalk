import {
  type ActionSpec,
  type InputTags,
  type Key,
  type SignalSpec,
  nameOf,
  says,
} from "@chalk/prop";
import type { JSX } from "preact";
import { useRef } from "preact/hooks";
import { useDoor } from "./door";
import { useFrame } from "./frame";

type Point = { x: number; y: number };

/**
 * A drag: the player wires the pointer (against the frame's transform as it was when the drag
 * began), arrow keys, focus, the slider's role and words, and the let-go. The view only draws.
 * `x`/`y` are model units in the frame the prop draws on.
 */
export type DragSpec = {
  /** Which way it moves: along x, along y, or anywhere. */
  axis: "x" | "y" | "xy";
  /** Where it is now (where a grab starts, what a key nudges). */
  at: Point;
  /**
   * "grab" (default): it moves by how far the finger moved, so a press near it doesn't make it
   * jump; "finger": it goes where the finger is (a touch anywhere on a track).
   */
  follow?: "grab" | "finger";
  /**
   * Where a point it is dragged to lands (snapped, kept in bounds; `shown` is the window the frame
   * shows now). Default: as it is.
   */
  place?: (to: Point, shown: { xMin: number; xMax: number; yMin: number; yMax: number }) => Point;
  /** Whether it can be dragged now (default: yes). */
  isOn?: boolean;
  /** How far inside the frame's edges `shown` stops, px (so a round handle isn't cut off). */
  inset?: number;
  /** The action each move runs, with `{ x }`, `{ y }` or `{ x, y }`. */
  // biome-ignore lint/suspicious/noExplicitAny: any prop's action taking a point
  move: ActionSpec<any, any>;
  /** On let-go (and after a key): an action to run and/or a signal to raise, with the same. */
  // biome-ignore lint/suspicious/noExplicitAny: any prop's action taking a point
  release?: { action?: ActionSpec<any, any>; signal?: SignalSpec };
  /** How far one arrow key moves it, model units. */
  step: number;
  /** What it shows, for a screen reader ("1.75"). */
  words?: string;
};

/** What `drag(spec)` puts on the element the learner drags. */
export type DragAttrs = InputTags & {
  tabindex?: number;
  role?: "slider";
  "aria-valuetext"?: string;
  "aria-valuenow"?: number;
  "aria-disabled"?: "true";
  onKeyDown?: (e: JSX.TargetedKeyboardEvent<Element>) => void;
  onPointerDown?: (e: JSX.TargetedPointerEvent<Element>) => void;
};

const argsOf = (axis: DragSpec["axis"], p: Point) =>
  axis === "x" ? { x: p.x } : axis === "y" ? { y: p.y } : { x: p.x, y: p.y };

/**
 * Drags in one view, drawn inside a frame: `const drag = useDrags()`, then `<circle {...drag({ …
 * })} />` (with a key when several drag by one action). The element says which action it does
 * (`says`), so it is described and named like any input.
 */
export function useDrags(): (spec: DragSpec, key?: Key) => DragAttrs {
  const frame = useFrame();
  const door = useDoor();
  // Where each drag last put its part (a move to the same place isn't sent).
  const last = useRef(new Map<string, Point>());

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
  const dragTo = (id: string, spec: DragSpec, to: Point) => {
    const at = spec.place?.(to, shown(spec.inset)) ?? to;
    const was = last.current.get(id);
    if (was !== undefined && was.x === at.x && was.y === at.y) return;
    last.current.set(id, at);
    door.call(nameOf(spec.move), argsOf(spec.axis, at));
  };
  const letGo = (id: string, spec: DragSpec) => {
    const args = argsOf(spec.axis, last.current.get(id) ?? spec.at);
    if (spec.release?.action !== undefined) door.call(nameOf(spec.release.action), args);
    if (spec.release?.signal !== undefined) door.signal(nameOf(spec.release.signal), args);
  };

  return (spec, key) => {
    const tags = says(spec.move, key);
    const id = tags["data-part"];
    if (spec.isOn === false) return { ...tags, "aria-disabled": "true" };
    return {
      ...tags,
      tabindex: 0,
      role: "slider",
      ...(spec.words !== undefined ? { "aria-valuetext": spec.words } : {}),
      "aria-valuenow": spec.axis === "y" ? spec.at.y : spec.at.x,
      onKeyDown: (e) => {
        const alongX = spec.axis !== "y";
        const alongY = spec.axis !== "x";
        const dx = alongX
          ? e.key === "ArrowRight"
            ? spec.step
            : e.key === "ArrowLeft"
              ? -spec.step
              : 0
          : 0;
        const dy = alongY
          ? e.key === "ArrowUp"
            ? spec.step
            : e.key === "ArrowDown"
              ? -spec.step
              : 0
          : 0;
        if (dx === 0 && dy === 0) return;
        e.preventDefault();
        last.current.delete(id);
        dragTo(id, spec, {
          x: Number((spec.at.x + dx).toFixed(10)),
          y: Number((spec.at.y + dy).toFixed(10)),
        });
        letGo(id, spec);
      },
      onPointerDown: (e) => {
        if (frame === null)
          throw new Error(`${id}: a drag is drawn inside a frame (a group's frame layout)`);
        const start = spec.at;
        last.current.set(id, start);
        let first: readonly [number, number] | null = null;
        frame.drag(
          e,
          (p) => {
            if (spec.follow === "finger") return dragTo(id, spec, { x: p[0], y: p[1] });
            if (first === null) first = p;
            dragTo(id, spec, { x: start.x + (p[0] - first[0]), y: start.y + (p[1] - first[1]) });
          },
          () => letGo(id, spec),
        );
      },
    };
  };
}
