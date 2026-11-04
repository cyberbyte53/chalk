# Jugnu as an agent: what he is given, and how we find out

Status: steps 1 and 2 of the loop built (2026-11-04); step 3 and DeepSeek next. Builds on jugnu.md (the minimum) and
jugnu-parts.md (what he sees and points at, built).

## Where we are

Jugnu talks with a simulated child (dialogue.ts) on one real board: case `plot-swapped`, child
`up-first` (believes the first number of a pair is how far up or down). Every run is kept and read
turn by turn in `?dev&jugnu`. Six saved runs (and one rebuilt from a log) show:

- he repeats the rule instead of changing what he does (every run since 15-00);
- he gives the answer away, plainly ("2 left, then 4 up") or softly ("this time go along first");
- a right dot after he dictates it is not understanding (the "correct answer trap");
- tests on her own board ((2, 0), (3, 1)) show her belief better than any question;
- he almost never checks what he says (`try` once in six runs) and told her "press Try again to
  check it" (Try again only clears the mark);
- his choices spell out her hidden belief, and she is told to pick by their words: "he finds her
  belief in one question" is partly that;
- the child drifts from her belief ("my book says") even when told not to;
- the same setup succeeded once (17-12) and failed once (15-00): one run proves little.

## An agent is six things

| | Now | Give him | Why |
|---|---|---|---|
| **Goal** | none stated; the run ends at her right Check | done when she **does a new question of the same kind alone**, right | correct-answer trap (17-40); Eedi/UCL 2026 |
| **Perceives** | her board as data, her steps, her words; her check's note (already: it names the likely mistake) | the buttons in her bar **with what each does** (Try again clears the mark; Check checks) | "press Try again to check it" (17-40) |
| **Knows** | the lesson as taught | enough for now | — |
| **Remembers** | the whole transcript, but not his own diagnosis (made each turn, then dropped) | **his diagnosis given back** each turn | the cheapest working memory: it is already made |
| **Does** | words, one glow, `try`, tests on her board | a rule for when a move didn't change what she does: **change the move**; later `show` | repetition in every run |
| **Judged by** | reading runs | the checklist below | BEA 2025 tutor task |

## The conditions (fixed in every run from now)

1. **The child is per child.** Her background ("what you know as a class 9 student") moves into her
   entry in jugnu-cases.yaml, beside her belief, so `axes-mixed` and `minus-is-down` aren't told the
   very thing they get wrong. The shared instructions keep only how a child behaves.
2. **She sees what she would see:** his glow ("Jugnu lights up: the x-axis") is in her turn.
3. **The conversation ends as a child's does:** her Check is right, or she leaves (a `leaves` field
   in her reply; her patience is hers, and is measured). A guard of 20 turns stops only a broken run.
4. **Transfer:** once her Check is right, she gets a new question of the same kind (the case's
   `next` board, e.g. plot-the-point (1, 2)) and does it **alone**, Jugnu not there. Right or wrong
   is the run's real result.
5. **Each run keeps everything it ran on:** both instructions, and the lesson text.
6. **Her board as on her phone.** In practice a wrong check shows only "Not quite." (never its
   note: answer-feedback.tsx). Until now both sides were handed the note (the board was played
   without a mode): the child read the rule from turn 0, and Jugnu was told it was on her screen.
   Now she sees "Not quite."; Jugnu is told separately what the check found, as a first guess.
7. **Three runs per setup**, read side by side; a conclusion needs it in most of them, said as such.
   (Three runs: about 3 minutes and a few cents.)

Known limit, kept in mind when reading: the child's act tool takes the point's numbers, where a
real child drags; entering (x, y) may itself remind her of the order.

## The tutoring habits we want (from our teardown, 23 Oct: research/brilliant-session-teardown.md)

Opens with a question she answers in a few characters, never an explanation; asks how she got it
before teaching ("How did you figure out where to place it?"); makes the board's question smaller
and checkable; builds up from small cases; has her check her own words against her rule instead of
saying "wrong"; sends a guess back to the evidence; one question a message, about 15 to 30 words;
glows what he mentions; ends with a concrete hand-back ("tap Check") and goes quiet; gives the last
step only after she has found the rule. Free typing, no reply chips. Practice and the skill check
apart: the check has no tutor (our transfer question).

## The checklist (each run)

Did he find her belief (his diagnosis against hers), without choices that name it? Was each message one question, about 15 to 30 words, ending in something for her to do? Did he give the
answer (where a dot goes, how to walk to it)? Did she do every step herself? Did he use what her
board showed? Did he repeat a move that had failed? Is everything he says about the board true? Does
the glow name what he talks about? Did she get the transfer question right alone, or leave? And the
child: did she act by her one belief, and only it? A run where she didn't is not counted.

