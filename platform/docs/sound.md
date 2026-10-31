# Sound

Status: **agreed in conversation (2026-10-31).** Replaces the clip-centred plan of 2026-10-30. Steps 1 and 2 of that plan are built (lines on the board, moments as events, the script beside the board); what changes is said under "From today's code".

## Why

A board is understood through two senses. Props are drawn for the eyes; sound is the second channel: the narrator explaining, Aman answering, the walker's footstep, Jugnu helping. Anything on a board can be heard, and what is said needn't be what is shown.

## Three parts that know nothing of each other's insides

| Part | Knows | Never knows |
|---|---|---|
| **The board** (props, the scene) | what happens (events), which line is said when | how a line becomes sound, or how long it is |
| **The voice** (player) | how to make a line heard, from any source | why the line is said, what the board does next |
| **The lesson** | what is heard at which moment, by whom, in what words | either part's insides |

Sight and sound are separate systems that react to the same events. One tap is one step: the bus moves and its line is heard in that same step, so they can't drift apart. Sound comes later than the picture only when a line waits its turn, and what the student did never waits (rule 2).

## The board and the voice: the only things that cross

| Board → voice | Voice → board |
|---|---|
| **say** (line, words, speaker) | **started** |
| **stop** | **ended** |
| | **cut** |

The board never asks how long a line is: it waits for **ended** (or **cut**), like any other event. The voice decides what that means for its source:

- a clip made at build, or one the server made earlier;
- the server making it now (streamed, so sound starts soon);
- an AI voice agent;
- the phone's own voice;
- muted: nothing heard, **ended** after the time the words would take, so the board's pacing is the same;
- a test voice (the build, `play`): **ended** after an estimate, on the jumping clock.

**The voice promises:** every **say** ends in **ended** or **cut**, never stuck: a slow source falls back (to the phone's voice) rather than keep the board waiting. Swapping or mixing sources changes nothing on the board, in lessons or in the rules.

## What is heard: lines and effects

**A line** has a name (its address: `board#finally`, or `board#fiveHouses/said` for a piece's), a speaker (a character of the cast; the narrator when none is named), its words, what it is about (it glows while heard), and its moment: an event (`when`), with the values it must carry (`where`). The board's own events are moments too: `board.started`, `board.said · line title`, `board.shown · name hint`, `board.passed`.

- **Words are a template**, written by a person in every language: "You're at street {x}, house {y}". A fixed line is a template with no blanks. Values are filled in when the line comes due: it says what was true at its moment.
- **Sayers** turn a value into words, from the value's data, never from its shown text: number, point, decimal (and recurring), fraction, power, equation, surd, measure (with its unit), count (with its plural: "1 piece", "3 pieces"). Each is written once per language and lives in the library, beside the props. A factorisation is said from its primes and powers ("2 cubed times 3 squared"), not by reading "2³ × 3²".
- **Nothing turns shown symbols into words.** A line whose screen words have maths or signs, and no spoken words, stops the build, naming the line (a maths reader may suggest a draft for a person to write in).

**An effect** is a named sound at a moment (a footstep on `walker.stepped`). Effects are not lines: they play at once, overlap each other, are never waited for, and are muted on their own. A repeat of the same effect replaces itself.

## Which line is heard: two rules

1. **The board talks in turn.** One line at a time, in the order they come due: the opening read top to bottom, a line after another, a reply the lesson shows, lines set off by Jugnu's actions.
2. **When the student acts, the board stops and responds.** The line being said is cut, the lines waiting are dropped, and what the action brings is said, in order. "The action" includes what it set going: each step of a walk a tap started, the dice landing after a throw, each toss after Play.

And one fact: **a line is said when it is done, heard or cut.** The board tells `said` either way, so whatever waits on a line always happens (Aman always replies).

What follows from these, with nothing more to write:

- **Old news is never said.** What the student causes never waits, so it never goes stale: tap the bus on to −5 and its line at −2 is cut, never heard late.
- **Feedback** ("Yes!", then the next piece's read) is one action: said in order, cut only by the student's next action.
- **Precedence** is who caused it, not a level an author sets. What the board says unprompted waits; what the student caused cuts in.
- **Repeats** (steps, dice, tosses, a drag crossing an axis): each cuts the last; the latest is heard.

A lesson that puts a line on every step of a walk will be cut again and again: the writing guide says to put an effect on each step and the line on arrival.

## Props announce what is worth hearing

Anything heard is an event: a prop tells the moments a student should hear, and the sound part listens. Most props need a signal or two more: the bus passing each stop, each quadrant named during the sweep, a runner crossing the start line, a point's drag released. A drag says nothing while the finger moves: its value on release, and at most an effect or short line when it crosses a boundary (an axis, a quadrant, a tenth).

## Jugnu is a speaker like any other

`jugnu` is in the cast; his lines arrive while the student talks with him, sentence by sentence, each a line in turn. He speaks because the student asked (rule 2): he cuts in; lines his own actions on the board set off wait behind him; the student acting while he talks cuts him (barge-in, as voice assistants do). The model writes both what he shows and what he says, as a lesson writes `says`, so nothing turns his symbols into words either. His lines can't be reviewed one by one ahead: his rules for how he talks are, and `play` shows what he said.

## Who says it

A character, never a voice. Each book has its cast (characters' voices per language); the narrator and Jugnu are shared. A line naming someone the cast lacks fails the build. Clips are made by the same engine as live speech, so a clip is saved live output: a character sounds the same from every source.

## Review and the build

- **The script**, beside every board while reviewing: every line the board can say, grouped by moment, with its speaker, its words in each language (templates with examples), ▶ to hear it; picked for a comment like any part; pointing at one lights what it is about. `look` at a line's address answers with it; `play` says what each step was heard to say.
- **The build** makes clips for every fixed line and every template whose values come from a known set (10 streets × 5 houses); plays every board in every language; checks every template fills in every language with sayers that exist and no symbols left unsaid; and notes lines no run reaches.
- **Caching:** every source keys audio by voice and words: a line made once, at build or on the go, is kept for everyone.

## From today's code

| Today | Becomes |
|---|---|
| The voice answers **say** with a length; the board schedules the end itself | The board waits for **ended** / **cut** |
| The scene keeps three lists (in turn, due, waiting) | One queue and the two rules |
| A piece shown always cuts | A piece the student revealed cuts (rule 2); one the lesson revealed waits its turn (rule 1) |
| `said` only when a line ends | `said` when heard or cut |
| Fixed words only | Templates and sayers |
| Clips as the source | Clips as one source behind the voice, a cache |
| The engine knows a step began with a tap | It carries that through what the tap scheduled for later |

## Order of work

1. **The voice reports started, ended and cut;** the board never sees a length. The two rules and one queue in the scene; `said` on a cut; the student's cause carried through what a tap set going.
2. **Templates and sayers,** with one real line in the chapter ("You're at street {x}, house {y}"); clips made at build for known sets.
3. **Voice sources behind one door:** clip, server, phone, in order; the never-stuck promise; caching by voice and words.
4. **Effects:** the library, the effects bus, the walker's footstep; props telling the moments worth hearing (the bus passing stops).
5. **Each book's cast.**
6. **Jugnu as a speaker.**

## Parked

- **Preparing ahead:** the voice reads what is waiting and makes it while the current line plays. Needs nothing from the board beyond what it already shows.
- **A word lit as it is said** ("House 5" glows as she says it): the voice reporting word timings, one more report back; nothing else changes.
- **A value as sound** (pitch rising with a point), music.
