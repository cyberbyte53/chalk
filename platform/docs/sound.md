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

The board never asks how long a line is: it waits for **ended** (or **cut**), like any other event. The voice says a line from the first source that can, in order:

1. **clips, glued:** a line is said as phrases (its fixed words, and each value's pieces), and every phrase has a clip made at build (`pnpm voice`): a fixed line is one clip; "Stop {x}." is "Stop", then "minus", then "2". Nothing is stored per state: a template's own words, and each voice's number pieces (0 to 100, minus, point), shared by every line it says;
2. **live from the server** (not yet): any words, made as they are needed, streamed;
3. **the phone's own voice:** always there, offline too.

Any other source (an AI voice agent) is one more in the list. Besides these, two voices for when nothing is heard:
- muted: nothing heard, **ended** after the time the words would take, so the board's pacing is the same;
- a test voice (the build, `play`): **ended** after an estimate, on the jumping clock.

**The voice promises:** every **say** ends in **ended** or **cut**, never stuck: a slow source falls back (to the phone's voice) rather than keep the board waiting. Swapping or mixing sources changes nothing on the board, in lessons or in the rules.

## What is heard: lines and effects

**A line** has a name (its address: `board#finally`, or `board#fiveHouses/said` for a piece's), a speaker (a character of the cast; the narrator when none is named), its words, what it is about (it glows while heard), and its moment: an event (`when`), with the values it must carry (`where`). The board's own events are moments too: `board.started`, `board.said · line title`, `board.shown · name hint`, `board.passed`.

- **Words are a template**, written by a person in every language: "Stop {x}." / "स्टॉप {x}।". A fixed line is a template with no blanks. Each blank is a number its moment carries (`when`; the build checks it), filled in when the line comes due: it says what was true at its moment. A piece's line has no moment's values, so no blanks.
- **Sayers** turn a value into words, from the value's data, never from its shown text: number, point, decimal (and recurring), fraction, power, equation, surd, measure (with its unit), count (with its plural: "1 piece", "3 pieces"). Each is written once per language and lives in the library, beside the props. A factorisation is said from its primes and powers ("2 cubed times 3 squared"), not by reading "2³ × 3²".
- **Nothing turns shown symbols into words.** A line whose screen words have maths or signs, and no spoken words, stops the build, naming the line (a maths reader may suggest a draft for a person to write in).

**An effect** is a named sound at a moment (a footstep on `walker.stepped`). Effects are not lines: they play at once, overlap each other, are never waited for, and are muted on their own. A repeat of the same effect replaces itself.

## Which line is heard: two rules

1. **The board talks in turn.** One line at a time, in the order they come due: the opening read top to bottom, a line after another, a reply the lesson shows, lines set off by Jugnu's actions.
2. **When the student acts, the board stops and responds.** The line being said is cut, the lines waiting are dropped, and what the action brings is said, in order. "The action" includes what it set going: each step of a walk a tap started, the dice landing after a throw, each toss after Play.

An action that brings nothing to say leaves the board talking: rule 2 is about what the student's action *says*. The opening's reads are what the board says when it has nothing else to say: a line due at a moment comes before the next read.

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
- **The build** makes a clip for every phrase (a fixed line's words; a template's own words; each voice's number pieces); plays every board in every language; checks every blank is a number its moment carries and nothing is left unsaid; and notes lines no run reaches.
- **Phrases are the unit:** a clip is found by who says it, in which language, and its words (the manifest). Words changed since a clip was made simply find no clip, and the next source says them.

## From today's code

| Today | Becomes |
|---|---|
| The voice answers **say** with a length; the board schedules the end itself | The board waits for **ended** / **cut** |
| The scene keeps three lists (in turn, due, waiting) | One queue and the two rules |
| A piece shown always cuts | A piece the student revealed cuts (rule 2); one the lesson revealed waits its turn (rule 1) |
| `said` only when a line ends | `said` when heard or cut |
| Fixed words only | Templates and sayers |
| Clips as the source, one per line | Clips as the first source, one per phrase, glued; the phone's voice after |
| The engine knows a step began with a tap | It carries that through what the tap scheduled for later |

## Order of work

1. **The voice reports started, ended and cut;** the board never sees a length. The two rules and one queue in the scene; `said` on a cut; the student's cause carried through what a tap set going. *(Done. Today's voice keeps time on the board's clock with each clip's length (`timedVoice`): the length lives in the voice. Real audio telling its own end comes with step 3.)*
2. **Templates and sayers,** with one real line in the chapter (the bus board's "Stop {x}."); clips glued from phrases; the phone's voice when a phrase has none. *(Done: numbers only, as the number sayer; others (fractions, powers, measures, counts) as lessons need them.)*
3. **The live source and the never-stuck promise:** the server's voice between clips and the phone; real audio telling its own end (the board still keeps time by the clips' lengths).
4. **Effects:** the library, the effects bus, the walker's footstep; props telling the moments worth hearing (the bus passing stops).
5. **Each book's cast.**
6. **Jugnu as a speaker.**

## Parked

- **Preparing ahead:** the voice reads what is waiting and makes it while the current line plays. Needs nothing from the board beyond what it already shows.
- **A word lit as it is said** ("House 5" glows as she says it): the voice reporting word timings, one more report back; nothing else changes.
- **A value as sound** (pitch rising with a point), music.