## Amendment (3 Nov, after change 1): generic, and held out

**What went wrong.** Tuning on one case put the case into his instructions: "your dot", "(2, 0),
then (0, 2), then (3, 1)", "2 left, then 4 up", and next was to be "x first, then y". The person:
"this is hardcoding … we are making a generic product". A tutor tuned on one case learns the case.

**The rule.** His instructions hold only how to teach, true for any board. Everything about a topic
comes from data he is already given: the lesson as taught, what her board's check found, her board's
parts. Before any change: is it true for every board?

**The guard.** A held-out case, never tuned on, run with the same instructions: `bus-wrong-side`
(take the bus to stop −3; she went to +3). A different prop (a road and its stops), a different
action (a step), and a different kind of mistake: an idea, not a convention. Child `minus-same-way`:
"a minus sign doesn't change which way you go: −3 means 3 stops, the same way as 3"; she knows the
bus starts at the stand, 0, and goes one stop at a time, left or right. Her next question alone:
stop −5 (84ee6db6). A change that helps one case and hurts the other was overfitting.

**Reviewed (3 Nov): what the review changed.**

- The draft was still false on some boards: on a choice question Try again also clears her pick,
  a choice board has no "smaller case" to do on it, a lesson page has Continue and no retry, and
  "her question" assumes one. So: no sentence about what buttons do; "never name a button that isn't
  in her bar"; a smaller case on her board, or in words when her board can't show it.
- "Recalling the lesson is fine" was the loophole for the repetition (the lesson's P (3, 5),
  ~14 times a run): the lesson is recalled once, then only if she asks.
- She asked "why" and got the rule back: when she asks something, he answers it first.
- Lines a small model ignores (never repeat, 15–30 words, check with try) are **measured** by the
  code on every run (his words per message, how much of a message he has said before, his tries), so
  the page shows them; enforcing them is a later change, if measuring shows it is needed.
- The held-out child's belief must survive the road's printed numbers (−3 is written left of 0):
  her belief says she counts stops and doesn't read the signs as directions. Which side minus goes
  is itself an agreed way, so the bus case also tests "say the agreed way once": noted, not hidden.
- The child's shared instructions lose their last topic and app-specific words ("maths", "a new
  point", the `ask` step names: she reads her bar like he does); her class comes from the case's
  book, not the instructions.

**Method: v0, then one habit at a time.** A bundle can't be traced to any one line. So:

- **v0** = today's instructions with only the case words made generic (no new habit). Three runs on
  each case: the baseline for everything after.
- Then the tutoring habits, **one at a time**, each three runs on both cases (the list below).

## Jugnu's loop, from first principles (4 Nov)

**Why.** Understanding a learner accumulates: he starts knowing nothing about her, and each answer,
move and test adds to it. Today each turn is rebuilt from scratch (her board, her steps, a transcript
of words only): his own thinking, his tries and what they showed, and his notes are thrown away, so
from his side every turn is a new tutor reading a log. The runs show what that costs: he repeats
himself, his diagnosis drifts (right at turn 2, wandering by turn 8), he re-checks what he checked.
And he has no action for the one thing he does most, talking to her: in replays (Sonnet, the looping
bus turn, every effort) each loop of empty `try` calls began right after "I'll make it speak and set
the glow": the only tool he had was `try`.

**An agent is what it senses and what it does.**

- **Does, toward her: `reply`.** One message, as it arrives on her phone: his words; the one part
  that lights up; his private note (what he believes about her now, kept for him, never shown); and whether he
  hands back (he thinks she has it: "try the next one"). Calling it is speaking: his turn ends there.
- **Does, toward himself: `try`.** Stateless (each try a new copy of her board; built 4 Nov).
- **Senses:** at the start, her board in full, her steps, what her check found, her question. After
  each of his replies, her answer arrives as that reply's result: her words, what she did on her
  board, what it changed, and where her board now stands.

**One conversation per time she is stuck.** Append only: earlier turns are never rewritten (that
breaks caching, and a provider may refuse earlier thinking that was changed: the adapter's concern). System (instructions
and lesson) and tools frozen; one model for the whole conversation.

**The loop.** Request with the whole conversation; he may `try` (results go back as tool results,
our loop); when he calls `reply`, we stop, show it to her, and wait. Her turn comes back
as the `reply`'s tool result. Guard: a few dozen requests a turn, a guard against breakage only.

