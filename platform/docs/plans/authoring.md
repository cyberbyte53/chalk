# Authoring: how a chapter is made

Status: plan, agreed with the person step by step; reviewed five times, each review's changes folded in.
Nothing built. Replaces `platform/docs/authoring-pipeline.md` once built.

## Why

- **Others:** people own *what* is taught and AI makes the volume (Duolingo, Khan Academy; Khan's "a person
  shapes the first question of a kind, the AI makes more" is our question families); the interactive is
  the expensive part and is designed first (Brilliant); a plan a person approves, then work tracked on disk
  (Spec Kit, Kiro, Claude Code); feedback pinned to the exact spot (Frame.io); a house style with a short
  sheet per book (publishing); a glossary checked by machine and a style guide per language (translation);
  settings that cascade down a folder tree, nearest wins (Hugo, `.editorconfig`, `CLAUDE.md`); generators
  for what has a fixed shape (Hugo's archetypes, Rails).
- **Chapter 1:** source → objectives → flow → props was a sound chain (ids cited down it, checked by
  machine); the ceremony hurt (four gates, a change upstream un-approving everything below, 117 lines of
  flow to read, 132 reviewer threads closed by the person unread). A prop built and thrown away (the stall)
  was the costliest mistake. Pinned comments and the independent reviewer were the best parts. Hindi came
  from memory. An audit of its 167 threads: the old constitution mostly said "add", the person's
  corrections mostly said "cut"; over half the threads were mechanical, which only checks can stop.
- **First principles:** scarce: the person's attention and judgement, props, being right against the book.
  Cheap: an agent's writing and re-checking. Ours alone: boards play the same every time, so a machine
  checks what works before anyone looks.

## Two trees, the same paths

`content/` is what ships (code the app runs, built and voiced); `authoring/` is how it is made (books,
sources, guides, plans, comments). They mirror each other: a chapter is `class9-maths/coordinate-geometry`
in both, so its two halves are always found together, and every command takes that one path. Content code
never imports from `authoring/`; the build reads from it only the guide's settings (below).

```
content/                                  WHAT SHIPS
  <book>/          build.yaml, art.tsx (its cover, when one is drawn)
    <chapter>/     build.yaml, art.tsx (its tile), sound/
      <lesson>/    build.yaml, art.tsx (its card), overview.ts       (a lesson is a concept in build.yaml)
      questions/<family>/  family.ts, params.yaml

authoring/                                HOW IT IS MADE
  guide.md, guide/                          how we make lessons, for all of Chalk (below)
  sources/                                  whole NCERT books as downloaded (as today)
  props/<package>/comments.yaml             comments on a prop (props are shared by every book)
  books/<book>/
    guide.md, guide/                        only what differs for this book
    <chapter>/                              the same path as in content/
      guide.md                                only if this chapter makes lessons differently
      source/en/                              FACTS, extracted once, never edited by hand: book.pdf, its
                                              text page by page, outline.yaml (every section, figure,
                                              example, exercise: id, page, words); a figure's image
                                              cropped only when a board needs it
      source/hi/, bn/, …                      attached by the same extraction: book.pdf, its text,
                                              outline.yaml (the same ids, this book's words), terms.yaml
      plan.md                                 INTENT, English: the one file the person approves
      boards.md                               DETAIL, English: the agent's design, never gated
      jugnu-cases.yaml, comments.yaml, reviewed.yaml
```

Goes: each chapter's `runs/`, `authoring/retros/`, `authoring/archive/` (old comments from before the
restart), and the review hand-overs (`authoring/reviews/` and their code: `editor/src/reviews.ts`, the
`apply review <id>` flow), replaced by threads. Stays where it is: `authoring/sources/`,
`authoring/sounds/votes.json`.

## The guide: instructions in prose, settings that cascade

**"How" is always `guide.md`; "what" is `plan.md`.** The guide has the same name and rules at every
level: Chalk-wide (`authoring/guide.md`), per book and per chapter (each optional, holding only what
differs: "this chapter's narrator is Aman", "this chapter is silent on purpose"). The nearest level wins.

Each `guide.md` holds:
- **Settings**, a ```yaml block under its "## Settings" heading (any markdown preview shows it): exact
  values code reads. Today only `voices` (each speaker's voice per language; `authoring/voices.json` becomes
  the top guide's), checked against the voice code's schema (every speaker has every language). The first
  yaml fence under "## Settings" is the settings; no heading, no settings. **Merged key by key, nearest
  level wins; maps merge deeply** (a chapter setting only `voices.narrator.hi` changes only that), lists are
  replaced whole. The build reads the merged values: each chapter's merged settings, serialised, are part of
  its cache key, and `guide.md` files are not, so editing the prose rebuilds nothing; the dev watcher watches
  the guides too. (Languages stay a code enum; the Hindi address is prose in `guide/hi.md`.)
- **Instructions**, the prose: the principles; how the person judges (cut over add; "why is this here?";
  how a prop should feel: direct, honest; parallel cases alike; questions in the lesson's own tools); two or
  three lessons to copy; how to work with him. For details it links into `guide/` beside it: `examples.md`
  (situations per principle, from several subjects), `hi.md` (how we write Hindi: tone and register; how
  numbers and letters are said is code), and whatever else it needs, added only when needed. A lower guide
  adds, and where it changes something says so ("unlike the book, …"); the reviewer checks it keeps the
  principles.

**The principles** (drafted in `authoring/guide.md`, from the audit of chapter 1): explain before you use;
make them need it first; cut what isn't needed; let them do it, and let the prop tell the truth; test what
the lesson taught, the way it taught it (each wrong answer's note names the mistake); keep the world
consistent. Examples, plain situations from several subjects, in `guide/examples.md`.

**`pnpm guide <path>`** prints, for a book or chapter, the merged settings (each value with the level it
came from) and the instructions in order (top, book, chapter). Every skill's first step reads it.

## Chapter files

**`plan.md`**, one to two pages (its approval stamp stays `approved: <commit>` at its top, as planning files
have today): the **goal** (what a student can do after the chapter); the
**objectives**, each citing outline ids; the **story's arc** and the characters it uses; the **lessons**
(by their slugs), each with its goal, objectives, what the student does and its card's art; the chapter's
**tile** art; the **props** (reuse / extend / new, each sketched, with why); the **question families** and
what each tests. (How it is made differently, if at all, is the chapter's `guide.md`.)

**`boards.md`**: per lesson, per board and per question family (`questions/<family>`): its purpose, its
beat in the story, needs, the objectives and outline ids it serves, the props it uses. **Status is worked
out, never written**: built (in the build), reviewed (passed), waiting (on a new prop whose showing thread
the person hasn't closed).

**Checked by machine** (most exist in `pipeline.ts`, moved to read these files): every outline item is
covered by an objective, or skipped with a reason; the outline is counted against the book's text; every
objective is served by a board; every board cites a lesson and an objective that exist; `build.yaml`'s
concepts are the plan's lessons, in order (all of them by "chapter ready"), each with its `art.tsx`; and a
folder in `content/` that its `build.yaml` doesn't list fails (today it is silently left out).

## Three stages

```
1. PLAN     agent: pnpm new chapter → the outline from the text → how best to teach it → plan.md, boards.md
            → the person comments, then says yes (a button in the editor stamps plan.md)
2. BUILD    agent: new props first, each shown working alone in a thread (boards not using it go ahead;
            boards using it wait until the person closes that thread); then lessons, question families and
            their rows, Jugnu's cases (from each family's named wrong answers), art; every board
            self-checked; an independent reviewer plays every board; its must-fix findings fixed
            → the person: "chapter ready"
