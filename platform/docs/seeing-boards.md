# Seeing boards: `show`

One chalk MCP tool shows agents boards as the student's phone draws them. It drives the real learner app in Chrome (`platform/studio/src/mcp/app-driver.ts`): the app's own page draws the board, and the tool measures, reads and acts on it. Nothing is simulated. Why it is one tool, and how it was decided: [show.md](show.md).

## The rule

Return what only the running board knows. Point at the code for what the code says. Never shorten anything. The answer is the text and the pictures: no second copy as data, which a client may show instead of the text.

| Kind | Lives in | In the answer |
|---|---|---|
| How a piece was written | the code | path and line, every kit or pattern function it went through, a question's `params.yaml` row (all recorded by the build: [reach.md](reach.md)) |
| Its setup | the running app (shuffled options, a question's values, what a helper worked out) | at a piece: what the board gave where it placed it, in the language shown, and one line pointing at the prop's defaults for the rest; options in the order shown, each with its id and its own line, and whether they were shuffled |
| Its state, values worked out from others | only the running app | at a piece, in full, every field; at a board, the fields not as the prop starts them |
| What can be done to it now | the running app | action, who, via which control, the action's line |
| How it looks | the pictures | one per version, readable as it arrives, plus layout problems found by measuring, or "ok" |
| Where each part is drawn | the code | path and line per part |

Each thing appears once. Values are written in full, strings quoted as written.

## A state is a board and the steps that got there

Every call opens the board afresh, as a student first meets it, so the same call always answers the same: nothing is kept between calls. To go on from where a call left off, send its steps again with more.

**Without steps**, the board plays on its own to its end (its lines said, its moves done, everything the lesson does by itself), then it is checked in every version: English and Hindi on the check screens, a small phone (360×640), a laptop column (640) and a projector (640×720), unless `locales` and `screens` ask for fewer.

**With steps**, they are done in order on one version: the phone in English, unless one language and one screen are named. What a board does is the same in every version; how each version looks is what a call without steps checks.

## What you point at decides how much comes back

| Pointed at | Returns |
|---|---|
| a piece or part (`content/…/<board>#game`, `…#game/plates`) | a picture of just it in each version (cut from the board, its parts named); ok or its problems; everything about the piece (the table above) |
| a board | a picture of each version with each piece named; ok or its problems per version; one line per piece: name, type, line (`overview.ts:143`, its file once at the top), its state where it isn't as the prop starts it; its script in both languages. A field too long for a line is named, not printed (`log (14 items) → content/…/<board>#game`): its full value is one call away. |
| a lesson or a question family | its boards as thumbnails (the phone in English); the boards with problems in any version |
| a chapter or book | no pictures: a check of every board in every version ("161 boards · 966 drawings · 161 ok · 0 with problems", then the boards with problems). About 40 seconds for a chapter; it reports progress, can be cancelled, and draws on its own pages |

`play: true` shows a board as a student meets it (pieces not earned yet are hidden; steps always do). `labels: false` gives the clean pictures.

## Steps: what happens when a student uses it

Taps and drags on the real page, by name (`game/giveRound`), never by the words on a button or by pixels. A step can aim in the prop's own units where the prop draws a frame: `tap: "plane", at: { x: -4, y: 2 }`, `drag: "plane/movePoint", to: { x: 3, y: -1 }`; the frame's picture carries its map (units to pixels), so the tool converts. A piece with no frame says so. Typing into a field will be a step of its own, by name, when a prop first has one.

**When a step is done.** Once the board has come to its end, by default: everything its lesson does by itself has happened. `during: "<line>"` does it while that line is said instead, as an impatient student would: the board's clock runs until the line starts and holds there while the step is done. It names a line, never a time, so it is the same moment in English and Hindi. A line that doesn't come (said already, or never) is said on that step, and the steps after it aren't done.

One line per step: what it set off, everything the student sees that changed since the step before (each part was → now, `+` appeared, `−` gone, an input off → on, and what a prop knows but doesn't show), what was said, "board passed", errors. Each step's changes run to where the next step is done (its line, or the board's end). Then whether the board is passed. A picture: before | after, cut to the pieces that changed (`full: true` for whole boards, `shots: "each"` for a picture after every step).

**The clock jumps.** A board's clock jumps through everything due (lines, which last their clips' length; glides; waits), each at its own board time, so a board is read where it ends at once ([one-clock.md](one-clock.md)). `speed` runs it in real time instead (1, or faster), for watching it; then a board is read once it has settled, at most 30s of its own time, and `during` isn't offered.

**Motion, on request.** `frames: { every, most }` watches the board after each step at real speed: a picture about every `every` ms (default 100), kept when it differs from the last kept, at most `most` (default 6), compared by their pixels. They come back in order, four to a row, each with its time, and the step says `still after 1.2s` (the picture stopped changing and the board settled) or `still changing at 3s` (frames full, or the cap). A fact for the agent to judge, never a verdict.

## A prop on its own

The library has an address too: `show` `library/props/` (or one package, `library/props/basics`) gives a line per prop: its address, its role, what it is for (the first sentence of its `describe`) and how many boards use it, from what the build recorded. The preview shows the same at `?dev&at=library/props/`, every prop drawn at its defaults; a click opens it.

A prop has an address like a board: `library/props/<package>/<type>` (`library/props/primes/stickMeasure`), with a part after `#` (`…/stickMeasure#piece`). It opens as a board with only that prop on it, at its defaults, or from `state` (fields over its defaults: `{ stickA: 20, stickB: 8 }`). From there it is any board: `show` answers as for a piece (where it is defined, its setup, state, what can be done, its parts), then what it is for and every board that uses it, each with the fields it sets, the inputs its rules feed and the actions its scripts call, and the settings and lesson actions no board uses or only one does. Its steps name its parts as its address does (`tap: "lay"`), plus `call`: one of its actions as a lesson would call it (`{ call: "setSticks", args: { stickA: 9, stickB: 6 } }`), which a student can't do and a board leaves to its lesson. A prop its package doesn't have, fields that don't fit it, an action it hasn't or arguments that don't fit are each refused, saying what there is. The preview opens it at `?dev&at=library/props/<package>/<type>` (`&state=` its fields, as JSON), with a panel beside it standing in for a lesson: its inputs and fields, each set on the live prop as a rule would, and a button per action with its arguments. The panel is built from the prop's schemas, so nothing is written per prop.

## The pictures

Each version is a picture of its own, at double resolution, sized to reach the model as it is: a picture with a side over 2000 px or more than about 3.7 million pixels is shrunk on the way (measured), so a tall board comes as parts, top to bottom, each overlapping the last a little so a line cut by one is whole in the next (`picture.ts`). Every word, in both languages, can be read.

Each piece (or, in a piece's picture, each part) has a thin outline and its name in a margin beside the board, joined by a line, so nothing covers the content. A piece with a problem is outlined in red, and its tag says the problem. The names are the ones steps and comments use.

The layout check runs first on the untouched page, and the screenshot is taken clean. Names are drawn afterwards on a copy of that screenshot, on a page of its own. So labels can never move or cover what was measured, and `labels: false` is the student's screen, pixel for pixel.

## Underneath

- **Pages: one pool.** The service keeps at most six pages, each loaded with the app; a call borrows the pages it draws on and gives them back. No page belongs to an agent (every call opens its board afresh), so pages never pile up: about 2.3 GB in all. `/health` says how the pool stands (pages, idle, lent, calls waiting).
- **Rebuilds never land mid-drawing.** A content rebuild waits for the drawings running, and drawings asked for after it wait for it; pages load afresh after. A drawing the page is pulled away from is drawn again from the start.
- **Settled pictures.** Fonts, images and finite animations finish before anything is measured or taken; on a jumping clock the screen's own animations take no time.
- Content is rebuilt first when anything changed.
- **Nothing to start.** Agents reach the service through a relay their harness starts (`connect.ts`): it starts the service if it isn't running and reconnects when it restarts (it runs under `tsx watch`, so a code change takes effect on the next call). The service starts the dev server, as a process of its own, when a tool needs it ([comments.md](comments.md#who-may-do-what)).

## Held to it

**Every call is timed.** The service logs each tool call and each `/dev-*` request (the editor's, the preview's) to `node_modules/.cache/chalk-calls.jsonl` (`platform/studio/src/mcp/call-log.ts`): what was asked and by whom, how long it took, how long it waited on the way (the relay stamps when it sent it), how long the service's one thread was held while it was open, and how big the answer was (words, pictures). `pnpm tool-times` (`--since 2h`, `--slow 20`) sums it up per tool and lists the slowest calls: what is slow is seen, not guessed. `pnpm check` logs each run the same way, one short line (`node_modules/.cache/chalk-checks.jsonl`: its time, each step's, how many test files ran and the slowest of them), and `pnpm tool-times` sums those too.

`pnpm bench-look` measures a reviewer's call (a board in six versions, and the same board after steps) and keeps its answer, so a faster tool is held to the same words and pixels. `pnpm stress-mcp` (`platform/studio/src/mcp/stress.ts`) runs the tool the way agents call it, against the running service: many calls at once from one agent and from several, every width and language, content changing mid-drawing, agents not reaching each other's boards, played and question boards, labels not changing the picture, pieces cut out, a chapter checked, bad names. Run it with `pnpm check` before committing a change to the tool.
