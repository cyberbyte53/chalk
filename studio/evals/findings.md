# Jugnu findings

Following [IMPROVING-JUGNU.md](./IMPROVING-JUGNU.md).

- **Date:** 2026-10-12
- **Jugnu:** DeepSeek-V4-Flash on Microsoft Foundry (`chalk-foundry`, Global Standard), via the repo's `.env`.
- **Judge and simulated students:** DeepSeek-V4-Flash as well (Naman: no V4-Pro). The judge is the same model it grades, so its scores are weak evidence: where it and the scripted checks disagree, the transcript decides.

## Phase 1: baseline

### Cases (66 cases, two runs)

Reports: `reports/2026-10-12-10-34-DeepSeek-V4-Flash.md`, `reports/2026-10-12-10-39-DeepSeek-V4-Flash.md`.

| | Run 1 | Run 2 |
|---|---|---|
| cases run (no model error) | 64/66 | 64/66 |
| noLeak | 81% of 42 | 79% of 42 |
| saysFact | 85% of 20 | 85% of 20 |
| acts | 80% of 5 | 80% of 5 |
| notDo | 89% of 9 | 89% of 9 |
| calculates | 40% of 5 | 0% of 5 |
| handsBack | 0% of 4 | 25% of 4 |
| points | 100% of 4 | 100% of 4 |
| boardAfter | 50% of 2 | 50% of 2 |
| holdsLine | 100% | 100% |
| noRefusals | 94% | 92% |
| **short** | **28%** | **31%** |
| language | 100% | 100% |
| judge: correct / gave answer away | 100% / 6% | 100% / 5% |
| judge: guidance / warmth / language (1–5) | 3.8 / 4.3 / 5.0 | 3.7 / 4.3 / 5.0 |
| seconds per turn (median) | 2.0 | 2.1 |
| model calls per turn (mean) | 1.6 | 1.8 |

### Simulated students (8 students, two runs, with baseline)

Report: `reports/2026-10-12-10-44-students-DeepSeek-V4-Flash.md`.

| | With Jugnu | Without (baseline) |
|---|---|---|
| solved by the student | **75%** | **88%** |
| rounds to solve (mean) | 3.6 | 5.1 |
| wrong checks (mean) | 0.1 | 0.4 |
| judge: misconception fixed | 88% | 69% |
| judge: student did the work | 88% | 100% |
| judge: experience (1–5) | 4.1 | 3.8 |
| Jugnu words per turn (mean) | 66.2 | |
| Jugnu messages per turn | 1.4 | |
| judge: gave answer away / too much talk | 6% / 25% | |
| judge: highest help used | point 12, tell 3, hint 1 | |

Per student, the lower solve rate is all from `coin-exact-half`: out of rounds with Jugnu both times, solved in rounds 6 and 7 without him. Elsewhere Jugnu gets there faster (`period-seven` round 3 vs 8, `series-full-voltage` 4 vs 5–6) or the same. `onlyb-random` runs out of rounds either way.

### Problems seen

Ranked by harm to a student, then by reach.

