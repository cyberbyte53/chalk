# Jugnu's chat: what the student sees

Status: proposed (2026-11-04), reviewed once and revised. Builds on jugnu-sandbox.md and jugnu-timeline.md.

## The need

The student-facing chat doesn't exist in the event-model app (the old one went with the old
system; only its texts are left in ui-text.ts). The run page's bubble is a stand-in. A run should be
seen as the student saw it, and the phone should get the same thing: one chat, built once.

## From first principles

The chat helps a stuck student while the board stays what they learn on. Most useful answers are the
student doing something on the board, so the chat is a thin layer of conversation over a live board.

1. **The board stays visible and live**; the chat never covers what is talked about. When Jugnu
   glows a part, it is scrolled into view above the chat.
2. **One message in front**: Jugnu's latest, short, his figure once at the top. Earlier messages are
   a swipe up.
3. **The student answers by words or by the board.** Words: typed, or a tap on one of Jugnu's
   choices when he offers them ("which of these is true?"). The board: what they do on it is part of
   their answer, shown in the chat compactly ("you pressed ← three times").
4. **While they act on the board, the chat shrinks to one line** (Jugnu's question); a tap opens it.
5. **Their turn ends when they send words, tap a choice, or tap Done** (after acting on the board).
   Then: "Jugnu is thinking…".
6. **The bottom bar stays below everything**: Check and Try again always reachable.
7. **Opening and closing**: from "Not quite" → Get help (asks "Why is it wrong?" for them), or Ask
   Jugnu any time; closed by the student, or by Jugnu's hand-back ("you've got it: try the next one").
8. **Never shown to the student**: Jugnu's note, his thinking, his tries.

## Choices in his reply

`reply` gains an optional `choices` (two to four short options). The tool has one version and gets
better in place; when to offer choices is the prompt's business (a new prompt version). The earlier
evidence stays in view: choices that spell out the student's hidden belief made his diagnosis
unreadable, so the judge marks a choice that does.

## In the preview: the student's screen, and what went into Jugnu

The run page shows the run **through this chat**, read-only, at the moment picked on the timeline:
the phone as the student saw it. Beside it, **behind the scenes**, for us only: at that moment, what
Jugnu was given, his thinking, his tries, his note; and his note over the whole run, turn by turn, in
one column (how his understanding of the student evolved). The story line and timeline stay above.

## One component

The chat is part of the player (`@chalk/player`): the phone uses it live; the run page renders it
from a run's events at a moment. It takes the conversation so far (Jugnu's messages with their glow
and choices, the student's words and acts) and, live, callbacks for sending; read-only, none.

## Not now

The phone's live connection to the server (its own plan); voice; Hindi text (the component takes the
locale already in ui-text.ts).

## Reviewed (4 Nov): what changed

- **The chat is worked out from events alone** (a phone has no side table). A new kind, `chat`,
  recorded as the student's when it happens: `{what: "opened", reason: "getHelp" | "ask"}`,
  `{what: "said", text, via: "typed" | "choice" | "done"}`, `{what: "closed", by: "student" |
  "handBack"}`. The `jugnu` event gains two optional fields, `choices` and `isHandBack`. What the
  student did on the board since their last words ("you pressed ← three times") is worked out from
  the `cause` events, not stored. The sandbox's extras for the student hang on their `said` event.
- **Choices are a field of their own** (`choices`, two to four), on `reply` and on the event; a
  tapped choice must be one offered. Besides a choice spelling out the belief, the judge marks one
  that gives the answer away.
- **The chat lives inside the bottom bar**, not over the board: the board already keeps a part in
  view above the bar (`inSight`), so a glowed part stays seen; it is also run when the glow changes,
  and a tall part is scrolled to its top. The one-line state is the bar's own row (Jugnu's question
  … Done): no extra height. The open chat holds one message with its choices or the text box; while
  typing, the keyboard may cover the board. Earlier messages: a tap, not a swipe.
- **Pressing Check while the chat is open doesn't end the student's turn** (words, a choice or Done
  do); the check is recorded as always.
- **One model of the conversation:** `chatOf(events)` in @chalk/player, beside replay, gives the
  messages and the chat's state (closed, open, one line, thinking, handed back); the phone and the
  run page both use it. `JugnuChat` (read-only without callbacks) is drawn by BoardPlayer in its
  footer through one new prop. The behind-the-scenes column stays in the app.
- **Typed words are minors' typed text** (docs/events.md: its retention rule applies).

## Built in steps (each with its check)

1. The `chat` kind and `jugnu`'s `choices` and `isHandBack`; the sandbox records them; `chatOf`.
   Check: `chatOf(events)` gives the same conversation as the run's turns.
2. Choices on `reply`; the simulated student picks one; recorded `via: "choice"`. Check: a run
   where Jugnu offers choices shows the one picked.
3. `JugnuChat` in the player's footer, its states. Check: each state drawn from one run.
4. The run page through the chat, with behind the scenes. Check: the person follows a run as the
   student saw it, and sees why Jugnu said what he said.
