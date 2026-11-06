# Authoring: how a chapter is made

Status: plan, reshaped with the person and reviewed twice (changes folded in). Nothing built. Replaces `platform/docs/authoring-pipeline.md` once agreed.

## Why (what we learned)

- **Others:** people own *what* is taught and AI makes the volume (Duolingo, Khan Academy; Khan's "a
  person shapes the first question, the AI makes more" is our question families); the interactive is the
  expensive part and is designed first (Brilliant); a plan a person approves, then tracked work on disk
  (Spec Kit, Kiro, Claude Code, Beads); feedback pinned to the exact spot (Frame.io).
- **Chapter 1:** the breakup into source → objectives → flow → props was sound (each cites the one
  before by ids, and the machine checks the chain); what hurt was the ceremony: four gates, a change
  upstream un-approving everything below, 117 lines of flow to read, 132 reviewer threads closed by the
  person unread. A prop built and thrown away (the stall) was the costliest mistake. Pinned comments and
  the independent reviewer were the best parts. Hindi came from memory.
- **First principles:** scarce: the person's attention and taste, props, being right against the book.
  Cheap: an agent's writing and re-checking. Ours alone: boards play the same every time, so a machine
  checks what works before anyone looks; a reviewer's finding made twice becomes a check.

## Files, by what they hold

Each piece of information lives by how often it changes, who reads it and who decides it.

```
authoring/books/<book>/
  settings.yaml           the book: tone, look, teaching style, pacing, languages; its cover. Over the
                          Chalk-wide settings (authoring/settings.yaml: the constitution, whose principles
                          always hold, and the cast: Riya and Aman cross books, each with their voice per
                          language, from today's authoring/voices.json)

  <chapter>/
    source/               FACTS, extracted once, never edited by hand
      en/                   book.pdf, outline.yaml (every section, figure, example, exercise: id, page,
                            words), figures/ (the book's diagrams, cut out)
      hi/, bn/, …           attached later, by the same extraction: the chapter in that language
                            (book.pdf); outline.yaml with the same ids as English, each item as THIS book
                            writes it; terms.yaml (each key term, with its page; how its letters and
                            notation are read aloud)
    plan.md               INTENT, English: the one file the person reads, comments on and says yes to
    boards.md             DETAIL, English: the agent's working design, never gated
    jugnu-cases.yaml      Jugnu's stuck children, played (the person approves it, as today)
    comments.yaml         threads, as now
    reviewed.yaml         the reviewer's pass per board, as now
```

`runs/` (run notes) is deleted. Lessons, question families (`family.ts`, `params.yaml`), `art.tsx` and
`build.yaml` stay in `content/`: the plan holds only their ideas, so nothing is written twice.

**`plan.md`**, one to two pages: **goal** (one sentence: what a student can do after the chapter);
**objectives**, each citing the outline ids it covers; **story and cast**, in full (it is taste);
**lessons** (by their `build.yaml` slugs), each with its goal, objectives, what the student does, and
its card's art; the **chapter's
tile art**; **props**, reuse / extend / new, each with a sketch and why; **question families** and what each
tests; **deviations** from the book's settings, with why.

**`boards.md`**: per lesson (by its slug in `build.yaml`'s `concepts:`), per board and per question family
(`questions/<family>`): purpose, needs, the objectives and outline ids it serves, and the props it uses.
**Status is worked out, never written:** built (it is in the build), reviewed (`changesUnder` passes it),
waiting (on a prop whose showing thread is open). The agent's to-do list is what isn't done.

**Checked by machine** (most exist in `pipeline.ts` today: ids valid, coverage, objectives served, the
outline counted against the text; they move to reading `plan.md` and `boards.md`): every outline item is
covered by an objective or skipped with a reason (a failure, not a note); every objective is served by a
board; every board cites a lesson and objective that exist; the plan's lessons are `build.yaml`'s concepts,
one for one, each with its `art.tsx`.

## Three stages, each ending with something for the person

```
1. PLAN     agent: extract the source → think how best to teach it → plan.md and boards.md
            → the person: comments on plan.md, then yes (a button in the editor stamps it)
2. BUILD    agent: new props first, each shown working alone (boards not using it go ahead; boards using
            it wait on its thread, closed by the person), then lessons, question families and their rows, Jugnu's cases (from each family's named
            wrong answers), art; every board self-checked (show); an independent reviewer plays every
            board; its must-fix findings fixed → the person: "chapter ready", with the taste questions
3. REVIEW   the person: plays, pins comments, answers taste questions → the agent fixes → whoever opened
            a comment closes it → the person's yes on the chapter = done
```

- **A change after the plan's yes** starts as a comment on the plan: the agent updates `plan.md`, follows
  the ids into `boards.md`, rebuilds what they touch; the person closes the comment and re-stamps the plan
  with one click, the tree showing what changed since his yes. Nothing below the plan is ever approved, so
  nothing cascades. Sources never move.
- **Story in the plan:** its arc, the cast and each lesson's part in it; each board's beat is in `boards.md`.
- **When the person corrects something that could recur**, the agent proposes one settings line then and
  there, at the right layer (book or Chalk); the person says yes or no.
- **A new book's first chapter** carries a "book" section in its plan (cast, look, cover), which becomes
  the book's settings on the yes.

## A language, attached

Everything is made and reviewed in English; another language is added on top, the same way each time
(`languages.md`):

1. its book is added to `source/<language>/` (given, or fetched);
2. **the same extraction** as English: its `outline.yaml` aligned item by item to the English one (same ids,
   its own words), and its `terms.yaml`, every key term with its page; nothing from memory;
3. every English line is translated with what grounds it: the line, its board and lesson, the outline ids
   that board cites and **the matching passages of this book** (its own definition, example, exercise
   wording), and the terms;
4. machine checks: a mapped term in a line has its mapped term in the translation (terms list their word
   forms: axis/axes, अक्ष/अक्षों); a line marked as quoting an outline id (a definition, an exercise) matches
   that id's words in the language; every English outline item has its aligned item, or a reason;
5. reviewed by someone who reads the language.

Chapter 1's Hindi gets this once: its book attached, its terms extracted, every line checked against them.

## Threads: the tracker we already have, three edits

Threads (`comments.yaml`, written only by `platform/studio/src/comments.ts`) already pin a comment to its
spot, keep what it looked like, the commit, whose turn it is, and what a fix changed and reached. They
stay, with: a **weight** on a reviewer's finding (must, consider, taste: a new field); **whoever opened a
thread closes it** (the `MOVES` table, `comments.ts` ~63-77: the reviewer gains a close move; AGENTS.md's
"only the person closes" changes); a taste question is a thread on the person's turn. The
hand-over of a sitting is the person's open comments: `authoring/reviews/`, run notes and retros go.

## Tools: what stays, what goes

| Today | After |
|---|---|
| brief, objectives, flow, props.md, each approved; the tree's gates | `plan.md` (one yes) + `boards.md` |
| `source/outline.yaml` and its check | `source/en/`, its check extended to the plan and boards |
| threads | threads, weighted, opener closes |
| reviews, run notes, retros | the threads |
| `reviewed.yaml` (the reviewer's pass per board) | stays, gaining what students get (`kept-by-what-students-get.md`) |
| `show`, preview, prop panel, pinned comments, comments on a file's words, `changes`, `affected` | stay |
| `pipeline` and the tree | the chapter's state: plan yes? boards left? open threads, whose turn? done? |
| 6 skills | 4: plan (1), build (2), apply-comments (3), and the reviewer's |
| the editor's tree (`pipeline.ts` `FILES`, `READS`; `planning.ts` `isApprovable`) | three entries: the outline (machine), `plan.md` (approved), `boards.md` (not); Approve shown from the server's `isApproved` |
| `authoring/taste/` | the Chalk settings layer; each guide goes with its stage's skill |

## Chapter 1 moves over

`brief.md`, `objectives.md`, `flow.md`, `props.md` become `plan.md` (goal added, lesson goals and art
added) and `boards.md` (from flow's per-board purposes); `source/` becomes `source/en/`; no open threads
to move; its taste seeds the Chalk and book settings. The constitution is checked once against its
threads: which should a principle have prevented?

## Order

1. Thread edits: weight, opener closes, hand-over from open comments.
2. `plan.md` / `boards.md` and their checks, the skills, `pipeline` and the tree; chapter 1 moved (this
   rewrites its four approved files: the person is told first, and re-approves `plan.md` once).
3. Hindi grounded: `source/hi/` for chapter 1 (a spike first: Hindi NCERT PDFs often extract as broken
   text and may need OCR), its aligned outline and terms, the term check over today's `t(en, hi)` lines.
4. The languages mechanism (`languages.md`): English written, each language a table.
5. Book and Chalk settings, seeded from `taste/` and `voices.json`.
6. Approval by what students get (`kept-by-what-students-get.md`).
7. Chapter 1 re-reviewed; then the next chapter made this way.

Figures start as whole-page images with the outline's page (NCERT's figures are mostly vector drawings,
which image extraction misses); a figure is cropped only when a board needs it.
