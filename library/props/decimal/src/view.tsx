import type { PropViewProps } from "@chalk/player";
import { Fragment, type JSX } from "preact";
import { useLayoutEffect, useRef } from "preact/hooks";
import { DecimalExpansionPart, type DecimalExpansionState } from "./model";
import { type Cell, CellKind, layOut, nextColumn } from "./paper";

type DecimalExpansionView = DecimalExpansionState & {
  wholePart: number;
  digits: string;
  remainders: number[];
  repeatStart: number;
  repeatLength: number;
  hasEnded: boolean;
  hasRepeated: boolean;
  decimalText: string;
  partialDividend: number;
};

const NEXT_DIGIT = "nextDigit";
const TRY_DIGIT = "tryDigit";
const SET_FRACTION = "setFraction";
const START_AGAIN = "startAgain";
const MAX_TYPED = 999;

/** A typed whole number: p or q. A value out of range snaps back. */
function NumberField({
  name,
  value,
  min,
  part,
  onChange,
}: {
  name: string;
  value: number;
  min: number;
  part: string;
  onChange: (value: number) => void;
}): JSX.Element {
  return (
    <label class="dx-field" data-part={part}>
      <span>{name}</span>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={MAX_TYPED}
        value={value}
        onChange={(event) => {
          const input = event.target as HTMLInputElement;
          const next = Number(input.value);
          if (Number.isInteger(next) && next >= min && next <= MAX_TYPED) onChange(next);
          else input.value = String(value);
        }}
      />
    </label>
  );
}
/** Width of one digit column, in px. */
const COL = 15;
/** The decimal point's column has no width: the digits of the top two rows step aside for it. */
const POINT = 0;
/** Height of one row of the paper, in px. */
const ROW = 25;

/**
 * The long division as it is written in a notebook (NCERT p. 9): divisor, bracket, quotient on top,
 * and the staircase of products and remainders. Beside it, the remainder clock: one slot for each
 * remainder dividing by q can leave, lit as the division visits it. With the digit pad on, the learner
 * works out each next digit; otherwise a tap on the paper does the next step. It owns no state.
 */
