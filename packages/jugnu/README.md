# @chalk/jugnu

Jugnu, the AI tutor: an agent on one board. A strong model reasons over the board and decides; tools do what must be exact; his hard limits are code; the test bench (`pnpm test-jugnu`) shows whether it holds. No UI here: the player's chat (`JugnuPanel`) uses this. He only acts when the student calls him; then they go back and forth as long as it takes.

## Where he thinks: the server, on a copy of the board

A turn is thought through on the server, never on the phone:

1. The phone sends one request (`POST /api/jugnu/turn`): the board as the lesson wrote it, every prop's state, the chat so far, and what the student did (typed, or tapped one of his options).
2. The server builds a copy of the board with no screen (`headlessBoard` in `@chalk/player`: the same runtime and prop code, time jumping to the end of every glide and wait) and runs `jugnuTurn` on it.
3. He thinks on the copy, out of sight: `try` shows what actions would do without doing them, `calculate` works numbers out. Then he answers with one `reply`: his words, what he shows and points at, and how the turn ends (quiet, usually: the board is theirs; or a question with options). The server checks the reply on the copy (each thing shown runs, in order; nothing refused, nothing that answers the question; points at what's there; options that are options). If it fails he hears why and replies again; if it passes it comes back as **cues** to play in order: `say`, `act`, `point`, `ask`.
4. The phone plays the cues (`JugnuSession`): words into the chat at an easy pace, a gentle glow on what he means, his actions through its own door as `Actor.Jugnu` (the runtime's limits hold again), option chips. If one of his actions isn't taken on the phone (the board differs), the rest of that turn stops; the next turn hears why.

The server is stateless: the phone carries the chat. Props are deterministic (state in, state out; even chance props keep their seed in state), so what he saw on the copy is what the phone gets.

## The loop (`jugnuTurn`)

Up to 16 model calls (`maxSteps`, only a guard against a runaway loop):

1. The model gets the system message (the persona, then the board's **definition**: what it's for, each prop's type and what it stands for here, what each type is, the actions he can use, the IS and WHEN rules), then the chat. Each turn opens with a user message: the board **now** (every prop's state), what happened since, and what the student did. The system message and the tools never change while he is on a board, and the chat is only appended to, so the model server can cache it.
2. He calls `try` and `calculate` as often as he likes, then `reply`. Words he writes outside a reply are his own (if he answers in plain words with no reply, they are the reply).
3. The turn ends when a reply goes out. The last step is made to call `reply`.

## His tools, typed and strict

Three tools, the same on every board: `try { calls }`, `calculate { expression }`, `reply { steps, end }`. Each action he can use is a typed choice inside `try` and a reply's `show` (`{ call: "line.magnify", args: { value } }`, the args from the action's own zod schema), so a call names a real action with arguments of the right shape. Where the board allows, the tools are **strict** (`strict: true`): the model server holds the arguments to the schema exactly (checked on our Foundry DeepSeek: with strict it can't write an action or field that isn't there; without, it can). Strict schemas have no optional fields (an optional argument is "or null", dropped before the action runs: `fromStrict`) and no bounds (the prop still checks them). A board whose schemas can't be strict, or are too big for the server (over 100 properties or 5 levels), gets the same tools without strict; the prop's own errors still come back to him. Today 116 of 124 boards are strict.

## Files

- `src/board.ts`: `JugnuBoard`, all Jugnu needs from a board. The player's `BoardRuntime` is one.
- `src/context.ts`: `persona(locale)`, how he teaches, the same on every board; `boardDefinition` (fixed, cached) and `boardNow` (each turn); `boardJson` (both, for tests and the bench).
- `src/history.ts`: `BoardHistory`, every action asked of the board and every signal, in order; a run of the same thing (a drag) is one line with its last values and a count. `take()` hands out what he hasn't heard yet. While he thinks, his own tries are not history.
- `src/tools.ts`: `jugnuTools(board)` (the specs, strict or not, and the actions he can use: never a question's, the lesson's lines, or a `studentOnly` one) and `runTool`. `try` runs actions and puts the board back; `reply` is checked on the board and becomes cues. Whether an action is allowed right now (a hidden prop, an answer that would show: `wouldPass`, worked out from the question's own `check`) is checked when it runs.
- `src/schema.ts`: an action's zod schema as JSON Schema (`jsonSchemaOf`), and in the strict subset (`strictSchemaOf`, `fromStrict`).
- `src/turn.ts`: `jugnuTurn`, one turn on the server's copy of the board. Returns the cues, this turn's chat messages, everything he did (tries, sums, replies sent back), the model's token use (`usage`, with what came from the cache).
- `src/session.ts`: `JugnuSession`, one per board on the phone: `ask(text)`, `choose(option)`, `continue()`, `onStudentMove`, `messages`. Each turn goes to `think` (the app: the server; tests and the bench: `thinkHere`, which runs `jugnuTurn` on the board itself and puts it back), then plays the cues.
- `src/provider.ts`: the model, behind `LlmProvider` (`chat` with tools; `complete` for one JSON answer). `openAiCompatibleProvider` (DeepSeek, Microsoft Foundry, LM Studio, vLLM), `ollamaProvider`, `scriptedProvider` for tests. `chatMessageSchema` checks a chat a phone sends back (never a system message).

Cues and the turn's input are formats in `@chalk/content` (`cueSchema`, `turnInputSchema`); the request and reply in `@chalk/api`.

## His hard limits, and where they live

In the runtime (`BoardRuntime.whyNotJugnu`), so nothing gets round them, on the server's copy and again on the phone: he never acts on a question, never passes the board or presses Continue, never does a `studentOnly` action, never directly says the lesson's lines or shows and hides props, and never uses an action marked `reveals` while a question is open. What his actions set off through the lesson's WHEN rules runs under the same limits. In the tools: the put-back above.

Everything else (what to say, which rung of help, what would give the answer away) is the model's judgement under the persona, measured by the test bench. No output scanners.

## What the lesson can tell him

A board may carry notes for him, in plain English (`jugnu` on the board; in content, `b.purpose(...)` and `b.standsFor(prop, ...)`): what the board is for, and what each prop stands for on it. Optional: without them he works it out from the props and rules.

## Flags

The chat has a flag button: a chat someone wasn't happy with is kept whole on the server (`POST /api/jugnu/flags`: the board, its state at the start and now, the chat as the model saw it, what the student saw, a note). `pnpm --filter @chalk/server flags` lists them; `flags <id>` writes one to a file, to read and replay on the bench.

May import: `@chalk/prop`, `@chalk/content`, `zod`.

Not yet: memory across boards and lessons, the learner model in his context, offering help unasked (by design: he only comes when called).
