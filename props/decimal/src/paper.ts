/**
 * Where everything goes when the long division is written out on paper, the way NCERT (p. 9) and a
 * school notebook do it: the divisor outside the bracket, the quotient on top, and under the dividend
 * a staircase of "product, line, what's left with a 0 brought down", one place further right each step.
 *
 * Pure layout in character columns; the view turns it into a grid. Columns hold digits only: the
 * decimal point sits on the boundary after the last digit of the numerator.
 */
import { divide } from "./division";

export const CellKind = {
  /** A digit of the quotient. */
  Quotient: "quotient",
  /** The dividend under the bracket (the numerator and the zeros after its point). */
  Dividend: "dividend",
  /** digit × divisor, written under the number it is taken from. */
  Product: "product",
  /** What is left after subtracting: the remainder. */
  Remainder: "remainder",
  /** The 0 brought down next to the remainder. */
  BroughtDown: "broughtDown",
} as const;
export type CellKind = (typeof CellKind)[keyof typeof CellKind];

export type Cell = {
  col: number;
  text: string;
  kind: CellKind;
  /** For quotient digits: position after the point (from 1); 0 for the whole part. */
  position?: number;
  /** For remainder cells: which remainder (as in `remainders`). */
  remainderIndex?: number;
};

export type PaperRow = {
  cells: Cell[];
  /** A line drawn under this row, over these columns (inclusive), before the subtraction result. */
  rule?: { from: number; to: number };
  /** The step this row belongs to: 0 is the whole part, i is the i-th digit after the point. */
  step: number;
};

export type Paper = {
  /** Number of digit columns. */
  columns: number;
  /** The decimal point sits after this column (or null when nothing comes after the point). */
  pointAfter: number | null;
  quotient: Cell[];
  dividend: Cell[];
  work: PaperRow[];
};

/** Puts `text` so its last character lands on column `rightCol`. */
function rightAligned(text: string, rightCol: number, kind: CellKind, extra: Partial<Cell> = {}) {
  return [...text].map((ch, i) => ({
    col: rightCol - text.length + 1 + i,
    text: ch,
    kind,
    ...extra,
  }));
}

/**
 * Lays out p ÷ q with `count` digits after the point worked out. `isPending` says a next step is
 * coming (its 0 is already brought down), so the last remainder is shown with that 0.
 */
export function layOut(
  numerator: number,
  denominator: number,
  count: number,
  isPending: boolean,
): Paper {
  const { wholePart, digits, remainders } = divide(numerator, denominator, count);
  const p = String(numerator);
  const k = p.length;
  /** Column of the i-th digit after the point (i from 1); i = 0 is the last digit of p. */
  const colOf = (i: number) => k - 1 + i;
  const zeros = count + (isPending ? 1 : 0);
  const pointAfter = zeros > 0 ? k - 1 : null;

  const quotient: Cell[] = rightAligned(String(wholePart), colOf(0), CellKind.Quotient, {
    position: 0,
  });
  digits.forEach((digit, i) => {
    quotient.push({
      col: colOf(i + 1),
      text: String(digit),
      kind: CellKind.Quotient,
      position: i + 1,
    });
  });

  // When q doesn't go into p at all, p itself is the first remainder (1.0 ÷ 7: the 1 is left over).
  const dividend: Cell[] = rightAligned(
    p,
    colOf(0),
    CellKind.Dividend,
    wholePart === 0 && numerator > 0 ? { remainderIndex: 0 } : {},
  );
  for (let i = 1; i <= zeros; i++)
    dividend.push({ col: colOf(i), text: "0", kind: CellKind.Dividend });

  const work: PaperRow[] = [];
  /** The leftover after step `i` (at column colOf(i)), with the next 0 if another step follows. */
  const leftover = (i: number) => {
    const remainder = remainders[i] ?? 0;
    const hasNext = i < count || (i === count && isPending);
    const cells = rightAligned(String(remainder), colOf(i), CellKind.Remainder, {
      remainderIndex: i,
    });
    if (hasNext) cells.push({ col: colOf(i + 1), text: "0", kind: CellKind.BroughtDown });
    work.push({ cells, step: i });
  };

  // The whole part: written out only when q goes into p at least once (1.0 ÷ 7 starts at the tenths).
  if (wholePart > 0) {
    const product = String(wholePart * denominator);
    const from = colOf(0) - Math.max(product.length, k) + 1;
    work.push({
      cells: rightAligned(product, colOf(0), CellKind.Product),
      rule: { from, to: colOf(0) },
      step: 0,
    });
    leftover(0);
  }
  for (let i = 1; i <= count; i++) {
    const dividendHere = String((remainders[i - 1] ?? 0) * 10);
    const product = String((digits[i - 1] ?? 0) * denominator);
    const from = colOf(i) - Math.max(product.length, dividendHere.length) + 1;
    work.push({
      cells: rightAligned(product, colOf(i), CellKind.Product),
      rule: { from, to: colOf(i) },
      step: i,
    });
    leftover(i);
  }

  const used = [...quotient, ...dividend, ...work.flatMap((row) => row.cells)].map((c) => c.col);
  const columns = Math.max(colOf(zeros), ...used) + 1;
  return { columns, pointAfter, quotient, dividend, work };
}

/** The column the next quotient digit (the one being worked out) goes in. */
export function nextColumn(numerator: number, count: number): number {
  return String(numerator).length - 1 + count + 1;
}
