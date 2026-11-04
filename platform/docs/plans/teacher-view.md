# What we know about each child

Status: proposed (2026-11-04, third version: the person's layers, the principles, the review's
fixes), for the person.

## Where it goes

What we learn about a child serves the teacher (who needs me, what isn't this child good at yet),
the child's own path (what next, Jugnu remembering them), us (is Jugnu teaching well, which boards
confuse), and proof that it works. All are readings of the same facts. So: keep the facts right;
the readings will change many times.

## Principles

1. **One raw record of what happened, append-only, never edited.** The phone's events; and
   Jugnu's side of each conversation (it happens on the server).
2. **Everything raw joins on the same keys**: the child's account, the board's opening (the
   events' `opening`), the board's id and version, the build (commit), and for Jugnu, the
   conversation and the turn: each turn's id is in the phone's `jugnu` event and in the server's
   record of that turn.
3. **What the child saw can always be recovered** from three keys every raw record carries: the
   board's id, its version, and the commit it was built from (the repo at that commit builds it
   again; the version says it is the same board). Nothing else is copied. So the commit is always
   a real one: the demo and the sandbox record the commit they ran on, not a word.
4. **Two kinds of derived data.** *Computed* (attempts, mastery): cheap, the same each time:
   dropped and worked out again at will (as now). *Judged* (by a model: reflections, learner
   updates): kept as records with what they came from, which prompt and model, and when; judging
   again is an explicit command that adds new records, never overwrites.
5. **The demo is raw data made by simulated children**, marked demo, through the same pipeline.
6. **A child's data can be removed entirely**: everything keyed to their account goes with it.
   Raw conversations and judgements never leave the server in any API; the teacher sees judged
   points only.

## Layers

