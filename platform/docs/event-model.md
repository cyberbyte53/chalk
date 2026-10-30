# The event model (proposal)

Status: **proposal, for the person to go through before any code.** Nothing here is built yet.

## Why

A board does six things: its pieces remember (where Riya is), react (to the student, to each other, to time), draw themselves, are set up and scripted by a lesson, replay exactly (saved progress, checks, `play`), and can be read by agents. Today that takes about ten concepts that grew one need at a time: actions, signals, group links (`is`, `when`, `route`, `show`), board rules (`b.when`, `b.after`, `inOrder`), and a time language of nine steps (`tween`, `wait`, `seq`, `par`, `waitUntil`, `repeat`, `task`, `call`, `say`). Two problems follow:

- **Hard to follow.** Why Riya went back to the corner is in a third file (the group's `when`), not in the walker or the places.
- **Time isn't data.** A glide or a wait runs inside the runtime: a board saved mid-glide doesn't save the glide, and nothing can say what is about to happen.

## What strong systems agree on

From PhET (the closest to us), Elm, XState, Godot, Desmos and discrete-event simulation (research in the conversation of 2026-10-30):

1. **Two kinds of wire.** An *event* is a moment (tapped, arrived); a *value* is a fact about now (the plane's window, the target). Values are worked out and passed down, never copied around by events: copying is what gives PhET its order and restore troubles.
2. **One way to change data: named, typed events in.** Their list is "what can be done"; their log, with clock times, is the replay.
3. **Time is a queue.** The future is known when it starts (she'll be at (4, 0) in 0.3 s), so nothing ticks: a sorted queue of events due later, and motion kept as data.
4. **Siblings never call each other.** An event travels inside the parent that holds both; the parent decides what its children hear.

## The model: four concepts

### 1. Element

Its own data, the events it listens to, one table of what each does, and its drawing. A strategy class, as plain data.

```ts
export const walker = element({
  data: { walkFrom, at, trail, move, … },          // its own, saved
  values: ["window", "upLines", "target"],          // given by its parent, read only
  listens: [Step, BackToStart, WalkTo, TargetChosen],
  on: {
    Step: (s, { direction }, now) => { … },        // returns: changes, events out, events later
    TargetChosen: (s, { isAnother }) => (isAnother ? backToStart(s) : []),
    …
  },
});
```

- **Only its own data changes, only in `on`.** A handler returns what changes (`set`), events sent now (`send`), and events for later (`later`). It can refuse by sending an event back (`Blocked { why }`).
- **Everything that moves the walker is in the walker.** To know why Riya moved, read her file.

### 2. Event

A typed moment, declared once in a package's shared list. Not owned by whoever sends it: the walker listens for `TargetChosen`, not for "the places".

```ts
// coordinates/src/events.ts
export const Step = event({ direction: z.enum(["up", "down", "left", "right"]) }, { from: "screen" });
export const TargetChosen = event({ x: z.number(), y: z.number(), isAnother: z.boolean() });
export const Stepped = event({ x: z.number(), y: z.number() });
```

- A name and what it carries, checked when sent (as today's typed signals).
- `from: "screen"`: the student can send it (today's `byLearner`). Agents read "what the student can do" from these.

### 3. Value

A fact about now, worked out from data, passed down by a parent: the plane's window to every part that draws on it, the places' target to the walker. Never sent as an event, never stored twice.

```ts
export const coordinatePlane = element({
  children: { plane, places, walker, clues, plotting, dice, reading },
  values: (s) => ({ window: s.plane.window, target: s.places.target, … }),
});
```

### 4. Time: one queue, and motion as data

- **The queue.** One per board, sorted by time, saved with the board. `later(2.5, ChooseTarget { x: 4, y: 5 })` adds `{ at: now + 2.5, event, from, to }`. When the board clock reaches the front entry, it is delivered like any other event.
- **Motion is data.** A glide is `move: { from, to, startedAt, takes }`; where she is at any moment is a value of the clock. The drawing reads it each frame; logic reads the same value. Its end is a queued event (`later(0.3, Stepped { … })`).
- **The clock.** Board seconds, saved. A student's runs at ×1; `look` and `play` may run it faster to watch; checks, tests and the build **jump** it to the next entry (a 36 s race costs nothing to check). Times in the queue are never scaled, only the clock's rate.
- **Exact replay.** Saved data plus the student's events with their clock times. Same-time entries go in the order they were queued.
- **Cancelling.** Each entry remembers who queued it; an element clears its own (a new house mid-walk drops her pending steps).

The nine time steps become: a glide → motion data + one `later`; wait → `later`; a sequence → each step `later`s the next (a `sequence([...])` helper writes that); repeat → each firing queues the next; `waitUntil` → a computed time, or a check queued every so often.

## Rules that keep it simple and exact

- **Scope.** Events travel inside the parent that holds the sender: a plane's `TargetChosen` reaches that plane's walker, never another plane's. A board hears its pieces' events by piece name (`town`).
- **Order.** One event at a time. Listeners run in the order the parent lists its children; an event sent while handling waits its turn.
- **No loops by accident.** An event a handler sends can't come back to the same handler in the same moment (checked: a cycle names its path).
- **What stays as it is.** Data schemas, derived values, invariants, views and their tags (`does`, `says`, `shows`: `does` now names an event), `describe` on elements and screen events, sizes, frames.

## A real board in it: street-and-house

```ts
const town = b.place(coordinatePlane, "town", setup(bareTown(), { plane: { upLines: [] }, … }));
b.on(town, Stepped, (p) => p.x === 4 && p.y === 0 && send(town.plane, RaiseStreet({ at: 4 })));
b.on(town, Rose, () => sequence([send(town.places, LightNumber({ x: 4 })), wait(2.5),
                                 send(town.places, ChooseTarget({ x: 4, y: 5 }))]));
b.on(town, Arrived, (p) => p.x === 4 && p.y === 5 && [show(found, anyHouse), send(town.plane, RaiseAllStreets())]);
b.passWhen(town, Arrived, (p) => p.x === 4 && p.y === 5);
```

The lesson is the outermost element: it listens to `town`'s events and sends events down. One way of doing things at every level.

## From today to this

| Today | In the event model |
|---|---|
| action | an event the element listens to (`from: "screen"` if the student sends it) |
| signal | an event the element sends |
| group `when`, `route`; board `b.when`, `b.after` | `listens` + `on` in the listener, or the lesson's `b.on` |
| group `is` | values passed down |
| group `show` | the element draws nothing when its data says so |
| `tween`, `wait`, `seq`, `par`, `repeat`, `waitUntil`, `task` | motion data + the queue (`later`, `sequence`) |
| `changes` lists | open (below) |

## Open decisions

1. **`changes` lists.** Today each action lists the fields it may change; the build uses it to tell setup from live fields, and the runtime refuses others. Keep them per handler, or find out by playing (the build already plays boards; less precise, nothing written twice)?
2. **Names.** element / event / value / later, or keep prop / action / signal for continuity?
3. **Lesson sequences.** `sequence([...])` written into the queue: enough, or do lessons want something closer to a script?
4. **Speech.** `say()` waits for the voice to finish: the voice sends `Said` when done, so a lesson listens for it like anything else?

## Order of work (each step ends with `pnpm check` green)

1. **The core, beside today's.** `element`, `event`, values, the queue, motion, the clock (jump and rate) in `@chalk/prop` and the player's runtime; tests for order, scope, cancelling, replay from saved data plus inputs, jumping.
2. **The coordinate plane and its lesson, ported.** Its 7 parts, its 6 question families, the lesson. Checked against today: every board's picture as passed beside now (`changes`), `play` of each board as a student, the chapter `look`.
3. **The other props** (basics, decimal, primes) **and their lessons.** About 89 actions, 42 signals, 60 lesson rules in all; time is light (3 glides, 4 waits, 8 sequences, 7 repeats).
4. **Tools.** `play`, `look`, snapshots, Jugnu's context, the catalogue: read events in and out, values, and the queue ("in 0.3 s: Stepped (4, 0)").
5. **Remove the old.** Actions, signals, group links, board rules, the time language; docs (`making-a-prop.md`, `writing-content.md`, glossary) rewritten for four concepts.

Steps 1 and 2 decide it: if the coordinate plane doesn't read clearly simpler, we stop there.
