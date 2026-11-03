# Jugnu, the tutor

Status: reviewed once; the person's changes folded in (2026-11-03). Designed afresh; nothing is ported.

## What he is, in four sentences

Jugnu is an agent the child calls on one board, who helps by **nudging**: a question that leads one
step on, in the lesson's own words, while pointing at the part he means. He sees everything about
the board (what the child sees, what they did, how it is solved) and what the lesson taught, read
from the built boards themselves, and he is trusted to use it well: nothing is hidden from him,
and nothing in code stops him; he works out the child's mistake himself.
His one door to the app is an **MCP server** for that board: he gets the board and the lesson with
the child's question, and has tools to try things on a copy, point at a part, and reply. Every turn
is recorded on the phone like any other act, so the learner pipeline sees his help and his chats
can be read back.

```
child asks ─► phone ─► server: the board rebuilt from the child's record (exact replay)
                                   │
                 Jugnu (model) ◄──► board MCP: given at the start: board · what they did ·
                                   │            how it's solved · lesson (cached)
                                   │            tools: try · point · say · lesson · props · make
phone ◄── his words (streamed) and pointers
  └─► records the turn (`jugnu` entry): the pipeline marks later tries "helped"
```

## The needs

1. A child stuck on a board gets a nudge, not the answer: a question, a "look here", a smaller
   case to try.
2. What he says is what the lesson taught: its words, its pictures, its examples, its order. A
   model knows maths already; what it doesn't know is *this* lesson.
3. He can point at a part of the board the child sees.
4. He is right about the board: what is on it, what the child did, what would happen if.
5. A reply comes quickly enough that a child keeps waiting (first words within about 2 s).
6. A teacher, the person, or a reviewer can read what he said, and judge whether he helped.

## Grounding: the built boards

The model's maths isn't the problem; staying inside the lesson is. The lesson is read from the
**built boards only**, never from planning files (they say what was planned, the boards what is
taught). Each built board already carries: its words (title, story, instructions, and what it
reveals later: definitions, "found" boxes), its spoken lines in English and Hindi, what each prop
shows (by `describeView`, at its start and once its witness has played it), how it is solved (the
witness), and its place among the concept's pages and questions. The build plays every board with
its witness already; it writes this per concept as it goes (`taught.json`). Nothing is written by
hand, and it stays true whenever a board changes.

His instructions: the lesson's words and examples first; point back to a page the child passed
("remember the bus at stop 3?"); a new example (or a board he makes) only when the lesson's own
won't do.

## Context, in three rings

Each turn asks: what does he need for this child, on this board, now?

1. **In his first message, changing each turn (a few hundred words)**: the board as the child sees
   it, what they did on it, how it is solved.
2. **In his first message, the same for every turn on the concept (a few thousand words,
   prompt-cached)**: the concept's boards as taught, in order.
3. **Behind tools, only when he reaches for them**: an earlier concept, the prop library, making a
   board.

Kept right by watching him: what he fetches on most turns moves into the first message; what sits
in the first message unused moves behind a tool. Each change is judged on the stuck-children set.

## The board MCP: his one door

**Why MCP, not plain tool calls**: one definition of what Jugnu can see and do, used by three
callers: the server's agent loop (in memory, no network), Claude Code in development (over HTTP:
"be Jugnu on this board"), and the evals. Changing a tool changes it for all three. It is separate
from the authoring MCP (`show`, `comment`…), which writes content and threads and which he never has.

**Given at the start of a turn** (one message, so no round trips; the lesson part is the same for
every turn on that concept and is prompt-cached):

| Part | What |
|---|---|
| board | each piece's `describeView` now: parts by name, words, values, what each part can do |
| what they did | their acts on this board and what each set off; their checks (chosen, right or wrong, nth try ever); earlier turns with him on it |
| how it's solved | the board's witness (the steps that pass it, from `build/witness/`) |
| lesson | the concept's boards as taught (above), in the child's language |

**Tools**:

| Tool | Does |
|---|---|
| `try` | plays steps on a **copy** (a second board replayed to the same point) and says what changed (`seenBetween` over two snapshots, as `show` reports it, without Chrome) |
| `point` | glows one part on the child's screen (by its name), with a few words beside it |
| `say` | his reply; its words stream to the phone as they come; ends the turn |
| `lesson` | an earlier concept as taught |
| `props` | the prop library as data: what each prop is for (its `describe`), its setup fields and their types, what it can do; the concept's own props first |
| `make` | a board from data: words and props with their setup, no rule code (props bring their own behaviour). Checked against each prop's types, drawn, and described back (or what is wrong, to fix); then shown to the child in his sheet, where `point` and `try` work on it |

