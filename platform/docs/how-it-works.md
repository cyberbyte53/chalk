# How it works

The whole loop, end to end, with Class 9's "Two numbers for a place" (coordinate geometry, lesson 1) as the running example. Parts marked *(later)* aren't built yet.

```text
Author ─▶ Build ──▶ Phone: lesson plays ─▶ events ─▶ Server ─▶ progress
   ▲                        │                                    │
   └──── teacher view & content fixes ◀───────────────────────────┘
```

## 1. Write the lesson

You make "Two numbers for a place": five boards. A bus on a straight road, Riya walking to Aman's house, a dot on a notebook page, desks in a classroom, and the two lines that did it every time.

The lesson is TypeScript under `content/` (see [writing-content.md](./writing-content.md)). Each board is a **scene** ([board-model.md](./board-model.md)): its **pieces** (words, the coordinate plane, a question) top to bottom, and the lesson's **rules**: on a piece's signal, what happens (`"town.walker.arrived": … show "found", pass`). Rules are plain typed functions. Pieces have a **name** you choose (`town`, `reply`). Prop types come from the library.

## 2. Build

You run `pnpm build-content` (or `pnpm preview`, which builds on every save).

1. **Check:** every prop's needs given, every piece's setup, and each board played on the real props, the clock jumped: its witness gets it passed, each wrong answer gets its note, in English and Hindi.
2. **Name:** each page and question gets an id from where it lives (and a question's params). Events name a board by it and a piece by its address; nobody hands ids out.
3. **Version:** each item's version is a hash of what made it, its code included, so every event says which version the learner saw.
4. **Ship as code:** `build/` holds the course's shape and, per page or question, which module makes its board. The app makes each board from that same module.
5. **Audio:** every line a board says is voiced once per language, in the voice set for its speaker in `authoring/voices.json` ([sound.md](./sound.md)). What's shown and what's said can differ: a line's spoken words are written with it when its screen words aren't how it is said ("→" is "the right arrow"). The voice only ever gets plain words. Clips are named by what was said, so only new or edited lines are voiced again.
6. *(later)* **Bundle:** chapters packaged and uploaded to a CDN.

## 3. The learner opens the app

A new session starts. The app fetches the chapter's built files and its boards' code once, and keeps them for offline.

The lesson player raises `lesson start`. The event channel adds the envelope (session, `seq` 0, `producedAt`) and hands the event to its subscribers.

## 4. Board 2: "Finding Aman's house"

The board opens and tells `started`. Its words are said in turn: the title, the story ("He replies: **Street 4**"), then "Move her along it with the right arrow". The town shows the main road only: no street has risen yet.

She taps → four times. Each tap is the walker's `step`, an action from the screen: Riya checks the road, glides one block (a planned move on the board's clock), and tells `stepped`. At (4, 0), the board's rule hears `town.walker.stepped` and asks the plane to raise Street 4. The street rises; at its end the plane tells `risen`, and the board shows "Street 4 rises from the 4…" and lights its five houses. When that line has been said, Aman's house is marked (House 5), and his reply shows.

She taps ↑ five times. Riya reads `upLines` (Street 4 is up now), walks up, and tells `arrived (4, 5)`. The board's rule shows "Aman's house isn't on one line…", raises every street, and passes: Continue shows. **Continue** is recorded: `board continue`.

Each step she took is recorded on its own: the action, what it set off (the rule, the street rising), and the signals on the way, linked ([events.md](./events.md)).

## 5. Board 4: a wrong answer

On "Desks in a classroom" she taps the desk at (5, 3), then the one at (3, 5), and the question asks whether they are the same desk. She picks "Yes: they are the same desk". The choice checks at once: wrong, and its note shows below it. `checked { status: wrong, attempts: 1 }` is recorded.

She looks at the two marked desks, picks "No", and is right: the board passes.

## 6. Then practice

After a concept's pages come its questions, from the chapter's bank (`walk-to-address`, `tap-the-desk`, …), played as their own lesson; their first tries are the score.

## 7. Upload

Every few seconds the uploader (just another subscriber) takes a batch from the phone's queue and posts it. The server checks every event's shape, drops duplicates by id, appends to the event table and acknowledges; the phone then clears that batch. Offline, events wait on the phone.

## 8. Progress and the teacher

The server's processors read the events as they arrive: which concepts a learner has played and practised, and how. The teacher sees each learner's concepts as marks (strong, shaky, weak, started).

*(later)* A learner model that counts only first attempts across days, and schedules practice; misconceptions picked on the teacher's view.

## 9. Fixing content

Many still picked "the same desk" after the note, so you rewrite the note and ship again. The board's id stays the same; only its words and version change. Old events say the old version, so you can compare whether the new note works better.
