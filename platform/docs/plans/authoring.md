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

## Files

```
authoring/
  taste.md               where every agent starts: the principles, the person's taste, a few before/after
                         examples from his threads, two or three lessons to copy; for details, it links
                         into taste/
  taste/                 what taste.md links to, added only when needed:
    hi.md                  how we write Hindi: tone and register (तुम, not आप; plain words). How numbers and
                           letters are said is code (the language's number words), not prose
    voices.json            who speaks in which voice, per language (moved from authoring/; the voice code's
                           path updated)

  books/<book>/
    taste.md             only what differs from the top (its tone, look, languages, its cover's idea)
    taste/               only if this book has detail files of its own
    <chapter>/
      source/            FACTS, extracted once, never edited by hand
        en/                book.pdf, outline.yaml (every section, figure, example, exercise: id, page, words),
                           page images (a figure is cropped only when a board needs it)
        hi/, bn/, …        attached by the same extraction: book.pdf, outline.yaml (the same ids, this book's
                           own words), terms.yaml (each key term with its word forms and page)
      plan.md            INTENT, English: the one file the person approves
      boards.md          DETAIL, English: the agent's design, never gated
      jugnu-cases.yaml   Jugnu's stuck children, played (the person approves it, as today)
      comments.yaml      threads
      reviewed.yaml      the reviewer's pass per board
```

Lessons, families (`family.ts`, `params.yaml`), `art.tsx` and `build.yaml` stay in `content/`; the plan
holds only their ideas. `runs/`, `authoring/reviews/` and `authoring/retros/` go.

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
   board cites, the terms, `taste/hi.md`;
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
| `reviewed.yaml` | stays; gains what students get (hashing only each speaker's voice) |
| `show`, preview, prop panel, comments on boards and on a file's words, `changes`, `affected` | stay |
| `pipeline` and the tree | the chapter's state: plan approved? boards left? open threads, whose turn? done? |
| 6 skills | 4: plan, build, apply-comments, the reviewer |
| constitution, exemplars | `taste.md` (its details in `taste/`) |
| guides, `reviewer.md` | into their skills (the reviewer's into its skill and agent file) |
| `checks.md` | the checks it lists are built, step by step (below); the file goes |
| `voices.json` | `taste/voices.json`, unchanged inside |

## Order

Each step built and proved on its own, and committed.

1. **Taste:** `taste.md` from the audit, `taste/hi.md`, `voices.json` moved into `taste/`; the person reads them.
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
