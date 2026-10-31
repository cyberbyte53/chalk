# What a change reaches

Before changing shared code, an agent asks what the change can make look or behave differently; after, the same question is asked of what git says changed. The answer is a list of pieces, down to `content/<book>/<chapter>/<lesson>/<board>#piece`, rolled up to whatever depth is wanted. Nothing in it is written by hand: it comes from two things that are always up to date.

- **What the build recorded** (`build/reach.json`, written by every content build, never published): for each board, the module that made it, and for each piece every line of the author's code it was made through, innermost first (`library/patterns/words.ts:19`, then `content/…/overview.ts:200`). These are the call stack when `place(…)` ran (`platform/packages/author/src/site.ts`), which the build already took for the "open in editor" line; it now keeps all of it. A question also keeps its row in `params.yaml`.
- **Who uses what in the code** (`platform/studio/src/reach/graph.ts`): every top-level declaration in `content/`, `library/` and `platform/packages/`, and what each uses, followed through imports and re-exports (an index that re-exports everything joins nothing together). Read from the syntax, kept between runs, and read again only for files that changed.

## The rules (`platform/studio/src/reach/index.ts`)

A change reaches a piece when it touches:
- **A line the piece was made through, in its scope**: the whole function if that function places pieces on one line only (a kit's or a pattern's helper), else just the call on that line (a page's builder places many pieces, one per call).
- **Code that scope uses**, directly or not, in any file: a top-level value two pieces' calls use reaches those two.
- **Its prop type's definition or view** (paired in each package's `{ def, View }`), or code they use: `MultiChoiceView` reaches multiple-choice pieces only, though every basic prop's view is in one file.
- **The player's code that draws every board** (`BoardPlayer`, `LessonPlayer`), or the code that builds every board: then it reaches everything, and says why.

A change in a page's builder outside every piece's call, or to a question's row, reaches the whole board. A change only to comments, blank lines or types reaches nothing. A helper that places pieces is followed through the lines it placed them on, not wherever it is called from.

It errs on the side of more: a name shadowed locally still counts as a use, and an import or a side effect at a module's top reaches every board of that module. What it can't see: a function that changes something besides the pieces it places (the board's purpose, say) through a helper.

## Using it

- **`affected`** (chalk MCP): `changes` (files, `file:40-52`, or `file#declaration`), `props` (types), or `diff: true` (git, since HEAD, or a ref); `depth` (book, chapter, lesson, board, piece) and `under` (one branch). The fixer puts its answer in the plan for anything beyond one lesson.
- **On a thread**: when it becomes ready, the writer records what its changed files reach (`reaches`: pieces, boards, the lessons; or every board and why). The review page and the cards under each board show it.

## Cost

The index is built as the content builds; a lookup takes about 0.1 s, and reading the code graph about 0.4 s (2.5 s the first time on a machine, while it reads every file). The build must have run since a lesson changed for its lines to be current; the dev server rebuilds on save.
