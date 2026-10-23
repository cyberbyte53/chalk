import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { CircuitSymbol } from "./draw";
import type { Words } from "./words";

/**
 * Table 12.1: the symbols circuit diagrams use for a cell, a battery, a plug key (open and
 * closed), a wire joint, wires crossing without joining, a bulb, a resistor, a rheostat, an
 * ammeter and a voltmeter. As a table with names, or as a quiz: names hidden until tapped.
 */

export const SymbolsAction = { Reveal: "reveal", Reset: "reset" } as const;
export const SymbolsSignal = { Revealed: "revealed" } as const;
export const SymbolsDerived = {
  RevealedCount: "revealedCount",
  IsAllRevealed: "isAllRevealed",
} as const;

export const SymbolsMode = { Table: "table", Quiz: "quiz" } as const;
export type SymbolsMode = (typeof SymbolsMode)[keyof typeof SymbolsMode];

export const SYMBOL_ORDER: readonly CircuitSymbol[] = [
  CircuitSymbol.Cell,
  CircuitSymbol.Battery,
  CircuitSymbol.KeyOpen,
  CircuitSymbol.KeyClosed,
  CircuitSymbol.Joint,
  CircuitSymbol.Crossing,
  CircuitSymbol.Bulb,
  CircuitSymbol.Resistor,
  CircuitSymbol.Rheostat,
  CircuitSymbol.Ammeter,
  CircuitSymbol.Voltmeter,
];

export const SYMBOL_NAMES: Readonly<Record<CircuitSymbol, Words>> = {
  cell: { en: "An electric cell", hi: "एक विद्युत सेल" },
  battery: { en: "A battery (cells joined)", hi: "बैटरी (जुड़े हुए सेल)" },
  keyOpen: { en: "Plug key or switch (open)", hi: "प्लग कुंजी या स्विच (खुला)" },
  keyClosed: { en: "Plug key or switch (closed)", hi: "प्लग कुंजी या स्विच (बंद)" },
  joint: { en: "A wire joint", hi: "तारों का जोड़" },
  crossing: { en: "Wires crossing without joining", hi: "बिना जुड़े एक-दूसरे को पार करते तार" },
  bulb: { en: "An electric bulb", hi: "विद्युत बल्ब" },
  resistor: { en: "A resistor of resistance R", hi: "प्रतिरोध R वाला प्रतिरोधक" },
  rheostat: { en: "Variable resistance (rheostat)", hi: "परिवर्ती प्रतिरोध (धारा नियंत्रक)" },
  ammeter: { en: "Ammeter", hi: "ऐमीटर" },
  voltmeter: { en: "Voltmeter", hi: "वोल्टमीटर" },
};

const symbolsState = z
  .object({
    mode: z.nativeEnum(SymbolsMode),
    /** Which symbols are shown (in Table 12.1's order); all of them by default. */
    symbols: z.array(z.nativeEnum(CircuitSymbol)).min(1).max(11),
    /** In a quiz, the symbols whose names have been tapped open. */
    revealed: z.array(z.nativeEnum(CircuitSymbol)),
  })
  .strict();
export type SymbolsState = z.infer<typeof symbolsState>;

const isShown = (s: SymbolsState, sym: CircuitSymbol) =>
  s.mode === SymbolsMode.Table || s.revealed.includes(sym);

export function describeSymbols(s: SymbolsState): string {
  const list = s.symbols
    .map((sym) => (isShown(s, sym) ? SYMBOL_NAMES[sym].en : "a symbol with its name hidden"))
    .join("; ");
  return `Circuit symbols (Table 12.1): ${list}.`;
}

const act = actionsFor<SymbolsState>();

export const circuitSymbols = defineProp({
  type: "circuitSymbols",
  describe:
    "The circuit-diagram symbols of NCERT Table 12.1 (cell, battery, plug key open and closed, wire joint, wires crossing without joining, bulb, resistor, rheostat, ammeter, voltmeter), as a table with their names or as a quiz where the learner taps a symbol to see its name.",
  state: symbolsState,
  defaults: { mode: SymbolsMode.Table, symbols: [...SYMBOL_ORDER], revealed: [] },
  inputs: ["mode", "symbols"],
  invariant: (s) =>
    new Set(s.symbols).size === s.symbols.length ? undefined : "each symbol appears at most once",
  derived: {
    [SymbolsDerived.RevealedCount]: {
      describe: "How many names the learner has tapped open in the quiz",
      compute: (s) => s.revealed.filter((r) => s.symbols.includes(r)).length,
    },
    [SymbolsDerived.IsAllRevealed]: {
      describe: "Every name is showing",
      compute: (s) => s.symbols.every((sym) => isShown(s, sym)),
    },
  },
  actions: {
    [SymbolsAction.Reveal]: act({
      describe: "Tap a symbol to show its name (in the quiz)",
      byLearner: true,
      args: z.object({ symbol: z.nativeEnum(CircuitSymbol) }).strict(),
      run: (s, a) =>
        set(
          { revealed: s.revealed.includes(a.symbol) ? s.revealed : [...s.revealed, a.symbol] },
          { signal: SymbolsSignal.Revealed, payload: { symbol: a.symbol } },
        ),
    }),
    [SymbolsAction.Reset]: act({
      describe: "Hide every name again",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ revealed: [] }),
    }),
  },
  signals: { [SymbolsSignal.Revealed]: { describe: "A symbol's name was tapped open" } },
  observe: (s) => ({
    summary: describeSymbols(s),
    elements: s.symbols.map((sym) => ({
      id: sym,
      value: isShown(s, sym) ? SYMBOL_NAMES[sym].en : "?",
    })),
    hidden: Object.fromEntries(
      s.symbols.filter((sym) => !isShown(s, sym)).map((sym) => [sym, SYMBOL_NAMES[sym].en]),
    ),
  }),
  parts: (s) => [...s.symbols],
});
