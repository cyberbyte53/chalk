# The event model (proposal)

Status: **agreed in conversation (2026-10-30), not built yet.** Steps 1 and 2 of the order of work below decide it: if the coordinate plane and its lessons don't read clearly simpler, we stop there.

## Why

Today a board is built from about ten ideas that grew one need at a time:
- actions and signals;
- group links (`is`, `when`, `route`, `show`);
- board rules (`b.when`, `b.after`, `b.passWhen`, `inOrder`);
- nine time words (`tween`, `wait`, `seq`, `par`, `waitUntil`, `repeat`, `task`, `call`, `say`).

This causes three problems:
- **Hard to follow.** Why Riya goes back to the corner is written in the group's file, not in Riya's.
- **Time is hidden.** A glide or a wait runs inside the runtime. Nothing can say what is about to happen, and checks wait in real time.
- **Timing done in CSS.** Some real timing lives in CSS (the chemistry bench's thermometer, the magnetism motor), so a check sees the result before the student does.

The new model uses one kind of building block, two kinds of events, and one queue for time.

## 1. One building block: the prop

Everything is a prop, the way every cell has the same parts. Riya, the plane and the white screen are props. A group, such as the coordinate plane or the lens bench, is a prop that holds props. The board is the outermost one. A prop that doesn't need a part leaves it empty.

| Part | What it is | Riya | White screen | Coordinate plane |
|---|---|---|---|---|
| `variables` | its own data. Anyone can read them; only it changes them | `at`, `trail`, `move` | none | none |
| `facts` | worked out from its variables (and needs); readable like variables | `isWalking` | none | none |
| `needs` | what it must be given by whatever holds it (below) | `upLines`, `window`, `target` | `x`, `isSharp`, `min`, `max` | none |
| `actions` | **in**: what it can be asked to do. `from: "screen"` means the student can ask | `step` (screen), `walkTo`, `backToStart` (screen) | `move` (screen) | none |
| `signals` | **out**: news it tells, to anyone listening | `stepped`, `arrived`, `blocked` | `released` | none |
| `on` | one rule per action, and per signal it listens to | her rules | `move` → tell its holder | its rules, if any |
| `children` | the props it holds | none | none | plane, places, walker, clues, … |
| `draw` | its drawing, made from what it can read | her figure | the screen | lays out its children |

**A rule** gets the prop's own variables and needs, and the event's payload. It returns three things:
- what changes (only its own variables);
- events sent now;
- events for later.

```ts
export const walker = prop({
  variables: { at: point, trail: z.array(point), walkFrom: point.nullable(), move: plannedMove.nullable() },
  needs: { upLines: z.array(z.number()).nullable(), window: planeWindow, target: point.nullable() },
  actions: {
    step: action({ direction: z.enum(["up", "down", "left", "right"]) }, { from: "screen" }),
    walkTo: action(point),
    backToStart: action({}, { from: "screen" }),
  },
  signals: { stepped: signal(point), arrived: signal(point), blocked: signal({ why: z.string() }) },
  on: {
    step: (me, { direction }) => {
      const next = stepFrom(me, direction);                  // reads me.upLines, me.window
      if ("blocked" in next) return { send: [blocked({ why: next.blocked })] };
      return glide(me, "at", next.to, 0.3, { then: arrivedAt(me, next.to) });
    },
    …
  },
});
```

### Needs: like a C++ template

A prop that is used in more than one place says what it needs and nothing more. Any holder that can give it those things works with it. The white screen is used in both the lens bench and the mirror bench, and works the same in each.
- **When the names match**, the holder writes nothing: the lens has `isSharp`, so the screen gets the lens's `isSharp`.
- **When a name differs**, the holder writes one line: `screen: { isSharp: (s) => s.imageIsSharp }`.
- **A holder that can't give a need** fails `pnpm check`, the same way a template that doesn't fit fails to compile.
- **Needs are read live, every time.** They are never copied, so they can never go stale.

This is today's `is` (the coordinate plane's `pick(s.plane, walkerReads.keys)`), but you write a line only when a name differs. It is the one way to read another prop: Riya needs `upLines` the same way the screen needs `isSharp`, so any prop can later be reused unchanged.

## 2. Events: actions in, signals out

