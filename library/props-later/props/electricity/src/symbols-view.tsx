import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { TableSymbol } from "./draw";
import {
  SYMBOL_NAMES,
  SymbolsAction,
  SymbolsMode,
  type SymbolsState,
  describeSymbols,
} from "./symbols";
import { say } from "./words";

const TAP = { en: "Tap to name it", hi: "नाम देखने के लिए टैप करो" } as const;

export function SymbolsView({ view, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as SymbolsState;
  return (
    <ul class="el-cs" aria-label={describeSymbols(s)}>
      {s.symbols.map((sym) => {
        const isShown = s.mode === SymbolsMode.Table || s.revealed.includes(sym);
        const picture = (
          <svg class="el-cs-svg" viewBox="-30 -20 60 40" width={84} height={56} aria-hidden="true">
            <TableSymbol symbol={sym} />
          </svg>
        );
        return (
          <li key={sym} class="el-cs-item" data-part={sym}>
            {s.mode === SymbolsMode.Quiz && !isShown ? (
              <button
                type="button"
                class="el-cs-card is-hidden"
                onClick={() => call(SymbolsAction.Reveal, { symbol: sym })}
              >
                {picture}
                <span class="el-cs-name">{say(locale, TAP)}</span>
              </button>
            ) : (
              <div class="el-cs-card">
                {picture}
                <span class="el-cs-name">{say(locale, SYMBOL_NAMES[sym])}</span>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
