# Events

Content is public: anyone can open a chapter and solve it. What the server can't know is **what this child did**. Events are the channel that carries that from the phone to the server: everything the learner (or Jugnu) does is recorded, automatically, as entries on nodes of the course tree. Progress, the teacher view, content and prop statistics, and later the scheduler are all worked out from that stream and the tree. The design is in the project doc `plans/events-and-names.md`.

## What is recorded

Everything the learner does, with nothing written per board, prop or signal:

| kind | when | payload |
|---|---|---|
| `open` | a board opens, or a book, chapter or concept is on screen | how: `mode`, `wasPassed`, `locale`, `hasAudio`; why: `reason` |
| `close` | it closes | |
| `cause` | the learner or Jugnu acts on a board: an action through the door, or a signal a view raised directly | `{ action, args, refused? }` or `{ signal, payload }`; a drag is **one entry per gesture**, its last args with `startAt` and `steps` |
| `signal` | every signal the board raises | `{ signal, payload, from }`: `from` is the seq of the cause that set it off (null: none did, like `started`) |
| `jugnu` | one turn with Jugnu | `{ asked, about?, reply, steps, model }`; what he does on the board is `cause` entries of his own |
| `app` | things around boards | `{ what, … }`: `audioFailed { reason }` |

**Not recorded:**
- What the lesson's own rules do (show, hide, pass): consequences. Their signals are recorded, pointing back to the act that set them off.
- A prop's own steps over time (a tick, a tween, the race calling its own `arrive`).
- What Jugnu tries while he thinks on the phone's own board (development).

**Signals carry the evidence.** A question's `checked` says what it was judged on (`status`, `attempts`, `isGraded`, the option or the node it is about). Processors read signal payloads, which the prop declares, never raw action args.

## The shape

```ts
{
  // the envelope: the same on every entry; its own columns on the server
  id, schemaVersion, session, seq,
  at,        // Unix ms on the phone: the only time (the server adds receivedAt; order comes from seq)
  commit,    // the commit the app was built from
  actor,     // learner | jugnu | lesson | app
  opening,   // which opening of the board (it can open twice in a session); null off a board
  board,     // the board's id; null off a board
  version,   // the board's version, or the opened node's
  node,      // the piece's id; the opened node off a board; null for the board itself
  kind,
  payload,   // only what's new in that moment, never the page's state
}
```

The learner is added by the server, from sign-in. Ids are hashes of paths (`idOf`), so entries stay short; `build/ids.json` maps every item's and placed prop's id back to its path (`class10-maths/real-numbers/hcf-and-lcm/story#must`).

## Example

The story page in hcf-and-lcm, played on the real app: Play, they meet at 36, answer "factor" (wrong), Try again, answer right, Play to 72, Continue. Node ids shortened; `race` and `must` are the pieces they name.

```text
seq kind   actor   node  payload
 0  open   app     -     { mode: lesson, wasPassed: false, locale: en, hasAudio: false }
 1  signal lesson  -     { signal: started, from: null }
 2  cause  learner race  { action: play, args: {} }
 3  signal learner race  { signal: met, payload: { time: 36 }, from: 2 }
 4  cause  learner must  { action: select, args: { option: factor } }
 5  cause  learner must  { action: check, args: {} }
 6  signal learner must  { signal: checked, payload: { status: wrong, attempts: 1, isGraded: false, optionId: factor }, from: 5 }
 7  signal learner must  { signal: wrong, from: 5 }
 8  cause  learner must  { action: retry, args: {} }
 9  cause  learner must  { action: select, args: { option: right } }
10  cause  learner must  { action: check, args: {} }
11  signal learner must  { signal: checked, payload: { status: correct, attempts: 2, isGraded: false, optionId: right }, from: 10 }
12  signal learner must  { signal: correct, from: 10 }
13  cause  learner race  { action: play, args: {} }
14  signal learner race  { signal: met, payload: { time: 72 }, from: 13 }
15  cause  learner -     { action: continue, args: {} }
16  signal learner -     { signal: continued, from: 15 }
17  close  app     -     {}
```

A drag on a number line is one entry: `cause { action: moveMarker, args: { to: 6.4 }, startAt, steps: 16 }`.

## In code

- **Kinds** are one table in `@chalk/content` (`event.ts`): a name and its payload schema. Adding a kind is adding a line there; the envelope, bus, uploader and server don't change.
- **One door:** `record(entry)` on the bus (`@chalk/events`). It adds the envelope, checks the payload against its kind, hands the entry to subscribers and returns its seq.
- **One producer for boards:** `recordBoard(runtime, record, opening)` (`@chalk/player`, recorder.ts). The runtime numbers every action and signal and says what set each off (`ActionRecord.cause`, `SignalRecord.from`, `isStep`); the recorder turns that into `cause` and `signal` entries. The board player makes one per board on screen and tells it when a pointer is down, so a drag is one entry.
- **The phone** keeps entries in IndexedDB and uploads them in batches (`POST /api/events`), in `(session, seq)` order. The server stores each once by id.
- **Reactions on the phone** (Continue → the next board, the result banner) are local listeners on the runtime's signals, not events.

## On the server

Each downstream task is a **processor**: it reads entries as they arrive and keeps its own table, which can be dropped and made again from the stream (`pnpm --filter @chalk/server rebuild-facts`).

- **Board facts** (`board_facts`, `boardFactsFrom` in `@chalk/api`): per learner and board, when they first passed it (their Continue) and their first graded check.
- **Progress** (`progressFrom`) rolls board facts up through the tree: a concept is learnt once every one of its pages is passed, and practised once every question of its first practice (`firstTry`, else all testing it) has a first try. The phone works out the same from its own entries, so the two agree.

## Care

- **Time is only `at`** (Unix ms). The board's own clock stays inside props' animations.
- **Replay is best-effort:** a spoken line's length or where a tween was when interrupted depend on the device. The record is the truth.
- **Minors' typed text** (typed answers, Jugnu chats) will be marked in the prop's schema and kept apart, with its own retention, out of the teacher view.
- Until the first learner, shapes change freely at `schemaVersion` 2. After that, add optional fields freely; anything else bumps it.