0. **Raw**
   - **Events** (the phone's, as now). Gains: the `jugnu` event names its conversation and turn;
     an `app` event `practiceFinished` when a practice run ends (as its last question passes).
   - **Jugnu's conversations** (`jugnu_conversations`): id; account; opening; board id, version;
     commit; model; the exact instructions (tutor prompt name and hash; the prompt's and the
     lesson's texts, kept once each by their hash in `texts`); started; and when and why it ended
     (quiet, set finished).
   - **Jugnu's turns** (`jugnu_turns`): id, conversation, n, at, how long, the requests' usage.
   - **Jugnu's messages** (`jugnu_messages`): conversation, n, the turn, the message as the model
     had it (json, as the AI SDK gives it: reasoning parts round-trip). Appended after each turn;
     never changed.
1. **Per conversation: his reflection** (`jugnu_reflections`). A conversation is over a set time
   after his last turn (`reflectAfterMinutes` in `jugnu.yaml`, 5 now: the one rule, the person's;
   within it a provider's cache still holds it; handing back ends nothing, the child may go on).
   Then the same conversation goes on one step, a turn of its own (kind `reflect`, its messages
   appended to the record): his open `reply` is answered with the reflect prompt (the child has
   left), and he answers by his `reflect` tool: points they aren't good at yet (short sentences),
   and got there (yes / partly / not yet). `reflect` is among his tools from the first turn (the
   same tools in every request keep the cache; while he teaches, a call is answered "not now").
   Kept: the conversation and the reflect turn, at, the reflect prompt (name, hash, text), model,
   points, got there. Ending is once; the cursor stays until he has reflected, then is dropped.
2. **Per practice run: the learner update** (`learner_updates`). On `practiceFinished`, after its
   events are saved: that child's open conversations are ended first (so every reflection exists),
   then one step reads the run's answers (from its events: right, wrong, helped) and its
   conversations' reflections, and writes points: what is still not good, what they keep getting
   wrong, each naming its evidence by raw ids (event ids, reflection ids). Kept: account, at, the
   run (its concept, its first and last event ids), update prompt, model, points with evidence,
   words, usage. A run left halfway gets none (said, not hidden).
3. **Numbers**: mastery per concept, a Beta from first tries (as now, from the events).

Not decided, not built in: how points map to concepts, and how judgements become numbers. Layers
0 to 2 keep what those will need. Not now: Jugnu remembering a child across conversations (it will
read the same layers).

## One flow; the preview's gap

Jugnu's conversations go by one flow, written once (`studio/src/jugnu/conversations.ts`): a turn
goes on with the conversation going on at its opening, is taken and kept; a conversation is over
`reflectAfterMinutes` after his last turn; then he reflects on it, once. Where it runs (chalk1,
the server on the laptop, the dev service) is only an address. What differs from a child's phone,
each for a reason, and nothing else:

1. **Where it is kept**: the server keeps it in its database (the raw record, for good); the
   preview keeps it in memory (testing his behaviour writes nothing; gone with the service).
   What the preview holds is at `/dev-jugnu/held`.
2. **Who**: on the server, the signed-in child; in the preview, `preview` (no child).
3. **The commit**: the server's build; the preview's tree (`+changes` when it has uncommitted ones).
4. **Sign-in and the hourly limit**: the server's only (the preview is the person's own).
5. **Not yet one flow, to be: the sandbox** (simulated children) still runs his turns itself and
   keeps its own runs (`.chalk-runs`); it joins the flow with the demo class (step 5).

## Working state (not raw)

The server holds no conversation in memory: each turn, the route loads the conversation (its
messages and cursor) from the database, Jugnu takes one turn, and the route saves what is new. The
cursor is kept apart from the raw (`jugnu_conversations.resume`: his open call and what it is owed, the board as
he last saw it, the child's steps so far): overwritten each turn, dropped when it ends. The raw
messages are enough to replay it; the cursor only makes resuming quick.

## Parts

- **Studio, Jugnu** (jugnu.ts, live.ts): his tools gain `reflect`; a conversation is given and
  returns its new messages, turn by turn (the server keeps them); `reflectOn(conversation)` makes
  the reflection; `updateFor(run)` makes the learner update. Prompts: `prompts/reflect/<name>.md`,
  `prompts/update/<name>.md`, named in `jugnu.yaml`, versioned like the tutor's.
- **Server**: the tables above (one migration, replacing the unshipped 0006); app.ts's Jugnu route
  saves each turn; the quiet sweep ends conversations (each minute), then reflects; saveEvents' caller runs the
  update on `practiceFinished`; a `judge-again` command (reflections or updates, a given prompt,
  new records), as `work-out` is for computed data; all keyed to the account, removed with it.
- **Player and app**: the session sent to Jugnu is the board's opening; the `jugnu` event records
  the conversation and turn the server gives back; the app records `practiceFinished`.
- **Teacher's API and screens**: the child: latest update's points (each with its evidence: the
  question's family, what they chose), the numbers per concept, then reflections. The class: each
  child's latest update's first point. Reads only.
- **Demo class**: the maker writes raw only (events, Jugnu's conversations from the sandbox's
  dialogue, its messages; times moved to the child's days, together); the loader saves the raw
  and runs layers 1 and 2 through the same functions.

## Decisions for the person

- **Keeping Jugnu's thinking about children**: it is the most useful raw data and the most
  sensitive. Kept on the server only, removed with the account. How long (a retention period),
  and consent from parents before real children (India's DPDP Act), are the person's.
- **`reflect` among his tools from the first turn**: a change to the committed Jugnu (measured on
  the sandbox cases before it ships: one variable).

## Built in steps

1. Raw: Jugnu's conversations, turns and messages, their ids in the events; resume. Check:
   server tests; a conversation across a server restart; the events and the server's record join.
2. Reflections. Check: a real conversation left quiet, reflected on; the cache read on that step;
   the sandbox cases with `reflect` among his tools, his teaching unchanged (one variable).
3. `practiceFinished` and the learner update. Check: a real practice run's update.
4. The teacher's API and screens. Check: in the browser.
5. The demo class through the same path; `judge-again`. Then chalk1.
