# The teacher sees each child

Status: reviewed (2026-11-04); the review's fixes are in.

## From first principles

A teacher asks two things: **who needs me**, and **what is this child not good at right now**.
Three facts answer it, each from where it is made, each its own module:

1. **Results**: what they got right and wrong, by concept. Already there: the phone's events become
   `attempts` and `mastery` on the server (store.ts). Nothing new is made; the teacher view reads
   the wrong attempts too (which question, what they chose).
2. **Jugnu's notes**: one per conversation, written once it ends (he hands back, or it goes quiet
   for 15 minutes: children just leave), from the whole of it: what the child isn't good at yet,
   and whether they got there ("Got there: yes / partly / not yet"). A turn's own note is only his
   working guess, mid-way; the person's call (4 Nov). Made on the server, where his turns run: kept there (`jugnu_notes`: account, board, the
   concepts it tests, when, the note), never sent to the phone. The child never sees them.
3. **The teacher view** reads both, per child per concept: mastery, the questions got wrong, his
   latest note. It writes nothing.

A deeper teacher view later (trends, a summary over many notes, the class's common mistakes) is
more reading of the same two facts; the facts don't change.

## Modules

- **Server, notes** (`apps/server/src/notes.ts`): `saveNote` when a conversation ends (app.ts keeps
  the conversations going on; `endConversation` in the studio's live.ts writes the note, by the
  committed notes prompt, `prompts/notes/<name>.md` named in `jugnu.yaml`), `newestNoteOfEach`, and
  `latestNoteByConcept`.
- **Server, the learner's view** (new: `GET /api/groups/:group/learners/:learner`, the teacher's
  own group, the learner a member of it now): per concept, mastery, `wrong: {board, family, chosen,
  at}[]` (recent first, a few) and `note: {text, at} | null`. The group reply gains only each
  learner's newest note (words and when), for "who needs me".
- **App, teacher screens** (teacher-screens.tsx): the child's page, per concept: mastery as now,
  then "Not yet good at" with his note, and the questions got wrong (by family, and what they
  chose: a question's own words aren't in the built content yet; later, from the build). The class page: each child's newest note under their row,
  children with a weak concept first (as now).
- **Demo class** (two halves, independent):
  - **Made** on the Mac (`platform/studio`, `pnpm demo-class`): five made-up children, each a mix of
    the sandbox's cases (`jugnu-cases.yaml`, real wrong states with a misconception): on a case
    they get it wrong (the case's steps), ask Jugnu, and talk it through (the sandbox's dialogue,
    the committed Jugnu, a simulated student holding the case's belief); on other questions they
    get it right (the board's witness play); they go through the lesson's pages (their witness, so
    the pages count as seen). Each child's sessions are moved to days of their own (the gaps within
    kept). Their events and Jugnu's notes (each note at its `jugnu` event) go into one file,
    `demo-class.json`. It makes real model calls (the runs kept as any sandbox run).
  - **Loaded** by the server (`pnpm --filter @chalk/server load-demo <file> <join code>`): demo
    accounts (Google id `demo:<name>`), joined to the teacher's group by its code, their events
    saved as a phone's (saveEvents: attempts and mastery follow), their notes saved. It refuses a
    file whose boards and versions the server's catalogue doesn't have (else no mastery). Loading
    again replaces the demo accounts; `load-demo --remove` wipes them (notes, attempts, mastery,
    events, members, accounts, in that order).

## Not now

The full chats for teachers (notes only: the person's decision); a summary across notes; Hindi notes.

## Built in steps

1. Notes on the server (migration 0006_jugnu_notes), and the teacher's API. Check: server tests (a
   note on hand-back and on going quiet, none mid-way; the learner view's wrong questions and
   latest note per concept, only for their own teacher); a real conversation's note. **Done.**
2. The teacher screens. Check: in the browser, with a dev class.
3. The demo class, made and loaded locally. Check: as a teacher, the class page and each child's.
4. chalk1: ship; load the demo into the person's group there.
