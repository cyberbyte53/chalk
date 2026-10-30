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
| Fixed words (almost all today) | a clip made in advance (`pnpm voice`, the cast's voice), named by its words | measured from the clip |
| Worked out from state ("Riya is at Street {x}") | the phone's own voice, live | estimated from its words |
| Effect | a file from the sound library | measured from the file |

The source is behind one interface: clips for reachable states, or a better live voice, replace it later without touching lessons or props.

### What is said

Exactly words a person wrote, never rewritten: a line's own words, or a text's screen words when they are words already (formatting left out by the rich-text parser). Maths and signs are never turned into words: a maths reader drafts them, and the draft is written into the line.

### Who says it

A character, never a voice (`speaker: "aman"`; the narrator when no one is named). Each book has its cast (`authoring/books/<book>/cast.json`: its characters' voices per language); the narrator is shared. A line naming someone the book's cast lacks fails the build.

### Seeing and reviewing it

The board's **sound track**: every sound in the order it can be heard (the opening, each piece as it appears, each rule's), what is shown beside what is said, who says it, each clip to play. In the preview (`&script`), in `look`, and open to comments: a piece's line is `board#piece/said`, a free line `board#<name>`.

## Order of work

1. **Lines on the scene; sound out of the props' models.** `says` on a placement, `lines` said by rules; a text's line is its words. The engine's voice bus (what exists today, moved).
2. **Each book's cast.**
3. **Comments on lines.**
4. **Effects:** the library, the effects bus, sound views (the walker's footstep first).
5. **Live lines** from state, on the phone's voice.
