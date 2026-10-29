/** @jsxImportSource preact */
import { type ScaleLinear, scaleLinear } from "d3-scale";
import { type ComponentChildren, type JSX, type Ref, createContext } from "preact";
import { createPortal } from "preact/compat";
import { useContext, useMemo, useState } from "preact/hooks";

/** Room kept clear at each edge of a stage, in px. */
export type Inset = { left: number; right: number; top: number; bottom: number };

/**
 * The space pieces draw in: d3 scales from the maths (a number, a metre) to pixels, the stage's
 * size, and the layer above the SVG where crowds are painted.
 */
export type Space = {
  x: ScaleLinear<number, number>;
  /** Null for a one-dimensional stage (a number line): pieces then take `y` in px. */
  y: ScaleLinear<number, number> | null;
  width: number;
  height: number;
  overlay: HTMLDivElement | null;
  /** An SVG above the crowds, for the few things that must sit on top of them. */
  top: SVGSVGElement | null;
};

const SpaceContext = createContext<Space | null>(null);

/** The space of the stage a piece is in. */
export function useSpace(): Space {
  const space = useContext(SpaceContext);
  if (space === null) throw new Error("A drawing piece must sit inside a <Stage>");
  return space;
}

/** A point in the space: x in its units; y in its units, or in px on a one-dimensional stage. */
export function toPixels(space: Space, x: number, y: number): [number, number] {
  return [space.x(x), space.y === null ? y : space.y(y)];
}

export type StageProps = {
  /** What the drawing shows, for a screen reader ("Number line from 0 to 1"). */
  label: string;
  /** The stretch of numbers across the stage, left to right. */
  x: readonly [number, number];
  /** The stretch up the stage, bottom to top; leave out for a one-dimensional stage. */
  y?: readonly [number, number];
  width: number;
  height: number;
  inset?: Partial<Inset>;
  /** Anything else the SVG needs (class, label, pointer handlers, ref). */
  svg?: Omit<
    JSX.SVGAttributes<SVGSVGElement>,
    "ref" | "viewBox" | "width" | "height" | "role" | "aria-label"
  > & {
    ref?: Ref<SVGSVGElement>;
  };
  children?: ComponentChildren;
};

/**
 * A drawing: an SVG the pieces draw into, and a layer above it for crowds. Its scales are made
 * once per range and size, so pieces that only depend on them never redraw while others move.
 */
export function Stage({
  label,
  x,
  y,
  width,
  height,
  inset,
  svg,
  children,
}: StageProps): JSX.Element {
  const [overlay, setOverlay] = useState<HTMLDivElement | null>(null);
  const [topLayer, setTopLayer] = useState<SVGSVGElement | null>(null);
  const left = inset?.left ?? 0;
  const right = inset?.right ?? 0;
  const top = inset?.top ?? 0;
  const bottom = inset?.bottom ?? 0;
  const [x0, x1] = x;
  const y0 = y?.[0];
  const y1 = y?.[1];
  const space = useMemo<Space>(
    () => ({
      x: scaleLinear()
        .domain([x0, x1])
        .range([left, width - right]),
      y:
        y0 === undefined || y1 === undefined
          ? null
          : scaleLinear()
              .domain([y0, y1])
              .range([height - bottom, top]),
      width,
      height,
      overlay,
      top: topLayer,
    }),
    [x0, x1, y0, y1, width, height, left, right, top, bottom, overlay, topLayer],
  );
  const { ref, ...rest } = svg ?? {};
  return (
    <div class="draw-stage">
      <svg
        ref={ref}
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        role="img"
        aria-label={label}
        {...rest}
      >
        <SpaceContext.Provider value={space}>{children}</SpaceContext.Provider>
      </svg>
      <div class="draw-overlay" ref={setOverlay} />
      <svg
        class="draw-top"
        ref={setTopLayer}
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden="true"
      />
    </div>
  );
}

/** Draws its pieces above any crowd on the stage (the one particle to follow among thousands). */
export function OnTop({ children }: { children?: ComponentChildren }): JSX.Element | null {
  const space = useSpace();
  if (space.top === null) return null;
  return createPortal(
    <SpaceContext.Provider value={space}>{children}</SpaceContext.Provider>,
    space.top,
  );
}

/**
 * The same stretch of screen measuring different numbers: pieces inside place themselves on this
 * range instead (a magnified tenth drawn under the line it came from).
 */
export function Range({
  x,
  children,
}: {
  x: readonly [number, number];
  children?: ComponentChildren;
}): JSX.Element {
  const space = useSpace();
  const [x0, x1] = x;
  const inner = useMemo<Space>(
    () => ({ ...space, x: space.x.copy().domain([x0, x1]) }),
    [space, x0, x1],
  );
  return <SpaceContext.Provider value={inner}>{children}</SpaceContext.Provider>;
}