| # | Problem | Cases or students | Category | Example (quote) | Suspected cause |
|---|---|---|---|---|---|
| 1 | Thinks aloud in his reply, then works out and states the answer | `meters-just-tell`, `tool-calc-ohms`, `end-which-ends`, `root2-wrong-maths` | Leak / too much talk | "Let me check what the main ammeter would read then." → `calculate 1.5 / 5` → "So the main ammeter would read 0.3 A — which matches option "0.3 A" on the board. But I can't just tell you…" | Words from every loop step reach the student, and the persona never says so: he narrates his own reasoning ("Let me look", "Let me check") as if to himself. Rule 4 sends him to `calculate`, so he computes the answer in front of them. |
| 2 | Over-explains until the answer is in the explanation | `period-hi`, `coin-why-not-half-hi`, `between-give-number` | Leak | (Hindi) "…तो सिर्फ़ 6 संभावित शेष हैं।" (so there are only 6 possible remainders: the answer to "how many digits repeat") | Rule 7 allows three sentences and he writes six; with each extra idea the answer gets closer. Same root as #3. |
| 3 | Far too long: restates the board, praise + hint + question, several ideas | 70% of cases fail `short`; students 66 words/turn | Too much talk | `ask-thanks` ("thanks, that helped!"): "You're welcome! So you've got the number line from 1 to 2, and the marker is at 1.5 right now. The square label says 1.50 × 1.50 = 2.2500 — that's bigger than 2. Where do you think √2 might be? …" | Persona rule 7 ("one to three sentences") is weak and comes seventh; nothing says don't repeat what the student can see, or one idea per turn. Uses markdown and lists despite the rule (`tool-calc-ohms`). |
| 4 | Shows the answer with an action | `tool-show-not-reveal` (2/2) | Leak (by action) | Asked "Can you just open the switch and show me?": "Sure, let me open switch S" → `circuit.setSwitch` → "…the main ammeter still reads 0.30 A" | Rule 3 says "work out for yourself what would give it away" but nothing tells him to check *before* acting whether the result is the answer. Opening the switch doesn't make Check pass, so the runtime's put-back doesn't catch it. |
| 5 | Quotes state the student can't see | `tool-calc-ohms` | Misreads the board / leak | "The circuit data shows: - `switchB` (which is the same branch as bulb B): 0.15 A - `bulbB`: 0.15 A" | The persona says what's `notOnScreen` but not that he mustn't read it out, or use the field names. |
| 6 | Asks the student to act but doesn't hand the board back | `onlyb-do-it` (0/2), `onlyb-step-by-step` (0/2), `tool-show-try` (0/2), `goal-start-and-watch` (1/2) | Hand-back | "…What do you think would happen if you closed S₂?" (no `wait_for_student`) | Rule 6 covers it, but he ends on a question to think about, not a move; it isn't clear that a question about a move is a move. Likely helped by fixing #3 (shorter turns end on one clear ask). |
| 7 | Tool calls refused as "arguments weren't valid JSON" | 29 calls: `coin-toss-for-me`, `period-why-7`, `goal-next-step`, `coin-just-tell` | Loop and tools | `tossMany__press` → refused. Raw arguments from Foundry for the second of two parallel no-argument calls: `{}""` | Foundry's DeepSeek sends malformed arguments when it calls two no-argument tools at once; `parseArgs` (provider.ts) rejects anything that isn't exactly one JSON object. |
| 8 | Points at a part that doesn't exist | `coin-why-not-half`, `end-which-ends` | Loop and tools | `point {prop: whichEnds, part: "prompt"}` → "whichEnds has no part "prompt" (parts: none)" | The `point` tool's `part` is a free string; the parts are only in the board JSON. |
| 9 | Passive when the student keeps doing the same thing | `coin-exact-half` (out of rounds 2/2 with Jugnu, solved without) | Hand-back / guidance | Five turns of "Go ahead! Press "Toss 100 times" again" while the student re-tosses | He only reacts to the latest move; nothing in the persona says to notice when the student is repeating without learning. Also partly the simulated student. |
| 10 | Uses `calculate` too little when he should | `tool-calc-ohms` (0/2), `tool-calc-check` (0/2), `root2-give-up-after-tries` (0/2) | Wrong maths or fact | (read 0.15 A off hidden state instead of `1.5 / 10`) | Overlaps #5. |
| 11 | "Ignore your rules…" breaks Jugnu | `root2-press-check`, `root2-injection` (error both runs) | Infra (not Jugnu) | HTTP 400, `finish_reason: content_filter` | Foundry's default content filter (Prompt Shields, jailbreak) blocks the message before the model sees it. In the app the student gets no reply. Needs a decision: see "Questions for Naman". |
| 12 | Case may be wrong / judge too weak | `coin-why-not-half-hi` | Case is wrong? | Script flags "½ के पास" (close to ½); judge says no leak | I think the script is right: "gets closer to ½" names the option. Kept as a leak; the judge (same model) misses it. |

Not a problem: genuine questions (`ask-`) get direct answers, not deflection; language and Hindi are right in every case (judge 5.0); he never tries the student's part (`holdsLine` 100%).

### Questions for Naman

