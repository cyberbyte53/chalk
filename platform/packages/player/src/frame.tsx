/** @jsxImportSource preact */
import { Stage } from "@chalk/draw";
import type { FramePixels } from "@chalk/prop";
import { type ComponentChildren, type JSX, createContext } from "preact";
import { useContext, useLayoutEffect, useRef } from "preact/hooks";

/**
 * Frames: several props drawing into one picture (plans/props-composition.md § 5). The frame's
 * provider (graph paper, an optical bench, an axis) owns the window; the group's view draws one
 * SVG at the provider's size and gives every child in it this context:
 *
 * - `px`: the provider's transform (model ↔ pixels), the only way children place things;
 * - `drag`: a drag measured against the transform as it was when the drag began, so a window that
 *   refits while dragging (optics) doesn't fight the finger; the part under the finger takes the
 *   pointer (the browser's hit test is the arbiter, topmost first) and keeps it until let go;
 *
 * Labels are not the frame's: a child draws its own words and places them with `useLabel`
 * (@chalk/draw), which places every label in the picture together, whichever child drew it.
 */

export type FrameContextValue = {
  px: FramePixels;
  /** Starts a drag on a pointer-down: calls `move` with model points, `end` on let-go. */
  drag: (
    event: JSX.TargetedPointerEvent<Element>,
    move: (at: readonly [number, number]) => void,
    end?: (at: readonly [number, number]) => void,
  ) => void;
  /** The child drawing now (set by the frame around each child). */
  owner: string;
  /** Its drawing now: the child, or the child in one place (a child may draw in several). */
  key: string;
};

const FrameContext = createContext<FrameContextValue | null>(null);

/** The property a frame's picture carries its map under (see `frameMapOf`). */
export const FRAME_MAP = "__chalkFrame";
/** A frame's map as its picture carries it: model units to the picture's own pixels. */
export type FrameMap = {
  toPx: (x: number, y: number) => readonly [number, number];
  width: number;
  height: number;
};

/** The frame a prop is drawing in, or null when it is drawn on its own. */
export function useFrame(): FrameContextValue | null {
  return useContext(FrameContext);
}

/** Draws one picture for a frame and gives its children the frame's services. */
export function FrameStage({
  px,
  label,
  look,
  children,
}: {
  px: FramePixels;
  label: string;
  /** Extra classes on the picture's SVG. */
  look?: string;
  children: ComponentChildren;
}): JSX.Element {
  const svg = useRef<SVGSVGElement>(null);
  // The frame's map, on its own element: a tool outside the app (the chalk MCP's play) aims a tap
  // or a drag at a point in the prop's units ("put P at (−4, 2)") by asking the picture where it is.
  useLayoutEffect(() => {
    const el = svg.current as (SVGSVGElement & { [FRAME_MAP]?: FrameMap }) | null;
    if (el === null) return;
    el[FRAME_MAP] = { toPx: (x, y) => px.toPx(x, y), width: px.width, height: px.height };
    el.setAttribute("data-frame", "");
  }, [px]);
  const toModel = (clientX: number, clientY: number, at: FramePixels) => {
    const box = svg.current?.getBoundingClientRect();
    if (box === undefined || box.width === 0) return at.fromPx(0, 0);
    const x = ((clientX - box.left) / box.width) * at.width;
    const y = ((clientY - box.top) / box.height) * at.height;
    return at.fromPx(x, y);
  };
  const base: Omit<FrameContextValue, "owner" | "key"> = {
    px,
    drag: (event, move, end) => {
      const target = event.currentTarget as Element;
      // The transform as it is now: a window that refits during the drag doesn't move the finger.
      const frozen = px;
      target.setPointerCapture?.(event.pointerId);
      event.stopPropagation();
      move(toModel(event.clientX, event.clientY, frozen));
      const onMove = (e: PointerEvent) => move(toModel(e.clientX, e.clientY, frozen));
      const onUp = (e: PointerEvent) => {
        target.removeEventListener("pointermove", onMove as EventListener);
        target.removeEventListener("pointerup", onUp as EventListener);
        target.removeEventListener("pointercancel", onUp as EventListener);
        end?.(toModel(e.clientX, e.clientY, frozen));
      };
      target.addEventListener("pointermove", onMove as EventListener);
      target.addEventListener("pointerup", onUp as EventListener);
      target.addEventListener("pointercancel", onUp as EventListener);
    },
  };
  const inside = (
    <FrameContext.Provider value={{ ...base, owner: "", key: "" }}>
      {children}
    </FrameContext.Provider>
  );
  const svgClass = `frame-svg${look ? ` ${look}` : ""}`;
  // A linear frame is also a drawing stage: grids and kit pieces take its scales.
  if (px.domain !== undefined)
    return (
      <Stage
        label={label}
        x={px.domain.x}
        {...(px.domain.y !== undefined ? { y: px.domain.y } : {})}
        width={px.width}
        height={px.height}
        svg={{ ref: svg, class: svgClass, style: { touchAction: "none" } }}
      >
        {inside}
      </Stage>
    );
  return (
    <svg
      ref={svg}
      class={svgClass}
      viewBox={`0 0 ${px.width} ${px.height}`}
      width="100%"
      role="img"
      aria-label={label}
      style={{ touchAction: "none" }}
    >
      {inside}
    </svg>
  );
}

/** Draws one child inside the frame, with the frame's services named for it. */
export function InFrame({
  owner,
  slot,
  px,
  children,
}: {
  owner: string;
  /** Which of the child's drawings this is, when it draws in several places. */
  slot?: string;
  px: FramePixels;
  children: ComponentChildren;
}): JSX.Element {
  const parent = useContext(FrameContext);
  return (
    <FrameContext.Provider
      value={
        parent === null
          ? null
          : {
              ...parent,
              px,
              owner,
              key: slot ?? owner,
            }
      }
    >
      {children}
    </FrameContext.Provider>
  );
}
