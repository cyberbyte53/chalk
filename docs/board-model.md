# The board model

A board is a stage with **props** on it, wired together in three ways. That's the whole model: authors (and Studio, and Jugnu) only ever deal with these.

## Props

Everything on a board is a prop: words, a character's line, a question, a number line, a circuit. The board itself is a prop too, named `board`. From outside every prop looks the same:

| | What | Example (number line) |
|---|---|---|
| **State** | One live view, read with `getState()`. Stored fields are the few independent quantities; derived fields follow from them and are read-only. A reader can't tell them apart. | stored `from`, `to`, `marker`; derived `between` ("1.4 and 1.5") |
| **Actions** | The only way stored fields change. Each says what it keeps fixed. Instant, or taking time (then it finishes). Flagged if it gives an answer away. | `moveMarker`, `zoomTo` (glides), `placeMark` |
| **Signals** | What it announces. A few are commits (logged). | `markerReleased` |
| **Parts** | What can be pointed at, by name. | `marker`, `tick:1.4`, `mark` |

A prop holds the laws of its own world; a lesson holds what is specific to the lesson. The number line knows nothing about square roots: the √2 lesson writes `line.marker * line.marker` in its own rules. Inverse questions get their own named action (a mirror's `moveObjectSoImageIsAt`), never a vague "set the image".

Code: `defineProp` in `@chalk/prop`; examples in `props/basics` (text, line, choice, goal, button, timer), `props/number-line`, `props/chance` (coin) and `props/plot` (graph).

## IS, WHEN, THEN

```text
IS     <prop>.<input> = <expression>         always true; recomputed whenever what it reads changes
WHEN   <prop>.<signal> [if <expression>] → <script>
THEN   a script: actions one after another, or together
```

- **IS** owns one of a prop's inputs (`text.text`, `goal.isMet`). One writer per field; no loops.
- **WHEN** answers signals one at a time, in order. A rule's script runs on its own; the next signal doesn't wait for it.
- **THEN** only exists inside a WHEN. The board opening is `board.started`, so a board's opening script is `WHEN board.started → …`.
- The learner wins: touching a prop stops anything the lesson is animating on it.
- The player can pause everything at once (when Jugnu opens).

### In a lesson file

```json
{
  "name": "guess",
  "root": { "name": "page", "kind": "column", "children": [
    { "name": "line", "kind": "prop", "prop": "numberLine", "with": { "from": 1, "to": 2, "marker": 1.5 } },
    { "name": "squareLabel", "kind": "prop", "prop": "text", "with": { "text": { "en": "", "hi": "" }, "style": "note" } },
    { "name": "guessRoot", "kind": "prop", "prop": "goal", "with": { "prompt": { "en": "…", "hi": "…" }, "about": "line", "concepts": ["sqrt-estimation"] } }
  ] },
  "is": [
    { "set": "squareLabel.text", "text": { "en": "{fixed(line.marker, 2)}² = {fixed(line.marker * line.marker, 4)}", "hi": "…" } },
    { "set": "guessRoot.isMet", "to": "1.98 <= line.marker * line.marker and line.marker * line.marker <= 2.02" }
  ],
  "when": [
    { "on": "board.started", "do": [{ "call": "title.say" }, { "call": "guessRoot.say" }] },
    { "on": "guessRoot.wrong", "if": "line.marker * line.marker > 2.02", "do": { "call": "guessRoot.giveFeedback", "args": { "text": { "en": "Its square is more than 2. Move left.", "hi": "…" } } } },
    { "on": "guessRoot.correct", "do": { "call": "board.pass" } }
  ]
}
```

Scripts: `{ "call": "prop.action", "args": {…} }`, `{ "wait": 0.8 }`, `{ "seq": […] }` (then), `{ "par": […] }` (with). A plain list is a `seq`.

An argument can be an expression, worked out when the action is called: `{ "x": { "expr": "coin.count" } }`. That's how one prop drives another.

Expressions: numbers, `"text"`, `true`/`false`/`null`, `prop.field`, `+ - * / ^`, `< <= > >= == !=`, `and or not`, and `abs sqrt min max round floor ceil fixed(x, digits)`. They read; they never change anything. Names in rules are camelCase.

### The board prop

| | |
|---|---|
| Actions | `pass` (show Continue), `show { name }`, `hide { name }`, `continue` (the learner's Continue; only after `pass`) |
| Signals | `started`, `continued` (commit) |

### Questions

A prop with the question role (`choice`, `goal`) has `status` (open / correct / wrong), `attempts`, `feedback` and `canCheck`, the action `check` and the signals `checked` (commit), `correct`, `wrong`. The player shows Check and the feedback bar for it; the lesson decides what happens next (`WHEN guessRoot.correct → board.pass`). One question per board.

### Student only

`"studentOnly": ["circuit.takeOutBulb"]` on a board lists the actions only the learner may do there: the move the board is asking of them. Jugnu can never do these, nor anything on the question, nor `board.pass` or Continue, nor an action marked `reveals` while the question is open; the runtime refuses them, including when his actions set off the lesson's own WHEN rules. The validator checks each entry is a real `prop.action`.

## Events

When the learner presses Continue, the board's event holds every prop's state as it was then (words and questions included) and whether the learner touched it, so the event stands on its own. A lesson leaves a prop out with `"isInEvents": false` where it places it, next to `isHidden`. See [events.md](events.md).

## Speech

Speaking props (`text`, `line`, questions) have `say`: it reads the line aloud and finishes when the line ends. Nothing is spoken unless a script says so. Publish makes audio only for lines some script tells to `say`.

What's shown and what's said can differ (√2 is said "square root of 2", H₂O "H 2 O", 25°C "25 degrees Celsius"). Screen text goes through the pronunciation rules in `content/pronunciations.json`, unless the line has its own `speak`. The voice only ever gets letters, digits and ordinary punctuation: anything else stops publish, so nothing nobody thought of is read out wrong. Which voice speaks for whom is `content/voices.json`.

## One prop driving another

From `class8-maths/ch4-data-handling/lessons/does-a-coin-settle.json`: a button tosses a coin, a timer tosses it 100 times, and every landing adds a point to a graph.

```json
"is": [
  { "set": "score.text", "text": { "en": "Heads: {coin.heads} of {coin.count}", "hi": "…" } },
  { "set": "tossOnce.isEnabled", "to": "not clock.isRunning" },
  { "set": "tossMany.isEnabled", "to": "not clock.isRunning" }
],
"when": [
  { "on": "tossOnce.pressed", "do": { "call": "coin.toss" } },
  { "on": "tossMany.pressed", "do": { "call": "clock.start", "args": { "every": 0.04, "times": 100 } } },
  { "on": "clock.tick", "do": { "call": "coin.toss" } },
  { "on": "coin.landed", "do": { "call": "chart.addPoint", "args": { "x": { "expr": "coin.count" }, "y": { "expr": "coin.headsFraction" } } } },
  { "on": "coin.landed", "if": "coin.count == 100", "do": [{ "call": "board.show", "args": { "name": "mayaSettles" } }, { "call": "mayaSettles.say" }, { "call": "board.pass" }] }
]
```

None of the props knows about the others: the coin doesn't know there's a graph, the graph doesn't know where its points come from. The lesson wires them.

## Time

Anything that changes over time is a timed action (`zoomTo` over 2 s), or a `timer` whose ticks a WHEN answers (the toss-100 run above). There is no separate motion format in lessons.

## What the validator checks

Every prop type, field, action, signal and argument named exists and type-checks (an expression argument is worked out on the starting state and checked too); starting states pass each prop's schema; IS targets are inputs, one writer each, no loops; no answer-revealing action on a board with a question; something calls `board.pass`; every line a script says reads cleanly aloud.
