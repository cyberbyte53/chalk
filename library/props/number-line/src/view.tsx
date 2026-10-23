import { Axis, Dots, Mark as MarkPiece, Stage, type Tick } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import { cssColor } from "@chalk/prop";
import type { JSX } from "preact";
import { useRef, useState } from "preact/hooks";
import {
  type Mark,
  NumberLineAction,
  NumberLinePart,
  NumberLineSignal,
  type NumberLineState,
  splitPoints,
} from "./model";
import {
  AXIS_GAP,
  HEIGHT,
  LABEL_ROW,
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

/** What a finger on the line is doing: dragging the marker, or sliding the whole line. */
type Drag = { kind: "marker" } | { kind: "pan"; startX: number; startFrom: number };

/** How close (px) a touch must be to the marker to grab it rather than slide the line. */
const MARKER_REACH = 22;

/** Rough width of a label in px (display font, 16 px). */
function labelWidth(text: string): number {
  return [...text].length * 9.5 + 10;
}

type PlacedMark = Mark & { x: number; row: number };

/** Puts mark labels in rows above the line so none overlap: same or nearby points stack upwards. */
function placeLabels(marks: readonly Mark[], view: View): PlacedMark[] {
  const rows: { left: number; right: number }[][] = [];
  const slack = (view.to - view.from) * 1e-9;
  const inView = marks
    .filter((m) => m.at >= view.from - slack && m.at <= view.to + slack)
    .map((m) => ({ ...m, x: valueToX(view, m.at) }))
    .sort((a, b) => a.x - b.x);
  return inView.map((mark) => {
    const half = labelWidth(mark.label) / 2;
    const left = Math.max(0, mark.x - half);
    const right = Math.min(view.width, mark.x + half);
    let row = 0;
    while (rows[row]?.some((r) => left < r.right + 4 && right > r.left - 4)) row++;
    if (rows[row] === undefined) rows[row] = [];
    rows[row]?.push({ left, right });
    return { ...mark, row: Math.min(row, 2) };
  });
}

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
  const placed = placeLabels(s.marks, view);
  const x = (v: number) => valueToX(view, v);
  const clampX = (v: number) => Math.min(width - PAD + 10, Math.max(PAD - 10, x(v)));
  const slack = (view.to - view.from) * 1e-9;
  const isInView = (v: number) => v >= view.from - slack && v <= view.to + slack;

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

  const cuts = s.split === null ? [] : splitPoints(s.split);
  const inLens = (v: number) =>
    s.lens !== null && v >= s.lens.from - slack && v <= s.lens.to + slack;
  const hasStepper = s.isSplittable && s.split !== null;
  const axisTicks: Tick[] = labels.map((tick) => {
    const classes = [tick.isEnd ? "is-end" : "", inLens(tick.value) ? "is-in-lens" : ""];
    const extra = classes.filter((c) => c !== "").join(" ");
    return extra === ""
      ? { value: tick.value, label: tick.text }
      : { value: tick.value, label: tick.text, class: extra };
  });
  const shownDots = s.dots.filter((dot) => isInView(dot.at));
  const dotPoints = shownDots.flatMap((dot) => [dot.at, y]);
  const dotColors = shownDots.map((dot) => dot.color);
  const lowest = formatValue(view.from, digits);
  const highest = formatValue(view.to, digits);

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
          onPointerDown,
          onPointerMove,
          onPointerUp,
          onPointerCancel: onPointerUp,
        }}
      >
        {s.lens !== null && (
          <rect
            class="nl-lens"
            x={x(s.lens.from)}
            y={y - 22}
            width={Math.max(4, x(s.lens.to) - x(s.lens.from))}
            height={44}
            rx={6}
          />
        )}
        {s.split !== null && (
          <line class="nl-split" x1={clampX(s.split.from)} y1={y} x2={clampX(s.split.to)} y2={y} />
        )}
        <g style={s.color === null ? undefined : { "--piece-color": cssColor(s.color) }}>
          <Axis y={y} ticks={axisTicks} hasEnds />
        </g>
        {cuts.map((cut, i) =>
          isInView(cut) ? (
            <g
              // A cut is its place along the split.
              // biome-ignore lint/suspicious/noArrayIndexKey: see above
              key={i}
              class={i === 0 || i === cuts.length - 1 ? "nl-cut is-end" : "nl-cut"}
              data-part={`${NumberLinePart.SplitPointPrefix}${i}`}
              transform={`translate(${x(cut)} ${y})`}
            >
              <line y1={-13} y2={13} />
              {i > 0 && i < cuts.length - 1 && <circle r={4.5} />}
            </g>
          ) : null,
        )}
        <Dots points={dotPoints} colors={dotColors} r={5} class="nl-dot" />
        {placed.map((mark) => {
          const half = labelWidth(mark.label) / 2;
          return (
            <MarkPiece
              key={mark.label}
              at={mark.at}
              y={y}
              label={mark.label}
              row={mark.row}
              labelX={Math.min(width - half, Math.max(half, mark.x))}
              color={mark.color}
            />
          );
        })}
        {s.showMarker && isInView(s.marker) && (
          <g
            class="nl-marker"
            transform={`translate(${x(s.marker)} ${y})`}
            tabIndex={0}
            role="slider"
            aria-label="Marker"
            aria-valuemin={view.from}
            aria-valuemax={view.to}
            aria-valuenow={s.marker}
            onKeyDown={onKeyDown}
          >
            <circle r={22} class="nl-marker-hit" />
            <circle r={11} class="nl-marker-dot" />
          </g>
        )}
      </Stage>
      {s.pan !== null && !hasPanned && (
        <div class="nl-swipe" aria-hidden="true">
          <span class="nl-swipe-finger" />
        </div>
      )}
      {(s.isZoomable || hasStepper) && (
        <div class="nl-controls">
          {s.split !== null && hasStepper && (
            <div class="nl-stepper" data-part={NumberLinePart.SplitStepper}>
              <button
                type="button"
                class="nl-button"
                aria-label="One part fewer"
                disabled={s.split.parts <= 1}
                onClick={() => call(NumberLineAction.ChangeParts, { by: -1 })}
              >
                −
              </button>
              <span class="nl-parts" aria-live="polite">
                {s.split.parts}
              </span>
              <button
                type="button"
                class="nl-button"
                aria-label="One part more"
                onClick={() => call(NumberLineAction.ChangeParts, { by: 1 })}
              >
                +
              </button>
            </div>
          )}
          {s.isZoomable && (
            <div class="nl-zoom">
              <button
                type="button"
                class="nl-button"
                aria-label="Zoom out"
                data-part={NumberLinePart.ZoomOut}
                disabled={view.to - view.from >= 19.99}
                onClick={() => call(NumberLineAction.ZoomOut)}
              >
                <Magnifier isIn={false} />
              </button>
              <button
                type="button"
                class="nl-button"
                aria-label="Zoom in"
                data-part={NumberLinePart.ZoomIn}
                disabled={view.to - view.from <= 1.01e-8}
                onClick={() => call(NumberLineAction.ZoomIn)}
              >
                <Magnifier isIn={true} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Magnifier({ isIn }: { isIn: boolean }): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" class="nl-magnifier">
      <circle cx="10" cy="10" r="6.5" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="7" y1="10" x2="13" y2="10" />
      {isIn && <line x1="10" y1="7" x2="10" y2="13" />}
    </svg>
  );
}