3. REVIEW   the person plays, comments, answers the reviewer's questions → the agent fixes → whoever opened
            a thread closes it → the person's yes on the chapter = done
```

- The person may comment on the plan, any board, any piece or any prop, at any stage.
- **When an agent is stuck or at a real decision, it asks the person with a tool, `ask`**, never in prose:
  `ask({ question, options: [{ label, why }], at })`, two to four options in order of recommendation (the
  first is the agent's pick), pinned where it applies (`at`: a board, a piece, a quote in the plan, or the
  whole plan). Either agent may ask. It is a thread with an `options` field, always on the person's turn;
  the editor's comment panel shows the options as buttons and a box to type his own answer; his answer (the
  label he picked, or his words) is the thread's reply and moves the work on. Everything said to him is
  concise.
- A change after the plan's yes starts as a comment; the agent updates `plan.md` and follows its ids into
  `boards.md`; the person closes the comment and re-stamps the plan with one click (the tree shows what
  changed since; the stamp is committed alone, as today). Nothing below the plan is approved, so nothing
  cascades. Sources never move.
- The story is the flow of the boards: its arc in `plan.md`, each board's beat in `boards.md`; continuity
  is checked there by the reviewer.
- A new book's first chapter carries a "book" section in its plan; on the yes it becomes the book's
  `guide.md`.
- **When the person corrects something that could recur:** a check if a machine can catch it; otherwise one
  line in a `guide.md` (the chapter's, the book's or the top's); the person says yes or no.

## Commands

Two commands do work (`new chapter`, `attach`); `pnpm guide` only reads. The editor's own "add source"
button goes (the command replaces it). What has a fixed shape and real work is done by a command (one path everywhere, e.g.
`class9-maths/coordinate-geometry`); the rest an agent writes, copying a sibling (a new lesson or family is
two or three files). Skeletons for `plan.md` and `boards.md` live in the plan skill.

| Command | Does |
|---|---|
| `pnpm new chapter <book>/<chapter> --source <NCERT name or path>` | the chapter's `authoring/` folder; `source/en/` with the chapter's PDF (named, e.g. class 9 maths chapter 3, it is taken from the whole book in `authoring/sources/` or fetched from NCERT by its file name, `iemh103.pdf`; a path for anything else) and its text page by page (`pdftotext`; it checks the tool is installed and says how if not); `plan.md` and `boards.md` from their skeletons. Its `content/` folder and its listing in the book come with its first lesson (an empty chapter never ships) |
| `pnpm attach <book>/<chapter> <language> [--source …]` | `source/<language>/` with that language's PDF (fetched for an NCERT chapter), its text (OCR where the PDF's text is broken, after the Hindi spike), and the outline aligned to English (the same ids, words empty for the agent to fill from the book) |
| `pnpm guide <path>` | the merged settings and instructions for a book or chapter, each from its level |

## A language, attached

Everything is made and reviewed in English; a language is added the same way each time:

1. `pnpm attach`: its book and text into `source/<language>/`, the outline aligned by id;
2. the agent fills the aligned outline from that book's own words, and `terms.yaml`: each key term as that
   book writes it, with its page;
3. each English line translated with what grounds it: its board and lesson, the passages of this book that
   board cites, the terms, `guide/<language>.md`;
4. machine checks: every English item has its aligned item, or a reason; a mapped term in a line has its
   mapped term in the translation (exact terms first; word forms when misses show they're needed);
5. the person reads it (or a teacher of the language, when there is one).

## Threads: the tracker we already have

Threads (`comments.yaml`, written only by `platform/studio/src/comments.ts`) already pin a comment to its
spot with what it looked like, the commit, whose turn it is, and what a fix changed and reached. Changes:
- **Weight**, a const-object enum, required on a reviewer's finding: must (the builder fixes it) or consider
  (the builder decides, and says what it did in its reply).
- **Whoever opened a thread closes it:** a ready thread goes back to its opener's role (person, reviewer or
  fixer; today a turn is only person or agent); the fixer and the reviewer each close their own threads; the
  person can still close any.
- **`ask`**: an `options` field, and the person's turn (above).
- The review hand-overs go (`authoring/reviews/`, the "apply review <id>" flow and its code in
  `editor/src/reviews.ts`, keeping that file's loader of all threads, which the editor's comments use); the
  person's open comments are the hand-over of a sitting.

## What stays, what goes

| Today | After |
|---|---|
| brief, objectives, flow, props.md, each approved | `plan.md` (approved) + `boards.md` |
| `source/` | `source/en/`, its checks extended to the plan and boards |
| threads; reviews, run notes, retros | threads (weight, opener closes) |
| `reviewed.yaml` | stays; later gains what students get (hashing each speaker's merged voice) |
| `show`, preview, prop panel, comments on boards and on a file's words, `changes`, `affected` | stay |
| `pipeline` and the tree | the chapter's state: plan approved? boards left? open threads, whose turn? done? |
| 6 skills | 4: plan, build, apply-comments, the reviewer |
| constitution, exemplars, `voices.json` | the top `guide.md` (prose and settings) |
| guides, `reviewer.md` | into their skills (the reviewer's into its skill and agent file) |
| `checks.md` | the checks it lists are built (step 9); the file goes |

## Order

Each step built and proved on its own, and committed. **Each step also fixes every instruction and doc it
makes wrong** (AGENTS.md, the skills, platform/docs), so agents are never pointed at something gone.

1. **The guide's instructions:** the top `guide.md`, `guide/examples.md`, `guide/hi.md` (drafted with the
   person); the old constitution and exemplars removed; AGENTS.md and the skills pointed at the guide.
2. **The guide's settings:** `voices` from `voices.json` into the top guide, the merge, `pnpm guide`; the
   voice code and the build read the merged settings (the cache key and the watcher as above). Proved: every
   clip and board the same.
3. **Threads:** weight, opener closes, the `ask` tool and its buttons, the review hand-overs removed.
4. **`plan.md` and `boards.md`**, their checks, and the editor's tree and Approve for them (`pipeline.ts`'s
   files, `source/` moved to `source/en/` with its three readers); chapter 1's four planning files rewritten
   into them (the person is told first, and approves `plan.md` once).
5. **Commands:** `pnpm new chapter`, `pnpm attach`, the unlisted-folder check; proved on a throwaway chapter.
   What they write and print names every file and folder by its full path from the repo's root, linked
   in markdown.
6. **Skills:** four, reading `pnpm guide`; the clean-up of `authoring/` (runs, retros, archive).
7. **Hindi grounded** for chapter 1 (the PDF spike first), and the term check on today's lines.
8. **Checks:** the mechanical ones the audit found (one name per thing; a prompt that gives away its
   answer; right answers spread across options; a label or control text not introduced earlier).
9. **Chapter 1 re-reviewed;** then the next chapter made this way.

After, when needed: the languages mechanism (`languages.md`: English written, each language a table)
before a third language; approval by what students get (`kept-by-what-students-get.md`) once boards are
being kept across changes.
