# Glossary

One concept, one name, everywhere: code, content, docs and conversation. If a word here changes, it changes everywhere.

| Name | What it is | In code |
|---|---|---|
| **Chapter** | Concepts in book order, as in the NCERT book (older: lessons grouped) | `content/<book>/<chapter>/build.yaml`, `BuiltChapter` |
| **Lesson** | An ordered run of boards. Story, walkthrough, practice and quiz are all lessons. | `Lesson` (`@chalk/content`) |
| **Board** | One screen: a layout tree of props, plus the IS and WHEN rules that wire them | `Board` |
| **Piece** | A node in a board's layout tree: layout pieces (Column, Row, Overlay, Space) arrange; a prop piece places a prop | `Piece`, `PieceKind` |
| **Prop** | Anything placed on a board. Same shape for all: state, actions, signals, parts | `PropDef`, `defineProp` (`@chalk/prop`), `library/props/<name>/` |
| **State** | What a prop is right now: stored fields plus derived ones, read alike | `viewOf`, `PropView` |
| **Stored field** | One of the few independent quantities a prop keeps; changed only by actions | `PropDef.state` |
| **Derived field** | Computed from stored fields; read-only, never stale | `PropDef.derived` |
| **Input** | A stored field an IS rule may own (e.g. a text's words) | `PropDef.inputs` |
| **Action** | The only way a prop changes. Instant or timed; says what it keeps fixed; flagged if it reveals an answer | `ActionSpec`, `actionsFor` |
| **Timed action** | An action that takes time (a tween, a spoken line); scripts wait for it to finish | `tween`, `seq`, `repeat` (steps, as data) |
| **Signal** | Something a prop announces (pressed, landed, wrong) | `SignalSpec` |
| **Part** | A named thing on a prop that can be pointed at; can come and go | `PropDef.parts`, `PropDef.locate` |
| **Address** | Where a node is on a board, one spelling everywhere: names from the piece down, joined by `/` (`mirror/objectArrow/object`); on screen as `data-path`. A `/` inside a name from data is written `%2F` | `pathOf`, `namesOf` (`@chalk/prop`), `findNode`, `addressOf` (`@chalk/player`) |
| **Leaf** | A prop with no children: one thing, with its own state or with every field bound | `defineProp` |
| **Group** | A prop made of other props (its children) joined by links; its state is its own fields plus each child's, nested. A board works the same way | `defineGroup` (`@chalk/prop`), `groupView` (`@chalk/player`) |
| **Link** | How a group wires its children: IS (a child's field always equals a function of the rest), WHEN (on a child's signal, run steps), ROUTE (take over a learner action on a child, or refuse it) | `GroupSpec.is`, `.when`, `.route` |
| **Bound field** | A child's field an IS link writes; the child's own actions can't change it, so a learner control on it must be routed | `GroupLayout.bound` |
| **Frame** | One picture several children draw into: its provider owns the window and the transform; it places every child's labels in one pass | `FrameSpec`, `FrameStage`, `useFrame`, `useFrameLabels` |
| **Drawing kit** | Stateless drawing pieces shared by props (labware, geometry marks, optics, circuit symbols) | `@chalk/draw` (`lab.tsx`, `marks.tsx`, `optics.tsx`, `circuit.tsx`) |
| **Written number** | A number as Chalk writes it, the same everywhere: exact (integer, fraction, surd) or a rounded decimal, as text and TeX | `exact`, `quantity`, `formula` (`@chalk/exact`) |
| **The one door** | The single path every change takes: an action, checked against the prop's schema | `applyPatch`, `BoardRuntime.call` |
| **IS** | A rule that keeps a prop's input equal to an expression, always | `IsRule` |
| **WHEN** | A rule that answers a signal (with an optional condition) with a script | `WhenRule` |
| **THEN / script** | Actions over time: `call`, `wait`, `seq` (then), `par` (with) | `Script` |
| **Expression** | Read-only maths and logic over props' state in rules | `compileExpression`, `compileTemplate` |
| **Expression argument** | An action argument worked out from props' state when the action is called: `{ "expr": "coin.count" }` | `argExpression` |
| **Timer** | A prop with nothing on screen that ticks while running; how a lesson makes things repeat or happen on their own | `timer` (`library/props/basics`) |
| **Board prop** | The board itself, named `board`: `pass`, `show`, `hide`; signals `started`, `continued` | `boardProp`, `BOARD` |
| **Question** | A prop with the question role (`choice`, `goal`): status, attempts, feedback, `check` | `PropRole.Question`, `QuestionView` |
| **Concept** | The smallest thing a student can get wrong on its own: a folder with an overview (pages). Its id is what questions test and what learner counts hang on | `<concept>/build.yaml`, `BuiltConcept`, `concepts` on a question prop |
| **Question bank** | A chapter's question families (`<chapter>/questions/`). Each family `tests` one or more of the chapter's concepts; a question is served once all of them are taught | `chapterManifestSchema.questions`, `BuiltChapter.questions`, `BankRef` |
| **Concept enum** | A chapter's concepts as `Concept.X`, generated from its `build.yaml` into `concepts.gen.ts`, for a family's `tests` | `conceptsModule`, `ContentFile.Concepts` |
| **Misconception** | Why a specific wrong answer is wrong; reported, not just "wrong" | `misconception` on an option |
| **Line** | A cast character's speech bubble (Maya, Arjun) | `line` prop, `CharacterId` |
| **Event** | One entry in the record of what a learner did: the same envelope, plus one kind's payload (`open`, `close`, `cause`, `signal`, `jugnu`, `app`) | `ChalkEvent`, `eventKinds` |
| **Cause** | Something the learner or Jugnu did on a board: an action through the door, or a signal a view raised; a drag is one per gesture | `cause` entries |
| **Board recorder** | The one producer for boards: records every cause and signal, linked | `recordBoard` |
| **Processor** | A server task that reads events as they arrive and keeps its own table (board facts, progress) | `boardFactsFrom` |
| **Actor** | Who did it: learner, lesson (its script), app, or Jugnu. Only the learner's own actions are evidence | `Actor` |
| **Event channel** | One `record()` on the phone: adds the envelope, checks the kind, hands entries to subscribers (the uploader) | `createEventBus` (`@chalk/events`) |
| **Name** | What an author calls a board or piece; free to rename; camelCase because rules use it | `name` |
| **Item id, address** | What events name: a board by its built item's id (a hash of where it lives in content/), a node on it by its address (`<item id>#<address>`) | `ItemRef`, `nodeMachineId`, `boardKey` |
| **Saved board** | A board written down: each node by address, the shape of its facts (`type@hash`), its facts, whether the learner touched it; loaded back only by props of the same shape | `runtime.save()`, `runtime.load()`, `SavedBoard`, `schemaKey` |
| **Say** | The action every speaking prop has: read its line aloud, finishing when it ends | `SAY` |
| **Speak** | The author's own spoken version of a line, when it should be said differently from how it's shown; wins over the rules | `speak`, `spokenText` |
| **Pronunciation rules** | How screen text is said aloud, for every lesson: ordered groups (maths, units, chemistry, short forms) of pattern → words per language | `content/pronunciations.json`, `toSpoken` |
| **Speakable** | What a voice may be given: letters, digits, spaces, ordinary punctuation. Anything else is refused when audio is made | `unspeakable` |
| **Voice provider** | What turns a line into audio (the audio step) (macOS `say` now; a self-hosted or cloud model later) | `TtsProvider`, `content/voices.json` |
| **Publish** | Build the content from a clean commit and keep that build as `published/<commit>/` | `pnpm publish-content` |
| **Jugnu** | The AI tutor, on question boards: an agent that reads the whole board as data and works in a loop of tool calls (the board's actions, point, calculate, hand back), within limits the runtime enforces | `@chalk/jugnu`, `JugnuSession`, `JugnuPanel` |
| **Jugnu's tools** | `try` (what actions would do, unseen) and `calculate` to think; `reply` to answer: say, show (an action for the student to watch), point, then ask (options to tap) or nothing (he goes quiet; the board is theirs). Typed from the board's own actions; strict where the board allows | `jugnuTools`, `runTool` |
| **Cue** | One thing Jugnu's reply does on the phone, in order: say, point, act, ask (options). Only what he kept; his tries never reach the student | `Cue`, `cueSchema` |
| **Headless board** | A board with no screen, where time jumps to the end of whatever moves: the server's copy Jugnu thinks on | `headlessBoard` |
| **Jugnu notes** | What a lesson tells Jugnu about a board, in plain English: its purpose, what each prop stands for | `jugnu` on a board, `b.purpose`, `b.standsFor` |
| **Flag** | A chat with Jugnu someone wasn't happy with, kept whole on the server to look at and replay | `POST /api/jugnu/flags`, `pnpm --filter @chalk/server flags` |
| **Student only** | Actions on a board that only the learner may do (taking the bulb out, when that is the task); Jugnu can never do them | `studentOnly` on a board |
| **Model provider** | The model Jugnu runs on, through its standard tool calling (any OpenAI-style API such as DeepSeek or Foundry, or Ollama); swapping it changes nothing else | `LlmProvider`, `providerFrom` |
| **Slate** | Jugnu's own board, shown inside his chat; the same player as a board | (not built yet) |
| **Book** | A subject for one class (Class 9 Maths): chapters in book order | `content/<book>/build.yaml`, `book.json` |
| **Manifest** | A folder's `build.yaml`: its title and the children it includes, in order. Only what a manifest lists is built | `build.yaml`, `bookManifestSchema` … (`@chalk/author`) |
| **Page** | One board of a concept's overview: explanation, worked example, animation or sandbox | `page()`, `overview.ts`, `BuiltPage` |
| **Question family** | A question template: a folder with `family.ts` (params → board) and `params.yaml` (the rows) | `family()`, `BuiltFamily` |
| **Params row** | One row of `params.yaml`: one question's params, and optionally its level, origin, exclude | `paramsRowSchema` |
| **Question** | A family built with one params row: a board with a question prop | `BuiltQuestion` |
| **Origin** | Who wrote a params row: authored (a person or an agent they asked) or generated (the question generator) | `Origin` |
| **Witness** | How a learner gets a board right, as steps; played on the real props at build. A board whose witness fails is not built | `b.witness`, `Step` |
| **Note check** | A known wrong answer and the note it should get; played like a witness | `b.noteCheck` |
| **Board pattern** | A reusable piece of board-building shared by every concept | `library/patterns/` |
| **Explainer prop** | A prop Jugnu may bring in to explain a concept (a number line, tiles). Words, buttons, questions and timers are not | `isExplainer` on `PropDef` |
| **Rich text** | What every learner-facing string may hold: words, `**bold**`, `*emphasis*`, `$maths$`, `$$display maths$$` (KaTeX, with mhchem). Checked at build | `RichText`, `parseRich`, `richProblems` (`@chalk/player`) |
| **Art** | A book's, chapter's or concept's picture, drawn in code with the pieces (`art.tsx`), built to checked SVG | `defineArt`, `ArtFrame`, `BuiltArt`, `pnpm art` |
| **Stage** | A drawing: an SVG whose x (and y) ranges become d3 scales, plus layers for crowds and for what sits above them | `Stage`, `Space` (`@chalk/draw`) |
| **Piece** | A shared drawing part (axis, dot, mark, curve, dots) that props and art are built from; placed in the stage's numbers, coloured by the look | `Axis`, `Dot`, `Dots` … (`@chalk/draw`) |
| **Crowd** | Many of the same thing, drawn by a collection piece with WebGL (or canvas) once they pass a threshold | `Dots`, `CROWD_THRESHOLD` |
| **Look** | The design tokens every screen and prop is drawn with: colour roles, fonts, the type scale. The one place a raw colour lives | `@chalk/look`, `tokens.json`, `look.css` |
| **Colour role** | A colour by what it is for (`primary`, `on-surface`, `right`), not by its value; the theme decides the value. A colour field takes a role or any `#rrggbb` | `Color`, `--color-*`, `cssColor` |
| **Type scale** | The four text sizes a board uses (title, body, note, caption), each with its line height | `--text-*` (`@chalk/look`) |
| **Exact decimal** | A decimal kept as written ("7.384", "2.50"), with digit work and no float drift | `Dec`, `dec()` (`@chalk/exact`), `decimal` (params) |
| **Item id** | 16 hex characters: a hash of the item's path in content/ (a question: plus its params). Never typed | `idOf` |
| **Path** | A node's place in the course tree, its identity: `class10-maths/real-numbers/hcf-and-lcm/story`, a piece after `#`; a bank row is named by a hash of its params | `item.path`, `piecePath` |
| **Id** | A hash of a path, always worked out from it: what events carry (`build/ids.json` reads it back) | `idOf` |
| **Commit** | The git commit the app and server were built from: in `build/index.json`, the app, `/api/health` and every event | `CHALK_COMMIT` |
| **Version** | A hash of an item's own content and what it is made from (a board: its code and its props' versions; a container: its children's) | `versionOf` |
| **Source** | Where a built item came from: path, file, row | `Source` |
| **Build** | Everything the manifests reach, checked: the course's shape as JSON in `build/`, each page and question naming the module that makes its board (chapters ship as code) | `pnpm build-content`, `pnpm preview`, `pnpm publish-content` |
| **Player** | Plays lessons and boards; one player for everything | `@chalk/player` |
| **Runtime** | One board, live: props' state (signals), IS kept true (one effect per rule, re-run only when what it read changes), WHEN answered, scripts run | `BoardRuntime` |
| **Library** | The registry of every prop type | `@chalk/library` |
| **Studio** | Authoring: formats + validator now, a GUI later | `@chalk/studio` |
| **Server** | The one Node process on the box: the API, Jugnu's model (key added there), and the built app | `@chalk/server`, `createApp` |
| **Account** | Someone who signed in with Google, known by Google's id (`sub`), not their email | `accounts`, `Account` (`@chalk/api`) |
| **Sign-in** | One device's signed-in state: a random token in an HttpOnly cookie; only its hash is stored. Lasts 90 days. (Not the events' `sessionId`, which is one run of the app) | `sign_ins`, `SIGN_IN_COOKIE` |
| **Setup** | The one-time screen after the first sign-in: name, school code, learner or teacher | `POST /api/me/setup` |
| **Role** | Learner or teacher, chosen at setup, never changed. The screens say "student" | `Role` (`@chalk/api`) |
| **School code** | The code we give a school; everyone types it at setup | `schools.code`, `pnpm add-school` |
| **Group** | A teacher's learners for one course. No name: shown as its course and when it was made | `groups`, `TeacherGroup`, `JoinedGroup` |
| **Join code** | Six characters (no look-alike letters) a learner types, or opens as `/join/<code>`, to join a group. A new code stops the old one | `groups.join_code`, `makeCode` |
| **Practice** | A concept's questions after its pages, played as their own lesson (`practice/<concept id>`); its score is each question's first try | `practiceLessonId`, `PracticeScore`, `ResultScreen` |
| **Progress** | Which concepts a learner has played and practised, worked out from their events and nothing else, the same on phone and server | `progressFrom`, `Progress` (`@chalk/api`) |
| **Concept mark** | How a concept went for one learner, as a square on the teacher's view: strong (practice 70%+ right, or done with no practice), shaky (40%+), weak, started (pages only), none | `ConceptMark`, `conceptMark` |