export function DecimalExpansionView({ view, call }: PropViewProps): JSX.Element {
  // The player hands each view its own prop's state, already checked against its schema.
  const s = view as unknown as DecimalExpansionView;
  const count = s.digitsShown;
  const isPending = !s.hasEnded && count < 60;
  const paper = layOut(s.numerator, s.denominator, count, isPending);
  const blockEnd = s.repeatStart + s.repeatLength;
  const scroller = useRef<HTMLDivElement>(null);
  const tapSheet = useRef<HTMLButtonElement>(null);

  // Keep the newest step in sight as the staircase grows.
  const key = `${s.numerator}/${s.denominator}:${count}:${s.rejectedDigit}`;
  useLayoutEffect(() => {
    const box = scroller.current ?? tapSheet.current;
    if (box === null || key === "") return;
    const toEnd = () => {
      box.scrollTop = box.scrollHeight;
      box.scrollLeft = box.scrollWidth;
    };
    toEnd();
    // Once more after fonts and layout settle.
    const frame = requestAnimationFrame(toEnd);
    return () => cancelAnimationFrame(frame);
  }, [key]);

  const nextCol = nextColumn(s.numerator, count);
  const columns = Math.max(paper.columns, isPending ? nextCol + 1 : 0);
  const isInBlock = (position: number) =>
    s.hasRepeated && position > s.repeatStart && position <= blockEnd;
  /** A remainder that has come back, or the first time it was seen. */
  const isRepeatRemainder = (index: number) =>
    s.hasRepeated && (index === s.repeatStart || index === blockEnd);

  const cellClass = (cell: Cell, isNewestStep: boolean): string => {
    const classes = ["dx-cell", `dx-${cell.kind}`];
    if (cell.kind === CellKind.Quotient && cell.position !== undefined) {
      if (isInBlock(cell.position)) classes.push("is-block");
      if (s.hasRepeated && cell.position > blockEnd) classes.push("is-beyond");
      if (cell.position === count && count > 0) classes.push("is-newest");
    }
    if (cell.remainderIndex !== undefined && isRepeatRemainder(cell.remainderIndex)) {
      classes.push("is-repeat");
    }
    if (cell.kind === CellKind.Remainder && s.hasEnded && cell.remainderIndex === count) {
      classes.push("is-zero");
    }
    if (isNewestStep) classes.push("is-newest-step");
    return classes.join(" ");
  };
  const dataPart = (cell: Cell): string | undefined => {
    if (cell.kind === CellKind.Quotient && cell.position !== undefined && cell.position > 0) {
      return `${DecimalExpansionPart.DigitPrefix}${cell.position}`;
    }
    if (cell.remainderIndex !== undefined) {
      return `${DecimalExpansionPart.RemainderPrefix}${cell.remainderIndex}`;
    }
    return undefined;
  };
  // Grid tracks: the divisor, then one per digit column, with a narrow track for the decimal point
  // straight after the numerator's last digit.
  const track = (col: number) =>
    col + 2 + (paper.pointAfter !== null && col > paper.pointAfter ? 1 : 0);
  const place = (col: number, row: number, span = 1) => {
    const start = track(col);
    return {
      gridColumn: `${start} / span ${track(col + span - 1) - start + 1}`,
      gridRow: `${row} / span 1`,
    };
  };
  /** Which side of the point a digit of the top two rows is on (they step apart to make room). */
  const side = (col: number): string =>
    paper.pointAfter === null
      ? ""
      : col <= paper.pointAfter
        ? " is-before-point"
        : " is-after-point";
  const pointTrack = paper.pointAfter === null ? null : paper.pointAfter + 3;

  // Grid rows: 1 quotient, 2 dividend, then the work rows (a rule sits under its product row).
  const lastStep = paper.work.at(-1)?.step ?? -1;
  const quotientRow = 1;
  const dividendRow = 2;
  const workStart = 3;
  const rejected = s.rejectedDigit;
  const ghostProduct = rejected === null ? null : rejected * s.denominator;
  const isTooBig = ghostProduct !== null && ghostProduct > s.partialDividend;
  const label = `${s.numerator} ÷ ${s.denominator} = ${s.decimalText}`;

  const paperGrid = (
    <div
      class="dx-paper"
      style={{
        gridTemplateColumns:
          paper.pointAfter === null
            ? `minmax(${COL * 1.4}px, auto) repeat(${columns + 1}, ${COL}px)`
            : `minmax(${COL * 1.4}px, auto) repeat(${paper.pointAfter + 1}, ${COL}px) ${POINT}px repeat(${
                columns - paper.pointAfter
              }, ${COL}px)`,
        gridAutoRows: `${ROW}px`,
      }}
    >
      {/* The quotient and the dividend stay in sight while the steps scroll under them. */}
      <span class="dx-head-backdrop" aria-hidden="true" />
      {paper.pointAfter !== null && (
        <>
          <span
            class="dx-point is-head"
            style={{ gridColumn: `${pointTrack}`, gridRow: `${quotientRow}` }}
            aria-hidden="true"
          />
          <span
            class="dx-point is-head-2"
            style={{ gridColumn: `${pointTrack}`, gridRow: `${dividendRow}` }}
            aria-hidden="true"
          />
        </>
      )}
      {paper.quotient.map((cell) => (
        <span
          key={`q${cell.col}`}
          class={`${cellClass(cell, false)} is-head${side(cell.col)}`}
          style={place(cell.col, quotientRow)}
          data-part={dataPart(cell)}
        >
          {cell.text}
        </span>
      ))}
      {isPending && (
        <span
          class={`dx-cell dx-next is-head${side(nextCol)}${s.isAskingDigit ? " is-asking" : ""}${
            rejected !== null ? " is-rejected" : ""
          }`}
          style={place(nextCol, quotientRow)}
          data-part={s.isAskingDigit ? DecimalExpansionPart.NextDigit : undefined}
        >
          {s.isAskingDigit ? (rejected ?? "?") : count > 0 ? "…" : ""}
        </span>
      )}
      {s.hasRepeated && (
        <span
          class="dx-bar is-head is-after-point"
          style={place(String(s.numerator).length + s.repeatStart, quotientRow, s.repeatLength)}
          data-part={DecimalExpansionPart.RepeatBar}
          aria-hidden="true"
        />
      )}
      <span
        class="dx-divisor is-head-2"
        style={{ gridColumn: "1 / span 1", gridRow: `${dividendRow}` }}
      >
        {s.denominator}
      </span>
      <span
        class="dx-bracket is-head-2"
        style={place(0, dividendRow, columns + 1)}
        aria-hidden="true"
      />
      {paper.dividend.map((cell) => (
        <span
          key={`d${cell.col}`}
          class={`${cellClass(cell, false)} is-head-2${side(cell.col)}`}
          style={place(cell.col, dividendRow)}
          data-part={dataPart(cell)}
        >
          {cell.text}
        </span>
      ))}
      {paper.work.map((row, r) => (
        // A row is its place in the division: the index is its identity, and rows only grow.
        // biome-ignore lint/suspicious/noArrayIndexKey: see above
        <Fragment key={r}>
          {row.rule !== undefined && (
            <span
              class={`dx-rule${row.step === lastStep ? " is-newest-step" : ""}`}
              style={place(row.rule.from, workStart + r, row.rule.to - row.rule.from + 1)}
              aria-hidden="true"
            />
          )}
          {row.cells.map((cell) => (
            <span
              key={cell.col}
              class={cellClass(cell, row.step === lastStep)}
              style={place(cell.col, workStart + r)}
              data-part={dataPart(cell)}
            >
              {cell.text}
            </span>
          ))}
        </Fragment>
      ))}
      {ghostProduct !== null && (
        <span
          class="dx-ghost"
          style={{
            gridColumn: "1 / -1",
            gridRow: `${workStart + paper.work.length}`,
          }}
        >
          {isTooBig
            ? `${rejected} × ${s.denominator} = ${ghostProduct} > ${s.partialDividend}`
            : `${s.partialDividend} − ${ghostProduct} = ${s.partialDividend - ghostProduct} ≥ ${s.denominator}`}
        </span>
      )}
    </div>
  );

  // The whole-part digits come first in `quotient`; the bar starts after them, at the block.
  return (
    <div class={`dx${s.hasEnded ? " is-ended" : ""}${s.hasRepeated ? " is-repeated" : ""}`}>
      {s.isEditable && (
        <div class="dx-fields">
          <NumberField
            name="p"
            value={s.numerator}
            min={0}
            part={DecimalExpansionPart.Numerator}
            onChange={(value) =>
              call(SET_FRACTION, { numerator: value, denominator: s.denominator })
            }
          />
          <NumberField
            name="q"
            value={s.denominator}
            min={2}
            part={DecimalExpansionPart.Denominator}
            onChange={(value) => call(SET_FRACTION, { numerator: s.numerator, denominator: value })}
          />
          <button
            type="button"
            class="dx-again"
            aria-label="Start again"
            disabled={s.digitsShown === 0}
            onClick={() => call(START_AGAIN)}
          >
            ↺
          </button>
        </div>
      )}
      <div class="dx-top">
        {s.isAskingDigit || s.hasEnded ? (
          <div class="dx-sheet" ref={scroller} role="img" aria-label={label}>
            {paperGrid}
          </div>
        ) : (
          <button
            type="button"
            class="dx-sheet is-tappable"
            ref={tapSheet}
            aria-label={label}
            onClick={() => call(NEXT_DIGIT)}
          >
            {paperGrid}
          </button>
        )}
        {s.isClockShown && <RemainderClock s={s} />}
      </div>
      {s.isAskingDigit && !s.hasEnded && (
        <div class="dx-pad" data-part={DecimalExpansionPart.DigitPad}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              type="button"
              key={digit}
              class={rejected === digit ? "dx-key is-rejected" : "dx-key"}
              onClick={() => call(TRY_DIGIT, { digit })}
            >
              {digit}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const CLOCK = 176;
const CENTRE = CLOCK / 2;
const RING = 68;

/**
 * The remainder clock: a slot for each non-zero remainder dividing by q can leave (q − 1 of them)
 * and 0 in the middle. Each step of the division moves to the slot of its remainder; once a slot is
 * visited twice the path closes into a loop, and everything after it repeats.
 */
function RemainderClock({ s }: { s: DecimalExpansionView }): JSX.Element {
  const q = s.denominator;
  const slots = q - 1;
  const at = (r: number) => {
    if (r === 0) return { x: CENTRE, y: CENTRE };
    const angle = -Math.PI / 2 + (2 * Math.PI * (r - 1)) / Math.max(slots, 1);
    return { x: CENTRE + RING * Math.cos(angle), y: CENTRE + RING * Math.sin(angle) };
  };
  const dot = slots <= 12 ? 11 : slots <= 20 ? 8 : slots <= 40 ? 5 : 3;
  const isLabelled = slots <= 20;
  const visited = new Set(s.remainders);
  const current = s.remainders.at(-1) ?? 0;
  const blockEnd = s.repeatStart + s.repeatLength;
  const path = s.remainders.slice(0, s.hasRepeated ? blockEnd + 1 : undefined);
  const isLoopStep = (j: number) => s.hasRepeated && j >= s.repeatStart && j < blockEnd;

  return (
    <svg
      class="dx-clock"
      viewBox={`0 0 ${CLOCK} ${CLOCK}`}
      width={CLOCK}
      height={CLOCK}
      role="img"
      aria-label={`Remainders dividing by ${q}: ${s.remainders.join(", ")}`}
      data-part={DecimalExpansionPart.Clock}
    >
      <circle class="dx-clock-ring" cx={CENTRE} cy={CENTRE} r={RING} />
      <defs>
        {["plain", "newest", "loop"].map((tone) => (
          <marker
            key={tone}
            id={`dx-head-${tone}`}
            class={`dx-head is-${tone}`}
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L8 4 L0 8 z" />
          </marker>
        ))}
      </defs>
      {path.slice(1).map((r, i) => {
        const a = at(path[i] ?? 0);
        const b = at(r);
        // Stop short of both dots, so the arrowhead shows; the digit sits beside the middle.
        const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        const ux = (b.x - a.x) / length;
        const uy = (b.y - a.y) / length;
        const gap = (r === 0 ? 12 : dot) + 2;
        const from = { x: a.x + ux * (dot + 2), y: a.y + uy * (dot + 2) };
        const to = { x: b.x - ux * gap, y: b.y - uy * gap };
        const tone = isLoopStep(i) ? "loop" : i === path.length - 2 ? "newest" : "plain";
        const digit = s.digits[i];
        const mid = { x: (a.x + b.x) / 2 - uy * 9, y: (a.y + b.y) / 2 + ux * 9 };
        return (
          // A step of the path is its place in the division.
          // biome-ignore lint/suspicious/noArrayIndexKey: see above
          <g key={i} class={`dx-step is-${tone}`}>
            <line
              class={`dx-chord${tone === "plain" ? "" : ` is-${tone === "loop" ? "loop" : "newest"}`}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              marker-end={`url(#dx-head-${tone})`}
            />
            {isLabelled && digit !== undefined && (
              <text class="dx-step-digit" x={mid.x} y={mid.y + 4} text-anchor="middle">
                {digit}
              </text>
            )}
          </g>
        );
      })}
      <g
        class={`dx-slot dx-slot-zero${visited.has(0) ? " is-hit" : ""}`}
        data-part={`${DecimalExpansionPart.SlotPrefix}0`}
      >
        <circle cx={CENTRE} cy={CENTRE} r={12} />
        <text x={CENTRE} y={CENTRE + 4.5} text-anchor="middle">
          0
        </text>
      </g>
      {Array.from({ length: slots }, (_, i) => i + 1).map((r) => {
        const { x, y } = at(r);
        const classes = ["dx-slot"];
        if (visited.has(r)) classes.push("is-visited");
        if (r === current && !s.hasEnded) classes.push("is-current");
        if (s.hasRepeated && r === s.remainders[s.repeatStart]) classes.push("is-repeat");
        const isOutside = !isLabelled;
        return (
          <g key={r} class={classes.join(" ")} data-part={`${DecimalExpansionPart.SlotPrefix}${r}`}>
            <circle cx={x} cy={y} r={dot} />
            {(isLabelled || visited.has(r)) && (
              <text
                class={isOutside ? "is-outside" : undefined}
                x={isOutside ? x + (x - CENTRE) * 0.25 : x}
                y={(isOutside ? y + (y - CENTRE) * 0.25 : y) + 4.5}
                text-anchor="middle"
              >
                {r}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
