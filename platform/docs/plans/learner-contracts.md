# The learner pipeline's two contracts

Status: reviewed twice; decided (2026-11-03).

## Why

The pipeline, the learner model, the teacher view and Jugnu can be built apart once two shapes
are fixed: **what one try at a question says** (the pipeline writes it, the model reads it, Jugnu's
help marks it) and **what the model says about a child and a concept** (the model writes it, the
teacher view reads it). Nothing else crosses between them.

## The design, in four sentences

Every check of a question records one **answer**: which question at which version, which try,
what was chosen, and whether it was right; the server's **catalogue** of every version it has
served says what each tests and how hard it is. From a learner's whole record and the catalogue,
one pure function works out their **attempts** (adding what only the whole record knows: their
nth try ever, the mode, whether Jugnu had helped). The learner model reads only attempts and gives
one **mastery** row per child and concept, stored. The teacher view reads only mastery, and attempts for the
evidence behind a square.

```
phone: check → checked signal ──► server: events (the record)
                                    └─► attempts (one row per try)  ← catalogue (board, version)
                                           └─► learner model ─► mastery (child × concept × model)
                                                                   └─► teacher view
```

## Contract 1: an answer

**Which question:** a question is a built board: its `tests` and `level` are the board's. A try is
keyed by the envelope's (`board`, `node`), at its `version`. The learner comes from sign-in;
`opening`, `session`, `seq` and `at` are in the envelope too.

**The payload:** the question role's `checked` signal as it is (`CheckedPayload`, `@chalk/prop`
question.ts). The phone sends nothing about the question itself: the catalogue has it.

| Field | What | Today |
|---|---|---|
| `status` | `AnswerStatus` (correct, wrong) | there |
| `attempts` | 1 for the first check on this opening, then 2, 3… | there |
| `isGraded` | a bank question (counts) or a page's (doesn't) | there |
| the choice | `optionId`, `optionIds`, or `about` (a goal) | there; a goal has no value yet |

A goal's answer lives in the prop it is `about` (a dot's point), which the role can't see. Until
that prop declares an answer value the role copies in, a goal's attempt has no choice; nothing
else waits on it.

**The catalogue:** `question_versions`, (board, version) → `tests`, `level`. The server reads
`build/` at boot, as it does now, and inserts every built question's row if it isn't there
(insert, never update): each ship adds its versions and none is lost, though a ship's `rsync
--delete` removes the old build. It holds because a version is a hash of the built question
(`versionOf`, `@chalk/author` id.ts), which has `tests` and `level` in it.

**Attempts:** `attemptsFrom(events of one learner, catalogue lookup)`, pure. All checks are kept,
graded or not. Each adds:
- `tests`, `level`: from the catalogue, for that version.
- `nth`: the learner's tries at this question so far, across openings (first time ever = 1).
  Tries are ordered by `at` (and `seq` within a session), never by arrival: an offline phone
  uploads late.
- `mode`, `reason`: from the opening's `open` entry (`PlayMode`, content's play-mode enum).
- `helped`: a Jugnu turn, or a Jugnu `cause`, earlier in the same opening (by `seq`). So **every
  Jugnu turn and act is recorded on the phone, with its `opening`**, even when he thinks on the
  server; the server only answers.

Because `nth`, `mode` and `helped` need earlier entries, attempts are never folded in batch by
batch: on each upload the server works out that learner's attempts again from their whole record
and replaces them, in one transaction (the shape `rebuildBoardFacts` has now). Stored, so the
teacher view and the drill-down read them without replaying events.

## Contract 2: mastery

`masteryFrom(attempts, model)`, pure. Stored in `mastery`, one row per (account, concept, model),
written in the same transaction as that learner's attempts on each upload: so it is ready before
the child next opens the app, for whatever reads it (the teacher view, the review scheduler,
Jugnu). Rebuildable from attempts.

| Field | What |
|---|---|
| `account`, `concept`, `model` | `model` is `MasteryModel` (`{ Beta1: "beta-1" }`): a new model runs beside the old |
| `estimate` | how likely they understand it, 0–1 |
| `low`, `high` | how sure: an 80% interval |
| `band` | `Band`: strong or weak only once the interval says so, else unsure |
| `tries` | attempts that fed it (the drill-down queries attempts by concept) |
| `lastAt` | the last of those attempts |

None for a concept means "not yet". **Evidence for Beta1:** graded first tries ever
(`isGraded && nth === 1`), weighted by level (the uncommitted `mastery.ts`). Which attempts count
and how is the model's own business; the teacher view never knows.

## Progress

Progress keeps what it is for, and only that: `isLearnt` (every page passed: `continued` entries)
and practice done (every question of the first practice has an attempt with `nth === 1`). It
reads events and attempts; `mastery` comes out of `ConceptProgress` and is read beside it.

## On the phone, offline

The phone runs the same `attemptsFrom` and `masteryFrom` on its own entries. Its catalogue is
the bank refs of the chapters it has fetched (`chapter.questions`: id, version, tests, level): it
keeps every ref it has seen, and looks a try up by (board, version), else by board. So offline
mastery is an estimate; the server's wins once synced.

## Where the code lives

Each stage is a pure function from its input to its output, so the phone and the server run the
same code, and each is tested on its inputs alone.

| Where | Holds | Knows nothing of |
|---|---|---|
| `@chalk/learning` (new; depends on `@chalk/content`, zod) | one file per stage: `catalogue.ts` (a version's row, the lookup), `attempts.ts`, `mastery.ts` (the models), `progress.ts` | the database, HTTP, React |
| `@chalk/api` (depends on `@chalk/learning`) | the wire only: routes and their schemas, re-using `@chalk/learning`'s shapes | how anything is worked out |
| `apps/server` | the tables (`events`, `question_versions`, `attempts`, `mastery`; people); filling the catalogue at boot; redoing a learner's attempts and mastery on upload | the model's maths |
| `apps/learner` | the phone's store, uploader and kept bank refs; the screens | the model's maths |

`board_facts` and `jugnu_flags` go. `progress.ts` and `mastery.ts` move from `@chalk/api` to
`@chalk/learning`.

## Not here (each its own plan, against these contracts)

Shared phones: not now. If it matters, the phone's store is named by account (`<account>/events`),
so several children keep theirs on one phone and switching is signing in.

The model's maths beyond Beta1; the teacher view's screens; Jugnu on the server; retention and
consent.

## Decided

- The first model is the Beta of `mastery.ts`, built on as it is.
- Bands: strong, unsure, weak; none is "not yet".
