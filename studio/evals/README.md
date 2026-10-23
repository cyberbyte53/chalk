# Testing Jugnu

Does Jugnu help the way the design says, on real boards, in real situations? Two ways to find out:

- **Cases** (`pnpm test-jugnu`): one situation each, played on its board (the student's moves, their questions, Jugnu's whole loop of tool calls), scored on what he said and did.
- **Simulated students** (`pnpm test-jugnu --students`): a second model plays a student with a misconception, start to finish, and we see whether they get there themselves and actually understand. This is the real measure of the learning experience.

```
pnpm test-jugnu                                   # the model in the repo's .env (DeepSeek Flash)
pnpm test-jugnu --judge-model deepseek-v4-pro     # and have a stronger model grade each conversation
pnpm test-jugnu --only meters                     # just the cases whose id has "meters"
pnpm test-jugnu --model qwen3.5:9b --provider ollama
```

The model, provider, server and key come from `JUGNU_MODEL`, `JUGNU_PROVIDER`, `JUGNU_MODEL_SERVER` and `JUGNU_API_KEY` (the shell, else the repo's `.env`), or `--model`, `--provider`, `--url`, `--key`. With nothing set, the provider is `openai-compatible` at `https://api.deepseek.com`. The judge takes the same options with `--judge-` in front and uses the same server and key unless told otherwise (`JUGNU_JUDGE_KEY`). `--think` lets the model think first (the report name gets `-thinking`).

## What a case is

In `jugnu-cases.json`:

- `lesson` (relative to the repo root) and `board`: a published lesson, or a test board in `boards/`.
- `setup`: what the student did before asking, as their own actions (`line.moveMarker`, `guessRoot.check`).
- `turns`, in order: `{ "ask": "…" }`, or `{ "student": [actions] }`. If Jugnu handed the board back and the student acts on a prop he's watching, he goes on by himself, as in the app.
- `expect`: what the script checks (below). `good`: what good help does, in words, for the judge and for you.

`boards/lessons/jugnu-boards.json` holds question boards made only for testing, harder than the lessons so far: a series circuit with a prediction (taking the bulb out is the student's job), a parallel circuit with ammeters where opening the switch shows the answer and the numbers need the calculator, a goal that Jugnu could solve by flipping switches, 1 ÷ 7 where tapping to the end shows how many digits repeat, a 3 ÷ 8 goal, and the coin with a question. They are checked like any lesson (`pnpm test` validates them); after changing them, `pnpm publish-lesson studio/evals/boards/lessons/jugnu-boards.json`. In `pnpm dev` they show at the bottom of the lesson list as "Jugnu test boards", so you can try him on them yourself.

## What it checks

By script, from `expect`:

| Check | Passes when |
|---|---|
| `answered` | every turn got words or an action from him |
| `noLeak` | no reply has a `notSay` pattern (the answer given away in words) |
| `saysFact` | some reply has a `say` pattern (a fact he should get right) |
| `acts` | he acted on the board, or didn't, as `act` says |
| `notDo` | he took none of the `notDo` actions (ones that would show the answer) |
| `calculates` | he used the calculator, when `calculates` says a number has to be worked out |
| `handsBack` | he handed the board back, when `handsBack` says he should |
| `points` | he pointed at one of the `points` targets (`"prop"` or `"prop.part"`); an empty list means he shouldn't point |
| `boardAfter` | each condition holds on the board at the end, in the lesson's expression language: where his showing should or must not leave it |
| `holdsLine` | he never tried the student's part: the question, Continue, a student-only action, or a move that put the board into the answer (which is undone) |
| `noRefusals` | nothing he tried was refused (bad arguments, a tool that isn't there, a limit) |
| `short` | every reply at most `maxWords` words (default 70) |
| `language` | mostly Devanagari for a Hindi case, almost none for English |

By the judge, if given: is the maths right, did he give the answer away (in words, by elimination, or by what he did), guidance, warmth and language from 1 to 5, and a one-line note, over the whole conversation. Use a stronger model than the one being tested.

Each run writes `reports/<time>-<model>.md`, every case as a transcript (what he said, each tool call and what it changed, the student's moves, the board at the end), and a `.json` with everything. Read the transcripts, not just the numbers: the patterns are rough.

## Simulated students

```
pnpm test-jugnu --students --judge-model deepseek-v4-pro            # every student once
pnpm test-jugnu --students --runs 2 --baseline --judge-model …      # twice each, plus each without Jugnu
pnpm test-jugnu --students --only root2 --student-model deepseek-flash
```

Each student in `students.json` has a board with a question, who they are, the belief they start with (the misconception), how they behave (gives up fast, taps randomly, asks why), how they write, and the right understanding (only the judge sees that).

The student model sees only what a real student sees: the shown props without their `notOnScreen` fields (no answer key, no rules), what Jugnu says, what he does on the board and what he makes glow. It acts only through actions marked `byLearner` (the finger's actions, and Check). Each round it acts on the board and/or writes to Jugnu; Jugnu answers, or goes on after a move he was watching for. Up to 8 rounds; it ends when the student is right, gives up, or does nothing twice. Then the student explains the answer in their own words.

Scored per conversation: solved by the student (and in which round), wrong checks, Jugnu's words and messages per turn, his tool use, refusals and undone moves. The judge adds: was the misconception fixed (from the explanation), did the student do the work, did he give the answer away, was his maths right, the highest help he used (ask, hint, point, show, tell), too much talk, board use and experience (1 to 5). `--baseline` plays each student without Jugnu too, so the report shows what he adds. The report opens with the conversations to read first.

Simulated students are cleverer and more cooperative than real ones; their profiles tell them to hold on to their belief, but read the conversations with that in mind.

## Adding cases

Good cases are what real students send: "just tell me", "do it for me", Hindi and Hinglish, wrong maths, giving up after tries, off-topic, "I'm stupid", "ignore your rules". Every case must have something it can fail. Jugnu is on question boards only for now, so cases are too.
