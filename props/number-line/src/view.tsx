import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useRef } from "preact/hooks";
import {
  type Mark,
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
  const view: View = { from: s.from, to: s.to, width };
  const digits = markerPrecision(view);
  const y = AXIS_GAP;
  const labels = tickLabels(ticks(view), view);
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
    if (to !== undefined) call("moveMarker", { to });
  };
  const release = () => signal(NumberLineSignal.MarkerReleased, { at: s.marker });

  const onPointerDown = (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
    if (!s.showMarker) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    moveTo(event.clientX);
  };
  const onPointerMove = (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) moveTo(event.clientX);
  };
  const onPointerUp = (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    release();
  };
  const onKeyDown = (event: JSX.TargetedKeyboardEvent<SVGGElement>) => {
    const nudge = 10 ** -digits;
    const delta = event.key === "ArrowRight" ? nudge : event.key === "ArrowLeft" ? -nudge : 0;
    if (delta === 0) return;
    event.preventDefault();
    call("moveMarker", {
      to: Number(Math.min(view.to, Math.max(view.from, s.marker + delta)).toFixed(digits)),
    });
    release();
  };

  const cuts = s.split === null ? [] : splitPoints(s.split);
  const inLens = (v: number) =>
    s.lens !== null && v >= s.lens.from - slack && v <= s.lens.to + slack;
  const hasStepper = s.isSplittable && s.split !== null;
  const lowest = formatValue(view.from, digits);
  const highest = formatValue(view.to, digits);

  return (
    <div class="nl">
      <svg
        ref={svg}
        class={s.showMarker ? "nl-svg is-draggable" : "nl-svg"}
        viewBox={`0 0 ${width} ${HEIGHT}`}
        width="100%"
        role="img"
        aria-label={`Number line from ${lowest} to ${highest}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
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
        <line class="nl-axis" x1={8} y1={y} x2={width - 8} y2={y} />
        <path class="nl-arrow" d={`M 15 ${y - 7} L 7 ${y} L 15 ${y + 7}`} />
        <path
          class="nl-arrow"
          d={`M ${width - 15} ${y - 7} L ${width - 7} ${y} L ${width - 15} ${y + 7}`}
        />
        {labels.map((tick) => (
          <g
            key={tick.value}
            class={inLens(tick.value) ? "nl-tick-group is-in-lens" : "nl-tick-group"}
          >
            <line class="nl-tick" x1={x(tick.value)} y1={y - 8} x2={x(tick.value)} y2={y + 8} />
            <text
              class={tick.isEnd ? "nl-tick-label is-end" : "nl-tick-label"}
              x={x(tick.value)}
              y={y + 30}
              text-anchor="middle"
            >
              {tick.text}
            </text>
          </g>
        ))}
        {cuts.map((cut, i) =>
          isInView(cut) ? (
            <g
              // A cut is its place along the split.
              // biome-ignore lint/suspicious/noArrayIndexKey: see above
              key={i}
              class={i === 0 || i === cuts.length - 1 ? "nl-cut is-end" : "nl-cut"}
              data-part={`${NumberLinePart.SplitPointPrefix}${i}`}
            >
              <line x1={x(cut)} y1={y - 13} x2={x(cut)} y2={y + 13} />
              {i > 0 && i < cuts.length - 1 && <circle cx={x(cut)} cy={y} r={4.5} />}
            </g>
          ) : null,
        )}
        {placed.map((mark) => {
          const labelY = y - 26 - mark.row * LABEL_ROW;
          const half = labelWidth(mark.label) / 2;
          return (
            <g key={mark.label} class="nl-mark">
              <line x1={mark.x} y1={labelY + 5} x2={mark.x} y2={y} />
              <circle cx={mark.x} cy={y} r={5.5} />
              <text
                x={Math.min(width - half, Math.max(half, mark.x))}
                y={labelY}
                text-anchor="middle"
              >
                {mark.label}
              </text>
            </g>
          );
        })}
        {s.showMarker && isInView(s.marker) && (
          <g
            class="nl-marker"
            tabIndex={0}
            role="slider"
            aria-label="Marker"
            aria-valuemin={view.from}
            aria-valuemax={view.to}
            aria-valuenow={s.marker}
            onKeyDown={onKeyDown}
          >
            <circle cx={x(s.marker)} cy={y} r={22} class="nl-marker-hit" />
            <circle cx={x(s.marker)} cy={y} r={11} class="nl-marker-dot" />
          </g>
        )}
      </svg>
      {(s.isZoomable || hasStepper) && (
        <div class="nl-controls">
          {s.split !== null && hasStepper && (
            <div class="nl-stepper" data-part={NumberLinePart.SplitStepper}>
              <button
                type="button"
                class="nl-button"
                aria-label="One part fewer"
                disabled={s.split.parts <= 1}
                onClick={() => call("changeParts", { by: -1 })}
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
                onClick={() => call("changeParts", { by: 1 })}
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
                onClick={() => call("zoomOut")}
              >
                <Magnifier isIn={false} />
              </button>
              <button
                type="button"
                class="nl-button"
                aria-label="Zoom in"
                data-part={NumberLinePart.ZoomIn}
                disabled={view.to - view.from <= 1.01e-8}
                onClick={() => call("zoomIn")}
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
