# Improving Jugnu: a test-and-diagnose plan

Instructions for an agent (Claude Code) working in this repo. The aim: run Jugnu on the test bench, find out exactly where and why he falls short, fix the causes, and show with numbers and transcripts that each fix helped. Read `packages/jugnu/README.md` and `platform/studio/evals/README.md` first.

## What good looks like

Jugnu helps a school student reason their own way to the answer, with the least help that works. In order of importance:

1. **Never gives the answer away** while the question is open: not in words, not by elimination, not by putting the board into the answer.
2. **Correct.** Every number comes from the board or the calculator.
3. **Answers what was asked.** A genuine question ("what is a square root?", "why multiply the remainder by 10?") gets a direct, simple answer, not a counter-question. Holding back applies only to the board's own question.
4. **Brief.** One or two short sentences, one idea at a time. Known problem: he talks too much (several bubbles per turn, praise plus hint plus question, comments on every move).
5. **Uses the board well**: points at the thing, shows when showing helps, hands back when it's the student's move, and never does the student's move.
6. **Warm and natural in the student's language**, Hindi included, without gushing.

## Ground rules

- **No patches.** No regex filters on his words, no output scanners, no special cases for one board or one case. Fixes go in the persona (`packages/jugnu/src/context.ts`), what he is given (the board JSON, the history), his tools (`tools.ts`), the loop (`session.ts`), or the model settings. Hard limits in code are only for actions, and they already exist in the runtime.
- **Nothing in Jugnu may know about a particular prop, lesson or question.** If a fix needs that, it belongs in the lesson or the prop's own contract (descriptions, `reveals`, `studentOnly`), and you raise it.
- **One change at a time**, measured before the next.
- **Don't weaken a case to make it pass.** If a case's `expect` is wrong (a pattern that flags a fine reply), fix the case and say so in the findings, with the transcript that shows why.
- **Ask Naman before** changing the design: a new tool, a change to what he's allowed to do, a different model, the event format, the help ladder. Prompt wording, context shape and loop tuning you can just do and report.
- Follow `docs/code-conventions.md`. `pnpm check` must pass after every change.

## Setup

1. The repo's `.env` has `JUGNU_API_KEY` (DeepSeek). The bench reads it: `pnpm test-jugnu` uses `deepseek-flash`.
2. Judge: `--judge-model deepseek-v4-pro`. Use it on every full run; scripts can't see correctness, leaks in words, or tone.
3. `pnpm check` passes before you start.

## The three instruments

1. **Cases** (`pnpm test-jugnu`): single situations. Four kinds, by id prefix: the board's question held back (`root2-`, `meters-`, `period-`…), genuine questions that deserve a direct answer (`ask-`), tool use (`tool-`: pointing, showing, not showing when it reveals, calculating, reacting to a move, staying quiet), and pressure (giving up, injection, "do it for me").
2. **Simulated students** (`pnpm test-jugnu --students`): whole conversations with a student who holds a misconception. The headline for the learning experience: solved by the student, misconception fixed, never given the answer, experience score, and the least help used. `--baseline` shows the same students without Jugnu.
3. **You reading transcripts.** Both reports open with what to read first.

## Phase 1: baseline

1. Run the cases twice with the judge: `pnpm test-jugnu --judge-model deepseek-v4-pro`. Two runs, because model replies vary; a case that fails once in two is flaky, not fixed.
2. Run the students twice with the baseline: `pnpm test-jugnu --students --runs 2 --baseline --judge-model deepseek-v4-pro`.
3. Read every transcript. The numbers only tell you where to look.
4. Write `platform/studio/evals/findings.md`: date, model, the headline numbers of every run, and a table with one row per problem you see:

   | Problem | Cases or students | Category | Example (quote) | Suspected cause |

## Phase 2: diagnose

Put each problem in one category. The category decides the fix.

| Category | Looks like | Usually caused by |
|---|---|---|
| Leak | names the answer, the option, or an elimination; or acts in a way that shows it | persona unclear on what counts as giving away; he can't tell an action shows the answer |
| Wrong maths or fact | a number not on the board and not from `calculate`; a false statement | not using the calculator; misreading the board JSON |
| Deflects a genuine question | answers a concept question with a question | persona treats everything as "the question" |
| Too much talk | many bubbles, long replies, praise plus hint plus question, narration of tool calls | persona length rule; words shown at every loop step; reacting to every move |
| Board misuse | doesn't point or show when it would help; acts without saying why; does the student's move (refused or undone) | tool descriptions; persona on when to show |
| Misreads the board | talks about a state that isn't there; ignores what the student did | board JSON hard to read; history unclear or too long |
| Hand-back | never hands back; hands back without saying what to do; reacts to noise | persona; the `continue()` message |
| Language and tone | English in a Hindi case, stiff Hindi, preachy | persona |
| Loop and tools | bad arguments, wrong tool names, hits the 6-step cap, slow | tool schemas, descriptions, loop |
| Case is wrong | the reply is good but a check fails | the case's `expect` |

For each problem, find the cause, not the symptom: look at what he was given at that step. To see the exact messages and tools for one case, write a small script (or a test with `scriptedProvider`) that prints `systemPrompt(...)` and `toolsFor(...)` for that board and setup. Rank the problems by how much they hurt a student, then by how many cases they touch.

## Phase 3: fix, one at a time

For each problem, most important first:

1. Write the hypothesis in `findings.md`: "He deflects concept questions because rule 3 says never give 'its answer', and he applies it to every question."
2. Make the smallest change that tests it.
3. Run the affected cases twice (`--only <id part>`, run once per id group), then all the cases once and the students once (`--students --runs 2`), to catch regressions. A change that improves the cases but lowers the students' numbers is not an improvement.
4. Record before and after: the numbers, plus one transcript quote from each.
5. Keep the change if it helped and broke nothing; otherwise revert it and record that too. A failed idea is a finding.

Likely first fixes to try (check them against the evidence first):

- **Length:** a tighter rule in the persona (at most two short sentences, one idea per turn, no filler praise, don't describe what you're about to do); show only his final words of a turn in the chat (`JugnuPanel` and the `reply` of a turn), keeping the in-between words in the steps; let him stay silent after a student's move when nothing needs saying.
- **Genuine questions:** make the persona say plainly that only the board's own question is held back, and concept questions get a direct, simple answer.

## Phase 4: harder tests

Once both are mostly clean, add what they still can't see:

- **New cases from what failed**, especially real-sounding messages: typos, one-word messages ("??", "what"), Hinglish, a real question mixed with a request for the answer.
- **New students** in `students.json` for each misconception you saw Jugnu struggle with, and temperaments that broke him (silent, rude, keeps guessing).
- If the simulated students are too easy (they drop their belief at the first hint), make their profiles stubborner before trusting the numbers.

## Reporting back

At the end, update `findings.md` with: what changed (files, one line each), before and after numbers for the cases and for the students (mean of the two runs; for the students, also against the baseline), the three transcripts that best show the improvement, what's still wrong and why, and what you'd do next. Keep it short enough to read in five minutes.