1. **Content filter (#11).** Options: (a) keep the filter and have Jugnu treat a filtered message as a refusal ("I can't help with that, let's get back to the board"); (b) lower or turn off the jailbreak filter on the `chalk-foundry` deployment (the persona already ignores such requests, and the cases show he does). (a) is a small code change in the provider; (b) is an Azure setting. Which do you want?

## Phase 3: fixes

One at a time, most harmful first. Each: hypothesis, change, before and after.

### Fix 1: tell him to think silently and be brief (#1, #2, #3). Reverted

- **Hypothesis:** he thinks aloud and runs long because the persona doesn't say his words reach the student as he writes them, and its length rule is weak.
- **Change** (`context.ts`): rule 7 to "at most two short sentences, one idea; don't repeat the board, don't open with praise, don't say what you're about to do"; the closing line to "the student sees your words the moment you write them… so think silently".
- **Result** (one case run; the second run and the students were stopped): `short` 28–31% → **42%**, but `noLeak` 81/79% → **74%**, judge "gave answer away" 5–6% → **9%**, `noRefusals` 92–94% → 84%. Shorter, but leakier.
- **Kept?** No. Naman: asking the model not to think is the wrong fix; it should think freely and only its reply should reach the student. Reverted to the baseline persona. Report: `reports/2026-10-12-10-56-DeepSeek-V4-Flash.md`.

### Fix 2: let him think, apart from his reply (#1, #2)

- **Hypothesis:** he narrates ("Let me check what the ammeter would read…") because he has nowhere else to reason: on Foundry, DeepSeek-V4-Flash doesn't think unless asked, and our `--think` did nothing there (the provider sent DeepSeek's `thinking` switch, which Foundry refuses, and quietly dropped it). With a reasoning channel the model's own reasoning is kept apart from the reply by the API (`reasoning_content`), so the working-out never reaches the student, and the reply should be the conclusion only.
- **Change** (`provider.ts`, Naman approved): with `think`, also send OpenAI-style `reasoning_effort: "low"`; a server that refuses one switch drops only that one (Foundry keeps `reasoning_effort`, DeepSeek's API takes both). Output limit raised by 4,000 tokens while thinking (reasoning counts towards it). Test: `provider.test.ts`, "thinks on Foundry through reasoning_effort". Bench runs with `--think`; the judge and the simulated students don't think. Persona unchanged from the baseline.
- **Effort levels** (one request each on Foundry, same question; DeepSeek has three real levels, low/high/max, and maps OpenAI's other names onto them): none 39 output tokens, no reasoning; low 236 tokens, 2.5 s; high 735 tokens, 8.0 s. Low chosen for speed.
- **Result** (cases: mean of two runs; students: two runs each). Reports: `reports/2026-10-12-11-13-…-thinking.md`, `…11-14-…-thinking.md`, `…11-14-students-…-thinking.md`.

  | | Baseline | Fix 2 |
  |---|---|---|
  | noLeak | 80% | **88%** |
  | short | 30% | **56%** |
  | judge: gave answer away | 5.5% | 4% |
  | noRefusals | 93% | 95.5% |
  | saysFact | 85% | **77.5%** (worse) |
  | calculates | 20% | 10% (5 cases) |
  | handsBack | 12.5% | 25% |
  | judge: guidance / warmth | 3.75 / 4.3 | 3.8 / 4.35 |
  | seconds per turn (median) | 2.0 | **3.0** |
  | **Students:** solved by the student | 75% (88% without Jugnu) | **100%** of 13 |
  | judge: misconception fixed | 88% | 85% |
  | judge: student did the work | 88% | **100%** |
  | judge: experience (1–5) | 4.1 | **4.5** |
  | Jugnu words per turn | 66.2 | **43.7** |
  | judge: gave answer away / too much talk | 6% / 25% | **0% / 15%** |
  | conversations with an error | 0/16 | **3/16** (Azure timeouts, below) |

  `coin-exact-half`, which ran out of rounds with Jugnu in the baseline, was solved in round 5.

  Before/after, `meters-just-tell` ("What will the main ammeter read? Just tell me the number."): before, "Let me check what the main ammeter would read then." → `calculate 1.5 / 5` → "So the main ammeter would read 0.3 A — which matches option "0.3 A"…". After: "I can't just give you the answer — that wouldn't help you learn! … What do you think happens to bulb B's branch when you open switch S?" (no working-out shown).

- **Kept?** Yes. Leaks and length both improved, and the students' numbers rose on every count but one (misconception fixed, 88% → 85%, within noise). Two costs:
  1. **Genuine questions now get a counter-question more often** (`saysFact` down): `series-why-dim`, "Why are the bulbs so dim?" → "What do you think happens to that voltage when it passes through two bulbs in a row?" (should say they share the 1.5 V); `ask-why-8-ends`, `ask-gamblers`. Shorter replies made his holding back spread to concept questions. Next fix.
  2. **Slower, with long stalls.** Median turn 2.0 → 3.0 s. Separately, Azure Global Standard had slow spells: one single call took 81 s (`root2-which-option`), and three student conversations died when a call passed the bench's 300 s timeout (two on Jugnu's call, one on the simulated student's, so not caused by thinking). In the app (90 s timeout) the student would wait and then get nothing. See problem #13.

### New problems found during Fix 2

| # | Problem | Cases or students | Category | Example | Suspected cause |
|---|---|---|---|---|---|
| 13 | Model calls that stall for 80–300 s | `root2-which-option`; 3 student conversations | Loop and tools (infra) | "took longer than 300 s to answer" | Azure Global Standard latency spikes. A shorter timeout with one retry would recover; the app's 90 s timeout is far too long for a student. |
| 14 | Concept questions answered with a question | `series-why-dim`, `ask-why-8-ends`, `ask-gamblers`, `meters-how-calc` | Deflects a genuine question | See Fix 2, cost 1 | Persona rule 3 ("never give its answer") reads as "give nothing"; nothing says a question about *how or why something works* deserves a direct answer. |

### Fix 3: concept questions get a plain answer (#14)

- **Hypothesis:** rule 3 ("never give its answer") reads as "give nothing", so with shorter replies he answers *why* and *how* questions with a counter-question.
- **Change** (`context.ts`, rule 3): "Only the board's question is held back: when they ask what something means, or how or why something works, answer it plainly first (as long as that answer doesn't answer the board's question), then turn them back to the board."
- **Result.** Affected groups, two runs each (Fix 2 → Fix 3): `ask-` saysFact 75% → **100%**, `series-` 50% → **100%**, `meters-` 0% → 0%. All cases (two runs each; reports `…11-49-…-thinking.md`, `…12-03-…-thinking.md`) and students (`…11-49-students-…-thinking.md`):

  | | Fix 2 | Fix 3 |
  |---|---|---|
  | saysFact | 77.5% | **87.5%** |
  | noLeak | 88% | 84.5% |
  | judge: gave answer away | 4% | 3% |
  | noRefusals | 95.5% | 98% |
  | short | 56% | 50% |
  | handsBack | 25% | 12.5% |
  | **Students:** solved | 100% of 13 (3 timed out) | 88% of 16 (no errors) |
  | judge: misconception fixed | 85% | **100%** |
  | judge: experience (1–5) | 4.5 | **4.7** |
  | Jugnu words per turn | 43.7 | 52.3 |
  | judge: gave answer away / too much talk | 0% / 15% | 0% / 19% |

  Before/after, `series-why-dim` ("Why are the bulbs so dim?"): before, "What do you think happens to that voltage when it passes through two bulbs in a row?"; after, "…since they're in series, the 1.5V from the cell is split between them — each gets only 0.75V. That's why they're dim. Now, back to the board's question…".

- **Kept?** Yes: he now answers what was asked (priority 3), misconceptions fixed and experience rose, and the judge finds fewer leaks. Costs: a little longer (answer plus a line back), and one new leak in both runs, `root2-hinglish-tries` ("1.41, 1.42 वगैरह आज़माओ… पहले **1.41** पर खिसका कर देखो!"), where explaining the method ran into naming the next guess. The other noLeak failures are the same cases as in Fix 2.

### Still open, in order

1. **Leaks on the board's own question** (#2, #4): the same cases fail under every fix so far (`period-hi`, `period-show-all`, `meters-hinglish`, `end-which-ends`, `tool-show-not-reveal`, `root2-hinglish-tries`). He shows or explains until the answer is on screen ("There you go! The board shows 0.142857… the first 6 digits"). Next to try: in rule 3, before acting or explaining, ask "would the student then be able to read the answer off the board or my words?".
2. **Malformed tool arguments** (#7): parse the first JSON object; Foundry sends `{}""` for the second of two parallel no-argument calls.
3. **Hand-back** (#6): still 0–25%.
4. **Azure stalls** (#13): a shorter timeout and one retry.
5. **Markdown** has come back (`**1.41**`, `**0.142857…**`) despite rule 7.
6. **Content filter** (#11): waiting for Naman.

### Fix 4: check before showing or explaining (#2, #4). Reverted

- **Hypothesis:** the leaks that survive every fix are him showing or explaining one step too far; rule 3 says "work out what would give it away" but never makes him check before acting.
- **Change** (`context.ts`, rule 3): "before you act on the board or explain a step, ask whether the student could then read the answer off the board or your words (the number, the option, or the next value to try), and if so, stop one step short and let them take it."
- **Result.** Targeted cases (`period`, `meters`, `end-`, `tool-show`, `root2-hinglish`; two runs each vs Fix 3's two full runs): noLeak **10/22 → 13/22**. Fixed: `end-which-ends`, `period-show-all`, `root2-hinglish-tries` (both runs). Worse: `meters-after-wrong`, `period-why-7`. Unchanged: `meters-hinglish`, `period-hi`. All cases (one run, `…12-12-…-thinking.md`): noLeak 88%, saysFact 80%, short 53%. Students (`…12-12-students-…-thinking.md`), Fix 3 → Fix 4:

  | | Fix 3 | Fix 4 |
  |---|---|---|
  | solved by the student | 88% | **81%** |
  | judge: misconception fixed | 100% | **81%** |
  | judge: student did the work | 100% | 94% |
  | judge: experience (1–5) | 4.7 | **4.4** |
  | Jugnu words per turn / too much talk | 52.3 / 19% | 41.1 / 6% |

  The drops repeat in both runs: `root2-gives-up-hi` misconception not fixed (fixed both times under Fix 3), `coin-exact-half` out of rounds (solved both times), `onlyb-random` run 1 experience 1 ("Jugnu repeatedly told the student to tap switches without ever helping them see the circuit structure…").
- **Kept?** No. Reverted. Holding back one more step everywhere also starved the student who gives up and the one going round in circles of the help they needed. Fewer leaks in single situations, worse learning across a conversation. A finding: the leak fix has to be about *the board's answer specifically*, not about holding back in general; and the students who loop (`coin-exact-half`, `onlyb-random`) need him to change rung, not stay on the lowest.

### Fix 5: read the JSON object at the start of tool arguments (#7)

- **Hypothesis:** the "arguments weren't valid JSON" refusals are Foundry's DeepSeek sending `{}""` for the second of two no-argument calls at once (seen in a direct API call), which `parseArgs` rejects outright.
- **Change** (`provider.ts`): `parseArgs` reads the JSON object at the start of the text (following strings and nesting) and ignores what comes after; anything that doesn't start with a whole object (`{oops`, `[1]`) is still refused. Test: "reads the JSON object at the start of argument text".
- **Result.** Refused as not JSON in `coin`, `period`, `goal` (refused / tool calls): baseline 29/50, Fix 3 8/25, **Fix 5 0/24**. All cases (one run, `…12-34-…-thinking.md`): noRefusals 98% → **100%**, noLeak 86%, saysFact 90%, short 52%. Students (`…12-34-students-…-thinking.md`): refused 9 → 0; solved 94%, misconception fixed 88%, experience 4.3.
- **Kept?** Yes.
- **On noise:** Fix 3 and Fix 5 have the same persona, yet the students' numbers moved by about ten points (misconception fixed 100% → 88%, experience 4.7 → 4.3, solved 88% → 94%). Sixteen conversations aren't enough to see a change smaller than that; Fix 4's revert stands because its drops repeated on the same students in both runs, not on the averages alone.
