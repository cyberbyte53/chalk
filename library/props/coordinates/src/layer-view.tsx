import type { Locale } from "@chalk/content";
import { type PropViewProps, useFrame } from "@chalk/player";
import { type FramePixels, says } from "@chalk/prop";
import type { JSX } from "preact";
import { coordinatePlane } from "./coordinate-plane";
import { isInWindow } from "./plane";
import type { PlaneView } from "./plane-view";

/**
 * What every layer's view draws with (view.tsx composes them). A layer's drawing lives in its own
 * file, next to its logic (walker.ts, walker-view.tsx), and fills the slots it uses:
 *
 * - above: lines over the plane (the address, a caption, the table to plot);
 * - under: the picture's back, under the lines and numbers (where a hidden point could be);
 * - picture: on the lines (the places, the walker);
 * - over: on top of everything (plotted dots, a hidden dot, counters, the point read);
 * - lines: lines under the plane (where the walker is, the next pair, the dice);
 * - controls: its buttons.
 *
 * Whether a layer is drawn is its own rule (the layer's isOn), not worked out again here.
 */
export type LayerViewProps = {
  s: PlaneView;
  px: FramePixels;
  call: PropViewProps<typeof coordinatePlane>["call"];
  locale: Locale;
};

type Slot = (p: LayerViewProps) => JSX.Element | null;

export type LayerView = {
  isOn: (s: PlaneView) => boolean;
  above?: Slot;
  under?: Slot;
  picture?: Slot;
  over?: Slot;
  lines?: Slot;
  controls?: Slot;
};

export const actions = coordinatePlane.actions;
/** A tap that plots lands on the nearest quarter: the book's pairs go to 1.25. */
export const PLOT_STEP = 0.25;

/** A tap anywhere on the plane: plots the next pair, or hides the learner's own point. */
export function PlaneTap({
  s,
  px,
  call,
}: {
  s: PlaneView;
  px: FramePixels;
  call: PropViewProps<typeof coordinatePlane>["call"];
}): JSX.Element | null {
  const frame = useFrame();
  const isPlotting = s.toPlot.length > 0 && s.plotted.length < s.toPlot.length;
  const isHiding = !isPlotting && s.canHide && s.clueChoices.length > 0;
  if (!isPlotting && !isHiding) return null;
  const w = s.window;
  const [x0, y0] = px.toPx(w.xMin, w.yMax);
  const [x1, y1] = px.toPx(w.xMax, w.yMin);
  const snap = (v: number, step: number) => Number((Math.round(v / step) * step).toFixed(6));
  return (
    <rect
      class="cp-plane-tap"
      {...says(isPlotting ? actions.plotAt : actions.hideAt)}
      x={x0}
      y={y0}
      width={x1 - x0}
      height={y1 - y0}
      onPointerDown={(e) =>
        frame?.drag(
          e,
          () => {},
          ([x, y]) => {
            const step = isPlotting ? PLOT_STEP : 1;
            const at = { x: snap(x, step), y: snap(y, step) };
            if (!isInWindow(w, at)) return;
            if (isPlotting) call(actions.plotAt, at);
            else call(actions.hideAt, at);
          },
        )
      }
    />
  );
}
