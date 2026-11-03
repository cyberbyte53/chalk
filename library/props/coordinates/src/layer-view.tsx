import type { Locale } from "@chalk/content";
import { type PartDrawing, type PropView, type PropViewProps, useFrame } from "@chalk/player";
import { type FramePixels, says } from "@chalk/prop";
import type { ActionDef, AnyProp } from "@chalk/prop";
import type { JSX } from "preact";
import { type PlaneWindow, isInWindow } from "./plane";

/**
 * What every part of the coordinate plane draws with. A part's drawing lives in its own file,
 * next to its logic (walker.ts, walker-view.tsx), and fills the places it uses (the group orders
 * them, coordinate-plane.ts):
 *
 * - above: lines over the plane (the address, a caption, the table to plot);
 * - back: the picture's back, under the lines and numbers (where a hidden point could be);
 * - on: on the lines (the places, the walker);
 * - front: on top of everything (plotted dots, a hidden dot, counters, the point read);
 * - below: lines under the plane (where the walker is, the next pair, the dice);
 * - controls: its buttons.
 *
 * Whether a part is drawn at all is the group's `show`, not worked out again here.
 */
type Def = AnyProp;
export type SlotProps<P extends Def> = {
  s: PropView<P>;
  call: PropViewProps<P>["call"];
  locale: Locale;
};
/** In the picture, also the frame's map from the plane's units to pixels. */
export type PictureProps<P extends Def> = SlotProps<P> & { px: FramePixels };

type Slot<Q> = (p: Q) => JSX.Element | null;
type Slots<P extends Def> = {
  above?: Slot<SlotProps<P>>;
  back?: Slot<PictureProps<P>>;
  on?: Slot<PictureProps<P>>;
  front?: Slot<PictureProps<P>>;
  below?: Slot<SlotProps<P>>;
  controls?: Slot<SlotProps<P>>;
};

const PICTURE = new Set(["back", "on", "front"]);

/** A part's drawing in each of its places, from functions of its own view. */
export function drawing<P extends Def>(_def: P, slots: Slots<P>): PartDrawing {
  const out: Record<string, (p: PropViewProps) => JSX.Element | null> = {};
  for (const [place, draw] of Object.entries(slots) as [string, Slot<PictureProps<P>>][]) {
    out[place] = function Part({ view, call, locale }: PropViewProps) {
      const px = useFrame()?.px;
      // Inside the picture a part draws through the frame; there is none when drawn alone.
      if (PICTURE.has(place) && px === undefined) return null;
      return draw({
        s: view as PropView<P>,
        call: call as never,
        locale,
        px: px as FramePixels,
      });
    };
  }
  return out as PartDrawing;
}

/**
 * A tap anywhere on the plane, snapped to `step`, doing `action` there: the next pair plotted, the
 * learner's own hidden point.
 */
export function PlaneTap({
  window: w,
  px,
  step,
  action,
  call,
}: {
  window: PlaneWindow;
  px: FramePixels;
  step: number;
  action: ActionDef<{ x: number; y: number }>;
  call: (action: ActionDef<{ x: number; y: number }>, at: { x: number; y: number }) => void;
}): JSX.Element {
  const frame = useFrame();
  const [x0, y0] = px.toPx(w.xMin, w.yMax);
  const [x1, y1] = px.toPx(w.xMax, w.yMin);
  const snap = (v: number) => Number((Math.round(v / step) * step).toFixed(6));
  return (
    <rect
      class="cp-plane-tap"
      data-coverable
      {...says(action)}
      x={x0}
      y={y0}
      width={x1 - x0}
      height={y1 - y0}
      onPointerDown={(e) =>
        frame?.drag(
          e,
          () => {},
          ([x, y]) => {
            const at = { x: snap(x), y: snap(y) };
            if (isInWindow(w, at)) call(action, at);
          },
        )
      }
    />
  );
}
