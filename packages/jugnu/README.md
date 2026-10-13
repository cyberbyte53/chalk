# @chalk/jugnu

Jugnu, the AI tutor: an agent on one board. A strong model reasons over the whole board and decides; tools do what must be exact; his hard limits are code; the test bench (`pnpm test-jugnu`) shows whether it holds. The design and its reasons: "Jugnu: designing the tutor from first principles" (the design doc). No UI here: the player's chat (`JugnuPanel`) uses this. For now he appears only on boards with a question.

## The loop

Each turn starts when the student asks something, or when they act on a prop he handed the board back for. Then, up to 6 times (`maxSteps`):

1. The model gets the persona and **the whole board as JSON** (fresh every step), then the chat so far.
2. It answers in words, calls tools, or both.
3. Each tool runs; its result (what changed, the number worked out, why it was refused) goes back to the model as a tool message.
4. No tool calls, or `wait_for_student`: the turn ends. The last step is asked for words only.

## Files

- `src/board.ts`: `JugnuBoard`, all Jugnu needs from a live board. The player's `BoardRuntime` is one.
- `src/context.ts`: `persona(locale)`, how he teaches, the same on every board; `boardJson(...)`: every prop's state as the prop holds it (stored and derived, the question included, words in the student's language), what each prop type is, the lesson's IS and WHEN rules, `studentOnly`, and what happened.
- `src/history.ts`: `BoardHistory`, every action asked of the board (student, lesson, Jugnu; refusals of his own) and every signal, in order. A run of the same thing (a drag) is one line with its last values and a count.
- `src/tools.ts`: his tools, made from the board each step:
  - one per action he may use now, named `<prop>__<action>`, its arguments' JSON Schema made from the action's zod schema (`schema.ts`);
  - `point { prop, part? }`: the chat makes it glow; nothing changes;
  - `calculate { expression }`: the lesson's expression language, with board values by name (`line.marker * line.marker`);
  - `wait_for_student { watch }`: hands the board back; when the student acts on a watched prop, the player calls `continue()`.

  `runTool` runs one call. An action goes through the one door as `Actor.Jugnu`; if afterwards Check would count as correct on an open question (`wouldPass`, worked out from the question's own `check`, not run), the board is put back and he is told why.
- `src/session.ts`: `JugnuSession`, one per board: `ask(text)`, `continue()`, `onStudentMove(listener)`, `watchedProps`; `onEvent` hears each thing he says or does as it happens. A turn returns `{ asked, reply, events, watching, model, modelCalls, isFallback }`. A failed model call leaves the chat as it was.
- `src/provider.ts`: the model, behind `LlmProvider` (`chat` with tools; `complete` for one JSON answer, used by the test bench's judge). Our own message shape, translated per API:
  - `openAiCompatibleProvider`: any `/v1/chat/completions` (DeepSeek, Microsoft Foundry, LM Studio, vLLM). Tool arguments are JSON text; results go back by call id.
  - `ollamaProvider`: Ollama's `/api/chat`. Arguments are objects; results go back by tool name.
  - `scriptedProvider`: canned replies (words and tool calls), for tests.

## His hard limits, and where they live

In the runtime (`BoardRuntime.whyNotJugnu`), so nothing gets round them: he never acts on a question, never passes the board or presses Continue, never does a `studentOnly` action, never directly says the lesson's lines or shows and hides props, and never uses an action marked `reveals` while a question is open. What his actions set off through the lesson's WHEN rules runs under the same limits (`isSetOff`), except that the lesson may still speak and show in answer to him. In `runTool`: the put-back above.

Everything else (what to say, which rung of help, what would give the answer away) is the model's judgement under the persona, measured by the test bench. No output scanners.

May import: `@chalk/prop`, `@chalk/content`, `zod`.

Not yet: speech, memory across boards and lessons, the learner model in his context, offering help unasked.
