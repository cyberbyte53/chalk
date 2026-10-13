# @chalk/prop-chance

Props for chance. Random but replayable: the seed is part of the state, so the same start gives the same tosses.

- `src/coin.ts`: the coin. Stored `heads`, `tails`, `last` (heads, tails or none yet), `seed`; derived `count`, `headsFraction`; actions `toss` (signal `landed { face }`) and `reset`; parts `coin` and, once tossed, `face`.
- `src/random.ts`: `nextRandom(seed)`, a small seeded generator (mulberry32). No `Math.random` anywhere in a prop.
- `src/view.tsx`: the coin; tapping it is `toss`. Shows H/T (चित/पट in Hindi).
- `src/coin.test.ts`: fair over 10,000 tosses, and the same seed gives the same run.

May import: `@chalk/prop`, `@chalk/player` (types), `preact`, `zod`. Exports: `coinProp` (the module), `coinDef`, `CoinState`, `CoinSignal`, `Face`, `nextRandom`.
