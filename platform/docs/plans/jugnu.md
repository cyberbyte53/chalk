# Jugnu, the tutor

Status: decided, rewritten to the minimum (2026-11-03). Designed afresh; nothing is ported.

## What he is

A stuck child calls Jugnu on a board. He looks at the board, what she did and what the lesson
taught, checks what would happen by trying it on a copy of the board, and replies with a nudge
in the lesson's words, maybe pointing at one part. That is all, until evidence asks for more.

## What a good reply is (the spec)

1. **True about the board**: what is on it, and what would happen if she did something.
2. **About her actual mistake**, not a general hint.
3. **In the lesson's terms**: its words, its examples.
4. **A nudge**: one step, which she then does herself.
5. **Short and quick.**

## The minimum that meets it

| | |
|---|---|
| **In** | the board's state (every prop's variables: a settled board is its variables), what she did on this board, and the lesson as its built boards teach it |
| **One tool** | `try`: plays steps (a tap, a drag, Check) on a copy of the board, built from its state on the server, and says what changed. From where she is, or from the start. As often as he likes |
| **Out** | his words, and optionally one part of the board to glow |

He runs on the server (the model's key stays there): the phone sends the board, its version, its
state, what she did and her question; it gets back his words and the part to glow. If the phone's
board version isn't the server's (just after a deploy), the phone reloads.

The lesson comes from the built boards only: each board's words, spoken lines, what its props
show at the start and once played, in order, in both languages (written by the build per
concept, from its witness play).

Model: Claude Haiku 5.5 at low effort, behind one setting. Asking: buttons ("Why is it wrong?",
"A hint"), hold a part to ask, and a box to type. Chats are kept, for us to analyse, apart from
the teacher view.

## Evidence first, tools second

1. **The test before the tutor**: about 20 stuck children on coordinate geometry (real wrong
   states, from the mistakes children make), generated, and read and approved by the person with
   the five points above.
2. **The minimum Jugnu**, run on them in Node with Haiku: no phone yet.
3. **Read every reply against the five points.** Each failure gets its cause. A new capability is
   added only to fix a failure seen there (candidates, none built until then: following up on
   what she does next; making a smaller board; looking up an earlier lesson).
4. **Then the phone and the server**: the button, hold, typing box, the glow; the turn on the
   server, streamed.

## What it stands on

- **Board snapshot and restore** (`@chalk/prop`): every prop's variables out, a board built back
  from them; tested so that, on every coordinate geometry board, restored equals original.
- **The lesson as taught**, in the build.
