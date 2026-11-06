# Chalk for Cursor / VS Code

Content seen as boards, beside its code. Nothing here draws a board: the panel frames the learner
app's own `?dev&at=` page, so what you see is what the phone draws.

- **Preview** (the preview icon in an editor's title bar, right-click a folder in `content/`, or ⌥⌘P):
  - a book shows its book screen;
  - a chapter shows its path of lessons;
  - a lesson shows its boards and questions;
  - a question family shows its questions;
  - a comment shows the board it's on.

  Tapping a chapter or lesson goes one level down and opens its file.
- **Follows you:** switch files and the preview switches; move the cursor in `overview.ts` and the piece written there is outlined. Alt-click a piece and the editor jumps to its line.
- **Pick** a piece (`c`, or the Pick button; ↑ ↓ for wider or finer): a box opens next to it. Write what should change and press ⌘↵: it's a thread on that board (or on the prop, wherever it's used). Esc cancels.
- **Text boxes** in the preview (the comment box, replies) take ⌘C, ⌘X, ⌘V, ⌘A and ⌘Z / ⌘⇧Z, and ⌘↵ sends. The editor keeps those keys from the panel, so the preview handles them itself, with the clipboard through the extension.
- **Play** plays it exactly as the app does, in a phone's frame: the chapter's path, one board at a time with Continue, practice, results, from the board or lesson you're on. **हि** shows it in Hindi.
- **The Chalk tree** (in the explorer), one tree for everything: **Threads** at the top, then book → chapter → its **Planning** files and its lessons, with each chapter's open threads counted.
  - Each planning file (`outline.yaml`, `plan.md`, `boards.md`) shows its state: not written, checks fail, checks hold; for `plan.md`, to approve, approved, changed since approved, to check again. Its tooltip says why. Click it to open it.
  - **Approve** `plan.md`, the one file you approve (✓ on it, or "Chalk: Approve the plan" in the open file's title bar or right-click): once its checks hold and it is committed; the dev server writes `approved: <commit>`. **Take back** undoes it. Whether a file is approved at all is the dev server's to say.
- **Problems on planning files:** a failing check (an objective citing what the outline hasn't, an outline item neither covered nor skipped, a board serving no objective, a lesson built out of the plan's order) is a problem on the line it is about.
- **Comments in the planning files:** every thread on a planning file shows on the words it is about, in the file (VS Code's comments): read it, reply, or close it (✓) there. A thread waiting on you opens unfolded. An agent's question (`ask`) shows its options as links: click one to answer with it, or reply in your own words. To start one, select the words and press ⌥⌘/ (Ctrl+Alt+/), or click the + in the margin.
- **Threads**, at the top of the Chalk tree: every open thread, **Your turn** first (an agent's question, a fix ready to check), then **Agents' turn**; each with whose turn it is, a reviewer's finding's weight (must, consider), the latest plan or answer, and the whole thread in its tooltip. Nothing is handed over: your open comments are what the agent works through when you ask it to (`apply-comments`).
  - Click Threads: the open threads' page in the preview (`?dev&threads`), where an agent's question shows its options as buttons and a box for your own answer. Click a thread: that page, opened at it.
  - On a thread: Reply (sends a planned or ready one back to the agent), Close, Withdraw, Open board, Open source line. On Your turn: Close all ready.
  - The tree's title bar: Show activity.
  - It follows the files: an agent's plans and answers show up as they're written.

It uses the dev server on :5173 if one is running. Otherwise it starts the studio service (`platform/studio/start.mjs`, the one way it is started), which starts the dev server; if it can't come up, its log's last lines are in the "Chalk" output channel. Both outlive the editor.

Install: `pnpm editor:install` (bumps the version, packages `chalk-editor.vsix`, installs it into Cursor). What it installs is a loader (`src/loader.ts`): it runs the extension from the open repo's build, and when that is rebuilt (`pnpm editor:build`) swaps the new code in, so a change to the editor never needs a window reload. Only a change to `package.json`'s contributions (commands, menus, views) needs `pnpm editor:install` and one reload.
