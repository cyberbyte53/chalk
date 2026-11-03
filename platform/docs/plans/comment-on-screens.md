# Comments on the book and chapter screens, and coordinate geometry's art

Status: built (2026-11-03).

## The rule, in three sentences

Anything a child sees can be commented on where it is drawn, by its address: a board's pieces
today, and now the screens above boards too. The book and chapter screens tag what they draw
**with the tags boards already use** (`data-board` for whose it is, `data-piece` for the thing,
`data-source` for its line), so the preview's picker, comment box and threads work on them as they
are. A thread at a book, chapter or lesson is filed, checked, shown and answered like one at a
board.

## What the screens draw (as they are)

- **The book screen** (`CourseScreen`): the book's title and art; each chapter's tile (its art,
  number, name).
- **The chapter screen** (`ChapterScreen`): the chapter's title; each lesson's circle (its glyph)
  and name; the **current** lesson's card (its art and name). Only the current lesson shows its
  card, so in the preview **tapping a lesson's circle makes it the current one** (as finishing the
  lesson before would): every lesson's card, and its art, can be seen and commented on.

## Tags and addresses

Each tile or lesson stop carries `data-board=<its node>` (`content/class9-maths/coordinate-geometry`
for a chapter's tile; `…/two-numbers-for-a-place` for a lesson), and its parts carry `data-piece`
by the built field they show: `title`, `glyph`, `art`; the tile or the stop itself is the whole
(↑ in the picker widens to it, as for a piece). So the picture on "Saying where"'s card is
`content/class9-maths/coordinate-geometry/two-numbers-for-a-place#art`. No new tag, no new names:
`picksAt` and `anchorOf` look for the nearest `[data-board]` instead of the page's one.

Each part's line is written on it (`data-source`): `title` and `glyph` their `build.yaml` line,
`art` its `art.tsx`. The build gives them (`sources.json` gains each node's parts).

## What changes

1. **The screens** (`course-screens.tsx`): the tags above; the preview's tap on a circle sets the
   current lesson.
2. **The build**: each node's parts' lines in `sources.json`.
3. **The preview** (`preview-shell.tsx`): the tree screen draws the comment box (`PickComposer`) and
   the threads at its nodes, as under a board (today it returns before both); the picker and the
   threads' anchors scope to the nearest `[data-board]`.
4. **Filing** (`comments.ts`): a book's threads have a home (`authoring/books/<book>/comments.yaml`):
   `homeOf` accepts a book alone, and `homes()` lists books so they are read.
5. **Where threads are read**: the editor's Chalk tree shows a chapter's own threads and a book's
   (today `chapterThreads` keeps only paths under the chapter); the review page opens a thread at a
   node on that node's screen, not as a board; `pnpm check`'s threads step and reach know nodes (the
   build's index), so a thread at a lesson that exists passes, one at a lesson gone is reported, and
   a thread at a node's `art` reaches its `art.tsx`.
6. **Review sees them**: `show` on a book or chapter keeps what it answers now (a check of every
   board) and adds a picture of its screen, each lesson's card in turn; self-review of a chapter
   looks at it. `pnpm art`'s page (`build/art.html`, making-art.md) stays the place to see every
   picture at once.

## Then the art

Five `art.tsx`, each in its folder (making-art.md: one idea, the lessons' own pieces, calm):

| Where | Frame | The idea |
|---|---|---|
| coordinate-geometry | Tile | two numbers meeting at one dot: a place said by a pair |
| two-numbers-for-a-place ("Saying where") | Card | one number is a line; along, then up, reaches a house |
| the-cartesian-plane | Card | the axes crossing at O, the four quadrants |
| coordinates-of-a-point | Card | a point and its two distances to the axes |
| plotting-points | Card | a few dots plotted, each from its pair |

## Checking

- In the preview inside Cursor: on the chapter screen, pick the title, a circle, a card's art;
  tap another circle and pick its card; on the book screen, the chapter's tile. Each opens the box
  naming it; the thread is filed, shown there, listed in the Chalk tree, and answered through
  `comments` like any other.
- `pnpm check`: a thread at a lesson passes; at a lesson renamed away, it is reported.
- The art builds and passes the art checks; `show` on the chapter and the book draws it.
