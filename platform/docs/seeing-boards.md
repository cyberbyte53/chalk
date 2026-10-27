# Seeing boards: `look` and `play`

Two chalk MCP tools show agents boards as the student's phone draws them. They drive the real learner app in Chrome (`platform/studio/src/mcp/app-driver.ts`): the app's own page draws the board, and the tools measure, read and act on it. Nothing is simulated.

## The rule

Return what only the running board knows. Point at the code for what the code says. Never shorten anything. The answer is the text (and a picture): no second copy as data, which a client may show instead of the text.

| Kind | Lives in | In the answer |
|---|---|---|
| How a piece was written | the code | full repo path and line, every kit or pattern function it went through, a question's `params.yaml` row (all recorded by the build: [reach.md](reach.md)) |
| Its setup | the running app (shuffled options, a question's values, what a helper worked out) | at a piece: in full, in the language shown; options in the order shown, each with its id and its own line, and whether they were shuffled |
| Its current state, values worked out from others | only the running app | in full, every field |
| What can be done to it now | the running app | action, who, via which control, the action's line |
| How it looks | the picture | one picture, plus layout problems found by measuring, or "ok" |
| Where each part is drawn | the code | path and line per part |

Each thing appears once. Values are written in full, strings quoted as written.

## `look`: what you point at decides how much comes back

| Pointed at | Returns |
|---|---|
| a piece or part (`<board>#game`, `<board>#game/plates`) | a picture of just it (cut from the board, at double resolution, its parts named); ok or its problems; everything about the piece (the table above) |
| a board | its picture with each piece named; ok or its problems; one line per piece: name, type, full path:line, current state. A field too long for a line is named, not printed (`log (14 items) → <board>#game`): its full value is one call away. |
| a lesson or a question family | its boards as thumbnails; only the boards with problems |
| a chapter or book | no pictures: a check of every board, in English and Hindi at 360 and 640 wide by default ("161 boards · 644 drawings · 161 ok · 0 with problems", then the boards with problems). About a minute and a half for a chapter; it reports progress, can be cancelled, and draws on its own pages |

`locales` and `widths` put versions side by side in the one picture. `play: true` shows a board as a student meets it (pieces not earned yet are hidden). `continue: true` looks at the board as your last `play` left it. `labels: false` gives the clean picture.

## `play`: what happens when a student uses it

Taps and drags on the real page, in order, by address (`game/giveRound`; `qr` with `text: "q = 5"` for the option saying it). One line per step: what it set off, everything the student sees that changed (each part was → now, `+` appeared, `−` gone, an input off → on, and what a prop knows but doesn't show), signals, "board passed", errors. Then whether the board is passed. One picture: before | after, cut to the pieces that changed (`full: true` for whole boards, `shots: "each"` for a strip of every step).

`continue: true` goes on from where this agent's last call left the board. If that board isn't there (another board since, content rebuilt), it fails and says why; it never starts fresh as if it had worked.

## The picture

Each piece (or, in a piece's picture, each part) has a thin outline and its name in a margin beside the board, joined by a line, so nothing covers the content. A piece with a problem is outlined in red, and its tag says the problem. The names are the addresses `play` steps and comments use.

The layout check runs first on the untouched page, and the screenshot is taken clean. Names are drawn afterwards on a copy of that screenshot, on a page of its own (`picture.ts`). So labels can never move or cover what was measured, and `labels: false` is the student's screen, pixel for pixel.

## Underneath

- **A page per agent.** Each connection draws on its own browser page, so agents draw at once and one agent's taps never reach another's board.
- **Rebuilds never land mid-drawing.** A content rebuild waits for the drawings running, and drawings asked for after it wait for it; pages load afresh after. A drawing the page is pulled away from is tried once more, unless it was continuing a board.
- **Settled pictures.** Fonts, images and finite animations finish before anything is measured or taken.
- Content is rebuilt first when anything changed.
- **Nothing to start.** Agents reach the service through a relay their harness starts (`connect.ts`): it starts the service if it isn't running and reconnects when it restarts (it runs under `tsx watch`, so a code change takes effect on the next call). The service starts the dev server, as a process of its own, when a tool needs it ([comments.md](comments.md#who-may-do-what)).

## Held to it

`pnpm stress-mcp` (`platform/studio/src/mcp/stress.ts`) runs these tools the way agents call them, against the running service: many at once from one agent and from several, every width and language, reads during drawing, content changing mid-drawing, agents not reaching each other's boards, `continue` failing clearly, snapshots of played and question boards, labels not changing the picture, pieces cut out, a chapter checked, bad names. Run it with `pnpm check` before committing a change to the tools.
