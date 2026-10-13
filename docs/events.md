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
| Continue (`board.continued`) | `board/<id>` | `continue { props }`: every prop on the board (words and questions too) as it was when pressed, each as `{ isTouched, state }`. A prop placed with `isInEvents: false` is left out | `{ phase: "passed" }` |
| Check (`<question>.checked`) | `question/<id>` | `check { submitted }`: the option picked, or the state of the prop the question is about | `{ status: "correct" \| "wrong", attempts }` |
| Lesson player | `lesson/<id>` | `start`, `complete`, `leave` | `{ status: "playing" \| "completed" \| "left", boardIndex }` |
| Narration | `line/<id>` | `audioFailed { reason }` | `{ audio: "failed" }` |
| A turn with Jugnu | `jugnu/<board id>` | `ask { text }`: what the learner asked; or `moved { props }`: they acted on props he handed back | `{ reply, steps, watching, model }`: what he said; each thing he did (acted, pointed, calculated, handed back, with what changed or why it was refused); the props he's waiting on; which model |

**Input** is what happened plus the data that came with it; **state** is the machine's own state afterwards, the same shape every time for a machine type. Boards and pieces are identified by their permanent ids (see "Ids" below).

## Shape

```ts
Event = {
  envelope: { id, schemaVersion, sessionId, seq, producedAt, actor, lessonId, contentVersion, boardId },
  machine:  { type, id },
  input:    { type, ... },
  state:    { ... },
}
```

- `seq`: order within the session (phone clocks can't be trusted for order).
- `producedAt`: Unix ms when the phone produced it.
- `actor`: `learner`, `lesson`, `app` or `jugnu`. Only the learner's own commits are evidence; what Jugnu does on the board never counts as the learner touching it.

## Example: "Where does √2 live?"

The real log from playing the lesson (ids from the published lesson: board 2 is "guess", question 4 on it is "guess-root"):

```text
seq  actor    machine                                  input                                                              state after
 0   app      lesson/class9-maths/ch1/where-is-root-2  start                                                              { status: playing, boardIndex: 0 }
 1   learner  board/1                                  continue { props: { 2 title, 3 mayaSquares, 4 line, 5 arjunBetween } } { phase: passed }
 2   learner  question/4                               check { submitted: prop 3, marker 1.62 }                            { status: wrong,   attempts: 1 }
 3   learner  question/4                               check { submitted: prop 3, marker 1.41 }                            { status: correct, attempts: 2 }
 4   learner  board/2                                  continue { props: { …, 3: { isTouched: true, state: { marker: 1.41, … } }, … } } { phase: passed }
 5   learner  board/3                                  continue { props: { 2 title, 3 line, 4–6 lines } }                  { phase: passed }
 6   learner  question/2                               check { submitted: "exactly-1-41" }                                 { status: wrong,   attempts: 1 }
 7   learner  question/2                               check { submitted: "never-ends" }                                   { status: correct, attempts: 2 }
 8   learner  board/4                                  continue { props: { 2: { isTouched: true, state: { prompt, options, selected, … } } } } { phase: passed }
 9   app      lesson/class9-maths/ch1/where-is-root-2  complete                                                           { status: completed, boardIndex: 4 }
```

A Continue event stands on its own: it holds every prop's state, question wording included, so Jugnu or an analysis can read what the board was without looking anything up. Each prop says whether the learner touched it, which separates exploring from watching. A lesson leaves a prop out with `isInEvents: false` where it places it, for anything not worth keeping.

Every published version is also kept (`published/versions/<lesson>/<version>.json`), and every event names its version, so the board as authored can always be found again.

In code, the player binds `raiseEvent` to the machine and calls it when the commit signal arrives:

```tsx
raiseEvent(Actor.Learner, { type: "continue", props }, { phase: "passed" });
```

## Ids

Boards and pieces have a **name** (chosen by the author, free to rename, used inside the lesson file) and a **permanent id** (a number handed out by `pnpm publish-lesson`, never changed or reused). Events use the ids, so history stays intact when things are renamed, reordered, inserted or deleted. Deleted ids are retired for good.

## Notes

- Events are plain data, typed per machine with Zod (a TypeScript union), checked before they're saved.
- They're saved on the phone, then uploaded in batches. Anything can subscribe to them on the phone (the dev log, the uploader).
- Adding something new: mark the prop's signal as a commit (`isCommit`), map it to its machine in the player, and add the machine's input and state to the types and the table above.
- Until the first learner, shapes change freely and `schemaVersion` stays 1. After that, shapes only change by adding optional fields; anything else bumps `schemaVersion`.
- No personal data in events, only ids.
