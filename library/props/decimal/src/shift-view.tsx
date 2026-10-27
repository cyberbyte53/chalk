import { type PropViewProps, does } from "@chalk/player";
import type { JSX } from "preact";
import { DIGITS_DRAWN, DecimalShiftPart, type DecimalShiftState, MAX_POWER, Tape } from "./shift";
import {
  type Recurring,
  differenceOf,
  digitAt,
  expand,
  expansionDigit,
  fractionOf,
  integerText,
  multipleLabel,
  powerOfTen,
  tailStart,
} from "./shift-maths";

type DecimalShiftView = DecimalShiftState & {
  topText: string;
  bottomText: string;
  multiplier: number;
  areTailsLinedUp: boolean;
  differenceText: string;
  hasSubtracted: boolean;
  isResultShown: boolean;
};

/** Cells at the right end that fade out, to say "and so on forever". */
const FADING = 3;
/** Powers the layout always has room for, so the decimal point stays put while tapes shift. */
const ROOM_FOR_POWER = 3;

/** Sizes for one width: digit font, cell width, point gap, label font, where the point sits. */
type Layout = { font: number; cell: number; gap: number; labelFont: number; point: number };

/** Rough width of a label like "1000x =" in the display font. */
function labelWidth(text: string, labelFont: number): number {
  return Math.ceil(text.length * labelFont * 0.6) + labelFont * 0.5;
}

/** The biggest digits that fit: every row's label and whole part left of the point, 12 digits right of it. */
function layoutFor(x: Recurring, top: number, bottom: number, width: number): Layout {
  const widest = Math.min(MAX_POWER, Math.max(ROOM_FOR_POWER, top, bottom));
  const rows = [
    { label: `${multipleLabel(powerOfTen(widest))} =`, digits: integerText(x, widest).length },
    { label: `${multipleLabel(powerOfTen(top))} =`, digits: integerText(x, top).length },
    { label: `${multipleLabel(powerOfTen(bottom))} =`, digits: integerText(x, bottom).length },
    {
      label: `${multipleLabel(powerOfTen(Math.max(top, bottom)))} =`,
      digits: integerText(x, Math.max(top, bottom)).length,
    },
  ];
  for (let font = 30; ; font--) {
    const cell = Math.round(font * 0.68);
    const gap = Math.round(font * 0.36);
    const labelFont = Math.round(font * 0.7);
    const point = Math.max(...rows.map((r) => labelWidth(r.label, labelFont) + r.digits * cell));
    if (point + gap + DIGITS_DRAWN * cell <= width || font <= 12) {
      return { font, cell, gap, labelFont, point };
    }
  }
}

/** Left edge of a column: 1, 2, … after the point; 0 is the units, -1 the tens. */
function leftOf(layout: Layout, column: number): number {
  return column >= 1
    ? layout.point + layout.gap + (column - 1) * layout.cell
    : layout.point + (column - 1) * layout.cell;
}

function px(n: number): string {
  return `${n}px`;
}

/**
 * Two tapes of digits, 10^topPower × x over 10^bottomPower × x, the decimal points in one column.
 * Each digit is keyed by its place in x, so ×10 slides it one cell left. The repeating blocks are
 * banded; lined-up tails are joined and struck out as the subtraction runs; under the rule the
 * difference and then x = p/q. It owns no state.
 */
