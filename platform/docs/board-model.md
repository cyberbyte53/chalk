# The board model

A board is props, events between them, and one queue for time. That is the whole model: authors, Studio and agents only ever deal with these.

## Props

Everything is a prop: words, a question, Riya, the plane. A prop that holds props (the coordinate plane: its plane, places, walker, clues…) is a prop like any other, and so is the board itself (its **scene**, below). A prop that doesn't need a part leaves it out.

| Part | What it is | Riya (`walker`) |
|---|---|---|
| `variables` | its own data. Anyone can read them; only its own rules change them | `at`, `trail`, `walkFrom` |
| `start` | its variables before a board gives it any | at the corner |
| `facts` | worked out from its variables and needs; read like variables | `isWalking` |
| `needs` | what it must be given by whatever holds it | `window`, `upLines`, `target` |
| `actions` | **in**: what it can be asked to do; `from: "screen"` marks what the student can do | `step` (screen), `walkTo`, `backToStart` (screen) |
| `signals` | **out**: news it tells, to whoever holds it | `stepped`, `arrived`, `blocked` |
| `on` | a rule per action | how a step goes |
| `children` | the props it holds | none |
| `hear` | a rule per signal it hears from inside it | none |
| `give` | what it gives a child for a need, where a name differs | none |

A prop holds the laws of its own world; a lesson holds what is specific to the lesson. The walker knows nothing about Aman's house: she reads `target` as a need. Code: `prop()` in `@chalk/prop`; examples in `library/props/basics` (text, choice, goal) and `library/props/coordinates`. How to make one: [making-a-prop.md](making-a-prop.md).

### A rule

A rule gets the prop as it is now (`me`: variables, needs, facts, and each child by name), the event's payload, and its tools (`t`). It returns what happens, in order:

```ts
on: {
  step: (me, { direction }, t) => {
    const next = stepFrom(me, direction); // reads me.upLines, me.window
    if ("blocked" in next) return t.tell.blocked({ why: next.blocked });
    return glide(me, next.to, t);         // a planned move, `stepped` at its end
  },
},
```

| Tool | Does |
|---|---|
| `t.set({ … })` | changes its own variables |
| `t.tell.stepped({ … })` | tells one of its signals |
| `t.self.walkTo({ … })` | asks itself for one of its actions |
| `t.to.places.chooseTarget({ … })` | asks a prop it holds (`t.to.town.plane.raiseUpLine` from a board) |
| `t.later(0.3, …)` | does these 0.3 s from now, on the board's clock |
| `t.move("at", to, 0.3, { atEnd })` | a planned move (below) |
| `t.stop()` | drops what it has queued, and stops its moves where they are |

## Events

- **An action** asks one prop to do something. It may refuse ("this street isn't there yet"): its rule returns nothing, or tells why.
- **A signal** is news. The prop that tells it doesn't know who listens. It goes **up**: to the prop holding it, then that one's holder, on to the board, nearest first; each with a `hear` rule for it (`"places.targetChosen"`, or from a board `"town.walker.arrived"`) hears it. Siblings never hear each other: the coordinate plane hears `places.targetChosen` and asks Riya to go back, so Riya never knows a "places" exists, and is reused as she is.
- **Payloads are typed** and checked when sent.
- **An event sent while handling another runs straight away**, like a function call: each finishes, with everything it causes, before the next. So a replay or a check always gives the same order. A chain that comes back on itself is stopped after a limit, naming its path.

### Needs

A prop used in more than one place says what it needs, and any holder that can give it works. Where the holder has a variable or fact of the same name, it is given as it is; where a name differs, the holder writes one line: `give: { ask: { isMet: (me) => me.town.walker.at.x === 4 } }`. A need nothing gives fails when the prop is defined (`pnpm check`), and a need given is checked against what the child says it is as it is read. Needs are read live, never copied.

The board system guards the boundaries: a prop changes only its own variables, payloads have their shape, time runs in order. Whether a rule is *right* is for tests, witnesses and review.

## Time: one queue