- **An action** asks one prop to do something, and the prop may refuse ("this street isn't there yet").
- **A signal** is news that something has happened. The prop that sends it doesn't know who listens.
- **Who hears what.** A prop listens to signals from inside the prop that holds it. A lesson listens to its pieces' signals by name (`town.walker.arrived`). With three planes on one board, each plane's signals stay with that plane.
- **Payloads are typed** and checked when they are sent, as they are today.
- **The student's events** are the actions marked `from: "screen"`. Agents and Jugnu read "what can the student do" from that list. A drag that ends ("marker let go") is a screen action too, never a signal sent from the drawing.

### Instant events run like function calls

An event sent while handling another one runs straight away. Each event finishes, along with everything it causes, before the next one starts:
1. Riya's `step` changes `at`.
2. Then `stepped` is delivered, together with everything it causes (the lesson raises street 4).
3. Then `arrived` is delivered.

The order is always the same, so a replay or a check gives the same result every time.

**Loops.** A chain that comes back on itself (arrived → pick a house → back to start → arrived …) is a bug in the rules. The system notices it, stops after a limit, and names the path, instead of freezing the screen.

**Correctness.** The system guards the boundaries: a prop changes only its own variables, payloads have the right shape, and time runs in order. Whether a rule is *right* is up to whoever writes it, and tests and review catch that. That's why there is no `changes: [...]` list. Who changes what (setup or live fields, "changed by") is worked out by playing the boards, which the build already does.

## 3. Time: one queue, one loop

- **The queue** holds only events for later, each one with the time it's due. Instant events never go in it.
- **The loop.** On the student's screen it is the browser's frame loop (about every 16 ms). Each frame, it moves the board clock to now, delivers every entry that is due (earliest first, and same-time entries in the order they were queued), then redraws.
- **Checks, tests and the build** don't wait: they jump the clock straight to the next entry, so a 36 s board is checked in a blink. `look` and `play` can run the clock faster for watching.
- **Helpers.** These are functions that only put things in the queue:
  - `wait(0.3, X)`: X, 0.3 s from now.
  - `sequence([A, 2.5, B])`: A now, B 2.5 s later.
  - `repeat(1, X)`: X now, and the next one queued each time it runs.
  - `glide(…)`: below.

### Planned moves and ticks

**The test:** when a motion starts, can you say where it will be at every moment?
- **Yes, a planned move.** Store `{ from, to, startedAt, takes, ease }` and queue its end. The drawing works out where it is each frame. Examples: Riya's glide, a street rising, the number line's zoom, the semicircle's swing, the lap-race clock, the electrolysis cell filling, the motor spinning, the gas (where every particle is follows from `travel`).
- **No, an evolving system.** Each moment depends on the one before, so the prop queues a tick for itself (every 1/60 s) and works out the next small step. Today's only example is collision. A pendulum or bumping particles would be ticks too.

**Rules for moves:**
- **Reading a moving variable gives its value now.** That holds for rules, facts, checks and drawings alike: mid-glide, Riya is where she is drawn.
- **Easings have names** (`"linear"`, `"smooth"`, `"log"`), never functions.
- **Changing a moving variable stops its move** and drops the move's end event. A drag mid-swing stops the swing.
- **A student action on a prop drops the lesson's queued steps for that prop**, as it does today.
- **Ticking on purpose is done in the formula.** A counter that steps by 0.25 s rounds its value: `floor(t / 0.25) * 0.25`.

### CSS is only decoration

If a lesson, a check or another prop cares when something finishes, it is a variable with a planned move, not a CSS animation. Light flowing along a ray, stars twinkling and button presses stay in CSS.

## 4. Voice

Lines are made into audio at publish (`platform/studio/src/voice`, `authoring/voices.json`), so their length is known.
- **Publish** saves each file's length next to it, per language.
- **`say(line)`** plays the audio and queues `said` for now + its length. It is a normal "later", so checks jump past it, and Hindi and English simply take different times.
- **When the audio starts late** (while loading), `said` is queued when it actually starts.
- **No audio** (failed, muted, not made yet): the length is worked out from the text.
- **Skipping or acting early** sends `said` straight away and drops the queued one.
- **Later, if wanted:** cues inside a line ("light house 5 when she says *House 5*"), from the voice tool's word times.

## 5. Saving

Progress is saved at the board level. A student who comes back starts that board fresh. The time queue lives only while the board is open and is never saved.

## A board in it: Finding Aman's house

