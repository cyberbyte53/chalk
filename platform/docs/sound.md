# Sound

Status: **design agreed in conversation (2026-10-31); the code moves to it next.** What is built today and what changes is under "From today's code". Voice and effects are one system here, not two.

## The idea

**Everything heard is a cue: when a moment comes, play something.**

| Part | What it says | Example |
|---|---|---|
| **When** | a moment: an event on the board, and maybe its data | `line.walker.stepped`; `ask.checked` where `status` is `wrong` |
| **What** | **words**, said by a speaker (a **voiced** clip, made from them by the speaker's voice), or **a sound** (a **chosen** clip, picked from the library) | "The bus is at minus 2. Where is it?"; `step` |
| **How** | **takes a turn** (one at a time, by the two rules), **when free** (only when nothing else is due), or **plays alongside** (at once, over anything) | words take a turn; the opening's reads are when free; a step plays alongside |
| **Until** | for a sound that lasts: the moment it stops (its clip loops, seamlessly, till then) | rain `until: "scene.hidden"`; the bus's hum until it arrives |
| **About** | the piece it concerns: it glows while heard | the question `side` |

Words take a turn and sounds play alongside, unless the cue says otherwise. Without `until` a cue plays once.

**Several at once.** One voice at a time: cues that take a turn (or when free) never talk over each other. Cues alongside play together, as many as needed, over each other and over the voice (rain, a hum, a step and Riya speaking). A repeat of the same sound replaces itself, so fast taps don't pile up. Nothing is said that a person didn't write: words are a lesson's, never rewritten; maths and signs are never turned into words (a line with them gives its spoken words, or the build stops it).

**Defaults help, nothing forces.** Props bring their own cues, the app's settings bring voices and sounds, the engine a sensible order for finding a clip: a board is heard without anyone writing a cue. A lesson changes or silences any cue; a book or chapter overrides any setting; a voice makes its clips as it sees fit.

### The two rules (the voice: cues that take a turn, or when free)

1. **The board talks in turn.** One at a time, in the order they come; cues when free (the opening, read top to bottom) only when nothing else is due.
2. **When the student acts, the board stops and responds.** The cue being said is cut, the ones waiting are dropped, and what the action brings is said. "The action" includes what it set going (a walk's steps, the dice landing).

A cue is done when heard or cut: whatever waits on it always happens. Cues alongside are outside these rules: they end at their end or their `until`. **A board's sounds all end with the board** (Continue, leaving).

A piece's words, said as it appears: at the opening they are read when free; a piece shown later follows the two rules (the student revealed it: it cuts in; the lesson did: it takes its turn).

### Where cues come from

- **Declared, ahead** (shown in the script, reviewed before anyone hears them):
  - **a prop, for its own events**, in its sound view beside its drawing: a text says its words when shown; the walker plays a step when it steps; a question plays right or wrong when checked. Every board using the prop has them;
  - **a lesson, for its board:** adds cues (Riya says "Finally, I'm here!" when she arrives at (4, 5)), changes a prop's, or silences one.
- **Issued while playing:** Jugnu's replies (sentence by sentence), a lesson's rule saying something, *Hear again*. The same rules, the same engine; what is reviewed for them is what issues them (Jugnu's rules, the lesson's rule).

## The chapter is the unit

A student entering a chapter downloads that chapter: its lessons, its props' code, and **every sound it can play** (its clips, and the library's sounds its props and lessons use), listed by the build. Once downloaded, it plays, online or not.

A sound ships with what uses it: a chapter's clips with the chapter (`content/<book>/<chapter>/sound/`), a library sound with every chapter that uses it, the app's own sounds (right, wrong, tap) with the app, since every chapter uses them.

## The pipeline

```
 written (in git)                     built with the chapter (in git)                  played
 ───────────────────────              ──────────────────────────────────               ─────────────────────
 cues' words + settings     ───►  words → phrases → store[voice + words] ─┐
 (speaker → voice)                (missing clips made; stale ones caught)   ├─► the chapter's sound list ──► review ──► ships ──► engine
 cues' sounds (chosen clips, ─────────────────────────────────────────────┘
  in the library)
```

- **The store** holds clips keyed by **voice and words**. Changing a voice changes the key: its clips are made again.
- **One list per chapter** (`content/<book>/<chapter>/sound/sound.json`): each clip (its file, voice, language, words, length) and each library sound its cues use. It is the store's index, what review reads, and what the chapter's download fetches.
- **Building content makes a chapter's missing clips** with the configured voice (Piper), only the new ones. `pnpm check` fails when a clip is missing or stale, naming the line: a lesson never ships silent.
- **Chosen clips** (step, chimes) are picked, not voiced: chosen by ear from options, kept in the library with their source and licence (`library/sounds/`), each brought to the same loudness with its shrill top trimmed when added.
- **The build checks every cue:** its moment is an event there is, and its `where` is what that event carries; its words are speakable (or have their spoken words); its speaker is defined; its sound exists.

### Words known only when played

The sound system asks one thing of a voice: **a clip for these words, in this speaker's voice.** How the voice makes it is the voice's own business: **ahead**, at build, for fixed lines (kept in the chapter's store); or **on the go**, while playing (a voice server: our hosted Piper, an AI voice), for words known only then, such as Jugnu's replies; kept or not, as that voice sees fit. Lines with blanks can also be glued from pieces in the store (fixed words, and each value's pieces from a sayer). Which voice a speaker has is a setting; whatever review uses, the shipped app has too.

## The engine

One engine plays every cue, on every screen (a phone, the preview, the editor's panel): what is reviewed is what a student hears.

- **Finds its clip:** for words, the store; else glued pieces; else **the speaker's voice, on the go** (a voice server: our hosted Piper, or an AI voice); else the phone's own voice; else quiet for as long as the words would take. For a sound, its chosen clip (a missing one plays nothing: the build catches it).
- **Two channels,** by what is played: **words are the voice; sounds are sounds**, each with its switch in the ☰ menu (with *Hear again*). Muted, the board keeps its pacing.
- **The browser's first-touch rule,** once: a sound refused before the page is touched waits and plays on the first touch.
- **Reports** to the board when a cue started, ended or was cut; the board never knows lengths or sources.
- **The board's language** decides the words: switching it cuts the cue being said, and the next speaks in the new language.
- **Logs** everything heard, in order (what `play` and `look` show).
- **Muted, nothing is heard and every cue still takes its length,** so the board keeps its pacing. Tools, checks, tests and a board that is one of several on a review screen get the engine muted: there is no second engine.

## Settings

Who voices whom and the app's own sounds are settings, with overrides: **app → book → chapter**, the nearest wins, each level saying only what it changes. A cue by a speaker no level defines fails the build. What goes in a book's settings (its characters) grows as books are planned.

## Where the code lives

One `sound` home per layer; elsewhere code only connects to it.

| Layer | Home | Holds |
|---|---|---|
| Contract | `content/src/sound/` | cue, clip, the store's list; words → phrases (one function, for the build and the player) |
| Board | `author/src/scene/sound.ts` | declaring cues; the queue and the two rules |
| Player | `player/src/sound/` | the engine, its sources, the menu |
| Build | `studio/src/sound/` | voicing and checking a chapter's clips; adding a chosen clip to the library |
| Chosen clips | `library/sounds/` | shared and app sounds, with `sounds.json` |
| A chapter's clips | `content/<book>/<chapter>/sound/` | its clips, and its one list (`sound.json`) |

## From today's code

| Today | Becomes |
|---|---|
| Lines (`says`, `lines`, a sound view's `line`) and effects (`effects`, a sound view's `effects`): two vocabularies | cues |
| Two players (`narration.ts`, `effects.ts`), two first-touch rules, two logs | one engine |
| "Wait for real sound?" decided in five places (`timedVoice`, `isHeard`, `isTimed`, `keepsTime`, `isQuiet`) | the engine, muted or not |
| `LineCall`, `Utterance`, `ScriptLine`, `phraseKey`, `AudioSource`, `PlayableClip`; a manifest and a script; three word splitters | cue, clip, one list; one splitter |
| Clips keyed by speaker (a changed voice keeps playing the old clips) | keyed by voice and words |
| `pnpm voice`, into `public/voice/` (ignored by git, never shipped) | made by the content build, into the chapter, committed |
| Experiments: macOS and Parler voices, the dev live endpoint, the `**` regex | removed |
| The queue inside `scene.ts` | its own file |

## Not now

Book-level planning (characters), choices offered in review, a voice server, captions, music, turning sounds down while someone speaks. Nothing in the design blocks them.

Boards on the old runtime are out of scope: they are removed, not adapted.
