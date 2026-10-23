import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  MAX_DIVISOR,
  MAX_PLACED,
  type Placement,
  RemainderShelvesAction,
  type RemainderShelvesState,
} from "./remainder-shelves";
import { SHOWN_PER_SHELF, shelfName } from "./seen";
import { Stepper, SymbolButton, sup } from "./ui";

/** Numbers kept visible on a shelf; older ones fold into the count. */

/** The shelf's name: 3q, 3q + 1, 3q + 2. */
/**
 * One shelf per remainder, labelled bq + r. Each number placed sits on the shelf of its remainder,
 * the newest ringed and written out (49 = 3 × 16 + 1); a shelf nothing has reached stays dashed.
 */
export function RemainderShelvesView({ view, call }: PropViewProps): JSX.Element {
  const s = view as unknown as RemainderShelvesState & {
    placements: Placement[];
    litShelves: number[];
    next: number | null;
  };
  const b = s.divisor;
  const latest = s.placements.at(-1);
  const shelves = Array.from({ length: b }, (_, r) => r);
  const powerText = (n: number) => (s.power === 1 ? `${n}` : `${n}${sup(s.power)}`);
  return (
    <div class="pr-shelves-prop">
      <div class={`pr-shelves${b > 6 ? " is-many" : ""}`}>
        {shelves.map((r) => {
          const here = s.placements.filter((p) => p.shelf === r);
          const shown = here.slice(-SHOWN_PER_SHELF);
          return (
            <div
              key={r}
              class={`pr-shelf${here.length === 0 ? " is-empty" : ""}`}
              data-part={`shelf:${r}`}
            >
              <div class="pr-shelf-name">{shelfName(b, r)}</div>
              <div class="pr-shelf-items">
                {here.length > shown.length && (
                  <span class="pr-more">+{here.length - shown.length}</span>
                )}
                {shown.map((p) => (
                  <span key={p.n} class={`pr-chip${p === latest ? " is-latest" : ""}`}>
                    {p.value}
                    {s.power > 1 && <span class="pr-chip-from">{powerText(p.n)}</span>}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p
        class="pr-equation"
        aria-live="polite"
        data-part={latest === undefined ? undefined : "equation"}
      >
        {latest === undefined
          ? " "
          : `${s.power > 1 ? `${powerText(latest.n)} = ` : ""}${latest.value} = ${b} × ${Math.floor(latest.value / b)} + ${latest.shelf}`}
      </p>
      <div class="pr-controls">
        <SymbolButton
          symbol="+1"
          label="Place the next number"
          isWide
          part="next"
          isEnabled={s.next !== null}
          onPress={() => call(RemainderShelvesAction.PlaceNext)}
        />
        <SymbolButton
          symbol="+10"
          label="Place the next ten numbers"
          isWide
          part="nextTen"
          isEnabled={s.placed < MAX_PLACED}
          onPress={() => call(RemainderShelvesAction.PlaceMany, { count: 10 })}
        />
        <SymbolButton
          symbol="↺"
          label="Clear the shelves"
          part="clear"
          isEnabled={s.placed > 0}
          onPress={() => call(RemainderShelvesAction.Clear)}
        />
      </div>
      <div class="pr-controls">
        {[1, 2, 3].map((power) => (
          <SymbolButton
            key={power}
            symbol={power === 1 ? "n" : `n${sup(power)}`}
            label={power === 1 ? "Place n" : `Place n to the power ${power}`}
            isOn={s.power === power}
            part={`power:${power}`}
            onPress={() => call(RemainderShelvesAction.SetPower, { power })}
          />
        ))}
        <Stepper
          name="b"
          value={b}
          min={2}
          max={MAX_DIVISOR}
          part="b"
          onChange={(divisor) => call(RemainderShelvesAction.SetDivisor, { divisor })}
        />
      </div>
    </div>
  );
}
