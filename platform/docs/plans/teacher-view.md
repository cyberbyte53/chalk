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
     `set` events (served, finished) by the lesson player (see "Sets and the learner update").
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
2. **Per set: the learner update** (`learner_updates`): when a set the child was given is
   finished, update(the state before, the set, what happened): see "Sets and the learner update".
3. **Numbers**: mastery per concept, a Beta from first tries, worked out in each update (no
   longer on every upload).

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
5. **Where events go**: the phone's to the server; the preview's to the dev service's memory (so
   a set finished in the preview is updated by the same flow).
6. **Not yet one flow, to be: the sandbox** (simulated children) still runs his turns itself and
   keeps its own runs (`.chalk-runs`); it joins the flow with the demo class (step 5).

## Sets and the learner update (step 3)

The loop (the person's): **learner state → set constructor → a set, served → the child plays it →
set finished → update(state, the set, what happened) → the new state.** Each part has one job:

- **Questions carry their own facts**, made when they are built: the concepts they test, their
  level (`tests`, `level`; the server's catalogue keeps them by version). A set may mix concepts,
  topics, subjects: the update goes through each question's facts, so a mixed set and a one-concept
  set are the same case.
- **A set constructor** chooses a set for a learner. Today one, the simplest: `lesson-practice`, a
  lesson's practice as built (`practiceOf`); its version is the commit (every event carries it).
  Later, reviews made for each child from their state: the same output.
- **The set, recorded** (raw, events; a new kind `set`, actor `lesson`, its place fields null;
  docs/events.md), by the lesson player when it plays a practice (its `set` prop; pages are no
  set), on phone and preview alike:
  - `served`, when it starts from its first question: the set's id, who made it
    (`lesson-practice`), its questions (board id and version) in order.
  - `finished`, when its last question is passed (before the uploader is flushed).
  - Each of its boards' `open` names the set: a set's openings, tries (attempts gain `opening`)
    and conversations join on keys, never on times. "Again" is a new set.
  A set left halfway has no `finished` and gets no update (said, not hidden).
- **The update**, once per finished set (unique: account, set, update prompt hash), the flow
  written once beside the conversations' (`studio/src/jugnu/sets.ts`), given a keeper:
  1. the set's conversations still going on are ended (`setFinished`) and reflected on, awaited;
  2. **the numbers** (computed): mastery from their attempts up to the set's `finished`, written to
     `mastery` (the one place; `work-out` works it out the same way, as of their last finished
     set). No longer on every upload: the person's call (the teacher sees each child as of their
     last finished set). Attempts stay worked out on upload (the child's progress uses them).
  3. **the judgement** (a model call by `prompts/update/<name>.md`, named in `jugnu.yaml`): given
     the state before (their last update's points), the set (each question's concepts and level)
     and what happened (each question's tries: right, wrong, chosen, helped; his reflections on its
     conversations), what is still not good and what they keep getting wrong, each point naming
     its evidence (question board ids, reflection ids).
  Kept: `learner_updates` (history, never overwritten): account, the set's id, at, the points with
  evidence, the update prompt (name, hash, text), the model, usage. A failed step writes nothing;
  the sweep tries again any finished set with no update, and any ended conversation with no
  reflection.
- **Where it runs**: the server, after a `set finished` is saved (and its sweep). The preview: its
  events go to the dev service's memory (an uploader like the phone's, to memory), which runs the
  same flow: one more accounted difference (where events are kept).

Not now: a constructor that reads the state (reviews), reasons per question.

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
  update on a `set finished`; a `judge-again` command (reflections or updates, a given prompt,
  new records), as `work-out` is for computed data; all keyed to the account, removed with it.
- **Player and app**: the session sent to Jugnu is the board's opening; the `jugnu` event records
  the conversation and turn the server gives back; the lesson player records the set.
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
3. Sets (`served`, `finished` by the lesson player) and the learner update (mastery moved into
   it). Check: server tests; a real practice set in the preview and through the local server:
   its update's numbers and points, each point's evidence real.
4. The teacher's API and screens. Check: in the browser.
5. The demo class through the same path; `judge-again`. Then chalk1.
