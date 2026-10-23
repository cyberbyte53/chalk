# @chalk/player

Plays lessons. One player runs every kind of lesson (story, walkthrough, practice, quiz).

- `runtime.ts`: **`BoardRuntime`**, one board live and framework-free: props' state (a signal per prop; views computed), the one door (`call`), IS rules kept true (an effect per rule, re-run only when a prop it read changes), WHEN rules answered in order, scripts (then / with / wait), the learner winning over the lesson's animations, pause. Tested with a fake clock and voice.
- `use-board-runtime.ts`: runs a `BoardRuntime` while its board is on screen. It imports `@preact/signals`, so a component re-renders only when a view it read changes.
- `rich-text.ts`: parses rich text (`**bold**`, `*em*`, `$maths$`, `$$display$$`) and typesets maths with KaTeX (cached); `richProblems` for the validator. `rich-text-view.tsx` (`RichText`) renders it; `rich-text.css` styles it.
- `lesson-player.tsx`: plays a lesson board by board, forward with Continue and back with ←; raises lesson events. A board gone back to opens fresh, with Continue already showing.
- `board-player.tsx`: one board: the layout plus the chrome every board shares, in one footer row (← back, Jugnu's button, and Continue once it passes); turns every question's commits into events.
- `jugnu-figure.tsx`: Jugnu himself (`JugnuFigure`), drawn in the look's colours, in a mood (`JugnuMood`: neutral, thinking, listening, curious, hint, proud, celebrate, …). His button shows what he is doing; the lesson's end shows him celebrating.
- `answer-feedback.tsx`: "That's it!" / "Not quite." and the note, shown by each question under itself.
- `layout.tsx`: renders the piece tree; each prop through its view.
- `narration.ts`: reads a line aloud from published audio when a prop's `say` runs; a failed line shows a retry mark and raises `line audioFailed`.
- `prop-module.ts`: what a prop gives the player: `{ def, View }`.
- `ui-text.ts`: chrome copy (closed keys).
- `styles.css`: the player's own screens, in parts under `styles/` (`base`, `lesson`, `board`, `question`, `jugnu`). Drawn only with `@chalk/look`'s tokens; the app loads `look.css` first. Props bring their own styles.

May import: `@chalk/content`, `@chalk/prop`, `@chalk/events`, `@chalk/jugnu`, `preact`, `@preact/signals`, `@preact/signals-core`, `katex`. Never imports a specific prop; the app passes a registry.
