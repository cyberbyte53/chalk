import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { DivisionRowsAction, type DivisionRowsState, MAX_COUNTERS, MAX_ROW } from "./division-rows";
import { NumberBox, Stepper } from "./ui";

/**
 * a counters in rows of b: the full rows in blue (q of them), the counters left over in saffron (r),
 * and the empty places that would make one more row dashed, so r < b can be seen. a = bq + r below.
 */
export function DivisionRowsView({ view, call }: PropViewProps): JSX.Element {
  const s = view as unknown as DivisionRowsState & { quotient: number; remainder: number };
  const b = s.divisor;
  const rows = Array.from({ length: s.quotient }, (_, i) => i);
  return (
    <div class="pr-rows" style={{ "--per-row": String(b) }}>
      <div class="pr-steppers">
        <NumberBox
          name="a"
          value={s.dividend}
          min={0}
          max={MAX_COUNTERS}
          part="a"
          onChange={(value) => call(DivisionRowsAction.SetDividend, { value })}
        />
        <Stepper
          name="b"
          value={b}
          min={1}
          max={MAX_ROW}
          part="b"
          onChange={(value) => call(DivisionRowsAction.SetDivisor, { value })}
        />
      </div>
      <div
        class="pr-grid"
        role="img"
        aria-label={`${s.dividend} counters in rows of ${b}: ${s.quotient} full rows and ${s.remainder} left over`}
      >
        {rows.length > 0 && (
          <div class="pr-full-rows" data-part="rows">
            {rows.map((r) => (
              <div class="pr-row is-full" key={r}>
                {Array.from({ length: b }, (_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: identical items that never reorder
                  <span class="pr-counter" key={i} />
                ))}
                <span class="pr-row-count">{r + 1}</span>
              </div>
            ))}
          </div>
        )}
        <div class="pr-row is-left" data-part="leftOver">
          {Array.from({ length: s.remainder }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: identical items that never reorder
            <span class="pr-counter is-left" key={i} />
          ))}
          {Array.from({ length: b - s.remainder }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: identical items that never reorder
            <span class="pr-counter is-missing" key={`m${i}`} />
          ))}
          <span class="pr-row-count">r = {s.remainder}</span>
        </div>
      </div>
      <p class="pr-equation" data-part="equation">
        <span class="pr-a">{s.dividend}</span> = <span class="pr-b">{b}</span> ×{" "}
        <span class="pr-q">{s.quotient}</span> + <span class="pr-r">{s.remainder}</span>
        <span class="pr-check">
          {s.remainder} &lt; {b}
        </span>
      </p>
    </div>
  );
}
