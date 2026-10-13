# @chalk/library

The prop library: one registry of every prop type. The app, Studio's validator and (later) Jugnu all read it.

- `propLibrary`: type → `{ def, View }`, for the player.
- `propDefs`: type → definition (plus the board), for tools that only need the contract.

Props in it now: `text`, `line`, `choice`, `goal`, `button`, `timer` (`props/basics`), `numberLine` (`props/number-line`), `coin` (`props/chance`), `graph` (`props/plot`), `circuit` (`props/circuit`), `decimalExpansion`, `decimalShift` (`props/decimal`), `numberSorter` (`props/number-sets`), `exponentRoutes` (`props/exponents`), `rootBuilder`, `rootSpiral`, `rootSemicircle` (`props/roots`), `surdTiles` (`props/surds`).

`src/lessons.test.ts` plays real lessons through the runtime with these props and fake time, so a change to any prop is checked against the lessons that use it.

Adding a prop: create `props/<name>/` (same shape as `props/number-line`), then add one line to `src/index.ts`.
