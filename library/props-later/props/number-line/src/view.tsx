import { Axis, Stage, type Tick } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import { cssColor } from "@chalk/prop";
import type { JSX } from "preact";
import { useRef, useState } from "preact/hooks";
import { AxisPart } from "./axis";
import { NumberLineAction, NumberLineSignal, type NumberLineState } from "./model";
import {
  AXIS_GAP,
  HEIGHT,
  PAD,
  type View,
  decimalsFor,
  formatValue,
  markerPrecision,
  tickStep,
  ticks,
  valueToX,
  xToValue,
} from "./scale";
import {
  DotsDraw,
  LensDraw,
  MarkerDraw,
  MarksDraw,
  SplitControls,
  SplitCutsDraw,
  SplitStretchDraw,
  ZoomControls,
} from "./view-layers";

/** What a finger on the line is doing: dragging the marker, or sliding the whole line. */
type Drag = { kind: "marker" } | { kind: "pan"; startX: number; startFrom: number };

/** How close (px) a touch must be to the marker to grab it rather than slide the line. */
const MARKER_REACH = 22;

type TickLabel = { value: number; text: string; isEnd: boolean };

/**
 * Tick labels. When full labels would collide, the two ends keep theirs and the ticks between show
 * only the digit this zoom decides (2.66, 2.67 … become 6, 7 …), like the book's magnified pictures.
 */
function tickLabels(values: readonly number[], view: View): TickLabel[] {
  const digits = decimalsFor(tickStep(view.to - view.from));
  const full = values.map((v) => formatValue(v, digits));
  const spacing = values.length > 1 ? (view.width - 2 * PAD) / (values.length - 1) : view.width;
  const charWidth = 7.6;
  const widest = Math.max(...full.map((t) => t.length * charWidth));
  if (widest <= spacing - 4) {
    return values.map((v, i) => ({
      value: v,
      text: full[i] ?? "",
      isEnd: i === 0 || i === values.length - 1,
    }));
  }
  const last = values.length - 1;
  const span = view.to - view.from;
  const isMagnified = Math.abs(span / 10 ** Math.round(Math.log10(span)) - 1) < 1e-6;
  if (!isMagnified) {
    // Crowded, not a magnified tenth: every other label, keeping both ends.
    return values.map((v, i) => {
      const isEnd = i === 0 || i === last;
      const isShown = isEnd || (i % 2 === 0 && i !== last - 1);
      return { value: v, text: isShown ? (full[i] ?? "") : "", isEnd };
    });
  }
  // A magnified tenth: full labels at the ends, the deciding digit between (like the book's
  // magnified pictures), and none where an end label needs the room.
  const endHalf = ((full[0]?.length ?? 1) * 8.4) / 2;
  const isNextToEnd = spacing - endHalf < 8;
  return values.map((v, i) => {
    const isEnd = i === 0 || i === last;
    const text = full[i] ?? "";
    if (isEnd) return { value: v, text, isEnd };
    if (isNextToEnd && (i === 1 || i === last - 1)) return { value: v, text: "", isEnd };
    return { value: v, text: text.slice(-1), isEnd };
  });
}