- **The queue** holds only what is for later, each with the time it is due. On the student's screen the browser's frame loop moves the board clock to now and does what is due; checks, tests and the build **jump** the clock to the next entry, so a 36 s board is checked in a blink.
- **A planned move** is a motion whose every moment is known when it starts (Riya's glide, a street rising): `t.move` stores where from, where to, when and how long, and queues its end. Reading a moving variable gives its value now, for rules, facts, checks and drawings alike. Easings are named (`"linear"`, `"smooth"`). Changing a moving variable stops its move.
- **A tick** is for a motion where each moment depends on the last (a collision): the prop queues itself again every 1/60 s.
- **The student wins**: an action from the screen drops what the props holding that prop had queued for it.
- **CSS is only decoration.** If anything cares when a motion ends, it is a planned move.
- **Replay**: `Board.replay(root, given, log, until)` plays the student's logged taps again, at their times.

## A board: its scene

A board is a **scene**: the outermost prop, holding the board's pieces, laid out top to bottom. Its rules are the lesson's. Written with `scene()` in `@chalk/author`:

```ts
const streetAndHouse = page(
  "street-and-house",
  scene({
    purpose: "The main road is a number line, and 'Street 4' is one number on it. …",
    pieces: {
      title: words.title(t("Finding Aman's house", "अमन का घर ढूँढना")),
      town: place(coordinatePlane, setup(town(), { plane: { upLines: [] } })),
      reply: hidden(words.body(t("He replies: **House 5**. …", "…"))),
      found: hidden(words.definition(t("**Aman's house isn't on one line…**", "…"))),
    },
    passBy: "rules",
    hear: {
      "town.walker.stepped": (_, p, t) =>
        p.x === 4 && p.y === 0 && t.to.town.plane.raiseUpLine({ at: 4 }),
      "town.places.targetChosen": (_, p, t) => p.x === 4 && t.self.show({ name: "reply" }),
      "town.walker.arrived": (_, p, t) =>
        p.x === 4 && p.y === 5 && [t.self.show({ name: "found" }), t.self.pass()],
    },
    witness: [...walkTo("town", 4, 0), ...walkTo("town", 0, 5)],
  }),
);
```

| Part | What |
|---|---|
| `pieces` | the props on the board, by name, top to bottom: `place(def, given)`, `hidden(…)` for one shown later |
| `hear` | the lesson's rules: on a piece's signal, what happens |
| `onSaid` | when a line has been said, what happens |
| `give` | what the board gives a piece for a need (a goal's `isMet`) |
| `cues` | what is heard besides the pieces' own words: lines and sounds at moments ([sound.md](sound.md)) |
| `uses` | ready-made parts a pattern brings (a question with its notes and witness: `choice(…)`, `check(…)` in `@chalk/patterns`) |
| `passBy` | `"rules"`: the board passes only when a rule says `t.self.pass()`; else when its questions are right |
| `witness` | how a student gets the board right, played on the real props at publish |
| `noteChecks` | wrong answers and the note each should get, played at publish too |
| `purpose`, `standsFor` | what the board is for, and what its pieces stand for here, in the author's words, for whoever reads the board |

The step by step of that board:

| # | Event | Who hears it | What happens |
|---|---|---|---|
| 1 | the student taps → (4 times) | Riya | she checks the road each time; glides to (4, 0); tells `stepped` |
| 2 | `town.walker.stepped (4, 0)` | the board | asks the plane to raise Street 4 |
| 3 | `raiseUpLine 4` | the plane | the street rises (a planned move); `risen` at its end |
| 4 | Aman's house is chosen | the board | shows his reply |
| 5 | the student taps ↑ (5 times) | Riya | reads `upLines` (Street 4 is up), walks up, tells `arrived (4, 5)` |
| 6 | `town.walker.arrived (4, 5)` | the board | shows "found", and passes |

### The board's own actions and signals

| | |
|---|---|
| Actions | `show { name }`, `hide { name }`, `pass` (Continue shows), `continue` (the student's, after `pass`), `say { line }`, `hush`, `hearAgain` (the student's: what is showing is read again) |
| Signals | `started`, `shown { name }`, `said { line }`, `passed`, `continued` |

Rules call them as `t.self.show(…)`; a line can be declared on them (`board.said`).

### Questions

A prop with the question role (`choice`, `goal`) has `status` (open, correct, wrong), `attempts`, `feedback`, and, written in by the build, `concepts` and `isGraded` (a bank question's checks count towards mastery, a page's don't); the actions `check` and `retry`; the signals `checked`, `correct`, `wrong`. A choice is checked the moment an option is tapped; a goal has its own Check and is right when the board gives it `isMet`. A board may ask any number; it passes when they are all right, unless it passes by its rules.

## What the student sees

Agents never read a prop's variables. They read what the student can see right now, read from the one place it is written: the view. Each part the student can tell apart is tagged on the element that draws it (`does`, `says`, `shows`: [making-a-prop.md](making-a-prop.md)); `describeView` draws the view (as markup, the same code the phone runs) and reads the tags back:

```ts
{
  summary: "…",                                      // the prop's `summary`
  elements: [
    { id: "walker/step:up", does: "walker.step", args: { direction: "up" } },
    { id: "places/target", value: { x: 4, y: 5 }, words: "Aman's house: Street number 4, House number 5" },
  ],
  hidden: { … },                                      // its `offScreen` variables: known, not shown
}
```

Values are typed, with `words` for how the screen writes them when that differs. A part's elements are named under it (`walker/step:up`) and its inputs do its actions by path (`walker.step`). It holds by construction: what is described is what is drawn. Two parts with one name are refused, and so is a tag that says neither what it does nor what it shows. `checkProp` presses everything a view offers from some starting states and reports any student action no input offers.

## Speech, events, checks

- **Speech.** Every line on a board is said in turn, and what the student causes is said at once instead: [sound.md](sound.md).
- **Events.** Everything the student does, and what it set off, is recorded with nothing written per board: [events.md](events.md).
- **Checks.** A prop is checked when it is defined (its needs given, its layout's names), by its law tests and `checkProp`. A board is checked at publish by playing it: its witness gets it passed, each wrong answer gets its note, in every language, and a line no passing run says is reported.