**The model layer: ours, and swappable (the person, 4 Nov: nothing may depend on one provider).**
Two layers. **Ours:** the conversation in our own format (messages of text, tool calls, tool
results), our own loop (ask the model; run any `try`; stop at `reply`; wait for her; saved after
every request, so a run can be watched live), our tools, instructions and lesson. Nothing here names
a provider. **An adapter per provider:** sends our conversation to its model and turns the answer
back into our format. Everything provider-specific lives only there: message format, caching,
thinking and effort settings, and any earlier thinking it must pass back (kept as an opaque
attachment only that adapter reads; one model for a whole conversation). Swapping a
model is choosing an adapter. The first adapter: Anthropic (Haiku and Sonnet 5.5). The provider
SDK's own tool runner is not used.

**Caching**, the principle every provider rewards: append only behind a fixed start. Each adapter
caches its own way; Anthropic's at its default (5 minutes): a breakpoint on the lesson and automatic
caching of the growing conversation; every run records cache reads and writes, to see it
work. A longer cache (1 hour) only if real use shows long pauses: decided later.

**Growth.** Twenty turns of compact inputs fit easily. Clearing old tool results (an adapter capability)
only if a real conversation shows it is needed.

**Not now.** Compaction; a `reply` tool for the child (she hasn't looped); her history from other boards.

**Reviewed (4 Nov): what the review changed.**

- **Hand-back is what ends his part.** Her right Check is one more turn of hers, sent to him as his
  reply's result, not the end. Only his hand-back ("I think you have it: try the next one") starts the
  next question alone. Otherwise the correct-answer trap stays (18-42: right Check, wrong transfer).
- **`reply` is: says, glow, note (required: what he believes about her now), hand-back.** Quick
  replies are left out of the first build: the plan's own evidence is against them (his choices spelled
  out her hidden belief; her belief came out in her words in every run without them). The person
  wants to try them: a later change of its own, read against that evidence.
- **Our loop answers every tool call.** If a response has `reply` and `try` together, the tries are
  run and answered, and her turn is the reply's result; a second `reply` is answered "one reply a
  turn"; plain words with no `reply` are taken as his message. (Provider-neutral: no reliance on a
  provider's "one tool at a time" switch.)
- **One `try` for the whole conversation**, reading her board as it is when called (tools are frozen).
- **Her turn, as his reply's result:** her words, what she did, what it changed, where her board
  stands, and what her check found if she checked.
- **His instructions are rewritten for this shape:** no "answer as JSON", no "her board is in your
  message" once her turn carries the changes; he speaks to her as "you" (he said "Her check marked it
  wrong" to her, 04-03-06).
- **The child stays as she is** (rebuilt each turn, a fixed instrument); her view is built from his
  `says` and what his glow shows. Her drift is a separate cause this doesn't touch.
