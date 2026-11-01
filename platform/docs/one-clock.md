# One clock

Done (2026-11-01): steps 1-6 below, commits 8b8aad0 and 45194a3. What follows is the plan as built.

**Goal:** a board means the same thing on a phone and in a tool. Everything that takes time is on the board's one clock; tools run that clock without waiting.

## Today

- Moves, waits and ticks are on the board's clock. A line's end is not: on a phone the board waits for the sound to say "ended". Tools fake that with each clip's length, watched in real time at ×10, and give up after 30 s of board time (`look` read boards mid-story).
- Commit 54ffcba made tools end each line at once (skip): fast and steady, but narration no longer overlaps motion or timers as on a phone.
- Three voice paths in `runtime.ts` (heard, timed, skipped). An in-turn sound holds the voice through a promise on a phone, and not at all in tools.

## A line

Every line, on every board, ends the same way:

1. **Its length:** its clips' total; with no clips (a preview before voicing, a voice made on the fly), an estimate from its words.
2. **Its timeout:** when it starts, the board schedules the line's end at now + length + 5 s (`GRACE`), carrying the line's id. A safety net: the voice is expected to end it first.
3. **The voice ends it:** the voice reports "ended", a **voice event**: a kind of its own in the board's log (not a tap: never the student's, so the scene's two rules see it as the board's), recorded with its board time and replayed. It drops the timeout (by its entry) and ends the line.
4. **Or something cuts it:** a newer line, the student, a hush. The timeout is dropped the same way.
5. **The timeout fires** only if the voice never reported: the line ends, its audio is stopped, and it is recorded as timed out (a problem to fix: a hung voice, a bad estimate).

Anything told of a line no longer in turn does nothing (the id check the board has today).

**Who reports "ended":**

- **A phone:** the audio, when it really finishes: its clips, or the phone's own voice standing in for a clip that failed (it finishes the line, as today).
- **A tool:** a stand-in voice that reports "ended" at exactly the line's length, on the board's clock. Phone and tool take the same path; they differ only by the device's own delay.
- **A replay:** the voice events in the log, at their board times: a student's session replays as it happened.

**In-turn sounds** (a sound a line waits for) are timed the same way: their length (measured by the build), + `GRACE`, ended by the sound.

## Starting a board

The clock starts when the board starts, as now. A board starts after a tap: opening a lesson, Continue. A page loaded without one (a preview link, a refresh) shows "Tap to start", since a browser plays no sound before a touch. Tools, which play no sound, start at once.

## Tools jump

The page runs the clock to the end (`runtime.settle()`, which exists), then draws once and is read once. No ×10, no 30 s cap, no polling (`__chalkBusy`). `play` steps can wait (board time) or act while a named line is being said ("advance until this line is in turn").

## Steps

1. **Sound lengths:** the build measures each library sound and ships its length with it (`Sound` has none today).
2. **Board:** the line's timeout with id, the voice event (its log entry, `replay`, the recorder), drop by entry. Law tests: same events with any frame timing; voice ends early; cut; timeout; stale end ignored; replay of a session with voice events.
3. **Runtime:** one voice path: lines timed as above; the phone's audio reports its end; the tool's stand-in reports at the length; in-turn sounds timed, the promise gone.
4. **Starting:** "Tap to start" for a board loaded without a tap.
5. **Tools:** jump with `settle()`, read once; remove ×10, the cap and polling; undo the skip (54ffcba). `pnpm bench-look`: the same answer as before 54ffcba, faster.
6. **Docs:** `sound.md`, `board-model.md` and `prop/src/voice.ts` say the board knows a line's length and ends it by the voice's word or its timeout; tests to match.

## Open

- A clip's stored length against its decoded length (checked by the build).
- Switching language mid-board isn't logged today; replay misses it (not part of this change).
- Things that step with no known end (a ball bouncing until stopped): left until a prop needs one; the queue's limit is the guard.
