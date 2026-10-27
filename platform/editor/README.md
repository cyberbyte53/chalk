# Chalk for Cursor / VS Code

Content seen as boards, beside its code. Nothing here draws a board: the panel frames the learner
app's own `?dev&board=` page, so what you see is what the phone draws.

- **Preview** (the preview icon in an editor's title bar, right-click a folder in `content/`, or ⌥⌘P):
  - a book shows its book screen;
  - a chapter shows its path of lessons;
  - a lesson shows its boards and questions;
  - a question family shows its questions;
  - a comment shows the board it's on;
  - a file in `reviews/` shows that review's page: its threads, each foldable, with the conversation and the board as it is now; the `reviews` folder lists every review.

  Tapping a chapter or lesson goes one level down and opens its file.
- **Follows you:** switch files and the preview switches; move the cursor in `overview.ts` and the piece written there is outlined. Alt-click a piece and the editor jumps to its line.
- **Pick** a piece, write what should change, then:
  - **Ask the agent** puts it in the chat with its board, line and words. If the editor's chat can't take text from an extension, it goes on the clipboard and the chat opens.
  - **Leave a comment** writes it to the chapter's `comments/` folder.
- **Play** plays it exactly as the app does, in a phone's frame: the chapter's path, one board at a time with Continue, practice, results, from the board or lesson you're on. **हि** shows it in Hindi.
- **The Chalk tree** (in the explorer): book → chapter → lesson, with each chapter's open threads counted.
- **Chalk Reviews** (in the explorer): every review in one place. At the top, your threads not handed over yet (Copy for agent hands them over); then each review, newest first, with where it stands ("1 open, 3 ready") and its threads, each with its status, the latest plan or answer, and the whole thread in its tooltip.
  - Click a review: its page in the preview. Click a thread: the review's page, opened at that thread.
  - On a thread: Reply (sends a planned or ready one back to the agent), Close, Withdraw, Open board, Open source line.
  - On a review: Copy for agent (`apply review <id>`), Close all ready, Show its activity.
  - It follows the files: an agent's plans and answers show up as they're written.

It uses the dev server on :5173 if one is running. Otherwise it starts the learner app's server and the content rebuild-on-save itself (output in the "Chalk" channel). It also starts the chalk MCP service agents connect to (127.0.0.1:5174/mcp) if it isn't running.

Build and package: `npm install && npm run package` → `chalk-editor.vsix`. Install it with the command "Extensions: Install from VSIX…".
