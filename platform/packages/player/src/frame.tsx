/** @jsxImportSource preact */
import { type Obstacles, type PixelPoint, Stage, placeLabels } from "@chalk/draw";
import { type FramePixels, shows } from "@chalk/prop";
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
 * - `labels`: children hand in their labels; the frame places them all in one pass, off each other
 *   and off the lines children report, so labels from different children never collide.
 */

/** A label a child asks the frame to place, in model coordinates. */
export type FrameLabel = {
  id: string;
  /** The point it names (model units). */
  at: readonly [number, number];
  text: string;
  /** Higher places first, so it gets the best spot. Default 0. */
  priority?: number;
  /** Font size in px (default 13). */
  size?: number;
  /** A direction to try first, degrees on screen (0 right, 90 down). */
  prefer?: number;
  /** A point to push away from (model units). */
  away?: readonly [number, number];
  /** Extra class for its look (e.g. "is-length"). */
  class?: string;
  /** Its name, when the student reads it as a part (it then shows its text, tags.ts). */
  part?: string;
};

type LabelStore = Map<string, { labels: readonly FrameLabel[]; obstacles: Obstacles }>;

export type FrameContextValue = {
  px: FramePixels;
  /** Starts a drag on a pointer-down: calls `move` with model points, `end` on let-go. */
  drag: (
    event: JSX.TargetedPointerEvent<Element>,
    move: (at: readonly [number, number]) => void,
    end?: (at: readonly [number, number]) => void,
  ) => void;
  /** This child's labels and the lines they should keep off (replaces what it gave before). */
  labels: (owner: string, labels: readonly FrameLabel[], obstacles?: Obstacles) => void;
  store: LabelStore;
  /** The child drawing now (set by the frame around each child). */
  owner: string;
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

/** Hands this child's labels to the frame for the one placing pass. */
export function useFrameLabels(labels: readonly FrameLabel[], obstacles: Obstacles = {}): void {
  const frame = useContext(FrameContext);
  frame?.labels(frame.owner, labels, obstacles);
}

/** Draws one picture for a frame and gives its children the frame's services. */
export function FrameStage({
  px,
  label,
  present,
  look,
  children,
}: {
  px: FramePixels;
  label: string;
  /** The children drawn now: labels of any other are dropped (a child left out, or hidden). */
  present: readonly string[];
  /** Extra classes on the picture's SVG. */
  look?: string;
  children: ComponentChildren;
}): JSX.Element {
  const store = useRef<LabelStore>(new Map()).current;
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
  const base: Omit<FrameContextValue, "owner"> = {
    px,
    store,
    labels: (owner, labels, obstacles = {}) => store.set(owner, { labels, obstacles }),
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
    <FrameContext.Provider value={{ ...base, owner: "" }}>
      {children}
      <LabelLayer present={present} />
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
  px,
  children,
}: {
  owner: string;
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
            }
      }
    >
      {children}
    </FrameContext.Provider>
  );
}

/** Places every child's labels together, highest priority first, and draws them. */
function LabelLayer({ present }: { present: readonly string[] }): JSX.Element | null {
  const frame = useContext(FrameContext);
  if (frame === null) return null;
  for (const owner of [...frame.store.keys()])
    if (!present.includes(owner)) frame.store.delete(owner);
  const all = [...frame.store.entries()].flatMap(([owner, { labels }]) =>
    labels.map((l) => ({ ...l, owner })),
  );
  if (all.length === 0) return null;
  const sorted = all.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  const obstacles: Obstacles = {
    segments: [...frame.store.values()].flatMap((v) => v.obstacles.segments ?? []),
    circles: [...frame.store.values()].flatMap((v) => v.obstacles.circles ?? []),
    boxes: [...frame.store.values()].flatMap((v) => v.obstacles.boxes ?? []),
  };
  const toPx = (p: readonly [number, number]): PixelPoint => frame.px.toPx(p[0], p[1]);
  const placed = placeLabels(
    sorted.map((l) => ({
      id: `${l.owner}:${l.id}`,
      at: toPx(l.at),
      text: l.text,
      ...(l.size !== undefined ? { size: l.size } : {}),
      ...(l.prefer !== undefined ? { prefer: l.prefer } : {}),
      ...(l.away !== undefined ? { away: toPx(l.away) } : {}),
    })),
    { width: frame.px.width, height: frame.px.height },
    obstacles,
  );
  return (
    <g class="frame-labels">
      {placed.map((p, i) => {
        const l = sorted[i];
        if (l === undefined) return null;
        // Under its child's name, so a label's part is found as "<child>/<part>".
        return (
          <g key={p.id} data-child={l.owner}>
            <text
              class={`frame-label${l.class ? ` ${l.class}` : ""}`}
              {...(l.part === undefined ? {} : shows(l.part, l.text))}
              x={(p.x + p.width / 2).toFixed(1)}
              y={(p.y + p.height * 0.78).toFixed(1)}
              text-anchor="middle"
              font-size={l.size ?? 13}
            >
              {l.text}
            </text>
          </g>
        );
      })}
    </g>
  );
}
