# Sound

Status: **design agreed in conversation (2026-10-31); the code moves to it next.** What is built today and what changes is under "From today's code". Voice and effects are one system here, not two.

## The idea

**Everything heard is a cue: when a moment comes, play something.**

| Part | What it says | Example |
|---|---|---|
| **When** | a moment: an event on the board, and maybe its data | `line.walker.stepped`; `ask.checked` where `status` is `wrong` |
| **What** | **words**, said by a speaker (their voice makes a clip), or **a file** (a recorded sound) | "The bus is at minus 2. Where is it?"; `step` |
| **How** | **takes a turn** (one at a time, by the two rules) or **plays alongside** (at once, over anything) | words take a turn; a step plays alongside |
| **About** | the piece it concerns: it glows while heard | the question `side` |

Words take a turn and files play alongside, unless the cue says otherwise. Nothing is said that a person didn't write: words are a lesson's, never rewritten; maths and signs are never turned into words (a line with them gives its spoken words, or the build stops it).

### The two rules (cues that take a turn)

1. **The board talks in turn.** One at a time, in the order they come; the opening is read top to bottom when nothing else is due.
2. **When the student acts, the board stops and responds.** The cue being said is cut, the ones waiting are dropped, and what the action brings is said. "The action" includes what it set going (a walk's steps, the dice landing).

A cue is done when heard or cut: whatever waits on it always happens.

### Who writes cues

- **A prop, for its own events**, in its sound view beside its drawing: a text says its words when shown; the walker plays a step when it steps; a question plays right or wrong when checked. Every board using the prop has them.
- **A lesson, for its board:** adds cues (Riya says "Finally, I'm here!" when she arrives at (4, 5)), changes a prop's, or silences one.

## The chapter is the unit

A student entering a chapter downloads that chapter: its lessons, its props' code, its clips. Once downloaded, it plays.

| Level | Holds | Ships |
|---|---|---|
| **App** | the engine; the app's own sounds (right, wrong, tap…) | with the app |
| **Library** | shared sounds props use (step, rise…) | with the props that use them |
| **Chapter** | the clips for every line its boards say | with the chapter, from `content/<book>/<chapter>/sound/` |

## The pipeline

```
 written (in git)                    built with the chapter (in git)              played
 ──────────────────                  ──────────────────────────────              ─────────────────────
 lessons and props: cues   ─┐
 settings: speaker → voice  ├──►  words → phrases → store[voice + words]  ──►  review  ──►  ships  ──►  engine
 chosen recordings (library)┘     (missing clips made; stale ones caught)
```

- **The store** holds clips keyed by **voice and words**, with one readable list beside them (each clip's file, voice, language, words, length). Changing a voice changes the key: its clips are made again.
- **Building content makes a chapter's missing clips** with the configured voice (Piper), only the new ones. `pnpm check` fails when a clip is missing or stale, naming the line: a lesson never ships silent.
- **Recordings** (step, chimes) are chosen, not made: picked by ear from options, kept in the library with their source and licence (`library/sounds/`).

### Words known only when played

Lines with blanks ("Stop {x}") are made from pieces in the store (fixed words, and each value's pieces from a sayer, glued). Any other words could come from a voice server, kept in the store after; none exists yet, and review uses only what the shipped app has too.

## The engine

One engine plays every cue, on every screen (a phone, the preview, the editor's panel): what is reviewed is what a student hears.

- **Finds its clip:** the store; else glued pieces; else the phone's own voice; else quiet for as long as the words would take.
- **Two channels,** voice and sounds, each with its switch in the ☰ menu (with *Hear again*). Muted, the board keeps its pacing.
- **The browser's first-touch rule,** once: a sound refused before the page is touched waits and plays on the first touch.
- **Reports** to the board when a cue started, ended or was cut; the board never knows lengths or sources.
- **Logs** everything heard, in order (what `play` and `look` show).
- **A silent engine** (no sound; a cue ends after its length) is the same engine without speakers: for tools, checks, tests, and a board that is one of several on a review screen.

## Settings

Who voices whom and the app's own sounds are settings, with overrides: **app → book → chapter**, the nearest wins, each level saying only what it changes. A cue by a speaker no level defines fails the build. What goes in a book's settings (its characters) grows as books are planned.

## Where the code lives

One `sound` home per layer; elsewhere code only connects to it.

| Layer | Home | Holds |
|---|---|---|
| Contract | `content/src/sound/` | cue, clip, the store's list; words → phrases (one function, for the build and the player) |
| Board | `author/src/scene/sound.ts` | declaring cues; the queue and the two rules |
| Player | `player/src/sound/` | the engine, its sources, the menu |
| Build | `studio/src/sound/` | making and checking a chapter's clips; adding a recording |
| Recordings | `library/sounds/` | shared and app sounds, with `sounds.json` |
| A chapter's clips | `content/<book>/<chapter>/sound/` | its clips, with their list |

## From today's code

| Today | Becomes |
|---|---|
| Lines (`says`, `lines`, a sound view's `line`) and effects (`effects`, a sound view's `effects`): two vocabularies | cues |
| Two players (`narration.ts`, `effects.ts`), two first-touch rules, two logs | one engine |
| "Wait for real sound?" decided in five places (`timedVoice`, `isHeard`, `isTimed`, `keepsTime`, `isQuiet`) | which engine a board is given |
| `LineCall`, `Utterance`, `ScriptLine`, `phraseKey`, `AudioSource`, `PlayableClip`; three word splitters | cue, clip, list; one splitter |
| Clips keyed by speaker (a changed voice keeps playing the old clips) | keyed by voice and words |
| `pnpm voice`, into `public/voice/` (ignored by git, never shipped) | made by the content build, into the chapter, committed |
| Experiments: macOS and Parler voices, the dev live endpoint, the `**` regex | removed |
| The queue inside `scene.ts` | its own file |

## Not now

Book-level planning (characters), choices offered in review, a voice server, captions, music. Nothing in the design blocks them.
