# Sound

Status: **agreed in conversation (2026-10-30); being built.** Replaces "voice" as a special case of text.

## Why

A board is understood through two senses. Props are drawn for the eyes; sound is the second channel: the walker's footstep, a street rising, the narrator explaining, Aman answering. Until now only text was heard (a text piece read its words), so sound was a special case of one prop. It is general: anything on a board can be heard, at any moment, and what is said needn't be what is shown.

## What others do (and what we take)

- **Game sound middleware (Wwise, FMOD):** the game fires events; a separate sound layer maps events to sounds. Game code never names a sound. → Props tell events (they already do); sound is its own layer.
- **PhET:** sound effects for events, sonification (a quantity as pitch), and speech (what a thing is, its state now, what just changed, how to use it), often worked out from state. → Room for effects, state-made lines and, later, sonification.
- **Game engines (Godot, Unity):** sound goes through buses (voice, effects, music), each mixed and muted on its own; one player plays one sound at a time. → Two buses; on the voice bus the newest line wins.
- **E-learning timelines (Articulate):** narration on a timeline drifts from the animation once published. → No timeline: sound is cued by the board's events, timed on the board's clock with each clip's known length.

## The model

**A sound is something heard at a moment, attached to a thing.**

- **What:** words (a line: per language, said by a character of the cast) or an effect (a named sound from the library).
- **When:** a moment on the board: a piece appears, a signal is told (`walker.stepped`), the board opens.
- **Attached to:** what makes it: a prop (its own sounds), a piece placed on a board (a line said when it appears), or the board (narration).

### Layers

| Layer | Owns | Like |
|---|---|---|
| Prop model | its world and the events it tells | unchanged: it never names a sound |
| Prop sound view (`<prop>-sound.ts`) | its default sounds for its events (the walker's footstep; a text's line is its words) | its drawing (`<prop>-view.tsx`) |
| Lesson (the scene) | what is heard on this board: a piece's line (`says`), narration (`lines`, said by rules), effects added or replaced | what it places, and the words it shows |
| Sound engine (player) | plays sounds on buses, on the board's clock | the frame loop |
| Content | the words (reviewed, both languages); effects from a small library | text and pictures |

### Buses

- **Voice:** one line at a time; a new line cuts the one being said (the newest wins). A board may wait for a line (`said`): a "later" of its clip's length.
- **Effects:** overlap freely; never waited for.
- Each mutes on its own, kept on the device. Muted, the board keeps its timing.

### Where the audio comes from

| Line | Audio | Its length |
|---|---|---|
| Fixed words (almost all today; a question family's row is fixed too) | a clip made at build (`pnpm voice`, the cast's voice), named by its words | measured from the clip |
| A template with a known set of values ("Aman lives at Street {x}, House {y}", one of 30 houses) | every version made at build | measured |
| A template with open values (a measured length, a typed number) | made by the server on first use and kept; the phone's own voice meanwhile and offline | measured, or estimated from its words |
| Effect | a file from the sound library | measured from the file |

The source is behind one interface: clips for reachable states, or a better live voice, replace it later without touching lessons or props.

### What is said

Exactly words a person wrote, never rewritten: a line's own words, or a text's screen words when they are words already (formatting left out by the rich-text parser). Maths and signs are never turned into words: a maths reader drafts them, and the draft is written into the line.

### Who says it

A character, never a voice (`speaker: "aman"`; the narrator when no one is named). Each book has its cast (`authoring/books/<book>/cast.json`: its characters' voices per language); the narrator is shared. A line naming someone the book's cast lacks fails the build.

### Lines are part of the board

A line is a node of the board, like a piece: it has an address, and everything that works on a piece works on it (comments and threads, `look`, `changes`, review). The build lists each board's lines in its index beside its pieces, so a comment, `look` and the gone-check resolve a line's address as they do a piece's.

- **A piece's line:** `board#fiveHouses/said`. Its words are the piece's own, or the lesson's (`says`).
- **A declared line:** `board#finally`. Its moment is written with it **as data**, so every view shows exactly what runs:
  ```ts
  lines: {
    finally: line(t("Finally, I'm here!", "आख़िरकार, पहुँच गई!"), {
      speaker: "riya",
      when: "town.walker.arrived",   // the signal
      where: { x: 4, y: 5 },         // the values it must carry
      about: "town",
    }),
  },
  ```
  The build checks the signal exists and `where` is what it carries. A condition values can't say (it depends on the board as it is) may be code (`if`), shown only as "a condition in code". A rule may still say a line (`t.self.say`), but a declared moment is the normal way: a line said from inside a rule can't be shown before it is heard.

### Moments are events

Every moment is a real event, written the way events are everywhere (`play` prints them so), and a line can be declared on any of them:

- the board's own: `board.started`, `board.said · line title` (a line ended; the opening is said this way, one after another), `board.shown · name fiveHouses`, `board.passed`;
- a piece's, or a part's inside one: `ask.checked · status correct`, `town.walker.arrived · x 4, y 5`.

One form, worked out in one place (`scriptOf`); no words written beside it that could drift from what runs.

**How a declared line is said:** next. After the line being said, if any, and ahead of the lines waiting; nothing is cut or dropped. (A piece shown is different: the student has moved on, so it cuts what is being said.) A line on the board's own event is placed by the board in the same step, so "after the title" really is straight after it.

### Its place: in time, and on the board

| Line | Place in time (the sound track) | Place on the board (a 🔊 mark, review only) |
|---|---|---|
| a piece's words | when the piece appears (or as the board opens) | on that piece |
| narration about something | its moment | on what it is `about` |
| a character's line | its moment | on that character, else what it is about |
| free narration | its moment | none: only on the track |

- **The sound track** is drawn beside the board while reviewing (the preview shows it by default; `v` hides it), grouped by moment: as the board opens…, when street 4 rises…, when Riya arrives…. It lists every line that can be said, including those only an interaction sets off. Each has its words, its speaker, its clip to play, and is picked for a comment like any part.
- **While a line plays,** its piece (or what it is about) glows on the board, as a teacher points at what they are talking about.
- `look` lists the track; `play` lists what each step was heard to say.

### Languages

A board has its language; nothing assumes one. The build plays every scene's witness and notes in every language (each line takes its own time in each) and judges each run on its own: a failure in some languages only says which; a note must be the same in every language. Agents read and write in `AGENT_LOCALE`, the one language chosen on purpose. A choice's options are shuffled by the question's name, its words in every language and its options' ids, so the order is the same in every language.

### Which lines are heard: known by playing

Which lines a board *can* say is known in advance: each is data on the board. Whether and when each *is* said depends on what the student does. The build already plays every board (its witness, each wrong-answer note); it records which lines were heard on the runs that passed, in each language, and reports lines heard on no run (or in some language only): a moment that is never true, or a path no run takes (the author says which).

## Order of work

1. **Lines on the scene; sound out of the props' models.** `says` on a placement, `lines` said by rules; a text's line is its words. The engine's voice bus. *(Done.)*
2. **Lines are nodes:** declared moments as data (`when`, `where`, `about`); addresses; the sound track grouped by moment, picked for comments; the 🔊 marks; the glow while a line plays; heard-on-no-run in the build. *(Done but the 🔊 marks.)*
3. **Each book's cast.**
4. **Effects:** the library, the effects bus, sound views (the walker's footstep first).
5. **Templates:** every version made at build for known values; the server's made-on-first-use clips and the phone's voice for open ones.
