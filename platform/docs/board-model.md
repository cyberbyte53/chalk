# The board model

A board is a stage with **props** on it, wired together in three ways. That's the whole model: authors (and Studio, and Jugnu) only ever deal with these.

## Props

Everything on a board is a prop: words, a character's line, a question, a number line, a circuit. The board itself is a prop too, named `board`. From outside every prop looks the same:

| | What | Example (number line) |
|---|---|---|
| **State** | One live view, read with `getState()`. Stored fields are the few independent quantities; derived fields follow from them and are read-only. A reader can't tell them apart. | stored `from`, `to`, `marker`; derived `between` ("1.4 and 1.5") |
| **Actions** | The only way stored fields change. Each says what it keeps fixed. Instant, or taking time (then it finishes). Flagged if it gives an answer away. | `moveMarker`, `zoomTo` (glides), `placeMark` |
| **Signals** | What it announces. A few are commits (logged). | `markerReleased` |
| **What the student sees** | Read from what its view draws: one line, then each part the student can tell apart, an input with what it does or something read with its value. The only way Jugnu sees a prop; what `point` can name. See below. | "a number line from 1 to 2, dot at 1.75"; `marker: 1.75`, `tick:1.4`, `mark:√2 at 1.41` |
| **Role** | What it is for: an explainer, a question, or part of the page. | explainer |

