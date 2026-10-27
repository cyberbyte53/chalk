import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { ComponentChildren, JSX } from "preact";
import { useRef } from "preact/hooks";
import { Grid } from "./grid";
import {
  type GridState,
  GuidePart,
  type GuideState,
  HandleAction,
  HandlePart,
  type HandleState,
  type PlaneState,
  PlottedPart,
  type PlottedState,
  planePixels,
} from "./plane";

/**
 * The plane's drawing. `PlaneStage` is the core (stage, grid, axes); each layer has its own piece,
 * drawn inside it. Other packages' plane hosts (coordinatePlane) draw the same stage and add theirs.
 */

const f = (n: number) => n.toFixed(1);

export type PlaneLayerProps<S> = {
  s: S;
  at: ReturnType<typeof planePixels>;
  call: (action: string, args?: Record<string, unknown>) => void;
};

export function PlaneStage({
  s,
  width,
  label,
  svg,
  children,
}: {
  s: GridState;
  width: number;
  label: string;
  svg?: Parameters<typeof Stage>[0]["svg"];
  children?: ComponentChildren;
}): JSX.Element {
  const at = planePixels(s, width);
  return (
    <Stage label={label} x={at.frame.x} y={at.frame.y} width={width} height={at.height} svg={svg}>
      <g data-part="plane">
        <Grid
          win={s.window}
          names={s.axisNames}
          quadrants={s.showQuadrants}
          lineGap={s.isEqualUnits ? 0 : 8}
        />
      </g>
      {children}
    </Stage>
  );
}

export function PlottedDraw({ s, at }: PlaneLayerProps<PlottedState>): JSX.Element | null {
  const shown = s.plotted.filter(
    (p) => p.x >= at.xMin && p.x <= at.xMax && p.y >= at.yMin && p.y <= at.yMax,
  );
  if (shown.length === 0) return null;
  return (
    <g data-part={PlottedPart.Dots}>
      {shown.map((p) => {
        const [x, y] = at.toPx(p.x, p.y);
        return (
          <circle
            key={`${p.x},${p.y}`}
            class={`bk-dot is-${p.tone}${p.isFaded ? " is-faded" : ""}`}
            cx={f(x)}
            cy={f(y)}
            r={6}
          />
        );
      })}
    </g>
  );
}

export function GuideDraw({ s, at }: PlaneLayerProps<GuideState>): JSX.Element | null {
  if (s.guide === null) return null;
  const top = Math.min(at.yMax, Math.max(at.yMin, s.guide.y));
  const [x1, y1] = at.toPx(s.guide.x, 0);
  const [x2, y2] = at.toPx(s.guide.x, top);
  return (
    <line
      class="bk-guide"
      data-part={GuidePart.Guide}
      x1={f(x1)}
      y1={f(y1)}
      x2={f(x2)}
      y2={f(y2)}
    />
  );
}

export function HandleDraw({ s, at, call }: PlaneLayerProps<HandleState>): JSX.Element | null {
  if (s.handle === null) return null;
  const { x, step, label } = s.handle;
  const [px, py] = at.toPx(x, 0);
  const y = Math.min(at.height, Math.max(0, py));
  return (
    <g
      class="bk-handle"
      data-part={HandlePart.Handle}
      tabIndex={0}
      role="slider"
      aria-label={s.axisNames[0]}
      aria-valuemin={at.xMin}
      aria-valuemax={at.xMax}
      aria-valuenow={x}
      aria-valuetext={`${s.axisNames[0]} = ${label}`}
      transform={`translate(${f(px)} ${f(y)})`}
      onKeyDown={(e) => {
        const by = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        if (by === 0) return;
        e.preventDefault();
        call(HandleAction.PutHandle, { x: Number((x + by).toFixed(10)) });
      }}
    >
      <circle class="bk-handle-ring" r={11} />
      <text class="bk-handle-label" y={30} text-anchor="middle">
        {label}
      </text>
    </g>
  );
}

/**
 * Turns touches on the plane into the handle's actions: touching anywhere moves the handle to that
 * x, dragging slides it, letting go puts it down. Off when there is no handle.
 */
export function useDial(
  s: HandleState,
  width: number,
  call: PlaneLayerProps<HandleState>["call"],
): Pick<JSX.SVGAttributes<SVGSVGElement>, "onPointerDown" | "onPointerMove" | "onPointerUp"> {
  const held = useRef(false);
  if (s.handle === null) return {};
  const at = planePixels(s, width);
  const xAt = (e: PointerEvent) => {
    const box = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * width;
    const [fx0, fx1] = at.frame.x;
    return fx0 + (px / width) * (fx1 - fx0);
  };
  return {
    onPointerDown: (e) => {
      held.current = true;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      call(HandleAction.MoveHandle, { x: xAt(e) });
    },
    onPointerMove: (e) => {
      if (held.current) call(HandleAction.MoveHandle, { x: xAt(e) });
    },
    onPointerUp: (e) => {
      if (!held.current) return;
      held.current = false;
      call(HandleAction.PutHandle, { x: xAt(e) });
    },
  };
}

/** The plane on its own: graph paper, then the drop line, the dots and the handle. */
export function PlaneView({ view, width, call }: PropViewProps): JSX.Element {
  const s = view as unknown as PlaneState;
  const at = planePixels(s, width);
  const layer = { s, at, call };
  const dial = useDial(s, width, call);
  return (
    <div class="bk-plane">
      <PlaneStage
        s={s}
        width={width}
        label={`Graph paper from ${at.xMin} to ${at.xMax} across, ${at.yMin} to ${at.yMax} up`}
        svg={{ class: `bk-plane-svg${s.handle === null ? "" : " is-dial"}`, ...dial }}
      >
        <GuideDraw {...layer} />
        <PlottedDraw {...layer} />
        <HandleDraw {...layer} />
      </PlaneStage>
    </div>
  );
}
