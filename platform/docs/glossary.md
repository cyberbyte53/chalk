# Glossary

One concept, one name, everywhere: code, content, docs and conversation. If a word here changes, it changes everywhere.

| Name | What it is | In code |
|---|---|---|
| **Chapter** | Concepts in book order, as in the NCERT book (older: lessons grouped) | `content/<book>/<chapter>/build.yaml`, `BuiltChapter` |
| **Lesson** | An ordered run of boards. Story, walkthrough, practice and quiz are all lessons. | `Lesson` (`@chalk/content`) |
| **Board** | One screen: its scene (the outermost prop, holding the pieces and the lesson's rules) and how its pieces are laid out | `Board`, `scene()` (`@chalk/author`) |
| **Piece** | A node in a board's layout: a column of prop pieces, top to bottom, with a space at its foot; a prop piece places a prop | `Piece`, `PieceKind` |
| **Prop** | Anything on a board, and the one building block: variables, facts, needs, actions, signals, rules, parts, a view, a role. A prop that holds props is a prop like any other | `prop()` (`@chalk/prop`), `library/props/<name>/` |
| **Variable** | A prop's own data: anyone reads it, only its own rules change it | `variables`, `start` |
| **Fact** | Worked out from a prop's variables and needs; read like a variable | `facts` |
| **Need** | What a prop must be given by whatever holds it, read live: given by name (a variable or fact of the holder's with that name), or by a `give` line where a name differs | `needs`, `give` |
| **Rule** | What a prop does on an event: `on` for its actions, `hear` for its parts' signals. Gets the prop as it is now (`me`), the payload, and its tools (`t.set`, `t.tell`, `t.self`, `t.to`, `t.later`, `t.move`, `t.stop`) | `Rule`, `Tools` |
| **Scene** | The board's outermost prop: it holds the pieces, its rules are the lesson's, and its own actions and signals are the board's (`show`, `pass`, `said`, `continued`) | `scene()`, `SceneModel` |
| **Queue** | The one place time lives: what is for later, each with its due time. The screen's frame loop moves the board clock to now; checks jump it | `TimeQueue`, `t.later` |
| **Planned move** | A motion whose every moment is known when it starts (a glide, a street rising): stored as from, to, start and length, read at the clock | `t.move`, `moveAt` |
| **Tick** | A rule that queues itself again (every 1/60 s), for a motion where each moment depends on the last | `t.later(1 / 60, t.self.tick())` |
| **Action** | An event in: asks one prop to do something; its rule (`on`) decides, and may refuse. `from: "screen"` marks the student's | `action()`, `ActionDef` |
| **Signal** | An event out: news a prop tells, heard by the props holding it, nearest first; siblings never hear it | `signal()`, `SignalDef` |
| **Element** | A named thing a prop's view draws for the student: an input (it says what it `does`) or something they read (it `shows` a value). Its name is its address under the piece; what `show`'s steps, comments and Jugnu's pointing use. (Older code and data say "part": `data-part`, `PartSnapshot`) | `does`, `says`, `shows` (`@chalk/prop` tags.ts) |
| **Description** | A prop as the student sees it: read from the tags in what its view draws (one line, each element, what it knows but doesn't show) | `describeView` (`@chalk/player`), `Observation` |
| **Role** | What a prop is for: an explainer (a world the student works in), a question, or part of the page (words) | `PropRole` |
| **Drag** | An element the learner moves, inside a frame; the player wires pointer, keys and the frame's transform | `useDrags` (`@chalk/player`) |
| **Address** | How people, agents and threads name a thing: where it lives, from one of two roots, `content/` + a path (`content/class10-maths/real-numbers/hcf-and-lcm/story`) or `library/props/<package>/<type>` (`library/props/basics/choice`), then after `#` where on it: names from the piece (or the prop) down, joined by `/` (`…/story#mirror/objectArrow/object`; on screen as `data-path`; a `/` inside a name from data is written `%2F`). One without a root is refused. What `show`, `comments`, `comment`, `affected` and the preview (`?dev&at=`) take | `parseAddress`, `contentAddress`, `propAddress` (`@chalk/content/address`); `pathOf`, `namesOf` (`@chalk/prop`), `findNode`, `addressOf` (`@chalk/player`) |
| **Part** | A prop held by another (`children`): the walker in the coordinate plane. It owns its variables and knows nothing of the others; its holder joins them (needs given, signals heard). A board uses a part when its setup names it | `children`, `groupView` (`@chalk/player`); the plane's `PARTS` |
| **Frame** | One picture several children draw into: its provider owns the window and the transform | `FrameSpec`, `FrameStage`, `useFrame` |
| **Label** | Words naming one thing in a picture, placed round it with every other label, clear of everything drawn but what is coverable | `useLabel`, `data-coverable`, `solveLabels` |
| **Drawing kit** | Stateless drawing shapes shared by props (labware, geometry marks, optics, circuit symbols) | `@chalk/draw` (`lab.tsx`, `marks.tsx`, `optics.tsx`, `circuit.tsx`) |
| **Written number** | A number as Chalk writes it, the same everywhere: exact (integer, fraction, surd) or a rounded decimal, as text and TeX | `exact`, `quantity`, `formula` (`@chalk/exact`) |
| **Question** | A prop with the question role (`choice`, `goal`): status, attempts, feedback, `check`, `retry` | `PropRole.Question`, `QuestionView` |
| **Concept** | The smallest thing a student can get wrong on its own: a folder with an overview (pages). Its id is what questions test and what learner counts hang on | `<concept>/build.yaml`, `BuiltConcept`, `concepts` on a question prop |
| **Question bank** | A chapter's question families (`<chapter>/questions/`). Each family `tests` one or more of the chapter's concepts; a question is served once all of them are taught | `chapterManifestSchema.questions`, `BuiltChapter.questions`, `BankRef` |
| **Concept enum** | A chapter's concepts as `Concept.X`, generated from its `build.yaml` into `concepts.gen.ts`, for a family's `tests` | `conceptsModule`, `ContentFile.Concepts` |
| **Misconception** | Why a specific wrong answer is wrong; reported, not just "wrong" | `misconception` on an option |
| **Event** | One entry in the record of what a learner did: the same envelope, plus one kind's payload (`open`, `close`, `cause`, `signal`, `app`) | `ChalkEvent`, `eventKinds` |
| **Cause** | Something the student did on a board: an action from the screen; a drag is one per gesture | `cause` entries |
| **Board recorder** | The one producer for boards: records every cause and signal, linked | `recordBoard` |
| **Processor** | A server task that reads events as they arrive and keeps its own table (board facts, progress) | `boardFactsFrom` |
| **Actor** | Who did it: learner, lesson (its rules), app (or Jugnu, in old events). Only the learner's own actions are evidence | `Actor` |
| **Event channel** | One `record()` on the phone: adds the envelope, checks the kind, hands entries to subscribers (the uploader) | `createEventBus` (`@chalk/events`) |
| **Name** | What an author calls a board or piece; free to rename; camelCase because rules use it | `name` |
| **Item id, address** | What events name: a board by its built item's id (a hash of where it lives in content/), a node on it by its address (`<item id>#<address>`) | `ItemRef`, `nodeMachineId`, `boardKey` |
| **Speak** | A line's spoken words, written with it when its screen words aren't how it is said ("√2" → "the square root of 2"); without it, the screen words are said (bold marks dropped) | `speak`, `spokenText` |
| **Script** | Every line a board says, in order, with who says it: what the voice is made from, and what the preview and review show | `scriptOf`, `ScriptLine` |
| **Cast** | Who speaks in which voice: each character (the narrator, Riya, Aman), per language, a voice named with its provider (`piper:hi_IN-rohan-medium`) | the guides' `voices` setting (`authoring/guide.md`), `voiceFor` |
| **Clip** | Audio the engine plays: **voiced** (a phrase of a line, made from its words by a speaker's voice, kept in its chapter's `sound/`, named by voice and words) or **chosen** (a sound from the library) | `sound.json`, `voiceChapter` |
| **Speakable** | What a voice may be given: letters, digits, spaces, ordinary punctuation. Anything else is refused when audio is made | `unspeakable` |
| **Voice provider** | What turns words into a clip, on this machine or a service: Piper now (a cloud or AI voice the same way: one file) | `TtsProvider`, `sound/voice/providers/` |
| **Publish** | Build the content from a clean commit and keep that build as `published/<commit>/` | `pnpm publish-content` |
| **Jugnu** | The app's character; the AI tutor he will be is not built yet (to be designed on this board model) | `JugnuFigure` in `@chalk/player` |
| **Book** | A subject for one class (Class 9 Maths): chapters in book order | `content/<book>/build.yaml`, `book.json` |
| **Manifest** | A folder's `build.yaml`: its title and the children it includes, in order. Only what a manifest lists is built | `build.yaml`, `bookManifestSchema` … (`@chalk/author`) |
| **Page** | One board of a concept's overview: explanation, worked example, animation or sandbox | `page()`, `overview.ts`, `BuiltPage` |
| **Question family** | A question template: a folder with `family.ts` (params → board) and `params.yaml` (the rows) | `family()`, `BuiltFamily` |
| **Params row** | One row of `params.yaml`: one question's params, and optionally its level, origin, exclude | `paramsRowSchema` |
| **Built question** | A family built with one params row: a board with a question prop | `BuiltQuestion` |
| **Origin** | Who wrote a params row: authored (a person or an agent they asked) or generated (the question generator) | `Origin` |
| **Witness** | How a student gets a board right, as taps and waits; played on the real props at build. A board whose witness fails is not built | `witness`, `tap`, `Step` (`@chalk/author`) |
| **Note check** | A known wrong answer and the note it should get; played like a witness | `noteChecks`, `NoteCheck` |
| **Board pattern** | A reusable piece of board-building shared by every concept | `library/patterns/` |
| **Explainer prop** | A prop that is a world the student works in (a number line, the coordinate plane). Words, questions and the board are not | `PropRole.Explainer` |
| **Rich text** | What every learner-facing string may hold: words, `**bold**`, `*emphasis*`, `$maths$`, `$$display maths$$` (KaTeX, with mhchem). Checked at build | `RichText`, `parseRich`, `richProblems` (`@chalk/player`) |
| **Art** | A book's, chapter's or concept's picture, drawn in code with the shapes (`art.tsx`), built to checked SVG | `defineArt`, `ArtFrame`, `BuiltArt`, `pnpm art` |
| **Stage** | A drawing: an SVG whose x (and y) ranges become d3 scales, plus layers for crowds and for what sits above them | `Stage`, `Space` (`@chalk/draw`) |
| **Shape** | A shared drawing (axis, dot, mark, curve, dots) that props and art are built from; placed in the stage's numbers, coloured by the look | `Axis`, `Dot`, `Dots` … (`@chalk/draw`) |
| **Crowd** | Many of the same thing, drawn by a collection shape with WebGL (or canvas) once they pass a threshold | `Dots`, `CROWD_THRESHOLD` |
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
| **Runtime** | One board, live, on the student's screen: the board model's `Board`, its clock moved each frame, the voice, the recorder | `BoardRuntime` (`@chalk/player`) |
| **Library** | The registry of every prop type | `@chalk/library` |
| **Studio** | Authoring tools: the content build, the catalogue, the chalk MCP | `@chalk/studio` |
| **Server** | The one Node process on the box: the API and the built app | `@chalk/server`, `createApp` |
| **Account** | Someone who signed in with Google, known by Google's id (`sub`), not their email | `accounts`, `Account` (`@chalk/api`) |
| **Sign-in** | One device's signed-in state: a random token in an HttpOnly cookie; only its hash is stored. Lasts 90 days. (Not the events' `sessionId`, which is one run of the app) | `sign_ins`, `SIGN_IN_COOKIE` |
| **Setup** | The one-time screen after the first sign-in: name, school code, learner or teacher | `POST /api/me/setup` |
| **School code** | The code we give a school; everyone types it at setup | `schools.code`, `pnpm add-school` |
| **Group** | A teacher's learners for one course. No name: shown as its course and when it was made | `groups`, `TeacherGroup`, `JoinedGroup` |
| **Join code** | Six characters (no look-alike letters) a learner types, or opens as `/join/<code>`, to join a group. A new code stops the old one | `groups.join_code`, `makeCode` |
| **Practice** | A concept's questions after its pages, played as their own lesson (`practice/<concept id>`); its score is each question's first try | `practiceLessonId`, `PracticeScore`, `ResultScreen` |
| **Progress** | Which concepts a learner has played and practised, worked out from their events and nothing else, the same on phone and server | `progressFrom`, `Progress` (`@chalk/api`) |
| **Learner update** | What a finished set shows about a child, judged by a model: a few points, each with its kind (needs you, getting there, on track), the mistake in a teacher's words, one next step, and the questions and reflections it rests on | `learner_updates`, `UpdatePoint`, `PointKind` (`@chalk/learning`) |
| **Needs you** | A child whose latest update has a point that needs the teacher; they leave when a later update no longer has it ("got it on their own", greyed for a day) | `sectionOf`, `needsYouPoint` |
| **Shared mistake** | The same wrong answer to the same question by two or more children of a section, in a point that isn't on track | `SharedMistake`, `sectionOf` |
| **Snapshot** | A child's board at one of their tries, drawn small by the real player from what they did on that opening up to the try | `TrySnapshot`, `BoardAt`, `tryCausesPath` |
| **Concept mark** | How a concept went for one learner, as a square on the teacher's view: strong (practice 70%+ right, or done with no practice), shaky (40%+), weak, started (pages only), none | `ConceptMark`, `conceptMark` |
