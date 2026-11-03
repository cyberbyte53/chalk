# One tool to see a board: `show`

Done (2026-11-01). How it works: [seeing-boards.md](seeing-boards.md). What follows is why.

**Goal:** an agent (a builder or a reviewer) sees a board in any state with one tool, fast, and can read every word of what it gets back.

## Before

- Two tools asked one question, "show me this board in some state": `look` (no steps) and `play` (steps), each opening the board, running it, reading it and taking a picture on its own path. `look` had been made fast; `play` hadn't.
- What reviewers used, over 14 runs: `play` 208 calls, `look` 153 (both languages asked for 101 times: its default, one version, was rarely what a review wanted), `changes` 28 (67 s each), Bash 186 (lesson source, the rubric, `pnpm check`). The answers too long to arrive whole were `changes`' (10) and `comments`' (8), never `look`'s or `play`'s.
- **The picture couldn't be read.** `look` set six versions side by side in one picture, 9000 × 2590; it reached the model shrunk to 2000 wide, each version about 330 px, its words unreadable, Hindi worst.
- `play` kept a board between calls (`continue`): state on the server that could be lost (another board drawn, content rebuilt) and worked for one version only. Its `wait` step did nothing once the clock jumped, and `drag … by` was in pixels, different on every screen.

## Decided

1. **One tool.** "The board before anything" and "the board after a student did X" are the same question with zero or more steps.
2. **A state is a board and the steps that got there.** A board is deterministic (one clock, no randomness, inputs logged and replayed), so every call starts from the board's start: the same call always answers the same, and going on is sending the steps again with more. `continue` and the server's memory of boards are gone.
3. **What a board does is checked once; how it looks, in every version.** Without steps: English and Hindi on the three check screens, unless fewer are asked for. With steps: one version (the 360×640 phone in English unless one language and one screen are named), as a board's rules don't depend on either. Six versions after steps would mean six step reports to merge: more confusing than useful.
4. **Steps name things, never pixels or words**: a part by name, a point in the prop's own units. `drag … by` is gone. Typing into a field will be a step by name when a prop first has one.
5. **`wait` became `during`.** A step is done once the board has come to its end, or while a named line is said: the board's clock runs until the line starts and holds there. That tests what a jumping clock couldn't (a student tapping before the board hands over), and names a moment the same in every language.
6. **Pictures arrive at the size they are seen.** Measured: a picture over 2000 px on a side, or about 3.7 million pixels, is shrunk on its way. Each version is now a picture of its own at double resolution, a tall board cut into overlapping parts. The cost: a board in six versions is about twelve pictures, many times the tokens of the one shrunk picture.
7. **Text keeps every fact, once.** A board's file is named once, each piece by its line in it; a piece's state at a board leaves out fields still as the prop starts them (the piece's own answer has them all).

## Open

- `changes` (67 s a call: it redraws every reviewed board) and `comments` (16 s to read threads, answers too long): next.
- Whether the reviewer still runs `pnpm check`: the service knows whether the build passes.
- `pnpm stress-mcp` still names boards of `class10-maths/real-numbers`, which is gone: it needs pointing at coordinate-geometry's boards before it can run.
