# Authoring: how a chapter is made

Status: plan, agreed with the person step by step and reviewed three times. Nothing built. Replaces
`platform/docs/authoring-pipeline.md` once built.

## Why

- **Others:** people own *what* is taught and AI makes the volume (Duolingo, Khan Academy; Khan's "a person
  shapes the first question of a kind, the AI makes more" is our question families); the interactive is
  the expensive part and is designed first (Brilliant); a plan a person approves, then work tracked on disk
  (Spec Kit, Kiro, Claude Code); feedback pinned to the exact spot (Frame.io); a house style with a short
  style sheet per book (publishing); a glossary checked by machine and a style guide per language
  (translation).
- **Chapter 1:** source → objectives → flow → props was a sound chain (ids cited down it, checked by
  machine); the ceremony hurt (four gates, a change upstream un-approving everything below, 117 lines of
  flow to read, 132 reviewer threads closed by the person unread). A prop built and thrown away (the stall)
  was the costliest mistake. Pinned comments and the independent reviewer were the best parts. Hindi came
  from memory. An audit of its 167 threads: the constitution's principles mostly said "add", the person's
  corrections mostly said "cut"; over half the threads were mechanical, which only checks can stop.
- **First principles:** scarce: the person's attention and taste, props, being right against the book.
  Cheap: an agent's writing and re-checking. Ours alone: boards play the same every time, so a machine
  checks what works before anyone looks.

## Two trees, the same paths

`content/` is what ships (code the app runs, built and voiced); `authoring/` is how it is made (books,
sources, plans, taste, comments), never shipped and never read by the build. They mirror each other: a
chapter is `class9-maths/coordinate-geometry` in both, so its two halves are always found together (the
editor's tree joins them by path). Rules: the same path in both; `content/` never reads `authoring/` (the
boundaries check enforces it); `authoring/` holds no code.

```
content/                                  WHAT SHIPS
  <book>/          build.yaml, art.tsx (its cover)
    <chapter>/     build.yaml, art.tsx (its tile), sound/
      <lesson>/    build.yaml, art.tsx (its card), overview.ts
      questions/<family>/  family.ts, params.yaml

authoring/                                HOW IT IS MADE
  taste.md, taste/                          Chalk-wide taste (below); taste/hi.md, taste/sounds.json, …
  books-pdf/                                whole NCERT books as downloaded (today's authoring/sources/)
  props/<package>/comments.yaml             comments on a prop (props are shared by every book)
  books/<book>/
    taste.md, taste/                        only what differs for this book (taste/ only if needed)
    <chapter>/                              the same path as in content/
      taste.md                                only if the chapter differs
      source/en/                              FACTS, extracted once, never edited by hand: book.pdf,
                                              outline.yaml (every section, figure, example, exercise: id,
                                              page, words), page images (a figure cropped only when needed)
      source/hi/, bn/, …                      attached by the same extraction: book.pdf, outline.yaml
                                              (the same ids, this book's words), terms.yaml (each key term
                                              with its word forms and page)
      plan.md                                 INTENT, English: the one file the person approves
      boards.md                               DETAIL, English: the agent's design, never gated
      jugnu-cases.yaml, comments.yaml, reviewed.yaml
      <lesson>/taste.md                       rare: a lesson that differs
```

Clean-up: `authoring/reviews/`, `authoring/retros/` and each chapter's `runs/` go (threads replace them);
`authoring/archive/` goes (old comments from before the restart); `authoring/sounds/votes.json` (the
person's verdicts on sounds, by ear) is taste: `authoring/taste/sounds.json`; `authoring/sources/` becomes
`authoring/books-pdf/`, so "source" means only a chapter's extracted facts.

## Taste: settings that cascade, prose read in order

Each level's `taste.md` holds two kinds of thing, each inherited the way that fits it (as Hugo's front
matter `cascade`, `.editorconfig`, `tsconfig`'s `extends` and `CLAUDE.md` do):

- **Settings**, in its front matter: exact values (languages, Hindi address, each character's voice per
  language, the look). **Merged key by key; the nearest level wins**; a lower file sets only what it
  changes. The voice code and the language list read the merged result (`authoring/voices.json` becomes
  the top file's `voices:`).
- **Guidance**, its markdown: principles, taste, a few before/after examples from the person's threads,
  two or three lessons to copy; for details it links into its `taste/` folder (`taste/hi.md`: how we
  write Hindi, tone and register; how numbers and letters are said is code, the language's number words).
  **Read top to bottom; a lower level adds, and on a real conflict the nearer wins and says so** ("unlike
  the book, …").
- **Principles marked `always`** at the top can't be changed below: the loader refuses a lower file that
  tries.

```yaml
# authoring/taste.md                          # authoring/books/class9-maths/taste.md
---                                           ---
languages: [en, hi]                           voices:
hindi_address: तुम                               narrator: { hi: piper:hi_IN-other }
voices:                                       ---
  narrator: { en: piper:en_US-lessac-high, hi: piper:hi_IN-rohan-medium }
  riya:     { en: piper:en_US-amy-medium,  hi: piper:hi_IN-priyamvada-medium }
---
```

**One loader** (`platform/studio`, about a page): given a book, chapter or lesson, it walks down from the
top and returns the effective settings (each value labelled with the level it came from) and the guidance
(each level's prose, in order, labelled). **`pnpm taste <path>`** prints both; every skill's first step is
to read it for where it works, so no agent hunts for files or misses a level.

**The principles** (top of `taste.md`, kept by every level below): nothing unexplained; each step is
needed before it is given, and nothing gives it away; every piece earns its place (when in doubt, cut);
show it, and let them do it with an honest prop; questions test what the boards taught, in their tools.
Lower levels add taste and may change it, saying why; they don't change these.

**`plan.md`**, one to two pages: the **goal** (what a student can do after the chapter); the
**objectives**, each citing outline ids; the **story's arc** and the characters it uses; the **lessons**
(by their `build.yaml` slugs), each with its goal, objectives, what the student does and its card's art;
the chapter's **tile** art; the **props** (reuse / extend / new, each sketched, with why); the **question
families** and what each tests; where it departs from the book's `taste.md`, and why.

**`boards.md`**: per lesson, per board and per question family (`questions/<family>`): its purpose, its
beat in the story, needs, the objectives and outline ids it serves, the props it uses. **Status is worked
out, never written**: built (in the build), reviewed (passed), waiting (on a prop the person hasn't seen).

**Checked by machine** (most exist in `pipeline.ts`, moved to read these files): every outline item is
covered by an objective, or skipped with a reason; every objective is served by a board; every board cites
a lesson and an objective that exist; `build.yaml`'s concepts are the plan's lessons, in order (all of
them by "chapter ready"), each with its `art.tsx`.

## Three stages

```
1. PLAN     agent: extract the source → think how best to teach it → plan.md and boards.md
            → the person comments, then says yes (a button in the editor stamps plan.md)
2. BUILD    agent: new props first, each shown working alone (boards not using it go ahead; boards using
            it wait for the person); then lessons, question families and their rows, Jugnu's cases (from
            each family's named wrong answers), art; every board self-checked; an independent reviewer
            plays every board; its must-fix findings fixed → the person: "chapter ready"
3. REVIEW   the person plays, comments, answers the reviewer's questions → the agent fixes → whoever opened
            a thread closes it → the person's yes on the chapter = done
```

- The person may comment on the plan, any board, any piece or any prop, at any stage.
- A change after the plan's yes starts as a comment; the agent updates `plan.md` and follows its ids into
  `boards.md`; the person closes the comment and re-stamps the plan with one click (the tree shows what
  changed since). Nothing below the plan is approved, so nothing cascades. Sources never move.
- The story is the flow of the boards: its arc in `plan.md`, each board's beat in `boards.md`; continuity
  is checked there by the reviewer.
- A new book's first chapter carries a "book" section in its plan; on the yes it becomes the book's
  `taste.md`, and its cover is drawn in `content/<book>/art.tsx`.
- **When the person corrects something that could recur:** a check if a machine can catch it; otherwise
  one line in `taste.md` at the right level; the person says yes or no.

## A language, attached

Everything is made and reviewed in English; a language is added the same way each time:

1. its book into `source/<language>/` (given, or fetched; Hindi NCERT PDFs often extract as broken text:
   a spike first, OCR if needed);
2. the same extraction as English: its outline aligned item by item (same ids, its own words), its terms
   with their word forms and pages;
3. each English line translated with what grounds it: its board and lesson, the passages of this book that
   board cites, the terms, the language's guidance (`taste/hi.md`);
4. machine checks: a mapped term in a line has its mapped term in the translation; a line marked as quoting
   an outline id matches that id's words; every English item has its aligned item, or a reason;
5. reviewed by someone who reads the language.

## Threads: the tracker we already have

Threads (`comments.yaml`, written only by `platform/studio/src/comments.ts`) already pin a comment to its
spot with what it looked like, the commit, whose turn it is, and what a fix changed and reached. Two edits:
a reviewer's finding carries a **weight**, must or consider (a question for the person is already a thread
on his turn); and **whoever opened a thread closes it** (the reviewer gains a close move; AGENTS.md's "only
the person closes" changes). The person's open comments are the hand-over of a sitting.

## What stays, what goes

| Today | After |
|---|---|
| brief, objectives, flow, props.md, each approved | `plan.md` (approved) + `boards.md` |
| `source/` | `source/en/`, its checks extended to the plan and boards |
| threads, reviews, run notes, retros | threads (weight, opener closes) |
| `reviewed.yaml` | stays; gains what students get (hashing each speaker's effective voice) |
| `show`, preview, prop panel, comments on boards and on a file's words, `changes`, `affected` | stay |
| `pipeline` and the tree | the chapter's state: plan approved? boards left? open threads, whose turn? done? |
| 6 skills | 4: plan, build, apply-comments, the reviewer |
| constitution, exemplars | the top `taste.md` (its details in `taste/`) |
| guides, `reviewer.md` | into their skills (the reviewer's into its skill and agent file) |
| `checks.md` | the checks it lists are built, step by step (below); the file goes |
| `voices.json` | the top `taste.md`'s `voices:` setting, read through the loader |

## Order

Each step built and proved on its own, and committed.

1. **Taste:** the loader and `pnpm taste`; the top `taste.md` (from the audit, with `voices.json` as its
   `voices:`), `taste/hi.md`, `taste/sounds.json`; the clean-up of `authoring/`; the person reads the taste.
2. **Threads:** weight, opener closes.
3. **`plan.md` and `boards.md`** and their checks; chapter 1's four planning files rewritten into them (the
   person is told first, and approves `plan.md` once).
4. **The editor and pipeline:** the tree's three entries, Approve on `plan.md` only.
5. **Skills and AGENTS.md:** four skills, reading `taste.md`; AGENTS.md's steps, runs and closing rule.
6. **Hindi grounded** for chapter 1 (spike first), and the term check on today's lines.
7. **The languages mechanism** (`languages.md`).
8. **Checks:** the mechanical ones the audit found (one name per thing; a prompt that gives away its
   answer; right answers spread across options; a label or control text not introduced earlier), each as a
   blocking check.
9. **Approval by what students get** (`kept-by-what-students-get.md`).
10. **Chapter 1 re-reviewed;** then the next chapter made this way.