export function DecimalShiftView({ view, width, call }: PropViewProps): JSX.Element {
  // The player hands each view its own prop's state, already checked against its schema.
  const s = view as unknown as DecimalShiftView;
  const layout = layoutFor(s, s.topPower, s.bottomPower, width);
  const rowHeight = Math.round(layout.font * 1.7);
  const tail = tailStart(s, s.topPower, s.bottomPower);
  const end = leftOf(layout, DIGITS_DRAWN) + layout.cell;
  const fade = `linear-gradient(to right, #000 ${px(end - FADING * layout.cell)}, transparent ${px(end)})`;
  const canSubtract = s.topPower > s.bottomPower && !s.hasSubtracted;
  const wholeLength = String(s.whole).length;

  /** One tape: its label, every digit of x it could ever show (keyed by place), and its point. */
  const tapeRow = (tape: Tape, power: number): JSX.Element => {
    const label = multipleLabel(powerOfTen(power));
    const integerDigits = integerText(s, power).length;
    const labelLeft =
      leftOf(layout, 1 - integerDigits) - labelWidth(`${label} =`, layout.labelFont);
    const cells: JSX.Element[] = [];
    const digitPart =
      tape === Tape.Top ? DecimalShiftPart.TopDigitPrefix : DecimalShiftPart.BottomDigitPrefix;
    for (let place = 1 - wholeLength; place <= MAX_POWER + DIGITS_DRAWN + 1; place++) {
      const column = place - power;
      const isLeadingZero = column <= -integerDigits;
      const isShown = !isLeadingZero && column <= DIGITS_DRAWN + 1;
      const classes = ["dsh-digit"];
      const repeatIndex = place - s.prefix.length - 1;
      if (place >= 1 && repeatIndex >= 0) {
        const offset = repeatIndex % s.block.length;
        classes.push(
          Math.floor(repeatIndex / s.block.length) % 2 === 0 ? "is-band" : "is-band-alt",
        );
        if (offset === 0) classes.push("is-band-start");
        if (offset === s.block.length - 1) classes.push("is-band-end");
      }
      const isTail = tail !== undefined && column >= tail;
      if (isTail) classes.push("is-tail");
      cells.push(
        <span
          key={place}
          class={classes.join(" ")}
          data-part={column >= 1 && column <= DIGITS_DRAWN ? `${digitPart}${column}` : undefined}
          style={{
            width: px(layout.cell),
            transform: `translateX(${px(leftOf(layout, column))})`,
            opacity: isShown ? (isTail ? 1 - 0.78 * s.cancel : 1) : 0,
          }}
        >
          {digitAt(s, place)}
        </span>,
      );
    }
    return (
      <div
        class={`dsh-row dsh-tape is-${tape}`}
        role="img"
        aria-label={tape === Tape.Top ? s.topText : s.bottomText}
        data-part={tape === Tape.Top ? DecimalShiftPart.TopTape : DecimalShiftPart.BottomTape}
        style={{ height: px(rowHeight) }}
      >
        <span
          class="dsh-label"
          style={{
            transform: `translateX(${px(labelLeft)})`,
            fontSize: px(layout.labelFont),
          }}
        >
          {label} <span class="dsh-equals">=</span>
        </span>
        {cells}
        <span
          class="dsh-point"
          style={{ transform: `translateX(${px(layout.point)})`, width: px(layout.gap) }}
        >
          .
        </span>
        {tail !== undefined && (
          <span
            class="dsh-strike"
            style={{
              left: px(leftOf(layout, tail) - 2),
              width: px(end - leftOf(layout, tail)),
              transform: `scaleX(${s.cancel})`,
            }}
          />
        )}
      </div>
    );
  };

  /** Top minus bottom, digits under the same columns: exact if it ends, else fading out. */
  const differenceRow = (): JSX.Element | undefined => {
    if (s.topPower <= s.bottomPower) return undefined;
    const e = expand(differenceOf(s, s.topPower, s.bottomPower));
    const whole = String(e.whole);
    const after = e.length === 0 ? e.digits.length : DIGITS_DRAWN;
    const label = multipleLabel(s.multiplier);
    const cells: JSX.Element[] = [];
    for (let i = 0; i < whole.length; i++) {
      const column = i - whole.length + 1;
      cells.push(
        <span
          key={column}
          class="dsh-digit"
          style={{ width: px(layout.cell), transform: `translateX(${px(leftOf(layout, column))})` }}
        >
          {whole[i]}
        </span>,
      );
    }
    for (let column = 1; column <= after; column++) {
      cells.push(
        <span
          key={column}
          class="dsh-digit"
          style={{ width: px(layout.cell), transform: `translateX(${px(leftOf(layout, column))})` }}
        >
          {expansionDigit(e, column)}
        </span>,
      );
    }
    const labelLeft = leftOf(layout, 1 - whole.length) - labelWidth(`${label} =`, layout.labelFont);
    return (
      <div
        class={`dsh-row dsh-difference${e.length > 0 ? " is-endless" : ""}`}
        role="img"
        aria-label={s.differenceText}
        data-part={s.hasSubtracted ? DecimalShiftPart.Difference : undefined}
        style={{
          height: px(rowHeight),
          opacity: Math.max(0, (s.cancel - 0.6) / 0.4),
          maskImage: e.length > 0 ? fade : undefined,
          WebkitMaskImage: e.length > 0 ? fade : undefined,
        }}
      >
        <span
          class="dsh-label"
          style={{ transform: `translateX(${px(labelLeft)})`, fontSize: px(layout.labelFont) }}
        >
          {label} <span class="dsh-equals">=</span>
        </span>
        {cells}
        {after > 0 && (
          <span
            class="dsh-point"
            style={{ transform: `translateX(${px(layout.point)})`, width: px(layout.gap) }}
          >
            .
          </span>
        )}
      </div>
    );
  };

  /** x = difference / multiplier = p/q, as stacked fractions. */
  const resultRow = (): JSX.Element | undefined => {
    if (!s.isResultShown) return undefined;
    const e = expand(differenceOf(s, s.topPower, s.bottomPower));
    const top = e.digits.length === 0 ? `${e.whole}` : `${e.whole}.${e.digits.join("")}`;
    const f = fractionOf(s);
    const isSame = top === `${f.numerator}` && BigInt(s.multiplier) === f.denominator;
    const fraction = (numerator: string, denominator: string) => (
      <span class="dsh-fraction">
        <span class="dsh-numerator">{numerator}</span>
        <span class="dsh-denominator">{denominator}</span>
      </span>
    );
    // Long fractions shrink to fit the width on one line, and start further left.
    const longest = (a: string, b: string) => Math.max(a.length, b.length);
    const characters =
      longest(top, `${s.multiplier}`) +
      (isSame ? 0 : longest(`${f.numerator}`, `${f.denominator}`) + 2) +
      3;
    const font = Math.max(12, Math.min(layout.font, Math.floor(width / (characters * 0.8))));
    const indent = leftOf(layout, 0) - labelWidth("x =", layout.labelFont);
    return (
      <div
        class="dsh-result"
        data-part={DecimalShiftPart.Result}
        style={{
          fontSize: px(font),
          paddingLeft: px(indent + characters * font * 0.75 <= width ? Math.max(0, indent) : 0),
        }}
      >
        <span class="dsh-result-label" style={{ fontSize: px(layout.labelFont) }}>
          x <span class="dsh-equals">=</span>
        </span>
        {fraction(top, `${s.multiplier}`)}
        {!isSame && (
          <>
            <span class="dsh-equals">=</span>
            {f.denominator === 1n ? (
              <span>{`${f.numerator}`}</span>
            ) : (
              fraction(`${f.numerator}`, `${f.denominator}`)
            )}
          </>
        )}
      </div>
    );
  };

  const shiftButtons = (tape: Tape, power: number): JSX.Element => (
    <div
      class={`dsh-shift is-${tape}`}
      data-part={tape === Tape.Top ? DecimalShiftPart.TopShift : DecimalShiftPart.BottomShift}
    >
      <button
        type="button"
        class="dsh-button"
        aria-label={`${multipleLabel(powerOfTen(power))} ÷ 10`}
        disabled={power <= 0}
        {...does("shift", { tape, by: -1 })}
      >
        ÷10
      </button>
      <button
        type="button"
        class="dsh-button"
        aria-label={`${multipleLabel(powerOfTen(power))} × 10`}
        disabled={power >= MAX_POWER}
        {...does("shift", { tape, by: 1 })}
      >
        ×10
      </button>
    </div>
  );

  const classes = ["dsh"];
  if (s.areTailsLinedUp) classes.push("is-lined-up");
  if (s.hasSubtracted) classes.push("is-subtracted");

  return (
    <div class={classes.join(" ")} style={{ fontSize: px(layout.font) }}>
      {shiftButtons(Tape.Top, s.topPower)}
      <div class="dsh-tapes" style={{ maskImage: fade, WebkitMaskImage: fade }}>
        {tail !== undefined && (
          <span
            class="dsh-tail"
            data-part={DecimalShiftPart.Tail}
            style={{
              left: px(leftOf(layout, tail) - 1),
              width: px(end - leftOf(layout, tail) + 1),
            }}
          />
        )}
        {tapeRow(Tape.Top, s.topPower)}
        {tapeRow(Tape.Bottom, s.bottomPower)}
      </div>
      {shiftButtons(Tape.Bottom, s.bottomPower)}
      <div class="dsh-rule">
        <button
          type="button"
          class="dsh-minus"
          aria-label={`${multipleLabel(powerOfTen(s.topPower))} − ${multipleLabel(powerOfTen(s.bottomPower))}`}
          data-part={DecimalShiftPart.Minus}
          disabled={!canSubtract}
          {...does("subtract")}
        >
          −
        </button>
        <span class="dsh-line" />
      </div>
      {differenceRow()}
      {resultRow()}
    </div>
  );
}
