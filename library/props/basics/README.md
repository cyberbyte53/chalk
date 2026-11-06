# @chalk/prop-basics

The props every lesson uses.

| Prop | What | Actions | Signals |
|---|---|---|---|
| `text` | Words on the board, styled `title`, `body`, `note` or `definition` (an outlined box, tinted from its `color`); `text` is an input, so an IS can keep it live | `say` | |
| `line` | A cast character's speech bubble (Maya, Arjun) | `say` | |
| `choice` | Multiple choice, answer key inside, feedback per wrong option | `select`, `check`, `giveFeedback`, `say` | `checked` (commit), `correct`, `wrong` |
| `button` | A button; `label` and `isEnabled` are inputs, so an IS can switch it off | `press` (does nothing while off) | `pressed` |
| `timer` | Nothing on screen; ticks while running. For things that repeat or happen on their own | `start { every, times? }` (runs until stopped or `times` ticks), `stop` | `tick { ticks }` |
| `goal` | "Get that prop into the goal, then Check"; `isMet`, and `answer` (what that prop reads as, in the words the learner sees, or null), are inputs the lesson owns | `check`, `giveFeedback`, `say` | `checked` (commit), `correct`, `wrong` |

`say` reads the line aloud and finishes when it ends; nothing is said unless a script calls it.

May import: `@chalk/prop`, `@chalk/content`, `@chalk/player` (types), `preact`, `zod`. Exports: `basicProps`, `CharacterId`, `Avatar`, `ButtonSignal`, `TimerSignal`, `TextStyle`, state types.