```ts
const town = b.place(coordinatePlane, "town", setup(bareTown(), { plane: { upLines: [] }, … }));

b.on(town.walker.stepped, (p) => p.x === 4 && p.y === 0 && send(town.plane.raiseStreet({ at: 4 })));
b.on(town.plane.risen, (p) => p.at === 4 && [
  show(fiveHouses), send(town.places.lightLine({ axis: "x", value: 4 })),
  wait(2.5, town.places.chooseTarget({ x: 4, y: 5 })) ]);
b.on(town.places.targetChosen, (p) => p.x === 4 && show(reply));
b.on(town.walker.arrived, (p) => p.x === 4 && p.y === 5 && [
  show(found, anyHouse), send(town.plane.raiseAllStreets()), pass() ]);
```

Today the same board takes 7 rules with 3 verbs (`b.when`, `b.after`, `b.passWhen`, `overview.ts:149–193`). Here it takes 4 rules with one verb. The condition reads the event (`p.at === 4`), not the board.

The same board, step by step:

| # | Event | Who hears it | What changes |
|---|---|---|---|
| 1 | the student taps → (4 times) | Riya | she checks the road each time; `at` goes to (4, 0); she sends `stepped (4, 0)` |
| 2 | `stepped (4, 0)` | the lesson | it asks the plane to `raiseStreet 4` |
| 3 | `raiseStreet 4` | the plane | street 4 rises (a planned move); `risen` is queued for when it ends |
| 4 | `risen 4` | the lesson | it shows the text, lights 4, and queues `chooseTarget` for 2.5 s later |
| 5 | (2.5 s later) `chooseTarget (4, 5)` | places | Aman's house is chosen |
| 6 | the student taps ↑ (5 times) | Riya | she reads `upLines` (street 4 is up), walks up, and sends `arrived (4, 5)` |
| 7 | `arrived (4, 5)` | the lesson | it shows "Found it!", raises every street, and the board is passed |

## From today to this

| Today | New |
|---|---|
| action | action (in), with `on` for what it does |
| signal, `raise` | signal (out), in what a rule sends |
| `changes: [...]` | gone (worked out by playing) |
| `byLearner: true` | `from: "screen"` |
| group `is` | `needs` (a line only where a name differs) |
| group `when`, `route` | the listener's own `on` |
| group `show` | the prop draws nothing when its variables or needs say so |
| `b.when`, `b.after`, `b.passWhen`, `inOrder` | `b.on`, with `show`, `send`, `wait`, `pass` |
| `tween` | a planned move |
| `wait`, `seq`, `repeat`, `task`, `waitUntil` | the queue and its helpers |
| `say()` | a "later" of the line's known length |
| `tween`/`repeat` with `while` (stop when a flag flips) | changing the moving variable, or the prop dropping its own queued entries |
| signals sent from a drawing | screen actions |
| `hidden`, `describe`, view tags (`does`, `says`, `shows`), frames, sizes, invariants | stay as they are |

## What we give up

- **Long scripts** (A, wait, B, wait, C) become `sequence([...])` or a chain of `wait`s. Lessons have 8 of these today.

## Open

- **Instant events and loops.** What the loop limit is, and how the path is shown.
- **Facts on moving variables.** Facts that depend on a moving variable ("hydrogen made so far") read it at the board clock, through the same reader as the drawing. To be confirmed when the core is built.

## Order of work (each step ends with `pnpm check` green)

1. **The core, beside today's.** `prop` with the parts above; `needs` and their check; instant events and the loop guard; the queue, the loop, jumping and rate; planned moves; the helpers. Tests for order, scope, cancelling, jumping and needs. **Voice:** publish saves each line's length.
2. **The coordinate plane, its lessons and voice.** Its 7 props and 6 question families, and the lesson's boards, all spoken. Then compare them with today: every board's picture as passed beside now (`changes`), `play` of each board as a student (in English and Hindi, with sound and muted, tapping ahead mid-line), and the chapter's `look`. **If it doesn't read clearly simpler, stop here.**
3. **The other live props** (basics, decimal, primes) **and their lessons.**
4. **Tools.** `play`, `look`, snapshots, Jugnu's context and the catalogue read actions, signals, needs and the queue ("in 0.3 s: stepped (4, 0)").
5. **Remove the old**, and rewrite the docs (`making-a-prop.md`, `writing-content.md`, the glossary).
6. **`props-later`**, package by package as each chapter is taken up: there, timing moves out of CSS (chemistry bench, magnetism) and the light bench's leaves become props with needs.
