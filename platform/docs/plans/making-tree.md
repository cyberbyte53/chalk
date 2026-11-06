# The Chalk tree: content and its making, and comments on every guide file

Status: plan, agreed with the person (6 Nov 2026); to be reviewed, then built.

## Why

The Chalk tree is where the person works: he plays lessons, approves plans and comments. What makes the
content (the guides, a chapter's plan and boards) should be reachable from the same tree, at the level it
applies, and he should be able to comment on any of it, the same way as on a plan.

## The tree

Every level (all books, a book, a chapter) shows its **Making** group first, then its content:

```
Threads
Content
  Making                        ← the top level: authoring/
    Guide                       ← authoring/guide.md
    guide/                      ← authoring/guide/: each file a row (examples.md, hi.md, …)
  Maths IX
    Making                      ← authoring/books/class9-maths/
      Guide                     ← its guide.md, or "none: the top guide applies" (click: write one)
      guide/                    ← only when the folder exists
    1. Coordinate Geometry
      Making                    ← authoring/books/class9-maths/coordinate-geometry/
        Guide                   ← or "none: the book's and the top guide apply"
        guide/
        Plan    to approve      ← plan.md, its state and Approve as today
        Boards                  ← boards.md
      Saying where …            ← lessons, as today
      Questions
Props
```

- The "Planning" folder goes; Plan and Boards move into the chapter's Making.
- The outline and the sources are never shown (the machine's; a failing outline blocks Plan with "the
  agent fixes source/en/outline.yaml first", already built).
- A missing guide is a row that says which guide applies; clicking it writes a skeleton that links the
  guide above by its full path and says "say only what is different here".
- A lesson waiting on a self-review shows a clock, not a warning (it isn't broken).

## Comments on every guide file

Today a comment on a file is accepted only under `authoring/books/<book>/<chapter>/` (the editor's
`planningFileOf`, the comment tool's `placeOf`, the writer's `homeOf`). Widened to every markdown file the
Making group shows: `authoring/guide.md`, `authoring/guide/**`, and the same at a book's and a chapter's
level. Each thread is filed where its file lives:

| File | Its threads go in |
|---|---|
| `authoring/guide.md`, `authoring/guide/**` | `authoring/comments.yaml` (a new home, "authoring") |
| `authoring/books/<book>/guide.md`, `…/<book>/guide/**` | the book's: `authoring/books/<book>/comments.yaml` |
| `authoring/books/<book>/<chapter>/…` | the chapter's, as today |

A thread on a file still quotes the words it is about (or is on the whole file); threads, turns and
closing are unchanged. The thread check (`every open thread points at something`) reads the new home.
Agents see these threads with `comments` like any other (an `at` of `authoring/guide.md` or `authoring`).

## Details (from the review)

- **"guide" is a reserved name**: never a book or a chapter. Every lister of books and chapters skips it
  (`comments.ts` `homes()`, the tree's `dirsIn` of a book, the pipeline's chapter list, `pnpm new
  chapter` refuses it).
- **The home of a file thread** is decided from its path, not by `existsSync` (which is true for a file):
  `authoring/guide.md`, `authoring/guide/**` → "authoring"; `authoring/books/<b>/guide.md`,
  `authoring/books/<b>/guide/**` → the book; `authoring/books/<b>/<c>/**` → the chapter. The book-level
  fallback reads `source` too (`comments.ts` ~212-215).
- **The editor's select-and-comment** is decided by `file-comments.ts`'s `PLANNING` pattern (~14, 110,
  119): widened to the guide files. `planningFileOf` stays narrow (it feeds Approve only).
- **Also widened:** opening a guide thread opens its file (`extension.ts` ~808); the watcher watches
  `authoring/comments.yaml` (~960); a book's and a chapter's thread counts include their guide threads
  (~362-372); thread labels (`threads.ts` ~78, `threads-page.tsx` ~56) show the full path; the tool
  descriptions name guide files (`tools.ts` ~1099, 1225, 1413). Agents ask for the top's threads with `at:
  "authoring/guide.md"` or `"authoring/guide"`.
- **The tree lists `guide/`'s files** at every level from the folder (nothing hard-coded). The skeleton of
  a missing guide links the guide directly above (a chapter's: its book's if there is one, else the top)
  by its full path, and its heading uses the level's title.

## Order

1. The writer and the tool: the new home and the book's guide files accepted (`homeOf`, `homes`,
   `fileOf`, `placeOf`), with tests: a thread on each kind of file is filed in its home and read back.
2. The editor: `file-comments.ts`'s `PLANNING` widened (select-and-comment on every guide file;
   `planningFileOf` stays narrow); the tree.
3. Docs: `platform/docs/comments.md` (where threads live), the editor README.

Proved: `pnpm check`; the editor builds and its tests pass; the tree seen in the editor (a screenshot:
the Making groups at three levels, a comment made on `authoring/guide.md` and on
`authoring/guide/examples.md`, each filed in `authoring/comments.yaml`).
