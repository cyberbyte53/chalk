# @chalk/player

Plays lessons. One player runs every kind of lesson (story, walkthrough, practice, quiz).

- `runtime.ts`: **`BoardRuntime`**, one board live: its scene on a `Board` (`@chalk/prop`), the clock moved each frame, the voice saying its lines in turn, sounds at their moments, `call` (the one door the screen and tools use), what is recorded. `board-records.ts`: what it records.
- `use-board-runtime.ts`: runs a `BoardRuntime` while its board is on screen. It imports `@preact/signals`, so a component re-renders only when a view it read changes.
- `rich-text.ts`: parses rich text (`**bold**`, `*em*`, `$maths$`, `$$display$$`) and typesets maths with KaTeX (cached); `richProblems` for the validator. `rich-text-view.tsx` (`RichText`) renders it; `rich-text.css` styles it.
- `lesson-player.tsx`: plays a lesson board by board, forward with Continue and back with ←; raises lesson events. A board gone back to opens fresh, with Continue already showing.
- `board-player.tsx`: one board: the layout plus the chrome every board shares, in one footer row (← back, and Continue once it passes); turns every question's commits into events.
- `jugnu-figure.tsx`: Jugnu, the app's character (`JugnuFigure`), drawn in the look's colours, in a mood (`JugnuMood`); the lesson's end shows him celebrating.
- `answer-feedback.tsx`: "That's it!" / "Not quite." and the note, shown by each question under itself.
- `layout.tsx`: renders the piece tree; each prop through its view.
- `sound/`: everything heard (platform/docs/sound.md): the engine (every clip, two channels), the narrator (a line's clips, else the phone's voice, else quiet), the board's store, the ☰ sound menu.
- `prop-module.ts`: what a prop gives the player: `{ def, View, sound }`; `PropViewProps` (what a view gets). `group-view.tsx`: a prop's parts drawn by its layout. `check-prop.ts`: `checkProp`. `prop-pages.ts`: a prop's page, from its definition.
- `ui-text.ts`: chrome copy (closed keys).
- `styles.css`: the player's own screens, in parts under `styles/` (`base`, `lesson`, `board`, `question`). Drawn only with `@chalk/look`'s tokens; the app loads `look.css` first. Props bring their own styles.

May import: `@chalk/content`, `@chalk/prop`, `@chalk/events`, `preact`, `@preact/signals`, `@preact/signals-core`, `katex`. Never imports a specific prop; the app passes a registry.