- **Usage counts cached and uncached input apart**, so caching is seen working.
- **What will persist:** repetition on Haiku may remain (memory doesn't stop a habit); misread moves
  until step 3.

**Reviewed again (4 Nov): the model layer, exactly.**

- **Our conversation:** `system` (instructions, lesson) and `tools`, frozen; `messages`: hers are
  text or tool results `{id, content, isError?}`, his are text or tool calls `{id, name, input}`;
  each of his carries `opaque: {adapter, model, raw}`, the provider's whole answer kept verbatim
  (thinking, its position and signature, every byte of tool input). The adapter sends `raw` back as
  it is for the same adapter and model; otherwise it renders the neutral parts. Tool-call ids are
  the provider's (results must match them).
- **The adapter is one function:** `send(conversation) → {message, usage {input, cacheRead,
  cacheWrite, output}, stop: "tool" | "end" | "cut"}`. Thinking and effort are its config, fixed
  for a conversation. (Built on the AI SDK: see below.)
- **Our loop's rules:** all of a response's calls are answered in one message right after it; `reply`
  and `try` together: tries run, her turn is the reply's result; a second `reply`: "one reply a turn";
  plain words with no `reply`: they are his message, hand-back false, her turn comes as a plain
  message; a call cut off by the length limit is answered "cut off: say it again"; the requests guard
  ends the whole run, marked broken.
- **Render once:** every string sent (the lesson, each try's result, each turn of hers) is made once
  and stored; never rebuilt from the board. Tools in a fixed order. A run resumed from its saved file,
  never re-derived. That keeps the prefix byte-for-byte the same, which caching needs.
- **Proven swappable only by a second adapter:** DeepSeek (the person's choice, 4 Nov; key
  `DEEPSEEK_API_KEY` in `.env`), its current API read from its docs when built, run on the same replay.

**The model layer is the AI SDK's; the loop is ours (4 Nov, after looking at how agents are built).**
Anthropic's guidance (simple composable patterns, not heavy frameworks; tools matter more than
prompts) and "12-factor agents" (own your control flow, own your context window, contact humans with
tool calls) point the same way. Full frameworks (Mastra, LangGraph) would own the loop and the context,
the two things we must own. The Vercel AI SDK (Apache 2.0) is at its core a model layer: one neutral
message format, a provider package per provider (`@ai-sdk/anthropic`, `@ai-sdk/deepseek`), tools
defined once, provider settings passed through (`providerOptions`: Anthropic's caching and thinking).
So: **the adapters and message format are the AI SDK's; our loop, context and tools stay ours.** We
call it one request at a time (no automatic tool loop of its; at most `hasToolCall('reply')` as the
stop), answer tools ourselves, save after every request. One pinned version. Verified in step 1's test,
not assumed: Sonnet's thinking round-trips unchanged through its messages; DeepSeek takes tools with
its reasoning; our cache breakpoint passes through and cache reads appear.

**Reviewed (4 Nov, against ai 7.0.147, @ai-sdk/anthropic 4.0.84, @ai-sdk/deepseek 3.0.69):** the
conversation is the SDK's message list (its messages carry Anthropic's thinking signatures and
DeepSeek's reasoning back unchanged), so our own `opaque/raw` copy is dropped. From each response we
keep only his message and build the tool results ourselves (the SDK would answer a broken or cut-off
call itself, against "we answer every call"); a cut-off response (`finishReason` "length") is
answered "cut off: say it again". One request per call (`generateText` stops after one step; tools
without `execute` come back to us); retries off, so the guard counts every request. Usage: uncached,
cache-read and cache-write tokens (DeepSeek reports no writes: unknown, not 0). Thinking settings:
Anthropic adaptive thinking with an effort; DeepSeek's reasoning effort. Warnings are recorded (a
thinking block that can't be sent back is dropped with only a warning).

**Found while building step 1 (4 Nov): why Sonnet looped on empty tries.** Bisected one variable
at a time on the looping bus turn. Not the cause: the SDK's server-side threads, cache markers, the
output limit, the API version, the answer line's wording, `reply` (0 empty tries with it and
without it, on the new loop). The cause: how `try`'s inputs were declared. The old harness sent an
open schema and no strict tool-input mode: 9 of 9 replays looped. A closed schema plus Anthropic's
structured-outputs mode (what the AI SDK sends by default): 0 of 3 on the old harness, 0 of 14 on
the new loop; each half alone helped partly (n = 3, not separable). Why the open form loops happens
inside the provider and isn't visible to us; the new stack doesn't produce it.

**Step 2, read (4 Nov; Haiku and Sonnet, both cases):** his notes build on each other and he uses
earlier evidence ("in (3, 0) you sent the first number across; in (−2, 4) up: do those match?");
repetition mostly gone; cache reads grow with the conversation (about 2 new tokens a turn). Sonnet
hands back only once she corrects herself (her next one alone: right); Haiku hands back at her
first right Check (alone: wrong). Neither used `try`. Haiku still reads her board for her.

**Built in steps, each read for why it worked or didn't:**
1. Our loop and the Anthropic adapter, then `reply` (says, glow, note, hand-back), the turn's end.
   Test: the looping bus turn's saved input, through the new loop, about 5 times with `reply` and
   5 times without (both through the new adapter, so `reply` is the only difference): count the
   empty tries.
2. One conversation (append only, cached; her turn still carries her whole board until step 3).
   Test: both cases, Haiku and Sonnet: does he keep his diagnosis, stop repeating, and do cache
   reads appear?
3. Her turn as what she did and what changed, with where her board stands, instead of the whole board
   again. Test: does he still misread her moves?

## The changes, in order (each: three runs on both cases, then read)

0. **v0**: the conditions, and his instructions made generic (case words out), as above.
1. **Answer her first:** when she asks something, he answers it first, in one sentence.
2. **The lesson once:** recalled once, then only if she asks.
3. **Her words against her board:** when they disagree, she looks at one against the other.
4. **Make it smaller:** a simpler case on her board (or in words), building up to hers.
5. **The agreed way, said once:** a mistake about how something is written or named is said plainly
   to be the agreed way, once, then she uses it.
6. **Concise:** one question or one thing to do, about 15–30 words, ending with what she does next.
7. **What changed since his last message**, given to him (most of his false claims misread a move).
8. **Enforced**, only if measuring shows they're ignored: length and repetition sent back once.
9. **`show`** (its own plan first).

(Done before v0, on the case-bound instructions, so kept as evidence: no choices and "how did you
decide" (change 1): her belief comes out in her words in every run.)

## Not now

Her history from other boards; her moves as live events (`watch`); a picture of the board; Hindi;
other cases; a model checking the child (reading by hand first).

## What could go wrong

- Open questions get vague answers from a 14-year-old: her short answers are then the evidence.
- Transfer on one board is a thin measure: it is the first one, not the last.
- Three runs still vary: we say what we saw, not more.