/** Draws the number line. It never owns state: every touch goes back through `call`. */
export function NumberLineView({ view: props, width, call, signal }: PropViewProps): JSX.Element {
  // The player hands each view its own prop's state, already checked against its schema.
  const s = props as unknown as NumberLineState;
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<Drag | null>(null);
  // Only the hint's visibility lives here: where the line is lives in state, through `call`.
  const [hasPanned, setHasPanned] = useState(false);
  const view: View = { from: s.from, to: s.to, width };
  const digits = markerPrecision(view);
  const y = AXIS_GAP;
  const labels = s.showTicks ? tickLabels(ticks(view), view) : [];
  const x = (v: number) => valueToX(view, v);
  const slack = (view.to - view.from) * 1e-9;

  const valueAt = (clientX: number): number | undefined => {
    const box = svg.current?.getBoundingClientRect();
    if (box === undefined) return undefined;
    const raw = xToValue(view, ((clientX - box.left) / box.width) * width);
    return Number(Math.min(view.to, Math.max(view.from, raw)).toFixed(digits));
  };
  const moveTo = (clientX: number) => {
    const to = valueAt(clientX);
    if (to !== undefined) call(NumberLineAction.MoveMarker, { to });
  };
  const release = () => signal(NumberLineSignal.MarkerReleased, { at: s.marker });

  /** Where a touch lands, in the SVG's own units. */
  const svgX = (clientX: number): number | undefined => {
    const box = svg.current?.getBoundingClientRect();
    return box === undefined ? undefined : ((clientX - box.left) / box.width) * width;
  };
  const isOnMarker = (clientX: number): boolean => {
    const at = svgX(clientX);
    return s.showMarker && at !== undefined && Math.abs(at - x(s.marker)) <= MARKER_REACH;
  };
  const panBy = (clientX: number, from: Drag & { kind: "pan" }) => {
    const box = svg.current?.getBoundingClientRect();
    if (box === undefined) return;
    const unitsPerPx = (width / box.width) * ((view.to - view.from) / (width - 2 * PAD));
    call(NumberLineAction.PanTo, { from: from.startFrom - (clientX - from.startX) * unitsPerPx });
    setHasPanned(true);
  };

  const onPointerDown = (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
    if (s.pan !== null && !isOnMarker(event.clientX)) {
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { kind: "pan", startX: event.clientX, startFrom: s.from };
      return;
    }
    if (!s.showMarker) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { kind: "marker" };
    moveTo(event.clientX);
  };
  const onPointerMove = (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
    const now = drag.current;
    if (now === null || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    if (now.kind === "pan") panBy(event.clientX, now);
    else moveTo(event.clientX);
  };
  const onPointerUp = (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
    const was = drag.current;
    drag.current = null;
    if (was === null || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (was.kind === "pan") signal(NumberLineSignal.Panned, { from: s.from, to: s.to });
    else release();
  };
  const onKeyDown = (event: JSX.TargetedKeyboardEvent<SVGGElement>) => {
    const nudge = 10 ** -digits;
    const delta = event.key === "ArrowRight" ? nudge : event.key === "ArrowLeft" ? -nudge : 0;
    if (delta === 0) return;
    event.preventDefault();
    call(NumberLineAction.MoveMarker, {
      to: Number(Math.min(view.to, Math.max(view.from, s.marker + delta)).toFixed(digits)),
    });
    release();
  };

  const inLens = (v: number) =>
    s.lens !== null && v >= s.lens.from - slack && v <= s.lens.to + slack;
  const axisTicks: Tick[] = labels.map((tick) => {
    const classes = [tick.isEnd ? "is-end" : "", inLens(tick.value) ? "is-in-lens" : ""];
    const extra = classes.filter((c) => c !== "").join(" ");
    const part = `${AxisPart.TickPrefix}${tick.value}`;
    return extra === ""
      ? { value: tick.value, label: tick.text, part }
      : { value: tick.value, label: tick.text, class: extra, part };
  });
  const lowest = formatValue(view.from, digits);
  const highest = formatValue(view.to, digits);
  // Each layer draws itself from its own fields: off, it draws nothing.
  const layer = { s, view, y, call };

  return (
    <div class="nl">
      <Stage
        label={`Number line from ${lowest} to ${highest}`}
        x={[view.from, view.to]}
        width={width}
        height={HEIGHT}
        inset={{ left: PAD, right: PAD }}
        svg={{
          ref: svg,
          class: [
            "nl-svg",
            s.showMarker ? "is-draggable" : "",
            s.pan !== null ? "is-pannable" : "",
          ].join(" "),
          ...(s.pan !== null ? { "data-part": "pan" } : {}),
          onPointerDown,
          onPointerMove,
          onPointerUp,
          onPointerCancel: onPointerUp,
        }}
      >
        <LensDraw {...layer} />
        <SplitStretchDraw {...layer} />
        <g
          data-part={AxisPart.Axis}
          style={s.color === null ? undefined : { "--piece-color": cssColor(s.color) }}
        >
          <Axis y={y} ticks={axisTicks} hasEnds />
        </g>
        <SplitCutsDraw {...layer} />
        <DotsDraw {...layer} />
        <MarksDraw {...layer} />
        <MarkerDraw {...layer} onKeyDown={onKeyDown} />
      </Stage>
      {s.pan !== null && !hasPanned && (
        <div class="nl-swipe" aria-hidden="true">
          <span class="nl-swipe-finger" />
        </div>
      )}
      {(s.isZoomable || (s.isSplittable && s.split !== null)) && (
        <div class="nl-controls">
          <SplitControls {...layer} />
          <ZoomControls {...layer} />
        </div>
      )}
    </div>
  );
}