A prop holds the laws of its own world; a lesson holds what is specific to the lesson. The number line knows nothing about square roots: the √2 lesson squares `at(line).marker` in its own rules. Inverse questions get their own named action (a mirror's `moveObjectSoImageIsAt`), never a vague "set the image".

Code: `defineProp` in `@chalk/prop`; examples in `library/props/basics` (text, choice, multi-choice, order-steps) and `library/props/primes`. Props made of props are groups and hosts ([making-a-prop.md](making-a-prop.md#0-build-from-what-exists-first)).

## What the student sees

Jugnu never reads a prop's state. He reads what the student can see right now, and it is read from the one place it is written: the view. Each part the student can tell apart is tagged on the element that draws it (`does`, `says`, `shows`: [making-a-prop.md](making-a-prop.md#4-write-the-view)); `describeView` draws the view from the state (as markup, the same code the phone runs) and reads the tags back:

```ts
{
  summary: "a number line from 1 to 2 with a dot at 1.75",   // the prop's `summary`
  elements: [
    { id: "marker", value: 1.75, does: "moveMarker", isByHand: true },  // only while it is drawn
    { id: "tick:1.4", value: 1.4 }, …,
    { id: "mark:√2", value: 1.41, words: "√2 at 1.41" },
  ],
  hidden: { answer: "b" },                    // its `offScreen` fields: known, not shown
}
```

Values are typed (`1.4`, `{ x: 2, y: 3 }`), with `words` for how the screen writes them when that differs ("1.40"; Jugnu reads the words). An input says the action(s) it does, its arguments, whether its own handler works them out (`isByHand`), and whether it is off now. In a group, a child's parts are named under it (`plane/handle`) and its inputs do its actions by path (`plane.move`). The chalk MCP's `look` returns a piece this way, with where each part is drawn (file:line) and what the student can do ([seeing-boards.md](seeing-boards.md)).

It holds by construction: what is described is what is drawn, because it is read from the drawing. A part not drawn now (a hidden dot, a marker outside the window) isn't there. Two parts with one name are refused; so is a tag that says neither what it does nor what it shows. `checkProp` presses everything a view offers from some starting states and reports any learner action no input offers.

Where the lesson needs to say what a prop stands for here ("the student's guess for √3"), it says so in the board's `jugnu` notes; the prop's own words stay lesson-free.

**A worked example: a parallel circuit with meters.** The state holds every component, its current, voltage and brightness, and node coordinates. The student sees three meter dials, two bulbs and a switch. What the student sees:

```
summary: a parallel circuit: a cell, two branches each with an ammeter and a bulb, a switch S in bulb B's branch, a main ammeter before the branches
elements:
  cell        1.5 V
  mainMeter   reads 0.45 A
  meterA      reads 0.30 A
  bulbA       glowing (5 Ω)
  switchB     closed
  meterB      reads 0.15 A
  bulbB       glowing (10 Ω)
```

No wire currents, no brightness as a decimal, no node ids: the student can't see them. Bulb B's current is on screen only because meter B shows it, so it appears once, as the meter's reading. After `try setSwitch(switchB, open)` Jugnu gets the elements that changed: `mainMeter reads 0.30 A (was 0.45)`, `meterB reads 0 A`, `switchB open`, `bulbB dark`. He can see for himself that the main meter now shows one of the question's options, and decide, as a tutor would, whether to show it.

**Evidence.** What the student has committed to is read from what the question shows: how many times they checked, the last result and its feedback, what they have picked. Moving things around is exploring, not an answer, so nothing else is kept: there is no history of moves. If he wants to know what they tried, he asks.

## IS, WHEN, THEN

```text
IS     <prop>.<input> = a function of the board       always true; worked out whenever it is read
WHEN   <prop>.<signal> [if a function of the board] → <script>
THEN   a script: actions one after another, or together
```

- **IS** owns one of a prop's inputs (`text.text`, `goal.isMet`). One writer per field; no loops (a loop is refused, naming it).
- **WHEN** answers signals one at a time, in order. A rule's script runs on its own; the next signal doesn't wait for it.
- **THEN** only exists inside a WHEN. The board opening is `board.started`, so a board's opening script is `WHEN board.started → …`.
- The learner wins: touching a prop stops anything the lesson is animating on it.
- The player can pause everything at once (when Jugnu opens).

Rules are code, typed from the props they read: `at(piece)` is a piece's view (its stored and derived fields).

```ts
const line = b.prop(numberLine, "line", { from: 1, to: 2, marker: 1.5 });
const square = b.prop(text, "square", { style: TextStyle.Note });
b.is(square.input.text, (at) => {
  const m = at(line).marker;
  return t(`${m}² = ${(m * m).toFixed(4)}`, `${m}² = ${(m * m).toFixed(4)}`);
});
b.when(guess.on.wrong, guess.call.giveFeedback({ text: tooBig }), (at) => at(line).marker ** 2 > 2.02);
b.passWhen(guess.on.correct);
```

Scripts: `x.call.action(args)`, `wait(0.8)`, `inOrder(…)` (then), `together(…)` (with). Arguments can be worked out from the board when the call runs: a function of `at` instead of values (`(at) => ({ x: at(coin).count })`). That's how one prop drives another. What each IS read when it last ran is noted (`boundReads`), for `look`'s "worked out from".

### The board prop

| | |
|---|---|
| Actions | `pass` (show Continue), `show { name }`, `hide { name }`, `continue` (the learner's Continue; only after `pass`) |
| Signals | `started`, `continued` (commit) |

### Questions

A prop with the question role (`choice`, `goal`) has `status` (open / correct / wrong), `attempts`, `feedback`, `canCheck`, and, written in by the build, `concepts` (what it is about) and `isGraded` (whether its checks count towards mastery: bank questions yes, a page's questions no), the action `check` and the signals `checked` (commit), `correct`, `wrong`. Each answers where it sits: a choice is checked the moment an option is tapped, a goal has its own Check, and both show their feedback right below. A board may ask any number of questions; the lesson decides what happens next (`WHEN guessRoot.correct → board.pass`). The footer only ever shows Continue, once the board passes.

### Student only

`"studentOnly": ["circuit.takeOutBulb"]` on a board lists the actions only the learner may do there: the move the board is asking of them. Jugnu can never do these, nor anything on the question, nor `board.pass` or Continue, nor an action marked `reveals` while the question is open; the runtime refuses them, including when his actions set off the lesson's own WHEN rules. Beyond those, what a demonstration would give away is his judgement: he knows the answer, sees what the student would see, and his persona says to nudge, never tell. The validator checks each entry is a real `prop.action`.

## Events

Everything the learner does on a board is recorded on its own: each action they (or Jugnu) take, each signal the board raises and the act that set it off, with nothing written per board or prop. See [events.md](events.md).

## Speech

Speaking props (`text`, `line`, questions) have `say`: it reads the line aloud and finishes when the line ends. Nothing is spoken unless a script says so. Publish makes audio only for lines some script tells to `say`.

What's shown and what's said can differ (√2 is said "square root of 2", H₂O "H 2 O", 25°C "25 degrees Celsius"). Screen text goes through the pronunciation rules in `authoring/pronunciations.json`, unless the line has its own `speak`. The voice only ever gets letters, digits and ordinary punctuation: anything else stops publish, so nothing nobody thought of is read out wrong. Which voice speaks for whom is `authoring/voices.json`.

## One prop driving another

A button tosses a coin, a timer tosses it 100 times, and every landing adds a point to a graph:

```ts
b.is(score.input.text, (at) => t(`Heads: ${at(coin).heads} of ${at(coin).count}`, …));
b.is(tossOnce.input.isEnabled, (at) => !at(clock).isRunning);
b.when(tossOnce.on.pressed, coin.call.toss());
b.when(tossMany.on.pressed, clock.call.start({ every: 0.04, times: 100 }));
b.when(clock.on.tick, coin.call.toss());
b.when(coin.on.landed, chart.call.addPoint((at) => ({ x: at(coin).count, y: at(coin).headsFraction })));
```

None of the props knows about the others: the coin doesn't know there's a graph, the graph doesn't know where its points come from. The lesson wires them.

## Time

Anything that changes over time is a timed action (`zoomTo` over 2 s), or a `timer` whose ticks a WHEN answers (the toss-100 run above). There is no separate motion format in lessons.

## What the validator checks

Every prop type, field, action, signal and argument named exists and type-checks (each rule, condition and worked-out argument is run on the board as it opens: a field it reads that the piece hasn't is reported, and its value checked); starting states pass each prop's schema; IS targets are inputs, one writer each, no loops; layers that exclude each other aren't both on; no answer-revealing action on a board with a question; something calls `board.pass`; every line a script says reads cleanly aloud.
