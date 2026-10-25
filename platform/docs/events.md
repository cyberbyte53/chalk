# Events

Like a market-data log: every time something worth recording happens, we write one line (JSON). That log is the only record of what learners did; mastery, practice and the teacher view are all computed from it.

## The model

- **Everything with behaviour is a state machine:** the lesson, each board, each question. Each has a type, an id, a state and the inputs it accepts.
- **An event is one input applied to one machine, plus the machine's state right after.**
- **Only commits are logged:** the moments the learner decides something, like pressing **Check** or **Continue**. Dragging the number line or picking an option before checking changes state but isn't logged; the next commit captures the result.
- **Commits are signals.** Props announce things on the board (a coin landed, Check pressed); a few signals are marked as commits, and only those become events. The player raises them with `raiseEvent`, bound to the machine.

Today:

| Raised by | Machine | Input | State after |
|---|---|---|---|
| Continue (`board.continued`) | `board/<item id>` | `continue { nodes, actions }`: every node on the board (words and questions too) saved as it was when pressed, by address, each as `{ type: "<prop>@<hash>", facts, isTouched }`; and every learner action on the board, in order, as `{ node, action, args, t }` on the board's clock. A prop placed with `isInEvents: false` is left out | `{ phase: "passed" }` |
| Check (`<question>.checked`) | `question/<item id>#<address>` | `check { submitted, saw }`: the option picked, or the facts of the node the question is about; and what the learner saw of the question and that node, every part as drawn | `{ status: "correct" \| "wrong", attempts, isGraded }` |
| Lesson player | `lesson/<id>` | `start`, `complete`, `leave` | `{ status: "playing" \| "completed" \| "left", boardIndex }` |
| Narration | `line/<item id>#<address>` | `audioFailed { reason }` | `{ audio: "failed" }` |
| A turn with Jugnu | `jugnu/<item id>` | `ask { text }`: what the learner asked; or `moved { props }`: they acted on props he handed back | `{ reply, steps, watching, model }`: what he said; each thing he did (acted, pointed, calculated, handed back, with what changed or why it was refused); the props he's waiting on; which model |

**Input** is what happened plus the data that came with it; **state** is the machine's own state afterwards, the same shape every time for a machine type. Boards and nodes are named by their item id and address (see "Ids" below).

## Shape

```ts
Event = {
  envelope: { id, schemaVersion, sessionId, seq, producedAt, actor, lessonId, item: { id, path, version } },
  machine:  { type, id },
  input:    { type, ... },
  state:    { ... },
}
```

- `seq`: order within the session (phone clocks can't be trusted for order).
- `producedAt`: Unix ms when the phone produced it.
- `actor`: `learner`, `lesson`, `app` or `jugnu`. Only the learner's own commits are evidence; what Jugnu does on the board never counts as the learner touching it.

## Example

A concept's pages, as the log records them (`A` is a page's item id, `B` the next one's):

```text
seq  actor    machine              input                                                              state after
 0   app      lesson/concept/c1    start                                                              { status: playing, boardIndex: 0 }
 1   learner  board/A              continue { nodes: { title, mayaSquares, line, arjunBetween }, actions: [] } { phase: passed }
 2   learner  question/B#guessRoot check { submitted: line { marker: 1.62 }, saw: [line/marker 1.62, …] } { status: wrong,   attempts: 1 }
 3   learner  question/B#guessRoot check { submitted: line { marker: 1.41 }, saw: [line/marker 1.41, …] } { status: correct, attempts: 2 }
 4   learner  board/B              continue { nodes: { …, line: { type: numberLine@…, isTouched: true, facts: { marker: 1.41, … } } }, actions: [line.moveMarker …] } { phase: passed }
 5   app      lesson/concept/c1    complete                                                           { status: completed, boardIndex: 2 }
```

A Continue event stands on its own: it holds every node's facts, question wording included, so Jugnu or an analysis can read what the board was without looking anything up, and its actions replay the session. Each node says whether the learner touched it, which separates exploring from watching. A lesson leaves a prop out with `isInEvents: false` where it places it, for anything not worth keeping.

Every event names the item and its version (the hash of the code that makes the board), so the board as authored can always be found again; a question's check also keeps what the learner saw, so history never depends on recomputing it.

In code, the player binds `raiseEvent` to the machine and calls it when the commit signal arrives:

```tsx
raiseEvent(Actor.Learner, { type: "continue", props }, { phase: "passed" });
```

## Ids

A board is named by the id of the built page or question it was made from: a hash of where that lives in content/ (plus a question's params row), so nobody types it. A node on the board is named by its address (`line`, `machine/plane`), and a question or a line by both: `<item id>#<address>`. Renaming a folder or a piece gives new names; the build reports what it moved. A board made by hand (a test board) is named by its name.

A saved board (`runtime.save()`) names each node's prop and the shape of its facts (`numberLine@1a2b3c4d`, from its schema). It is read back (`runtime.load()`) only by props of the same shape: a record from before a prop's facts changed is refused, loudly, never read wrong.

## Notes

- Events are plain data, typed per machine with Zod (a TypeScript union), checked before they're saved.
- They're saved on the phone (IndexedDB), then uploaded in batches to `POST /api/events`; the server keeps each once by its id, so a batch sent again after a lost reply counts once. Anything can subscribe to them on the phone (the uploader, the dev log).
- Progress is worked out from them, nothing else: a concept's pages are the lesson `concept/<id>`, its practice `practice/<id>`; a practice run's score is each question's first check (`progressFrom` in `@chalk/api`, the same on phone and server).
- Adding something new: mark the prop's signal as a commit (`isCommit`), map it to its machine in the player, and add the machine's input and state to the types and the table above.
- Until the first learner, shapes change freely and `schemaVersion` stays 1. After that, shapes only change by adding optional fields; anything else bumps `schemaVersion`.
- No personal data in events, only ids.
