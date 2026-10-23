# @chalk/library

The prop library: one registry of every prop type. The app, Studio's validator and (later) Jugnu all read it.

- `propLibrary`: type → `{ def, View }`, for the player.
- `propDefs`: type → definition (plus the board), for tools that only need the contract.

Props in it now: `text`, `line`, `choice`, `goal`, `button`, `timer` (`library/props/basics`), `numberLine` (`library/props/number-line`), `coin` (`library/props/chance`), `graph` (`library/props/plot`), `circuit` (`library/props/circuit`), `decimalExpansion`, `decimalShift` (`library/props/decimal`), `numberSorter` (`library/props/number-sets`), `exponentRoutes` (`library/props/exponents`), `rootBuilder`, `rootSpiral`, `rootSemicircle` (`library/props/roots`), `surdTiles` (`library/props/surds`), `divisionRows`, `squareCutter`, `remainderShelves`, `factorTree`, `primeBag`, `bagCompare`, `gearPair`, `squareBalance`, `tenMaker` (`library/props/primes`), `zeroPlane`, `polyBox` (`library/props/polynomials`), `planeMirror`, `sphericalMirror` (`library/props/light`).

`src/lessons.test.ts` plays real lessons through the runtime with these props and fake time, so a change to any prop is checked against the lessons that use it.

`src/styles.css` (`@chalk/library/styles.css`) gathers every prop's own styles for the app; `src/styles.test.ts` checks every prop is in it and draws only with the look's tokens.

Adding a prop: create `library/props/<name>/` (same shape as `library/props/number-line`), then add one line to `src/index.ts` and one `@import` to `src/styles.css`.
