import { type PropViewProps, RichText } from "@chalk/player";
import type { JSX } from "preact";
import {
  type Term,
  collect,
  divisionSteps,
  productCells,
  termTex,
  termsOf,
  termsTex,
} from "./box-algebra";
import { BoxMode, PolyBoxAction, type PolyBoxState } from "./poly-box";
import { SymbolButton } from "./ui";

/** Cells of the same power share a colour, so like terms can be seen before they are added. */
/** Stable keys for the box's rows and columns (at most 6 terms either way). */
const KEY = ["a", "b", "c", "d", "e", "f", "g"] as const;

const tone = (power: number) => `pp-power-${power % 4}`;

function Maths({ tex }: { tex: string }): JSX.Element {
  return <RichText text={`$${tex}$`} />;
}

function Cell({ term, v, part }: { term: Term | null; v: string; part?: string }): JSX.Element {
  return (
    <div
      class={term === null ? "pp-cell is-empty" : `pp-cell ${tone(term.power)}`}
      data-part={term === null ? undefined : part}
    >
      {term !== null && <Maths tex={termTex(term, v)} />}
    </div>
  );
}

/**
 * The box: one factor (or the divisor) down the side, the other factor (or the quotient so far)
 * along the top, and their products in the cells. No words: terms, and buttons with symbols.
 */
export function PolyBoxView({ view, call }: PropViewProps): JSX.Element {
  const s = view as unknown as PolyBoxState & { isDone: boolean; stepCount: number };
  const v = s.variable;
  const side = termsOf(s.side);
  const isMultiply = s.mode === BoxMode.Multiply;
  const steps = isMultiply ? [] : divisionSteps(s.dividend, s.side);
  const top: (Term | null)[] = isMultiply
    ? termsOf(s.top)
    : steps.map((step, j) => (j < s.steps ? step.quotient : null));
  const cells = isMultiply ? productCells(side, termsOf(s.top)) : [];
  const cellAt = (row: number, column: number): Term | null => {
    if (isMultiply) {
      const index = row * top.length + column;
      return index < s.steps ? (cells[index]?.term ?? null) : null;
    }
    return column < s.steps ? (steps[column]?.cells[row] ?? null) : null;
  };
  const dividend = collect(termsOf(s.dividend));
  const left = isMultiply ? [] : (steps[s.steps - 1]?.remaining ?? dividend);
  const product = collect(cells.map((c) => c.term));
  return (
    <div class="pp-box" style={{ "--columns": String(Math.max(1, top.length)) }}>
      {!isMultiply && (
        <p class="pp-box-line" data-part="dividend">
          <Maths tex={termsTex(dividend, v)} />
        </p>
      )}
      <div class="pp-grid">
        <div class="pp-corner" aria-hidden="true">
          {isMultiply ? "×" : "÷"}
        </div>
        {top.map((t, j) => (
          <div
            key={KEY[j]}
            class={t === null ? "pp-head is-empty" : "pp-head"}
            data-part={t === null ? undefined : `top:${j}`}
          >
            {t !== null && <Maths tex={termTex(t, v)} />}
          </div>
        ))}
        {side.map((t, i) => (
          <div key={KEY[i]} class="pp-row">
            <div class="pp-head is-side" data-part={`side:${i}`}>
              <Maths tex={termTex(t, v)} />
            </div>
            {top.map((_, j) => (
              <Cell key={KEY[j]} term={cellAt(i, j)} v={v} part={`cell:${i}:${j}`} />
            ))}
          </div>
        ))}
      </div>
      {isMultiply && s.isDone && (
        <p class="pp-box-line is-result" data-part="result">
          <Maths tex={`= ${termsTex(product, v)}`} />
        </p>
      )}
      {!isMultiply && s.steps > 0 && (
        <p
          class={s.isDone ? "pp-box-line is-left is-done" : "pp-box-line is-left"}
          data-part="left"
        >
          <Maths tex={`${s.isDone ? "r = " : ""}${termsTex(left, v)}`} />
        </p>
      )}
      <div class="pp-controls">
        <SymbolButton
          symbol="→"
          label={isMultiply ? "Fill the next cell" : "Find the next term of the quotient"}
          isWide
          isEnabled={!s.isDone}
          part="next"
          onPress={() => call(PolyBoxAction.Next)}
        />
        <SymbolButton
          symbol="↺"
          label="Start again"
          isEnabled={s.steps > 0}
          part="startAgain"
          onPress={() => call(PolyBoxAction.StartAgain)}
        />
      </div>
    </div>
  );
}