In development the same server adds `open` (a board, and a child's record or a made-up one), so
Claude Code can start a turn without a phone.

A board he makes is recorded whole in his turn, so it can be replayed and read back; tries on it
are not graded. No one reviews it before the child sees it: his own look at it, drawn, is the check,
and reading a sample after is the other.

Not in the first version: acting on the child's board; the child's mastery; earlier openings of
the board. Each is a tool or a part later, with nothing else changing.

Closed sets are const-object enums: the tool names (`JugnuTool`), and the `steps` kinds of a
`jugnu` entry (`JugnuStep`: point, say, try, make), replacing today's `kind: z.string()`.

## Exact replay: what the record must carry

The server rebuilds the child's board with `Board.replay`, which needs each input at its time **on
the board's clock**, and each line the voice finished. Today a `cause` entry has only the phone's
wall time (`at`), and lines told aren't inputs in the record. So, in the record:

- every `cause` entry gains `t`: the board's clock when it was done (`ActionRecord.t` already has
  it);
- a voice finishing a line is recorded (it is an input to the board, per `one-clock.md`), with its
  `t`.

Then one `BoardRuntime.replay(entries)` (in the player, used by the server and tests) maps each
entry's node id back to its part (through `build/ids.json`) and plays it at its `t`. This also
makes `events.md`'s "replay is best-effort" exact.

**Version**: a turn names the board's version. If the server's build has another version of that
board (only between a ship and the phone's reload), the server answers "update the app" and the
phone reloads; no turn runs on a board the server can't rebuild.

## His instructions (the prompt), in short

Who he is (a firefly friend, warm, brief); who he talks to (a class 9 child); in their language
(the app's locale; if the child writes Hinglish, he may answer in it); how he helps: work out what the
child is missing from what they did and how the board is solved, then the smallest nudge that moves them: a
question, a pointer, a smaller case with `try`; say more only when nudges haven't worked; never
more than three short sentences. He judges when to say the answer outright (rarely: nudges failed,
the child is stuck); the instructions say why holding back helps, and trust him with the rest.
He stays on the board and the lesson; anything else, he turns back to the board kindly.

## Running a turn

1. The phone sends: the board and its version, the child's entries for this opening, the chat so
   far, what they asked and what they held a finger on.
2. The server checks the version, replays the board, opens the board MCP on it (in memory), and
   runs the agent loop: the first message holds board, what they did, answer and lesson; tool
   calls until `say`.
3. `point`s and `say`'s words stream to the phone as they happen.
4. The phone shows them and records one `jugnu` entry (asked, about, reply, steps, model), on this
   opening, as the learner's (the child asked). The learner pipeline already marks later tries on
   this opening `helped`.

The model's key stays on the server. Limits: tool calls and seconds per turn; turns per child per
day.

## Children's words

What a child types, and Jugnu's replies, are kept apart from the rest of the record, with their own
retention and out of the teacher view, as `events.md` ("Care") already says. How long, and who
reads them, is the person's call (below).

## What changes in the code

- **Record**: `t` on `cause` entries; the voice's finished lines as inputs; `JugnuStep` enum.
- **Player**: `BoardRuntime.replay(entries)`; a glow for `point` on a named part.
- **Build**: `taught.json` per concept, from the built boards and their witness play, in both
  languages.
- **`@chalk/jugnu`** (new): the board MCP over one replayed board, and the agent loop. The server
  mounts it at `POST /api/jugnu/turn` (streamed).
- **The phone**: Jugnu's button on each board, hold-a-part-to-ask, the chat sheet, the glow.
- **Leftovers from the old Jugnu go**: `whyNotJugnu` (runtime.ts), the recorder's `pause` comment,
  events.md's "what Jugnu tries on the phone's own board".

## Checking he helps

A set of stuck children per board, **generated**: a model plays a class 9 child who goes wrong on
the board (as a child would, from the board and the lesson), and each record is run as a turn.
Nothing is written per board. Each reply is judged on: grounded in the
lesson, a nudge rather than the answer, right about the board, short, pointed at the right part.
First by the person reading them, with one model; a model judge and a second model come once the
set is worth automating.

## Order

1. Exact replay: `t` and voice in the record, `BoardRuntime.replay`, tested on coordinate geometry's
   witnesses (replayed board = played board).
2. The board MCP over a replayed board, in development: Claude Code plays Jugnu through it on
   coordinate geometry's boards. This proves the door before any model is wired.
3. `taught.json` in the build, from the built boards.
4. The server turn and the agent loop, with one model, streamed.
5. The phone: button, hold-to-ask, sheet, glow.
6. The generated stuck-children set, read by the person.
7. `props` and `make`: boards he makes, after the basics work (the same door).

## For the person

1. **Model**: recommended: Claude Haiku 5.5 to start (fast), compared later with Claude Sonnet 5.5
   on the stuck-children set.
2. **Children's chats**: kept how long, and who reads them (the teacher? only us?).
3. **Typed questions**, or only buttons and hold-a-part (typing invites anything; buttons keep it on
   the board)?
