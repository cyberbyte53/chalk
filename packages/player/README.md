# @chalk/player

Plays lessons. One player runs every kind of lesson (story, walkthrough, practice, quiz).

- `runtime.ts`: **`BoardRuntime`**, one board live and framework-free: props' state, the one door (`call`), IS rules kept true, WHEN rules answered in order, scripts (then / with / wait), the learner winning over the lesson's animations, pause. Tested with a fake clock and voice.
- `use-board-runtime.ts`: runs a `BoardRuntime` while its board is on screen.
- `LessonPlayer.tsx`: plays a lesson board by board; raises lesson events.
- `BoardPlayer.tsx`: one board: the layout plus the chrome every board shares (Check for its question, the feedback bar, Continue once it passes); turns commit signals into events.
- `Layout.tsx`: renders the piece tree; each prop through its view.
- `narration.ts`: reads a line aloud from published audio when a prop's `say` runs; a failed line shows a retry mark and raises `line audioFailed`.
- `prop-module.ts`: what a prop gives the player: `{ def, View }`.
- `ui-text.ts`: chrome copy (closed keys). `styles.css`: tokens and styles.

May import: `@chalk/content`, `@chalk/prop`, `@chalk/events`, `preact`. Never imports a specific prop; the app passes a registry.
