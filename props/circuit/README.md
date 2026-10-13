# @chalk/prop-circuit

A simple DC electric circuit, as in NCERT Class 8 (electric current and its effects) and Class 10 Ch 12 (Electricity): cells, bulbs, resistors, switches, connecting wires, ammeters and voltmeters, all ideal as the textbook assumes. It knows circuits and Ohm's law, nothing about any lesson.

## Stored state

- `nodes`: the points components join at, each `{ id, x, y, label? }` on a small grid (`x` 0–10, `y` 0–8, whole numbers, at most 20 nodes, no two at the same place).
- `components`: at most 30, each `{ kind, id, from, to, label? }` joining node `from` to node `to`. `label` is the lesson's `{ en, hi }`. By `kind`:
  - `cell`: `volts` (0–240). Its `to` end is the **+** terminal, so a cell pushes current out of its `to` end.
  - `bulb`: `ohms`, `ratedVolts` (default 1.5), `isInSocket` (default true). Out of its socket it conducts nothing.
  - `resistor`: `ohms`.
  - `switch`: `isClosed`.
  - `wire`, `ammeter` (0 Ω), `voltmeter` (infinite Ω): nothing more.

Ids are camelCase and unique across nodes and components; both ends of a component must exist and differ. Two or more components may join the same two nodes (a voltmeter across a bulb); the view draws them side by side.

## Derived state

Records keyed by component id, so a lesson reads `circuit.brightness.bulbA`:

- `current`: amps through each component (never negative). `direction`: `1` if conventional current goes through it from its `from` end to its `to` end, `-1` the other way, `0` if none.
- `voltage`: the potential difference across each component, in volts (never negative).
- `power`: watts each component uses; for a cell, the watts it gives (negative if another cell pushes current back through it).
- `brightness`: each bulb's power ÷ its rated power (`ratedVolts² / ohms`), capped at 1; 0 out of its socket.
- `reading`: each ammeter's amps and each voltmeter's volts.
- `isShortCircuit`, `shortedCells`: a cell whose terminals are joined with no resistance, or ideal cells that contradict each other (1.5 V and 3 V side by side).
- `isCurrentFlowing`: current flows somewhere.

When a piece of the circuit is short-circuited, every current, voltage, power, brightness and reading in that piece is 0 and `isShortCircuit` is true: an ideal short has no finite answer, so the prop says so instead of guessing. Nothing is ever NaN or infinite.

A voltmeter joining two separate pieces of circuit reads 0 (there is no loop to compare them by). Current shared by zero-resistance paths in parallel (two wires, two equal cells side by side) is split as if each had the same tiny resistance: equally.

## Actions

Every action keeps the nodes and every other component fixed unless it says otherwise. None reveals an answer.

| Action | Changes | Keeps fixed | Who |
|---|---|---|---|
| `toggleSwitch { component }` | that switch's `isClosed` | everything else | the learner's finger |
| `takeOutBulb { component }` | that bulb's `isInSocket` to false | its ohms and rating; everything else | the learner's finger |
| `putBackBulb { component }` | that bulb's `isInSocket` to true | its ohms and rating; everything else | the learner's finger |
| `setSwitch { component, isClosed }` | that switch's `isClosed` | everything else | the lesson |
| `setVolts { component, volts }` | that cell's `volts` | which end is +; everything else | the lesson |
| `setOhms { component, ohms }` | that bulb's or resistor's `ohms` | a bulb's rating and socket; everything else | the lesson |
| `addComponent { kind, id, from, to, … }` | adds one component between existing nodes | the nodes and every other component | the lesson |
| `removeComponent { component }` | removes one component | the nodes (even if left bare) and every other component | the lesson |
| `addNode { id, x, y, label? }` | adds one node | every component and node | the lesson |

An action naming a component that isn't there, or of the wrong kind, fails loudly.

## Signals

None are commits.

- `switched { component, isClosed }`: a switch was opened or closed.
- `bulbTakenOut { component }`, `bulbPutBack { component }`.
- `changed`: anything in the circuit changed (after every action that changed something), so a lesson can react to the new currents.

## Parts

Every component by its id (`bulbA`, `switchA`) and every node by its id.

## What a learner can do with a finger

Tap a switch (`toggleSwitch`); tap a bulb to take it out of its socket, tap the empty socket to put it back (`takeOutBulb`, `putBackBulb`).

## Files

- `src/model.ts`: the definition.
- `src/solve.ts`: the network solver (nodal analysis with zero-resistance parts merged, Gaussian elimination with partial pivoting). Knows networks, not bulbs.
- `src/layout.ts`: grid → pixels, shared by the view and `locate`.
- `src/view.tsx`: the circuit diagram in textbook symbols; moving dashes show conventional current (faster for more current, still under reduced motion).
- Styles live in the player's `styles.css`, section "circuit".
- `src/model.test.ts`: Ohm's law, series and parallel bulbs, switches, meters, short circuits, Kirchhoff's current law and power balance over many seeded random networks, every action and refusal.

May import: `@chalk/content` (`localizedSchema`, `Locale`), `@chalk/prop`, `@chalk/player` (types), `preact`, `zod`. Exports: `circuitProp` (the module), `circuitDef`, `CircuitState`, `CircuitNode`, `CircuitReadings`, `Component`, `ComponentKind`, `CircuitSignal`, `measure`, `solveNetwork`.
