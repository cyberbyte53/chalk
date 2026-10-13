# Glossary

One concept, one name, everywhere: code, content, docs and conversation. If a word here changes, it changes everywhere.

| Name | What it is | In code |
|---|---|---|
| **Chapter** | Lessons grouped, as in the NCERT book | `content/<course>/<chapter>/` |
| **Lesson** | An ordered run of boards. Story, walkthrough, practice and quiz are all lessons. | `Lesson` (`@chalk/content`) |
| **Board** | One screen: a layout tree of props, plus the IS and WHEN rules that wire them | `Board` |
| **Piece** | A node in a board's layout tree: layout pieces (Column, Row, Overlay, Space) arrange; a prop piece places a prop | `Piece`, `PieceKind` |
| **Prop** | Anything placed on a board. Same shape for all: state, actions, signals, parts | `PropDef`, `defineProp` (`@chalk/prop`), `props/<name>/` |
| **State** | What a prop is right now: stored fields plus derived ones, read alike | `viewOf`, `PropView` |
| **Stored field** | One of the few independent quantities a prop keeps; changed only by actions | `PropDef.state` |
| **Derived field** | Computed from stored fields; read-only, never stale | `PropDef.derived` |
| **Input** | A stored field an IS rule may own (e.g. a text's words) | `PropDef.inputs` |
| **Action** | The only way a prop changes. Instant or timed; says what it keeps fixed; flagged if it reveals an answer | `ActionSpec`, `actionsFor` |
| **Timed action** | An action that takes time (a tween, a spoken line); scripts wait for it to finish | `tween`, `task` |
| **Signal** | Something a prop announces (pressed, landed, wrong) | `SignalSpec` |
| **Commit** | A signal where the learner decides something; the only thing logged | `SignalSpec.isCommit` |
| **Part** | A named thing on a prop that can be pointed at; can come and go | `PropDef.parts`, `PropDef.locate` |
| **The one door** | The single path every change takes: an action, checked against the prop's schema | `applyPatch`, `BoardRuntime.call` |
| **IS** | A rule that keeps a prop's input equal to an expression, always | `IsRule` |
| **WHEN** | A rule that answers a signal (with an optional condition) with a script | `WhenRule` |
| **THEN / script** | Actions over time: `call`, `wait`, `seq` (then), `par` (with) | `Script` |
| **Expression** | Read-only maths and logic over props' state in rules | `compileExpression`, `compileTemplate` |
| **Expression argument** | An action argument worked out from props' state when the action is called: `{ "expr": "coin.count" }` | `argExpression` |
| **Timer** | A prop with nothing on screen that ticks while running; how a lesson makes things repeat or happen on their own | `timer` (`props/basics`) |
| **In events** | Whether a placed prop's state goes into the board's Continue event; yes unless the lesson says `isInEvents: false` | `isInEvents` |
| **Board prop** | The board itself, named `board`: `pass`, `show`, `hide`; signals `started`, `continued` | `boardProp`, `BOARD` |
| **Question** | A prop with the question role (`choice`, `goal`): status, attempts, feedback, `check` | `PropRole.Question`, `QuestionView` |
| **Concept** | A tag on questions saying what they test | `concepts: string[]` |
| **Misconception** | Why a specific wrong answer is wrong; reported, not just "wrong" | `misconception` on an option |
| **Line** | A cast character's speech bubble (Maya, Arjun) | `line` prop, `CharacterId` |
| **Event** | One commit: an input applied to a machine, plus the machine's state after, inside a fixed envelope | `ChalkEvent`, `MachineEvent` |
| **Machine** | Anything whose commits are logged (lesson, board, question, line): a type, an id, a state and its inputs | `MachineType`, `EventFor` |
| **raiseEvent** | What the player calls to record a commit, bound to its machine | `bindRaise`, `RaiseEvent` |
| **Actor** | Who did it: learner, lesson (its script), app, or Jugnu. Only the learner's own actions are evidence | `Actor` |
| **Event backbone** | Where commits are raised and subscribers receive them, on the phone | `createEventBus` (`@chalk/events`) |
| **Name** | What an author calls a board or piece; free to rename; camelCase because rules use it | `name` |
| **Permanent id** | A number publish gives each board and piece; never changes or gets reused; used in events | `id`, `permanentIdSchema` |
| **Say** | The action every speaking prop has: read its line aloud, finishing when it ends | `SAY` |
| **Speak** | The author's own spoken version of a line, when it should be said differently from how it's shown; wins over the rules | `speak`, `spokenText` |
| **Pronunciation rules** | How screen text is said aloud, for every lesson: ordered groups (maths, units, chemistry, short forms) of pattern → words per language | `content/pronunciations.json`, `toSpoken` |
| **Speakable** | What a voice may be given: letters, digits, spaces, ordinary punctuation. Anything else is refused at publish | `unspeakable` |
| **Voice provider** | What turns a line into audio at publish (macOS `say` now; a self-hosted or cloud model later) | `TtsProvider`, `content/voices.json` |
| **Publish** | Check a lesson, hand out ids, retire deleted ids, bump the version, keep a copy of every version, and with `--voice` speak every line a script says | `pnpm publish-lesson`, `publishLesson` |
| **Jugnu** | The AI tutor, on question boards: an agent that reads the whole board as data and works in a loop of tool calls (the board's actions, point, calculate, hand back), within limits the runtime enforces | `@chalk/jugnu`, `JugnuSession`, `JugnuPanel` |
| **Jugnu's tools** | What he can do besides talk: each action he may use now (`<prop>__<action>`), `point`, `calculate`, `wait_for_student` (hand the board back) | `toolsFor`, `runTool` |
| **Student only** | Actions on a board that only the learner may do (taking the bulb out, when that is the task); Jugnu can never do them | `studentOnly` on a board |
| **Hand back** | Jugnu ends his turn and watches props; when the learner acts on one, he goes on | `wait_for_student`, `JugnuSession.continue` |
| **Model provider** | The model Jugnu runs on, through its standard tool calling (any OpenAI-style API such as DeepSeek or Foundry, or Ollama); swapping it changes nothing else | `LlmProvider`, `providerFrom` |
| **Slate** | Jugnu's own board, shown inside his chat; the same player as a board | (not built yet) |
| **Player** | Plays lessons and boards; one player for everything | `@chalk/player` |
| **Runtime** | One board, live: props' state, IS kept true, WHEN answered, scripts run | `BoardRuntime` |
| **Library** | The registry of every prop type | `@chalk/library` |
| **Studio** | Authoring: formats + validator now, a GUI later | `@chalk/studio` |
