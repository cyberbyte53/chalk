# A Jugnu run, read in time

Status: built (2026-11-04): replay, runs recorded as events, the page read in time. Part of jugnu-sandbox.md; comes before its judge (step 4),
as the judge and code's measures read the same events.

## The need

The run page today lays out every turn at once: each line, each thought, each try, a board drawn per
turn (twenty and more). The person: "reading so much is not good… simply not readable". A run must be
understood at a glance, and in time: how it went, moment by moment, with detail only when asked.

## One idea: a run is the event stream a phone would record

The app's event channel (docs/events.md) already records what happens on a board, in order: `cause`
(the student or Jugnu acts), `signal` (what the board says back: `checked`), and `jugnu` (one turn
with Jugnu: what was asked, his reply, the model). A sandbox run is recorded as exactly those events,
from the same board runtime the phone uses; the sandbox's extras (his thinking, his tries, his note,
the student's thinking) are attached to the event they belong to. So:

- the view reads events, and later shows real students' sessions from what their phones send, with no
  second viewer;
- code's measures and the judge read the same events.

## The page: little at a glance, the rest when asked

1. **One line, the story**: how it ended (solved, left, not solved), whether he found the belief (his
   last note against the hidden one: the judge's call, later), when he handed back, whether the
   student did the next one alone; and, once there are marks, the marks counted.
2. **One board**, and under it **a timeline**: a mark per moment, in order, coloured by who (student,
   Jugnu, the board's reply); marks the judge (or code) flagged stand out. Step with ← →, or tap a mark.
3. **At a moment**: the board exactly as it was then (the causes up to it played again: boards are
   deterministic), and the line said as a bubble, as the student sees it; Jugnu's glow on the board.
4. **Folded away**, one tap to open, for that moment only: his thinking, his tries (each drawn on its
   own when opened), his note, what he was given; the student's thinking.

The list of runs stays one line each (when, seats, the story line).

## Not now

Real students' sessions in this view (they need the server's events: later, with no change here).
Two runs side by side (sandbox step 6).

## Reviewed (4 Nov): what changed

- **One replay, shared:** events name a piece by its id (a hash of its path) and an action by its
  last part, so a `replay(runtime, causes)` beside the recorder (packages/player/src/recorder.ts)
  maps them back and plays each cause (signals are not replayed; a cause that is a raw view signal
  is not replayed yet). The sandbox viewer and, later, real sessions use it. Best effort for a real
  session where a student acts mid-animation (events.md, Care).
- **Recording from the start:** the board is made, the recorder attached (`recordBoard`), then it
  starts and the case's steps are played, so `started` and the earlier steps are in the events.
- **The `jugnu` event's shape is fixed** (`asked, about?, reply, steps, model`): his glow is one of
  its steps (`{kind: "glow", part}`); the extras (his thinking, note, what he was given, requests;
  the student's thinking, and their last words when Jugnu doesn't reply to them) go in a side table
  keyed by the event's seq. His tries are recorded each on its own copy, into the side table.
- **A run can have two boards**: the next question, done alone, opens a second board; the timeline
  switches to it at its `open`.
- **Earlier runs are not converted** (no times; their board replies would be made up): they stay on
  disk, not shown. New runs are recorded as events.
- **The page:** stepping by taps on the timeline, no new key shortcuts (the preview's arrows move
  between boards); one board drawn, redrawn only when a cause is passed; at most one try board open;
  long notes and inputs shortened. Colour by kind and actor (the `jugnu` event is the student's).

## Built in steps (each with its check)

1. `replay` beside the recorder. Check: a case's board recorded while played, then its causes
   replayed on a fresh board, gives the same `state()`.
2. The sandbox records each run as events (recording from the start; `jugnu` turns; the side table;
   tries; the next question's board). Check: the run's causes replayed give the live board's final
   `state()`.
3. The page: the story line, one board, the timeline, the bubble, folded details. Check: the person
   reads one run without scrolling past a wall of text.
