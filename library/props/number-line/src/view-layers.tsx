import { Dots, Mark as MarkPiece } from "@chalk/draw";
import type { JSX } from "preact";
import { DotsPart, MarkerPart, SplitAction, SplitPart, ZoomAction, ZoomPart } from "./layers";
import type { Mark, NumberLineState } from "./model";
import { splitPoints } from "./model";
import { PAD, type View, valueToX } from "./scale";

/**
 * Each layer's drawing: inside the stage (`…Draw`) or in the controls row under it (`…Controls`).
 * The host view (view.tsx) draws the axis and calls these in order; each draws only what its
 * layer's fields say, so a layer left at its defaults draws nothing.
 */

export type LayerProps = {
  s: NumberLineState;
  view: View;
  /** Where the axis runs, px from the top. */
  y: number;
  call: (action: string, args?: Record<string, unknown>) => void;
};

const x = (view: View, v: number) => valueToX(view, v);
const isInView = (view: View, v: number) => {
  const slack = (view.to - view.from) * 1e-9;
  return v >= view.from - slack && v <= view.to + slack;
};

/** The lens: the tenth picked out to be magnified next (the axis core's). */
export function LensDraw({ s, view, y }: LayerProps): JSX.Element | null {
  if (s.lens === null) return null;
  return (
    <rect
      class="nl-lens"
      data-part="lens"
      x={x(view, s.lens.from)}
      y={y - 22}
      width={Math.max(4, x(view, s.lens.to) - x(view, s.lens.from))}
      height={44}
      rx={6}
    />
  );
}

/** The split's stretch, drawn under the axis. */
export function SplitStretchDraw({ s, view, y }: LayerProps): JSX.Element | null {
  if (s.split === null) return null;
  const clampX = (v: number) => Math.min(view.width - PAD + 10, Math.max(PAD - 10, x(view, v)));
  return (
    <line
      class="nl-split"
      data-part={SplitPart.Split}
      x1={clampX(s.split.from)}
      y1={y}
      x2={clampX(s.split.to)}
      y2={y}
    />
  );
}

/** The split's cuts, drawn over the axis. */
export function SplitCutsDraw({ s, view, y }: LayerProps): JSX.Element | null {
  if (s.split === null) return null;
  const cuts = splitPoints(s.split);
  return (
    <g>
      {cuts.map((cut, i) =>
        isInView(view, cut) ? (
          <g
            // A cut is its place along the split.
            // biome-ignore lint/suspicious/noArrayIndexKey: see above
            key={i}
            class={i === 0 || i === cuts.length - 1 ? "nl-cut is-end" : "nl-cut"}
            data-part={`${SplitPart.SplitPointPrefix}${i}`}
            transform={`translate(${x(view, cut)} ${y})`}
          >
            <line y1={-13} y2={13} />
            {i > 0 && i < cuts.length - 1 && <circle r={4.5} />}
          </g>
        ) : null,
      )}
    </g>
  );
}

export function DotsDraw({ s, view, y }: LayerProps): JSX.Element | null {
  const shown = s.dots.filter((dot) => isInView(view, dot.at));
  if (shown.length === 0) return null;
  return (
    <g data-part={DotsPart.Dots}>
      <Dots
        points={shown.flatMap((dot) => [dot.at, y])}
        colors={shown.map((dot) => dot.color)}
        r={5}
        class="nl-dot"
      />
    </g>
  );
}

/** Rough width of a label in px (display font, 16 px). */
function labelWidth(text: string): number {
  return [...text].length * 9.5 + 10;
}

type PlacedMark = Mark & { x: number; row: number };

/** Puts mark labels in rows above the line so none overlap: same or nearby points stack upwards. */
function placeLabels(marks: readonly Mark[], view: View): PlacedMark[] {
  const rows: { left: number; right: number }[][] = [];
  return marks
    .filter((m) => isInView(view, m.at))
    .map((m) => ({ ...m, x: x(view, m.at) }))
    .sort((a, b) => a.x - b.x)
    .map((mark) => {
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

export function MarksDraw({ s, view, y }: LayerProps): JSX.Element | null {
  const placed = placeLabels(s.marks, view);
  if (placed.length === 0) return null;
  return (
    <g>
      {placed.map((mark) => {
        const half = labelWidth(mark.label) / 2;
        return (
          <MarkPiece
            key={mark.label}
            part={`mark:${mark.label}`}
            at={mark.at}
            y={y}
            label={mark.label}
            row={mark.row}
            labelX={Math.min(view.width - half, Math.max(half, mark.x))}
            color={mark.color}
          />
        );
      })}
    </g>
  );
}

export function MarkerDraw({
  s,
  view,
  y,
  onKeyDown,
}: LayerProps & {
  onKeyDown: (event: JSX.TargetedKeyboardEvent<SVGGElement>) => void;
}): JSX.Element | null {
  if (!s.showMarker || !isInView(view, s.marker)) return null;
  return (
    <g
      class="nl-marker"
      data-part={MarkerPart.Marker}
      transform={`translate(${x(view, s.marker)} ${y})`}
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
  );
}

export function SplitControls({ s, call }: LayerProps): JSX.Element | null {
  if (!s.isSplittable || s.split === null) return null;
  return (
    <div class="nl-stepper" data-part={SplitPart.SplitStepper}>
      <button
        type="button"
        class="nl-button"
        aria-label="One part fewer"
        disabled={s.split.parts <= 1}
        onClick={() => call(SplitAction.ChangeParts, { by: -1 })}
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
        onClick={() => call(SplitAction.ChangeParts, { by: 1 })}
      >
        +
      </button>
    </div>
  );
}

export function ZoomControls({ s, view, call }: LayerProps): JSX.Element | null {
  if (!s.isZoomable) return null;
  return (
    <div class="nl-zoom">
      <button
        type="button"
        class="nl-button"
        aria-label="Zoom out"
        data-part={ZoomPart.ZoomOut}
        disabled={view.to - view.from >= 19.99}
        onClick={() => call(ZoomAction.ZoomOut)}
      >
        <Magnifier isIn={false} />
      </button>
      <button
        type="button"
        class="nl-button"
        aria-label="Zoom in"
        data-part={ZoomPart.ZoomIn}
        disabled={view.to - view.from <= 1.01e-8}
        onClick={() => call(ZoomAction.ZoomIn)}
      >
        <Magnifier isIn={true} />
      </button>
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
