# Chalk for Cursor / VS Code

Content seen as boards, beside its code. Nothing here draws a board: the panel frames the learner
app's own `?dev&at=` page, so what you see is what the phone draws.

- **Preview** (the preview icon in an editor's title bar, right-click a folder in `content/`, or ⌥⌘P):
  - a book shows its book screen;
  - a chapter shows its path of lessons;
  - a lesson shows its boards and questions;
  - a question family shows its questions;
  - a comment shows the board it's on;
  - a file in `authoring/reviews/` shows that review's page: its threads, each foldable, with the conversation and the board as it is now; the `reviews` folder lists every review.

  Tapping a chapter or lesson goes one level down and opens its file.
- **Follows you:** switch files and the preview switches; move the cursor in `overview.ts` and the piece written there is outlined. Alt-click a piece and the editor jumps to its line.
- **Pick** a piece (`c`, or the Pick button; ↑ ↓ for wider or finer): a box opens next to it. Write what should change and press ⌘↵: it's a thread on that board (or on the prop, wherever it's used). Esc cancels.
- **Text boxes** in the preview (the comment box, replies) take ⌘C, ⌘X, ⌘V, ⌘A and ⌘Z / ⌘⇧Z, and ⌘↵ sends. The editor keeps those keys from the panel, so the preview handles them itself, with the clipboard through the extension.
- **Play** plays it exactly as the app does, in a phone's frame: the chapter's path, one board at a time with Continue, practice, results, from the board or lesson you're on. **हि** shows it in Hindi.
- **The Chalk tree** (in the explorer), one tree for everything: **Reviews** at the top, then book → chapter → its **Planning** files and its lessons, with each chapter's open threads counted.
  - Each planning file (`brief.md`, `outline.yaml`, `objectives.md`, `flow.md`, `props.md`) shows its state: not written, checks fail, to approve, approved, changed since approved, to check again; its tooltip says why. Click it to open it.
  - **Approve** (✓ on the file, or "Chalk: Approve this planning file" in the open file's title bar or right-click): in order, once it is committed; the dev server writes `approved: <commit>`. **Take back** undoes it.
  - **Add a chapter's source** (the tree's title bar): copies a PDF or text into `authoring/books/<book>/<chapter>/source/`. Then ask your agent to run `plan-chapter`.
- **Problems on planning files:** a failing check (an objective citing what the outline hasn't, a board serving no objective, a need without a verdict) is a problem on the line it is about.
- **Comments in the planning files:** every thread on a planning file shows on the words it is about, in the file (VS Code's comments): read it, reply, or close it (✓) there. A thread waiting on you opens unfolded. To start one, select the words and press ⌥⌘/ (Ctrl+Alt+/), or click the + in the margin.
- **Reviews**, at the top of the Chalk tree: every review in one place. At the top, your threads not handed over yet (Copy for agent hands them over); then each review, newest first, with where it stands ("1 open, 3 ready") and its threads, each with its status, the latest plan or answer, and the whole thread in its tooltip.
  - Click a review: its page in the preview. Click a thread: the review's page, opened at that thread.
  - On a thread: Reply (sends a planned or ready one back to the agent), Close, Withdraw, Open board, Open source line.
  - On a review: Copy for agent (`apply review <id>`), Close all ready, Show its activity.
  - It follows the files: an agent's plans and answers show up as they're written.

It uses the dev server on :5173 if one is running. Otherwise it starts the learner app's server and the content rebuild-on-save itself (output in the "Chalk" channel). It also starts the chalk MCP service agents connect to (127.0.0.1:5174/mcp) if it isn't running.

Install: `pnpm editor:install` (bumps the version, packages `chalk-editor.vsix`, installs it into Cursor). What it installs is a loader (`src/loader.ts`): it runs the extension from the open repo's build, and when that is rebuilt (`pnpm editor:build`) swaps the new code in, so a change to the editor never needs a window reload. Only a change to `package.json`'s contributions (commands, menus, views) needs `pnpm editor:install` and one reload.
